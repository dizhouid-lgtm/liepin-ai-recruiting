// 简历存 PDF —— 猎聘禁下载,用整页 PDF 代替(自动分页,长简历也完整),方便转发他人。
// 用法: node pdf.mjs <resume_id> [resume_id=标签] ...
//   - 纯 id：文件名 简历_<id>.pdf ｜ id=标签：文件名 简历_<标签>.pdf(标签如 "张三-大疆",方便辨认)
// 输出目录:① 设了 LIEPIN_PDF_DIR 就存那(不存在自动建,精筛用各岗「待定」文件夹);② 没设则存桌面。
// 注意:① page.pdf() 仅无头可用,别设 LIEPIN_HEADLESS=false;② 占用 liepin profile,别和搜索/看简历 Chrome 同时跑;③ 需账号在线(被踢会存成登录页)。
// 渲染:简历页(cvview→resume/detail 重定向 + React/Vue 异步渲染)不能用固定 sleep 就截,
//      必须等到真实简历内容出现再 pdf,否则截到中间态/错误页(表现为所有 PDF 都 ~68KB 一致)。
import os from 'os';
import path from 'path';
import { existsSync, mkdirSync, statSync } from 'fs';
import { execSync } from 'child_process';

// 无头硬执行:在加载 CdpBrowser 前锁死,CdpBrowser 启动时即读到,绝不弹有头窗口。
process.env.LIEPIN_HEADLESS = 'true';

// 跨平台 + 跨用户:动态解析全局 npm 安装的 liepin-cli dist,不写死任何用户名路径。
let pkgRoot;
try {
  const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
  pkgRoot = path.join(npmRoot, '@viyzhu', 'liepin-cli', 'dist');
  if (!existsSync(pkgRoot)) throw new Error('未在 ' + pkgRoot + ' 找到 liepin-cli');
} catch (e) {
  console.error('定位 @viyzhu/liepin-cli 失败,请先 `npm i -g @viyzhu/liepin-cli`:\n' + (e.message || e));
  process.exit(1);
}
const pkg = 'file://' + pkgRoot.replace(/\\/g, '/');
const { CdpBrowser } = await import(`${pkg}/browser/cdp_browser.js`);
const { sleep } = await import(`${pkg}/common/utils.js`);

const items = process.argv.slice(2).map(a => { const [id, ...l] = a.split('='); return { id, label: (l.join('=') || id).replace(/[\\/:*?"<>|]/g, '_') }; });
if (!items.length) { console.log('用法: node pdf.mjs <resume_id> [resume_id=标签] ...'); process.exit(1); }

let outDir = process.env.LIEPIN_PDF_DIR;
if (outDir) { mkdirSync(outDir, { recursive: true }); }
else { outDir = [path.join(os.homedir(), 'OneDrive', 'Desktop'), path.join(os.homedir(), 'Desktop')].find(existsSync) || path.join(os.homedir(), 'Desktop'); }
const base = 'https://lpt.liepin.com/cvview/showresumedetail?resIdEncode=';

const SMALL_PDF = 100 * 1024; // <100KB 大概率是错误页

async function renderOne(page, id, out, attempt = 1) {
  await page.goto(base + id, { waitUntil: 'networkidle2' });
  // cvview 页会先显示"当前页面出现错误"然后 JS 重定向到 resume/detail,
  // networkidle2 在重定向前就触发了。等 URL 变成 resume/detail 再继续。
  try {
    await page.waitForFunction(
      () => window.location.href.includes('resume/detail'),
      { timeout: 10000, polling: 300 });
  } catch { /* 可能直接就在 detail 页了 */ }
  // URL 到位后等 React 异步渲染出简历内容
  try {
    await page.waitForFunction(
      () => ['求职意向','工作经历','教育经历','自我评价'].some(m => document.body.innerText.includes(m)),
      { timeout: 10000, polling: 500 });
  } catch {
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 120));
    if (/登录|登陆|扫码/.test(txt)) { console.log(`⚠️ ${id} 疑似未登录,账号可能被踢`); return 0; }
    console.log(`⚠️ ${id} 等不到简历内容,仍尝试截 PDF`);
  }
  await sleep(1500);
  await page.emulateMediaType('screen');
  await page.pdf({ path: out, format: 'A4', printBackground: true });
  const size = statSync(out).size;
  if (size < SMALL_PDF && attempt === 1) {
    console.log(`⚠️ ${id} PDF 仅 ${Math.round(size/1024)}KB,重试…`);
    await sleep(2000);
    return renderOne(page, id, out, 2);
  }
  return size;
}

const b = new CdpBrowser();
try {
  const page = await b.launch();
  for (const { id, label } of items) {
    const out = path.join(outDir, `简历_${label}.pdf`);
    const size = await renderOne(page, id, out);
    if (size === 0) { /* 登录页,已 warn */ }
    else console.log(`已存 ${out} (${Math.round(size / 1024)}KB)`);
    await sleep(1500 + Math.floor(Math.random() * 2000)); // 抖动
  }
} catch (e) { console.log('ERR:', e?.message || e); }
finally { await b.close(); }
