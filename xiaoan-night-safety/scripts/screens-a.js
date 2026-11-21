window.XA_SCREENS = window.XA_SCREENS || {};
window.ic = function (name, cls) {
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '"><use href="#i-' + name + '"/></svg>';
};

XA_SCREENS.home = `
<section class="screen active state-default" data-screen="home">
  <div class="home-map" id="homeMap" aria-label="可拖动和缩放的地图"></div>
  <div class="home-search" id="homeSearch">
    ${ic('search')}<input id="homeSearchInput" placeholder="输入地点或品牌，如 汉庭酒店" autocomplete="off">
    <button id="homeSearchBtn" class="home-search-btn" data-action="do-search">搜索</button>
  </div>
  <div class="poi-suggest" id="poiSuggest" aria-label="附近地点联想推荐"></div>
  <div class="home-floats">
    <button class="float-btn" data-action="risk-popover" aria-label="附近安全提示">${ic('warning')}</button>
    <button class="float-btn" data-action="recenter" aria-label="回到我的位置">${ic('pin')}</button>
  </div>

  <div class="risk-popover" id="riskPopover">
    <div class="rp-head"><b>附近夜行提示</b><button data-action="close-risk">${ic('close')}</button></div>
    <div class="risk-item"><span class="risk-dot amber"></span><span><b>优先选择有路灯的主路</b><small>照明信息来自公开地图与路线估算</small></span></div>
    <div class="risk-item"><span class="risk-dot coral"></span><span><b>路况可能变化</b><small>出发前请再次观察现场环境</small></span></div>
  </div>

  <section class="poi-results" id="poiResults" aria-label="地点搜索结果">
    <div class="poi-head"><b id="poiTitle">地点搜索</b><button data-action="close-search" aria-label="关闭搜索结果">${ic('close')}</button></div>
    <div class="poi-list" id="poiList"></div>
  </section>

  <div class="side-drawer" id="sideDrawer">
    <div class="drawer-head"><b>安星 · 夜行安全</b><small>夜间守护</small><button data-action="close-drawer">${ic('close')}</button></div>
    <button data-tab="home">${ic('navigation')}安全导航</button>
    <button data-action="open-route">${ic('route')}路线分析</button>
    <button data-tab="community">${ic('users')}社区互助</button>
    <button data-tab="entertainment">${ic('music')}夜间伴行</button>
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
    <span><b>安星建议</b> A 线多 3 分钟，换全程有灯与 <em>+28</em> 安全分</span>
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
<section class="screen scroll-screen" data-screen="sos">
  <div class="sos-bg"></div>
  <header class="page-head light">
    <button class="icon-btn" data-back="home">${ic('back')}</button>
    <div class="head-title"><h2>紧急求助</h2><small>EMERGENCY · 一键报警</small></div>
    <button class="sos-cancel-top" data-action="cancel-alarm">${ic('close')} 误报取消</button>
  </header>
  <div class="sos-content">
    <div class="alarm-state"><span class="pulse-dot"></span>报警已发出 <i id="alarmSentAt">--:--:--</i></div>
    <h2 class="sos-title">已报警</h2>
    <p class="sos-desc" id="sosDesc">已通知 3 位紧急联系人，并自动呼叫 110</p>
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
    <button class="location-card glass" data-action="location-detail" id="sosLocationCard">
      ${ic('pin')}<span><b>当前位置 · 实时同步中</b><small id="sosLocationDetail">正在获取设备实时定位…</small></span>
      <span class="loc-btn">查看 ${ic('chevron')}</span>
    </button>
    <div class="sos-contacts glass">
      <div class="sos-contacts-head"><b>亲友实时位置已发送</b><small>3 位紧急联系人</small></div>
      <div class="sos-contact"><span>妈妈</span><small>已送达 · 实时位置</small><em>${ic('check')}</em></div>
      <div class="sos-contact"><span>阿哲</span><small>已送达 · 实时位置</small><em>${ic('check')}</em></div>
      <div class="sos-contact"><span>物业管家</span><small>已送达 · 实时位置</small><em>${ic('check')}</em></div>
    </div>
    <button class="cancel-alarm" data-action="cancel-alarm"><span class="hold-fill"></span>${ic('check')} 我安全了 · 取消报警<small>轻点即可取消</small></button>
    <p class="sos-footnote">误报可随时取消 · 本次记录仍会保留 · 概念演示，不会真实拨号</p>
  </div>
</section>`;
