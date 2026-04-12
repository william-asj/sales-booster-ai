export type Page =
  | "dashboard"
  | "leads"
  | "events"
  | "products"
  | "chat"
  | "customers"
  | "analytics"
  | "settings"
  | string;

export interface Lead {
  id: number;
  name: string;
  age: number;
  dob: string;
  score: number;
  scoreLabel: string;
  event: string;
  product: string;
  premium: string;
  avatar: string;
  phone: string;
  policies: number;
}

export interface LifeEvent {
  id: string;
  customerName: string;
  eventType: "Birthday" | "Inforce" | "Policy Being Processed" | "Lapse" | "Surrender" | "Freelook" | "Reinstate" | "Health Claim";
  description: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
  color: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  iconName: string;
  description: string;
  premium: string;
}

export interface Stat {
  id: number;
  label: string;
  value: string;
  delta: string;
  iconName: string;
}

const LEADS: Lead[] = [
  { id: 1, name: "Budi Santoso", age: 34, dob: "12 May 1991", score: 92, scoreLabel: "High", event: "Birthday", product: "Simas Legacy Life", premium: "Rp 2.4M/mo", avatar: "BS", phone: "+62 812-3456-7890", policies: 1 },
  { id: 2, name: "Sari Dewi", age: 28, dob: "04 Aug 1997", score: 88, scoreLabel: "High", event: "Birthday", product: "Simas Scholarship", premium: "Rp 1.8M/mo", avatar: "SD", phone: "+62 857-2345-6789", policies: 0 },
  { id: 3, name: "Anton Wijaya", age: 52, dob: "30 Sep 1973", score: 76, scoreLabel: "Med", event: "Birthday", product: "Simas Investa Link", premium: "Rp 3.1M/mo", avatar: "AW", phone: "+62 815-6789-0123", policies: 3 },
  { id: 4, name: "Mira Lestari", age: 31, dob: "22 Jan 1994", score: 64, scoreLabel: "Med", event: "Inforce", product: "Simas Maxi Pro", premium: "Rp 900K/mo", avatar: "ML", phone: "+62 821-4567-8901", policies: 1 },
  { id: 5, name: "Rina Kusuma", age: 39, dob: "11 Mar 1986", score: 45, scoreLabel: "Low", event: "Policy Being Processed", product: "Simas Health Care", premium: "Rp 1.5M/mo", avatar: "RK", phone: "+62 896-7890-1234", policies: 1 },
  { id: 6, name: "Reza Pratama", age: 45, dob: "15 Oct 1980", score: 61, scoreLabel: "Med", event: "Lapse", product: "Simas Fixed Link", premium: "Rp 4.2M/mo", avatar: "RP", phone: "+62 878-9012-3456", policies: 2 },
  { id: 7, name: "Linda Wahyuni", age: 29, dob: "05 Jul 1996", score: 95, scoreLabel: "High", event: "Health Claim", product: "Simas Health Care", premium: "Rp 1.2M/mo", avatar: "LW", phone: "+62 811-2233-4455", policies: 1 },
  { id: 8, name: "Hendra Putra", age: 42, dob: "18 Nov 1983", score: 38, scoreLabel: "Low", event: "Surrender", product: "Simas Legacy Life", premium: "Rp 5.5M/mo", avatar: "HP", phone: "+62 819-8877-6655", policies: 2 },
  { id: 9, name: "Dewi Kartika", age: 36, dob: "25 Feb 1990", score: 82, scoreLabel: "High", event: "Reinstate", product: "Simas Investa Link", premium: "Rp 2.1M/mo", avatar: "DK", phone: "+62 812-9900-1122", policies: 1 },
  { id: 10, name: "Adi Nugroho", age: 48, dob: "10 Dec 1977", score: 55, scoreLabel: "Med", event: "Freelook", product: "Simas Legacy Life", premium: "Rp 3.8M/mo", avatar: "AN", phone: "+62 813-4455-6677", policies: 1 },
  { id: 11, name: "Siska Amelia", age: 32, dob: "14 Apr 1994", score: 89, scoreLabel: "High", event: "Birthday", product: "Simas Scholarship", premium: "Rp 1.5M/mo", avatar: "SA", phone: "+62 815-1122-3344", policies: 0 },
  { id: 12, name: "Taufik Hidayat", age: 55, dob: "22 Sep 1970", score: 72, scoreLabel: "Med", event: "Inforce", product: "Simas Investa Link", premium: "Rp 4.5M/mo", avatar: "TH", phone: "+62 817-5566-7788", policies: 4 },
];

const EVENTS: LifeEvent[] = [
  {
    id: "evt_001",
    customerName: "Rina Kusuma",
    eventType: "Policy Being Processed",
    description: " New policy application detected in underwriting. High likelihood of conversion if followed up promptly.",
    timestamp: "2 hrs ago",
    priority: "High",
    color: "rose"
  },
  {
    id: "evt_002",
    customerName: "Reza Pratama",
    eventType: "Lapse",
    description: "Policy lapse detected. Customer may need assistance to reinstate coverage. Opportunity for retention outreach.",
    timestamp: "1 day ago",
    priority: "Medium",
    color: "blue"
  },
  {
    id: "evt_003",
    customerName: "Sari Dewi",
    eventType: "Birthday",
    description: "Customer's 28th birthday detected. Consider sending personalized offers for age-appropriate products.",
    timestamp: "Tomorrow",
    priority: "High",
    color: "amber"
  },
  {
    id: "evt_004",
    customerName: "Budi Santoso",
    eventType: "Health Claim",
    description: "Recent health claim detected. Customer may be more receptive to wellness-focused products or coverage enhancements.",
    timestamp: "5 hrs ago",
    priority: "Medium",
    color: "emerald"
  },
  {
    id: "evt_005",
    customerName: "Anton Wijaya",
    eventType: "Birthday",
    description: "Customer's 52nd birthday detected. Consider sending personalized offers for age-appropriate products.",
    timestamp: "4 days ago",
    priority: "Low",
    color: "purple"
  }
];

const PRODUCTS: Product[] = [
  { id: 1, name: "Simas Legacy Life", category: "Life", iconName: "ShieldCheck", description: "Protect your loved ones with comprehensive life coverage.", premium: "From Rp 2M/mo" },
  { id: 2, name: "Simas Investa Link", category: "Investment", iconName: "TrendingUp", description: "Unit-linked insurance with high-yield potential.", premium: "From Rp 1.5M/mo" },
  { id: 3, name: "Simas Fixed Link", category: "Investment", iconName: "TrendingUp", description: "Unit-linked insurance with high-yield potential.", premium: "From Rp 1.2M/mo" },
  { id: 4, name: "Simas Scholarship", category: "Education", iconName: "GraduationCap", description: "Secure your child's future with guaranteed education funds.", premium: "From Rp 800K/mo" },
  { id: 5, name: "Simas Maxi Pro", category: "Asset", iconName: "Home", description: "Protect your home and family from mortgage burdens.", premium: "From Rp 100M/term" },
  { id: 6, name: "Simas Health Care", category: "Health", iconName: "HeartPulse", description: "Full medical coverage for you and your dependents.", premium: "From Rp 500K/mo" },
];

const STATS: Stat[] = [
  { id: 1, label: "AI-Generated Leads", value: "142", delta: "+12%", iconName: "Users" },
  { id: 2, label: "Projected Premium", value: "Rp 850M", delta: "+8.4%", iconName: "TrendingUp" },
  { id: 3, label: "Life Events Detected", value: "28", delta: "+5%", iconName: "HeartPulse" },
  { id: 4, label: "Conversion Rate (AI)", value: "24.5%", delta: "+2.1%", iconName: "PieChart" },
];

export interface AnalyticsData {
  conversionChart: { label: string; value: number }[];
  topProducts: { name: string; pct: number; color: string }[];
  kpis: { label: string; value: string; delta: string; color: string }[];
}

const ANALYTICS: AnalyticsData = {
  conversionChart: [
    { label: "Jan", value: 62 }, { label: "Feb", value: 74 },
    { label: "Mar", value: 58 }, { label: "Apr", value: 81 },
    { label: "May", value: 69 }, { label: "Jun", value: 91 },
  ],
  topProducts: [
    { name: "Simas Legacy Life", pct: 68, color: "#6366f1" },
    { name: "Simas Investa Link", pct: 54, color: "#8b5cf6" },
    { name: "Simas Scholarship", pct: 41, color: "#a78bfa" },
  ],
  kpis: [
    { label: "Conversion Rate", value: "23.4%", delta: "+4.2% vs last month", color: "#22c55e" },
    { label: "Avg. Deal Size", value: "Rp 2.3M", delta: "+8.1% vs last month", color: "#6366f1" },
  ]
};

// Mock Retrieval Functions (Simulating DB calls)
export const db = {
  getLeads: () => LEADS,
  getEvents: () => EVENTS,
  getProducts: () => PRODUCTS,
  getStats: () => STATS,
  getAnalytics: () => ANALYTICS,
  getCustomerById: (id: number) => LEADS.find(l => l.id === id) || null,
  getLeadByName: (name: string) => LEADS.find(l => l.name === name) || null,
};
