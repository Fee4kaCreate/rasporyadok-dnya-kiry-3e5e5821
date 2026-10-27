// Недельный обзор: все семь дней рядом, чтобы родителю был виден весь план сразу.
// По умолчанию в карточке дня показываются 5 задач — сколько именно, можно выбрать.
var weekBox = document.getElementById('week');
var weekCountBox = document.getElementById('weekCount');
var WEEK_COUNT_KEY = 'kira-week-count-v1';
var weekCount = 5;

function readWeekCount() {
  try {
    var v = parseInt(localStorage.getItem(WEEK_COUNT_KEY), 10);
    if (v === 5 || v === 7 || v === 10 || v === 99) return v;
  } catch (e) {}
  return 5;
}

function saveWeekCount(v) {
  try { localStorage.setItem(WEEK_COUNT_KEY, String(v)); } catch (e) {}
}

function renderWeek() {
  if (!weekBox) return;
  weekCount = readWeekCount();
  if (weekCountBox && weekCountBox.value !== String(weekCount)) weekCountBox.value = String(weekCount);
  weekBox.innerHTML = '';
  DAY_NAMES.forEach(function (name, i) {
    var items = planByTime(plan[i]);
    var card = el('button', 'wday' + (i === cur ? ' wday--cur' : ''));
    card.type = 'button';
    card.setAttribute('aria-label', 'Показать план на ' + name);

    var head = el('div', 'wday__head');
    head.appendChild(el('span', 'wday__name', name));
    head.appendChild(el('span', 'wday__count', items.length + ' ' + word(items.length, 'занятие', 'занятия', 'занятий')));
    card.appendChild(head);

    var shown = items.slice(0, weekCount);
    var list = el('ul', 'wday__list');
    shown.forEach(function (it) {
      var li = el('li', 'wday__item' + (it.d ? ' wday__item--done' : ''));
      li.appendChild(el('span', 'wday__time', it.t));
      li.appendChild(el('span', 'wday__dot', it.i));
      li.appendChild(el('span', 'wday__heart' + (it.d ? ' wday__heart--on' : ''), it.d ? '♥' : '♡'));
      li.appendChild(el('span', 'wday__title', it.n));
      list.appendChild(li);
    });
    card.appendChild(list);

    if (items.length > shown.length) {
      var more = el('div', 'wday__more', 'ещё ' + (items.length - shown.length) + ' ' +
        word(items.length - shown.length, 'задача', 'задачи', 'задач') + ' — нажми, чтобы открыть день');
      card.appendChild(more);
    }

    card.addEventListener('click', function () {
      cur = i;
      resetEditor();
      render();
      var panel = document.getElementById('dayTitle');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    weekBox.appendChild(card);
  });
}

if (weekCountBox) {
  weekCountBox.addEventListener('change', function () {
    var v = parseInt(weekCountBox.value, 10);
    if (v !== 5 && v !== 7 && v !== 10) v = 99;
    saveWeekCount(v);
    renderWeek();
    showToast('В недельном обзоре показываю ' + (v === 99 ? 'все задачи' : v + ' ' + word(v, 'задачу', 'задачи', 'задач')));
  });
}
