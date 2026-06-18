// 精筛取数——跨平台(替原 PowerShell 步骤2 的 resume 循环)。
// 一个循环拉完本页挑出的 ~10 份 = 1 个回合,别开一份判一份。
// 每份间随机抖动防封;任一份命令失败即整体停手(非零退出),由 agent 据报错处置。
// 原始 JSON 不进上下文,只打窄字段供按 JD 下判决。
// 用法: node fetch.mjs <id1> <id2> ...
import { liepinJson, sleep, jitter } from './_liepin.mjs';

const ids = process.argv.slice(2);
if (!ids.length) { console.error('用法: node fetch.mjs <resume_id...>'); process.exit(2); }

for (let k = 0; k < ids.length; k++) {
  const id = ids[k];
  let r;
  try { r = liepinJson(['resume', id], { open: '{' }); }
  catch (e) { console.error(`\n第 ${k + 1}/${ids.length} 份(${id})失败,停手:\n` + e.message); process.exit(1); }

  const pick = (o, ks) => Object.fromEntries(ks.map(k => [k, o[k]]));
  console.log('==== ' + id + ' ====');
  console.log(JSON.stringify(
    pick(r, ['name', 'current_company', 'experience', 'want_salary', 'education', 'work_history', 'self_descr']),
    null, 1));
  if (k < ids.length - 1) await sleep(jitter(4000, 11000)); // 反爬抖动 4-11s
}
console.error('本回合 ' + ids.length + ' 份拉完。');
