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
    responses: null,
    finalResponses: null
  };

  /* แบบประเมินผลการฝึกอบรม (ภาพรวม) — ตรงกับชีต "ข้อคำถามภาพรวม" */
  (function () {
    const P1 = 'ตอนที่ 1 ข้อมูลพื้นฐานทั่วไปของผู้เข้ารับการฝึกอบรม', P2 = 'ตอนที่ 2 การดำเนินการจัดการฝึกอบรม', P3 = 'ตอนที่ 3 กิจกรรมในการฝึกอบรม';
    const A = 'ความเหมาะสมต่อการดำเนินการจัดการฝึกอบรม', B = 'ความเหมาะสมต่อสถานที่และอาหาร', C = 'ความเหมาะสมต่อการนำไปใช้', Dd = 'หลังผ่านการฝึกอบรมแล้วท่านประเมินตนเองว่า';
    const rows = [
      ['F1', P1, 'ข้อมูลพื้นฐาน', 'เพศ', 'choice', 'ชาย,หญิง'],
      ['F2', P1, 'ข้อมูลพื้นฐาน', 'อายุ', 'choice', 'ไม่เกิน 30 ปี,31 – 40 ปี,41 – 50 ปี,51 ปีขึ้นไป'],
      ['F3', P1, 'ข้อมูลพื้นฐาน', 'วุฒิการศึกษา', 'choice', 'ปริญญาตรี,ปริญญาโท,ปริญญาเอก,อื่น ๆ (โปรดระบุ)'],
      ['F4', P1, 'ข้อมูลพื้นฐาน', 'สถานภาพในหน่วยงานของผู้เข้ารับการฝึกอบรม', 'choice', 'ผู้บริหารสถานศึกษา,ครูผู้สอนยุวกาชาด,เจ้าหน้าที่จากสำนักงานเขตพื้นที่,อื่น ๆ (โปรดระบุ)'],
      ['F5', P1, 'ข้อมูลพื้นฐาน', 'ประสบการณ์ด้านการจัดกิจกรรมยุวกาชาด', 'choice', 'น้อยกว่า 5 ปี,5 – 10 ปี,11 – 15 ปี,16 – 20 ปี,มากกว่า 20 ปี'],
      ['P1', P2, A, 'จุดมุ่งหมายของหลักสูตร'], ['P2', P2, A, 'การกำหนดวัตถุประสงค์ของหลักสูตร'],
      ['P3', P2, A, 'การกำหนดคุณสมบัติของผู้เข้ารับการฝึกอบรม'], ['P4', P2, A, 'จำนวนวันที่ใช้ในการฝึกอบรม'],
      ['P5', P2, A, 'ช่วงระยะเวลาการฝึกอบรม (วันที่ 6 – 8 พฤศจิกายน 2569)'], ['P6', P2, A, 'จำนวนผู้เข้ารับการฝึกอบรม'],
      ['P7', P2, A, 'การประสานงานการจัดการฝึกอบรม'], ['P8', P2, A, 'การเลือกและคัดสรรวิทยากรที่มีความสามารถ'],
      ['P9', P2, A, 'การปฏิสัมพันธ์ระหว่างผู้เข้ารับการฝึกอบรม คณะวิทยากร และบุคลากรที่จัดการฝึกอบรม'],
      ['P10', P2, A, 'การอำนวยความสะดวกต่าง ๆ ตลอดระยะเวลาที่เข้ารับการฝึกอบรม'],
      ['P11', P2, A, 'วิธีการจัดการฝึกอบรม โดยใช้เทคนิคการฝึกอบรมแบบผสมผสาน การจัดกิจกรรมเน้นขบวนการกลุ่ม การมีส่วนร่วมของผู้เข้ารับการฝึกอบรม'],
      ['P12', P2, B, 'ขนาดห้องประชุม/ บริเวณที่ใช้ในการฝึกอบรม'], ['P13', P2, B, 'ระบบแสง/ เสียง'],
      ['P14', P2, B, 'บรรยากาศของสถานที่ที่ใช้ในการฝึกอบรม'], ['P15', P2, B, 'ความพร้อมด้านอุปกรณ์ที่ใช้ในการฝึกอบรม'],
      ['P16', P2, B, 'ปริมาณอาหาร'], ['P17', P2, B, 'คุณภาพอาหาร'],
      ['P18', P2, C, 'ท่านมีโอกาสในการปฏิบัติกิจกรรมต่าง ๆ ตามที่หลักสูตรกำหนด'], ['P19', P2, C, 'ท่านได้รับความรู้และประสบการณ์ตรงตามความคาดหวัง'],
      ['P20', P2, C, 'ท่านมีความมั่นใจและสามารถนำความรู้ไปประยุกต์ใช้ให้เกิดประโยชน์ต่อการจัดกิจกรรมยุวกาชาด'], ['P21', P2, C, 'ท่านสามารถนำความรู้ไปเผยแพร่และถ่ายทอดได้'],
      ['P22', P2, Dd, 'สามารถจัดกิจกรรมยุวกาชาดได้ในระดับ'], ['P23', P2, Dd, 'ให้คำแนะนำการจัดกิจกรรมยุวกาชาดได้ในระดับ'],
      ['P24', P2, Dd, 'เผยแพร่/ประชาสัมพันธ์กิจกรรมยุวกาชาดได้ในระดับ'], ['P25', P2, Dd, 'สนับสนุน ส่งเสริมการจัดกิจกรรมยุวกาชาดได้ในระดับ'],
      ['P26', P2, 'ข้อเสนอแนะ', 'ข้อเสนอแนะอื่น ๆ (การดำเนินการจัดการฝึกอบรม)', 'text'],
      ['A1', P3, 'กิจกรรม', 'การปฐมนิเทศ'], ['A2', P3, 'กิจกรรม', 'การจัดหน่วยบริการประจำวัน'],
      ['A3', P3, 'กิจกรรม', 'การจัดหัวหน้าหน่วย/รองหัวหน้าหน่วย'], ['A4', P3, 'กิจกรรม', 'พิธีเปิด – พิธีปิดการฝึกอบรม'],
      ['A5', P3, 'กิจกรรม', 'นันทนาการ'],
      ['A6', P3, 'ข้อเสนอแนะ', 'ข้อเสนอแนะอื่น ๆ (กิจกรรมในการฝึกอบรม)', 'text']
    ];
    D.final = {
      open: true,
      title: 'แบบประเมินผลการฝึกอบรม',
      instructions: 'แบบประเมินผลนี้จัดทำขึ้นเพื่อประเมินผลการฝึกอบรม เกี่ยวกับการดำเนินการจัดการฝึกอบรม วิชาการ และกิจกรรมในการฝึกอบรม เพื่อเป็นข้อมูลในการปรับปรุงการจัดการฝึกอบรมหลักสูตรนี้ให้สมบูรณ์ยิ่งขึ้น มีทั้งหมด 3 ตอน (ไม่ต้องระบุชื่อผู้ประเมิน)',
      heads: { 'ตอนที่ 2': 'ระดับความเหมาะสม', 'ตอนที่ 3': 'การมีส่วนร่วมหรือฝึกปฏิบัติ' },
      questions: rows.map(r => ({ id: r[0], part: r[1], section: r[2], text: r[3], type: r[4] || 'scale', options: r[5] ? r[5].split(',') : [] }))
    };
  })();
  const BASE_FINAL = JSON.stringify(D.final);

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
  function demoFinal() {
    const rnd = seeded(2569);
    const pick = w => { let r = rnd() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < w.length; i++) { if ((r -= w[i]) < 0) return i; } return w.length - 1; };
    const W = { F1: [38, 62], F2: [14, 34, 36, 16], F3: [58, 36, 3, 3], F4: [12, 80, 4, 4], F5: [44, 26, 14, 9, 7] };
    const otherTxt = { F3: ['ปวส.', 'ประกาศนียบัตรบัณฑิต'], F4: ['ครูพี่เลี้ยง', 'ครูอัตราจ้าง'] };
    const base = { 'ความเหมาะสมต่อการดำเนินการจัดการฝึกอบรม': 4.5, 'ความเหมาะสมต่อสถานที่และอาหาร': 4.05, 'ความเหมาะสมต่อการนำไปใช้': 4.4, 'หลังผ่านการฝึกอบรมแล้วท่านประเมินตนเองว่า': 4.2, 'กิจกรรม': 4.55 };
    const bias = { P13: -0.45, P16: -0.25, P4: -0.2, A5: 0.2, P8: 0.15 };
    const sugA = ['ควรเพิ่มวันอบรมอีก 1 วัน', 'ระบบเสียงด้านหลังห้องไม่ชัด', 'อาหารอร่อย แต่ปริมาณน้อยไปนิด', 'ประทับใจทีมวิทยากร', 'อยากให้มีเอกสารสรุปแจก'];
    const sugB = ['นันทนาการสนุกมาก', 'ได้ฝึกเป็นหัวหน้าหน่วยจริง ได้ประสบการณ์', 'พิธีปิดประทับใจ', 'ขอเพลงนันทนาการเป็นไฟล์'];
    const out = [], t0 = Date.now() - 6 * 36e5;
    for (let k = 0; k < 104; k++) {
      const a = {};
      D.final.questions.forEach(q => {
        if (q.type === 'choice') {
          const o = q.options[pick(W[q.id] || q.options.map(() => 1))];
          a[q.id] = /^อื่น/.test(o) ? o + ': ' + otherTxt[q.id][Math.floor(rnd() * otherTxt[q.id].length)] : o;
        }
      });
      const xp = D.final.questions[4].options.indexOf(a.F5);
      D.final.questions.forEach(q => {
        if (q.type === 'scale') {
          let v = base[q.section] + (bias[q.id] || 0) + (q.section.startsWith('หลังผ่าน') ? xp * 0.12 - 0.15 : 0) + (rnd() - 0.5) * 1.5;
          a[q.id] = Math.max(1, Math.min(5, Math.round(v)));
        }
      });
      if (rnd() < 0.2) a.P26 = sugA[Math.floor(rnd() * sugA.length)];
      if (rnd() < 0.15) a.A6 = sugB[Math.floor(rnd() * sugB.length)];
      out.push({ t: t0 + k * 9e4, a });
    }
    return out;
  }

  // โหมดตัวอย่าง: จำการแก้ไขและคำตอบที่ส่งไว้ในเบราว์เซอร์นี้ เพื่อให้หน้าผู้ประเมินกับหน้าแอดมินเห็นข้อมูลเดียวกัน
  const BASE_SUBJECTS = JSON.parse(JSON.stringify(D.subjects));
  function demoState() {
    const st = store.get('ev_demo_state', null) || {};
    st.open = st.open || {}; st.extra = st.extra || []; st.cfg = st.cfg || {};
    D.subjects = JSON.parse(JSON.stringify(st.subjects || BASE_SUBJECTS));
    D.subjects.forEach(s => { if (Object.prototype.hasOwnProperty.call(st.open, s.id)) s.open = st.open[s.id]; });
    st.fextra = st.fextra || [];
    const c = st.cfg;
    D.final = JSON.parse(BASE_FINAL);
    if (c.finalOpen != null) D.final.open = !!c.finalOpen;
    if (c.finalTitle != null) D.final.title = c.finalTitle;
    if (c.finalInstructions != null) D.final.instructions = c.finalInstructions;
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
    const pub = () => ({ event: Object.assign({}, D.event), scale: D.scale, questions: D.questions, subjects: D.subjects.map(s => Object.assign({}, s)), final: JSON.parse(JSON.stringify(D.final)) });
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
      case 'submitFinal': {
        if (!D.final.open) throw new Error('แบบประเมินนี้ปิดรับการประเมินแล้ว');
        const a = Object.assign({}, p.answers);
        D.final.questions.forEach(q => { if (q.type === 'choice' && /^อื่น/.test(a[q.id] || '')) a[q.id] = a[q.id] + ': ' + (a[q.id + '_other'] || ''); delete a[q.id + '_other']; });
        st.fextra.push({ t: Date.now(), a });
        save(st);
        return { saved: true };
      }
      case 'setFinalOpen':
        auth(); st.cfg.finalOpen = !!p.open; save(st);
        return { open: !!p.open };
      case 'admin':
        auth();
        if (!D.responses) D.responses = demoResponses();
        if (!D.finalResponses) D.finalResponses = demoFinal();
        return Object.assign(pub(), { participants: D.participants, accessCode: D.accessCode, responses: D.responses.concat(st.extra), finalResponses: D.finalResponses.concat(st.fextra), sheetUrl: '', serverTime: Date.now() });
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
        ['eventTitle', 'eventSubtitle', 'eventDetail', 'instructions', 'thankYou', 'accessCode', 'participants', 'finalTitle', 'finalInstructions'].forEach(k => { if (k in c) st.cfg[k] = String(c[k] == null ? '' : c[k]).trim(); });
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
