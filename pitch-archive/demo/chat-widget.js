/* ─────────────────────────────────────────────────────────────────
   OSS Chat Widget — Mock Demo Component
   Self-contained. No dependencies. Auto-mounts on load.
   ───────────────────────────────────────────────────────────────── */

(function () {

  var isOpen   = false;
  var messages = [];
  var typing   = false;

  /* ── SCRIPTED RESPONSES ─────────────────────────────────────── */

  var INITIAL = 'Hi there 👋 I\'m the Orlando Spine Studio assistant. How can I help you today?';

  var QUICK_REPLIES = [
    { label: '📅  Schedule an Appointment', key: 'schedule' },
    { label: '🕐  Office Hours',            key: 'hours'    },
    { label: '🏥  Insurance Questions',     key: 'insurance'},
    { label: '❓  What\'s a first visit like?', key: 'first'},
  ];

  var RESPONSES = {
    schedule: {
      text: 'Our next available opening is Monday at 9:00 AM with Dr. Bowles. Want to book it?',
      action: { label: '📅  Book Now', fn: function() {
        addMessage('user', 'Book Now');
        respond({ text: 'Opening the booking form for you now!', delay: 400 });
        setTimeout(function() { if (window.OSSBooking) OSSBooking.open(); }, 900);
      }},
    },
    hours: {
      text: 'Here are our hours:\n\nMon · Wed · Fri — 9 AM–12 PM & 2–6 PM\nTue — 3–7 PM\nSat — 9 AM–12 PM\nThu & Sun — Closed',
    },
    insurance: {
      text: 'We accept most major insurance plans including BlueCross BlueShield, Aetna, Cigna, UnitedHealthcare, and many more. Our team can verify your benefits before your first visit — no surprises.',
      action: { label: '📋  Book a Free Benefits Check', fn: function() {
        addMessage('user', 'Schedule a benefits check');
        respond({ text: 'Great! I\'ll open our booking form. Select "New Patient" and mention insurance in the notes.', delay: 500 });
        setTimeout(function() { if (window.OSSBooking) OSSBooking.open(); }, 1100);
      }},
    },
    first: {
      text: 'Your first visit typically takes 45–60 minutes. Dr. Bowles will review your history, perform a thorough examination, possibly take digital X-rays, and then walk you through a care plan. Most patients feel noticeably better the same day.',
      action: { label: '✦  Book Your First Visit', fn: function() {
        addMessage('user', 'Book first visit');
        respond({ text: 'Perfect — let\'s get you scheduled!', delay: 400 });
        setTimeout(function() { if (window.OSSBooking) OSSBooking.open(); }, 900);
      }},
    },
    fallback: {
      text: 'That\'s a great question! One of our team members will get back to you within a few minutes. Or if you\'d like to book right now:',
      action: { label: '📅  Book an Appointment', fn: function() {
        addMessage('user', 'Book an appointment');
        respond({ text: 'Opening the booking form for you!', delay: 400 });
        setTimeout(function() { if (window.OSSBooking) OSSBooking.open(); }, 900);
      }},
    },
  };

  /* ── STATE HELPERS ──────────────────────────────────────────── */

  function addMessage(from, text, opts) {
    messages.push({ from: from, text: text, opts: opts || {} });
    renderMessages();
    scrollBottom();
  }

  function respond(opts) {
    typing = true;
    renderMessages();
    scrollBottom();
    setTimeout(function() {
      typing = false;
      messages.push({ from: 'bot', text: opts.text, opts: opts });
      renderMessages();
      scrollBottom();
    }, opts.delay || 800);
  }

  function scrollBottom() {
    setTimeout(function() {
      var msgs = document.getElementById('oss-chat-msgs');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 50);
  }

  /* ── DOM HELPERS ────────────────────────────────────────────── */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls)  e.className   = cls;
    if (text) e.textContent = text;
    return e;
  }

  function btn(cls, label, handler) {
    var b = el('button', cls, label);
    b.addEventListener('click', handler);
    return b;
  }

  /* ── RENDER MESSAGES ────────────────────────────────────────── */

  function renderMessages() {
    var container = document.getElementById('oss-chat-msgs');
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);

    messages.forEach(function(msg) {
      var wrap = el('div', 'oss-chat-msg ' + msg.from);
      var bubble = el('div', 'oss-chat-bubble-msg');

      // Render multi-line text safely
      var lines = msg.text.split('\n');
      lines.forEach(function(line, i) {
        bubble.appendChild(document.createTextNode(line));
        if (i < lines.length - 1) bubble.appendChild(el('br'));
      });
      wrap.appendChild(bubble);

      // Action button if present
      if (msg.opts && msg.opts.action) {
        var actionBtn = btn('oss-chat-book-btn', msg.opts.action.label, msg.opts.action.fn);
        wrap.appendChild(actionBtn);
      }

      // Quick replies for the opening bot message
      if (msg.opts && msg.opts.quickReplies) {
        var qr = el('div', 'oss-quick-replies');
        msg.opts.quickReplies.forEach(function(q) {
          var qb = btn('oss-quick-reply', q.label, function() {
            // Remove quick replies after selection
            removeQuickReplies();
            addMessage('user', q.label.replace(/^[^\w]+/, '').trim());
            var resp = RESPONSES[q.key] || RESPONSES.fallback;
            respond({ text: resp.text, delay: 700, action: resp.action });
          });
          qr.appendChild(qb);
        });
        wrap.appendChild(qr);
      }

      container.appendChild(wrap);
    });

    // Typing indicator
    if (typing) {
      var tw = el('div','oss-chat-msg bot');
      var ti = el('div','oss-typing');
      ti.appendChild(el('span')); ti.appendChild(el('span')); ti.appendChild(el('span'));
      tw.appendChild(ti);
      container.appendChild(tw);
    }
  }

  function removeQuickReplies() {
    // Mark last bot message as no longer having quick replies
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === 'bot' && messages[i].opts.quickReplies) {
        messages[i].opts.quickReplies = null;
        break;
      }
    }
  }

  /* ── MOUNT ──────────────────────────────────────────────────── */

  function mount() {
    if (document.getElementById('oss-chat-widget')) return;

    var wrapper = el('div','');
    wrapper.id  = 'oss-chat-widget';

    // ── Window ──────────────────────────────────────────────────
    var win  = el('div','oss-chat-window');
    win.id   = 'oss-chat-win';

    // Header
    var hdr  = el('div','oss-chat-header');
    var av   = el('div','oss-chat-avatar','OSS');
    var info = el('div','oss-chat-header-info');
    info.appendChild(el('div','oss-chat-header-name','Orlando Spine Studio'));
    var status = el('div','oss-chat-header-status');
    status.appendChild(el('span','oss-chat-status-dot',''));
    status.appendChild(document.createTextNode('We\'re online · Reply in seconds'));
    info.appendChild(status);
    hdr.appendChild(av);
    hdr.appendChild(info);
    win.appendChild(hdr);

    // Messages
    var msgs = el('div','oss-chat-messages');
    msgs.id  = 'oss-chat-msgs';
    win.appendChild(msgs);

    // Input
    var inputRow = el('div','oss-chat-input-row');
    var input    = el('input','oss-chat-input');
    input.id          = 'oss-chat-input';
    input.type        = 'text';
    input.placeholder = 'Type a message...';
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
    var sendBtn = btn('oss-chat-send','', sendMessage);
    sendBtn.appendChild(makeSendIcon());
    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);
    win.appendChild(inputRow);
    wrapper.appendChild(win);

    // ── Bubble ──────────────────────────────────────────────────
    var bubble = el('button','oss-chat-bubble','');
    bubble.id  = 'oss-chat-bubble';
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.appendChild(makeChatIcon());
    bubble.appendChild(makeCloseIcon());

    var badge = el('span','oss-chat-badge','1');
    badge.id  = 'oss-chat-badge';
    bubble.appendChild(badge);

    bubble.addEventListener('click', toggleChat);
    wrapper.appendChild(bubble);

    document.body.appendChild(wrapper);

    // Prime first message after a short delay
    setTimeout(function() {
      addMessage('bot', INITIAL, { quickReplies: QUICK_REPLIES });
    }, 1200);
  }

  function makeSendIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width','16'); svg.setAttribute('height','16');
    svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none');
    svg.setAttribute('stroke','#ffffff'); svg.setAttribute('stroke-width','2.5');
    svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round');
    var p = document.createElementNS('http://www.w3.org/2000/svg','line');
    p.setAttribute('x1','22'); p.setAttribute('y1','2'); p.setAttribute('x2','11'); p.setAttribute('y2','13');
    var q = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    q.setAttribute('points','22 2 15 22 11 13 2 9 22 2');
    svg.appendChild(p); svg.appendChild(q);
    return svg;
  }

  function makeChatIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width','22'); svg.setAttribute('height','22');
    svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none');
    svg.setAttribute('stroke','#ffffff'); svg.setAttribute('stroke-width','2');
    svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round');
    svg.className.baseVal = 'icon-chat';
    var path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
    svg.appendChild(path);
    return svg;
  }

  function makeCloseIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width','20'); svg.setAttribute('height','20');
    svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none');
    svg.setAttribute('stroke','#ffffff'); svg.setAttribute('stroke-width','2.5');
    svg.setAttribute('stroke-linecap','round');
    svg.className.baseVal = 'icon-close';
    svg.style.display = 'none';
    var l1 = document.createElementNS('http://www.w3.org/2000/svg','line');
    l1.setAttribute('x1','18'); l1.setAttribute('y1','6'); l1.setAttribute('x2','6'); l1.setAttribute('y2','18');
    var l2 = document.createElementNS('http://www.w3.org/2000/svg','line');
    l2.setAttribute('x1','6'); l2.setAttribute('y1','6'); l2.setAttribute('x2','18'); l2.setAttribute('y2','18');
    svg.appendChild(l1); svg.appendChild(l2);
    return svg;
  }

  /* ── INTERACTIONS ───────────────────────────────────────────── */

  function toggleChat() {
    isOpen = !isOpen;
    var win    = document.getElementById('oss-chat-win');
    var bubble = document.getElementById('oss-chat-bubble');
    var badge  = document.getElementById('oss-chat-badge');
    if (win)    win.classList.toggle('open', isOpen);
    if (bubble) bubble.classList.toggle('open', isOpen);
    if (badge)  badge.classList.add('hidden');
    if (isOpen) {
      scrollBottom();
      setTimeout(function() {
        var inp = document.getElementById('oss-chat-input');
        if (inp) inp.focus();
      }, 300);
    }
  }

  function sendMessage() {
    var inp = document.getElementById('oss-chat-input');
    if (!inp) return;
    var text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    removeQuickReplies();
    addMessage('user', text);

    // Simple keyword matching for mock responses
    var lower = text.toLowerCase();
    var key = 'fallback';
    if (lower.match(/schedul|book|appoint/))    key = 'schedule';
    else if (lower.match(/hour|open|close/))    key = 'hours';
    else if (lower.match(/insur|cover|accept/)) key = 'insurance';
    else if (lower.match(/first|visit|new|expect/)) key = 'first';

    var resp = RESPONSES[key];
    respond({ text: resp.text, delay: 750, action: resp.action });
  }

  /* ── INIT ───────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', mount);

})();
