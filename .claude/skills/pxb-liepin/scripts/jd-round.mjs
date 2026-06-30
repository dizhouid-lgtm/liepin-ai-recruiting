// 往某岗 JD.md 内部备注表「只追加一行」——别让 AI 手编表格(已踩坑:手编漏个空行就把整行甩出表格)。
// 用法: node jd-round.mjs <JD.md> "<轮次>" "<强搜索词>" "<弱搜索词>" "<正向建议>" "<负向建议>"
// 行内换行→分号、竖线→全角｜,自动转义,不会撑破表格。紧贴上一行插入,绝不留空行。
import { readFileSync, writeFileSync } from 'fs';

const [file, ...cells] = process.argv.slice(2);
if (!file || cells.length !== 5) {
  console.error('用法: node jd-round.mjs <JD.md> "<轮次>" "<强搜索词>" "<弱搜索词>" "<正向建议>" "<负向建议>"');
  process.exit(2);
}
const clean = s => (s ?? '').replace(/\r?\n/g, '；').replace(/\|/g, '｜').trim();
const row = '| ' + cells.map(clean).join(' | ') + ' |';

const text = readFileSync(file, 'utf8');
const lines = text.split('\n');

// 定位内部备注表:表头行含「轮次」且「强搜索词」
const head = lines.findIndex(l => l.trim().startsWith('|') && l.includes('轮次') && l.includes('强搜索词'));
if (head < 0) { console.error('没在 ' + file + ' 找到内部备注表(表头需含 轮次/强搜索词)'); process.exit(1); }

// 从表头往下找最后一个表格行(以 | 开头);跳过表内偶发空行,撞到 `>` 注释等非表格行即止
let last = head;
for (let i = head + 1; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.startsWith('|')) last = i;
  else if (t === '') continue;
  else break;
}
lines.splice(last + 1, 0, row);
writeFileSync(file, lines.join('\n'), 'utf8');
console.log('已追加一行到 ' + file + ' 内部备注表');
