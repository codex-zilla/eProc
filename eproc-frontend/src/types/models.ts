export interface Project {
  id: number;
  name: string;
  owner: string;
  currency: string;
  budgetTotal?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Site {
  id: number;
  projectId: number;
  name: string;
  location?: string;
  budgetCap?: number;
  gpsCenter?: string;
  isActive: boolean;
  createdAt: string;
}

export enum MaterialCategory {
  CEMENT = 'CEMENT',
  AGGREGATES = 'AGGREGATES',
  STEEL = 'STEEL',
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  FINISHING = 'FINISHING',
  MISC = 'MISC'
}

export enum MaterialUnit {
  KG = 'KG',
  BAG = 'BAG',
  LITER = 'LITER',
  TRIP = 'TRIP',
  PCS = 'PCS',
  METER = 'METER',
  BUNDLE = 'BUNDLE',
  BOX = 'BOX'
}

export interface Material {
  id: number;
  name: string;
  category: MaterialCategory;
  defaultUnit: MaterialUnit;
  unitType?: string;
  referencePrice?: number;
  isActive: boolean;
}

export type MaterialSelectionMode = 'catalog' | 'manual';

export interface MaterialSelection {
  mode: MaterialSelectionMode;
  material?: Material; // if mode is catalog
  manualName?: string;
  manualUnit?: string;
  manualPrice?: number;
}
