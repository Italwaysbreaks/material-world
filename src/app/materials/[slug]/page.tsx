import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLinks, KnowledgeLayout, Sources } from "@/components/KnowledgeLayout";
import { copperKnowledgeGraph, industryLookup, materialLookup, processLookup } from "@/data/graph";
import "@/data/validate-graph";

const trails: Record<string, { label: string; href?: string }[]> = {
  "copper-ore": [{ label: "Mining & concentration" }, { label: "Copper Ore" }],
  "copper-concentrate": [{ label: "Mining & concentration" }, { label: "Copper Ore", href: "/materials/copper-ore" }, { label: "Copper Concentrate" }],
  "copper-cathode": [{ label: "Smelting & refining" }, { label: "Copper Cathode" }],
  "copper-wire": [{ label: "Smelting & refining" }, { label: "Copper Cathode", href: "/materials/copper-cathode" }, { label: "Copper Wire" }],
  "electric-motor": [{ label: "Copper Cathode", href: "/materials/copper-cathode" }, { label: "Copper Wire", href: "/materials/copper-wire" }, { label: "Electric Motor" }],
};

export function generateStaticParams() { return copperKnowledgeGraph.materials.map(({ slug }) => ({ slug })); }

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const material = materialLookup.bySlug((await params).slug); if (!material) notFound();
  const flows = copperKnowledgeGraph.geographicFlows.filter((flow) => flow.materialId === material.id);
  return <KnowledgeLayout section={material.kind} title={material.name} kicker={material.physicalForm} summary={material.summary} breadcrumbs={trails[material.id] ?? [{ label: material.name }]}>
    <section className="knowledge-section definition"><h2>What it is</h2><p>{material.summary}</p><div className="semantic-key"><span><i className="semantic-icon material"/> Material / product</span><span><i className="semantic-icon transformation"/> Transformation</span></div></section>
    <div className="knowledge-grid"><EntityLinks title="What creates it" ids={material.createdByProcessIds} type="processes"/><EntityLinks title="What consumes it" ids={material.consumedByProcessIds} type="processes"/></div>
    <div className="knowledge-grid"><EntityLinks title="Upstream materials" ids={material.upstreamMaterialIds} type="materials"/><EntityLinks title="Downstream materials & products" ids={material.downstreamMaterialIds} type="materials"/></div>
    <EntityLinks title="Producing & using geographies" ids={material.locationIds} type="locations"/>
    <section className="knowledge-section"><h2>Industries served</h2><div className="tag-row">{material.industryIds.map((id) => <span key={id}>{industryLookup.byId(id)?.name}</span>)}</div></section>
    <section className="knowledge-section"><h2>Major geographic flows</h2>{flows.length ? flows.map((flow) => { const from = copperKnowledgeGraph.locations.find(({ id }) => id === flow.fromLocationId); const to = copperKnowledgeGraph.locations.find(({ id }) => id === flow.toLocationId); return <p key={flow.id}><span className="semantic-icon movement"/> {from?.country} → {to?.country} · {flow.mode} · {flow.source.publisher} · {flow.source.year} · {flow.source.classification}</p>; }) : <p>No source-backed bilateral flow is attached to this form yet; use the producing geographies above to continue exploring.</p>}</section>
    <section className="knowledge-section"><h2>Relevant processes</h2><div className="tag-row">{[...material.createdByProcessIds, ...material.consumedByProcessIds].map((id) => <span key={id}>{processLookup.byId(id)?.name}</span>)}</div></section>
    <Sources sources={material.sources}/>
    <Link className="continue-graph" href="/commodities/copper">Explore the complete Copper graph →</Link>
  </KnowledgeLayout>;
}
