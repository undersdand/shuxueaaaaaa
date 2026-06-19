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
  console.log('AI Response full keys:', JSON.stringify(Object.keys(data)));
  console.log('AI Response sample:', JSON.stringify(data).substring(0, 500));

  // 尝试多种格式提取 AI 返回的文本内容
  let content = '';

  // 格式1: Anthropic 标准格式 { content: [{ type: 'text', text: '...' }] }
  if (Array.isArray(data.content)) {
    // 先找 type='text' 的块
    const textBlock = data.content.find(b => b.type === 'text');
    if (textBlock && textBlock.text !== undefined && textBlock.text !== null) {
      content = textBlock.text;
    }
    // 如果没找到，取第一个非空块
    if (!content) {
      const firstBlock = data.content.find(b => b.text || b.content || b.value);
      if (firstBlock) content = firstBlock.text || firstBlock.content || firstBlock.value || '';
    }
  }
  // 格式2: content 是对象且有 text 字段
  if (!content && data.content && typeof data.content === 'object') {
    if (typeof data.content.text === 'string') content = data.content.text;
    else if (typeof data.content.content === 'string') content = data.content.content;
    else if (Array.isArray(data.content.content)) {
      // 嵌套 content 数组
      const nested = data.content.content.find(b => b.type === 'text' || b.text);
      if (nested) content = nested.text || nested.content || '';
    }
  }
  // 格式3: OpenAI 兼容格式 { choices: [{ message: { content: '...' } }] }
  if (!content && Array.isArray(data.choices)) {
    content = data.choices[0]?.message?.content || data.choices[0]?.text || '';
  }
  // 格式4: 直接在顶级返回文本字段
  if (!content) content = data.response || data.text || data.generated_text || '';
  // 格式5: content 本身就是字符串
  if (!content && typeof data.content === 'string') content = data.content;
  // 格式6: output 字段
  if (!content && typeof data.output === 'string') content = data.output;

  if (!content) {
    const fullDump = JSON.stringify({
      allKeys: Object.keys(data),
      contentType: typeof data.content,
      isArray: Array.isArray(data.content),
      contentJSON: JSON.stringify(data.content).substring(0, 2000),
      contentRaw: data.content,
      firstBlock: Array.isArray(data.content) ? JSON.stringify(data.content[0]) : 'N/A',
    });
    console.error('AI unknown response format:', fullDump);
    throw new Error(`AI response format unknown. Debug: ${fullDump.substring(0, 500)}`);
  }

  // 如果 content 已经是解析好的对象/数组，直接使用
  if (typeof content === 'object') {
    const result = Array.isArray(content) ? content : [content];
    return result.map((q, i) => formatQuestion(q, chapter, i));
  }

  // 否则是字符串，尝试提取 JSON
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

  return questions.map((q, i) => formatQuestion(q, chapter, i));
}

function formatQuestion(q, chapter, index) {
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
    id: `q_${chapter.id}_${Date.now()}_${index}`,
    chapterId: chapter.id,
    difficulty: 'medium',
    stem: q.stem || '',
    options,
    answer,
    explanation: q.explanation || '',
    topic: q.topic || '',
  };
}

module.exports = { generateQuestions };
