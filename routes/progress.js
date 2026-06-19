const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const progress = await readJSON('progress.json');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read progress' });
  }
});

router.put('/:chapterId', async (req, res) => {
  try {
    const { level, completed } = req.body;
    if (level === undefined || completed === undefined) {
      return res.status(400).json({ error: 'Missing level or completed field' });
    }

    const progress = await readJSON('progress.json');
    const chapterId = req.params.chapterId;

    if (!progress[chapterId]) {
      return res.status(404).json({ error: 'Chapter not found in progress' });
    }

    if (completed) {
      if (!progress[chapterId].completedLevels.includes(level)) {
        progress[chapterId].completedLevels.push(level);
        progress[chapterId].completedLevels.sort((a, b) => a - b);
      }
    } else {
      progress[chapterId].completedLevels = progress[chapterId].completedLevels.filter(l => l !== level);
    }

    await writeJSON('progress.json', progress);
    res.json(progress[chapterId]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

module.exports = router;
