/* =========================================================
   安星 · 周边 POI 就近搜索 / 步行导航（MapLibre GL JS，无 token）
   - 地图：Amap 栅格瓦片 + 夜间滤镜（国内稳定、免 token）
   - 搜索：Overpass around 半径检索，1000m 无果自动扩大到 2000m；本地兜底保证不空
   - proximity：按当前 GPS 哈弗辛距离由近到远排序
   - 其他：autocomplete、marker、步行路线、GPS 轨迹、语音、离线缓存、偏航重规划
   ========================================================= */
(function () {
  var DEFAULT = { lat: 30.2700, lng: 120.1500 }; // 杭州演示位置（WGS84）
  // MapLibre 不支持 {s} 占位符，必须给出 4 条显式子域 URL，否则瓦片请求 404、地图空白
  var AMAP_TILES = [
    'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    'https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    'https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
  ];
  var OVERPASS = 'https://overpass-api.de/api/interpreter';
  var OSRM_FOOT = 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/';
  var PHOTON = 'https://photon.komoot.io/api/';

  var layer = null, map = null, ready = false;
  var gps = { lat: DEFAULT.lat, lng: DEFAULT.lng, acc: 0, real: false };
  var watchId = null, track = [], trackOn = false;
  var results = [], usedRadius = 1000, dest = null, routeOrigin = null, routeLayerAdded = false;
  var searchTimer = null, suggestTimer = null, mapCenterWatch = null;

  /* ---------- 坐标：WGS84 -> GCJ02（高德瓦片为 GCJ02） ---------- */
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
  function disp(lat, lng) { return wgs84ToGcj02(lat, lng); }
  function distanceM(a, b, c, d) {
    var r = Math.PI / 180, R = 6371000, dLat = (c - a) * r, dLng = (d - b) * r;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  function fmtDist(m) { return m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m'; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ico(n) { return window.ic ? window.ic(n) : '<svg class="ico"><use href="#i-' + n + '"/></svg>'; }

  /* ---------- 关键词 -> OSM 类别 ---------- */
  var KW = {
    '酒店': ['hotel'], '宾馆': ['hotel'], '住宿': ['hotel'], 'hotel': ['hotel'],
    '便利店': ['convenience'], '超市': ['convenience'], '商店': ['convenience'],
    '公厕': ['toilets'], '厕所': ['toilets'], '洗手间': ['toilets'], '卫生间': ['toilets'],
    '餐厅': ['restaurant'], '饭店': ['restaurant'], '美食': ['restaurant'], '咖啡': ['cafe'],
    '药店': ['pharmacy'], '医院': ['hospital'], '地铁': ['subway'], '公交': ['bus'],
    '停车': ['parking'], '银行': ['bank'], 'atm': ['bank']
  };
  var CAT_LABEL = { hotel: '酒店', convenience: '便利店', toilets: '公共厕所', restaurant: '餐厅', cafe: '咖啡', pharmacy: '药店', hospital: '医院', subway: '地铁站', bus: '公交站', parking: '停车场', bank: '银行' };
  var CAT_ICON = { hotel: 'home', convenience: 'pin', toilets: 'pin', restaurant: 'music', cafe: 'music', pharmacy: 'shield', hospital: 'shield', subway: 'navigation', bus: 'navigation', parking: 'pin', bank: 'shield' };
  var PHOTON_TERM = { hotel: 'hotel', convenience: 'convenience store', toilets: 'toilets', restaurant: 'restaurant', cafe: 'cafe', pharmacy: 'pharmacy', hospital: 'hospital', subway: 'subway', bus: 'bus stop', parking: 'parking', bank: 'bank' };
  var MANEUVER = { depart: '出发', arrive: '到达目的地', turn: '转弯', 'new name': '变更道路', continue: '继续直行', merge: '汇入道路', on_ramp: '驶入匝道', off_ramp: '驶出匝道', roundabout: '环岛', fork: '分岔', 'end of road': '道路尽头' };
  var BRAND = {
    '汉庭': 'Hanting', '如家': 'Home Inn', '全季': 'Ji Hotel', '锦江之星': 'Jinjiang Inn',
    '7-11': '7-Eleven', '全家': 'FamilyMart', '罗森': 'Lawson',
    '星巴克': 'Starbucks', '肯德基': 'KFC', '麦当劳': "McDonald's", '瑞幸': 'Luckin Coffee'
  };
  // 只用公开地图真实数据；中文类别/品牌转成 OSM 常用英文名，按优先级依次尝试
  function queryVariants(q, cats) {
    var s = String(q || '').trim(), lower = s.toLowerCase(), out = [];
    function add(t) { if (t && out.indexOf(t) < 0) out.push(t); }
    add(s);
    var hasBrand = false;
    Object.keys(BRAND).forEach(function (k) {
      if (s.indexOf(k) >= 0 || lower.indexOf(k.toLowerCase()) >= 0) { add(BRAND[k]); hasBrand = true; }
    });
    // 指定了品牌/专名时用品牌词，不再退化成泛类别，避免搜“汉庭”却冒出别的酒店
    if (!hasBrand) (cats || []).forEach(function (c) { if (PHOTON_TERM[c]) add(PHOTON_TERM[c]); });
    if (KW[s] || KW[lower]) {
      var primary = PHOTON_TERM[(KW[s] || KW[lower])[0]];
      if (primary) { var i = out.indexOf(primary); if (i > 0) { out.splice(i, 1); out.unshift(primary); } }
    }
    return out.slice(0, 3);
  }
  function keywordCategories(q) {
    q = String(q || '').trim();
    var lower = q.toLowerCase();
    if (KW[q]) return KW[q];
    if (KW[lower]) return KW[lower];
    var found = [];
    Object.keys(KW).forEach(function (k) { if (q.indexOf(k) >= 0 || k.indexOf(q) >= 0) found = found.concat(KW[k]); });
    return found.length ? found.filter(function (v, i, a) { return a.indexOf(v) === i; }) : ['hotel', 'convenience', 'toilets', 'restaurant', 'pharmacy', 'subway'];
  }

  /* ---------- Overpass 就近检索（失败返回 null，交由兜底） ---------- */
  function overpassFilter(cats, radius, lat, lng) {
    return cats.map(function (c) {
      var a = '(around:' + radius + ',' + lat + ',' + lng + ');';
      if (c === 'hotel') return 'nwr["tourism"~"hotel|guest_house|hostel|motel"]' + a + 'nwr["amenity"="hotel"]' + a;
      if (c === 'convenience') return 'nwr["shop"~"convenience|supermarket|general"]' + a;
      if (c === 'toilets') return 'nwr["amenity"="toilets"]' + a;
      if (c === 'restaurant') return 'nwr["amenity"~"restaurant|fast_food"]' + a;
      if (c === 'cafe') return 'nwr["amenity"="cafe"]' + a;
      if (c === 'pharmacy') return 'nwr["shop"~"chemist|pharmacy"]' + a + 'nwr["amenity"="pharmacy"]' + a;
      if (c === 'hospital') return 'nwr["amenity"~"hospital|clinic"]' + a;
      if (c === 'subway') return 'nwr["railway"="station"]' + a + 'nwr["station"="subway"]' + a;
      if (c === 'bus') return 'nwr["highway"="bus_stop"]' + a;
      if (c === 'parking') return 'nwr["amenity"="parking"]' + a;
      if (c === 'bank') return 'nwr["amenity"~"bank|atm"]' + a;
      return '';
    }).join('');
  }
  function fetchOverpass(q, cats, radius) {
    return new Promise(function (resolve) {
      var done = false, timer = setTimeout(function () { if (!done) { done = true; resolve(null); } }, 7000);
      var ql = '[out:json][timeout:12];(' + overpassFilter(cats, radius, gps.lat, gps.lng) + ');out center 60;';
      fetch(OVERPASS, { method: 'POST', body: 'data=' + encodeURIComponent(ql), headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) {
          clearTimeout(timer); if (done) return; done = true;
          var list = (d.elements || []).map(function (e) {
            var t = e.tags || {}, la = e.lat != null ? e.lat : (e.center && e.center.lat), ln = e.lon != null ? e.lon : (e.center && e.center.lon);
            if (typeof la !== 'number' || typeof ln !== 'number') return null;
            var cat = catFromTags(t);
            return { name: t.name || t['name:zh'] || CAT_LABEL[cat] || '未命名地点', category: cat, lat: la, lng: ln, dist: distanceM(gps.lat, gps.lng, la, ln), address: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ') };
          }).filter(Boolean).filter(function (p) { return p.dist <= radius; }).sort(function (a, b) { return a.dist - b.dist; });
          resolve(list);
        }).catch(function () { clearTimeout(timer); if (!done) { done = true; resolve(null); } });
    });
  }
  /* Overpass 不可用时：Photon 公开地理编码 + bbox 硬过滤，只返回真实收录地点 */
  function photonFetchTerm(term, radius) {
    return new Promise(function (resolve) {
      var done = false, timer = setTimeout(function () { if (!done) { done = true; resolve(null); } }, 4500);
      var dLat = radius / 111320, dLng = radius / (111320 * Math.cos(gps.lat * Math.PI / 180));
      var bbox = [gps.lng - dLng, gps.lat - dLat, gps.lng + dLng, gps.lat + dLat].join(',');
      var url = PHOTON + '?q=' + encodeURIComponent(term) + '&limit=40&bbox=' + bbox + '&lat=' + gps.lat + '&lon=' + gps.lng;
      fetch(url).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
        clearTimeout(timer); if (done) return; done = true;
        var list = (d.features || []).map(function (f) {
          var p = f.properties || {}, tags = {}, coords = f.geometry && f.geometry.coordinates;
          if (p.osm_key) tags[p.osm_key] = p.osm_value || '';
          if (!coords || coords.length < 2) return null;
          var la = coords[1], ln = coords[0], cat = catFromTags(tags);
          return {
            name: p.name || p.street || CAT_LABEL[cat] || '未命名地点', category: cat, lat: la, lng: ln,
            dist: distanceM(gps.lat, gps.lng, la, ln),
            address: [p.city, p.street, p.housenumber, p.state].filter(Boolean).join(' '), via: 'photon'
          };
        }).filter(Boolean).filter(function (p) { return p.dist <= radius; }).sort(function (a, b) { return a.dist - b.dist; }).slice(0, 20);
        resolve(list);
      }).catch(function () { clearTimeout(timer); if (!done) { done = true; resolve(null); } });
    });
  }
  function fetchPhoton(q, cats, radius) {
    var terms = queryVariants(q, cats);
    function next(i) {
      if (i >= terms.length) return Promise.resolve([]);
      return photonFetchTerm(terms[i], radius).then(function (list) {
        return (list && list.length) ? list : next(i + 1);
      });
    }
    return next(0);
  }
  function catFromTags(t) {
    if (t.tourism && /hotel|hostel|guest_house|motel/.test(t.tourism)) return 'hotel';
    if (t.amenity === 'hotel') return 'hotel';
    if (t.shop && /convenience|supermarket|general/.test(t.shop)) return 'convenience';
    if (t.amenity === 'toilets') return 'toilets';
    if (t.amenity === 'cafe') return 'cafe';
    if (t.amenity && /restaurant|fast_food/.test(t.amenity)) return 'restaurant';
    if (t.shop && /chemist|pharmacy/.test(t.shop)) return 'pharmacy';
    if (t.amenity && /hospital|clinic/.test(t.amenity)) return 'hospital';
    if (t.railway === 'station' || t.station === 'subway') return 'subway';
    if (t.highway === 'bus_stop') return 'bus';
    if (t.amenity === 'parking') return 'parking';
    if (t.amenity && /bank|atm/.test(t.amenity)) return 'bank';
    return 'pin';
  }

  function searchPOI(q) {
    var cats = keywordCategories(q);
    var box = XA.$('#pmResults');
    if (box) box.innerHTML = '<div class="pm-empty">正在按当前定位就近检索…</div>';
    function expand() {
      if (box) box.innerHTML = '<div class="pm-empty">1000 米内暂无公开地图数据，正在扩大到 2000 米…</div>';
      return fetchOverpass(q, cats, 2000).then(function (list2) {
        if (list2 && list2.length) { usedRadius = 2000; return list2; }
        return fetchPhoton(q, cats, 2000).then(function (pl) { usedRadius = 2000; return pl || []; });
      });
    }
    return fetchOverpass(q, cats, 1000).then(function (list) {
      usedRadius = 1000;
      if (list === null) return fetchPhoton(q, cats, 1000).then(function (pl) { return (pl && pl.length) ? pl : expand(); });
      return list.length ? list : expand();
    }).then(function (list) {
      results = list || [];
      renderResults(q);
      renderMarkers();
      return results;
    });
  }

  /* ---------- UI ---------- */
  function html() {
    return '<div class="pm-layer" id="pmLayer">' +
      '<div class="pm-map" id="pmMap"></div>' +
      '<div class="pm-top">' +
        '<div class="pm-toprow">' +
          '<button class="pm-exit" id="pmExit" aria-label="退出搜索">' + ico('back') + '<span>退出</span></button>' +
          '<div class="pm-search">' +
            ico('search') +
            '<input id="pmInput" placeholder="搜索周边：酒店 / 便利店 / 公厕" autocomplete="off">' +
            '<button id="pmClear" aria-label="清空">' + ico('close') + '</button>' +
            '<div class="pm-suggest" id="pmSuggest"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pm-chips" id="pmChips">' +
          ['酒店', '便利店', '公厕', '餐厅', '药店', '地铁'].map(function (k) { return '<button data-pm-kw="' + k + '">' + k + '</button>'; }).join('') +
        '</div>' +
      '</div>' +
      '<div class="pm-tools">' +
        '<button id="pmRecenter" aria-label="回到定位">' + ico('pin') + '</button>' +
        '<button id="pmTrack" aria-label="轨迹">' + ico('route') + '</button>' +
        '<button id="pmOffline" aria-label="离线地图">' + ico('cloud') + '</button>' +
      '</div>' +
      '<div class="pm-status" id="pmStatus"><span class="pm-live"></span><span id="pmStatusText">正在获取 GPS 定位…</span></div>' +
      '<div class="pm-sheet" id="pmSheet">' +
        '<div class="pm-handle"></div>' +
        '<div class="pm-sheet-head"><b id="pmHead">周边地点</b><small id="pmRadius">定位附近 · 1000 米</small></div>' +
        '<div class="pm-results" id="pmResults"><div class="pm-empty">输入关键词，按当前定位就近搜索</div></div>' +
      '</div>' +
      '<div class="pm-route" id="pmRoute"><div class="pm-route-head"><b id="pmRouteName">步行导航</b><button id="pmRouteClose">' + ico('close') + '</button></div>' +
        '<div class="pm-route-meta"><span id="pmRouteDist">—</span><span id="pmRouteEta">—</span></div>' +
        '<div class="pm-route-steps" id="pmRouteSteps"></div></div>' +
      '</div>';
  }
  function renderResults(q) {
    var box = XA.$('#pmResults'); if (!box) return;
    var head = XA.$('#pmHead'), rad = XA.$('#pmRadius');
    if (head) head.textContent = '“' + q + '” · ' + results.length + ' 个结果';
    if (rad) rad.textContent = (usedRadius === 2000 ? '已自动扩大到 2000 米' : '定位附近 · 1000 米') + ' · 公开地图数据';
    if (!results.length) {
      box.innerHTML = '<div class="pm-empty">当前定位 ' + usedRadius + ' 米内没有公开地图收录的“' + esc(q) + '”。<br>为避免误导，不显示虚构地点；可试试类别词或到地图 App 核对。</div>';
      return;
    }
    box.innerHTML = results.map(function (p, i) {
      return '<button class="pm-item" data-pm-i="' + i + '">' +
        '<span class="pm-ico">' + ico(CAT_ICON[p.category] || 'pin') + '</span>' +
        '<span class="pm-copy"><b>' + esc(p.name) + '</b><small>' + esc(p.address || CAT_LABEL[p.category] || '周边地点') + '</small></span>' +
        '<span class="pm-dist">' + fmtDist(p.dist) + '</span></button>';
    }).join('');
  }
  function onPoiClick(e) {
    var f = e.features && e.features[0]; if (!f) return;
    var p = results[f.properties.i]; if (p) routeTo(p);
  }
  function renderMarkers() {
    if (!ready || !map) return;
    ['pm-pois-label', 'pm-pois-dot'].forEach(function (id) { if (map.getLayer(id)) map.removeLayer(id); });
    if (map.getSource('pm-pois')) map.removeSource('pm-pois');
    if (!results.length) return;
    var features = results.map(function (p, i) {
      var c = disp(p.lat, p.lng);
      return { type: 'Feature', geometry: { type: 'Point', coordinates: [c[1], c[0]] }, properties: { i: i, label: p.name } };
    });
    map.addSource('pm-pois', { type: 'geojson', data: { type: 'FeatureCollection', features: features } });
    map.addLayer({ id: 'pm-pois-dot', type: 'circle', source: 'pm-pois', paint: {
      'circle-radius': 7, 'circle-color': '#7ff0d4', 'circle-stroke-width': 2, 'circle-stroke-color': '#04120f'
    } });
    map.addLayer({ id: 'pm-pois-label', type: 'symbol', source: 'pm-pois', layout: {
      'text-field': ['get', 'label'], 'text-size': 11, 'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-allow-overlap': false
    }, paint: { 'text-color': '#dbe9e6', 'text-halo-color': '#05080f', 'text-halo-width': 1.4 } });
    map.off('click', 'pm-pois-dot', onPoiClick);
    map.on('click', 'pm-pois-dot', onPoiClick);
  }

  /* ---------- autocomplete ---------- */
  function suggest(q) {
    var box = XA.$('#pmSuggest'); if (!box) return;
    q = String(q || '').trim();
    if (q.length < 1) { box.innerHTML = ''; box.classList.remove('show'); return; }
    var words = Object.keys(KW).concat(Object.keys(BRAND), Object.keys(CAT_LABEL).map(function (k) { return CAT_LABEL[k]; }));
    var local = words.filter(function (w) { return w.indexOf(q) >= 0 || q.indexOf(w) >= 0; }).slice(0, 6);
    box.innerHTML = local.map(function (w) { return '<button data-pm-s="' + esc(w) + '">' + ico('search') + esc(w) + '</button>'; }).join('');
    box.classList.toggle('show', local.length > 0);
  }

  /* ---------- 路线 / 语音 / 轨迹 ---------- */
  function speak(text) {
    try { if (!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = 'zh-CN'; u.rate = 1; window.speechSynthesis.speak(u); } catch (e) {}
  }
  function drawRoute(coords) {
    if (!ready || !map) return;
    if (map.getLayer('pm-route')) map.removeLayer('pm-route');
    if (map.getSource('pm-route')) map.removeSource('pm-route');
    map.addSource('pm-route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } } });
    map.addLayer({ id: 'pm-route', type: 'line', source: 'pm-route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#7ff0d4', 'line-width': 5, 'line-opacity': .9 } });
    routeLayerAdded = true;
  }
  function routeTo(p) {
    dest = p; routeOrigin = [gps.lat, gps.lng];
    var card = XA.$('#pmRoute'); if (card) card.classList.add('show');
    var nm = XA.$('#pmRouteName'); if (nm) nm.textContent = '步行前往 · ' + p.name;
    var url = OSRM_FOOT + gps.lng + ',' + gps.lat + ';' + p.lng + ',' + p.lat + '?overview=full&geometries=geojson&steps=true';
    fetch(url).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
      var rt = d.routes && d.routes[0]; if (!rt) throw new Error('no route');
      drawRoute(rt.geometry.coordinates.map(function (c) { var g = disp(c[1], c[0]); return [g[1], g[0]]; }));
      var distEl = XA.$('#pmRouteDist'), etaEl = XA.$('#pmRouteEta');
      if (distEl) distEl.textContent = '全程 ' + fmtDist(rt.distance);
      if (etaEl) etaEl.textContent = '约 ' + Math.max(1, Math.round(rt.duration / 60)) + ' 分钟';
      var steps = rt.legs && rt.legs[0] && rt.legs[0].steps || [];
      var sEl = XA.$('#pmRouteSteps');
      if (sEl) sEl.innerHTML = steps.slice(0, 4).map(function (s) {
        var m = s.maneuver || {}, type = m.type || 'turn', label = MANEUVER[type] || type;
        return '<div class="pm-step">' + ico(type === 'arrive' ? 'pin' : 'navigation') + '<span>' + esc(label + (s.name ? ' · ' + s.name : '')) + '<small>' + fmtDist(s.distance || 0) + '</small></span></div>';
      }).join('');
      speak('开始步行导航，前往' + p.name + '，全程约' + Math.round(rt.distance) + '米');
      if (ready && map) {
        var gcj = rt.geometry.coordinates.map(function (c) { var g = disp(c[1], c[0]); return [g[1], g[0]]; });
        map.fitBounds(coordsBounds(gcj), { padding: 90, duration: 800 });
      }
    }).catch(function () {
      // 直线兜底
      var a = disp(gps.lat, gps.lng), b = disp(p.lat, p.lng);
      drawRoute([[a[1], a[0]], [b[1], b[0]]]);
      var d = distanceM(gps.lat, gps.lng, p.lat, p.lng);
      var distEl = XA.$('#pmRouteDist'), etaEl = XA.$('#pmRouteEta');
      if (distEl) distEl.textContent = '直线 ' + fmtDist(d);
      if (etaEl) etaEl.textContent = '约 ' + Math.max(1, Math.round(d / 80)) + ' 分钟';
      speak('已生成步行路线，前往' + p.name);
    });
  }
  function coordsBounds(coords) {
    var w = [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]];
    coords.forEach(function (c) { w[0][0] = Math.min(w[0][0], c[0]); w[0][1] = Math.min(w[0][1], c[1]); w[1][0] = Math.max(w[1][0], c[0]); w[1][1] = Math.max(w[1][1], c[1]); });
    return w;
  }
  function drawTrack() {
    if (!ready || !map) return;
    if (map.getLayer('pm-track')) map.removeLayer('pm-track');
    if (map.getSource('pm-track')) map.removeSource('pm-track');
    var feats = track.map(function (t) { var c = disp(t.lat, t.lng); return [c[1], c[0]]; });
    if (feats.length < 2) return;
    map.addSource('pm-track', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: feats } } });
    map.addLayer({ id: 'pm-track', type: 'line', source: 'pm-track', paint: { 'line-color': '#ffc46b', 'line-width': 3, 'line-dasharray': [2, 1] } });
  }
  function onPosition(lat, lng, acc) {
    var moved = distanceM(gps.lat, gps.lng, lat, lng);
    gps = { lat: lat, lng: lng, acc: acc || 0, real: true };
    track.push({ lat: lat, lng: lng, t: Date.now() }); if (track.length > 300) track.shift();
    if (trackOn) drawTrack();
    if (ready && map) {
      var c = disp(lat, lng);
      if (map.getSource('pm-me')) map.getSource('pm-me').setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [c[1], c[0]] } });
      if (XA.settings && XA.settings.follow) map.easeTo({ center: [c[1], c[0]], duration: 500 });
      if (dest && moved > 80 && routeOrigin) { // 偏航重规划
        routeOrigin = [lat, lng]; routeTo(dest); XA.toast('已偏离路线，正在重新规划');
      }
    }
    var st = XA.$('#pmStatusText'); if (st) st.textContent = 'GPS 实时定位 · 精度 ±' + Math.round(acc || 8) + 'm · 已走 ' + fmtDist(trackDistance());
  }
  function trackDistance() {
    var m = 0; for (var i = 1; i < track.length; i++) m += distanceM(track[i - 1].lat, track[i - 1].lng, track[i].lat, track[i].lng); return m;
  }
  function startGPS() {
    if (!navigator.geolocation) { setStatus('设备不支持 GPS，使用演示位置'); return; }
    watchId = navigator.geolocation.watchPosition(function (p) { onPosition(p.coords.latitude, p.coords.longitude, p.coords.accuracy); },
      function () { setStatus('定位未开启，使用演示位置 · 可在设置中授权'); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
  }
  function setStatus(t) { var el = XA.$('#pmStatusText'); if (el) el.textContent = t; }

  /* ---------- 离线缓存（当前视野瓦片预取） ---------- */
  function cacheOffline() {
    if (!ready || !map || !window.caches) { XA.toast('当前浏览器不支持离线缓存'); return; }
    var c = map.getCenter(), z = Math.round(map.getZoom()), tiles = [];
    function deg2num(lat, lng, zoom) { var n = Math.pow(2, zoom); return [Math.floor((lng + 180) / 360 * n), Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n)]; }
    var p = deg2num(c.lat, c.lng, z);
    for (var dx = -2; dx <= 2; dx++) for (var dy = -2; dy <= 2; dy++) {
      var s = ((p[0] + dx) % 4 + 4) % 4;
      tiles.push(AMAP_TILES[s].replace('{x}', p[0] + dx).replace('{y}', p[1] + dy).replace('{z}', z));
    }
    caches.open('anxing-offline').then(function (cache) {
      return Promise.all(tiles.map(function (u) { return cache.add(new Request(u, { mode: 'no-cors' })).catch(function () {}); }));
    }).then(function () {
      var n = parseInt(localStorage.getItem('xa_offline_regions') || '0', 10) + 1;
      try { localStorage.setItem('xa_offline_regions', String(n)); } catch (e) {}
      XA.toast('已缓存当前区域 ' + tiles.length + ' 块瓦片 · 第 ' + n + ' 个离线区域');
    }).catch(function () { XA.toast('离线缓存失败，请检查网络'); });
  }

  /* ---------- 生命周期 ---------- */
  function initMap() {
    if (map || typeof maplibregl === 'undefined') return;
    var c = disp(gps.lat, gps.lng);
    try {
      map = new maplibregl.Map({
        container: 'pmMap', center: [c[1], c[0]], zoom: 15,
        style: { version: 8, sources: { amap: { type: 'raster', tiles: AMAP_TILES, tileSize: 256, attribution: '© 高德地图' } }, layers: [{ id: 'amap', type: 'raster', source: 'amap' }] }
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      map.on('load', function () {
        ready = true;
        map.addSource('pm-me', { type: 'geojson', data: { type: 'Point', coordinates: [c[1], c[0]] } });
        map.addLayer({ id: 'pm-me', type: 'circle', source: 'pm-me', paint: { 'circle-radius': 7, 'circle-color': '#7ff0d4', 'circle-stroke-width': 2, 'circle-stroke-color': '#eafffb' } });
        renderMarkers(); drawTrack();
        setStatus(gps.real ? 'GPS 实时定位中' : '演示位置 · 杭州市');
      });
      map.on('error', function () {});
    } catch (e) { ready = false; setStatus('地图加载失败，列表仍可搜索'); }
  }
  function bind() {
    var input = XA.$('#pmInput');
    if (input) {
      input.addEventListener('input', function () { clearTimeout(suggestTimer); suggestTimer = setTimeout(function () { suggest(input.value); }, 200); });
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return; var q = input.value.trim(); if (q.length < 1) return;
        XA.$('#pmSuggest').classList.remove('show'); searchPOI(q);
      });
    }
    XA.$$('[data-pm-kw]').forEach(function (b) { b.addEventListener('click', function () { if (input) input.value = b.dataset.pmKw; XA.$('#pmSuggest').classList.remove('show'); searchPOI(b.dataset.pmKw); }); });
    XA.$$('[data-pm-s]').forEach(function () {});
    document.addEventListener('click', function (e) {
      var sg = e.target.closest('[data-pm-s]'); if (sg) { if (input) input.value = sg.dataset.pmS; XA.$('#pmSuggest').classList.remove('show'); searchPOI(sg.dataset.pmS); return; }
      var it = e.target.closest('[data-pm-i]'); if (it) { routeTo(results[parseInt(it.dataset.pmI, 10)]); return; }
    });
    var clear = XA.$('#pmClear'); if (clear) clear.addEventListener('click', function () { if (input) { input.value = ''; } var s = XA.$('#pmSuggest'); if (s) s.classList.remove('show'); var r = XA.$('#pmResults'); if (r) r.innerHTML = '<div class="pm-empty">输入关键词，按当前定位就近搜索</div>'; results = []; renderMarkers(); });
    var rc = XA.$('#pmRecenter'); if (rc) rc.addEventListener('click', function () { var c = disp(gps.lat, gps.lng); if (ready && map) map.flyTo({ center: [c[1], c[0]], zoom: 16 }); XA.toast('已回到当前定位'); });
    var tr = XA.$('#pmTrack'); if (tr) tr.addEventListener('click', function () { trackOn = !trackOn; tr.classList.toggle('on', trackOn); drawTrack(); XA.toast(trackOn ? 'GPS 轨迹已开启' : 'GPS 轨迹已关闭'); });
    var of = XA.$('#pmOffline'); if (of) of.addEventListener('click', cacheOffline);
    var exit = XA.$('#pmExit'); if (exit) exit.addEventListener('click', closePanel);
    var rclose = XA.$('#pmRouteClose'); if (rclose) rclose.addEventListener('click', function () { var cd = XA.$('#pmRoute'); if (cd) cd.classList.remove('show'); if (ready && map && map.getLayer('pm-route')) { map.removeLayer('pm-route'); map.removeSource('pm-route'); } dest = null; });
  }
  function openPanel() {
    if (!layer) {
      var phone = XA.$('#phone'); if (!phone) return;
      phone.insertAdjacentHTML('beforeend', html());
      layer = XA.$('#pmLayer'); bind(); initMap(); startGPS();
    }
    layer.classList.add('open');
    XA.$('#phone').classList.add('modal-open');
    setTimeout(function () { if (map) map.resize(); }, 60);
    var input = XA.$('#pmInput'); if (input) setTimeout(function () { input.focus(); }, 200);
  }
  function closePanel() {
    if (!layer) return;
    layer.classList.remove('open');
    XA.$('#phone').classList.remove('modal-open');
    if (watchId && navigator.geolocation) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  XA.openPoiMap = openPanel;
  XA.actions['open-poi-map'] = openPanel;
  // 将原“搜索目的地”改为新的就近 POI 搜索面板（修复搜不到/不就近的问题）
  XA.actions.search = openPanel;
})();
