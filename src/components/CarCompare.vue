<template>
  <div class="compare">
    <div class="compare-head card">
      <div>
        <h1 class="title">车型对比</h1>
        <p class="muted desc">最多选择 4 款车型，按「基本信息 / 三电 / 车身 / 智能与底盘」逐项对比。</p>
      </div>
      <div class="head-actions">
        <span class="mono count">{{ selected.length }}/4</span>
        <button class="btn ghost sm" type="button" :disabled="!selected.length" @click="clearAll">清空</button>
      </div>
    </div>

    <div class="picker card">
      <div class="picker-row">
        <input v-model="query" type="search" placeholder="搜索要加入的车型…" />
        <select v-model="series">
          <option value="">全部车系</option>
          <option v-for="s in seriesOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="chips">
        <button
          v-for="car in pickable"
          :key="car.slug"
          class="chip"
          :class="{ on: isSelected(car.slug) }"
          type="button"
          :disabled="!isSelected(car.slug) && selected.length >= 4"
          @click="toggle(car.slug)"
        >
          {{ car.name }}
        </button>
      </div>
    </div>

    <div v-if="selected.length" class="table-wrap card">
      <table class="cmp">
        <thead>
          <tr>
            <th class="row-label">项目</th>
            <th v-for="car in selected" :key="car.slug">
              <div class="th-inner">
                <CarImage :slug="car.slug" :name="car.name" :visual="car.visual" :image-map="imageMap" size="sm" />
                <div class="th-name">{{ car.name }}</div>
                <div class="th-model mono muted">{{ car.model }}</div>
                <a class="th-link" :href="`/cars/${car.slug}`">详情 →</a>
                <button class="rm" type="button" @click="toggle(car.slug)">移除</button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in groups" :key="group.name">
            <tr class="group-row">
              <th :colspan="selected.length + 1">{{ group.name }}</th>
            </tr>
            <tr v-for="row in group.rows" :key="row.label" :class="{ diff: row.diff !== false && isDiff(row) }">
              <th class="row-label">{{ row.label }}</th>
              <td v-for="car in selected" :key="car.slug" :class="{ strong: row.strong }">
                {{ row.get(car) }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p v-else class="empty muted">还没有选择车型，先在上方添加。</p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import CarImage from './CarImage.vue';

const props = defineProps({
  cars: { type: Array, required: true },
  imageMap: { type: Object, default: () => ({}) },
});

const STORAGE_KEY = 'car-compare';
const query = ref('');
const series = ref('');
const selectedSlugs = ref([]);

const bySlug = computed(() => new Map(props.cars.map((c) => [c.slug, c])));
const selected = computed(() => selectedSlugs.value.map((s) => bySlug.value.get(s)).filter(Boolean));
const seriesOptions = computed(() => [...new Set(props.cars.map((c) => c.series))]);

const pickable = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.cars.filter((c) => {
    if (series.value && c.series !== series.value) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      c.aliases.some((a) => a.toLowerCase().includes(q))
    );
  });
});

const fmt = (v, unit = '') => (v === null || v === undefined || v === '' ? '—' : `${v}${unit}`);

const groups = [
  {
    name: '基本信息',
    rows: [
      { label: '车系', get: (c) => c.series, diff: false },
      { label: '上市时间', get: (c) => c.release },
      { label: '厂商指导价', get: (c) => fmt(c.metrics.priceWan, ' 万元'), strong: true },
      { label: '级别', get: (c) => c.specs.level, diff: false },
      { label: '车身结构', get: (c) => (c.bodyType === 'sedan' ? '三厢轿车' : c.bodyType === 'suv' ? 'SUV' : 'MPV'), diff: false },
    ],
  },
  {
    name: '三电系统',
    rows: [
      { label: '纯电续航（CLTC）', get: (c) => fmt(c.metrics.rangeKm, ' km'), strong: true },
      { label: '综合续航（CLTC）', get: (c) => fmt(c.metrics.rangeTotalKm, ' km') },
      { label: '增程器', get: (c) => fmt(c.specs.engine), diff: false },
      { label: '馈电油耗', get: (c) => fmt(c.metrics.fuelConsumptionL100, ' L/100km') },
      { label: '油箱容积', get: (c) => fmt(c.metrics.fuelTankL, ' L') },
      { label: '电池容量', get: (c) => fmt(c.metrics.batteryKwh, ' kWh') },
      { label: '电池品牌 / 类型', get: (c) => fmt(c.specs.batteryType), diff: false },
      { label: '平台电压（峰值）', get: (c) => fmt(c.metrics.voltageV, ' V') },
      { label: '电机总功率', get: (c) => fmt(c.metrics.powerKw, ' kW') },
      { label: '电机总扭矩', get: (c) => fmt(c.metrics.torqueNm, ' N·m') },
      { label: '驱动形式', get: (c) => c.specs.motorLayout, diff: false },
      { label: '0-100km/h', get: (c) => fmt(c.metrics.zeroTo100, ' s'), strong: true },
      { label: '最高车速', get: (c) => fmt(c.metrics.topSpeedKmh, ' km/h') },
      { label: '快充时间', get: (c) => `${fmt(c.metrics.fastChargeMin)} 分钟（${c.metrics.fastChargeRange}%）` },
      { label: '百公里耗电', get: (c) => fmt(c.metrics.consumptionKwh100, ' kWh/100km') },
    ],
  },
  {
    name: '车身',
    rows: [
      { label: '长 / 宽 / 高', get: (c) => `${fmt(c.metrics.lengthMm)} / ${fmt(c.metrics.widthMm)} / ${fmt(c.metrics.heightMm)} mm`, diff: false },
      { label: '轴距', get: (c) => fmt(c.metrics.wheelbaseMm, ' mm'), diff: false },
      { label: '整备质量', get: (c) => fmt(c.metrics.curbWeightKg, ' kg') },
      { label: '座位数', get: (c) => fmt(c.metrics.seats, ' 座'), diff: false },
    ],
  },
  {
    name: '智能与底盘',
    rows: [
      { label: '辅助驾驶硬件', get: (c) => fmt(c.specs.adas), diff: false },
      { label: '平台 / 底盘', get: (c) => fmt(c.specs.platform), diff: false },
      { label: '悬架', get: (c) => fmt(c.specs.suspension), diff: false },
      { label: '制动', get: (c) => fmt(c.specs.brakes), diff: false },
    ],
  },
];

function isSelected(slug) {
  return selectedSlugs.value.includes(slug);
}
function toggle(slug) {
  if (isSelected(slug)) selectedSlugs.value = selectedSlugs.value.filter((s) => s !== slug);
  else if (selectedSlugs.value.length < 4) selectedSlugs.value = [...selectedSlugs.value, slug];
}
function clearAll() {
  selectedSlugs.value = [];
}
function isDiff(row) {
  const vals = selected.value.map((c) => row.get(c));
  return new Set(vals).size > 1;
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = (params.get('cars') || '').split(',').map((s) => s.trim()).filter(Boolean);
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {}
  const merged = [...new Set([...fromUrl, ...(Array.isArray(saved) ? saved : [])])]
    .filter((s) => bySlug.value.has(s))
    .slice(0, 4);
  selectedSlugs.value = merged;
});

watch(selectedSlugs, (v) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch {}
}, { deep: true });
</script>

<style scoped>
.compare-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-4);
  align-items: flex-start;
  padding: var(--sp-5);
  margin-bottom: var(--sp-4);
}
.title { margin: 0 0 6px; font-size: var(--fs-lg); }
.desc { margin: 0; font-size: var(--fs-sm); }
.head-actions { display: flex; align-items: center; gap: var(--sp-3); }
.count { font-size: var(--fs-sm); color: var(--paper-mute); }
.picker { padding: var(--sp-4); margin-bottom: var(--sp-4); }
.picker-row { display: flex; gap: var(--sp-3); margin-bottom: var(--sp-3); }
.picker-row input,
.picker-row select {
  height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  background: var(--ink-3);
  color: var(--paper);
}
.picker-row input { flex: 1 1 320px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; max-height: 168px; overflow: auto; }
.chip {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: var(--ink-3);
  color: var(--paper-dim);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.chip.on { border-color: var(--orange); color: var(--orange); background: rgba(var(--accent-rgb), 0.12); }
.chip:disabled { opacity: 0.45; cursor: not-allowed; }
.table-wrap { overflow-x: auto; }
.cmp { width: 100%; border-collapse: collapse; min-width: 680px; }
.cmp th, .cmp td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--line); font-size: var(--fs-sm); vertical-align: top; }
.cmp thead th { border-bottom: 1px solid var(--line-strong); }
.row-label { width: 168px; color: var(--paper-mute); font-weight: 500; white-space: nowrap; }
.group-row th { background: var(--ink-3); color: var(--orange); font-size: var(--fs-xs); letter-spacing: 0.08em; }
.cmp td.strong { color: var(--paper); font-weight: 600; }
.tr-inner { display: block; }
.th-inner { display: flex; flex-direction: column; gap: 4px; min-width: 180px; }
.th-name { font-weight: 600; font-size: var(--fs-sm); }
.th-model { font-size: var(--fs-xs); }
.th-link { color: var(--orange); font-size: var(--fs-xs); }
.rm {
  align-self: flex-start;
  margin-top: 2px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--paper-mute);
  font-size: var(--fs-xs);
  cursor: pointer;
}
.empty { padding: var(--sp-7) 0; text-align: center; }
.btn.sm { height: 34px; padding: 0 14px; font-size: var(--fs-sm); }
@media (max-width: 720px) {
  .compare-head { flex-direction: column; }
  .row-label { width: 110px; }
}
</style>
