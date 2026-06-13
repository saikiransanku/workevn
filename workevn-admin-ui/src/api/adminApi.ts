import {
  Booking,
  CancellationRecord,
  Dispute,
  EarningsPayload,
  ReportOverview,
  RequestRecord,
  UserAccount,
  VerificationCase,
  DashboardResponse,
  PartnerProfile,
  UserRole
} from "../types/admin";
import {
  bookingsSample,
  cancellationsSample,
  dashboardSample,
  disputesSample,
  earningsSample,
  partnersSample,
  reportsSample,
  requestsSample,
  usersSample,
  verificationCasesSample
} from "./sampleData";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL ?? "/api/admin";
const AUTH_STORAGE_KEY = "workevn-admin-token";

function authHeaders() {
  const token = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = { "Content-Type": "application/json", ...authHeaders(), ...(options?.headers ?? {}) };
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

function fallback<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 250));
}

function normalizeBooking(raw: any): Booking {
  const customer = raw.customer || raw.customerId || {};
  const worker = raw.worker || raw.workerId || {};
  const scheduledAt = raw.scheduledFor ? new Date(raw.scheduledFor).toLocaleString() : raw.scheduledAt || "TBD";

  return {
    id: raw._id ?? raw.id,
    bookingId: raw.bookingId ?? raw._id ?? raw.id,
    customerName: customer.name || "Customer",
    customerPhone: customer.phone || raw.customerPhone || "—",
    partnerName: worker.name || raw.partnerName || "Unassigned",
    serviceCategory: raw.skill || raw.serviceCategory || "Service",
    subService: raw.subService || raw.skill || "General service",
    status: raw.status ?? "requested",
    scheduledAt,
    startTime: raw.startTime,
    endTime: raw.endTime,
    paymentStatus: raw.paymentStatus || (raw.status === "completed" ? "paid" : "pending"),
    amount: raw.amount ?? 0,
    partnerPayout: raw.partnerPayout ?? 0,
    adminCommission: raw.adminCommission ?? 0,
    discount: raw.discount ?? 0,
    cancellationStatus: raw.cancellationStatus,
    cancellationReason: raw.cancellationReason ?? raw.rejectionReason,
    area: raw.area || raw.address?.city || "Unknown",
    assignedWorker: raw.assignedWorker || worker.name,
    createdAt: raw.createdAt || raw.created_at || "",
    updatedAt: raw.updatedAt || raw.updated_at || "",
    sourceChannel: raw.sourceChannel ?? "Admin UI",
    notes: raw.notes,
    issueFlag: raw.issueFlag ?? false,
    disputeFlag: raw.disputeFlag ?? false,
    customerLocation: raw.customerLocation ?? raw.address
  } as Booking;
}

function normalizeUser(raw: any): UserAccount {
  return {
    id: raw._id ?? raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    city: raw.address?.city || raw.city || "Unknown",
    role: raw.role === "worker" ? "partner" : raw.role,
    totalBookings: raw.totalBookings ?? 0,
    totalSpend: raw.totalSpend ?? 0,
    lastBooking: raw.lastBooking ?? "—",
    accountStatus: raw.isActive === false ? "suspended" : raw.accountStatus ?? (raw.isActive ? "active" : "pending"),
    verificationStatus: raw.verificationStatus ?? raw.kycStatus ?? "pending",
    complaints: raw.complaints ?? 0,
    refunds: raw.refunds ?? 0,
    lifetimeValue: raw.lifetimeValue ?? 0,
    walletBalance: raw.walletBalance ?? 0,
    skills: raw.skills,
    serviceArea: raw.serviceArea ?? raw.address?.city,
    rating: raw.rating ?? raw.ratingAverage,
    completedJobs: raw.completedJobs ?? 0,
    cancellationRate: raw.cancellationRate ?? 0,
    acceptanceRate: raw.acceptanceRate ?? 0,
    earnings: raw.earnings ?? 0,
    platformCut: raw.platformCut ?? 0,
    payoutDue: raw.payoutDue ?? 0,
    payoutReleased: raw.payoutReleased ?? 0,
    kycStatus: raw.verificationStatus ?? raw.kycStatus ?? "pending",
    trainingStatus: raw.trainingStatus,
    availability: raw.availability
  };
}

function mapRoleQuery(role?: UserRole) {
  if (role === "partner") return "worker";
  return role;
}

function buildDashboardMetrics(rawStats: any, bookings: Booking[]) {
  const today = new Date();
  const isSameDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };

  const last7Days = new Date();
  last7Days.setDate(today.getDate() - 6);

  const last30Days = new Date();
  last30Days.setDate(today.getDate() - 29);

  const bookingsCreated = bookings.filter((booking) => booking.createdAt);
  const totalBookingsToday = bookingsCreated.filter((booking) => isSameDay(booking.createdAt)).length;
  const totalBookingsWeek = bookingsCreated.filter((booking) => new Date(booking.createdAt) >= last7Days).length;
  const totalBookingsMonth = bookingsCreated.filter((booking) => new Date(booking.createdAt) >= last30Days).length;
  const cancelledBookings = bookings.filter((booking) => booking.status.startsWith("cancelled") || booking.status === "cancelled").length;
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length;
  const pendingRequests = bookings.filter((booking) => booking.status === "requested" || booking.status === "pending_assignment").length;

  const statusDistribution = Object.entries(
    bookings.reduce<Record<string, number>>((acc, booking) => {
      const key = booking.status;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({
    label,
    value,
    color: label.includes("cancel") ? "#ef4444" : label === "completed" ? "#22c55e" : "#0ea5e9"
  }));

  const topCategories = Object.entries(
    bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.serviceCategory] = (acc[booking.serviceCategory] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value]) => ({ label, value }));

  const cityDemand = Object.entries(
    bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.area] = (acc[booking.area] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([city, demand]) => ({ city, demand }));

  const bookingsOverTime = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - index));
    const label = date.toLocaleDateString(undefined, { weekday: "short" });
    const value = bookingsCreated.filter((booking) => new Date(booking.createdAt).toDateString() === date.toDateString()).length;
    return { label, value };
  });

  const revenueOverTime = bookingsOverTime.map((item) => ({ label: item.label, value: item.value * 1200 }));

  return {
    totalBookingsToday,
    totalBookingsWeek,
    totalBookingsMonth,
    pendingRequests,
    completedBookings,
    cancelledBookings,
    activeUsers: rawStats.users ?? dashboardSample.stats.activeUsers,
    activePartners: rawStats.workers ?? dashboardSample.stats.activePartners,
    totalRevenue: dashboardSample.stats.totalRevenue,
    adminCommission: dashboardSample.stats.adminCommission,
    partnerEarnings: dashboardSample.stats.partnerEarnings,
    platformTakeRate: dashboardSample.stats.platformTakeRate,
    averageRating: dashboardSample.stats.averageRating,
    unresolvedComplaints: dashboardSample.stats.unresolvedComplaints,
    pendingVerifications: rawStats.pendingWorkers ?? dashboardSample.stats.pendingVerifications,
    completionRate: bookings.length ? Math.round((completedBookings / bookings.length) * 100) : dashboardSample.stats.completionRate,
    bookingsOverTime,
    revenueOverTime,
    statusDistribution,
    cancellationReasons: dashboardSample.stats.cancellationReasons,
    topCategories,
    topWorkers: dashboardSample.stats.topWorkers,
    cityDemand
  };
}

export async function getDashboard(): Promise<DashboardResponse> {
  try {
    const raw = await fetchJson<{ stats: any; recentBookings: any[] }>(`${API_BASE}/dashboard`);
    const bookings = await getBookings();
    const recentBookings = raw.recentBookings?.map(normalizeBooking) || bookings.slice(0, 6);
    const stats = buildDashboardMetrics(raw.stats, bookings);
    return { stats, recentBookings };
  } catch (error) {
    return fallback(dashboardSample);
  }
}

export async function getBookings(status?: string): Promise<Booking[]> {
  try {
    const url = new URL(`${API_BASE}/bookings`, window.location.origin);
    if (status) url.searchParams.set("status", status);
    const data = await fetchJson<{ bookings: any[] }>(url.toString());
    return data.bookings.map(normalizeBooking);
  } catch (error) {
    return fallback(bookingsSample);
  }
}

export async function getRequests(): Promise<RequestRecord[]> {
  try {
    return await fetchJson<RequestRecord[]>(`${API_BASE}/requests`);
  } catch (error) {
    return fallback(requestsSample);
  }
}

export async function getUsers(role?: UserRole): Promise<UserAccount[]> {
  try {
    const url = new URL(`${API_BASE}/users`, window.location.origin);
    const queryRole = mapRoleQuery(role);
    if (queryRole) url.searchParams.set("role", queryRole);
    const data = await fetchJson<{ users: any[] }>(url.toString());
    return data.users.map(normalizeUser);
  } catch (error) {
    if (role === "partner") {
      return fallback(usersSample.filter((user) => user.role === "partner"));
    }
    if (role === "admin") {
      return fallback(usersSample.filter((user) => user.role === "admin"));
    }
    return fallback(usersSample.filter((user) => user.role === "customer"));
  }
}

export async function getPartners(): Promise<PartnerProfile[]> {
  return getUsers("partner") as Promise<PartnerProfile[]>;
}

export async function getDisputes(): Promise<Dispute[]> {
  try {
    return await fetchJson<Dispute[]>(`${API_BASE}/disputes`);
  } catch (error) {
    return fallback(disputesSample);
  }
}

export async function getReports(): Promise<ReportOverview> {
  try {
    return await fetchJson<ReportOverview>(`${API_BASE}/reports`);
  } catch (error) {
    return fallback(reportsSample);
  }
}

export async function patchDispute(id: string, patch: Partial<Dispute>): Promise<Dispute> {
  try {
    return await fetchJson<Dispute>(`${API_BASE}/disputes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
  } catch (error) {
    const dispute = disputesSample.find((item) => item.id === id);
    return (dispute ? { ...dispute, ...patch } : disputesSample[0]) as Dispute;
  }
}

export async function getEarnings(): Promise<EarningsPayload> {
  try {
    return await fetchJson<EarningsPayload>(`${API_BASE}/earnings`);
  } catch (error) {
    return fallback(earningsSample);
  }
}

export async function getCancellations(): Promise<CancellationRecord[]> {
  try {
    return await fetchJson<CancellationRecord[]>(`${API_BASE}/cancellations`);
  } catch (error) {
    return fallback(cancellationsSample);
  }
}

export async function getVerifications(): Promise<VerificationCase[]> {
  try {
    return await fetchJson<VerificationCase[]>(`${API_BASE}/verifications`);
  } catch (error) {
    return fallback(verificationCasesSample);
  }
}

export async function getWorkerApplications(status?: string): Promise<PartnerProfile[]> {
  try {
    const url = new URL(`${API_BASE}/workers/applications`, window.location.origin);
    if (status) url.searchParams.set("status", status);
    const data = await fetchJson<{ workerApplications: any[] }>(url.toString());
    return data.workerApplications.map((raw) => {
      const user = raw.user || {};
      return normalizeUser({
        _id: raw._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: "worker",
        totalBookings: raw.totalBookings,
        totalSpend: raw.totalSpend,
        lastBooking: raw.lastBooking,
        accountStatus: raw.verificationStatus === "approved" ? "active" : "pending",
        verificationStatus: raw.verificationStatus,
        skills: raw.skills,
        serviceArea: raw.serviceArea,
        rating: raw.ratingAverage,
        completedJobs: raw.ratingCount,
        acceptanceRate: raw.isAvailable ? 90 : 60,
        earnings: raw.earnings,
        payoutDue: raw.payoutDue,
        payoutReleased: raw.payoutReleased,
        trainingStatus: raw.trainingStatus,
        availability: raw.isAvailable ? "active" : "offline"
      });
    });
  } catch (error) {
    return fallback(partnersSample);
  }
}

export async function reviewWorkerApplication(id: string, status: "approved" | "rejected" | "suspended", rejectionReason?: string): Promise<{ workerProfile?: any }> {
  try {
    return await fetchJson<{ workerProfile: any }>(`${API_BASE}/workers/applications/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason })
    });
  } catch (error) {
    return fallback({ workerProfile: null });
  }
}

export async function patchBooking(id: string, payload: Partial<Booking>): Promise<Booking> {
  try {
    return await fetchJson<Booking>(`${API_BASE}/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return fallback({ ...bookingsSample.find((booking) => booking.id === id), ...payload } as Booking);
  }
}

export async function patchUser(id: string, payload: Partial<UserAccount>): Promise<UserAccount> {
  try {
    return await fetchJson<UserAccount>(`${API_BASE}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return fallback({ ...usersSample.find((user) => user.id === id), ...payload } as UserAccount);
  }
}

export async function patchPartner(id: string, payload: Partial<PartnerProfile>): Promise<PartnerProfile> {
  try {
    return await fetchJson<PartnerProfile>(`${API_BASE}/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return fallback({ ...partnersSample.find((partner) => partner.id === id), ...payload } as PartnerProfile);
  }
}

export async function postNotification(payload: { type: string; target: string; message: string }): Promise<{ success: boolean }> {
  try {
    return await fetchJson<{ success: boolean }>(`${API_BASE}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return fallback({ success: true });
  }
}

export async function postRefund(payload: { bookingId: string; amount: number; refundType: string }): Promise<{ success: boolean }> {
  try {
    return await fetchJson<{ success: boolean }>(`${API_BASE}/refunds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return fallback({ success: true });
  }
}

export async function postAssignment(payload: { bookingId: string; partnerId: string }): Promise<{ success: boolean }> {
  try {
    return await fetchJson<{ success: boolean }>(`${API_BASE}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return fallback({ success: true });
  }
}

export async function resolveDispute(id: string, payload: { resolvedBy: string; resolution: string }): Promise<{ success: boolean }> {
  try {
    return await fetchJson<{ success: boolean }>(`${API_BASE}/disputes/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return fallback({ success: true });
  }
}
