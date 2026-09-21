/**
 * build-car-images.mjs — 下载选定官图 → 统一处理 → 输出到 public/images/cars/
 *
 * 处理规格：裁切为 16:10（1600×1000）→ WebP（quality 82）
 * 选图策略：优先影棚/官方渲染图；同一车系的不同版本用不同颜色区分
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PICKS = {
  'su7-2024-standard': ['su7-2024-max', 3, '银色影棚（同代 Max 棚拍）'],
  'su7-2024-pro': ['su7-2024-max', 11, '橙色影棚'],
  'su7-2024-max': ['su7-2024-max', 15, '紫色影棚'],
  'su7-2026-standard': ['su7-2026-max', 1, '蓝色影棚'],
  'su7-2026-pro': ['su7-2026-max', 15, '银色影棚'],
  'su7-2026-max': ['su7-2026-max', 9, '红色影棚'],
  'su7-ultra-2025': ['su7-ultra-2025', 2, '青色影棚'],
  'su7-ultra-2025-track': ['su7-ultra-2025', 5, '黄色影棚'],
  'su7-ultra-2025-nurburgring': ['su7-ultra-2025-nurburgring', 1, '纽北涂装'],
  'yu7-2025-long-range': ['yu7-2025-max', 1, '绿色影棚'],
  'yu7-2025-pro': ['yu7-2025-max', 11, '银色影棚（3/4 视角）'],
  'yu7-2025-max': ['yu7-2025-max', 15, '橙色影棚'],
  'yu7-2026-gt': ['yu7-2026-gt', 5, '红色（官方场景图）'],
  'n90-2026-max-7': ['n90-2026-max-7', 7, '青色影棚（3/4 视角）'],
  'n70-2026-max': ['n70-2026-max', 3, '蓝色影棚（3/4 视角）'],
};

// 这两张采用小米官网直接发布的渲染图，不使用汽车之家图库。
const OFFICIAL_PICKS = {
  'yu7-2026-standard': {
    url: 'https://s1.xiaomiev.com/activity-outer-assets/0328/images/yu7_20260521/base_pc/9.11.jpg',
    note: '火山灰官方渲染图（标准版）',
  },
  'n90-2026-max-explorer': {
    url: 'https://s1.xiaomiev.com/activity-outer-assets/0328/images/n70_20260907/pc/n90maxstudio.jpg',
    note: '官方升顶帐篷渲染图（N90 Max Studio）',
    zoom: 1.6,
  },
  'n70-2026-pro': {
    url: 'https://s1.xiaomiev.com/activity-outer-assets/0328/images/n70_20260907/pc/7-5.jpg',
    note: '珍珠白官方渲染图',
    zoom: 1.25,
  },
};

const OUT = 'public/images/cars';
fs.mkdirSync(OUT, { recursive: true });

const manifest = [];
for (const slug of [...Object.keys(PICKS), ...Object.keys(OFFICIAL_PICKS)]) {
  let source;
  let idx = null;
  let note;
  let url;
  let referer = 'https://www.xiaomiev.com/';
  let zoom = 1;

  if (OFFICIAL_PICKS[slug]) {
    ({ url, note, zoom = 1 } = OFFICIAL_PICKS[slug]);
    source = 'official-xiaomiev';
  } else {
    const [srcFile, pickIndex, pickNote] = PICKS[slug];
    source = srcFile;
    idx = pickIndex;
    note = pickNote;
    const data = JSON.parse(fs.readFileSync(`data-raw/official-images/${srcFile}.json`, 'utf8'));
    url = data.images[idx - 1];
    referer = data.pageUrl;
    if (!url) {
      console.error(`${slug}: 源图不存在 (${srcFile} #${idx})`);
      continue;
    }
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Referer: referer },
  });
  if (!res.ok) {
    console.error(`${slug}: 下载失败 ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const outFile = path.join(OUT, `${slug}.webp`);
  let image = sharp(buf);
  if (zoom > 1) {
    const meta = await image.metadata();
    let cropHeight = meta.height;
    let cropWidth = cropHeight * 1.6;
    if (cropWidth > meta.width) {
      cropWidth = meta.width;
      cropHeight = cropWidth / 1.6;
    }
    cropWidth = Math.round(cropWidth / zoom);
    cropHeight = Math.round(cropWidth / 1.6);
    image = image.extract({
      left: Math.max(0, Math.round((meta.width - cropWidth) / 2)),
      top: Math.max(0, Math.round((meta.height - cropHeight) / 2)),
      width: cropWidth,
      height: cropHeight,
    });
  }
  const info = await image
    .resize(1600, 1000, { fit: 'cover', position: 'centre' })
    .webp({ quality: 82 })
    .toFile(outFile);
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  manifest.push({ slug, source, index: idx, note, url, width: info.width, height: info.height, kb });
  console.log(`${slug.padEnd(30)} ${info.width}x${info.height} ${String(kb).padStart(4)}KB  ${note}`);
}
fs.writeFileSync('data-raw/official-images/manifest.json', JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`\n共处理 ${manifest.length} 张，总大小 ${Math.round(manifest.reduce((s, m) => s + m.kb, 0))}KB`);
