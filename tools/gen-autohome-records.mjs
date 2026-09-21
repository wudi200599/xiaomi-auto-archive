/**
 * gen-autohome-records.mjs — 由汽车之家参配 JSON 生成 cars.ts 记录（阶段三补数据用）
 * 用法: node tools/gen-autohome-records.mjs > tmp/new-records.ts
 */
import fs from 'node:fs';

const num = (v) => {
  if (v === undefined || v === null) return null;
  const n = parseFloat(String(v).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const round = (n, d = 1) => (n === null ? null : Number(n.toFixed(d)));
const val = (obj, k) => (obj[k] && obj[k] !== '-' ? obj[k] : '');

const CONFIG = {
  '7915': {
    file: 'data-raw/autohome-7915-onsale.json',
    series: 'SU7 Ultra',
    sourceUrl: 'https://www.autohome.com.cn/config/series/7915.html',
    bodyType: 'sedan',
    platform: '',
    specs: {
      '2025款 Ultra': {
        seats: 5,
        slug: 'su7-ultra-2025',
        name: '小米SU7 Ultra',
        shortName: 'SU7 Ultra',
        model: '小米SU7 Ultra 2025款 Ultra',
        generationId: 'su7-ultra-2025',
        generationLabel: '2025 款',
        aliases: ['SU7 Ultra', 'Ultra'],
        visual: { body: '#2B2F36', accent: '#C2A878', shape: 'sedan' },
        highlights: ['三电机 1138kW', '2.1s 破百', '93.7kWh 麒麟电池'],
      },
    },
  },
  '7793': {
    file: 'data-raw/autohome-7793-onsale.json',
    series: 'YU7',
    sourceUrl: 'https://www.autohome.com.cn/config/series/7793.html',
    bodyType: 'suv',
    platform: '',
    specs: {
      '2025款 后驱长续航版': {
        seats: 5,
        slug: 'yu7-2025-long-range',
        name: '小米YU7 长续航版',
        shortName: 'YU7 长续航版',
        model: '小米YU7 2025款 后驱长续航版',
        generationId: 'yu7-2025',
        generationLabel: '2025 款',
        aliases: ['长续航版', '后驱长续航版'],
        visual: { body: '#9FB6C9', accent: '#41566B', shape: 'suv' },
        highlights: ['CLTC 835km', '96.3kWh 电池'],
      },
      '2025款 四驱Pro版': {
        seats: 5,
        slug: 'yu7-2025-pro',
        name: '小米YU7 Pro版',
        shortName: 'YU7 Pro版',
        model: '小米YU7 2025款 四驱Pro版',
        generationId: 'yu7-2025',
        generationLabel: '2025 款',
        aliases: ['Pro版', '四驱Pro版'],
        visual: { body: '#6E7B8B', accent: '#2C3644', shape: 'suv' },
        highlights: ['四驱 365kW', 'CLTC 770km'],
      },
      '2025款 四驱Max版': {
        seats: 5,
        slug: 'yu7-2025-max',
        name: '小米YU7 Max版',
        shortName: 'YU7 Max版',
        model: '小米YU7 2025款 四驱Max版',
        generationId: 'yu7-2025',
        generationLabel: '2025 款',
        aliases: ['Max版', '四驱Max版'],
        visual: { body: '#3E4C5E', accent: '#1B2530', shape: 'suv' },
        highlights: ['四驱 508kW', '3.23s 破百', '101.7kWh 电池'],
      },
      '2026款 后驱标准版': {
        seats: 5,
        slug: 'yu7-2026-standard',
        name: '新一代 小米YU7 标准版',
        shortName: 'YU7 标准版',
        model: '小米YU7 2026款 后驱标准版',
        generationId: 'yu7-2026',
        generationLabel: '2026 款',
        aliases: ['标准版', '后驱标准版'],
        visual: { body: '#5B8DD9', accent: '#1F3A63', shape: 'suv' },
        highlights: ['23.35 万起', 'CLTC 643km', '73kWh 电池'],
      },
      '2026款 四驱GT': {
        seats: 5,
        slug: 'yu7-2026-gt',
        name: '新一代 小米YU7 GT',
        shortName: 'YU7 GT',
        model: '小米YU7 2026款 四驱GT',
        generationId: 'yu7-2026',
        generationLabel: '2026 款',
        aliases: ['GT', 'YU7 GT', '四驱GT'],
        visual: { body: '#B0453A', accent: '#5A1F19', shape: 'suv' },
        highlights: ['双电机 738kW', '2.92s 破百', '最高车速 300km/h'],
      },
    },
  },
  '8326': {
    file: 'data-raw/autohome-8326-onsale.json',
    series: 'N90',
    sourceUrl: 'https://www.autohome.com.cn/config/series/8326.html',
    bodyType: 'suv',
    platform: '昆仑平台',
    specs: {
      '2026款 Max 7座': {
        seats: 7,
        slug: 'n90-2026-max-7',
        name: '小米澎程N90 Max 7座',
        shortName: 'N90 Max 7座',
        model: '小米澎程N90 2026款 Max 7座',
        generationId: 'n90-2026',
        generationLabel: '2026 款',
        aliases: ['N90 Max', '7座'],
        visual: { body: '#4A90D9', accent: '#1B3B63', shape: 'suv' },
        highlights: ['增程综合续航 1705km', '纯电 464km', '双电机 310kW'],
      },
      '2026款 Max 探索版 5座': {
        seats: 5,
        slug: 'n90-2026-max-explorer',
        name: '小米澎程N90 Max 探索版 5座',
        shortName: 'N90 探索版',
        model: '小米澎程N90 2026款 Max 探索版 5座',
        generationId: 'n90-2026',
        generationLabel: '2026 款',
        aliases: ['探索版', '5座'],
        visual: { body: '#D9A94A', accent: '#6B4E14', shape: 'suv' },
        highlights: ['增程综合续航 1688km', '双电机 310kW'],
      },
    },
  },
  '8731': {
    file: 'data-raw/autohome-8731-onsale.json',
    series: 'N70',
    sourceUrl: 'https://www.autohome.com.cn/config/series/8731.html',
    bodyType: 'suv',
    platform: '昆仑平台',
    specs: {
      '2026款 Pro版': {
        seats: 5,
        slug: 'n70-2026-pro',
        name: '小米澎程N70 Pro版',
        shortName: 'N70 Pro版',
        model: '小米澎程N70 2026款 Pro版',
        generationId: 'n70-2026',
        generationLabel: '2026 款',
        aliases: ['Pro版'],
        visual: { body: '#3BAF8C', accent: '#1E5140', shape: 'suv' },
        highlights: ['增程综合续航 1351km', '纯电 351km'],
      },
      '2026款 Max版': {
        seats: 5,
        slug: 'n70-2026-max',
        name: '小米澎程N70 Max版',
        shortName: 'N70 Max版',
        model: '小米澎程N70 2026款 Max版',
        generationId: 'n70-2026',
        generationLabel: '2026 款',
        aliases: ['Max版'],
        visual: { body: '#2C7F66', accent: '#123A2D', shape: 'suv' },
        highlights: ['增程综合续航 1461km', '双电机 310kW'],
      },
    },
  },
};

const q = (s) => {
  if (s === null || s === undefined) return 'null';
  if (typeof s === 'number') return String(s);
  return `'${String(s).replace(/'/g, "\\'")}'`;
};
const out = [];

for (const [seriesId, cfg] of Object.entries(CONFIG)) {
  const data = JSON.parse(fs.readFileSync(cfg.file, 'utf8'));
  for (const spec of data.specs) {
    const meta = cfg.specs[spec.specname];
    if (!meta) { console.error('// 缺少映射:', seriesId, spec.specname); continue; }
    const v = spec.values;
    const [L, W, H] = (val(v, '长*宽*高(mm)') || '').split('*').map((x) => num(x));
    const chargeHours = num(val(v, '电池快充时间(小时)'));
    const chargeMinutes = num(val(v, '电池快充时间(分钟)'));
    const fastChargeMin = chargeMinutes ?? (chargeHours === null ? null : round(chargeHours * 60, 1));
    const isErev = val(v, '能源类型').includes('增程');
    const displacement = num(val(v, '排量(mL)'));
    const engine = isErev
      ? `${displacement ? (displacement / 1000).toFixed(1) + 'T' : ''}${val(v, '发动机型号') ? ' ' + val(v, '发动机型号') : ''}增程器`.trim()
      : '';
    const motorLayout = `${val(v, '电机布局')}${val(v, '驱动电机数')}`;
    const chargeRange = val(v, '电池快充电量范围(%)');

    out.push(`  {
    slug: ${q(meta.slug)},
    name: ${q(meta.name)},
    shortName: ${q(meta.shortName)},
    model: ${q(meta.model)},
    series: ${q(cfg.series)},
    generationId: ${q(meta.generationId)},
    generationLabel: ${q(meta.generationLabel)},
    bodyType: ${q(cfg.bodyType)},
    powertrain: ${q(isErev ? '增程' : '纯电')},
    release: ${q(val(v, '上市时间'))},
    aliases: [${meta.aliases.map((a) => q(a)).join(', ')}],
    metrics: {
      priceWan: ${q(num(val(v, '厂商指导价(元)')) ?? 0)},
      rangeKm: ${q(num(val(v, 'CLTC纯电续航里程(km)')))},
      rangeTotalKm: ${q(num(val(v, 'CLTC综合续航(km)')))},
      fuelConsumptionL100: ${q(num(val(v, '最低荷电状态油耗(L/100km)WLTC')))},
      fuelTankL: ${q(num(val(v, '油箱容积(L)')))},
      batteryKwh: ${q(num(val(v, '电池能量(kWh)')))},
      voltageV: ${q(num(val(v, '高压平台（V）')))},
      powerKw: ${q(num(val(v, '电动机总功率(kW)')))},
      torqueNm: ${q(num(val(v, '电动机总扭矩(N·m)')))},
      zeroTo100: ${q(num(val(v, '官方0-100km/h加速(s)')))},
      topSpeedKmh: ${q(num(val(v, '最高车速(km/h)')))},
      lengthMm: ${q(L)},
      widthMm: ${q(W)},
      heightMm: ${q(H)},
      wheelbaseMm: ${q(num(val(v, '轴距(mm)')))},
      curbWeightKg: ${q(num(val(v, '整备质量(kg)')))},
      consumptionKwh100: ${q(num(val(v, '百公里耗电量(kWh/100km)')))},
      fastChargeMin: ${q(fastChargeMin)},
      fastChargeRange: ${q(chargeRange)},

      seats: ${q(meta.seats ?? num(val(v, '座位数(个)')) ?? 5)},
    },
    specs: {
      level: ${q(val(v, '级别'))},
      platform: ${q(cfg.platform)},
      motorLayout: ${q(motorLayout)},
      motorType: ${q(val(v, '电机类型'))},
      engine: ${q(engine)},
      batteryType: '',
      charging: ${q(fastChargeMin ? `${chargeRange ? chargeRange + '%' : '快充'} 约 ${Math.round(fastChargeMin)} 分钟` : '')},
      adas: '',
      suspension: ${q(val(v, '空气悬架') === '●' ? '空气悬架' : '')},
      brakes: '',
    },
    sources: [
      { name: '汽车之家 · ${cfg.series} 参数配置', url: '${cfg.sourceUrl}', asOf: '2026-09-21', confidence: 'B' },
    ],
    visual: { body: '${meta.visual.body}', accent: '${meta.visual.accent}', shape: '${meta.visual.shape}' },
    image: { status: 'placeholder' },
    highlights: [${meta.highlights.map((h) => q(h)).join(', ')}],
    notes: ['参数取自汽车之家参配库（B 级），待与官方资料交叉核对'],
  },`);
  }
}

process.stdout.write(out.join('\n') + '\n');
console.error(`生成 ${out.length} 条记录`);
