// src/utils/analytics.ts
// Яндекс.Метрика goal tracking

const YM_ID = 106407494;

type GoalParams = Record<string, unknown>;

export const trackGoal = (goalName: string, params?: GoalParams): void => {
  if (typeof window !== 'undefined' && typeof (window as any).ym === 'function') {
    (window as any).ym(YM_ID, 'reachGoal', goalName, params);
  }
};

// Предопределённые цели для удобства
export const analytics = {
  // Мессенджеры и контакты
  clickTelegram: (page: string) => trackGoal('click_telegram', { page }),
  clickWhatsapp: (page: string) => trackGoal('click_whatsapp', { page }),
  clickEmail: (page: string) => trackGoal('click_email', { page }),
  clickPhone: (page: string) => trackGoal('click_phone', { page }),

  // Health Score
  healthScoreStart: (type: string, domain: string) =>
    trackGoal('health_score_start', { type, domain }),
  healthScoreComplete: (type: string, domain: string, seoScore: number, geoScore: number) =>
    trackGoal('health_score_complete', { type, domain, seo_score: seoScore, geo_score: geoScore }),
  healthScoreError: (type: string, error: string, detail?: string, retry?: boolean) =>
    trackGoal('health_score_error', { type, error, detail, retry }),
  healthScoreCta: (type: string, domain: string, seoScore?: number, geoScore?: number) =>
    trackGoal('health_score_cta_click', { type, domain, seo_score: seoScore, geo_score: geoScore }),

  // Blog
  blogView: (slug: string) => trackGoal('blog_view', { slug }),
  blogCtaClick: (slug: string) => trackGoal('blog_cta_click', { slug }),
  blogHsCtaClick: (slug: string, category: string) =>
    trackGoal('blog_hs_cta_click', { slug, category }),

  // Compliance Checker (168-FZ)
  complianceStart: (domain: string) =>
    trackGoal('compliance_start', { domain }),
  complianceComplete: (domain: string, score: number, findingsCount: number) =>
    trackGoal('compliance_complete', { domain, score, findings_count: findingsCount }),
  complianceError: (error: string) =>
    trackGoal('compliance_error', { error }),
  complianceCta: (domain: string, score: number) =>
    trackGoal('compliance_cta_click', { domain, score }),
};
