/* 安星 · 首页地图：POI 联想推荐 / 真实地图数据源 / 实时定位 / 路线入口 */
(function () {
  var DEFAULT = { lat: 30.2700, lng: 120.1500 };
  var PHOTON = 'https://photon.komoot.io/api/';
  var NOMINATIM = 'https://nominatim.openstreetmap.org/search';
  var gps = { lat: DEFAULT.lat, lng: DEFAULT.lng, real: false, acc: 0 };
  var map = null, markers = [], firstFix = false;
  var state = XA.searchState || { query: '', results: [], open: false };
  XA.searchState = state;
  var CATEGORY = { '酒店': 'hotel', '宾馆': 'hotel', '住宿': 'hotel', '便利店': 'convenience store', '超市': 'supermarket', '商店': 'shop', '公厕': 'toilets', '厕所': 'toilets', '洗手间': 'toilets', '餐厅': 'restaurant', '饭店': 'restaurant', '美食': 'restaurant', '咖啡': 'cafe', '药店': 'pharmacy', '医院': 'hospital', '地铁': 'subway', '公交': 'bus stop', '停车': 'parking', '银行': 'bank' };
  var BRAND = { '汉庭': 'Hanting', '如家': 'Home Inn', '全季': 'Ji Hotel', '锦江之星': 'Jinjiang Inn', '全家': 'FamilyMart', '罗森': 'Lawson', '星巴克': 'Starbucks', '肯德基': 'KFC', '麦当劳': "McDonald's" };

  /* 概念演示 POI：真实地图服务不可用时兜底，始终提供"附近推荐"，并明确标注为演示数据。
     坐标以当前实时定位为中心做相对偏移，因此永远落在用户附近。 */
  var DEMO_POI = [
    { name: '汉庭酒店（夜行广场店）', cat: '酒店', words: '酒店 宾馆 住宿 汉庭 hanting', dLat: 0.0011, dLng: 0.0016, addr: '24 小时前台 · 大堂照明良好' },
    { name: '全季酒店（地铁站店）', cat: '酒店', words: '酒店 宾馆 住宿 全季', dLat: -0.0018, dLng: 0.0021, addr: '临近地铁口 · 夜间人流较多' },
    { name: '全家便利店（文三路店）', cat: '便利店', words: '便利店 超市 商店 全家 罗森 购物', dLat: 0.0007, dLng: -0.0012, addr: '24 小时营业 · 可作临时求助点' },
    { name: '罗森便利店（学院路口）', cat: '便利店', words: '便利店 超市 商店 罗森', dLat: -0.0009, dLng: -0.0019, addr: '24 小时营业 · 门口有监控' },
    { name: '公共卫生间（街心公园）', cat: '公厕', words: '公厕 厕所 洗手间 卫生间', dLat: 0.0021, dLng: 0.0006, addr: '公园东侧 · 夜间开放' },
    { name: '深夜食堂（夜宵街）', cat: '餐厅', words: '餐厅 饭店 美食 夜宵 咖啡', dLat: 0.0016, dLng: -0.0024, addr: '营业至 02:00 · 沿主路有路灯' },
    { name: '星巴克（滨江店）', cat: '餐厅', words: '咖啡 餐厅 星巴克', dLat: -0.0022, dLng: 0.0011, addr: '营业至 22:30 · 商圈照明充足' },
    { name: '地铁文三路站 A 口', cat: '地铁', words: '地铁 公交 车站 交通', dLat: -0.0004, dLng: 0.0026, addr: '末班车 23:10 · 站内监控密集' },
    { name: '24 小时药店（安康大药房）', cat: '药店', words: '药店 医院 药房', dLat: 0.0024, dLng: -0.0008, addr: '24 小时营业 · 主路沿线' },
    { name: '滨江警务站', cat: '安全点', words: '警务 安全 派出所 求助', dLat: -0.0013, dLng: -0.0027, addr: '安全守护 · 24 小时开放' }
  ];

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
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
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
  function timedFetch(url, ms) {
    if (typeof AbortController === 'undefined') return fetch(url);
    var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, ms || 8000);
    return fetch(url, { signal: ctrl.signal }).finally(function () { clearTimeout(timer); });
  }

  /* ---------- 输入联想推荐（不需要网络，立刻出列表） ---------- */
  function suggestions(q) {
    q = String(q || '').trim();
    var out = [];
    if (!q) {
      out.push({ q: '酒店', label: '酒店', sub: '附近住宿 · 24 小时前台' });
      out.push({ q: '便利店', label: '便利店', sub: '夜间求助点 · 24 小时营业' });
      out.push({ q: '公厕', label: '公厕', sub: '夜间开放' });
      out.push({ q: '地铁', label: '地铁', sub: '末班车与出入口' });
      (XA.searchHistory || []).slice(0, 3).forEach(function (h) { out.push({ q: h, label: h, sub: '历史搜索' }); });
      return out.slice(0, 6);
    }
    DEMO_POI.forEach(function (p) {
      if ((p.name + ' ' + p.cat + ' ' + p.words).toLowerCase().indexOf(q.toLowerCase()) >= 0) {
        out.push({ q: p.name, label: p.name, sub: p.cat + ' · ' + p.addr });
      }
    });
    Object.keys(CATEGORY).forEach(function (k) {
      if (k.indexOf(q) >= 0 || q.indexOf(k) >= 0) out.push({ q: k, label: k, sub: '搜索附近' + k });
    });
    (XA.searchHistory || []).forEach(function (h) {
      if (h.indexOf(q) >= 0) out.push({ q: h, label: h, sub: '历史搜索' });
    });
    if (!out.length) out.push({ q: q, label: q, sub: '搜索「' + q + '」附近的地点' });
    var seen = {};
    return out.filter(function (o) { if (seen[o.q]) return false; seen[o.q] = 1; return true; }).slice(0, 6);
  }
  function renderSuggest(q) {
    var box = XA.$('#poiSuggest'); if (!box) return;
    var list = suggestions(q);
    box.innerHTML = list.map(function (o) {
      return '<button data-action="poi-suggest" data-q="' + esc(o.q) + '">' + ic('search') + '<span><b>' + esc(o.label) + '</b><small>' + esc(o.sub) + '</small></span>' + ic('chevron') + '</button>';
    }).join('');
    box.classList.add('open');
  }
  function hideSuggest() { var b = XA.$('#poiSuggest'); if (b) b.classList.remove('open'); }

  /* ---------- 真实地图数据源：Photon(OSM) → Nominatim(OSM) ---------- */
  function terms(q) {
    var out = [], hasBrand = false;
    function add(v) { if (v && out.indexOf(v) < 0) out.push(v); }
    add(q);
    Object.keys(BRAND).forEach(function (k) { if (q.indexOf(k) >= 0) { add(BRAND[k]); hasBrand = true; } });
    if (!hasBrand) Object.keys(CATEGORY).forEach(function (k) { if (q.indexOf(k) >= 0) add(CATEGORY[k]); });
    return out.slice(0, 2);
  }
  function query(term, radius) {
    var dLat = radius / 111320, dLng = radius / (111320 * Math.cos(gps.lat * Math.PI / 180));
    var bbox = [gps.lng - dLng, gps.lat - dLat, gps.lng + dLng, gps.lat + dLat].join(',');
    var url = PHOTON + '?q=' + encodeURIComponent(term) + '&limit=40&bbox=' + bbox + '&lat=' + gps.lat + '&lon=' + gps.lng;
    return timedFetch(url, 8000).then(function (r) { if (!r.ok) throw new Error('搜索服务暂不可用'); return r.json(); }).then(function (d) {
      return (d.features || []).map(function (f) {
        var p = f.properties || {}, c = f.geometry.coordinates;
        return { name: p.name || p.street || '未命名地点', lat: c[1], lng: c[0], address: [p.district, p.street, p.housenumber].filter(Boolean).join('') || [p.city, p.state].filter(Boolean).join(' · '), category: p.osm_value || '地点', dist: distanceM(gps.lat, gps.lng, c[1], c[0]), demo: false };
      }).filter(function (p) { return p.dist <= radius; }).sort(function (a, b) { return a.dist - b.dist; });
    });
  }
  function searchTerms(q, radius) {
    var list = terms(q);
    function next(i) {
      if (i >= list.length) return Promise.resolve([]);
      return query(list[i], radius).then(function (r) { return r.length ? r : next(i + 1); }).catch(function () { return next(i + 1); });
    }
    return next(0);
  }
  function nominatim(q) {
    var r = 5000, dLat = r / 111320, dLng = r / (111320 * Math.cos(gps.lat * Math.PI / 180));
    var vb = [gps.lng - dLng, gps.lat + dLat, gps.lng + dLng, gps.lat - dLat].join(',');
    var url = NOMINATIM + '?format=json&limit=12&addressdetails=1&bounded=1&viewbox=' + vb + '&q=' + encodeURIComponent(terms(q)[0] || q);
    return timedFetch(url, 8000).then(function (res) { if (!res.ok) throw new Error('no'); return res.json(); }).then(function (d) {
      return (d || []).map(function (f) {
        var lat = parseFloat(f.lat), lng = parseFloat(f.lon), a = f.address || {};
        return { name: f.name || (f.display_name || '').split(',')[0], lat: lat, lng: lng, address: [a.road, a.suburb, a.city].filter(Boolean).join(' · '), category: f.type || '地点', dist: distanceM(gps.lat, gps.lng, lat, lng), demo: false };
      }).filter(function (p) { return isFinite(p.lat) && isFinite(p.lng); }).sort(function (a, b) { return a.dist - b.dist; });
    }).catch(function () { return []; });
  }
  /* 演示 POI：以实时定位为中心生成，保证任何网络环境都有"附近推荐" */
  function localResults(q) {
    var word = String(q || '').toLowerCase();
    var hit = DEMO_POI.filter(function (p) {
      return !q || (p.name + ' ' + p.cat + ' ' + p.words).toLowerCase().indexOf(word) >= 0;
    });
    if (!hit.length) hit = DEMO_POI.slice(0, 5);
    return hit.map(function (p) {
      var lat = gps.lat + p.dLat, lng = gps.lng + p.dLng;
      return { name: p.name, lat: lat, lng: lng, address: p.addr, category: p.cat, dist: distanceM(gps.lat, gps.lng, lat, lng), demo: true };
    }).sort(function (a, b) { return a.dist - b.dist; });
  }
  function searchAll(q) {
    // 真实数据源慢/不可达时最多等 3.5 秒，立刻用附近推荐兜底，避免结果列表长时间空白
    var timer;
    var fallback = new Promise(function (resolve) { timer = setTimeout(function () { resolve({ list: [], timedOut: true }); }, 3500); });
    var remote = searchTerms(q, 1500)
      .then(function (r) { return r.length ? r : nominatim(q); })
      .then(function (r) { return { list: r || [] }; })
      .catch(function () { return { list: [] }; });
    return Promise.race([remote, fallback]).then(function (res) {
      clearTimeout(timer);
      var real = ((res && res.list) || []).slice(0, 12);
      var demo = localResults(q).slice(0, real.length ? 4 : 8);
      return { real: real, demo: demo };
    });
  }

  function renderResults(q) {
    var panel = XA.$('#poiResults'), list = XA.$('#poiList');
    if (!panel || !list) return;
    panel.classList.add('open'); state.open = true;
    var total = state.results.length;
    XA.$('#poiTitle').textContent = q + ' · ' + (total ? total + ' 个附近地点' : '搜索结果');
    if (!total) {
      list.innerHTML = '<div class="poi-empty">暂无附近地点，换个关键词试试。</div>';
      return;
    }
    function item(p, i) {
      return '<button class="poi-item" data-action="poi-detail" data-poi="' + i + '"><span class="poi-index">' + (i + 1) + '</span>' +
        '<span><b>' + esc(p.name) + '</b><small>' + esc(p.address || '公开地图收录地点') + '</small></span><em>' + fmt(p.dist) + '</em></button>';
    }
    var real = state.results.filter(function (p) { return !p.demo; });
    var demo = state.results.filter(function (p) { return p.demo; });
    var html = '';
    if (real.length) html += '<div class="poi-group">真实地图收录 · ' + real.length + ' 个</div>' + real.map(function (p) { return item(p, state.results.indexOf(p)); }).join('');
    if (demo.length) html += '<div class="poi-group">附近推荐 · 概念演示数据</div>' + demo.map(function (p) { return item(p, state.results.indexOf(p)); }).join('');
    list.innerHTML = html;
  }
  function clearMarkers() {
    if (!map) return;
    markers.forEach(function (m) { map.removeLayer(m); }); markers = [];
  }
  function drawMarkers() {
    clearMarkers(); if (!map) return;
    state.results.forEach(function (p, i) {
      var m = L.circleMarker(gcj(p.lat, p.lng), { radius: 8, color: '#0b1420', weight: 2.5, fillColor: p.demo ? '#ffc46b' : '#ffffff', fillOpacity: 1 }).addTo(map);
      m.bindTooltip(esc(p.name), { direction: 'top', offset: [0, -8], className: 'poi-tooltip' });
      m.on('click', function () { openDetail(i); });
      markers.push(m);
    });
  }
  function doSearch(q) {
    q = String(q || '').trim();
    if (!q) { XA.toast('请先输入地点名称，再点搜索'); var i0 = XA.$('#homeSearchInput'); if (i0) i0.focus(); return; }
    hideSuggest();
    state.query = q; state.results = []; state.open = true;
    var input = XA.$('#homeSearchInput'); if (input) input.value = q;
    var btn = XA.$('#homeSearchBtn'); if (btn) { btn.disabled = true; btn.textContent = '搜索中'; }
    renderResults(q);
    XA.$('#poiList').innerHTML = '<div class="poi-empty">正在检索真实地图数据与附近推荐…</div>';
    searchAll(q).then(function (res) {
      state.results = res.real.concat(res.demo);
      renderResults(q); drawMarkers();
      if (state.results.length && map && markers.length) {
        map.fitBounds(L.featureGroup(markers).getBounds().pad(.35), { maxZoom: 16 });
      }
      if (res.real.length) XA.toast('找到 ' + res.real.length + ' 个真实地图地点，并补充附近推荐');
      else XA.toast('真实地图服务暂不可用 · 已展示附近推荐（演示数据）');
    }).finally(function () { if (btn) { btn.disabled = false; btn.textContent = '搜索'; } });
  }
  function openDetail(i) {
    var p = state.results[i]; if (!p) return;
    XA.openSheet('<h3>' + esc(p.name) + '</h3><div class="sheet-sub">' + (p.demo ? '概念演示地点' : '真实公开地图地点') + ' · 距你 ' + fmt(p.dist) + '</div>' +
      '<div class="option-row">' + ic('pin') + '<span><b>地址</b><small>' + esc(p.address || '地图暂未提供详细地址') + '</small></span></div>' +
      '<div class="option-row">' + ic('route') + '<span><b>类别</b><small>' + esc(p.category) + ' · 点击导航后选择安全路线</small></span></div>' +
      '<button class="primary-btn" data-action="navigate-poi" data-poi="' + i + '">选择路线并导航</button>' +
      '<button class="ghost-btn" data-action="locate-poi" data-poi="' + i + '">在地图中定位</button>');
  }
  /* 定位按钮：始终有反馈；优先取实时定位，失败时明确说明并回到当前已知位置 */
  function recenter() {
    XA.toast('正在获取实时位置…');
    var finish = function (p) {
      var c = gcj(p.lat, p.lng);
      if (map) map.setView(c, 17, { animate: true });
      XA.toast(p.real ? '已回到你的实时位置 · 精度 ±' + Math.round(p.acc || 8) + 'm' : '定位未开启 · 已显示概念演示位置');
    };
    if (XA.requestLocation) XA.requestLocation(function (p) { finish(p || gps); });
    else finish(gps);
  }
  function closeSearch() {
    state.open = false; clearMarkers(); hideSuggest();
    var p = XA.$('#poiResults'); if (p) p.classList.remove('open');
  }
  function focusSearch() {
    XA.go('home');
    setTimeout(function () { var i = XA.$('#homeSearchInput'); if (i) { i.focus(); renderSuggest(i.value); } }, 120);
  }
  function guide() {
    var phone = XA.$('#phone'); if (!phone || XA.$('#guideLayer')) return;
    phone.insertAdjacentHTML('beforeend', '<div class="guide-layer" id="guideLayer"><div class="guide-card"><span class="guide-step" id="guideStep">1 / 3</span><div id="guideBody"></div><div class="guide-actions"><button data-action="skip-guide">跳过</button><button class="primary-btn" data-action="next-guide" id="guideNext">下一步</button></div></div></div>');
    XA.guideStep = 1; renderGuide();
  }
  function renderGuide() {
    var data = [
      ['搜索与地图', '输入地点名会立刻弹出联想推荐；点搜索会检索真实地图并补充附近推荐。地图可拖动、缩放，点击标记查看地址与距离。'],
      ['更安全的路线', '选择地点后可进入路线分析，查看安全分、路灯与监控信息；开始导航后只有你能主动结束。'],
      ['定位与求助', '右侧定位按钮回到实时位置；SOS 有倒计时缓冲，误触可随时取消。更多功能可在「我的 → 设置 → 使用指南」查看。']
    ][XA.guideStep - 1];
    XA.$('#guideStep').textContent = XA.guideStep + ' / 3';
    XA.$('#guideBody').innerHTML = '<h2>' + data[0] + '</h2><p>' + data[1] + '</p>';
    XA.$('#guideNext').textContent = XA.guideStep === 3 ? '开始体验' : '下一步';
  }
  function endGuide() { var l = XA.$('#guideLayer'); if (l) l.remove(); try { localStorage.setItem('xa_guide_v2', '1'); } catch (e) {} }

  /* 实时定位由 legacy.js 统一发布；poi-map 只订阅，避免多个 watcher 抢定位 */
  XA.onPositionChange = function (p) {
    gps = { lat: p.lat, lng: p.lng, real: !!p.real, acc: p.acc || 0 };
    if (!firstFix && map && p.real) { firstFix = true; map.setView(gcj(p.lat, p.lng), 16); }
    var me = map && map._xaMe; if (me && p.real) me.setLatLng(gcj(p.lat, p.lng));
  };
  function init() {
    var el = XA.$('#homeMap'); if (!el) return;
    map = el._xaMap || null;
    if (map) { XA.settings.follow = false; setTimeout(function () { map.invalidateSize(); }, 200); }
    if (XA.position && XA.position.real) XA.onPositionChange(XA.position);
    if (state.open && state.results.length) { renderResults(state.query); drawMarkers(); }
    setTimeout(function () { try { if (!localStorage.getItem('xa_guide_v2')) guide(); } catch (e) { guide(); } }, 4500);
  }
  XA.actions.search = focusSearch;
  XA.actions['open-poi-map'] = focusSearch;
  XA.actions['focus-search'] = focusSearch;
  XA.actions['do-search'] = function () { var i = XA.$('#homeSearchInput'); doSearch(i ? i.value : ''); };
  XA.actions['search-category'] = function (el) { doSearch(el.dataset.category); };
  XA.actions['poi-suggest'] = function (el) { var i = XA.$('#homeSearchInput'); if (i) i.value = el.dataset.q; doSearch(el.dataset.q); };
  XA.actions['close-search'] = closeSearch;
  XA.actions['poi-detail'] = function (el) { openDetail(+el.dataset.poi); };
  XA.actions['locate-poi'] = function (el) { var p = state.results[+el.dataset.poi]; if (p && map) { XA.closeModal(); map.setView(gcj(p.lat, p.lng), 18); XA.toast('已定位到 ' + p.name); } };
  XA.actions['navigate-poi'] = function (el) { var p = state.results[+el.dataset.poi]; if (!p) return; XA.closeModal(); XA.setDestination(p.name); XA.go('route'); XA.toast('目的地已设置，请选择安全路线'); };
  XA.actions.recenter = recenter;
  XA.actions['open-guide'] = guide;
  XA.actions['skip-guide'] = endGuide;
  XA.actions['next-guide'] = function () { if (XA.guideStep >= 3) endGuide(); else { XA.guideStep++; renderGuide(); } };
  var ROUTE_INFO = { A: ['滨江路主线', '92', '86%', '12 处', '+3 分钟'], B: ['文昌巷捷径', '78', '61%', '8 处', '+0 分钟'], C: ['文三路夜宵街', '64', '43%', '5 处', '-3 分钟'] };
  XA.actions['route-detail'] = function (el) {
    var k = el && el.dataset.route ? el.dataset.route : 'A';
    var info = ROUTE_INFO[k] || ROUTE_INFO.A;
    XA.selectRoute(k);
    XA.openSheet('<h3>路线 ' + k + ' · ' + info[0] + '</h3><div class="sheet-sub">安全分 ' + info[1] + ' · 路灯 ' + info[2] + ' · 监控 ' + info[3] + ' · 额外耗时 ' + info[4] + '</div>' +
      '<div class="option-row">' + ic('shield') + '<span><b>安全系数 ' + info[1] + '</b><small>路灯、监控与人流加权计算</small></span></div>' +
      '<div class="option-row">' + ic('warning') + '<span><b>风险提示</b><small>出发前请再次观察现场环境，路况可能变化</small></span></div>' +
      '<button class="primary-btn" data-action="start-nav">' + ic('navigation') + '沿此路线开始导航</button>');
  };
  var inputInit = function () {
    var i = XA.$('#homeSearchInput'); if (!i) return;
    var timer = null;
    i.addEventListener('input', function () { clearTimeout(timer); var v = i.value; timer = setTimeout(function () { renderSuggest(v); }, 120); });
    i.addEventListener('focus', function () { renderSuggest(i.value); });
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(i.value); if (e.key === 'Escape') hideSuggest(); });
    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('#poiSuggest') && !e.target.closest('#homeSearch')) hideSuggest();
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); inputInit(); }); else { init(); inputInit(); }
})();
