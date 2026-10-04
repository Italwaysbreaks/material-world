import Link from "next/link";
import { notFound } from "next/navigation";
import { KnowledgeLayout, Sources } from "@/components/KnowledgeLayout";
import { commodityLookup, copperKnowledgeGraph } from "@/data/graph";
import "@/data/validate-graph";
export function generateStaticParams() { return [{ slug: "copper" }]; }
export default async function CommodityPage({ params }: { params: Promise<{ slug: string }> }) { const commodity = commodityLookup.bySlug((await params).slug); if (!commodity) notFound(); return <KnowledgeLayout section="Commodity" title={commodity.name} kicker="Reference material graph" summary={commodity.summary}><section className="knowledge-section"><h2>Material transformation chain</h2><div className="journey-list">{copperKnowledgeGraph.materials.filter((item) => item.kind === "material").map((item) => <Link key={item.id} href={`/materials/${item.slug}`}>{item.name}<span>Explore →</span></Link>)}</div></section><section className="knowledge-section"><h2>Processes</h2><div className="entity-links">{copperKnowledgeGraph.processes.map((item) => <Link key={item.id} href={`/processes/${item.slug}`}>{item.name}<span>→</span></Link>)}</div></section><Sources sources={commodity.sources}/></KnowledgeLayout>; }
