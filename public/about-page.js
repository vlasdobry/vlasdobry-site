(function () {
  var rotator = document.querySelector('[data-fact-rotator]');
  if (!rotator) return;

  var text = rotator.querySelector('[data-fact-text]');
  var source = rotator.querySelector('[data-fact-source]');
  var items = Array.prototype.slice.call(rotator.querySelectorAll('[data-fact-list] span'));
  if (!text || items.length < 2) return;

  var current = Math.floor(Math.random() * items.length);
  var setFact = function (index) {
    var item = items[index];
    text.textContent = item.textContent;
    if (source) source.textContent = item.getAttribute('data-source') || '';
  };

  setFact(current);

  window.setInterval(function () {
    text.classList.add('is-changing');
    window.setTimeout(function () {
      current = (current + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length;
      setFact(current);
      text.classList.remove('is-changing');
    }, 280);
  }, 4200);
})();
