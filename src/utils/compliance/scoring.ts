import type { ComplianceApiResponse, ComplianceScore, ComplianceCategory, ComplianceSeverity } from './types';

const SEVERITY_WEIGHTS: Record<ComplianceSeverity, number> = {
  critical: 10,
  important: 7,
  medium: 5,
  info: 0,
};

export function calculateComplianceScore(
  data: ComplianceApiResponse,
  lang: 'ru' | 'en'
): ComplianceScore {
  let score = 100;

  for (const finding of data.findings) {
    score -= SEVERITY_WEIGHTS[finding.severity];
  }

  score = Math.max(0, score);

  const categoryCounts: Record<ComplianceCategory, number> = {
    buttons: 0,
    headings: 0,
    navigation: 0,
    forms: 0,
    subheadings: 0,
    policies: 0,
    meta: 0,
  };

  for (const finding of data.findings) {
    categoryCounts[finding.category]++;
  }

  let status: ComplianceScore['status'];
  let statusLabel: string;

  if (score >= 80) {
    status = 'compliant';
    statusLabel = lang === 'ru' ? 'Соответствует' : 'Compliant';
  } else if (score >= 40) {
    status = 'warnings';
    statusLabel = lang === 'ru' ? 'Есть замечания' : 'Has warnings';
  } else {
    status = 'non-compliant';
    statusLabel = lang === 'ru' ? 'Не соответствует' : 'Non-compliant';
  }

  return {
    total: score,
    findings: data.findings,
    isSPA: data.isSPA,
    categoryCounts,
    status,
    statusLabel,
  };
}
