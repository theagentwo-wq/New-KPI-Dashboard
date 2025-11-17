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
    'Denver, CO': { address: '1650 Wewatta St, Denver, CO 80202', lat: 39.7533, lon: -105.0000 },
    'Las Colinas, TX': { address: '5250 N O\'Connor Blvd, Irving, TX 75039', lat: 32.8624, lon: -96.9443 },
    'Omaha, NB': { address: '229 N 12th St, Omaha, NE 68102', lat: 41.2587, lon: -95.9322 },
    'Lenexa, KS': { address: '1650 E 95th St, Lenexa, KS 66219', lat: 38.9565, lon: -94.7550 },
    'Boise, ID': { address: '150 N 8th St #200, Boise, ID 83702', lat: 43.6166, lon: -116.2023 },
    'Frisco, TX': { address: '6725 Main St, Frisco, TX 75033', lat: 33.1507, lon: -96.8236 },
    'Des Moines, IA': { address: '665 Grand Ave, Des Moines, IA 50309', lat: 41.5868, lon: -93.6250 },
    'Knoxville, TN': { address: '1 Market Square, Knoxville, TN 37902', lat: 35.9646, lon: -83.9193 },
    'Farragut, TN': { address: '11138 Kingston Pike, Farragut, TN 37934', lat: 35.8751, lon: -84.1755 },
    'Chattanooga, TN': { address: '1110 Market St, Chattanooga, TN 37402', lat: 35.0456, lon: -85.3097 },
    'Huntsville, AL': { address: '200 West Side Square, Huntsville, AL 35801', lat: 34.7304, lon: -86.5861 },
    'Downtown Asheville, NC': { address: '12 College St, Asheville, NC 28801', lat: 35.5951, lon: -82.5515 },
    'Gainesville, GA': { address: '1900 Jesse Jewell Pkwy SE, Gainesville, GA 30501', lat: 34.2979, lon: -83.8241 },
    'Raleigh, NC': { address: '425 Oberlin Rd, Raleigh, NC 27605', lat: 35.7877, lon: -78.6583 },
    'Indianapolis, IN': { address: '230 W Washington St, Indianapolis, IN 46204', lat: 39.7670, lon: -86.1625 },
    'Grand Rapids, MI': { address: '122 E Fulton St, Grand Rapids, MI 49503', lat: 42.9612, lon: -85.6655 },
    'Pittsburgh, PA': { address: '1 Market St, Pittsburgh, PA 15222', lat: 40.4417, lon: -80.0000 },
    'Franklin, TN': { address: '224 E Main St, Franklin, TN 37064', lat: 35.9251, lon: -86.8689 },
    'Milwaukee, WI': { address: '511 N Broadway, Milwaukee, WI 53202', lat: 43.0389, lon: -87.9065 },
    'Columbus, OH': { address: '161 N High St, Columbus, OH 43215', lat: 39.9623, lon: -83.0007 },
    'Greenville, SC': { address: '1 N Main St # T, Greenville, SC 29601', lat: 34.8500, lon: -82.3986 },
    'Columbia, SC': { address: '1332 Main St, Columbia, SC 29201', lat: 34.0007, lon: -81.0348 },
    'Virginia Beach, VA': { address: '4532 Main St, Virginia Beach, VA 23462', lat: 36.8529, lon: -75.9780 },
    'Charlotte, NC': { address: '101 S Tryon St #100, Charlotte, NC 28280', lat: 35.2271, lon: -80.8431 },
    'South Asheville, NC': { address: '1829 Hendersonville Rd, Asheville, NC 28803', lat: 35.5034, lon: -82.5393 },
    'Myrtle Beach, SC': { address: '1315 Celebrity Cir, Myrtle Beach, SC 29577', lat: 33.7161, lon: -78.8837 },
    'Arlington, VA': { address: '1616 N Troy St, Arlington, VA 22201', lat: 38.8977, lon: -77.0827 },
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