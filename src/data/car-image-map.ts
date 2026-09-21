import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(process.cwd(), 'public/images/cars');

/** 扫描本地已下载的真实车辆图片，返回 slug → 扩展名 */
export function listLocalCarImages(): Record<string, string> {
  const map: Record<string, string> = {};
  if (!fs.existsSync(DIR)) return map;
  for (const file of fs.readdirSync(DIR)) {
    if (file.startsWith('_')) continue;
    const m = file.match(/^(.+)\.(jpg|jpeg|png|webp)$/i);
    if (!m) continue;
    map[m[1]] = m[2].toLowerCase();
  }
  return map;
}
