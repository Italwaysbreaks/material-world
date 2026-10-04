import { countryCoordinates, copperHsCodes } from "../config.mjs";

export function countriesFor(records) {
  const codes = new Set(records.flatMap((record) => [record.exporterIso3, record.importerIso3]).filter(Boolean));
  return [...codes].sort().map((iso3) => ({ iso3, ...countryCoordinates[iso3] })).filter((country) => country.name);
}

export function normalizeSnapshotFlows(records, source) {
  return records.map((record, index) => ({
    id: `comtrade-${record.commodityCode}-${record.exporterIso3}-${record.importerIso3}-${index + 1}`,
    ...record,
    unit: record.netWeightKg == null ? null : "kg",
    source: { ...source },
  }));
}

export function hsMappings() {
  return Object.entries(copperHsCodes).map(([code, mapping]) => ({ code, ...mapping, classification: "HS 2022 (6-digit)" }));
}
