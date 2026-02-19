(function initYandexMetrika() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const counterId = 106407494;
  const scriptSrc = 'https://mc.yandex.ru/metrika/tag.js?id=106407494';

  if (typeof window.ym !== 'function') {
    window.ym = function ymProxy() {
      window.ym.a = window.ym.a || [];
      window.ym.a.push(arguments);
    };
    window.ym.l = Number(new Date());
  }

  const hasScript = Array.from(document.scripts).some(script => script.src === scriptSrc);
  if (!hasScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = scriptSrc;
    document.head.appendChild(script);
  }

  window.ym(counterId, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
})();
