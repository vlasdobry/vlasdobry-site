export type ComplianceCategory = 'buttons' | 'headings' | 'navigation' | 'forms' | 'subheadings' | 'policies' | 'meta';

export type ComplianceSeverity = 'critical' | 'important' | 'medium' | 'info';

export interface ComplianceFinding {
  text: string;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  element: string;
}

export interface ComplianceApiResponse {
  url: string;
  findings: ComplianceFinding[];
  isSPA: boolean;
  error: string | null;
}

export interface ComplianceScore {
  total: number;
  findings: ComplianceFinding[];
  isSPA: boolean;
  categoryCounts: Record<ComplianceCategory, number>;
  status: 'compliant' | 'warnings' | 'non-compliant';
  statusLabel: string;
}
