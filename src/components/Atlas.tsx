"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
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
        <div className="brand"><span className="brand-mark" aria-hidden="true">MW</span><div><h1>MATERIAL WORLD</h1><p>See how the physical world is made.</p></div></div>
        <nav className="commodity-tabs" aria-label="Choose a material">
          {commodities.map((item) => <button key={item.id} className={item.id === commodity.id ? "active" : ""} onClick={() => chooseCommodity(item.id)}>{item.name}</button>)}
        </nav>
        <button className="about-button" title="An educational atlas of global material supply chains">ABOUT</button>
      </header>

      <section className="map-area">
        <WorldMap commodity={commodity} stageId={stage.id} fullJourney={fullJourney} selected={selected} onSelect={setSelected} resetToken={resetToken} />

        <div className="context-card">
          <p className="eyebrow">{fullJourney ? "THE COMPLETE JOURNEY" : `STAGE ${stage.order} OF ${commodity.stages.length}`}</p>
          <div className="context-title"><span className="material-swatch" style={{ background: fullJourney ? commodity.color : stage.accent }} /> <h2>{commodity.name}</h2><span className="divider">/</span><h3>{fullJourney ? "Source to society" : stage.name}</h3></div>
          <p>{fullJourney ? commodity.shortDescription : stage.stageDescription}</p>
          {!fullJourney && <div className="transformation"><span>TRANSFORMATION</span><strong>{stage.keyTransformation}</strong></div>}
          {fullJourney && <div className="material-sequence" aria-label="Material transformation sequence">
            {commodity.stages.map((item, index) => <span key={item.id}><i style={{ color: item.accent }}>{item.icon}</i>{item.descriptor}{index < commodity.stages.length - 1 && <b>→</b>}</span>)}
          </div>}
        </div>

        <div className="stage-rail" aria-label="Supply chain stages">
          {commodity.stages.map((item, index) => <button key={item.id} style={{ "--stage-accent": item.accent } as CSSProperties} onClick={() => chooseStage(index)} className={!fullJourney && index === stageIndex ? "active" : index < stageIndex || fullJourney ? "passed" : ""}>
            <span className="stage-icon">{item.icon}</span><span className="stage-copy"><span className="stage-number">{String(item.order).padStart(2, "0")} · {item.descriptor}</span><span className="stage-name">{item.name}</span></span>
          </button>)}
        </div>

        <div className="map-actions">
          <button disabled={stageIndex === 0 || fullJourney} onClick={() => chooseStage(stageIndex - 1)}><span>←</span> Previous stage</button>
          <button disabled={stageIndex === commodity.stages.length - 1 || fullJourney} onClick={() => chooseStage(stageIndex + 1)}>Next stage <span>→</span></button>
          <button className={fullJourney ? "journey active" : "journey"} onClick={() => { setFullJourney(true); setSelected(null); }}>View full journey <span>↗</span></button>
          <button onClick={reset}>Reset view <span>↺</span></button>
        </div>

        <div className="legend"><span className="legend-node" style={{ borderColor: stage.accent }} /> Transformation site <span className="legend-line" style={{ background: stage.accent }} /> Direction of flow</div>
        <p className="disclaimer">Illustrative educational flows. Locations and routes are simplified and are not real-time shipment data.</p>

        {selected && <aside className="info-panel" aria-label="Location information">
          <button className="close" onClick={() => setSelected(null)} aria-label="Close information panel">×</button>
          <p className="eyebrow">FIELD NOTE · {String(commodity.stages.find((s) => s.id === selected.stageId)?.order).padStart(2, "0")}</p>
          <h2>{selected.name}</h2><p className="country">{selected.country}</p>
          <div className="stage-pill"><span style={{ background: commodity.stages.find((s) => s.id === selected.stageId)?.accent }} />{commodity.stages.find((s) => s.id === selected.stageId)?.name}</div>
          <p className="panel-overview">{selected.overview}</p>
          <Info title="What happens here" text={selected.processDetails} />
          <Info title="Why this location matters" text={selected.whyItMatters} />
          <div className="input-output-grid"><ChipGroup title="Primary inputs" items={selected.primaryInputs} /><ChipGroup title="Outputs" items={selected.outputs} /></div>
          {selected.secondaryInputs.length > 0 && <ChipGroup title="Also required" items={selected.secondaryInputs} />}
          <ChipGroup title="Dependencies" items={selected.dependencies} subdued />
          <Info title="Where it goes next" text={selected.whatHappensNext} />
          <ChipGroup title="End uses & industries" items={[...selected.downstreamUses, ...selected.industriesServed]} last />
        </aside>}
      </section>
    </main>
  );
}

function Info({ title, text, last = false }: { title: string; text: string; last?: boolean }) {
  return <section className={`info-section${last ? " last" : ""}`}><h3>{title}</h3><p>{text}</p></section>;
}

function ChipGroup({ title, items, subdued = false, last = false }: { title: string; items: string[]; subdued?: boolean; last?: boolean }) {
  return <section className={`chip-group${subdued ? " subdued" : ""}${last ? " last" : ""}`}><h3>{title}</h3><div>{[...new Set(items)].map((item) => <span key={item}>{item}</span>)}</div></section>;
}
