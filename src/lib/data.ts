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
  city: string;
  province: string;
  occupation: string;
  salaryBucket: string;
  segment: string;
  purchaseIntent: string;
  channel: string;
  estCommission: string;
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

export interface ProductDetails {
  tagline: string;
  targetSegment: string;      // e.g. "Young professionals 25-35"
  keyBenefits: string[];      // 3-5 bullet points
  coverageHighlights: string[]; // e.g. "Death benefit up to Rp 5B"
  minEntry: number;           // minimum entry age
  maxEntry: number;           // maximum entry age
  maxCoverage: string;        // e.g. "Rp 5,000,000,000"
  premiumTerm: string;        // e.g. "5 / 10 / 20 years or to age 99"
  policyTerm: string;         // e.g. "To age 99"
  surrenderValue: boolean;    // does it have cash/surrender value?
  medicalRequired: boolean;   // requires medical underwriting?
}

export interface Product {
  id: number;
  name: string;
  category: string;
  iconName: string;
  description: string;
  premium: string;
  // --- AI-only fields (never render in UI) ---
  commission: number;        // % of first-year annualised premium paid to agent
  isRider: boolean;          // true = this is a rider, not a standalone product
  riderFor?: number[];       // IDs of base products this rider attaches to (if isRider)
  // --- Detail page fields ---
  details: ProductDetails;
}

export interface Customer {
  id: number;
  regSpaj: string;      // 10-char alphanumeric
  cif: string;          // 10-char alphanumeric
  policyNo: string;     // 12-char alphanumeric
  name: string;
  gender: 'male' | 'female';
  maritalStatus: 'married' | 'single' | 'widow' | 'widower';
  age: number;
  occupation: string;
  province: string;
  city: string;
  salaryBucket: string;
  segment: 'Top Customers' | 'High value Customer' | 'Medium Value Customer' | 'Low Value Customers' | 'Lost Customers';
  purchaseIntent: string;
  relationPolis: string;
  productId: number;    // references Product.id in PRODUCTS array
  productName: string;
  totalPremi: number;   // in IDR
  channel: 'Agency' | 'Bancassurance' | 'Syariah' | 'Digital';
  transactionDate: string;
}

export interface Stat {
  id: number;
  label: string;
  value: string;
  delta: string;
  iconName: string;
}





const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "SIMAS JIWA LEGACY",
    category: "Whole Life",
    iconName: "ShieldCheck",
    description: "Perlindungan seumur hidup dengan kepastian manfaat warisan untuk keluarga tercinta.",
    premium: "From Rp 2M/mo",
    commission: 0.10,
    isRider: false,
    details: {
      tagline: "Legacy Protection for Your Loved Ones",
      targetSegment: "High-net-worth individuals and established families (Ages 40-60)",
      keyBenefits: [
        "Guaranteed death benefit up to 100% of sum assured",
        "Cash value accumulation over the policy term",
        "Flexible premium payment options (5, 10, or 20 years)",
        "Hassle-free legacy planning"
      ],
      coverageHighlights: [
        "Death benefit up to Rp 10 Billion",
        "Terminal illness benefit",
        "Accidental death coverage"
      ],
      minEntry: 1,
      maxEntry: 70,
      maxCoverage: "Rp 10,000,000,000",
      premiumTerm: "5 / 10 / 20 years",
      policyTerm: "To age 99",
      surrenderValue: true,
      medicalRequired: true
    }
  },
  {
    id: 2,
    name: "SIPASTI",
    category: "Traditional Life",
    iconName: "Lock",
    description: "Asuransi jiwa tradisional dengan manfaat pasti di akhir masa asuransi.",
    premium: "From Rp 500K/mo",
    commission: 0.07,
    isRider: false,
    details: {
      tagline: "Certainty for Your Future Financial Goals",
      targetSegment: "Middle-income families seeking guaranteed financial security (Ages 30-50)",
      keyBenefits: [
        "100% money back guarantee at policy maturity",
        "Fixed premium throughout the payment term",
        "Comprehensive death benefit protection",
        "Simple and transparent policy terms"
      ],
      coverageHighlights: [
        "Guaranteed maturity benefit",
        "Death benefit during coverage period",
        "Loyalty bonus features"
      ],
      minEntry: 18,
      maxEntry: 60,
      maxCoverage: "Rp 2,000,000,000",
      premiumTerm: "10 / 15 / 20 years",
      policyTerm: "Same as premium term",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 3,
    name: "SIMAS SCHOLARSHIP PROTECTION",
    category: "Education",
    iconName: "GraduationCap",
    description: "Pastikan dana pendidikan anak tetap tersedia apapun yang terjadi pada orang tua.",
    premium: "From Rp 1M/mo",
    commission: 0.07,
    isRider: false,
    details: {
      tagline: "Guaranteeing Your Child's Bright Future",
      targetSegment: "Young parents prioritizing their children's higher education (Ages 25-45)",
      keyBenefits: [
        "Guaranteed education funds at key stages",
        "Waiver of premium if payor suffers total disability or death",
        "Additional death benefit for the insured",
        "Flexible funding options for various school levels"
      ],
      coverageHighlights: [
        "Education stage benefits (SD, SMP, SMA, Kuliah)",
        "Payor benefit included",
        "Maturity fund"
      ],
      minEntry: 20,
      maxEntry: 55,
      maxCoverage: "Rp 5,000,000,000",
      premiumTerm: "Up to child age 18",
      policyTerm: "Up to child age 23",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 4,
    name: "SIMAS LINK TASYAKUR SYARIAH",
    category: "Syariah PAYDI",
    iconName: "Moon",
    description: "Investasi dan perlindungan jiwa berbasis syariah yang penuh berkah.",
    premium: "From Rp 500K/mo",
    commission: 0.04,
    isRider: false,
    details: {
      tagline: "Sharia-Compliant Protection and Investment",
      targetSegment: "Muslim families seeking ethical and sharia-compliant financial solutions",
      keyBenefits: [
        "Based on mutual cooperation (Tabarru) principles",
        "Competitive investment returns from sharia-compliant funds",
        "Flexible contribution and top-up options",
        "Professional investment management"
      ],
      coverageHighlights: [
        "Sharia-compliant death benefit",
        "Investment account value",
        "No Riba, Gharar, or Maysir"
      ],
      minEntry: 1,
      maxEntry: 65,
      maxCoverage: "Market dependent",
      premiumTerm: "Flexible",
      policyTerm: "To age 99",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 5,
    name: "SIMAS MAXI PRO",
    category: "PAYDI",
    iconName: "TrendingUp",
    description: "Produk asuransi jiwa dengan porsi investasi yang optimal untuk pertumbuhan aset.",
    premium: "From Rp 1.5M/mo",
    commission: 0.05,
    isRider: false,
    details: {
      tagline: "Maximum Growth for Your Wealth and Protection",
      targetSegment: "Growth-oriented investors and dynamic professionals",
      keyBenefits: [
        "High allocation to investment funds from day one",
        "Access to professional fund managers",
        "Comprehensive choice of equity, fixed income, and money market funds",
        "Life protection with potential for significant asset growth"
      ],
      coverageHighlights: [
        "Life coverage + investment value",
        "Accidental death coverage included",
        "Flexible withdrawal options"
      ],
      minEntry: 1,
      maxEntry: 70,
      maxCoverage: "Rp 20,000,000,000",
      premiumTerm: "Single or Regular",
      policyTerm: "To age 99",
      surrenderValue: true,
      medicalRequired: true
    }
  },
  {
    id: 6,
    name: "ASURANSI MAXI PRO",
    category: "PAYDI",
    iconName: "Activity",
    description: "Perlindungan jiwa modern dengan fleksibilitas pengelolaan investasi.",
    premium: "From Rp 1M/mo",
    commission: 0.04,
    isRider: false,
    details: {
      tagline: "Dynamic Wealth and Life Solution",
      targetSegment: "Young professionals and digital-savvy investors",
      keyBenefits: [
        "Automated rebalancing options",
        "Low management fees for better net returns",
        "Wide range of underlying asset classes",
        "Instant portfolio tracking via mobile"
      ],
      coverageHighlights: [
        "Customizable sum assured",
        "Emergency withdrawal features",
        "Investment loyalty bonus"
      ],
      minEntry: 18,
      maxEntry: 65,
      maxCoverage: "Rp 5,000,000,000",
      premiumTerm: "Regular",
      policyTerm: "To age 99",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 7,
    name: "SIJATI",
    category: "Traditional Life",
    iconName: "Heart",
    description: "Perlindungan jiwa murni dengan premi terjangkau dan manfaat pasti.",
    premium: "From Rp 300K/mo",
    commission: 0.06,
    isRider: false,
    details: {
      tagline: "Pure and Sincere Life Protection",
      targetSegment: "First-time insurance buyers and young families",
      keyBenefits: [
        "Very affordable premiums for high coverage",
        "Guaranteed payout for death benefit",
        "Easy application process with no medical check-up options",
        "Stable and predictable financial security"
      ],
      coverageHighlights: [
        "Death benefit up to Rp 1 Billion",
        "Simple underwriting",
        "Term options up to 20 years"
      ],
      minEntry: 1,
      maxEntry: 60,
      maxCoverage: "Rp 1,000,000,000",
      premiumTerm: "5 / 10 / 15 / 20 years",
      policyTerm: "Same as premium term",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 8,
    name: "SIMAS 1 LINK",
    category: "PAYDI",
    iconName: "BarChart3",
    description: "Satu solusi untuk proteksi jiwa dan investasi jangka panjang yang handal.",
    premium: "From Rp 750K/mo",
    commission: 0.03,
    isRider: false,
    details: {
      tagline: "Integrated Life and Investment Journey",
      targetSegment: "Middle-class families planning for retirement",
      keyBenefits: [
        "Balanced approach between protection and growth",
        "Easy top-up at any time",
        "Diverse fund selection for different risk profiles",
        "Comprehensive annual statements"
      ],
      coverageHighlights: [
        "Standard death benefit",
        "Investment account growth",
        "Optional riders support"
      ],
      minEntry: 1,
      maxEntry: 65,
      maxCoverage: "Rp 3,000,000,000",
      premiumTerm: "Regular",
      policyTerm: "To age 99",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 9,
    name: "DECREASING TERM LIFE",
    category: "Term Life",
    iconName: "ArrowDownToLine",
    description: "Asuransi jiwa dengan uang pertanggungan yang menurun seiring waktu, ideal untuk jaminan kredit.",
    premium: "From Rp 200K/mo",
    commission: 0.03,
    isRider: false,
    details: {
      tagline: "Specialized Protection for Your Financial Obligations",
      targetSegment: "Homeowners with mortgages and entrepreneurs with business loans",
      keyBenefits: [
        "Premiums remain low throughout the term",
        "Coverage matches your outstanding loan balance",
        "Ensures your family keeps the home/business in case of loss",
        "Single premium payment option available"
      ],
      coverageHighlights: [
        "Credit life protection",
        "Death benefit covers remaining debt",
        "Term up to 30 years"
      ],
      minEntry: 20,
      maxEntry: 65,
      maxCoverage: "Matches loan amount",
      premiumTerm: "Single / Regular",
      policyTerm: "Up to 30 years",
      surrenderValue: false,
      medicalRequired: true
    }
  },
  {
    id: 10,
    name: "OPTIMA PLUS",
    category: "Critical Illness",
    iconName: "Stethoscope",
    description: "Perlindungan finansial terhadap risiko penyakit kritis yang tak terduga.",
    premium: "From Rp 400K/mo",
    commission: 0.02,
    isRider: false,
    details: {
      tagline: "Comprehensive Shield Against Critical Illnesses",
      targetSegment: "Individuals with family medical history and health-conscious professionals",
      keyBenefits: [
        "Coverage for over 50 types of critical illnesses",
        "Lump sum payment upon diagnosis",
        "Funds can be used for treatment or living expenses",
        "Premium waiver upon early stage detection"
      ],
      coverageHighlights: [
        "Rp 1 Billion critical illness benefit",
        "No medical check-up for lower sum assured",
        "Worldwide coverage"
      ],
      minEntry: 18,
      maxEntry: 60,
      maxCoverage: "Rp 2,500,000,000",
      premiumTerm: "To age 65",
      policyTerm: "To age 75",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 11,
    name: "SIJI SMART KID",
    category: "Education",
    iconName: "BookOpen",
    description: "Tabungan pendidikan pintar untuk menjamin masa depan akademis buah hati.",
    premium: "From Rp 1.2M/mo",
    commission: 0.06,
    isRider: false,
    details: {
      tagline: "Smart Saving for Your Smart Kids",
      targetSegment: "Modern parents seeking structured education savings",
      keyBenefits: [
        "Regular payouts for school enrollment fees",
        "Investment link for potential extra growth",
        "Life protection for both parent and child",
        "Easy withdrawal for educational needs"
      ],
      coverageHighlights: [
        "Staged education payouts",
        "Investment growth + protection",
        "Accidental benefit"
      ],
      minEntry: 1,
      maxEntry: 15,
      maxCoverage: "Rp 3,000,000,000",
      premiumTerm: "Up to age 18",
      policyTerm: "Up to age 25",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 12,
    name: "MEGA MAXI PLAN",
    category: "Traditional Life",
    iconName: "Briefcase",
    description: "Rencana perlindungan maksimal dengan akumulasi dana untuk kebutuhan masa depan.",
    premium: "From Rp 2.5M/mo",
    commission: 0.06,
    isRider: false,
    details: {
      tagline: "Maximum Plan for Your Life's Big Milestones",
      targetSegment: "Established professionals and business owners",
      keyBenefits: [
        "High sum assured for peace of mind",
        "Guaranteed cash dividends annually",
        "Flexible term options based on life goals",
        "Comprehensive family protection"
      ],
      coverageHighlights: [
        "Death benefit Rp 5B+",
        "Annual dividends",
        "Premium holiday options"
      ],
      minEntry: 18,
      maxEntry: 60,
      maxCoverage: "Rp 15,000,000,000",
      premiumTerm: "10 / 20 years",
      policyTerm: "To age 85",
      surrenderValue: true,
      medicalRequired: true
    }
  },
  {
    id: 13,
    name: "SIMAS JIWA LEGACY - SYARIAH",
    category: "Whole Life",
    iconName: "ShieldCheck",
    description: "Perlindungan seumur hidup berbasis syariah dengan prinsip gotong royong.",
    premium: "From Rp 2M/mo",
    commission: 0.08,
    isRider: false,
    details: {
      tagline: "Blessed Legacy for Your Family",
      targetSegment: "Muslim HNWIs seeking sharia-compliant estate planning",
      keyBenefits: [
        "Tabarru fund for shared risk protection",
        "Ethical investment of surplus funds",
        "Transparent fee and profit-sharing structure",
        "Sharia-certified legacy planning"
      ],
      coverageHighlights: [
        "Sharia death benefit Rp 10B",
        "Investment surplus distribution",
        "Hajj/Umrah benefit options"
      ],
      minEntry: 1,
      maxEntry: 70,
      maxCoverage: "Rp 10,000,000,000",
      premiumTerm: "5 / 10 / 20 years",
      policyTerm: "To age 99",
      surrenderValue: true,
      medicalRequired: true
    }
  },
  {
    id: 14,
    name: "KADO JENIUS - MKJ5",
    category: "Traditional Life",
    iconName: "Gift",
    description: "Hadiah masa depan yang cerdas dengan manfaat perlindungan dan tabungan.",
    premium: "From Rp 500K/mo",
    commission: 0.07,
    isRider: false,
    details: {
      tagline: "The Smartest Gift for Your Future Self",
      targetSegment: "Young adults starting their financial journey",
      keyBenefits: [
        "Short premium term (only 5 years)",
        "Guaranteed cash back after 10 years",
        "Basic life protection included",
        "Simple and easy to manage"
      ],
      coverageHighlights: [
        "100% premium back + bonus",
        "Basic death benefit",
        "Short-term commitment"
      ],
      minEntry: 1,
      maxEntry: 55,
      maxCoverage: "Rp 1,000,000,000",
      premiumTerm: "5 years",
      policyTerm: "10 years",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 15,
    name: "MEGA SECURE PLAN",
    category: "Traditional Life",
    iconName: "Shield",
    description: "Rencana keamanan finansial yang kokoh untuk menghadapi ketidakpastian hidup.",
    premium: "From Rp 1.5M/mo",
    commission: 0.06,
    isRider: false,
    details: {
      tagline: "Solid Security for Uncertain Times",
      targetSegment: "Stable families and mature professionals",
      keyBenefits: [
        "High guaranteed death benefit",
        "Fixed premiums regardless of economic conditions",
        "Automatic premium loan feature",
        "Guaranteed surrender value growth"
      ],
      coverageHighlights: [
        "Rp 5B death benefit",
        "Total permanent disability",
        "Cash value accumulation"
      ],
      minEntry: 18,
      maxEntry: 60,
      maxCoverage: "Rp 10,000,000,000",
      premiumTerm: "10 / 15 / 20 years",
      policyTerm: "To age 80",
      surrenderValue: true,
      medicalRequired: true
    }
  },
  {
    id: 16,
    name: "SIMAS HERITAGE PLAN",
    category: "Whole Life",
    iconName: "Crown",
    description: "Rencana perlindungan eksklusif untuk menjaga kekayaan dan warisan keluarga.",
    premium: "From Rp 5M/mo",
    commission: 0.09,
    isRider: false,
    details: {
      tagline: "Preserving Your Heritage for Generations",
      targetSegment: "Elite clients and multi-generational business owners",
      keyBenefits: [
        "Ultra-high sum assured options",
        "Concierge underwriting service",
        "Estate tax liquidity solutions",
        "Perpetual protection for family legacy"
      ],
      coverageHighlights: [
        "Rp 50B+ max coverage",
        "Worldwide high-risk protection",
        "Cash value growth"
      ],
      minEntry: 1,
      maxEntry: 75,
      maxCoverage: "Rp 100,000,000,000",
      premiumTerm: "Single / 5 / 10 years",
      policyTerm: "To age 100",
      surrenderValue: true,
      medicalRequired: true
    }
  },
  {
    id: 17,
    name: "SIJI SMART KID DOLLAR",
    category: "Education",
    iconName: "Banknote",
    description: "Tabungan pendidikan dalam mata uang USD untuk rencana studi di luar negeri.",
    premium: "From $200/mo",
    commission: 0.06,
    isRider: false,
    details: {
      tagline: "Global Education Planning in US Dollars",
      targetSegment: "Parents planning international education for their children",
      keyBenefits: [
        "Savings and payouts in USD to hedge against currency risk",
        "Guaranteed education funds for overseas universities",
        "Life protection for the parent in USD",
        "Competitive returns from dollar-denominated assets"
      ],
      coverageHighlights: [
        "USD education payouts",
        "Dollar-denominated death benefit",
        "Global study protection"
      ],
      minEntry: 1,
      maxEntry: 50,
      maxCoverage: "$1,000,000",
      premiumTerm: "Up to child age 18",
      policyTerm: "Up to child age 23",
      surrenderValue: true,
      medicalRequired: false
    }
  },
  {
    id: 18,
    name: "SIMAS MAXI PRO SYARIAH",
    category: "Syariah PAYDI",
    iconName: "Leaf",
    description: "Investasi dan perlindungan maksimal dengan nilai-nilai syariah yang murni.",
    premium: "From Rp 1.5M/mo",
    commission: 0.03,
    isRider: false,
    details: {
      tagline: "Maximum Sharia Wealth and Protection Solution",
      targetSegment: "Sharia-focused HNWIs and business professionals",
      keyBenefits: [
        "Maximum sharia-compliant asset allocation",
        "High profit-sharing ratio for investment funds",
        "Zakat and Waqf integration features",
        "Comprehensive protection with religious peace of mind"
      ],
      coverageHighlights: [
        "High Sharia death benefit",
        "Optimized Tabarru management",
        "Investment account value"
      ],
      minEntry: 1,
      maxEntry: 70,
      maxCoverage: "Rp 20,000,000,000",
      premiumTerm: "Single or Regular",
      policyTerm: "To age 99",
      surrenderValue: true,
      medicalRequired: true
    }
  },
  // --- RIDERS ---
  {
    id: 101,
    name: "Simas Waiver of Premium Rider",
    category: "Rider",
    iconName: "Hand",
    description: "Bebas premi jika tertanggung menderita cacat tetap total atau penyakit kritis.",
    premium: "Varies",
    commission: 0.02,
    isRider: true,
    riderFor: [1, 2, 3, 5, 8, 13, 16],
    details: {
      tagline: "Continuous Protection Without Premium Burden",
      targetSegment: "All policyholders wanting to ensure policy continuity",
      keyBenefits: [
        "Waives future premiums upon TPD/CI",
        "Keeps basic policy benefits active",
        "Ensures long-term financial goals are met",
        "Low additional cost"
      ],
      coverageHighlights: [
        "Total Permanent Disability waiver",
        "Critical Illness waiver",
        "Available for most base plans"
      ],
      minEntry: 18,
      maxEntry: 60,
      maxCoverage: "Matches base premium",
      premiumTerm: "Until age 65",
      policyTerm: "Matches base plan",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 102,
    name: "Simas Accidental Death Rider",
    category: "Rider",
    iconName: "Zap",
    description: "Tambahan santunan jika kematian terjadi karena kecelakaan.",
    premium: "Varies",
    commission: 0.03,
    isRider: true,
    riderFor: [1, 2, 7, 9, 13, 16],
    details: {
      tagline: "Double Protection for Accidental Risks",
      targetSegment: "Individuals with high mobility or active lifestyles",
      keyBenefits: [
        "Additional payout on top of basic death benefit",
        "High coverage for low extra cost",
        "Covers various types of accidents",
        "Fast claim processing for accidental cases"
      ],
      coverageHighlights: [
        "Up to 100% extra sum assured",
        "Covers traffic and work accidents",
        "Public transport accidental bonus"
      ],
      minEntry: 1,
      maxEntry: 60,
      maxCoverage: "Rp 5,000,000,000",
      premiumTerm: "Matches base plan",
      policyTerm: "Matches base plan",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 103,
    name: "Simas Critical Illness Rider",
    category: "Rider",
    iconName: "Activity",
    description: "Manfaat tambahan untuk perlindungan terhadap penyakit kritis.",
    premium: "Varies",
    commission: 0.04,
    isRider: true,
    riderFor: [1, 5, 8, 13, 16],
    details: {
      tagline: "Extra Shield Against Life-Threatening Diseases",
      targetSegment: "Mature professionals and family breadwinners",
      keyBenefits: [
        "Lump sum payout for 30+ critical illnesses",
        "Does not reduce basic death benefit sum assured",
        "Can be used for alternative treatments",
        "Worldwide protection"
      ],
      coverageHighlights: [
        "Cancer, Stroke, Heart Attack coverage",
        "Lump sum up to Rp 2B",
        "Early stage options"
      ],
      minEntry: 18,
      maxEntry: 60,
      maxCoverage: "Rp 2,000,000,000",
      premiumTerm: "Matches base plan",
      policyTerm: "Until age 70",
      surrenderValue: false,
      medicalRequired: true
    }
  },
  {
    id: 104,
    name: "Simas Hospital Cash Rider",
    category: "Rider",
    iconName: "PlusCircle",
    description: "Santunan harian selama rawat inap di rumah sakit.",
    premium: "Varies",
    commission: 0.01,
    isRider: true,
    riderFor: [1, 10, 13, 16],
    details: {
      tagline: "Daily Cash When You're Hospitalized",
      targetSegment: "Individuals seeking income replacement during recovery",
      keyBenefits: [
        "Fixed daily cash benefit during hospitalization",
        "Covers ICU and surgical costs",
        "No coordination of benefits required (double claim OK)",
        "Direct payout to the policyholder"
      ],
      coverageHighlights: [
        "Rp 1M/day hospital cash",
        "Rp 2M/day ICU cash",
        "Rp 10M surgical benefit"
      ],
      minEntry: 1,
      maxEntry: 60,
      maxCoverage: "Rp 2,000,000/day",
      premiumTerm: "Matches base plan",
      policyTerm: "Until age 65",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 105,
    name: "Simas Total Disability Rider",
    category: "Rider",
    iconName: "Accessibility",
    description: "Santunan jika tertanggung mengalami cacat tetap total.",
    premium: "Varies",
    commission: 0.02,
    isRider: true,
    riderFor: [1, 2, 7, 9, 13, 16],
    details: {
      tagline: "Financial Support for Permanent Disability",
      targetSegment: "Active workers and breadwinners",
      keyBenefits: [
        "Lump sum payment for loss of limbs/sight/hearing",
        "Provides capital for career transition or lifestyle changes",
        "Secures family income when you can no longer work",
        "Simple criteria for total permanent disability"
      ],
      coverageHighlights: [
        "100% SA for total disability",
        "Partial disability options",
        "Rehabilitation benefit"
      ],
      minEntry: 18,
      maxEntry: 60,
      maxCoverage: "Rp 5,000,000,000",
      premiumTerm: "Matches base plan",
      policyTerm: "Until age 65",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 106,
    name: "Simas Payor Benefit Rider",
    category: "Rider",
    iconName: "Users",
    description: "Bebas premi jika pemegang polis meninggal dunia atau cacat tetap total.",
    premium: "Varies",
    commission: 0.02,
    isRider: true,
    riderFor: [3, 11, 17],
    details: {
      tagline: "Protecting Your Child's Policy Payments",
      targetSegment: "Parents and grandparents buying policies for children",
      keyBenefits: [
        "Ensures child's education funds stay on track",
        "Waives premiums if payor can no longer contribute",
        "Protects the child's future even without the parent",
        "Crucial for long-term education planning"
      ],
      coverageHighlights: [
        "Waiver upon Payor's death",
        "Waiver upon Payor's TPD",
        "Effective until child age 25"
      ],
      minEntry: 20,
      maxEntry: 60,
      maxCoverage: "Matches base premium",
      premiumTerm: "Until age 65 (Payor)",
      policyTerm: "Matches base plan",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 107,
    name: "Simas Personal Accident Rider",
    category: "Rider",
    iconName: "AlertTriangle",
    description: "Perlindungan komprehensif terhadap berbagai jenis kecelakaan diri.",
    premium: "Varies",
    commission: 0.03,
    isRider: true,
    riderFor: [1, 2, 5, 8, 9, 13, 16],
    details: {
      tagline: "Comprehensive Shield for Active Living",
      targetSegment: "Professionals with outdoor activities and frequent travelers",
      keyBenefits: [
        "Accidental death and dismemberment benefit",
        "Accidental medical reimbursement",
        "Weekly income benefit if unable to work temporarily",
        "No-claim bonus for safe policyholders"
      ],
      coverageHighlights: [
        "Death benefit Rp 2B",
        "Medical reimbursement Rp 50M",
        "Ambulance cost coverage"
      ],
      minEntry: 1,
      maxEntry: 65,
      maxCoverage: "Rp 5,000,000,000",
      premiumTerm: "Matches base plan",
      policyTerm: "Matches base plan",
      surrenderValue: false,
      medicalRequired: false
    }
  },
  {
    id: 108,
    name: "Simas Top-Up Protector Rider",
    category: "Rider",
    iconName: "TrendingUp",
    description: "Perlindungan asuransi jiwa tambahan untuk nilai top-up investasi Anda.",
    premium: "Varies",
    commission: 0.01,
    isRider: true,
    riderFor: [4, 5, 6, 8, 18],
    details: {
      tagline: "Maximizing the Value of Your Extra Investments",
      targetSegment: "Unit-link investors making frequent top-ups",
      keyBenefits: [
        "Adds insurance coverage to every top-up dollar",
        "Ensures investment value is protected for beneficiaries",
        "Flexible sum assured adjustments based on top-up frequency",
        "Optimized for wealth transfer planning"
      ],
      coverageHighlights: [
        "Top-up insurance value",
        "Inheritance protection for assets",
        "Low sharia/cost deductions"
      ],
      minEntry: 1,
      maxEntry: 70,
      maxCoverage: "Matches top-up value",
      premiumTerm: "Single top-up dependent",
      policyTerm: "Matches base plan",
      surrenderValue: true,
      medicalRequired: false
    }
  }
];

export const CUSTOMERS: Customer[] = [
  {
    id: 1,
    regSpaj: 'UT6FIZHJMX',
    cif: '45RHQFZQMJ',
    policyNo: 'GZVL7GBXT6AQ',
    name: 'Elisa Sinaga',
    gender: 'female',
    maritalStatus: 'single',
    age: 28,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'KALIMANTAN BARAT',
    city: 'KOTA PONTIANAK',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 2,
    productName: 'SIPASTI',
    totalPremi: 20000000,
    channel: 'Bancassurance',
    transactionDate: '9/4/2024',
  },
  {
    id: 2,
    regSpaj: 'LMUCOA9LCP',
    cif: 'YCM1725C1V',
    policyNo: 'L01BO0W7LG50',
    name: 'Putri Wijaya',
    gender: 'female',
    maritalStatus: 'married',
    age: 61,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA SELATAN',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 2,
    productName: 'SIPASTI',
    totalPremi: 24000000,
    channel: 'Bancassurance',
    transactionDate: '9/30/2024',
  },
  {
    id: 3,
    regSpaj: '9CS4A2IS06',
    cif: 'SAC07J0NP7',
    policyNo: 'H3W6D0NOQ91U',
    name: 'Tania Simanjuntak',
    gender: 'female',
    maritalStatus: 'married',
    age: 51,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'BANTEN',
    city: 'KOTA TANGERANG SELATAN',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 500000000,
    channel: 'Bancassurance',
    transactionDate: '8/21/2025',
  },
  {
    id: 4,
    regSpaj: 'TEL745CSF0',
    cif: '7S9EFVBREV',
    policyNo: 'VAHRCPYRD4Q9',
    name: 'Gita Siahaan',
    gender: 'female',
    maritalStatus: 'married',
    age: 42,
    occupation: 'Pedagang Grosir',
    province: 'BANGKA BELITUNG',
    city: 'BELITUNG',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Retirement',
    relationPolis: 'Diri Sendiri',
    productId: 2,
    productName: 'SIPASTI',
    totalPremi: 12000000,
    channel: 'Bancassurance',
    transactionDate: '3/27/2025',
  },
  {
    id: 5,
    regSpaj: 'QDM2KON8U3',
    cif: 'F1ZZ81JCDY',
    policyNo: '31L7CRE7RIJ8',
    name: 'Fara Tobing',
    gender: 'female',
    maritalStatus: 'married',
    age: 49,
    occupation: 'Karyawan Swasta',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA PUSAT',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Retirement',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 500000000,
    channel: 'Bancassurance',
    transactionDate: '10/31/2025',
  },
  {
    id: 6,
    regSpaj: 'UD24DKRF4F',
    cif: 'TYZBLI4Z3Y',
    policyNo: '60IRQBCWDOU4',
    name: 'Hesti Nugraha',
    gender: 'female',
    maritalStatus: 'single',
    age: 23,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 250000000,
    channel: 'Bancassurance',
    transactionDate: '7/4/2025',
  },
  {
    id: 7,
    regSpaj: 'ZJ82ZQYJM3',
    cif: 'N3L9H7H6WK',
    policyNo: 'Q6JRPACQ5XZ9',
    name: 'Gilang Simanjuntak',
    gender: 'male',
    maritalStatus: 'married',
    age: 34,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAMBI',
    city: 'KOTA JAMBI',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 250000000,
    channel: 'Bancassurance',
    transactionDate: '9/23/2025',
  },
  {
    id: 8,
    regSpaj: 'A9LBPREC5Y',
    cif: 'TOBXI9GZKP',
    policyNo: 'D639WRNFMB5F',
    name: 'Sandi Tobing',
    gender: 'male',
    maritalStatus: 'married',
    age: 59,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'KALIMANTAN BARAT',
    city: 'KOTA PONTIANAK',
    salaryBucket: '> 1 Milyar',
    segment: 'High value Customer',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 1000000000,
    channel: 'Bancassurance',
    transactionDate: '8/4/2025',
  },
  {
    id: 9,
    regSpaj: 'GFBCHZ6PUF',
    cif: 'B8Z5NICMLE',
    policyNo: 'NIFGNPGR8P8N',
    name: 'Irfan Wijaya',
    gender: 'male',
    maritalStatus: 'married',
    age: 35,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TENGAH',
    city: 'KOTA SEMARANG',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 2,
    productName: 'SIPASTI',
    totalPremi: 30000000,
    channel: 'Bancassurance',
    transactionDate: '7/26/2023',
  },
  {
    id: 10,
    regSpaj: '7Y6CLGRR4C',
    cif: 'TIDSSJ2W6B',
    policyNo: 'GTIBLSHABBBX',
    name: 'Fajar Suharto',
    gender: 'male',
    maritalStatus: 'married',
    age: 54,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'KALIMANTAN TIMUR',
    city: 'KOTA BALIKPAPAN',
    salaryBucket: '> 1 Milyar',
    segment: 'High value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 2,
    productName: 'SIPASTI',
    totalPremi: 91620000,
    channel: 'Bancassurance',
    transactionDate: '8/24/2023',
  },
  {
    id: 11,
    regSpaj: 'K8OQ5GLIGY',
    cif: 'D5U2NKMBGF',
    policyNo: 'UBDEL4T3XB53',
    name: 'Gilang Tambunan',
    gender: 'male',
    maritalStatus: 'married',
    age: 44,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'LAMPUNG',
    city: 'KOTA BANDAR LAMPUNG',
    salaryBucket: '> 500 Juta - 1 Milyar',
    segment: 'High value Customer',
    purchaseIntent: 'Education',
    relationPolis: 'Orang tua kandung',
    productId: 11,
    productName: 'SIJI SMART KID',
    totalPremi: 29626000,
    channel: 'Bancassurance',
    transactionDate: '6/9/2023',
  },
  {
    id: 12,
    regSpaj: 'O5W5D8QBA3',
    cif: '88AR3UDHAD',
    policyNo: 'ZRWRJT67E3ZO',
    name: 'Lukman Siregar',
    gender: 'male',
    maritalStatus: 'married',
    age: 40,
    occupation: 'Karyawan Swasta',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA UTARA',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'High value Customer',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 250000000,
    channel: 'Bancassurance',
    transactionDate: '9/23/2025',
  },
  {
    id: 13,
    regSpaj: '9551AXTO8D',
    cif: 'QRYS5I84W8',
    policyNo: 'E36LT7IS7VYN',
    name: 'Yesi Hidayat',
    gender: 'female',
    maritalStatus: 'married',
    age: 33,
    occupation: 'Pegawai Negri Sipil',
    province: '',
    city: '',
    salaryBucket: '0 - 50 Juta',
    segment: 'Lost Customers',
    purchaseIntent: 'Education',
    relationPolis: 'Diri Sendiri',
    productId: 14,
    productName: 'KADO JENIUS - MKJ5',
    totalPremi: 7014000,
    channel: 'Agency',
    transactionDate: '10/15/2015',
  },
  {
    id: 14,
    regSpaj: 'TKXZ0RW9DK',
    cif: 'ZFCCFWZH5N',
    policyNo: 'T6CND2UZR4Y8',
    name: 'Rini Rahmadi',
    gender: 'female',
    maritalStatus: 'married',
    age: 44,
    occupation: 'Wiraswasta/Wirausaha',
    province: '',
    city: '',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 6,
    productName: 'ASURANSI MAXI PRO',
    totalPremi: 350000,
    channel: 'Agency',
    transactionDate: '7/30/2015',
  },
  {
    id: 15,
    regSpaj: 'YEKZYZ7W2G',
    cif: 'MR2ZH5T1G1',
    policyNo: 'FA2QBAM7P9FO',
    name: 'Putri Wibowo',
    gender: 'female',
    maritalStatus: 'single',
    age: 37,
    occupation: 'Karyawan Swasta',
    province: '',
    city: '',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 4,
    productName: 'SIMAS LINK TASYAKUR SYARIAH',
    totalPremi: 250000,
    channel: 'Syariah',
    transactionDate: '8/31/2015',
  },
  {
    id: 16,
    regSpaj: 'B5TNN41WC6',
    cif: 'CPIBW0BVXG',
    policyNo: 'WPYZX0RCW3UU',
    name: 'Rini Wibowo',
    gender: 'female',
    maritalStatus: 'single',
    age: 34,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'SUMATERA UTARA',
    city: 'KOTA MEDAN',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Health',
    relationPolis: 'Diri Sendiri',
    productId: 6,
    productName: 'ASURANSI MAXI PRO',
    totalPremi: 400000,
    channel: 'Agency',
    transactionDate: '3/14/2016',
  },
  {
    id: 17,
    regSpaj: 'MQYBXPFYJL',
    cif: 'YYAHU8YJ50',
    policyNo: 'AOPW6OY1FX97',
    name: 'Elisa Tambunan',
    gender: 'female',
    maritalStatus: 'married',
    age: 33,
    occupation: 'Pegawai Bank',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA BARAT',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 9,
    productName: 'DECREASING TERM LIFE',
    totalPremi: 181650,
    channel: 'Agency',
    transactionDate: '12/30/2021',
  },
  {
    id: 18,
    regSpaj: '4AQBI4FO7P',
    cif: 'QS60A4MBF3',
    policyNo: 'TBACCRY5LRBJ',
    name: 'Sinta Harahap',
    gender: 'female',
    maritalStatus: 'married',
    age: 39,
    occupation: 'Other',
    province: '',
    city: '',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Orang tua kandung',
    productId: 12,
    productName: 'MEGA MAXI PLAN',
    totalPremi: 9450000,
    channel: 'Agency',
    transactionDate: '10/13/2014',
  },
  {
    id: 19,
    regSpaj: 'DZOJD5F0GF',
    cif: 'U78SBZ1FW9',
    policyNo: 'SW5N23FH2B44',
    name: 'Clara Manurung',
    gender: 'female',
    maritalStatus: 'married',
    age: 40,
    occupation: 'Wiraswasta/Wirausaha',
    province: '',
    city: '',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Education',
    relationPolis: 'Diri Sendiri',
    productId: 4,
    productName: 'SIMAS LINK TASYAKUR SYARIAH',
    totalPremi: 300000,
    channel: 'Syariah',
    transactionDate: '9/17/2015',
  },
  {
    id: 20,
    regSpaj: 'MNTXBJ31DN',
    cif: 'ZYR3L3BCKA',
    policyNo: 'D6TVGSZGEUR8',
    name: 'Yusuf Suharto',
    gender: 'male',
    maritalStatus: 'single',
    age: 34,
    occupation: 'Wiraswasta/Wirausaha',
    province: '',
    city: '',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 4,
    productName: 'SIMAS LINK TASYAKUR SYARIAH',
    totalPremi: 600000,
    channel: 'Syariah',
    transactionDate: '7/31/2015',
  },
  {
    id: 21,
    regSpaj: 'QVJQS4CPTR',
    cif: 'ZDP6CHCV8W',
    policyNo: 'ICQVL5ELZQTM',
    name: 'Made Situmorang',
    gender: 'male',
    maritalStatus: 'single',
    age: 33,
    occupation: 'Karyawan Swasta',
    province: '',
    city: '',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 4,
    productName: 'SIMAS LINK TASYAKUR SYARIAH',
    totalPremi: 400000,
    channel: 'Syariah',
    transactionDate: '9/30/2015',
  },
  {
    id: 22,
    regSpaj: 'YAZPQV6UU2',
    cif: '4FWKYZU4KN',
    policyNo: '7P98WU1JLB3W',
    name: 'Gilang Pardede',
    gender: 'male',
    maritalStatus: 'married',
    age: 49,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'SUMATERA UTARA',
    city: 'KOTA MEDAN',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 6,
    productName: 'ASURANSI MAXI PRO',
    totalPremi: 350000,
    channel: 'Agency',
    transactionDate: '6/16/2015',
  },
  {
    id: 23,
    regSpaj: 'B8H7CYQBWK',
    cif: 'TGCJSTBH3V',
    policyNo: 'B0ZW6HIV7ML6',
    name: 'Dani Hartono',
    gender: 'male',
    maritalStatus: 'single',
    age: 31,
    occupation: 'Karyawan Swasta',
    province: 'SUMATERA UTARA',
    city: 'KOTA MEDAN',
    salaryBucket: '> 50 Juta - 100 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Health',
    relationPolis: 'Diri Sendiri',
    productId: 6,
    productName: 'ASURANSI MAXI PRO',
    totalPremi: 350000,
    channel: 'Agency',
    transactionDate: '10/8/2015',
  },
  {
    id: 24,
    regSpaj: 'RL9QFCPK7P',
    cif: 'O841F6IM0C',
    policyNo: '51J3JL8DRYDH',
    name: 'Yoga Lubis',
    gender: 'male',
    maritalStatus: 'married',
    age: 47,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'SUMATERA BARAT',
    city: 'KOTA PADANG',
    salaryBucket: '0 - 50 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 9,
    productName: 'DECREASING TERM LIFE',
    totalPremi: 98100,
    channel: 'Agency',
    transactionDate: '10/18/2019',
  },
  {
    id: 25,
    regSpaj: '1QAYTTZ9UU',
    cif: '3G7HCJOTMB',
    policyNo: 'W5RVIT4HQ3OZ',
    name: 'Bambang Panjaitan',
    gender: 'male',
    maritalStatus: 'single',
    age: 37,
    occupation: 'Karyawan Swasta',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA PUSAT',
    salaryBucket: '> 50 Juta - 100 Juta',
    segment: 'Low Value Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 10,
    productName: 'OPTIMA PLUS',
    totalPremi: 250000,
    channel: 'Bancassurance',
    transactionDate: '5/27/2015',
  },
  {
    id: 26,
    regSpaj: 'SQ7TFS2E2F',
    cif: 'ZTF8RT7X9Z',
    policyNo: '57OCBPMSXMHG',
    name: 'Vina Wibowo',
    gender: 'female',
    maritalStatus: 'married',
    age: 29,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 2123820,
    channel: 'Agency',
    transactionDate: '11/9/2020',
  },
  {
    id: 27,
    regSpaj: 'YLX2CRL39Y',
    cif: '3XFVIZXHZA',
    policyNo: 'UU9F645HZI8D',
    name: 'Yuni Situmorang',
    gender: 'female',
    maritalStatus: 'single',
    age: 29,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 12750000,
    channel: 'Agency',
    transactionDate: '7/30/2020',
  },
  {
    id: 28,
    regSpaj: 'YQGYIW59OD',
    cif: 'RIOZMMP8DM',
    policyNo: '1OI3K82WV7O6',
    name: 'Intan Saragih',
    gender: 'female',
    maritalStatus: 'married',
    age: 54,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 34258000,
    channel: 'Agency',
    transactionDate: '10/31/2019',
  },
  {
    id: 29,
    regSpaj: '3I6WTL0OC7',
    cif: 'FNZ21BQUGZ',
    policyNo: 'XS44DUAWZOWR',
    name: 'Sri Nainggolan',
    gender: 'female',
    maritalStatus: 'single',
    age: 33,
    occupation: 'Karyawan Swasta',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 8253600,
    channel: 'Agency',
    transactionDate: '6/28/2019',
  },
  {
    id: 30,
    regSpaj: 'X8UBES81DE',
    cif: 'CWGFYUEGTH',
    policyNo: 'WOAI6NWDZ4RG',
    name: 'Farah Rajagukguk',
    gender: 'female',
    maritalStatus: 'married',
    age: 44,
    occupation: 'Ibu Rumah Tangga',
    province: 'KALIMANTAN BARAT',
    city: 'KOTA PONTIANAK',
    salaryBucket: '0 - 50 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Education',
    relationPolis: 'Orang tua kandung',
    productId: 11,
    productName: 'SIJI SMART KID',
    totalPremi: 68404000,
    channel: 'Bancassurance',
    transactionDate: '3/14/2022',
  },
  {
    id: 31,
    regSpaj: 'U8KY6E1YMS',
    cif: 'J6X87XPR35',
    policyNo: 'FK0UBHTUT8TR',
    name: 'Tania Setiawan',
    gender: 'female',
    maritalStatus: 'married',
    age: 59,
    occupation: 'Pegawai Negri Sipil',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA PUSAT',
    salaryBucket: '0 - 50 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Retirement',
    relationPolis: 'Diri Sendiri',
    productId: 2,
    productName: 'SIPASTI',
    totalPremi: 10000000,
    channel: 'Bancassurance',
    transactionDate: '2/14/2023',
  },
  {
    id: 32,
    regSpaj: 'IU321Z3WKW',
    cif: 'M147BQKVNQ',
    policyNo: 'TFJX1X19RA1U',
    name: 'Joko Prasetyo',
    gender: 'male',
    maritalStatus: 'married',
    age: 57,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'SUMATERA UTARA',
    city: 'KOTA MEDAN',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 6,
    productName: 'ASURANSI MAXI PRO',
    totalPremi: 800000,
    channel: 'Agency',
    transactionDate: '8/13/2015',
  },
  {
    id: 33,
    regSpaj: 'XWNRSNIMUX',
    cif: 'K0KNE5YSO0',
    policyNo: 'RABY4KY6MGB2',
    name: 'Rafi Nasution',
    gender: 'male',
    maritalStatus: 'married',
    age: 54,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Orang tua kandung',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 5896800,
    channel: 'Agency',
    transactionDate: '7/3/2020',
  },
  {
    id: 34,
    regSpaj: 'YKGICX7FNB',
    cif: '4JA8JZNL7K',
    policyNo: 'J8FQ6NT5QISQ',
    name: 'Yusuf Saragih',
    gender: 'male',
    maritalStatus: 'married',
    age: 42,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 2638710,
    channel: 'Agency',
    transactionDate: '7/30/2020',
  },
  {
    id: 35,
    regSpaj: '69AC9T6P07',
    cif: 'BHRQIJ4GYI',
    policyNo: '7WR4J759XOKL',
    name: 'Fajar Wijaya',
    gender: 'male',
    maritalStatus: 'married',
    age: 33,
    occupation: 'Karyawan Swasta',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA PUSAT',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 3610000,
    channel: 'Agency',
    transactionDate: '12/22/2021',
  },
  {
    id: 36,
    regSpaj: '6WGL8I9AKF',
    cif: 'BOE0NLHG6H',
    policyNo: 'SW51AQH1UC3V',
    name: 'Yudi Sembiring',
    gender: 'male',
    maritalStatus: 'married',
    age: 57,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 6446790,
    channel: 'Agency',
    transactionDate: '11/10/2020',
  },
  {
    id: 37,
    regSpaj: '8MQ5S45NMT',
    cif: 'GQEIW2KJ0A',
    policyNo: 'RLS18FSRGF48',
    name: 'Ivan Sitorus',
    gender: 'male',
    maritalStatus: 'single',
    age: 21,
    occupation: 'Karyawan Swasta',
    province: 'KEPULAUAN RIAU',
    city: 'KOTA BATAM',
    salaryBucket: '> 500 Juta - 1 Milyar',
    segment: 'Medium Value Customer',
    purchaseIntent: 'Protection',
    relationPolis: 'Kerja/Majikan-Karyawan',
    productId: 7,
    productName: 'SIJATI',
    totalPremi: 2000000,
    channel: 'Agency',
    transactionDate: '4/4/2024',
  },
  {
    id: 38,
    regSpaj: 'VZ8KKD2D96',
    cif: 'CL8JB2MGMC',
    policyNo: 'V0V846AOES4J',
    name: 'Indah Samosir',
    gender: 'female',
    maritalStatus: 'married',
    age: 68,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'SUMATERA UTARA',
    city: 'ASAHAN',
    salaryBucket: '> 1 Milyar',
    segment: 'Top Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Orang tua kandung',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 250000000,
    channel: 'Bancassurance',
    transactionDate: '8/1/2025',
  },
  {
    id: 39,
    regSpaj: 'S0S3THZOUT',
    cif: 'PT1TM902AP',
    policyNo: '11H4IAUWKP5E',
    name: 'Ayu Tambunan',
    gender: 'female',
    maritalStatus: 'married',
    age: 32,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 5590463,
    channel: 'Agency',
    transactionDate: '10/29/2025',
  },
  {
    id: 40,
    regSpaj: 'GFJHOU409Y',
    cif: 'C9PN1QRXG4',
    policyNo: 'U7O30YAJT4QG',
    name: 'Putri Budiman',
    gender: 'female',
    maritalStatus: 'widow',
    age: 40,
    occupation: 'Direktur',
    province: 'JAWA TENGAH',
    city: 'KOTA SEMARANG',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 2,
    productName: 'SIPASTI',
    totalPremi: 15750000,
    channel: 'Bancassurance',
    transactionDate: '11/30/2023',
  },
  {
    id: 41,
    regSpaj: 'GSDJTCK00Z',
    cif: 'JJZ3F144WS',
    policyNo: 'GBRT5LAM7BU3',
    name: 'Mira Panjaitan',
    gender: 'female',
    maritalStatus: 'single',
    age: 44,
    occupation: 'Guru (Lainnya)',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 250000000,
    channel: 'Bancassurance',
    transactionDate: '7/17/2025',
  },
  {
    id: 42,
    regSpaj: 'FHYZ3K8XL7',
    cif: '7HWFTDO9KF',
    policyNo: 'WYA96EIZ0EKV',
    name: 'Mega Nasution',
    gender: 'female',
    maritalStatus: 'married',
    age: 66,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA BARAT',
    city: 'KOTA SUKABUMI',
    salaryBucket: '> 250 Juta - 300 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Protection',
    relationPolis: 'Orang tua kandung',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 500000000,
    channel: 'Bancassurance',
    transactionDate: '8/15/2025',
  },
  {
    id: 43,
    regSpaj: 'JP192IUUFL',
    cif: 'YS73VLZRAP',
    policyNo: 'G33SUB8WLFYA',
    name: 'Ika Purnama',
    gender: 'female',
    maritalStatus: 'married',
    age: 64,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'RIAU',
    city: 'KOTA PEKAN BARU',
    salaryBucket: '> 500 Juta - 1 Milyar',
    segment: 'Top Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 300000000,
    channel: 'Bancassurance',
    transactionDate: '7/10/2025',
  },
  {
    id: 44,
    regSpaj: 'LXSY4VY32I',
    cif: '4TB76GIN1X',
    policyNo: 'IVW5HX2S2MNN',
    name: 'Nanda Santoso',
    gender: 'male',
    maritalStatus: 'married',
    age: 68,
    occupation: 'Karyawan Swasta',
    province: 'SUMATERA BARAT',
    city: 'KOTA PADANG',
    salaryBucket: '> 500 Juta - 1 Milyar',
    segment: 'Top Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Suami/Istri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 1000000000,
    channel: 'Bancassurance',
    transactionDate: '9/12/2025',
  },
  {
    id: 45,
    regSpaj: 'H7PPCADUVL',
    cif: 'S667A0EFWJ',
    policyNo: 'TO9SEBS7IN20',
    name: 'Arif Purba',
    gender: 'male',
    maritalStatus: 'married',
    age: 37,
    occupation: 'Pemuka Agama',
    province: 'DKI JAKARTA',
    city: 'KOTA JAKARTA PUSAT',
    salaryBucket: '0 - 50 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 120000000,
    channel: 'Agency',
    transactionDate: '7/7/2025',
  },
  {
    id: 46,
    regSpaj: 'TEKT3DHERH',
    cif: '1ZZJ85G1BA',
    policyNo: '2DG74R1YCC7Z',
    name: 'Andi Simanjuntak',
    gender: 'male',
    maritalStatus: 'married',
    age: 62,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'KALIMANTAN TIMUR',
    city: 'KOTA SAMARINDA',
    salaryBucket: '> 1 Milyar',
    segment: 'Top Customers',
    purchaseIntent: 'Protection',
    relationPolis: 'Diri Sendiri',
    productId: 3,
    productName: 'SIMAS SCHOLARSHIP PROTECTION',
    totalPremi: 1000000000,
    channel: 'Bancassurance',
    transactionDate: '8/6/2025',
  },
  {
    id: 47,
    regSpaj: 'CPV4H1RZF1',
    cif: 'A9R0UAPRJ2',
    policyNo: 'W8TJG9IY19ON',
    name: 'Ryan Siregar',
    gender: 'male',
    maritalStatus: 'married',
    age: 36,
    occupation: 'Karyawan Swasta',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '> 100 Juta - 150 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 10193500,
    channel: 'Agency',
    transactionDate: '9/30/2020',
  },
  {
    id: 48,
    regSpaj: 'BXMMNR1V1Z',
    cif: 'D1CECZW3YN',
    policyNo: 'M9OZW85CUEY6',
    name: 'Nico Prasetyo',
    gender: 'male',
    maritalStatus: 'single',
    age: 36,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '0 - 50 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Investment',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 15901920,
    channel: 'Agency',
    transactionDate: '9/26/2019',
  },
  {
    id: 49,
    regSpaj: '7WGXXASHVF',
    cif: 'YDC2F96KCN',
    policyNo: 'LPR1QUW10VXC',
    name: 'Zaki Purnama',
    gender: 'male',
    maritalStatus: 'married',
    age: 53,
    occupation: 'Wiraswasta/Wirausaha',
    province: 'JAWA TIMUR',
    city: 'KOTA SURABAYA',
    salaryBucket: '0 - 50 Juta',
    segment: 'Top Customers',
    purchaseIntent: 'Family Protection',
    relationPolis: 'Diri Sendiri',
    productId: 1,
    productName: 'SIMAS JIWA LEGACY',
    totalPremi: 6040125,
    channel: 'Agency',
    transactionDate: '9/24/2020',
  },
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
    { name: "SIMAS JIWA LEGACY", pct: 68, color: "#6366f1" },
    { name: "SIMAS SCHOLARSHIP PROTECTION", pct: 54, color: "#8b5cf6" },
    { name: "SIMAS MAXI PRO", pct: 41, color: "#a78bfa" },
  ],
  kpis: [
    { label: "Conversion Rate", value: "23.4%", delta: "+4.2% vs last month", color: "#22c55e" },
    { label: "Avg. Deal Size", value: "Rp 2.3M", delta: "+8.1% vs last month", color: "#6366f1" },
  ]
};

// Mock Retrieval Functions (Simulating DB calls)

const LEADS: Lead[] = CUSTOMERS.map((c, index) => {
  const getScore = (seg: string, id: number) => {
    let base = 20;
    if (seg === 'Top Customers') base = 90;
    else if (seg === 'High value Customer') base = 80;
    else if (seg === 'Medium Value Customer') base = 65;
    else if (seg === 'Low Value Customers') base = 40;
    const variance = (id * 17) % 10;
    return base + variance;
  };
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Med';
    return 'Low';
  };
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `Rp ${parseFloat((amount / 1000000000).toFixed(1))}B/yr`;
    if (amount >= 1000000) return `Rp ${parseFloat((amount / 1000000).toFixed(1))}M/yr`;
    return `Rp ${Math.round(amount / 1000)}K/yr`;
  };

  const score = getScore(c.segment, c.id);

  const matchedProduct = PRODUCTS.find(p => p.name === c.productName || p.id === c.productId);
  const commissionRate = matchedProduct ? matchedProduct.commission : 0.05; // Fallback to 5%
  const commissionValue = c.totalPremi * commissionRate;

  const eventTypes = [
    'Birthday', 'Inforce', 'Policy Being Processed', 'Lapse', 
    'Surrender', 'Freelook', 'Reinstate', 'Health Claim'
  ] as const;
  const eventType = eventTypes[index % eventTypes.length];

  return {
    id: c.id,
    name: c.name,
    age: c.age,
    dob: `01 Jan ${new Date().getFullYear() - c.age}`,
    score: score,
    scoreLabel: getScoreLabel(score),
    event: eventType,
    product: c.productName,
    premium: formatCurrency(c.totalPremi),
    estCommission: formatCurrency(commissionValue),
    avatar: c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
    phone: `+62 812-XXXX-${c.id.toString().padStart(4, '0')}`,
    policies: 1,
    city: c.city || 'Jakarta',
    province: c.province || 'DKI Jakarta',
    occupation: c.occupation || 'Professional',
    salaryBucket: c.salaryBucket || 'Not specified',
    segment: c.segment,
    purchaseIntent: c.purchaseIntent,
    channel: c.channel
  };
});

const EVENTS: LifeEvent[] = CUSTOMERS.slice(0, 15).map((c, index) => {
  const eventTypes = [
    'Birthday', 'Inforce', 'Policy Being Processed', 'Lapse', 
    'Surrender', 'Freelook', 'Reinstate', 'Health Claim'
  ] as const;
  const eventType = eventTypes[index % eventTypes.length];
  const priorities = ['High', 'Medium', 'Low'] as const;
  const priority = priorities[index % priorities.length];
  const colors = ['rose', 'blue', 'amber', 'emerald', 'purple', 'indigo'];
  const color = colors[index % colors.length];
  
  return {
    id: `evt_${c.id.toString().padStart(3, '0')}`,
    customerName: c.name,
    eventType: eventType,
    description: `Automated event trigger for ${c.name} regarding ${eventType} based on ${c.purchaseIntent} interest.`,
    timestamp: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `${index} days ago`,
    priority: priority,
    color: color
  };
});

export const db = {
  getLeads: () => LEADS,
  getEvents: () => EVENTS,
  getProducts: () => PRODUCTS,
  getStats: () => STATS,
  getAnalytics: () => ANALYTICS,
  getCustomerById: (id: number) => LEADS.find(l => l.id === id) || null,
  getLeadByName: (name: string) => LEADS.find(l => l.name === name) || null,
  getCustomers: () => CUSTOMERS,
};
