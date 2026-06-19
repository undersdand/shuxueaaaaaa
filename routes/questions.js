const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/db');
const { generateQuestions } = require('../services/ai');

// POST /api/questions/generate
router.post('/generate', async (req, res) => {
  try {
    const { chapterId, count = 3, difficulty = 'medium' } = req.body;
    if (!chapterId) return res.status(400).json({ error: 'Missing chapterId' });

    const chapters = await readJSON('chapters.json');
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    const questions = await generateQuestions(chapter, count, difficulty);

    const existing = await readJSON('questions.json');
    existing.push(...questions);
    await writeJSON('questions.json', existing);

    res.json(questions);
  } catch (err) {
    console.error('Question generation error:', err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// GET /api/questions/:chapterId — get cached questions
router.get('/:chapterId', async (req, res) => {
  try {
    const questions = await readJSON('questions.json');
    const chapterQuestions = questions.filter(
      q => q.chapterId === parseInt(req.params.chapterId)
    );
    res.json(chapterQuestions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read questions' });
  }
});

module.exports = router;
