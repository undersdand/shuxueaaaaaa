async function generateQuestions(chapter, existingStems, count = 3) {
  let prompt = `出${count}道专升本高数选择题，章节：${chapter.title}，知识点：${chapter.topics.join('、')}。
要求：4选1，解析30字内，题目要多样化不要重复。
直接返回JSON数组，不要用markdown代码块包裹，不要任何多余文字。
字段：stem,options,answer(数字0-3),explanation,topic。options只写选项值不要加A/B前缀。`;

  if (existingStems && existingStems.length > 0) {
    prompt += `\n\n以下题目已出过，请勿重复：\n${existingStems.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  }

  const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/anthropic';
  const apiKey = process.env.MIMO_API_KEY;
  const model = process.env.MIMO_MODEL || 'claude-sonnet-4-20250514';

  console.log('AI Request:', { baseUrl, model: process.env.MIMO_MODEL, hasKey: !!apiKey, keyPrefix: apiKey?.substring(0, 8) });

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1536,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  console.log('AI Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error body:', errorText.substring(0, 500));
    throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log('AI Response keys:', Object.keys(data));
  console.log('AI Response content length:', data.content?.length);

  const textBlock = data.content.find(b => b.type === 'text');
  const content = textBlock ? textBlock.text : '';

  if (!content) throw new Error('AI returned empty response - check content structure');

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
    throw new Error(`AI returned invalid JSON: ${e.message}`);
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
      const li = 'abcd'.indexOf(answer.toLowerCase());
      if (li >= 0) answer = li;
      else answer = parseInt(answer) || 0;
    }
    return {
      id: `q_${chapter.id}_${Date.now()}_${i}`,
      chapterId: chapter.id,
      difficulty: 'medium',
      stem: q.stem || '',
      options,
      answer,
      explanation: q.explanation || '',
      topic: q.topic || '',
    };
  });
}

module.exports = { generateQuestions };
