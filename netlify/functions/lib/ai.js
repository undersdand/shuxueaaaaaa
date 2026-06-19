const OpenAI = require('openai');

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.MIMO_API_KEY,
      baseURL: process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1',
    });
  }
  return client;
}

async function generateQuestions(chapter, existingStems, count = 3) {
  let prompt = `出${count}道专升本高数选择题，章节：${chapter.title}，知识点：${chapter.topics.join('、')}。
要求：4选1，解析30字内，题目要多样化不要重复。JSON数组格式返回，字段：stem,options,answer(数字0-3),explanation,topic。options不要加A/B前缀。只返回JSON。`;

  if (existingStems && existingStems.length > 0) {
    prompt += `\n\n以下题目已经出过，请勿重复出类似题目：\n${existingStems.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  }

  const response = await getClient().chat.completions.create({
    model: process.env.MIMO_MODEL,
    max_tokens: 1536,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.choices[0]?.message?.content || '';

  let jsonStr = content;
  const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) {
    jsonStr = codeMatch[1].trim();
  } else {
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) jsonStr = arrayMatch[0];
  }

  const questions = JSON.parse(jsonStr);

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
      stem: q.stem || '',
      options,
      answer,
      explanation: q.explanation || '',
      topic: q.topic || '',
    };
  });
}

module.exports = { generateQuestions };
