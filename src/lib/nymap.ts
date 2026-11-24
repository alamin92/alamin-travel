// Builds the New York region map at build time from public-domain US Census county shapes
// (the us-atlas package). Nothing is fetched in the browser.
import { feature, merge } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';
import topo from 'us-atlas/counties-10m.json';
import { regions, regionOfCounty } from './regions';

export interface MapRegion { id: string; name: string; d: string; cx: number; cy: number }

export function buildNyMap(width = 900, height = 640): MapRegion[] {
  const t = topo as any;
  const ny = t.objects.counties.geometries.filter((g: any) => String(g.id).startsWith('36'));
  const all = { type: 'FeatureCollection', features: ny.map((g: any) => feature(t, g)) } as any;
  const projection = geoMercator().fitExtent([[8, 8], [width - 8, height - 8]], all);
  const path = geoPath(projection);

  const missing = ny.filter((g: any) => !regionOfCounty[g.properties.name]).map((g: any) => g.properties.name);
  if (missing.length) throw new Error(`Counties without a region: ${missing.join(', ')}`);

  return regions.map((r) => {
    const geoms = ny.filter((g: any) => regionOfCounty[g.properties.name] === r.id);
    const shape = { type: 'Feature', properties: {}, geometry: merge(t, geoms) } as any;
    const [cx, cy] = path.centroid(shape);
    return { id: r.id, name: r.name, d: path(shape) ?? '', cx, cy };
  });
}
