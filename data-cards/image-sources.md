# 车型图片源与处理方案（阶段 4）

调研日期：2026-09-21　|　状态：**已落地**（18 个版本各有独立图片）

## 一、来源选择

| 来源 | 覆盖范围 | 分辨率 | 风格 | 水印 | 结论 |
|---|---|---|---|---|---|
| **用户提供的本地素材** | 初代 SU7 标准版 / Pro / Max | 1400~3840 宽 | 影棚 | 文件名残留「汽车之家」字样 | ✅ 本次指定替换 |
| **汽车之家「官图」（按版本）** | 5 车系 18 版本全覆盖，含停售的初代 SU7 | 3840×2880 | 影棚/场景，单色车 | 车牌处偶有小号「汽车之家」 | ✅ **主源** |
| 小米官网 CDN 营销图 | 新车型有素材目录，初代 SU7 已下线 | 2560~3840 宽 | 场景图/官方渲染图 | 无 | ✅ YU7 标准版、N90 探索版、N70 Pro 采用 |
| 网上车市「官方图」 | SU7 / YU7 / SU7 Ultra | 1400×1050 | 展厅实拍、背景杂乱 | 「网上车市」车牌 | ❌ 不采用 |
| 工信部公告照片 | 全部车型 | 低 | 白底正/侧视图 | 无 | 备用兜底 |
| SVG 占位图 | 全部 | 矢量 | 极简侧视 | 无 | 兜底 |

按版本取图的路径：`https://car.autohome.com.cn/pic/series-s<specId>/<seriesId>-53.html`
（`-53` 为「官图」分类；页面懒加载，需渲染后取 `data-webp`，再规范化为原图）

小米官网 CDN 前缀：`https://s1.xiaomiev.com/activity-outer-assets/0328/`（目录见上轮调研记录）

## 二、处理规格（已按此执行）

- 画布 **1600×1000（16:10）**，`fit: cover` 居中裁切，车体居中
- 输出 **WebP，quality 82**，单张 ≤ 300 KB（当前 18 张合计 1.6 MB）
- 命名 `<slug>.webp`，页面按 slug 自动匹配，缺失回退 SVG

## 三、版本选图（同一车系用不同颜色区分版本）

| 版本 slug | 取图来源（spec） | 序号 | 颜色/说明 |
|---|---|---|---|
| su7-2024-standard | 本地 `standard.jpg` | — | 绿色影棚（兼作车系封面） |
| su7-2024-pro | 本地 `pro.jpg` | — | 蓝色影棚 |
| su7-2024-max | 本地 `max.jpg` | — | 青色影棚 |
| su7-2026-standard | su7-2026-max | 1 | 蓝色影棚 |
| su7-2026-pro | su7-2026-max | 15 | 银色影棚 |
| su7-2026-max | su7-2026-max | 9 | 红色影棚 |
| su7-ultra-2025 | su7-ultra-2025 | 2 | 青色影棚 |
| su7-ultra-2025-track | su7-ultra-2025 | 5 | 黄色影棚 |
| su7-ultra-2025-nurburgring | su7-ultra-2025-nurburgring | 1 | 纽北涂装 |
| yu7-2025-long-range | yu7-2025-max | 1 | 绿色影棚 |
| yu7-2025-pro | yu7-2025-max | 11 | 银色影棚（3/4 视角） |
| yu7-2025-max | yu7-2025-max | 15 | 橙色影棚 |
| yu7-2026-standard | 小米官网 YU7 标准版 `9.11.jpg` | — | 火山灰官方渲染图 |
| yu7-2026-gt | yu7-2026-gt | 5 | 红色（官方场景图） |
| n90-2026-max-7 | n90-2026-max-7 | 7 | 青色影棚（3/4 视角） |
| n90-2026-max-explorer | 小米官网 N90 Max Studio | — | 升顶帐篷官方渲染图 |
| n70-2026-pro | 小米官网 N70 `7-5.jpg` | — | 珍珠白官方渲染图 |
| n70-2026-max | n70-2026-max | 3 | 蓝色影棚（3/4 视角） |

初代 SU7 的本地原图位于 `data-raw/user-images/old-su7/`；其余图片的完整来源 URL 见 `data-raw/official-images/manifest.json`。

## 四、车系入口图

六车系入口使用以下图片，均对应标准版/基础版，不使用探索版：

| 车系 | 图片 | 来源 |
|---|---|---|
| SU7 | su7-2024-standard | 复用初代标准版成品图 |
| SU7 Ultra | su7-ultra-2025-track | 复用经典黄色赛道套装成品图 |
| 新一代 SU7 | su7-2026-standard | 复用新一代标准版成品图 |
| YU7 | yu7-2026-standard | 复用 YU7 标准版成品图 |
| 澎程 N70 | 普通版官方渲染图 | 小米官网 n70.jpg |
| 澎程 N90 | 普通版官方渲染图 | 小米官网 n90.png，不含升顶帐篷 |

## 五、复现步骤

```bash
npm run data:images:fetch   # 抓各版本官图清单 → data-raw/official-images/<slug>.json
npm run data:images         # 按 PICKS 下载 → 裁切 → WebP → public/images/cars/
npm run data:series:images  # 生成六车系入口图 → public/images/series/
```

`tools/build-car-images.mjs` 顶部的 `LOCAL_PICKS` / `PICKS` / `OFFICIAL_PICKS` 是选图表；改图后重跑即可，初代 SU7 会直接读取本地素材。


## 六、已知限制

1. **YU7 标准版、N90 Max 探索版与 N70 Pro 使用小米官网直接发布的渲染图**，分别突出火山灰、升顶帐篷和珍珠白车色；其余车型主要采用汽车之家「官图」。
2. **部分图带小号水印**（车牌位置），当前接受；如需彻底去水印需换源。
3. **风格不完全统一**：初代/新一代 SU7、N70/N90 以白/浅灰影棚为主；YU7 2025 款、SU7 Ultra 以深色影棚或赛道场景为主，这是厂商发布素材本身的差异。
4. 初代 SU7（2024）三张版本图采用用户指定本地素材；其中标准版图同时作为老 SU7 车系入口封面。
