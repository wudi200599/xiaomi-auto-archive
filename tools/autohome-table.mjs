/**
 * autohome-table.mjs — 把 tools/fetch-autohome-spec.mjs --json 导出的原始数据转成对照表。
 *
 * 用法: node tools/autohome-table.mjs <json...> [--all]
 *   --all  输出该车系所有参配项(很长)，默认只输出档案馆关心的核心字段。
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
const all = args.includes('--all');
const files = args.filter((a) => !a.startsWith('--'));

const CORE = [
  '车型名称', '厂商指导价(元)', '上市时间', '能源类型', '级别',
  'CLTC纯电续航里程(km)', 'CLTC综合续航(km)', '最低荷电状态油耗(L/100km)WLTC',
  '油箱容积(L)', '系统综合功率(kW)', '系统综合扭矩(N·m)', '发动机型号', '排量(mL)',
  '电池能量(kWh)', '电池类型', '电芯品牌', '快充功率(kW)', '电池快充时间(小时)', '电池快充时间(分钟)',
  '电池快充电量范围(%)', '电动机总功率(kW)', '电动机总扭矩(N·m)',
  '驱动电机数', '电机布局', '官方0-100km/h加速(s)', '最高车速(km/h)',
  '长*宽*高(mm)', '轴距(mm)', '整备质量(kg)', '风阻系数(Cd)',
  '前悬架类型', '后悬架类型', '前制动器类型', '后制动器类型',
  '激光雷达数量', '激光雷达品牌', '芯片总算力', '辅助驾驶芯片', '整车质保',
];

let rows = [];
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const spec of data.specs ?? []) {
    rows.push({ file, ...spec });
  }
}

if (!rows.length) {
  console.error('no specs parsed from', files.join(', '));
  process.exit(1);
}

const keys = all
  ? [...new Set(rows.flatMap((r) => Object.keys(r.values ?? {})))]
  : CORE;

const header = ['车型', ...keys];
console.log(`| ${header.join(' | ')} |`);
console.log(`| ${header.map(() => '---').join(' | ')} |`);
for (const row of rows) {
  const cells = [row.specname];
  for (const k of keys) {
    let v = row.values?.[k] ?? '';
    v = String(v).replace(/\|/g, '/').replace(/\n/g, ' ').trim();
    cells.push(v === '' || v === '-' ? '' : v);
  }
  console.log(`| ${cells.join(' | ')} |`);
}
