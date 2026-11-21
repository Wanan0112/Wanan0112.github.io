XA_SCREENS.entertainment = `
<section class="screen scroll-screen" data-screen="entertainment">
  <header class="page-head flat">
    <div class="head-title left"><h2 data-i18n="entertainment">伴行</h2><small data-i18n="entertainmentSub">夜路很长，让声音陪你走</small></div>
    <button class="icon-btn" data-action="ar-entry">${ic('glasses')}</button>
  </header>
  <button class="glasses-card glass" data-action="ar-entry">
    <span class="g-logo">${ic('glasses')}</span>
    <span><b>安星 AR 眼镜</b><small><i class="online-dot"></i>已连接 · 电量 82%</small></span>
    <span class="g-modes">眼镜端 歌词 ${ic('chevron')}</span>
  </button>

  <div class="player-card glass">
    <div class="player-top"><span class="playing-tag">${ic('music')} <span data-i18n="musicPlaying">正在播放 · 后台播放</span></span><span class="hires">HI-RES</span></div>
    <button class="source-row" data-action="music-source"><span>${ic('music')} <b data-i18n="musicSource">音源</b></span><span id="musicSourceLabel" data-i18n="sourceLocal">安星本地歌单</span>${ic('chevron')}</button>
    <div class="track-row">
      <div class="track-info"><h3 id="trackTitle">夜航</h3><small id="trackArtist">安星电台 · 夜行歌单</small><em id="trackSubtitle">给独行路上的一点温柔</em><div class="lyric-marquee"><span id="trackLyric">路灯把影子拉得很长，风吹散一整天的慌张 · 跟着节拍慢慢走</span></div></div>
      <div class="vinyl cover-night" id="vinyl"><span><b>夜航</b><small>安星电台</small></span></div>
    </div>
    <div class="progress"><span id="trackProgress" style="width:32%"></span></div>
    <div class="progress-time"><span id="trackCurrent">1:42</span><span id="trackDuration">6:12</span></div>
    <div class="player-controls">
      <button data-action="prev">${ic('prev')}</button>
      <button class="play-btn" data-action="play">${ic('play')}</button>
      <button data-action="next">${ic('next')}</button>
      <button class="vol-btn" data-action="volume">${ic('volume')}</button>
    </div>
    <div class="volume-row" id="volumeRow"><span>音量</span><input type="range" min="0" max="100" value="60" id="volumeSlider"></div>
    <div class="player-foot"><span class="synced-dot"></span>歌词已同步到眼镜 <button data-action="lyric-sync" class="sync-btn">已开启</button></div>
  </div>

  <div class="lyric-card glass">
    <span class="lyric-icon">${ic('glasses')}</span>
    <span><small>歌词模式 · 眼镜端</small><b>我听见风在耳边唱</b><em>下一句 · 城市把星光点亮</em></span>
    <span class="lyric-bars"><i></i><i></i><i></i><i></i><i></i></span>
  </div>

  <button class="bs-entry" data-action="open-bottom-sheet">
    <span class="bs-entry-ico">${ic('layers')}</span>
    <span class="bs-entry-txt"><b>沉浸伴行 · 底部上拉面板</b><small>视频 / 音乐 · 双锚点手势 · SOS 常驻</small></span>
    ${ic('chevron', 'go')}
  </button>

  <div class="section-title"><h3 data-i18n="audioBook">伴行听书</h3><small data-i18n="bookSubtitle">接入番茄小说开放能力，APP 内沉浸式听书，不离开安星</small></div>
  <div class="fanqie-account glass">
    <span class="fq-logo">${ic('play')}</span>
    <span><b data-i18n="fanqieQuickLogin">番茄小说快捷登录入口</b><small id="fanqieAccountSub" data-i18n="fanqieLoginSub">登录后可收听番茄精选小说</small></span>
    <button id="fanqieAccountBtn" data-action="fanqie-login" data-i18n="fanqieLogin">登录番茄小说账号</button>
  </div>
  <div class="book-toolbar">
    <div class="bk-tabs"><button class="active" data-action="book-tab" data-tab-type="featured" data-i18n="fanqieFeatured">番茄精选</button><button data-action="book-tab" data-tab-type="favorites" data-i18n="fanqieCustom">我的书架</button></div>
    <button class="bk-refresh" data-action="book-refresh">${ic('settings')}<span data-i18n="refreshBooks">换一批</span></button>
  </div>
  <div class="book-grid" id="fanqieBookGrid"></div>
  <button class="fanqie-add" data-action="fanqie-add">${ic('plus')}<span data-i18n="fanqieAdd">同步我的书架</span>${ic('chevron')}</button>

  <div class="playlists">
    <button class="playlist p1 active" data-playlist-card="night" data-action="open-playlist" data-playlist="night"><span>${ic('music')}</span><b data-i18n="playlistNight">夜行歌单</b><small>3 首 · 陪你走完这段路</small>${ic('chevron')}</button>
    <button class="playlist p2" data-playlist-card="rain" data-action="open-playlist" data-playlist="rain"><span>${ic('glasses')}</span><b data-i18n="playlistRain">雨夜白噪音</b><small>白噪音歌单 · 2 段环境声</small>${ic('chevron')}</button>
  </div>
</section>`;

XA_SCREENS.community = `
<section class="screen scroll-screen" data-screen="community">
  <header class="page-head flat">
    <div class="head-title left"><h2>社区</h2><small>安心搭 · 找夜路同行搭子</small></div>
    <button class="avatar cm-avatar" data-action="community-profile" aria-label="点击进入个人主页">安</button>
  </header>

  <section class="cm-zone">
    <div class="cm-zone-head"><span class="cm-zone-no">01</span><span><h3>安星商城</h3><small>安心好物 · 品牌正品</small></span>${ic('chevron')}</div>
    <button class="cm-shop-entry" data-action="go-shop">
      <span class="cm-shop-entry-ico">${ic('moon')}</span>
      <span><b>进入安星商城</b><small>夜行装备与安全好物 · 独立页面</small></span>
      ${ic('chevron')}
    </button>
  </section>
  <div class="cm-zone-divider"></div>

  <section class="cm-zone" id="cmBuddy">
    <div class="cm-zone-head"><span class="cm-zone-no">02</span><span><h3>安心搭</h3><small id="cmQuota">免费体验 3 次</small></span></div>
    <p class="cm-zone-desc">找夜路搭子，发布同行预约 · 提前预约，不是即时匹配</p>
    <div id="cmVerify"></div>
    <div class="cm-benefit"><span>${ic('shield')}</span><div><b>同路段 AI 匹配</b><small>匹配与你途经同一段路线的人，起点与终点不必完全一致</small></div></div>
    <button class="cm-primary" data-action="buddy-publish">${ic('plus')} 发布夜路同行预约</button>
  </section>
  <div class="cm-zone-divider"></div>

  <section class="cm-zone">
    <div class="cm-zone-head"><span class="cm-zone-no">03</span><span><h3>我的预约</h3><small>可查看 AI 匹配结果</small></span></div>
    <div id="cmReservations"></div>
    <p class="cm-note">导航、听歌、听书等基础伴行功能永久免费 · 找搭子含 <b>3 次免费体验</b>，用完后纳入 VIP 增值权益</p>
  </section>
</section>`;

XA_SCREENS.buddyProfile = `
<section class="screen scroll-screen" data-screen="buddyProfile">
  <header class="page-head">
    <button class="icon-btn" data-back="community">${ic('back')}</button>
    <div class="head-title"><h2>个人主页</h2><small>对外展示 · 信息已脱敏</small></div>
  </header>
  <div class="bp-card glass">
    <span class="bp-avatar">安</span>
    <span class="bp-main"><b>安星用户</b><small>夜行者 Lv.3 · 武汉藏龙岛片区</small></span>
  </div>
  <div class="bp-verified">${ic('shield')}<span><b>该用户已完成实名认证</b><small>已通过身份核验 · 用于找夜路同行搭子</small></span></div>
  <div class="section-title"><h3>对外展示信息</h3><small>仅脱敏信息 · 保护隐私</small></div>
  <div class="menu-group bp-fields">
    <div><span class="menu-ico mint">${ic('user')}</span><span>性别</span><small>女</small></div>
    <div><span class="menu-ico amber">${ic('clock')}</span><span>年龄区间</span><small>20-25 岁</small></div>
    <div><span class="menu-ico blue">${ic('pin')}</span><span>常走区域</span><small>武汉 · 藏龙岛片区</small></div>
    <div><span class="menu-ico mint">${ic('route')}</span><span>同行偏好</span><small>走有路灯的主路 · 21:00-23:00</small></div>
  </div>
  <div class="bp-privacy">${ic('lock')}<span><b>隐私保护说明</b><small>真实姓名、手机号、具体住址与实时位置不会对外展示；仅展示性别、年龄区间等脱敏信息，实名认证只显示核验结果。</small></span></div>
  <button class="primary-btn" data-action="go-community">返回社区找搭子</button>
</section>`;

XA_SCREENS.shop = `
<section class="screen scroll-screen" data-screen="shop">
  <header class="page-head">
    <button class="icon-btn" data-back="community">${ic('back')}</button>
    <div class="head-title"><h2>安星商城</h2><small>安心好物 · 品牌正品</small></div>
  </header>
  <div class="cm-panel" id="cmShop">
    <div class="cm-benefit shop"><span>${ic('shield')}</span><div><b>正品保障 · 七天无理由退货</b><small>概念演示商城 · 不会产生真实订单或扣费</small></div></div>
    <div class="cm-section-head"><h3>安心好物</h3><small>为夜行安全而生</small></div>
    <div class="cm-goods" id="cmGoods"></div>
    <p class="cm-note">以上为概念演示商品，不会产生真实订单或扣费。</p>
  </div>
</section>`;

XA_SCREENS.ar = `
<section class="screen scroll-screen" data-screen="ar">
  <header class="page-head">
    <button class="icon-btn" data-back="entertainment">${ic('back')}</button>
    <div class="head-title"><h2>安星 AR</h2><small><span data-i18n="arSub">眼镜控制台</span> · XA-0281</small></div>
    <button class="icon-btn" data-action="ar-settings">${ic('settings')}</button>
  </header>
  <div class="ar-device glass">
    <div class="ar-device-top"><span class="g-logo sm">${ic('glasses')}</span><span><b>安星 AR 眼镜</b><small>夜行增强版 · 镜架 XA-0281</small></span><span class="connected">已连接</span></div>
    <div class="ar-preview">
      <img src="assets/ar-preview.jpg" alt="AR 眼镜实时镜片画面">
      <button class="ar-full" data-action="ar-full">1080P ⛶</button>
    </div>
    <div class="ar-device-status"><span>82% <small>电量</small></span><span class="wear-status">${ic('check')} 佩戴中 <small>点击</small></span><span>${ic('wifi')} 强 <small>信号</small></span></div>
    <p class="ar-hint">双击镜腿切换模式 · 长按 3 秒紧急求助 <span>v1.4.2</span></p>
  </div>

  <div class="section-title"><h3>使用模式</h3><small>眼镜端实时同步</small></div>
  <div class="mode-grid">
    <button class="mode-card active" data-mode="3D 导航"><span class="mode-ico mint">${ic('navigation')}</span><b>3D 导航</b><small>抬头指引</small><span class="on-tag">ON</span></button>
    <button class="mode-card" data-mode="歌词模式"><span class="mode-ico amber">${ic('music')}</span><b>歌词模式</b><small>与音乐同步</small><span class="on-tag">3 首</span></button>
    <button class="mode-card" data-mode="游戏"><span class="mode-ico blue">${ic('plus')}</span><b>游戏</b><small>夜行小游戏</small><span class="on-tag">2 款</span></button>
  </div>

  <div class="section-title"><h3>导航操作</h3><small>与首页同一套按钮规范</small></div>
  <div class="ar-nav-actions">
    <button class="primary-btn" data-action="start-nav">${ic('navigation')}进入 AR 导航<small>预计 18 分钟</small></button>
    <button class="ghost-btn ar-end" data-action="end-nav" hidden>${ic('close')}退出导航</button>
    <button class="square-btn" data-action="find-glasses" aria-label="查找眼镜">${ic('pin')}</button>
  </div>

  <div class="section-title"><h3>安全感知</h3><small id="armedText">自动报警已就绪</small></div>
  <div class="sensing-card glass">
    <div class="sensing-head"><span class="mint">${ic('shield')}</span><span><b>安全感知已开启</b><small>所有传感器工作正常</small></span><span class="armed">ARMED</span></div>
    <div class="sensing-grid">
      <button class="sense on" data-sense="动作检测"><span>${ic('navigation')} 动作检测</span><small>跌倒 / 剧烈运动</small><i></i></button>
      <button class="sense on" data-sense="掉落检测"><span>${ic('glasses')} 掉落检测</span><small>镜架离脸</small><i></i></button>
      <button class="sense on" data-sense="呼救识别"><span>${ic('siren')} 呼救识别</span><small>声纹关键词</small><i></i></button>
    </div>
    <p class="sensing-foot">触发自动动作前，发送位置，并通知 3 位紧急联系人</p>
  </div>

  <div class="audio-card glass"><span class="audio-ico">${ic('volume')}</span><span><b>开放式音频</b><small>不堵塞 · 你能听见环境声</small></span><input type="range" min="0" max="100" value="65" id="arVolume"></div>
  <p class="ar-connected">${ic('check')} 配对成功 · 已连续保护 1 小时 12 分钟</p>
</section>`;

XA_SCREENS.profile = `
<section class="screen scroll-screen" data-screen="profile">
  <header class="page-head flat"><div class="head-title left"><h2 data-i18n="profile">我的</h2><small data-i18n="profileSub">守护设置与夜行记录</small></div><button class="icon-btn" data-action="settings-appearance" aria-label="外观与主题">${ic('moon')}</button></header>
  <div class="profile-card glass"><span class="profile-avatar">安</span><span><b>安星用户</b><small>已连续守护 3 晚 · 武汉藏龙岛</small></span><span class="level">夜行者 Lv.3</span></div>
  <div class="stats-row"><div><b>18</b><small>安全行程</small></div><div><b>92</b><small>平均安全分</small></div><div><b id="statContacts">3</b><small>紧急联系人</small></div></div>
  <button class="vip-card" data-action="vip-open" id="vipCard">
    <span class="vip-crown">${ic('shield')}</span>
    <span class="vip-copy"><b>安星 VIP · 增值权益</b><small id="vipStatus">解锁找搭子等增值功能 · 月 / 季 / 年包可选</small></span>
    ${ic('chevron')}
  </button>
  <p class="free-note">${ic('check')} 导航、听歌、听书等基础伴行功能永久免费；付费项仅含商城商品与 VIP 订阅</p>
  <div class="menu-group">
    <button data-action="contacts-manage"><span class="menu-ico mint">${ic('users')}</span><span data-i18n="contacts">紧急联系人</span><small id="contactsCount">3 位</small>${ic('chevron')}</button>
    <button data-action="routes-manage"><span class="menu-ico amber">${ic('route')}</span><span data-i18n="routes">我的安全路线</span><small id="routesCount">2 条</small>${ic('chevron')}</button>
    <button data-menu="history"><span class="menu-ico blue">${ic('clock')}</span><span data-i18n="history">守护记录</span>${ic('chevron')}</button>
  </div>
  <div class="section-title profile-section"><h3 data-i18n="settings">设置</h3><small data-i18n="settingsSub">守护偏好与账号</small></div>
  <div class="menu-group">
    <button data-action="settings"><span class="menu-ico mint">${ic('settings')}</span><span data-i18n="settings">设置</span><small data-i18n="settingsPageSub">个性、安全与设备</small>${ic('chevron')}</button>
    <button data-action="open-guide"><span class="menu-ico blue">${ic('glasses')}</span><span>使用指南</span><small>功能说明与操作演示</small>${ic('chevron')}</button>
  </div>
  <div class="menu-group">
    <button data-action="feedback"><span class="menu-ico amber">${ic('comment')}</span><span data-i18n="feedback">问题反馈</span><small data-i18n="feedbackSub">联系客服</small>${ic('chevron')}</button>
  </div>
  <div class="menu-group account-actions">
    <button data-action="switch-account"><span class="menu-ico blue">${ic('users')}</span><span data-i18n="switchAccount">切换账号</span>${ic('chevron')}</button>
    <button data-action="logout-confirm" class="logout-row"><span class="menu-ico coral">${ic('close')}</span><span data-i18n="logout">退出登录</span>${ic('chevron')}</button>
  </div>
  <p class="version">安星 · 夜行安全系统 V1.11 · 概念设计原型</p>
</section>`;

XA_SCREENS.settings = `
<section class="screen scroll-screen settings-screen" data-screen="settings">
  <header class="page-head">
    <button class="icon-btn" data-back="profile">${ic('back')}</button>
    <div class="head-title"><h2 data-i18n="settings">设置</h2><small data-i18n="settingsPageSub">个性、安全与设备</small></div>
    <button class="icon-btn" data-action="feedback">${ic('comment')}</button>
  </header>

  <div class="settings-hero glass">
    <span class="profile-avatar">安</span>
    <span><b>安星用户</b><small data-i18n="settingsSub">守护偏好与账号</small></span>
    <span class="level">Lv.3</span>
  </div>

  <div class="settings-block">
    <div class="settings-block-head"><span class="settings-block-ico mint">${ic('settings')}</span><span><b data-i18n="personalSettings">个性设置</b><small data-i18n="personalSub">外观、语言与显示偏好</small></span></div>
    <div class="menu-group">
      <button data-action="settings-appearance"><span class="menu-ico amber">${ic('settings')}</span><span data-i18n="appearance">外观与主题</span><small id="appearanceLabel">跟随设备系统</small>${ic('chevron')}</button>
      <button data-action="settings-language"><span class="menu-ico blue">${ic('glasses')}</span><span data-i18n="language">管理语言</span><small data-i18n="languageName">简体中文</small>${ic('chevron')}</button>
    </div>
  </div>

  <div class="settings-block">
    <div class="settings-block-head"><span class="settings-block-ico blue">${ic('shield')}</span><span><b data-i18n="securityPrivacySettings">安全隐私设置</b><small data-i18n="securityPrivacySub">权限、账号与访问范围</small></span></div>
    <div class="menu-group">
      <button data-action="privacy-settings"><span class="menu-ico mint">${ic('lock')}</span><span data-i18n="privacyManage">隐私与权限</span><small>4 项开关</small>${ic('chevron')}</button>
      <button data-action="route-pref"><span class="menu-ico blue">${ic('navigation')}</span><span>路线偏好</span><small id="routePrefLabel">夜行优先 · 安全第一</small>${ic('chevron')}</button>
      <button data-action="account-security"><span class="menu-ico amber">${ic('users')}</span><span data-i18n="accountSecurity">账号与安全</span><small data-i18n="deviceBound">已绑定设备</small>${ic('chevron')}</button>
    </div>
  </div>

  <div class="settings-block">
    <div class="settings-block-head"><span class="settings-block-ico amber">${ic('glasses')}</span><span><b data-i18n="otherSettings">其他设置</b><small data-i18n="otherSub">关于、设备与帮助</small></span></div>
    <div class="menu-group">
      <button data-menu="about"><span class="menu-ico blue">${ic('shield')}</span><span data-i18n="about">关于安星</span>${ic('chevron')}</button>
      <button data-menu="device"><span class="menu-ico amber">${ic('glasses')}</span><span data-i18n="device">AR 眼镜设备</span><small>已连接</small>${ic('chevron')}</button>
      <button data-action="open-guide"><span class="menu-ico mint">${ic('glasses')}</span><span>使用指南</span><small>功能说明与操作演示</small>${ic('chevron')}</button>
      <button data-action="feedback"><span class="menu-ico mint">${ic('comment')}</span><span data-i18n="feedback">问题反馈</span><small data-i18n="contactService">联系在线客服</small>${ic('chevron')}</button>
    </div>
  </div>

  <div class="menu-group account-actions">
    <button data-action="switch-account"><span class="menu-ico blue">${ic('users')}</span><span data-i18n="switchAccount">切换账号</span>${ic('chevron')}</button>
    <button data-action="logout-confirm" class="logout-row"><span class="menu-ico coral">${ic('close')}</span><span data-i18n="logout">退出登录</span>${ic('chevron')}</button>
  </div>
  <p class="version">安星 · 夜行安全系统 V1.11 · 概念设计原型</p>
</section>`;
