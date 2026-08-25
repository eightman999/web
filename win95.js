/* =========================================================================
   win95.js — サイト共通のWindows 95風シェル
   各ページのHTMLに手を入れずに、
     ・タイトルバーの [_][□][×] ボタン
     ・メニューバー（ファイル/編集/表示/…）
     ・画面下のタスクバー（スタートボタン＋時計）
     ・スタートメニュー（全ページへの移動）
   を差し込む。
   スマホではサイドバーのメニューを隠し、代わりにここが唯一のナビになる。
   JSが無効でも本文とサイドバーは従来どおり読める（段階的強化）。
   ========================================================================= */
(function () {
  'use strict';

  /* --- スタートメニューの項目定義（サイト全体で1か所） --- */
  var MENU = [
    { href: 'index.html',        ico: '🏠', label: 'トップ' },
    { divider: true },
    { href: 'works.html',        ico: '🛠', label: '作品集' },
    { href: 'uzume_player.html', ico: '♪',  label: 'Uzume Player' },
    { href: 'demo.html',         ico: '▶',  label: 'Uzume デモ' },
    { href: 'docs.html',         ico: '📚', label: 'DevDocs' },
    { divider: true },
    { href: 'blog.html',         ico: '📝', label: 'ブログ' },
    { href: 'poem.html',         ico: '🖋', label: 'ポエム' },
    { href: 'quotes.html',       ico: '💬', label: '好きな言葉' },
    { href: 'library.html',      ico: '📖', label: '書庫' },
    { href: 'omikuji.html',      ico: '⛩', label: '今日のおみくじ' },
    { divider: true },
    { href: 'bbs.html',          ico: '📋', label: 'BBS' },
    { href: 'link.html',         ico: '🔗', label: 'LINK' },
    { href: 'news.html',         ico: '🆕', label: '更新履歴' },
    { href: 'sitemap.html',      ico: '🗺', label: 'サイトマップ' }
  ];

  /* --- 現在のページ名（index扱いのフォールバック込み） --- */
  function currentPage() {
    var p = location.pathname.split('/').pop();
    return (!p || p === '') ? 'index.html' : p;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* -----------------------------------------------------------------------
     1. タイトルバーのボタンとメニューバー
     ----------------------------------------------------------------------- */
  function buildWindowChrome() {
    var container = document.querySelector('.container');
    if (!container) return;
    var header = container.querySelector(':scope > header');
    if (!header) return;

    /* [_][□][×] — 見た目のみ。押しても何も壊さない。 */
    var ctrls = el('div', 'win-controls');
    ['_', '□', '×'].forEach(function (ch) {
      var b = el('b', null, ch);
      b.setAttribute('aria-hidden', 'true');
      ctrls.appendChild(b);
    });
    /* h1 の直後（サブテキスト <p> より前）に置く */
    var h1 = header.querySelector('h1');
    if (h1 && h1.nextSibling) header.insertBefore(ctrls, h1.nextSibling);
    else header.appendChild(ctrls);

    /* メニューバー */
    var bar = el('div', 'win-menubar');
    bar.setAttribute('aria-hidden', 'true');
    [['ファイル', 'フ'], ['編集', '編'], ['表示', '表'], ['お気に入り', 'お'], ['ヘルプ', 'ヘ']]
      .forEach(function (pair) {
        var s = el('span');
        var u = el('u', null, pair[1]);
        s.appendChild(u);
        s.appendChild(document.createTextNode(pair[0].slice(1)));
        bar.appendChild(s);
      });
    header.parentNode.insertBefore(bar, header.nextSibling);
  }

  /* -----------------------------------------------------------------------
     2. タスクバー＋スタートメニュー
     ----------------------------------------------------------------------- */
  function buildTaskbar() {
    var here = currentPage();
    var pageTitle = (document.title || 'ウィンドウ').replace(/[†‡]/g, '').trim() || 'ウィンドウ';

    var menu = el('nav', 'win-startmenu');
    menu.id = 'win-startmenu';
    menu.setAttribute('data-open', '0');
    menu.setAttribute('aria-label', 'サイト内メニュー');

    var banner = el('div', 'banner', 'eightman 95');
    menu.appendChild(banner);

    var ul = el('ul');
    MENU.forEach(function (item) {
      var li = el('li');
      if (item.divider) {
        li.className = 'divider';
      } else {
        var a = el('a');
        a.href = item.href;
        var ico = el('span', 'ico', item.ico);
        ico.setAttribute('aria-hidden', 'true');
        a.appendChild(ico);
        a.appendChild(document.createTextNode(item.label));
        if (item.href === here) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    menu.appendChild(ul);

    var bar = el('div', 'win-taskbar');

    var start = el('button', 'win-start');
    start.type = 'button';
    start.setAttribute('aria-expanded', 'false');
    start.setAttribute('aria-controls', 'win-startmenu');
    var flag = el('span', 'flag');
    flag.setAttribute('aria-hidden', 'true');
    start.appendChild(flag);
    start.appendChild(document.createTextNode('スタート'));
    bar.appendChild(start);

    var sep = el('div', 'sep');
    sep.setAttribute('aria-hidden', 'true');
    bar.appendChild(sep);

    var task = el('div', 'win-task', pageTitle);
    task.setAttribute('aria-hidden', 'true');
    bar.appendChild(task);

    var clock = el('div', 'win-clock');
    clock.setAttribute('aria-hidden', 'true');
    bar.appendChild(clock);

    document.body.appendChild(menu);
    document.body.appendChild(bar);

    /* --- 開閉 --- */
    function setOpen(open) {
      menu.setAttribute('data-open', open ? '1' : '0');
      start.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var first = menu.querySelector('a');
        if (first) first.focus();
      }
    }
    start.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(menu.getAttribute('data-open') !== '1');
    });
    document.addEventListener('click', function (e) {
      if (menu.getAttribute('data-open') !== '1') return;
      if (menu.contains(e.target) || start.contains(e.target)) return;
      setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.getAttribute('data-open') === '1') {
        setOpen(false);
        start.focus();
      }
    });

    /* --- 時計 --- */
    function tick() {
      var d = new Date();
      var h = d.getHours();
      var ampm = h < 12 ? '午前' : '午後';
      var h12 = h % 12; if (h12 === 0) h12 = 12;
      clock.textContent = ampm + ' ' + h12 + ':' + String(d.getMinutes()).padStart(2, '0');
    }
    tick();
    setInterval(tick, 15000);
  }

  /* -----------------------------------------------------------------------
     3. marquee の動きを抑える設定を尊重する
     ----------------------------------------------------------------------- */
  function respectReducedMotion() {
    if (!window.matchMedia) return;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    Array.prototype.forEach.call(document.querySelectorAll('marquee'), function (m) {
      if (typeof m.stop === 'function') m.stop();
      m.setAttribute('behavior', 'slide');
      m.setAttribute('loop', '1');
    });
  }

  function init() {
    buildWindowChrome();
    buildTaskbar();
    respectReducedMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
