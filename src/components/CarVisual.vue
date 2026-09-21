<template>
  <div class="car-visual" :class="size">
    <svg :viewBox="box" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="`${name} 示意图`">
      <defs>
        <linearGradient :id="bodyId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="visual.body" />
          <stop offset="100%" :stop-color="shade(visual.body, -18)" />
        </linearGradient>
        <linearGradient :id="glassId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0F2233" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#1E3A57" stop-opacity="0.78" />
        </linearGradient>
      </defs>

      <!-- 地面阴影 -->
      <ellipse cx="160" cy="158" rx="118" ry="10" fill="rgba(0,0,0,0.18)" />

      <!-- 车身 -->
      <path :d="bodyPath" :fill="`url(#${bodyId})`" :stroke="shade(visual.body, -30)" stroke-width="1.2" />
      <!-- 车窗 -->
      <path :d="glassPath" :fill="`url(#${glassId})`" />
      <!-- 腰线 -->
      <path :d="beltPath" :stroke="shade(visual.body, -28)" stroke-width="1.1" fill="none" opacity="0.65" />
      <!-- 灯 -->
      <path :d="headlightPath" :fill="visual.accent" opacity="0.95" />
      <path :d="taillightPath" :fill="visual.accent" opacity="0.75" />
      <!-- 轮毂 -->
      <g v-for="(cx, i) in wheelX" :key="i">
        <circle :cx="cx" :cy="wheelY" :r="wheelR" fill="#15181C" />
        <circle :cx="cx" :cy="wheelY" :r="wheelR * 0.52" fill="#8C949E" />
        <circle :cx="cx" :cy="wheelY" :r="wheelR * 0.2" fill="#4A5158" />
      </g>
      <!-- 门槛阴影 -->
      <rect x="70" y="131" width="180" height="6" rx="3" fill="rgba(0,0,0,0.22)" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, default: '' },
  visual: { type: Object, required: true },
  size: { type: String, default: 'md' },
});

const uid = Math.random().toString(36).slice(2, 8);
const bodyId = `car-body-${uid}`;
const glassId = `car-glass-${uid}`;

const box = '0 0 320 185';
const wheelY = 133;
const wheelR = 22;
const wheelX = computed(() => [96, 232]);

const shape = computed(() => props.visual?.shape ?? 'sedan');

const bodyPath = computed(() => {
  if (shape.value === 'suv') {
    return 'M28 128 L34 96 Q38 82 54 80 L92 78 L124 52 Q130 47 140 47 L216 49 Q226 50 232 58 L252 80 L282 86 Q296 89 297 102 L298 128 Q298 136 288 136 L36 136 Q28 136 28 128 Z';
  }
  if (shape.value === 'mpv') {
    return 'M26 128 L30 96 Q34 80 50 78 L96 76 L120 48 Q126 42 138 42 L222 46 Q232 47 238 56 L258 78 L284 84 Q297 88 298 102 L298 128 Q298 136 288 136 L34 136 Q26 136 26 128 Z';
  }
  return 'M26 128 L30 104 Q34 90 54 87 L96 84 L132 56 Q140 50 152 50 L214 54 Q226 55 234 64 L258 86 L282 91 Q296 94 297 106 L298 128 Q298 136 288 136 L34 136 Q26 136 26 128 Z';
});

const glassPath = computed(() => {
  if (shape.value === 'suv') return 'M96 76 L126 54 Q131 50 140 50 L214 52 Q222 53 226 60 L243 78 Z';
  if (shape.value === 'mpv') return 'M94 74 L121 50 Q126 45 137 45 L219 48 Q227 49 231 57 L249 76 Z';
  return 'M100 82 L134 58 Q141 53 151 53 L212 56 Q222 57 229 66 L250 84 Z';
});

const beltPath = computed(() => {
  if (shape.value === 'suv' || shape.value === 'mpv') return 'M30 96 L296 100';
  return 'M28 104 L297 108';
});

const headlightPath = 'M288 96 L298 99 L298 108 L286 106 Z';
const taillightPath = 'M30 100 L40 100 L40 108 L30 106 Z';

/** 颜色明暗调整 */
function shade(hex, percent) {
  const h = (hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const amt = Math.round(2.55 * percent);
  const r = clamp(((num >> 16) & 255) + amt);
  const g = clamp(((num >> 8) & 255) + amt);
  const b = clamp((num & 255) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
</script>

<style scoped>
.car-visual {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.car-visual svg {
  width: 100%;
  height: auto;
  max-height: 200px;
}
.car-visual.sm svg { max-height: 120px; }
.car-visual.lg svg { max-height: 300px; }
@media (max-width: 640px) {
  .car-visual.sm svg { max-height: 100px; }
  .car-visual.md svg { max-height: 150px; }
  .car-visual.lg svg { max-height: 200px; }
}
</style>
