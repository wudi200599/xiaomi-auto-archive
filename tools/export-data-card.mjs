/**
 * export-data-card.mjs — 为每个车系生成人工核对用数据卡（Markdown）
 * 用法: node tools/export-data-card.mjs   → data-cards/<车系>.md
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

fs.mkdirSync('tmp', { recursive: true });
fs.mkdirSync('data-cards', { recursive: true });
await build({
  entryPoints: ['src/data/cars.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: 'tmp/cars.bundle.mjs',
  logLevel: 'silent',
});
const { cars, SERIES_META } = await import(pathToFileURL('tmp/cars.bundle.mjs').href);

const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const v = (x, unit = '') => (x === null || x === undefined || x === '' ? '—' : `${x}${unit}`);

const table = (list) => {
  const head = '| 版本 | 来源车型名 | 指导价 | 纯电续航 | 综合续航 | 电池 | 电压 | 功率 | 0-100 | 尺寸 | 轴距 | 整备质量 | 耗电 | 快充区间 | 快充时间 | 座位 |';
  const sep = '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|';
  const rows = list.map((c) => {
    const m = c.metrics;
    return `| ${c.name} | ${c.model} | ${m.priceWan} 万 | ${v(m.rangeKm, ' km')} | ${v(m.rangeTotalKm, ' km')} | ${v(m.batteryKwh, ' kWh')} | ${v(m.voltageV, ' V')} | ${v(m.powerKw, ' kW')} | ${v(m.zeroTo100, ' s')} | ${v(m.lengthMm)}/${v(m.widthMm)}/${v(m.heightMm)} mm | ${v(m.wheelbaseMm, ' mm')} | ${v(m.curbWeightKg, ' kg')} | ${v(m.consumptionKwh100, ' kWh/100km')} | ${v(m.fastChargeRange, '%')} | ${v(m.fastChargeMin, ' 分钟')} | ${v(m.seats, ' 座')} |`;
  });
  return [head, sep, ...rows].join('\n');
};

const batteryTable = (list) => {
  const head = '| 版本 | 动力形式 | 电池品牌 / 类型 | 增程器 | 馈电油耗 | 油箱 | 辅助驾驶 | 悬架 |';
  const sep = '|---|---|---|---|---|---|---|---|';
  const rows = list.map((c) => `| ${c.name} | ${c.powertrain} | ${v(c.specs.batteryType)} | ${v(c.specs.engine)} | ${v(c.metrics.fuelConsumptionL100, ' L/100km')} | ${v(c.metrics.fuelTankL, ' L')} | ${v(c.specs.adas)} | ${v(c.specs.suspension)} |`);
  return [head, sep, ...rows].join('\n');
};

for (const [series, meta] of Object.entries(SERIES_META)) {
  const list = cars.filter((c) => c.series === series);
  if (!list.length) continue;
  const generations = [...new Map(list.map((c) => [c.generationId, c.generationLabel])).entries()];

  const sources = new Map();
  for (const c of list) for (const s of c.sources) if (!sources.has(s.name)) sources.set(s.name, s);

  const noteList = [];
  const noteSeen = new Map();
  for (const c of list) for (const n of c.notes ?? []) {
    if (!noteSeen.has(n)) { noteSeen.set(n, []); noteList.push(n); }
    noteSeen.get(n).push(c.name);
  }

  const doc = `# 数据卡 · ${series}

> 生成时间：${today}　|　版本数：${list.length}　|　校验命令：\`npm run data:check\`
> 本卡片供人工核对用，原始抓取留档见 \`data-raw/\`。

## 一、车系概览

- **车系**：${series}
- **说明**：${meta?.desc ?? ''}
- **代际**：${generations.map(([, label]) => label).join(' / ')}
- **指导价区间**：${Math.min(...list.map((c) => c.metrics.priceWan))} ~ ${Math.max(...list.map((c) => c.metrics.priceWan))} 万元
- **收录口径**：
  - 续航一律取「标配轮毂」的官方 CLTC 值；选装轮毂造成的差异不单列
  - 创始版 / 限量版不单列（参数与普通版一致时）
  - 无法确定或口径冲突的电池品牌不标注

## 二、版本对照表

${table(list)}

## 三、动力与配置

${batteryTable(list)}

## 四、赛道记录

${list.some((c) => c.records?.length)
  ? list
      .filter((c) => c.records?.length)
      .map((c) => c.records.map((r) => `- **${r.lapTime}** · ${r.track} · ${r.vehicle} · ${r.date}${r.title ? ` · ${r.title}` : ''}${r.note ? `（${r.note}）` : ''}`).join('\n'))
      .join('\n')
  : '- 无'}

## 五、来源清单

| 来源 | 可信度 | 取数日期 | 链接 |
|---|---|---|---|
${[...sources.values()].map((s) => `| ${s.name} | ${s.confidence} | ${s.asOf} | ${s.url} |`).join('\n')}

可信度：**A** 官方 / **B** 垂直媒体参配库 / **C** 待核对。

## 六、备注与待核对

${noteList.length ? noteList.map((n) => `- ${n}（涉及：${[...new Set(noteSeen.get(n))].join('、')}）`).join('\n') : '- 暂无'}

## 七、命名对照

| slug | 展示名 | 来源原文 | 别名 |
|---|---|---|---|
${list.map((c) => `| \`${c.slug}\` | ${c.name} | ${c.model} | ${c.aliases.join(' / ')} |`).join('\n')}

## 八、图片状态

- 全部 ${list.length} 条为 \`placeholder\`（图片阶段统一处理）
`;

  const file = `data-cards/${series.replace(/\s+/g, '-')}.md`;
  fs.writeFileSync(file, doc, 'utf8');
  console.log(`已生成 ${file}（${list.length} 条）`);
}
