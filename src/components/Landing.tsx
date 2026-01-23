
import React, { useState } from 'react';

interface LandingProps {
  onBack?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onBack }) => {
  const [graceExpanded, setGraceExpanded] = useState(false);

  return (
    <main className="max-w-5xl mx-auto px-6 sm:px-12 py-16 md:py-32 bg-white text-[#121212]">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-32">
        <div className="text-2xl font-black tracking-tighter">VD.</div>
        <button 
          onClick={onBack}
          className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black transition-colors"
        >
          Вернуться на главную
        </button>
      </nav>

      {/* Header Section */}
      <header className="mb-40">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-10">Вступление</h2>
        <p className="text-4xl sm:text-6xl md:text-7xl font-light leading-[1.05]">
          Выстраиваю систему платного трафика, которая масштабируется <span className="font-medium italic underline underline-offset-8 decoration-zinc-100">без потери эффективности</span>.
        </p>
      </header>

      {/* Stats Section */}
      <section className="mb-40" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-16">В цифрах</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">10+</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">лет в digital-маркетинге</p>
          </div>
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">4+</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">ниши: HoReCa, EdTech, Travel, MedTech и др.</p>
          </div>
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">×10</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">рекордный рост продаж за 6 месяцев</p>
          </div>
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">$110K</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">под управлением в месяц на один проект</p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="mb-40" aria-labelledby="services-heading">
        <h2 id="services-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-16">Услуги</h2>
        <div className="space-y-16">
          {[
            { title: "Платный трафик", desc: "Контекстная и геомедийная реклама: Google Ads, Яндекс Директ, Яндекс Карты, 2ГИС" },
            { title: "Воронки продаж", desc: "Проектирование пути клиента от первого касания до сделки" },
            { title: "Сквозная аналитика", desc: "Дашборды для управления, маркетинга и продаж — полная картина эффективности" },
            { title: "Масштабирование", desc: "Рост бюджетов и конверсий с сохранением юнит-экономики" }
          ].map((item, i) => (
            <div key={i} className="max-w-3xl">
              <h3 className="text-2xl md:text-4xl font-bold mb-4">{item.title}</h3>
              <p className="text-zinc-500 text-lg md:text-xl font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mb-40" aria-labelledby="cases-heading">
        <h2 id="cases-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-20">Избранные кейсы</h2>
        <div className="space-y-32">
          {/* Grace Group - with accordion */}
          <article className="border-t border-zinc-100 pt-16">
            <div className="flex flex-wrap gap-4 mb-8">
              {["HoReCa", "Недвижимость", "Growth"].map(tag => (
                <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">{tag}</span>
              ))}
            </div>
            <h3 className="text-4xl md:text-6xl font-bold mb-4">Grace Group</h3>
            <p className="text-lg text-zinc-400 font-light mb-4">Международная сеть отелей</p>
            <p className="text-xl md:text-3xl text-zinc-500 font-light mb-8 leading-tight max-w-4xl">
              Рост от одного проекта до трёх направлений бизнеса
            </p>
            <button
              onClick={() => setGraceExpanded(!graceExpanded)}
              className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-black pb-2 hover:text-zinc-400 hover:border-zinc-400 transition-colors"
            >
              {graceExpanded ? "Скрыть детали" : "Показать этапы"}
            </button>
            {graceExpanded && (
              <div className="mt-8 space-y-6 pl-4 border-l-2 border-zinc-100">
                <div>
                  <span className="text-zinc-400 text-sm font-bold">Grace Hotels</span>
                  <p className="text-lg text-zinc-600 mt-1">Международная сеть отелей. +60% выручки, конверсия ×2</p>
                </div>
                <div>
                  <span className="text-zinc-400 text-sm font-bold">Lucky Town</span>
                  <p className="text-lg text-zinc-600 mt-1">Длительная аренда домов бизнес-класса в Сочи. ДРР с 60%+ → 7% за 4 месяца</p>
                </div>
                <div>
                  <span className="text-zinc-400 text-sm font-bold">«Цветок Одиссея»</span>
                  <p className="text-lg text-zinc-600 mt-1">Сеть спа-комплексов на Черноморском побережье. Продажи ×10, ДРР 48%→13%</p>
                </div>
              </div>
            )}
          </article>

          {/* Other cases */}
          {[
            {
              title: "ДНК-диагностика",
              subtitle: "Международная сеть ДНК-диагностики",
              desc: "CPA в 5 раз ниже плана ($1.05 при цели $5)",
              details: "8,762 конверсии, Россия/Европа/СНГ",
              tags: ["MedTech", "Performance", "Аналитика", "Гео"]
            },
            {
              title: "All Right",
              subtitle: "Онлайн-школа английского для детей, Delaware, США",
              desc: "+167% продаж",
              details: "Бюджет $110K, реклама на 15+ языках, США/Европа/Азия",
              tags: ["EdTech", "International", "B2C"]
            },
            {
              title: "Kiwitaxi",
              subtitle: "Первый российский агрегатор трансферных услуг, 102 страны",
              desc: "ROMI ×2.39, доход ×2",
              details: "400+ кампаний на 5 языках",
              tags: ["Travel", "Performance", "Scale"]
            }
          ].map((project, idx) => (
            <article key={idx} className="border-t border-zinc-100 pt-16">
              <div className="flex flex-wrap gap-4 mb-8">
                {project.tags.map(tag => (
                  <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">{tag}</span>
                ))}
              </div>
              <h3 className="text-4xl md:text-6xl font-bold mb-4">{project.title}</h3>
              <p className="text-lg text-zinc-400 font-light mb-4">{project.subtitle}</p>
              <p className="text-xl md:text-3xl text-zinc-500 font-light mb-4 leading-tight max-w-4xl">
                {project.desc}
              </p>
              <p className="text-lg text-zinc-400 font-light">
                {project.details}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="mb-40" aria-labelledby="process-heading">
        <h2 id="process-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-6">Процесс работы</h2>
        <p className="text-zinc-400 font-light mb-16">Методология: SOSTAC + PDCA</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { step: "01", title: "Аудит (1-2 дня)", desc: "Декомпозиция метрик, поиск драйверов роста" },
            { step: "02", title: "Стратегия (3-5 дней)", desc: "Согласование KPI + медиаплан с прогнозом ROI" },
            { step: "03", title: "Запуск (1-2 недели)", desc: "Быстрые тесты, еженедельные итерации" },
            { step: "04", title: "Контроль (постоянно)", desc: "Unit Economics и дашборды в реальном времени" }
          ].map((item) => (
            <div key={item.step} className="flex gap-6">
              <span className="text-zinc-200 text-4xl font-black">{item.step}</span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-zinc-500 font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-40 text-center border-t border-zinc-100" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-5xl md:text-8xl font-black mb-16 tracking-tighter uppercase">Обсудить задачу</h2>
          <a
            href="https://t.me/vlasdobry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xl md:text-3xl font-bold uppercase tracking-[0.3em] border-2 border-black px-12 py-6 hover:bg-black hover:text-white transition-all"
          >
              Написать в Telegram
          </a>
          <p className="mt-8 text-zinc-400 text-lg">
            или напишите на <a href="mailto:vlasdobry@gmail.com" className="underline hover:text-black transition-colors">vlasdobry@gmail.com</a>
          </p>
      </section>

      {/* Footer */}
      <footer className="pt-16 pb-24 flex flex-col md:flex-row justify-between items-center gap-12 border-t border-zinc-100">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-bold">Влас Федоров</h4>
          <p className="text-zinc-400 text-sm font-light mt-1">Growth & Analytics</p>
        </div>
        <div className="flex gap-10 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
          <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" className="hover:text-black">Telegram</a>
          <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" className="hover:text-black">WhatsApp</a>
          <a href="mailto:vlasdobry@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-black">Email</a>
        </div>
      </footer>
    </main>
  );
};
