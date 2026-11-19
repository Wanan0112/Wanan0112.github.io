XA_SCREENS.entertainment = `
<section class="screen scroll-screen" data-screen="entertainment">
  <header class="page-head flat">
    <div class="head-title left"><h2 data-i18n="entertainment">娱乐</h2><small data-i18n="entertainmentSub">夜路很长，让声音陪你走</small></div>
    <button class="icon-btn" data-action="ar-entry">${ic('glasses')}</button>
  </header>
  <button class="glasses-card glass" data-action="ar-entry">
    <span class="g-logo">${ic('glasses')}</span>
    <span><b>小安 AR 眼镜</b><small><i class="online-dot"></i>已连接 · 电量 82%</small></span>
    <span class="g-modes">眼镜端 歌词 ${ic('chevron')}</span>
  </button>

  <div class="player-card glass">
    <div class="player-top"><span class="playing-tag">${ic('music')} <span data-i18n="musicPlaying">正在播放 · 后台播放</span></span><span class="hires">HI-RES</span></div>
    <div class="track-row">
      <div class="track-info"><h3 id="trackTitle">夜航</h3><small id="trackArtist">小安电台 · 夜行歌单</small><p id="trackLyric">路灯把影子拉得很长</p></div>
      <div class="vinyl" id="vinyl"><span><b>夜航</b><small>小安电台</small></span></div>
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

  <div class="section-title"><h3 data-i18n="nightVideo">夜行影像</h3><small data-i18n="onlineVideo">免费素材 · 点击播放</small></div>
  <button class="video-card" data-action="video" data-video="0">
    <img src="assets/video-night.jpg" alt="雨夜街道视频封面">
    <span class="video-play">${ic('play')}</span>
    <span class="video-info"><b>雨夜归途 · 城市有光</b><small data-i18n="onlineVideo">Pexels 免费素材 · 点击播放</small></span>
    <span class="video-progress"></span>
    <span class="video-saved">在线播放 · 建议 Wi-Fi</span>
  </button>
  <button class="video-card video-card-2" data-action="video" data-video="1">
    <img src="assets/ar-preview.jpg" alt="城市夜景视频封面">
    <span class="video-play">${ic('play')}</span>
    <span class="video-info"><b>夜色城市 · 车流延时</b><small data-i18n="onlineVideo">Pexels 免费素材 · 点击播放</small></span>
    <span class="video-progress"></span>
    <span class="video-saved">在线播放 · 建议 Wi-Fi</span>
  </button>

  <div class="playlists">
    <button class="playlist p1" data-track="夜行歌单"><span>${ic('music')}</span><b>夜行歌单</b><small>32 首 · 陪你走完这段路</small>${ic('play','pl')}</button>
    <button class="playlist p2" data-track="雨夜白噪音"><span>${ic('glasses')}</span><b>雨夜白噪音</b><small>助眠 · 放松</small>${ic('play','pl')}</button>
  </div>
</section>`;

XA_SCREENS.community = `
<section class="screen scroll-screen" data-screen="community">
  <header class="page-head flat">
    <div class="head-title left"><h2 data-i18n="community">社区</h2><small data-i18n="communitySub">真实夜行经验，彼此照亮</small></div>
    <button class="icon-btn" data-action="community-search">${ic('search')}</button>
    <span class="avatar">安</span>
  </header>
  <div class="community-tabs">
    <div class="tabs"><button class="active" data-ctab="all">推荐</button><button data-ctab="follow">关注</button><button data-ctab="local">同城</button></div>
    <button class="publish-btn" data-action="publish">${ic('plus')} 发布</button>
  </div>

  <button class="topic-banner" data-action="topic">
    <span class="topic-copy"><small>本期话题 · NIGHT WALK</small><b>夜路故事征集</b><em>分享你的夜行瞬间，赢小安 AR 眼镜</em><span>去分享 ${ic('chevron')}</span></span>
    <span class="moon-badge">${ic('moon')}</span>
  </button>

  <div class="section-title"><h3>小安好物</h3><small>社区专享 · 夜行装备</small></div>
  <div class="goods-grid">
    <button class="good-card" data-goods="AR 眼镜"><span class="hot">HOT</span><span class="good-img">${ic('glasses')}</span><b>小安 AR 眼镜</b><small>3D 导航 · 夜视增强</small><span class="price">¥1,299 <i>12期免息</i></span></button>
    <button class="good-card" data-goods="随行警报器"><span class="new">NEW</span><span class="good-img red">${ic('siren')}</span><b>小安随行警报器</b><small>120dB · 一键声光</small><span class="price">¥199 <i>已售 2.3k</i></span></button>
  </div>

  <div class="section-title"><h3>真实夜行故事</h3><small>1,204 条分享 ${ic('chevron')}</small></div>
  <div class="story-feed" id="storyFeed">
    <article class="story-card" data-cat="local">
      <header><span class="avatar green">晚</span><span><b>林晚</b><small>夜行 3 年 · 杭州</small></span><span class="real-tag">真实经历</span><button class="more-btn" data-action="story-more">•••</button></header>
      <p>加班到十一点，走滨江路全程有灯。小安一路提醒前方施工，还帮我叫了车。原来夜路也可以很安心。</p>
      <img src="assets/story-road.jpg" alt="夜间滨江路">
      <footer><span>${ic('pin')}滨江路 · 21:18</span><span class="story-actions"><button class="like" data-action="like"><span class="like-ico">${ic('heart')}</span><b>128</b></button><button>${ic('comment')}<b>32</b></button><button>${ic('share')}分享</button></span></footer>
    </article>
    <article class="story-card" data-cat="follow">
      <header><span class="avatar orange">哲</span><span><b>阿哲</b><small>AR 眼镜体验官</small></span><span class="tag-outline">体验分享</span><button class="more-btn" data-action="story-more">•••</button></header>
      <p>AR 眼镜的 3D 箭头真的太实用了，晚上不用低头看手机。跟着光走就到地铁站，路灯光圈看着也舒服。</p>
      <footer><span>2 小时前</span><span class="story-actions"><button class="like" data-action="like"><span class="like-ico">${ic('heart')}</span><b>46</b></button><button>${ic('comment')}<b>12</b></button><button>${ic('share')}分享</button></span></footer>
    </article>
  </div>
</section>`;

XA_SCREENS.ar = `
<section class="screen scroll-screen" data-screen="ar">
  <header class="page-head">
    <button class="icon-btn" data-back="entertainment">${ic('back')}</button>
    <div class="head-title"><h2>小安 AR</h2><small><span data-i18n="arSub">眼镜控制台</span> · XA-0281</small></div>
    <button class="icon-btn" data-action="ar-settings">${ic('settings')}</button>
  </header>
  <div class="ar-device glass">
    <div class="ar-device-top"><span class="g-logo sm">${ic('glasses')}</span><span><b>小安 AR 眼镜</b><small>夜行增强版 · 镜架 XA-0281</small></span><span class="connected">已连接</span></div>
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

  <div class="section-title"><h3>安全感知</h3><small id="armedText">自动报警已就绪</small></div>
  <div class="sensing-card glass">
    <div class="sensing-head"><span class="mint">${ic('shield')}</span><span><b>安全感知已开启</b><small>所有传感器工作正常</small></span><span class="armed">ARMED</span></div>
    <div class="sensing-grid">
      <button class="sense on" data-sense="动作检测"><span>🏃 动作检测</span><small>跌倒 / 剧烈运动</small><i></i></button>
      <button class="sense on" data-sense="掉落检测"><span>🕶 掉落检测</span><small>镜架离脸</small><i></i></button>
      <button class="sense on" data-sense="呼救识别"><span>🎙 呼救识别</span><small>声纹关键词</small><i></i></button>
    </div>
    <p class="sensing-foot">触发自动动作前，发送位置，并通知 3 位紧急联系人</p>
  </div>

  <div class="audio-card glass"><span class="audio-ico">${ic('volume')}</span><span><b>开放式音频</b><small>不堵塞 · 你能听见环境声</small></span><input type="range" min="0" max="100" value="65" id="arVolume"></div>
  <p class="ar-connected">${ic('check')} 配对成功 · 已连续保护 1 小时 12 分钟</p>
  <div class="route-footer ar-footer">
    <button class="primary-btn" data-action="start-nav">${ic('navigation')}进入 AR 导航<small>预计 18 分钟</small></button>
    <button class="square-btn" data-action="find-glasses">${ic('pin')}</button>
  </div>
</section>`;

XA_SCREENS.profile = `
<section class="screen scroll-screen" data-screen="profile">
  <header class="page-head flat"><div class="head-title left"><h2 data-i18n="profile">我的</h2><small data-i18n="profileSub">守护设置与夜行记录</small></div><button class="icon-btn" data-action="settings">${ic('settings')}</button></header>
  <div class="profile-card glass"><span class="profile-avatar">安</span><span><b>小安用户</b><small>已连续守护 3 晚 · 杭州</small></span><span class="level">夜行者 Lv.3</span></div>
  <div class="stats-row"><div><b>18</b><small>安全行程</small></div><div><b>92</b><small>平均安全分</small></div><div><b>3</b><small>紧急联系人</small></div></div>
  <div class="menu-group">
    <button data-menu="contacts"><span class="menu-ico mint">${ic('users')}</span><span data-i18n="contacts">紧急联系人</span><small>3 位</small>${ic('chevron')}</button>
    <button data-menu="routes"><span class="menu-ico amber">${ic('route')}</span><span data-i18n="routes">我的安全路线</span><small>2 条</small>${ic('chevron')}</button>
    <button data-menu="history"><span class="menu-ico blue">${ic('clock')}</span><span data-i18n="history">守护记录</span>${ic('chevron')}</button>
  </div>
  <div class="section-title profile-section"><h3 data-i18n="settings">设置</h3><small data-i18n="settingsSub">守护偏好与账号</small></div>
  <div class="menu-group">
    <button data-menu="about"><span class="menu-ico blue">${ic('shield')}</span><span data-i18n="about">关于小安</span>${ic('chevron')}</button>
    <button data-menu="privacy"><span class="menu-ico mint">${ic('lock')}</span><span data-i18n="privacy">隐私与权限</span><small>位置 · 麦克风</small>${ic('chevron')}</button>
    <button data-action="settings"><span class="menu-ico amber">${ic('settings')}</span><span data-i18n="appearance">外观与主题</span><small data-i18n="themeName">薄荷夜色</small>${ic('chevron')}</button>
    <button data-action="account-security"><span class="menu-ico mint">${ic('lock')}</span><span data-i18n="accountSecurity">账号与安全</span><small data-i18n="deviceBound">已绑定设备</small>${ic('chevron')}</button>
    <button data-action="language"><span class="menu-ico blue">${ic('glasses')}</span><span data-i18n="language">管理语言</span><small data-i18n="languageName">简体中文</small>${ic('chevron')}</button>
    <button data-menu="device"><span class="menu-ico amber">${ic('glasses')}</span><span data-i18n="device">AR 眼镜设备</span><small>已连接</small>${ic('chevron')}</button>
  </div>
  <div class="menu-group account-actions">
    <button data-action="switch-account"><span class="menu-ico blue">${ic('users')}</span><span data-i18n="switchAccount">切换账号</span>${ic('chevron')}</button>
    <button data-action="logout-account" class="logout-row"><span class="menu-ico coral">${ic('close')}</span><span data-i18n="logout">退出登录</span>${ic('chevron')}</button>
  </div>
  <p class="version">小安 · 夜行安全系统 V1.3 · 概念设计原型</p>
</section>`;
