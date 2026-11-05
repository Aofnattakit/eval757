/* ใช้ร่วมกันระหว่างหน้าผู้ประเมินและหน้าแอดมิน */
(function () {
  const API = (window.EVAL_API_URL || '').trim();
  const DEMO = !API;

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  async function call(action, payload) {
    if (DEMO) return demo(action, payload || {});
    const body = JSON.stringify(Object.assign({ action }, payload || {}));
    let res;
    if (action === 'public') { try { res = await fetch(API + '?action=public', { method: 'GET' }); } catch (e) { throw new Error('เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ต'); } }
    else {
      const ctl = window.AbortController ? new AbortController() : null;
      const tm = ctl ? setTimeout(() => ctl.abort(), 40000) : null;
      try { res = await fetch(API, { method: 'POST', body, signal: ctl ? ctl.signal : undefined }); } // text/plain → ไม่มี preflight
      catch (e) { throw new Error(e && e.name === 'AbortError' ? 'หมดเวลารอการตอบกลับ' : 'เชื่อมต่อไม่ได้'); }
      finally { if (tm) clearTimeout(tm); }
    }
    let j;
    try { j = await res.json(); } catch (e) { throw new Error('ระบบไม่ว่างชั่วคราว'); }
    if (!j.ok) throw new Error(j.error || 'เกิดข้อผิดพลาด');
    return j.data;
  }

  /* ---------- โหมดตัวอย่าง ---------- */
  const D = {
    event: {
      title: 'แบบประเมินผลความพึงพอใจภาควิชาการ',
      subtitle: 'โครงการฝึกอบรมเจ้าหน้าที่และผู้บังคับบัญชายุวกาชาด หลักสูตรครูผู้สอนกิจกรรมยุวกาชาด รุ่นที่ 757',
      detail: 'ระหว่างวันที่ 6 – 8 พฤศจิกายน 2569 ณ หอประชุมศิลปอาชา โรงเรียนบรรหารแจ่มใสวิทยา 1',
      instructions: 'เกณฑ์: 5 = พึงพอใจมากที่สุด · 4 = มาก · 3 = ปานกลาง · 2 = น้อย · 1 = น้อยที่สุด (ไม่ต้องระบุชื่อผู้ประเมิน)',
      thankYou: 'ขอบคุณที่ให้ความร่วมมือ',
      needCode: false
    },
    scale: ['มากที่สุด', 'มาก', 'ปานกลาง', 'น้อย', 'น้อยที่สุด'],
    questions: [
      ['Q1', 'ด้านวิทยากร', 'ความเป็นมิตรของวิทยากร'],
      ['Q2', 'ด้านวิทยากร', 'การให้คำปรึกษาแนะนำได้ดี'],
      ['Q3', 'ด้านวิทยากร', 'การดูแลเอาใจใส่ เต็มใจให้ความรู้ของวิทยากร'],
      ['Q4', 'ด้านวิทยากร', 'ความรู้ ความสามารถของวิทยากร'],
      ['Q5', 'ด้านวิทยากร', 'การอธิบายและตอบข้อสงสัยได้ตรงประเด็น'],
      ['Q6', 'ด้านคุณภาพวิชาการ', 'ความเหมาะสมของเนื้อหาวิชา'],
      ['Q7', 'ด้านคุณภาพวิชาการ', 'เนื้อหาวิชาเป็นประโยชน์ต่อการปฏิบัติหน้าที่'],
      ['Q8', 'ด้านคุณภาพวิชาการ', 'ได้รับความรู้และประสบการณ์ที่เป็นประโยชน์']
    ].map(([id, section, text]) => ({ id, section, text, type: 'scale', options: [] }))
      .concat([
        { id: 'Q9', section: 'ตอนที่ 2 ความคิดเห็น', text: 'สิ่งที่ท่านพึงพอใจ', type: 'text', options: [] },
        { id: 'Q10', section: 'ตอนที่ 2 ความคิดเห็น', text: 'สิ่งที่ท่านไม่พึงพอใจ/เห็นควรปรับปรุง', type: 'text', options: [] },
        { id: 'Q11', section: 'ตอนที่ 2 ความคิดเห็น', text: 'ข้อเสนอแนะอื่น ๆ', type: 'text', options: [] }
      ]),
    subjects: [
      ['S01', '6 พ.ย. 69', '09.00–10.00', 'วิชาตัวอย่าง ก', 'วิทยากร ก', true],
      ['S02', '6 พ.ย. 69', '10.00–12.00', 'วิชาตัวอย่าง ข', 'วิทยากร ข', true],
      ['S03', '6 พ.ย. 69', '13.00–16.00', 'วิชาตัวอย่าง ค', 'วิทยากร ค', false],
      ['S04', '7 พ.ย. 69', '09.00–12.00', 'วิชาตัวอย่าง ง', 'วิทยากร ง', false],
      ['S05', '7 พ.ย. 69', '13.00–16.00', 'วิชาตัวอย่าง จ', 'วิทยากร ข', false],
      ['S06', '8 พ.ย. 69', '09.00–12.00', 'วิชาตัวอย่าง ฉ', 'วิทยากร จ', false]
    ].map(([id, day, time, name, instructor, open], i) => ({ id, order: i + 1, day, time, name, instructor, open })),
    participants: 120,
    responses: null
  };

  function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function demoResponses() {
    const rnd = seeded(757);
    const out = [];
    const base = { S01: 4.6, S02: 4.1, S03: 4.4, S04: 3.7, S05: 4.3, S06: 4.5 };
    const bias = { Q2: -0.25, Q6: -0.3, Q1: 0.15, Q8: 0.1 };
    const praise = ['สนุก ได้ลงมือทำจริง', 'วิทยากรเป็นกันเอง', 'ได้เทคนิคไปใช้กับนักเรียน', 'เพลงและกิจกรรมสนุกมาก', 'อธิบายชัดเจน'];
    const sugg = ['อยากให้มีเวลาฝึกปฏิบัติมากขึ้น', 'ขอเอกสารประกอบเพิ่ม', 'เสียงไมค์ด้านหลังไม่ค่อยชัด', 'ช่วงบ่ายง่วง ควรมีกิจกรรมเคลื่อนไหว', ''];
    const t0 = Date.now() - 2 * 864e5;
    D.subjects.forEach((s, si) => {
      const n = 70 + Math.floor(rnd() * 45) - si * 6;
      for (let k = 0; k < n; k++) {
        const a = {};
        D.questions.forEach(q => {
          if (q.type !== 'scale') return;
          let v = base[s.id] + (bias[q.id] || 0) + (rnd() - 0.5) * 1.6;
          a[q.id] = Math.max(1, Math.min(5, Math.round(v)));
        });
        if (rnd() < 0.3) a.Q9 = praise[Math.floor(rnd() * praise.length)];
        if (rnd() < 0.25) a.Q10 = sugg[Math.floor(rnd() * sugg.length)];
        out.push({ t: t0 + si * 6 * 36e5 + k * 6e4, s: s.id, a });
      }
    });
    return out;
  }

  // โหมดตัวอย่าง: จำการแก้ไขและคำตอบที่ส่งไว้ในเบราว์เซอร์นี้ เพื่อให้หน้าผู้ประเมินกับหน้าแอดมินเห็นข้อมูลเดียวกัน
  const BASE_SUBJECTS = JSON.parse(JSON.stringify(D.subjects));
  function demoState() {
    const st = store.get('ev_demo_state', null) || {};
    st.open = st.open || {}; st.extra = st.extra || []; st.cfg = st.cfg || {};
    D.subjects = JSON.parse(JSON.stringify(st.subjects || BASE_SUBJECTS));
    D.subjects.forEach(s => { if (Object.prototype.hasOwnProperty.call(st.open, s.id)) s.open = st.open[s.id]; });
    const c = st.cfg;
    if (c.eventTitle != null) D.event.title = c.eventTitle;
    if (c.eventSubtitle != null) D.event.subtitle = c.eventSubtitle;
    if (c.eventDetail != null) D.event.detail = c.eventDetail;
    if (c.instructions != null) D.event.instructions = c.instructions;
    if (c.thankYou != null) D.event.thankYou = c.thankYou;
    D.accessCode = c.accessCode != null ? c.accessCode : '';
    D.event.needCode = !!D.accessCode;
    if (c.participants != null) D.participants = Number(c.participants) || 0;
    return st;
  }
  const save = st => store.set('ev_demo_state', st);
  async function demo(action, p) {
    await new Promise(r => setTimeout(r, 250));
    const st = demoState();
    const pw = st.cfg.adminPassword || 'admin757';
    const auth = () => { if (p.password !== pw) throw new Error('รหัสผ่านแอดมินไม่ถูกต้อง' + (pw === 'admin757' ? ' (โหมดตัวอย่างใช้ admin757)' : '')); };
    const pub = () => ({ event: Object.assign({}, D.event), scale: D.scale, questions: D.questions, subjects: D.subjects.map(s => Object.assign({}, s)) });
    switch (action) {
      case 'public': return pub();
      case 'checkCode':
        if (D.accessCode && String(p.code || '').trim() !== D.accessCode) throw new Error('รหัสเข้าร่วมไม่ถูกต้อง');
        return { valid: true };
      case 'submit': {
        if (D.accessCode && String(p.code || '').trim() !== D.accessCode) throw new Error('รหัสเข้าร่วมไม่ถูกต้อง');
        const s = D.subjects.find(x => x.id === p.subjectId);
        if (!s || !s.open) throw new Error('วิชานี้ปิดรับการประเมินแล้ว');
        st.extra.push({ t: Date.now(), s: p.subjectId, a: p.answers });
        save(st);
        return { saved: true };
      }
      case 'admin':
        auth();
        if (!D.responses) D.responses = demoResponses();
        return Object.assign(pub(), { participants: D.participants, accessCode: D.accessCode, responses: D.responses.concat(st.extra), sheetUrl: '', serverTime: Date.now() });
      case 'setOpen':
        auth();
        D.subjects.forEach(s => { if ((p.ids || [p.id]).includes(s.id)) st.open[s.id] = !!p.open; });
        save(st);
        return { ok: true };
      case 'setParticipants':
        auth(); st.cfg.participants = Number(p.value) || 0; save(st);
        return { ok: true };
      case 'saveSubjects': {
        auth();
        if (!D.responses) D.responses = demoResponses();
        const all = D.responses.concat(st.extra);
        const keep = new Set(p.subjects.map(x => x.id).filter(Boolean));
        D.subjects.forEach(o => { if (!keep.has(o.id) && all.some(r => r.s === o.id)) throw new Error('ลบวิชา "' + o.name + '" ไม่ได้ เพราะมีผลการประเมินแล้ว'); });
        let max = 0;
        D.subjects.concat(p.subjects).forEach(x => { const m = /^S(\d+)$/.exec(x.id || ''); if (m) max = Math.max(max, +m[1]); });
        st.subjects = p.subjects.map((x, i) => {
          if (!String(x.name || '').trim()) throw new Error('รายวิชาลำดับที่ ' + (i + 1) + ' ยังไม่มีชื่อวิชา');
          const id = x.id || ('S' + String(++max).padStart(2, '0'));
          return { id, order: i + 1, day: x.day || '', time: x.time || '', name: x.name.trim(), instructor: x.instructor || '', open: Object.prototype.hasOwnProperty.call(st.open, id) ? !!st.open[id] : !!(D.subjects.find(o => o.id === id) || {}).open };
        });
        save(st);
        return { count: st.subjects.length };
      }
      case 'saveConfig': {
        auth();
        const c = p.config || {};
        ['eventTitle', 'eventSubtitle', 'eventDetail', 'instructions', 'thankYou', 'accessCode', 'participants'].forEach(k => { if (k in c) st.cfg[k] = String(c[k] == null ? '' : c[k]).trim(); });
        if (c.adminPassword) { if (String(c.adminPassword).trim().length < 4) throw new Error('รหัสผ่านแอดมินต้องยาวอย่างน้อย 4 ตัวอักษร'); st.cfg.adminPassword = String(c.adminPassword).trim(); }
        save(st);
        return { saved: true };
      }
    }
    throw new Error('ไม่รู้จักคำสั่ง');
  }

  /* ---------- โหมดมืด/สว่าง ---------- */
  function isDark() {
    const t = document.documentElement.dataset.theme;
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function themeButton(btn, onChange) {
    const paint = () => { const d = isDark(); btn.textContent = d ? '☀' : '☾'; btn.title = d ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'; btn.setAttribute('aria-label', btn.title); };
    btn.onclick = () => {
      const next = isDark() ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      store.set('ev_theme', next);
      paint(); if (onChange) onChange();
    };
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { paint(); if (onChange) onChange(); });
    paint();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  window.EvalCommon = { call, store, esc, DEMO, isDark, themeButton };
})();
