import { Translations } from './types';

export const ru: Translations = {
  hero: {
    name: 'Влас Федоров',
    navForward: 'Туда',
    tagline: '10+ лет системного подхода к платному трафику',
    photoAlt: 'Влас Федоров — performance-маркетолог, специалист по платному трафику и growth-аналитике',
    focus: 'Фокус',
    social: 'Социальные сети',
  },
  landing: {
    nav: {
      back: 'Обратно',
      backNav: 'Вернуться на главную',
    },
    intro: {
      label: 'Вступление',
      text: 'Выстраиваю систему платного трафика, которая масштабируется ',
      highlight: 'без потери эффективности',
    },
    stats: {
      label: 'В цифрах',
      items: [
        { value: '10+', desc: 'лет в digital-маркетинге' },
        { value: '4+', desc: 'ниши: HoReCa, EdTech, Travel, MedTech и др.' },
        { value: '×10', desc: 'рекордный рост продаж за 6 месяцев' },
        { value: '$110K', desc: 'под управлением в месяц на один проект' },
      ],
    },
    services: {
      label: 'Услуги',
      items: [
        { title: 'Платный трафик', desc: 'Контекстная и геомедийная реклама: Google Ads, Яндекс Директ, Яндекс Карты, 2ГИС' },
        { title: 'Воронки продаж', desc: 'Проектирование пути клиента от первого касания до сделки' },
        { title: 'Сквозная аналитика', desc: 'Дашборды для управления, маркетинга и продаж — полная картина эффективности' },
        { title: 'Масштабирование', desc: 'Рост бюджетов и конверсий с сохранением юнит-экономики' },
      ],
    },
    cases: {
      label: 'Избранные кейсы',
      grace: {
        tags: ['HoReCa', 'Недвижимость', 'Growth'],
        title: 'Grace Group',
        subtitle: 'Международная сеть отелей',
        desc: 'Рост от одного проекта до трёх направлений бизнеса',
        showDetails: 'Показать этапы',
        hideDetails: 'Скрыть детали',
        details: [
          { name: 'Grace Hotels', result: 'Международная сеть отелей. +60% выручки, конверсия ×2' },
          { name: 'Lucky Town', result: 'Длительная аренда домов бизнес-класса в Сочи. ДРР с 60%+ → 7% за 4 месяца' },
          { name: '«Цветок Одиссея»', result: 'Сеть спа-комплексов на Черноморском побережье. Продажи ×10, ДРР 48%→13%' },
        ],
      },
      other: [
        {
          title: 'ДНК-диагностика',
          subtitle: 'Международная сеть ДНК-диагностики',
          desc: 'CPA в 5 раз ниже плана ($1.05 при цели $5)',
          details: '8,762 конверсии, Россия/Европа/СНГ',
          tags: ['MedTech', 'Performance', 'Аналитика', 'Гео'],
        },
        {
          title: 'All Right',
          subtitle: 'Онлайн-школа английского для детей, Delaware, США',
          desc: '+167% продаж',
          details: 'Бюджет $110K, реклама на 15+ языках, США/Европа/Азия',
          tags: ['EdTech', 'International', 'B2C'],
        },
        {
          title: 'Kiwitaxi',
          subtitle: 'Первый российский агрегатор трансферных услуг, 102 страны',
          desc: 'ROMI ×2.39, доход ×2',
          details: '400+ кампаний на 5 языках',
          tags: ['Travel', 'Performance', 'Scale'],
        },
      ],
    },
    process: {
      label: 'Процесс работы',
      methodology: 'Методология: SOSTAC + PDCA',
      steps: [
        { step: '01', title: 'Аудит (1-2 дня)', desc: 'Декомпозиция метрик, поиск драйверов роста' },
        { step: '02', title: 'Стратегия (3-5 дней)', desc: 'Согласование KPI + медиаплан с прогнозом ROI' },
        { step: '03', title: 'Запуск (1-2 недели)', desc: 'Быстрые тесты, еженедельные итерации' },
        { step: '04', title: 'Контроль (постоянно)', desc: 'Unit Economics и дашборды в реальном времени' },
      ],
    },
    contact: {
      heading: 'Обсудить задачу',
      cta: 'Написать в Telegram',
      alternative: 'или напишите на',
      email: 'vlasdobry@gmail.com',
    },
    footer: {
      name: 'Влас Федоров',
      role: 'Growth & Analytics',
      links: {
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        email: 'Email',
      },
    },
  },
};
