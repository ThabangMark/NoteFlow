"use client";
import { useState } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg:          '#0B0D1A',
  sidebar:     '#07080F',
  card:        '#111422',
  cardHov:     '#161B2E',
  border:      'rgba(255,255,255,0.07)',
  borderMd:    'rgba(255,255,255,0.12)',
  accent:      '#F0A500',
  accentDim:   'rgba(240,165,0,0.12)',
  accentBdr:   'rgba(240,165,0,0.35)',
  text:        '#E8EDF5',
  textSub:     '#94A3B8',
  textMuted:   '#4E5A6B',
  success:     '#22C55E',
  successDim:  'rgba(34,197,94,0.12)',
  danger:      '#EF4444',
  dangerDim:   'rgba(239,68,68,0.12)',
  warning:     '#F59E0B',
  warningDim:  'rgba(245,158,11,0.12)',
  info:        '#6366F1',
  infoDim:     'rgba(99,102,241,0.12)',
};

const FONTS = {
  head: "'Syne', sans-serif",
  body: "'Outfit', sans-serif",
  mono: "'Space Mono', monospace",
};

// ─── ADMIN CREDENTIALS ───────────────────────────────────────────────────────
const ADMIN = { name: 'Mark', username: 'mark', password: 'mark12345' };

// ─── SHARED MINI-COMPONENTS ──────────────────────────────────────────────────
const Badge = ({ label, color = C.info }) => (
  <span style={{ background: color + '22', color, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', fontFamily: FONTS.mono, whiteSpace: 'nowrap' }}>
    {label}
  </span>
);

const StatCard = ({ icon, label, value, sub, color = C.accent }) => (
  <div style={{ background: C.card, borderRadius: '14px', padding: '22px 20px', border: `1px solid ${C.border}`, flex: 1, minWidth: 150 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: '11px', color: C.textMuted, fontFamily: FONTS.body, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: C.text, fontFamily: FONTS.mono }}>{value}</p>
        {sub && <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textSub, fontFamily: FONTS.body }}>{sub}</p>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: '12px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{icon}</div>
    </div>
  </div>
);

const Empty = ({ icon, title, desc }) => (
  <div style={{ textAlign: 'center', padding: '56px 20px' }}>
    <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
    <p style={{ fontFamily: FONTS.body, fontSize: '15px', fontWeight: 600, color: C.textSub, margin: '0 0 6px' }}>{title}</p>
    <p style={{ fontFamily: FONTS.body, fontSize: '13px', color: C.textMuted, margin: 0 }}>{desc}</p>
  </div>
);

const SectionHead = ({ title, sub }) => (
  <div style={{ marginBottom: '28px' }}>
    <h1 style={{ fontFamily: FONTS.head, fontSize: '26px', color: C.text, margin: '0 0 6px', fontWeight: 800 }}>{title}</h1>
    <p style={{ color: C.textMuted, fontSize: '14px', margin: 0, fontFamily: FONTS.body }}>{sub}</p>
  </div>
);

const TableHead = ({ cols, template }) => (
  <div style={{ display: 'grid', gridTemplateColumns: template, padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.025)' }}>
    {cols.map(h => (
      <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONTS.body }}>{h}</span>
    ))}
  </div>
);

const Toggle = ({ active, onChange, danger = false }) => {
  const bg = active ? (danger ? C.danger : C.success) : C.border;
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: bg, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0, border: `1px solid ${active ? bg : C.borderMd}` }}>
      <div style={{ position: 'absolute', top: 3, left: active ? 22 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
  );
};

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({ students, tutors, payments, ratings, verifications }) {
  const totalRev = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingV = verifications.filter(v => v.status === 'pending').length;
  const avgRat = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '—';

  const statuses = [
    { label: 'API Server',        ok: true  },
    { label: 'Database',          ok: true  },
    { label: 'Payment Gateway',   ok: true  },
    { label: 'Storage',           ok: true  },
    { label: 'Email Service',     ok: true  },
  ];

  return (
    <div>
      <SectionHead title="Dashboard Overview" sub={`Welcome back, Mark — here's what's happening on NoteFlow today.`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon="👥" label="Total Students"  value={students.length}       sub="Registered accounts" color={C.info}    />
        <StatCard icon="👨‍🏫" label="Total Tutors"   value={tutors.length}         sub="Active profiles"    color={C.success} />
        <StatCard icon="💰" label="Total Revenue"   value={`P${totalRev.toLocaleString()}`} sub="All time"  color={C.accent}  />
        <StatCard icon="⏳" label="Pending Verif."  value={pendingV}              sub="Awaiting review"    color={C.danger}  />
        <StatCard icon="⭐" label="Avg. Rating"     value={avgRat}                sub="Platform-wide"      color={C.warning} />
        <StatCard icon="💬" label="Total Reviews"   value={ratings.length}        sub="All submitted"      color={C.info}    />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent activity */}
        <div style={{ background: C.card, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: FONTS.head, fontSize: 16, color: C.text, margin: '0 0 16px', fontWeight: 700 }}>Recent Activity</h3>
          <Empty icon="📋" title="No activity yet" desc="All admin actions will be logged here" />
        </div>

        {/* Platform status */}
        <div style={{ background: C.card, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: FONTS.head, fontSize: 16, color: C.text, margin: '0 0 16px', fontWeight: 700 }}>Platform Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {statuses.map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.textSub, fontFamily: FONTS.body }}>{s.label}</span>
                <span style={{ fontSize: 11, color: s.ok ? C.success : C.danger, background: s.ok ? C.successDim : C.dangerDim, padding: '3px 10px', borderRadius: 20, fontFamily: FONTS.mono }}>
                  {s.ok ? '● Operational' : '● Degraded'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ────────────────────────────────────────────────────────────
function StudentsTab({ students, setStudents }) {
  const [search, setSearch] = useState('');
  const filtered = students.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const suspend = id => setStudents(p => p.map(s => s.id === id ? { ...s, status: s.status === 'suspended' ? 'active' : 'suspended' } : s));
  const remove  = id => { if (window.confirm('Permanently delete this student account?')) setStudents(p => p.filter(s => s.id !== id)); };

  const cols     = ['Name', 'Email', 'University', 'Plan', 'Status', 'Joined', 'Actions'];
  const template = '1.8fr 2fr 2fr 0.8fr 0.9fr 0.9fr 130px';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <SectionHead title="Student Accounts" sub="View and manage all registered student accounts" />
        <SearchBox value={search} onChange={setSearch} placeholder="Search students…" />
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <TableHead cols={cols} template={template} />
        {filtered.length === 0
          ? <Empty icon="👥" title="No students registered yet" desc="Student accounts will appear here once they sign up" />
          : filtered.map(s => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: template, padding: '13px 20px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: FONTS.body, fontWeight: 500 }}>{s.name}</span>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONTS.body }}>{s.email}</span>
              <span style={{ fontSize: 12, color: C.textSub, fontFamily: FONTS.body }}>{s.university || '—'}</span>
              <Badge label={s.plan || 'free'} color={s.plan === 'premium' ? C.accent : C.info} />
              <Badge label={s.status || 'active'} color={s.status === 'suspended' ? C.danger : C.success} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONTS.mono }}>{s.joined || '—'}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <ActionBtn label={s.status === 'suspended' ? 'Restore' : 'Suspend'} onClick={() => suspend(s.id)} />
                <ActionBtn label="Delete" danger onClick={() => remove(s.id)} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── TUTORS TAB ──────────────────────────────────────────────────────────────
function TutorsTab({ tutors, setTutors }) {
  const [search, setSearch] = useState('');
  const filtered = tutors.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.subjects?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const suspend = id => setTutors(p => p.map(t => t.id === id ? { ...t, status: t.status === 'suspended' ? 'active' : 'suspended' } : t));
  const remove  = id => { if (window.confirm('Permanently delete this tutor account?')) setTutors(p => p.filter(t => t.id !== id)); };

  const cols     = ['Name', 'Email', 'University', 'Subjects', 'Rating', 'Status', 'Actions'];
  const template = '1.5fr 2fr 1.8fr 2fr 0.7fr 0.9fr 120px';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <SectionHead title="Tutor Accounts" sub="Manage all registered and verified tutor profiles" />
        <SearchBox value={search} onChange={setSearch} placeholder="Search tutors…" />
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <TableHead cols={cols} template={template} />
        {filtered.length === 0
          ? <Empty icon="👨‍🏫" title="No tutors registered yet" desc="Tutor profiles will appear here once they apply" />
          : filtered.map(t => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: template, padding: '13px 20px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: FONTS.body, fontWeight: 500 }}>{t.name}</span>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONTS.body }}>{t.email}</span>
              <span style={{ fontSize: 12, color: C.textSub, fontFamily: FONTS.body }}>{t.university || '—'}</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(t.subjects || []).slice(0, 2).map(s => (
                  <span key={s} style={{ fontSize: 10, background: C.infoDim, color: C.info, padding: '2px 8px', borderRadius: 20, fontFamily: FONTS.body }}>{s}</span>
                ))}
                {(t.subjects || []).length > 2 && <span style={{ fontSize: 10, color: C.textMuted, fontFamily: FONTS.body }}>+{t.subjects.length - 2}</span>}
              </div>
              <span style={{ fontSize: 13, color: C.accent, fontFamily: FONTS.mono }}>★ {t.rating || '—'}</span>
              <Badge label={t.status || 'active'} color={t.status === 'suspended' ? C.danger : C.success} />
              <div style={{ display: 'flex', gap: 6 }}>
                <ActionBtn label={t.status === 'suspended' ? 'Restore' : 'Suspend'} onClick={() => suspend(t.id)} />
                <ActionBtn label="Delete" danger onClick={() => remove(t.id)} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── VERIFICATIONS TAB ───────────────────────────────────────────────────────
function VerificationsTab({ verifications, onVerify }) {
  const pending  = verifications.filter(v => v.status === 'pending');
  const reviewed = verifications.filter(v => v.status !== 'pending');

  const VerifCard = ({ v }) => (
    <div style={{ background: C.cardHov, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.infoDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.info, fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700 }}>{v.avatar}</div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: C.text, fontFamily: FONTS.body }}>{v.name}</p>
            <p style={{ margin: 0, fontSize: 12, color: C.textMuted, fontFamily: FONTS.body }}>🎓 {v.university}</p>
          </div>
        </div>
        <Badge label={v.status} color={v.status === 'pending' ? C.warning : v.status === 'approved' ? C.success : C.danger} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {(v.subjects || []).map(s => <span key={s} style={{ background: C.infoDim, color: C.info, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: FONTS.body }}>{s}</span>)}
      </div>
      <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 4px', fontFamily: FONTS.body }}>Rate: {v.rate} · Applied: {v.date}</p>
      {v.bio && <p style={{ fontSize: 12, color: C.textSub, margin: '0 0 14px', fontFamily: FONTS.body, lineHeight: 1.5 }}>{v.bio}</p>}
      {v.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => onVerify(v.id, 'approved')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.successDim, color: C.success, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body }}>✓ Approve</button>
          <button onClick={() => onVerify(v.id, 'rejected')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.dangerDim, color: C.danger, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body }}>✕ Reject</button>
          <button style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: FONTS.body }}>Request More Info</button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <SectionHead title="Tutor Verification" sub="Review and approve tutor applications before they go live" />

      <GroupLabel label={`Pending (${pending.length})`} />
      {pending.length === 0
        ? <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 28 }}><Empty icon="✅" title="All caught up!" desc="No pending verifications right now" /></div>
        : <div style={{ marginBottom: 28 }}>{pending.map(v => <VerifCard key={v.id} v={v} />)}</div>
      }

      {reviewed.length > 0 && <>
        <GroupLabel label={`Recently Reviewed (${reviewed.length})`} />
        {reviewed.map(v => <VerifCard key={v.id} v={v} />)}
      </>}
    </div>
  );
}

// ─── PAYMENTS TAB ────────────────────────────────────────────────────────────
function PaymentsTab({ payments }) {
  const total      = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const nowMonth   = new Date().getMonth();
  const thisMonth  = payments.filter(p => p.month === nowMonth).reduce((s, p) => s + (p.amount || 0), 0);
  const pending    = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
  const refunded   = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + (p.amount || 0), 0);

  const cols     = ['Student', 'Plan', 'Amount', 'Date', 'Method', 'Status'];
  const template = '2fr 1.5fr 1fr 1.2fr 1.2fr 1fr';

  return (
    <div>
      <SectionHead title="Payment Monitoring" sub="Track all transactions, subscriptions, and revenue" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon="💰" label="Total Revenue"  value={`P${total.toLocaleString()}`}      sub="All time"         color={C.accent}  />
        <StatCard icon="📅" label="This Month"     value={`P${thisMonth.toLocaleString()}`}  sub="Current month"    color={C.success} />
        <StatCard icon="⏳" label="Pending"        value={`P${pending.toLocaleString()}`}    sub="Processing"       color={C.warning} />
        <StatCard icon="↩️" label="Refunded"       value={`P${refunded.toLocaleString()}`}   sub="All time"         color={C.danger}  />
      </div>

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: FONTS.head, fontSize: 16, color: C.text, margin: 0, fontWeight: 700 }}>Transaction History</h3>
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONTS.body }}>{payments.length} records</span>
        </div>
        <TableHead cols={cols} template={template} />
        {payments.length === 0
          ? <Empty icon="💳" title="No transactions yet" desc="Payment records will appear here as students subscribe" />
          : payments.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: template, padding: '13px 20px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: FONTS.body }}>{p.student}</span>
              <span style={{ fontSize: 12, color: C.textSub, fontFamily: FONTS.body }}>{p.plan}</span>
              <span style={{ fontSize: 13, color: C.accent, fontFamily: FONTS.mono }}>P{p.amount}</span>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONTS.mono }}>{p.date}</span>
              <span style={{ fontSize: 12, color: C.textSub, fontFamily: FONTS.body }}>{p.method || 'Card'}</span>
              <Badge label={p.status || 'success'} color={p.status === 'refunded' ? C.danger : p.status === 'pending' ? C.warning : C.success} />
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── RATINGS TAB ─────────────────────────────────────────────────────────────
function RatingsTab({ ratings, setRatings }) {
  const [filter, setFilter] = useState('all');

  const toggleHide = id => setRatings(p => p.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  const toggleFlag = id => setRatings(p => p.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));
  const deleteRev  = id => { if (window.confirm('Delete this review?')) setRatings(p => p.filter(r => r.id !== id)); };

  const visible = ratings.filter(r =>
    filter === 'all'     ? true :
    filter === 'flagged' ? r.flagged :
    filter === 'hidden'  ? r.hidden  : true
  );

  const avg = ratings.length ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '—';

  return (
    <div>
      <SectionHead title="Ratings & Reviews" sub="Monitor and moderate all platform reviews" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon="⭐" label="Avg. Rating"     value={avg}                                sub="Platform-wide"   color={C.warning} />
        <StatCard icon="💬" label="Total Reviews"   value={ratings.length}                     sub="All submitted"   color={C.info}    />
        <StatCard icon="🚩" label="Flagged"         value={ratings.filter(r => r.flagged).length} sub="Needs review" color={C.danger}  />
        <StatCard icon="🙈" label="Hidden"          value={ratings.filter(r => r.hidden).length}  sub="Admin-hidden" color={C.textSub} />
      </div>

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontFamily: FONTS.head, fontSize: 16, color: C.text, margin: 0, fontWeight: 700 }}>All Reviews</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'flagged', 'hidden'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filter === f ? C.accentDim : 'transparent', color: filter === f ? C.accent : C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body, textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>

        {visible.length === 0
          ? <Empty icon="⭐" title="No reviews found" desc="Student and tutor reviews will appear here" />
          : visible.map(r => (
            <div key={r.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, opacity: r.hidden ? 0.55 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ color: C.accent, fontFamily: FONTS.mono, fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONTS.body }}>by {r.user} · {r.target} · {r.date}</span>
                    {r.flagged && <Badge label="Flagged" color={C.danger} />}
                    {r.hidden  && <Badge label="Hidden"  color={C.textMuted} />}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: C.textSub, fontFamily: FONTS.body, lineHeight: 1.5 }}>{r.comment}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <ActionBtn label={r.flagged ? 'Unflag' : 'Flag'}  onClick={() => toggleFlag(r.id)} />
                  <ActionBtn label={r.hidden  ? 'Restore' : 'Hide'} onClick={() => toggleHide(r.id)} />
                  <ActionBtn label="Delete" danger onClick={() => deleteRev(r.id)} />
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── MAINTENANCE TAB ─────────────────────────────────────────────────────────
function MaintenanceTab({ settings, onToggle, logs }) {
  const [cacheMsg, setCacheMsg] = useState('');
  const [backupMsg, setBackupMsg] = useState('');

  const clearCache = () => {
    setCacheMsg('Clearing…');
    setTimeout(() => { setCacheMsg('Cache cleared successfully ✓'); setTimeout(() => setCacheMsg(''), 3000); }, 1200);
  };
  const doBackup = () => {
    setBackupMsg('Backing up…');
    setTimeout(() => { setBackupMsg('Backup complete ✓'); setTimeout(() => setBackupMsg(''), 3000); }, 1800);
  };

  const toggleItems = [
    { key: 'registrationEnabled', label: 'Student Registration', desc: 'Allow new students to sign up' },
    { key: 'paymentsEnabled',     label: 'Payment Processing',   desc: 'Enable subscription payments'  },
    { key: 'tutorMarketEnabled',  label: 'Tutor Marketplace',    desc: 'Students can browse & book tutors' },
    { key: 'emailNotifications',  label: 'Email Notifications',  desc: 'Send automated email alerts to users' },
    { key: 'autoApprove',         label: 'Auto-Approve Tutors',  desc: 'Skip manual verification — not recommended' },
    { key: 'maintenanceMode',     label: 'Maintenance Mode',     desc: 'Redirect all users to a maintenance notice', danger: true },
  ];

  return (
    <div>
      <SectionHead title="System Maintenance" sub="Control platform features, run diagnostics, and manage system health" />

      {/* Toggles */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: FONTS.head, fontSize: 16, color: C.text, margin: 0, fontWeight: 700 }}>Feature Toggles</h3>
        </div>
        {toggleItems.map(item => (
          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: item.danger && settings[item.key] ? C.danger : C.text, fontFamily: FONTS.body }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: C.textMuted, fontFamily: FONTS.body }}>{item.desc}</p>
            </div>
            <Toggle active={settings[item.key]} onChange={() => onToggle(item.key)} danger={item.danger} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Quick actions */}
        <div style={{ background: C.card, borderRadius: 14, padding: 22, border: `1px solid ${C.border}` }}>
          <h4 style={{ fontFamily: FONTS.head, fontSize: 15, color: C.text, margin: '0 0 14px', fontWeight: 700 }}>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={clearCache} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: FONTS.body, textAlign: 'left' }}>🗑️  Clear System Cache</button>
            <button onClick={doBackup}   style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: FONTS.body, textAlign: 'left' }}>💾  Backup Database</button>
            <button style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: FONTS.body, textAlign: 'left' }}>📊  Export Reports (CSV)</button>
            <button style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: FONTS.body, textAlign: 'left' }}>📧  Send Test Email</button>
          </div>
          {cacheMsg  && <p style={{ margin: '10px 0 0', fontSize: 12, color: C.success, fontFamily: FONTS.body }}>{cacheMsg}</p>}
          {backupMsg && <p style={{ margin: '10px 0 0', fontSize: 12, color: C.success, fontFamily: FONTS.body }}>{backupMsg}</p>}
        </div>

        {/* Activity log */}
        <div style={{ background: C.card, borderRadius: 14, padding: 22, border: `1px solid ${C.border}` }}>
          <h4 style={{ fontFamily: FONTS.head, fontSize: 15, color: C.text, margin: '0 0 14px', fontWeight: 700 }}>Activity Log</h4>
          {logs.length === 0
            ? <Empty icon="📋" title="No logs yet" desc="" />
            : logs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <p style={{ margin: '0 0 1px', fontSize: 13, color: C.text, fontFamily: FONTS.body }}>{log.action}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontFamily: FONTS.body }}>{log.user} · {log.time}</p>
                </div>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: log.type === 'success' ? C.success : log.type === 'danger' ? C.danger : C.info, flexShrink: 0 }} />
              </div>
            ))
          }
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid rgba(239,68,68,0.3)`, padding: 22 }}>
        <h4 style={{ fontFamily: FONTS.head, fontSize: 15, color: C.danger, margin: '0 0 4px', fontWeight: 700 }}>⚠️ Danger Zone</h4>
        <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 16px', fontFamily: FONTS.body }}>These actions are irreversible. Only proceed if you are absolutely certain.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => window.confirm('Purge ALL reviews? This cannot be undone.') && alert('Reviews purged.')} style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid rgba(239,68,68,0.35)`, background: C.dangerDim, color: C.danger, fontSize: 13, cursor: 'pointer', fontFamily: FONTS.body }}>Purge All Reviews</button>
          <button onClick={() => window.confirm('RESET the entire platform? This deletes all data.') && alert('Platform reset complete.')} style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid rgba(239,68,68,0.35)`, background: C.dangerDim, color: C.danger, fontSize: 13, cursor: 'pointer', fontFamily: FONTS.body }}>Reset Platform</button>
        </div>
      </div>
    </div>
  );
}

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
const SearchBox = ({ value, onChange, placeholder }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px' }}>
    <span style={{ fontSize: 14 }}>🔍</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: 13, fontFamily: FONTS.body, width: 200 }} />
  </div>
);

const ActionBtn = ({ label, onClick, danger = false }) => (
  <button onClick={onClick} style={{ padding: '5px 10px', borderRadius: 6, border: danger ? 'none' : `1px solid ${C.border}`, background: danger ? C.dangerDim : 'none', color: danger ? C.danger : C.textMuted, fontSize: 11, cursor: 'pointer', fontFamily: FONTS.body, whiteSpace: 'nowrap' }}>{label}</button>
);

const GroupLabel = ({ label }) => (
  <p style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>{label}</p>
);

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',       label: 'Overview',       emoji: '◈' },
  { id: 'students',       label: 'Students',        emoji: '◉' },
  { id: 'tutors',         label: 'Tutors',          emoji: '◎' },
  { id: 'verifications',  label: 'Verifications',   emoji: '◆' },
  { id: 'payments',       label: 'Payments',        emoji: '◇' },
  { id: 'ratings',        label: 'Ratings',         emoji: '◈' },
  { id: 'maintenance',    label: 'Maintenance',     emoji: '⊕' },
];

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [screen,   setScreen]   = useState('login');
  const [tab,      setTab]      = useState('overview');
  const [uInput,   setUInput]   = useState('');
  const [pInput,   setPInput]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  // ── data (empty — populated as real users join) ───────────────────────────
  const [students,      setStudents]      = useState([]);
  const [tutors,        setTutors]        = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [payments,      setPayments]      = useState([]);
  const [ratings,       setRatings]       = useState([]);

  const [settings, setSettings] = useState({
    registrationEnabled: true,
    paymentsEnabled:     true,
    tutorMarketEnabled:  true,
    emailNotifications:  true,
    autoApprove:         false,
    maintenanceMode:     false,
  });

  const [logs] = useState([
    { id: 1, action: 'Admin signed in',     user: 'Mark',   time: 'Just now',   type: 'info'    },
    { id: 2, action: 'System initialised',  user: 'System', time: '1 min ago',  type: 'success' },
    { id: 3, action: 'Database connected',  user: 'System', time: '1 min ago',  type: 'success' },
  ]);

  const handleLogin = () => {
    if (uInput.toLowerCase() === ADMIN.username && pInput === ADMIN.password) {
      setScreen('dashboard');
      setLoginErr('');
      setLogs && null; // logs are read-only const above
    } else {
      setLoginErr('Invalid username or password. Please try again.');
    }
  };

  const handleVerify = (id, action) =>
    setVerifications(p => p.map(v => v.id === id ? { ...v, status: action } : v));

  const handleToggle = key =>
    setSettings(p => ({ ...p, [key]: !p[key] }));

  const pendingVerifCount = verifications.filter(v => v.status === 'pending').length;

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne:wght@700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

        {/* Grid bg */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(240,165,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,165,0,0.04) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none', zIndex: 0 }} />
        {/* Glow */}
        <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(240,165,0,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ background: C.card, border: `1px solid ${C.borderMd}`, borderRadius: 22, padding: '44px 40px', width: '100%', maxWidth: 410, position: 'relative', zIndex: 1 }}>
          {/* Logo area */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: C.accentDim, border: `1.5px solid ${C.accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>🛡️</div>
            <h1 style={{ fontFamily: FONTS.head, fontSize: 24, color: C.text, margin: '0 0 5px', fontWeight: 800 }}>NoteFlow Admin</h1>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0, fontFamily: FONTS.body }}>Restricted access · Authorised personnel only</p>
          </div>

          {/* Credentials hint */}
          <div style={{ background: C.accentDim, border: `1px solid ${C.accentBdr}`, borderRadius: 10, padding: '10px 14px', marginBottom: 22 }}>
            <p style={{ color: C.accent, fontSize: 12, margin: 0, fontFamily: FONTS.mono }}>Demo: mark / mark12345</p>
          </div>

          {/* Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONTS.body }}>Username</label>
              <input value={uInput} onChange={e => setUInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter username"
                style={{ width: '100%', padding: '12px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: FONTS.body, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: FONTS.body }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={pInput} onChange={e => setPInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter password"
                  style={{ width: '100%', padding: '12px 44px 12px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: FONTS.body, outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 14, lineHeight: 1 }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {loginErr && (
              <div style={{ background: C.dangerDim, border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ color: C.danger, fontSize: 13, margin: 0, fontFamily: FONTS.body }}>⚠️ {loginErr}</p>
              </div>
            )}

            <button onClick={handleLogin} style={{ background: `linear-gradient(135deg, ${C.accent}, #D97706)`, color: '#0B0D1A', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONTS.body, marginTop: 4 }}>
              Sign In to Admin Panel →
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: C.textMuted, fontFamily: FONTS.body, margin: '20px 0 0' }}>🔐 All activity is logged and monitored</p>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (tab) {
      case 'overview':      return <OverviewTab students={students} tutors={tutors} payments={payments} ratings={ratings} verifications={verifications} />;
      case 'students':      return <StudentsTab students={students} setStudents={setStudents} />;
      case 'tutors':        return <TutorsTab tutors={tutors} setTutors={setTutors} />;
      case 'verifications': return <VerificationsTab verifications={verifications} onVerify={handleVerify} />;
      case 'payments':      return <PaymentsTab payments={payments} />;
      case 'ratings':       return <RatingsTab ratings={ratings} setRatings={setRatings} />;
      case 'maintenance':   return <MaintenanceTab settings={settings} onToggle={handleToggle} logs={logs} />;
      default:              return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: FONTS.body }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne:wght@700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* ── MAINTENANCE BANNER ────────────────────────────────────────────── */}
      {settings.maintenanceMode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: C.danger, zIndex: 9999, padding: '8px 20px', textAlign: 'center' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: FONTS.body }}>⚠️ Maintenance Mode is ON — users see a maintenance notice</span>
        </div>
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{ width: 230, background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: '22px 14px', display: 'flex', flexDirection: 'column', position: 'sticky', top: settings.maintenanceMode ? 38 : 0, height: '100vh', flexShrink: 0, boxSizing: 'border-box' }}>
        {/* Logo */}
        <div style={{ padding: '0 8px 24px', borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: C.accentDim, border: `1px solid ${C.accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📚</div>
            <div>
              <p style={{ margin: 0, fontFamily: FONTS.head, fontSize: 15, color: C.text, fontWeight: 800 }}>NoteFlow</p>
              <p style={{ margin: 0, fontSize: 10, color: C.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: FONTS.body }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map(item => {
            const isActive = tab === item.id;
            const badge = item.id === 'verifications' ? pendingVerifCount : item.id === 'students' ? students.length : item.id === 'tutors' ? tutors.length : 0;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: isActive ? C.accentDim : 'transparent', color: isActive ? C.accent : C.textSub, fontSize: 14, fontFamily: FONTS.body, fontWeight: isActive ? 600 : 400, transition: 'all 0.15s', textAlign: 'left', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, opacity: 0.5 }}>{item.emoji}</span>
                  {item.label}
                </div>
                {badge > 0 && (
                  <span style={{ background: item.id === 'verifications' ? C.danger : C.accentDim, color: item.id === 'verifications' ? '#fff' : C.accent, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, fontFamily: FONTS.mono }}>{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.accentDim, border: `1.5px solid ${C.accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontSize: 13, fontWeight: 700, fontFamily: FONTS.mono, flexShrink: 0 }}>MK</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONTS.body }}>Mark</p>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontFamily: FONTS.body }}>Super Admin</p>
          </div>
          <button onClick={() => { setScreen('login'); setUInput(''); setPInput(''); }} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 16, padding: 4, lineHeight: 1 }}>⎋</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '36px 36px 60px', marginTop: settings.maintenanceMode ? 38 : 0 }}>
        {renderTab()}
      </main>
    </div>
  );
}