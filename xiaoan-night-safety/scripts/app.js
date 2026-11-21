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
  if (XA.current === 'sos' && screen !== 'sos' && XA.alarm) {
    XA.alarm = false;
    XA.timers.forEach(clearTimeout);
    XA.timers.forEach(clearInterval);
    XA.timers = [];
  }
  if (!noHistory && screen !== XA.current) XA.previous = XA.current;
  XA.current = screen;
  XA.$$('.screen').forEach(function (el) { el.classList.toggle('active', el.dataset.screen === screen); });
  XA.$$('.tab').forEach(function (el) { el.classList.toggle('active', el.dataset.tab === screen); });
  XA.$('#phone').classList.remove('no-tabbar');
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
  var phone = XA.$('#phone');
  if (phone) phone.classList.add('modal-open');
  XA.bindSheetGestures();
};

XA.bindSheetGestures = function () {
  var sheet = XA.$('#modalLayer .sheet');
  if (!sheet) return;
  var startY = 0, dy = 0, dragging = false;
  sheet.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('.drag-handle, h3, .sheet-sub')) return; // 把手与标题区均可拖拽，内容区交给原生滚动
    e.preventDefault();                                            // 鼠标也能拉，且不选中文字
    startY = e.clientY; dy = 0; dragging = true;
    sheet.classList.remove('snapback', 'at-upper');
    sheet.classList.add('dragging');
    if (sheet.setPointerCapture) { try { sheet.setPointerCapture(e.pointerId); } catch (err) {} }
  });
  sheet.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var raw = e.clientY - startY;
    // 上拉到上限后用强阻尼锁住，松手必定回弹；下拉也可关闭
    if (raw < 0) {
      dy = Math.max(-40, raw * 0.32);
      sheet.classList.toggle('at-upper', dy <= -36);
    } else {
      dy = Math.min(raw, sheet.offsetHeight * 0.55);
      sheet.classList.remove('at-upper');
    }
    sheet.style.transform = 'translateY(' + dy + 'px)';
  });
  function end() {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('dragging', 'at-upper');
    sheet.classList.add('snapback');
    sheet.style.transform = '';
    if (dy > 110) XA.closeModal();
    else if (dy < -22) XA.toast('已到顶部 · 回弹');   // 拉到上限的明确反馈
    dy = 0;
  }
  sheet.addEventListener('pointerup', end);
  sheet.addEventListener('pointercancel', end);
};

/* 全局兜底退出键：任何弹窗 / 引导 / 提示气泡都能用 Esc 退出 */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (XA.$('.sos-confirm.open') && XA._sosCancel) { XA._sosCancel(); return; }
  if (XA.$('#modalLayer.open')) { XA.closeModal(); return; }
  if (XA.$('#guideLayer') && XA.actions['skip-guide']) { XA.actions['skip-guide'](); return; }
  var rp = XA.$('#riskPopover.open'); if (rp && XA.actions['close-risk']) XA.actions['close-risk']();
});

XA.closeModal = function () {
  var layer = XA.$('#modalLayer');
  var video = layer && layer.querySelector('video');
  if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  var frame = layer && layer.querySelector('iframe');
  if (frame) frame.src = 'about:blank';
  if (XA.stopBookPlayback) XA.stopBookPlayback();
  layer.classList.remove('open');
  var phone = XA.$('#phone');
  if (phone) phone.classList.remove('modal-open');
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
  // 幂等：先清理任何遗留的确认层，保证每次都能再次打开
  var stale = XA.$('#phone .sos-confirm');
  if (stale) stale.remove();
  if (XA._sosTimer) clearTimeout(XA._sosTimer);
  if (XA._sosTick) clearInterval(XA._sosTick);

  var cd = Math.min(8, Math.max(5, Number(XA.settings && XA.settings.sosCd) || 6));
  var left = cd;
  var box = document.createElement('div');
  box.className = 'sos-confirm';
  box.innerHTML =
    '<button class="sos-cancel-x" data-sos-cancel aria-label="取消求助">×</button>' +
    '<p class="sos-confirm-label">紧急求助确认</p>' +
    '<h3>倒计时结束后自动求助</h3>' +
    '<p class="sos-cancel-tip">误触？在倒计时结束前随时取消，不会发出求助。</p>' +
    '<div class="cd-ring"><div class="cd-fill" id="cdFill"></div><div class="cd-num"><b id="cdNum">' + cd + '</b><small>秒后自动报警</small></div></div>' +
    '<button class="sos-fire-now" id="sosFireNow">立即发出求助</button>' +
    '<button class="cancel-hold" data-sos-cancel>取消 · 我不需要求助</button>' +
    '<p class="sos-cancel-tip">也可点击空白处、下滑或按 Esc 取消</p>';
  XA.$('#phone').appendChild(box);
  void box.offsetWidth;
  box.classList.add('open');

  var settled = false;
  function cleanup() {
    settled = true;
    if (XA._sosTimer) clearTimeout(XA._sosTimer);
    if (XA._sosTick) clearInterval(XA._sosTick);
    box.classList.remove('open');
    setTimeout(function () { if (box.parentNode) box.remove(); }, 260);
  }
  XA._sosFire = function () { if (settled) return; cleanup(); XA.fireAlarm(); };
  XA._sosCancel = function () {
    if (settled) return;
    cleanup();
    if (navigator.vibrate) navigator.vibrate(20);
    XA.toast('已取消 · 未发出求助');
  };
  XA._sosTimer = null;

  var num = box.querySelector('#cdNum'), fill = box.querySelector('#cdFill');
  function paint() {
    if (num) num.textContent = left;
    if (fill) fill.style.background = 'conic-gradient(var(--coral) ' + (left / cd * 100) + '%, rgba(255,255,255,.09) 0)';
  }
  paint();
  XA._sosTick = setInterval(function () {
    if (settled) return;
    left--; paint();
    if (left <= 0) XA._sosFire();          // 倒计时结束自动触发
  }, 1000);

  XA.$$('[data-sos-cancel]', box).forEach(function (el) {
    el.addEventListener('click', function (e) { e.stopPropagation(); XA._sosCancel(); });
  });
  box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('cd-ring')) XA._sosCancel(); });
  box.querySelector('#sosFireNow').addEventListener('click', function (e) { e.stopPropagation(); XA._sosFire(); });

  var sy = 0, moving = false;
  box.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; sy = e.clientY; moving = true; box.classList.add('swiping'); });
  box.addEventListener('pointermove', function (e) {
    if (!moving) return;
    var d = e.clientY - sy;
    if (d > 0) box.style.transform = 'translateY(' + d + 'px)';
  });
  box.addEventListener('pointerup', function (e) {
    if (!moving) return;
    var d = e.clientY - sy; moving = false;
    box.classList.remove('swiping'); box.style.transform = '';
    if (d > 70) XA._sosCancel();
  });
  box.addEventListener('pointercancel', function () { moving = false; box.classList.remove('swiping'); box.style.transform = ''; });
};

XA.fireAlarm = function () {
  XA.alarm = true;
  var nav = XA.$('.nav-session');
  if (nav) nav.remove();
  clearInterval(XA.navTimer);
  XA.go('sos', true);
  var stamp = new Date().toLocaleTimeString('zh-CN');
  var at = XA.$('#alarmSentAt'); if (at) at.textContent = stamp;
  var desc = XA.$('#sosDesc'); if (desc) desc.textContent = '已自动报警 · 已把实时位置发送给 3 位亲友 · 已联动 AR 眼镜';
  XA.toast('求助已发出 · 正在同步实时位置');

  var sec = 3;
  var t = XA.$('#alarmTimer');
  if (t) t.textContent = '00:0' + sec;
  XA.timers.push(setInterval(function () {
    sec++;
    if (t) t.textContent = '00:' + (sec < 10 ? '0' : '') + sec;
  }, 1000));

  /* 实时位置：自动报警 + 亲友位置同步；定位不可用时明确提示，不假装成功 */
  var detail = XA.$('#sosLocationDetail');
  var showPos = function (p) {
    if (!detail) return;
    detail.textContent = p && p.real
      ? '实时定位 ' + p.lat.toFixed(5) + ', ' + p.lng.toFixed(5) + ' · 精度 ±' + Math.round(p.acc || 8) + 'm · 更新于 ' + new Date().toLocaleTimeString('zh-CN')
      : '设备定位未开启 · 使用概念演示位置，可在「当前位置」中重新获取';
    XA.toast(p && p.real ? '实时位置已同步给 3 位亲友' : '定位未开启 · 已提示手动说明位置');
  };
  if (XA.requestLocation) XA.requestLocation(showPos);
  else if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function (p) {
    showPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, real: true });
  }, function () { showPos(null); }, { enableHighAccuracy: true, timeout: 8000 });
  else showPos(null);

  [400, 1200, 2000, 2800].forEach(function (delay, i) {
    XA.timers.push(setTimeout(function () {
      var row = XA.$('.status-row[data-status="' + i + '"]');
      if (row) { row.classList.remove('pending'); row.classList.add('done'); }
      if (i === 3) XA.toast('AR 眼镜已联动 · 摔倒与掉落检测已同步');
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
