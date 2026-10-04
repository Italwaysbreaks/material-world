import copperGeneratedJson from "@/generated/copper.json";

export type SourceMetadata = { publisher: string; dataset: string; url: string; year: number; recordType: string };
export type EvidenceMetric = { label: string; value: number; unit: string; year: number; source: string };
export type Stage = {
  id: string; name: string; order: number; description: string;
  stageDescription: string; processSummary: string; keyTransformation: string;
  accent: string; icon: string; descriptor: string;
};
export type Location = {
  id: string; name: string; country: string; latitude: number; longitude: number; stageId: string;
  input: string; output: string; description: string; whyItMatters: string; nextStep: string;
  overview: string; processDetails: string; primaryInputs: string[]; secondaryInputs: string[];
  outputs: string[]; dependencies: string[]; downstreamUses: string[]; industriesServed: string[];
  whatHappensNext: string;
  sources: SourceMetadata[]; evidence: EvidenceMetric[];
};
export type Flow = { id: string; fromLocationId: string; toLocationId: string; stageId: string; material: string; description: string; valueUsd?: number; quantityKg?: number | null; year?: number; source?: SourceMetadata };
export type Commodity = { id: string; name: string; shortDescription: string; color: string; stages: Stage[]; locations: Location[]; flows: Flow[]; dataLabel?: string };

type GeneratedCopper = {
  latestTradeYear: number; latestProductionYear: number;
  hsMappings: { code: string; label: string; stageId: string; transformation: string }[];
  production: { iso3: string; year: number; value: number; unit: string; source: Omit<SourceMetadata, "year"> }[];
  tradeFlows: { id: string; commodityCode: string; exporterIso3: string; importerIso3: string; year: number; tradeValueUsd: number; netWeightKg: number | null; source: Omit<SourceMetadata, "year"> }[];
};
const copperGenerated = copperGeneratedJson as GeneratedCopper;

const stageVisuals = [
  { accent: "#d97845", icon: "◆", descriptor: "Origin" },
  { accent: "#d1a13b", icon: "✦", descriptor: "Separate" },
  { accent: "#4f8f89", icon: "◈", descriptor: "Purify" },
  { accent: "#5776a3", icon: "▰", descriptor: "Make" },
  { accent: "#745e8f", icon: "●", descriptor: "Put to work" },
];
const stage = (id: string, name: string, order: number, description: string, processSummary = description, keyTransformation = description): Stage => ({
  id, name, order, description, stageDescription: description, processSummary, keyTransformation, ...stageVisuals[order - 1],
});
type LocationEnrichment = Partial<Pick<Location, "overview" | "processDetails" | "primaryInputs" | "secondaryInputs" | "outputs" | "dependencies" | "downstreamUses" | "industriesServed" | "whatHappensNext">>;
const stageContext: Record<string, Pick<Location, "secondaryInputs" | "dependencies" | "industriesServed">> = {
  mining: { secondaryInputs: ["Water", "Explosives", "Diesel or electricity"], dependencies: ["Ore grade and geology", "Water and power", "Roads, rail and ports", "Heavy equipment and skilled labor"], industriesServed: ["Mineral processing", "Metals"] },
  extraction: { secondaryInputs: ["Water", "Energy", "Process chemicals"], dependencies: ["Resource geology", "Water and energy", "Transport infrastructure", "Operating expertise"], industriesServed: ["Chemical processing", "Energy and materials"] },
  concentration: { secondaryInputs: ["Water", "Flotation reagents", "Grinding media"], dependencies: ["Electricity", "Process water", "Industrial machinery", "Tailings management"], industriesServed: ["Smelting", "Refining"] },
  processing: { secondaryInputs: ["Heat", "Reagents", "Water"], dependencies: ["Reliable energy", "Chemical expertise", "Quality control", "Export logistics"], industriesServed: ["Battery materials", "Specialty chemicals"] },
  refining: { secondaryInputs: ["Electricity", "Oxygen", "Acids and fluxes"], dependencies: ["Stable power", "Environmental controls", "Port and rail logistics", "Metallurgical expertise"], industriesServed: ["Electrical equipment", "Construction", "Transport manufacturing"] },
  manufacturing: { secondaryInputs: ["Electricity", "Polymer insulation", "Steel housings", "Semiconductors"], dependencies: ["Industrial machinery", "Skilled labor", "Reliable logistics", "Component supply networks"], industriesServed: ["Construction", "Power grids", "Electronics", "Automotive", "Industrial machinery"] },
  consumption: { secondaryInputs: ["Engineering", "Installation labor", "Complementary materials"], dependencies: ["Investment in buildings and grids", "Manufacturing demand", "Collection and recycling systems"], industriesServed: ["Construction", "Power grids", "Consumer electronics", "EVs", "Telecommunications", "Renewable energy", "Data centers"] },
  products: { secondaryInputs: ["Engineering", "Complementary components"], dependencies: ["Manufacturing capacity", "Distribution networks", "End-market demand"], industriesServed: ["Transport", "Energy", "Consumer products"] },
  transport: { secondaryInputs: ["Storage capacity", "Fuel and power"], dependencies: ["Pipelines and ports", "Shipping capacity", "Safe operations"], industriesServed: ["Refining", "Petrochemicals"] },
};
const location = (id: string, name: string, country: string, latitude: number, longitude: number, stageId: string, input: string, output: string, description: string, whyItMatters: string, nextStep: string, enrichment: LocationEnrichment = {}): Location => ({
  id, name, country, latitude, longitude, stageId, input, output, description, whyItMatters, nextStep,
  overview: description, processDetails: description, primaryInputs: [input], outputs: [output], downstreamUses: [nextStep],
  whatHappensNext: nextStep, sources: [], evidence: [], ...(stageContext[stageId] ?? stageContext.products), ...enrichment,
});
const flow = (id: string, fromLocationId: string, toLocationId: string, stageId: string, material: string, description: string): Flow => ({ id, fromLocationId, toLocationId, stageId, material, description });

const copper: Commodity = {
  id: "copper", name: "Copper", color: "#b65f3a",
  shortDescription: "From mineral-rich rock to the conductive wiring inside cities, motors and electronics.",
  stages: [
    stage("mining", "Mining", 1, "Copper-bearing rock is removed from vast open-pit and underground deposits.", "Geologists map the orebody; drills, explosives and haul trucks move ore at immense scale.", "Copper-bearing rock → run-of-mine ore"),
    stage("concentration", "Concentration", 2, "Crushing, grinding and flotation separate copper minerals from waste rock.", "Ore is crushed, milled to a fine slurry, then mixed with reagents so copper minerals float and can be collected.", "Copper ore → 20–30% copper concentrate"),
    stage("refining", "Smelting & Refining", 3, "Heat and electrolysis transform concentrate into 99.99% pure cathodes.", "Smelting removes sulfur and iron to make blister copper; electrorefining deposits pure copper onto cathode sheets.", "Concentrate → blister copper → copper cathodes"),
    stage("manufacturing", "Manufacturing", 4, "Cathodes become rod, wire, tubing, sheet, motors and electronic components.", "Fabricators melt, cast, roll, draw and machine copper into shapes engineered for electrical and thermal performance.", "Copper cathodes → wire, components & assemblies"),
    stage("consumption", "End Use", 5, "Copper enters buildings, power grids, vehicles, machinery and everyday devices.", "Manufactured copper is installed across economies—not consumed at a single point—and remains recoverable for decades.", "Copper products → essential systems in use"),
  ],
  locations: [
    location("escondida", "Escondida Mine", "Chile", -24.27, -69.07, "mining", "Copper-bearing rock", "Copper ore", "Benches are drilled, blasted and hauled from one of the world's largest copper mines.", "Chile is the world's leading copper-mining nation, centered on exceptionally rich Andean geology.", "Ore is crushed and concentrated near the mine."),
    location("cerro-verde", "Cerro Verde", "Peru", -16.54, -71.60, "mining", "Copper-bearing rock", "Copper ore", "Large-scale open-pit mining exposes and removes low-grade copper ore.", "Peru is a major source of globally traded copper concentrates.", "Ore moves into local crushing and flotation circuits."),
    location("tenke", "Tenke Fungurume", "DR Congo", -10.61, 26.19, "mining", "Copper-cobalt ore", "Copper ore", "Ore is extracted from deposits in the Central African Copperbelt.", "The Copperbelt supplies both copper and cobalt crucial to electrification.", "Material is upgraded before export or regional processing."),
    location("antofagasta", "Antofagasta Concentrators", "Chile", -23.65, -70.40, "concentration", "Copper ore", "Copper concentrate", "Grinding and froth flotation separate copper minerals from waste rock.", "Co-locating concentration near mines avoids moving enormous quantities of waste rock.", "Concentrate travels to coastal smelters or overseas buyers."),
    location("matarani", "Matarani Export Corridor", "Peru", -17.00, -72.10, "concentration", "Copper ore", "Copper concentrate", "Mine concentrates are consolidated and prepared for ocean transport.", "This Pacific gateway connects landlocked Andean deposits to Asian smelters.", "Concentrate is shipped across the Pacific."),
    location("guixi", "Guixi Copper Complex", "China", 28.29, 117.20, "refining", "Copper concentrate", "Copper cathodes", "Concentrate is smelted into anodes, then electrorefined into high-purity cathodes.", "China operates the world's largest concentration of copper smelting and refining capacity.", "Cathodes move to wire rod and component factories."),
    location("toyama", "Naoshima Refinery", "Japan", 34.46, 133.99, "refining", "Copper concentrate", "Copper cathodes", "Imported concentrate is smelted and refined, with valuable by-products recovered.", "Resource-poor Japan developed efficient coastal smelting around imported feedstock.", "Pure metal feeds advanced regional manufacturing."),
    location("chuquicamata", "Chuquicamata Smelter", "Chile", -22.30, -68.90, "refining", "Copper concentrate", "Copper cathodes", "Domestic smelting and electrorefining produce exchange-grade copper cathodes.", "It shows that some metal is refined close to extraction—though much is exported as concentrate.", "Cathodes are exported or fabricated into semi-finished forms."),
    location("shenzhen", "Pearl River Manufacturing", "China", 22.54, 114.06, "manufacturing", "Copper cathodes", "Wire, motors & electronics", "Copper is drawn into fine wire and built into motors, transformers and circuit assemblies.", "Dense electronics and electrical-equipment clusters create enormous copper demand.", "Components enter products used in China and exported worldwide."),
    location("hamburg", "Hamburg Fabrication Hub", "Germany", 53.55, 9.99, "manufacturing", "Copper cathodes", "Wire rod & sheet", "Cathodes are melted, rolled and drawn into precise semi-finished products.", "Germany's industrial base uses copper in machinery, vehicles and energy systems.", "Fabricated copper enters European factories and construction."),
    location("houston", "Gulf Coast Fabrication", "United States", 29.76, -95.37, "manufacturing", "Copper cathodes", "Cable & industrial components", "Metal is formed into cable, tubing and components for infrastructure and industry.", "The region connects ports, power infrastructure and a large industrial market.", "Products travel to buildings, grids and manufacturers."),
    location("yangtze", "Yangtze River Delta", "China", 31.23, 121.47, "consumption", "Copper products", "Buildings, grids & devices", "Copper is embedded in new power grids, buildings, electric vehicles and appliances.", "China is both a dominant processor and the largest end-use market.", "Copper remains in service for decades and can later be recycled.", { outputs: ["Building wiring", "Motors and transformers", "Circuit boards", "EV drivetrains"], downstreamUses: ["Power grids", "Construction", "EVs", "Consumer electronics"] }),
    location("california", "California End-use Market", "United States", 34.05, -118.24, "consumption", "Wire, motors & electronics", "Buildings, grids & devices", "Electrification, construction, data centers and consumer products put copper to work.", "Large, technology-intensive markets pull copper through a global production network.", "Scrap collection returns valuable copper to secondary smelters.", { outputs: ["Charging infrastructure", "Data centers", "Building wiring", "Renewable power systems"], downstreamUses: ["EVs", "Telecommunications", "Solar and wind", "Digital infrastructure"] }),
    location("rotterdam", "Northwest Europe", "Netherlands / European Union", 51.92, 4.48, "consumption", "Copper products", "Energy systems & construction", "Cable, sheet and components are installed in renewable power, transport and buildings.", "Europe's energy transition raises demand while strong recycling loops recover old metal.", "End-of-life copper is sorted, remelted and reused.", { outputs: ["Grid cabling", "Heat pumps", "Plumbing and sheet", "Wind and solar systems"], downstreamUses: ["Power grids", "Construction", "Clean energy", "Industrial machinery"] }),
    location("mumbai-copper", "Western India Demand Region", "India", 19.08, 72.88, "consumption", "Wire, tubing & components", "Urban infrastructure & equipment", "Rapid urbanization puts copper into buildings, grid expansion, railways, appliances and industrial equipment.", "India represents a large, growing demand region rather than a single point of consumption.", "Copper remains in long-lived infrastructure before entering recycling streams.", { outputs: ["Building wiring", "Grid equipment", "Rail systems", "Appliances"], downstreamUses: ["Construction", "Power grids", "Transport", "Industrial machinery"] }),
    location("singapore-copper", "Southeast Asian Demand Region", "Southeast Asia", 1.35, 103.82, "consumption", "Copper products & components", "Electronics, buildings & grids", "Regional factories and fast-growing cities use copper in electronics, construction, power networks and data infrastructure.", "Southeast Asia combines export manufacturing with expanding domestic infrastructure demand.", "Products serve regional cities and global electronics markets; scrap can return to secondary refiners.", { outputs: ["Electronics", "Telecom networks", "Building systems", "Data centers"], downstreamUses: ["Consumer electronics", "Telecommunications", "Construction", "Digital infrastructure"] }),
  ],
  flows: [
    flow("c1", "escondida", "antofagasta", "concentration", "Copper ore", "Ore is upgraded close to the mine."), flow("c2", "cerro-verde", "matarani", "concentration", "Copper concentrate", "Concentrate reaches a Pacific export terminal."),
    flow("c3", "antofagasta", "guixi", "refining", "Copper concentrate", "Chilean concentrate crosses the Pacific for smelting."), flow("c4", "matarani", "toyama", "refining", "Copper concentrate", "Andean concentrate supplies Asian refining."), flow("c5", "antofagasta", "chuquicamata", "refining", "Copper concentrate", "Some concentrate is refined domestically."),
    flow("c6", "guixi", "shenzhen", "manufacturing", "Copper cathodes", "Cathodes feed China's manufacturing belt."), flow("c7", "toyama", "hamburg", "manufacturing", "Refined copper", "Refined metal enters specialized fabrication."), flow("c8", "chuquicamata", "houston", "manufacturing", "Copper cathodes", "Cathodes move to North American fabricators."),
    flow("c9", "shenzhen", "yangtze", "consumption", "Motors & electronics", "Components enter China's vast end-use economy."), flow("c10", "hamburg", "rotterdam", "consumption", "Wire rod & sheet", "Fabricated copper supplies European infrastructure."), flow("c11", "houston", "california", "consumption", "Cable & components", "Copper products cross the US to end users."), flow("c12", "shenzhen", "mumbai-copper", "consumption", "Components & equipment", "Regional manufacturing supplies India's expanding infrastructure."), flow("c13", "shenzhen", "singapore-copper", "consumption", "Wire & electronic components", "Copper-bearing components serve Southeast Asian factories and cities."),
  ],
};

const copperLocationIso: Record<string, string> = {
  escondida: "CHL", antofagasta: "CHL", chuquicamata: "CHL", "cerro-verde": "PER", matarani: "PER",
  tenke: "COD", guixi: "CHN", shenzhen: "CHN", yangtze: "CHN", hamburg: "DEU", california: "USA", houston: "USA",
};
const sourceWithYear = (source: Omit<SourceMetadata, "year">, year: number): SourceMetadata => ({ ...source, year });

copper.locations = copper.locations.map((item) => {
  const iso3 = copperLocationIso[item.id];
  if (!iso3) return item;
  const production = copperGenerated.production.find((record) => record.iso3 === iso3);
  const relatedTrade = copperGenerated.tradeFlows.filter((record) => record.exporterIso3 === iso3 || record.importerIso3 === iso3);
  const sources = [
    ...(production ? [sourceWithYear(production.source, production.year)] : []),
    ...relatedTrade.map((record) => sourceWithYear(record.source, record.year)),
  ].filter((source, index, all) => all.findIndex((other) => other.publisher === source.publisher && other.year === source.year) === index);
  const evidence: EvidenceMetric[] = [
    ...(production ? [{ label: "Mine production", value: production.value, unit: production.unit, year: production.year, source: production.source.publisher }] : []),
    ...relatedTrade.slice(0, 2).map((record) => ({ label: record.exporterIso3 === iso3 ? "Recorded exports" : "Recorded imports", value: record.tradeValueUsd, unit: "USD", year: record.year, source: record.source.publisher })),
  ];
  return { ...item, sources, evidence };
});

const endpointByStage: Record<string, { from: Record<string, string>; to: Record<string, string> }> = {
  refining: { from: { CHL: "antofagasta", PER: "matarani" }, to: { CHN: "guixi", JPN: "toyama" } },
  manufacturing: { from: { CHL: "chuquicamata", CHN: "guixi" }, to: { CHN: "shenzhen", DEU: "hamburg", USA: "houston" } },
  consumption: { from: { CHN: "shenzhen", DEU: "hamburg", USA: "houston" }, to: { CHN: "yangtze", USA: "california", IND: "mumbai-copper" } },
};
const generatedCopperFlows: Flow[] = copperGenerated.tradeFlows.flatMap((record) => {
  const mapping = copperGenerated.hsMappings.find((item) => item.code === record.commodityCode);
  if (!mapping) return [];
  const endpoints = endpointByStage[mapping.stageId];
  const fromLocationId = endpoints?.from[record.exporterIso3];
  const toLocationId = endpoints?.to[record.importerIso3];
  if (!fromLocationId || !toLocationId) return [];
  return [{
    id: record.id, fromLocationId, toLocationId, stageId: mapping.stageId, material: mapping.transformation,
    description: `${mapping.label}: recorded bilateral exports in ${record.year}.`, valueUsd: record.tradeValueUsd,
    quantityKg: record.netWeightKg, year: record.year, source: sourceWithYear(record.source, record.year),
  }];
});
copper.flows = [...copper.flows.filter((flow) => !generatedCopperFlows.some((generated) => generated.fromLocationId === flow.fromLocationId && generated.toLocationId === flow.toLocationId && generated.stageId === flow.stageId)), ...generatedCopperFlows];
copper.dataLabel = `UN Comtrade · ${copperGenerated.latestTradeYear}  /  USGS · ${copperGenerated.latestProductionYear}`;

const oil: Commodity = {
  id: "oil", name: "Crude Oil", color: "#516d67", shortDescription: "From underground reservoirs to fuels and chemical building blocks that move modern life.",
  stages: [stage("extraction", "Extraction", 1, "Wells bring mixtures of hydrocarbons from deep reservoirs."), stage("transport", "Export / Transport", 2, "Pipelines and tankers connect producing regions to distant markets."), stage("refining", "Refining", 3, "Refineries separate and transform crude into useful fractions."), stage("products", "Petroleum Products", 4, "Fuel terminals and chemical hubs distribute finished products."), stage("consumption", "Consumption", 5, "Transport, aviation and industry consume fuels and feedstocks.")],
  locations: [
    location("ghawar", "Ghawar Oil Field", "Saudi Arabia", 25.43, 49.62, "extraction", "Underground reservoir", "Crude oil", "Wells lift and separate crude oil from water and natural gas.", "Ghawar symbolizes the giant, low-cost fields that underpin global oil supply.", "Stabilized crude enters the east–west pipeline and export system."),
    location("permian", "Permian Basin", "United States", 31.85, -102.37, "extraction", "Shale reservoir", "Light crude oil", "Horizontal drilling and hydraulic fracturing release oil from tight rock.", "The Permian transformed the United States into a leading producer.", "Gathering lines carry crude to the Gulf Coast."),
    location("abu-dhabi", "Upper Zakum", "UAE", 24.86, 53.08, "extraction", "Offshore reservoir", "Crude oil", "Offshore platforms produce crude from a vast shallow-water field.", "The UAE is a major export supplier positioned near Asian markets.", "Crude moves to storage and tanker terminals."),
    location("ras-tanura", "Ras Tanura Terminal", "Saudi Arabia", 26.65, 50.16, "transport", "Saudi crude oil", "Tanker cargo", "Crude is stored, metered and loaded onto ocean-going tankers.", "This is one of the world's most important oil export gateways.", "Tankers sail through the Gulf and Indian Ocean."),
    location("fujairah", "Fujairah Terminal", "UAE", 25.12, 56.35, "transport", "Emirati crude oil", "Tanker cargo", "Pipelines deliver crude to storage outside the Strait of Hormuz.", "Its location offers producers strategic access to open ocean routes.", "Cargoes head mainly toward Asian refineries."),
    location("houston-port", "Houston Ship Channel", "United States", 29.73, -95.27, "transport", "US crude oil", "Refinery feedstock", "Pipelines and docks aggregate crude for domestic plants and exports.", "The Gulf Coast joins prolific production with the world's largest refining complex.", "Crude enters nearby refineries or export vessels."),
    location("jamnagar", "Jamnagar Refinery", "India", 22.33, 69.87, "refining", "Imported crude oil", "Gasoline, diesel & jet fuel", "Distillation separates crude; conversion units crack heavy molecules and remove sulfur.", "A vast, complex refinery can process varied crudes and export clean fuels worldwide.", "Products move to terminals, airports and chemical plants."),
    location("ulsan", "Ulsan Refining Complex", "South Korea", 35.50, 129.38, "refining", "Imported crude oil", "Fuels & naphtha", "Crude is distilled and upgraded into transport fuels and petrochemical feedstocks.", "South Korea imports crude but exports high-value refined products.", "Pipelines and coastal ships distribute fuels and naphtha."),
    location("ningbo", "Ningbo Refining Hub", "China", 29.87, 121.55, "refining", "Imported crude oil", "Fuels & chemical feedstocks", "Integrated plants refine crude and route naphtha directly into petrochemical units.", "Integration turns imported raw material into fuels, plastics precursors and industrial inputs.", "Finished streams enter China's distribution and manufacturing networks."),
    location("singapore", "Singapore Products Hub", "Singapore", 1.29, 103.85, "products", "Refinery streams", "Marine fuel, jet fuel & chemicals", "Storage, blending and trading infrastructure matches product grades to regional users.", "Its location on major sea lanes makes it a pivotal refined-products hub.", "Fuel is delivered to ships, airports and neighboring economies."),
    location("ara", "Amsterdam–Rotterdam–Antwerp", "Europe", 51.92, 4.48, "products", "Refined fuels", "Distributed petroleum products", "Terminals blend and redistribute fuels throughout Northwest Europe.", "Dense ports, pipelines and inland waterways connect refineries with a huge market.", "Products reach service stations, airports and chemical plants."),
    location("shanghai-oil", "Shanghai Demand Center", "China", 31.23, 121.47, "consumption", "Gasoline, diesel & feedstocks", "Mobility & manufactured goods", "Road transport, aviation and factories consume fuels and petroleum-derived materials.", "China's scale makes it a central destination for both crude and refined products.", "Combustion releases energy; petrochemical carbon remains in products until disposal."),
    location("delhi", "North India Market", "India", 28.61, 77.21, "consumption", "Diesel, gasoline & jet fuel", "Transport energy", "Trucks, cars and aircraft use refinery products moved inland by pipeline and rail.", "Fast-growing mobility links domestic demand to imported crude.", "Efficiency and electrification can reduce future fuel demand."),
    location("frankfurt", "Central Europe", "Germany / Europe", 50.11, 8.68, "consumption", "Jet fuel, diesel & feedstocks", "Transport & industrial use", "Airports, freight fleets and chemical industries use specialized petroleum products.", "A mature market illustrates oil's many uses beyond passenger cars.", "Some products are combusted; others become long-lived materials."),
  ],
  flows: [flow("o1", "ghawar", "ras-tanura", "transport", "Arab Light crude", "Pipeline to the Gulf export coast."), flow("o2", "abu-dhabi", "fujairah", "transport", "Murban crude", "Pipeline bypasses the Strait of Hormuz."), flow("o3", "permian", "houston-port", "transport", "Light crude", "Pipelines connect inland wells with the coast."), flow("o4", "ras-tanura", "jamnagar", "refining", "Crude oil", "Tanker cargo supplies a complex Indian refinery."), flow("o5", "fujairah", "ulsan", "refining", "Crude oil", "Gulf crude sails to Northeast Asia."), flow("o6", "houston-port", "ningbo", "refining", "Light crude", "US crude joins China's diverse refinery slate."), flow("o7", "jamnagar", "singapore", "products", "Diesel & jet fuel", "Export refinery products enter an Asian hub."), flow("o8", "ulsan", "ara", "products", "Refined products", "Long-distance product trade balances regional supply."), flow("o9", "ningbo", "singapore", "products", "Naphtha & fuels", "Products circulate through Asian markets."), flow("o10", "singapore", "shanghai-oil", "consumption", "Fuels & feedstocks", "Products serve transport and industry."), flow("o11", "jamnagar", "delhi", "consumption", "Transport fuels", "Domestic networks move products inland."), flow("o12", "ara", "frankfurt", "consumption", "Fuels & feedstocks", "Barges and pipelines reach inland consumers.")],
};

const lithium: Commodity = {
  id: "lithium", name: "Lithium", color: "#6c7464", shortDescription: "From hard rock and salt brines to the rechargeable cells powering an electric world.",
  stages: [stage("extraction", "Extraction", 1, "Hard-rock mines and salt brines yield very different lithium feedstocks."), stage("processing", "Chemical Processing", 2, "Mineral and brine concentrates become battery-grade compounds."), stage("refining", "Cathode Refining", 3, "Lithium chemicals are combined into precise active materials."), stage("manufacturing", "Battery Manufacturing", 4, "Cathodes, anodes and electrolytes are assembled into battery cells."), stage("products", "Final Products", 5, "Cells power EVs, grid storage and consumer electronics.")],
  locations: [
    location("greenbushes", "Greenbushes Mine", "Australia", -33.86, 116.06, "extraction", "Pegmatite rock", "Spodumene concentrate", "Hard rock is mined, crushed and concentrated to isolate spodumene.", "Australia leads mine supply, while much of its concentrate is processed abroad.", "Concentrate is shipped from Western Australia to chemical converters."),
    location("atacama", "Salar de Atacama", "Chile", -23.50, -68.25, "extraction", "Lithium-rich brine", "Concentrated brine", "Brine is pumped from beneath salt flats and concentrated before chemical recovery.", "The salar's chemistry and arid climate support highly productive operations.", "Concentrated brine is purified into lithium carbonate."),
    location("hombre-muerto", "Salar del Hombre Muerto", "Argentina", -25.42, -67.10, "extraction", "Lithium-rich brine", "Concentrated brine", "Subsurface brine is pumped and processed in the high Andes.", "Argentina is a growing part of South America's Lithium Triangle.", "Lithium solution moves through purification and precipitation."),
    location("kwinana", "Kwinana Conversion Hub", "Australia", -32.24, 115.77, "processing", "Spodumene concentrate", "Lithium hydroxide", "High-temperature conversion and chemical leaching create battery-grade hydroxide.", "Local conversion captures more value than exporting mineral concentrate alone.", "Hydroxide is qualified and shipped to cathode makers."),
    location("antofagasta-li", "Antofagasta Chemical Plants", "Chile", -23.65, -70.40, "processing", "Concentrated brine", "Lithium carbonate", "Impurities are removed and lithium carbonate is precipitated and dried.", "Chile connects high-quality brine resources to Pacific export routes.", "Carbonate goes to cathode-material producers."),
    location("sichuan", "Sichuan Lithium Converters", "China", 30.57, 104.07, "processing", "Spodumene concentrate", "Lithium hydroxide & carbonate", "Imported mineral concentrate is roasted, leached and refined into battery-grade chemicals.", "China dominates downstream conversion despite mining much feedstock elsewhere.", "Compounds enter nearby cathode supply chains."),
    location("changsha", "Changsha Cathode Cluster", "China", 28.23, 112.94, "refining", "Lithium compounds & metals", "Cathode active material", "Lithium is combined with nickel, cobalt, manganese or iron phosphate into engineered powders.", "Cathode chemistry largely determines a battery's cost, range and performance.", "Cathode powder is coated onto foil for cell production."),
    location("pohang", "Pohang Materials Hub", "South Korea", 36.02, 129.34, "refining", "Lithium hydroxide", "Cathode active material", "Battery-grade chemicals become tightly controlled high-nickel cathode material.", "Korea links global minerals to a sophisticated battery industry.", "Cathode material supplies domestic and overseas cell plants."),
    location("ningde", "Ningde Cell Cluster", "China", 26.67, 119.55, "manufacturing", "Cathodes, anodes & electrolyte", "Battery cells & packs", "Electrode rolls are coated, assembled, filled and tested as cells and packs.", "China has the largest and most integrated battery manufacturing ecosystem.", "Packs go directly into EV and storage production."),
    location("ulsan-li", "Ulsan Battery Plants", "South Korea", 35.54, 129.31, "manufacturing", "Battery materials", "Lithium-ion cells", "Precision factories assemble layered materials into standardized pouch and cylindrical cells.", "Korean manufacturers supply automakers across the world.", "Cells are exported to vehicle assembly plants."),
    location("osaka", "Kansai Cell Manufacturing", "Japan", 34.69, 135.50, "manufacturing", "Cathode materials", "Lithium-ion cells", "Mature battery know-how produces high-reliability cells for vehicles and electronics.", "Japan pioneered commercial lithium-ion batteries and remains a key technology center.", "Cells are integrated into electronics and vehicle packs."),
    location("detroit", "US Electric Vehicle Belt", "United States", 42.33, -83.05, "products", "Battery cells & packs", "Electric vehicles", "Battery packs are integrated with power electronics and vehicles.", "Automotive demand makes lithium's distant upstream journey tangible to consumers.", "Batteries serve for years before reuse or recycling."),
    location("tokyo", "Tokyo Electronics Market", "Japan", 35.68, 139.69, "products", "Lithium-ion cells", "Consumer electronics", "Compact cells power phones, laptops, tools and thousands of portable products.", "Consumer electronics first scaled lithium-ion technology globally.", "Collection can recover nickel, cobalt, copper and lithium."),
    location("california-li", "California Storage Market", "United States", 37.34, -121.89, "products", "Battery packs", "EVs & grid storage", "Large packs store renewable electricity and power zero-tailpipe-emission vehicles.", "State policy and renewable deployment create major demand for batteries.", "Second-life use and recycling can close material loops."),
  ],
  flows: [flow("l1", "greenbushes", "kwinana", "processing", "Spodumene", "Ore concentrate moves to a nearby converter."), flow("l2", "greenbushes", "sichuan", "processing", "Spodumene concentrate", "Australian mineral is shipped to Chinese converters."), flow("l3", "atacama", "antofagasta-li", "processing", "Lithium brine", "Brine-derived material moves to coastal processing."), flow("l4", "hombre-muerto", "antofagasta-li", "processing", "Lithium carbonate feed", "Andean supply joins Pacific export chains."), flow("l5", "sichuan", "changsha", "refining", "Lithium hydroxide", "Battery-grade chemicals feed cathode plants."), flow("l6", "kwinana", "pohang", "refining", "Lithium hydroxide", "Australian chemicals supply Korean materials plants."), flow("l7", "antofagasta-li", "changsha", "refining", "Lithium carbonate", "South American carbonate crosses the Pacific."), flow("l8", "changsha", "ningde", "manufacturing", "Cathode material", "Engineered powders move to cell gigafactories."), flow("l9", "pohang", "ulsan-li", "manufacturing", "Cathode material", "Specialized materials supply Korean cell plants."), flow("l10", "pohang", "osaka", "manufacturing", "Cathode material", "Regional trade supports Japanese cell making."), flow("l11", "ulsan-li", "detroit", "products", "Battery cells", "Cells cross the Pacific to vehicle assembly."), flow("l12", "osaka", "tokyo", "products", "Battery cells", "Cells enter portable electronics."), flow("l13", "ningde", "california-li", "products", "Battery packs", "Manufactured packs serve EV and storage markets.")],
};

export const commodities = [copper, oil, lithium];
