<template>
  <div class="explorer">
    <!-- 工具条 -->
    <div class="toolbar card">
      <div class="filters">
        <label class="field search">
          <span class="sr">搜索</span>
          <input v-model="query" type="search" placeholder="搜索车型 / 车系 / 版本，如 su7、n90、max…" />
        </label>
        <label class="field">
          <span class="sr">车系</span>
          <select v-model="series">
            <option value="">全部车系</option>
            <option v-for="s in seriesOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>
        <label class="field">
          <span class="sr">排序</span>
          <select v-model="sortBy">
            <option value="release-desc">上市时间 新→旧</option>
            <option value="release-asc">上市时间 旧→新</option>
            <option value="price-asc">指导价 低→高</option>
            <option value="price-desc">指导价 高→低</option>
            <option value="range-desc">续航 长→短</option>
            <option value="fast-desc">加速 快→慢</option>
          </select>
        </label>
        <button class="btn ghost" type="button" :disabled="!isFiltered" @click="reset">重置</button>
      </div>

      <div class="status">
        <span class="count mono">{{ filtered.length }} / {{ cars.length }} 款</span>
        <a class="btn primary sm" :href="withBase(compareHref)">对比已选（{{ compareList.length }}）</a>
      </div>
    </div>

    <!-- 列表 -->
    <div v-if="filtered.length" class="grid">
      <article v-for="car in filtered" :key="car.slug" class="card car-card lift">
        <div class="car-media">
          <CarImage :slug="car.slug" :name="car.name" :visual="car.visual" :image-map="imageMap" size="sm" loading="eager" />
        </div>

        <div class="car-body">
          <h3 class="car-name">{{ car.name }}</h3>
          <p class="car-model mono muted">{{ car.model }}</p>

          <dl class="car-specs">
            <div v-for="cell in specCells(car)" :key="cell.label">
              <dt>{{ cell.label }}</dt>
              <dd class="mono" :class="{ price: cell.price }">{{ cell.value }}</dd>
            </div>
          </dl>


          <div class="car-actions">
            <button
              class="btn sm"
              :class="inCompare(car.slug) ? 'active' : 'ghost'"
              type="button"
              :disabled="!inCompare(car.slug) && compareList.length >= 4"
              @click="toggleCompare(car.slug)"
            >
              {{ inCompare(car.slug) ? '已加入' : '加入对比' }}
            </button>
            <a class="btn ghost sm" :href="withBase(`/cars/${car.slug}`)">详情</a>
          </div>
        </div>
      </article>
    </div>

    <p v-else class="empty muted">没有符合条件的车型，试试调整筛选条件。</p>
  </div>
</template>

<script setup>
import { withBase } from '../utils/url';
import { computed, onMounted, ref, watch } from 'vue';
import CarImage from './CarImage.vue';

const props = defineProps({
  cars: { type: Array, required: true },
  imageMap: { type: Object, default: () => ({}) },
});

const STORAGE_KEY = 'car-compare';

const query = ref('');
const series = ref('');
const sortBy = ref('release-desc');
const compareList = ref([]);

const seriesOptions = computed(() => [...new Set(props.cars.map((c) => c.series))]);

const isFiltered = computed(() => !!(query.value || series.value || sortBy.value !== 'release-desc'));

const filtered = computed(() => {
  let list = [...props.cars];
  const q = query.value.trim();
  if (q) list = list.filter((car) => matchesSearch(car, q));
  if (series.value) list = list.filter((c) => c.series === series.value);

  const num = (v) => (v === null || v === undefined ? Number.POSITIVE_INFINITY : v);
  switch (sortBy.value) {
    case 'release-asc':
      list.sort((a, b) => (a.release < b.release ? -1 : 1));
      break;
    case 'price-asc':
      list.sort((a, b) => a.metrics.priceWan - b.metrics.priceWan);
      break;
    case 'price-desc':
      list.sort((a, b) => b.metrics.priceWan - a.metrics.priceWan);
      break;
    case 'range-desc':
      list.sort((a, b) => num(b.metrics.rangeKm) - num(a.metrics.rangeKm));
      break;
    case 'fast-desc':
      list.sort((a, b) => num(a.metrics.zeroTo100) - num(b.metrics.zeroTo100));
      break;
    default:
      list.sort((a, b) => (a.release < b.release ? 1 : -1));
  }
  return list;
});

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\-_/·•.,，。!?！？:：;；'"“”‘’()（）\[\]【】{}]+/g, '');
}

function searchTokens(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/([a-z])\s*[-_/·•.,，。]?\s*(\d+)/g, '$1$2')
    .split(/[\s\-_/·•.,，。!?！？:：;；'"“”‘’()（）\[\]【】{}]+/)
    .map(normalizeSearchText)
    .filter(Boolean);
}

function carSearchText(car) {
  return normalizeSearchText([
    car.name,
    car.shortName,
    car.model,
    car.slug,
    car.series,
    car.generationLabel,
    car.bodyType,
    car.powertrain,
    ...(car.aliases ?? []),
    car.specs.level,
    car.specs.motorLayout,
    car.specs.batteryType,
  ].join(' '));
}

function matchesSearch(car, rawQuery) {
  const normalizedQuery = normalizeSearchText(rawQuery);
  const haystack = carSearchText(car);
  if (haystack.includes(normalizedQuery)) return true;

  const tokens = searchTokens(rawQuery);
  return tokens.length > 1 && tokens.every((token) => haystack.includes(token));
}

const compareHref = computed(() =>
  compareList.value.length ? `/compare?cars=${compareList.value.join(',')}` : '/compare',
);

function inCompare(slug) {
  return compareList.value.includes(slug);
}
function toggleCompare(slug) {
  if (inCompare(slug)) compareList.value = compareList.value.filter((s) => s !== slug);
  else if (compareList.value.length < 4) compareList.value = [...compareList.value, slug];
}
function specCells(car) {
  const m = car.metrics;
  return [
    { label: '指导价', value: `${m.priceWan} 万`, price: true },
    { label: '上市时间', value: car.release },
    { label: '车型类型', value: car.specs.level || '—' },
    { label: '动力形式', value: car.powertrain },
  ];
}

function reset() {
  query.value = '';
  series.value = '';
  sortBy.value = 'release-desc';
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(saved)) compareList.value = saved.filter((s) => props.cars.some((c) => c.slug === s));
  } catch {}
});

watch(compareList, (v) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch {}
}, { deep: true });
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-4);
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-4);
  margin-bottom: var(--sp-5);
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  flex: 1 1 640px;
}
.field input,
.field select {
  height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  background: var(--ink-3);
  color: var(--paper);
  min-width: 150px;
}
.field.search input { min-width: 240px; }
.field input:focus,
.field select:focus { outline: 2px solid var(--orange); outline-offset: 1px; }
.status { display: flex; align-items: center; gap: var(--sp-3); flex: 0 0 auto; margin-left: auto; padding-right: 2px; }
.count { font-size: var(--fs-sm); color: var(--paper-mute); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--sp-4);
}
.car-card { overflow: hidden; display: flex; flex-direction: column; }
.car-media {
  position: relative;
  padding: var(--sp-4) var(--sp-4) 0;
  background: linear-gradient(180deg, var(--card-grad-a), var(--card-grad-b));
}
.car-body { padding: var(--sp-4); display: flex; flex-direction: column; gap: 10px; flex: 1; }
.car-name { margin: 0; font-size: var(--fs-md); font-weight: 700; }
.car-model { margin: 0; font-size: var(--fs-xs); }
.car-specs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin: 4px 0 0;
}
.car-specs dt { font-size: var(--fs-xs); color: var(--paper-mute); }
.car-specs dd { margin: 2px 0 0; font-size: var(--fs-sm); }
.price { color: var(--price); font-weight: 600; }
.car-actions { display: flex; gap: var(--sp-2); margin-top: auto; padding-top: var(--sp-3); }
.btn.sm { height: 34px; padding: 0 14px; font-size: var(--fs-sm); }
.btn.active { background: var(--orange); color: #fff; }
.empty { padding: var(--sp-7) 0; text-align: center; }
@media (max-width: 640px) {
  .field input, .field select { min-width: 100%; }
  .field { flex: 1 1 100%; }
  .grid { grid-template-columns: 1fr; }
  .car-specs { grid-template-columns: repeat(2, 1fr); }
}
</style>
