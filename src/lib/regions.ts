// The 11 I LOVE NY vacation regions, defined by county (the same way the official map is drawn).
// County lists were worked out from the I LOVE NY region map and the regional destination
// lists published by NYSTIA. Counties near a boundary are the easiest to get wrong, so
// treat the map as a guide and the official I LOVE NY pages as the authority.

export interface Region { id: string; name: string; blurb: string; counties: string[]; official: string; state: string }
type RegionInput = Omit<Region, 'state'>;

const nyRegions: RegionInput[] = [
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


// Connecticut: three official tourism districts (CTvisit). Counties are used to draw the map, so the
// New Haven County split between the Western and Central districts is approximated.
const ctRegions: RegionInput[] = [
  {
    id: 'western-connecticut', name: 'Western Connecticut',
    blurb: 'The Litchfield Hills (state parks, waterfalls, lakes and the Appalachian Trail) and the Fairfield County coast on Long Island Sound.',
    counties: ['Fairfield', 'Litchfield'], official: 'https://ctvisit.com/listings/western-regional-tourism-district',
  },
  {
    id: 'central-connecticut', name: 'Central Connecticut',
    blurb: 'Hartford and the Connecticut River Valley, plus New Haven and the central shoreline: museums, river towns, ridge hikes and beaches.',
    counties: ['Hartford', 'Middlesex', 'New Haven'], official: 'https://ctvisit.com/listings/central-regional-tourism-district',
  },
  {
    id: 'eastern-connecticut', name: 'Eastern Connecticut',
    blurb: 'Mystic Country and the Quiet Corner: seaports, aquariums, lighthouses, farms, state forests and small mill towns.',
    counties: ['New London', 'Tolland', 'Windham'], official: 'https://ctvisit.com/listings/eastern-regional-tourism-district',
  },
];

// Massachusetts: Visit MA groups its 16 regional tourism councils into these six areas.
const maRegions: RegionInput[] = [
  {
    id: 'greater-boston', name: 'Greater Boston',
    blurb: 'Boston and its inner suburbs: the Freedom Trail, museums, harbor islands, Concord and Lexington history and the Blue Hills.',
    counties: ['Suffolk', 'Norfolk', 'Middlesex'], official: 'https://www.visitma.com/plan-your-trip/regions/',
  },
  {
    id: 'north-of-boston', name: 'North of Boston',
    blurb: 'Cape Ann, Salem, Newburyport and the North Shore: rocky coast, beaches, lighthouses, maritime history and Plum Island.',
    counties: ['Essex'], official: 'https://www.visitma.com/plan-your-trip/regions/',
  },
  {
    id: 'south-of-boston', name: 'South of Boston',
    blurb: 'Plymouth and the South Shore, plus the Southcoast of Fall River and New Bedford: Pilgrim history, cranberry bogs, beaches and whaling heritage.',
    counties: ['Plymouth', 'Bristol'], official: 'https://www.visitma.com/plan-your-trip/regions/',
  },
  {
    id: 'cape-cod-islands', name: 'Cape Cod and the Islands',
    blurb: 'Cape Cod, Martha\'s Vineyard and Nantucket: national seashore beaches, lighthouses, bike trails, ferries and island villages.',
    counties: ['Barnstable', 'Dukes', 'Nantucket'], official: 'https://www.visitma.com/plan-your-trip/regions/',
  },
  {
    id: 'central-massachusetts', name: 'Central Massachusetts',
    blurb: 'Worcester County: hills, reservoirs, state forests, farms, historic villages and the Quabbin area.',
    counties: ['Worcester'], official: 'https://www.visitma.com/plan-your-trip/regions/',
  },
  {
    id: 'western-massachusetts', name: 'Western Massachusetts',
    blurb: 'The Berkshires and the Pioneer Valley: Mount Greylock, waterfalls, art museums, college towns, rivers and fall foliage.',
    counties: ['Berkshire', 'Franklin', 'Hampden', 'Hampshire'], official: 'https://www.visitma.com/plan-your-trip/regions/',
  },
];

// Rhode Island: Visit Rhode Island lists six regions. Counties cannot separate Block Island from South County, or
// Blackstone Valley from Providence, so those pairs are shown together.
const riRegions: RegionInput[] = [
  {
    id: 'providence-blackstone', name: 'Providence and Blackstone Valley',
    blurb: 'The capital city, its food and arts scene, and the mill towns and river parks of the Blackstone Valley.',
    counties: ['Providence'], official: 'https://www.visitrhodeisland.com/plan/regions/providence/',
  },
  {
    id: 'warwick-west-bay', name: 'Warwick and West Bay',
    blurb: 'The central shoreline of Narragansett Bay: lighthouses, parks, beaches and quick trips from Providence.',
    counties: ['Kent'], official: 'https://www.visitrhodeisland.com/plan/regions/',
  },
  {
    id: 'newport-east-bay', name: 'Newport County and the East Bay',
    blurb: 'Newport mansions and the Cliff Walk, island beaches, and the East Bay towns of Bristol and Warren.',
    counties: ['Newport', 'Bristol'], official: 'https://www.visitrhodeisland.com/plan/regions/newport-county/',
  },
  {
    id: 'south-county-block-island', name: 'South County and Block Island',
    blurb: 'Rhode Island\'s ocean beaches, salt ponds and wildlife refuges, plus the ferry trip to Block Island.',
    counties: ['Washington'], official: 'https://www.visitrhodeisland.com/plan/regions/',
  },
];

export const regions: Region[] = [
  ...nyRegions.map((r) => ({ ...r, state: 'NY' })),
  ...ctRegions.map((r) => ({ ...r, state: 'CT' })),
  ...maRegions.map((r) => ({ ...r, state: 'MA' })),
  ...riRegions.map((r) => ({ ...r, state: 'RI' })),
];
export const regionById = Object.fromEntries(regions.map((r) => [r.id, r]));
// County names repeat across states (Essex, Washington, Suffolk...), so the key includes the state: "NY:Essex".
export const regionOfCounty: Record<string, string> = Object.fromEntries(
  regions.flatMap((r) => r.counties.map((c) => [`${r.state}:${c}`, r.id]))
);
export const regionNames: Record<string, string> = Object.fromEntries(regions.map((r) => [r.id, r.name]));
