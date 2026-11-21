/* =========================================================
   安星 · 沉浸式底部上拉弹窗控制器
   依赖：XA.$ / XA.$$（app.js），ic()（screens-a.js）
   面板固定 85% 屏高，translateY 永远 >= 0 => 底边不出屏，不露白
   两个锚点：expanded(translateY=0) / collapsed(translateY=maxY)
   ========================================================= */
(function () {
  function ico(name, cls) { return '<svg class="ico ' + (cls || '') + '"><use href="#i-' + name + '"/></svg>'; }

  var STOPS = [];            // 运行时计算的锚点像素值
  var MAX_Y = 0;             // 收起态位移
  var PEEK = 0;              // 收起时露出的高度
  var sheetY = 0;            // 当前位移
  var sheet, scrollEl, layer, backdrop;
  var dragging = false, mode = null, startPointerY = 0, startSheetY = 0, lastY = 0, lastT = 0, velocity = 0;
  var rafPending = false;

  function buildContent() {
    var cards = [
      ['放松视频', '庇护所建造 · 雨林', '放松视频 · 12:40', 'music', 'cv-amber'],
      ['深夜食堂', '治愈吃播 · 热汤面', '放松视频 · 08:12', 'play', 'cv-rose'],
      ['雨夜白噪音', '街声与伞面细雨', '白噪音 · 循环', 'music', 'cv-blue'],
      ['解压时刻', 'AI Cols 爽剧精选', '短剧 · 03:26', 'play', 'cv-violet'],
      ['夜行歌单', '城市微光 · 慢走节拍', '音乐 · 06:04', 'music', 'cv-mint'],
      ['枕边有声书', '夜行便利店 · 第 1 章', '听书 · 21:18', 'play', 'cv-slate']
    ];
    var grid = cards.map(function (c) {
      return '<button class="bs-card" data-bs-play>' +
        '<span class="bs-cover ' + c[4] + '"><span class="bs-cover-ico">' + ico(c[3]) + '</span><span class="bs-play">' + ico('play') + '</span></span>' +
        '<span class="bs-card-b"><b>' + c[0] + '</b><small>' + c[1] + '</small></span></button>';
    }).join('');

    return '<div class="bs-layer" id="bsLayer">' +
      '<div class="bs-backdrop" data-bs-backdrop></div>' +
      '<div class="bs-sheet" id="bsSheet" role="dialog" aria-modal="true" aria-label="沉浸伴行面板">' +
        '<div class="bs-grab" id="bsGrab">' +
          '<div class="bs-handle"></div>' +
          '<div class="bs-head"><span class="bs-head-ico">' + ico('music') + '</span>' +
            '<span class="bs-head-txt"><b>沉浸伴行</b><small>上拉展开 · 下滑收起 · 内容独立滚动</small></span></div>' +
          '<button class="bs-close" data-bs-close aria-label="关闭">' + ico('close') + '</button>' +
          '<span class="bs-grab-hint">' + ico('chevron') + ' 上拉</span>' +
        '</div>' +
        '<div class="bs-scroll" id="bsScroll">' +
          '<div class="bs-tabs"><button class="bs-tab active">为你推荐</button><button class="bs-tab">放松视频</button><button class="bs-tab">音乐电台</button><button class="bs-tab">听书</button></div>' +
          '<div class="bs-note">' + ico('shield') + '<span>听歌看剧时，底部 SOS 始终悬浮可求救</span><b>LIVE</b></div>' +
          '<div class="bs-sec"><b>今夜精选</b><small>下滑内容 · 到顶后下拉可收起</small></div>' +
          '<div class="bs-grid">' + grid + '</div>' +
          '<div class="bs-sec"><b>继续收听</b><small>AUTO PLAY</small></div>' +
          '<div class="bs-grid">' + grid + '</div>' +
        '</div>' +
      '</div></div>';
  }

  function measure() {
    var phone = XA.$('#phone');
    var H = phone.clientHeight;
    PEEK = sheet.querySelector('.bs-grab').offsetHeight;
    var sheetH = sheet.offsetHeight || H * 0.85;
    MAX_Y = Math.max(0, sheetH - PEEK);
    STOPS = [0, MAX_Y];
  }

  function applyTransform() {
    // 关键约束：sheetY 恒 >= 0，底边永不出屏 => 无底部空白
    if (sheetY < 0) sheetY = 0;
    sheet.style.transform = 'translateY(' + sheetY + 'px)';
  }

  function setSheetY(y) { sheetY = y; applyTransform(); }

  function nearestStop() {
    return (Math.abs(sheetY - STOPS[0]) <= Math.abs(sheetY - STOPS[1])) ? STOPS[0] : STOPS[1];
  }

  function snap(forceDown) {
    sheet.classList.add('snapping');
    var target;
    if (forceDown) target = STOPS[1];
    else if (velocity > 0.55) target = STOPS[1];       // 快速下滑 => 收起
    else if (velocity < -0.55) target = STOPS[0];      // 快速上滑 => 展开
    else target = nearestStop();
    setSheetY(target);
    setTimeout(function () { sheet.classList.remove('snapping'); }, 470);
  }

  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    velocity = 0;
    startPointerY = e.clientY;
    startSheetY = sheetY;
    lastY = e.clientY;
    lastT = performance.now();
    // 抓取区：整块面板联动；内容区：先滚动，到边界再联动面板
    mode = (e.target.closest('.bs-grab')) ? 'sheet' : 'content';
    sheet.classList.remove('snapping', 'at-top');
    sheet.classList.add('grabbing');
    if (sheet.setPointerCapture) { try { sheet.setPointerCapture(e.pointerId); } catch (err) {} }
  }

  function onMove(e) {
    if (!dragging) return;
    var now = performance.now();
    var dy = e.clientY - lastY;

    if (mode === 'content') {
      var maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
      var top = scrollEl.scrollTop;
      var atBottom = top >= maxScroll - 1;
      var atTop = top <= 1;
      // 手指上滑(dy<0)看下方内容；到最底后继续上滑 -> 拖动面板向上(展开)
      // 手指下滑(dy>0)看上方内容；到最顶后继续下滑 -> 拖动面板向下(收起)
      var handoffUp = dy < 0 && atBottom;
      var handoffDown = dy > 0 && atTop;
      if (!handoffUp && !handoffDown) {
        scrollEl.scrollTop = top - dy;   // 原生内容滚动（面板不动）
      } else {
        mode = 'sheet';                   // 交棒给整块面板
        startSheetY = sheetY;
        startPointerY = e.clientY - dy;   // 保留已发生的位移
      }
    }

    if (mode === 'sheet') {
      var raw = startSheetY + (e.clientY - startPointerY);
      var damped;
      if (raw < 0) {
        // 越过上限：强阻尼，几乎锁死；底边绝不上移（无空白）
        damped = raw * 0.12;
        sheet.classList.add('at-top');
      } else if (raw > MAX_Y) {
        // 越过收起位：软阻尼，拉过头也能平滑回弹
        damped = MAX_Y + (raw - MAX_Y) * 0.28;
      } else {
        damped = raw;
        sheet.classList.remove('at-top');
      }
      setSheetY(damped);
      var dt = now - lastT;
      if (dt > 0) velocity = velocity * 0.4 + (dy / dt) * 0.6;
    }

    lastY = e.clientY;
    lastT = now;
    e.preventDefault();
  }

  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('grabbing');
    if (mode === 'sheet') snap(false);
    mode = null;
    if (sheet.releasePointerCapture) { try { sheet.releasePointerCapture(e.pointerId); } catch (err) {} }
  }

  function bindGestures() {
    sheet.addEventListener('pointerdown', onDown);
    sheet.addEventListener('pointermove', onMove, { passive: false });
    sheet.addEventListener('pointerup', onUp);
    sheet.addEventListener('pointercancel', onUp);
  }

  function open() {
    if (!layer) {
      var phone = XA.$('#phone');
      phone.insertAdjacentHTML('beforeend', buildContent());
      layer = XA.$('#bsLayer');
      sheet = XA.$('#bsSheet');
      scrollEl = XA.$('#bsScroll');
      backdrop = layer.querySelector('.bs-backdrop');
      measure();
      bindGestures();
      backdrop.addEventListener('click', collapse);
      layer.querySelector('[data-bs-close]').addEventListener('click', close);
      XA.$$('.bs-tab').forEach(function (t) {
        t.addEventListener('click', function () {
          XA.$$('.bs-tab').forEach(function (x) { x.classList.remove('active'); });
          t.classList.add('active');
          scrollEl.scrollTop = 0;
        });
      });
      XA.$$('[data-bs-play]').forEach(function (c) {
        c.addEventListener('click', function () {
          var name = c.querySelector('b').textContent;
          XA.toast('正在播放 · ' + name + '（演示）');
        });
      });
    }
    measure();
    layer.classList.add('open');
    phone.classList.add('modal-open');           // 让全局 SOS 浮现且始终在最上层
    setSheetY(MAX_Y);                            // 初始：收起态（露出 peek）
    // 进入动画
    sheet.style.transform = 'translateY(100%)';
    void sheet.offsetWidth;
    sheet.classList.add('snapping');
    setSheetY(MAX_Y);
    setTimeout(function () { sheet.classList.remove('snapping'); }, 470);
  }

  function collapse() {
    if (!layer) return;
    sheet.classList.add('snapping');
    setSheetY(MAX_Y);
    setTimeout(function () { sheet.classList.remove('snapping'); }, 470);
  }

  function close() {
    if (!layer) return;
    sheet.classList.add('snapping');
    sheet.style.transform = 'translateY(100%)';
    XA.$('#phone').classList.remove('modal-open');
    layer.classList.remove('open');
    setTimeout(function () { sheet.classList.remove('snapping'); }, 470);
  }

  window.addEventListener('resize', function () {
    if (layer && layer.classList.contains('open')) { measure(); setSheetY(Math.min(sheetY, MAX_Y)); }
  });

  XA.openBottomSheet = open;
  XA.actions['open-bottom-sheet'] = function () { open(); };
})();
