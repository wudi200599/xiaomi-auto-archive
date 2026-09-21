import type { CarInterior, CarSpecs, SourceRef } from './car-types';

/**
 * 内饰与座舱补充数据。
 *
 * 收录原则：
 * - 只记录官网或汽车之家参配能够确认的配置，不写内饰颜色；
 * - 同一车系不同版本存在配置差异时，使用“标配 / 选装 / 高配”明确边界；
 * - N90 探索版、SU7 Ultra 纽北限量版等特殊版本按实际座舱布局记录。
 */

const SRC_SU7: SourceRef = {
  name: '小米汽车官网 · SU7 座舱与配置',
  url: 'https://www.xiaomiev.com/su7',
  asOf: '2026-09-21',
  confidence: 'A',
};

const SRC_ULTRA: SourceRef = {
  name: '小米汽车官网 · SU7 Ultra 内饰与座舱',
  url: 'https://www.xiaomiev.com/ultra',
  asOf: '2026-09-21',
  confidence: 'A',
};

const SRC_YU7: SourceRef = {
  name: '小米汽车官网 · YU7 座舱与配置',
  url: 'https://www.xiaomiev.com/yu7',
  asOf: '2026-09-21',
  confidence: 'A',
};

const SRC_N70: SourceRef = {
  name: '小米汽车官网 · 澎程 N70',
  url: 'https://www.xiaomiev.com/skynomad/n70',
  asOf: '2026-09-21',
  confidence: 'A',
};

const SRC_N90: SourceRef = {
  name: '小米汽车官网 · 澎程 N90',
  url: 'https://www.xiaomiev.com/skynomad/n90',
  asOf: '2026-09-21',
  confidence: 'A',
};

const SRC_N90_STUDIO: SourceRef = {
  name: '小米汽车官网 · 澎程 N90 Max 探索版',
  url: 'https://www.xiaomiev.com/skynomad/n90maxstudio',
  asOf: '2026-09-21',
  confidence: 'A',
};

const SU7_2024_COMMON: CarInterior = {
  seatLayout: '5 座（2+3）',
  frontSeats: '运动风格座椅，主 / 副驾电动调节，前排加热与通风；Max 增加主驾记忆。',
  rearSeats: '后排 4/6 比例放倒，配中央扶手与空调出风口。',
  displays: '7.1″ 翻转仪表 + 16.1″ 3K 中控屏；Max 标配 56″ HUD。',
  audio: '标准版 10 扬声器；Pro / Max 25 扬声器，支持杜比全景声。',
  comfort: '双温区自动空调、热泵、PM2.5 过滤；主动式氛围灯与 4.4L 车载冰箱按版本或选装提供。',
  cockpit: 'Xiaomi HyperOS + 高通骁龙 8295 座舱芯片，支持全车语音控车。',
};

const SU7_2026_COMMON: CarInterior = {
  seatLayout: '5 座（2+3）',
  frontSeats: '主驾 18 向电动运动座椅 + 10 点式按摩；前排支持加热与通风。',
  rearSeats: '后排 4/6 比例放倒，配中央扶手与空调出风口。',
  displays: '7.1″ 翻转仪表 + 16.1″ 3K 中控屏；Max 标配 56″ HUD，标准 / Pro 可选装。',
  audio: '标准 / Pro 14 扬声器；Max 25 扬声器。',
  comfort: '三层环绕式氛围灯、双温区自动空调、热泵、空气净化；4.4L 车载冰箱为选装。',
  cockpit: 'Xiaomi HyperOS + 高通骁龙 8295 座舱芯片，支持超级小爱与多设备互联。',
};

const ULTRA_COMMON: CarInterior = {
  seatLayout: '5 座（2+3）',
  frontSeats: 'Alcantara® 豪华运动座椅，前排石墨烯加热与按摩，升级主动侧翼支撑。',
  rearSeats: '后排运动座椅，支持 4/6 比例放倒；后排配独立空调与冷暖冰箱。',
  displays: '7.1″ 仪表 + 16.1″ 3K 中控屏 + 56″ HUD，支持 CarPlay 与 HyperOS 互联。',
  audio: '25 扬声器音响系统，支持主动降噪与自研音频算法。',
  comfort: '四门隔音隔热玻璃、热泵空调、主动式氛围灯、前排双 50W 风冷无线充电。',
  cockpit: 'Xiaomi HyperOS + 高通骁龙 8295 座舱芯片，支持超级小爱与车家互联。',
};

const YU7_COMMON: CarInterior = {
  seatLayout: '5 座（2+3）',
  frontSeats: 'Nappa 真皮座椅；主 / 副驾零重力舒适座椅（配置区分版本），支持躺倒与 10 点式按摩。',
  rearSeats: '后排 135° 豪华电动座椅，支持 4/6 比例电动放倒。',
  displays: '1.1m 小米天际屏全景显示（三块 Mini LED）+ 16.1″ 3K 中控屏。',
  audio: '25 扬声器豪华音响系统，支持杜比全景声。',
  comfort: '热泵空调、后排独立空调、PM2.5 / 空气质量监测；4.6L 冷暖冰箱按版本提供。',
  cockpit: 'Xiaomi HyperOS + 第三代骁龙 8 移动平台（4nm），支持超级小爱。',
};

const YU7_GT: CarInterior = {
  ...YU7_COMMON,
  frontSeats: 'Alcantara® 豪华运动座椅，四座支持按摩；赛道红主题座舱。',
  displays: '1.1m 小米天际屏全景显示 + 16.1″ 3K 中控屏，中控界面提供 GT 专属主题。',
};

const N70_PRO: CarInterior = {
  seatLayout: '5 座（2+3）',
  frontSeats: '一排标配 16 点式按摩、通风与加热，可选旋转座椅或零重力座椅。',
  rearSeats: '二排电动调节，标配通风与加热，可前移扩展后备箱空间。',
  displays: '8.88″ 仪表 + 16.1″ 3K 中控屏 + 21.4″ 后排娱乐屏；20″ HUD 为选装。',
  audio: '14 扬声器高级音响，含 200mm 重低音单元与 2 个头枕扬声器。',
  comfort: '256 色漫反射氛围灯、热泵空调、8 个面部出风口 + 4 个脚部出风口、PM2.5 / CO₂ 监测；9L 冰箱为选装。',
  cockpit: 'Xiaomi HyperOS + 第三代骁龙 8 移动平台，支持超级小爱和 CarIoT 生态。',
};

const N70_MAX: CarInterior = {
  ...N70_PRO,
  frontSeats: '一排标配 16 点式按摩、通风与加热，可选旋转座椅或零重力座椅；Max 版配更高规格舒适配置。',
  audio: 'Max 版标配小米星弦豪华音响，25 扬声器、7.1.4 声学架构。',
};

const N90_MAX: CarInterior = {
  seatLayout: '7 座（2+2+3）',
  frontSeats: '前排支持 16 点式按摩、通风与加热，可选 180° 电动旋转或零重力座椅。',
  rearSeats: '二排独立零重力座椅，支持按摩、通风、加热和超长滑轨；第三排支持加热。',
  displays: '8.8″ 仪表 + 20″ HUD + 16.1″ 3K 中控屏 + 21.4″ 后排娱乐屏 + 6.88″ 可拆卸后排控制屏。',
  audio: '25 扬声器小米星弦豪华音响，7.1.4 声学架构，峰值功率 4890W。',
  comfort: '256 色 15 处漫反射氛围灯、热泵三分区空调、12 个面部 + 5 个脚部出风口；9L 压缩机冰箱选装。',
  cockpit: 'Xiaomi HyperOS + 高通 8650 座舱芯片，支持六屏联动、超级小爱和车外语音交互。',
};

const N90_STUDIO: CarInterior = {
  seatLayout: '5 座升顶旅居布局',
  frontSeats: '前排维持 N90 Max 舒适座椅配置，支持通风、加热与多向电动调节。',
  rearSeats: '二排沙发座椅采用绗缝设计，支持通风、加热与一键成床；原厂电动升顶舱内置双空调出风口。',
  displays: '8.8″ 仪表 + 20″ HUD + 16.1″ 3K 中控屏；后排配备 30″ 投影娱乐系统。',
  audio: '25 扬声器小米星弦豪华音响，7.1.4 声学架构。',
  comfort: '原厂电动升顶舱、地暖、木纹铝合金地板、压缩机冰箱、电动门与隐私帘。',
  cockpit: 'Xiaomi HyperOS + 高通 8650 座舱芯片，支持六屏联动、超级小爱和车外语音交互。',
};

export const CAR_INTERIORS: Record<string, CarInterior> = {
  'su7-ultra-2025-track': {
    ...ULTRA_COMMON,
    comfort: '四门隔音隔热玻璃、热泵空调、主动降噪与赛道化座舱；前排双 50W 无线充电。',
  },
  'su7-ultra-2025-nurburgring': {
    seatLayout: '2 座赛道化布局',
    frontSeats: 'SPARCO 碳纤维赛车桶椅 + 六点式安全带，无电动调节、通风与按摩。',
    rearSeats: '后排座椅拆除，换装半幅防滚架以减重。',
    displays: '延续 SU7 Ultra 的仪表、16.1″ 中控屏与 HyperOS 交互系统。',
    audio: '延续 SU7 Ultra 25 扬声器座舱音响系统。',
    comfort: '赛道化减重座舱，保留 Ultra 基础安全与互联配置。',
    cockpit: 'Xiaomi HyperOS + 高通骁龙 8295 座舱芯片。',
  },
  'su7-2024-standard': SU7_2024_COMMON,
  'su7-2024-pro': SU7_2024_COMMON,
  'su7-2024-max': SU7_2024_COMMON,
  'su7-2026-standard': SU7_2026_COMMON,
  'su7-2026-pro': SU7_2026_COMMON,
  'su7-2026-max': SU7_2026_COMMON,
  'yu7-2026-standard': YU7_COMMON,
  'yu7-2026-gt': YU7_GT,
  'yu7-2025-long-range': YU7_COMMON,
  'yu7-2025-pro': YU7_COMMON,
  'yu7-2025-max': YU7_COMMON,
  'su7-ultra-2025': ULTRA_COMMON,
  'n90-2026-max-7': N90_MAX,
  'n90-2026-max-explorer': N90_STUDIO,
  'n70-2026-pro': N70_PRO,
  'n70-2026-max': N70_MAX,
};

/** 补齐此前在详情页显示为空缺、且有官方或参配库依据的车型字段。 */
export const CAR_SPEC_FILLS: Record<string, Partial<CarSpecs>> = {
  'su7-ultra-2025-track': {
    platform: '小米昆仑技术架构',
    suspension: '倍适登 EVO R 绞牙减振器套装（赛道专业套装）',
    brakes: '碳陶瓷制动盘 + 前六后四活塞固定卡钳',
  },
  'su7-ultra-2025-nurburgring': {
    platform: '小米昆仑技术架构',
  },
  'su7-2024-standard': {
    platform: '小米摩德纳平台',
    suspension: '前双叉臂独立悬架 + 后五连杆独立悬架',
    brakes: '通风盘式制动器',
  },
  'su7-2024-pro': {
    platform: '小米摩德纳平台',
    suspension: '前双叉臂独立悬架 + 后五连杆独立悬架',
    brakes: '通风盘式制动器',
  },
  'su7-2024-max': {
    platform: '小米摩德纳平台',
    suspension: '前双叉臂独立悬架 + 后五连杆独立悬架 + 闭式双腔空气弹簧 + CDC 阻尼可变减振器',
    brakes: 'Brembo 前四活塞固定卡钳 + 通风盘式制动器',
  },
  'su7-2026-standard': {
    suspension: '前双叉臂独立悬架 + 后五连杆独立悬架',
    brakes: '前四活塞固定卡钳 + 通风盘式制动器',
  },
  'su7-2026-pro': {
    brakes: '前四活塞固定卡钳 + 通风盘式制动器',
  },
  'su7-2026-max': {
    brakes: 'Brembo 前四活塞固定卡钳 + 通风盘式制动器',
  },
  'yu7-2026-standard': {
    platform: '小米昆仑技术架构',
    suspension: '前双叉臂独立悬架 + 后五连杆独立悬架',
    brakes: '通风盘式制动器',
  },
  'yu7-2026-gt': {
    platform: '小米昆仑技术架构',
    brakes: 'Brembo 前四活塞固定卡钳 + 通风盘式制动器',
  },
  'yu7-2025-long-range': {
    platform: '小米昆仑技术架构',
    suspension: '前双叉臂独立悬架 + 后五连杆独立悬架',
    brakes: '通风盘式制动器',
  },
  'yu7-2025-pro': {
    platform: '小米昆仑技术架构',
    brakes: 'Brembo 前四活塞固定卡钳 + 通风盘式制动器',
  },
  'yu7-2025-max': {
    platform: '小米昆仑技术架构',
    brakes: 'Brembo 前四活塞固定卡钳 + 通风盘式制动器',
  },
  'su7-ultra-2025': {
    platform: '小米昆仑技术架构',
  },
  'n90-2026-max-7': {
    suspension: '前双叉臂 + 后多连杆独立悬架 + 空气弹簧 + 连续阻尼可变减振器',
    brakes: '博世 DPB 智能制动助力器 + 通风盘式制动器',
  },
  'n90-2026-max-explorer': {
    suspension: '前双叉臂 + 后多连杆独立悬架 + 空气弹簧 + 连续阻尼可变减振器',
    brakes: '博世 DPB 智能制动助力器 + 通风盘式制动器',
  },
  'n70-2026-pro': {
    suspension: '前双叉臂独立悬架 + 后多连杆独立悬架',
    brakes: '通风盘式制动器',
  },
  'n70-2026-max': {
    suspension: '前双叉臂独立悬架 + 后 H 臂多连杆独立悬架 + 5 挡空气悬架 + 连续阻尼可变减振器',
    brakes: '通风盘式制动器',
  },
};

export const CAR_SOURCE_ADDITIONS: Record<string, SourceRef[]> = {
  'su7-ultra-2025-track': [SRC_ULTRA],
  'su7-ultra-2025-nurburgring': [SRC_ULTRA],
  'su7-2026-standard': [SRC_SU7],
  'su7-2026-pro': [SRC_SU7],
  'su7-2026-max': [SRC_SU7],
  'yu7-2026-standard': [SRC_YU7],
  'yu7-2026-gt': [SRC_YU7],
  'yu7-2025-long-range': [SRC_YU7],
  'yu7-2025-pro': [SRC_YU7],
  'yu7-2025-max': [SRC_YU7],
  'su7-ultra-2025': [SRC_ULTRA],
  'n90-2026-max-7': [SRC_N90],
  'n90-2026-max-explorer': [SRC_N90, SRC_N90_STUDIO],
  'n70-2026-pro': [SRC_N70],
  'n70-2026-max': [SRC_N70],
};
