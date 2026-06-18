// 无头补丁——把全局安装的 liepin-cli 默认改成「无头」,杜绝搜人/精筛时弹有头浏览器。
//
// 为什么需要:liepin-cli 的 `new CdpBrowser()` 不传参,无头与否全看 config.headless,
// 而发布版默认是「只有 LIEPIN_HEADLESS=='true' 才无头」——任何一次裸调用(没带环境变量)
// 就会弹出有头浏览器。本补丁把默认翻转成「除非显式 LIEPIN_HEADLESS=false 否则一律无头」,
// 这样:① 所有搜人/精筛/出 PDF 默认无头、绝不弹窗;② login 用 `LIEPIN_HEADLESS=false` 仍可有头扫码。
//
// 用法:装完 / `npm i -g @viyzhu/liepin-cli` 之后跑一次:
//   node .claude/skills/pxb-liepin/scripts/patch-headless.mjs
// ⚠️ `npm update @viyzhu/liepin-cli` 会覆盖补丁,更新后需重跑本脚本。幂等,可反复跑。
import { execSync } from 'child_process';
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const FROM = "LIEPIN_HEADLESS === 'true'";
const TO = "LIEPIN_HEADLESS !== 'false'";

let cfg;
try {
  const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
  cfg = path.join(npmRoot, '@viyzhu', 'liepin-cli', 'dist', 'config.js');
} catch (e) {
  console.error('找不到 npm 全局目录,先确认 Node/npm 装好:\n' + (e.message || e));
  process.exit(1);
}
if (!existsSync(cfg)) {
  console.error('未找到 ' + cfg + '\n先 `npm i -g @viyzhu/liepin-cli` 再跑本补丁。');
  process.exit(1);
}

const src = readFileSync(cfg, 'utf8');
if (src.includes(TO)) { console.log('✓ 已是无头默认,无需修补:' + cfg); process.exit(0); }
if (!src.includes(FROM)) {
  console.error('⚠️ config.js 里没找到预期的 `' + FROM + '`——liepin-cli 版本可能变了。\n' +
    '请人工检查 ' + cfg + ' 里的 headless 默认值,或反馈维护者更新本补丁。');
  process.exit(2);
}
writeFileSync(cfg, src.replace(FROM, TO), 'utf8');
console.log('✓ 已打无头补丁:' + cfg);
console.log('  默认改为无头;login 时用 `LIEPIN_HEADLESS=false liepin login` 仍可有头扫码。');
