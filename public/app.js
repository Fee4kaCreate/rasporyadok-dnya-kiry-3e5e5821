// Отрисовка расписания: дни недели, лента занятий, отметка «сделано».
var plan = readPlan();
var cur = todayIndex();
var editing = -1;

var daysBox = document.getElementById('days');
var timeline = document.getElementById('timeline');
var dayTitle = document.getElementById('dayTitle');
var dayMeta = document.getElementById('dayMeta');
var dayBadge = document.getElementById('dayBadge');
var nowBox = document.getElementById('nowBox');
var emptyBox = document.getElementById('empty');
var editor = document.getElementById('editor');
var editorTitle = document.getElementById('editorTitle');
var editorNote = document.getElementById('editorNote');
var form = document.getElementById('itemForm');
var fTitle = document.getElementById('fTitle');
var fTime = document.getElementById('fTime');
var fIcon = document.getElementById('fIcon');
var saveBtn = document.getElementById('saveBtn');
var deleteBtn = document.getElementById('deleteBtn');
var cancelBtn = document.getElementById('cancelBtn');
var toast = document.getElementById('toast');
var progressBox = document.getElementById('progress');
var progressFill = document.getElementById('progressFill');
var progressText = document.getElementById('progressText');
var toastTimer = null;

function el(tag, cls, txt) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt !== undefined && txt !== null) n.textContent = txt;
  return n;
}

function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.hidden = true; }, 2400);
}

function fillIcons() {
  fIcon.innerHTML = '';
  ICONS.forEach(function (ic) {
    var o = document.createElement('option');
    o.value = ic;
    o.textContent = ic;
    fIcon.appendChild(o);
  });
}

function renderDays() {
  daysBox.innerHTML = '';
  var selected = null;
  DAY_SHORT.forEach(function (name, i) {
    var b = el('button', 'day', name);
    b.type = 'button';
    b.setAttribute('aria-selected', i === cur ? 'true' : 'false');
    b.addEventListener('click', function () {
      cur = i;
      resetEditor();
      render();
    });
    daysBox.appendChild(b);
    if (i === cur) selected = b;
  });
  // на телефоне показываем выбранный день, чтобы не искать его прокруткой
  if (selected && daysBox.scrollWidth > daysBox.clientWidth) {
    selected.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
}

function renderNow(items, nextIdx) {
  if (cur !== todayIndex() || !items.length) { nowBox.hidden = true; return; }
  var now = nowHM();
  nowBox.hidden = false;
  nowBox.textContent = nextIdx >= 0
    ? 'Сейчас ' + now + ' · Дальше: ' + items[nextIdx].n + ' в ' + items[nextIdx].t
    : 'Сейчас ' + now + ' · На сегодня всё закончилось 🌙';
}

function renderTimeline() {
  timeline.innerHTML = '';
  var items = planByTime(plan[cur]);
  var done = items.filter(function (it) { return it.d; }).length;
  dayTitle.textContent = DAY_NAMES[cur];
  dayBadge.textContent = items.length + ' ' + word(items.length, 'занятие', 'занятия', 'занятий');
  dayMeta.textContent = done
    ? 'Готово ' + done + ' из ' + items.length + ' — остальное впереди'
    : 'Нажми на занятие, чтобы изменить время или название';
  emptyBox.hidden = items.length > 0;

  var now = nowHM();
  var isToday = cur === todayIndex();
  var nextIdx = -1;
  if (isToday) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].t > now) { nextIdx = i; break; }
    }
  }

  items.forEach(function (it, idx) {
    var li = el('li', 'tl__row');
    var time = el('div', 'tl__time');
    time.appendChild(el('span', 'tl__hour', it.t));
    var card = el('button', 'card' + (it.d ? ' card--done' : ''));
    card.type = 'button';
    card.setAttribute('aria-label', 'Изменить: ' + it.n + ', ' + it.t);
    card.appendChild(el('span', 'card__icon', it.i));
    var body = el('span', 'card__body');
    body.appendChild(el('span', 'card__title', it.n));
    if (idx === nextIdx) body.appendChild(el('span', 'card__tag', 'дальше'));
    card.appendChild(body);
    card.appendChild(el('span', 'card__pencil', '✎'));
    card.addEventListener('click', function () { openEditor(idx); });
    li.appendChild(time);
    li.appendChild(card);
    var heart = el('button', 'heart' + (it.d ? ' heart--on' : ''), it.d ? '♥' : '♡');
    heart.type = 'button';
    heart.title = it.d ? 'Задание сделано — нажми, чтобы снять отметку' : 'Отметить задание как сделанное';
    heart.setAttribute('aria-label', heart.title);
    heart.setAttribute('aria-pressed', it.d ? 'true' : 'false');
    heart.addEventListener('click', function () { toggleDone(it); });
    li.appendChild(heart);
    timeline.appendChild(li);
  });

  renderNow(items, nextIdx);
  renderProgress(items, done);
}

function renderProgress(items, done) {
  if (!items.length) { progressBox.hidden = true; return; }
  progressBox.hidden = false;
  var pct = Math.round(done / items.length * 100);
  progressFill.style.width = pct + '%';
  progressBox.classList.toggle('progress--full', done === items.length);
  progressText.textContent = 'Сделано ' + done + ' из ' + items.length +
    (done === items.length ? ' — весь день выполнен! 🎉' : '');
}

function render() {
  renderDays();
  renderTimeline();
  if (typeof renderWeek === 'function') renderWeek();
}

function toggleDone(item) {
  for (var i = 0; i < plan[cur].length; i++) {
    if (plan[cur][i] === item) {
      plan[cur][i].d = !plan[cur][i].d;
      break;
    }
  }
  var ok = writePlan(plan);
  renderTimeline();
  showToast(ok ? (item.d ? 'Закрашенное сердечко ♥ — задание сделано!' : 'Сердечко снова пустое ♡') : 'Не удалось сохранить в этом браузере');
}
