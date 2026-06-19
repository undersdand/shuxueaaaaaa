const { CHAPTERS } = require('./lib/db');

exports.handler = async (event) => {
  const id = event.path.split('/').pop();
  const idNum = parseInt(id);

  if (idNum && idNum > 0) {
    const chapter = CHAPTERS.find(c => c.id === idNum);
    if (!chapter) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
    return { statusCode: 200, body: JSON.stringify(chapter) };
  }

  return { statusCode: 200, body: JSON.stringify(CHAPTERS) };
};
