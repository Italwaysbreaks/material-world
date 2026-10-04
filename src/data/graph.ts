import type { EntityBase } from "@/domain/entities";
import { copperGraph, geographicFlows, graphLocations, industries, materials, processes, transformations } from "./copper-graph.ts";

function indexEntities<T extends EntityBase>(entities: T[]) {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const bySlug = new Map(entities.map((entity) => [entity.slug.toLowerCase(), entity]));
  const byName = new Map(entities.map((entity) => [entity.name.toLowerCase(), entity]));
  return {
    all: entities,
    byId: (id: string) => byId.get(id),
    bySlug: (slug: string) => bySlug.get(slug.toLowerCase()),
    byName: (name: string) => byName.get(name.toLowerCase()),
  };
}

export const materialLookup = indexEntities(materials);
export const processLookup = indexEntities(processes);
export const locationLookup = indexEntities(graphLocations);
export const industryLookup = indexEntities(industries);
export const commodityLookup = indexEntities([copperGraph]);

export const copperKnowledgeGraph = {
  commodity: copperGraph,
  materials,
  processes,
  locations: graphLocations,
  industries,
  transformations,
  geographicFlows,
};

export function findEntityById(id: string) {
  return materialLookup.byId(id) ?? processLookup.byId(id) ?? locationLookup.byId(id) ?? industryLookup.byId(id) ?? commodityLookup.byId(id);
}

export function findEntityBySlug(slug: string) {
  return materialLookup.bySlug(slug) ?? processLookup.bySlug(slug) ?? locationLookup.bySlug(slug) ?? industryLookup.bySlug(slug) ?? commodityLookup.bySlug(slug);
}

export function findEntityByName(name: string) {
  return materialLookup.byName(name) ?? processLookup.byName(name) ?? locationLookup.byName(name) ?? industryLookup.byName(name) ?? commodityLookup.byName(name);
}
