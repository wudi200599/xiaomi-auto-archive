import type { Car, CarSeries } from './car-types';

export type SeriesBrowserItem = {
  slug: string;
  label: string;
  series: CarSeries;
  generationId?: string;
  desc: string;
  slogan: string;
  color: string;
  image: string;
  imageAlt: string;
};

export const SERIES_BROWSER: SeriesBrowserItem[] = [
  {
    slug: 'su7',
    label: 'SU7',
    series: 'SU7',
    generationId: 'su7-2024',
    desc: '小米汽车首款车型，2024 年初代。',
    slogan: '好看、好开、舒适、安全',
    color: '#707070',
    image: '/images/series/su7.webp',
    imageAlt: '小米SU7 标准版',
  },
  {
    slug: 'su7-ultra',
    label: 'SU7 Ultra',
    series: 'SU7 Ultra',
    desc: 'SU7 的高性能旗舰，独立车系。',
    slogan: '自信驾驭强大',
    color: '#B0B0B0',
    image: '/images/series/su7-ultra.webp',
    imageAlt: '小米SU7 Ultra 基础版',
  },
  {
    slug: 'su7-2026',
    label: '新一代 SU7',
    series: 'SU7',
    generationId: 'su7-2026',
    desc: '2026 年换代车型，延续中大型纯电轿车定位。',
    slogan: '打造新一代驾驶者之车',
    color: '#969696',
    image: '/images/series/su7-new.webp',
    imageAlt: '新一代 小米SU7 标准版',
  },
  {
    slug: 'yu7',
    label: 'YU7',
    series: 'YU7',
    desc: '中大型纯电 SUV 车系。',
    slogan: '双肩扛着责任，内心仍有远方',
    color: '#767676',
    image: '/images/series/yu7.webp',
    imageAlt: '小米YU7 标准版',
  },
  {
    slug: 'n70',
    label: '澎程 N70',
    series: 'N70',
    desc: '小米澎程中大型增程 SUV 车系。',
    slogan: '把更多空间，留给车里的生活',
    color: '#A2A2A2',
    image: '/images/series/n70.webp',
    imageAlt: '小米澎程 N70 普通版',
  },
  {
    slug: 'n90',
    label: '澎程 N90',
    series: 'N90',
    desc: '小米澎程旗舰增程 SUV 车系。',
    slogan: '一车一世界，自在即澎程',
    color: '#929292',
    image: '/images/series/n90.webp',
    imageAlt: '小米澎程 N90 普通版',
  },
];

export function matchesSeriesBrowserItem(car: Car, item: SeriesBrowserItem): boolean {
  return car.series === item.series && (!item.generationId || car.generationId === item.generationId);
}

export function getSeriesSlug(car: Car): string {
  const match = SERIES_BROWSER.find((item) => matchesSeriesBrowserItem(car, item));
  return match?.slug ?? '';
}
