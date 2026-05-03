// Additional editorial screens: onboarding, scholarships, chat list, chat thread, essay draft

const EdPhone2 = window.EdPhone2 = ({ children, dark }) => (
  <div style={{ width: 390, height: 844, background: '#f5f1e8', borderRadius: 44, border: '1px solid #d4c9b0', overflow: 'hidden', position: 'relative' }} className="ed">
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, padding: '14px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 600, zIndex: 10 }}>
      <span>9:41</span>
      <span style={{ fontSize: 11 }}>●●●● 􀙇 ▮</span>
    </div>
    <div style={{ position: 'absolute', top: 48, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>{children}</div>
  </div>
);

const EdNav2 = ({ active }) => {
  const items = [
    { id: 'home', label: 'Today', icon: '◐' },
    { id: 'programs', label: 'Programs', icon: '◇' },
    { id: 'apply', label: 'Apply', icon: '◎' },
    { id: 'social', label: 'Pulse', icon: '◈' },
    { id: 'profile', label: 'You', icon: '○' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fbf8f1', borderTop: '1px solid #e8e0cf', padding: '10px 16px 28px', display: 'flex', justifyContent: 'space-around' }}>
      {items.map(it => (
        <div key={it.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: active === it.id ? 1 : 0.45 }}>
          <span style={{ fontSize: 18 }}>{it.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 500 }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ONBOARDING — welcome screen
// ─────────────────────────────────────────────────────────
const EdOnboarding = () => (
  <EdPhone2>
    <div style={{ height: '100%', padding: '40px 32px 32px', display: 'flex', flexDirection: 'column' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s === 1 ? '#1a1612' : '#e8e0cf' }}></div>
        ))}
      </div>
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 8 }}>Step 1 of 4</div>
      <div className="ed-serif" style={{ fontSize: 42, lineHeight: 1.05, fontWeight: 600, marginBottom: 16 }}>
        Welcome.<br />Let's get<br />you in.
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.55, color: '#3a3025', marginBottom: 24 }}>
        oHub is the calmer way through OUAC season. We'll track your applications, surface scholarships you actually qualify for, and keep your essays on schedule.
      </div>

      {/* Illustration placeholder */}
      <div style={{ flex: 1, background: 'repeating-linear-gradient(135deg, #fbf8f1, #fbf8f1 8px, #ede4d0 8px, #ede4d0 9px)', border: '1px solid #d4c9b0', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, minHeight: 180 }}>
        <span className="ed-mono" style={{ fontSize: 11, color: '#8b7e62', textTransform: 'uppercase', letterSpacing: '0.1em' }}>[ welcome illustration ]</span>
      </div>

      <button className="ed-btn" style={{ width: '100%', fontFamily: 'inherit', cursor: 'pointer', padding: '14px' }}>I'm a Grade 12 applicant →</button>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#8b7e62' }}>
        Already have an account? <span className="ed-link">Sign in</span>
      </div>
    </div>
  </EdPhone2>
);

// ─────────────────────────────────────────────────────────
// ONBOARDING 2 — pick schools
// ─────────────────────────────────────────────────────────
const EdOnboarding2 = () => {
  const d = window.oHubData;
  const [selected, setSelected] = React.useState(['uoft', 'waterloo', 'queens']);
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <EdPhone2>
      <div style={{ height: '100%', padding: '40px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= 2 ? '#1a1612' : '#e8e0cf' }}></div>
          ))}
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 6 }}>Step 2 of 4 · Schools</div>
        <div className="ed-serif" style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 600, marginBottom: 8 }}>Where are<br />you applying?</div>
        <div style={{ fontSize: 13, color: '#5c4a2f', marginBottom: 16, lineHeight: 1.4 }}>Pick all that interest you. You can change this later.</div>

        <div style={{ flex: 1, overflow: 'auto' }} className="ed-scroll">
          {d.universities.map((u, i) => (
            <div key={u.id} onClick={() => toggle(u.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 0', borderTop: i > 0 ? '1px solid #e8e0cf' : 'none',
              cursor: 'pointer'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8, background: u.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 600, flexShrink: 0
              }}>{u.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#8b7e62', marginTop: 2 }}>{u.city}, ON</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '1.5px solid ' + (selected.includes(u.id) ? '#1a1612' : '#b8a888'),
                background: selected.includes(u.id) ? '#1a1612' : 'transparent',
                color: '#f5f1e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
              }}>{selected.includes(u.id) && '✓'}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 14, borderTop: '1px solid #e8e0cf', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, fontSize: 12, color: '#5c4a2f' }}>{selected.length} selected</div>
          <button className="ed-btn" style={{ fontFamily: 'inherit', cursor: 'pointer' }}>Continue →</button>
        </div>
      </div>
    </EdPhone2>
  );
};

// ─────────────────────────────────────────────────────────
// SCHOLARSHIPS
// ─────────────────────────────────────────────────────────
const EdScholarships = () => {
  const d = window.oHubData;
  return (
    <EdPhone2>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 90 }} className="ed-scroll">
        <div style={{ padding: '8px 24px 16px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 4 }}>Money</div>
          <div className="ed-serif" style={{ fontSize: 30, lineHeight: 1.05, fontWeight: 600 }}>Scholarships<br />for you</div>
        </div>

        {/* Big total */}
        <div style={{ padding: '0 24px 16px' }}>
          <div className="ed-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>Potential aid</div>
            <div className="ed-serif" style={{ fontSize: 38, fontWeight: 600, marginTop: 4 }}>$248,000</div>
            <div style={{ fontSize: 12, color: '#5c4a2f', marginTop: 6 }}>across 6 awards · 1 still actionable</div>
          </div>
        </div>

        <div style={{ padding: '4px 24px 12px', display: 'flex', gap: 6, overflowX: 'auto' }} className="ed-scroll">
          {['All', 'Eligible', 'Submitted', 'Auto-considered'].map((t, i) => (
            <span key={t} className="ed-pill" style={{ background: i === 0 ? '#1a1612' : '#fbf8f1', color: i === 0 ? '#f5f1e8' : '#1a1612', borderColor: i === 0 ? '#1a1612' : '#d4c9b0', whiteSpace: 'nowrap' }}>{t}</span>
          ))}
        </div>

        <div style={{ padding: '0 24px' }}>
          {d.scholarships.map((s, i) => (
            <div key={i} style={{ padding: '18px 0', borderTop: '1px solid #e8e0cf' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="ed-serif" style={{ fontSize: 19, lineHeight: 1.15, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#5c4a2f', marginTop: 4 }}>Deadline: {s.deadline} · Match {s.match}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ed-serif" style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <span className={'ed-pill ' + (s.status === 'Eligible' ? 'ed-bg-amber' : s.status === 'Submitted' ? 'ed-bg-green' : '')} style={{ border: 'none' }}>{s.status}</span>
              </div>
              {/* Match bar */}
              <div style={{ marginTop: 10, height: 3, background: '#e8e0cf', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: s.match + '%', height: '100%', background: s.match >= 90 ? '#15803d' : s.match >= 80 ? '#1a1612' : '#b8a888' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <EdNav2 active="apply" />
    </EdPhone2>
  );
};

// ─────────────────────────────────────────────────────────
// CHAT LIST
// ─────────────────────────────────────────────────────────
const EdChatList = () => {
  const d = window.oHubData;
  return (
    <EdPhone2>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 90 }} className="ed-scroll">
        <div style={{ padding: '8px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 4 }}>Messages</div>
            <div className="ed-serif" style={{ fontSize: 30, lineHeight: 1.05, fontWeight: 600 }}>Chats</div>
          </div>
          <span style={{ fontSize: 18 }}>✎</span>
        </div>

        {/* Search */}
        <div style={{ padding: '0 24px 12px' }}>
          <div style={{ background: '#fbf8f1', border: '1px solid #e8e0cf', borderRadius: 999, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, opacity: 0.5 }}>⌕</span>
            <span style={{ fontSize: 13, color: '#8b7e62' }}>Search messages</span>
          </div>
        </div>

        {/* Pinned */}
        <div style={{ padding: '4px 24px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62' }}>Pinned</div>
        {d.chats.filter(c => c.pinned).map((c, i, arr) => (
          <div key={c.id} style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, borderTop: i === 0 ? 'none' : '1px solid #e8e0cf' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1612', color: '#f5f1e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 16 }}>#</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#8b7e62' }}>{c.time}</div>
              </div>
              <div style={{ fontSize: 12, color: '#5c4a2f', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last}</div>
            </div>
            {c.unread > 0 && (
              <div style={{ background: '#1a1612', color: '#f5f1e8', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600, minWidth: 22, textAlign: 'center' }}>{c.unread}</div>
            )}
          </div>
        ))}

        {/* All */}
        <div style={{ padding: '20px 24px 4px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62' }}>All</div>
        {d.chats.filter(c => !c.pinned).map((c, i) => (
          <div key={c.id} style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, borderTop: i === 0 ? 'none' : '1px solid #e8e0cf' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.dm ? '#d4a574' : '#5c4a2f', color: '#fbf8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 600 }}>
              {c.dm ? c.name.split(' ').map(s => s[0]).join('').slice(0, 2) : '#'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: c.unread > 0 ? 600 : 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#8b7e62' }}>{c.time}</div>
              </div>
              <div style={{ fontSize: 12, color: '#5c4a2f', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last}</div>
            </div>
            {c.unread > 0 && <div style={{ background: '#1a1612', color: '#f5f1e8', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600, minWidth: 22, textAlign: 'center' }}>{c.unread}</div>}
          </div>
        ))}
      </div>
      <EdNav2 active="social" />
    </EdPhone2>
  );
};

// ─────────────────────────────────────────────────────────
// CHAT THREAD — group chat detail
// ─────────────────────────────────────────────────────────
const EdChatThread = () => {
  const messages = [
    { who: 'Aanya P.', text: 'anyone else freaking out about Waterloo AIF??', time: '10:42', mine: false },
    { who: 'Rishi M.', text: 'lol yes. on question 4 rn and stuck', time: '10:43', mine: false },
    { who: 'You', text: 'i found this oHub article super helpful', time: '10:45', mine: true },
    { who: 'You', text: 'basically — pick ONE concrete moment per question. don\'t list five things', time: '10:45', mine: true },
    { who: 'Aanya P.', text: 'omg ok thank you', time: '10:47', mine: false },
    { who: 'Maya L.', text: 'how long is everyone making them?', time: '10:48', mine: false },
    { who: 'You', text: '~150 words each. they read like 1000 of these', time: '10:50', mine: true },
  ];
  return (
    <EdPhone2>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e8e0cf', display: 'flex', alignItems: 'center', gap: 12, background: '#fbf8f1' }}>
          <span style={{ fontSize: 18 }}>‹</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>OUAC 101 Class of '26</div>
            <div style={{ fontSize: 11, color: '#8b7e62' }}>412 members · 38 online</div>
          </div>
          <span style={{ fontSize: 16, color: '#8b7e62' }}>⋯</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }} className="ed-scroll">
          <div style={{ textAlign: 'center', fontSize: 11, color: '#8b7e62', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today, 10:42 AM</div>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14, display: 'flex', flexDirection: m.mine ? 'row-reverse' : 'row', gap: 10 }}>
              {!m.mine && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d4a574', color: '#fbf8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  {m.who.split(' ').map(s => s[0]).join('').slice(0, 2)}
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {!m.mine && <div style={{ fontSize: 11, color: '#8b7e62', marginBottom: 3, marginLeft: 2 }}>{m.who}</div>}
                <div style={{
                  background: m.mine ? '#1a1612' : '#fbf8f1',
                  color: m.mine ? '#f5f1e8' : '#1a1612',
                  padding: '10px 14px',
                  borderRadius: m.mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontSize: 13,
                  lineHeight: 1.4,
                  border: m.mine ? 'none' : '1px solid #e8e0cf',
                }}>{m.text}</div>
                <div style={{ fontSize: 10, color: '#8b7e62', marginTop: 3, textAlign: m.mine ? 'right' : 'left', marginLeft: m.mine ? 0 : 2, marginRight: m.mine ? 2 : 0 }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid #e8e0cf', background: '#fbf8f1', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: '#8b7e62' }}>+</span>
          <div style={{ flex: 1, background: '#f5f1e8', border: '1px solid #e8e0cf', borderRadius: 999, padding: '10px 16px', fontSize: 13, color: '#8b7e62' }}>Message…</div>
          <span style={{ fontSize: 18, color: '#1a1612' }}>↗</span>
        </div>
      </div>
    </EdPhone2>
  );
};

// ─────────────────────────────────────────────────────────
// ESSAY DRAFT VIEW
// ─────────────────────────────────────────────────────────
const EdEssay = () => (
  <EdPhone2>
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px 14px', borderBottom: '1px solid #e8e0cf' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>‹</span>
          <span className="ed-pill" style={{ background: '#fef3e2', color: '#9a3412', border: 'none' }}>Auto-saved · 14:32</span>
          <span style={{ fontSize: 16 }}>⋯</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>Waterloo · AIF</div>
        <div className="ed-serif" style={{ fontSize: 22, lineHeight: 1.15, fontWeight: 600, marginTop: 4 }}>
          Question 4 of 7
        </div>
      </div>

      {/* Prompt */}
      <div style={{ padding: '16px 20px', background: '#fbf8f1', borderBottom: '1px solid #e8e0cf' }}>
        <div className="ed-serif" style={{ fontSize: 15, lineHeight: 1.45, fontWeight: 500, color: '#1a1612' }}>
          "Describe an activity, project or accomplishment outside school that has been most meaningful to you. Why?"
        </div>
        <div style={{ fontSize: 11, color: '#8b7e62', marginTop: 8 }}>200 words max · plain text only</div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px', background: '#f5f1e8' }} className="ed-scroll">
        <div className="ed-serif" style={{ fontSize: 15, lineHeight: 1.6, color: '#1a1612' }}>
          <p style={{ margin: 0 }}>Two summers ago I taught myself to weld. Not for school, not for an award — I wanted to build a metal frame for my mom's vegetable garden after the wooden one rotted out.</p>
          <p style={{ marginTop: 14 }}>The first frame was crooked. The second collapsed under tomato vines. By the third, I'd watched maybe forty hours of YouTube and burned a small hole through my dad's gardening glove.</p>
          <p style={{ marginTop: 14 }}>What stuck with me wasn't the welding. It was realizing I could just <em>start</em> something. No teacher, no rubric, no grade<span style={{ background: '#fef3c7', borderBottom: '1.5px solid #f59e0b' }}>—</span></p>
        </div>
      </div>

      {/* Footer with assist */}
      <div style={{ padding: '14px 20px 28px', borderTop: '1px solid #e8e0cf', background: '#fbf8f1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="ed-mono" style={{ fontSize: 11, color: '#5c4a2f' }}>147 / 200 words</div>
          <div className="ed-mono" style={{ fontSize: 11, color: '#15803d' }}>Reads ~9th grade · Active voice ✓</div>
        </div>
        <div className="ed-card" style={{ padding: 12, background: '#fef3c7', borderColor: '#fbbf24', display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 14, marginTop: 2 }}>◇</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#7c4a03' }}>oHub coach suggests</div>
            <div style={{ fontSize: 12, color: '#7c4a03', marginTop: 2 }}>Strong opening. Try ending on a specific moment, not a generalization.</div>
          </div>
        </div>
      </div>
    </div>
  </EdPhone2>
);

window.EditorialScreens2 = { EdOnboarding, EdOnboarding2, EdScholarships, EdChatList, EdChatThread, EdEssay };
