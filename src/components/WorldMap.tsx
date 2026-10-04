"use client";

import { useEffect, useRef } from "react";
import maplibregl, { LngLatBoundsLike, Map as MapLibreMap, Marker } from "maplibre-gl";
import type { Commodity, Location } from "@/data/commodities";

type Props = { commodity: Commodity; stageId: string; fullJourney: boolean; selected: Location | null; onSelect: (location: Location) => void; resetToken: number };

function route(from: Location, to: Location) {
  const points: [number, number][] = [];
  let delta = to.longitude - from.longitude;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  const bend = Math.min(Math.abs(delta) * 0.12, 18);
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const lng = from.longitude + delta * t;
    const lat = from.latitude + (to.latitude - from.latitude) * t + Math.sin(Math.PI * t) * bend;
    points.push([lng, lat]);
  }
  return points;
}

export function WorldMap({ commodity, stageId, fullJourney, selected, onSelect, resetToken }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const selectRef = useRef(onSelect);

  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: host.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [16, 20], zoom: 1.45, minZoom: 1.1, maxZoom: 8,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (map.getLayer("journey-arrows")) map.removeLayer("journey-arrows");
      if (map.getLayer("journey-lines")) map.removeLayer("journey-lines");
      if (map.getSource("journey")) map.removeSource("journey");

      const activeFlows = fullJourney ? commodity.flows : commodity.flows.filter((f) => f.stageId === stageId);
      const stageLocations = commodity.locations.filter((l) => fullJourney || l.stageId === stageId);
      const visibleIds = new Set(stageLocations.map((l) => l.id));
      activeFlows.forEach((f) => { visibleIds.add(f.fromLocationId); visibleIds.add(f.toLocationId); });
      const visibleLocations = commodity.locations.filter((l) => visibleIds.has(l.id));

      const features = activeFlows.map((flow) => {
        const from = commodity.locations.find((l) => l.id === flow.fromLocationId)!;
        const to = commodity.locations.find((l) => l.id === flow.toLocationId)!;
        return { type: "Feature" as const, properties: { material: flow.material }, geometry: { type: "LineString" as const, coordinates: route(from, to) } };
      });
      map.addSource("journey", { type: "geojson", data: { type: "FeatureCollection", features } });
      map.addLayer({ id: "journey-lines", type: "line", source: "journey", paint: { "line-color": commodity.color, "line-width": ["interpolate", ["linear"], ["zoom"], 1, 1.4, 5, 3], "line-opacity": 0.72 } });
      map.addLayer({ id: "journey-arrows", type: "symbol", source: "journey", layout: { "symbol-placement": "line", "symbol-spacing": 110, "text-field": "›", "text-size": 20, "text-keep-upright": false, "text-rotation-alignment": "map" }, paint: { "text-color": commodity.color, "text-halo-color": "#f3f1eb", "text-halo-width": 1.5 } });

      visibleLocations.forEach((location) => {
        const el = document.createElement("button");
        el.className = `map-marker${selected?.id === location.id ? " is-selected" : ""}`;
        el.style.setProperty("--material", commodity.color);
        el.setAttribute("aria-label", `${location.name}, ${location.country}`);
        el.innerHTML = `<span>${commodity.stages.find((s) => s.id === location.stageId)?.order}</span>`;
        el.onclick = () => selectRef.current(location);
        const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([location.longitude, location.latitude]).addTo(map);
        markersRef.current.push(marker);
      });

      if (visibleLocations.length) {
        const bounds = new maplibregl.LngLatBounds();
        visibleLocations.forEach((l) => bounds.extend([l.longitude, l.latitude]));
        map.fitBounds(bounds as LngLatBoundsLike, { padding: { top: 150, bottom: 90, left: 80, right: selected ? 440 : 80 }, maxZoom: fullJourney ? 2.2 : 4.3, duration: 900 });
      }
    };
    if (map.loaded()) update(); else map.once("load", update);
  }, [commodity, stageId, fullJourney, selected?.id, resetToken]);

  return <div ref={host} className="map-canvas" aria-label="Interactive world map of material flows" />;
}
