const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const isVercel = !!process.env.VERCEL;
const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

// ── 初始数据模板（不变的部分直接内置） ──
const DEFAULT_DATA = {
  'chapters.json': [
    { id: 1, title: '函数、极限与连续', icon: 'functions', color: 'primary', topics: ['极限运算', '重要极限', '等价无穷小', '洛必达法则', '连续性与间断点'], levelCount: 5 },
    { id: 2, title: '一元函数微分学', icon: 'timeline', color: 'secondary', topics: ['导数定义', '复合求导', '隐函数求导', '参数方程求导', '中值定理', '单调性与极值'], levelCount: 4 },
    { id: 3, title: '一元函数积分学', icon: 'integration_instructions', color: 'tertiary', topics: ['换元积分法', '分部积分法', '定积分计算', '几何应用'], levelCount: 4 },
    { id: 4, title: '向量代数与空间解析几何', icon: 'polyline', color: 'tertiary', topics: ['向量积运算', '平面与直线方程', '位置关系'], levelCount: 3 },
    { id: 5, title: '多元函数微分学与积分学', icon: 'layers', color: 'tertiary', topics: ['偏导数', '全微分', '多元复合求导', '隐函数求导', '二重积分'], levelCount: 4 },
    { id: 6, title: '无穷级数', icon: 'all_inclusive', color: 'tertiary', topics: ['级数敛散性判别', '幂级数收敛半径', '泰勒展开'], levelCount: 3 },
    { id: 7, title: '常微分方程', icon: 'call_split', color: 'tertiary', topics: ['一阶微分方程求解', '二阶常系数线性方程'], levelCount: 4 },
    { id: 8, title: '线性代数', icon: 'grid_on', color: 'tertiary', topics: ['矩阵运算', '逆矩阵', '行列式计算', '线性方程组求解', '特征值与特征向量'], levelCount: 5 }
  ],
  'progress.json': { "1": { "completedLevels": [], "totalLevels": 5 }, "2": { "completedLevels": [], "totalLevels": 4 }, "3": { "completedLevels": [], "totalLevels": 4 }, "4": { "completedLevels": [], "totalLevels": 3 }, "5": { "completedLevels": [], "totalLevels": 4 }, "6": { "completedLevels": [], "totalLevels": 3 }, "7": { "completedLevels": [], "totalLevels": 4 }, "8": { "completedLevels": [], "totalLevels": 5 } },
  'wrongAnswers.json': [],
  'questions.json': []
};

// ── Vercel Blob 存储 ──
let blobStore;
if (isVercel && hasBlobToken) {
  try {
    // @vercel/blob 必须在运行时引入，不能在顶层 require
    // 这里用动态 require，Vercel 部署时会自动安装依赖
    blobStore = require('@vercel/blob');
  } catch (e) {
    console.warn('@vercel/blob not available, falling back to in-memory');
  }
}

// ── 内存存储（Vercel 无 Blob Token 时兜底） ──
const memoryStore = new Map();

function getDefaults(filename) {
  const data = DEFAULT_DATA[filename];
  return data ? JSON.parse(JSON.stringify(data)) : null;
}

// ── 读取 ──
async function readJSON(filename) {
  // 1. Vercel Blob（持久化）
  if (blobStore) {
    try {
      const { blob } = await blobStore.get(`data/${filename}`);
      if (blob) {
        const text = await blob.text();
        return JSON.parse(text);
      }
    } catch (e) {
      // blob 不存在，走兜底
    }
    const defaults = getDefaults(filename);
    if (defaults !== null) return defaults;
    throw new Error(`File not found: ${filename}`);
  }

  // 2. Vercel 内存（每次冷启动重建，临时用）
  if (isVercel) {
    if (memoryStore.has(filename)) {
      return JSON.parse(memoryStore.get(filename));
    }
    const defaults = getDefaults(filename);
    if (defaults !== null) {
      memoryStore.set(filename, JSON.stringify(defaults));
      return defaults;
    }
    throw new Error(`File not found: ${filename}`);
  }

  // 3. 本地文件系统
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

// ── 写入 ──
async function writeJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);

  // 1. Vercel Blob
  if (blobStore) {
    await blobStore.put(`data/${filename}`, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    return;
  }

  // 2. Vercel 内存
  if (isVercel) {
    memoryStore.set(filename, json);
    return;
  }

  // 3. 本地文件系统
  const filePath = path.join(DATA_DIR, filename);
  if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
  }
  await fs.writeFile(filePath, json, 'utf-8');
}

// ── 本地启动时初始化（仅限非 Vercel 环境） ──
function initLocal() {
  if (isVercel) return;
  if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
  }
  for (const [filename, data] of Object.entries(DEFAULT_DATA)) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fsSync.existsSync(filePath)) {
      fsSync.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
  }
}
initLocal();

module.exports = { readJSON, writeJSON };
