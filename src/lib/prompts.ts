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
  const productList = products
    .map((p) => `- ${p.name} (${p.category}): ${p.description}. Premium: ${p.premium}`)
    .join("\n");

  return `
You are SalesBooster AI, a senior insurance advisor assistant for Simas Jiwa
agents. An agent is currently sitting face-to-face with a customer and needs 
your recommendation RIGHT NOW.

CUSTOMER PROFILE:
- Family Situation: ${answers.familySituation}
- Current Priority: ${answers.currentPriority}
- Existing Coverage: ${answers.existingCoverage}
- Health Concern: ${answers.healthConcern}
- Monthly Budget: ${answers.monthlyBudget}

AVAILABLE PRODUCTS:
${productList}

Based on this profile, respond in BILINGUAL format (Bahasa Indonesia and English).
Mirror the dominant language the agent used when triggering this flow.

Use EXACTLY this structure:

🏆 Rekomendasi Produk / Product Recommendation
[Product name — one sentence why it fits this specific customer]

💬 Kalimat Pembuka / Opening Line
[A natural sentence the agent says out loud to the customer in Bahasa Indonesia]

✅ Poin Utama / Key Benefits
- [Benefit 1 tailored to answers]
- [Benefit 2 tailored to answers]
- [Benefit 3 tailored to answers]

⚠️ Celah Perlindungan / Coverage Gap
[What this customer is missing based on their existing coverage and health answers]

🔄 Alternatif / Backup Option
[Second best product + one sentence why, if customer hesitates]

Keep tone confident, warm, and practical. Write as if advising a colleague 
in a real sales meeting.
`;
}
