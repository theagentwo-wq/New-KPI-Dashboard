import { DirectorProfile, Kpi, NoteCategory, StoreDetails } from './types';

export const DIRECTORS: DirectorProfile[] = [
  {
    id: 'Danny', name: 'Danny', lastName: 'Serafini',
    email: 'd.serafini@tupelohoneycafe.com',
    phone: '858-717-2925',
    title: 'Area Director', 
    stores: ['Denver, CO', 'Las Colinas, TX', 'Omaha, NB', 'Lenexa, KS', 'Boise, ID', 'Frisco, TX', 'Des Moines, IA'],
    photo: 'https://i.postimg.cc/NGKXrRfv/DANNY.jpg',
    bio: 'Danny has been a pivotal part of our growth, focusing on operational excellence and team development in his diverse region.',
    homeLocation: 'Denver, CO'
  },
  {
    id: 'Heather', name: 'Heather', lastName: 'Roberts',
    email: 'h.roberts@tupelohoneycafe.com',
    phone: '865-454-1184',
    title: 'Area Director', 
    stores: ['Knoxville, TN', 'Farragut, TN', 'Chattanooga, TN', 'Huntsville, AL', 'Downtown Asheville, NC', 'Gainesville, GA', 'Raleigh, NC'],
    photo: 'https://i.postimg.cc/zDyhRTD9/HEATHER.jpg',
    bio: 'With a background in culinary arts and management, Heather brings a unique blend of creativity and discipline to the Southeast region.',
    homeLocation: 'Knoxville, TN'
  },
  {
    id: 'Ryan', name: 'Ryan', lastName: 'Bowen',
    email: 'r.bowen@tupelohoneycafe.com',
    phone: '703-209-7515',
    title: 'Area Director', 
    stores: ['Indianapolis, IN', 'Grand Rapids, MI', 'Pittsburgh, PA', 'Franklin, TN', 'Milwaukee, WI', 'Columbus, OH'],
    photo: 'https://i.postimg.cc/ryD4t5FX/RYAN.jpg',
    bio: 'Ryan is a data-driven leader who excels at optimizing prime costs and enhancing guest satisfaction across his Midwest stores.',
    homeLocation: 'Columbus, OH'
  },
  {
    id: 'Robert', name: 'Robert', lastName: 'Simms',
    email: 'robert@tupelohoneycafe.com',
    phone: '864-906-8070',
    title: 'Area Director', 
    stores: ['Greenville, SC', 'Columbia, SC', 'Virginia Beach, VA', 'Charlotte, NC', 'South Asheville, NC', 'Myrtle Beach, SC', 'Arlington, VA'],
    photo: 'https://i.postimg.cc/RCWtnwCk/ROBERT.jpg',
    bio: 'Robert champions a culture of hospitality and is known for his ability to build high-performing teams that deliver consistent results in the Carolinas and Virginia.',
    homeLocation: 'Greenville, SC'
  }
];

export const ALL_STORES: string[] = DIRECTORS.flatMap(d => d.stores);

export const STORE_DETAILS: Record<string, StoreDetails> = {
    'Arlington, VA': { address: '1616 N Troy St, Arlington, VA 22201', lat: 38.8911, lon: -77.0731 },
    'Boise, ID': { address: '150 N 8th St, Suite 200, Boise, ID 83702', lat: 43.6169, lon: -116.2045 },
    'Charlotte, NC': { address: '101 S Tryon St, Suite 130, Charlotte, NC 28280', lat: 35.2269, lon: -80.8433 },
    'Chattanooga, TN': { address: '1110 Market St, Ste 121, Chattanooga, TN 37402', lat: 35.0454, lon: -85.3101 },
    'Columbia, SC': { address: '2138 Pickens Street, Columbia, SC 29201', lat: 34.01509, lon: -81.02641 },
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
    'Omaha, NB': { address: '830 Harney St, Omaha, NE 68102', lat: 41.25432, lon: -95.93288 },
    'Pittsburgh, PA': { address: '111 W Station Square Dr, Pittsburgh, PA 15219', lat: 40.4332, lon: -80.0039 },
    'Raleigh, NC': { address: '425 Oberlin Rd, Raleigh, NC 27605', lat: 35.7880, lon: -78.6584 },
    'South Asheville, NC': { address: '1829 Hendersonville Rd, Asheville, NC 28803', lat: 35.5034, lon: -82.5393 },
    'Virginia Beach, VA': { address: '4501 Main St, Virginia Beach, VA 23462', lat: 36.8385, lon: -76.1260 },
};

export const KPI_CONFIG: { [key in Kpi]: { format: 'currency' | 'percent' | 'number', higherIsBetter: boolean, baseline?: number } } = {
  [Kpi.Sales]: { format: 'currency', higherIsBetter: true },
  [Kpi.SOP]: { format: 'percent', higherIsBetter: true },
  [Kpi.PrimeCost]: { format: 'percent', higherIsBetter: false },
  [Kpi.AvgReviews]: { format: 'number', higherIsBetter: true },
  [Kpi.FoodCost]: { format: 'percent', higherIsBetter: false },
  [Kpi.LaborCost]: { format: 'percent', higherIsBetter: false },
  [Kpi.VariableLabor]: { format: 'percent', higherIsBetter: false },
  [Kpi.CulinaryAuditScore]: { format: 'percent', higherIsBetter: true, baseline: 0.90 },
};

export const KPI_ICON_MAP: { [key in Kpi]: string } = {
  [Kpi.Sales]: 'sales',
  [Kpi.SOP]: 'sop',
  [Kpi.PrimeCost]: 'prime',
  [Kpi.AvgReviews]: 'reviews',
  [Kpi.FoodCost]: 'food',
  [Kpi.LaborCost]: 'labor',
  [Kpi.VariableLabor]: 'labor',
  [Kpi.CulinaryAuditScore]: 'audit',
};


export const ALL_KPIS = Object.values(Kpi);

export const NOTE_CATEGORIES: NoteCategory[] = ['General', 'Marketing', 'Staffing', 'Reviews', 'Facilities'];

export const NOTE_CATEGORY_COLORS: { [key in NoteCategory]: string } = {
  'General': 'border-slate-500',
  'Marketing': 'border-blue-500',
  'Staffing': 'border-yellow-500',
  'Reviews': 'border-purple-500',
  'Facilities': 'border-orange-500',
};