# Xiaomi Auto Archive

A static archive of Xiaomi automobile models and trim levels, covering specifications, launch dates, manufacturer guide prices, powertrain data, interior details, image galleries, and version comparison.

## Features

- 18 model versions across SU7, new-generation SU7, SU7 Ultra, YU7, N70, and N90
- Model catalog with search, filtering, sorting, and up to four-car comparison
- Vehicle detail pages with basic specifications, three-electric systems, body dimensions, interior, cockpit, and chassis information
- Dedicated series pages with model timelines and typography
- Track-record entries for SU7 Ultra and YU7 GT
- Responsive dark/light theme
- Local product images, interior galleries, and downloadable data tables

## Stack

- Astro 7
- Vue 3
- TypeScript
- Sharp for image processing

## Requirements

- Node.js >= 22.12.0
- npm 10+

## Development

Start the Astro development server in background mode:

```powershell
npx astro dev --background
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## Commands

```powershell
npm run build
npm run data:check
npm run data:export
npm run data:images
npm run data:series:images
npm run data:interiors
```

`data:check` validates all model records, source metadata, numeric ranges, and cross-field consistency. `data:export` writes the review table to `data-cards/cars.csv`.

## Routes

- `/` — archive home
- `/cars` — model catalog
- `/cars/[slug]` — model detail
- `/compare` — model comparison
- `/series` — series overview
- `/series/[slug]` — dedicated series page
- `/timeline` — release timeline

## Data

Model data lives in `src/data/cars.ts`; interior and supplemental specifications live in `src/data/car-enrichments.ts`. Raw source captures and image manifests are stored under `data-raw/`.

Vehicle images are stored in `public/images/cars/`, series banners in `public/images/series/`, and interior galleries in `public/images/interiors/`.

## Acknowledgements

- Xiaomi Auto official website, public release materials, and vehicle imagery (within applicable scope)
- Public specifications and imagery from automotive media including Autohome
- Public catalogs and industry information from MIIT and other government sources

## Attribution

This is an unofficial, non-commercial vehicle archive. It is not affiliated with or authorized by Xiaomi Group or Xiaomi Auto. Product names, trademarks, and vehicle images belong to their respective rights holders.
