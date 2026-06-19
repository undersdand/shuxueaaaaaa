require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const chaptersRouter = require('./routes/chapters');
const progressRouter = require('./routes/progress');
const questionsRouter = require('./routes/questions');
const wrongAnswersRouter = require('./routes/wrongAnswers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/chapters', chaptersRouter);
app.use('/api/progress', progressRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/wrong-answers', wrongAnswersRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
