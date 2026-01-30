export interface Project {
  id: number;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  currency: string;
  budgetTotal?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;

  // Project Owner (User relationship)
  ownerId?: number;
  ownerName?: string;

  // @deprecated Legacy field
  ownerEmail?: string;

  // Advanced Fields
  code?: string;
  industry?: string;       // Enum
  projectType?: string;    // Enum
  
  // Owner Rep (the client's contact person)
  ownerRepName?: string;
  ownerRepContact?: string;

  // Location
  siteLocation?: string; // Legacy field (kept for backward compat)
  region?: string;
  district?: string;
  ward?: string;
  plotNumber?: string;
  gpsCoordinates?: string;
  titleDeedAvailable?: boolean;
  siteAccessNotes?: string;

  // Context
  keyObjectives?: string;
  expectedOutput?: string;

  // Timeline
  startDate?: string;
  expectedCompletionDate?: string;

  // Contractual
  contractType?: string; // Enum
  defectsLiabilityPeriod?: number;
  performanceSecurityRequired?: boolean;

  // Counts
  teamCount?: number;
  scopeCount?: number;
  milestoneCount?: number;
  documentCount?: number;
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

export interface ProjectAssignment {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  userName: string;
  userEmail: string;
  role: string; // ProjectRole
  responsibilityLevel: string; // ResponsibilityLevel
  reportingLine?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectScope {
  id: number;
  projectId: number;
  category: string; // ScopeCategory
  description: string;
  isIncluded: boolean;
  notes?: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: number;
  projectId: number;
  name: string;
  deadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  approvalRequired: boolean;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ProjectDocument {
  id: number;
  projectId: number;
  name: string;
  type: string; // DocumentType
  url: string;
  version: number;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  uploadedById?: number;
  uploadedByName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  userId: number;
  role: string;
  responsibilityLevel?: string;
  reportingLine?: string;
  startDate: string;
}

export const Industry = {
  HOTEL: 'HOTEL',
  RESIDENTIAL: 'RESIDENTIAL',
  COMMERCIAL: 'COMMERCIAL',
  INDUSTRIAL: 'INDUSTRIAL',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  INSTITUTIONAL: 'INSTITUTIONAL'
} as const;

export const ProjectType = {
  CONSTRUCTION: 'CONSTRUCTION',
  RENOVATION: 'RENOVATION',
  MAINTENANCE: 'MAINTENANCE',
  DESIGN_ONLY: 'DESIGN_ONLY'
} as const;

export const ContractType = {
  LUMP_SUM: 'LUMP_SUM',
  COST_PLUS: 'COST_PLUS',
  UNIT_PRICE: 'UNIT_PRICE',
  TIME_AND_MATERIALS: 'TIME_AND_MATERIALS'
} as const;

/**
 * System-level roles for authentication and global access.
 */
export const SystemRole = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  PROJECT_OWNER: 'PROJECT_OWNER',
  ENGINEER: 'ENGINEER'
} as const;

export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

/**
 * Contextual roles within a specific project.
 */
export const ProjectRole = {
  OWNER: 'OWNER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  PROJECT_ACCOUNTANT: 'PROJECT_ACCOUNTANT',
  ENGINEER: 'ENGINEER',
  LEAD_ENGINEER: 'LEAD_ENGINEER',
  CIVIL_ENGINEER: 'CIVIL_ENGINEER',
  ELECTRICAL_ENGINEER: 'ELECTRICAL_ENGINEER',
  MECHANICAL_ENGINEER: 'MECHANICAL_ENGINEER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  QUANTITY_SURVEYOR: 'QUANTITY_SURVEYOR',
  CLERK_OF_WORKS: 'CLERK_OF_WORKS'
} as const;

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const ResponsibilityLevel = {
  FULL: 'FULL',
  LIMITED: 'LIMITED',
  OBSERVER: 'OBSERVER'
} as const;

export const ScopeCategory = {
  CIVIL_STRUCTURAL: 'CIVIL_STRUCTURAL',
  ELECTRICAL: 'ELECTRICAL',
  MECHANICAL: 'MECHANICAL',
  PLUMBING: 'PLUMBING',
  FIRE_SAFETY: 'FIRE_SAFETY',
  EXTERNAL_WORKS: 'EXTERNAL_WORKS',
  LANDSCAPING: 'LANDSCAPING',
  INTERIOR_FINISHING: 'INTERIOR_FINISHING',
  ROOFING: 'ROOFING'
} as const;

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

export const RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

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

export interface ApprovalAction {
  status: 'APPROVED' | 'REJECTED';
  comment?: string;
}

export interface UserSummary {
    id: number;
    name: string;
    email: string;
    role: string;
}
