// Перенос плана: скачать файл и загрузить его обратно (например, на телефон мамы).
var backupFile = document.getElementById('backupFile');
var exportBtn = document.getElementById('exportBtn');
var importBtn = document.getElementById('importBtn');
var todayBtn = document.getElementById('todayBtn');

function planFileName() {
  var d = new Date();
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var day = ('0' + d.getDate()).slice(-2);
  return 'plan-kiry-' + d.getFullYear() + '-' + m + '-' + day + '.json';
}

exportBtn.addEventListener('click', function () {
  var text = JSON.stringify({ plan: plan, savedAt: new Date().toISOString() }, null, 2);
  var blob = new Blob([text], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = planFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  showToast('Файл с планом сохранён ✨');
});

importBtn.addEventListener('click', function () {
  if (!window.confirm('Загруженный план заменит текущий. Продолжить?')) return;
  backupFile.click();
});

backupFile.addEventListener('change', function () {
  var file = backupFile.files && backupFile.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var parsed = JSON.parse(String(reader.result));
      var incoming = parsed && parsed.plan ? parsed.plan : parsed;
      if (!Array.isArray(incoming) || incoming.length !== 7) throw new Error('bad plan');
      plan = incoming.map(function (day) {
        if (!Array.isArray(day)) return [];
        return day
          .filter(function (it) { return it && typeof it.t === 'string' && typeof it.n === 'string'; })
          .map(function (it) { return { t: it.t, n: it.n, i: it.i || '⭐', d: !!it.d }; });
      });
      writePlan(plan);
      resetEditor();
      render();
      showToast('План загружен ✨');
    } catch (e) {
      showToast('Не получилось прочитать файл');
    }
    backupFile.value = '';
  };
  reader.readAsText(file);
});

todayBtn.addEventListener('click', function () {
  cur = todayIndex();
  resetEditor();
  render();
  showToast('Показываю сегодняшний день');
});
