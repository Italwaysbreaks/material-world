"use client";

import { useEffect, useRef } from "react";
import maplibregl, { LngLatBoundsLike, Map as MapLibreMap, Marker } from "maplibre-gl";

export type MaterialMapLocation = { id: string; slug: string; name: string; country: string; latitude: number; longitude: number; role: string };
export type MaterialMapFlow = { id: string; from: string; to: string; mode: string; label: string; provenance: string };

const style = {
  version: 8 as const,
  sources: { countries: { type: "geojson" as const, data: "/data/countries.geo.json" } },
  layers: [
    { id: "ocean", type: "background" as const, paint: { "background-color": "#9fc4ca" } },
    { id: "land", type: "fill" as const, source: "countries", paint: { "fill-color": "#d9dacd" } },
    { id: "borders", type: "line" as const, source: "countries", paint: { "line-color": "#687a75", "line-width": 0.7, "line-opacity": 0.72 } },
  ],
};

function arc(a: MaterialMapLocation, b: MaterialMapLocation) {
  let delta = b.longitude - a.longitude;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return Array.from({ length: 25 }, (_, index) => { const t = index / 24; return [a.longitude + delta * t, a.latitude + (b.latitude - a.latitude) * t + Math.sin(Math.PI * t) * Math.min(Math.abs(delta) * .1, 16)]; });
}

export function MaterialMap({ name, locations, flows }: { name: string; locations: MaterialMapLocation[]; flows: MaterialMapFlow[] }) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const activeMarkers: Marker[] = [];
    const map = new maplibregl.Map({ container: host.current, style, center: [12, 22], zoom: 1.3, minZoom: 1, maxZoom: 7, attributionControl: false });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;
    map.on("load", () => {
      const byId = new Map(locations.map((location) => [location.id, location]));
      const features = flows.flatMap((flow) => { const from = byId.get(flow.from), to = byId.get(flow.to); return from && to ? [{ type: "Feature" as const, properties: { label: flow.label }, geometry: { type: "LineString" as const, coordinates: arc(from, to) } }] : []; });
      map.addSource("product-flows", { type: "geojson", data: { type: "FeatureCollection", features } });
      map.addLayer({ id: "product-flow-lines", type: "line", source: "product-flows", paint: { "line-color": "#217587", "line-width": 2.5, "line-dasharray": [2, 1], "line-opacity": .88 } });
      map.addLayer({ id: "product-flow-arrows", type: "symbol", source: "product-flows", layout: { "symbol-placement": "line", "symbol-spacing": 95, "text-field": "›", "text-size": 20, "text-rotation-alignment": "map" }, paint: { "text-color": "#164f5b", "text-halo-color": "#d9dacd", "text-halo-width": 1 } });
      locations.forEach((location) => {
        const el = document.createElement("a"); el.className = "product-map-marker"; el.href = `/locations/${location.slug}`; el.title = `${location.name}, ${location.country} · ${location.role}`; el.setAttribute("aria-label", el.title);
        el.innerHTML = `<span></span><b>${location.name}</b>`;
        const marker = new maplibregl.Marker({ element: el, anchor: "left" }).setLngLat([location.longitude, location.latitude]).addTo(map);
        activeMarkers.push(marker); markers.current = activeMarkers;
      });
      if (locations.length) { const bounds = new maplibregl.LngLatBounds(); locations.forEach((location) => bounds.extend([location.longitude, location.latitude])); map.fitBounds(bounds as LngLatBoundsLike, { padding: 65, maxZoom: 3.3, duration: 0 }); }
    });
    return () => { activeMarkers.forEach((marker) => marker.remove()); map.remove(); mapRef.current = null; };
  }, [flows, locations]);
  return <div className="material-map" ref={host} aria-label={`${name} geography map`} />;
}
