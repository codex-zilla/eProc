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
 * These map to the backend Role enum:
 * - ADMIN, OWNER, MANAGER, ACCOUNTANT, ENGINEER
 */
export const SystemRole = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  ENGINEER: 'ENGINEER'
} as const;

export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

/**
 * Contextual roles within a specific project.
 * These map to the backend ProjectRole enum.
 * All have PROJECT_ prefix for clear distinction from SystemRole.
 */
export const ProjectRole = {
  PROJECT_OWNER: 'PROJECT_OWNER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  PROJECT_ACCOUNTANT: 'PROJECT_ACCOUNTANT',
  PROJECT_LEAD_ENGINEER: 'PROJECT_LEAD_ENGINEER',
  PROJECT_SITE_ENGINEER: 'PROJECT_SITE_ENGINEER',
  PROJECT_CONSULTANT_ENGINEER: 'PROJECT_CONSULTANT_ENGINEER'
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

export const RequestStatus = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  PARTIALLY_APPROVED: 'PARTIALLY_APPROVED',
  REJECTED: 'REJECTED'
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

// ... (skipping unchanged interfaces) ...

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  projectId: number;
  projectName: string;
  siteId?: number;
  siteName?: string;
  status: 'OPEN' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CLOSED';
  vendorName?: string;
  notes?: string;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  createdById: number;
  items: PurchaseOrderItem[];
}

// Additional Interfaces for Build Fixes
export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: SystemRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive?: string;
  erbNumber?: string; // Added
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  materialId?: number;
  materialName: string;
  materialDisplayName: string; // Alias for compatibility
  orderedQty: number;
  unitPrice: number;
  unit: string;
  totalPrice: number;
  quantityDelivered: number; // Was optional
  totalDelivered: number; // Alias or computed
  requestedQty: number;
  siteName?: string;
}

export interface DuplicateDetail {
    requestId: number;
    requestTitle: string;
    similarityScore: number;
    // Added fields
    materialName?: string;
    currentQuantity?: number;
    currentStartDate?: string;
    currentEndDate?: string;
    originalQuantity?: number;
    originalStartDate?: string;
    originalEndDate?: string;
}

export interface RequestDetail {
    id: number;
    title: string;
    projectId: number;
    projectName: string;
    siteId: number;
    siteName: string;
    createdById: number;
    createdByName: string;
    createdAt: string;
    plannedStartDate?: string;
    plannedEndDate?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: RequestStatus;
    totalValue: number;
    materials: RequestMaterial[];
    
    // BOQ & Duplication
    boqReferenceCode?: string;
    additionalDetails?: string;
    isDuplicateFlagged?: boolean;
    duplicateOfRequestId?: number;
    duplicateOfRequestTitle?: string;
    duplicateExplanation?: string;
    duplicateDetails?: DuplicateDetail[];
}

export interface RequestMaterial {
    id: number;
    name: string;
    quantity: number;
    measurementUnit: string;
    rateEstimate: number;
    totalEstimate?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    resourceType?: string;
    isDuplicate?: boolean;
    // Added fields
    rateType?: string;
    rejectionComment?: string;
    comment?: string;
    workDescription?: string;
}

// Aliases
export type RequestItem = RequestMaterial;

// API DTOs
export interface MaterialRequest {
  materialId?: number; // if existing material
  name: string;        // if new material
  quantity: number;
  unit: string;
  category: MaterialCategory;
}

export interface CreateMaterialRequest {
  projectId: number;
  siteId: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  plannedStartDate?: string;
  items: MaterialRequest[];
}

export interface ApprovalAction {
  status: 'APPROVED' | 'REJECTED' | 'MODIFY';
  comment?: string;
  items?: { id: number; status: 'APPROVED' | 'REJECTED'; quantity?: number }[];
  // Legacy/Optional fields if needed
  requestId?: number;
  action?: 'APPROVE' | 'REJECT' | 'MODIFY';
  comments?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actorName: string;
  timestamp: string;
  details: string;
  comment?: string; // Added
}
