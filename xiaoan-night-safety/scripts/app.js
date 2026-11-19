window.XA = {
  current: 'home',
  previous: 'home',
  destination: '滨江花园',
  route: 'A',
  alarm: false,
  actions: {},
  timers: [],
  clockTimer: null,
  playerTimer: null
};

XA.$ = function (sel, root) { return (root || document).querySelector(sel); };
XA.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

XA.render = function () {
  var html = Object.keys(XA_SCREENS).map(function (k) { return XA_SCREENS[k]; }).join('');
  XA.$('#screens').innerHTML = html;
  XA.buildMapLights();
};

XA.buildMapLights = function () {
  var box = XA.$('.map-lights');
  if (!box) return;
  var html = '';
  for (var i = 0; i < 34; i++) {
    var x = 10 + (i * 71) % 375;
    var y = 24 + (i * 97) % 390;
    html += '<i style="left:' + x + 'px;top:' + y + 'px;opacity:' + (.45 + (i % 4) * .14) + '"></i>';
  }
  box.innerHTML = html;
};

XA.go = function (screen, noHistory) {
  if (!XA_SCREENS[screen]) return;
  if (!noHistory && screen !== XA.current) XA.previous = XA.current;
  XA.current = screen;
  XA.$$('.screen').forEach(function (el) { el.classList.toggle('active', el.dataset.screen === screen); });
  XA.$$('.tab').forEach(function (el) { el.classList.toggle('active', el.dataset.tab === screen); });
  XA.$('#phone').classList.toggle('no-tabbar', ['route', 'sos', 'ar', 'settings'].indexOf(screen) !== -1);
  var active = XA.$('.screen.active');
  if (active && active.scrollTop !== undefined) active.scrollTop = 0;
};

XA.toast = function (msg) {
  var t = XA.$('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(XA._toastTimer);
  XA._toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2300);
};

XA.openSheet = function (html) {
  var layer = XA.$('#modalLayer');
  layer.innerHTML = '<div class="modal-backdrop" data-close="1"></div><div class="sheet">' +
    '<div class="drag-handle"></div><button class="sheet-close" data-close="1">' + ic('close') + '</button>' + html + '</div>';
  layer.classList.add('open');
  XA.bindSheetGestures();
};

XA.bindSheetGestures = function () {
  var sheet = XA.$('#modalLayer .sheet');
  if (!sheet) return;
  var startY = 0, dy = 0, dragging = false;
  sheet.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    if (sheet.scrollTop > 4 && e.clientY > sheet.getBoundingClientRect().top + 70) return;
    startY = e.clientY; dy = 0; dragging = true;
    sheet.classList.add('dragging');
  });
  sheet.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dy = Math.max(-70, e.clientY - startY);
    sheet.style.transform = 'translateY(' + dy + 'px)';
  });
  function end() {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('dragging');
    sheet.style.transform = '';
    if (dy > 90) XA.closeModal();
    else if (dy < -30) sheet.classList.add('raised');
    else if (dy > 20) sheet.classList.remove('raised');
    dy = 0;
  }
  sheet.addEventListener('pointerup', end);
  sheet.addEventListener('pointercancel', end);
};

XA.closeModal = function () {
  var layer = XA.$('#modalLayer');
  var video = layer && layer.querySelector('video');
  if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  var frame = layer && layer.querySelector('iframe');
  if (frame) frame.src = 'about:blank';
  layer.classList.remove('open');
  setTimeout(function () { if (!layer.classList.contains('open')) layer.innerHTML = ''; }, 320);
};

XA.setDestination = function (name) {
  XA.destination = name;
  XA.$$('[data-destination]').forEach(function (el) { el.textContent = name; });
};

XA.hold = function (el, ms, done) {
  var fill = el.querySelector('.hold-fill');
  var start = 0, raf = 0, active = false;
  function step(now) {
    if (!active) return;
    if (!start) start = now;
    var p = Math.min(1, (now - start) / ms);
    if (fill) fill.style.width = (p * 100) + '%';
    if (p >= 1) {
      active = false;
      el.dataset.held = '1';
      setTimeout(function () { delete el.dataset.held; }, 500);
      done();
      return;
    }
    raf = requestAnimationFrame(step);
  }
  function down() {
    if (active) return;
    active = true; start = 0;
    raf = requestAnimationFrame(step);
  }
  function up() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(raf);
    if (fill) fill.style.width = '0%';
  }
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  el.addEventListener('pointercancel', up);
};

XA.showSosConfirm = function () {
  if (XA.alarm) return;
  var box = document.createElement('div');
  box.className = 'sos-confirm';
  box.innerHTML = '<p>已准备报警 · 3 秒后发出</p><h3>长按取消</h3><div class="confirm-ring"><button class="confirm-btn">SOS<span class="hold-fill"></span></button></div>' +
    '<button class="cancel-hold">长按 2 秒取消报警<span class="hold-fill"></span></button>';
  XA.$('#phone').appendChild(box);
  requestAnimationFrame(function () { box.classList.add('open'); });
  var count = 3;
  var label = box.querySelector('p');
  var tick = setInterval(function () {
    count--;
    label.textContent = count > 0 ? '已准备报警 · ' + count + ' 秒后发出' : '正在发出报警…';
  }, 1000);
  var fire = function () {
    clearInterval(tick);
    box.classList.remove('open');
    setTimeout(function () { box.remove(); }, 250);
    XA.fireAlarm();
  };
  XA._sosTimer = setTimeout(fire, 3000);
  XA.hold(box.querySelector('.cancel-hold'), 2000, function () {
    clearInterval(tick); clearTimeout(XA._sosTimer);
    box.classList.remove('open');
    setTimeout(function () { box.remove(); }, 250);
    XA.toast('报警已取消 · 未发出求助');
  });
  box.querySelector('.confirm-btn').addEventListener('click', function () {
    clearInterval(tick); clearTimeout(XA._sosTimer);
    box.classList.remove('open');
    setTimeout(function () { box.remove(); }, 250);
    XA.fireAlarm();
  });
};

XA.fireAlarm = function () {
  XA.alarm = true;
  var nav = XA.$('.nav-session');
  if (nav) nav.remove();
  clearInterval(XA.navTimer);
  XA.go('sos', true);
  var sec = 3;
  var t = XA.$('#alarmTimer');
  if (t) t.textContent = '00:0' + sec;
  var tick = setInterval(function () {
    sec++;
    if (t) t.textContent = '00:' + (sec < 10 ? '0' : '') + sec;
  }, 1000);
  XA.timers.push(tick);
  [400, 1200, 2000, 2800].forEach(function (delay, i) {
    XA.timers.push(setTimeout(function () {
      var row = XA.$('.status-row[data-status="' + i + '"]');
      if (row) row.classList.add('done');
    }, delay));
  });
};

XA.cancelAlarm = function () {
  XA.alarm = false;
  XA.timers.forEach(clearTimeout);
  XA.timers.forEach(clearInterval);
  XA.timers = [];
  XA.go(XA.previous === 'sos' ? 'home' : XA.previous, true);
  XA.toast('报警已取消 · 记录已保留');
};

XA.selectRoute = function (letter) {
  XA.route = letter;
  XA.$$('.route-card').forEach(function (el) { el.classList.toggle('selected', el.dataset.route === letter); });
  XA.$$('.rm-marker').forEach(function (el) { el.classList.toggle('active', el.dataset.route === letter); });
  XA.$$('.rm-line').forEach(function (el) { el.classList.toggle('active', el.dataset.line === letter); });
  var eta = { A: '预计 18 分钟', B: '预计 22 分钟', C: '预计 15 分钟' };
  var el = XA.$('#routeEta');
  if (el) el.textContent = eta[letter];
  XA.toast('已切换到路线 ' + letter + ' · 安全优先排序已更新');
};

XA.initClock = function () {
  function tick() {
    var d = new Date();
    XA.$('#clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  tick();
  XA.clockTimer = setInterval(tick, 20000);
};

XA.bindGlobalEvents = function () {
  document.addEventListener('click', function (e) {
    var held = e.target.closest('[data-held]');
    if (held) {
      e.stopImmediatePropagation();
      e.preventDefault();
      delete held.dataset.held;
      return;
    }
    var close = e.target.closest('[data-close]');
    if (close) { XA.closeModal(); return; }
    var tab = e.target.closest('[data-tab]');
    if (tab) { XA.go(tab.dataset.tab); return; }
    var back = e.target.closest('[data-back]');
    if (back) { XA.go(back.dataset.back, true); return; }
    var action = e.target.closest('[data-action]');
    if (action) {
      e.stopPropagation();
      var fn = XA.actions[action.dataset.action];
      if (fn) fn(action, e);
      return;
    }
    var shortcut = e.target.closest('[data-shortcut]');
    if (shortcut) { XA.setDestination(shortcut.dataset.shortcut); XA.go('route'); return; }
    var route = e.target.closest('[data-route]');
    if (route) { XA.selectRoute(route.dataset.route); return; }
  });
};

XA.init = function () {
  XA.render();
  XA.initClock();
  XA.bindGlobalEvents();
  if (XA.bindPageEvents) XA.bindPageEvents();
  var requested = new URLSearchParams(location.search).get('screen');
  XA.go(XA_SCREENS[requested] ? requested : 'home', true);
  setTimeout(function () { XA.playSplash(); }, 0);
};

XA.playSplash = function () {
  var splash = XA.$('#splash');
  var status = XA.$('#splashStatus');
  if (!splash) return;
  var stages = [
    [650, '正在校准夜路数据…'],
    [1350, 'AI 安星正在守护…'],
    [2050, '准备就绪 · 出发吧']
  ];
  stages.forEach(function (s) {
    setTimeout(function () { if (status) status.textContent = s[1]; }, s[0]);
  });
  setTimeout(function () { splash.classList.add('done'); }, 2450);
  setTimeout(function () { if (splash.parentNode) splash.remove(); }, 3200);
};
