"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { commodities, Location } from "@/data/commodities";

const WorldMap = dynamic(() => import("./WorldMap").then((m) => m.WorldMap), { ssr: false });

export function Atlas() {
  const [commodityId, setCommodityId] = useState("copper");
  const [stageIndex, setStageIndex] = useState(0);
  const [fullJourney, setFullJourney] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const commodity = useMemo(() => commodities.find((item) => item.id === commodityId)!, [commodityId]);
  const stage = commodity.stages[stageIndex];

  const chooseCommodity = (id: string) => { setCommodityId(id); setStageIndex(0); setFullJourney(false); setSelected(null); };
  const chooseStage = (index: number) => { setStageIndex(index); setFullJourney(false); setSelected(null); };
  const reset = () => { setStageIndex(0); setFullJourney(false); setSelected(null); setResetToken((n) => n + 1); };

  return (
    <main className="atlas-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">MW</span><div><h1>MATERIAL WORLD</h1><p>A visual atlas of the things that make modern life.</p></div></div>
        <nav className="commodity-tabs" aria-label="Choose a material">
          {commodities.map((item) => <button key={item.id} className={item.id === commodity.id ? "active" : ""} onClick={() => chooseCommodity(item.id)}>{item.name}</button>)}
        </nav>
        <button className="about-button" title="An educational atlas of global material supply chains">ABOUT</button>
      </header>

      <section className="map-area">
        <WorldMap commodity={commodity} stageId={stage.id} fullJourney={fullJourney} selected={selected} onSelect={setSelected} resetToken={resetToken} />

        <div className="context-card">
          <p className="eyebrow">{fullJourney ? "THE COMPLETE JOURNEY" : `STAGE ${stage.order} OF ${commodity.stages.length}`}</p>
          <div className="context-title"><span className="material-swatch" style={{ background: commodity.color }} /> <h2>{commodity.name}</h2><span className="divider">/</span><h3>{fullJourney ? "Source to society" : stage.name}</h3></div>
          <p>{fullJourney ? commodity.shortDescription : stage.description}</p>
          <span className="map-instruction">Select a marked place to read its story</span>
        </div>

        <div className="stage-rail" aria-label="Supply chain stages">
          {commodity.stages.map((item, index) => <button key={item.id} onClick={() => chooseStage(index)} className={`stage-${index + 1} ${!fullJourney && index === stageIndex ? "active" : index < stageIndex || fullJourney ? "passed" : ""}`}>
            <span className="stage-icon" aria-hidden="true">{["⌁", "◌", "◇", "▦", "⌂"][index] ?? "•"}</span><span className="stage-number">{String(item.order).padStart(2, "0")}</span><span className="stage-name">{item.name}</span><span className="stage-description">{item.description}</span>
          </button>)}
        </div>

        <div className="map-actions">
          <button disabled={stageIndex === 0 || fullJourney} onClick={() => chooseStage(stageIndex - 1)}><span>←</span> Previous stage</button>
          <button disabled={stageIndex === commodity.stages.length - 1 || fullJourney} onClick={() => chooseStage(stageIndex + 1)}>Next stage <span>→</span></button>
          <button className={fullJourney ? "journey active" : "journey"} onClick={() => { setFullJourney(true); setSelected(null); }}>View full journey <span>↗</span></button>
          <button onClick={reset}>Reset view <span>↺</span></button>
        </div>

        <div className="legend"><span className="legend-node" style={{ borderColor: commodity.color }} /> Location <span className="legend-line" style={{ background: commodity.color }} /> Material flow</div>
        <p className="disclaimer">Illustrative educational flows. Locations and routes are simplified and are not real-time shipment data.</p>

        {selected && <aside className="info-panel" aria-label="Location information">
          <button className="close" onClick={() => setSelected(null)} aria-label="Close information panel">×</button>
          <p className="eyebrow">LOCATION PROFILE · {String(commodity.stages.find((s) => s.id === selected.stageId)?.order).padStart(2, "0")}</p>
          <h2>{selected.name}</h2><p className="country">{selected.country}</p>
          <div className="stage-pill"><span style={{ background: commodity.color }} />{commodity.stages.find((s) => s.id === selected.stageId)?.name}</div>
          <dl className="material-change"><div><dt>INPUT MATERIAL</dt><dd>{selected.input}</dd></div><span>→</span><div><dt>OUTPUT MATERIAL</dt><dd>{selected.output}</dd></div></dl>
          <Info title="Overview · What happens here" text={selected.description} />
          <Info title="Why this location matters" text={selected.whyItMatters} />
          <Info title="Inputs & outputs" text={`${selected.input} becomes ${selected.output}.`} />
          <Info title="Where it goes next" text={selected.nextStep} />
          <Info title="Downstream uses" text={downstreamCopy(selected.output)} last />
        </aside>}
      </section>
    </main>
  );
}

function downstreamCopy(output: string) {
  const normalized = output.toLowerCase();
  if (normalized.includes("cathode") || normalized.includes("copper")) return "Wire, motors, transformers, electronics and construction systems depend on this material moving onward.";
  if (normalized.includes("battery") || normalized.includes("cell")) return "Electric vehicles, grid storage and portable electronics turn these materials into stored energy.";
  if (normalized.includes("fuel") || normalized.includes("petroleum")) return "Mobility, aviation, shipping and chemical manufacturing draw on these products.";
  return "This output becomes an input for the next stage, connecting resource landscapes to everyday products.";
}

function Info({ title, text, last = false }: { title: string; text: string; last?: boolean }) {
  return <section className={`info-section${last ? " last" : ""}`}><h3>{title}</h3><p>{text}</p></section>;
}
