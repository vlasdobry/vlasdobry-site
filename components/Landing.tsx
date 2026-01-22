
import React, { useState } from 'react';

interface LandingProps {
  onBack?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onBack }) => {
  const [graceExpanded, setGraceExpanded] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16 md:py-32 bg-white text-[#121212]">
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
          Стимулирую рост через <span className="font-medium italic underline underline-offset-8 decoration-zinc-100">data-driven</span> истории и тактическую точность.
        </p>
      </header>

      {/* Stats Section */}
      <section className="mb-40">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-16">Цифры</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">8+</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">лет в digital-маркетинге</p>
          </div>
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">4</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">ниши: HoReCa, EdTech, Travel, MedTech</p>
          </div>
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">×10</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">максимальный рост продаж</p>
          </div>
          <div>
            <div className="text-5xl md:text-7xl font-black tracking-tighter">$110K</div>
            <p className="text-zinc-400 text-sm md:text-base mt-2">максимальный рекламный бюджет в месяц</p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="mb-40">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-16">Услуги</h2>
        <div className="space-y-16">
          {[
            { title: "Контекстная реклама", desc: "Google Ads и Яндекс Директ с фокусом на ROI и снижение CPA." },
            { title: "Performance-маркетинг", desc: "Управление платными каналами с контролем юнит-экономики." },
            { title: "Аналитика и оптимизация", desc: "Настройка сквозной аналитики, A/B-тесты, data-driven решения." },
            { title: "Масштабирование", desc: "Рост бюджетов и конверсий без потери эффективности." }
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
      <section className="mb-40">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-20">Избранные кейсы</h2>
        <div className="space-y-32">
          {/* Grace Group - with accordion */}
          <div className="border-t border-zinc-100 pt-16">
            <div className="flex flex-wrap gap-4 mb-8">
              {["HoReCa", "Недвижимость", "Growth"].map(tag => (
                <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">{tag}</span>
              ))}
            </div>
            <h3 className="text-4xl md:text-6xl font-bold mb-8">Grace Group</h3>
            <p className="text-xl md:text-3xl text-zinc-500 font-light mb-8 leading-tight max-w-4xl">
              От одного проекта к управлению всем маркетингом
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
                  <span className="text-zinc-400 text-sm font-bold">2022 — СПА-сеть</span>
                  <p className="text-lg text-zinc-600 mt-1">Продажи ×10, ДРР 48%→13%</p>
                </div>
                <div>
                  <span className="text-zinc-400 text-sm font-bold">2023 — Коттеджи</span>
                  <p className="text-lg text-zinc-600 mt-1">71 сделка, 44,8 млн ₽, ДРР 6,76%</p>
                </div>
                <div>
                  <span className="text-zinc-400 text-sm font-bold">2024 — Отели</span>
                  <p className="text-lg text-zinc-600 mt-1">+60% выручки, конверсия ×2</p>
                </div>
              </div>
            )}
          </div>

          {/* Other cases */}
          {[
            {
              title: "ДНК-тесты",
              desc: "CPA в 5 раз ниже плана ($1.05 при цели $5)",
              details: "8,762 конверсии, 5 стран СНГ",
              tags: ["MedTech", "СНГ", "Performance"]
            },
            {
              title: "All Right",
              desc: "+167% продаж",
              details: "Бюджет $110K, США/Европа/Азия",
              tags: ["EdTech", "International", "B2C"]
            },
            {
              title: "Kiwitaxi",
              desc: "ROMI ×2.39, доход ×2",
              details: "400+ кампаний на 5 языках",
              tags: ["Travel", "Performance", "Scale"]
            }
          ].map((project, idx) => (
            <div key={idx} className="border-t border-zinc-100 pt-16">
              <div className="flex flex-wrap gap-4 mb-8">
                {project.tags.map(tag => (
                  <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">{tag}</span>
                ))}
              </div>
              <h3 className="text-4xl md:text-6xl font-bold mb-8">{project.title}</h3>
              <p className="text-xl md:text-3xl text-zinc-500 font-light mb-4 leading-tight max-w-4xl">
                {project.desc}
              </p>
              <p className="text-lg text-zinc-400 font-light">
                {project.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="mb-40">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-16">Процесс работы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { step: "01", title: "Аудит", desc: "Анализ текущих каналов и метрик" },
            { step: "02", title: "Стратегия", desc: "Медиаплан с прогнозом ROI" },
            { step: "03", title: "Запуск", desc: "Настройка и оптимизация кампаний" },
            { step: "04", title: "Масштабирование", desc: "Рост при сохранении юнит-экономики" }
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
      <section className="py-40 text-center border-t border-zinc-100">
          <h2 className="text-5xl md:text-8xl font-black mb-16 tracking-tighter uppercase">Бесплатный экспресс-аудит</h2>
          <p className="text-xl md:text-3xl font-light text-zinc-400 mb-20 max-w-2xl mx-auto">Получите анализ ваших рекламных каналов за 24 часа</p>
          <a
            href="https://t.me/vlasdobry?text=%D0%A5%D0%BE%D1%87%D1%83%20%D0%B0%D1%83%D0%B4%D0%B8%D1%82"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xl md:text-3xl font-bold uppercase tracking-[0.3em] border-2 border-black px-12 py-6 hover:bg-black hover:text-white transition-all"
          >
              Получить аудит
          </a>
          <p className="mt-8 text-zinc-400 text-lg">
            или напишите на <a href="mailto:vlasdobry@gmail.com" className="underline hover:text-black transition-colors">vlasdobry@gmail.com</a>
          </p>
      </section>

      {/* Footer */}
      <footer className="pt-16 pb-24 flex flex-col md:flex-row justify-between items-center gap-12 border-t border-zinc-100">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-bold">Влас Федоров</h4>
          <p className="text-zinc-400 text-sm font-light mt-1">Превращаю внимание в твердый капитал.</p>
        </div>
        <div className="flex gap-10 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
          <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" className="hover:text-black">Telegram</a>
          <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" className="hover:text-black">WhatsApp</a>
          <a href="mailto:vlasdobry@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-black">Email</a>
        </div>
      </footer>
    </div>
  );
};
