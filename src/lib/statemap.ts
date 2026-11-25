// Builds a state's region map at build time from public-domain US Census county shapes
// (the us-atlas package). Nothing is fetched in the browser.
import { feature, merge } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';
import topo from 'us-atlas/counties-10m.json';
import { regions, regionOfCounty } from './regions';

export interface MapRegion { id: string; name: string; d: string; cx: number; cy: number }
export interface StateMapData { regions: MapRegion[]; viewBox: string; vbWidth: number }

// The map is fitted into a width x height box. With `crop` the view box then shrinks to the state's own shape.
export function buildStateMap(stateCode: string, fips: string, width = 900, height = 640, crop = false): StateMapData {
  const t = topo as any;
  const geoms = t.objects.counties.geometries.filter((g: any) => String(g.id).startsWith(fips));
  const all = { type: 'FeatureCollection', features: geoms.map((g: any) => feature(t, g)) } as any;
  const projection = geoMercator();
  projection.fitExtent([[8, 8], [width - 8, height - 8]], all);
  const path = geoPath(projection);
  const [[x0, y0], [x1, y1]] = path.bounds(all);
  const pad = 10;
  const vb = crop ? [Math.floor(x0 - pad), Math.floor(y0 - pad), Math.ceil(x1 - x0 + 2 * pad), Math.ceil(y1 - y0 + 2 * pad)] : [0, 0, width, height + 20];

  const missing = geoms.filter((g: any) => !regionOfCounty[`${stateCode}:${g.properties.name}`]).map((g: any) => g.properties.name);
  if (missing.length) throw new Error(`Counties without a region in ${stateCode}: ${missing.join(', ')}`);

  const out = regions.filter((r) => r.state === stateCode).map((r) => {
    const mine = geoms.filter((g: any) => regionOfCounty[`${stateCode}:${g.properties.name}`] === r.id);
    const shape = { type: 'Feature', properties: {}, geometry: merge(t, mine) } as any;
    const [cx, cy] = path.centroid(shape);
    return { id: r.id, name: r.name, d: path(shape) ?? '', cx, cy };
  });
  return { regions: out, viewBox: vb.join(' '), vbWidth: vb[2] };
}
