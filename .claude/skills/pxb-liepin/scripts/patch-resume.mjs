// duty 补丁——让 liepin-cli 的 resume 把每段工作经历的「逐段职责(duty)」吐进 work_history。
//
// 为什么需要:liepin-cli 的 resume.js 把 vo.workExperiences[] 拍平成 work_history 时,
// 只取了 时长/公司/职位,丢掉了每段的 duty(逐段职责)——而 duty 正是精筛最该看的实做内容。
// 标准简历(职责写在工作经历段、自述只一句)经此一丢,精筛就只剩时间线+泛泛自述,真材料没了。
// 本补丁把每段 duty 接到 work_history 该段后面。
//
// 用法:装完 / `npm i -g @viyzhu/liepin-cli` 之后跑一次:
//   node .claude/skills/pxb-liepin/scripts/patch-resume.mjs
// ⚠️ `npm update @viyzhu/liepin-cli` 会覆盖补丁,更新后需重跑。幂等,可反复跑。
// 终局:已就此向 @viyzhu/liepin-cli 提 PR;上游修复并发布后,本补丁可弃用(改为 pin 版本)。
import { execSync } from 'child_process';
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

let file;
try {
  const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
  file = path.join(npmRoot, '@viyzhu', 'liepin-cli', 'dist', 'toolset', 'resume.js');
} catch (e) {
  console.error('找不到 npm 全局目录,先确认 Node/npm 装好:\n' + (e.message || e));
  process.exit(1);
}
if (!existsSync(file)) {
  console.error('未找到 ' + file + '\n先 `npm i -g @viyzhu/liepin-cli` 再跑本补丁。');
  process.exit(1);
}

const src = readFileSync(file, 'utf8');
if (src.includes('w.duty')) { console.log('✓ 已含 duty 补丁,无需修补:' + file); process.exit(0); }

// 匹配原始 work_history 映射:joinLines(vo.workExperiences, (w) => `...`.trim())
const re = /work_history: joinLines\(vo\.workExperiences, \(w\) => (`[^`]*`)\.trim\(\)\)/;
if (!re.test(src)) {
  console.error('⚠️ resume.js 里没找到预期的 work_history 映射——liepin-cli 版本可能变了。\n' +
    '请人工检查 ' + file + ' 的 work_history 一行,或反馈维护者更新本补丁。');
  process.exit(2);
}
const patched = src.replace(re, (m, tpl) =>
  'work_history: joinLines(vo.workExperiences, (w) => (' + tpl + ".trim() + (w.duty ? " + '`\\n${w.duty}`' + " : '')))");
writeFileSync(file, patched, 'utf8');
console.log('✓ 已打 duty 补丁:' + file);
console.log('  work_history 每段现含逐段职责(duty)——精筛主看它。');
