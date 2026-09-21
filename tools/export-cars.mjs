/**
 * export-cars.mjs — 导出可直接审阅的数据表（CSV，UTF-8 BOM，Excel 可直接打开）
 *
 * 用法: npm run data:export   → 生成 data-cards/cars.csv
 */
import fs from 'node:fs';
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = 'tmp/cars.bundle.mjs';
mkdirSync('tmp', { recursive: true });
mkdirSync('data-cards', { recursive: true });
await build({
  entryPoints: ['src/data/cars.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: OUT,
  logLevel: 'silent',
});
const { cars } = await import(pathToFileURL(OUT).href);

const COLUMNS = [
  ['slug', (c) => c.slug],
  ['车型', (c) => c.name],
  ['来源车型名', (c) => c.model],
  ['代际', (c) => c.generationLabel],
  ['上市日期', (c) => c.release],
  ['指导价(万元)', (c) => c.metrics.priceWan],
  ['动力形式', (c) => c.powertrain],
  ['纯电续航(km)', (c) => c.metrics.rangeKm],
  ['综合续航(km)', (c) => c.metrics.rangeTotalKm],
  ['馈电油耗(L/100km)', (c) => c.metrics.fuelConsumptionL100],
  ['油箱(L)', (c) => c.metrics.fuelTankL],
  ['电池(kWh)', (c) => c.metrics.batteryKwh],
  ['平台电压(V)', (c) => c.metrics.voltageV],
  ['功率(kW)', (c) => c.metrics.powerKw],
  ['扭矩(N·m)', (c) => c.metrics.torqueNm],
  ['0-100(s)', (c) => c.metrics.zeroTo100],
  ['最高车速(km/h)', (c) => c.metrics.topSpeedKmh],
  ['长(mm)', (c) => c.metrics.lengthMm],
  ['宽(mm)', (c) => c.metrics.widthMm],
  ['高(mm)', (c) => c.metrics.heightMm],
  ['轴距(mm)', (c) => c.metrics.wheelbaseMm],
  ['整备质量(kg)', (c) => c.metrics.curbWeightKg],
  ['耗电(kWh/100km)', (c) => c.metrics.consumptionKwh100],
  ['快充区间(%)', (c) => c.metrics.fastChargeRange],
  ['快充时间(min)', (c) => c.metrics.fastChargeMin],
  ['座椅布局', (c) => c.interior.seatLayout],
  ['前排座椅', (c) => c.interior.frontSeats],
  ['后排座椅', (c) => c.interior.rearSeats],
  ['屏幕与交互', (c) => c.interior.displays],
  ['音响系统', (c) => c.interior.audio],
  ['空调与舒适', (c) => c.interior.comfort],
  ['座舱系统', (c) => c.interior.cockpit],
  ['驱动', (c) => c.specs.motorLayout],
  ['增程器', (c) => c.specs.engine],
  ['电池品牌/类型', (c) => c.specs.batteryType],
  ['辅助驾驶', (c) => c.specs.adas],
  ['来源', (c) => c.sources.map((s) => `${s.name}(${s.confidence}/${s.asOf})`).join(' + ')],
  ['待核对', (c) => (c.notes ?? []).join(' / ')],
];

const esc = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const lines = [COLUMNS.map(([h]) => h).join(',')];
for (const car of cars) lines.push(COLUMNS.map(([, get]) => esc(get(car))).join(','));

const csv = '\uFEFF' + lines.join('\r\n') + '\r\n';
const target = 'data-cards/cars.csv';
let written = false;
for (let i = 0; i < 5 && !written; i++) {
  try {
    fs.writeFileSync(target, csv, 'utf8');
    console.log(`已导出 ${cars.length} 条车款 → ${target}`);
    written = true;
  } catch (err) {
    if (i < 4) await new Promise((r) => setTimeout(r, 2000));
    else {
      const d = new Date();
      const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
      const alt = `data-cards/cars-${stamp}.csv`;
      fs.writeFileSync(alt, csv, 'utf8');
      console.log(`cars.csv 被占用（${err.code}），已另存为 ${alt}（该文件已被 git 忽略）`);
    }
  }
}
if (false) {
  // 文件被 Excel 等占用时，另存带时间戳的副本，避免导出失败
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  const alt = `data-cards/cars-${stamp}.csv`;
  fs.writeFileSync(alt, csv, 'utf8');
  console.log(`cars.csv 被占用（${err.code}），已另存为 ${alt}`);
}
