export type Lang = 'ru' | 'en';

export type IndustryKey = 'hotels' | 'labs' | 'spa';

export type ServiceKey = 'seo' | 'geo';

export interface ServiceSection {
  meta: { title: string; description: string };
  nav: { backToMain: string };
  hero: {
    title: string;
    subtitle: string;
    badges: string[];
    miniCta: { text: string; anchor: string };
  };
  socialProof: {
    title: string;
    stats: Array<{ value: string; label: string }>;
  };
  problem: {
    title: string;
    scenarios: Array<{ industry: string; description: string }>;
    bullets: string[];
  };
  methodology: {
    title: string;
    categories: Array<{ name: string; description: string }>;
  };
  example: {
    title: string;
    subtitle: string;
    scores: Array<{ category: string; score: string; status: string }>;
    findings: string[];
    recommendations: string[];
    caseLink: string;
  };
  deliverables: { title: string; items: string[] };
  pricing: {
    title: string;
    packages: Array<{
      name: string;
      price: string;
      features: string[];
      recommended?: boolean;
    }>;
    deliveryTime: string;
  };
  leadMagnets: Array<{
    name: string;
    description: string;
    buttonText: string;
  }>;
  relatedServices: {
    title: string;
    links: Array<{ text: string; url: string }>;
  };
  cta: {
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
    tertiaryButton?: string;
  };
  faq: { label: string; items: Array<{ question: string; answer: string }> };
  footer: {
    name: string;
    role: string;
    links: { telegram: string; whatsapp: string; email: string };
  };
}

export interface GeoServiceSection extends ServiceSection {
  education: {
    title: string;
    definition: string;
    explanation: string;
    comparison: { headers: string[]; rows: string[][] };
  };
}

export interface IndustrySection {
  nav: { backToMain: string };
  hero: { title: string; subtitle: string; stats: string };
  problems: { label: string; items: Array<{ title: string; desc: string }> };
  services: { label: string; items: Array<{ title: string; desc: string }> };
  caseStudy: {
    label: string; title: string; subtitle: string; challenge: string;
    done: Array<string>;
    results: Array<{ value: string; label: string }>;
    tags: string[];
  };
  process: {
    label: string; methodology: string;
    steps: Array<{ step: string; title: string; desc: string }>;
  };
  faq: { label: string; items: Array<{ question: string; answer: string }> };
  notFor: { label: string; items: Array<string> };
  cta: { heading: string; button: string; alternative: string; email: string };
  socialProof: { freeAudit: string };
  footer: {
    name: string; role: string; experience?: string;
    links: { telegram: string; whatsapp: string; email: string };
  };
}

export interface Translations {
  hero: {
    name: string;
    navForward: string;
    tagline: string;
    photoAlt: string;
    focus: string;
    social: string;
  };
  hotels: IndustrySection;
  spa: IndustrySection;
  labs: IndustrySection;
  services: {
    seo: ServiceSection;
    geo: GeoServiceSection;
  };
  landing: {
    nav: {
      back: string;
      backNav: string;
    };
    intro: {
      label: string;
      text: string;
      highlight: string;
    };
    stats: {
      label: string;
      items: Array<{
        value: string;
        desc: string;
      }>;
    };
    services: {
      label: string;
      items: Array<{
        title: string;
        desc: string;
      }>;
    };
    cases: {
      label: string;
      grace: {
        tags: string[];
        title: string;
        subtitle: string;
        desc: string;
        showDetails: string;
        hideDetails: string;
        details: Array<{
          name: string;
          result: string;
        }>;
      };
      other: Array<{
        title: string;
        subtitle: string;
        desc: string;
        details: string;
        tags: string[];
      }>;
    };
    process: {
      label: string;
      methodology: string;
      steps: Array<{
        step: string;
        title: string;
        desc: string;
      }>;
    };
    contact: {
      heading: string;
      cta: string;
      alternative: string;
      email: string;
    };
    footer: {
      name: string;
      role: string;
      links: {
        telegram: string;
        whatsapp: string;
        email: string;
      };
      nav: {
        offers: { label: string; items: Array<{ name: string; url: string }> };
        services: { label: string; items: Array<{ name: string; url: string }> };
      };
    };
  };
  projects: {
    nav: {
      backToMain: string;
    };
    hero: {
      title: string;
      subtitle: string;
    };
    items: Array<{
      name: string;
      description: string;
      tags: string[];
      statusKey: 'live' | 'mvp' | 'dev';
      status: string;
      url?: string;
    }>;
    alsoBuilt: {
      label: string;
      items: Array<{
        name: string;
        desc: string;
      }>;
    };
    cta: {
      heading: string;
      button: string;
      alternative: string;
      email: string;
    };
    footer: {
      name: string;
      role: string;
      links: {
        telegram: string;
        whatsapp: string;
        email: string;
      };
    };
  };
}
