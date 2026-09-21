/**
 * check-cars.mjs — 汽车数据一致性校验（阶段一核心保障）
 *
 * 校验内容：
 *   1. 结构：必填字段、slug 唯一且为 kebab-case、上市日期格式
 *   2. 来源：每条记录必须带 sources（名称/链接/取数日期/可信度）
 *   3. 数值：各项指标的量纲与合理区间
 *   4. 跨字段逻辑：双电机功率必须大于同代单电机；车身尺寸自洽
 *   5. 完整性统计：列出为空的待补字段
 *
 * 用法: npm run data:check
 */
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = 'tmp/cars.bundle.mjs';
mkdirSync('tmp', { recursive: true });
await build({
  entryPoints: ['src/data/cars.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: OUT,
  logLevel: 'silent',
});

const { cars, SERIES_META } = await import(pathToFileURL(OUT).href);

const errors = [];
const warnings = [];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const RANGES = {
  priceWan: [5, 200],
  rangeKm: [100, 1500],
  rangeTotalKm: [200, 3000],
  fuelConsumptionL100: [3, 20],
  fuelTankL: [20, 150],
  batteryKwh: [10, 250],
  voltageV: [200, 1500],
  powerKw: [30, 2000],
  torqueNm: [50, 2000],
  zeroTo100: [1, 20],
  topSpeedKmh: [100, 400],
  lengthMm: [3000, 6000],
  widthMm: [1200, 2500],
  heightMm: [800, 2500],
  wheelbaseMm: [1800, 4000],
  curbWeightKg: [500, 4000],
  consumptionKwh100: [5, 40],
  fastChargeMin: [3, 120],
};

const seenSlugs = new Set();
const missing = new Map();

for (const car of cars) {
  const where = car.slug || '(no slug)';

  if (!car.slug || !KEBAB.test(car.slug)) errors.push(`${where}: slug 必须为 kebab-case`);
  if (seenSlugs.has(car.slug)) errors.push(`${where}: slug 重复`);
  seenSlugs.add(car.slug);

  for (const field of ['name', 'shortName', 'model', 'series', 'generationId', 'generationLabel', 'bodyType', 'powertrain']) {
    if (!car[field]) errors.push(`${where}: 缺少必填字段 ${field}`);
  }
  if (!DATE.test(car.release)) errors.push(`${where}: release 必须为 YYYY-MM-DD`);
  if (!Array.isArray(car.sources) || car.sources.length === 0) {
    errors.push(`${where}: 缺少 sources 来源信息`);
  } else {
    for (const s of car.sources) {
      if (!s.name || !s.url || !DATE.test(s.asOf) || !['A', 'B', 'C'].includes(s.confidence)) {
        errors.push(`${where}: source 信息不完整 -> ${JSON.stringify(s)}`);
      }
    }
  }
  if (!car.image) errors.push(`${where}: 缺少 image 状态`);

  // 数值区间校验
  for (const [key, [min, max]] of Object.entries(RANGES)) {
    const v = car.metrics?.[key];
    if (v === null || v === undefined) {
      missing.set(key, (missing.get(key) ?? 0) + 1);
      continue;
    }
    if (typeof v !== 'number' || Number.isNaN(v)) errors.push(`${where}: metrics.${key} 必须为数字或 null`);
    else if (v < min || v > max) errors.push(`${where}: metrics.${key}=${v} 超出合理区间 [${min}, ${max}]`);
  }

  const chargeRange = car.metrics?.fastChargeRange;
  if (!/^\d+-\d+$/.test(chargeRange ?? '')) {
    errors.push(`${where}: metrics.fastChargeRange 必须为类似 10-80 的区间`);
  } else if (car.specs?.charging && !car.specs.charging.startsWith(`${chargeRange}%`)) {
    warnings.push(`${where}: 快充区间 ${chargeRange}% 与 charging 描述“${car.specs.charging}”不一致`);
  }

  // 描述性字段完整性（仅警告）
  for (const [key, v] of Object.entries(car.specs ?? {})) {
    if (!v) missing.set(`specs.${key}`, (missing.get(`specs.${key}`) ?? 0) + 1);
  }
  for (const [key, v] of Object.entries(car.interior ?? {})) {
    if (!v) errors.push(`${where}: interior.${key} 不能为空`);
  }

  if (!car.highlights?.length) warnings.push(`${where}: highlights 为空`);

  // 收录口径提醒：与普通版参数一致的创始版/限量版不应单列（详见 cars.ts 收录口径）
  if (/创始版|限量版|首发版/.test(car.name + car.model)) {
    warnings.push(`${where}: 疑似限量/创始版本，按收录口径「与普通版参数一致则不单列」请确认`);
  }

  // 尺寸自洽：车长 > 车高、车长 > 车宽
  const m = car.metrics ?? {};
  if (m.lengthMm && m.heightMm && m.lengthMm <= m.heightMm) errors.push(`${where}: 车长应大于车高`);
  if (m.lengthMm && m.widthMm && m.lengthMm <= m.widthMm) errors.push(`${where}: 车长应大于车宽`);
  if (m.wheelbaseMm && m.lengthMm && m.wheelbaseMm >= m.lengthMm) errors.push(`${where}: 轴距应小于车长`);
  if (m.rangeTotalKm && m.rangeKm && m.rangeTotalKm <= m.rangeKm) errors.push(`${where}: 增程综合续航应大于纯电续航`);
  if (m.powertrain === '增程' && !m.rangeTotalKm) warnings.push(`${where}: 增程车型缺少综合续航`);
  if (m.rangeKm && m.batteryKwh) {
    const eff = m.rangeKm / m.batteryKwh;
    if (eff < 3 || eff > 15) warnings.push(`${where}: 续航/电池=${eff.toFixed(1)} km/kWh 明显偏离常规（请核对电池或续航口径）`);
  }
}

// 跨代/同代逻辑：双电机功率应大于单电机
const byGeneration = new Map();
for (const car of cars) {
  const list = byGeneration.get(car.generationId) ?? [];
  list.push(car);
  byGeneration.set(car.generationId, list);
}
for (const [gen, list] of byGeneration) {
  const single = list.filter((c) => (c.specs?.motorLayout ?? '').includes('单电机')).map((c) => c.metrics.powerKw ?? 0);
  const dual = list.filter((c) => (c.specs?.motorLayout ?? '').includes('双电机')).map((c) => c.metrics.powerKw ?? 0);
  if (single.length && dual.length && Math.max(...dual) <= Math.max(...single)) {
    errors.push(`${gen}: 双电机版本功率(${Math.max(...dual)}kW) 未大于单电机版本(${Math.max(...single)}kW)`);
  }
}

// 车系代际元数据一致性
for (const car of cars) {
  const meta = SERIES_META?.[car.series];
  if (!meta) warnings.push(`${car.slug}: 车系 ${car.series} 未在 SERIES_META 中登记`);
  else if (!meta.generations?.some((g) => g.id === car.generationId)) {
    errors.push(`${car.slug}: generationId ${car.generationId} 未在 SERIES_META 中登记`);
  }
}

console.log(`校验车型：${cars.length} 条`);
console.log(`车系：${[...new Set(cars.map((c) => c.series))].join(', ')}`);
console.log(`代际：${[...byGeneration.keys()].join(', ')}`);
if (missing.size) {
  console.log('\n待补字段（null / 空串统计）：');
  for (const [k, n] of [...missing.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  - ${k}: ${n}/${cars.length} 条为空`);
  }
}
if (warnings.length) {
  console.log('\n提醒：');
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (errors.length) {
  console.log('\n错误：');
  for (const e of errors) console.log(`  x ${e}`);
  console.error(`\n数据校验失败：${errors.length} 项错误`);
  process.exit(1);
}
console.log('\n数据校验通过 ✅');
