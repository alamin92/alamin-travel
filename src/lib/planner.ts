// Rule-based trip planner. Pure functions, no browser or Astro imports, so the same
// code builds the static "X days" pages at build time and the live planner in the browser.
import { formatMinutes, mapLinks } from './maps';
import { interestLabels, difficultyLabels, costLabels, seasonLabels, warningLabels } from './labels';

export type Detail = 'short' | 'medium' | 'detailed';
export type Pace = 'relaxed' | 'normal' | 'packed';

export interface Link { type: string; label: string; url: string }
export interface Warning { type: string; text: string; verify: boolean }
export interface PlaceData {
  id: string; name: string; country: string; state: string; region: string; area: string; source: 'visited' | 'researched';
  county: string; alsoRegions: string[]; lastChecked: string; officialUrl: string; links: Link[]; mapQuery: string; lat: number; lon: number; kind: string;
  interests: string[]; difficulty: string; timeMinutes: number; bestSeason: string[];
  familyFriendly: boolean; cost: string; costNote?: string; highlight: boolean;
  summary: string; details?: string; tips: string[]; warnings: Warning[];
}
export interface HubData {
  id: string; name: string; country: string; state: string; region: string; county: string; alsoRegions: string[]; mode: 'drive' | 'transit'; blurb: string;
  nearby: { place: string; minutes: number }[]; checkBefore: Link[];
}

export interface PlanOptions { days: number; interests: string[]; pace: Pace; familyOnly: boolean }

export type PlanItem =
  | { kind: 'stop'; place: PlaceData; start: number; visit: number; drive: number; driveFrom: string }
  | { kind: 'lunch'; start: number; minutes: number };

export interface PlanDay { n: number; free: boolean; title: string; items: PlanItem[]; driveTotal: number; totalMinutes: number; end: number }
export interface Plan {
  hub: HubData; options: PlanOptions; days: PlanDay[];
  extras: { place: PlaceData; minutes: number }[];
  mustBook: { place: string; type: string; text: string; verify: boolean }[];
  packing: string[]; oldestChecked: string;
}

const PACE = {
  relaxed: { cap: 360, start: 9 * 60 + 30, label: 'Relaxed' },
  normal: { cap: 480, start: 9 * 60, label: 'Normal' },
  packed: { cap: 600, start: 8 * 60, label: 'Packed' },
} as const;
export const paceLabels: Record<Pace, string> = { relaxed: 'Relaxed', normal: 'Normal', packed: 'Packed' };
export const detailLabels: Record<Detail, string> = { short: 'Short', medium: 'Medium', detailed: 'Detailed' };

const LUNCH = 60;

// Rough drive time between two places, from approximate coordinates:
// straight-line distance x 1.3 for roads, at about 60 km/h, rounded to 5 minutes. Labeled "about".
function driveBetween(a: PlaceData, b: PlaceData) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  const km = 2 * R * Math.asin(Math.sqrt(h));
  return Math.max(10, Math.round(((km * 1.3) / 60) * 12) * 5);
}
const MAX_HOP = 45; // never put two stops in one day if they are further apart than this

interface Cand { place: PlaceData; minutes: number }

// Visit order: start nearest the base, then always go to the closest unvisited stop.
function orderRoute(group: Cand[]): Cand[] {
  const left = [...group].sort((a, b) => a.minutes - b.minutes);
  const route = [left.shift()!];
  while (left.length) {
    const last = route[route.length - 1];
    let best = 0;
    for (let i = 1; i < left.length; i++) if (driveBetween(last.place, left[i].place) < driveBetween(last.place, left[best].place)) best = i;
    route.push(left.splice(best, 1)[0]);
  }
  return route;
}

function dayLoad(group: Cand[]) {
  const r = orderRoute(group);
  let hops = 0;
  for (let i = 1; i < r.length; i++) hops += driveBetween(r[i - 1].place, r[i].place);
  const visits = r.reduce((s, c) => s + c.place.timeMinutes, 0);
  const drive = r[0].minutes + hops + r[r.length - 1].minutes;
  return { drive, visits, total: drive + visits + (visits >= 180 ? LUNCH : 0) };
}

export function buildPlan(hub: HubData, places: Record<string, PlaceData>, o: PlanOptions): Plan {
  const pace = PACE[o.pace];
  let cands: Cand[] = hub.nearby
    .map((n) => ({ place: places[n.place], minutes: n.minutes }))
    .filter((c) => c.place && (!o.familyOnly || c.place.familyFriendly));

  const score = (c: Cand) => {
    const matches = o.interests.length ? c.place.interests.filter((i) => o.interests.includes(i)).length : 0;
    // All-day expeditions (longer than the pace allows) go last, so they only fill a day when nothing else is left.
    const tooLong = c.place.timeMinutes > pace.cap ? 6 : 0;
    return (c.place.highlight ? 3 : 0) + matches * 2 + (c.place.source === 'visited' ? 0.5 : 0) - c.minutes / 200 - tooLong;
  };
  cands.sort((a, b) => score(b) - score(a));
  // With interests chosen, skip places that match none of them (unless nothing matches at all).
  if (o.interests.length) {
    const matching = cands.filter((c) => c.place.interests.some((i) => o.interests.includes(i)));
    if (matching.length) cands = matching;
  }

  const remaining = [...cands];
  const days: PlanDay[] = [];
  for (let n = 1; n <= o.days; n++) {
    if (!remaining.length) {
      days.push({ n, free: true, title: 'Free day', items: [], driveTotal: 0, totalMinutes: 0, end: 0 });
      continue;
    }
    const seed = remaining.shift()!;
    const group = [seed];
    for (let i = 0; i < remaining.length; ) {
      const c = remaining[i];
      const near = group.some((g) => driveBetween(g.place, c.place) <= MAX_HOP);
      if (near && dayLoad([...group, c]).total <= pace.cap) {
        group.push(c);
        remaining.splice(i, 1);
      } else i++;
    }
    const route = orderRoute(group);

    const items: PlanItem[] = [];
    let t = pace.start;
    let lunchDone = false;
    let driveTotal = 0;
    route.forEach((c, i) => {
      if (i > 0 && t >= 11 * 60 + 30 && !lunchDone) {
        items.push({ kind: 'lunch', start: t, minutes: LUNCH });
        t += LUNCH;
        lunchDone = true;
      }
      const drive = i === 0 ? c.minutes : driveBetween(route[i - 1].place, c.place);
      t += drive;
      driveTotal += drive;
      items.push({ kind: 'stop', place: c.place, start: t, visit: c.place.timeMinutes, drive, driveFrom: i === 0 ? hub.name : 'the previous stop' });
      t += c.place.timeMinutes;
    });
    const back = route[route.length - 1].minutes;
    driveTotal += back;
    t += back;
    const names = route.map((c) => c.place.name.replace(/\s*\(.*\)$/, '').split(/ and |: /)[0]);
    const title = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]}, ${names[1]} and more`;
    days.push({ n, free: false, title, items, driveTotal, totalMinutes: t - pace.start, end: t });
  }

  const stops = days.flatMap((d) => d.items.filter((i): i is Extract<PlanItem, { kind: 'stop' }> => i.kind === 'stop')).map((i) => i.place);
  const mustBook = stops.flatMap((p) =>
    p.warnings.filter((w) => ['reservation', 'parking', 'closure'].includes(w.type)).map((w) => ({ place: p.name, type: w.type, text: w.text, verify: w.verify }))
  );
  const packing = [
    'Water and snacks. Restrooms can be far apart, so use one whenever you get the chance.',
    'Phone charger or power bank, and offline maps downloaded before you go (signal can be weak).',
    'Layers: weather changes quickly, especially in the mountains.',
    'A saved or printed copy of this plan, plus any tickets or reservations.',
  ];
  if (stops.some((p) => ['hike', 'waterfall', 'park'].includes(p.kind))) packing.push('Comfortable shoes with good grip. Gorges and trails are wet and rocky.');
  if (stops.some((p) => p.bestSeason.includes('winter') || p.warnings.some((w) => /\b(ice|icy|winter|snow)\b/i.test(w.text))))
    packing.push('For winter: traction devices (microspikes), warm waterproof boots, and extra time for snowy roads.');

  const oldestChecked = stops.map((p) => p.lastChecked).sort()[0] ?? '';
  // Only the best few leftovers, so the "more time" list stays short in areas with many places.
  const extras = [...remaining].sort((a, b) => Number(b.place.highlight) - Number(a.place.highlight) || a.minutes - b.minutes).slice(0, 8);
  return { hub, options: o, days, extras, mustBook, packing, oldestChecked };
}

// ---------- Document model: one source of content for HTML, text and Word ----------

export type Inline = string | { text: string; url: string };
export type Block =
  | { t: 'h1' | 'h2' | 'h3'; text: string }
  | { t: 'p'; parts: Inline[]; cls?: 'muted' | 'warn' }
  | { t: 'ul'; items: Inline[][] };

export function formatClock(m: number) {
  const h = Math.floor(m / 60) % 24;
  const mm = String(m % 60).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}
const cap1 = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function buildDoc(plan: Plan, detail: Detail): Block[] {
  const { hub, options: o } = plan;
  const b: Block[] = [];
  const med = detail !== 'short';
  const full = detail === 'detailed';

  b.push({ t: 'h1', text: `${o.days} ${o.days === 1 ? 'day' : 'days'} near ${hub.name}` });
  const interests = o.interests.length ? o.interests.map((i) => interestLabels[i] ?? i).join(', ') : 'any';
  b.push({ t: 'p', cls: 'muted', parts: [`Base: ${hub.name} · ${paceLabels[o.pace]} pace · Interests: ${interests}${o.familyOnly ? ' · Family-friendly places only' : ''}`] });
  b.push({ t: 'p', cls: 'muted', parts: [`${hub.mode === 'transit' ? 'Travel' : 'Drive'} times are approximate. Check the official page for each place before you go, since hours, prices and reservation rules change.`] });

  if (plan.mustBook.length) {
    b.push({ t: 'h2', text: 'Book or check first' });
    b.push({
      t: 'ul',
      items: plan.mustBook.map((m) => [`${m.place} (${(warningLabels[m.type] ?? m.type).toLowerCase()}): ${m.text}${m.verify ? ' Verify before you go.' : ''}`]),
    });
  }

  for (const d of plan.days) {
    b.push({ t: 'h2', text: `Day ${d.n}: ${d.title}` });
    if (d.free) {
      b.push({ t: 'p', parts: [`Rest, explore ${hub.name} at your own pace, or revisit a favorite from an earlier day.`] });
      continue;
    }
    if (med) b.push({ t: 'p', cls: 'muted', parts: [`About ${formatMinutes(d.totalMinutes)} in total, including about ${formatMinutes(d.driveTotal)} of driving. Starts around ${formatClock(d.end - d.totalMinutes)}.`] });

    if (!med) {
      b.push({
        t: 'ul',
        items: d.items.map((i) => i.kind === 'lunch' ? [`${formatClock(i.start)}  Lunch break`] : [`${formatClock(i.start)}  ${i.place.name} (about ${formatMinutes(i.visit)})`]),
      });
      continue;
    }

    for (const i of d.items) {
      if (i.kind === 'lunch') {
        b.push({ t: 'p', parts: [`${formatClock(i.start)}  Lunch break (about ${formatMinutes(i.minutes)}). Eat nearby or bring a picnic.`] });
        continue;
      }
      const p = i.place;
      b.push({ t: 'p', cls: 'muted', parts: [`${hub.mode === 'transit' ? 'Travel' : 'Drive'} about ${formatMinutes(i.drive)} from ${i.driveFrom}.`] });
      b.push({ t: 'h3', text: `${formatClock(i.start)}  ${p.name} (about ${formatMinutes(i.visit)})` });
      b.push({ t: 'p', cls: 'muted', parts: [`${p.source === 'visited' ? 'Alamin visited' : 'Researched guide'} · ${p.area} · last checked ${p.lastChecked}`] });
      b.push({ t: 'p', parts: [p.summary] });
      const warns = full ? p.warnings : p.warnings.filter((w) => ['reservation', 'parking', 'closure', 'crowds', 'fees'].includes(w.type));
      if (warns.length) b.push({ t: 'ul', items: warns.map((w) => [`${warningLabels[w.type] ?? w.type}: ${w.text}${w.verify ? ' (verify before you go)' : ''}`]) });
      const m = mapLinks(p.mapQuery);
      b.push({ t: 'p', parts: ['Directions: ', { text: 'Google Maps', url: m.google }, '  ', { text: 'Apple Maps', url: m.apple }, '  ', { text: 'Waze', url: m.waze }] });
      if (full) {
        const facts = [
          `Difficulty: ${difficultyLabels[p.difficulty] ?? p.difficulty}`,
          `Family friendly: ${p.familyFriendly ? 'yes' : 'not ideal'}`,
          `Cost: ${costLabels[p.cost] ?? p.cost}${p.costNote ? ` (${p.costNote})` : ''}`,
        ];
        if (p.bestSeason.length) facts.push(`Best season: ${p.bestSeason.map((s) => seasonLabels[s] ?? s).join(', ')}`);
        b.push({ t: 'p', parts: [facts.join(' · ')] });
        if (p.details) b.push({ t: 'p', parts: [p.details] });
        if (p.tips.length) {
          b.push({ t: 'p', parts: ["Alamin's notes:"] });
          b.push({ t: 'ul', items: p.tips.map((t) => [t]) });
        }
        const links: Inline[][] = [[{ text: 'Official page', url: p.officialUrl }]];
        for (const l of p.links) if (l.url !== p.officialUrl) links.push([{ text: l.label, url: l.url }]);
        b.push({ t: 'ul', items: links });
      }
    }
  }

  if (plan.extras.length) {
    b.push({ t: 'h2', text: 'If you have more time' });
    b.push({ t: 'ul', items: plan.extras.map((e) => [`${e.place.name}: about ${formatMinutes(e.minutes)} from ${hub.name}`]) });
  }

  b.push({ t: 'h2', text: 'Check before you go' });
  b.push({ t: 'ul', items: hub.checkBefore.map((l) => [{ text: l.label, url: l.url }]) });

  if (med) {
    b.push({ t: 'h2', text: 'Pack and remember' });
    b.push({ t: 'ul', items: plan.packing.map((s) => [s]) });
  }

  b.push({
    t: 'p', cls: 'muted',
    parts: [`Made with travel.alaminh.com. Place details last checked on or after ${plan.oldestChecked}. Outdoor activities carry risk: check official pages, conditions and closures before you go.`],
  });
  return b;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inlineHtml = (parts: Inline[]) =>
  parts.map((p) => (typeof p === 'string' ? esc(p) : `<a href="${esc(p.url)}" rel="noopener">${esc(p.text)}</a>`)).join('');

export function docToHtml(blocks: Block[]): string {
  return blocks
    .map((x) => {
      if (x.t === 'p') return `<p${x.cls ? ` class="${x.cls}"` : ''}>${inlineHtml(x.parts)}</p>`;
      if (x.t === 'ul') return `<ul>${x.items.map((it) => `<li>${inlineHtml(it)}</li>`).join('')}</ul>`;
      return `<${x.t}>${esc(x.text)}</${x.t}>`;
    })
    .join('\n');
}

const inlineText = (parts: Inline[]) => parts.map((p) => (typeof p === 'string' ? p : `${p.text} (${p.url})`)).join('');

export function docToText(blocks: Block[]): string {
  const out: string[] = [];
  for (const x of blocks) {
    if (x.t === 'h1') out.push(x.text.toUpperCase(), '='.repeat(x.text.length), '');
    else if (x.t === 'h2') out.push('', x.text.toUpperCase(), '-'.repeat(x.text.length));
    else if (x.t === 'h3') out.push('', x.text);
    else if (x.t === 'p') out.push(inlineText(x.parts));
    else if (x.t === 'ul') for (const it of x.items) out.push(`  - ${inlineText(it)}`);
  }
  return out.join('\n') + '\n';
}
