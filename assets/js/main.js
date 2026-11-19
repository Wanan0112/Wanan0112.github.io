/* ============================================================
   作品集框架 · 交互脚本
   ------------------------------------------------------------
   1. 内容渲染（精选 / 分类作品 / 技能 / 履历 / 服务 / 联系方式）
   2. 图片占位检测（没有图时显示虚线框）
   3. 项目详情弹层（含展示视频与设计说明）
   4. 图片灯箱
   5. 滚动进场动画
   6. 导航（移动端菜单 / 当前区块高亮）
   7. 表单提示 / 回到顶部
   8. 动效（开场 / 视差 / 逐字 / 光标…）
   9. IP 小精灵互动（靠近 / 悬停 / 点击 / 拖拽）
   ============================================================ */

(function () {
  'use strict';

  var DATA = window.SITE_DATA || {};
  var ASSETS = window.SITE_ASSETS || {};

  // 主题边框装饰：不用小精灵形象，只取三个种族的元素特征
  // red = 火团子的火焰，yellow = 咸蛋黄的粘液，blue = 蓝泡泡的泡泡
  function edgeDecor(theme) {
    var kind = theme === 'yellow' || theme === 'blue' ? theme : 'red';
    var n = kind === 'blue' ? 6 : 5;
    var parts = '';
    for (var i = 0; i < n; i++) {
      parts += '<i></i>';
    }
    return '<span class="edge-decor edge-decor--' + kind + '" aria-hidden="true">' + parts + '</span>';
  }

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------- 作品与素材查询 ---------- */
  function projectById(id) {
    var list = DATA.projects || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function projectAssets(p) {
    return (p && ASSETS[p.assets]) || { images: [], videos: [] };
  }

  // 全部图片（灯箱使用）
  function allImages() {
    var out = [];
    (DATA.projects || []).forEach(function (p) {
      (projectAssets(p).images || []).forEach(function (im, i) {
        out.push({ id: p.id + '-' + i, image: im.src, title: p.title, meta: im.cap });
      });
    });
    return out;
  }

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
        var p = projectById(item.project) || {};
        return (
          '<button class="polaroid' +
          (item.shape === 'tall' ? ' polaroid--tall' : '') +
          '" type="button" style="--rot:' +
          (item.rot || '0deg') +
          '" data-project="' +
          (item.project || '') +
          '">' +
          slotHTML(item.image, '作品图位 · ' + (p.title || ''), 'polaroid__slot', item.ratio) +
          '<div class="polaroid__cap">' +
          '<span class="polaroid__idx">' +
          idx +
          ' / ' +
          String(list.length).padStart(2, '0') +
          '</span>' +
          '<span class="polaroid__tag">' +
          (p.category || '') +
          '</span>' +
          '</div>' +
          '<p class="polaroid__title">' +
          (p.title || '') +
          '</p>' +
          '<p class="polaroid__more">' +
          (p.meta || '') +
          ' · ' +
          (p.year || '') +
          ' →</p>' +
          '</button>'
        );
      })
      .join('');
  }

  // 全部作品：严格按一级目录分组；每个二级项目只出现一次
  function renderGroups() {
    var wrap = $('#boardAll');
    if (!wrap) return;
    var cats = DATA.categories || [];
    wrap.innerHTML = cats
      .map(function (cat) {
        var items = (cat.projects || []).map(projectById).filter(Boolean);
        if (!items.length) return '';

        // 去重：同一个项目只在一栏里出现一次
        var seen = {};
        items = items.filter(function (p) {
          if (seen[p.id]) return false;
          seen[p.id] = 1;
          return true;
        });

        var vcount = 0;
        var picount = 0;
        items.forEach(function (p) {
          var a = projectAssets(p);
          vcount += (a.videos || []).length;
          picount += (a.images || []).length;
        });

        var head =
          '<div class="work-group__head" data-reveal>' +
          '<h3 class="board-label">' +
          cat.label +
          ' <span class="board-label__n">' +
          items.length +
          ' 个项目 · ' +
          picount +
          ' 张图' +
          (vcount ? ' · ' + vcount + ' 段视频' : '') +
          '</span></h3>' +
          '<p class="work-cat__desc">' +
          (cat.desc || '') +
          '</p>' +
          '</div>';

        // 展板：保留横向相片带（15 张展板各为独立作品）
        if (cat.cat === '展板') {
          var railCards = [];
          var seq = 0;
          items.forEach(function (p) {
            (projectAssets(p).rail || []).forEach(function (im) {
              railCards.push(
                '<button class="rail__card" type="button" data-project="' +
                p.id +
                '" style="--i:' +
                seq +
                '">' +
                '<img src="' +
                im.src +
                '" alt="' +
                (im.cap || p.title || '') +
                '" loading="lazy" />' +
                edgeDecor(cat.theme) +
                '<span class="rail__tip"><em>' +
                (p.category || '') +
                '</em>' +
                (p.title || '') +
                '<i>' +
                (im.cap || '') +
                '</i></span>' +
                '</button>'
              );
              seq++;
            });
          });
          return (
            '<section class="work-group rail-group" data-cat="' +
            cat.cat +
            '" data-theme="' +
            (cat.theme || 'red') +
            '">' +
            head +
            '<div class="rail" data-rail>' +
            '<div class="rail__viewport">' +
            '<div class="rail__track">' +
            '<div class="rail__set">' +
            railCards.join('') +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</section>'
          );
        }

        // 其他分类：一个作品一张卡，点击查看完整内容
        return (
          '<section class="work-group" data-cat="' +
          cat.cat +
          '" data-theme="' +
          (cat.theme || 'red') +
          '">' +
          head +
          '<div class="proj-grid" style="--cols:' +
          Math.min(items.length, 3) +
          '">' +
          items
            .map(function (p) {
              var a = projectAssets(p);
              var cover = (a.rail && a.rail[0]) || (a.images && a.images[0]) || {};
              var vc = (a.videos || []).length;
              return (
                '<button class="pcard" type="button" data-project="' +
                p.id +
                '">' +
                '<div class="pcard__media" style="--ar:' +
                (cover.ratio || 1.5) +
                '">' +
                '<img src="' +
                (cover.src || '') +
                '" alt="' +
                (p.title || '') +
                '" loading="lazy" />' +
                '<span class="pcard__badge">' +
                (a.images || []).length +
                ' 张图' +
                (vc ? ' · ' + vc + ' 视频' : '') +
                '</span>' +
                '</div>' +
                '<div class="pcard__body">' +
                '<span class="pcard__cat">' +
                (p.category || '') +
                '</span>' +
                '<h4 class="pcard__title">' +
                (p.title || '') +
                '</h4>' +
                '<p class="pcard__sub">' +
                (p.subtitle || '') +
                '</p>' +
                '<span class="pcard__path">' +
                (p.folder || '') +
                '</span>' +
                '<span class="pcard__cta">查看作品详情 →</span>' +
                '</div>' +
                edgeDecor(cat.theme) +
                '</button>'
              );
            })
            .join('') +
          '</div>' +
          '</section>'
        );
      })
      .join('');
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
    return DATA.projects || [];
  }

  function fillModal(p, index, total) {
    var set = function (sel, val) {
      var node = $(sel);
      if (node) node.textContent = val;
    };
    set('#modalIndex', '项目 ' + (index + 1) + ' / ' + total);
    set('#modalPath', p.folder || '');
    set('#modalClient', p.meta || '');
    set('#modalTitle', p.title || '');
    set('#modalSubtitle', p.subtitle || '');

    var facts = $('#modalFacts');
    if (facts) {
      facts.innerHTML = (p.facts || [])
        .map(function (f) {
          return '<div><dt>' + f.k + '</dt><dd>' + f.v + '</dd></div>';
        })
        .join('');
    }

    var desc = $('#modalDesc');
    if (desc) {
      desc.innerHTML = p.desc
        ? '<p>' + p.desc + '</p>'
        : '<p>项目背景、协作方式与最终成果详见上方要点。</p>';
    }

    var a = projectAssets(p);
    var imgs = a.images || [];
    var vids = a.videos || [];

    // 展示视频
    var vwrap = $('#modalVideos');
    if (vwrap) {
      vwrap.innerHTML = vids.length
        ? '<h4 class="mini-head">展示视频</h4>' +
          vids
            .map(function (v) {
              return (
                '<figure class="pv">' +
                '<video controls preload="none" playsinline poster="' +
                (v.poster || '') +
                '">' +
                '<source src="' +
                v.src +
                '" type="video/mp4" />' +
                '您的浏览器不支持视频播放，可<a href="' +
                v.src +
                '" download>下载视频</a>观看。' +
                '</video>' +
                '<figcaption>' +
                (v.cap || '') +
                '</figcaption>' +
                '</figure>'
              );
            })
            .join('')
        : '';
      vwrap.hidden = !vids.length;
    }

    // 主视觉
    var hero = $('.slot--hero', modal);
    if (hero) {
      var img = $('img', hero);
      var label = $('.slot__label', hero);
      if (img) img.src = imgs.length ? imgs[0].src : '';
      if (label) label.textContent = '项目主视觉 · ' + (p.title || '');
      hero.classList.remove('is-filled');
    }

    // 图集
    var strip = $('#modalStrip');
    if (strip) {
      strip.innerHTML = imgs
        .map(function (im, i) {
          return (
            '<button class="slot slot--strip" type="button" data-lightbox="' +
            p.id +
            '-' +
            i +
            '">' +
            '<img src="' +
            im.src +
            '" alt="' +
            (im.cap || '') +
            '" loading="lazy" />' +
            '<span class="slot__label">' +
            (im.cap || '') +
            '</span>' +
            '</button>'
          );
        })
        .join('');
    }

    // 设计说明
    var notes = $('#modalNotes');
    if (notes) {
      var ns = p.notes || [];
      notes.innerHTML = ns.length
        ? '<h4 class="mini-head">设计说明</h4>' +
          ns
            .map(function (n) {
              return (
                '<div class="note"><h5>' +
                (n.title || '') +
                '</h5><p>' +
                (n.body || '') +
                '</p></div>'
              );
            })
            .join('')
        : '';
      notes.hidden = !ns.length;
    }

    wireSlots(modal);
  }

  function openModal(index) {
    if (!modal) return;
    modalState.items = projectItems();
    if (!modalState.items.length) return;
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
    $$('video', modal).forEach(function (v) {
      try {
        v.pause();
      } catch (e) {}
    });
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
      // 筛选一级目录分组（含展板相片带）
      $$('.work-group').forEach(function (group) {
        var match = key === '全部' || (group.dataset.cat || '') === key;
        group.style.display = match ? '' : 'none';
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
        lbList = allImages();
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
      var hot = e.target.closest && e.target.closest('a, button, .art, .polaroid, .ip-decor__item, input, textarea, select');
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

  /* ---------- 9. IP 小精灵互动 ----------
     待机性格（CSS） + 鼠标靠近 + 悬停气泡 + 点击爆点 + 拖拽
  ------------------------------------------------ */
  function initIpMascots() {
    var items = $$('.ip-decor__item');
    if (!items.length) return;

    var NEAR_RADIUS = 210;

    // 点击时迸出的粒子
    function spawnSparks(item) {
      var r = item.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var color = item.getAttribute('data-spark') || '#e2564a';
      var ring = item.classList.contains('ip-decor__item--blue');
      var count = 8;

      for (var i = 0; i < count; i++) {
        var p = document.createElement('span');
        p.className = 'ip-spark' + (ring ? ' ip-spark--ring' : '');
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        p.style.background = color;
        p.style.color = color;
        var a = (Math.PI * 2 * i) / count + Math.random() * 0.7;
        var dist = 38 + Math.random() * 34;
        p.style.setProperty('--dx', (Math.cos(a) * dist).toFixed(1) + 'px');
        p.style.setProperty('--dy', (Math.sin(a) * dist).toFixed(1) + 'px');
        p.style.setProperty('--spin', (Math.random() * 200 - 100).toFixed(0) + 'deg');
        p.style.animationDelay = i * 18 + 'ms';
        document.body.appendChild(p);
        (function (el) {
          setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
          }, 1300);
        })(p);
      }
    }

    items.forEach(function (item) {
      var bubble = $('.ip-decor__bubble', item);
      var dragging = false;
      var dragged = false;
      var lastDrag = 0;
      var startX = 0;
      var startY = 0;
      var baseX = 0;
      var baseY = 0;

      // 台词气泡
      function say(text) {
        if (!bubble) return;
        bubble.textContent = text || '';
        item.classList.add('is-say');
        clearTimeout(item._sayTimer);
        item._sayTimer = setTimeout(function () {
          item.classList.remove('is-say');
          bubble.textContent = '';
        }, 2600);
      }

      // 点击：挤压回弹 + 迸出粒子 + 说话
      function pop() {
        item.classList.remove('is-pop');
        void item.offsetWidth; // 强制重排以重播动画
        item.classList.add('is-pop');
        setTimeout(function () {
          item.classList.remove('is-pop');
        }, 620);
        spawnSparks(item);
        say(item.getAttribute('data-say'));
      }

      // 悬停显示名字
      item.addEventListener('pointerenter', function () {
        if (bubble && !item.classList.contains('is-say')) {
          bubble.textContent = item.getAttribute('data-name') || '';
        }
      });

      item.addEventListener('pointerleave', function () {
        if (bubble && !item.classList.contains('is-say')) bubble.textContent = '';
      });

      // 按下：准备拖拽
      item.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        dragging = true;
        dragged = false;
        startX = e.clientX;
        startY = e.clientY;
        baseX = parseFloat(item.style.getPropertyValue('--ix')) || 0;
        baseY = parseFloat(item.style.getPropertyValue('--iy')) || 0;
        item.classList.add('is-drag');
        if (item.setPointerCapture) {
          try {
            item.setPointerCapture(e.pointerId);
          } catch (err) {}
        }
      });

      // 拖拽中：跟随指针并按方向倾斜
      item.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragged = true;

        var r = item.getBoundingClientRect();
        var nx = baseX + dx;
        var ny = baseY + dy;
        nx = Math.max(-r.width * 0.7, Math.min(window.innerWidth - r.width * 0.3, nx));
        ny = Math.max(-r.height * 0.7, Math.min(window.innerHeight - r.height * 0.3, ny));

        item.style.setProperty('--ix', nx.toFixed(1) + 'px');
        item.style.setProperty('--iy', ny.toFixed(1) + 'px');
        item.style.setProperty('--it', Math.max(-16, Math.min(16, dx * 0.07)).toFixed(2) + 'deg');
      });

      // 松手：弹回原位
      function endDrag() {
        if (!dragging) return;
        dragging = false;
        item.classList.remove('is-drag');
        if (dragged) {
          lastDrag = Date.now();
          item.style.setProperty('--ix', '0px');
          item.style.setProperty('--iy', '0px');
          item.style.setProperty('--it', '0deg');
        }
      }

      item.addEventListener('pointerup', endDrag);
      item.addEventListener('pointercancel', endDrag);
      item.addEventListener('lostpointercapture', endDrag);

      item.addEventListener('click', function () {
        if (Date.now() - lastDrag < 280) return; // 刚拖拽完不触发点击
        pop();
      });
    });

    // 鼠标靠近：被注意到（歪头看向光标）
    // 注：不使用 pointer:fine 作为门槛，鼠标事件本身就说明是鼠标设备；
    //     元素只有 3 个，直接同步计算即可，不必依赖 requestAnimationFrame
    function apply(mx, my) {
      items.forEach(function (item) {
        var r = item.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = mx - cx;
        var dy = my - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var hit = dist < NEAR_RADIUS;

        item.classList.toggle('is-near', hit);
        item.style.setProperty('--lean', hit ? Math.max(-13, Math.min(13, dx * 0.055)).toFixed(1) + 'deg' : '0deg');
      });
    }

    window.addEventListener('mousemove', function (e) {
      apply(e.clientX, e.clientY);
    });
  }

  /* ---------- 10. 横向流动作品带 ----------
     自动漂移 + 滚轮调速 + 拖拽拨动 + 悬停标签 + 点击进详情
     ------------------------------------------------ */
  function initRails() {
    var rails = $$('.rail');
    if (!rails.length) return;

    var BASE = 0.26; // 基础速度（px / 帧）
    var MAX = 5.2;
    var speed = BASE;
    var target = BASE;
    var lastWheel = 0;
    var raf = null;

    function render(rail) {
      var w = rail._setWidth;
      if (!w) return;
      var x = -(rail._offset % w);
      rail._track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    }

    // 复制一份内容直到宽度足够铺满视口，保证无缝循环
    function fill(rail) {
      var set = $('.rail__set', rail);
      if (!set) return;
      var w = set.offsetWidth || 1;
      var need = Math.ceil((window.innerWidth + 220) / w) + 1;
      var copies = Math.max(2, need);
      var track = set.parentNode;
      var have = track.children.length;
      var i;
      for (i = have; i < copies; i++) {
        track.appendChild(set.cloneNode(true));
      }
      while (track.children.length > copies) {
        track.removeChild(track.lastChild);
      }
      rail._setWidth = set.offsetWidth;
    }

    rails.forEach(function (rail) {
      rail._offset = 0;
      rail._paused = false;
      rail._dragging = false;
      rail._track = $('.rail__track', rail);
      rail._viewport = $('.rail__viewport', rail);
      fill(rail);

      // 卡片上下错落，形成丝带般的起伏
      $$('.rail__card', rail).forEach(function (card, i) {
        var dy = ((i % 5) - 2) * 9 + (i % 2 ? 5 : -5);
        card.style.setProperty('--dy', dy.toFixed(1) + 'px');
      });

      var vp = rail._viewport;
      if (!vp) return;

      // 悬停：暂停该条轨道
      vp.addEventListener('pointerenter', function () {
        rail._paused = true;
      });
      vp.addEventListener('pointerleave', function () {
        rail._paused = false;
      });

      // 滚轮：调节速度（向下加速 / 向上减速直至反向）
      vp.addEventListener(
        'wheel',
        function (e) {
          target = Math.max(-MAX, Math.min(MAX, target + e.deltaY * 0.008));
          lastWheel = Date.now();
        },
        { passive: true }
      );

      // 拖拽：直接拨动轨道
      var drag = { on: false, moved: false, x: 0, off: 0 };
      vp.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        drag.on = true;
        drag.moved = false;
        drag.x = e.clientX;
        drag.off = rail._offset;
        rail._dragging = true;
        if (vp.setPointerCapture) {
          try {
            vp.setPointerCapture(e.pointerId);
          } catch (err) {}
        }
      });
      vp.addEventListener('pointermove', function (e) {
        if (!drag.on) return;
        var dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 6) {
          drag.moved = true;
          vp.classList.add('is-drag');
        }
        if (drag.moved) {
          rail._offset = drag.off - dx;
          render(rail);
        }
      });
      function endDrag() {
        if (!drag.on) return;
        drag.on = false;
        rail._dragging = false;
        vp.classList.remove('is-drag');
        if (drag.moved) {
          // 拖拽结束后抑制这一次点击，避免误开详情
          vp.addEventListener(
            'click',
            function (ev) {
              ev.stopPropagation();
              ev.preventDefault();
            },
            { once: true, capture: true }
          );
        }
      }
      vp.addEventListener('pointerup', endDrag);
      vp.addEventListener('pointercancel', endDrag);
      vp.addEventListener('lostpointercapture', endDrag);
    });

    // 窗口尺寸变化：重新铺满
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        rails.forEach(function (rail) {
          fill(rail);
          render(rail);
        });
      }, 180);
    });

    if (prefersReduced()) {
      // 降低动态效果：轨道静止，改为可横向拖动查看
      rails.forEach(function (rail) {
        render(rail);
      });
      return;
    }

    function tick() {
      // 停止滚轮操作 1.6 秒后，速度缓缓回到基础流速
      if (lastWheel && Date.now() - lastWheel > 1600) {
        target = BASE;
        lastWheel = 0;
      }
      speed += (target - speed) * 0.1;

      rails.forEach(function (rail) {
        if (rail._paused || rail._dragging) return;
        rail._offset += speed;
        render(rail);
      });
      raf = requestAnimationFrame(tick);
    }
    tick();
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
    initIpMascots();
    initRails();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
