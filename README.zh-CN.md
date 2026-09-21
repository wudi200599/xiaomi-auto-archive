# 小米汽车档案馆

一个小米汽车车型与版本静态档案站，收录参数、上市时间、厂商指导价、三电系统、车身尺寸、内饰配置、图片图库和版本对比。

## 功能

- 覆盖 SU7、新一代 SU7、SU7 Ultra、YU7、N70、N90 共 18 个车型版本
- 车型库支持搜索、筛选、排序，以及最多 4 款车型对比
- 详情页包含基本信息、三电系统、车身、内饰与座舱、智能与底盘
- 独立车系页面，包含车系标语、车型梯度和专属入口
- 收录 SU7 Ultra 与 YU7 GT 的纽北赛道记录
- 明暗主题、响应式布局、本地车型图片和内饰图库

## 技术栈

- Astro 7
- Vue 3
- TypeScript
- Sharp 图片处理

## 环境要求

- Node.js >= 22.12.0
- npm 10+

## 开发

以后台模式启动 Astro 开发服务器：

```powershell
npx astro dev --background
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## 常用命令

```powershell
npm run build
npm run data:check
npm run data:export
npm run data:images
npm run data:series:images
npm run data:interiors
```

`data:check` 会校验全部车型数据、来源信息、数值范围和跨字段一致性。`data:export` 会生成人工核对表 `data-cards/cars.csv`。

## 页面

- `/` — 首页
- `/cars` — 车型库
- `/cars/[slug]` — 车型详情
- `/compare` — 车型对比
- `/series` — 车系总览
- `/series/[slug]` — 独立车系页
- `/timeline` — 上市时间轴

## 数据与素材

车型数据位于 `src/data/cars.ts`，内饰与补充参数位于 `src/data/car-enrichments.ts`。原始来源抓取和图片清单位于 `data-raw/`。

车型图片位于 `public/images/cars/`，车系横幅位于 `public/images/series/`，内饰图库位于 `public/images/interiors/`。

## 致谢

- 小米汽车官网及官方公开发布资料、车型图片（在适用范围内）
- 汽车之家等汽车媒体公开参配与图片资料
- 工信部等政府公开目录及行业公开信息

## 权利说明

本站为非官方、非商业的车型资料整理项目，与小米集团、小米汽车无隶属或授权关系。产品名称、商标及车型图片归各自权利人所有。
