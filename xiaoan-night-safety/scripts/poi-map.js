/* 安星 · 首页唯一可交互地图：地点搜索、真实详情、定位与路线入口 */
(function () {
  var DEFAULT = { lat: 30.2700, lng: 120.1500 };
  var PHOTON = 'https://photon.komoot.io/api/';
  var gps = { lat: DEFAULT.lat, lng: DEFAULT.lng, real: false };
  var map = null, markers = [], watchId = null, firstFix = false;
  var state = XA.searchState || { query: '', results: [], open: false };
  XA.searchState = state;
  var CATEGORY = { '酒店': 'hotel', '宾馆': 'hotel', '便利店': 'convenience store', '超市': 'supermarket', '公厕': 'toilets', '厕所': 'toilets', '餐厅': 'restaurant', '美食': 'restaurant', '咖啡': 'cafe', '药店': 'pharmacy', '医院': 'hospital', '地铁': 'subway', '公交': 'bus stop', '停车': 'parking', '银行': 'bank' };
  var BRAND = { '汉庭': 'Hanting', '如家': 'Home Inn', '全季': 'Ji Hotel', '锦江之星': 'Jinjiang Inn', '全家': 'FamilyMart', '罗森': 'Lawson', '星巴克': 'Starbucks', '肯德基': 'KFC', '麦当劳': "McDonald's" };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
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
  function gcj(lat, lng) {
    if (outOfChina(lat, lng)) return [lat, lng];
    var a = 6378245, ee = .006693421622965943, dLat = transformLat(lng - 105, lat - 35), dLng = transformLng(lng - 105, lat - 35);
    var rad = lat / 180 * Math.PI, magic = 1 - ee * Math.sin(rad) * Math.sin(rad), sq = Math.sqrt(magic);
    return [lat + dLat * 180 / ((a * (1 - ee)) / (magic * sq) * Math.PI), lng + dLng * 180 / (a / sq * Math.cos(rad) * Math.PI)];
  }
  function distanceM(a, b, c, d) {
    var r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  function fmt(m) { return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(1) + ' km'; }
  function terms(q) {
    var out = [], hasBrand = false;
    function add(v) { if (v && out.indexOf(v) < 0) out.push(v); }
    add(q);
    Object.keys(BRAND).forEach(function (k) { if (q.indexOf(k) >= 0) { add(BRAND[k]); hasBrand = true; } });
    if (!hasBrand) Object.keys(CATEGORY).forEach(function (k) { if (q.indexOf(k) >= 0) add(CATEGORY[k]); });
    return out.slice(0, 3);
  }
  function query(term, radius) {
    var dLat = radius / 111320, dLng = radius / (111320 * Math.cos(gps.lat * Math.PI / 180));
    var bbox = [gps.lng - dLng, gps.lat - dLat, gps.lng + dLng, gps.lat + dLat].join(',');
    var url = PHOTON + '?q=' + encodeURIComponent(term) + '&limit=40&bbox=' + bbox + '&lat=' + gps.lat + '&lon=' + gps.lng;
    return fetch(url, { signal: AbortSignal.timeout(8000) }).then(function (r) { if (!r.ok) throw new Error('搜索服务暂不可用'); return r.json(); }).then(function (d) {
      return (d.features || []).map(function (f) {
        var p = f.properties || {}, c = f.geometry.coordinates;
        return { name: p.name || p.street || '未命名地点', lat: c[1], lng: c[0], address: [p.district, p.street, p.housenumber].filter(Boolean).join('') || [p.city, p.state].filter(Boolean).join(' · '), category: p.osm_value || '地点', dist: distanceM(gps.lat, gps.lng, c[1], c[0]) };
      }).filter(function (p) { return p.dist <= radius; }).sort(function (a, b) { return a.dist - b.dist; });
    });
  }
  function searchTerms(q, radius) {
    var list = terms(q);
    function next(i) {
      if (i >= list.length) return [];
      return query(list[i], radius).then(function (r) { return r.length ? r : next(i + 1); }).catch(function () { return next(i + 1); });
    }
    return Promise.resolve(next(0));
  }
  function renderResults(q) {
    var panel = XA.$('#poiResults'), list = XA.$('#poiList');
    if (!panel || !list) return;
    panel.classList.add('open'); state.open = true;
    XA.$('#poiTitle').textContent = q + ' · ' + (state.results.length ? state.results.length + ' 个真实地点' : '搜索结果');
    list.innerHTML = state.results.length ? state.results.map(function (p, i) {
      return '<button class="poi-item" data-action="poi-detail" data-poi="' + i + '"><span class="poi-index">' + (i + 1) + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.address || '公开地图收录地点') + '</small></span><em>' + fmt(p.dist) + '</em></button>';
    }).join('') : '<div class="poi-empty">当前范围内未找到公开地图收录的地点。请尝试完整名称或上方类别，不展示虚构结果。</div>';
  }
  function clearMarkers() {
    if (!map) return;
    markers.forEach(function (m) { map.removeLayer(m); }); markers = [];
  }
  function drawMarkers() {
    clearMarkers(); if (!map) return;
    state.results.forEach(function (p, i) {
      var m = L.circleMarker(gcj(p.lat, p.lng), { radius: 8, color: '#0b1420', weight: 2.5, fillColor: '#ffffff', fillOpacity: 1 }).addTo(map);
      m.bindTooltip(esc(p.name), { direction: 'top', offset: [0, -8], className: 'poi-tooltip' });
      m.on('click', function () { openDetail(i); });
      markers.push(m);
    });
  }
  function doSearch(q) {
    q = String(q || '').trim();
    if (!q) { XA.toast('请先输入地点名称，再点搜索'); XA.$('#homeSearchInput').focus(); return; }
    state.query = q; state.results = []; state.open = true;
    var input = XA.$('#homeSearchInput'); if (input) input.value = q;
    var btn = XA.$('#homeSearchBtn'); if (btn) { btn.disabled = true; btn.textContent = '搜索中'; }
    var sheet = XA.$('#homeSheet'); if (sheet) sheet.classList.add('collapsed');
    renderResults(q);
    XA.$('#poiList').innerHTML = '<div class="poi-empty">正在搜索当前位置附近的真实地点…</div>';
    searchTerms(q, 1000).then(function (r) { if (r.length) return r; return searchTerms(q, 2000); }).then(function (r) {
      state.results = r || []; renderResults(q); drawMarkers();
      if (state.results.length && map) {
        var group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(.35), { maxZoom: 16 });
      }
      if (!state.results.length) XA.toast('未找到真实收录地点，请换关键词');
    }).catch(function () {
      XA.$('#poiList').innerHTML = '<div class="poi-empty">网络异常，请检查网络后重试。</div>';
      XA.toast('搜索失败，请稍后重试');
    }).finally(function () { if (btn) { btn.disabled = false; btn.textContent = '搜索'; } });
  }
  function openDetail(i) {
    var p = state.results[i]; if (!p) return;
    XA.openSheet('<h3>' + esc(p.name) + '</h3><div class="sheet-sub">真实公开地图地点 · 距你 ' + fmt(p.dist) + '</div>' +
      '<div class="option-row">' + ic('pin') + '<span><b>地址</b><small>' + esc(p.address || '地图暂未提供详细地址') + '</small></span></div>' +
      '<div class="option-row">' + ic('route') + '<span><b>类别</b><small>' + esc(p.category) + ' · 点击导航后选择安全路线</small></span></div>' +
      '<button class="primary-btn" data-action="navigate-poi" data-poi="' + i + '">选择路线并导航</button>' +
      '<button class="ghost-btn" data-action="locate-poi" data-poi="' + i + '">在地图中定位</button>');
  }
  function recenter() {
    if (!map) return;
    var c = gcj(gps.lat, gps.lng);
    map.setView(c, 17, { animate: true });
    XA.toast(gps.real ? '已回到你的实时位置' : '定位未开启，已回到演示位置');
  }
  function closeSearch() {
    state.open = false; clearMarkers();
    var p = XA.$('#poiResults'); if (p) p.classList.remove('open');
    var sheet = XA.$('#homeSheet'); if (sheet) sheet.classList.remove('collapsed');
  }
  function focusSearch() { XA.go('home'); setTimeout(function () { var i = XA.$('#homeSearchInput'); if (i) i.focus(); }, 120); }
  function guide() {
    var phone = XA.$('#phone'); if (!phone || XA.$('#guideLayer')) return;
    phone.insertAdjacentHTML('beforeend', '<div class="guide-layer" id="guideLayer"><div class="guide-card"><span class="guide-step" id="guideStep">1 / 3</span><div id="guideBody"></div><div class="guide-actions"><button data-action="skip-guide">跳过</button><button class="primary-btn" data-action="next-guide" id="guideNext">下一步</button></div></div></div>');
    XA.guideStep = 1; renderGuide();
  }
  function renderGuide() {
    var data = [
      ['先搜索目的地', '输入完整地点或品牌，点击右侧「搜索」。地图可以拖动、缩放，点击地点标记能查看地址与距离。'],
      ['再选更安全的路线', 'A / B / 路线卡会显示安全分、路灯与监控信息。选择后点击「开始安全导航」，只有你能主动结束导航。'],
      ['随时定位与求助', '右侧定位按钮可回到当前位置。SOS 只在底部标签栏保留，点击后需要二次确认，不会一碰就报警。']
    ][XA.guideStep - 1];
    XA.$('#guideStep').textContent = XA.guideStep + ' / 3';
    XA.$('#guideBody').innerHTML = '<h2>' + data[0] + '</h2><p>' + data[1] + '</p>';
    XA.$('#guideNext').textContent = XA.guideStep === 3 ? '开始体验' : '下一步';
  }
  function endGuide() { var l = XA.$('#guideLayer'); if (l) l.remove(); try { localStorage.setItem('xa_guide_v2', '1'); } catch (e) {} }
  function startGPS() {
    if (!navigator.geolocation) { XA.$('#locationChip').textContent = '定位不可用 · 演示位置'; return; }
    watchId = navigator.geolocation.watchPosition(function (p) {
      gps = { lat: p.coords.latitude, lng: p.coords.longitude, real: true };
      XA.$('#locationChip').textContent = 'GPS 已定位 · ±' + Math.round(p.coords.accuracy || 8) + 'm';
      if (!firstFix && map) { firstFix = true; map.setView(gcj(gps.lat, gps.lng), 16); }
    }, function () { XA.$('#locationChip').textContent = '定位未开启 · 可手动浏览地图'; }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 });
  }
  function init() {
    var el = XA.$('#homeMap'); if (!el) return;
    map = el._xaMap || null;
    if (map) { XA.settings.follow = false; setTimeout(function () { map.invalidateSize(); }, 200); }
    if (state.open && state.results.length) { renderResults(state.query); drawMarkers(); }
    startGPS();
    // 引导延后到开屏与登录弹窗结束之后，避免互相遮挡
    setTimeout(function () { try { if (!localStorage.getItem('xa_guide_v2')) guide(); } catch (e) { guide(); } }, 4500);
  }
  XA.actions.search = focusSearch;
  XA.actions['open-poi-map'] = focusSearch;
  XA.actions['focus-search'] = focusSearch;
  XA.actions['do-search'] = function () { doSearch(XA.$('#homeSearchInput').value); };
  XA.actions['search-category'] = function (el) { doSearch(el.dataset.category); };
  XA.actions['close-search'] = closeSearch;
  XA.actions['poi-detail'] = function (el) { openDetail(+el.dataset.poi); };
  XA.actions['locate-poi'] = function (el) { var p = state.results[+el.dataset.poi]; if (p && map) { XA.closeModal(); map.setView(gcj(p.lat, p.lng), 18); } };
  XA.actions['navigate-poi'] = function (el) { var p = state.results[+el.dataset.poi]; if (!p) return; XA.closeModal(); XA.setDestination(p.name); XA.go('route'); XA.toast('目的地已设置，请选择安全路线'); };
  XA.actions.recenter = recenter;
  XA.actions['open-guide'] = guide;
  XA.actions['skip-guide'] = endGuide;
  XA.actions['next-guide'] = function () { if (XA.guideStep >= 3) endGuide(); else { XA.guideStep++; renderGuide(); } };
  XA.actions['toggle-home-sheet'] = function () { XA.$('#homeSheet').classList.toggle('collapsed'); };
  var ROUTE_INFO = { A: ['滨江路主线', '92', '86%', '12 处', '+3 分钟'], B: ['文昌巷捷径', '78', '61%', '8 处', '+0 分钟'], C: ['文三路夜宵街', '64', '43%', '5 处', '-3 分钟'] };
  XA.actions['route-detail'] = function (el) {
    var k = el && el.dataset.route ? el.dataset.route : 'A';
    var info = ROUTE_INFO[k] || ROUTE_INFO.A;
    XA.$$('.home-route-options button').forEach(function (b) { b.classList.toggle('selected', b.dataset.route === k); });
    XA.selectRoute(k);
    XA.openSheet('<h3>路线 ' + k + ' · ' + info[0] + '</h3><div class="sheet-sub">安全分 ' + info[1] + ' · 路灯 ' + info[2] + ' · 监控 ' + info[3] + ' · 额外耗时 ' + info[4] + '</div>' +
      '<div class="option-row">' + ic('shield') + '<span><b>安全系数 ' + info[1] + '</b><small>路灯、监控与人流加权计算</small></span></div>' +
      '<div class="option-row">' + ic('warning') + '<span><b>风险提示</b><small>出发前请再次观察现场环境，路况可能变化</small></span></div>' +
      '<button class="primary-btn" data-action="start-nav">' + ic('navigation') + '沿此路线开始导航</button>');
  };
  var inputInit = function () { var i = XA.$('#homeSearchInput'); if (i) i.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(i.value); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); inputInit(); }); else { init(); inputInit(); }
})();
