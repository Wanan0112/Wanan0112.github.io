/* =========================================================
   安星 · 完整地图（高德地图免 Key iframe 嵌入）
   - 地区标识 / 地点详情 / 关键词搜索 / 路线导航均由高德地图提供
   - 无需 Mapbox / 高德 JS API Key，无需自建瓦片与 POI 数据
   ========================================================= */
(function () {
  var DEFAULT = { lat: 30.2700, lng: 120.1500 };
  var EMBED = 'https://www.amap.com/ssr/embed/';
  var layer = null, gps = { lat: DEFAULT.lat, lng: DEFAULT.lng, real: false }, watchId = null;
  var suggestTimer = null, lastQuery = '';

  function outOfChina(lat, lng) { return lng < 73.66 || lng > 135.05 || lat < 3.86 || lat > 53.55; }
  function transformLat(x, y) {
    var r = -100 + 2 * x + 3 * y + .2 * y * y + .1 * x * y + .2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return r;
  }
  function transformLng(x, y) {
    var r = 300 + x + 2 * y + .1 * x * x + .1 * x * y + .1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return r;
  }
  function wgs84ToGcj02(lat, lng) {
    if (outOfChina(lat, lng)) return [lat, lng];
    var a = 6378245, ee = .006693421622965943;
    var dLat = transformLat(lng - 105, lat - 35), dLng = transformLng(lng - 105, lat - 35);
    var radLat = lat / 180 * Math.PI, magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic; var sq = Math.sqrt(magic);
    dLat = (dLat * 180) / ((a * (1 - ee)) / (magic * sq) * Math.PI);
    dLng = (dLng * 180) / (a / sq * Math.cos(radLat) * Math.PI);
    return [lat + dLat, lng + dLng];
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ico(n) { return window.ic ? window.ic(n) : '<svg class="ico"><use href="#i-' + n + '"/></svg>'; }

  var KEYWORDS = ['酒店', '宾馆', '便利店', '超市', '公厕', '厕所', '餐厅', '美食', '咖啡', '药店', '医院', '地铁', '公交', '停车', '银行', 'ATM'];

  function center() { return wgs84ToGcj02(gps.lat, gps.lng); }
  function viewUrl() {
    var c = center();
    return EMBED + 'view?lng=' + c[1] + '&lat=' + c[0] + '&zoom=15&platform=pc';
  }
  function searchUrl(q) {
    var c = center();
    return EMBED + 'search?keyword=' + encodeURIComponent(q) + '&city=' + encodeURIComponent('全国') +
      '&lng=' + c[1] + '&lat=' + c[0] + '&zoom=15&platform=pc';
  }
  function setEmbed(url) {
    var f = XA.$('#pmEmbed'); if (!f) return;
    if (f.getAttribute('src') !== url) f.setAttribute('src', url);
  }
  function setStatus(t) { var el = XA.$('#pmStatusText'); if (el) el.textContent = t; }
  function setHead(title, sub) {
    var h = XA.$('#pmHead'), r = XA.$('#pmRadius');
    if (h) h.textContent = title;
    if (r) r.textContent = sub;
  }

  function searchPOI(q) {
    q = String(q || '').trim(); if (!q) return;
    lastQuery = q;
    setEmbed(searchUrl(q));
    setHead('“' + q + '” · 高德地图', '真实地点 · 点击查看详情与导航');
    var box = XA.$('#pmResults');
    if (box) box.innerHTML = '<div class="pm-empty">已在高德地图中搜索「' + esc(q) + '」。<br>点击地图上的地点标记查看地址、电话并规划路线。</div>';
  }
  function resetEmbed() {
    lastQuery = '';
    setEmbed(viewUrl());
    setHead('完整地图', '高德地图 · 可拖动 / 缩放 / 搜索');
    var box = XA.$('#pmResults');
    if (box) box.innerHTML = '<div class="pm-empty">拖动地图查看地区，点击地点查看详情；上方输入关键词可搜索并导航。</div>';
  }

  function html() {
    return '<div class="pm-layer" id="pmLayer">' +
      '<iframe class="pm-embed" id="pmEmbed" title="高德地图" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
      '<div class="pm-top">' +
        '<div class="pm-toprow">' +
          '<button class="pm-exit" id="pmExit" aria-label="退出地图">' + ico('back') + '<span>退出</span></button>' +
          '<div class="pm-search">' +
            ico('search') +
            '<input id="pmInput" placeholder="搜索地点 / 地址，如 汉庭酒店" autocomplete="off">' +
            '<button id="pmClear" aria-label="清空">' + ico('close') + '</button>' +
            '<div class="pm-suggest" id="pmSuggest"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pm-chips" id="pmChips">' +
          ['酒店', '便利店', '公厕', '餐厅', '药店', '地铁'].map(function (k) { return '<button data-pm-kw="' + k + '">' + k + '</button>'; }).join('') +
        '</div>' +
      '</div>' +
      '<div class="pm-status" id="pmStatus"><span class="pm-live"></span><span id="pmStatusText">正在获取 GPS 定位…</span></div>' +
      '<div class="pm-sheet" id="pmSheet">' +
        '<div class="pm-handle"></div>' +
        '<div class="pm-sheet-head"><b id="pmHead">完整地图</b><small id="pmRadius">高德地图 · 可拖动 / 缩放 / 搜索</small></div>' +
        '<div class="pm-results" id="pmResults"><div class="pm-empty">拖动地图查看地区，点击地点查看详情；上方输入关键词可搜索并导航。</div></div>' +
      '</div>' +
      '</div>';
  }

  function suggest(q) {
    var box = XA.$('#pmSuggest'); if (!box) return;
    q = String(q || '').trim();
    if (!q) { box.innerHTML = ''; box.classList.remove('show'); return; }
    var words = KEYWORDS.filter(function (w) { return w.indexOf(q) >= 0 || q.indexOf(w) >= 0; }).slice(0, 6);
    box.innerHTML = words.map(function (w) { return '<button data-pm-s="' + esc(w) + '">' + ico('search') + esc(w) + '</button>'; }).join('');
    box.classList.toggle('show', words.length > 0);
  }

  function startGPS() {
    if (!navigator.geolocation) { setStatus('设备不支持 GPS，使用演示位置'); return; }
    watchId = navigator.geolocation.watchPosition(function (p) {
      gps = { lat: p.coords.latitude, lng: p.coords.longitude, real: true };
      setStatus('GPS 实时定位 · 精度 ±' + Math.round(p.coords.accuracy || 8) + 'm');
      if (lastQuery) return; // 搜索中重载地图会打断浏览，位置只更新状态
      var f = XA.$('#pmEmbed');
      if (f && f.getAttribute('src') === viewUrl()) return;
    }, function () { setStatus('定位未开启，使用演示位置'); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
  }

  function bind() {
    var input = XA.$('#pmInput');
    if (input) {
      input.addEventListener('input', function () { clearTimeout(suggestTimer); suggestTimer = setTimeout(function () { suggest(input.value); }, 180); });
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var q = input.value.trim(); if (!q) return;
        var s = XA.$('#pmSuggest'); if (s) s.classList.remove('show');
        searchPOI(q);
      });
    }
    XA.$$('[data-pm-kw]').forEach(function (b) {
      b.addEventListener('click', function () { if (input) input.value = b.dataset.pmKw; var s = XA.$('#pmSuggest'); if (s) s.classList.remove('show'); searchPOI(b.dataset.pmKw); });
    });
    document.addEventListener('click', function (e) {
      var sg = e.target.closest('[data-pm-s]');
      if (sg) { if (input) input.value = sg.dataset.pmS; var s = XA.$('#pmSuggest'); if (s) s.classList.remove('show'); searchPOI(sg.dataset.pmS); }
    });
    var clear = XA.$('#pmClear');
    if (clear) clear.addEventListener('click', function () {
      if (input) input.value = '';
      var s = XA.$('#pmSuggest'); if (s) s.classList.remove('show');
      resetEmbed();
    });
    var exit = XA.$('#pmExit'); if (exit) exit.addEventListener('click', closePanel);
  }

  function openPanel() {
    if (!layer) {
      var phone = XA.$('#phone'); if (!phone) return;
      phone.insertAdjacentHTML('beforeend', html());
      layer = XA.$('#pmLayer'); bind(); resetEmbed(); startGPS();
    }
    layer.classList.add('open');
    XA.$('#phone').classList.add('modal-open');
    var input = XA.$('#pmInput'); if (input) setTimeout(function () { input.focus(); }, 200);
  }
  function closePanel() {
    if (!layer) return;
    layer.classList.remove('open');
    XA.$('#phone').classList.remove('modal-open');
    if (watchId && navigator.geolocation) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  }

  XA.openPoiMap = openPanel;
  XA.actions['open-poi-map'] = openPanel;
  XA.actions.search = openPanel;
})();
