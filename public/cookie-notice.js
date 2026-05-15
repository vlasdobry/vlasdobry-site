(function () {
  var key = 'cookie_notice_accepted';

  try {
    if (localStorage.getItem(key) === 'true') return;
  } catch (error) {
    // Show the notice if storage is unavailable.
  }

  var wrapper = document.createElement('div');
  wrapper.setAttribute('data-cookie-notice', 'true');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '0';
  wrapper.style.right = '0';
  wrapper.style.bottom = '0';
  wrapper.style.zIndex = '100';
  wrapper.style.padding = '16px';
  wrapper.style.pointerEvents = 'none';

  var box = document.createElement('div');
  box.style.maxWidth = '960px';
  box.style.margin = '0 auto';
  box.style.padding = '16px';
  box.style.border = '1px solid #e4e4e7';
  box.style.borderRadius = '8px';
  box.style.background = 'rgba(255,255,255,0.96)';
  box.style.boxShadow = '0 24px 60px rgba(0,0,0,0.14)';
  box.style.pointerEvents = 'auto';
  box.style.display = 'flex';
  box.style.gap = '16px';
  box.style.alignItems = 'center';
  box.style.justifyContent = 'space-between';
  box.style.flexWrap = 'wrap';

  var isEnglish = window.location.pathname.indexOf('/en/') === 0;

  var text = document.createElement('p');
  text.style.margin = '0';
  text.style.color = '#52525b';
  text.style.font = '14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  text.append(isEnglish
    ? 'This site uses cookies and analytics services for service improvement and website check tools. By continuing to use the site or clicking “I agree”, you confirm that you have read the privacy policy. '
    : 'Сайт использует cookies и сервисы аналитики для улучшения сервиса и работы инструментов проверки. Продолжая пользоваться сайтом или нажимая «Согласен», вы подтверждаете, что ознакомились с политикой обработки данных. ');

  var link = document.createElement('a');
  link.href = isEnglish ? '/en/privacy/' : '/privacy/';
  link.textContent = isEnglish ? 'Privacy policy' : 'Политика обработки данных';
  link.style.color = '#121212';
  link.style.fontWeight = '600';
  link.style.textUnderlineOffset = '4px';
  text.appendChild(link);

  var button = document.createElement('button');
  button.type = 'button';
  button.textContent = isEnglish ? 'I agree' : 'Согласен';
  button.style.border = '0';
  button.style.borderRadius = '6px';
  button.style.background = '#121212';
  button.style.color = '#fff';
  button.style.padding = '12px 18px';
  button.style.font = '700 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  button.style.letterSpacing = '0.18em';
  button.style.textTransform = 'uppercase';
  button.style.cursor = 'pointer';
  button.addEventListener('click', function () {
    try {
      localStorage.setItem(key, 'true');
    } catch (error) {
      // Hide for this page view if storage is unavailable.
    }
    wrapper.remove();
  });

  box.appendChild(text);
  box.appendChild(button);
  wrapper.appendChild(box);

  if (document.body) {
    document.body.appendChild(wrapper);
  }
})();
