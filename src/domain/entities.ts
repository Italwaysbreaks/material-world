export type EntityId = string;

export type Provenance = {
  publisher: string;
  dataset: string;
  year: number;
  url: string;
  note?: string;
  classification: "Reported" | "Derived" | "Curated" | "Estimated";
};

export type EntityBase = {
  id: EntityId;
  slug: string;
  name: string;
  summary: string;
  sources: Provenance[];
};

export type Material = EntityBase & {
  kind: "material" | "component" | "product";
  category: string;
  parentCommodityId: EntityId;
  physicalForm: string;
  createdByProcessIds: EntityId[];
  consumedByProcessIds: EntityId[];
  upstreamMaterialIds: EntityId[];
  downstreamMaterialIds: EntityId[];
  locationIds: EntityId[];
  industryIds: EntityId[];
  commonUses: string[];
};

export type Dependency = {
  name: string;
  category: "Primary Material" | "Secondary Material" | "Utility" | "Infrastructure Dependency" | "Equipment Dependency";
  materialId?: EntityId;
};

export type Process = EntityBase & {
  stage: "Extraction" | "Beneficiation" | "Smelting & refining" | "Fabrication" | "Manufacturing";
  keyTransformation: string;
  explanation: string;
  inputs: Dependency[];
  outputs: Dependency[];
  byproducts: Dependency[];
  utilities: Dependency[];
  infrastructureDependencies: Dependency[];
  equipmentDependencies: Dependency[];
  locationIds: EntityId[];
  nextProcessIds: EntityId[];
};

export type GraphLocation = EntityBase & {
  locationType: "mine" | "port" | "smelter" | "refinery" | "processing hub" | "manufacturing hub" | "consumption region";
  region?: string;
  country: string;
  iso3: string;
  latitude: number;
  longitude: number;
  processIds: EntityId[];
  materialIds: EntityId[];
  whyItMatters: string;
};

export type Industry = EntityBase & { materialIds: EntityId[] };

export type TransformationRelationship = {
  id: EntityId;
  kind: "transformation";
  processId: EntityId;
  inputMaterialIds: EntityId[];
  outputMaterialIds: EntityId[];
};

export type GeographicFlow = {
  id: EntityId;
  kind: "geographic";
  materialId: EntityId;
  fromLocationId: EntityId;
  toLocationId: EntityId;
  mode: "road" | "rail" | "pipeline" | "sea" | "mixed";
  source: Provenance;
  valueUsd?: number;
  quantityKg?: number | null;
};

export type CommodityGraph = EntityBase & {
  materialIds: EntityId[];
  processIds: EntityId[];
  locationIds: EntityId[];
  industryIds: EntityId[];
};
