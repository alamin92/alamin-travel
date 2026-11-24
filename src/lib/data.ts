import { getCollection } from 'astro:content';
import type { PlaceData, HubData } from './planner';

// Build-time loaders that turn content collections into plain, JSON-safe objects.
export async function loadPlaces(): Promise<PlaceData[]> {
  const entries = await getCollection('places');
  return entries
    .map((e) => ({ id: e.id, ...e.data, lastChecked: e.data.lastChecked.toISOString().slice(0, 10) }) as PlaceData)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadHubs(): Promise<HubData[]> {
  const entries = await getCollection('hubs');
  return entries.map((e) => ({ id: e.id, ...e.data }) as HubData).sort((a, b) => a.name.localeCompare(b.name));
}

export const SCENARIO_DAYS = [1, 2, 3, 4, 5, 7];
export const scenarioSlug = (n: number) => `${n}-${n === 1 ? 'day' : 'days'}`;
