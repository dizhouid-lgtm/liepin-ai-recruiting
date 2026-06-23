// 跨平台调用 liepin CLI 的薄封装。Windows 下 liepin 是 .cmd,必须 shell:true 才找得到。
import { spawnSync } from 'child_process';

// 跑一条 liepin 命令,返回 stdout 里第一个 JSON(数组或对象)。失败抛错(由调用方停手)。
// liepin 输出前常有非 JSON 前导,故从首个 '['/'{' 起截取(替原 PS 的 IndexOf 技巧)。
// timeoutMs:硬超时——liepin 卡住(撞反爬/滑块/未登录/Chrome 卡死)就强杀并抛错,
//   绝不让脚本无限阻塞(否则 agent 会静默挂死、用户长时间看不到任何反馈)。
export function liepinJson(args, { open = '[', timeoutMs = 360000 } = {}) {
  // 必须带 --json:否则 liepin 走人类可读/交互模式,输出无法解析、甚至会挂起干等(卡死主因)。
  const r = spawnSync('liepin', [...args, '--json'], {
    shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    timeout: timeoutMs, killSignal: 'SIGKILL',
    env: { ...process.env, LIEPIN_HEADLESS: 'true' },
  });
  // 超时:Node 会置 r.error(code ETIMEDOUT)并把 r.signal 设为 killSignal。
  if (r.error && (r.error.code === 'ETIMEDOUT' || r.signal)) {
    throw new Error(
      `liepin ${args.join(' ')} 超过 ${Math.round(timeoutMs / 1000)}s 无响应,已强杀(防静默挂死)。\n` +
      `常见原因:撞反爬/滑块验证、未登录、或本机 Chrome 卡住。\n` +
      `处理:① 关掉残留的 Chrome 窗口/进程;② 确认已登录(liepin login);③ 过几分钟换时段再试;④ 把 --limit 调小(如 20)。`);
  }
  if (r.error) throw new Error(`liepin 启动失败: ${r.error.message}`);
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
