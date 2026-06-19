// Vercel Serverless Function 入口
// 将 Express app 导出为 Vercel 可调用的 handler
const app = require('../server');

module.exports = app;
