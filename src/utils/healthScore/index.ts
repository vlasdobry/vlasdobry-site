// src/utils/healthScore/index.ts
export * from './types';
export { calculateSeoScore } from './seoScoring';
export { calculateGeoScore } from './geoScoring';

import type { FetchedData, CombinedHealthScore } from './types';
import { calculateSeoScore } from './seoScoring';
import { calculateGeoScore } from './geoScoring';

export function calculateCombinedScore(data: FetchedData): CombinedHealthScore {
  const seo = calculateSeoScore({
    homepage: data.homepage,
    robotsTxt: data.robotsTxt,
    sitemapXml: data.sitemapXml,
  });

  const geo = calculateGeoScore({
    llmsTxt: data.llmsTxt,
    robotsTxt: data.robotsTxt,
    sitemapXml: data.sitemapXml,
    homepage: data.homepage,
  });

  return { seo, geo };
}
