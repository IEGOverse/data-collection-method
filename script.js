/* ==========================================================================
   Data Collection Method — Presentation Script (vanilla JS)
   Modules:
     1. DATA      — ilustrasi comfort scores
     2. Deck      — slide engine (navigation, keyboard, progress, scaling)
     3. SeatWall  — 10 seat glyphs
     4. Methods   — slide 3 clickable cards
     5. Rating    — slide 4 scale 1-10
     6. Table     — slide 7 records + Show Average
     7. Charts    — slide 8 & 9 vanilla bar charts
     8. Modal     — slide 9 seat details
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. DATA — SELURUH ANGKA DI BAWAH INI ADALAH DATA ILUSTRASI
        Angka diberikan sebagai contoh cara pencatatan & analisis,
        BUKAN hasil eksperimen nyata.
     ---------------------------------------------------------------------- */
  var DATA = {
    participants: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
    // scores[participantIndex][seatIndex - 1]
    // P1-P3 mengikuti contoh pada assignment, P4-P10 adalah tambahan ilustrasi.
    scores: [
      [8, 6, 9, 7, 8, 6, 9, 7, 8, 7],
      [7, 7, 8, 8, 9, 6, 8, 7, 9, 8],
      [9, 5, 9, 7, 8, 7, 9, 8, 8, 9],
      [8, 6, 9, 6, 9, 7, 8, 8, 8, 8],
      [7, 8, 9, 8, 8, 6, 9, 7, 8, 7],
      [9, 6, 8, 7, 9, 6, 9, 7, 9, 8],
      [8, 7, 9, 7, 8, 7, 8, 8, 8, 9],
      [6, 6, 8, 7, 7, 6, 8, 7, 7, 8],
      [8, 7, 9, 8, 9, 7, 9, 8, 8, 8],
      [7, 6, 9, 7, 8, 5, 8, 7, 9, 7]
    ],
    seatCount: 10,
    maxScore: 10
  };

  var METHODS = {
    controlled: {
      name: 'Controlled Experiment',
      icon: 'i-lab',
      tag: 'Eksperimen terkontrol',
      text: 'Kita mengontrol kondisi pengujian (durasi, ruangan, instruksi) dan sengaja hanya memvariasikan satu faktor, yaitu desain kursi. Dengan begitu 10 desain kursi dapat dibandingkan secara adil.'
    },
    natural: {
      name: 'Natural Experiment',
      icon: 'i-globe',
      tag: 'Eksperimen alami',
      text: 'Mengamati perilaku nyata tanpa intervensi, misalnya kursi yang sudah terpasang di kendaraan. Kondisi sulit dikontrol penuh sehingga hasil bisa dipengaruhi faktor lain.'
    },
    case: {
      name: 'Case Study',
      icon: 'i-folder',
      tag: 'Studi kasus',
      text: 'Mendalami satu kasus atau unit tertentu secara detail. Tidak cocok untuk membandingkan 10 desain kursi sekaligus secara adil.'
    },
    action: {
      name: 'Action Research',
      icon: 'i-loop',
      tag: 'Penelitian tindakan',
      text: 'Penelitian berulang untuk memperbaiki praktik: merancang tindakan, mengukur dampaknya, lalu menyempurnanya. Fokusnya pada perbaikan praktik, bukan perbandingan desain.'
    }
  };

  /* ---------------------------- helpers ---------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function formatID(id) { return id.toFixed(2).replace('.', ','); }

  function averages() {
    var n = DATA.scores.length, out = [];
    for (var s = 0; s < DATA.seatCount; s++) {
      var total = 0;
      for (var p = 0; p < n; p++) total += DATA.scores[p][s];
      out.push(total / n);
    }
    return out;
  }

  function maxAvg() {
    var a = averages();
    return Math.max.apply(null, a);
  }

  /* ----------------------------------------------------------------------
     2. DECK
     ---------------------------------------------------------------------- */
  var Deck = (function () {
    var stage = $('#stage');
    var slides = $$('.slide');
    var total = slides.length;
    var index = 0;

    var counter = $('#slideCounter');
    var titleEl = $('#slideTitle');
    var fill = $('#progressFill');
    var btnPrev = $('#btnPrev');
    var btnNext = $('#btnNext');

    function clamp(i) { return Math.min(total - 1, Math.max(0, i)); }

    function render() {
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === index);
        s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      counter.textContent = 'Slide ' + (index + 1) + ' / ' + total;
      titleEl.textContent = slides[index].getAttribute('data-title') || '';
      fill.style.width = ((index + 1) / total * 100) + '%';
      btnPrev.disabled = index === 0;
      btnNext.disabled = index === total - 1;
      if (window.location.hash !== '#' + (index + 1)) {
        try { history.replaceState(null, '', '#' + (index + 1)); } catch (e) { /* file:// fallback */ }
      }
    }

    function go(i) {
      var next = clamp(i);
      if (next === index && slides[index].classList.contains('is-active')) return;
      index = next;
      render();
    }

    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    /* Fit the fixed 1600x900 stage into any viewport / projector. */
    function fit() {
      var scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
      stage.style.transform = 'scale(' + scale + ')';
    }

    /* Navigation */
    btnNext.addEventListener('click', next);
    btnPrev.addEventListener('click', prev);

    document.addEventListener('keydown', function (e) {
      var modal = $('#modal');
      if (modal && !modal.hidden) {
        if (e.key === 'Escape') { closeModal(); e.preventDefault(); }
        return;
      }
      // Let focused buttons handle their own Space/Enter activation.
      var onButton = e.target && e.target.closest && e.target.closest('button');
      var k = e.key;

      if (k === 'ArrowRight' || k === 'PageDown' || k === 'ArrowDown') { next(); e.preventDefault(); }
      else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp') { prev(); e.preventDefault(); }
      else if (k === ' ' && !onButton) { next(); e.preventDefault(); }
      else if (k === 'Home') { go(0); e.preventDefault(); }
      else if (k === 'End') { go(total - 1); e.preventDefault(); }
      else if (k === 'f' || k === 'F') { toggleFullscreen(); e.preventDefault(); }
    });

    /* Touch swipe */
    var tx = 0, ty = 0;
    document.addEventListener('touchstart', function (e) {
      tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
    }, { passive: true });

    window.addEventListener('resize', fit);
    window.addEventListener('hashchange', function () {
      var n = parseInt(window.location.hash.slice(1), 10);
      if (!isNaN(n)) go(n - 1);
    });

    /* Initial slide from URL hash */
    var start = parseInt(window.location.hash.slice(1), 10);
    index = isNaN(start) ? 0 : clamp(start - 1);

    return {
      init: function () { fit(); render(); },
      next: next, prev: prev, go: go
    };
  })();

  /* ----------------------------------------------------------------------
     Fullscreen
     ---------------------------------------------------------------------- */
  function toggleFullscreen() {
    var el = document.documentElement;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  }
  $('#btnFullscreen').addEventListener('click', toggleFullscreen);

  /* ----------------------------------------------------------------------
     3. SEAT WALL — 10 abstract seat glyphs
     ---------------------------------------------------------------------- */
  function buildSeatWall(el, opts) {
    if (!el) return;
    var lit = opts && opts.lit ? opts.lit : [];
    el.innerHTML = '';
    for (var i = 1; i <= DATA.seatCount; i++) {
      var cell = document.createElement('div');
      cell.className = 'seat-cell' + (lit.indexOf(i) > -1 ? ' is-lit' : '');
      cell.innerHTML =
        '<svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-seat"/></svg>' +
        '<span class="seat-cell-index">Kursi ' + i + '</span>';
      el.appendChild(cell);
    }
  }

  /* ----------------------------------------------------------------------
     4. METHODS — clickable cards
     ---------------------------------------------------------------------- */
  var Methods = (function () {
    var grid = $('#methodGrid');
    var dName = $('#methodDetailName');
    var dTag = $('#methodDetailTag');
    var dText = $('#methodDetailText');
    var dIcon = $('#methodDetail .method-detail-icon use');

    function select(key) {
      var m = METHODS[key];
      if (!m) return;
      $$('.method-card', grid).forEach(function (c) {
        var on = c.getAttribute('data-method') === key;
        c.classList.toggle('is-selected', on);
        c.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      dName.textContent = m.name;
      dTag.textContent = m.tag;
      dText.textContent = m.text;
      dIcon.setAttribute('href', '#' + m.icon);
    }

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.method-card');
      if (card) select(card.getAttribute('data-method'));
    });

    return { init: function () { select('controlled'); } };
  })();

  /* ----------------------------------------------------------------------
     5. RATING SCALE — hover / click 1-10
     ---------------------------------------------------------------------- */
  var Rating = (function () {
    var scale = $('#ratingScale');
    var current = 1;

    function paint(n) {
      $$('.rating-cell', scale).forEach(function (c, i) {
        c.classList.toggle('is-active', i + 1 === n);
      });
      scale.setAttribute('aria-valuenow', String(n));
    }

    for (var i = 1; i <= DATA.maxScore; i++) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'rating-cell';
      cell.textContent = String(i);
      cell.dataset.value = String(i);
      scale.appendChild(cell);
    }

    scale.addEventListener('mouseover', function (e) {
      var c = e.target.closest('.rating-cell');
      if (c) paint(parseInt(c.dataset.value, 10));
    });
    scale.addEventListener('mouseleave', function () { paint(current); });
    scale.addEventListener('click', function (e) {
      var c = e.target.closest('.rating-cell');
      if (!c) return;
      current = parseInt(c.dataset.value, 10);
      paint(current);
    });

    return { init: function () { paint(current); } };
  })();

  /* ----------------------------------------------------------------------
     6. TABLE — records + Show Average
     ---------------------------------------------------------------------- */
  var Table = (function () {
    var tbody = $('#dataTableBody');
    var tfoot = $('#dataTableFoot');
    var avgRow = $('.avg-row', tfoot);
    var btn = $('#btnAverage');
    var btnLabel = $('#btnAverageLabel');
    var shown = false;

    function build() {
      DATA.scores.forEach(function (row, pi) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.scope = 'row';
        th.className = 'col-participant';
        th.innerHTML = '<span class="participant-tag">Peserta ' + DATA.participants[pi] + '</span>';
        tr.appendChild(th);
        row.forEach(function (v) {
          var td = document.createElement('td');
          td.textContent = String(v);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    function buildAverage() {
      averages().forEach(function (a) {
        var td = document.createElement('td');
        td.textContent = formatID(a);
        avgRow.appendChild(td);
      });
    }

    function toggle() {
      shown = !shown;
      tfoot.hidden = !shown;
      btn.classList.toggle('is-on', shown);
      btnLabel.textContent = shown ? 'Hide Average' : 'Show Average';
    }

    btn.addEventListener('click', toggle);

    return { init: function () { build(); buildAverage(); } };
  })();

  /* ----------------------------------------------------------------------
     7. CHARTS — vanilla bar charts
     ---------------------------------------------------------------------- */
  var CHART_MIN = 4;   // baseline of the axis
  var CHART_MAX = 10;

  function buildChart(el, interactive) {
    if (!el) return [];
    var avgs = averages();
    var top = maxAvg();
    var bars = [];

    el.innerHTML = '';
    avgs.forEach(function (a, i) {
      var seat = i + 1;
      var pct = ((a - CHART_MIN) / (CHART_MAX - CHART_MIN)) * 100;
      var bar = document.createElement('div');
      bar.className = 'bar' + (Math.abs(a - top) < 0.001 ? ' is-top' : '');
      bar.setAttribute('role', 'button');
      bar.setAttribute('tabindex', '0');
      bar.setAttribute('aria-label', 'Kursi ' + seat + ', rata-rata ' + formatID(a) + ', data ilustrasi');
      bar.innerHTML =
        '<span class="bar-value">' + formatID(a) + '</span>' +
        '<span class="bar-fill" style="height:' + pct.toFixed(2) + '%"></span>' +
        '<span class="bar-label">K' + seat + '</span>';
      el.appendChild(bar);
      bars.push(bar);
    });

    if (interactive) {
      bars.forEach(function (bar, i) {
        bar.addEventListener('click', function () { selectBar(i); openModal(i + 1); });
        bar.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { selectBar(i); openModal(i + 1); e.preventDefault(); }
        });
      });
    }
    return bars;
  }

  /* ----------------------------------------------------------------------
     8. MODAL — seat details
     ---------------------------------------------------------------------- */
  var modal = $('#modal');
  var selectedSeat = 0;   // 0 = belum ada pilihan manual

  function closeModal() {
    modal.hidden = true;
  }

  function openModal(seatNo) {
    var idx = seatNo - 1;
    var avg = averages()[idx];
    $('#modalTitle').textContent = 'Kursi ' + seatNo;
    $('#modalSubtitle').textContent = 'Rincian skor — data ilustrasi';
    $('#modalAvg').textContent = formatID(avg);
    $('#modalCount').textContent = DATA.scores.length + ' peserta';

    var ul = $('#modalScores');
    ul.innerHTML = '';
    DATA.scores.forEach(function (row, pi) {
      var li = document.createElement('li');
      li.innerHTML = 'Peserta ' + DATA.participants[pi] + ' <b>' + row[idx] + '</b>';
      ul.appendChild(li);
    });

    modal.hidden = false;
  }

  function selectBar(i) {
    selectedSeat = i + 1;
    $$('#chartCompare .bar').forEach(function (b, j) {
      b.classList.toggle('is-selected', j === i);
    });
    var label = $('#btnDetailsLabel');
    if (label) label.textContent = 'View Details — Kursi ' + selectedSeat;
  }

  $('#btnDetails').addEventListener('click', function () {
    var avgs = averages();
    // Default: kursi dengan rata-rata tertinggi pada data ilustrasi.
    var seat = selectedSeat || (avgs.indexOf(Math.max.apply(null, avgs)) + 1);
    openModal(seat);
  });

  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeModal();
  });

  /* ----------------------------------------------------------------------
     8. Modals close on backdrop click & Esc is handled in Deck.
     ---------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------
     BOOT
     ---------------------------------------------------------------------- */
  /* Live worked example for the formula card, derived from the data itself. */
  function renderFormulaExample() {
    var el = $('#formulaExample');
    if (!el) return;
    var avgs = averages();
    var best = avgs.indexOf(Math.max.apply(null, avgs));   // 0-based seat index
    var values = DATA.scores.map(function (row) { return row[best]; });
    var total = values.reduce(function (a, b) { return a + b; }, 0);
    el.innerHTML = 'Contoh (ilustrasi): Kursi ' + (best + 1) + ' &rarr; (' +
      values.join(' + ') + ') &divide; ' + DATA.scores.length + ' = <b>' +
      formatID(avgs[best]) + '</b>';
  }

  function boot() {
    buildSeatWall($('#seatWallCover'), { lit: [3, 7] });
    buildSeatWall($('#seatWallProblem'), {});
    buildSeatWall($('#seatWallQA'), { lit: [3, 7] });

    Methods.init();
    Rating.init();
    Table.init();
    renderFormulaExample();

    buildChart($('#chartAnalysis'), false);
    buildChart($('#chartCompare'), true);

    Deck.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
