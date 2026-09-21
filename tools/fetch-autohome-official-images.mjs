/**
 * fetch-autohome-official-images.mjs — 抓取各版本的汽车之家「官图」清单
 *
 * 用法: node tools/fetch-autohome-official-images.mjs [slug...] [--force]
 *
 * 两种模式：
 *   官图（默认）: /pic/series-s<specId>/<seriesId>-53.html
 *   按颜色外观:   /pic/series-<seriesId>-<colorId>-<category>-1.html（条目带 colorId 时）
 * 说明: 官图页 URL 规则 /pic/series-s<specId>/<seriesId>-53.html（53 = 官图分类）
 *       页面为懒加载，需用 render-fetch 的 --scroll 渲染后再提取 data-webp。
 *       提取到的缩略图地址会被规范化为原图（3840×2880）。
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const MAP = [
  { slug: 'su7-2024-standard', specId: 59881, seriesId: 6962 },
  { slug: 'su7-2024-pro', specId: 67500, seriesId: 6962 },
  { slug: 'su7-2024-max', specId: 65768, seriesId: 6962 },
  { slug: 'su7-2026-standard', specId: 76173, seriesId: 6962 },
  { slug: 'su7-2026-pro', specId: 75667, seriesId: 6962 },
  { slug: 'su7-2026-max', specId: 75668, seriesId: 6962 },
  { slug: 'su7-ultra-2025', specId: 70545, seriesId: 7915 },
  { slug: 'su7-ultra-2025-nurburgring', specId: 70554, seriesId: 7915 },
  { slug: 'yu7-2025-long-range', specId: 71396, seriesId: 7793 },
  { slug: 'yu7-2025-pro', specId: 71839, seriesId: 7793 },
  { slug: 'yu7-2025-max', specId: 68936, seriesId: 7793 },
  { slug: 'yu7-2026-standard', specId: 77835, seriesId: 7793 },
  { slug: 'yu7-2026-gt', specId: 76544, seriesId: 7793 },
  { slug: 'n90-2026-max-7', specId: 78513, seriesId: 8326 },
  { slug: 'n90-2026-max-explorer', specId: 78510, seriesId: 8326 },
  { slug: 'n70-2026-pro', specId: 78516, seriesId: 8731 },
  { slug: 'n70-2026-max', specId: 78517, seriesId: 8731 },
];

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = only.length ? MAP.filter((m) => only.includes(m.slug)) : MAP;

fs.mkdirSync('data-raw/official-images', { recursive: true });

for (const t of targets) {
  const outFile = `data-raw/official-images/${t.slug}.json`;
  if (fs.existsSync(outFile) && !process.argv.includes('--force')) {
    console.log(`跳过 ${t.slug}（已存在）`);
    continue;
  }
  const url = t.colorId
    ? `https://car.autohome.com.cn/pic/series-${t.seriesId}-${t.colorId}-${t.category ?? 1}-1.html`
    : `https://car.autohome.com.cn/pic/series-s${t.specId}/${t.seriesId}-53.html`;
  try {
    const html = execFileSync('node', ['tools/render-fetch.mjs', url, '5000', '--scroll'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    const raw = [...new Set([...html.matchAll(/data-webp="([^"]+)"/g)].map((m) => m[1]))];
    const full = raw.map((u) => 'https:' + u.replace('/480x360_0_q95_c42_', '/0x0_0_q95_c42_'));
    fs.writeFileSync(outFile, JSON.stringify({ slug: t.slug, specId: t.specId, seriesId: t.seriesId, ...(t.colorId ? { colorId: t.colorId, colorName: t.colorName, category: t.category ?? 1 } : {}), pageUrl: url, count: full.length, images: full }, null, 2) + '\n', 'utf8');
    console.log(`${t.slug}: ${full.length} 张官图`);
  } catch (err) {
    console.error(`${t.slug}: 抓取失败 - ${err.message?.slice(0, 80)}`);
  }
}
