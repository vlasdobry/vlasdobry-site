import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section aria-label="Главный экран" className="relative h-full w-full bg-[#121212] overflow-hidden">

      {/* Mobile portrait: Full-screen background image */}
      <div className="absolute inset-0 z-0 portrait:block hidden" role="img" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: `url('/vlas-photo.jpg')` }}
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Desktop & mobile landscape: Photo on right side */}
      <div className="hidden landscape:flex lg:flex absolute right-0 top-0 w-1/2 h-full z-0 items-center justify-center">
        <div className="relative w-[68%] h-[85%]">
          <picture>
            <source srcSet="/vlas-photo.webp" type="image/webp" />
            <img
              src="/vlas-photo.jpg"
              alt="Влас Федоров — performance-маркетолог, специалист по платному трафику и growth-аналитике"
              className="w-full h-full object-contain grayscale"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-black/45" />
          {/* Gradient edges for smooth blend */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#121212] to-transparent" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#121212] to-transparent" />
          </div>
        </div>
      </div>

      {/* Content Layer - on top */}
      <div className="relative z-20 h-full w-full flex flex-col justify-end pt-4 px-6 pb-4 pr-12 sm:pt-12 sm:px-12 sm:pb-8 sm:pr-24 lg:pt-24 lg:px-24 lg:pb-12 lg:pr-32 overflow-hidden">

        {/* Top Label */}
        <div className="absolute top-10 left-6 lg:top-12 lg:left-24 animate-in fade-in duration-1000">
          <div className="flex items-center gap-4">
            <div className="w-6 md:w-8 h-[1px] bg-white/30" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-bold text-white/50 whitespace-nowrap">Влас Федоров</span>
          </div>
        </div>

        {/* Main Text Area */}
        <div className="w-full mb-[10vh] sm:mb-20 landscape:mb-4 landscape:mt-auto lg:landscape:mb-20 lg:landscape:mt-0 max-w-[90vw] md:max-w-6xl landscape:max-w-[45vw] lg:landscape:max-w-6xl">
          <h1 className="text-[2.5rem] landscape:text-[clamp(2rem,12vh,4rem)] sm:text-[3.4rem] md:text-[4rem] lg:!text-[5.4rem] xl:!text-[7.2rem] font-black leading-[0.85] tracking-tighter uppercase mb-3 sm:mb-6 landscape:mb-2 lg:landscape:mb-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 text-white whitespace-normal md:break-normal overflow-visible">
            Performance<br className="hidden md:block landscape:block" /> marketing
          </h1>

          <p className="text-base landscape:text-sm md:landscape:text-xl lg:landscape:text-2xl md:text-xl lg:text-2xl font-light text-white/80 max-w-lg md:max-w-none md:whitespace-nowrap animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 leading-tight">
            10+ лет системного подхода к платному трафику
          </p>
        </div>

        {/* Bottom Info Block */}
        <div className="w-full grid grid-cols-[max-content_max-content] gap-x-8 md:gap-x-24 gap-y-1 animate-in fade-in duration-1000 delay-500 pb-2">
          <span className="text-white/40 uppercase tracking-[0.2em] text-[9px] font-bold whitespace-nowrap">
            Фокус
          </span>
          <span className="text-white/40 uppercase tracking-[0.2em] text-[9px] font-bold whitespace-nowrap">
            Социальные сети
          </span>

          <div className="text-xs md:text-lg font-light text-white whitespace-nowrap leading-none self-end">
            Growth & Analytics
          </div>
          <div className="text-xs md:text-lg font-light text-white tracking-tight border-b border-white/20 whitespace-nowrap leading-none self-end hover:text-white/70 transition-colors cursor-pointer">
            @vlasdobry
          </div>
        </div>
      </div>

    </section>
  );
};
