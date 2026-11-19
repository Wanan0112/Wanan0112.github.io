window.XA_SCREENS = window.XA_SCREENS || {};
window.ic = function (name, cls) {
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '"><use href="#i-' + name + '"/></svg>';
};

XA_SCREENS.home = `
<section class="screen active state-default" data-screen="home">
  <div class="home-map">
    <div class="map-blocks">
      <span class="blk b1"></span><span class="blk b2"></span><span class="blk b3"></span><span class="blk b4"></span>
      <span class="park">西溪公园</span><span class="street st1">文昌巷</span><span class="street st2">滨江路</span>
    </div>
    <svg class="map-lines" viewBox="0 0 390 470" preserveAspectRatio="none">
      <path class="road-base" d="M-20 330 C80 300 130 250 190 205 S310 120 420 70"/>
      <path class="road-base thin" d="M-20 200 C90 215 160 240 230 300 S330 370 420 390"/>
      <path class="road-base thin" d="M60 -10 C100 90 130 180 100 290 S80 420 60 490"/>
    </svg>
    <div class="map-lights"></div>
    <span class="map-node n1"></span><span class="map-node n2"></span><span class="map-node n3"></span>
  </div>

  <button class="home-search" data-action="search">
    ${ic('search')}<span data-destination data-i18n="searchHint">搜索目的地、公交站</span>${ic('mic','mic')}
  </button>

  <div class="home-floats">
    <button class="float-btn" data-action="layer" aria-label="图层">${ic('layers')}</button>
    <button class="float-btn" data-action="risk-popover" aria-label="安全警告">${ic('warning')}</button>
    <button class="float-btn" data-action="recenter" aria-label="我的定位">${ic('pin')}</button>
  </div>

  <div class="risk-popover" id="riskPopover">
    <div class="rp-head"><b>附近夜行风险</b><button data-action="close-risk">${ic('close')}</button></div>
    <div class="risk-item"><span class="risk-dot amber"></span><span><b>文昌巷 300m 路灯检修</b><small>2 分钟前 · 建议绕行滨江路</small></span></div>
    <div class="risk-item"><span class="risk-dot coral"></span><span><b>文三路近 30 天事件 2 起</b><small>照明偏弱 · 建议走主干道</small></span></div>
    <div class="risk-item"><span class="risk-dot amber"></span><span><b>西溪公园入口照明不足</b><small>今晚 21:12 用户上报</small></span></div>
  </div>

  <div class="map-mode-pop" id="mapModePop">
    <div class="rp-head"><b data-i18n="mapSettings">地图设置</b><span class="rp-head-actions"><button class="map-cancel" data-action="close-map-mode" data-i18n="cancel">取消</button><button data-action="close-map-mode" aria-label="关闭">${ic('close')}</button></span></div>
    <small data-i18n="view">视角</small><div class="seg"><button data-map-mode="2d" class="on">2D</button><button data-map-mode="3d">3D</button></div>
    <small data-i18n="basemap">底图</small><div class="seg"><button data-base-map="standard" class="on" data-i18n="standard">标准</button><button data-base-map="satellite" data-i18n="satellite">卫星</button></div>
  </div>

  <div class="route-panel" id="routePanel">
    <div class="rp-handle"></div>
    <div class="rp-dest"><span class="dest-arrow">${ic('navigation')}</span><span><small>目的地</small><b><span data-destination>滨江花园</span> · 东南门</b></span><button data-action="search">修改</button></div>
    <div class="rp-stats">
      <div><b id="rpScore">92</b><small>安全系数</small></div>
      <div><b id="rpLamp">86%</b><small>路灯覆盖</small></div>
      <div><b id="rpCam">12 处</b><small>监控覆盖</small></div>
    </div>
    <div class="rp-tip">${ic('check')}<span>本路线避开暗巷，比常规路线多 3 分钟</span></div>
    <div class="rp-ai"><span><b>AI 全程陪伴</b><small id="aiStateText">开启：语音陪伴 / 实时播报路况风险</small></span><button class="switch on" id="aiSwitch" data-action="ai-toggle"><i></i></button></div>
    <div class="rp-actions">
      <button class="primary-btn" data-action="start-nav">${ic('navigation')}开始安全导航</button>
      <button class="sos-small" data-action="sos">SOS</button>
    </div>
  </div>

  <div class="side-drawer" id="sideDrawer">
    <div class="drawer-head"><b>小安 · 夜行安全</b><small>夜间守护</small><button data-action="close-drawer">${ic('close')}</button></div>
    <button data-tab="home">${ic('navigation')}安全导航</button>
    <button data-action="open-route">${ic('route')}路线分析</button>
    <button data-tab="entertainment">${ic('music')}夜间娱乐</button>
    <button data-tab="community">${ic('users')}社区互助</button>
    <button data-action="open-ar">${ic('glasses')}AR 眼镜</button>
    <button data-tab="profile">${ic('user')}我的</button>
  </div>
</section>`;

XA_SCREENS.route = `
<section class="screen" data-screen="route">
  <header class="page-head">
    <button class="icon-btn" data-back="home">${ic('back')}</button>
    <div class="head-title"><h2 data-i18n="routeAnalysis">路线安全分析</h2><small data-i18n="routeSub">已按安全优先排序</small></div>
    <button class="icon-btn" data-action="share-trip">${ic('share')}</button>
  </header>
  <div class="route-dest">${ic('route')}<span>到 <b data-destination>滨江花园</b> · 东南门</span><span class="sep">|</span><span>3 条路线</span></div>

  <div class="route-map glass">
    <div class="rm-top"><span class="ai-sort">${ic('navigation')} AI 安全排序</span><span class="rm-time">1.2 km · 18 min</span></div>
    <svg viewBox="0 0 350 170" class="route-mapsvg">
      <path class="rm-road" d="M-10 145 C90 130 140 80 210 55 S300 30 365 20"/>
      <path class="rm-road" d="M-10 100 C80 110 160 120 230 145 S310 165 365 170"/>
      <path class="rm-line" data-line="A" d="M14 142 C80 128 132 84 198 58 S280 34 336 26"/>
      <path class="rm-line" data-line="B" d="M14 142 C90 140 150 120 210 102 S285 72 336 26"/>
      <path class="rm-line" data-line="C" d="M14 142 C70 160 140 160 200 146 S290 90 336 26"/>
      <g class="rm-marker active" data-route="A"><circle cx="198" cy="58" r="10"/><text x="198" y="62">A</text></g>
      <g class="rm-marker" data-route="B"><circle cx="220" cy="98" r="10"/><text x="220" y="102">B</text></g>
      <g class="rm-marker" data-route="C"><circle cx="258" cy="120" r="10"/><text x="258" y="124">C</text></g>
      <circle class="rm-start" cx="14" cy="142" r="4"/>
    </svg>
    <span class="rm-pin">${ic('pin')}</span>
    <div class="rm-bottom"><span class="rec-chip"><i></i>推荐路线 A</span><span class="lamp-chip">${ic('warning')}路灯 86%</span></div>
  </div>

  <button class="advice-card" data-action="ai-suggest">
    <span class="ai-face small">☺</span>
    <span><b>小安建议</b> A 线多 3 分钟，换全程有灯与 <em>+28</em> 安全分</span>
    <small>21:35 更新</small>
  </button>

  <div class="section-title"><h3>推荐路线</h3><small>安全分实时计算</small></div>
  <div class="route-list">
    <button class="route-card selected" data-route="A">
      <span class="route-letter">A<small>推荐</small></span>
      <span class="route-info">
        <b>滨江路主线 <em>全程有灯</em></b>
        <span class="route-meta">${ic('clock')}18 分钟 <i>·</i> 1.2 km <i>·</i> 步行</span>
        <span class="route-tags"><span class="tag mint">路灯 86%</span><span class="tag">监控 12</span><span class="tag">事件 2</span></span>
      </span>
      <span class="score-ring sm" style="--p:92;--ring:#7ff0d4" data-action="score-detail"><span>92</span><small>安全分</small></span>
    </button>
    <button class="route-card" data-route="B">
      <span class="route-letter">B</span>
      <span class="route-info"><b>文昌巷捷径</b>
        <span class="route-meta">${ic('clock')}22 分钟 <i>·</i> 1.4 km <i>·</i> 步行</span>
        <span class="route-tags"><span class="tag amber">路灯 61%</span><span class="tag amber">小巷 3 段</span><span class="tag">事件 4</span></span>
      </span>
      <span class="score-ring sm amber-ring" style="--p:78;--ring:#ffc46b" data-action="score-detail"><span>78</span><small>安全分</small></span>
    </button>
    <button class="route-card" data-route="C">
      <span class="route-letter">C</span>
      <span class="route-info"><b>文三路夜宵街</b>
        <span class="route-meta">${ic('clock')}15 分钟 <i>·</i> 1.1 km <i>·</i> 步行</span>
        <span class="route-tags"><span class="tag coral">路灯 43%</span><span class="tag coral">人流复杂</span><span class="tag">事件 7</span></span>
      </span>
      <span class="score-ring sm gray-ring" style="--p:64;--ring:#93a0b5" data-action="score-detail"><span>64</span><small>安全分</small></span>
    </button>
  </div>
  <button class="event-strip glass" data-action="event-detail"><span class="live-dot"></span>文昌巷 300m 处路灯检修，A 线不受影响 ${ic('chevron')}</button>
  <div class="route-footer">
    <button class="primary-btn" data-action="start-nav">${ic('navigation')}开始导航<small id="routeEta">预计 18 分钟</small></button>
    <button class="square-btn" data-action="share-trip">${ic('share')}</button>
  </div>
</section>`;

XA_SCREENS.sos = `
<section class="screen" data-screen="sos">
  <div class="sos-bg"></div>
  <header class="page-head light">
    <button class="icon-btn" data-back="home">${ic('back')}</button>
    <div class="head-title"><h2>紧急求助</h2><small>EMERGENCY · 一键报警</small></div>
    <button class="icon-btn" data-action="sos-guide">${ic('shield')}</button>
  </header>
  <div class="sos-content">
    <div class="alarm-state"><span class="pulse-dot"></span>报警已发出 <i>21:42:06</i></div>
    <h2 class="sos-title">已报警</h2>
    <p class="sos-desc">已通知 3 位紧急联系人，并自动呼叫 110</p>
    <div class="sos-orb-wrap">
      <div class="orb-rings"><i></i><i></i><i></i></div>
      <div class="sos-orb"><b>SOS</b><span id="alarmTimer">00:03</span><small>· 鸣响中 ·</small><div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <span class="orb-check">${ic('check')}</span>
    </div>
    <div class="status-card glass">
      <div class="status-row pending" data-status="0"><span class="st-ico mint">${ic('pin')}</span><span><b>位置已发送</b><small>妈妈、阿哲、物业管家 · 定位精度 ±5m</small></span><span class="st-tag done">已送达</span></div>
      <div class="status-row pending" data-status="1"><span class="st-ico coral">${ic('phone')}</span><span><b>正在呼叫 110</b><small>通话 00:07 · 请保持手机畅通</small></span><span class="st-tag live">接通中</span></div>
      <div class="status-row pending" data-status="2"><span class="st-ico amber">${ic('siren')}</span><span><b>警报鸣响</b><small>最大音量 · 现场录音已开启</small></span><span class="st-tag">鸣响中</span></div>
      <div class="status-row pending" data-status="3"><span class="st-ico blue">${ic('glasses')}</span><span><b>AR 眼镜联动</b><small>检测到剧烈动作与眼镜掉落，已自动报警</small></span><span class="st-tag done">已触发</span></div>
    </div>
    <button class="location-card glass" data-action="location-detail">
      ${ic('pin')}<span><b>当前位置 · 已同步</b><small>杭州市西湖区文三路 90 号 · 精度 ±5m · 更新于 21:42:06</small></span>
      <span class="loc-btn">查看 ${ic('chevron')}</span>
    </button>
    <button class="cancel-alarm" data-action="cancel-alarm"><span class="hold-fill"></span>${ic('check')} 我安全了 · 取消报警<small>长按 2 秒</small></button>
    <p class="sos-footnote">长按 2 秒取消，防止误触 · 本次记录仍会保留</p>
  </div>
</section>`;
