// src/utils/healthScore/index.ts
export * from './types';
export { calculateSeoScore } from './seoScoring';
export { calculateGeoScore } from './geoScoring';

import type { FetchedData, CombinedHealthScore } from './types';
import { calculateSeoScore } from './seoScoring';
import { calculateGeoScore } from './geoScoring';

export function calculateCombinedScore(data: FetchedData, lang: 'ru' | 'en' = 'ru'): CombinedHealthScore {
  const seo = calculateSeoScore({
    homepage: data.homepage,
    robotsTxt: data.robotsTxt,
    sitemapXml: data.sitemapXml,
  }, lang);

  const geo = calculateGeoScore({
    llmsTxt: data.llmsTxt,
    llmsFullTxt: data.llmsFullTxt,
    robotsTxt: data.robotsTxt,
    homepage: data.homepage,
  }, lang);

  return { seo, geo };
}
