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

## Deployment

The app is compatible with Vercel's zero-configuration Next.js deployment. It
uses Node.js 22 and npm 10, both pinned in `package.json`; install dependencies
with `npm ci` so deployments use the committed lockfile.

The application does not require environment variables. Its interactive map
loads the CARTO basemap style and tiles in the browser, so that third-party
service must be reachable by visitors for the basemap to render. The material
locations and routes remain bundled with the application.
