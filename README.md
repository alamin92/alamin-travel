# alamin-travel

Free, static travel-planning site for travel.alaminh.com. Astro, deployed to Cloudflare as static files. No accounts, no live data, no saved plans.

## Run it

```
npm install
npm run dev      # http://localhost:4321 (or pass --port 8081)
npm run build    # runs the privacy check, then builds to dist/
```

## Where things live

- `src/content/places/ny/*.yaml`: one file per place. The schema is in `src/content.config.ts`. The build fails without `lastChecked` and `officialUrl`.
- `src/content/hubs/*.yaml`: base towns, with approximate drive times to nearby places.
- `src/lib/regions.ts`: the 11 I LOVE NY vacation regions by county. Places and hubs must name a county that belongs to their region, or the build fails. `src/lib/nymap.ts` draws the region map from Census county shapes at build time.
- `src/data/saved-places.ts` and `src/data/photos.ts`: the saved Google Maps places list and photo albums (shown at /my-lists and /photos).
- `src/lib/planner.ts`: the rule-based planner and the document model behind the HTML, text and Word downloads.
- `scripts/check-privacy.mjs`: fails the build on street addresses or banned names. Banned names live in `notes/banned-terms.txt`, which is gitignored along with the rest of `notes/`.

## Rules for content

- "visited" means Alamin went there. `tips` (first-hand notes) are only allowed on visited places.
- Researched entries are written in our own words. Anything unconfirmed gets `verify: true`.
- Never publish street addresses, Airbnb details or personal names. Use the town or the named place.

## Areas (country, state, region)

`src/lib/areas.ts` holds the hierarchy: country > state > region > base town > place. Adding a state is data only (a new entry with its official tourism regions, then YAML places with `country` and `state`). Region ids must be unique site-wide. The area picker (planner and home page) and the browse filters read this tree, and hide any level that has only one choice.

Current states: New York, Connecticut, Massachusetts and Rhode Island. Each state has its tourism regions in `src/lib/regions.ts` (by county), its map is drawn at build time by `src/lib/statemap.ts`, and places live in `src/content/places/<state>/`. To add a state: add its regions, an entry in `src/lib/areas.ts`, its FIPS code in `src/components/StateMap.astro`, then places and base towns (hubs).
