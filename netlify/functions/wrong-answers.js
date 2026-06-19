const { readData, writeData } = require('./lib/db');

exports.handler = async (event, context) => {
  // GET /api/wrong-answers/stats
  if (event.httpMethod === 'GET' && event.path.endsWith('/stats')) {
    const wrongAnswers = await readData(context, 'wrongAnswers', []);
    const questions = await readData(context, 'questions', []);

    const total = wrongAnswers.length;
    const byChapter = {};
    wrongAnswers.forEach(wa => {
      const q = questions.find(q => q.id === wa.questionId);
      if (q) { byChapter[q.chapterId] = (byChapter[q.chapterId] || 0) + 1; }
    });

    return { statusCode: 200, body: JSON.stringify({ total, byChapter }) };
  }

  // GET /api/wrong-answers
  if (event.httpMethod === 'GET') {
    const wrongAnswers = await readData(context, 'wrongAnswers', []);
    return { statusCode: 200, body: JSON.stringify(wrongAnswers) };
  }

  // POST /api/wrong-answers
  if (event.httpMethod === 'POST') {
    const { questionId, userAnswer } = JSON.parse(event.body || '{}');
    if (!questionId || userAnswer === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing questionId or userAnswer' }) };
    }

    const questions = await readData(context, 'questions', []);
    const question = questions.find(q => q.id === questionId);
    if (!question) return { statusCode: 404, body: JSON.stringify({ error: 'Question not found' }) };

    const wrongAnswers = await readData(context, 'wrongAnswers', []);
    const entry = {
      id: `wa_${Date.now()}`,
      questionId,
      userAnswer,
      correctAnswer: question.answer,
      timestamp: new Date().toISOString(),
      reviewed: false,
    };
    wrongAnswers.push(entry);
    await writeData(context, 'wrongAnswers', wrongAnswers);

    return { statusCode: 201, body: JSON.stringify(entry) };
  }

  // DELETE /api/wrong-answers/:id
  if (event.httpMethod === 'DELETE') {
    const id = event.path.split('/').pop();
    const wrongAnswers = await readData(context, 'wrongAnswers', []);
    const idx = wrongAnswers.findIndex(wa => wa.id === id);
    if (idx === -1) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };

    wrongAnswers.splice(idx, 1);
    await writeData(context, 'wrongAnswers', wrongAnswers);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
