export const COMTRADE_API = "https://comtradeapi.un.org/public/v1/preview/C/A/HS";

// HS6 mappings are intentionally explicit. We do not combine ambiguous codes.
// 740311 covers unwrought refined copper cathodes/sections of cathodes; it does
// not represent every form of refined copper. Tubes and sheet/strip are split by
// alloy and dimensions in the HS nomenclature, so this first pass uses the
// unalloyed headline codes below and preserves their exact descriptions.
export const copperHsCodes = {
  "260300": { label: "Copper ores and concentrates", stageId: "refining", transformation: "Copper concentrate" },
  "740311": { label: "Refined copper cathodes and sections of cathodes", stageId: "manufacturing", transformation: "Copper cathodes" },
  "740811": { label: "Refined copper wire, maximum cross-section over 6 mm", stageId: "consumption", transformation: "Copper wire" },
  "741110": { label: "Refined copper tubes and pipes", stageId: "consumption", transformation: "Copper tubes" },
  "740911": { label: "Refined copper plate, sheet and strip, in coils, over 0.15 mm", stageId: "consumption", transformation: "Copper sheet and strip" },
};

export const countryCoordinates = {
  CHL: { name: "Chile", latitude: -30.0, longitude: -71.0, comtradeCode: 152 },
  PER: { name: "Peru", latitude: -9.2, longitude: -75.0, comtradeCode: 604 },
  COD: { name: "Democratic Republic of the Congo", latitude: -4.0, longitude: 23.7, comtradeCode: 180 },
  CHN: { name: "China", latitude: 35.9, longitude: 104.2, comtradeCode: 156 },
  DEU: { name: "Germany", latitude: 51.2, longitude: 10.4, comtradeCode: 276 },
  USA: { name: "United States", latitude: 39.8, longitude: -98.6, comtradeCode: 842 },
  JPN: { name: "Japan", latitude: 36.2, longitude: 138.3, comtradeCode: 392 },
  IND: { name: "India", latitude: 21.0, longitude: 78.0, comtradeCode: 356 },
};
