const express = require('express');
const router = express.Router();
const { readJSON } = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const chapters = await readJSON('chapters.json');
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read chapters' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const chapters = await readJSON('chapters.json');
    const chapter = chapters.find(c => c.id === parseInt(req.params.id));
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read chapter' });
  }
});

module.exports = router;
