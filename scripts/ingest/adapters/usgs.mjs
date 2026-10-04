// USGS publishes Mineral Commodity Summaries as annual reports rather than a
// stable row-level JSON API. This adapter normalizes the reviewed local snapshot
// and is deliberately separated so a future machine-readable USGS endpoint can
// replace it without changing generated output consumers.
export function normalizeUsgsProduction(records, source) {
  return records.map((record) => ({
    ...record,
    unit: "thousand metric tonnes contained copper",
    source: { ...source, recordType: "published-table-snapshot" },
  }));
}
