export interface CustomerFeatures {
  age: number;
  segment: string;
  salaryBucket: string;
  policyCount: number;
  eventType: string;
  channel: string;
  city: string;
  province: string;
  purchaseIntent: string;
  maritalStatus: string;
}

export interface SHAPBreakdown {
  feature: string;
  rawValue: string;
  encodedScore: number;
  shapContribution: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface ScoringResult {
  finalScore: number;
  scoreLabel: 'High' | 'Medium' | 'Low';
  shapBreakdown: SHAPBreakdown[];
  eventUrgencyClass: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  productFitLabels: string[];
  churnRiskLabels: string[];
}

export function encodeAge(age: number): number {
  if (age <= 17) return 10;
  if (age <= 24) return 30;
  if (age <= 34) return 60;
  if (age <= 44) return 75;
  if (age <= 54) return 80;
  if (age <= 64) return 70;
  return 55;
}

export function encodeSegment(segment: string): number {
  switch (segment) {
    case 'Top Customers': return 95;
    case 'High value Customer': return 80;
    case 'Medium Value Customer': return 60;
    case 'Low Value Customers': return 35;
    case 'Lost Customers': return 10;
    default: return 40;
  }
}

export function encodeSalary(salaryBucket: string): number {
  switch (salaryBucket) {
    case '> 1 Milyar': return 95;
    case '> 500 Juta - 1 Milyar': return 85;
    case '> 250 Juta - 300 Juta': return 75;
    case '> 100 Juta - 150 Juta': return 65;
    case '> 50 Juta - 100 Juta': return 50;
    case '0 - 50 Juta': return 30;
    default: return 40;
  }
}

export function encodePolicyCount(count: number): number {
  if (count === 0) return 20;
  if (count === 1) return 50;
  if (count === 2) return 70;
  if (count === 3) return 80;
  return 90;
}

export function encodeEventUrgency(eventType: string): number {
  switch (eventType) {
    case 'Lapse': return 95;
    case 'Surrender': return 92;
    case 'Health Claim': return 90;
    case 'Freelook': return 85;
    case 'Reinstate': return 75;
    case 'Birthday': return 70;
    case 'Policy Being Processed': return 65;
    case 'Inforce': return 50;
    default: return 50;
  }
}

export function encodeChannel(channel: string): number {
  switch (channel) {
    case 'Bancassurance': return 85;
    case 'Digital': return 80;
    case 'Agency': return 75;
    case 'Syariah': return 70;
    default: return 60;
  }
}

export function encodeLocation(city: string, province: string): number {
  const hasCity = city && city.trim() !== '';
  const hasProvince = province && province.trim() !== '';
  if (hasCity && hasProvince) return 80;
  if (hasCity || hasProvince) return 60;
  return 40;
}

export function encodeIntent(intent: string): number {
  switch (intent) {
    case 'Protection': return 85;
    case 'Family Protection': return 85;
    case 'Investment': return 75;
    case 'Education': return 70;
    case 'Retirement': return 65;
    case 'Health': return 60;
    default: return 55;
  }
}

export function encodeMarital(status: string): number {
  switch (status.toLowerCase()) {
    case 'married': return 80;
    case 'widower': return 70;
    case 'widow': return 70;
    case 'single': return 60;
    default: return 60;
  }
}

export function getScoreLabel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

export function computeScore(features: CustomerFeatures): ScoringResult {
  const BASE_VALUE = 50;
  
  const ageScore = encodeAge(features.age);
  const segmentScore = encodeSegment(features.segment);
  const salaryScore = encodeSalary(features.salaryBucket);
  const policyCountScore = encodePolicyCount(features.policyCount);
  const eventUrgencyScore = encodeEventUrgency(features.eventType);
  const channelScore = encodeChannel(features.channel);
  const locationScore = encodeLocation(features.city, features.province);
  const intentScore = encodeIntent(features.purchaseIntent);
  
  const shapBreakdown: SHAPBreakdown[] = [
    {
      feature: 'age',
      rawValue: features.age.toString(),
      encodedScore: ageScore,
      shapContribution: (ageScore - 50) * 0.20,
      direction: ageScore >= 50 ? (ageScore === 50 ? 'neutral' : 'positive') : 'negative'
    },
    {
      feature: 'segment',
      rawValue: features.segment,
      encodedScore: segmentScore,
      shapContribution: (segmentScore - 50) * 0.25,
      direction: segmentScore >= 50 ? (segmentScore === 50 ? 'neutral' : 'positive') : 'negative'
    },
    {
      feature: 'salary',
      rawValue: features.salaryBucket,
      encodedScore: salaryScore,
      shapContribution: (salaryScore - 50) * 0.15,
      direction: salaryScore >= 50 ? (salaryScore === 50 ? 'neutral' : 'positive') : 'negative'
    },
    {
      feature: 'policyCount',
      rawValue: features.policyCount.toString(),
      encodedScore: policyCountScore,
      shapContribution: (policyCountScore - 50) * 0.12,
      direction: policyCountScore >= 50 ? (policyCountScore === 50 ? 'neutral' : 'positive') : 'negative'
    },
    {
      feature: 'eventUrgency',
      rawValue: features.eventType,
      encodedScore: eventUrgencyScore,
      shapContribution: (eventUrgencyScore - 50) * 0.15,
      direction: eventUrgencyScore >= 50 ? (eventUrgencyScore === 50 ? 'neutral' : 'positive') : 'negative'
    },
    {
      feature: 'channel',
      rawValue: features.channel,
      encodedScore: channelScore,
      shapContribution: (channelScore - 50) * 0.05,
      direction: channelScore >= 50 ? (channelScore === 50 ? 'neutral' : 'positive') : 'negative'
    },
    {
      feature: 'location',
      rawValue: `${features.city}, ${features.province}`,
      encodedScore: locationScore,
      shapContribution: (locationScore - 50) * 0.03,
      direction: locationScore >= 50 ? (locationScore === 50 ? 'neutral' : 'positive') : 'negative'
    },
    {
      feature: 'intent',
      rawValue: features.purchaseIntent,
      encodedScore: intentScore,
      shapContribution: (intentScore - 50) * 0.05,
      direction: intentScore >= 50 ? (intentScore === 50 ? 'neutral' : 'positive') : 'negative'
    }
  ];

  const rawScore = BASE_VALUE + shapBreakdown.reduce((sum, item) => sum + item.shapContribution, 0);
  const finalScore = Math.round(Math.min(Math.max(rawScore, 5), 98));
  
  let eventUrgencyClass: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (eventUrgencyScore >= 85) eventUrgencyClass = 'CRITICAL';
  else if (eventUrgencyScore >= 70) eventUrgencyClass = 'HIGH';
  else if (eventUrgencyScore >= 50) eventUrgencyClass = 'MEDIUM';
  
  const productFitLabels: string[] = [];
  if (features.age >= 35 && (segmentScore >= 75 || salaryScore >= 75)) productFitLabels.push('Whole Life');
  if (features.age >= 25 && features.age <= 50 && intentScore >= 70 && features.maritalStatus.toLowerCase() === 'married') productFitLabels.push('Education');
  if (features.age >= 40 || features.eventType === 'Health Claim') productFitLabels.push('Critical Illness');
  if (intentScore >= 75 && features.age >= 25 && features.age <= 55 && salaryScore >= 65) productFitLabels.push('PAYDI/Investment');
  if (features.age >= 20 && features.age <= 45 && intentScore >= 85 && features.policyCount <= 1) productFitLabels.push('Term Life');
  if (features.channel === 'Syariah') productFitLabels.push('Syariah');
  if (features.policyCount >= 2 && (features.age >= 35 || eventUrgencyScore >= 70)) productFitLabels.push('Rider Opportunity');
  
  const churnRiskLabels: string[] = [];
  if (features.eventType === 'Lapse' || (features.policyCount <= 1 && segmentScore <= 40)) churnRiskLabels.push('Lapse Risk');
  if (features.eventType === 'Surrender' || segmentScore <= 35) churnRiskLabels.push('Surrender Risk');
  if (segmentScore >= 70 && features.policyCount >= 2) churnRiskLabels.push('Upgrade Potential');
  if (features.eventType === 'Reinstate' || features.segment === 'Lost Customers') churnRiskLabels.push('Reactivation');

  return {
    finalScore,
    scoreLabel: getScoreLabel(finalScore),
    shapBreakdown,
    eventUrgencyClass,
    productFitLabels,
    churnRiskLabels
  };
}