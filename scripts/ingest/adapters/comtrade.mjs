import { COMTRADE_API, copperHsCodes } from "../config.mjs";

const timeout = (ms) => AbortSignal.timeout(ms);

export async function fetchComtradeCopper({ period = "2024" } = {}) {
  const records = [];
  for (const commodityCode of Object.keys(copperHsCodes)) {
    const params = new URLSearchParams({
      period, reporterCode: "all", flowCode: "X", partnerCode: "all", partner2Code: "0",
      customsCode: "C00", motCode: "0", cmdCode: commodityCode, maxRecords: "500", includeDesc: "true",
    });
    const response = await fetch(`${COMTRADE_API}?${params}`, { signal: timeout(15_000), headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`UN Comtrade responded ${response.status} for HS ${commodityCode}`);
    const payload = await response.json();
    for (const row of payload.data ?? []) {
      if (!row.reporterISO || !row.partnerISO || row.reporterISO === row.partnerISO || !row.primaryValue) continue;
      records.push({
        commodityCode,
        exporterIso3: row.reporterISO,
        importerIso3: row.partnerISO,
        year: Number(row.period),
        tradeValueUsd: Number(row.primaryValue),
        netWeightKg: row.netWgt == null ? null : Number(row.netWgt),
      });
    }
  }
  return records;
}

export function normalizeComtrade(records, countries) {
  const known = new Set(countries.map((country) => country.iso3));
  return records
    .filter((record) => known.has(record.exporterIso3) && known.has(record.importerIso3))
    .sort((a, b) => b.tradeValueUsd - a.tradeValueUsd)
    .slice(0, 20)
    .map((record, index) => ({
      id: `comtrade-${record.commodityCode}-${record.exporterIso3}-${record.importerIso3}-${index + 1}`,
      ...record,
      unit: record.netWeightKg == null ? null : "kg",
      source: { publisher: "UN Comtrade", dataset: "International Merchandise Trade Statistics", url: "https://comtradeplus.un.org/", retrievedAt: new Date().toISOString(), recordType: "live-api" },
    }));
}
