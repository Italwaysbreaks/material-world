import { notFound } from "next/navigation";
import { EntityLinks, KnowledgeLayout, Sources } from "@/components/KnowledgeLayout";
import { copperKnowledgeGraph, locationLookup } from "@/data/graph";
import "@/data/validate-graph";
export function generateStaticParams() { return copperKnowledgeGraph.locations.map(({ slug }) => ({ slug })); }
export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) { const location = locationLookup.bySlug((await params).slug); if (!location) notFound(); return <KnowledgeLayout section="Location" title={location.name} kicker={`${location.country} · ${location.iso3}`} summary={location.whyItMatters}><div className="knowledge-grid"><EntityLinks title="Materials here" ids={location.materialIds} type="materials"/><EntityLinks title="Processes here" ids={location.processIds} type="processes"/></div><section className="knowledge-section"><h2>Geographic coordinates</h2><p>{location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}</p></section><Sources sources={location.sources}/></KnowledgeLayout>; }
