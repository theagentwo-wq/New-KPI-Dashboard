
import { DirectorProfile, Kpi, NoteCategory, StoreDetails, KpiConfig } from './types';

export const DIRECTORS: DirectorProfile[] = [
  {
    id: 'Danny', name: 'Danny', firstName: 'Danny', lastName: 'Serafini',
    email: 'd.serafini@example.com',
    phone: '555-0101',
    title: 'Area Director', 
    stores: ['Denver, CO', 'Las Colinas, TX', 'Omaha, NE', 'Lenexa, KS', 'Boise, ID', 'Frisco, TX', 'Des Moines, IA'],
    photo: 'https://i.postimg.cc/NGKXrRfv/DANNY.jpg',
    bio: 'Danny has been a pivotal part of our growth, focusing on operational excellence and team development in his diverse region.',
    homeLocation: 'Denver, CO',
    yearlyTravelBudget: 30000,
    homeLat: 39.7392,
    homeLon: -104.9903,
  },
  {
    id: 'Heather', name: 'Heather', firstName: 'Heather', lastName: 'Roberts',
    email: 'h.roberts@example.com',
    phone: '555-0102',
    title: 'Area Director', 
    stores: ['Knoxville, TN', 'Farragut, TN', 'Chattanooga, TN', 'Huntsville, AL', 'Downtown Asheville, NC', 'Gainesville, GA', 'Raleigh, NC'],
    photo: 'https://i.postimg.cc/zDyhRTD9/HEATHER.jpg',
    bio: 'With a background in culinary arts and management, Heather brings a unique blend of creativity and discipline to the Southeast region.',
    homeLocation: 'Knoxville, TN',
    yearlyTravelBudget: 30000,
    homeLat: 35.9606,
    homeLon: -83.9207,
  },
  {
    id: 'Ryan', name: 'Ryan', firstName: 'Ryan', lastName: 'Bowen',
    email: 'r.bowen@example.com',
    phone: '555-0103',
    title: 'Area Director', 
    stores: ['Indianapolis, IN', 'Grand Rapids, MI', 'Pittsburgh, PA', 'Franklin, TN', 'Milwaukee, WI', 'Columbus, OH'],
    photo: 'https://i.postimg.cc/ryD4t5FX/RYAN.jpg',
    bio: 'Ryan is a data-driven leader who excels at optimizing prime costs and enhancing guest satisfaction across his Midwest stores.',
    homeLocation: 'Columbus, OH',
    yearlyTravelBudget: 30000,
    homeLat: 39.9612,
    homeLon: -82.9988,
  },
  {
    id: 'Robert', name: 'Robert', firstName: 'Robert', lastName: 'Simms',
    email: 'robert.simms@example.com',
    phone: '555-0104',
    title: 'Area Director', 
    stores: ['Greenville, SC', 'Columbia, SC', 'Virginia Beach, VA', 'Charlotte, NC', 'South Asheville, NC', 'Myrtle Beach, SC', 'Arlington, VA'],
    photo: 'https://i.postimg.cc/RCWtnwCk/ROBERT.jpg',
    bio: 'Robert champions a culture of hospitality and is known for his ability to build high-performing teams that deliver consistent results in the Carolinas and Virginia.',
    homeLocation: 'Greenville, SC',
    yearlyTravelBudget: 30000,
    homeLat: 34.8526,
    homeLon: -82.3940,
  }
];

export const ALL_STORES: string[] = DIRECTORS.flatMap(d => d.stores);

export const STRIKE_TEAM_ICON_URL = 'https://i.postimg.cc/13Y2Yf6V/strike-team-icon.png';

export const STORE_DETAILS: Record<string, StoreDetails> = {
    'Arlington, VA': { address: '1616 N Troy St, Arlington, VA 22201', lat: 38.8921, lon: -77.0819 },
    'Boise, ID': { address: '150 N 8th St, Suite 200, Boise, ID 83702', lat: 43.6169, lon: -116.2045 },
    'Charlotte, NC': { address: '101 S Tryon St, Suite 130, Charlotte, NC 28280', lat: 35.2269, lon: -80.8433 },
    'Chattanooga, TN': { address: '1110 Market St, Ste 121, Chattanooga, TN 37402', lat: 35.0454, lon: -85.3101 },
    'Columbia, SC': { address: '2138 Pickens Street, Columbia, SC 29201', lat: 34.0165288, lon: -81.0327102 },
    'Columbus, OH': { address: '1678 W Lane Ave, Columbus, OH 43221', lat: 40.0093, lon: -83.0503 },
    'Denver, CO': { address: '1650 Wewatta St, Ste 104, Denver, CO 80202', lat: 39.7537, lon: -105.0001 },
    'Des Moines, IA': { address: '665 Grand Ave, Suite 100, Des Moines, IA 50309', lat: 41.5861, lon: -93.6288 },
    'Downtown Asheville, NC': { address: '12 College St, Asheville, NC 28801', lat: 35.5954, lon: -82.5513 },
    'Farragut, TN': { address: '126 Biddle Farms Blvd, Farragut, TN 37934', lat: 35.8791, lon: -84.1437 },
    'Franklin, TN': { address: '2000 Meridian Blvd, Ste 110, Franklin, TN 37067', lat: 35.9620, lon: -86.8152 },
    'Frisco, TX': { address: '6725 Winning Dr, Frisco, TX 75034', lat: 33.0950, lon: -96.8362 },
    'Gainesville, GA': { address: '2207 Limestone Ridge NE, Gainesville, GA 30501', lat: 34.3312, lon: -83.8291 },
    'Grand Rapids, MI': { address: '140 Ottawa Ave NW, Suite 100, Grand Rapids, MI 49503', lat: 42.9654, lon: -85.6695 },
    'Greenville, SC': { address: '1 N Main St, Ste T, Greenville, SC 29601', lat: 34.8500, lon: -82.3986 },
    'Huntsville, AL': { address: '900 Mid City Dr NW, Huntsville, AL 35806', lat: 34.7505, lon: -86.6669 },
    'Indianapolis, IN': { address: '320 S Alabama St, Ste A, Indianapolis, IN 46204', lat: 39.7628, lon: -86.1528 },
    'Knoxville, TN': { address: '1 Market Sq, Knoxville, TN 37902', lat: 35.9646, lon: -83.9193 },
    'Las Colinas, TX': { address: '5981 High Point Dr, Suite 160, Irving, TX 75038', lat: 32.9038, lon: -96.9605 },
    'Lenexa, KS': { address: '16720 City Center Dr, Lenexa, KS 66219', lat: 38.9515, lon: -94.7766 },
    'Milwaukee, WI': { address: '511 N Broadway, Milwaukee, WI 53202', lat: 43.0402, lon: -87.9080 },
    'Myrtle Beach, SC': { address: '3042 Howard Ave, Myrtle Beach, SC 29577', lat: 33.6558, lon: -78.9318 },
    'Omaha, NE': { address: '830 Harney St, Omaha, NE 68102', lat: 41.25432, lon: -95.93288 },
    'Pittsburgh, PA': { address: '111 W Station Square Dr, Pittsburgh, PA 15219', lat: 40.4332, lon: -80.0039 },
    'Raleigh, NC': { address: '425 Oberlin Rd, Raleigh, NC 27605', lat: 35.7880, lon: -78.6584 },
    'South Asheville, NC': { address: '1829 Hendersonville Rd, Asheville, NC 28803', lat: 35.5034, lon: -82.5393 },
    'Virginia Beach, VA': { address: '4501 Main St, Virginia Beach, VA 23462', lat: 36.8385, lon: -76.1260 },
};

export const KPI_CONFIG: { [key in Kpi]: KpiConfig } = {
  [Kpi.Sales]: { label: 'Sales', format: 'currency', higherIsBetter: true, aggregation: 'sum' },
  [Kpi.Guests]: { label: 'Guests', format: 'number', higherIsBetter: true, aggregation: 'sum' },
  [Kpi.Labor]: { label: 'Labor %', format: 'percent', higherIsBetter: false, aggregation: 'avg' },
  [Kpi.SOP]: { label: 'SOP %', format: 'percent', higherIsBetter: true, aggregation: 'avg' },
  [Kpi.AvgTicket]: { label: 'Avg Ticket', format: 'currency', higherIsBetter: true, aggregation: 'avg' },
  [Kpi.PrimeCost]: { label: 'Prime Cost', format: 'percent', higherIsBetter: false, aggregation: 'avg' },
  [Kpi.AvgReviews]: { label: 'Avg Reviews', format: 'number', higherIsBetter: true, aggregation: 'avg' },
  [Kpi.COGS]: { label: 'COGS', format: 'percent', higherIsBetter: false, aggregation: 'avg' },
  [Kpi.VariableLabor]: { label: 'Variable Labor', format: 'percent', higherIsBetter: false, aggregation: 'avg' },
  [Kpi.TotalLabor]: { label: 'Total Labor', format: 'percent', higherIsBetter: false, aggregation: 'avg' },
  [Kpi.CulinaryAuditScore]: { label: 'Culinary Audit Score', format: 'percent', higherIsBetter: true, baseline: 0.90, aggregation: 'avg' },
};

export const KPI_ICON_MAP: { [key in Kpi]: string } = {
  [Kpi.Sales]: 'sales',
  [Kpi.Guests]: 'guests',
  [Kpi.Labor]: 'labor',
  [Kpi.SOP]: 'sop',
  [Kpi.AvgTicket]: 'ticket',
  [Kpi.PrimeCost]: 'prime',
  [Kpi.AvgReviews]: 'reviews',
  [Kpi.COGS]: 'food',
  [Kpi.VariableLabor]: 'labor',
  [Kpi.TotalLabor]: 'labor',
  [Kpi.CulinaryAuditScore]: 'audit',
};


export const ALL_KPIS = Object.values(Kpi);

export const NOTE_CATEGORIES: NoteCategory[] = Object.values(NoteCategory);

export const NOTE_CATEGORY_COLORS: { [key in NoteCategory]: string } = {
  [NoteCategory.General]: 'border-slate-500',
  [NoteCategory.Operations]: 'border-blue-500',
  [NoteCategory.Marketing]: 'border-pink-500',
  [NoteCategory.HR]: 'border-indigo-500',
  [NoteCategory.GuestFeedback]: 'border-purple-500',
  [NoteCategory.Staffing]: 'border-yellow-500',
  [NoteCategory.Facilities]: 'border-orange-500',
  [NoteCategory.Reviews]: 'border-green-500',
};
