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
  hotels: {
    nav: {
      backToMain: 'Back to main',
    },
    hero: {
      title: 'More Direct Bookings — Less OTA Commissions',
      subtitle: 'Full-funnel performance marketing for hotels: paid traffic, analytics, booking funnels',
      stats: '10+ years experience · 20 hotels managed · +60% revenue growth',
    },
    problems: {
      label: 'Sound familiar?',
      items: [
        {
          title: 'OTA commissions eating your margins',
          desc: 'Booking.com, Expedia, Hotels.com — 15-25% per booking adds up fast',
        },
        {
          title: 'Paid ads not delivering ROI',
          desc: 'Metasearch costs rise, attribution is broken, direct bookings stay flat',
        },
        {
          title: 'No visibility into what\'s working',
          desc: 'Cross-device journeys, cookie restrictions, booking engine silos — analytics blind spots everywhere',
        },
        {
          title: 'Competing with brands that outspend you',
          desc: 'Big chains dominate search results while independents struggle for visibility',
        },
      ],
    },
    services: {
      label: 'What I do',
      items: [
        {
          title: 'Paid traffic for hotels',
          desc: 'Google Ads, Google Hotel Ads, metasearch campaigns — driving guests directly to your website, bypassing OTA commissions',
        },
        {
          title: 'Direct booking funnels',
          desc: 'Full guest journey from discovery to payment: landing pages, retargeting, email sequences, abandoned booking recovery',
        },
        {
          title: 'End-to-end analytics',
          desc: 'Connecting ad platforms with your PMS and booking engine — see true ROI by channel and campaign, not vanity metrics',
        },
        {
          title: 'Scaling without losing efficiency',
          desc: 'Growing budgets while maintaining unit economics: from single property to hotel group with unified strategy',
        },
      ],
    },
    caseStudy: {
      label: 'Case study',
      title: 'Grace Hotels',
      subtitle: 'International chain of 20 properties',
      challenge: 'Challenge: build a guest acquisition system that works for individual properties and the brand as a whole',
      done: [
        'Individual ad campaigns tailored to each property',
        'Unified performance marketing strategy across the chain',
        'End-to-end analytics with per-property attribution',
      ],
      results: [
        { value: '+60%', label: 'revenue' },
        { value: '×2', label: 'conversion' },
      ],
      tags: ['Hospitality', 'Hotel chain', 'Performance', 'Analytics'],
    },
    process: {
      label: 'How it works',
      methodology: 'Methodology: SOSTAC + PDCA',
      steps: [
        {
          step: '01',
          title: 'Audit (1-2 days)',
          desc: 'Current channel analysis, OTA share, cost per booking, seasonality patterns',
        },
        {
          step: '02',
          title: 'Strategy (3-5 days)',
          desc: 'Media plan with forecast: direct bookings volume, target cost, channel mix',
        },
        {
          step: '03',
          title: 'Launch (1-2 weeks)',
          desc: 'Campaign setup, PMS analytics integration, initial tests and optimization',
        },
        {
          step: '04',
          title: 'Control (ongoing)',
          desc: 'Weekly reports: occupancy, cost per guest, real-time ROI by channel',
        },
      ],
    },
    faq: {
      label: 'FAQ',
      items: [
        {
          question: 'How much does it cost?',
          answer: 'Depends on property count and scope. Let\'s discuss on a call — I\'ll explain what\'s possible within your budget.',
        },
        {
          question: 'How fast will I see results?',
          answer: 'First data in 2-3 weeks after launch. Sustainable direct booking growth in 2-3 months of systematic work.',
        },
        {
          question: 'Do you work with small hotels?',
          answer: 'Yes, if ad budget is $1,000+/month. Boutique hotels and vacation rentals have working strategies too.',
        },
      ],
    },
    notFor: {
      label: 'Not a fit if',
      items: [
        'Ad budget under $1,000/month',
        'No ability to integrate analytics with PMS',
        'Need "quick results in a week"',
      ],
    },
    cta: {
      heading: 'Let\'s discuss your hotel\'s occupancy',
      button: 'Message on Telegram',
      alternative: 'or email',
      email: 'vlasdobry@gmail.com',
      scarcity: 'Taking 2-3 new hotels per month',
    },
    socialProof: {
      testimonial: {
        text: 'Vlas built a system that works for each hotel individually and for the entire chain. Now we see real ROI for every property.',
        author: 'Grace Hotels',
        role: 'Marketing Director',
      },
      freeAudit: 'Free booking channel audit',
    },
    footer: {
      name: 'Vlas Fedorov',
      role: 'Hotel Marketing',
      links: {
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        email: 'Email',
      },
    },
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
