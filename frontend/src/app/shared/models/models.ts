// ── Claim Models ──────────────────────────────────────────────────────────
export interface ClaimSummary {
  claimId: string;
  claimNumber: string;
  patientName: string;
  serviceDate: string;
  totalAmount: number;
  status: ClaimStatus;
}

export interface ClaimDetail extends ClaimSummary {
  providerName: string;
  submittedDate: string;
  rejectionReason?: string;
  processedDate?: string;
  lineItems: LineItem[];
}

export interface LineItem {
  procedureCode: string;
  diagnosisCode?: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface SubmitClaimRequest {
  patientId: string;
  providerId: string;
  serviceDate: string;
  totalAmount: number;
  lineItems: LineItemRequest[];
}

export interface LineItemRequest {
  procedureCode: string;
  diagnosisCode?: string;
  quantity: number;
  unitCost: number;
}

export interface SubmitClaimResponse {
  claimId: string;
  claimNumber: string;
  status: string;
  submittedDate: string;
  validationResults: ValidationSummary;
}

export interface ValidationSummary {
  eligibilityPassed: boolean;
  duplicateFound: boolean;
  coverageLimitPassed: boolean;
  isValid: boolean;
}

export type ClaimStatus = 'Pending' | 'Processing' | 'Approved' | 'Rejected' | 'Paid';

// ── Pharmacy Models ────────────────────────────────────────────────────────
export interface FormularyResult {
  ndcCode: string;
  drugName: string;
  tier: number;
  tierLabel: string;
  copay: number;
  requiresPriorAuth: boolean;
  coverageLimit?: number;
  alternatives: FormularyAlternative[];
}

export interface FormularyAlternative {
  ndcCode: string;
  drugName: string;
  tier: number;
  copay: number;
}

// ── Auth Models ────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: UserRole;
  userId: string;
}

export type UserRole = 'Patient' | 'Provider' | 'Admin';

export interface CurrentUser {
  userId: string;
  email: string;
  role: UserRole;
}

// ── Admin Models ───────────────────────────────────────────────────────────
export interface ClaimMetrics {
  totalClaims: number;
  approved: number;
  rejected: number;
  pending: number;
  totalAmountProcessed: number;
  avgProcessingHours: number;
  dailyBreakdown: DailyBreakdown[];
}

export interface DailyBreakdown {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface AuditLog {
  logId: number;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  userRole: string;
  ipAddress?: string;
  timestamp: string;
}

// ── Directory Models ────────────────────────────────────────────────────────
export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  memberId: string;
  email: string;
  isActive: boolean;
  insurancePlanId?: string;
  insurancePlan?: InsurancePlan;
}

export interface Provider {
  providerId: string;
  name: string;
  npi: string;
  specialty: string;
  isActive: boolean;
}

export interface InsurancePlan {
  planId: string;
  planName: string;
  payerId: string;
  deductibleAmt: number;
  oopMaxAmt: number;
}

// ── Shared ─────────────────────────────────────────────────────────────────
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
