// Variation A — Editorial: warm cream, serif headlines, calm, magazine-like
// Built for Grade 12 Ontario students who feel overwhelmed by the OUAC process

const ED_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

// Inject editorial styles once
if (!document.getElementById('ed-styles')) {
  const style = document.createElement('style');
  style.id = 'ed-styles';
  style.textContent = ED_FONTS + `
    .ed { font-family: 'Inter', sans-serif; color: #1a1612; background: #f5f1e8; }
    .ed-serif { font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em; }
    .ed-mono { font-family: 'JetBrains Mono', monospace; }
    .ed-card { background: #fbf8f1; border: 1px solid #e8e0cf; border-radius: 14px; }
    .ed-divider { border-top: 1px solid #e8e0cf; }
    .ed-pill { border: 1px solid #d4c9b0; background: #fbf8f1; border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 500; }
    .ed-btn { background: #1a1612; color: #f5f1e8; border-radius: 999px; padding: 10px 16px; font-weight: 500; font-size: 13px; }
    .ed-btn-ghost { background: transparent; color: #1a1612; border: 1px solid #1a1612; border-radius: 999px; padding: 10px 16px; font-weight: 500; font-size: 13px; }
    .ed-tab-active { background: #1a1612; color: #f5f1e8; }
    .ed-shadow { box-shadow: 0 1px 2px rgba(26, 22, 18, 0.04), 0 4px 12px rgba(26, 22, 18, 0.04); }
    .ed-link { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; text-decoration-color: #b8a888; }
    .ed-amber { color: #c2410c; }
    .ed-green { color: #15803d; }
    .ed-bg-amber { background: #fef3e2; color: #9a3412; }
    .ed-bg-green { background: #ecfdf5; color: #14532d; }
    .ed-bg-red { background: #fef2f2; color: #991b1b; }
    .ed-scroll::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(style);
}

// Phone shell — 390 × 844 (iPhone 14 dims, no native chrome — just app)
const EdPhone = ({ children, label }) => (
  <div style={{ width: 390, height: 844, background: '#f5f1e8', borderRadius: 44, border: '1px solid #d4c9b0', overflow: 'hidden', position: 'relative' }} className="ed">
    {/* Status bar */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, padding: '14px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 600, zIndex: 10 }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11 }}>●●●●</span>
        <span style={{ marginLeft: 4 }}>􀙇</span>
        <span style={{ display: 'inline-block', width: 22, height: 11, border: '1px solid #1a1612', borderRadius: 3, position: 'relative' }}>
          <span style={{ position: 'absolute', inset: 1, background: '#1a1612', borderRadius: 1 }}></span>
        </span>
      </span>
    </div>
    {/* Content */}
    <div style={{ position: 'absolute', top: 48, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

// Bottom nav for Editorial
const EdNav = ({ active }) => {
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

// Header bar
const EdHeader = ({ title, subtitle, right }) => (
  <div style={{ padding: '8px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
    <div>
      {subtitle && <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 4 }}>{subtitle}</div>}
      <div className="ed-serif" style={{ fontSize: 30, lineHeight: 1.05, fontWeight: 600 }}>{title}</div>
    </div>
    {right}
  </div>
);

// ─────────────────────────────────────────────────────────
// SCREEN 1 — TODAY (HOME)
// ─────────────────────────────────────────────────────────
const EdToday = () => {
  const d = window.oHubData;
  return (
    <EdPhone label="Today">
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 90 }} className="ed-scroll">
        {/* Date line */}
        <div style={{ padding: '12px 24px 0', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', display: 'flex', justifyContent: 'space-between' }}>
          <span>Saturday · January 3</span>
          <span>Issue №48</span>
        </div>

        {/* Hero — countdown */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div className="ed-serif" style={{ fontSize: 42, lineHeight: 1, fontWeight: 600 }}>
            12 days
          </div>
          <div className="ed-serif" style={{ fontSize: 22, lineHeight: 1.15, color: '#5c4a2f', marginTop: 6 }}>
            until OUAC 101 closes.<br />
            <span style={{ color: '#1a1612' }}>You're 71% there.</span>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 14, height: 6, background: '#e8e0cf', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '71%', height: '100%', background: '#1a1612' }}></div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b7e62' }}>
            <span>5 of 7 apps submitted</span>
            <span>2 in draft</span>
          </div>
        </div>

        <div className="ed-divider" style={{ margin: '0 24px' }}></div>

        {/* Today's plan */}
        <div style={{ padding: '20px 24px 8px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 10 }}>Your plan, today</div>
          {d.todayTasks.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: i > 0 ? '1px solid #e8e0cf' : 'none' }}>
              <div style={{ width: 18, height: 18, marginTop: 2, borderRadius: 4, border: '1.5px solid ' + (t.done ? '#1a1612' : '#b8a888'), background: t.done ? '#1a1612' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5f1e8', fontSize: 11, flexShrink: 0 }}>
                {t.done && '✓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#8b7e62' : '#1a1612' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#8b7e62', marginTop: 2 }}>
                  {t.est} · {t.prio === 'high' ? 'High priority' : t.prio === 'med' ? 'Medium' : 'Low'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ed-divider" style={{ margin: '12px 24px 0' }}></div>

        {/* Featured story */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 10 }}>Read · 4 min</div>
          <div className="ed-card" style={{ padding: 18 }}>
            <div className="ed-serif" style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 600 }}>
              How to write a Waterloo AIF that doesn't read like everyone else's.
            </div>
            <div style={{ fontSize: 13, color: '#5c4a2f', marginTop: 10, lineHeight: 1.5 }}>
              The Admission Information Form is the most underrated part of your application. Here's what 800 admitted students did differently.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <span className="ed-pill">Waterloo</span>
              <span className="ed-pill">Essays</span>
              <span className="ed-pill">Insider</span>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div style={{ padding: '4px 24px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 10 }}>This week</div>
          {d.events.slice(0, 3).map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i > 0 ? '1px solid #e8e0cf' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{e.name}</div>
                <div style={{ fontSize: 11, color: '#8b7e62', marginTop: 2 }}>{e.host} · {e.date}, {e.time}</div>
              </div>
              {e.attending ? <span className="ed-pill ed-bg-green" style={{ border: 'none' }}>Going</span> : <span className="ed-pill">RSVP</span>}
            </div>
          ))}
        </div>
      </div>
      <EdNav active="home" />
    </EdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// SCREEN 2 — PROGRAMS BROWSER (with search + filtering)
// ─────────────────────────────────────────────────────────
const EdPrograms = () => {
  const d = window.oHubData;
  const [q, setQ] = React.useState('');
  const [tier, setTier] = React.useState('all');

  const filtered = d.programs.filter(p => {
    const uni = d.universities.find(u => u.id === p.uni);
    const matchesQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || uni.name.toLowerCase().includes(q.toLowerCase()) || uni.short.toLowerCase().includes(q.toLowerCase());
    const matchesT = tier === 'all' || p.tier === tier;
    return matchesQ && matchesT;
  });

  return (
    <EdPhone label="Programs">
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 90 }} className="ed-scroll">
        <EdHeader subtitle="Discover" title="Programs" />

        {/* Search */}
        <div style={{ padding: '0 24px 12px' }}>
          <div style={{ background: '#fbf8f1', border: '1px solid #e8e0cf', borderRadius: 999, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, opacity: 0.5 }}>⌕</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search Waterloo CS, Ivey, Health Sci…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: '#1a1612' }}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '4px 24px 16px', display: 'flex', gap: 6, overflowX: 'auto' }} className="ed-scroll">
          {[['all', 'All ' + d.programs.length], ['reach', 'Reach'], ['target', 'Target'], ['safety', 'Safety']].map(([k, l]) => (
            <button key={k} onClick={() => setTier(k)} style={{
              border: '1px solid ' + (tier === k ? '#1a1612' : '#d4c9b0'),
              background: tier === k ? '#1a1612' : 'transparent',
              color: tier === k ? '#f5f1e8' : '#1a1612',
              borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>{l}</button>
          ))}
        </div>

        {/* Result count */}
        <div style={{ padding: '0 24px 8px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>
          {filtered.length} program{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Program list */}
        <div style={{ padding: '0 24px' }}>
          {filtered.map((p, i) => {
            const uni = d.universities.find(u => u.id === p.uni);
            return (
              <div key={p.id} style={{ padding: '20px 0', borderTop: '1px solid #e8e0cf' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 4 }}>{uni.short} · {uni.city}</div>
                    <div className="ed-serif" style={{ fontSize: 22, lineHeight: 1.15, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#5c4a2f', marginTop: 4 }}>{p.faculty}</div>
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 8, background: uni.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 600, flexShrink: 0
                  }}>{uni.initials}</div>
                </div>
                <div style={{ fontSize: 13, color: '#3a3025', marginTop: 10, lineHeight: 1.5 }}>{p.blurb}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11 }}>
                  <div>
                    <div style={{ color: '#8b7e62', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cutoff</div>
                    <div className="ed-serif" style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{p.cutoff}%</div>
                  </div>
                  <div>
                    <div style={{ color: '#8b7e62', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg. admit</div>
                    <div className="ed-serif" style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{p.avgAdmitted}%</div>
                  </div>
                  <div>
                    <div style={{ color: '#8b7e62', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tier</div>
                    <div className="ed-serif" style={{ fontSize: 17, fontWeight: 600, marginTop: 2, color: p.tier === 'reach' ? '#9a3412' : p.tier === 'target' ? '#1a1612' : '#15803d' }}>
                      {p.tier === 'reach' ? 'Reach' : p.tier === 'target' ? 'Target' : 'Safety'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8b7e62', fontSize: 13 }}>
              No programs match "{q}".
            </div>
          )}
        </div>
      </div>
      <EdNav active="programs" />
    </EdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// SCREEN 3 — PROGRAM DETAIL (Waterloo CS)
// ─────────────────────────────────────────────────────────
const EdProgramDetail = () => {
  const d = window.oHubData;
  const p = d.programs.find(x => x.id === 'uw-cs');
  const uni = d.universities.find(u => u.id === p.uni);
  return (
    <EdPhone label="Waterloo CS">
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 110 }} className="ed-scroll">
        {/* Hero */}
        <div style={{ padding: '12px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>‹</span>
          <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62' }}>Program</span>
          <span style={{ fontSize: 16 }}>♥</span>
        </div>

        <div style={{ padding: '12px 24px 16px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 6 }}>{uni.name} · {uni.city}</div>
          <div className="ed-serif" style={{ fontSize: 36, lineHeight: 1.05, fontWeight: 600 }}>
            Computer<br />Science
          </div>
          <div style={{ fontSize: 13, color: '#5c4a2f', marginTop: 8 }}>{p.faculty} · Code <span className="ed-mono">{p.code}</span></div>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '0 24px 20px' }}>
          <div className="ed-card" style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>Cutoff</div>
                <div className="ed-serif" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{p.cutoff}%</div>
                <div style={{ fontSize: 11, color: p.cutoff > d.user.avg ? '#9a3412' : '#15803d', marginTop: 2 }}>
                  Your avg: {d.user.avg}% · {(d.user.avg - p.cutoff).toFixed(1)} below
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>Avg. admitted</div>
                <div className="ed-serif" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{p.avgAdmitted}%</div>
                <div style={{ fontSize: 11, color: '#8b7e62', marginTop: 2 }}>Class of 2030</div>
              </div>
              <div style={{ borderTop: '1px solid #e8e0cf', paddingTop: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>Acceptance</div>
                <div className="ed-serif" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{p.acceptance}</div>
              </div>
              <div style={{ borderTop: '1px solid #e8e0cf', paddingTop: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>Class size</div>
                <div className="ed-serif" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{p.enrolled}</div>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 8 }}>About</div>
          <div className="ed-serif" style={{ fontSize: 18, lineHeight: 1.4, fontWeight: 500 }}>
            "Canada's flagship CS program. Co-op streams place at Google, Stripe, OpenAI."
          </div>
          <div style={{ fontSize: 13, color: '#3a3025', marginTop: 14, lineHeight: 1.6 }}>
            Five-year mandatory co-op. Choose between Software Engineering, AI, Data Science, or Bioinformatics streams in year two. Average graduate signing salary <span className="ed-mono" style={{ fontWeight: 600 }}>$110k USD</span>.
          </div>
        </div>

        <div className="ed-divider" style={{ margin: '0 24px' }}></div>

        {/* Requirements */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 12 }}>Requirements</div>
          {p.requires.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <span style={{ width: 16, height: 16, border: '1px solid #1a1612', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>✓</span>
              <span style={{ fontSize: 13 }}>{r}</span>
            </div>
          ))}
        </div>

        <div className="ed-divider" style={{ margin: '0 24px' }}></div>

        {/* Deadlines */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 12 }}>Key dates</div>
          {p.deadlines.map((dl, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i > 0 ? '1px solid #e8e0cf' : 'none' }}>
              <span style={{ fontSize: 14 }}>{dl.label}</span>
              <span className="ed-mono" style={{ fontSize: 13, fontWeight: 500 }}>{dl.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom action */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fbf8f1', borderTop: '1px solid #e8e0cf', padding: '12px 24px 28px', display: 'flex', gap: 8 }}>
        <button className="ed-btn-ghost" style={{ flex: 0, padding: '12px 16px', fontFamily: 'inherit', cursor: 'pointer' }}>Save</button>
        <button className="ed-btn" style={{ flex: 1, fontFamily: 'inherit', cursor: 'pointer', padding: '12px 16px' }}>Continue Application</button>
      </div>
    </EdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// SCREEN 4 — APPLY (OUAC TRACKER)
// ─────────────────────────────────────────────────────────
const EdApplyFixed = () => {
  const d = window.oHubData;
  return (
    <EdPhone label="Apply">
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 90 }} className="ed-scroll">
        <div style={{ padding: '8px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 4 }}>OUAC 101 · Ref <span className="ed-mono">{d.user.ouacRef}</span></div>
            <div className="ed-serif" style={{ fontSize: 30, lineHeight: 1.05, fontWeight: 600 }}>Your applications</div>
          </div>
        </div>

        <div style={{ padding: '0 24px 8px' }}>
          <div className="ed-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="ed-serif" style={{ fontSize: 36, fontWeight: 600 }}>5<span style={{ color: '#8b7e62' }}>/7</span></div>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62' }}>Submitted</div>
            </div>
            <div style={{ marginTop: 14, height: 5, background: '#e8e0cf', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: '71%', height: '100%', background: '#1a1612' }}></div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5c4a2f' }}>
              <span>2 in progress</span>
              <span>0 decisions yet</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px 4px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 4 }}>By university</div>
        </div>

        <div style={{ padding: '0 24px' }}>
          {d.appProgress.map((a, i) => {
            const isDone = a.status === 'Submitted';
            const isProgress = a.status.includes('progress');
            return (
              <div key={i} style={{ padding: '16px 0', borderTop: '1px solid #e8e0cf', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '1.5px solid ' + (isDone ? '#1a1612' : '#b8a888'),
                  background: isDone ? '#1a1612' : 'transparent',
                  color: isDone ? '#f5f1e8' : '#8b7e62',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, flexShrink: 0
                }}>
                  {isDone ? '✓' : isProgress ? '◐' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.uni} · {a.program}</div>
                  <div style={{ fontSize: 11, color: '#8b7e62', marginTop: 2 }}>
                    {a.status} · Essays {a.essays}{a.date !== '—' ? ' · ' + a.date : ''}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: '#8b7e62' }}>›</span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '20px 24px' }}>
          <button className="ed-btn-ghost" style={{ width: '100%', fontFamily: 'inherit', cursor: 'pointer' }}>+ Add another program</button>
        </div>
      </div>
      <EdNav active="apply" />
    </EdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// SCREEN 5 — PULSE (SOCIAL FEED)
// ─────────────────────────────────────────────────────────
const EdPulse = () => {
  const d = window.oHubData;
  return (
    <EdPhone label="Pulse">
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 90 }} className="ed-scroll">
        <EdHeader subtitle="Class of 2026" title="The Pulse" right={<span style={{ fontSize: 18 }}>✎</span>} />

        {/* Filter tabs */}
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 24, borderBottom: '1px solid #e8e0cf' }}>
          {['Following', 'Your school', 'All'].map((t, i) => (
            <div key={t} style={{ paddingBottom: 12, borderBottom: i === 0 ? '2px solid #1a1612' : 'none', marginBottom: -1, fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#1a1612' : '#8b7e62' }}>{t}</div>
          ))}
        </div>

        {/* Feed */}
        {d.feed.map((f, i) => (
          <div key={i} style={{ padding: '20px 24px', borderBottom: '1px solid #e8e0cf' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f.who}</div>
                {f.school && <div style={{ fontSize: 11, color: '#8b7e62' }}>{f.school}</div>}
              </div>
              <div style={{ fontSize: 11, color: '#8b7e62' }}>{f.time}</div>
            </div>
            {f.type === 'milestone' && (
              <div className="ed-serif" style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 500 }}>
                <span className="ed-bg-green" style={{ padding: '0 6px', borderRadius: 4 }}>Milestone</span> — {f.text}.
              </div>
            )}
            {f.type === 'post' && (
              <>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{f.text}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: '#8b7e62' }}>
                  <span>♥ {f.likes}</span>
                  <span>◌ {f.comments}</span>
                  <span>↗ Share</span>
                </div>
              </>
            )}
            {f.type === 'tip' && (
              <div className="ed-card" style={{ padding: 14, marginTop: 4 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 6 }}>Tip · saved {f.saves} times</div>
                <div className="ed-serif" style={{ fontSize: 16, lineHeight: 1.4, fontWeight: 500 }}>{f.text}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <EdNav active="social" />
    </EdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// SCREEN 6 — PROFILE / YOU
// ─────────────────────────────────────────────────────────
const EdProfile = () => {
  const d = window.oHubData;
  return (
    <EdPhone label="You">
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 90 }} className="ed-scroll">
        <EdHeader subtitle="Profile" title="Priya Shah" right={<span style={{ fontSize: 18 }}>⚙</span>} />

        {/* Avatar + meta */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4a574, #8b6f47)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: '#fbf8f1'
          }}>P</div>
          <div>
            <div style={{ fontSize: 13 }}>{d.user.school}</div>
            <div style={{ fontSize: 11, color: '#8b7e62', marginTop: 2 }}>Grade 12 · Top 6: <span className="ed-mono" style={{ fontWeight: 600, color: '#1a1612' }}>{d.user.avg}%</span></div>
          </div>
        </div>

        <div className="ed-divider" style={{ margin: '0 24px' }}></div>

        {/* Stats */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 12 }}>Your numbers</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="ed-serif" style={{ fontSize: 28, fontWeight: 600 }}>7</div>
              <div style={{ fontSize: 11, color: '#8b7e62' }}>Programs</div>
            </div>
            <div>
              <div className="ed-serif" style={{ fontSize: 28, fontWeight: 600 }}>5</div>
              <div style={{ fontSize: 11, color: '#8b7e62' }}>Submitted</div>
            </div>
            <div>
              <div className="ed-serif" style={{ fontSize: 28, fontWeight: 600 }}>6</div>
              <div style={{ fontSize: 11, color: '#8b7e62' }}>Scholarship matches</div>
            </div>
            <div>
              <div className="ed-serif" style={{ fontSize: 28, fontWeight: 600 }}>$248k</div>
              <div style={{ fontSize: 11, color: '#8b7e62' }}>Potential aid</div>
            </div>
          </div>
        </div>

        <div className="ed-divider" style={{ margin: '0 24px' }}></div>

        {/* Top 6 courses */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7e62', marginBottom: 12 }}>Top 6 — 4U courses</div>
          {[
            ['ENG4U', 'English', 89],
            ['MHF4U', 'Advanced Functions', 96],
            ['MCV4U', 'Calculus & Vectors', 95],
            ['SCH4U', 'Chemistry', 92],
            ['SPH4U', 'Physics', 90],
            ['ICS4U', 'Computer Science', 92],
          ].map(([code, name, mark], i) => (
            <div key={code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: i > 0 ? '1px solid #e8e0cf' : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
                <div className="ed-mono" style={{ fontSize: 11, color: '#8b7e62', marginTop: 2 }}>{code}</div>
              </div>
              <div className="ed-serif" style={{ fontSize: 18, fontWeight: 600 }}>{mark}%</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 0', marginTop: 10, borderTop: '1.5px solid #1a1612' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Top 6 average</div>
            <div className="ed-serif" style={{ fontSize: 22, fontWeight: 600 }}>92.4%</div>
          </div>
        </div>
      </div>
      <EdNav active="profile" />
    </EdPhone>
  );
};

// Export all
window.EditorialScreens = { EdToday, EdPrograms, EdProgramDetail, EdApply: EdApplyFixed, EdPulse, EdProfile };
