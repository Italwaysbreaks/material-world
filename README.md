# Material World

An interactive educational atlas that traces important physical materials from extraction through processing, manufacturing, and use.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The project uses Next.js, TypeScript, Tailwind CSS, MapLibre GL JS, and local typed commodity datasets. No API keys or backend services are required.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Generated commodity data

The browser never calls public commodity APIs. Source adapters under `scripts/ingest/` normalize public records into committed JSON files in `src/generated/`, which are imported by the atlas at build time.

```bash
npm run data:refresh # refresh every configured commodity output
npm run data:copper # refresh Copper only
```

The Copper pipeline attempts UN Comtrade first and automatically uses the checked-in snapshot when the service is unavailable, so local and Vercel builds never depend on a live API. USGS production context is normalized from the reviewed Mineral Commodity Summaries snapshot. Every record retains publisher, dataset, URL, retrieval mode, year, value, and unit metadata.

### Copper HS mappings

| HS6 | Material | Journey stage |
| --- | --- | --- |
| `260300` | Copper ores and concentrates | Smelting & Refining |
| `740311` | Refined copper cathodes and cathode sections | Manufacturing |
| `740811` | Refined copper wire, maximum cross-section over 6 mm | End Use |
| `741110` | Refined copper tubes and pipes | End Use |
| `740911` | Refined copper plate, sheet and strip, in coils, over 0.15 mm | End Use |

These mappings intentionally remain at explicit HS6 classifications. They are not silently broadened to alloyed products, other wire dimensions, or other semi-finished copper forms. The EIA and FAOSTAT adapter modules are placeholders for later commodity-specific work; they do not make network requests today.
