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
  healthScoreError: (type: string, error: string) =>
    trackGoal('health_score_error', { type, error }),
  healthScoreCta: (type: string, domain: string, seoScore?: number, geoScore?: number) =>
    trackGoal('health_score_cta_click', { type, domain, seo_score: seoScore, geo_score: geoScore }),
};
