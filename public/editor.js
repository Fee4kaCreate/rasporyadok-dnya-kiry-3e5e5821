// Форма занятия: добавить, изменить, удалить, сбросить день или всю неделю.
function resetEditor() {
  editing = -1;
  fTitle.value = '';
  fTime.value = '10:00';
  fIcon.value = ICONS[0];
  editor.classList.remove('editor--editing');
  editorTitle.textContent = 'Добавить занятие';
  saveBtn.textContent = 'Добавить';
  deleteBtn.hidden = true;
  cancelBtn.hidden = true;
  editorNote.textContent = 'Занятие сразу появится в расписании дня и останется после перезагрузки страницы.';
}

function openEditor(idx) {
  var it = null;
  var shown = planByTime(plan[cur]);
  if (idx >= 0 && shown[idx]) {
    it = shown[idx];
    editing = plan[cur].indexOf(it);
  } else {
    editing = -1;
  }
  fTitle.value = it ? it.n : '';
  fTime.value = it ? it.t : '10:00';
  fIcon.value = it && ICONS.indexOf(it.i) >= 0 ? it.i : ICONS[0];
  editor.classList.toggle('editor--editing', !!it);
  editorTitle.textContent = it ? 'Изменить занятие' : 'Добавить занятие';
  saveBtn.textContent = it ? 'Сохранить' : 'Добавить';
  deleteBtn.hidden = !it;
  cancelBtn.hidden = !it;
  editorNote.textContent = it
    ? 'Изменения сразу появятся в расписании дня.'
    : 'Занятие сразу появится в расписании дня и останется после перезагрузки страницы.';
  editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (it) fTitle.focus({ preventScroll: true });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var title = fTitle.value.trim();
  var time = fTime.value;
  if (!title) { showToast('Напиши, что делаем ✨'); fTitle.focus(); return; }
  if (!time) { showToast('Выбери время ⏰'); fTime.focus(); return; }
  var item = { t: time, n: title, i: fIcon.value, d: false };
  if (editing >= 0 && plan[cur][editing]) {
    item.d = plan[cur][editing].d;
    plan[cur][editing] = item;
  } else {
    plan[cur].push(item);
  }
  plan[cur] = planByTime(plan[cur]);
  var ok = writePlan(plan);
  resetEditor();
  render();
  showToast(ok ? 'Сохранено ✨' : 'Не удалось сохранить в этом браузере');
});

deleteBtn.addEventListener('click', function () {
  if (editing >= 0 && plan[cur][editing]) {
    plan[cur].splice(editing, 1);
    var ok = writePlan(plan);
    resetEditor();
    render();
    showToast(ok ? 'Занятие удалено' : 'Не удалось сохранить в этом браузере');
  }
});

cancelBtn.addEventListener('click', function () {
  resetEditor();
  showToast('Ничего не меняли');
});

function twoStep(btn, fn) {
  var label = btn.getAttribute('data-label');
  if (btn.getAttribute('data-arm') === '1') {
    btn.removeAttribute('data-arm');
    btn.textContent = label;
    fn();
    return;
  }
  btn.setAttribute('data-arm', '1');
  btn.textContent = 'Нажми ещё раз для подтверждения';
  setTimeout(function () {
    if (btn.getAttribute('data-arm') === '1') {
      btn.removeAttribute('data-arm');
      btn.textContent = label;
    }
  }, 4000);
}

var resetDayBtn = document.getElementById('resetDayBtn');
resetDayBtn.setAttribute('data-label', 'Сбросить этот день');
resetDayBtn.addEventListener('click', function () {
  twoStep(resetDayBtn, function () {
    plan[cur] = clonePlan(DEFAULT_PLAN[cur]);
    writePlan(plan);
    render();
    showToast('День вернулся к исходному плану');
  });
});

var resetAllBtn = document.getElementById('resetAllBtn');
resetAllBtn.setAttribute('data-label', 'Вернуть всё как было');
resetAllBtn.addEventListener('click', function () {
  twoStep(resetAllBtn, function () {
    plan = clonePlan(DEFAULT_PLAN);
    writePlan(plan);
    render();
    showToast('Вся неделя вернулась к исходному плану');
  });
});

document.getElementById('printBtn').addEventListener('click', function () { window.print(); });

fillIcons();
resetEditor();
render();
