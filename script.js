/* 戏墨宋 SC · 落地页交互
   三处：字重演示的字号滑块 / 试写区（字重·字号·横竖排·按需载入完整字库）/ 滚动淡入
   无依赖，原生 JS。                                              */
(function () {
  'use strict';

  /* ── 卷二：字重演示的字号滑块 ───────────────────────────── */
  var sizeRange = document.getElementById('sizeRange');
  var sizeOut = document.getElementById('sizeOut');
  if (sizeRange) {
    var apply = function () {
      var v = +sizeRange.value;
      sizeOut.textContent = v;
      document.querySelectorAll('#weightsBox .wrow p').forEach(function (p) {
        p.style.fontSize = v + 'px';
      });
    };
    sizeRange.addEventListener('input', apply);
    apply();
  }

  /* ── 卷五：试写 ─────────────────────────────────────────── */
  var stage = document.getElementById('tryStage');
  var textEl = document.getElementById('tryText');
  var input = document.getElementById('tryInput');
  var wbox = document.getElementById('tryWeights');
  var dirBtn = document.getElementById('tryDir');
  var tSize = document.getElementById('trySize');
  var tSizeOut = document.getElementById('trySizeOut');
  var hint = document.getElementById('tryHint');

  var state = { w: 400, size: 96, vert: false, full: false };

  function render() {
    textEl.style.fontWeight = state.w;
    textEl.style.fontSize = state.size + 'px';
    tSizeOut.textContent = state.size;
    stage.classList.toggle('vert', state.vert);
    dirBtn.setAttribute('aria-pressed', String(state.vert));
    dirBtn.textContent = state.vert ? '横排' : '竖排';
  }

  /* 完整字库按需载入：只在用户真的要用时才拉这 3.2 MB。
     载入前先用页面子集显示——子集只含页面自身的字，用户输入别的字会回退到系统字体，
     所以这里明确告诉用户"正在载入"，而不是假装已经是完整字库。 */
  function loadFull(weight, done) {
    var map = { 400: 'full-ximosong-regular.woff2', 500: 'full-ximosong-medium.woff2', 600: 'full-ximosong-semibold.woff2', 900: 'full-ximosong-heavy.woff2' };
    var file = map[weight];
    if (!file) { done(false); return; }
    var face = new FontFace('Xi Mo Song SC Full', "url('fonts/" + file + "')",
      { weight: String(weight), display: 'swap' });
    hint.textContent = '正在载入完整字库（GB2312 · 7,690 字符 · 约 3.2 MB）…';
    face.load().then(function (f) {
      document.fonts.add(f);
      document.documentElement.style.setProperty('--fullready', '1');
      hint.textContent = '已载入完整字库，可任意输入汉字（覆盖现代中文约 99.7%，GB2312 之外的生僻字回退系统字体）。';
      state.full = true;
      done(true);
    }).catch(function () {
      hint.textContent = '完整字库载入失败（离线或路径不对）——当前显示的是页面子集。';
      done(false);
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      textEl.textContent = input.value || '戏墨宋';
    });
    textEl.textContent = input.value;
  }
  if (wbox) {
    wbox.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      wbox.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      state.w = +b.dataset.w;
      render();
      if ([400, 500, 600, 900].indexOf(state.w) >= 0 && !state.full) {
        loadFull(state.w, function () { textEl.style.fontFamily = "'Xi Mo Song SC Full','Xi Mo Song SC',serif"; });
      }
    });
  }
  if (dirBtn) dirBtn.addEventListener('click', function () { state.vert = !state.vert; render(); });
  if (tSize) tSize.addEventListener('input', function () { state.size = +tSize.value; render(); });

  /* 触达试写区时预热（提前一点开始下载，但仍在用户表达意图之后） */
  if ('IntersectionObserver' in window && stage) {
    var io0 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { loadFull(400, function () {}); io0.disconnect(); } });
    }, { rootMargin: '200px' });
    io0.observe(stage);
  }
  render();

  /* ── 滚动淡入（骨架不动，只做一次性入场）───────────────── */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var css = document.createElement('style');
    css.textContent = '.reveal{opacity:0;transform:translateY(22px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}.reveal.in{opacity:1;transform:none}';
    document.head.appendChild(css);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '-8% 0px -8% 0px' });
    document.querySelectorAll('.sec-head, .two, .spec-row, .weights, .vert-wrap, .try-stage, .spec-table, .license, .fig-wide')
      .forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
