import { Translations } from './types';

export const en: Translations = {
  hero: {
    name: 'Vlas Fedorov',
    navForward: 'Enter',
    tagline: '10+ years of data-driven paid traffic management',
    photoAlt: 'Vlas Fedorov — performance marketing specialist, paid traffic and growth analytics expert',
    focus: 'Focus',
    social: 'Social',
  },
  landing: {
    nav: {
      back: 'Back',
      backNav: 'Back to main',
    },
    intro: {
      label: 'Introduction',
      text: 'I build paid traffic systems that scale ',
      highlight: 'without losing efficiency',
    },
    stats: {
      label: 'By the numbers',
      items: [
        { value: '10+', desc: 'years in digital marketing' },
        { value: '4+', desc: 'industries: HoReCa, EdTech, Travel, MedTech' },
        { value: '×10', desc: 'record sales growth in 6 months' },
        { value: '$110K', desc: 'monthly ad spend managed per project' },
      ],
    },
    services: {
      label: 'Services',
      items: [
        { title: 'Paid Traffic', desc: 'PPC and display advertising: Google Ads, Microsoft Ads, Meta Ads, local platforms' },
        { title: 'Sales Funnels', desc: 'Customer journey design from first touch to closed deal' },
        { title: 'Full-Funnel Analytics', desc: 'Dashboards for management, marketing, and sales — complete performance visibility' },
        { title: 'Scaling', desc: 'Budget and conversion growth while maintaining unit economics' },
      ],
    },
    cases: {
      label: 'Featured Cases',
      grace: {
        tags: ['HoReCa', 'Real Estate', 'Growth'],
        title: 'Grace Group',
        subtitle: 'International hotel chain',
        desc: 'Growth from one project to three business lines',
        showDetails: 'Show details',
        hideDetails: 'Hide details',
        details: [
          { name: 'Grace Hotels', result: 'International hotel chain. +60% revenue, 2× conversion rate' },
          { name: 'Lucky Town', result: 'Premium long-term rentals in Sochi. Ad cost ratio 60%+ → 7% in 4 months' },
          { name: 'Odyssey Flower', result: 'Spa resort chain on Black Sea coast. Sales ×10, ad cost 48%→13%' },
        ],
      },
      other: [
        {
          title: 'DNA Diagnostics',
          subtitle: 'International DNA testing network',
          desc: 'CPA 5× below target ($1.05 vs $5 goal)',
          details: '8,762 conversions across Russia/Europe/CIS',
          tags: ['MedTech', 'Performance', 'Analytics', 'Geo'],
        },
        {
          title: 'All Right',
          subtitle: 'Online English school for kids, Delaware, USA',
          desc: '+167% sales',
          details: '$110K budget, ads in 15+ languages, USA/Europe/Asia',
          tags: ['EdTech', 'International', 'B2C'],
        },
        {
          title: 'Kiwitaxi',
          subtitle: 'Leading transfer booking platform, 102 countries',
          desc: 'ROMI ×2.39, revenue ×2',
          details: '400+ campaigns in 5 languages',
          tags: ['Travel', 'Performance', 'Scale'],
        },
      ],
    },
    process: {
      label: 'Work Process',
      methodology: 'Methodology: SOSTAC + PDCA',
      steps: [
        { step: '01', title: 'Audit (1-2 days)', desc: 'Metrics decomposition, growth driver identification' },
        { step: '02', title: 'Strategy (3-5 days)', desc: 'KPI alignment + media plan with ROI forecast' },
        { step: '03', title: 'Launch (1-2 weeks)', desc: 'Rapid testing, weekly iterations' },
        { step: '04', title: 'Control (ongoing)', desc: 'Unit economics and real-time dashboards' },
      ],
    },
    contact: {
      heading: 'Let\'s Talk',
      cta: 'Message on Telegram',
      alternative: 'or email me at',
      email: 'vlasdobry@gmail.com',
    },
    footer: {
      name: 'Vlas Fedorov',
      role: 'Growth & Analytics',
      links: {
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        email: 'Email',
      },
    },
  },
};
