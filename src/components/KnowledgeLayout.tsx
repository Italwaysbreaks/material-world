import Link from "next/link";
import type { ReactNode } from "react";
import { locationLookup, materialLookup, processLookup } from "@/data/graph";

export type Crumb = { label: string; href?: string };
export function KnowledgeLayout({ section, title, kicker, summary, breadcrumbs = [], children }: { section: string; title: string; kicker: string; summary: string; breadcrumbs?: Crumb[]; children: ReactNode }) {
  return <main className="knowledge-page">
    <header className="knowledge-header">
      <Link className="knowledge-brand" href="/">MATERIAL WORLD</Link>
      <nav aria-label="Breadcrumb"><Link href="/">Atlas</Link><span>›</span><Link href="/commodities/copper">Copper</Link>{breadcrumbs.map((crumb) => <span className="crumb" key={`${crumb.label}-${crumb.href ?? "current"}`}><b>›</b>{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}</span>)}</nav>
      <p className="eyebrow">{section} · COPPER KNOWLEDGE GRAPH</p>
      <h1>{title}</h1><p className="knowledge-kicker">{kicker}</p><p className="knowledge-summary">{summary}</p>
      <Link className="back-journey" href="/#copper-journey">← Back to Copper Journey</Link>
    </header>
    <article className="knowledge-body">{children}</article>
  </main>;
}

export function EntityLinks({ title, ids, type }: { title: string; ids: string[]; type: "materials" | "processes" | "locations" }) {
  const lookup = type === "materials" ? materialLookup : type === "processes" ? processLookup : locationLookup;
  return <section className="knowledge-section"><h2>{title}</h2><div className="entity-links">{ids.length ? ids.map((id) => { const entity = lookup.byId(id); return entity && <Link key={id} href={`/${type}/${entity.slug}`}>{entity.name}<span>→</span></Link>; }) : <p>None in this reference graph.</p>}</div></section>;
}

export function Sources({ sources }: { sources: { publisher: string; dataset: string; year: number; url: string; note?: string; classification: string }[] }) {
  return <section className="knowledge-section sources"><h2>Source & provenance</h2>{sources.map((source) => <a key={`${source.publisher}-${source.dataset}`} href={source.url}><strong>{source.publisher} · {source.year} · {source.classification}</strong><span>{source.dataset}{source.note ? ` — ${source.note}` : ""}</span></a>)}</section>;
}
