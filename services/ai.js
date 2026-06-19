const Anthropic = require('@anthropic-ai/sdk');
const { readJSON } = require('./db');

const client = new Anthropic({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL,
});

async function generateQuestions(chapter, count = 3, difficulty = 'medium') {
  // Get existing questions for this chapter to avoid duplicates
  const allQuestions = await readJSON('questions.json');
  const existingStems = allQuestions
    .filter(q => q.chapterId === chapter.id)
    .map(q => q.stem)
    .slice(-20); // last 20 to keep prompt manageable

  let prompt = `出${count}道专升本高数选择题，章节：${chapter.title}，知识点：${chapter.topics.join('、')}。
要求：4选1，解析30字内，题目要多样化不要重复。
数学公式用LaTeX格式，用$...$包裹行内公式，$$...$$包裹独立公式。
直接返回JSON数组，不要用markdown代码块包裹，不要任何多余文字。
字段：stem,options,answer(数字0-3),explanation,topic。options只写选项值不要加A/B前缀。`;

  if (existingStems.length > 0) {
    prompt += `\n\n以下题目已出过，请勿重复：\n${existingStems.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  }

  const response = await client.messages.create({
    model: process.env.MIMO_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  const thinkingBlock = response.content.find(b => b.type === 'thinking');
  const content = textBlock ? textBlock.text : (thinkingBlock ? thinkingBlock.thinking : '');

  if (!content) throw new Error('AI returned empty response');

  // Extract JSON array from response (handle markdown code blocks)
  let jsonStr = content;
  const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) {
    jsonStr = codeMatch[1].trim();
  } else {
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) jsonStr = arrayMatch[0];
  }

  let questions;
  try {
    questions = JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse failed. Raw content:', content.substring(0, 500));
    throw new Error('AI returned invalid JSON');
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('AI returned empty or non-array result');
  }

  return questions.map((q, i) => {
    const options = (q.options || []).map(opt =>
      typeof opt === 'string' ? opt.replace(/^[A-Da-d][.、．]\s*/, '') : opt
    );
    let answer = q.answer;
    if (typeof answer === 'string') {
      const letterIndex = 'abcd'.indexOf(answer.toLowerCase());
      if (letterIndex >= 0) answer = letterIndex;
      else answer = parseInt(answer) || 0;
    }
    return {
      id: `q_${chapter.id}_${Date.now()}_${i}`,
      chapterId: chapter.id,
      difficulty,
      stem: q.stem || '',
      options,
      answer,
      explanation: q.explanation || '',
      topic: q.topic || '',
    };
  });
}

module.exports = { generateQuestions };
