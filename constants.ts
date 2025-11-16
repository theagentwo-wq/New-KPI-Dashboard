import { DirectorProfile, Kpi, NoteCategory } from './types';

export const DIRECTORS: DirectorProfile[] = [
  {
    id: 'Danny', name: 'Danny', lastName: 'Serafini',
    email: 'd.serafini@tupelohoneycafe.com',
    phone: '858-717-2925',
    title: 'Area Director', 
    stores: ['Denver, CO', 'Las Colinas, TX', 'Omaha, NB', 'Lenexa, KS', 'Boise, ID', 'Frisco, TX', 'Des Moines, IA'],
    photo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMyMmQzZWUiLz48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaGyPSJtaWRkbGUiPkRTPC90ZXh0Pjwvc3ZnPg==',
    bio: 'Danny has been a pivotal part of our growth, focusing on operational excellence and team development in his diverse region.',
    homeLocation: 'Denver, CO'
  },
  {
    id: 'Heather', name: 'Heather', lastName: 'Roberts',
    email: 'h.roberts@tupelohoneycafe.com',
    phone: '865-454-1184',
    title: 'Area Director', 
    stores: ['Knoxville, TN', 'Farragut, TN', 'Chattanooga, TN', 'Huntsville, AL', 'Downtown Asheville, NC', 'Gainesville, GA', 'Raleigh, NC'],
    photo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM2NDc0OGIiLz48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhSPC90ZXh0Pjwvc3ZnPg==',
    bio: 'With a background in culinary arts and management, Heather brings a unique blend of creativity and discipline to the Southeast region.',
    homeLocation: 'Knoxville, TN'
  },
  {
    id: 'Ryan', name: 'Ryan', lastName: 'Bowen',
    email: 'r.bowen@tupelohoneycafe.com',
    phone: '703-209-7515',
    title: 'Area Director', 
    stores: ['Indianapolis, IN', 'Grand Rapids, MI', 'Pittsburgh, PA', 'Franklin, TN', 'Milwaukee, WI', 'Columbus, OH'],
    photo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM5NGEzYjgiLz48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJCPC90ZXh0Pjwvc3ZnPg==',
    bio: 'Ryan is a data-driven leader who excels at optimizing prime costs and enhancing guest satisfaction across his Midwest stores.',
    homeLocation: 'Columbus, OH'
  },
  {
    id: 'Robert', name: 'Robert', lastName: 'Simms',
    email: 'robert@tupelohoneycafe.com',
    phone: '864-906-8070',
    title: 'Area Director', 
    stores: ['Greenville, SC', 'Columbia, SC', 'Virginia Beach, VA', 'Charlotte, NC', 'South Asheville, NC', 'Myrtle Beach, SC', 'Arlington, VA'],
    photo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxNGI4YTYiLz48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJTPC90ZXh0Pjwvc3ZnPg==',
    bio: 'Robert champions a culture of hospitality and is known for his ability to build high-performing teams that deliver consistent results in the Carolinas and Virginia.',
    homeLocation: 'Greenville, SC'
  }
];

export const ALL_STORES: string[] = DIRECTORS.flatMap(d => d.stores);

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