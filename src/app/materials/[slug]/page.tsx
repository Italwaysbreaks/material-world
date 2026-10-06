import Link from "next/link";
import { notFound } from "next/navigation";
import { KnowledgeLayout, Sources } from "@/components/KnowledgeLayout";
import { MaterialMap } from "@/components/MaterialMap";
import { copperKnowledgeGraph, industryLookup, locationLookup, materialLookup, processLookup } from "@/data/graph";
import "@/data/validate-graph";

const stageFor = (materialId: string) => {
  const process = copperKnowledgeGraph.processes.find((item) => item.outputs.some((output) => output.materialId === materialId));
  return process?.stage ?? "Copper system";
};

export function generateStaticParams() { return copperKnowledgeGraph.materials.map(({ slug }) => ({ slug })); }

function MaterialNode({ id, relation }: { id: string; relation: string }) {
  const item = materialLookup.byId(id); if (!item) return null;
  return <Link className="diagram-node material-node" href={`/materials/${item.slug}`}><small>{relation}</small><strong>{item.name}</strong><span>{item.physicalForm}</span></Link>;
}

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const material = materialLookup.bySlug((await params).slug); if (!material) notFound();
  const creating = material.createdByProcessIds.map((id) => processLookup.byId(id)).filter(Boolean);
  const consuming = material.consumedByProcessIds.map((id) => processLookup.byId(id)).filter(Boolean);
  const flows = copperKnowledgeGraph.geographicFlows.filter((flow) => flow.materialId === material.id);
  const locationIds = new Set(material.locationIds);
  flows.forEach((flow) => { locationIds.add(flow.fromLocationId); locationIds.add(flow.toLocationId); });
  const locations = [...locationIds].flatMap((id) => { const place = locationLookup.byId(id); return place ? [{ ...place, role: place.materialIds.includes(material.id) ? place.locationType : "trade destination" }] : []; });
  const mapFlows = flows.map((flow) => ({ id: flow.id, from: flow.fromLocationId, to: flow.toLocationId, mode: flow.mode, label: material.name, provenance: `${flow.source.publisher} · ${flow.source.year} · ${flow.source.classification}` }));
  const trail = material.upstreamMaterialIds.slice(0, 2).map((id) => materialLookup.byId(id)).filter(Boolean).map((item) => ({ label: item!.name, href: `/materials/${item!.slug}` }));
  return <KnowledgeLayout section={material.kind} title={material.name} kicker={`${material.category} · ${material.physicalForm}`} summary={material.summary} breadcrumbs={[{ label: stageFor(material.id) }, ...trail, { label: material.name }]}>
    <section className="material-intro"><div><p className="section-label">WHAT IS IT?</p><p>{material.summary}</p></div><dl><div><dt>Physical form</dt><dd>{material.physicalForm}</dd></div><div><dt>Common uses</dt><dd>{material.commonUses.length ? material.commonUses.join(" · ") : "An intermediate form on copper’s path to finished products"}</dd></div></dl></section>

    <section className="transformation-experience">
      <header><p className="section-label">CONNECTED TRANSFORMATION</p><h2>How it’s made—and where it goes next</h2><p>Solid connectors show a physical change. Every outlined material is another explorable point in the chain.</p></header>
      <div className="transformation-diagram">
        <div className="diagram-column">{material.upstreamMaterialIds.slice(0, 3).map((id) => <MaterialNode key={id} id={id} relation="What goes into it" />)}</div>
        <span className="diagram-arrow">→</span>
        <div className="diagram-column">{creating.length ? creating.map((process) => <Link className="diagram-node process-node" href={`/processes/${process!.slug}`} key={process!.id}><small>How it’s made</small><strong>{process!.name}</strong><span>{process!.keyTransformation}</span></Link>) : <div className="diagram-note">This material enters the graph at extraction or through an external supply.</div>}</div>
        <span className="diagram-arrow">→</span>
        <div className="diagram-node current-node"><small>You are here</small><strong>{material.name}</strong><span>{material.physicalForm}</span></div>
        <span className="diagram-arrow">→</span>
        <div className="diagram-column">{material.downstreamMaterialIds.slice(0, 6).map((id) => <MaterialNode key={id} id={id} relation="What it becomes" />)}{!material.downstreamMaterialIds.length && <div className="diagram-note">This is typically an end-use product.</div>}</div>
      </div>
      {!!consuming.length && <div className="process-paths"><span>Next transformations</span>{consuming.map((process) => <Link key={process!.id} href={`/processes/${process!.slug}`}>{process!.name} →</Link>)}</div>}
    </section>

    <section className="geography-experience"><header><div><p className="section-label">PRODUCT-SPECIFIC GEOGRAPHY</p><h2>Where {material.name.toLowerCase()} enters the world</h2></div><div className="map-key"><span><i className="map-dot"/>Transformation / production</span><span><i className="map-route"/>Reported geographic flow</span></div></header><MaterialMap name={material.name} locations={locations} flows={mapFlows}/><footer>{flows.length ? flows.map((flow) => <span key={flow.id}>{flow.source.publisher} · {flow.source.year} · {flow.source.classification} {flow.mode} flow</span>) : <span>Material World · 2026 · Curated manufacturing geography — no bilateral trade route is implied.</span>}</footer></section>

    <div className="knowledge-grid compact-grid">
      <section className="knowledge-section"><h2>What goes into it</h2><div className="dependency-list">{creating.flatMap((process) => process!.inputs).filter((item, index, all) => all.findIndex((candidate) => candidate.name === item.name) === index).map((item) => <div key={item.name}><small>{item.category}</small>{item.materialId ? <Link href={`/materials/${materialLookup.byId(item.materialId)?.slug}`}>{item.name} →</Link> : <strong>{item.name}</strong>}</div>)}</div></section>
      <section className="knowledge-section"><h2>Products & industries that depend on it</h2><div className="tag-row">{material.industryIds.map((id) => <span key={id}>{industryLookup.byId(id)?.name}</span>)}{material.downstreamMaterialIds.map((id) => { const item = materialLookup.byId(id); return item && <Link key={id} href={`/materials/${item.slug}`}>{item.name} →</Link>; })}</div></section>
    </div>
    <Sources sources={material.sources}/>
    <Link className="continue-graph" href="/?journey=copper#copper-journey">Return to Copper Full Journey →</Link>
  </KnowledgeLayout>;
}
