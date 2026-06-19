const { getStore } = require('@netlify/blobs');

const CHAPTERS = [
  { id: 1, title: "函数、极限与连续", icon: "functions", color: "primary", topics: ["极限运算", "重要极限", "等价无穷小", "洛必达法则", "连续性与间断点"], levelCount: 5 },
  { id: 2, title: "一元函数微分学", icon: "timeline", color: "secondary", topics: ["导数定义", "复合求导", "隐函数求导", "参数方程求导", "中值定理", "单调性与极值"], levelCount: 4 },
  { id: 3, title: "一元函数积分学", icon: "integration_instructions", color: "tertiary", topics: ["换元积分法", "分部积分法", "定积分计算", "几何应用"], levelCount: 4 },
  { id: 4, title: "向量代数与空间解析几何", icon: "polyline", color: "tertiary", topics: ["向量积运算", "平面与直线方程", "位置关系"], levelCount: 3 },
  { id: 5, title: "多元函数微分学与积分学", icon: "layers", color: "tertiary", topics: ["偏导数", "全微分", "多元复合求导", "隐函数求导", "二重积分"], levelCount: 4 },
  { id: 6, title: "无穷级数", icon: "all_inclusive", color: "tertiary", topics: ["级数敛散性判别", "幂级数收敛半径", "泰勒展开"], levelCount: 3 },
  { id: 7, title: "常微分方程", icon: "call_split", color: "tertiary", topics: ["一阶微分方程求解", "二阶常系数线性方程"], levelCount: 4 },
  { id: 8, title: "线性代数", icon: "grid_on", color: "tertiary", topics: ["矩阵运算", "逆矩阵", "行列式计算", "线性方程组求解", "特征值与特征向量"], levelCount: 5 }
];

const DEFAULT_PROGRESS = {
  "1": { completedLevels: [], totalLevels: 5 },
  "2": { completedLevels: [], totalLevels: 4 },
  "3": { completedLevels: [], totalLevels: 4 },
  "4": { completedLevels: [], totalLevels: 3 },
  "5": { completedLevels: [], totalLevels: 4 },
  "6": { completedLevels: [], totalLevels: 3 },
  "7": { completedLevels: [], totalLevels: 4 },
  "8": { completedLevels: [], totalLevels: 5 }
};

function getStoreInstance(context) {
  return getStore({ name: 'math-adventure', context });
}

async function readData(context, key, defaultValue) {
  try {
    const store = getStoreInstance(context);
    const data = await store.get(key, { type: 'json' });
    return data || defaultValue;
  } catch {
    return defaultValue;
  }
}

async function writeData(context, key, value) {
  try {
    const store = getStoreInstance(context);
    await store.setJSON(key, value);
  } catch (err) {
    console.error(`Blob write failed for ${key}:`, err.message);
    // 如果 Blobs 不可用，静默跳过（AI 出题仍然可用）
  }
}

module.exports = {
  CHAPTERS,
  DEFAULT_PROGRESS,
  readData,
  writeData,
};
