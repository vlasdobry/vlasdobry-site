// src/utils/healthScore/types.ts

export interface ResourceResult {
  url: string;
  status: number;
  content: string | null;
  error: string | null;
  responseTime: number;
}

export interface FetchedData {
  domain: string;
  llmsTxt: ResourceResult;
  robotsTxt: ResourceResult;
  sitemapXml: ResourceResult;
  homepage: ResourceResult;
}

export interface Issue {
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  issues: Issue[];
}

export interface SeoHealthScore {
  total: number;
  breakdown: {
    title: number;
    description: number;
    h1: number;
    viewport: number;
    indexability: number;
    robotsTxt: number;
    sitemap: number;
    schemaOrg: number;
  };
  issues: Issue[];
  status: 'critical' | 'warning' | 'good' | 'excellent';
  statusLabel: string;
}

export interface GeoHealthScore {
  total: number;
  breakdown: {
    llmsTxt: number;
    robotsTxt: number;
    sitemap: number;
    schemaOrg: number;
  };
  issues: Issue[];
  status: 'critical' | 'warning' | 'good' | 'excellent';
  statusLabel: string;
}

export interface CombinedHealthScore {
  seo: SeoHealthScore;
  geo: GeoHealthScore;
}
