// 跨平台调用 liepin CLI 的薄封装。Windows 下 liepin 是 .cmd,必须 shell:true 才找得到。
import { spawnSync } from 'child_process';

// 跑一条 liepin 命令,返回 stdout 里第一个 JSON(数组或对象)。失败抛错(由调用方停手)。
// liepin 输出前常有非 JSON 前导,故从首个 '['/'{' 起截取(替原 PS 的 IndexOf 技巧)。
export function liepinJson(args, { open = '[' } = {}) {
  const r = spawnSync('liepin', args, {
    shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, LIEPIN_HEADLESS: 'true' },
  });
  if (r.status !== 0) {
    throw new Error(`liepin ${args.join(' ')} 退出码 ${r.status}（反爬/被踢/坏参数?）\n${(r.stderr || '').slice(0, 500)}`);
  }
  const out = r.stdout || '';
  const i = out.indexOf(open);
  if (i < 0) throw new Error(`liepin 输出无 JSON（可能被踢/未登录）:\n${out.slice(0, 300)}`);
  return JSON.parse(out.slice(i));
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const jitter = (min, max) => min + Math.floor(Math.random() * (max - min));
