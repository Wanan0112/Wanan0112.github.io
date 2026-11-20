/* =========================================================
   安星 · 唯一地图（首页高德地图免 Key 嵌入）
   - 首页地图即完整高德地图：地区标识 / 地点详情 / 搜索 / 导航
   - 首页搜索框直接控制这一张地图，不再弹出第二张地图
   ========================================================= */
(function () {
  var DEFAULT = { lat: 30.2700, lng: 120.1500 };
  var EMBED = 'https://www.amap.com/ssr/embed/';
  var gps = { lat: DEFAULT.lat, lng: DEFAULT.lng, real: false };
  var watchId = null, lastQuery = '', lastLoad = 0, locApplied = false;

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
  function setEmbed(url, force) {
    var f = XA.$('#homeEmbed'); if (!f) return false;
    if (f.getAttribute('src') === url) return false;
    var now = Date.now();
    // 高德嵌入页短时间内反复请求会触发人机验证，这里做节流
    if (!force && now - lastLoad < 2200) { XA.toast('搜索切换太快，请稍候再试'); return false; }
    f.setAttribute('src', url); lastLoad = now; return true;
  }
  function markSearching(q) {
    var box = XA.$('#homeSearch'); if (!box) return;
    box.classList.toggle('searching', !!q);
    var input = XA.$('#homeSearchInput'); if (input && q) input.value = q;
  }
  function searchPOI(q) {
    q = String(q || '').trim(); if (!q) return;
    var url = searchUrl(q);
    if (setEmbed(url, q !== lastQuery)) {
      lastQuery = q; markSearching(q);
    }
  }
  function resetMap() {
    lastQuery = ''; markSearching('');
    setEmbed(viewUrl(), true);
  }
  function focusSearch() {
    XA.go('home');
    setTimeout(function () { var i = XA.$('#homeSearchInput'); if (i) i.focus(); }, 120);
  }
  function startGPS() {
    if (!navigator.geolocation) return;
    watchId = navigator.geolocation.watchPosition(function (p) {
      gps = { lat: p.coords.latitude, lng: p.coords.longitude, real: true };
      if (!locApplied && !lastQuery) { locApplied = true; setEmbed(viewUrl(), true); }
    }, function () {}, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
  }
  function bind() {
    var input = XA.$('#homeSearchInput');
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = input.value.trim(); if (q) searchPOI(q);
    });
    var clear = XA.$('#homeSearchClear'); if (clear) clear.addEventListener('click', resetMap);
    var exit = XA.$('#homeSearchExit'); if (exit) exit.addEventListener('click', resetMap);
  }
  function init() { bind(); setEmbed(viewUrl(), true); startGPS(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  XA.openPoiMap = focusSearch;
  XA.actions['open-poi-map'] = focusSearch;
  XA.actions.search = focusSearch;
})();
