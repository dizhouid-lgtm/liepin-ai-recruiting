// 单账号搜索锁——跨平台(替原 PowerShell 抢锁块)。
// 单账号串行调 liepin,绝不并发。锁文件 ~/.liepin-cli/.search-lock,30 分钟过期。
// 用法:
//   node lock.mjs acquire <岗位>   抢锁;占用中且未过期 → 退出码 1(调用方应排队)
//   node lock.mjs renew  <岗位>    长循环每轮回搜前续命,防被误判过期抢走
//   node lock.mjs release          跑完释放
import os from 'os';
import path from 'path';
import { existsSync, mkdirSync, writeFileSync, rmSync, statSync } from 'fs';

const STALE_MIN = 30;
const action = process.argv[2];
const label = process.argv[3] || '未命名岗位';
const dir = path.join(os.homedir(), '.liepin-cli');
const lock = path.join(dir, '.search-lock');

function stamp() {
  mkdirSync(dir, { recursive: true });
  writeFileSync(lock, `占锁:${label} ${new Date().toISOString()}`, 'utf8');
}

if (action === 'acquire') {
  if (existsSync(lock)) {
    const ageMin = (Date.now() - statSync(lock).mtimeMs) / 60000;
    if (ageMin < STALE_MIN) { console.error(`别处在搜(锁 ${ageMin.toFixed(1)} 分钟前更新),排队`); process.exit(1); }
    console.error(`锁已过期(${ageMin.toFixed(1)} 分钟),夺锁`);
  }
  stamp();
  console.log('已占锁:' + label);
} else if (action === 'renew') {
  if (!existsSync(lock)) { console.error('锁不存在,无法续命——可能已被释放'); process.exit(1); }
  stamp();
  console.log('已续命');
} else if (action === 'release') {
  if (existsSync(lock)) rmSync(lock, { force: true });
  console.log('已释放锁');
} else {
  console.error('用法: node lock.mjs acquire|renew|release <岗位>');
  process.exit(2);
}
