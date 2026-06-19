const { readData, writeData, DEFAULT_PROGRESS } = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    const progress = await readData(context, 'progress', DEFAULT_PROGRESS);
    return { statusCode: 200, body: JSON.stringify(progress) };
  }

  if (event.httpMethod === 'PUT') {
    const chapterId = event.path.split('/').pop();
    const { level, completed } = JSON.parse(event.body || '{}');
    if (level === undefined || completed === undefined) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing level or completed' }) };
    }

    const progress = await readData(context, 'progress', DEFAULT_PROGRESS);
    if (!progress[chapterId]) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Chapter not found' }) };
    }

    if (completed) {
      if (!progress[chapterId].completedLevels.includes(level)) {
        progress[chapterId].completedLevels.push(level);
        progress[chapterId].completedLevels.sort((a, b) => a - b);
      }
    } else {
      progress[chapterId].completedLevels = progress[chapterId].completedLevels.filter(l => l !== level);
    }

    await writeData(context, 'progress', progress);
    return { statusCode: 200, body: JSON.stringify(progress[chapterId]) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
