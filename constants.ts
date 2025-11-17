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
    'Arlington, VA': { address: '1616 Wilson Blvd, Arlington, VA 22209', lat: 38.89133, lon: -77.0733 },
    'Boise, ID': { address: '150 N 8th St, Boise, ID 83702', lat: 43.61695, lon: -116.20455 },
    'Charlotte, NC': { address: '1820 South Blvd, Charlotte, NC 28203', lat: 35.20785, lon: -80.85842 },
    'Chattanooga, TN': { address: '1110 Market St, Chattanooga, TN 37402', lat: 35.04543, lon: -85.31011 },
    'Columbia, SC': { address: '1332 Main St, Columbia, SC 29201', lat: 34.0064, lon: -81.0354 }, // Note: This location is permanently closed
    'Columbus, OH': { address: '161 N High St, Columbus, OH 43215', lat: 39.9657, lon: -83.0003 },
    'Denver, CO': { address: '1650 Wewatta St, Denver, CO 80202', lat: 39.7537, lon: -105.0001 },
    'Des Moines, IA': { address: '665 Grand Ave, Des Moines, IA 50309', lat: 41.5861, lon: -93.6288 },
    'Downtown Asheville, NC': { address: '12 College St, Asheville, NC 28801', lat: 35.5954, lon: -82.5513 },
    'Farragut, TN': { address: '11138 Kingston Pike, Farragut, TN 37934', lat: 35.8751, lon: -84.1755 },
    'Franklin, TN': { address: '201 E Main St, Franklin, TN 37064', lat: 35.9221, lon: -86.8683 },
    'Frisco, TX': { address: '6765 Winning Dr, Frisco, TX 75034', lat: 33.0950, lon: -96.8373 },
    'Gainesville, GA': { address: '1900 Jesse Jewell Pkwy SE, Gainesville, GA 30501', lat: 34.2790, lon: -83.8055 }, // Note: This location is permanently closed
    'Grand Rapids, MI': { address: '140 Ottawa Ave NW, Grand Rapids, MI 49503', lat: 42.9654, lon: -85.6695 },
    'Greenville, SC': { address: '1 N Main St, Greenville, SC 29601', lat: 34.8500, lon: -82.3986 },
    'Huntsville, AL': { address: '200 West Side Square, Huntsville, AL 35801', lat: 34.7304, lon: -86.5861 },
    'Indianapolis, IN': { address: '345 S Illinois St, Indianapolis, IN 46225', lat: 39.7621, lon: -86.1593 },
    'Knoxville, TN': { address: '1 Market Square, Knoxville, TN 37902', lat: 35.9646, lon: -83.9193 },
    'Las Colinas, TX': { address: '5250 N O\'Connor Blvd, Irving, TX 75039', lat: 32.8624, lon: -96.9443 },
    'Lenexa, KS': { address: '14502 W 95th St, Lenexa, KS 66215', lat: 38.9564, lon: -94.7553 },
    'Milwaukee, WI': { address: '511 N Broadway, Milwaukee, WI 53202', lat: 43.0402, lon: -87.9080 },
    'Myrtle Beach, SC': { address: '1315 Celebrity Cir, Myrtle Beach, SC 29577', lat: 33.7161, lon: -78.8837 },
    'Omaha, NB': { address: '229 N 12th St, Omaha, NE 68102', lat: 41.2612, lon: -95.9333 },
    'Pittsburgh, PA': { address: '111 W Station Square Dr, Pittsburgh, PA 15219', lat: 40.4332, lon: -80.0039 },
    'Raleigh, NC': { address: '425 Oberlin Rd, Raleigh, NC 27605', lat: 35.7880, lon: -78.6584 },
    'South Asheville, NC': { address: '1829 Hendersonville Rd, Asheville, NC 28803', lat: 35.5034, lon: -82.5393 },
    'Virginia Beach, VA': { address: '4532 Main St, Virginia Beach, VA 23462', lat: 36.8375, lon: -76.1265 },
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