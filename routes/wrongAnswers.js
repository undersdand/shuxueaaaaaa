const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const wrongAnswers = await readJSON('wrongAnswers.json');
    res.json(wrongAnswers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read wrong answers' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const wrongAnswers = await readJSON('wrongAnswers.json');
    const questions = await readJSON('questions.json');

    const total = wrongAnswers.length;

    const byChapter = {};
    wrongAnswers.forEach(wa => {
      const question = questions.find(q => q.id === wa.questionId);
      if (question) {
        const chId = question.chapterId;
        if (!byChapter[chId]) byChapter[chId] = 0;
        byChapter[chId]++;
      }
    });

    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    wrongAnswers.forEach(wa => {
      const question = questions.find(q => q.id === wa.questionId);
      if (question && byDifficulty[question.difficulty] !== undefined) {
        byDifficulty[question.difficulty]++;
      }
    });

    res.json({ total, byChapter, byDifficulty });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;

    if (!questionId || userAnswer === undefined) {
      return res.status(400).json({ error: 'Missing questionId or userAnswer' });
    }

    const questions = await readJSON('questions.json');
    const question = questions.find(q => q.id === questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const wrongAnswers = await readJSON('wrongAnswers.json');

    const newEntry = {
      id: `wa_${Date.now()}`,
      questionId,
      userAnswer,
      correctAnswer: question.answer,
      timestamp: new Date().toISOString(),
      reviewed: false,
    };

    wrongAnswers.push(newEntry);
    await writeJSON('wrongAnswers.json', wrongAnswers);

    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save wrong answer' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const wrongAnswers = await readJSON('wrongAnswers.json');
    const index = wrongAnswers.findIndex(wa => wa.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Wrong answer not found' });
    }

    wrongAnswers.splice(index, 1);
    await writeJSON('wrongAnswers.json', wrongAnswers);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete wrong answer' });
  }
});

module.exports = router;
