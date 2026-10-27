// Хранилище распорядка: план недели и его сохранение в браузере.
// Данные лежат в этом же браузере, поэтому после перезагрузки страницы всё остаётся на месте.
var STORE_KEY = 'kira-plan-v1';

function clonePlan(o) { return JSON.parse(JSON.stringify(o)); }

function readPlan() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) return clonePlan(DEFAULT_PLAN);
    var data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length !== 7) return clonePlan(DEFAULT_PLAN);
    return data.map(function (day) {
      if (!Array.isArray(day)) return [];
      return day
        .filter(function (it) { return it && typeof it.t === 'string' && typeof it.n === 'string'; })
        .map(function (it) { return { t: it.t, n: it.n, i: it.i || '⭐', d: !!it.d }; });
    });
  } catch (e) {
    return clonePlan(DEFAULT_PLAN);
  }
}

function writePlan(plan) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(plan));
    return true;
  } catch (e) {
    return false;
  }
}

function planByTime(day) {
  return day.slice().sort(function (a, b) {
    return a.t < b.t ? -1 : (a.t > b.t ? 1 : 0);
  });
}

function todayIndex() {
  var d = new Date().getDay();      // 0 — воскресенье
  return d === 0 ? 6 : d - 1;
}

function nowHM() {
  var d = new Date();
  var h = ('0' + d.getHours()).slice(-2);
  var m = ('0' + d.getMinutes()).slice(-2);
  return h + ':' + m;
}

function word(n, one, few, many) {
  var n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
  return many;
}
