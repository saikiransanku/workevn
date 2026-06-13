import {
  Booking,
  CancellationRecord,
  DashboardResponse,
  Dispute,
  EarningsPayload,
  PartnerProfile,
  ReportOverview,
  RequestRecord,
  UserAccount,
  VerificationCase
} from "../types/admin";

export const dashboardSample: DashboardResponse = {
  stats: {
    totalBookingsToday: 38,
    totalBookingsWeek: 215,
    totalBookingsMonth: 892,
    pendingRequests: 17,
    completedBookings: 678,
    cancelledBookings: 54,
    activeUsers: 3421,
    activePartners: 158,
    totalRevenue: 1543200,
    adminCommission: 293400,
    partnerEarnings: 1249800,
    platformTakeRate: 19.0,
    averageRating: 4.8,
    unresolvedComplaints: 12,
    pendingVerifications: 8,
    completionRate: 93,
    bookingsOverTime: [
      { label: "Mon", value: 105 },
      { label: "Tue", value: 120 },
      { label: "Wed", value: 98 },
      { label: "Thu", value: 112 },
      { label: "Fri", value: 140 },
      { label: "Sat", value: 178 },
      { label: "Sun", value: 139 }
    ],
    revenueOverTime: [
      { label: "Jan", value: 132000 },
      { label: "Feb", value: 118000 },
      { label: "Mar", value: 145500 },
      { label: "Apr", value: 152000 },
      { label: "May", value: 163200 },
      { label: "Jun", value: 177000 }
    ],
    statusDistribution: [
      { label: "Completed", value: 72, color: "#22c55e" },
      { label: "Pending", value: 12, color: "#f59e0b" },
      { label: "Cancelled", value: 8, color: "#ef4444" },
      { label: "Disputed", value: 4, color: "#6366f1" },
      { label: "In progress", value: 4, color: "#0ea5e9" }
    ],
    cancellationReasons: [
      { label: "Customer unavailable", value: 18 },
      { label: "Partner unavailable", value: 14 },
      { label: "Price issue", value: 9 },
      { label: "Weather / traffic", value: 7 },
      { label: "Duplicate", value: 6 }
    ],
    topCategories: [
      { label: "AC Repair", value: 148 },
      { label: "Plumbing", value: 132 },
      { label: "Electrician", value: 110 },
      { label: "Carpentry", value: 87 }
    ],
    topWorkers: [
      { name: "Ravi Sharma", completed: 182, rating: 4.9 },
      { name: "Sana Kapoor", completed: 163, rating: 4.8 },
      { name: "Amit Singh", completed: 154, rating: 4.7 }
    ],
    cityDemand: [
      { city: "Mumbai", demand: 128 },
      { city: "Pune", demand: 94 },
      { city: "Bengaluru", demand: 76 },
      { city: "Hyderabad", demand: 62 }
    ]
  }
};

export const bookingsSample: Booking[] = [
  {
    id: "b_001",
    bookingId: "WE-1001",
    customerName: "Neha Verma",
    customerPhone: "+91 98765 43210",
    partnerName: "Arjun Patel",
    serviceCategory: "AC Repair",
    subService: "Split AC Service",
    status: "assigned",
    scheduledAt: "2026-06-14 10:30",
    startTime: "2026-06-14 10:45",
    endTime: "2026-06-14 12:10",
    paymentStatus: "paid",
    amount: 2650,
    partnerPayout: 1925,
    adminCommission: 725,
    discount: 200,
    cancellationStatus: undefined,
    cancellationReason: undefined,
    area: "Andheri East, Mumbai",
    assignedWorker: "Arjun Patel",
    createdAt: "2026-06-13 18:14",
    updatedAt: "2026-06-14 10:28",
    sourceChannel: "Mobile App",
    notes: "Customer requested anti-bacterial cleaning.",
    issueFlag: false,
    disputeFlag: false,
    customerLocation: { line1: "Flat 6B", city: "Mumbai", state: "Maharashtra", pincode: "400069" }
  },
  {
    id: "b_002",
    bookingId: "WE-1002",
    customerName: "Priya Singh",
    customerPhone: "+91 91234 56789",
    partnerName: "Sagar Joshi",
    serviceCategory: "Plumbing",
    subService: "Bathroom Leak Repair",
    status: "completed",
    scheduledAt: "2026-06-13 15:00",
    startTime: "2026-06-13 15:10",
    endTime: "2026-06-13 16:05",
    paymentStatus: "paid",
    amount: 1800,
    partnerPayout: 1260,
    adminCommission: 540,
    discount: 0,
    cancellationStatus: undefined,
    cancellationReason: undefined,
    area: "Koramangala, Bengaluru",
    assignedWorker: "Sagar Joshi",
    createdAt: "2026-06-12 09:24",
    updatedAt: "2026-06-13 16:10",
    sourceChannel: "Web Portal",
    notes: "Check all fittings after repair.",
    issueFlag: false,
    disputeFlag: false,
    customerLocation: { line1: "No. 21, 5th Main", city: "Bengaluru", state: "Karnataka", pincode: "560034" }
  },
  {
    id: "b_003",
    bookingId: "WE-1003",
    customerName: "Vikram Rao",
    customerPhone: "+91 99887 66554",
    partnerName: "Shreya Mehta",
    serviceCategory: "Electrician",
    subService: "Wiring Inspection",
    status: "cancelled_by_user",
    scheduledAt: "2026-06-14 08:00",
    paymentStatus: "refunded",
    amount: 1200,
    partnerPayout: 0,
    adminCommission: 0,
    discount: 0,
    cancellationStatus: "refunded",
    cancellationReason: "Customer unavailable",
    area: "Khar West, Mumbai",
    assignedWorker: "Shreya Mehta",
    createdAt: "2026-06-13 20:03",
    updatedAt: "2026-06-14 08:10",
    sourceChannel: "Mobile App",
    notes: "Customer will rebook if needed.",
    issueFlag: false,
    disputeFlag: false,
    customerLocation: { line1: "Flat 9A", city: "Mumbai", state: "Maharashtra", pincode: "400052" }
  }
];

export const requestsSample: RequestRecord[] = [
  {
    id: "r_1001",
    customerName: "Ananya Khanna",
    customerPhone: "+91 88734 22109",
    serviceRequested: "AC Deep Cleaning",
    urgency: "high",
    requestedAt: "2026-06-14 09:07",
    preferredSlot: "Today 3pm - 5pm",
    estimatedPrice: 3150,
    status: "pending",
    location: "Vashi, Navi Mumbai",
    distanceToPartner: "1.4 km",
    suggestedPartners: ["Rohit Desai", "Pooja Nair"],
    unassignedReason: "Partner busy in the area",
    notes: "Customer needs anti-fungal treatment."
  },
  {
    id: "r_1002",
    customerName: "Rajat Mehra",
    customerPhone: "+91 99876 54321",
    serviceRequested: "Electric Repair",
    urgency: "medium",
    requestedAt: "2026-06-14 08:58",
    preferredSlot: "Tomorrow morning",
    estimatedPrice: 1600,
    status: "matched",
    location: "Banashankari, Bengaluru",
    distanceToPartner: "2.8 km",
    suggestedPartners: ["Vijay Rao", "Aarti Singh"],
    notes: "Power cut issue since last night."
  }
];

export const usersSample: UserAccount[] = [
  {
    id: "u_001",
    name: "Neha Verma",
    email: "neha.verma@example.com",
    phone: "+91 98765 43210",
    city: "Mumbai",
    role: "customer",
    totalBookings: 12,
    totalSpend: 28500,
    lastBooking: "2026-06-13",
    accountStatus: "active",
    verificationStatus: "approved",
    complaints: 1,
    refunds: 0,
    lifetimeValue: 28500,
    walletBalance: 480,
    trainingStatus: "completed"
  },
  {
    id: "u_002",
    name: "Priya Singh",
    email: "priya.singh@example.com",
    phone: "+91 91234 56789",
    city: "Bengaluru",
    role: "customer",
    totalBookings: 9,
    totalSpend: 19800,
    lastBooking: "2026-06-13",
    accountStatus: "active",
    verificationStatus: "approved",
    complaints: 0,
    refunds: 1,
    lifetimeValue: 19800,
    walletBalance: 320,
    trainingStatus: "completed"
  },
  {
    id: "p_001",
    name: "Arjun Patel",
    email: "arjun.patel@workevn.com",
    phone: "+91 99876 33221",
    city: "Mumbai",
    role: "partner",
    totalBookings: 202,
    totalSpend: 0,
    lastBooking: "2026-06-14",
    accountStatus: "active",
    verificationStatus: "approved",
    complaints: 2,
    refunds: 0,
    lifetimeValue: 0,
    walletBalance: 1200,
    skills: ["AC Repair", "Appliance Repair"],
    serviceArea: "Andheri East",
    rating: 4.9,
    completedJobs: 182,
    cancellationRate: 3.8,
    acceptanceRate: 92,
    earnings: 142400,
    platformCut: 34700,
    payoutDue: 5600,
    payoutReleased: 136800,
    kycStatus: "approved",
    trainingStatus: "completed",
    availability: "active"
  },
  {
    id: "admin_001",
    name: "Megha Joshi",
    email: "megha.joshi@workevn.com",
    phone: "+91 91234 11199",
    city: "Mumbai",
    role: "admin",
    totalBookings: 0,
    totalSpend: 0,
    lastBooking: "2026-06-14",
    accountStatus: "active",
    verificationStatus: "approved",
    complaints: 0,
    refunds: 0,
    lifetimeValue: 0,
    walletBalance: 0,
    trainingStatus: "completed"
  }
];

export const partnersSample: PartnerProfile[] = usersSample.filter((user) => user.role === "partner");

export const disputesSample: Dispute[] = [
  {
    id: "d_001",
    issue: "Partner arrival delay",
    details: "Partner arrived 45 minutes late for the booking.",
    bookingId: "WE-1001",
    customerName: "Neha Verma",
    partnerName: "Arjun Patel",
    priority: "medium",
    status: "open",
    reportedAt: "2026-06-14 10:45"
  },
  {
    id: "d_002",
    issue: "Service incomplete",
    details: "Air conditioning repair left unfinished and customer requested follow-up.",
    bookingId: "WE-1002",
    customerName: "Priya Singh",
    partnerName: "Sagar Joshi",
    priority: "high",
    status: "in_review",
    reportedAt: "2026-06-13 16:25"
  }
];

export const reportsSample: ReportOverview = {
  bookingsCount: 892,
  revenue: 1543200,
  newRequests: 27,
  conversionRate: 24,
  averageResponseTime: 18,
  topRegions: [
    { name: "Mumbai", growth: 18 },
    { name: "Bengaluru", growth: 14 },
    { name: "Pune", growth: 11 }
  ],
  topRequests: [
    { title: "AC Repair", count: 128, description: "Highest requested service category." },
    { title: "Plumbing", count: 96, description: "Strong demand across western regions." },
    { title: "Electrician", count: 74, description: "Rising urgency for wiring and safety checks." }
  ]
};

export const earningsSample: EarningsPayload = {
  summary: {
    totalCustomerPayment: 1543200,
    partnerEarnings: 1249800,
    adminCommission: 293400,
    tax: 88500,
    refunds: 42800,
    netRevenue: 243100,
    pendingPayouts: 15300,
    completedPayouts: 228000,
    adjustments: 8600,
    chargebacks: 3200,
    bonuses: 15800,
    discounts: 24600,
    couponImpact: 12000
  },
  records: [
    {
      id: "er_001",
      bookingId: "WE-1001",
      servicePrice: 2850,
      tax: 230,
      discount: 200,
      finalCharge: 2880,
      partnerShare: 1925,
      platformShare: 725,
      settlementStatus: "settled",
      partnerName: "Arjun Patel",
      category: "AC Repair",
      city: "Mumbai",
      date: "2026-06-14"
    },
    {
      id: "er_002",
      bookingId: "WE-1002",
      servicePrice: 1800,
      tax: 135,
      discount: 0,
      finalCharge: 1935,
      partnerShare: 1260,
      platformShare: 540,
      settlementStatus: "settled",
      partnerName: "Sagar Joshi",
      category: "Plumbing",
      city: "Bengaluru",
      date: "2026-06-13"
    }
  ],
  breakdownByPartner: [
    { label: "Arjun Patel", amount: 192500 },
    { label: "Sagar Joshi", amount: 118200 }
  ],
  breakdownByCategory: [
    { label: "AC Repair", amount: 415000 },
    { label: "Plumbing", amount: 342000 },
    { label: "Electrician", amount: 275000 }
  ],
  breakdownByCity: [
    { label: "Mumbai", amount: 820000 },
    { label: "Bengaluru", amount: 520000 },
    { label: "Pune", amount: 203200 }
  ]
};

export const cancellationsSample: CancellationRecord[] = [
  {
    id: "c_001",
    bookingId: "WE-1003",
    canceledBy: "user",
    customerName: "Vikram Rao",
    partnerName: "Shreya Mehta",
    canceledAt: "2026-06-14 08:10",
    reason: "Customer unavailable",
    refundStatus: "approved",
    refundAmount: 1200,
    penalty: 0,
    partnerAssigned: true,
    actionNeeded: "Customer refund processed",
    customerCompensation: "none",
    notes: "User canceled before partner arrived."
  },
  {
    id: "c_002",
    bookingId: "WE-1004",
    canceledBy: "partner",
    customerName: "Kavita Mohan",
    partnerName: "Rohit Desai",
    canceledAt: "2026-06-14 09:30",
    reason: "Partner unavailable",
    refundStatus: "pending",
    refundAmount: 1600,
    penalty: 200,
    partnerAssigned: true,
    actionNeeded: "Review partner reliability",
    repeatCount: 2,
    reliabilityImpact: 4,
    customerCompensation: "service credit",
    notes: "Partner called to cancel due to emergency."
  }
];

export const verificationCasesSample: VerificationCase[] = [
  {
    id: "v_001",
    type: "kyc",
    subject: "New partner KYC review",
    owner: "Verification Team",
    createdAt: "2026-06-13 11:20",
    status: "open",
    priority: "high",
    details: "Partner submitted Aadhaar and PAN, awaiting document validation.",
    partnerName: "Sameer Khan"
  },
  {
    id: "v_002",
    type: "complaint",
    subject: "Late arrival complaint",
    owner: "Support",
    createdAt: "2026-06-12 14:05",
    status: "in_review",
    priority: "medium",
    details: "Customer reported partner arrived 45 minutes late. Review compensation and training status.",
    customerName: "Shreya Gupta"
  }
];
