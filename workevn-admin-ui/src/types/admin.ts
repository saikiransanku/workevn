export type BookingStatus =
  | "requested"
  | "pending_assignment"
  | "assigned"
  | "accepted"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "cancelled_by_user"
  | "cancelled_by_partner"
  | "cancelled_by_admin"
  | "refunded"
  | "disputed"
  | "rejected"
  | "rescheduled";

export type RequestStatus = "new" | "matched" | "pending" | "assigned" | "held" | "rejected";
export type VerificationStatus = "pending" | "approved" | "rejected" | "suspended";
export type UserRole = "customer" | "partner" | "worker" | "admin" | "support" | "finance" | "operations";
export type ComplaintStatus = "open" | "in_review" | "resolved" | "closed";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Booking {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  partnerName: string;
  serviceCategory: string;
  subService: string;
  status: BookingStatus;
  scheduledAt: string;
  startTime?: string;
  endTime?: string;
  paymentStatus: "paid" | "pending" | "refunded";
  amount: number;
  partnerPayout: number;
  adminCommission: number;
  discount: number;
  cancellationStatus?: string;
  cancellationReason?: string;
  area: string;
  assignedWorker?: string;
  createdAt: string;
  updatedAt: string;
  sourceChannel: string;
  notes?: string;
  issueFlag?: boolean;
  disputeFlag?: boolean;
  customerLocation?: Address;
}

export interface RequestEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceRequested: string;
  urgency: "low" | "medium" | "high";
  requestedAt: string;
  preferredSlot: string;
  estimatedPrice: number;
  status: RequestStatus;
  location: string;
  distanceToPartner: string;
  suggestedPartners: string[];
  unassignedReason?: string;
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: UserRole;
  totalBookings: number;
  totalSpend: number;
  lastBooking: string;
  accountStatus: "active" | "suspended" | "pending";
  verificationStatus: VerificationStatus;
  complaints: number;
  refunds: number;
  lifetimeValue: number;
  walletBalance: number;
  skills?: string[];
  serviceArea?: string;
  rating?: number;
  completedJobs?: number;
  cancellationRate?: number;
  acceptanceRate?: number;
  earnings?: number;
  platformCut?: number;
  payoutDue?: number;
  payoutReleased?: number;
  kycStatus?: VerificationStatus;
  trainingStatus?: "not_started" | "in_progress" | "completed";
  availability?: "active" | "offline" | "on_duty";
}

export interface EarningsSummary {
  totalCustomerPayment: number;
  partnerEarnings: number;
  adminCommission: number;
  tax: number;
  refunds: number;
  netRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  adjustments: number;
  chargebacks: number;
  bonuses: number;
  discounts: number;
  couponImpact: number;
}

export interface EarningsRecord {
  id: string;
  bookingId: string;
  servicePrice: number;
  tax: number;
  discount: number;
  finalCharge: number;
  partnerShare: number;
  platformShare: number;
  settlementStatus: "settled" | "pending" | "on_hold";
  partnerName: string;
  category: string;
  city: string;
  date: string;
}

export interface CancellationRecord {
  id: string;
  bookingId: string;
  canceledBy: "user" | "partner" | "admin";
  customerName?: string;
  partnerName?: string;
  canceledAt: string;
  reason: string;
  refundStatus: "approved" | "pending" | "denied";
  refundAmount: number;
  penalty: number;
  partnerAssigned: boolean;
  actionNeeded: string;
  repeatCount?: number;
  reliabilityImpact?: number;
  customerCompensation?: string;
  notes?: string;
}

export interface VerificationCase {
  id: string;
  type: "kyc" | "document" | "quality" | "dispute" | "complaint";
  subject: string;
  owner: string;
  createdAt: string;
  status: ComplaintStatus;
  priority: "low" | "medium" | "high";
  details: string;
  customerName?: string;
  partnerName?: string;
  requestedDocs?: string[];
  resolutionNotes?: string;
}

export interface DashboardMetrics {
  totalBookingsToday: number;
  totalBookingsWeek: number;
  totalBookingsMonth: number;
  pendingRequests: number;
  completedBookings: number;
  cancelledBookings: number;
  activeUsers: number;
  activePartners: number;
  totalRevenue: number;
  adminCommission: number;
  partnerEarnings: number;
  platformTakeRate: number;
  averageRating: number;
  unresolvedComplaints: number;
  pendingVerifications: number;
  completionRate: number;
  bookingsOverTime: { label: string; value: number }[];
  revenueOverTime: { label: string; value: number }[];
  statusDistribution: { label: string; value: number; color: string }[];
  cancellationReasons: { label: string; value: number }[];
  topCategories: { label: string; value: number }[];
  topWorkers: { name: string; completed: number; rating: number }[];
  cityDemand: { city: string; demand: number }[];
}

export interface DashboardResponse {
  stats: DashboardMetrics;
  recentBookings?: Booking[];
}

export interface RequestRecord extends RequestEntry {}

export interface Dispute {
  id: string;
  issue: string;
  details: string;
  bookingId: string;
  customerName: string;
  partnerName: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_review" | "resolved" | "closed";
  reportedAt: string;
}

export interface ReportOverview {
  bookingsCount: number;
  revenue: number;
  newRequests: number;
  conversionRate: number;
  averageResponseTime: number;
  topRegions: { name: string; growth: number }[];
  topRequests: { title: string; count: number; description: string }[];
}

export interface PartnerProfile extends UserAccount {}

export interface EarningsPayload {
  summary: EarningsSummary;
  records: EarningsRecord[];
  breakdownByPartner: { label: string; amount: number }[];
  breakdownByCategory: { label: string; amount: number }[];
  breakdownByCity: { label: string; amount: number }[];
}
