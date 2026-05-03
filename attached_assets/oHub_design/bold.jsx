// Variation B — Bold dark: high contrast, monospace numerics, dashboard energy
// For the metrics-driven student tracking averages, deadlines, offers

if (!document.getElementById('bold-styles')) {
  const style = document.createElement('style');
  style.id = 'bold-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .bold { font-family: 'Inter Tight', sans-serif; color: #f0f0f0; background: #0a0a0a; letter-spacing: -0.01em; }
    .bold-mono { font-family: 'JetBrains Mono', monospace; }
    .bold-card { background: #141414; border: 1px solid #232323; border-radius: 16px; }
    .bold-divider { border-top: 1px solid #232323; }
    .bold-pill { border: 1px solid #2a2a2a; background: #141414; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
    .bold-btn { background: #c4f542; color: #0a0a0a; border-radius: 12px; padding: 14px 18px; font-weight: 600; font-size: 14px; border: none; }
    .bold-btn-ghost { background: transparent; color: #f0f0f0; border: 1px solid #2a2a2a; border-radius: 12px; padding: 14px 18px; font-weight: 500; font-size: 14px; }
    .bold-accent { color: #c4f542; }
    .bold-amber { color: #fbbf24; }
    .bold-red { color: #ef4444; }
    .bold-scroll::-webkit-scrollbar { display: none; }
    .bold-tag-reach { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); }
    .bold-tag-target { background: rgba(196, 245, 66, 0.12); color: #c4f542; border: 1px solid rgba(196, 245, 66, 0.25); }
    .bold-tag-safety { background: rgba(96, 165, 250, 0.12); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.25); }
  `;
  document.head.appendChild(style);
}

const BdPhone = ({ children }) => (
  <div style={{ width: 390, height: 844, background: '#0a0a0a', borderRadius: 44, border: '1px solid #1a1a1a', overflow: 'hidden', position: 'relative' }} className="bold">
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, padding: '14px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 600, zIndex: 10, color: '#f0f0f0' }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11 }}>●●●● 􀙇 ▮</span>
    </div>
    <div style={{ position: 'absolute', top: 48, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>{children}</div>
  </div>
);

const BdNav = ({ active }) => {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'programs', label: 'Programs' },
    { id: 'apply', label: 'Apply' },
    { id: 'social', label: 'Feed' },
    { id: 'profile', label: 'Me' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1f1f1f', padding: '12px 12px 28px', display: 'flex', gap: 4 }}>
      {items.map(it => (
        <div key={it.id} style={{
          flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 10,
          background: active === it.id ? '#1a1a1a' : 'transparent',
          color: active === it.id ? '#c4f542' : '#666',
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>{it.label}</div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// HOME / DASHBOARD
// ─────────────────────────────────────────────────────────
const BdHome = () => {
  const d = window.oHubData;
  return (
    <BdPhone>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100 }} className="bold-scroll">
        {/* Top bar */}
        <div style={{ padding: '8px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hi, Priya</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>oHub</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#141414', border: '1px solid #232323', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⌕</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#141414', border: '1px solid #232323', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, position: 'relative' }}>
              ◔
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#c4f542' }}></span>
            </div>
          </div>
        </div>

        {/* Hero countdown card */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="bold-card" style={{ padding: 20, background: 'linear-gradient(135deg, #c4f542, #a3d622)', border: 'none', color: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>OUAC 101 closes in</div>
            <div className="bold-mono" style={{ fontSize: 80, fontWeight: 600, lineHeight: 0.9, marginTop: 6, letterSpacing: '-0.04em' }}>12</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>days · January 15</div>
            <div style={{ marginTop: 14, height: 4, background: 'rgba(10,10,10,0.2)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: '71%', height: '100%', background: '#0a0a0a' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, fontWeight: 600 }}>
              <span>5/7 submitted</span>
              <span>71% complete</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="bold-card" style={{ padding: 16 }}>
            <div className="bold-pill" style={{ display: 'inline-block', marginBottom: 8 }}>Avg.</div>
            <div className="bold-mono" style={{ fontSize: 30, fontWeight: 600, color: '#c4f542' }}>92.4<span style={{ fontSize: 16, color: '#666' }}>%</span></div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Top 6 · ↑ 0.8 vs term 1</div>
          </div>
          <div className="bold-card" style={{ padding: 16 }}>
            <div className="bold-pill" style={{ display: 'inline-block', marginBottom: 8 }}>Aid</div>
            <div className="bold-mono" style={{ fontSize: 30, fontWeight: 600 }}>$248k</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>6 scholarships matched</div>
          </div>
        </div>

        {/* Today list */}
        <div style={{ padding: '6px 20px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888' }}>Today · 4 tasks</div>
            <div style={{ fontSize: 11, color: '#c4f542' }}>1 hr 15 min</div>
          </div>
          <div className="bold-card" style={{ padding: 4 }}>
            {d.todayTasks.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i > 0 ? '1px solid #1f1f1f' : 'none' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: '1.5px solid ' + (t.done ? '#c4f542' : '#333'),
                  background: t.done ? '#c4f542' : 'transparent',
                  color: '#0a0a0a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0
                }}>{t.done && '✓'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#666' : '#f0f0f0' }}>{t.label}</div>
                  <div className="bold-mono" style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{t.est.toUpperCase()}</div>
                </div>
                {t.prio === 'high' && <span style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>High</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div style={{ padding: '6px 20px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 10 }}>Upcoming deadlines</div>
          {d.keyDates.slice(0, 4).map((k, i) => (
            <div key={i} className="bold-card" style={{ padding: '14px 16px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 4, height: 36, background: k.type === 'critical' ? '#ef4444' : k.type === 'high' ? '#fbbf24' : '#3a3a3a', borderRadius: 2 }}></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{k.label}</div>
                  <div className="bold-mono" style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{k.date.toUpperCase()} · {k.daysOut} DAYS</div>
                </div>
              </div>
              <span style={{ fontSize: 16, color: '#444' }}>›</span>
            </div>
          ))}
        </div>
      </div>
      <BdNav active="home" />
    </BdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// PROGRAMS BROWSER
// ─────────────────────────────────────────────────────────
const BdPrograms = () => {
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
    <BdPhone>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100 }} className="bold-scroll">
        <div style={{ padding: '8px 20px 14px' }}>
          <div style={{ fontSize: 26, fontWeight: 700 }}>Programs</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>96 Ontario undergrad programs · OUAC 101</div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ background: '#141414', border: '1px solid #232323', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: '#666' }}>⌕</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search programs, schools…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: '#f0f0f0' }}
            />
            {q && <span onClick={() => setQ('')} style={{ fontSize: 12, color: '#666', cursor: 'pointer' }}>✕</span>}
          </div>
        </div>

        {/* Tier filter */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6, overflowX: 'auto' }} className="bold-scroll">
          {[['all', 'All'], ['reach', 'Reach'], ['target', 'Target'], ['safety', 'Safety']].map(([k, l]) => (
            <button key={k} onClick={() => setTier(k)} style={{
              border: '1px solid ' + (tier === k ? '#c4f542' : '#232323'),
              background: tier === k ? 'rgba(196, 245, 66, 0.1)' : '#141414',
              color: tier === k ? '#c4f542' : '#888',
              borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap'
            }}>{l}</button>
          ))}
        </div>

        {/* Result count */}
        <div className="bold-mono" style={{ padding: '0 20px 8px', fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          [{filtered.length} RESULT{filtered.length !== 1 ? 'S' : ''}]
        </div>

        {/* Grid */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const uni = d.universities.find(u => u.id === p.uni);
            return (
              <div key={p.id} className="bold-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: uni.color, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>{uni.initials}</div>
                    <div>
                      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{uni.short}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 1 }}>{p.name}</div>
                    </div>
                  </div>
                  <span className={'bold-pill bold-tag-' + p.tier} style={{ fontWeight: 600 }}>{p.tier}</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cutoff</div>
                    <div className="bold-mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{p.cutoff}<span style={{ color: '#666' }}>%</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Avg admit</div>
                    <div className="bold-mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{p.avgAdmitted}<span style={{ color: '#666' }}>%</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Accept</div>
                    <div className="bold-mono" style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{p.acceptance}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    {p.applied && <span className="bold-pill" style={{ background: 'rgba(196,245,66,0.12)', color: '#c4f542', border: '1px solid rgba(196,245,66,0.3)', fontWeight: 600 }}>Applied</span>}
                    {!p.applied && p.saved && <span className="bold-pill" style={{ fontWeight: 600 }}>Saved</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#666', fontSize: 13 }}>
              No programs match "{q}".
            </div>
          )}
        </div>
      </div>
      <BdNav active="programs" />
    </BdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// PROGRAM DETAIL — Waterloo CS
// ─────────────────────────────────────────────────────────
const BdProgramDetail = () => {
  const d = window.oHubData;
  const p = d.programs.find(x => x.id === 'uw-cs');
  const uni = d.universities.find(u => u.id === p.uni);
  return (
    <BdPhone>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 110 }} className="bold-scroll">
        {/* Top */}
        <div style={{ padding: '8px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#141414', border: '1px solid #232323', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>‹</div>
          <div className="bold-mono" style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Code · {p.code}</div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#141414', border: '1px solid #232323', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>♥</div>
        </div>

        {/* Hero */}
        <div style={{ padding: '4px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: uni.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700
            }}>{uni.initials}</div>
            <div>
              <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{uni.name}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{uni.city} · {p.faculty}</div>
            </div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.05 }}>{p.name}</div>
          <div style={{ fontSize: 14, color: '#888', marginTop: 8, lineHeight: 1.5 }}>{p.blurb}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            <span className={'bold-pill bold-tag-' + p.tier} style={{ fontWeight: 600 }}>{p.tier}</span>
            {p.coop && <span className="bold-pill" style={{ fontWeight: 600 }}>Co-op</span>}
            <span className="bold-pill" style={{ fontWeight: 600 }}>{p.essays} essay{p.essays !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Big stat row */}
        <div style={{ padding: '0 20px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="bold-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cutoff</div>
            <div className="bold-mono" style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }}>{p.cutoff}%</div>
            <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>You're 2.6 below</div>
          </div>
          <div className="bold-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Avg admit</div>
            <div className="bold-mono" style={{ fontSize: 32, fontWeight: 600, marginTop: 4, color: '#c4f542' }}>{p.avgAdmitted}%</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Class of '30</div>
          </div>
          <div className="bold-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Acceptance</div>
            <div className="bold-mono" style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }}>{p.acceptance}</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Highly selective</div>
          </div>
          <div className="bold-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Class size</div>
            <div className="bold-mono" style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }}>{p.enrolled}</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{p.length}</div>
          </div>
        </div>

        {/* Requirements */}
        <div style={{ padding: '14px 20px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 10 }}>Requirements</div>
          <div className="bold-card" style={{ padding: 4 }}>
            {p.requires.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderTop: i > 0 ? '1px solid #1f1f1f' : 'none' }}>
                <span style={{ width: 16, height: 16, border: '1.5px solid #c4f542', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#c4f542' }}>✓</span>
                <span style={{ fontSize: 13 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div style={{ padding: '6px 20px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 10 }}>Key dates</div>
          <div className="bold-card" style={{ padding: 4 }}>
            {p.deadlines.map((dl, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderTop: i > 0 ? '1px solid #1f1f1f' : 'none' }}>
                <span style={{ fontSize: 13 }}>{dl.label}</span>
                <span className="bold-mono" style={{ fontSize: 13, fontWeight: 600, color: '#c4f542' }}>{dl.date.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1f1f1f', padding: '14px 20px 28px', display: 'flex', gap: 8 }}>
        <button className="bold-btn-ghost" style={{ flex: 0, padding: '14px 16px', fontFamily: 'inherit', cursor: 'pointer' }}>Save</button>
        <button className="bold-btn" style={{ flex: 1, fontFamily: 'inherit', cursor: 'pointer' }}>Continue Application →</button>
      </div>
    </BdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// APPLY (OUAC TRACKER)
// ─────────────────────────────────────────────────────────
const BdApply = () => {
  const d = window.oHubData;
  return (
    <BdPhone>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100 }} className="bold-scroll">
        <div style={{ padding: '8px 20px 14px' }}>
          <div className="bold-mono" style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OUAC 101 · REF {d.user.ouacRef}</div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>Applications</div>
        </div>

        {/* Big progress card */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="bold-card" style={{ padding: 20, background: '#141414' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div className="bold-mono" style={{ fontSize: 48, fontWeight: 600, lineHeight: 1, color: '#c4f542' }}>5<span style={{ color: '#444', fontSize: 30 }}>/7</span></div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Applications submitted</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c4f542', textAlign: 'right' }}>71%</div>
            </div>
            <div style={{ height: 6, background: '#1f1f1f', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: '71%', height: '100%', background: '#c4f542' }}></div>
            </div>
            {/* Status row */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16, fontSize: 11 }}>
              <div><span className="bold-mono" style={{ color: '#c4f542', fontWeight: 600 }}>5</span> <span style={{ color: '#888' }}>submitted</span></div>
              <div><span className="bold-mono" style={{ color: '#fbbf24', fontWeight: 600 }}>2</span> <span style={{ color: '#888' }}>in progress</span></div>
              <div><span className="bold-mono" style={{ color: '#666', fontWeight: 600 }}>0</span> <span style={{ color: '#888' }}>decisions</span></div>
            </div>
          </div>
        </div>

        {/* App list */}
        <div style={{ padding: '6px 20px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 10 }}>By university</div>
          <div className="bold-card" style={{ padding: 4 }}>
            {d.appProgress.map((a, i) => {
              const isDone = a.status === 'Submitted';
              const isProgress = a.status.includes('progress');
              const uni = d.universities.find(u => u.short === a.uni || u.short.startsWith(a.uni));
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderTop: i > 0 ? '1px solid #1f1f1f' : 'none' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: uni?.color || '#333', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, flexShrink: 0
                  }}>{uni?.initials || a.uni.slice(0, 2)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.program}</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {a.uni} · Essays {a.essays}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: isDone ? '#c4f542' : isProgress ? '#fbbf24' : '#666'
                    }}>
                      {isDone ? '● Done' : isProgress ? '◐ Drafting' : '○ Not started'}
                    </div>
                    {isDone && <div className="bold-mono" style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{a.date.toUpperCase()}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scholarships nudge */}
        <div style={{ padding: '6px 20px 14px' }}>
          <div className="bold-card" style={{ padding: 16, borderColor: 'rgba(196,245,66,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="bold-mono" style={{ fontSize: 10, color: '#c4f542', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SCHOLARSHIP MATCH · 89%</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>Schulich Leader · $100k</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Deadline Jan 25 · You qualify</div>
              </div>
              <span style={{ fontSize: 18, color: '#c4f542' }}>→</span>
            </div>
          </div>
        </div>
      </div>
      <BdNav active="apply" />
    </BdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// FEED
// ─────────────────────────────────────────────────────────
const BdFeed = () => {
  const d = window.oHubData;
  return (
    <BdPhone>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100 }} className="bold-scroll">
        <div style={{ padding: '8px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>Feed</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Class of 2026</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#c4f542', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>+</div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6 }}>
          {['Following', 'School', 'Trending'].map((t, i) => (
            <div key={t} style={{
              padding: '8px 14px', borderRadius: 8,
              background: i === 0 ? '#c4f542' : '#141414',
              color: i === 0 ? '#0a0a0a' : '#888',
              border: i === 0 ? 'none' : '1px solid #232323',
              fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>{t}</div>
          ))}
        </div>

        {/* Chats preview row */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 10 }}>Active chats</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="bold-scroll">
            {d.chats.slice(0, 4).map(c => (
              <div key={c.id} className="bold-card" style={{ padding: 12, minWidth: 160, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{c.dm ? c.name.split(' ').map(s => s[0]).join('').slice(0, 2) : '#'}</div>
                  {c.unread > 0 && <span style={{ background: '#c4f542', color: '#0a0a0a', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>{c.unread}</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 4, lineHeight: 1.3, height: 26, overflow: 'hidden' }}>{c.last}</div>
                <div className="bold-mono" style={{ fontSize: 9, color: '#444', marginTop: 6, textTransform: 'uppercase' }}>{c.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {d.feed.map((f, i) => (
            <div key={i} className="bold-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: f.type === 'tip' ? '#c4f542' : '#1f1f1f', color: f.type === 'tip' ? '#0a0a0a' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {f.type === 'tip' ? '◆' : f.who.split(' ').map(s => s[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{f.who}</div>
                    {f.school && <div style={{ fontSize: 10, color: '#666' }}>{f.school}</div>}
                    {f.type === 'tip' && <div style={{ fontSize: 10, color: '#c4f542' }}>Verified tip</div>}
                  </div>
                </div>
                <div className="bold-mono" style={{ fontSize: 10, color: '#666', textTransform: 'uppercase' }}>{f.time}</div>
              </div>
              {f.type === 'milestone' && (
                <div style={{ background: 'rgba(196,245,66,0.08)', border: '1px solid rgba(196,245,66,0.2)', borderRadius: 10, padding: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#c4f542', textTransform: 'uppercase', letterSpacing: '0.08em' }}>★ Milestone</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{f.text}</div>
                </div>
              )}
              {(f.type === 'post' || f.type === 'tip') && (
                <div style={{ fontSize: 13, lineHeight: 1.5, color: '#e0e0e0' }}>{f.text}</div>
              )}
              {f.type === 'post' && (
                <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 11, color: '#666' }}>
                  <span>♥ {f.likes}</span>
                  <span>◌ {f.comments}</span>
                  <span>↗</span>
                </div>
              )}
              {f.type === 'tip' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>Saved {f.saves} times</span>
                  <span className="bold-pill" style={{ fontWeight: 600, color: '#c4f542', borderColor: 'rgba(196,245,66,0.3)' }}>+ Save</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <BdNav active="social" />
    </BdPhone>
  );
};

// ─────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────
const BdProfile = () => {
  const d = window.oHubData;
  return (
    <BdPhone>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100 }} className="bold-scroll">
        <div style={{ padding: '8px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 700 }}>Profile</div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#141414', border: '1px solid #232323', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚙</div>
        </div>

        {/* Avatar + meta */}
        <div style={{ padding: '0 20px 16px' }}>
          <div className="bold-card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: 'linear-gradient(135deg, #c4f542, #84a528)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#0a0a0a'
            }}>P</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Priya Shah</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{d.user.school}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span className="bold-pill" style={{ fontWeight: 600 }}>Grade 12</span>
                <span className="bold-pill" style={{ fontWeight: 600, color: '#c4f542', borderColor: 'rgba(196,245,66,0.3)' }}>92.4% avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="bold-card" style={{ padding: 14 }}>
            <div className="bold-mono" style={{ fontSize: 28, fontWeight: 600 }}>7</div>
            <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Programs</div>
          </div>
          <div className="bold-card" style={{ padding: 14 }}>
            <div className="bold-mono" style={{ fontSize: 28, fontWeight: 600, color: '#c4f542' }}>5</div>
            <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Submitted</div>
          </div>
          <div className="bold-card" style={{ padding: 14 }}>
            <div className="bold-mono" style={{ fontSize: 28, fontWeight: 600 }}>6</div>
            <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Scholarships</div>
          </div>
          <div className="bold-card" style={{ padding: 14 }}>
            <div className="bold-mono" style={{ fontSize: 28, fontWeight: 600, color: '#c4f542' }}>$248k</div>
            <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Potential aid</div>
          </div>
        </div>

        {/* Top 6 */}
        <div style={{ padding: '6px 20px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 10 }}>Top 6 — 4U marks</div>
          <div className="bold-card" style={{ padding: 4 }}>
            {[
              ['ENG4U', 'English', 89],
              ['MHF4U', 'Advanced Functions', 96],
              ['MCV4U', 'Calculus & Vectors', 95],
              ['SCH4U', 'Chemistry', 92],
              ['SPH4U', 'Physics', 90],
              ['ICS4U', 'Computer Science', 92],
            ].map(([code, name, mark], i) => (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i > 0 ? '1px solid #1f1f1f' : 'none' }}>
                <div className="bold-mono" style={{ fontSize: 10, color: '#666', width: 50 }}>{code}</div>
                <div style={{ flex: 1, fontSize: 13 }}>{name}</div>
                {/* Bar */}
                <div style={{ width: 60, height: 4, background: '#1f1f1f', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: mark + '%', height: '100%', background: mark >= 95 ? '#c4f542' : mark >= 90 ? '#fbbf24' : '#666' }}></div>
                </div>
                <div className="bold-mono" style={{ fontSize: 13, fontWeight: 600, width: 36, textAlign: 'right' }}>{mark}%</div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px', borderTop: '1.5px solid #2a2a2a', background: 'rgba(196,245,66,0.04)' }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>TOP 6 AVG</div>
              <div className="bold-mono" style={{ fontSize: 22, fontWeight: 700, color: '#c4f542' }}>92.4%</div>
            </div>
          </div>
        </div>
      </div>
      <BdNav active="profile" />
    </BdPhone>
  );
};

window.BoldScreens = { BdHome, BdPrograms, BdProgramDetail, BdApply, BdFeed, BdProfile };
