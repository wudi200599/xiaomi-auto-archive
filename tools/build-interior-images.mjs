/**
 * build-interior-images.mjs
 *
 * 下载 18 款车型对应的内饰主图并统一处理为 1600×1000 WebP。
 * 不修改页面数据，仅生成 public/images/interiors 图库和来源清单。
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'public/images/interiors';
const MANIFEST = 'data-raw/interiors/manifest.json';

const AUTOHOME = (specId, seriesId, category = 10) =>
  `https://car.autohome.com.cn/pic/series-s${specId}/${seriesId}-${category}.html`;

const FRONT_PICKS = [
  { slug: 'su7-2024-standard', pageUrl: AUTOHOME(59881, 6962), index: 1, note: '前排座舱正视' },
  { slug: 'su7-2024-pro', pageUrl: AUTOHOME(67500, 6962), index: 1, note: '前排座舱正视' },
  { slug: 'su7-2024-max', pageUrl: AUTOHOME(65768, 6962), index: 1, note: '前排座舱正视' },
  { slug: 'su7-2026-standard', pageUrl: AUTOHOME(76173, 6962), index: 1, note: '前排座舱正视' },
  { slug: 'su7-2026-pro', pageUrl: AUTOHOME(75667, 6962), index: 1, note: '前排座舱正视' },
  { slug: 'su7-2026-max', pageUrl: AUTOHOME(75668, 6962), index: 1, note: '前排座舱正视' },
  { slug: 'su7-ultra-2025', pageUrl: AUTOHOME(70545, 7915), index: 1, note: '前排座舱正视' },
  { slug: 'su7-ultra-2025-track', pageUrl: AUTOHOME(70545, 7915), index: 1, note: '前排座舱正视（与 Ultra 基础版内饰一致）' },
  { slug: 'su7-ultra-2025-nurburgring', pageUrl: AUTOHOME(70554, 7915, 53), index: 6, note: '碳纤维赛车桶椅与防滚架座舱视角' },
  { slug: 'yu7-2025-long-range', pageUrl: AUTOHOME(71396, 7793), index: 1, note: '前排座舱正视' },
  { slug: 'yu7-2025-pro', pageUrl: AUTOHOME(71839, 7793), index: 1, note: '前排座舱正视' },
  { slug: 'yu7-2025-max', pageUrl: AUTOHOME(68936, 7793), index: 1, note: '前排座舱正视' },
  { slug: 'yu7-2026-standard', pageUrl: AUTOHOME(77835, 7793), index: 1, note: '前排座舱正视' },
  { slug: 'yu7-2026-gt', pageUrl: AUTOHOME(76544, 7793), index: 1, note: '前排座舱正视' },
  { slug: 'n70-2026-pro', pageUrl: AUTOHOME(78516, 8731), index: 1, note: '前排座舱正视' },
  { slug: 'n70-2026-max', pageUrl: AUTOHOME(78517, 8731), index: 1, note: '前排座舱正视' },
  { slug: 'n90-2026-max-7', pageUrl: AUTOHOME(78513, 8326), index: 1, note: '前排座舱正视' },
  {
    slug: 'n90-2026-max-explorer',
    pageUrl: 'https://www.xiaomiev.com/skynomad/n90maxstudio',
    imageUrl: 'https://s1.xiaomiev.com/activity-outer-assets/0328/images/n1/pc/12.jpg',
    note: '官方升顶座舱与一键成床空间',
  },
];

const REAR_PICKS = [
  { slug: 'su7-2024-standard', pageUrl: AUTOHOME(59881, 6962, 3), index: 9, note: '后排座椅视角' },
  { slug: 'su7-2024-pro', pageUrl: AUTOHOME(67500, 6962, 3), index: 6, note: '后排座椅视角' },
  { slug: 'su7-2024-max', pageUrl: AUTOHOME(65768, 6962, 3), index: 15, note: '后排座椅视角' },
  { slug: 'su7-2026-standard', pageUrl: AUTOHOME(76173, 6962, 3), index: 18, note: '后排座椅视角' },
  { slug: 'su7-2026-pro', pageUrl: AUTOHOME(75667, 6962, 3), index: 19, note: '后排座椅视角' },
  { slug: 'su7-2026-max', pageUrl: AUTOHOME(75668, 6962, 3), index: 18, note: '后排座椅视角' },
  { slug: 'su7-ultra-2025', pageUrl: 'https://new.qq.com/rain/a/20250214A00E0G00', imageUrl: 'https://inews.gtimg.com/om_bt/OE4BEsgW3fbSp82Pk4Q8II5_pqLfGUR0B-3Caf8Hfs2Q8AA/1000', source: 'qq-news-pcauto', note: '太平洋汽车到店实拍：Ultra 专属后排座椅' },
  { slug: 'su7-ultra-2025-track', pageUrl: 'https://new.qq.com/rain/a/20250214A00E0G00', imageUrl: 'https://inews.gtimg.com/om_bt/OE4BEsgW3fbSp82Pk4Q8II5_pqLfGUR0B-3Caf8Hfs2Q8AA/1000', source: 'qq-news-pcauto', note: '太平洋汽车到店实拍：Ultra 专属后排座椅' },
  { slug: 'su7-ultra-2025-nurburgring', pageUrl: AUTOHOME(70554, 7915, 53), index: 8, note: '防滚架与拆除后排的座舱视角' },
  { slug: 'yu7-2025-long-range', pageUrl: AUTOHOME(71396, 7793, 3), index: 17, note: '后排座椅视角' },
  { slug: 'yu7-2025-pro', pageUrl: AUTOHOME(71839, 7793, 3), index: 18, note: '后排座椅视角' },
  { slug: 'yu7-2025-max', pageUrl: AUTOHOME(68936, 7793, 3), index: 22, note: '后排座椅视角' },
  { slug: 'yu7-2026-standard', pageUrl: AUTOHOME(77835, 7793, 3), index: 17, note: '后排座椅视角' },
  { slug: 'yu7-2026-gt', pageUrl: AUTOHOME(76544, 7793, 3), index: 19, note: '后排座椅视角' },
  { slug: 'n70-2026-pro', pageUrl: AUTOHOME(78516, 8731, 3), index: 17, note: '后排座椅视角' },
  { slug: 'n70-2026-max', pageUrl: AUTOHOME(78517, 8731, 3), index: 9, note: '后排座椅视角' },
  { slug: 'n90-2026-max-7', pageUrl: AUTOHOME(78513, 8326, 3), index: 1, note: '从驾驶席向后的全座舱视角' },
  {
    slug: 'n90-2026-max-explorer',
    pageUrl: 'https://www.xiaomiev.com/skynomad/n90maxstudio',
    imageUrl: 'https://s1.xiaomiev.com/activity-outer-assets/0328/images/n1/pc/19.jpg',
    note: '升顶后的一键成床与后排休憩视角',
  },
];

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

const manifest = [];
const ALL_PICKS = [
  ...FRONT_PICKS.map((pick) => ({ ...pick, view: 'front' })),
  ...REAR_PICKS.map((pick) => ({ ...pick, view: 'rear' })),
];
for (const pick of ALL_PICKS) {
  let imageUrl = pick.imageUrl;
  if (!imageUrl) {
    const pageRes = await fetch(pick.pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!pageRes.ok) throw new Error(`${pick.slug}: 图库页下载失败 ${pageRes.status}`);
    const html = await pageRes.text();
    const urls = [...new Set([...html.matchAll(/data-webp="([^"]+)"/g)].map((m) => m[1]))];
    const raw = urls[pick.index - 1];
    if (!raw) throw new Error(`${pick.slug}: 找不到第 ${pick.index} 张图`);
    imageUrl = 'https:' + raw.replace('/480x360_0_q95_c42_', '/0x0_0_q95_c42_');
  }

  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0', Referer: pick.pageUrl },
  });
  if (!res.ok) throw new Error(`${pick.slug}: 图片下载失败 ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const suffix = pick.view === 'front' ? '' : '-rear';
  const outFile = path.join(OUT, `${pick.slug}${suffix}.webp`);
  const info = await sharp(input)
    .resize(1600, 1000, { fit: 'cover', position: 'centre' })
    .webp({ quality: 84, effort: 4 })
    .toFile(outFile);
  const bytes = fs.statSync(outFile).size;
  manifest.push({
    slug: pick.slug,
    view: pick.view,
    source: pick.source ?? (pick.imageUrl ? 'official-xiaomiev' : 'autohome'),
    pageUrl: pick.pageUrl,
    imageUrl,
    note: pick.note,
    width: info.width,
    height: info.height,
    bytes,
  });
  console.log(`${(pick.slug + ' ' + pick.view).padEnd(38)} ${info.width}x${info.height} ${String(Math.round(bytes / 1024)).padStart(4)}KB  ${pick.note}`);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`\n共生成 ${manifest.length} 张内饰主图，总大小 ${Math.round(manifest.reduce((sum, item) => sum + item.bytes, 0) / 1024)}KB`);
