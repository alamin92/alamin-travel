// The place hierarchy: country > state (or province) > region > base town (hub) > place.
//
// Adding a new area later is data only:
//   - a new state:   add an entry to a country's `states` (with its official tourism regions).
//   - a new country: add an entry to `countries` and set `country` in its place/hub YAML files.
// Region ids must be unique across the whole site, because /regions/<id> is one flat route.
// Smaller levels (county, city) are already in the data: `county` on every place and hub,
// and hubs are the "city" level used by the planner.
import { regions as nyRegions, type Region } from './regions';

export interface StateArea { id: string; code: string; name: string; regions: Region[]; official?: string }
export interface Country { id: string; name: string; states: StateArea[] }

export const countries: Country[] = [
  {
    id: 'us',
    name: 'United States',
    states: [
      { id: 'ny', code: 'NY', name: 'New York', regions: nyRegions, official: 'https://www.iloveny.com/' },
    ],
  },
];

export const countryById = Object.fromEntries(countries.map((c) => [c.id, c]));
export const allStates = countries.flatMap((c) => c.states.map((s) => ({ ...s, country: c.id })));

// A place stores `country` ("us") and `state` ("NY"). These turn that pair into the area objects.
export const findState = (country: string, code: string) =>
  countryById[country]?.states.find((s) => s.code === code);

export const regionArea: Record<string, { country: string; state: string; stateId: string }> = Object.fromEntries(
  countries.flatMap((c) => c.states.flatMap((s) => s.regions.map((r) => [r.id, { country: c.id, state: s.code, stateId: s.id }]))),
);
