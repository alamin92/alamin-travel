import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const linkTypes = ['official', 'nps', 'state-park', 'blm', 'recreation-gov', 'alltrails', 'conditions', 'reviews', 'other'] as const;
const link = z.object({
  type: z.enum(linkTypes),
  label: z.string(),
  url: z.string().url(),
});

const warning = z.object({
  type: z.enum(['reservation', 'parking', 'crowds', 'closure', 'weather', 'safety', 'drone', 'fees', 'other']),
  text: z.string(),
  // true = "verify before you go": not confirmed on an official page, or likely to change.
  verify: z.boolean().default(true),
});

const interests = ['family', 'adventure', 'nature', 'relax', 'photo', 'rough', 'history', 'culture', 'views', 'winter', 'short-time'] as const;

const places = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/places', generateId: ({ entry }) => entry.replace(/^.*\//, '').replace(/\.yaml$/, '') }),
  schema: z
    .object({
      name: z.string(),
      state: z.string().length(2),
      region: z.string(), // hub-level region id, e.g. "catskills"
      area: z.string(), // town or named area. Never a street address.
      // "visited" = the badge says "Alamin visited"; "researched" = "Researched guide".
      source: z.enum(['visited', 'researched']),
      lastChecked: z.coerce.date(), // required: the build fails without it
      officialUrl: z.string().url(), // required: the build fails without it
      links: z.array(link).default([]),
      mapQuery: z.string(), // search text for Google/Apple/Waze links
      // Approximate position (about 1 km). Used only to estimate drive time between stops, never shown as a pin.
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
      kind: z.enum(['hike', 'viewpoint', 'waterfall', 'park', 'activity', 'town', 'museum', 'drive', 'bridge']),
      interests: z.array(z.enum(interests)).default([]),
      difficulty: z.enum(['easy', 'moderate', 'hard', 'n/a']),
      timeMinutes: z.number().int().positive(), // typical visit, used by the planner
      bestSeason: z.array(z.enum(['spring', 'summer', 'fall', 'winter'])).default([]),
      familyFriendly: z.boolean(),
      cost: z.enum(['free', 'low', 'paid', 'varies']),
      costNote: z.string().optional(),
      highlight: z.boolean().default(false), // a must-see: the planner picks these first
      summary: z.string(),
      details: z.string().optional(),
      tips: z.array(z.string()).default([]), // first-hand tips: "visited" places only
      warnings: z.array(warning).default([]),
      photos: z.array(z.object({ src: z.string(), alt: z.string() })).max(2).default([]),
    })
    .refine((p) => p.source === 'visited' || p.tips.length === 0, {
      message: 'tips are first-hand notes and are only allowed on "visited" places',
    }),
});

const hubs = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/hubs' }),
  schema: z.object({
    name: z.string(),
    state: z.string().length(2),
    region: z.string(),
    blurb: z.string(),
    // Approximate typical drive times from the hub, in minutes (labeled "about").
    nearby: z.array(z.object({ place: z.string(), minutes: z.number().int().positive() })),
    checkBefore: z.array(link).default([]),
  }),
});

export const collections = { places, hubs };
