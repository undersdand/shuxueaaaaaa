const { CHAPTERS, readData, writeData } = require('./lib/db');
const { generateQuestions } = require('./lib/ai');

exports.handler = async (event, context) => {
  console.log('Request path:', event.path);
  console.log('Request method:', event.httpMethod);
  console.log('Environment check:', {
    hasApiKey: !!process.env.MIMO_API_KEY,
    hasBaseUrl: !!process.env.MIMO_BASE_URL,
    hasModel: !!process.env.MIMO_MODEL
  });

  // POST /api/questions/generate
  if (event.httpMethod === 'POST' && event.path.endsWith('/generate')) {
    try {
      const { chapterId, count = 3 } = JSON.parse(event.body || '{}');
      if (!chapterId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing chapterId' }) };

      const chapter = CHAPTERS.find(c => c.id === chapterId);
      if (!chapter) return { statusCode: 404, body: JSON.stringify({ error: 'Chapter not found' }) };

      const existing = await readData(context, 'questions', []);
      const existingStems = existing.filter(q => q.chapterId === chapterId).map(q => q.stem).slice(-20);

      const questions = await generateQuestions(chapter, existingStems, count);

      existing.push(...questions);
      await writeData(context, 'questions', existing);

      return { statusCode: 200, body: JSON.stringify(questions) };
    } catch (err) {
      console.error('Generate error:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to generate questions',
          details: err.message,
          env: {
            hasApiKey: !!process.env.MIMO_API_KEY,
            hasBaseUrl: !!process.env.MIMO_BASE_URL,
            hasModel: !!process.env.MIMO_MODEL,
            apiKeyPrefix: process.env.MIMO_API_KEY ? process.env.MIMO_API_KEY.substring(0, 10) : 'MISSING'
          }
        })
      };
    }
  }

  // GET /api/questions/:chapterId
  if (event.httpMethod === 'GET') {
    const parts = event.path.split('/');
    const chapterId = parseInt(parts[parts.length - 1]);
    if (!chapterId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing chapterId' }) };

    const questions = await readData(context, 'questions', []);
    const filtered = questions.filter(q => q.chapterId === chapterId);
    return { statusCode: 200, body: JSON.stringify(filtered) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
