import { DirectorProfile, Kpi, NoteCategory } from './types';

export const DIRECTORS: DirectorProfile[] = [
  {
    id: 'Danny', name: 'Danny', title: 'Area Director', 
    stores: ['Denver, CO', 'Las Colinas, TX', 'Omaha, NB', 'Lenexa, KS', 'Boise, ID', 'Frisco, TX', 'Des Moines, IA'],
    photo: 'https://picsum.photos/seed/danny/200',
    bio: 'Danny has been a pivotal part of our growth, focusing on operational excellence and team development in his diverse region.'
  },
  {
    id: 'Heather', name: 'Heather', title: 'Area Director', 
    stores: ['Knoxville, TN', 'Farragut, TN', 'Chattanooga, TN', 'Huntsville, AL', 'Downtown Asheville, NC', 'Gainesville, GA', 'Raleigh, NC'],
    photo: 'https://picsum.photos/seed/heather/200',
    bio: 'With a background in culinary arts and management, Heather brings a unique blend of creativity and discipline to the Southeast region.'
  },
  {
    id: 'Ryan', name: 'Ryan', title: 'Area Director', 
    stores: ['Indianapolis, IN', 'Grand Rapids, MI', 'Pittsburgh, PA', 'Franklin, TN', 'Milwaukee, WI', 'Columbus, OH'],
    photo: 'https://picsum.photos/seed/ryan/200',
    bio: 'Ryan is a data-driven leader who excels at optimizing prime costs and enhancing guest satisfaction across his Midwest stores.'
  },
  {
    id: 'Robert', name: 'Robert', title: 'Area Director', 
    stores: ['Greenville, SC', 'Columbia, SC', 'Virginia Beach, VA', 'Charlotte, NC', 'South Asheville, NC', 'Myrtle Beach, SC', 'Arlington, VA'],
    photo: 'https://picsum.photos/seed/robert/200',
    bio: 'Robert champions a culture of hospitality and is known for his ability to build high-performing teams that deliver consistent results in the Carolinas and Virginia.'
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