import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'public/images/series';
fs.mkdirSync(OUT, { recursive: true });

const PICKS = {
  su7: { file: 'public/images/cars/su7-2024-standard.webp', source: 'car:su7-2024-standard', note: '初代 SU7 标准版' },
  'su7-ultra': { file: 'public/images/cars/su7-ultra-2025-track.webp', source: 'car:su7-ultra-2025-track', note: 'SU7 Ultra 经典黄色' },
  'su7-new': { file: 'public/images/cars/su7-2026-standard.webp', source: 'car:su7-2026-standard', note: '新一代 SU7 标准版' },
  yu7: { file: 'public/images/cars/yu7-2026-standard.webp', source: 'car:yu7-2026-standard', note: 'YU7 标准版' },
  n70: {
    url: 'https://s1.xiaomiev.com/activity-outer-assets/0328/images/n70_20260907/pc/n70.jpg',
    source: 'official-xiaomiev',
    note: '澎程 N70 普通版官方渲染图',
    zoom: 1.45,
  },
  n90: {
    url: 'https://s1.xiaomiev.com/activity-outer-assets/0328/images/n70_20260907/pc/n90.png',
    source: 'official-xiaomiev',
    note: '澎程 N90 普通版官方渲染图',
    zoom: 1.55,
  },
};

const manifest = [];
for (const [slug, pick] of Object.entries(PICKS)) {
  let image;
  let pickUrl = pick.url ?? null;

  if (pick.file) {
    image = sharp(pick.file);
  } else {
    const res = await fetch(pick.url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.xiaomiev.com/' } });
    if (!res.ok) throw new Error(`${slug}: download failed ${res.status}`);
    image = sharp(Buffer.from(await res.arrayBuffer()));
  }

  if (pick.zoom) {
    const meta = await image.metadata();
    let cropHeight = meta.height;
    let cropWidth = cropHeight * 1.6;
    if (cropWidth > meta.width) {
      cropWidth = meta.width;
      cropHeight = cropWidth / 1.6;
    }
    cropWidth = Math.round(cropWidth / pick.zoom);
    cropHeight = Math.round(cropWidth / 1.6);
    image = image.extract({
      left: Math.round((meta.width - cropWidth) / 2),
      top: Math.round((meta.height - cropHeight) / 2),
      width: cropWidth,
      height: cropHeight,
    });
  }

  const outFile = path.join(OUT, `${slug}.webp`);
  const info = await image.resize(1600, 1000, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(outFile);
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  manifest.push({ slug, source: pick.source, url: pickUrl, note: pick.note, width: info.width, height: info.height, kb });
  console.log(`${slug.padEnd(12)} ${info.width}x${info.height} ${String(kb).padStart(4)}KB  ${pick.note}`);
}

fs.writeFileSync('data-raw/official-images/series-manifest.json', JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`\n共处理 ${manifest.length} 张，总大小 ${Math.round(manifest.reduce((sum, item) => sum + item.kb, 0))}KB`);
