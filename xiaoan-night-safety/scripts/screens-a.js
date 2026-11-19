window.XA_SCREENS = window.XA_SCREENS || {};
window.ic = function (name, cls) {
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '"><use href="#i-' + name + '"/></svg>';
};

XA_SCREENS.home = `
<section class="screen active" data-screen="home">
  <div class="home-map">
    <div class="map-blocks">
      <span class="blk b1"></span><span class="blk b2"></span><span class="blk b3"></span><span class="blk b4"></span>
      <span class="park">西溪公园</span><span class="street st1">文昌巷</span><span class="street st2">滨江路</span>
    </div>
    <svg class="map-lines" viewBox="0 0 390 470" preserveAspectRatio="none">
      <path class="road-base" d="M-20 330 C80 300 130 250 190 205 S310 120 420 70"/>
      <path class="road-base thin" d="M-20 200 C90 215 160 240 230 300 S330 370 420 390"/>
      <path class="road-base thin" d="M60 -10 C100 90 130 180 100 290 S80 420 60 490"/>
      <path class="route-shadow" d="M18 425 C90 405 120 345 165 295 S260 215 330 170"/>
      <path class="route-main" d="M18 425 C90 405 120 345 165 295 S260 215 330 170"/>
      <path class="route-dash" d="M18 425 C70 390 120 350 190 320 S290 260 350 220"/>
    </svg>
    <div class="map-lights"></div>
    <span class="map-node n1"></span><span class="map-node n2"></span><span class="map-node n3"></span>
  </div>

  <header class="home-top">
    <div class="brand">
      <span class="brand-mark">${ic('moon')}</span>
      <span class="brand-text"><b>小安</b><small>XIAO'AN</small></span>
      <span class="guard-dot"></span><span class="guard-text">夜间守护中 · 已连续 3 晚</span>
    </div>
    <button class="icon-btn" data-action="notifications">${ic('bell')}<i class="red-dot"></i></button>
  </header>

  <button class="search-box" data-action="search">${ic('search')}<span>搜索目的地、公交站</span>${ic('mic','mic')}</button>

  <button class="score-card glass" data-action="score-detail">
    <span class="score-ring" style="--p:92;--ring:#7ff0d4"><span>92</span></span>
    <span class="score-copy">
      <span class="label">路线安全系数 <em>AI</em></span>
      <span class="sub">路灯覆盖 86% <i>·</i> 近30天事件 2 起</span>
      <span class="more">查看分数构成 ${ic('chevron')}</span>
    </span>
  </button>

  <div class="dest-chip glass">${ic('pin')}<span><b data-destination>滨江花园</b><small>1.2 km · 步行 18 min</small></span></div>
  <button class="float-btn layer-btn" data-action="layer">${ic('layers')}</button>
  <button class="float-btn bulb-btn" data-action="bulb">${ic('warning')}</button>

  <button class="event-card glass" data-action="event-detail">
    <span class="event-icon">${ic('bell')}</span>
    <span class="event-text"><small>● 实时播报 · 2 分钟前</small><b>文昌巷路灯检修，建议绕行滨江路</b></span>
    ${ic('chevron','chev')}
  </button>

  <div class="home-sheet">
    <div class="drag-handle"></div>
    <div class="dest-row">
      <span class="dest-arrow">${ic('navigation')}</span>
      <span class="dest-main">
        <small>目的地</small><b><span data-destination>滨江花园</span> · 东南门</b>
        <span class="dest-sub">路线已避开暗巷 · 比常规路线多 3 分钟</span>
      </span>
      <button class="pill-btn" data-action="search">切换</button>
    </div>
    <div class="metrics">
      <div><span class="m-ico amber">${ic('warning')}</span><span><b>86%</b><small>路灯覆盖</small></span></div>
      <div><span class="m-ico mint">${ic('shield')}</span><span><b>12 处</b><small>监控覆盖</small></span></div>
      <div><span class="m-ico mint">${ic('navigation')}</span><span><b>开启</b><small>AI 全程陪伴</small></span></div>
    </div>
    <div class="shortcuts">
      <button data-shortcut="家">${ic('pin')}家 <small>2.1 km</small>${ic('chevron','up')}</button>
      <button data-shortcut="公司">${ic('pin')}公司 <small>4.6 km</small>${ic('chevron','up')}</button>
      <button data-shortcut="健身房">${ic('pin')}健身房 <small>1.4 km</small>${ic('chevron','up')}</button>
    </div>
    <button class="ai-card" data-action="ai-suggest">
      <span class="ai-face">☺</span>
      <span class="ai-copy"><b>小安 AI · 陪你走夜路</b><small>今晚走滨江路吧，路灯更亮，我陪你。</small></span>
      <span class="ai-chip">对话 ${ic('chevron')}</span>
    </button>
    <button class="primary-btn" data-action="start-nav">${ic('navigation')}开始安全导航<small>18 min</small></button>
  </div>
</section>`;

XA_SCREENS.route = `
<section class="screen" data-screen="route">
  <header class="page-head">
    <button class="icon-btn" data-back="home">${ic('back')}</button>
    <div class="head-title"><h2>路线安全分析</h2><small>已按安全优先排序</small></div>
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
