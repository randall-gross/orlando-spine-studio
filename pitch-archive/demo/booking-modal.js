/* ─────────────────────────────────────────────────────────────────
   OSS Booking Modal — Mock Demo Component
   Self-contained. No dependencies. Call OSSBooking.open() to launch.
   All content is hardcoded mock data. User-typed values are only
   written to input.value, never injected into innerHTML.
   ───────────────────────────────────────────────────────────────── */

(function () {

  /* ── MOCK DATA ──────────────────────────────────────────────── */

  var TYPES = [
    { id: 'new',      icon: '✦', label: 'New Patient',       desc: 'First time visiting us' },
    { id: 'return',   icon: '↩', label: 'Returning Patient', desc: 'Welcome back' },
    { id: 'injury',   icon: '🚗', label: 'Auto / Injury',     desc: '14-day rule applies' },
    { id: 'wellness', icon: '◎', label: 'Wellness Visit',    desc: 'Maintenance care' },
  ];

  // Subtypes vary meaningfully by appointment type
  var SUBTYPES = {
    // New patients see everything — they may not know what they need
    new:      ['Chiropractic Adjustment', 'X-Ray Assessment',  'Spinal Decompression',
               'Shockwave Therapy',       'LightForce Laser',  'Massage Therapy',
               'Physical Rehab'],
    // Returning patients already have records — no X-ray, just their ongoing care
    return:   ['Chiropractic Adjustment', 'LightForce Laser',  'Shockwave Therapy',
               'Spinal Decompression',   'Massage Therapy',    'Physical Rehab'],
    // Auto / injury — X-ray leads, no standalone massage
    injury:   ['X-Ray Assessment',        'Chiropractic Adjustment', 'Spinal Decompression',
               'LightForce Laser',        'Shockwave Therapy',       'Physical Rehab'],
    // Wellness / maintenance — no imaging, no decompression, massage & laser front
    wellness: ['Chiropractic Adjustment', 'Massage Therapy',   'LightForce Laser',
               'Shockwave Therapy'],
  };

  var PROVIDERS = [
    { id: 'any',   initials: '?',  name: 'No Preference',    title: 'First Available Slot' },
    { id: 'james', initials: 'JB', name: 'Dr. James Bowles', title: 'Principal Chiropractor' },
    { id: 'haley', initials: 'HH', name: 'Haley Hopkins',    title: 'Physical Rehabilitation' },
    { id: 'joe',   initials: 'JM', name: 'Joe Martinez',     title: 'Massage Therapy' },
  ];

  var SLOTS = {
    1: ['9:00 AM','9:30 AM','10:00 AM','11:00 AM','2:00 PM','2:30 PM','3:00 PM','4:00 PM','5:30 PM'],
    2: ['3:00 PM','3:30 PM','4:00 PM','5:00 PM','5:30 PM','6:30 PM'],
    3: ['9:00 AM','9:30 AM','10:30 AM','2:00 PM','3:30 PM','4:00 PM','5:00 PM'],
    5: ['9:00 AM','9:30 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:30 PM'],
    6: ['9:00 AM','9:30 AM','10:00 AM','11:00 AM'],
  };

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  /* ── STATE ──────────────────────────────────────────────────── */

  function freshState() {
    var now = new Date();
    return { step:1, type:null, subtypes:[], provider:null,
             date:null, time:null, firstName:'', lastName:'',
             email:'', phone:'', notes:'',
             calMonth: now.getMonth(), calYear: now.getFullYear() };
  }
  var S = freshState();

  function canAdvance() {
    if (S.step === 1) return !!S.type;
    if (S.step === 2) return S.subtypes.length > 0;
    if (S.step === 3) return !!S.provider;
    if (S.step === 4) return !!S.date && !!S.time;
    if (S.step === 5) return !!(S.firstName && S.email && S.phone);
    return true;
  }

  /* ── DOM HELPERS (no innerHTML for user data) ───────────────── */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls)  e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function btn(cls, label, handler) {
    var b = el('button', cls, label);
    b.addEventListener('click', handler);
    return b;
  }

  /* ── STEP BUILDERS (pure DOM) ───────────────────────────────── */

  // Step 1 — appointment type. Click auto-advances.
  function buildStep1(container) {
    container.appendChild(el('h3','oss-step-heading','What brings you in?'));
    var grid = el('div','oss-card-grid');
    TYPES.forEach(function(t) {
      var card = el('button', 'oss-card' + (S.type === t.id ? ' selected' : ''));
      card.appendChild(el('span','oss-card-icon', t.icon));
      card.appendChild(el('span','oss-card-label', t.label));
      card.appendChild(el('span','oss-card-desc',  t.desc));
      card.addEventListener('click', function() {
        S.type = t.id;
        S.subtypes = [];
        S.step = 2;
        render();
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // Step 2 — multi-select service chips keyed to the chosen type.
  function buildStep2(container) {
    var h = el('h3','oss-step-heading','Which services?');
    container.appendChild(h);
    var hint = el('p','oss-step-hint','Select all that apply');
    container.appendChild(hint);

    var pills = el('div','oss-pill-grid oss-pill-grid--step2');
    var services = SUBTYPES[S.type] || SUBTYPES.new;
    services.forEach(function(s) {
      var selected = S.subtypes.indexOf(s) !== -1;
      var p = btn('oss-pill' + (selected ? ' selected' : ''), s, function() {
        var idx = S.subtypes.indexOf(s);
        if (idx === -1) { S.subtypes.push(s);    p.classList.add('selected'); }
        else            { S.subtypes.splice(idx, 1); p.classList.remove('selected'); }
        // Update Continue button state without re-rendering
        var nxt = document.querySelector('#oss-bm-footer .oss-btn-next');
        if (nxt) {
          var ok = S.subtypes.length > 0;
          nxt.disabled = !ok;
          nxt.classList.toggle('disabled', !ok);
        }
      });
      pills.appendChild(p);
    });
    container.appendChild(pills);
  }

  // Step 3 — provider. Click auto-advances.
  function buildStep3(container) {
    container.appendChild(el('h3','oss-step-heading','Who would you like to see?'));
    var list = el('div','oss-provider-list');
    PROVIDERS.forEach(function(p) {
      var row = el('button','oss-provider' + (S.provider === p.id ? ' selected' : ''));
      var av = el('div','oss-provider-avatar');
      av.style.cssText = 'background:rgba(45,212,191,0.1);border:1px solid rgba(45,212,191,0.2)';
      var ini = el('span','', p.initials);
      ini.style.cssText = 'color:#0d9488;font-weight:700;font-size:13px';
      av.appendChild(ini);
      var info = el('div','oss-provider-info');
      info.appendChild(el('span','oss-provider-name',  p.name));
      info.appendChild(el('span','oss-provider-title', p.title));
      row.appendChild(av);
      row.appendChild(info);
      if (S.provider === p.id) row.appendChild(el('span','oss-provider-check','✓'));
      row.addEventListener('click', function() {
        S.provider = p.id;
        S.step = 4;
        render();
      });
      list.appendChild(row);
    });
    container.appendChild(list);
  }

  // Step 4 — calendar + time slots side by side.
  function buildStep4(container) {
    container.appendChild(el('h3','oss-step-heading','When works for you?'));

    var layout = el('div','oss-step4-layout');

    // ── Left: calendar ───────────────────────────────────────────
    var calCol = el('div','oss-step4-cal');
    var today = new Date(); today.setHours(0,0,0,0);
    var y = S.calYear, m = S.calMonth;
    var firstDow  = new Date(y, m, 1).getDay();
    var totalDays = new Date(y, m + 1, 0).getDate();

    var cal = el('div','oss-calendar');

    var nav = el('div','oss-cal-nav');
    var prevBtn = btn('', '‹', function() { OSSBooking._month(-1); });
    var nextBtn = btn('', '›', function() { OSSBooking._month(1);  });
    nav.appendChild(prevBtn);
    nav.appendChild(el('span','', MONTHS[m] + ' ' + y));
    nav.appendChild(nextBtn);
    cal.appendChild(nav);

    var hdrs = el('div','oss-cal-headers');
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(function(d) { hdrs.appendChild(el('span','',d)); });
    cal.appendChild(hdrs);

    var grid = el('div','oss-cal-grid');
    for (var i = 0; i < firstDow; i++) grid.appendChild(el('span','oss-cal-cell empty'));
    for (var d = 1; d <= totalDays; d++) {
      (function(day) {
        var dt  = new Date(y, m, day);
        var dow = dt.getDay();
        var past   = dt < today;
        var closed = dow === 0 || dow === 4;
        var avail  = !past && !closed;
        var sel    = S.date && S.date.getDate()===day && S.date.getMonth()===m && S.date.getFullYear()===y;
        var cls = ['oss-cal-cell', past?'past':'', closed?'closed':'', avail?'available':'', sel?'selected':''].filter(Boolean).join(' ');
        var cell = el('button', cls, String(day));
        cell.disabled = !avail;
        if (closed) cell.title = 'Closed';
        if (avail)  cell.addEventListener('click', function() { OSSBooking._date(y, m, day); });
        grid.appendChild(cell);
      })(d);
    }
    cal.appendChild(grid);
    calCol.appendChild(cal);
    layout.appendChild(calCol);

    // ── Right: time slots ─────────────────────────────────────────
    var timesCol = el('div','oss-step4-times');
    if (!S.date) {
      var ph = el('div','oss-step4-times-placeholder','Select a date to see available times');
      timesCol.appendChild(ph);
    } else {
      var slots = SLOTS[S.date.getDay()] || [];
      timesCol.appendChild(el('div','oss-step4-times-label','Available times'));
      var tg = el('div','oss-step4-time-grid');
      slots.forEach(function(t) {
        tg.appendChild(btn('oss-pill' + (S.time===t?' selected':''), t, function() {
          S.time = t; render();
        }));
      });
      timesCol.appendChild(tg);
    }
    layout.appendChild(timesCol);

    container.appendChild(layout);
  }

  // Step 5 — patient info.
  function buildStep5(container) {
    container.appendChild(el('h3','oss-step-heading','Almost there'));
    var grid = el('div','oss-form-grid');

    function field(key, label, ph, type, full) {
      var wrap = el('div','oss-field' + (full ? ' full' : ''));
      wrap.appendChild(el('label','',label));
      var inp = el('input');
      inp.type = type || 'text';
      inp.placeholder = ph;
      inp.value = S[key];
      inp.addEventListener('input', function() { OSSBooking._field(key, this.value); });
      wrap.appendChild(inp);
      return wrap;
    }

    grid.appendChild(field('firstName', 'First Name', 'James'));
    grid.appendChild(field('lastName',  'Last Name',  'Bowles'));
    grid.appendChild(field('email',     'Email',      'you@email.com', 'email', true));
    grid.appendChild(field('phone',     'Phone',      '(407) 000-0000','tel',   true));

    var notesWrap = el('div','oss-field full');
    var notesLbl  = el('label','','What\'s the main issue you\'d like to address?');
    var opt = el('span','',' (optional)');
    opt.style.cssText = 'color:#94a3b8;font-weight:400';
    notesLbl.appendChild(opt);
    var ta = el('textarea');
    ta.rows = 3;
    ta.placeholder = 'e.g. Lower back pain after a car accident...';
    ta.value = S.notes;
    ta.addEventListener('input', function() { OSSBooking._field('notes', this.value); });
    notesWrap.appendChild(notesLbl);
    notesWrap.appendChild(ta);
    grid.appendChild(notesWrap);
    container.appendChild(grid);
  }

  // Confirmation screen
  function buildConfirm(container) {
    container.style.textAlign = 'center';

    var icon = el('div','oss-confirm-icon','✓');
    container.appendChild(icon);

    var h = el('h3','oss-step-heading','You\'re all set!');
    h.style.textAlign = 'center';
    container.appendChild(h);
    container.appendChild(el('p','oss-confirm-sub','Check your email — confirmation and intake forms incoming.'));

    var card = el('div','oss-confirm-card');
    var prov = PROVIDERS.find(function(p) { return p.id === S.provider; });
    var dateStr = S.date
      ? DAYS[S.date.getDay()] + ', ' + MONTHS[S.date.getMonth()] + ' ' + S.date.getDate() + ', ' + S.date.getFullYear()
      : '—';

    function row(lbl, val) {
      var r = el('div','oss-confirm-row');
      r.appendChild(el('span','oss-confirm-lbl', lbl));
      r.appendChild(el('span','oss-confirm-val', val));
      return r;
    }
    card.appendChild(row('Service',  S.subtypes.length ? S.subtypes.join(', ') : 'General Visit'));
    card.appendChild(row('Provider', prov ? prov.name : '—'));
    card.appendChild(row('Date',     dateStr));
    card.appendChild(row('Time',     S.time || '—'));

    var locRow = el('div','oss-confirm-row');
    locRow.appendChild(el('span','oss-confirm-lbl','Location'));
    var locVal = el('div','oss-confirm-val');
    locVal.appendChild(document.createTextNode('11500 University Blvd, Ste #103'));
    locVal.appendChild(el('br'));
    locVal.appendChild(document.createTextNode('Orlando, FL 32817'));
    locRow.appendChild(locVal);
    card.appendChild(locRow);
    container.appendChild(card);

    var btns = el('div','oss-cal-btns');
    btns.appendChild(btn('oss-cal-btn','Add to Google Calendar', function() { OSSBooking.close(); }));
    btns.appendChild(btn('oss-cal-btn','Add to Apple Calendar',  function() { OSSBooking.close(); }));
    container.appendChild(btns);
  }

  /* ── RENDER ─────────────────────────────────────────────────── */

  var STEP_BUILDERS = [buildStep1, buildStep2, buildStep3, buildStep4, buildStep5, buildConfirm];
  var TOTAL_STEPS   = 5; // confirmation is not counted as a numbered step

  function render() {
    var body   = document.getElementById('oss-bm-body');
    var footer = document.getElementById('oss-bm-footer');
    var bar    = document.getElementById('oss-bm-bar');
    var lbl    = document.getElementById('oss-bm-lbl');
    if (!body) return;

    var isConfirm = S.step > TOTAL_STEPS;
    bar.style.width = isConfirm ? '100%' : (((S.step - 1) / TOTAL_STEPS) * 100) + '%';
    lbl.textContent = isConfirm ? 'Appointment Confirmed' : 'Step ' + S.step + ' of ' + TOTAL_STEPS;

    body.style.opacity   = '0';
    body.style.transform = 'translateX(16px)';

    setTimeout(function() {
      while (body.firstChild) body.removeChild(body.firstChild);
      STEP_BUILDERS[S.step - 1](body);
      body.style.opacity   = '1';
      body.style.transform = 'translateX(0)';
    }, 110);

    while (footer.firstChild) footer.removeChild(footer.firstChild);

    // Step 1: auto-advances on card click — no footer
    // Step 2: multi-select needs Back + Continue
    // Step 3: auto-advances on provider click — no footer
    // Steps 4–5: Back + Continue / Confirm
    // Confirmation: Done button
    var needsFooter = (S.step === 2) || (S.step >= 4 && S.step <= TOTAL_STEPS);
    if (needsFooter) {
      var row = el('div','oss-footer-inner');
      row.appendChild(btn('oss-btn-back','← Back', function() { OSSBooking.back(); }));
      var ok  = canAdvance();
      var nxt = btn('oss-btn-next' + (ok ? '' : ' disabled'),
                    S.step === TOTAL_STEPS ? 'Confirm Booking →' : 'Continue →',
                    function() { OSSBooking.next(); });
      nxt.disabled = !ok;
      row.appendChild(nxt);
      footer.appendChild(row);
    } else if (isConfirm) {
      var row = el('div','oss-footer-inner');
      row.style.justifyContent = 'center';
      row.appendChild(btn('oss-btn-next','Done', function() { OSSBooking.close(); }));
      footer.appendChild(row);
    }
  }

  /* ── SHELL ──────────────────────────────────────────────────── */

  function mount() {
    if (document.getElementById('oss-booking-modal')) return;

    var overlay = el('div','oss-modal-overlay');
    overlay.id  = 'oss-booking-modal';
    overlay.addEventListener('click', function(e) { if (e.target === overlay) OSSBooking.close(); });

    var modal   = el('div','oss-modal');
    var header  = el('div','oss-modal-header');
    var title   = el('div','oss-modal-title','Book Your Appointment');
    var closeX  = btn('oss-modal-close','✕', function() { OSSBooking.close(); });
    header.appendChild(title); header.appendChild(closeX);

    var progressWrap = el('div','oss-progress-bar');
    var progressFill = el('div','oss-progress-fill');
    progressFill.id  = 'oss-bm-bar';
    progressWrap.appendChild(progressFill);

    var stepLbl = el('div','oss-step-label','Step 1 of 5');
    stepLbl.id  = 'oss-bm-lbl';

    var body = el('div','oss-modal-body');
    body.id  = 'oss-bm-body';
    body.style.cssText = 'transition:opacity .11s ease,transform .11s ease';

    var footer = el('div','oss-modal-footer');
    footer.id  = 'oss-bm-footer';

    modal.appendChild(header);
    modal.appendChild(progressWrap);
    modal.appendChild(stepLbl);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  /* ── PUBLIC API ─────────────────────────────────────────────── */

  window.OSSBooking = {
    open: function() {
      S = freshState();
      mount();
      document.getElementById('oss-booking-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
      render();
    },
    close: function() {
      var m = document.getElementById('oss-booking-modal');
      if (m) m.classList.remove('active');
      document.body.style.overflow = '';
    },
    next:  function() { if (canAdvance()) { S.step = Math.min(TOTAL_STEPS + 1, S.step + 1); render(); } },
    back:  function() { S.step = Math.max(1, S.step - 1); render(); },
    _date: function(y, m, d) { S.date = new Date(y, m, d); S.time = null; render(); },
    _month: function(dir) {
      S.calMonth += dir;
      if (S.calMonth < 0)  { S.calMonth = 11; S.calYear--; }
      if (S.calMonth > 11) { S.calMonth = 0;  S.calYear++; }
      render();
    },
    _field: function(key, val) {
      S[key] = val;
      var nxt = document.querySelector('#oss-bm-footer .oss-btn-next');
      if (nxt) { var ok = canAdvance(); nxt.disabled = !ok; nxt.classList.toggle('disabled', !ok); }
    },
  };

  /* ── AUTO-WIRE ──────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('button, a').forEach(function(el) {
      var txt  = (el.textContent || '').trim().toLowerCase();
      var href = el.getAttribute('href') || '';
      if (txt.includes('book') || txt.includes('appointment') || txt.includes('schedule')) {
        if (!href || href === '#' || href.startsWith('/') || href.startsWith('.')) {
          el.addEventListener('click', function(e) { e.preventDefault(); OSSBooking.open(); });
        }
      }
    });
  });

})();
