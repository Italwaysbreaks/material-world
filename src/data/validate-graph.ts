import { copperKnowledgeGraph } from "./graph.ts";

export type ValidationIssue = { path: string; message: string };

export function validateCopperGraph(): ValidationIssue[] {
  const { commodity, materials, processes, locations, industries, transformations, geographicFlows } = copperKnowledgeGraph;
  const issues: ValidationIssue[] = [];
  const collections = [materials, processes, locations, industries, [commodity]];
  const all = collections.flat();
  const checkUnique = (key: "id" | "slug") => {
    const seen = new Set<string>();
    for (const entity of all) {
      const value = entity[key].toLowerCase();
      if (seen.has(value)) issues.push({ path: `${entity.id}.${key}`, message: `Duplicate ${key}: ${value}` });
      seen.add(value);
    }
  };
  checkUnique("id");
  checkUnique("slug");
  const relationshipIds = [...transformations, ...geographicFlows].map(({ id }) => id);
  if (new Set(relationshipIds).size !== relationshipIds.length) issues.push({ path: "relationships", message: "Duplicate relationship ID" });

  const ids = <T extends { id: string }>(items: T[]) => new Set(items.map(({ id }) => id));
  const materialIds = ids(materials), processIds = ids(processes), locationIds = ids(locations), industryIds = ids(industries);
  const references: [string, string[], Set<string>][] = [];
  for (const item of materials) references.push([`${item.id}.createdByProcessIds`, item.createdByProcessIds, processIds], [`${item.id}.consumedByProcessIds`, item.consumedByProcessIds, processIds], [`${item.id}.upstreamMaterialIds`, item.upstreamMaterialIds, materialIds], [`${item.id}.downstreamMaterialIds`, item.downstreamMaterialIds, materialIds], [`${item.id}.locationIds`, item.locationIds, locationIds], [`${item.id}.industryIds`, item.industryIds, industryIds]);
  for (const item of processes) {
    references.push([`${item.id}.locationIds`, item.locationIds, locationIds], [`${item.id}.nextProcessIds`, item.nextProcessIds, processIds]);
    for (const dependency of [...item.inputs, ...item.outputs, ...item.byproducts]) if (dependency.materialId && !materialIds.has(dependency.materialId)) issues.push({ path: item.id, message: `Broken material reference: ${dependency.materialId}` });
  }
  for (const item of locations) references.push([`${item.id}.processIds`, item.processIds, processIds], [`${item.id}.materialIds`, item.materialIds, materialIds]);
  for (const item of industries) references.push([`${item.id}.materialIds`, item.materialIds, materialIds]);
  for (const item of transformations) references.push([`${item.id}.processId`, [item.processId], processIds], [`${item.id}.inputMaterialIds`, item.inputMaterialIds, materialIds], [`${item.id}.outputMaterialIds`, item.outputMaterialIds, materialIds]);
  for (const item of geographicFlows) references.push([`${item.id}.materialId`, [item.materialId], materialIds], [`${item.id}.fromLocationId`, [item.fromLocationId], locationIds], [`${item.id}.toLocationId`, [item.toLocationId], locationIds]);
  for (const [path, values, valid] of references) for (const value of values) if (!valid.has(value)) issues.push({ path, message: `Broken reference: ${value}` });
  const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const entity of [...materials, ...processes, ...locations]) {
    if (!safeSlug.test(entity.slug)) issues.push({ path: `${entity.id}.slug`, message: "Entity has no valid route-safe slug" });
  }
  for (const item of materials) if (![...item.createdByProcessIds, ...item.consumedByProcessIds, ...item.upstreamMaterialIds, ...item.downstreamMaterialIds, ...item.locationIds].length) issues.push({ path: item.id, message: "Navigable material has no connected path" });
  for (const item of processes) if (![...item.inputs, ...item.outputs, ...item.locationIds, ...item.nextProcessIds].length) issues.push({ path: item.id, message: "Navigable process has no connected path" });
  for (const item of locations) if (![...item.materialIds, ...item.processIds].length) issues.push({ path: item.id, message: "Navigable location has no connected path" });
  return issues;
}

export function assertValidCopperGraph() {
  const issues = validateCopperGraph();
  if (issues.length) throw new Error(`Invalid Copper graph:\n${issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n")}`);
}

assertValidCopperGraph();
