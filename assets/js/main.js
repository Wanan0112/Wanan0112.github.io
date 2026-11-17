/* ============================================================
   作品集框架 · 交互脚本
   ------------------------------------------------------------
   1. 内容渲染（精选 / 陈列 / 技能 / 履历 / 服务 / 联系方式）
   2. 图片占位检测（没有图时显示虚线框）
   3. 项目详情弹层
   4. 图片灯箱
   5. 滚动进场动画
   6. 导航（移动端菜单 / 当前区块高亮）
   7. 表单提示 / 回到顶部
   ============================================================ */

(function () {
  'use strict';

  var DATA = window.SITE_DATA || {};
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------- 1. 内容渲染 ---------- */

  // 服务图标（手绘线稿风格）
  var ICONS = {
    model:
      '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9" fill="none" stroke="currentColor" stroke-width="1.9"/>',
    scene:
      '<circle cx="17.2" cy="6.8" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3 18.5l5.5-7 4 5 3-3.6L21 18.5H3z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    brush:
      '<path d="M6 20c3 1 5-1 5-4 0-2-1-3-3-3s-3 1-3 3c0 2-1 3-3 4z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M11 15L20 5a2.6 2.6 0 013.7 3.7L14.5 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    brand:
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><circle cx="15" cy="9.5" r="1.8" fill="currentColor"/><circle cx="15.5" cy="15" r="1.8" fill="currentColor"/><path d="M9 16c2.4 2 5.4 2 7 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    mascot:
      '<path d="M6.5 9C5 5.5 8 3 9.5 6M17.5 9C19 5.5 16 3 14.5 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="9.6" cy="12.4" r="1.1" fill="currentColor"/><circle cx="14.4" cy="12.4" r="1.1" fill="currentColor"/><path d="M10 15.4c1.2.9 2.8.9 4 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    exhibit:
      '<rect x="3.5" y="4.5" width="17" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8 21l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12.5l2.5-3 2 2.4 2.5-3.4 3 4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  };

  function slotHTML(src, label, extraClass, ar) {
    return (
      '<figure class="slot ' +
      (extraClass || '') +
      '"' +
      (ar ? ' style="--ar:' + ar + '"' : '') +
      '>' +
      '<img src="' +
      src +
      '" alt="' +
      label +
      '" loading="lazy" />' +
      '<span class="slot__label">' +
      label +
      '</span>' +
      '</figure>'
    );
  }

  function renderFeatured() {
    var wrap = $('#polaroids');
    if (!wrap) return;
    var list = DATA.featured || [];
    wrap.innerHTML = list
      .map(function (item, i) {
        var idx = String(i + 1).padStart(2, '0');
        return (
          '<button class="polaroid' +
          (item.shape === 'tall' ? ' polaroid--tall' : '') +
          '" type="button" style="--rot:' +
          (item.rot || '0deg') +
          '" data-project="' +
          item.id +
          '">' +
          slotHTML(item.image, '作品图位 · ' + item.id, 'polaroid__slot', item.ratio) +
          '<div class="polaroid__cap">' +
          '<span class="polaroid__idx">' +
          idx +
          ' / ' +
          String(list.length).padStart(2, '0') +
          '</span>' +
          '<span class="polaroid__tag">' +
          (item.category || '') +
          '</span>' +
          '</div>' +
          '<p class="polaroid__title">' +
          (item.title || '') +
          '</p>' +
          '<p class="polaroid__more">' +
          (item.client || '') +
          ' · ' +
          (item.year || '') +
          ' →</p>' +
          '</button>'
        );
      })
      .join('');
  }

  function artHTML(item) {
    return (
      '<button class="art" type="button" data-lightbox="' +
      item.id +
      '" data-category="' +
      (item.category || '') +
      '">' +
      slotHTML(item.image, '作品图位 · ' + item.id, 'art__slot', item.ratio) +
      '<div class="art__cap">' +
      '<span class="art__title">' +
      (item.title || '') +
      '</span>' +
      '<span class="art__meta">' +
      (item.meta || '') +
      '</span>' +
      '</div>' +
      '</button>'
    );
  }

  // 全部作品：按专业方向分组排版
  function renderGroups() {
    var wrap = $('#boardAll');
    if (!wrap) return;
    var works = DATA.works || [];
    var groups = DATA.groups || [];
    if (!groups.length) {
      wrap.innerHTML = works.map(artHTML).join('');
      return;
    }
    wrap.innerHTML = groups
      .map(function (g) {
        var items = works.filter(function (w) {
          return w.category === g.cat;
        });
        if (!items.length) return '';
        var cols = Math.min(items.length, 5);
        return (
          '<section class="work-group" data-cat="' +
          g.cat +
          '">' +
          '<h3 class="board-label" data-reveal>' +
          g.label +
          ' <span class="board-label__n">' +
          items.length +
          ' 件</span></h3>' +
          '<div class="board board--row" style="--cols:' +
          cols +
          '">' +
          items.map(artHTML).join('') +
          '</div>' +
          '</section>'
        );
      })
      .join('');
  }

  // 主题海报设计（展板）：单独成区，不参与分类筛选
  function renderPosters() {
    var wrap = $('#boardPoster');
    if (!wrap) return;
    wrap.innerHTML = (DATA.posters || []).map(artHTML).join('');
  }

  function renderFilters() {
    var wrap = $('#filters');
    if (!wrap) return;
    var filters = DATA.filters || ['全部'];
    wrap.innerHTML = filters
      .map(function (f, i) {
        return (
          '<button class="filter' +
          (i === 0 ? ' is-active' : '') +
          '" type="button" role="tab" data-filter="' +
          f +
          '">' +
          f +
          '</button>'
        );
      })
      .join('');
  }

  function renderSkills() {
    var wrap = $('#skillTags');
    if (!wrap) return;
    wrap.innerHTML = (DATA.skills || [])
      .map(function (s) {
        return '<span class="tag">' + s + '</span>';
      })
      .join('');
  }

  function renderTimeline() {
    var wrap = $('#timeline');
    if (!wrap) return;
    wrap.innerHTML = (DATA.timeline || [])
      .map(function (t) {
        return (
          '<li><span class="timeline__k">' +
          t.year +
          '</span><span class="timeline__v">' +
          t.text +
          '</span></li>'
        );
      })
      .join('');
  }

  function renderHonors() {
    var wrap = $('#honors');
    if (!wrap) return;
    wrap.innerHTML = (DATA.honors || [])
      .map(function (h) {
        return (
          '<li><span class="honors__k">' +
          h.year +
          '</span><span class="honors__v">' +
          h.text +
          '</span></li>'
        );
      })
      .join('');
  }

  function renderServices() {
    var wrap = $('#servicesGrid');
    if (!wrap) return;
    wrap.innerHTML = (DATA.services || [])
      .map(function (s) {
        var icon =
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[s.icon] || ICONS.brush) + '</svg>';
        return (
          '<article class="service" data-reveal>' +
          '<span class="service__icon">' +
          icon +
          '</span>' +
          '<h3 class="service__title">' +
          s.title +
          '</h3>' +
          '<p class="service__desc">' +
          s.desc +
          '</p>' +
          '<ul class="service__list">' +
          (s.list || [])
            .map(function (li) {
              return '<li>' + li + '</li>';
            })
            .join('') +
          '</ul>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderContact() {
    var links = $('#contactLinks');
    if (links) {
      links.innerHTML = (DATA.contactLinks || [])
        .map(function (l) {
          return '<a href="' + l.href + '">' + l.label + ' ↗</a>';
        })
        .join('');
    }
    var social = $('#footerSocial');
    if (social) {
      social.innerHTML = (DATA.socials || [])
        .map(function (s) {
          return '<a href="' + s.href + '" title="' + (s.title || '') + '">' + s.label + '</a>';
        })
        .join('');
    }
  }

  /* ---------- 2. 图片占位检测 ---------- */
  function wireSlots(root) {
    $$('img', root || document).forEach(function (img) {
      if (img.dataset.wired) return;
      img.dataset.wired = '1';
      var mark = function () {
        var holder = img.closest('.slot');
        if (holder) holder.classList.add('is-filled');
      };
      if (img.complete && img.naturalWidth > 0) mark();
      img.addEventListener('load', mark);
      img.addEventListener('error', function () {
        var holder = img.closest('.slot');
        if (holder) holder.classList.remove('is-filled');
      });
    });
  }

  /* ---------- 3. 项目详情弹层 ---------- */
  var modal = $('#projectModal');
  var modalState = { index: 0, items: [] };

  function projectItems() {
    var list = (DATA.featured || []).slice();
    return list.length ? list : [DATA.projectDetail || {}];
  }

  function fillModal(item, index, total) {
    var d = item.detail || DATA.projectDetail || {};
    var set = function (sel, val) {
      var node = $(sel);
      if (node) node.textContent = val;
    };
    set('#modalIndex', 'Project ' + (index + 1) + ':');
    set('#modalClient', item.client || d.client || '');
    set('#modalTitle', item.title || d.title || '');
    set('#modalSubtitle', d.subtitle || '');

    var facts = $('#modalFacts');
    if (facts) {
      facts.innerHTML = (d.facts || [])
        .map(function (f) {
          return '<div><dt>' + f.k + '</dt><dd>' + f.v + '</dd></div>';
        })
        .join('');
    }

    var desc = $('#modalDesc');
    if (desc) {
      desc.innerHTML = d.desc
        ? '<p>' + d.desc + '</p>'
        : '<p>项目背景、协作方式与最终成果详见上方要点。</p>';
    }

    var hero = $('.slot--hero', modal);
    if (hero) {
      var img = $('img', hero);
      var label = $('.slot__label', hero);
      var src = d.hero || item.image || '';
      if (img) img.src = src;
      if (label) label.textContent = '项目主视觉 · ' + (item.title || '');
      hero.classList.remove('is-filled');
    }

    var strip = $('#modalStrip');
    if (strip) {
      strip.innerHTML = (d.strip || [])
        .map(function (src, i) {
          return slotHTML(src, '图集 ' + (i + 1) + ' · 占位', '');
        })
        .join('');
    }

    wireSlots(modal);
  }

  function openModal(index) {
    if (!modal) return;
    modalState.items = projectItems();
    modalState.index = (index + modalState.items.length) % modalState.items.length;
    fillModal(modalState.items[modalState.index], modalState.index, modalState.items.length);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    var close = $('.modal__close', modal);
    if (close) close.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  /* ---------- 4. 灯箱 ---------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCap = $('#lbCaption');
  var lbList = [];
  var lbIndex = 0;

  // 没有图片时用矢量占位图，避免出现破图
  var PLACEHOLDER_IMG =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">' +
        '<rect width="100%" height="100%" fill="#f2e8d4" stroke="#23414c" stroke-width="6" stroke-dasharray="18 14"/>' +
        '<text x="50%" y="50%" font-family="monospace" font-size="34" fill="#5b7b85" text-anchor="middle">图片占位</text>' +
        '</svg>'
    );

  function lbShow(index) {
    if (!lightbox || !lbList.length) return;
    lbIndex = (index + lbList.length) % lbList.length;
    var item = lbList[lbIndex];
    if (lbImg) {
      lbImg.onerror = function () {
        lbImg.onerror = null;
        lbImg.src = PLACEHOLDER_IMG;
      };
      lbImg.src = item.image;
      lbImg.alt = item.title || '';
    }
    if (lbCap) lbCap.textContent = (item.title || '') + ' · ' + (item.meta || '');
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  }

  function lbClose() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  /* ---------- 5. 滚动进场 ---------- */
  var revealObserver = null;
  function initReveal() {
    var nodes = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) {
        n.classList.add('is-visible');
      });
      return;
    }
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    nodes.forEach(function (n) {
      revealObserver.observe(n);
    });
  }

  /* ---------- 6. 导航 ---------- */
  function initNav() {
    var toggle = $('#navToggle');
    var panel = $('#navPanel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.hasAttribute('hidden');
        if (open) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
        toggle.setAttribute('aria-expanded', String(open));
      });
      $$('a', panel).forEach(function (a) {
        a.addEventListener('click', function () {
          panel.setAttribute('hidden', '');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    var links = $$('.nav__link');
    var sections = links
      .map(function (l) {
        var id = l.getAttribute('href');
        return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (l) {
              l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
            });
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      sections.forEach(function (s) {
        spy.observe(s);
      });
    }
  }

  /* ---------- 7. 表单 & 回到顶部 ---------- */
  var toastTimer = null;
  function showToast(msg) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.hidden = true;
      }, 320);
    }, 2600);
  }

  function initForm() {
    var form = $('#contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('表单尚未接入，请直接邮件联系：3543157951@qq.com');
    });
  }

  function initBackTop() {
    var btn = $('#backTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 分类筛选 ---------- */
  function initFilters() {
    var wrap = $('#filters');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      $$('.filter', wrap).forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      var key = btn.dataset.filter;
      // 只筛选分类作品组，主题海报展板区不参与筛选
      $$('.work-group').forEach(function (group) {
        var match = key === '全部' || (group.dataset.cat || '') === key;
        group.style.display = match ? '' : 'none';
      });
      $$('#boardPoster .art').forEach(function (art) {
        art.style.display = '';
      });
    });
  }

  /* ---------- 全局事件委托 ---------- */
  function initGlobal() {
    document.addEventListener('click', function (e) {
      var toastEl = e.target.closest('[data-toast]');
      if (toastEl) {
        e.preventDefault();
        showToast(toastEl.dataset.toast || '功能待接入');
        return;
      }

      var proj = e.target.closest('[data-project]');
      if (proj) {
        var idx = 0;
        var items = projectItems();
        items.forEach(function (it, i) {
          if (it.id === proj.dataset.project) idx = i;
        });
        openModal(idx);
        return;
      }

      var lb = e.target.closest('[data-lightbox]');
      if (lb) {
        lbList = (DATA.works || []).concat(DATA.posters || []);
        var i = 0;
        lbList.forEach(function (it, n) {
          if (it.id === lb.dataset.lightbox) i = n;
        });
        lbShow(i);
        return;
      }

      if (e.target.closest('[data-close]')) {
        if (!modal.hidden) closeModal();
        if (lightbox && !lightbox.hidden) lbClose();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (modal && !modal.hidden) closeModal();
        if (lightbox && !lightbox.hidden) lbClose();
      }
      if (lightbox && !lightbox.hidden) {
        if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
        if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      }
    });

    var prev = $('#modalPrev');
    var next = $('#modalNext');
    if (prev) prev.addEventListener('click', function () { openModal(modalState.index - 1); });
    if (next) next.addEventListener('click', function () { openModal(modalState.index + 1); });

    var lbPrev = $('#lbPrev');
    var lbNext = $('#lbNext');
    if (lbPrev) lbPrev.addEventListener('click', function () { lbShow(lbIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { lbShow(lbIndex + 1); });
  }

  /* ---------- 8. 动效 ---------- */

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // 8.1 开场遮罩
  function initLoader() {
    var loader = $('#loader');
    if (!loader) return;
    var hidden = false;
    var hide = function () {
      if (hidden) return;
      hidden = true;
      loader.classList.add('is-done');
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 900);
    };
    if (document.readyState === 'complete') {
      setTimeout(hide, prefersReduced() ? 0 : 520);
    } else {
      window.addEventListener('load', function () {
        setTimeout(hide, prefersReduced() ? 0 : 520);
      });
    }
    setTimeout(hide, 2800); // 兜底，避免图片卡住时一直挡着
  }

  // 8.2 阅读进度条
  function initProgress() {
    var bar = $('#navProgress');
    if (!bar) return;
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, p)).toFixed(2) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // 8.3 关键词跑马灯
  function initMarquee() {
    var track = $('#marqueeTrack');
    if (!track) return;
    var words = DATA.marquee || ['三维模型', '场景地编', '视觉设计'];
    var one = words
      .map(function (w) {
        return '<span>' + w + '</span><i>✦</i>';
      })
      .join('');
    track.innerHTML = one + one; // 两份内容才能无缝循环
  }

  // 8.4 标题逐字弹入
  function splitChars(el) {
    if (el.dataset.split === '1') return;
    el.dataset.split = '1';
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    var i = 0;
    var words = text.split(' ');
    words.forEach(function (word, wi) {
      var wd = document.createElement('span');
      wd.className = 'wd';
      Array.prototype.forEach.call(word.split(''), function (ch) {
        var span = document.createElement('span');
        span.className = 'ch';
        span.textContent = ch;
        span.style.setProperty('--d', i * 58 + 'ms');
        wd.appendChild(span);
        i++;
      });
      el.appendChild(wd);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  function initSplit() {
    var els = $$('.split');
    if (!els.length) return;

    var play = function (el) {
      splitChars(el);
      el.classList.add('is-in');
    };

    if (!('IntersectionObserver' in window)) {
      els.forEach(play);
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          play(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  // 8.5 手绘圈注
  function initMarks() {
    var els = $$('.mark');
    if (!els.length) return;
    var NS = 'http://www.w3.org/2000/svg';

    els.forEach(function (el) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 200 60');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('class', 'mark__svg');
      svg.setAttribute('aria-hidden', 'true');

      var path = document.createElementNS(NS, 'path');
      path.setAttribute('pathLength', '1');
      path.setAttribute(
        'd',
        'M6 44C10 14 58 5 118 6C172 7 196 20 194 33C192 47 148 57 100 55C50 53 2 54 6 44Z'
      );
      svg.appendChild(path);
      el.insertBefore(svg, el.firstChild);
    });

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('is-in');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  // 8.6 鼠标视差 + 滚动视差
  function initParallax() {
    var depthEls = $$('[data-depth]');
    var scrollEls = $$('[data-scroll]');

    var tx = 0;
    var ty = 0;
    var cx = 0;
    var cy = 0;
    var raf = null;

    function loop() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      depthEls.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        el.style.setProperty('--px', (cx * d * -70).toFixed(2) + 'px');
        el.style.setProperty('--py', (cy * d * -52).toFixed(2) + 'px');
      });
      if (Math.abs(tx - cx) > 0.0008 || Math.abs(ty - cy) > 0.0008) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    if (depthEls.length) {
      window.addEventListener('mousemove', function (e) {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    }

    if (scrollEls.length) {
      var onScroll = function () {
        var vh = window.innerHeight;
        scrollEls.forEach(function (el) {
          var host = el.parentElement;
          if (!host) return;
          var rect = host.getBoundingClientRect();
          var k = parseFloat(el.getAttribute('data-scroll')) || 0;
          var progress = (vh - rect.top) / (vh + rect.height) - 0.5;
          el.style.setProperty('--sy', (progress * k * 240).toFixed(2) + 'px');
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    }
  }

  // 8.7 卡片 3D 倾斜
  function initTilt() {
    $$('.polaroid, .art, .service').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  // 8.8 磁吸按钮
  function initMagnetic() {
    $$('.cover__cta .btn').forEach(function (btn) {
      btn.classList.add('magnet');
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px');
        btn.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.38).toFixed(1) + 'px');
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  // 8.9 笔触光标
  function initCursor() {
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
    var cur = $('#cursor');
    if (!cur) return;
    document.body.classList.add('has-cursor');

    var x = 0;
    var y = 0;
    var tx = 0;
    var ty = 0;
    var rx = 0;
    var ry = 0;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      cur.classList.add('is-on');
      var hot = e.target.closest && e.target.closest('a, button, .art, .polaroid, input, textarea, select');
      cur.classList.toggle('is-hot', !!hot);
    });

    (function loop() {
      x += (tx - x) * 0.24;
      y += (ty - y) * 0.24;
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      cur.style.setProperty('--x', x.toFixed(1) + 'px');
      cur.style.setProperty('--y', y.toFixed(1) + 'px');
      cur.style.setProperty('--rx', rx.toFixed(1) + 'px');
      cur.style.setProperty('--ry', ry.toFixed(1) + 'px');
      requestAnimationFrame(loop);
    })();
  }

  function initMotion() {
    initLoader();
    initProgress();
    initMarquee();
    initSplit();
    initMarks();

    if (prefersReduced()) return;

    initParallax();
    initTilt();
    initMagnetic();
    initCursor();
  }

  /* ---------- 个人信息注入 ---------- */
  function applyProfile() {
    var p = DATA.profile || {};
    var c = DATA.cover || {};
    var set = function (sel, val) {
      var node = $(sel);
      if (node && val) node.textContent = val;
    };
    set('.nav__name', p.name);
    set('.nav__role', p.role);
    set('.cover__sub', c.sub);
    set('.cover__desc', c.desc);
    set('.cover__framecap', c.cap);
    set('.footer__name', p.name);
    set('.footer__copy', '© 2026 ' + (p.name || '') + ' · 保留所有权利');
    set('#metaCity', p.city);
    set('#metaStatus', '2026 届 · 寻找三维建模实习');
    set('#metaReply', '24 小时内');
  }

  /* ---------- 启动 ---------- */
  function init() {
    applyProfile();
    renderFeatured();
    renderGroups();
    renderPosters();
    renderFilters();
    renderSkills();
    renderTimeline();
    renderHonors();
    renderServices();
    renderContact();

    wireSlots(document);
    initReveal();
    initNav();
    initFilters();
    initForm();
    initBackTop();
    initGlobal();
    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
