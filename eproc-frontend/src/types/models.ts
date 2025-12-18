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

export const MaterialCategory = {
  CEMENT: 'CEMENT',
  AGGREGATES: 'AGGREGATES',
  STEEL: 'STEEL',
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  FINISHING: 'FINISHING',
  MISC: 'MISC'
} as const;

export type MaterialCategory = (typeof MaterialCategory)[keyof typeof MaterialCategory];

export const MaterialUnit = {
  KG: 'KG',
  BAG: 'BAG',
  LITER: 'LITER',
  TRIP: 'TRIP',
  PCS: 'PCS',
  METER: 'METER',
  BUNDLE: 'BUNDLE',
  BOX: 'BOX'
} as const;

export type MaterialUnit = (typeof MaterialUnit)[keyof typeof MaterialUnit];

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

// Phase 3: Request Status
export const RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

// Phase 3: Material Request
export interface MaterialRequest {
  id: number;
  siteId: number;
  siteName: string;
  workPackageId?: number;
  workPackageName?: string;
  materialId?: number;
  materialName?: string;
  manualMaterialName?: string;
  manualUnit?: string;
  manualEstimatedPrice?: number;
  quantity: number;
  status: RequestStatus;
  rejectionComment?: string;
  emergencyFlag: boolean;
  plannedUsageStart: string;
  plannedUsageEnd: string;
  requestedById: number;
  requestedByName: string;
  requestedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

// Phase 3: Create Material Request DTO
export interface CreateMaterialRequest {
  siteId: number;
  workPackageId?: number;
  materialId?: number;
  manualMaterialName?: string;
  manualUnit?: string;
  manualEstimatedPrice?: number;
  quantity: number;
  plannedUsageStart: string;
  plannedUsageEnd: string;
  emergencyFlag?: boolean;
}

// Phase 3: Approval Action
export interface ApprovalAction {
  status: 'APPROVED' | 'REJECTED';
  comment?: string;
}
