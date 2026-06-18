// 去重台账 CSV 读写——兼容 PowerShell Export-Csv 风格(带 BOM、字段加引号)。
// 跨平台:纯 Node,无依赖。只处理两列 resume_id,status。
import { readFileSync, writeFileSync, existsSync } from 'fs';

const BOM = '﻿';

// 解析:容忍 BOM、带不带引号、CRLF/LF。返回 [{resume_id,status}]。
export function readLedger(csvPath) {
  if (!existsSync(csvPath)) return [];
  let txt = readFileSync(csvPath, 'utf8');
  if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
  const lines = txt.split(/\r?\n/).filter(l => l.trim() !== '');
  if (!lines.length) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {     // 跳表头
    const cells = splitCsvLine(lines[i]);
    if (!cells[0]) continue;
    rows.push({ resume_id: cells[0], status: cells[1] || '未精筛' });
  }
  return rows;
}

// 整表重写(绝不追加——PS5.1 Export-Csv -Append 偶发串列会毁台账,这里同理只整写)。
export function writeLedger(csvPath, rows) {
  const out = [q('resume_id') + ',' + q('status')];
  for (const r of rows) out.push(q(r.resume_id) + ',' + q(r.status));
  writeFileSync(csvPath, BOM + out.join('\r\n') + '\r\n', 'utf8');
}

function splitCsvLine(line) {
  const cells = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { cells.push(cur); cur = ''; }
      else cur += c;
    }
  }
  cells.push(cur);
  return cells.map(s => s.trim());
}

function q(s) { return '"' + String(s ?? '').replace(/"/g, '""') + '"'; }
