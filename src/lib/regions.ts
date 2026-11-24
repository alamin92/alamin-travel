// The 11 I LOVE NY vacation regions, defined by county (the same way the official map is drawn).
// County lists were worked out from the I LOVE NY region map and the regional destination
// lists published by NYSTIA. Counties near a boundary are the easiest to get wrong, so
// treat the map as a guide and the official I LOVE NY pages as the authority.

export interface Region { id: string; name: string; blurb: string; counties: string[]; official: string }

export const regions: Region[] = [
  {
    id: 'adirondacks', name: 'Adirondacks',
    blurb: 'Big mountains, lakes and forest in the northeast: hiking, paddling, skiing and the Lake Placid and Lake George areas.',
    counties: ['Clinton', 'Essex', 'Franklin', 'Hamilton', 'Warren'], official: 'https://www.iloveny.com/regions/adirondacks/',
  },
  {
    id: 'capital-saratoga', name: 'Capital-Saratoga',
    blurb: 'Albany, Schenectady and Saratoga Springs: state history, museums, spas and easy day trips to the Helderbergs.',
    counties: ['Albany', 'Fulton', 'Rensselaer', 'Saratoga', 'Schenectady', 'Washington'], official: 'https://www.iloveny.com/regions/capital-saratoga/',
  },
  {
    id: 'catskills', name: 'The Catskills',
    blurb: 'Waterfalls, scenic overlooks, fire-tower hikes, ski mountains and quiet small towns.',
    counties: ['Delaware', 'Greene', 'Sullivan'], official: 'https://www.iloveny.com/regions/catskills/',
  },
  {
    id: 'central-ny', name: 'Central New York',
    blurb: 'Quiet countryside, small villages, Cooperstown, craft drinks and caves.',
    counties: ['Broome', 'Chenango', 'Herkimer', 'Madison', 'Montgomery', 'Oneida', 'Otsego', 'Schoharie'], official: 'https://www.iloveny.com/regions/central-new-york/',
  },
  {
    id: 'chautauqua-allegheny', name: 'Chautauqua-Allegheny',
    blurb: 'The southwest corner: Lake Erie and Chautauqua Lake, Allegany State Park, culture and some of the state\'s best fishing.',
    counties: ['Allegany', 'Cattaraugus', 'Chautauqua'], official: 'https://www.iloveny.com/regions/chautauqua-allegheny/',
  },
  {
    id: 'finger-lakes', name: 'Finger Lakes',
    blurb: 'Eleven long lakes with gorges, waterfalls, wineries and cities such as Ithaca, Rochester and Syracuse.',
    counties: ['Cayuga', 'Chemung', 'Cortland', 'Livingston', 'Monroe', 'Onondaga', 'Ontario', 'Schuyler', 'Seneca', 'Steuben', 'Tioga', 'Tompkins', 'Wayne', 'Yates'], official: 'https://www.iloveny.com/regions/finger-lakes/',
  },
  {
    id: 'greater-niagara', name: 'Greater Niagara',
    blurb: 'Niagara Falls and Buffalo, plus the countryside and the Letchworth gorge to the east.',
    counties: ['Erie', 'Genesee', 'Niagara', 'Orleans', 'Wyoming'], official: 'https://www.iloveny.com/regions/greater-niagara/',
  },
  {
    id: 'hudson-valley', name: 'Hudson Valley',
    blurb: 'River towns, mansions, Highlands and Shawangunk hikes, farms, cideries and art.',
    counties: ['Columbia', 'Dutchess', 'Orange', 'Putnam', 'Rockland', 'Ulster', 'Westchester'], official: 'https://www.iloveny.com/regions/hudson-valley/',
  },
  {
    id: 'long-island', name: 'Long Island',
    blurb: 'Beaches, lighthouses, wineries, farm stands and the Hamptons, all east of New York City.',
    counties: ['Nassau', 'Suffolk'], official: 'https://www.iloveny.com/regions/long-island/',
  },
  {
    id: 'nyc', name: 'New York City',
    blurb: 'Landmarks, museums, parks, food and neighborhoods in the five boroughs.',
    counties: ['Bronx', 'Kings', 'New York', 'Queens', 'Richmond'], official: 'https://www.iloveny.com/regions/new-york-city/',
  },
  {
    id: 'thousand-islands-seaway', name: 'Thousand Islands-Seaway',
    blurb: 'The St. Lawrence River and eastern Lake Ontario: island castles, boat tours, fishing and waterfront villages.',
    counties: ['Jefferson', 'Lewis', 'Oswego', 'St. Lawrence'], official: 'https://www.iloveny.com/regions/thousand-islands-seaway/',
  },
];

export const regionById = Object.fromEntries(regions.map((r) => [r.id, r]));
export const regionOfCounty: Record<string, string> = Object.fromEntries(
  regions.flatMap((r) => r.counties.map((c) => [c, r.id]))
);
export const regionNames: Record<string, string> = Object.fromEntries(regions.map((r) => [r.id, r.name]));
