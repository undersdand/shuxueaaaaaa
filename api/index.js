const serverless = require('serverless-http');
const app = require('../server');

// Vercel 通过 serverless-http 包装 Express 应用
const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    return await handler(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
