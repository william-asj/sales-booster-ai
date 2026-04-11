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
  eventType: "New Baby" | "Home Purchase" | "Promotion" | "Health Flag" | "Marriage";
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
  { id: 1, name: "Budi Santoso", age: 34, dob: "12 May 1991", score: 92, scoreLabel: "High", event: "Marriage", product: "Life Protection Plus", premium: "Rp 2.4M/mo", avatar: "BS", phone: "+62 812-3456-7890", policies: 1 },
  { id: 2, name: "Sari Dewi", age: 28, dob: "04 Aug 1997", score: 88, scoreLabel: "High", event: "New Baby", product: "Family Shield", premium: "Rp 1.8M/mo", avatar: "SD", phone: "+62 857-2345-6789", policies: 0 },
  { id: 3, name: "Anton Wijaya", age: 52, dob: "30 Sep 1973", score: 76, scoreLabel: "Med", event: "Promotion", product: "Wealth Protector", premium: "Rp 3.1M/mo", avatar: "AW", phone: "+62 815-6789-0123", policies: 3 },
  { id: 4, name: "Mira Lestari", age: 31, dob: "22 Jan 1994", score: 64, scoreLabel: "Med", event: "Home Purchase", product: "Mortgage Guard", premium: "Rp 900K/mo", avatar: "ML", phone: "+62 821-4567-8901", policies: 1 },
  { id: 5, name: "Rina Kusuma", age: 39, dob: "11 Mar 1986", score: 45, scoreLabel: "Low", event: "Health Flag", product: "Executive Term", premium: "Rp 1.5M/mo", avatar: "RK", phone: "+62 896-7890-1234", policies: 1 },
  { id: 6, name: "Reza Pratama", age: 45, dob: "15 Oct 1980", score: 61, scoreLabel: "Med", event: "Home Purchase", product: "Wealth Protector", premium: "Rp 4.2M/mo", avatar: "RP", phone: "+62 878-9012-3456", policies: 2 },
];

const EVENTS: LifeEvent[] = [
  {
    id: "evt_001",
    customerName: "Rina Kusuma",
    eventType: "Health Flag",
    description: "Missed scheduled checkup 2 weeks running. High risk flag detected via hospital partnership API.",
    timestamp: "2 hrs ago",
    priority: "High",
    color: "rose"
  },
  {
    id: "evt_002",
    customerName: "Reza Pratama",
    eventType: "Home Purchase",
    description: "Mortgage inquiry detected via banking partner API. Customer is likely seeking homeowner insurance.",
    timestamp: "1 day ago",
    priority: "Medium",
    color: "blue"
  },
  {
    id: "evt_003",
    customerName: "Sari Dewi",
    eventType: "New Baby",
    description: "Added dependent to company health portal. High propensity for education funds and family life plans.",
    timestamp: "2 days ago",
    priority: "High",
    color: "amber"
  },
  {
    id: "evt_004",
    customerName: "Budi Santoso",
    eventType: "Marriage",
    description: "Relationship status updated to Married. Opportunity for joint policies and beneficiary updates.",
    timestamp: "3 days ago",
    priority: "Medium",
    color: "emerald"
  },
  {
    id: "evt_005",
    customerName: "Anton Wijaya",
    eventType: "Promotion",
    description: "New job title detected on professional network. Income increase suggests wealth protector up-sell.",
    timestamp: "4 days ago",
    priority: "Low",
    color: "purple"
  }
];

const PRODUCTS: Product[] = [
  { id: 1, name: "Life Protection Plus", category: "Life", iconName: "ShieldCheck", description: "Comprehensive life coverage with flexible premium options.", premium: "From Rp 500K/mo" },
  { id: 2, name: "Wealth Protector", category: "Investment", iconName: "TrendingUp", description: "Unit-linked insurance with high-yield potential.", premium: "From Rp 1.5M/mo" },
  { id: 3, name: "Family Shield", category: "Health", iconName: "HeartPulse", description: "Full medical coverage for you and your dependents.", premium: "From Rp 1.2M/mo" },
  { id: 4, name: "Simas Scholarship", category: "Education", iconName: "GraduationCap", description: "Secure your child's future with guaranteed education funds.", premium: "From Rp 800K/mo" },
  { id: 5, name: "Mortgage Guard", category: "Asset", iconName: "Home", description: "Protect your home and family from mortgage burdens.", premium: "From Rp 300K/mo" },
  { id: 6, name: "Executive Term", category: "Corporate", iconName: "Briefcase", description: "High-value term life protection for professionals.", premium: "From Rp 2M/mo" },
];

const STATS: Stat[] = [
  { id: 1, label: "AI-Generated Leads", value: "142", delta: "+12%", iconName: "Users" },
  { id: 2, label: "Projected Premium", value: "Rp 850M", delta: "+8.4%", iconName: "TrendingUp" },
  { id: 3, label: "Life Events Detected", value: "28", delta: "+5%", iconName: "HeartPulse" },
  { id: 4, label: "Conversion Rate (AI)", value: "24.5%", delta: "+2.1%", iconName: "PieChart" },
];

// Mock Retrieval Functions (Simulating DB calls)
export const db = {
  getLeads: () => LEADS,
  getEvents: () => EVENTS,
  getProducts: () => PRODUCTS,
  getStats: () => STATS,
  getCustomerById: (id: number) => LEADS.find(l => l.id === id) || null,
  getLeadByName: (name: string) => LEADS.find(l => l.name === name) || null,
};
