# 数学大冒险 — 后端设计文档

## 概述

为"数学大冒险"高数一练习应用构建 Node.js + Express 后端，支持 AI 自动生成题目、用户进度追踪和错题管理。

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 使用场景 | 个人使用 | 无需用户认证系统 |
| 技术栈 | Node.js + Express | 用户偏好，前端开发者友好 |
| AI 接口 | MiMo API（OpenAI 兼容格式） | 用户已有 API，兼容 OpenAI SDK |
| 数据存储 | 本地 JSON 文件 | 个人项目，简单够用 |
| 架构 | 单服务，静态页面 + API | 最简方案，一个 `npm start` 搞定 |

## 项目结构

```
高数一练习/
├── server.js              # Express 入口
├── package.json
├── .env                   # API Key 等环境变量
├── routes/
│   ├── chapters.js        # 章节相关接口
│   ├── questions.js       # 题目生成/查询接口
│   ├── progress.js        # 进度管理接口
│   └── wrongAnswers.js    # 错题管理接口
├── services/
│   └── ai.js              # MiMo API 调用封装
├── data/
│   ├── chapters.json      # 8个章节的基础信息
│   ├── questions.json     # AI生成的题目缓存
│   ├── progress.json      # 用户进度
│   └── wrongAnswers.json  # 错题记录
└── public/                # 静态前端文件
    ├── index.html         # 首页
    ├── practice.html      # 做题页
    └── wrong.html         # 错题本
```

## API 接口

### 章节

- `GET /api/chapters` — 获取所有章节列表
- `GET /api/chapters/:id` — 获取单个章节详情

### 题目

- `POST /api/questions/generate` — AI 生成题目
  - body: `{ chapterId: number, count?: number, difficulty?: "easy"|"medium"|"hard" }`
  - 返回生成的题目数组
- `GET /api/questions/:chapterId` — 获取某章节的已缓存题目

### 进度

- `GET /api/progress` — 获取所有章节进度
- `PUT /api/progress/:chapterId` — 更新某章节进度
  - body: `{ level: number, completed: boolean }`

### 错题

- `GET /api/wrong-answers` — 获取所有错题
- `POST /api/wrong-answers` — 添加错题记录
  - body: `{ questionId: string, userAnswer: number }`
- `DELETE /api/wrong-answers/:id` — 删除错题（标记已掌握）
- `GET /api/wrong-answers/stats` — 获取错题统计数据

## 数据模型

### chapters.json

预置数据，不通过 AI 生成。包含 8 个高数一章节：

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

### questions.json

AI 生成后缓存：

```json
[
  {
    "id": "q_1_abc123",
    "chapterId": 1,
    "difficulty": "easy",
    "topic": "洛必达法则",
    "stem": "求极限: lim(x→0) (e^x - 1 - x) / x²",
    "options": ["0", "1/2", "1", "∞"],
    "answer": 1,
    "explanation": "使用洛必达法则，分子分母分别求导：lim(x→0) (e^x - 1) / 2x = lim(x→0) e^x / 2 = 1/2"
  }
]
```

### progress.json

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

### wrongAnswers.json

```json
[
  {
    "id": "wa_1",
    "questionId": "q_1_abc123",
    "userAnswer": 0,
    "correctAnswer": 1,
    "timestamp": "2026-06-19T10:00:00Z",
    "reviewed": false
  }
]
```

## AI 集成

### 配置

`.env` 文件：

```
MIMO_API_KEY=your_key_here
MIMO_BASE_URL=https://api.mimo.com/v1
MIMO_MODEL=mimo-model-name
PORT=3000
```

### 调用流程

1. 前端发送 `POST /api/questions/generate`，携带 `chapterId`、`count`、`difficulty`
2. 后端从 `chapters.json` 读取该章节的考点列表
3. 构造 prompt，调用 MiMo API（通过 OpenAI SDK，自定义 `baseURL`）
4. 解析 AI 返回的 JSON，格式化为标准题目对象
5. 存入 `questions.json` 缓存
6. 返回题目数组给前端

### Prompt 模板

```
你是一个高等数学出题专家。请为以下考点生成 {count} 道选择题。

章节：{chapterTitle}
考点：{topics.join(", ")}
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

只返回 JSON 数组，不要其他内容。
```

## 前端改造

前端 HTML 需要添加 JavaScript 来调用后端 API。UI 样式保持不变。

### 首页 (index.html)

- 页面加载时 fetch `/api/chapters` 和 `/api/progress`
- 动态渲染章节卡片、进度条、关卡数

### 做题页 (practice.html)

- 进入时 fetch `/api/questions/generate` 获取 AI 生成的题目
- 选择答案、提交、显示结果
- 答错时自动记录到错题

### 错题本 (wrong.html)

- 加载时 fetch `/api/wrong-answers` 和 `/api/wrong-answers/stats`
- 渲染错题列表、统计数据、知识点分布
- "再试一次"按钮跳转到做题页重新练习

## 错误处理

- AI API 调用失败时返回友好错误提示，不影响已有缓存数据
- JSON 文件读写异常时返回 500 错误
- 请求参数校验失败时返回 400 错误

## 依赖

- `express` — Web 框架
- `openai` — OpenAI 兼容 SDK（用于调用 MiMo API）
- `dotenv` — 环境变量管理
- `cors` — 跨域支持（开发用）
