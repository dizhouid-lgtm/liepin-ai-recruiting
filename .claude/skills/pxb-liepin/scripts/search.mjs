// 粗筛取数——跨平台(替原 PowerShell 步骤1 整块)。
// 一步完成:liepin search → 去掉台账里已召回的 → 新人登记「未精筛」→ 打印窄表给 agent 判断。
// 原始 JSON 不进上下文,只输出窄表(标题/公司/年限/薪资/学历/id)。
// 用法: node search.mjs <csv> "<关键词>" [--city 深圳] [--limit 40] [--experience 3-5年] [--salary 20-30K] [--degree 本科]
import { readLedger, writeLedger } from './_csv.mjs';
import { liepinJson } from './_liepin.mjs';

const [csv, query, ...flags] = process.argv.slice(2);
if (!csv || !query) { console.error('用法: node search.mjs <csv> "<关键词>" [--city .. --limit .. --experience .. --salary .. --degree ..]'); process.exit(2); }

let raw;
try { raw = liepinJson(['search', JSON.stringify(query), ...flags], { open: '[', timeoutMs: 360000 }); }  // 6min:自动翻页给宽
catch (e) { console.error('搜索失败,停手；看报错:\n' + e.message); process.exit(1); }

const rows = readLedger(csv);
const seen = new Set(rows.map(r => r.resume_id));
const fresh = raw.filter(x => x.resume_id && !seen.has(x.resume_id));

// 全员登 CSV(查重命根),新人一律「未精筛」
for (const x of fresh) rows.push({ resume_id: x.resume_id, status: '未精筛' });
writeLedger(csv, rows);

// 窄表:卡片只有这几列,判不了能力,只够砍硬约束 + 挑 ~10 进精筛
console.log(`本次召回 ${raw.length}，新增 ${fresh.length}（其余已在台账,跳过）`);
console.log('id\t姓名\t现职\t公司\t年限\t薪资\t学历');
for (const x of fresh) {
  console.log([x.resume_id, x.name, x.current_title, x.company, x.experience, x.salary, x.degree]
    .map(v => v ?? '').join('\t'));
}
