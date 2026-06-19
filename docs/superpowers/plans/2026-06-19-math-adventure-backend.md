# 数学大冒险后端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js + Express backend for a calculus learning app with AI-generated questions, progress tracking, and wrong answer management.

**Architecture:** Single Express server serves static HTML files and REST API. Data persisted in local JSON files. AI question generation via MiMo API (OpenAI-compatible).

**Tech Stack:** Node.js, Express, OpenAI SDK, dotenv, cors

## Global Constraints

- Personal use only — no authentication needed
- All data in JSON files under `data/`
- MiMo API uses OpenAI-compatible format (custom `baseURL`)
- Frontend HTML files served from `public/` directory
- Server runs on port 3000 by default (configurable via `.env`)

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Initialize npm project**

```bash
cd "C:/Users/lenovo/OneDrive/Desktop/高数一练习"
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install express openai dotenv cors
```

- [ ] **Step 3: Create `.env.example`**

```
MIMO_API_KEY=your_api_key_here
MIMO_BASE_URL=https://api.mimo.com/v1
MIMO_MODEL=mimo-model-name
PORT=3000
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
.env
data/questions.json
```

- [ ] **Step 5: Create directory structure**

```bash
mkdir -p routes services data public
```

- [ ] **Step 6: Verify**

```bash
ls -la
# Should see: package.json, node_modules/, .env.example, .gitignore, routes/, services/, data/, public/
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: project scaffolding with Express + OpenAI dependencies"
```

---

### Task 2: Data Layer — JSON Files and Utilities

**Files:**
- Create: `data/chapters.json`
- Create: `data/progress.json`
- Create: `data/questions.json`
- Create: `data/wrongAnswers.json`
- Create: `services/db.js`

**Interfaces:**
- Produces: `readJSON(filename)` → Promise<object>
- Produces: `writeJSON(filename, data)` → Promise<void>

- [ ] **Step 1: Create `data/chapters.json`**

```json
[
  {
    "id": 1,
    "title": "函数、极限与连续",
    "icon": "functions",
    "color": "primary",
    "topics": ["极限运算", "重要极限", "等价无穷小", "洛必达法则", "连续性与间断点"],
    "levelCount": 5
  },
  {
    "id": 2,
    "title": "一元函数微分学",
    "icon": "timeline",
    "color": "secondary",
    "topics": ["导数定义", "复合求导", "隐函数求导", "参数方程求导", "中值定理", "单调性与极值"],
    "levelCount": 4
  },
  {
    "id": 3,
    "title": "一元函数积分学",
    "icon": "integration_instructions",
    "color": "tertiary",
    "topics": ["换元积分法", "分部积分法", "定积分计算", "几何应用"],
    "levelCount": 4
  },
  {
    "id": 4,
    "title": "向量代数与空间解析几何",
    "icon": "polyline",
    "color": "tertiary",
    "topics": ["向量积运算", "平面与直线方程", "位置关系"],
    "levelCount": 3
  },
  {
    "id": 5,
    "title": "多元函数微分学与积分学",
    "icon": "layers",
    "color": "tertiary",
    "topics": ["偏导数", "全微分", "多元复合求导", "隐函数求导", "二重积分"],
    "levelCount": 4
  },
  {
    "id": 6,
    "title": "无穷级数",
    "icon": "all_inclusive",
    "color": "tertiary",
    "topics": ["级数敛散性判别", "幂级数收敛半径", "泰勒展开"],
    "levelCount": 3
  },
  {
    "id": 7,
    "title": "常微分方程",
    "icon": "call_split",
    "color": "tertiary",
    "topics": ["一阶微分方程求解", "二阶常系数线性方程"],
    "levelCount": 4
  },
  {
    "id": 8,
    "title": "线性代数",
    "icon": "grid_on",
    "color": "tertiary",
    "topics": ["矩阵运算", "逆矩阵", "行列式计算", "线性方程组求解", "特征值与特征向量"],
    "levelCount": 5
  }
]
```

- [ ] **Step 2: Create `data/progress.json`**

```json
{
  "1": { "completedLevels": [1, 2, 3], "totalLevels": 5 },
  "2": { "completedLevels": [], "totalLevels": 4 },
  "3": { "completedLevels": [], "totalLevels": 4 },
  "4": { "completedLevels": [], "totalLevels": 3 },
  "5": { "completedLevels": [], "totalLevels": 4 },
  "6": { "completedLevels": [], "totalLevels": 3 },
  "7": { "completedLevels": [], "totalLevels": 4 },
  "8": { "completedLevels": [], "totalLevels": 5 }
}
```

- [ ] **Step 3: Create `data/questions.json`**

```json
[]
```

- [ ] **Step 4: Create `data/wrongAnswers.json`**

```json
[]
```

- [ ] **Step 5: Create `services/db.js`**

```javascript
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJSON, writeJSON };
```

- [ ] **Step 6: Verify data layer**

```bash
node -e "const db = require('./services/db'); db.readJSON('chapters.json').then(d => console.log('Chapters:', d.length))"
# Expected: Chapters: 8
```

- [ ] **Step 7: Commit**

```bash
git add data/ services/db.js
git commit -m "feat: add data layer with JSON files and read/write utilities"
```

---

### Task 3: Express Server + Chapters API

**Files:**
- Create: `server.js`
- Create: `routes/chapters.js`

**Interfaces:**
- Produces: `GET /api/chapters` → `[{ id, title, icon, color, topics, levelCount }]`
- Produces: `GET /api/chapters/:id` → `{ id, title, icon, color, topics, levelCount }`

- [ ] **Step 1: Create `routes/chapters.js`**

```javascript
const express = require('express');
const router = express.Router();
const { readJSON } = require('../services/db');

// GET /api/chapters — list all chapters
router.get('/', async (req, res) => {
  try {
    const chapters = await readJSON('chapters.json');
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read chapters' });
  }
});

// GET /api/chapters/:id — single chapter detail
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
```

- [ ] **Step 2: Create `server.js`**

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const chaptersRouter = require('./routes/chapters');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/chapters', chaptersRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Create `.env` from `.env.example`**

```bash
cp .env.example .env
```

- [ ] **Step 4: Test chapters API**

```bash
node server.js &
curl http://localhost:3000/api/chapters
# Expected: JSON array of 8 chapters

curl http://localhost:3000/api/chapters/1
# Expected: Chapter 1 detail with title "函数、极限与连续"

curl http://localhost:3000/api/chapters/99
# Expected: 404 error
```

- [ ] **Step 5: Commit**

```bash
git add server.js routes/chapters.js .env
git commit -m "feat: Express server with chapters API"
```

---

### Task 4: Progress API

**Files:**
- Create: `routes/progress.js`
- Modify: `server.js` (add progress router)

**Interfaces:**
- Produces: `GET /api/progress` → `{ "1": { completedLevels, totalLevels }, ... }`
- Produces: `PUT /api/progress/:chapterId` → `{ completedLevels, totalLevels }`

- [ ] **Step 1: Create `routes/progress.js`**

```javascript
const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/db');

// GET /api/progress — get all progress
router.get('/', async (req, res) => {
  try {
    const progress = await readJSON('progress.json');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read progress' });
  }
});

// PUT /api/progress/:chapterId — update chapter progress
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
```

- [ ] **Step 2: Add progress router to `server.js`**

Add after the chapters router import:

```javascript
const progressRouter = require('./routes/progress');
```

Add after the chapters route:

```javascript
app.use('/api/progress', progressRouter);
```

- [ ] **Step 3: Test progress API**

```bash
curl http://localhost:3000/api/progress
# Expected: JSON object with progress for all 8 chapters

curl -X PUT http://localhost:3000/api/progress/1 \
  -H "Content-Type: application/json" \
  -d '{"level": 4, "completed": true}'
# Expected: { "completedLevels": [1, 2, 3, 4], "totalLevels": 5 }
```

- [ ] **Step 4: Commit**

```bash
git add routes/progress.js server.js
git commit -m "feat: progress API with level completion tracking"
```

---

### Task 5: AI Service — MiMo API Integration

**Files:**
- Create: `services/ai.js`

**Interfaces:**
- Produces: `generateQuestions(chapter, count, difficulty)` → `Promise<[{ stem, options, answer, explanation, topic }]>`

- [ ] **Step 1: Create `services/ai.js`**

```javascript
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL,
});

const PROMPT_TEMPLATE = `你是一个高等数学出题专家。请为以下考点生成 {count} 道选择题。

章节：{chapterTitle}
考点：{topics}
难度：{difficulty}

要求：
1. 每道题有4个选项（A/B/C/D），只有1个正确答案
2. 包含详细的解题解析
3. 以 JSON 数组格式返回，每个对象包含：
   - stem: 题目描述
   - options: 4个选项的数组
   - answer: 正确答案的索引（0-3）
   - explanation: 详细解析
   - topic: 考察的具体知识点

只返回 JSON 数组，不要其他内容。`;

async function generateQuestions(chapter, count = 5, difficulty = 'medium') {
  const prompt = PROMPT_TEMPLATE
    .replace('{count}', count)
    .replace('{chapterTitle}', chapter.title)
    .replace('{topics}', chapter.topics.join(', '))
    .replace('{difficulty}', difficulty);

  const response = await client.chat.completions.create({
    model: process.env.MIMO_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const questions = JSON.parse(jsonStr);

  // Add IDs and chapterId
  return questions.map((q, i) => ({
    id: `q_${chapter.id}_${Date.now()}_${i}`,
    chapterId: chapter.id,
    difficulty,
    ...q,
  }));
}

module.exports = { generateQuestions };
```

- [ ] **Step 2: Verify AI service loads**

```bash
node -e "const ai = require('./services/ai'); console.log('AI service loaded:', typeof ai.generateQuestions)"
# Expected: AI service loaded: function
```

- [ ] **Step 3: Commit**

```bash
git add services/ai.js
git commit -m "feat: AI service for question generation via MiMo API"
```

---

### Task 6: Questions API

**Files:**
- Create: `routes/questions.js`
- Modify: `server.js` (add questions router)

**Interfaces:**
- Produces: `POST /api/questions/generate` → `[{ id, chapterId, difficulty, stem, options, answer, explanation, topic }]`
- Produces: `GET /api/questions/:chapterId` → `[{ id, chapterId, difficulty, stem, options, answer, explanation, topic }]`

- [ ] **Step 1: Create `routes/questions.js`**

```javascript
const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/db');
const { generateQuestions } = require('../services/ai');

// POST /api/questions/generate — generate questions via AI
router.post('/generate', async (req, res) => {
  try {
    const { chapterId, count = 5, difficulty = 'medium' } = req.body;

    if (!chapterId) {
      return res.status(400).json({ error: 'Missing chapterId' });
    }

    const chapters = await readJSON('chapters.json');
    const chapter = chapters.find(c => c.id === chapterId);

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const questions = await generateQuestions(chapter, count, difficulty);

    // Cache generated questions
    const existing = await readJSON('questions.json');
    existing.push(...questions);
    await writeJSON('questions.json', existing);

    res.json(questions);
  } catch (err) {
    console.error('Question generation error:', err);
    res.status(500).json({ error: 'Failed to generate questions. Check your API key and settings.' });
  }
});

// GET /api/questions/:chapterId — get cached questions for a chapter
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
```

- [ ] **Step 2: Add questions router to `server.js`**

Add after the progress router import:

```javascript
const questionsRouter = require('./routes/questions');
```

Add after the progress route:

```javascript
app.use('/api/questions', questionsRouter);
```

- [ ] **Step 3: Test questions API (cached queries)**

```bash
curl http://localhost:3000/api/questions/1
# Expected: [] (empty, no questions generated yet)
```

- [ ] **Step 4: Commit**

```bash
git add routes/questions.js server.js
git commit -m "feat: questions API with AI generation and caching"
```

---

### Task 7: Wrong Answers API

**Files:**
- Create: `routes/wrongAnswers.js`
- Modify: `server.js` (add wrong answers router)

**Interfaces:**
- Produces: `GET /api/wrong-answers` → `[{ id, questionId, userAnswer, correctAnswer, timestamp, reviewed }]`
- Produces: `POST /api/wrong-answers` → `{ id, questionId, userAnswer, correctAnswer, timestamp, reviewed }`
- Produces: `DELETE /api/wrong-answers/:id` → `{ success: true }`
- Produces: `GET /api/wrong-answers/stats` → `{ total, byChapter, byDifficulty }`

- [ ] **Step 1: Create `routes/wrongAnswers.js`**

```javascript
const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/db');

// GET /api/wrong-answers — list all wrong answers
router.get('/', async (req, res) => {
  try {
    const wrongAnswers = await readJSON('wrongAnswers.json');
    res.json(wrongAnswers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read wrong answers' });
  }
});

// GET /api/wrong-answers/stats — statistics
router.get('/stats', async (req, res) => {
  try {
    const wrongAnswers = await readJSON('wrongAnswers.json');
    const questions = await readJSON('questions.json');

    const total = wrongAnswers.length;

    // Group by chapter
    const byChapter = {};
    wrongAnswers.forEach(wa => {
      const question = questions.find(q => q.id === wa.questionId);
      if (question) {
        const chId = question.chapterId;
        if (!byChapter[chId]) byChapter[chId] = 0;
        byChapter[chId]++;
      }
    });

    // Group by difficulty
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

// POST /api/wrong-answers — add a wrong answer
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

// DELETE /api/wrong-answers/:id — remove a wrong answer (mastered)
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
```

- [ ] **Step 2: Add wrong answers router to `server.js`**

Add after the questions router import:

```javascript
const wrongAnswersRouter = require('./routes/wrongAnswers');
```

Add after the questions route:

```javascript
app.use('/api/wrong-answers', wrongAnswersRouter);
```

- [ ] **Step 3: Test wrong answers API**

```bash
curl http://localhost:3000/api/wrong-answers
# Expected: []

curl http://localhost:3000/api/wrong-answers/stats
# Expected: { "total": 0, "byChapter": {}, "byDifficulty": { "easy": 0, "medium": 0, "hard": 0 } }
```

- [ ] **Step 4: Commit**

```bash
git add routes/wrongAnswers.js server.js
git commit -m "feat: wrong answers API with CRUD and statistics"
```

---

### Task 8: Frontend — Homepage (index.html)

**Files:**
- Create: `public/index.html` (based on user's existing HTML, add API calls)

**Interfaces:**
- Consumes: `GET /api/chapters` → chapter list
- Consumes: `GET /api/progress` → progress data

- [ ] **Step 1: Copy existing index.html to `public/index.html`**

Copy the user's homepage HTML into `public/index.html`.

- [ ] **Step 2: Add API integration script**

Add before the closing `</body>` tag:

```html
<script>
  async function loadHomepage() {
    try {
      const [chaptersRes, progressRes] = await Promise.all([
        fetch('/api/chapters'),
        fetch('/api/progress')
      ]);
      const chapters = await chaptersRes.json();
      const progress = await progressRes.json();

      // Update chapter cards with real data
      chapters.forEach(chapter => {
        const card = document.querySelector(`[data-chapter-id="${chapter.id}"]`);
        if (card) {
          const prog = progress[chapter.id];
          const completed = prog ? prog.completedLevels.length : 0;
          const total = prog ? prog.totalLevels : chapter.levelCount;

          // Update progress bubbles
          const bubbles = card.querySelectorAll('.progress-bubble');
          bubbles.forEach((bubble, i) => {
            bubble.className = `progress-bubble ${i < completed ? 'active' : 'inactive'}`;
          });

          // Update progress text
          const progressText = card.querySelector('.progress-text');
          if (progressText) {
            progressText.textContent = `${completed} / ${total} 关卡`;
          }
        }
      });
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    }
  }

  loadHomepage();
</script>
```

- [ ] **Step 3: Add `data-chapter-id` attributes to chapter cards**

Each chapter card `<div>` needs a `data-chapter-id="N"` attribute and the progress text needs a `progress-text` class.

- [ ] **Step 4: Test in browser**

```bash
# Restart server, then open http://localhost:3000
# Verify chapters load and progress displays correctly
```

- [ ] **Step 5: Commit**

```bash
git add public/index.html
git commit -m "feat: homepage connected to chapters and progress APIs"
```

---

### Task 9: Frontend — Practice Page (practice.html)

**Files:**
- Create: `public/practice.html` (based on user's existing HTML, add API calls)

**Interfaces:**
- Consumes: `POST /api/questions/generate` → generated questions
- Consumes: `POST /api/wrong-answers` → record wrong answers

- [ ] **Step 1: Copy existing practice.html to `public/practice.html`**

Copy the user's practice page HTML into `public/practice.html`.

- [ ] **Step 2: Add API integration script**

Replace the existing `<script>` block with:

```html
<script>
  let questions = [];
  let currentIndex = 0;
  let selectedAnswer = null;

  // Get chapterId from URL params
  const params = new URLSearchParams(window.location.search);
  const chapterId = parseInt(params.get('chapter')) || 1;

  async function loadQuestions() {
    try {
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, count: 5, difficulty: 'medium' })
      });
      questions = await res.json();
      renderQuestion();
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  }

  function renderQuestion() {
    if (!questions.length) return;
    const q = questions[currentIndex];

    // Update progress dots
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, i) => {
      dot.className = `w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-primary' : 'bg-surface-variant'}`;
    });

    // Update question stem
    document.querySelector('.question-stem').textContent = q.stem;

    // Update options
    const optionBtns = document.querySelectorAll('.option-btn');
    const labels = ['A', 'B', 'C', 'D'];
    optionBtns.forEach((btn, i) => {
      btn.querySelector('.option-label').textContent = labels[i];
      btn.querySelector('.option-text').textContent = q.options[i];
      btn.className = 'w-full text-left p-4 rounded-xl border-2 border-secondary-fixed text-on-surface font-body-math text-body-math hover:bg-secondary-container/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary flex items-center group option-btn';
      btn.querySelector('.option-label').className = 'option-label w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center mr-4 font-label-bold group-hover:bg-secondary-fixed group-hover:text-on-secondary-fixed transition-colors';
    });

    // Update counter
    document.querySelector('.question-counter').textContent = `${currentIndex + 1} / ${questions.length}`;

    selectedAnswer = null;
  }

  // Option selection
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('option-selected');
        b.querySelector('.option-label').classList.remove('bg-primary', 'text-on-primary');
        b.querySelector('.option-label').classList.add('bg-surface-variant', 'text-on-surface-variant');
      });
      btn.classList.add('option-selected');
      btn.querySelector('.option-label').classList.add('bg-primary', 'text-on-primary');
      selectedAnswer = i;
    });
  });

  // Submit
  document.querySelector('.submit-btn').addEventListener('click', async () => {
    if (selectedAnswer === null) return;
    const q = questions[currentIndex];

    if (selectedAnswer !== q.answer) {
      // Wrong answer — record it
      await fetch('/api/wrong-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, userAnswer: selectedAnswer })
      });
      alert('答错了！已记录到错题本。');
    } else {
      alert('答对了！');
    }
  });

  // Navigation
  document.querySelector('.next-btn')?.addEventListener('click', () => {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      renderQuestion();
    }
  });

  document.querySelector('.prev-btn')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  loadQuestions();
</script>
```

- [ ] **Step 3: Update HTML to match script selectors**

Add appropriate class names to the HTML elements:
- `.question-stem` on the problem statement element
- `.option-btn` on each option button
- `.option-label` and `.option-text` inside each button
- `.submit-btn` on the submit button
- `.progress-dot` on each progress indicator dot
- `.next-btn` / `.prev-btn` on navigation buttons

- [ ] **Step 4: Test in browser**

Open `http://localhost:3000/practice.html?chapter=1`, verify questions load from AI.

- [ ] **Step 5: Commit**

```bash
git add public/practice.html
git commit -m "feat: practice page with AI question generation and answer submission"
```

---

### Task 10: Frontend — Wrong Answers Page (wrong.html)

**Files:**
- Create: `public/wrong.html` (based on user's existing HTML, add API calls)

**Interfaces:**
- Consumes: `GET /api/wrong-answers` → wrong answer list
- Consumes: `GET /api/wrong-answers/stats` → statistics
- Consumes: `GET /api/chapters` → chapter info for display

- [ ] **Step 1: Copy existing wrong.html to `public/wrong.html`**

Copy the user's wrong answers page HTML into `public/wrong.html`.

- [ ] **Step 2: Add API integration script**

Add before the closing `</body>` tag:

```html
<script>
  async function loadWrongAnswers() {
    try {
      const [wrongRes, statsRes, chaptersRes, questionsRes] = await Promise.all([
        fetch('/api/wrong-answers'),
        fetch('/api/wrong-answers/stats'),
        fetch('/api/chapters'),
        fetch('/api/questions/1') // TODO: load all chapters
      ]);

      const wrongAnswers = await wrongRes.json();
      const stats = await statsRes.json();
      const chapters = await chaptersRes.json();

      // Update stats display
      document.querySelector('.total-wrong').textContent = stats.total;

      // Update chapter distribution
      const distContainer = document.querySelector('.chapter-distribution');
      distContainer.innerHTML = chapters.map(ch => {
        const count = stats.byChapter[ch.id] || 0;
        return `
          <div class="shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-surface-variant w-32 flex flex-col gap-2 relative overflow-hidden">
            <div class="absolute bottom-0 left-0 h-1 bg-primary w-full origin-left transform scale-x-${count > 0 ? '[0.5]' : '[0.1]'} transition-transform"></div>
            <span class="text-xs font-label-bold text-outline">第${ch.id}章</span>
            <span class="font-body-sm font-bold truncate">${ch.title.substring(0, 4)}</span>
            <span class="text-lg font-bold text-primary mt-1">${count}题</span>
          </div>
        `;
      }).join('');

      // Update wrong answer list
      // ... (render question cards based on wrongAnswers data)

    } catch (err) {
      console.error('Failed to load wrong answers:', err);
    }
  }

  loadWrongAnswers();
</script>
```

- [ ] **Step 3: Update HTML to match script selectors**

Add appropriate class names:
- `.total-wrong` on the total count element
- `.chapter-distribution` on the horizontal scroll container

- [ ] **Step 4: Test in browser**

Open `http://localhost:3000/wrong.html`, verify stats and list display.

- [ ] **Step 5: Commit**

```bash
git add public/wrong.html
git commit -m "feat: wrong answers page connected to backend APIs"
```

---

### Task 11: Final Integration Test

**Files:**
- Modify: `server.js` (if needed for any final fixes)

- [ ] **Step 1: Full flow test**

```bash
# Start server
node server.js

# 1. Check homepage loads
curl http://localhost:3000/
# Expected: HTML page served

# 2. Check chapters API
curl http://localhost:3000/api/chapters
# Expected: 8 chapters

# 3. Check progress API
curl http://localhost:3000/api/progress
# Expected: progress for all chapters

# 4. Generate questions (requires valid API key in .env)
curl -X POST http://localhost:3000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"chapterId": 1, "count": 2, "difficulty": "easy"}'
# Expected: 2 generated questions

# 5. Get cached questions
curl http://localhost:3000/api/questions/1
# Expected: previously generated questions

# 6. Check wrong answers
curl http://localhost:3000/api/wrong-answers
# Expected: [] or previously added entries
```

- [ ] **Step 2: Browser test**

Open each page and verify:
- `http://localhost:3000/` — Homepage with chapters and progress
- `http://localhost:3000/practice.html?chapter=1` — Practice page with AI questions
- `http://localhost:3000/wrong.html` — Wrong answers page

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: final integration verification"
```
