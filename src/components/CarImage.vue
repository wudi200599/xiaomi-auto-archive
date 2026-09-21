<template>
  <div class="car-img-wrap" :class="size">
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="car-img"
      :loading="loading"
      decoding="async"
      @error="onError"
    />
    <CarVisual v-else :visual="visual" :name="name" :size="visualSize" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import CarVisual from './CarVisual.vue';

const props = defineProps({
  slug: { type: String, required: true },
  name: { type: String, default: '' },
  visual: { type: Object, required: true },
  imageMap: { type: Object, default: () => ({}) },
  size: { type: String, default: 'md' }, // sm | md | lg
  loading: { type: String, default: 'lazy' }, // lazy | eager
});

const failed = ref(false);

const src = computed(() => {
  if (failed.value) return null;
  const ext = props.imageMap?.[props.slug];
  if (!ext) return null;
  return `/images/cars/${props.slug}.${ext}`;
});

const visualSize = computed(() => props.size);

function onError() {
  failed.value = true;
}

watch(() => props.slug, () => {
  failed.value = false;
});
</script>

<style scoped>
.car-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.car-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--radius);
  object-fit: cover;
}
.car-img-wrap.lg .car-img {
  max-height: 420px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}
@media (max-width: 640px) {
  .car-img-wrap.lg .car-img { max-height: 240px; }
}
</style>
