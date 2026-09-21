/**
 * 小米汽车档案馆 · 数据模型
 *
 * 设计要点：
 * 1. 采用「版本平铺」结构：一个版本 = 一条记录。
 *    slug 形如 su7-2024-standard，车系/代际通过 series + generation 分组。
 * 2. 可比较的数值（价格/续航/功率/尺寸…）统一放 metrics，全部为数字或 null，
 *    便于排序、对比表和自动校验；描述性内容放 specs。
 * 3. 每条记录必须带 sources（来源 + 抓取日期 + 可信度），保证可追溯。
 * 4. 口径规范见 data-cards/README.md：续航一律 CLTC(km)、价格为厂商指导价(万元)、
 *    时间为官方上市日期(YYYY-MM-DD)、尺寸为 mm（不含后视镜）、电压为峰值电压(V)。
 */

/** 车系（后续可扩展） */
export type CarSeries = 'SU7' | 'SU7 Ultra' | 'YU7' | 'N90' | 'N70';

export type BodyType = 'sedan' | 'suv' | 'mpv';
export type Powertrain = '纯电' | '增程';

/** 座舱内饰与舒适配置；不记录内饰颜色。 */
export type CarInterior = {
  /** 座椅布局 */
  seatLayout: string;
  /** 前排座椅与主要功能 */
  frontSeats: string;
  /** 后排座椅与主要功能 */
  rearSeats: string;
  /** 仪表、中控、HUD 等屏幕与交互 */
  displays: string;
  /** 音响系统 */
  audio: string;
  /** 空调、冰箱、氛围灯等舒适配置 */
  comfort: string;
  /** 座舱系统与芯片 */
  cockpit: string;
};

/** 数据可信度：A=官方来源，B=垂直媒体（汽车之家/懂车帝），C=待核对 */
export type Confidence = 'A' | 'B' | 'C';

export type SourceRef = {
  /** 来源名称 */
  name: string;
  /** 来源链接 */
  url: string;
  /** 取数日期 YYYY-MM-DD */
  asOf: string;
  /** 可信度 */
  confidence: Confidence;
};

/** 可比较的数值指标；未知一律用 null，不用 0 占位 */
export type CarMetrics = {
  /** 厂商指导价（万元） */
  priceWan: number;
  /** CLTC 纯电续航（km） */
  rangeKm: number | null;
  /** CLTC 综合续航（km，增程车型） */
  rangeTotalKm: number | null;
  /** 最低荷电状态油耗（L/100km，增程车型） */
  fuelConsumptionL100: number | null;
  /** 油箱容积（L，增程车型） */
  fuelTankL: number | null;
  /** 电池能量（kWh） */
  batteryKwh: number | null;
  /** 峰值电压（V） */
  voltageV: number | null;
  /** 电机总功率（kW） */
  powerKw: number | null;
  /** 电机总扭矩（N·m） */
  torqueNm: number | null;
  /** 官方 0-100km/h 加速（s） */
  zeroTo100: number | null;
  /** 最高车速（km/h） */
  topSpeedKmh: number | null;
  /** 车身长宽高（mm） */
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  /** 轴距（mm） */
  wheelbaseMm: number | null;
  /** 整备质量（kg） */
  curbWeightKg: number | null;
  /** 百公里耗电量（kWh/100km） */
  consumptionKwh100: number | null;
  /** 快充时间（分钟） */
  fastChargeMin: number | null;
  /** 快充对应的电量区间，如 10-80 / 20-80 */
  fastChargeRange: string;
  /** 座位数 */
  seats: number;
};

/** 描述性参配 */
export type CarSpecs = {
  /** 级别，如「中大型车」 */
  level: string;
  /** 平台/架构 */
  platform: string;
  /** 驱动形式文字描述，如「后置单电机」 */
  motorLayout: string;
  /** 电机类型，如「永磁/同步」 */
  motorType: string;
  /** 增程器（增程车型），如「1.5T M15DRE」；纯电留空 */
  engine: string;
  /** 电池类型/电芯（未知留空串） */
  batteryType: string;
  /** 充电描述，如「10-80% 19.8 分钟」 */
  charging: string;
  /** 辅助驾驶 */
  adas: string;
  /** 悬架（未知留空串） */
  suspension: string;
  /** 制动（未知留空串） */
  brakes: string;
  /** 空气动力学与外观套件（仅在有可靠资料时填写） */
  aerodynamics?: string;
  /** 差速器、扭矩分配等驱动控制配置（仅在有可靠资料时填写） */
  differential?: string;
};

/** 占位示意图配置（阶段二使用，后续接入真实图片后仍作为兜底） */
export type CarVisual = {
  /** 车身主色 */
  body: string;
  /** 点缀色 */
  accent: string;
  /** 车身形态 */
  shape: 'sedan' | 'suv' | 'mpv';
};

/** 赛道圈速记录 */
export type TrackRecord = {
  /** 赛道名称 */
  track: string;
  /** 圈速，如 7:04.957 */
  lapTime: string;
  /** 记录日期 YYYY-MM-DD */
  date: string;
  /** 创造记录的车款说明 */
  vehicle: string;
  /** 记录称号，如「纽北最速量产电动车」 */
  title?: string;
  /** 备注 */
  note?: string;
};

export type Car = {
  /** 唯一 id，kebab-case，如 su7-2026-pro */
  slug: string;
  /** 展示名，如「小米SU7 2026款 Pro版」 */
  name: string;
  /** 简短名，如「SU7 Pro版」 */
  shortName: string;
  /** 来源原文车型名（汽车之家/官方原文，用于追溯） */
  model: string;
  series: CarSeries;
  /** 代际标识，如 su7-2024 / su7-2026 */
  generationId: string;
  /** 代际展示名，如「2024款（初代）」 */
  generationLabel: string;
  bodyType: BodyType;
  powertrain: Powertrain;
  /** 官方上市日期 YYYY-MM-DD */
  release: string;
  /** 别名/官方称法，用于搜索匹配 */
  aliases: string[];
  metrics: CarMetrics;
  specs: CarSpecs;
  /** 内饰与座舱配置 */
  interior: CarInterior;
  sources: SourceRef[];
  /** 占位示意图配置 */
  visual: CarVisual;
  /** 图片状态：阶段一统一用占位图 */
  image: { status: 'placeholder' | 'ready'; note?: string };
  highlights: string[];
  /** 赛道圈速记录（如纽北） */
  records?: TrackRecord[];
  /** 待核对 / 口径冲突说明 */
  notes?: string[];
};

export type SeriesMeta = {
  color: string;
  desc: string;
  /** 车系下的代际顺序（新→旧） */
  generations: { id: string; label: string }[];
};

export const SERIES_META: Partial<Record<CarSeries, SeriesMeta>> = {
  'SU7 Ultra': {
    color: '#B0B0B0',
    desc: 'SU7 的高性能旗舰，独立车系：三电机、赛道取向。',
    generations: [{ id: 'su7-ultra-2025', label: '2025 款' }],
  },
  YU7: {
    color: '#767676',
    desc: '中大型纯电 SUV 车系，含 2025 款与 2026 款（GT 版本同属本车系）。',
    generations: [
      { id: 'yu7-2026', label: '2026 款' },
      { id: 'yu7-2025', label: '2025 款' },
    ],
  },
  N90: {
    color: '#929292',
    desc: '小米澎程旗舰增程 SUV 车系，七座布局。',
    generations: [{ id: 'n90-2026', label: '2026 款' }],
  },
  N70: {
    color: '#A2A2A2',
    desc: '小米澎程中大型增程 SUV 车系。',
    generations: [{ id: 'n70-2026', label: '2026 款' }],
  },
  SU7: {
    color: '#707070',
    desc: '小米汽车首款车型，中大型纯电轿车，2024 年初代、2026 年换代（不含 SU7 Ultra，其为独立车系）。',
    generations: [
      { id: 'su7-2026', label: '新一代（2026款）' },
      { id: 'su7-2024', label: '初代（2024款）' },
    ],
  },
};
