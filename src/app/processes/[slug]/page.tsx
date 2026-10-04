import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLinks, KnowledgeLayout, Sources } from "@/components/KnowledgeLayout";
import { copperKnowledgeGraph, locationLookup, processLookup } from "@/data/graph";
import type { Dependency } from "@/domain/entities";
import "@/data/validate-graph";

export function generateStaticParams() { return copperKnowledgeGraph.processes.map(({ slug }) => ({ slug })); }
function Dependencies({ title, items }: { title: string; items: Dependency[] }) { return <section className="knowledge-section"><h2>{title}</h2><div className="dependency-list">{items.length ? items.map((item, index) => <div key={`${item.name}-${index}`}><small>{item.category}</small>{item.materialId ? <Link href={`/materials/${item.materialId}`}>{item.name} →</Link> : <strong>{item.name}</strong>}</div>) : <p>None identified.</p>}</div></section>; }

export default async function ProcessPage({ params }: { params: Promise<{ slug: string }> }) {
  const process = processLookup.bySlug((await params).slug); if (!process) notFound();
  return <KnowledgeLayout section="Process" title={process.name} kicker="Physical transformation" summary={process.explanation} breadcrumbs={[{ label: "Transformation processes" }, { label: process.name }]}>
    <div className="knowledge-grid"><Dependencies title="Primary & secondary inputs" items={process.inputs}/><Dependencies title="Primary outputs" items={process.outputs}/></div>
    <div className="knowledge-grid"><Dependencies title="Utilities" items={process.utilities}/><Dependencies title="Byproducts" items={process.byproducts}/></div>
    <div className="knowledge-grid"><Dependencies title="Infrastructure dependencies" items={process.infrastructureDependencies}/><Dependencies title="Equipment dependencies" items={process.equipmentDependencies}/></div>
    <section className="knowledge-section"><h2>Where it happens—and why</h2><div className="location-reasons">{process.locationIds.map((id) => { const location = locationLookup.byId(id); return location && <Link key={id} href={`/locations/${location.slug}`}><strong>{location.name}</strong><span>{location.whyItMatters}</span></Link>; })}</div></section>
    <EntityLinks title="What happens next" ids={process.nextProcessIds} type="processes"/>
    <Sources sources={process.sources}/>
  </KnowledgeLayout>;
}
