/* 旧版能力移植：真实地图导航 / 主题设定 / 登录 / 加载流程
   仅复用旧版逻辑，界面与文案保持新版安星设计。 */
(function () {
  var PHOTON = 'https://photon.komoot.io/api/';
  var OSRM = 'https://router.project-osrm.org/route/v1/';
  var TILE = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
  var TILE_SAT = 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
  var DEFAULT = { lat: 30.2700, lng: 120.1500 };
  var DESTS = {
    '滨江花园': { lat: 30.2080, lng: 120.2100, name: '滨江花园' },
    '家': { lat: 30.2700, lng: 120.1500, name: '家' },
    '公司': { lat: 30.2800, lng: 120.1200, name: '公司' },
    '健身房': { lat: 30.2600, lng: 120.1600, name: '健身房' },
    '西溪公园': { lat: 30.2680, lng: 120.0640, name: '西溪公园' },
    '地铁文三路站': { lat: 30.2760, lng: 120.1390, name: '地铁文三路站' }
  };
  var RECOMMENDS = [
    { name: '西湖公安分局 · 湖滨警务站', cat: '安全守护 · 24 小时开放', score: '安全 98', icon: 'shield', safe: true, lat: 30.2531, lng: 120.1652 },
    { name: '西湖风景名胜区 · 湖滨入口', cat: '旅游景点 · 照明良好', score: '4.9 分', icon: 'navigation', lat: 30.2490, lng: 120.1530 },
    { name: '湖滨银泰 in77', cat: '美食购物 · 人流充足', score: '4.8 分', icon: 'pin', lat: 30.2530, lng: 120.1675 },
    { name: '知味观（湖滨店）', cat: '美食 · 营业至 22:30', score: '4.7 分', icon: 'pin', lat: 30.2542, lng: 120.1660 },
    { name: '武林广场地铁站', cat: '交通枢纽 · 监控密集', score: '安全 94', icon: 'shield', safe: true, lat: 30.2732, lng: 120.1640 }
  ];
  var POINTS = [
    { type: 'lamp', dLat: 0.0016, dLng: -0.0021 }, { type: 'lamp', dLat: 0.0009, dLng: 0.0018 },
    { type: 'lamp', dLat: -0.0014, dLng: 0.0025 }, { type: 'lamp', dLat: -0.0020, dLng: -0.0015 },
    { type: 'cam', dLat: 0.0007, dLng: -0.0010 }, { type: 'cam', dLat: -0.0011, dLng: 0.0011 },
    { type: 'safe', dLat: 0.0022, dLng: 0.0008 }, { type: 'safe', dLat: -0.0006, dLng: -0.0024 },
    { type: 'risk', dLat: 0.0013, dLng: 0.0027 }, { type: 'risk', dLat: -0.0022, dLng: 0.0004 }
  ];
  var LTYPE = { lamp: '路灯', cam: '监控', safe: '安全点', risk: '照明不足' };
  var LCOLOR = { lamp: '#ffc46b', cam: '#8fb8ff', safe: '#7ff0d4', risk: '#ff5b52' };

  var geoStart = [DEFAULT.lat, DEFAULT.lng];
  var curRoutes = [], destPoint = null, navWatch = null, geoReady = false, loginShown = false;
  var mapMode = '2d', baseMap = 'standard';
  XA.homeState = 'default';

  function setHomeState(state) {
    XA.homeState = state;
    window.scrollTo(0, 0);
    var phone = XA.$('#phone');
    if (phone) phone.scrollTop = 0;
    XA.$$('.screen').forEach(function (el) { el.scrollTop = 0; });
    var home = XA.$('[data-screen="home"]');
    if (!home) return;
    home.classList.remove('state-default', 'state-route', 'state-nav');
    home.classList.add('state-' + state);
    XA.$('#phone').classList.toggle('no-tabbar', state !== 'default');
    if (state === 'default') {
      var search = XA.$('.home-search [data-destination]');
      if (search) search.textContent = XA.t ? XA.t('searchHint') : '搜索目的地、公交站';
      var panel = XA.$('#routePanel');
      if (panel) panel.classList.remove('expanded');
    }
    if (state === 'route') syncPanel();
  }
  function syncPanel() {
    var phone = XA.$('#phone');
    if (phone) phone.scrollTop = 0;
    var r = curRoutes[0];
    if (!r) return;
    var set = function (sel, v) { var el = XA.$(sel); if (el) el.textContent = v; };
    set('#rpScore', r.safety);
    set('#rpLamp', r.lamp + '%');
    set('#rpCam', r.cam + ' 处');
    var sw = XA.$('#aiSwitch'), txt = XA.$('#aiStateText');
    if (sw) sw.classList.toggle('on', !!XA.settings.aiCompanion);
    if (txt) txt.textContent = XA.settings.aiCompanion ? '开启：语音陪伴 / 实时播报路况风险' : '关闭：导航静音，无 AI 互动';
  }
  function showRoutePanel() {
    setHomeState('route');
    var el = XA.$('.home-map');
    if (el && el._xaMap) drawRoutes(el._xaMap);
    syncPanel();
  }
  function resetHome() {
    setHomeState('default');
    var el = XA.$('.home-map');
    if (el && el._xaMap && el._xaMap._xaRoutes) {
      el._xaMap._xaRoutes.forEach(function (l) { el._xaMap.removeLayer(l); });
      el._xaMap._xaRoutes = [];
    }
  }
  function applyMapMode() {
    document.body.classList.toggle('map-3d', mapMode === '3d');
    var el = XA.$('.home-map'), m = el && el._xaMap;
    if (!m) return;
    Object.keys(m._layers).forEach(function (k) {
      var layer = m._layers[k];
      if (layer && layer._url) layer.setUrl(baseMap === 'satellite' ? TILE_SAT : TILE);
    });
  }

  function wgs84ToGcj02(lat, lng) {
    var outOfChina = !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
    if (outOfChina) return [lat, lng];
    var a = 6378245.0, ee = 0.00669342162296594323;
    function transLat(x, y) {
      var r = -100 + 2 * x + 3 * y + .2 * y * y + .1 * x * y + .2 * Math.sqrt(Math.abs(x));
      r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
      r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
      r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
      return r;
    }
    function transLng(x, y) {
      var r = 300 + x + 2 * y + .1 * x * x + .1 * x * y + .1 * Math.sqrt(Math.abs(x));
      r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
      r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
      r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
      return r;
    }
    var dLat = transLat(lng - 105, lat - 35), dLng = transLng(lng - 105, lat - 35);
    var radLat = lat / 180 * Math.PI, magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    return [lat + dLat, lng + dLng];
  }
  function gcj() { return wgs84ToGcj02(geoStart[0], geoStart[1]); }
  function accent() {
    return getComputedStyle(document.documentElement).getPropertyValue('--mint').trim() || '#7ff0d4';
  }

  /* ---------------- 设置 ---------------- */
  XA.settings = {
    theme: 'mint', sosCd: 3, voice: true, follow: true, radar: true, acc: true, aiCompanion: true,
    markers: {
      lamp: { color: LCOLOR.lamp, shape: 'circle', glow: 7 },
      cam: { color: LCOLOR.cam, shape: 'circle', glow: 6 },
      safe: { color: LCOLOR.safe, shape: 'diamond', glow: 8 },
      risk: { color: LCOLOR.risk, shape: 'circle', glow: 9 }
    }
  };
  function loadSettings() {
    try {
      var s = JSON.parse(localStorage.getItem('xa_settings'));
      if (s) {
        XA.settings.theme = s.theme || 'mint';
        XA.settings.sosCd = s.sosCd || 3;
        ['voice', 'follow', 'radar', 'acc', 'aiCompanion'].forEach(function (k) {
          if (typeof s[k] === 'boolean') XA.settings[k] = s[k];
        });
        if (s.markers) Object.keys(XA.settings.markers).forEach(function (k) {
          if (s.markers[k]) Object.assign(XA.settings.markers[k], s.markers[k]);
        });
      }
    } catch (e) {}
    applyTheme();
  }
  function saveSettings() {
    try { localStorage.setItem('xa_settings', JSON.stringify(XA.settings)); } catch (e) {}
  }
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', XA.settings.theme);
    refreshMapLayers();
  }
  function openSettings() {
    var s = XA.settings;
    var themes = [['mint', '薄荷夜色'], ['amber', '琥珀暖光'], ['aurora', '星蓝守护']];
    var html = '<h3>外观与守护设定</h3><div class="sheet-sub">主题色、点位样式与导航偏好会保存在本机</div>' +
      '<div class="setting-line"><span><b>主题色</b><small>仅改变强调色，夜间底色保持不变</small></span></div>' +
      '<div class="seg">' + themes.map(function (t) {
        return '<button data-theme-set="' + t[0] + '" class="' + (s.theme === t[0] ? 'on' : '') + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="setting-line"><span><b>SOS 确认倒计时</b><small>按下 SOS 后自动发出前的可取消窗口</small></span></div>' +
      '<div class="seg">' + [3, 5, 8].map(function (v) {
        return '<button data-soscd="' + v + '" class="' + (s.sosCd === v ? 'on' : '') + '">' + v + ' 秒</button>';
      }).join('') + '</div>' +
      '<div class="setting-line"><span><b>地图点位个性化</b><small>路灯 / 监控 / 安全点 / 照明不足</small></span></div>';
    Object.keys(LTYPE).forEach(function (k) {
      var m = s.markers[k];
      html += '<div style="margin:10px 0 14px"><div style="font-size:10px;color:var(--muted);margin-bottom:4px">' + LTYPE[k] + '</div>' +
        '<div class="color-row">' + [LCOLOR.lamp, LCOLOR.cam, LCOLOR.safe, LCOLOR.risk, '#ffffff'].map(function (c) {
          return '<button class="color-dot ' + (m.color === c ? 'on' : '') + '" data-color="' + k + '" data-value="' + c + '" style="background:' + c + ';color:' + c + '"></button>';
        }).join('') + '</div>' +
        '<div class="seg">' + [['circle', '圆形'], ['square', '方形'], ['diamond', '菱形']].map(function (o) {
          return '<button data-shape="' + k + '" data-value="' + o[0] + '" class="' + (m.shape === o[0] ? 'on' : '') + '">' + o[1] + '</button>';
        }).join('') + '</div>' +
        '<div class="seg">' + [[5, '微光'], [8, '标准'], [12, '强光']].map(function (o) {
          return '<button data-glow="' + k + '" data-value="' + o[0] + '" class="' + (m.glow === o[0] ? 'on' : '') + '">' + o[1] + '</button>';
        }).join('') + '</div></div>';
    });
    html += '<div class="setting-line"><span><b>实时位置跟随</b><small>导航时地图自动跟随当前位置</small></span><button class="toggle ' + (s.follow ? 'on' : '') + '" data-toggle="follow"><i></i></button></div>' +
      '<div class="setting-line"><span><b>雷达扫描</b><small>显示 50 米安全扫描圈</small></span><button class="toggle ' + (s.radar ? 'on' : '') + '" data-toggle="radar"><i></i></button></div>' +
      '<div class="setting-line"><span><b>定位精度显示</b><small>在导航中显示 ± 米数</small></span><button class="toggle ' + (s.acc ? 'on' : '') + '" data-toggle="acc"><i></i></button></div>' +
      '<div class="setting-line"><span><b>危险语音提醒</b><small>接近照明不足区域时播报一句话</small></span><button class="toggle ' + (s.voice ? 'on' : '') + '" data-toggle="voice"><i></i></button></div>';
    XA.openSheet(html);
  }
  XA.actions.settings = function () { XA.go('settings'); };
  XA.actions['settings-appearance'] = function () { openSettings(); };
  XA.actions['risk-popover'] = function () {
    var p = XA.$('#riskPopover'), m = XA.$('#mapModePop');
    if (m) m.classList.remove('open');
    if (p) p.classList.toggle('open');
  };
  XA.actions['close-risk'] = function () { var p = XA.$('#riskPopover'); if (p) p.classList.remove('open'); };
  XA.actions.recenter = function () { locate(false); XA.toast('已回到当前位置'); };
  XA.actions['ai-toggle'] = function () {
    XA.settings.aiCompanion = !XA.settings.aiCompanion;
    saveSettings(); syncPanel();
    XA.toast(XA.settings.aiCompanion ? 'AI 全程陪伴已开启' : 'AI 全程陪伴已关闭 · 导航静音');
  };
  XA.actions['open-drawer'] = function () { var d = XA.$('#sideDrawer'); if (d) d.classList.add('open'); };
  XA.actions['close-drawer'] = function () { var d = XA.$('#sideDrawer'); if (d) d.classList.remove('open'); };
  XA.actions['open-route'] = function () {
    XA.actions['close-drawer']();
    XA.go('route');
  };
  XA.actions['open-ar'] = function () {
    XA.actions['close-drawer']();
    XA.go('ar');
  };

  /* ---------------- 登录 ---------------- */
  XA.account = { loggedIn: false, phone: '', nickname: '安星用户', code: '' };
  XA.privacy = { allowHomepage: true, hidePurchases: false, location: true, analytics: false };
  function loadPrivacy() {
    try {
      var p = JSON.parse(localStorage.getItem('xa_privacy'));
      if (p) Object.assign(XA.privacy, p);
    } catch (e) {}
  }
  function savePrivacy() {
    try { localStorage.setItem('xa_privacy', JSON.stringify(XA.privacy)); } catch (e) {}
  }
  XA.savePrivacy = savePrivacy;
  function loadAccount() {
    try {
      var a = JSON.parse(localStorage.getItem('xa_account'));
      if (a) Object.assign(XA.account, a);
    } catch (e) {}
    renderAccount();
  }
  function saveAccount() {
    try { localStorage.setItem('xa_account', JSON.stringify(XA.account)); } catch (e) {}
  }
  function renderAccount() {
    var card = XA.$('[data-screen="profile"] .profile-card');
    if (!card) return;
    var en = XA.lang === 'en';
    var name = card.querySelector('b'), sub = card.querySelector('small'), av = card.querySelector('.profile-avatar');
    var item = card.querySelector('.level');
    if (name) name.textContent = XA.account.loggedIn ? XA.account.nickname : (en ? 'Not signed in · Tap to sign in' : '未登录 · 点击登录');
    if (sub) sub.textContent = XA.account.loggedIn ?
      ((en ? 'Phone: ' : '手机号：') + XA.account.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') + (en ? ' · 3 nights guarded' : ' · 已连续守护 3 晚')) :
      (en ? 'Sign in to sync your night walks · Tap to sign in' : '登录后同步夜行数据 · 点击登录');
    if (av) av.textContent = XA.account.loggedIn ? XA.account.nickname.slice(0, 1) : '安';
    if (item) item.textContent = XA.account.loggedIn ? (en ? 'Night Walker Lv.3' : '夜行者 Lv.3') : (en ? 'Guest mode' : '游客模式');
  }
  XA.renderAccount = renderAccount;
  function buildLogin() {
    if (XA.$('.login-screen')) return;
    var el = document.createElement('div');
    el.className = 'login-screen';
    el.id = 'loginScreen';
    el.innerHTML = '<img class="login-logo" src="assets/splash-logo.png" alt="安星">' +
      '<div class="login-title">欢迎回到安星</div>' +
      '<div class="login-sub">登录后同步你的安全路线、紧急联系人<br>与夜间守护记录。</div>' +
      '<div class="login-form">' +
      '<label class="login-label">手机号</label>' +
      '<input class="login-input" id="loginPhone" type="tel" maxlength="11" inputmode="numeric" placeholder="请输入 11 位手机号">' +
      '<label class="login-label">验证码</label>' +
      '<div class="login-code-row"><input class="login-input" id="loginCode" type="text" maxlength="4" inputmode="numeric" placeholder="4 位验证码">' +
      '<button class="code-btn" data-action="send-code">获取验证码</button></div>' +
      '<button class="login-btn" data-action="do-login">登录并继续</button>' +
      '<button class="login-skip" data-action="skip-login">暂时跳过，先看看</button>' +
      '</div>' +
      '<div class="login-foot">验证码为演示数据，会在页面中直接提示<br>安星不会上传你的手机号</div>';
    XA.$('#phone').appendChild(el);
  }
  function openLogin() {
    buildLogin();
    XA.$('#loginScreen').classList.add('open');
  }
  function closeLogin() {
    var el = XA.$('#loginScreen');
    if (el) el.classList.remove('open');
    loginShown = true;
    try { localStorage.setItem('xa_login_seen', '1'); } catch (e) {}
  }
  function maybeShowLogin() {
    var seen = false;
    try { seen = localStorage.getItem('xa_login_seen') === '1'; } catch (e) {}
    if (!loginShown && !seen && !XA.account.loggedIn) setTimeout(openLogin, 420);
  }
  XA.actions['open-login'] = function () {
    if (XA.account.loggedIn) {
      XA.openSheet('<h3>账号与资料</h3><div class="sheet-sub">登录状态保存在本机，可随时修改昵称</div>' +
        '<div class="acct-field"><label>当前昵称</label><input class="acct-field-input" value="' + XA.account.nickname + '" readonly></div>' +
        '<div class="acct-field"><label>新昵称</label><input class="login-input" id="acctNewName" maxlength="12" placeholder="最多 12 个字"></div>' +
        '<button class="primary-btn" data-action="save-nickname">保存昵称</button>' +
        '<button class="login-skip" data-action="logout-confirm">退出登录</button>');
    } else openLogin();
  };
  XA.actions['send-code'] = function () {
    var p = (XA.$('#loginPhone') || {}).value || '';
    if (!/^1\d{10}$/.test(p.trim())) { XA.toast('请输入正确的 11 位手机号'); return; }
    XA.account.phone = p.trim();
    XA.account.code = String(Math.floor(1000 + Math.random() * 9000));
    XA.toast('验证码已发送（演示）：' + XA.account.code);
  };
  XA.actions['do-login'] = function () {
    var p = ((XA.$('#loginPhone') || {}).value || '').trim();
    var c = ((XA.$('#loginCode') || {}).value || '').trim();
    if (!/^1\d{10}$/.test(p)) { XA.toast('请输入正确的 11 位手机号'); return; }
    if (!/^\d{4}$/.test(c)) { XA.toast('请输入 4 位验证码'); return; }
    if (!XA.account.code) { XA.toast('请先获取验证码'); return; }
    if (c !== XA.account.code) { XA.toast('验证码不正确，请重新输入'); return; }
    XA.account.loggedIn = true;
    XA.account.phone = p;
    XA.account.nickname = XA.account.nickname || '安星用户';
    XA.account.code = '';
    saveAccount(); renderAccount(); closeLogin();
    XA.toast('登录成功 · 夜行数据已同步');
  };
  XA.actions['skip-login'] = function () { closeLogin(); XA.toast('已跳过登录 · 可随时在“我的”中登录'); };
  XA.actions['logout-account'] = function () {
    XA.account.loggedIn = false; XA.account.phone = ''; XA.account.code = '';
    saveAccount(); renderAccount(); XA.closeModal(); XA.toast('已退出登录');
  };
  XA.actions['account-security'] = function () {
    XA.openSheet('<h3 data-i18n="accountSecurity">账号与安全</h3><div class="sheet-sub" data-i18n="accountSecuritySub">登录方式、设备与紧急访问</div>' +
      '<div class="option-row">' + ic('phone') + '<span><b data-i18n="accountLogin">登录方式</b><small>' +
      (XA.account.loggedIn ? (XA.account.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') + ' · 验证码登录') : '未登录 · 可随时登录') + '</small></span></div>' +
      '<div class="option-row">' + ic('lock') + '<span><b data-i18n="accountDevice">已配对设备</b><small>安星 AR 眼镜 XA-0281 · 本地加密</small></span></div>' +
      '<div class="option-row">' + ic('shield') + '<span><b>紧急联系人</b><small>3 位 · 仅报警或长按求助时通知</small></span></div>' +
      '<button class="primary-btn" data-action="open-login" data-i18n="accountChange">管理</button>');
  };
  XA.actions['switch-account'] = function () {
    XA.openSheet('<h3 data-i18n="switchAccount">切换账号</h3><div class="sheet-sub" data-i18n="switchAccountSub">可使用其他手机号登录</div>' +
      '<div class="option-row">' + ic('users') + '<span><b>' + (XA.account.loggedIn ? XA.account.nickname : '当前未登录') +
      '</b><small>' + (XA.account.loggedIn ? XA.account.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '跳过登录模式') + '</small></span></div>' +
      '<button class="primary-btn" data-action="switch-login" data-i18n="continueSwitch">继续切换</button>');
  };
  XA.actions['switch-login'] = function () {
    XA.account.loggedIn = false; XA.account.code = '';
    saveAccount(); renderAccount();
    XA.closeModal();
    setTimeout(function () {
      openLogin();
      setTimeout(function () { var p = XA.$('#loginPhone'); if (p) p.value = XA.account.phone || ''; }, 80);
    }, 180);
  };
  XA.actions['save-nickname'] = function () {
    var v = ((XA.$('#acctNewName') || {}).value || '').trim();
    if (!v || v.length > 12) { XA.toast('请输入 1–12 个字的昵称'); return; }
    XA.account.nickname = v; saveAccount(); renderAccount(); XA.closeModal(); XA.toast('昵称已更新');
  };

  /* ---------------- 地图 ---------------- */
  function setupMap(el, center, zoom) {
    if (!el || typeof L === 'undefined') return null;
    if (el._xaMap) return el._xaMap;
    var m = L.map(el, { zoomControl: false, attributionControl: false }).setView(center, zoom || 16);
    L.tileLayer(TILE, { subdomains: '1234', maxZoom: 19 }).addTo(m);
    el._xaMap = m;
    setTimeout(function () { m.invalidateSize(); }, 80);
    return m;
  }
  function meIcon() {
    return L.divIcon({
      className: 'xa-me-wrap', iconSize: [40, 40], iconAnchor: [20, 20],
      html: '<div class="xa-me-icon"><svg viewBox="0 0 40 40"><path d="M20 2 L33 34 L20 27 L7 34 Z" fill="' + accent() + '" stroke="#eafffb" stroke-width="2.2" stroke-linejoin="round"/></svg></div>'
    });
  }
  function pointIcon(type) {
    var s = XA.settings.markers[type];
    var shape = s.shape === 'square' ? 'border-radius:3px' : (s.shape === 'diamond' ? 'border-radius:2px;transform:rotate(45deg)' : 'border-radius:50%');
    return L.divIcon({
      className: 'xa-point-wrap', iconSize: [14, 14], iconAnchor: [7, 7],
      html: '<div class="xa-point" style="background:' + s.color + ';box-shadow:0 0 ' + s.glow + 'px ' + s.color + ';' + shape + '"></div>'
    });
  }
  function addMeLayers(m, center) {
    if (!m) return;
    var c = center || gcj();
    if (!m._xaMe) {
      m._xaMe = L.marker(c, { icon: meIcon() }).addTo(m);
      m._xaRadar = L.circle(c, { radius: 50, color: accent(), weight: 1.2, opacity: .55, fillColor: accent(), fillOpacity: .07, interactive: false }).addTo(m);
      m._xaSweep = L.marker(c, {
        icon: L.divIcon({ className: 'xa-sweep-wrap', iconSize: [110, 110], iconAnchor: [55, 55], html: '<div class="xa-sweep"></div>' }),
        interactive: false
      }).addTo(m);
    } else {
      m._xaMe.setLatLng(c); m._xaRadar.setLatLng(c); m._xaSweep.setLatLng(c);
    }
    if (!XA.settings.radar) {
      if (m._xaRadar) m._xaRadar.setStyle({ opacity: 0, fillOpacity: 0 });
      if (m._xaSweep) m._xaSweep.setOpacity(0);
    }
  }
  function addPoints(m, center) {
    if (!m) return;
    if (m._xaPoints) m._xaPoints.forEach(function (p) { m.removeLayer(p); });
    m._xaPoints = [];
    var c = center || gcj();
    POINTS.forEach(function (p) {
      var marker = L.marker([c[0] + p.dLat, c[1] + p.dLng], { icon: pointIcon(p.type), interactive: false }).addTo(m);
      marker._xaType = p.type;
      m._xaPoints.push(marker);
    });
  }
  function refreshMapLayers() {
    [XA.$('.home-map'), XA.$('.route-map'), XA.$('.nav-map')].forEach(function (el) {
      var m = el && el._xaMap;
      if (!m) return;
      if (m._xaMe) { m.removeLayer(m._xaMe); m._xaMe = null; }
      if (m._xaRadar) { m.removeLayer(m._xaRadar); m._xaRadar = null; }
      if (m._xaSweep) { m.removeLayer(m._xaSweep); m._xaSweep = null; }
      addMeLayers(m, gcj());
      addPoints(m, gcj());
    });
  }
  function initHomeMap() {
    var el = XA.$('.home-map');
    if (!el) return;
    var m = setupMap(el, gcj(), 16);
    if (!m) return;
    addMeLayers(m, gcj()); addPoints(m, gcj());
    el.classList.add('map-ready');
  }
  function initRouteMap() {
    var el = XA.$('.route-map');
    if (!el) return;
    var m = setupMap(el, gcj(), 15);
    if (!m) return;
    addMeLayers(m, gcj());
    el.classList.add('map-ready');
    if (curRoutes.length) drawRoutes(m);
  }
  function initNavMap() {
    var el = XA.$('.nav-map');
    if (!el) return;
    var m = setupMap(el, gcj(), 17);
    if (!m) return;
    addMeLayers(m, gcj());
    el.classList.add('map-ready');
    if (curRoutes.length) drawRoutes(m, true);
  }
  function updatePosition(lat, lng, acc) {
    geoStart = [lat, lng];
    var c = wgs84ToGcj02(lat, lng);
    [XA.$('.home-map'), XA.$('.nav-map')].forEach(function (el) {
      var m = el && el._xaMap;
      if (!m) return;
      if (XA.settings.follow) m.setView(c, m.getZoom(), { animate: true, duration: .6 });
      addMeLayers(m, c);
    });
    if (XA.settings.acc) {
      var tip = XA.$('.nav-map #turnSub');
      if (tip) tip.textContent = '导航中 · 定位精度 ±' + Math.round(acc || 8) + 'm';
    }
    checkRisk(c);
  }
  function locate(silent) {
    if (!navigator.geolocation) {
      if (!silent) XA.toast('当前设备不支持定位，已使用演示位置');
      return;
    }
    navigator.geolocation.getCurrentPosition(function (p) {
      geoReady = true;
      updatePosition(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
      if (!silent) XA.toast('已获取实时位置 · 精度 ±' + Math.round(p.coords.accuracy) + 'm');
    }, function () {
      geoReady = false;
      if (!silent) XA.toast('定位未开启，已使用演示位置');
    }, { enableHighAccuracy: true, timeout: 12000 });
  }
  function startWatch() {
    if (!navigator.geolocation || navWatch) return;
    navWatch = navigator.geolocation.watchPosition(function (p) {
      updatePosition(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
    }, function () {}, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
  }
  function stopWatch() {
    if (navWatch) { navigator.geolocation.clearWatch(navWatch); navWatch = null; }
  }
  var warned = false;
  function checkRisk(c) {
    if (!XA.settings.voice || warned || !('speechSynthesis' in window)) return;
    var riskPoints = POINTS.filter(function (p) { return p.type === 'risk'; }).map(function (p) {
      return wgs84ToGcj02(DEFAULT.lat + p.dLat, DEFAULT.lng + p.dLng);
    });
    var hit = riskPoints.some(function (r) { return Math.abs(c[0] - r[0]) < 0.00035 && Math.abs(c[1] - r[1]) < 0.00035; });
    if (hit) {
      warned = true;
      var u = new SpeechSynthesisUtterance('前方照明不足，建议走主干道');
      u.lang = 'zh-CN'; u.rate = 1;
      speechSynthesis.speak(u);
      XA.toast('前方照明不足，建议走主干道');
    }
  }
  window.addEventListener('deviceorientation', function (e) {
    var h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if (e.alpha != null) h = (360 - e.alpha) % 360;
    if (h == null) return;
    XA.$$('.xa-me-icon').forEach(function (el) { el.style.setProperty('--heading', h + 'deg'); });
  });

  /* ---------------- 路线规划 ---------------- */
  function assessRoute(r, idx) {
    var distKm = r.distance / 1000, sec = r.duration;
    var coords = (r.geometry && r.geometry.coordinates || []).map(function (c) { return [c[1], c[0]]; });
    var turns = 0;
    for (var i = 2; i < coords.length; i++) {
      var a = coords[i - 2], b = coords[i - 1], c = coords[i];
      var v1 = [b[0] - a[0], b[1] - a[1]], v2 = [c[0] - b[0], c[1] - b[1]];
      if (Math.abs(v1[0] * v2[1] - v1[1] * v2[0]) > 0.00002) turns++;
    }
    var straight = turns / Math.max(distKm, 0.1);
    var safety = Math.max(30, Math.min(96, Math.round(88 - straight * 6 - (idx === 0 ? 4 : 0) + (distKm > 3 ? 3 : 0))));
    return {
      coords: coords, distance: r.distance, seconds: sec, safety: safety,
      time: Math.ceil(sec / 60), dist: distKm.toFixed(1),
      lamp: Math.min(100, Math.max(40, Math.round(safety + 6 - (idx === 1 ? 12 : 0) - (idx === 2 ? 28 : 0)))),
      cam: Math.max(1, Math.round(safety / 12)),
      event: Math.max(0, Math.round((100 - safety) / 14))
    };
  }
  function syntheticRoutes(dest) {
    var s = geoStart, d = [dest.lat, dest.lng];
    var mid = function (t, off) { return [s[0] + (d[0] - s[0]) * t + off, s[1] + (d[1] - s[1]) * t - off]; };
    var base = [[s[0], s[1]], mid(.3, .0012), mid(.6, -.0008), [d[0], d[1]]];
    return [
      { coords: base, distance: 1200, seconds: 1080, safety: 92, time: 18, dist: '1.2', lamp: 86, cam: 12, event: 2 },
      { coords: [base[0], mid(.3, -.0016), mid(.65, .0014), base[3]], distance: 1400, seconds: 1320, safety: 78, time: 22, dist: '1.4', lamp: 61, cam: 8, event: 4 },
      { coords: [base[0], mid(.4, -.0026), mid(.7, .0022), base[3]], distance: 1100, seconds: 900, safety: 64, time: 15, dist: '1.1', lamp: 43, cam: 5, event: 7 }
    ];
  }
  function drawRoutes(m, onlySelected) {
    if (!m) return;
    if (m._xaRoutes) m._xaRoutes.forEach(function (l) { m.removeLayer(l); });
    m._xaRoutes = [];
    var colors = [accent(), '#ffc46b', '#93a0b5'];
    var all = [];
    curRoutes.forEach(function (r, i) {
      if (onlySelected && i !== (XA.route === 'A' ? 0 : XA.route === 'B' ? 1 : 2)) return;
      var gcj = r.coords.map(function (p) { return wgs84ToGcj02(p[0], p[1]); });
      var layer = L.polyline(gcj, { color: colors[i], weight: 5, opacity: .85 }).addTo(m);
      layer._xaIndex = i;
      m._xaRoutes.push(layer);
      all = all.concat(gcj);
    });
    if (destPoint && !onlySelected) {
      var dp = wgs84ToGcj02(destPoint.lat, destPoint.lng);
      m._xaRoutes.push(L.circleMarker(dp, { radius: 7, color: '#ffc46b', fillColor: '#ffc46b', fillOpacity: .9 }).addTo(m));
    }
    if (all.length) m.fitBounds(L.latLngBounds(all).pad(.18));
    highlightRoute();
  }
  function highlightRoute() {
    var idx = XA.route === 'A' ? 0 : XA.route === 'B' ? 1 : 2;
    [XA.$('.route-map'), XA.$('.nav-map')].forEach(function (el) {
      var m = el && el._xaMap;
      if (!m || !m._xaRoutes) return;
      m._xaRoutes.forEach(function (l) {
        if (!l.setStyle || l._xaIndex === undefined) return;
        var on = l._xaIndex === idx;
        l.setStyle({ weight: on ? 7 : 3, opacity: on ? 1 : .35 });
      });
    });
  }
  function updateRouteCards() {
    var letters = ['A', 'B', 'C'];
    curRoutes.forEach(function (r, i) {
      var card = XA.$('.route-card[data-route="' + letters[i] + '"]');
      if (!card) return;
      var meta = card.querySelector('.route-meta');
      if (meta) meta.innerHTML = ic('clock') + r.time + ' 分钟 <i>·</i> ' + r.dist + ' km <i>·</i> 步行';
      var tags = card.querySelector('.route-tags');
      if (tags) tags.innerHTML = '<span class="tag mint">路灯 ' + r.lamp + '%</span><span class="tag">监控 ' + r.cam + '</span><span class="tag">事件 ' + r.event + '</span>';
      var ring = card.querySelector('.score-ring');
      if (ring) {
        ring.querySelector('span').textContent = r.safety;
        ring.style.setProperty('--p', r.safety);
        ring.style.setProperty('--ring', i === 0 ? '#7ff0d4' : i === 1 ? '#ffc46b' : '#93a0b5');
      }
    });
    var eta = XA.$('#routeEta');
    if (eta && curRoutes[0]) eta.textContent = '预计 ' + curRoutes[0].time + ' 分钟';
    var rm = XA.$('.rm-time');
    if (rm && curRoutes[0]) rm.textContent = curRoutes[0].dist + ' km · ' + curRoutes[0].time + ' min';
  }
  function planRoutes(name) {
    var dest = destPoint || DESTS[name] || DESTS['滨江花园'];
    destPoint = dest;
    var start = geoStart;
    var url = OSRM + 'driving/' + start[1] + ',' + start[0] + ';' + dest.lng + ',' + dest.lat +
      '?overview=full&geometries=geojson&alternatives=true&steps=false';
    XA.toast('正在规划夜行安全路线…');
    return fetch(url).then(function (res) { return res.json(); }).then(function (data) {
      if (data.code !== 'Ok' || !data.routes || !data.routes.length) throw new Error('no route');
      curRoutes = data.routes.slice(0, 3).map(assessRoute);
      updateRouteCards(); syncPanel();
      var eh = XA.$('.home-map'); if (eh && eh._xaMap) drawRoutes(eh._xaMap);
      var em = XA.$('.route-map'); if (em && em._xaMap) drawRoutes(em._xaMap);
      var en = XA.$('.nav-map'); if (en && en._xaMap) drawRoutes(en._xaMap, true);
      XA.toast('已生成 3 条真实路线 · 按安全优先排序');
    }).catch(function () {
      curRoutes = syntheticRoutes(dest);
      updateRouteCards(); syncPanel();
      var eh = XA.$('.home-map'); if (eh && eh._xaMap) drawRoutes(eh._xaMap);
      var em = XA.$('.route-map'); if (em && em._xaMap) drawRoutes(em._xaMap);
      XA.toast('路线服务暂不可用，已切换到演示路线');
    });
  }

  /* ---------------- 搜索 ---------------- */
  var searchTimer = null;
  var HISTORY_KEY = 'xa_search_history', HISTORY_MAX = 6;
  XA.searchHistory = [];
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function loadSearchHistory() {
    try {
      var h = JSON.parse(localStorage.getItem(HISTORY_KEY));
      if (Array.isArray(h)) XA.searchHistory = h.filter(function (x) { return typeof x === 'string'; }).slice(0, HISTORY_MAX);
    } catch (e) {}
  }
  function saveSearchHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(XA.searchHistory)); } catch (e) {}
  }
  function addSearchHistory(name) {
    var n = String(name || '').trim();
    if (!n) return;
    XA.searchHistory = XA.searchHistory.filter(function (x) { return x !== n; });
    XA.searchHistory.unshift(n);
    XA.searchHistory = XA.searchHistory.slice(0, HISTORY_MAX);
    saveSearchHistory();
  }
  function removeSearchHistory(index) {
    XA.searchHistory.splice(index, 1);
    saveSearchHistory();
  }
  function distanceText(p) {
    var c = gcj(), rad = Math.PI / 180;
    var dLat = (p.lat - c[0]) * rad, dLng = (p.lng - c[1]) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(c[0] * rad) * Math.cos(p.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var m = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(1) + ' km';
  }
  function goToPlace(name, point) {
    destPoint = point || DESTS[name] || { name: name, lat: DEFAULT.lat, lng: DEFAULT.lng };
    XA.setDestination(name);
    XA._lastPlanned = name;
    addSearchHistory(name);
    XA.closeModal();
    showRoutePanel();
    planRoutes(name);
    XA.toast('已选择 ' + name + ' · 正在规划夜间安全路线');
  }
  function historyHtml() {
    if (!XA.searchHistory.length) {
      return '<div class="history-empty">' + ic('clock') + '<span>' + XA.t('historyEmpty') + '</span></div>';
    }
    return '<div class="history-grid">' + XA.searchHistory.map(function (name, i) {
      return '<span class="history-chip"><button data-history="' + i + '">' + ic('clock') + esc(name) + '</button>' +
        '<button class="history-remove" data-history-remove="' + i + '" aria-label="删除">' + ic('close') + '</button></span>';
    }).join('') + '</div>';
  }
  function recoHtml() {
    function card(p, i) {
      return '<button class="reco-card' + (p.safe ? ' safe' : '') + '" data-reco="' + i + '">' +
        '<span class="reco-ico">' + ic(p.icon) + '</span>' +
        '<span class="reco-copy"><b>' + esc(p.name) + '</b><small>' + esc(p.cat) + '</small><em>' + distanceText(p) + ' · 预计 4–12 分钟</em></span>' +
        '<span class="reco-meta"><b>' + esc(p.score) + '</b><small>' + (p.safe ? '安全优先' : '高评分') + '</small></span>' +
        '<span class="reco-go">' + ic('chevron') + '</span></button>';
    }
    return '<div class="reco-group-label">' + ic('shield') + XA.t('nearbySafe') + '</div>' +
      RECOMMENDS.map(function (p, i) { return p.safe ? card(p, i) : ''; }).join('') +
      '<div class="reco-group-label">' + ic('pin') + XA.t('nearbyTop') + '</div>' +
      RECOMMENDS.map(function (p, i) { return p.safe ? '' : card(p, i); }).join('');
  }
  XA.actions['clear-history'] = function () {
    XA.searchHistory = []; saveSearchHistory(); XA.actions.search(); XA.toast('历史搜索已清空');
  };
  XA.actions['show-recommend'] = function () {
    var sh = XA.$('#modalLayer .sheet');
    if (sh) sh.classList.add('raised');
  };
  function searchPlaces(q) {
    var box = XA.$('#xaPlaceResults');
    if (!box) return;
    box.innerHTML = '<div style="font-size:10px;color:var(--dim);padding:10px">正在搜索附近地点…</div>';
    var url = PHOTON + '?q=' + encodeURIComponent(q) + '&limit=8';
    var c = gcj();
    url += '&lat=' + c[0] + '&lon=' + c[1];
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var list = (data.features || []).map(function (f) {
        var p = f.properties || {};
        return { name: p.name || p.street || '未命名地点', address: [p.city, p.district, p.street].filter(Boolean).join(''), lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
      });
      if (!list.length) { box.innerHTML = '<div style="font-size:10px;color:var(--dim);padding:10px">没有找到相关地点</div>'; return; }
      box.innerHTML = list.map(function (p, i) {
        return '<button class="option-row" data-photon="' + i + '">' + ic('pin') + '<span><b>' + p.name + '</b><small>' + p.address + '</small></span></button>';
      }).join('');
      XA._xaPlaces = list;
    }).catch(function () { box.innerHTML = '<div style="font-size:10px;color:var(--dim);padding:10px">搜索失败，请检查网络</div>'; });
  }
  XA.actions.search = function () {
    var presets = Object.keys(DESTS);
    XA.openSheet('<h3 data-i18n="search">搜索目的地</h3><div class="sheet-sub" data-i18n="searchSheetSub">输入关键词搜索真实地点，或使用下方地址</div>' +
      '<input id="xaSearchInput" class="sheet-input" style="min-height:auto;height:44px" placeholder="输入地点名称，如 西湖" autocomplete="off">' +
      '<div id="xaPlaceResults" class="search-results"></div>' +
      '<div class="fav-hint">' + ic('pin') + '<span><b data-i18n="commonAddresses">常用地址</b><small data-i18n="commonHint">点击即可快速规划夜间安全路线</small></span></div>' +
      '<div id="xaPreset" class="seg">' + presets.map(function (n) {
        return '<button data-xa-dest="' + esc(n) + '">' + esc(n) + '</button>';
      }).join('') + '</div>' +
      '<div class="search-section-title"><b data-i18n="historySearch">历史搜索</b><small><span data-i18n="historyHint">最多保留 6 条最近搜索</span><button data-action="clear-history" data-i18n="clearHistory">清空</button></small></div>' +
      historyHtml() +
      '<button class="swipe-tip" data-action="show-recommend">' + ic('back') + '<span data-i18n="swipeUpTip">上滑查看附近推荐地点</span></button>' +
      '<div class="reco-section"><div class="search-section-title reco-title"><b data-i18n="recommendPlaces">推荐地点</b><small data-i18n="recommendHint">附近安全且高评分的去处</small></div>' + recoHtml() + '</div>');
    var sh = XA.$('#modalLayer .sheet');
    if (sh) sh.classList.add('search-sheet');
    var input = XA.$('#xaSearchInput');
    if (input) {
      input.addEventListener('input', function () {
        clearTimeout(searchTimer);
        var q = input.value.trim();
        if (q.length < 2) { XA.$('#xaPlaceResults').innerHTML = ''; return; }
        searchTimer = setTimeout(function () { searchPlaces(q); }, 450);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var q = input.value.trim();
        if (q.length < 2) return;
        clearTimeout(searchTimer);
        addSearchHistory(q);
        searchPlaces(q);
      });
      setTimeout(function () { input.focus(); }, 260);
    }
  };

  /* ---------------- SOS 倒计时（使用设置值） ---------------- */
  XA.showSosConfirm = function () {
    if (XA.alarm) return;
    var cd = XA.settings.sosCd || 3;
    var box = document.createElement('div');
    box.className = 'sos-confirm';
    box.innerHTML = '<p>已准备报警 · ' + cd + ' 秒后发出</p><h3>长按取消</h3>' +
      '<div class="confirm-ring"><button class="confirm-btn">SOS<span class="hold-fill"></span></button></div>' +
      '<button class="cancel-hold">长按 2 秒取消报警<span class="hold-fill"></span></button>';
    XA.$('#phone').appendChild(box);
    requestAnimationFrame(function () { box.classList.add('open'); });
    var count = cd, label = box.querySelector('p');
    var tick = setInterval(function () {
      count--;
      label.textContent = count > 0 ? '已准备报警 · ' + count + ' 秒后发出' : '正在发出报警…';
    }, 1000);
    var fire = function () {
      clearInterval(tick); clearTimeout(XA._sosTimer);
      box.classList.remove('open');
      setTimeout(function () { box.remove(); }, 250);
      XA.fireAlarm();
    };
    XA._sosTimer = setTimeout(fire, cd * 1000);
    XA.hold(box.querySelector('.cancel-hold'), 2000, function () {
      clearInterval(tick); clearTimeout(XA._sosTimer);
      box.classList.remove('open');
      setTimeout(function () { box.remove(); }, 250);
      XA.toast('报警已取消 · 未发出求助');
    });
    box.querySelector('.confirm-btn').addEventListener('click', fire);
  };

  /* ---------------- 天气 ---------------- */
  var lastWeather = null;
  function weatherLabel(code) {
    var en = XA.lang === 'en';
    if (code === 0) return en ? 'Clear' : '晴';
    if (code === 1 || code === 2) return en ? 'Partly cloudy' : '多云';
    if (code === 3) return en ? 'Overcast' : '阴';
    if (code >= 45 && code <= 48) return en ? 'Foggy' : '雾';
    if (code >= 51 && code <= 67) return en ? 'Rainy' : '雨';
    if (code >= 71 && code <= 77) return en ? 'Snowy' : '雪';
    if (code >= 80 && code <= 82) return en ? 'Showers' : '阵雨';
    if (code >= 95) return en ? 'Thunderstorm' : '雷阵雨';
    return en ? 'Cloudy' : '多云';
  }
  function paintWeather(temp, text) {
    lastWeather = { temp: temp, text: text };
    XA.weatherText = Math.round(temp) + '° ' + text;
    var el = XA.$('#weatherText');
    if (el) el.textContent = XA.weatherText;
  }
  function updateWeather() {
    if (lastWeather) { paintWeather(lastWeather.temp, lastWeather.text); return; }
    var c = gcj();
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c[0] + '&longitude=' + c[1] + '&current=temperature_2m,weather_code';
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var cur = d && d.current;
      if (!cur || typeof cur.temperature_2m !== 'number') throw new Error('no weather');
      paintWeather(cur.temperature_2m, weatherLabel(cur.weather_code));
    }).catch(function () {
      var en = XA.lang === 'en';
      paintWeather(22, en ? 'Cloudy' : '多云');
    });
  }
  XA.updateWeather = updateWeather;
  XA.clearWeather = function () { lastWeather = null; };

  /* ---------------- 加载流程 ---------------- */
  XA.playSplash = function () {
    var splash = XA.$('#splash'), status = XA.$('#splashStatus');
    if (!splash) return;
    var stages = [
      [0, '正在连接夜间守护…'],
      [450, '正在获取实时位置…'],
      [1100, '正在校准路灯与事件数据…'],
      [1750, 'AI 安星正在守护…']
    ];
    stages.forEach(function (s) { setTimeout(function () { if (status) status.textContent = s[1]; }, s[0]); });
    initHomeMap();
    updateWeather();
    setTimeout(function () { locate(true); }, 500);
    var gone = false;
    function dismiss() {
      if (gone) return;
      gone = true;
      splash.classList.add('done');
      setTimeout(function () { if (splash.parentNode) splash.remove(); }, 650);
      setTimeout(maybeShowLogin, 200);
    }
    setTimeout(dismiss, 2200);
    setTimeout(dismiss, 4000);
  };

  /* ---------------- 挂载 ---------------- */
  var origGo = XA.go;
  XA.go = function (screen, noHistory) {
    origGo(screen, noHistory);
    if (screen === 'home') {
      if (!noHistory) resetHome();
    }
    if (screen === 'route') setTimeout(function () {
      initRouteMap();
      if (!curRoutes.length || XA._lastPlanned !== XA.destination) {
        XA._lastPlanned = XA.destination;
        planRoutes(XA.destination);
      }
    }, 60);
  };
  var origSelect = XA.selectRoute;
  XA.selectRoute = function (l) { origSelect(l); highlightRoute(); };
  var origStart = XA.actions['start-nav'];
  XA.actions['start-nav'] = function () {
    origStart();
    setHomeState('nav');
    setTimeout(function () {
      initNavMap();
      startWatch();
      updateWeather();
      var nav = XA.$('.nav-session');
      if (nav) {
        nav.classList.add('pure-nav');
        if (!nav.querySelector('.nav-sos')) nav.insertAdjacentHTML('beforeend', '<button class="nav-sos" data-action="sos">SOS</button>');
        var turn = nav.querySelector('.nav-turn');
        if (turn && !turn.querySelector('.nav-end')) turn.insertAdjacentHTML('beforeend', '<button class="nav-end" data-action="end-nav">结束</button>');
      }
      if (curRoutes.length) {
        var idx = XA.route === 'A' ? 0 : XA.route === 'B' ? 1 : 2;
        var r = curRoutes[idx];
        var title = XA.$('#turnTitle');
        if (title) title.textContent = '沿安全路线 ' + XA.route + ' 前往' + XA.destination;
        var sub = XA.$('#turnSub');
        if (sub) sub.textContent = r.lamp + '% 路灯覆盖 · 预计 ' + r.time + ' 分钟';
        var rem = XA.$('#navRemain'), dist = XA.$('#navDist'), score = XA.$('.nav-stats div:last-child b');
        if (rem) rem.textContent = r.time;
        if (dist) dist.textContent = r.dist;
        if (score) score.textContent = r.safety;
      }
    }, 90);
  };
  var origEnd = XA.actions['end-nav'];
  XA.actions['end-nav'] = function () { stopWatch(); origEnd(); resetHome(); };
  var origFire = XA.fireAlarm;
  XA.fireAlarm = function () { stopWatch(); origFire(); };
  XA.actions.layer = function () {
    var p = XA.$('#mapModePop'), r = XA.$('#riskPopover');
    if (r) r.classList.remove('open');
    if (p) p.classList.toggle('open');
  };
  XA.actions['close-map-mode'] = function () { var p = XA.$('#mapModePop'); if (p) p.classList.remove('open'); };

  XA.init();
  loadSettings();
  loadAccount();
  loadPrivacy();
  loadSearchHistory();
  var savedLang = 'zh';
  try { savedLang = localStorage.getItem('xa_language') || 'zh'; } catch (e) {}
  XA.setLanguage(savedLang);
  buildLogin();
  var profileCard = XA.$('[data-screen="profile"] .profile-card');
  if (profileCard) profileCard.addEventListener('click', function () { XA.actions['open-login'](); });
  document.addEventListener('click', function (e) {
    var theme = e.target.closest('[data-theme-set]');
    if (theme) { XA.settings.theme = theme.dataset.themeSet; saveSettings(); applyTheme(); openSettings(); XA.toast('主题色已更新'); return; }
    var cd = e.target.closest('[data-soscd]');
    if (cd) { XA.settings.sosCd = parseInt(cd.dataset.soscd, 10); saveSettings(); openSettings(); XA.toast('SOS 倒计时已设为 ' + XA.settings.sosCd + ' 秒'); return; }
    var color = e.target.closest('[data-color]');
    if (color) { XA.settings.markers[color.dataset.color].color = color.dataset.value; saveSettings(); refreshMapLayers(); openSettings(); return; }
    var shape = e.target.closest('[data-shape]');
    if (shape) { XA.settings.markers[shape.dataset.shape].shape = shape.dataset.value; saveSettings(); refreshMapLayers(); openSettings(); return; }
    var glow = e.target.closest('[data-glow]');
    if (glow) { XA.settings.markers[glow.dataset.glow].glow = parseInt(glow.dataset.value, 10); saveSettings(); refreshMapLayers(); openSettings(); return; }
    var tg = e.target.closest('[data-toggle]');
    if (tg) {
      var k = tg.dataset.toggle;
      XA.settings[k] = !XA.settings[k];
      tg.classList.toggle('on', XA.settings[k]);
      saveSettings(); refreshMapLayers();
      XA.toast(({ voice: '危险语音提醒', follow: '位置跟随', radar: '雷达扫描', acc: '精度显示' })[k] + (XA.settings[k] ? '已开启' : '已关闭'));
      return;
    }
    var histRemove = e.target.closest('[data-history-remove]');
    if (histRemove) {
      e.stopPropagation();
      removeSearchHistory(parseInt(histRemove.dataset.historyRemove, 10));
      XA.actions.search();
      return;
    }
    var hist = e.target.closest('[data-history]');
    if (hist) { goToPlace(XA.searchHistory[parseInt(hist.dataset.history, 10)]); return; }
    var reco = e.target.closest('[data-reco]');
    if (reco) {
      var rp = RECOMMENDS[parseInt(reco.dataset.reco, 10)];
      if (rp) goToPlace(rp.name, rp);
      return;
    }
    var dest = e.target.closest('[data-xa-dest]');
    if (dest) { goToPlace(dest.dataset.xaDest, DESTS[dest.dataset.xaDest]); return; }
    var ph = e.target.closest('[data-photon]');
    if (ph && XA._xaPlaces) {
      var p = XA._xaPlaces[parseInt(ph.dataset.photon, 10)];
      goToPlace(p.name, p);
      return;
    }
    var mm = e.target.closest('[data-map-mode]');
    if (mm) {
      mapMode = mm.dataset.mapMode;
      XA.$$('[data-map-mode]').forEach(function (b) { b.classList.toggle('on', b === mm); });
      applyMapMode(); XA.toast('地图视角已切换为 ' + mapMode.toUpperCase()); return;
    }
    var bm = e.target.closest('[data-base-map]');
    if (bm) {
      baseMap = bm.dataset.baseMap;
      XA.$$('[data-base-map]').forEach(function (b) { b.classList.toggle('on', b === bm); });
      applyMapMode(); XA.toast(baseMap === 'satellite' ? '已切换卫星地图' : '已切换标准地图'); return;
    }
    var menuItem = e.target.closest('[data-menu="appearance"]');
    if (menuItem) { openSettings(); return; }
    if (!e.target.closest('#riskPopover') && !e.target.closest('[data-action="risk-popover"]')) {
      var rp = XA.$('#riskPopover'); if (rp) rp.classList.remove('open');
    }
    if (!e.target.closest('#mapModePop') && !e.target.closest('[data-action="layer"]')) {
      var mp = XA.$('#mapModePop'); if (mp) mp.classList.remove('open');
    }
  });

  /* 面板手势：上滑展开 / 下滑关闭 */
  var panel = XA.$('#routePanel');
  if (panel) {
    var py = 0, pd = 0, dragging = false;
    panel.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      py = e.clientY; pd = 0; dragging = true;
      panel.style.transition = 'none';
    });
    panel.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      pd = e.clientY - py;
      panel.style.transform = 'translateY(' + Math.max(0, pd) + 'px)';
    });
    function endPanel() {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      panel.style.transform = '';
      if (pd > 90) resetHome();
      else if (pd < -50) panel.classList.add('expanded');
    }
    panel.addEventListener('pointerup', endPanel);
    panel.addEventListener('pointercancel', endPanel);
  }
  /* 左边缘右滑呼出功能抽屉 */
  var sx = 0, sy = 0, tracking = false;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    sx = e.clientX; sy = e.clientY; tracking = sx < 24;
  });
  document.addEventListener('pointerup', function (e) {
    if (!tracking) return;
    tracking = false;
    if (e.clientX - sx > 80 && Math.abs(e.clientY - sy) < 60) XA.actions['open-drawer']();
  });
})();
