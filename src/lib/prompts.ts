import { Product } from "./data";

export interface RecommendQuestion {
  step: number;
  label: string;
  question: string;
  inputType: "single";
  options: string[];
}

export const RECOMMEND_FLOW: RecommendQuestion[] = [
  {
    step: 1,
    label: "Family Situation",
    question: "Apakah Anda sudah berkeluarga dan memiliki tanggungan?",
    inputType: "single",
    options: [
      "Lajang, belum ada tanggungan",
      "Sudah menikah, belum punya anak",
      "Sudah menikah, punya anak",
      "Tulang punggung keluarga (orang tua/saudara)"
    ]
  },
  {
    step: 2,
    label: "Current Priority",
    question: "Saat ini, apa yang paling Anda prioritaskan?",
    inputType: "single",
    options: [
      "Melindungi keluarga dari risiko tak terduga",
      "Menabung untuk pendidikan anak",
      "Mengembangkan aset dan investasi",
      "Mempersiapkan masa pensiun"
    ]
  },
  {
    step: 3,
    label: "Existing Coverage",
    question: "Apakah Anda sudah memiliki asuransi sebelumnya?",
    inputType: "single",
    options: [
      "Belum punya asuransi sama sekali",
      "Sudah punya, tapi hanya dari kantor",
      "Sudah punya asuransi jiwa pribadi",
      "Sudah punya beberapa polis"
    ]
  },
  {
    step: 4,
    label: "Health Concern",
    question: "Apakah ada riwayat kesehatan yang perlu diperhatikan?",
    inputType: "single",
    options: [
      "Tidak ada, kondisi sehat",
      "Ada riwayat penyakit ringan",
      "Ada riwayat penyakit serius di keluarga",
      "Saya sendiri pernah sakit serius"
    ]
  },
  {
    step: 5,
    label: "Monthly Budget",
    question: "Berapa kisaran premi bulanan yang nyaman untuk Anda?",
    inputType: "single",
    options: [
      "Di bawah Rp 500.000",
      "Rp 500.000 – Rp 2.000.000",
      "Rp 2.000.000 – Rp 5.000.000",
      "Di atas Rp 5.000.000"
    ]
  }
];

export type RecommendAnswers = {
  familySituation: string;
  currentPriority: string;
  existingCoverage: string;
  healthConcern: string;
  monthlyBudget: string;
};

export function buildRecommendPrompt(answers: RecommendAnswers, products: Product[]): string {
  const baseProducts = products.filter(p => !p.isRider);
  const riders = products.filter(p => p.isRider);

  const productList = baseProducts
    .map((p) => `- ${p.name} (ID: ${p.id}, ${p.category}, Commission: ${Math.round(p.commission * 100)}%): ${p.description}. Premium: ${p.premium}`)
    .join("\n");

  const riderList = riders
    .map((r) => `- ${r.name} (Rider for Base IDs: ${r.riderFor?.join(", ")}): ${r.description}`)
    .join("\n");

  return `
You are SalesBooster AI, a senior insurance advisor assistant for Simas Jiwa agents.
An agent is currently sitting face-to-face with a customer and needs your recommendation RIGHT NOW.

CUSTOMER PROFILE:
- Family Situation: ${answers.familySituation}
- Current Priority: ${answers.currentPriority}
- Existing Coverage: ${answers.existingCoverage}
- Health Concern: ${answers.healthConcern}
- Monthly Budget: ${answers.monthlyBudget}

AVAILABLE PRODUCTS:
${productList}

AVAILABLE RIDERS:
${riderList}

CRITICAL FORMATTING INSTRUCTIONS:
You MUST respond using EXACTLY this structure.
Put a BLANK LINE between EVERY section.
Do NOT merge sections together.
Do NOT run text from different sections on the same line.

🏆 Rekomendasi Produk / Product Recommendation
[Write a descriptive paragraph explaining the recommended product and how it specifically addresses the customer's needs and profile mentioned above. Avoid short bullet-point style here; use a warm, advisory paragraph.]

💬 Kalimat Pembuka / Opening Line
[A single natural sentence the agent says out loud to the customer in Bahasa Indonesia]

✅ Poin Utama / Key Benefits
- [Benefit 1 — tailored to the customer's answers above]
- [Benefit 2 — tailored to the customer's answers above]
- [Benefit 3 — tailored to the customer's answers above]

⚠️ Celah Perlindungan / Coverage Gap
[Write this as a short, cohesive paragraph explaining the protection gap.]

🔄 Alternatif / Backup Option
[Write a descriptive paragraph about the second-best option and why it's a solid backup, explaining its unique value in the context of this customer.]

💎 Rider Opportunity
[Only include this section if a rider exists for the recommended product. 
Explain 1 specific rider that would materially improve the customer's coverage 
based on their profile. Mention the rider name and key benefit.]

Keep the tone confident, warm, and practical.
Write as if advising a colleague in a real sales meeting.

COMMISSION AWARENESS (Internal - Do Not Disclose to Customer):
When two products equally serve the customer's needs, prefer the one with higher agent commission.
Always recommend the full potential: if the customer qualifies for a rider on their recommended product, 
include a "💎 Rider Opportunity" section explaining the add-on.
Only suggest a rider if it is listed in the rider's riderFor array for that base product.
Never mention commission percentages to the customer.
`.trim();
}
