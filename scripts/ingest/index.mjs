import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchComtradeCopper, normalizeComtrade } from "./adapters/comtrade.mjs";
import { normalizeUsgsProduction } from "./adapters/usgs.mjs";
import { countriesFor, hsMappings, normalizeSnapshotFlows } from "./lib/normalize.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const generatedDir = path.join(root, "src/generated");
const requested = process.argv.find((arg) => arg.startsWith("--commodity="))?.split("=")[1];

async function readJson(file) { return JSON.parse(await readFile(file, "utf8")); }
async function writeJson(file, value) { await writeFile(file, `${JSON.stringify(value, null, 2)}\n`); }

async function copper() {
  const snapshot = await readJson(path.join(here, "fixtures/copper.snapshot.json"));
  const countries = countriesFor(snapshot.tradeFlows);
  let tradeFlows;
  let mode = "live-api";
  try {
    const live = await fetchComtradeCopper({ period: String(snapshot.tradeYear) });
    tradeFlows = normalizeComtrade(live, countries);
    if (!tradeFlows.length) throw new Error("UN Comtrade returned no usable records");
  } catch (error) {
    mode = "fallback-snapshot";
    tradeFlows = normalizeSnapshotFlows(snapshot.tradeFlows, snapshot.sources.comtrade);
    console.warn(`[data:copper] ${error.message}; using checked fallback snapshot.`);
  }
  const output = {
    schemaVersion: 1, commodityId: "copper", generatedAt: mode === "live-api" ? new Date().toISOString() : snapshot.snapshotDate,
    mode, latestTradeYear: Math.max(...tradeFlows.map((record) => record.year)), latestProductionYear: snapshot.productionYear,
    hsMappings: hsMappings(), countries,
    production: normalizeUsgsProduction(snapshot.production, snapshot.sources.usgs), tradeFlows,
  };
  await writeJson(path.join(generatedDir, "copper.json"), output);
  console.log(`[data:copper] wrote ${tradeFlows.length} trade flows (${mode}).`);
}

async function supportingCommodity(id, source) {
  await writeJson(path.join(generatedDir, `${id}.json`), {
    schemaVersion: 1, commodityId: id, generatedAt: "2026-02-01T00:00:00.000Z", mode: "curated-fallback",
    note: "Adapter-ready placeholder; geography remains curated until the corresponding public-source adapter is activated.", source,
  });
}

await mkdir(generatedDir, { recursive: true });
if (!requested || requested === "copper") await copper();
if (!requested) {
  await supportingCommodity("lithium", { publisher: "U.S. Geological Survey", dataset: "Mineral Commodity Summaries — Lithium", url: "https://www.usgs.gov/centers/national-minerals-information-center/lithium-statistics-and-information" });
  await supportingCommodity("oil", { publisher: "U.S. Energy Information Administration", dataset: "Petroleum data (adapter planned)", url: "https://www.eia.gov/petroleum/" });
}
