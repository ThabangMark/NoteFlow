"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
);

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Role = "admin" | "student" | "tutor";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type VerifStatus = "pending" | "approved" | "rejected";

interface User { id: string; name: string; email: string; role: Role; avatar: string; }
interface TutorProfile {
  id: string; userId: string; name: string; avatar: string; university: string;
  modules: string[]; qualifications: string[]; bio: string; rate: number;
  available: boolean; rating: number; reviewCount: number; verified: VerifStatus;
  earnings: number; joined: string; email?: string;
}
interface StudentProfile {
  id: string; userId: string; name: string; avatar: string; university: string;
  course: string; year: string; joined: string; plan: "free" | "premium";
  referralCode?: string;
}
interface Booking {
  id: number; studentId: string; tutorId: string; studentName: string; tutorName: string;
  module: string; date: string; time: string; status: BookingStatus;
  note: string; amount: number; createdAt: string;
}
interface Message {
  id: number; senderId: string; receiverId: string; senderName: string;
  text: string; timestamp: string; read: boolean;
}
interface Review {
  id: number; studentId: string; tutorId: string; studentName: string;
  tutorName: string; rating: number; comment: string; date: string; flagged: boolean; hidden: boolean;
}
interface Payment {
  id: number; studentId: string; tutorId: string; bookingId: number;
  studentName: string; tutorName: string; amount: number;
  status: "completed" | "pending" | "refunded"; date: string; method: string;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#07090E",
  surface: "#0B0D14",
  card: "#0F1219",
  cardElevated: "#141820",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "#EDF0FF",
  textSub: "#7A8099",
  textMuted: "#3E4358",
  success: "#1FD6A0",
  danger: "#F05252",
  warning: "#E8972A",
  roles: {
    student: { accent: "#1FD6A0", light: "rgba(31,214,160,0.09)", grad: "linear-gradient(135deg,#1FD6A0,#0CB882)" },
    tutor:   { accent: "#E8972A", light: "rgba(232,151,42,0.09)",  grad: "linear-gradient(135deg,#E8972A,#C97A10)" },
    admin:   { accent: "#4B82F7", light: "rgba(75,130,247,0.09)",  grad: "linear-gradient(135deg,#4B82F7,#6366F1)" },
  },
};

const makeTheme = (role: Role) => ({
  bg: C.bg, surface: C.surface, card: C.card, border: C.border,
  accent: C.roles[role].accent, accentLight: C.roles[role].light,
  text: C.text, textSub: C.textSub, textMuted: C.textMuted,
  success: C.success, danger: C.danger, warning: C.warning,
  gradient: C.roles[role].grad,
});

const T = { student: makeTheme("student"), tutor: makeTheme("tutor"), admin: makeTheme("admin") };
type AnyTheme = typeof T.student;
const F = { display: "'Fraunces',serif", body: "'DM Sans',sans-serif", mono: "'JetBrains Mono',monospace" };

// ─── SVG ICONS (no emojis) ───────────────────────────────────────────────────
const Icon = {
  home:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search:   <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  users:    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  calendar: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  message:  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  card:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  star:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  upload:   <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  gift:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  check:    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  money:    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  user:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  settings: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/></svg>,
  list:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  book:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  lock:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  shield:   <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  chevron:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>,
  signout:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  trash:    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  flag:     <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  eye:      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  grid:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  fileText: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

// ─── SHARED UI ───────────────────────────────────────────────────────────────
const Avatar = ({ initials, size = 40, gradient }: { initials: string; size?: number; gradient?: string }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: gradient || C.roles.student.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.33, fontWeight: 700, fontFamily: F.body, flexShrink: 0, letterSpacing: "0.02em" }}>{initials}</div>
);

const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4, fontFamily: F.body, whiteSpace: "nowrap", letterSpacing: "0.03em" }}>{label}</span>
);

const Pill = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, fontFamily: F.body, whiteSpace: "nowrap" }}>{label}</span>
);

const StarRow = ({ rating, size = 12 }: { rating: number; size?: number }) => (
  <span>
    <span style={{ color: "#E8A020", fontSize: size }}>{"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}</span>
    <span style={{ color: C.textMuted, marginLeft: 5, fontFamily: F.body, fontSize: size }}>{rating.toFixed(1)}</span>
  </span>
);

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)} onClick={() => onChange(n)}
          style={{ fontSize: 26, cursor: "pointer", color: n <= (hov || value) ? "#E8A020" : C.textMuted, transition: "color .1s", lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
};

function Toggle({ value, onChange, color }: { value: boolean; onChange: () => void; color?: string }) {
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: value ? (color || C.success) : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ color: C.textMuted, marginBottom: 10, display: "flex", justifyContent: "center" }}>{icon}</div>
      <p style={{ color: C.textMuted, fontSize: 13, margin: 0, fontFamily: F.body }}>{text}</p>
    </div>
  );
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{title}</h1>
      {sub && <p style={{ color: C.textSub, fontSize: 14, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg: Record<BookingStatus, { label: string; color: string; bg: string }> = {
    pending:   { label: "Pending",   color: C.warning, bg: "rgba(232,151,42,0.12)" },
    confirmed: { label: "Confirmed", color: "#60A5FA", bg: "rgba(75,130,247,0.12)" },
    completed: { label: "Completed", color: C.success, bg: "rgba(31,214,160,0.12)" },
    cancelled: { label: "Cancelled", color: C.danger,  bg: "rgba(240,82,82,0.12)"  },
  };
  const c = cfg[status];
  return <Badge label={c.label} color={c.color} bg={c.bg} />;
}

function PayBadge({ status }: { status: "completed" | "pending" | "refunded" }) {
  const cfg = {
    completed: { color: C.success, bg: "rgba(31,214,160,0.12)" },
    pending:   { color: C.warning, bg: "rgba(232,151,42,0.12)" },
    refunded:  { color: C.danger,  bg: "rgba(240,82,82,0.12)"  },
  };
  const c = cfg[status];
  return <Badge label={status} color={c.color} bg={c.bg} />;
}

function StatCard({ label, value, icon, color, theme }: { label: string; value: string | number; icon: React.ReactNode; color: string; theme: AnyTheme }) {
  return (
    <div style={{ background: theme.card, borderRadius: 12, padding: "20px", border: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{value}</p>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── ADMIN USER ───────────────────────────────────────────────────────────────
const ADMIN_USER: User = { id: "admin-mark-00000000", name: "Mark", email: "mark@KitsoLink.bw", role: "admin", avatar: "MK" };

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState<"explore" | "landing" | "login" | "dashboard">("explore");
  const [loginRole, setLoginRole] = useState<Role>("student");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [{ data: td }, { data: sd }, { data: bd }, { data: md }, { data: rd }, { data: pd }] = await Promise.all([
        supabase.from("tutor_profiles").select("*, profiles(id,name,avatar,university,created_at)"),
        supabase.from("student_profiles").select("*, profiles(id,name,avatar,university,created_at)"),
        supabase.from("bookings").select("*"),
        supabase.from("messages").select("*").order("created_at"),
        supabase.from("reviews").select("*"),
        supabase.from("payments").select("*"),
      ]);
      if (td) setTutors(td.map((t: any) => ({
        id: t.id, userId: t.id, name: t.profiles?.name || "", avatar: t.profiles?.avatar || "??",
        university: t.profiles?.university || "", modules: t.modules || [], qualifications: t.qualifications || [],
        bio: t.bio || "", rate: t.rate || 80, available: t.available ?? true, rating: t.rating || 0,
        reviewCount: t.review_count || 0,
        // FIX: always read verified status FROM DB — never default to "pending"
        verified: (t.verified as VerifStatus) || "pending",
        earnings: t.earnings || 0,
        joined: t.profiles?.created_at ? new Date(t.profiles.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "",
      })));
      if (sd) setStudents(sd.map((s: any) => ({
        id: s.id, userId: s.id, name: s.profiles?.name || "", avatar: s.profiles?.avatar || "??",
        university: s.profiles?.university || "", course: s.course || "", year: s.year || "1st Year",
        plan: s.plan || "free", referralCode: s.referral_code || "",
        joined: s.profiles?.created_at ? new Date(s.profiles.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "",
      })));
      if (bd) setBookings(bd.map((b: any) => ({
        id: b.id, studentId: b.student_id, tutorId: b.tutor_id, studentName: b.student_name,
        tutorName: b.tutor_name, module: b.module, date: b.date, time: b.time, status: b.status,
        note: b.note || "", amount: b.amount, createdAt: b.created_at,
      })));
      if (md) setMessages(md.map((m: any) => ({
        id: m.id, senderId: m.sender_id, receiverId: m.receiver_id, senderName: m.sender_name,
        text: m.text, read: m.read,
        timestamp: new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      })));
      if (rd) setReviews(rd.map((r: any) => ({
        id: r.id, studentId: r.student_id, tutorId: r.tutor_id, studentName: r.student_name,
        tutorName: r.tutor_name, rating: r.rating, comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        flagged: r.flagged, hidden: r.hidden,
      })));
      if (pd) setPayments(pd.map((p: any) => ({
        id: p.id, studentId: p.student_id, tutorId: p.tutor_id, bookingId: p.booking_id,
        studentName: p.student_name, tutorName: p.tutor_name, amount: p.amount, status: p.status,
        date: new Date(p.created_at).toLocaleDateString("en-GB"), method: p.method || "Card",
      })));
    } catch (err) { console.error("Data load error:", err); }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile) {
          setCurrentUser({ id: profile.id, name: profile.name, email: session.user.email || "", role: profile.role as Role, avatar: profile.avatar || profile.name.slice(0, 2).toUpperCase() });
          setScreen("dashboard");
        }
      }
      setLoading(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { setCurrentUser(null); setScreen("explore"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (currentUser) loadData(); }, [currentUser, loadData]);

  const handleLogin = (user: User) => { setCurrentUser(user); setScreen("dashboard"); };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null); setTutors([]); setStudents([]); setBookings([]); setMessages([]); setReviews([]); setPayments([]);
    setScreen("explore");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: C.roles.admin.grad, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, fontFamily: F.display }}>K</span>
        </div>
        <p style={{ color: C.textSub, fontFamily: F.body, fontSize: 13, margin: 0 }}>Loading KitsoLink…</p>
      </div>
    </div>
  );

  if (screen === "explore")   return (<><FontLink /><PublicExplorePage onGetStarted={() => setScreen("landing")} onLogin={(role) => { setLoginRole(role); setScreen("login"); }} /></>);
  if (screen === "landing")   return (<><FontLink /><LandingPage onChooseRole={(role) => { setLoginRole(role); setScreen("login"); }} onBack={() => setScreen("explore")} /></>);
  if (screen === "login")     return (<><FontLink /><LoginPage role={loginRole} onLogin={handleLogin} onBack={() => setScreen("landing")} /></>);
  if (!currentUser) return null;

  const shared = { tutors, setTutors, students, setStudents, bookings, setBookings, messages, setMessages, reviews, setReviews, payments, setPayments, onLogout: handleLogout };
  return (
    <>
      <FontLink />
      {currentUser.role === "student" && <StudentDashboard user={currentUser} {...shared} />}
      {currentUser.role === "tutor"   && <TutorDashboard   user={currentUser} {...shared} />}
      {currentUser.role === "admin"   && <AdminDashboard   user={currentUser} {...shared} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC DATA
// ═══════════════════════════════════════════════════════════════════════════════
interface Material {
  id: number; title: string; type: "Notes" | "Exam Paper" | "Summary" | "Textbook";
  module: string; university: string; field: string;
  pages: number; downloads: number; rating: number; year: string; premium: boolean; preview: string;
}

const UNIVERSITIES = [
  { name: "Botswana Accountancy College", short: "BAC", location: "Gaborone",
    fields: [
      { name: "Software Engineering & IT", modules: ["Mobile Development", "Introduction to Java", "Fundamentals of Cloud Computing", "Database Systems", "Web Development", "Computer Networks"] },
      { name: "Accounting & Finance", modules: ["Financial Accounting", "Botswana Taxation", "Auditing", "Management Accounting", "Corporate Finance"] },
      { name: "Business Administration", modules: ["Business Law", "Strategic Management", "Entrepreneurship", "Human Resources", "Marketing"] },
      { name: "Information Technology", modules: ["Networking Fundamentals", "Cybersecurity", "Systems Analysis", "IT Project Management"] },
    ]},
  { name: "University of Botswana", short: "UB", location: "Gaborone",
    fields: [
      { name: "Computer Science", modules: ["Data Structures & Algorithms", "Operating Systems", "Software Engineering", "Artificial Intelligence", "Computer Graphics"] },
      { name: "Law", modules: ["Constitutional Law", "Contract Law", "Criminal Law", "Land Law", "Administrative Law"] },
      { name: "Medicine", modules: ["Anatomy & Physiology", "Pharmacology", "Pathology", "Clinical Medicine", "Public Health"] },
      { name: "Engineering", modules: ["Thermodynamics", "Fluid Mechanics", "Structural Analysis", "Engineering Mathematics"] },
      { name: "Economics", modules: ["Microeconomics", "Macroeconomics", "Econometrics", "Development Economics"] },
    ]},
  { name: "BIUST", short: "BIUST", location: "Palapye",
    fields: [
      { name: "Civil Engineering", modules: ["Structural Engineering", "Geotechnics", "Hydraulics", "Construction Management"] },
      { name: "Electrical Engineering", modules: ["Circuit Analysis", "Power Systems", "Digital Electronics", "Control Systems"] },
      { name: "Computer Science", modules: ["Programming Fundamentals", "Software Development", "Machine Learning", "Data Science"] },
      { name: "Environmental Science", modules: ["Environmental Impact Assessment", "Ecology", "Climate Change", "Conservation"] },
    ]},
  { name: "Botho University", short: "Botho", location: "Gaborone",
    fields: [
      { name: "Nursing", modules: ["Anatomy & Physiology", "Pharmacology", "Nursing Practice", "Mental Health", "Paediatrics"] },
      { name: "Business Computing", modules: ["Programming", "Database Management", "Systems Analysis", "E-Commerce"] },
      { name: "Hospitality Management", modules: ["Food & Beverage", "Front Office Operations", "Tourism Management", "Event Management"] },
    ]},
  { name: "Limkokwing University", short: "Limkokwing", location: "Gaborone",
    fields: [
      { name: "Graphic Design", modules: ["Typography", "Colour Theory", "Adobe Illustrator", "Brand Identity", "Print Design"] },
      { name: "Film & Animation", modules: ["Storyboarding", "3D Modelling", "Video Production", "Motion Graphics"] },
      { name: "Mass Communication", modules: ["Journalism", "Public Relations", "Media Law", "Digital Media"] },
    ]},
  { name: "Ba Isago University", short: "Ba Isago", location: "Gaborone",
    fields: [
      { name: "Accounting", modules: ["Financial Reporting", "Taxation", "Auditing", "Cost Accounting"] },
      { name: "Human Resources", modules: ["Labour Law", "Recruitment", "Training & Development", "Compensation Management"] },
      { name: "Supply Chain Management", modules: ["Logistics", "Procurement", "Inventory Management", "Operations Management"] },
    ]},
  { name: "Botswana Open University", short: "BOU", location: "Gaborone",
    fields: [
      { name: "Education Management", modules: ["Curriculum Development", "Educational Psychology", "School Administration", "Research Methods"] },
      { name: "Public Administration", modules: ["Public Policy", "Governance", "Public Finance", "Development Studies"] },
      { name: "Agriculture", modules: ["Crop Production", "Animal Science", "Agricultural Economics", "Soil Science"] },
    ]},
];

const SAMPLE_MATERIALS: Material[] = [
  { id:1,  title:"Introduction to Java – Complete Notes",         type:"Notes",      module:"Introduction to Java",           university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:45,  downloads:1230, rating:4.8, year:"1st Year", premium:false, preview:"OOP concepts, classes, objects, inheritance, polymorphism, exception handling." },
  { id:2,  title:"Mobile Development – Android Basics",           type:"Notes",      module:"Mobile Development",             university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:38,  downloads:980,  rating:4.7, year:"2nd Year", premium:true,  preview:"Android Studio setup, XML layouts, Activities, Intents, RecyclerView, REST APIs." },
  { id:3,  title:"Cloud Computing Exam Paper 2024",               type:"Exam Paper", module:"Fundamentals of Cloud Computing", university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:12,  downloads:2100, rating:4.9, year:"2nd Year", premium:true,  preview:"AWS, Azure, GCP fundamentals, deployment models, SaaS/PaaS/IaaS, cloud security." },
  { id:4,  title:"Web Development Summary – HTML CSS JS",         type:"Summary",    module:"Web Development",                university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:22,  downloads:1540, rating:4.6, year:"1st Year", premium:false, preview:"HTML5 structure, CSS Flexbox & Grid, JavaScript DOM, fetch API, responsive design." },
  { id:5,  title:"Database Systems Textbook",                     type:"Textbook",   module:"Database Systems",               university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:320, downloads:870,  rating:4.5, year:"2nd Year", premium:true,  preview:"Relational model, SQL, normalization, transactions, NoSQL databases, ER diagrams." },
  { id:6,  title:"Financial Accounting Principles",               type:"Notes",      module:"Financial Accounting",           university:"Botswana Accountancy College", field:"Accounting & Finance",      pages:60,  downloads:3200, rating:4.9, year:"1st Year", premium:false, preview:"Double entry bookkeeping, trial balance, income statement, balance sheet, cash flow." },
  { id:7,  title:"Botswana Taxation Law Summary",                 type:"Summary",    module:"Botswana Taxation",              university:"Botswana Accountancy College", field:"Accounting & Finance",      pages:30,  downloads:1890, rating:4.7, year:"3rd Year", premium:true,  preview:"BURS regulations, VAT, PAYE, corporate tax, withholding tax, transfer pricing." },
  { id:8,  title:"Data Structures & Algorithms – UB Notes",       type:"Notes",      module:"Data Structures & Algorithms",   university:"University of Botswana",       field:"Computer Science",          pages:48,  downloads:2750, rating:4.8, year:"2nd Year", premium:false, preview:"Arrays, linked lists, stacks, queues, trees, graphs, sorting & searching algorithms." },
  { id:9,  title:"Operating Systems Past Papers 2019–2024",       type:"Exam Paper", module:"Operating Systems",              university:"University of Botswana",       field:"Computer Science",          pages:35,  downloads:3100, rating:4.9, year:"3rd Year", premium:true,  preview:"Process management, memory management, file systems, CPU scheduling, deadlocks." },
  { id:10, title:"Constitutional Law of Botswana",                type:"Notes",      module:"Constitutional Law",             university:"University of Botswana",       field:"Law",                       pages:70,  downloads:2300, rating:4.7, year:"2nd Year", premium:false, preview:"Constitution of Botswana, Bill of Rights, separation of powers, judicial review." },
  { id:11, title:"Structural Engineering Notes",                  type:"Notes",      module:"Structural Engineering",         university:"BIUST",                        field:"Civil Engineering",          pages:55,  downloads:1100, rating:4.6, year:"2nd Year", premium:false, preview:"Load analysis, beam design, structural materials, steel and concrete design." },
  { id:12, title:"Nursing Fundamentals – Anatomy & Physiology",   type:"Notes",      module:"Anatomy & Physiology",           university:"Botho University",             field:"Nursing",                    pages:80,  downloads:2900, rating:4.9, year:"1st Year", premium:false, preview:"Human body systems, homeostasis, cell biology, organ functions, clinical applications." },
  { id:13, title:"Typography & Brand Identity Notes",             type:"Notes",      module:"Typography",                     university:"Limkokwing University",        field:"Graphic Design",             pages:33,  downloads:990,  rating:4.6, year:"1st Year", premium:false, preview:"Type anatomy, font selection, hierarchy, spacing, brand guidelines, logo design." },
  { id:14, title:"Labour Law Botswana – Exam Notes",              type:"Exam Paper", module:"Labour Law",                     university:"Ba Isago University",          field:"Human Resources",            pages:20,  downloads:760,  rating:4.5, year:"2nd Year", premium:true,  preview:"Employment Act, trade unions, termination, dispute resolution, workplace rights." },
  { id:15, title:"Circuit Analysis Complete Notes",               type:"Notes",      module:"Circuit Analysis",               university:"BIUST",                        field:"Electrical Engineering",     pages:62,  downloads:1450, rating:4.7, year:"1st Year", premium:false, preview:"Ohm's law, Kirchhoff's laws, mesh analysis, Thevenin, Norton, AC circuits, filters." },
];

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "Notes":      { bg: "rgba(75,130,247,0.12)",  color: "#7BAAF7" },
  "Exam Paper": { bg: "rgba(240,82,82,0.12)",   color: "#F08080" },
  "Summary":    { bg: "rgba(31,214,160,0.12)",  color: "#1FD6A0" },
  "Textbook":   { bg: "rgba(167,139,250,0.12)", color: "#B09AF7" },
};

const FIELDS = ["Software Engineering & IT","Accounting & Finance","Business Administration","Computer Science","Law","Medicine","Engineering","Nursing","Graphic Design","Human Resources","Supply Chain Management","Civil Engineering","Electrical Engineering","Mass Communication"];

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPLORE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function PublicExplorePage({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: (role: Role) => void }) {
  const [activeTab, setActiveTab] = useState<"universities" | "fields">("universities");
  const [selUni, setSelUni] = useState<string | null>(null);
  const [selField, setSelField] = useState<string | null>(null);
  const [selModule, setSelModule] = useState<string | null>(null);
  const [selMaterial, setSelMaterial] = useState<Material | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [search, setSearch] = useState("");

  const uni = UNIVERSITIES.find(u => u.name === selUni);
  const getMats = () => {
    let m = SAMPLE_MATERIALS;
    if (selModule) m = m.filter(x => x.module === selModule);
    else if (selField) m = m.filter(x => x.field === selField);
    else if (selUni) m = m.filter(x => x.university === selUni);
    if (search) m = m.filter(x => x.title.toLowerCase().includes(search.toLowerCase()) || x.module.toLowerCase().includes(search.toLowerCase()));
    return m;
  };
  const free = getMats().filter(m => !m.premium);
  const prem = getMats().filter(m => m.premium);

  const navH: React.CSSProperties = { background: "rgba(7,9,14,0.96)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.body }}>
      <nav style={navH}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.roles.admin.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 15, fontFamily: F.display }}>K</span>
          </div>
          <span style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, background: C.roles.admin.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KitsoLink</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onLogin("student")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.textSub, fontFamily: F.body }}>Sign In</button>
          <button onClick={onGetStarted} style={{ background: C.roles.admin.grad, color: "#fff", border: "none", borderRadius: 8, padding: "7px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,#07090E 0%,#0B1022 100%)", padding: "72px 40px 64px", textAlign: "center", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 700, height: 300, background: "radial-gradient(ellipse,rgba(75,130,247,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-block", background: "rgba(75,130,247,0.12)", border: "1px solid rgba(75,130,247,0.25)", borderRadius: 4, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#7BAAF7", marginBottom: 20, letterSpacing: "0.1em", textTransform: "uppercase" }}>Built for Botswana Students</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 900, color: C.text, margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
            Botswana's Academic<br />Resource Platform
          </h1>
          <p style={{ color: C.textSub, fontSize: 16, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Notes, exam papers, summaries and textbooks from every major university in Botswana.
          </p>
          <div style={{ maxWidth: 500, margin: "0 auto", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 0 0 16px" }}>
            <span style={{ color: C.textMuted, display: "flex", marginRight: 10 }}>{Icon.search}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes, modules, exam papers…" style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.text, background: "transparent", fontFamily: F.body, padding: "12px 0" }} />
            <button style={{ background: C.roles.admin.grad, color: "#fff", border: "none", borderRadius: "0 9px 9px 0", padding: "12px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Search</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 40, flexWrap: "wrap" }}>
            {[["500+","Study Materials"],["7","Universities"],["50+","Modules"],["Free","To Browse"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, color: C.text }}>{n}</div>
                <div style={{ color: C.textMuted, fontSize: 12, marginTop: 3, letterSpacing: "0.03em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Field pills */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 14px" }}>Browse by Field</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setSelField(null); setSelModule(null); setSelUni(null); }} style={{ padding: "6px 16px", borderRadius: 4, border: `1px solid ${!selField && !selUni ? "transparent" : C.border}`, background: !selField && !selUni ? C.roles.admin.grad : "transparent", color: !selField && !selUni ? "#fff" : C.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>All</button>
            {FIELDS.map(f => (
              <button key={f} onClick={() => { setSelField(f); setSelModule(null); setSelUni(null); }} style={{ padding: "6px 16px", borderRadius: 4, border: `1px solid ${selField === f ? "transparent" : C.border}`, background: selField === f ? C.roles.admin.grad : "transparent", color: selField === f ? "#fff" : C.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 32 }}>
          {(["universities","fields"] as const).map(t => (
            <button key={t} onClick={() => { setActiveTab(t); setSelUni(null); setSelField(null); setSelModule(null); }} style={{ padding: "10px 22px", background: "none", border: "none", borderBottom: activeTab === t ? `2px solid #4B82F7` : "2px solid transparent", marginBottom: -1, color: activeTab === t ? "#7BAAF7" : C.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>
              {t === "universities" ? "By University" : "By Field of Study"}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        {(selUni || selField || selModule) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, fontFamily: F.body, flexWrap: "wrap" }}>
            <button onClick={() => { setSelUni(null); setSelField(null); setSelModule(null); }} style={{ background: "none", border: "none", color: "#4B82F7", cursor: "pointer", fontWeight: 600, padding: 0, fontSize: 13 }}>Home</button>
            {selUni && <><span style={{ color: C.textMuted }}>/</span><button onClick={() => setSelModule(null)} style={{ background: "none", border: "none", color: selModule ? "#4B82F7" : C.text, cursor: "pointer", fontWeight: 600, padding: 0, fontSize: 13 }}>{selUni}</button></>}
            {selField && !selUni && <><span style={{ color: C.textMuted }}>/</span><button onClick={() => setSelModule(null)} style={{ background: "none", border: "none", color: selModule ? "#4B82F7" : C.text, cursor: "pointer", fontWeight: 600, padding: 0, fontSize: 13 }}>{selField}</button></>}
            {selModule && <><span style={{ color: C.textMuted }}>/</span><span style={{ color: C.text, fontWeight: 600 }}>{selModule}</span></>}
          </div>
        )}

        {/* Universities grid */}
        {activeTab === "universities" && !selUni && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {UNIVERSITIES.map(u => <PubUniCard key={u.name} uni={u} onClick={() => setSelUni(u.name)} />)}
          </div>
        )}
        {activeTab === "universities" && selUni && !selModule && (
          <div>
            <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>{selUni}</h2>
            <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 24px" }}>Select a field of study to browse modules</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
              {uni?.fields.map(field => <PubFieldCard key={field.name} name={field.name} modules={field.modules} onModuleClick={(mod) => { setSelField(field.name); setSelModule(mod); }} />)}
            </div>
          </div>
        )}

        {/* Fields grid */}
        {activeTab === "fields" && !selField && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {FIELDS.map(f => {
              const count = SAMPLE_MATERIALS.filter(m => m.field === f).length;
              return (
                <div key={f} onClick={() => setSelField(f)} style={{ background: C.card, borderRadius: 10, padding: "18px 16px", border: `1px solid ${C.border}`, cursor: "pointer", transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(75,130,247,0.35)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = C.border}>
                  <div style={{ color: "#4B82F7", marginBottom: 10 }}>{Icon.book}</div>
                  <h3 style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>{f}</h3>
                  <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>{count} material{count !== 1 ? "s" : ""}</p>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "fields" && selField && !selModule && (
          <PubFieldModules field={selField} onModuleClick={setSelModule} />
        )}

        {/* Materials */}
        {selModule && !selMaterial && (
          <PubMaterialsView free={free} premium={prem} module={selModule} onOpen={(m) => { if (m.premium) setShowPremium(true); else setSelMaterial(m); }} />
        )}
        {selMaterial && (
          <PubMaterialReader material={selMaterial} onBack={() => setSelMaterial(null)} onSignUp={() => onLogin("student")} />
        )}
      </div>

      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} onSignUp={() => { setShowPremium(false); onGetStarted(); }} />}

      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "32px 40px", textAlign: "center" }}>
        <p style={{ color: C.textMuted, fontSize: 12, margin: 0, fontFamily: F.body }}>KitsoLink — Built for Botswana · 2026</p>
      </div>
    </div>
  );
}

function PubUniCard({ uni, onClick }: { uni: typeof UNIVERSITIES[0]; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const matCount = SAMPLE_MATERIALS.filter(m => m.university === uni.name).length;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ background: hov ? C.cardElevated : C.card, borderRadius: 10, padding: "20px", border: hov ? "1px solid rgba(75,130,247,0.3)" : `1px solid ${C.border}`, cursor: "pointer", transition: "all 0.18s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 4px", lineHeight: 1.4 }}>{uni.name}</h3>
          <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>{uni.location}</p>
        </div>
        <span style={{ background: "rgba(75,130,247,0.1)", color: "#7BAAF7", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>{uni.short}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {uni.fields.slice(0, 2).map(f => <span key={f.name} style={{ background: "rgba(255,255,255,0.04)", color: C.textSub, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{f.name}</span>)}
        {uni.fields.length > 2 && <span style={{ background: "rgba(255,255,255,0.04)", color: C.textMuted, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>+{uni.fields.length - 2}</span>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
        <span style={{ color: C.textMuted, fontSize: 12 }}>{matCount} materials</span>
        <span style={{ color: "#4B82F7", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>Browse {Icon.chevron}</span>
      </div>
    </div>
  );
}

function PubFieldCard({ name, modules, onModuleClick }: { name: string; modules: string[]; onModuleClick: (m: string) => void }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, padding: "18px", border: `1px solid ${C.border}` }}>
      <h3 style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>{name}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {modules.map(mod => {
          const count = SAMPLE_MATERIALS.filter(m => m.module === mod).length;
          return (
            <div key={mod} onClick={() => onModuleClick(mod)} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", borderRadius: 6, cursor: "pointer", transition: "background 0.12s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(75,130,247,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
              <span style={{ fontSize: 12, color: C.text }}>{mod}</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>{count > 0 ? `${count} file${count > 1 ? "s" : ""}` : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PubFieldModules({ field, onModuleClick }: { field: string; onModuleClick: (m: string) => void }) {
  const mods = [...new Set(UNIVERSITIES.flatMap(u => u.fields.filter(f => f.name === field).flatMap(f => f.modules)))];
  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>{field}</h2>
      <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 22px" }}>Select a module to see available materials</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 10 }}>
        {mods.map(mod => {
          const count = SAMPLE_MATERIALS.filter(m => m.module === mod).length;
          return (
            <div key={mod} onClick={() => onModuleClick(mod)} style={{ background: C.card, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.12s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(75,130,247,0.3)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = C.border}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.text }}>{mod}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{count} material{count !== 1 ? "s" : ""}</p>
              </div>
              <span style={{ color: "#4B82F7" }}>{Icon.chevron}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PubMaterialsView({ free, premium, module, onOpen }: { free: Material[]; premium: Material[]; module: string; onOpen: (m: Material) => void }) {
  const [tab, setTab] = useState<"free" | "premium">("free");
  const shown = tab === "free" ? free : premium;
  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>{module}</h2>
      <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 22px" }}>{free.length} free · {premium.length} premium materials</p>
      <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3, marginBottom: 22, width: "fit-content" }}>
        {(["free","premium"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 20px", borderRadius: 6, border: "none", background: tab === t ? C.card : "transparent", color: tab === t ? C.text : C.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>
            {t === "free" ? `Free (${free.length})` : `Premium (${premium.length})`}
          </button>
        ))}
      </div>
      {tab === "premium" && (
        <div style={{ background: "rgba(232,151,42,0.06)", border: "1px solid rgba(232,151,42,0.2)", borderRadius: 8, padding: "14px 18px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 13, color: C.textSub }}>Subscribe to unlock all premium notes, past exam papers and textbooks.</p>
          <button onClick={() => {}} style={{ background: C.roles.admin.grad, color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Subscribe</button>
        </div>
      )}
      {shown.length === 0 ? <EmptyState icon={Icon.fileText} text={`No ${tab} materials for this module yet.`} /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 14 }}>
          {shown.map(mat => <PubMaterialCard key={mat.id} material={mat} onOpen={() => onOpen(mat)} />)}
        </div>
      )}
    </div>
  );
}

function PubMaterialCard({ material: m, onOpen }: { material: Material; onOpen: () => void }) {
  const [hov, setHov] = useState(false);
  const ts = TYPE_STYLE[m.type] || { bg: "rgba(255,255,255,0.05)", color: C.textSub };
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onOpen}
      style={{ background: hov ? C.cardElevated : C.card, borderRadius: 10, padding: "18px", border: hov ? "1px solid rgba(75,130,247,0.25)" : `1px solid ${C.border}`, cursor: "pointer", transition: "all 0.15s", position: "relative" }}>
      {m.premium && <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(232,151,42,0.12)", color: C.warning, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>Premium</span>}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <span style={{ background: ts.bg, color: ts.color, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 4 }}>{m.type}</span>
        <span style={{ color: C.textMuted, fontSize: 11, alignSelf: "center" }}>{m.year}</span>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 6px", lineHeight: 1.4, paddingRight: m.premium ? 50 : 0 }}>{m.title}</h3>
      <p style={{ fontSize: 12, color: C.textSub, margin: "0 0 12px", lineHeight: 1.55 }}>{m.preview.slice(0, 80)}…</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <StarRow rating={m.rating} />
        <span style={{ color: C.textMuted, fontSize: 11 }}>{m.pages}pp · {m.downloads.toLocaleString()} views</span>
      </div>
    </div>
  );
}

function PubMaterialReader({ material: m, onBack, onSignUp }: { material: Material; onBack: () => void; onSignUp: () => void }) {
  const freePages = Math.min(3, m.pages);
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#4B82F7", cursor: "pointer", fontSize: 13, fontFamily: F.body, fontWeight: 600, marginBottom: 18, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg> Back to Materials
      </button>
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#0B1022,#1a2a5e)", padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 4 }}>{m.type}</span>
            <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 11, padding: "2px 10px", borderRadius: 4 }}>{m.year}</span>
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>{m.title}</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 14px" }}>{m.university} · {m.module}</p>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Pages", String(m.pages)],["Views", m.downloads.toLocaleString()],["Rating", m.rating.toFixed(1)]].map(([l,v]) => (
              <div key={l}><p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</p><p style={{ margin: 0, color: "#fff", fontWeight: 700, fontFamily: F.mono }}>{v}</p></div>
            ))}
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Preview — {freePages} of {m.pages} pages</span>
            <span style={{ background: "rgba(75,130,247,0.12)", color: "#7BAAF7", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 4 }}>Free Preview</span>
          </div>
          {Array.from({ length: freePages }, (_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 18px", marginBottom: 10 }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Page {i + 1}</p>
              {i === 0 && <div style={{ background: "rgba(75,130,247,0.07)", borderLeft: "3px solid #4B82F7", padding: "8px 12px", marginBottom: 10, borderRadius: "0 6px 6px 0" }}><p style={{ margin: 0, fontSize: 13, color: "#7BAAF7", lineHeight: 1.6 }}><strong>Topics:</strong> {m.preview}</p></div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[0.9, 0.75, 0.85, 0.6, 0.8].map((w, j) => <div key={j} style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 3, width: `${w * 100}%` }} />)}
              </div>
            </div>
          ))}
          <div style={{ background: "rgba(232,151,42,0.05)", border: "1px solid rgba(232,151,42,0.18)", borderRadius: 10, padding: "24px", textAlign: "center", marginTop: 10 }}>
            <div style={{ color: C.textMuted, marginBottom: 12, display: "flex", justifyContent: "center" }}>{Icon.lock}</div>
            <h3 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 900, color: C.warning, margin: "0 0 8px" }}>Full Document Locked</h3>
            <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 18px", lineHeight: 1.6 }}>Sign up free to access full documents, or subscribe for premium materials.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={onSignUp} style={{ background: C.roles.admin.grad, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Sign Up Free</button>
              <button onClick={onSignUp} style={{ background: "rgba(232,151,42,0.1)", color: C.warning, border: "1px solid rgba(232,151,42,0.25)", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Subscribe for Premium</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumModal({ onClose, onSignUp }: { onClose: () => void; onSignUp: () => void }) {
  const plans = [
    { name: "Monthly",      price: "P89",  period: "/month",   color: "#4B82F7" },
    { name: "Per Semester", price: "P199", period: "/6 months", saves: "Save 55%", color: "#8B5CF6", popular: true },
    { name: "Annual",       price: "P299", period: "/year",    saves: "Save 72%", color: "#1FD6A0" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: C.card, border: `1px solid ${C.borderStrong}`, borderRadius: 16, width: "100%", maxWidth: 600, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0B1022,#1a2a5e)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>KitsoLink</p><h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>Unlock Premium</h2></div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, width: 30, height: 30, fontSize: 14, cursor: "pointer", color: "#fff" }}>×</button>
        </div>
        <div style={{ padding: "22px 28px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
            {plans.map(p => (
              <div key={p.name} style={{ borderRadius: 10, padding: "18px 14px", border: p.popular ? `2px solid ${p.color}` : `1px solid ${C.border}`, position: "relative", textAlign: "center", background: p.popular ? `${p.color}08` : "transparent" }}>
                {p.popular && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: p.color, color: "#fff", borderRadius: 20, padding: "2px 12px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>Most Popular</div>}
                {p.saves && <div style={{ background: "rgba(255,255,255,0.08)", color: C.text, borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, marginBottom: 8, display: "inline-block" }}>{p.saves}</div>}
                <h4 style={{ fontFamily: F.display, fontSize: 14, color: C.text, margin: "0 0 8px" }}>{p.name}</h4>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: p.color, fontFamily: F.mono }}>{p.price}</span>
                  <span style={{ color: C.textMuted, fontSize: 11 }}>{p.period}</span>
                </div>
                <button onClick={onSignUp} style={{ width: "100%", padding: "8px", borderRadius: 7, border: "none", background: p.color, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Subscribe</button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: C.textMuted, fontSize: 11, margin: 0 }}>Secure payment · Cancel anytime · Instant access</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onChooseRole, onBack }: { onChooseRole: (r: Role) => void; onBack?: () => void }) {
  const roles: { role: Role; title: string; desc: string }[] = [
    { role: "student", title: "Student",       desc: "Browse tutors, book sessions and track your learning journey." },
    { role: "tutor",   title: "Tutor",         desc: "Manage bookings, earn money and grow your student base." },
    { role: "admin",   title: "Administrator", desc: "Monitor the platform, verify tutors and manage accounts." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: F.body }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.roles.admin.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, fontFamily: F.display }}>K</span>
          </div>
          <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 900, color: C.text }}>KitsoLink</span>
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: C.text, margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
          Choose how you're<br />accessing KitsoLink
        </h1>
        <p style={{ color: C.textSub, fontSize: 15, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>Each role has a personalised dashboard built for your needs.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, width: "100%", maxWidth: 820 }}>
        {roles.map(r => {
          const rStyle = C.roles[r.role];
          return (
            <LandingRoleCard key={r.role} title={r.title} desc={r.desc} gradient={rStyle.grad} accent={rStyle.accent} onClick={() => onChooseRole(r.role)} />
          );
        })}
      </div>
      <div style={{ marginTop: 36, display: "flex", gap: 20, alignItems: "center" }}>
        {onBack && <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 16px", color: C.textSub, fontSize: 13, cursor: "pointer", fontFamily: F.body }}>Back to Explore</button>}
        <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>KitsoLink 2026 · Built for Botswana</p>
      </div>
    </div>
  );
}

function LandingRoleCard({ title, desc, gradient, accent, onClick }: { title: string; desc: string; gradient: string; accent: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ background: hov ? C.cardElevated : C.card, border: hov ? `1px solid ${C.borderStrong}` : `1px solid ${C.border}`, borderRadius: 12, padding: "28px 24px", cursor: "pointer", transition: "all 0.18s" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: gradient, marginBottom: 18 }} />
      <h3 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 22px", lineHeight: 1.6 }}>{desc}</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: gradient, padding: "8px 18px", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 600 }}>
        Continue as {title} {Icon.chevron}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE — simplified: only email + password, no prefill
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({ role, onLogin, onBack }: { role: Role; onLogin: (u: User) => void; onBack: () => void; }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rc = C.roles[role];

  const handleSubmit = async () => {
    setErr(""); setSubmitting(true);
    try {
      // Admin: simple credential check
      if (role === "admin") {
        if (email.toLowerCase().trim() === "mark" && password === "mark12345") { onLogin(ADMIN_USER); }
        else { setErr("Invalid admin credentials."); }
        return;
      }

      if (mode === "login") {
        if (!email.trim() || !password) { setErr("Please enter your email and password."); return; }
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { setErr(error.message); return; }
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
          if (profile) onLogin({ id: profile.id, name: profile.name, email: data.user.email || "", role: profile.role as Role, avatar: profile.avatar || profile.name.slice(0, 2).toUpperCase() });
          else setErr("Account not found. Please register.");
        }
        return;
      }

      // Register — only name, email, password
      if (!name.trim() || !email.trim() || !password) { setErr("Please fill all fields."); return; }
      if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
      const initials = name.trim().split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email: email.trim(), password });
      if (authErr) { setErr(authErr.message); return; }
      if (!authData.user) { setErr("Registration failed. Please try again."); return; }
      const uid = authData.user.id;
      const { error: profErr } = await supabase.from("profiles").insert({ id: uid, name: name.trim(), role, avatar: initials, university: "" });
      if (profErr) { setErr(profErr.message); return; }
      if (role === "student") {
        await supabase.from("student_profiles").insert({ id: uid, course: "", year: "1st Year", plan: "free" });
      } else {
        await supabase.from("tutor_profiles").insert({ id: uid, modules: [], qualifications: [], bio: "", rate: 80, available: true, verified: "pending" });
      }
      try { await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "welcome", email: email.trim(), name: name.trim(), role }) }); } catch {}
      onLogin({ id: uid, name: name.trim(), email: email.trim(), role, avatar: initials });
    } catch (e: any) { setErr(e.message || "Something went wrong."); }
    finally { setSubmitting(false); }
  };

  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 14, fontFamily: F.body, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" };
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 420, position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 18, left: 18, background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 13, fontFamily: F.body, display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg> Back
        </button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${rc.accent}14`, border: `1px solid ${rc.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ color: rc.accent, fontWeight: 900, fontSize: 18, fontFamily: F.display }}>{roleLabel[0]}</span>
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
            {role === "admin" ? "Admin Access" : mode === "login" ? `${roleLabel} Sign In` : `Create Account`}
          </h2>
          <p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>
            {role === "admin" ? "Restricted area" : mode === "login" ? `Sign in to your ${roleLabel.toLowerCase()} account` : `Register as a ${roleLabel.toLowerCase()}`}
          </p>
          {role !== "admin" && (
            <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 18, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3, width: "fit-content", margin: "18px auto 0" }}>
              {(["login","register"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ padding: "6px 20px", borderRadius: 6, border: "none", background: mode === m ? C.card : "transparent", color: mode === m ? C.text : C.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {role === "admin" ? (
            <>
              <div><label style={lbl}>Username</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="mark" style={inp} /></div>
              <div><label style={lbl}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
              <div style={{ background: `${rc.accent}0C`, border: `1px solid ${rc.accent}22`, borderRadius: 8, padding: "9px 12px" }}>
                <p style={{ color: rc.accent, fontSize: 12, margin: 0, fontFamily: F.mono, opacity: 0.8 }}>Demo: mark / mark12345</p>
              </div>
            </>
          ) : mode === "login" ? (
            <>
              <div><label style={lbl}>Email address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp} /></div>
              <div><label style={lbl}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
            </>
          ) : (
            <>
              <div><label style={lbl}>Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inp} /></div>
              <div><label style={lbl}>Email address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp} /></div>
              <div><label style={lbl}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
              {role === "tutor" && (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ color: C.textMuted, fontSize: 12, margin: 0, lineHeight: 1.5 }}>After registering you can fill in your modules, rate and bio from your profile settings. Your account will be reviewed before going live.</p>
                </div>
              )}
            </>
          )}

          {err && (
            <div style={{ background: "rgba(240,82,82,0.08)", border: "1px solid rgba(240,82,82,0.2)", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ color: C.danger, fontSize: 13, margin: 0 }}>{err}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting} style={{ background: submitting ? "rgba(255,255,255,0.08)" : rc.grad, color: "#fff", border: "none", borderRadius: 9, padding: "13px", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: F.body, marginTop: 4 }}>
            {submitting ? "Please wait…" : role === "admin" ? "Sign In" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHELL
// ═══════════════════════════════════════════════════════════════════════════════
interface SharedProps {
  tutors: TutorProfile[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>;
  students: StudentProfile[]; setStudents: React.Dispatch<React.SetStateAction<StudentProfile[]>>;
  bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  reviews: Review[]; setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  payments: Payment[]; setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  onLogout: () => void;
}

function Shell({ navItems, activeTab, setActiveTab, user, theme, onLogout, children }: {
  navItems: { id: string; label: string; icon: React.ReactNode; badge?: number }[];
  activeTab: string; setActiveTab: (t: string) => void;
  user: User; theme: AnyTheme; onLogout: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: F.body }}>
      <aside style={{ width: 228, background: C.surface, display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh", flexShrink: 0, borderRight: `1px solid ${C.border}` }}>
        <div style={{ padding: "4px 8px 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, fontFamily: F.display }}>K</span>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 900, color: C.text }}>KitsoLink</span>
          </div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: active ? theme.accentLight : "transparent", color: active ? theme.accent : C.textMuted, fontSize: 13, fontFamily: F.body, fontWeight: active ? 600 : 400, transition: "all 0.12s", textAlign: "left", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>{item.label}
                </div>
                {item.badge != null && item.badge > 0 && (
                  <span style={{ background: C.danger, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, fontFamily: F.mono, minWidth: 18, textAlign: "center" }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 4px", marginBottom: 8 }}>
            <Avatar initials={user.avatar} size={32} gradient={theme.gradient} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.textMuted, textTransform: "capitalize" }}>{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: "100%", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: F.body, textAlign: "left", display: "flex", alignItems: "center", gap: 7, transition: "all 0.12s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,82,82,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = C.danger; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = C.textMuted; }}>
            {Icon.signout} Sign Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: "auto", padding: "36px 36px 60px" }}>
        {children}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function StudentDashboard({ user, ...shared }: { user: User } & SharedProps) {
  const [tab, setTab] = useState("home");
  const th = T.student;
  const { tutors, bookings, messages, reviews, setBookings, setMessages, setReviews, setPayments, payments, onLogout } = shared;
  const myBookings = bookings.filter(b => b.studentId === user.id);
  const myMessages = messages.filter(m => m.receiverId === user.id);
  const unread = myMessages.filter(m => !m.read).length;
  const pending = myBookings.filter(b => b.status === "pending").length;
  const navItems = [
    { id: "home",     label: "Overview",       icon: Icon.home },
    { id: "tutors",   label: "Find Tutors",    icon: Icon.search },
    { id: "bookings", label: "My Bookings",    icon: Icon.calendar, badge: pending },
    { id: "messages", label: "Messages",       icon: Icon.message,  badge: unread },
    { id: "payments", label: "Payments",       icon: Icon.card },
    { id: "reviews",  label: "Reviews",        icon: Icon.star },
    { id: "upload",   label: "Upload Material",icon: Icon.upload },
    { id: "referral", label: "Refer a Friend", icon: Icon.gift },
  ];
  return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
      {tab === "home"     && <StudentHome user={user} bookings={myBookings} tutors={tutors} messages={myMessages} theme={th} />}
      {tab === "tutors"   && <StudentTutors user={user} tutors={tutors} bookings={bookings} setBookings={setBookings} setPayments={setPayments} reviews={reviews} theme={th} />}
      {tab === "bookings" && <StudentBookings bookings={myBookings} setBookings={setBookings} theme={th} />}
      {tab === "messages" && <StudentMessages user={user} messages={messages} setMessages={setMessages} tutors={tutors} theme={th} />}
      {tab === "payments" && <StudentPayments payments={payments.filter(p => p.studentId === user.id)} theme={th} />}
      {tab === "reviews"  && <StudentReviews user={user} reviews={reviews.filter(r => r.studentId === user.id)} tutors={tutors} setReviews={setReviews} bookings={myBookings} theme={th} />}
      {tab === "upload"   && <div style={{ maxWidth: 680 }}><PageHeader title="Upload Material" sub="Share study materials with fellow students" /><MaterialUploadForm user={user} theme={th} onClose={() => setTab("home")} /></div>}
      {tab === "referral" && <div style={{ maxWidth: 580 }}><PageHeader title="Refer a Friend" sub="Earn 7 free Premium days per referral" /><ReferralWidget referralCode={user.id.slice(0,8)} theme={th} /></div>}
    </Shell>
  );
}

function StudentHome({ user, bookings, tutors, messages, theme }: { user: User; bookings: Booking[]; tutors: TutorProfile[]; messages: Message[]; theme: AnyTheme }) {
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const completed = bookings.filter(b => b.status === "completed").length;
  const unread = messages.filter(m => m.receiverId === user.id && !m.read).length;
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Welcome back, {user.name.split(" ")[0]}</h1>
        <p style={{ color: C.textSub, fontSize: 14, margin: 0 }}>Your learning overview</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Active Bookings" value={confirmed} icon={Icon.calendar} color={theme.accent} theme={theme} />
        <StatCard label="Sessions Done" value={completed} icon={Icon.check} color={theme.success} theme={theme} />
        <StatCard label="Unread Messages" value={unread} icon={Icon.message} color={theme.warning} theme={theme} />
        <StatCard label="Available Tutors" value={tutors.filter(t => t.available && t.verified === "approved").length} icon={Icon.users} color="#6366F1" theme={theme} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DashCard title="Recent Bookings" theme={theme}>
          {bookings.length === 0 ? <EmptyState icon={Icon.calendar} text="No bookings yet" /> : bookings.slice(0, 4).map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.text }}>{b.tutorName}</p><p style={{ margin: 0, fontSize: 11, color: C.textSub }}>{b.module} · {b.date}</p></div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </DashCard>
        <DashCard title="Top Tutors" theme={theme}>
          {tutors.filter(t => t.verified === "approved").slice(0, 4).map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
              <Avatar initials={t.avatar} size={32} gradient={theme.gradient} />
              <div style={{ flex: 1 }}><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</p><p style={{ margin: 0, fontSize: 11, color: C.textSub }}>{t.modules.slice(0,2).join(", ")}</p></div>
              <StarRow rating={t.rating || 0} />
            </div>
          ))}
          {tutors.filter(t => t.verified === "approved").length === 0 && <EmptyState icon={Icon.users} text="No approved tutors yet" />}
        </DashCard>
      </div>
    </div>
  );
}

function DashCard({ title, theme, children }: { title: string; theme: AnyTheme; children: React.ReactNode }) {
  return (
    <div style={{ background: theme.card, borderRadius: 12, padding: "20px", border: `1px solid ${theme.border}` }}>
      <h3 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: "0 0 14px", fontWeight: 700 }}>{title}</h3>
      {children}
    </div>
  );
}

function StudentTutors({ user, tutors, bookings, setBookings, setPayments, reviews, theme }: { user: User; tutors: TutorProfile[]; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; setPayments: React.Dispatch<React.SetStateAction<Payment[]>>; reviews: Review[]; theme: AnyTheme }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TutorProfile | null>(null);
  const [bookModal, setBookModal] = useState(false);
  const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [module, setModule] = useState(""); const [note, setNote] = useState("");
  const [booked, setBooked] = useState(false);
  const approved = tutors.filter(t => t.verified === "approved");
  const filtered = approved.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.modules.some(s => s.toLowerCase().includes(search.toLowerCase())));
  const tutorReviews = selected ? reviews.filter(r => r.tutorId === selected.id) : [];

  const doBook = async () => {
    if (!selected || !date || !time || !module) { alert("Please fill all fields."); return; }
    try {
      const { data: nb, error } = await supabase.from("bookings").insert({ student_id: user.id, tutor_id: selected.id, student_name: user.name, tutor_name: selected.name, module, date, time, status: "pending", note, amount: selected.rate }).select().single();
      if (error) throw error;
      await supabase.from("payments").insert({ student_id: user.id, tutor_id: selected.id, booking_id: nb.id, student_name: user.name, tutor_name: selected.name, amount: selected.rate, status: "pending", method: "Card" });
      const [{ data: bData }, { data: pData }] = await Promise.all([supabase.from("bookings").select("*"), supabase.from("payments").select("*")]);
      if (bData) setBookings(bData.map((b: any) => ({ id: b.id, studentId: b.student_id, tutorId: b.tutor_id, studentName: b.student_name, tutorName: b.tutor_name, module: b.module, date: b.date, time: b.time, status: b.status, note: b.note || "", amount: b.amount, createdAt: b.created_at })));
      if (pData) setPayments(pData.map((p: any) => ({ id: p.id, studentId: p.student_id, tutorId: p.tutor_id, bookingId: p.booking_id, studentName: p.student_name, tutorName: p.tutor_name, amount: p.amount, status: p.status, date: new Date(p.created_at).toLocaleDateString("en-GB"), method: p.method || "Card" })));
      setBooked(true);
    } catch (e: any) { alert("Booking failed: " + e.message); }
  };

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box" };

  if (selected) return (
    <div>
      <button onClick={() => { setSelected(null); setBooked(false); setBookModal(false); }} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontSize: 13, fontFamily: F.body, marginBottom: 18, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg> Back to Tutors
      </button>
      <div style={{ background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ background: theme.gradient, padding: "28px 24px", display: "flex", gap: 18, alignItems: "center" }}>
          <Avatar initials={selected.avatar} size={64} gradient="rgba(0,0,0,0.18)" />
          <div>
            <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>{selected.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: "0 0 6px" }}>{selected.university}</p>
            <StarRow rating={selected.rating} size={13} />
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginLeft: 6 }}>({selected.reviewCount} reviews)</span>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ fontFamily: F.display, fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>P{selected.rate}/hr</p>
            <Badge label={selected.available ? "Available" : "Unavailable"} color="#fff" bg={selected.available ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.2)"} />
          </div>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 22 }}>
            <div><p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Modules</p>{selected.modules.map(s => <Pill key={s} label={s} color={theme.accent} bg={theme.accentLight} />)}</div>
            <div><p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Qualifications</p>{selected.qualifications.length ? selected.qualifications.map(q => <p key={q} style={{ margin: "0 0 4px", fontSize: 13, color: C.text }}>— {q}</p>) : <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>None listed</p>}</div>
            <div><p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>About</p><p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{selected.bio || "No bio provided."}</p></div>
          </div>
          {!booked ? (
            !bookModal ? (
              <button onClick={() => setBookModal(true)} disabled={!selected.available} style={{ background: selected.available ? theme.gradient : "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: selected.available ? "pointer" : "not-allowed", fontFamily: F.body }}>Book a Session</button>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${theme.accent}33`, borderRadius: 10, padding: "20px" }}>
                <h4 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: "0 0 16px" }}>Book a Session</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase" }}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></div>
                  <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase" }}>Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} /></div>
                </div>
                <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase" }}>Module</label><input value={module} onChange={e => setModule(e.target.value)} placeholder="e.g. Binary Trees, SQL Joins" style={inp} /></div>
                <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase" }}>Notes (optional)</label><textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={doBook} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Confirm — P{selected.rate}</button>
                  <button onClick={() => setBookModal(false)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.textSub, borderRadius: 8, padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: F.body }}>Cancel</button>
                </div>
              </div>
            )
          ) : (
            <div style={{ background: "rgba(31,214,160,0.08)", border: "1px solid rgba(31,214,160,0.2)", borderRadius: 8, padding: "16px 20px" }}>
              <p style={{ color: theme.success, fontWeight: 700, margin: "0 0 4px", fontSize: 14 }}>Booking Requested</p>
              <p style={{ color: C.textSub, margin: 0, fontSize: 13 }}>Your request has been sent to {selected.name}. They will confirm shortly.</p>
            </div>
          )}
        </div>
      </div>
      <DashCard title="Student Reviews" theme={theme}>
        {tutorReviews.length === 0 ? <EmptyState icon={Icon.star} text="No reviews yet" /> : tutorReviews.map(r => (
          <div key={r.id} style={{ padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar initials={r.studentName.split(" ").map(w => w[0]).join("").slice(0,2)} size={28} />
                <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{r.studentName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><StarRow rating={r.rating} /><span style={{ color: C.textMuted, fontSize: 11 }}>{r.date}</span></div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.55 }}>{r.comment}</p>
          </div>
        ))}
      </DashCard>
    </div>
  );

  return (
    <div>
      <PageHeader title="Find a Tutor" sub={`${filtered.length} approved tutors available`} />
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "0 14px", display: "flex", alignItems: "center", marginBottom: 20 }}>
        <span style={{ color: C.textMuted, display: "flex", marginRight: 8 }}>{Icon.search}</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or module…" style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: C.text, background: "transparent", fontFamily: F.body, padding: "12px 0" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
        {filtered.length === 0 ? <div style={{ gridColumn: "1/-1" }}><EmptyState icon={Icon.users} text="No approved tutors match your search" /></div> : filtered.map(t => (
          <TutorCard key={t.id} tutor={t} theme={theme} onClick={() => setSelected(t)} reviewCount={reviews.filter(r => r.tutorId === t.id).length} />
        ))}
      </div>
    </div>
  );
}

function TutorCard({ tutor, theme, onClick, reviewCount }: { tutor: TutorProfile; theme: AnyTheme; onClick: () => void; reviewCount: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ background: hov ? C.cardElevated : theme.card, borderRadius: 10, padding: "18px", border: hov ? `1px solid ${theme.accent}44` : `1px solid ${theme.border}`, cursor: "pointer", transition: "all 0.15s" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <Avatar initials={tutor.avatar} size={44} gradient={theme.gradient} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: F.display, fontSize: 15, color: C.text, margin: "0 0 2px", fontWeight: 700 }}>{tutor.name}</h3>
          <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 5px" }}>{tutor.university}</p>
          <StarRow rating={tutor.rating} /><span style={{ color: C.textMuted, fontSize: 11, marginLeft: 4 }}>({reviewCount})</span>
        </div>
        <Pill label={tutor.available ? "Available" : "Busy"} color={tutor.available ? theme.success : theme.danger} bg={tutor.available ? "rgba(31,214,160,0.1)" : "rgba(240,82,82,0.1)"} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {tutor.modules.slice(0,3).map(s => <Pill key={s} label={s} color={theme.accent} bg={theme.accentLight} />)}
        {tutor.modules.length > 3 && <Pill label={`+${tutor.modules.length-3}`} color={C.textMuted} bg="rgba(255,255,255,0.05)" />}
      </div>
      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: C.textSub }}>{(tutor.bio || "No bio provided.").slice(0, 55)}…</p>
        <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 700, color: theme.accent, flexShrink: 0, marginLeft: 10 }}>P{tutor.rate}/hr</span>
      </div>
    </div>
  );
}

function StudentBookings({ bookings, setBookings, theme }: { bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; theme: AnyTheme }) {
  const cancel = async (id: number) => {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    setBookings(p => p.map(b => b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b));
  };
  return (
    <div>
      <PageHeader title="My Bookings" sub={`${bookings.length} total`} />
      {bookings.length === 0 ? <EmptyState icon={Icon.calendar} text="No bookings yet — find a tutor and book your first session." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bookings.map(b => (
            <div key={b.id} style={{ background: theme.card, borderRadius: 10, padding: "16px 18px", border: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar initials={b.tutorName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={40} gradient={theme.gradient} />
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: C.text }}>{b.tutorName}</p>
                  <p style={{ margin: "0 0 2px", fontSize: 12, color: C.textSub }}>{b.module}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{b.date} at {b.time}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 700, color: theme.accent }}>P{b.amount}</span>
                <StatusBadge status={b.status} />
                {b.status === "pending" && <button onClick={() => cancel(b.id)} style={{ background: "rgba(240,82,82,0.08)", color: C.danger, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentMessages({ user, messages, setMessages, tutors, theme }: { user: User; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>; tutors: TutorProfile[]; theme: AnyTheme }) {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const activeTutor = tutors.find(t => t.userId === activeConv);
  const convMsgs = activeConv ? messages.filter(m => (m.senderId === user.id && m.receiverId === activeConv) || (m.senderId === activeConv && m.receiverId === user.id)) : [];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convMsgs.length]);
  const sendMsg = async () => {
    if (!newMsg.trim() || !activeConv) return;
    const text = newMsg; setNewMsg("");
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: activeConv, sender_name: user.name, text, read: false });
    const { data } = await supabase.from("messages").select("*").order("created_at");
    if (data) setMessages(data.map((m: any) => ({ id: m.id, senderId: m.sender_id, receiverId: m.receiver_id, senderName: m.sender_name, text: m.text, read: m.read, timestamp: new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) })));
  };
  return (
    <div>
      <PageHeader title="Messages" sub="Chat with your tutors" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, height: 580 }}>
        <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}` }}><p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Conversations</p></div>
          <div style={{ padding: 8, overflowY: "auto", flex: 1 }}>
            {tutors.filter(t => t.verified === "approved").length === 0 ? <EmptyState icon={Icon.message} text="No tutors to message" /> : tutors.filter(t => t.verified === "approved").map(t => (
              <div key={t.id} onClick={() => { setActiveConv(t.userId); setMessages(p => p.map(m => m.receiverId === user.id && m.senderId === t.userId ? { ...m, read: true } : m)); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 7, cursor: "pointer", background: activeConv === t.userId ? theme.accentLight : "transparent", marginBottom: 2 }}>
                <Avatar initials={t.avatar} size={32} gradient={theme.gradient} />
                <div style={{ flex: 1, overflow: "hidden" }}><p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</p><p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{t.modules[0] || ""}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!activeConv ? <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState icon={Icon.message} text="Select a tutor to start chatting" /></div> : (
            <>
              <div style={{ padding: "12px 18px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={activeTutor?.avatar || "??"} size={32} gradient={theme.gradient} />
                <div><p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: C.text }}>{activeTutor?.name}</p><p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{activeTutor?.available ? "Available" : "Unavailable"}</p></div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                {convMsgs.length === 0 && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState icon={Icon.message} text="No messages yet — say hello!" /></div>}
                {convMsgs.map(m => {
                  const mine = m.senderId === user.id;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <div style={{ background: mine ? theme.gradient : "rgba(255,255,255,0.05)", color: mine ? "#fff" : C.text, borderRadius: mine ? "14px 14px 3px 14px" : "14px 14px 14px 3px", padding: "9px 14px", maxWidth: "72%", fontSize: 13, lineHeight: 1.5 }}>
                        <p style={{ margin: "0 0 3px" }}>{m.text}</p>
                        <p style={{ margin: 0, fontSize: 10, opacity: 0.55 }}>{m.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div style={{ padding: "10px 14px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 8 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message…" style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "rgba(255,255,255,0.03)", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none" }} />
                <button onClick={sendMsg} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 600, cursor: "pointer", fontFamily: F.body, fontSize: 13 }}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentPayments({ payments, theme }: { payments: Payment[]; theme: AnyTheme }) {
  const total = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <PageHeader title="Payments" sub="Transaction history" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 12, marginBottom: 22 }}>
        <StatCard label="Total Spent" value={`P${total}`} icon={Icon.card} color={theme.danger} theme={theme} />
        <StatCard label="Pending" value={`P${payments.filter(p=>p.status==="pending").reduce((s,p)=>s+p.amount,0)}`} icon={Icon.clock} color={theme.warning} theme={theme} />
        <StatCard label="Sessions Paid" value={payments.filter(p=>p.status==="completed").length} icon={Icon.check} color={theme.success} theme={theme} />
      </div>
      <DashCard title="Transaction History" theme={theme}>
        {payments.length === 0 ? <EmptyState icon={Icon.card} text="No transactions yet" /> : payments.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "11px 0", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.text }}>{p.tutorName}</span>
            <span style={{ fontSize: 12, color: C.textSub }}>{p.date}</span>
            <span style={{ fontSize: 14, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>P{p.amount}</span>
            <PayBadge status={p.status} />
          </div>
        ))}
      </DashCard>
    </div>
  );
}

function StudentReviews({ user, reviews, tutors, setReviews, bookings, theme }: { user: User; reviews: Review[]; tutors: TutorProfile[]; setReviews: React.Dispatch<React.SetStateAction<Review[]>>; bookings: Booking[]; theme: AnyTheme }) {
  const [showForm, setShowForm] = useState(false);
  const [selTutor, setSelTutor] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const completedTutors = [...new Set(bookings.filter(b => b.status === "completed").map(b => b.tutorId))];
  const submit = async () => {
    if (!selTutor || !rating || !comment) { alert("Please fill all fields."); return; }
    const tutor = tutors.find(t => t.id === selTutor); if (!tutor) return;
    const { data: newRev } = await supabase.from("reviews").insert({ student_id: user.id, tutor_id: selTutor, student_name: user.name, tutor_name: tutor.name, rating, comment }).select().single();
    if (newRev) setReviews(p => [...p, { id: newRev.id, studentId: user.id, tutorId: selTutor as string, studentName: user.name, tutorName: tutor.name, rating, comment, date: new Date(newRev.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }), flagged: false, hidden: false }]);
    const tutorRevs = [...reviews.filter(r => r.tutorId === selTutor), { rating }];
    const avg = parseFloat((tutorRevs.reduce((s: number, r: any) => s + r.rating, 0) / tutorRevs.length).toFixed(1));
    await supabase.from("tutor_profiles").update({ rating: avg, review_count: tutorRevs.length }).eq("id", selTutor);
    setShowForm(false); setRating(0); setComment(""); setSelTutor(null);
  };
  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <PageHeader title="My Reviews" sub={`${reviews.length} written`} />
        {completedTutors.length > 0 && <button onClick={() => setShowForm(true)} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Write a Review</button>}
      </div>
      {showForm && (
        <div style={{ background: theme.card, border: `1px solid ${theme.accent}33`, borderRadius: 10, padding: "20px", marginBottom: 20 }}>
          <h4 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: "0 0 16px" }}>Write a Review</h4>
          <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase" }}>Tutor</label>
            <select value={selTutor || ""} onChange={e => setSelTutor(e.target.value)} style={inp}><option value="">Select a tutor</option>{completedTutors.map(id => { const t = tutors.find(t => t.id === id); return t ? <option key={id} value={id}>{t.name}</option> : null; })}</select></div>
          <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase" }}>Rating</label><StarPicker value={rating} onChange={setRating} /></div>
          <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase" }}>Comment</label><textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} /></div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={submit} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Submit</button><button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.textSub, borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer", fontFamily: F.body }}>Cancel</button></div>
        </div>
      )}
      {reviews.length === 0 ? <EmptyState icon={Icon.star} text="No reviews yet. Complete a session to leave a review." /> : reviews.map(r => (
        <div key={r.id} style={{ background: theme.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${theme.border}`, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>Review for {r.tutorName}</p>
            <div style={{ display: "flex", gap: 8 }}><StarRow rating={r.rating} /><span style={{ color: C.textMuted, fontSize: 11 }}>{r.date}</span></div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.55 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TUTOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function TutorDashboard({ user, ...shared }: { user: User } & SharedProps) {
  const [tab, setTab] = useState("home");
  const th = T.tutor;
  const { tutors, setTutors, bookings, setBookings, messages, setMessages, reviews, payments, setPayments, onLogout } = shared;
  const myProfile = tutors.find(t => t.userId === user.id);
  const myBookings = bookings.filter(b => b.tutorId === (myProfile?.id || ""));
  const myMessages = messages.filter(m => m.receiverId === user.id);
  const newRequests = myBookings.filter(b => b.status === "pending").length;
  const unread = myMessages.filter(m => !m.read).length;
  const navItems = [
    { id: "home",     label: "Overview",        icon: Icon.home },
    { id: "requests", label: "Requests",         icon: Icon.list,     badge: newRequests },
    { id: "schedule", label: "Schedule",         icon: Icon.calendar },
    { id: "messages", label: "Messages",         icon: Icon.message,  badge: unread },
    { id: "earnings", label: "Earnings",         icon: Icon.money },
    { id: "reviews",  label: "Reviews",          icon: Icon.star },
    { id: "profile",  label: "Profile Settings", icon: Icon.user },
    { id: "upload",   label: "Upload Material",  icon: Icon.upload },
  ];
  if (!myProfile) return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
      <EmptyState icon={Icon.clock} text="Profile is being set up. Please refresh or contact admin." />
    </Shell>
  );
  return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
      {tab === "home"     && <TutorHome profile={myProfile} bookings={myBookings} messages={myMessages} reviews={reviews.filter(r => r.tutorId === myProfile.id)} theme={th} />}
      {tab === "requests" && <TutorRequests profile={myProfile} bookings={myBookings} setBookings={setBookings} setPayments={setPayments} theme={th} />}
      {tab === "schedule" && <TutorSchedule profile={myProfile} bookings={myBookings} setTutors={setTutors} theme={th} />}
      {tab === "messages" && <TutorMessages user={user} messages={messages} setMessages={setMessages} bookings={myBookings} theme={th} />}
      {tab === "earnings" && <TutorEarnings profile={myProfile} bookings={myBookings} payments={payments.filter(p => p.tutorId === myProfile.id)} theme={th} />}
      {tab === "reviews"  && <TutorReviewsTab reviews={reviews.filter(r => r.tutorId === myProfile.id)} theme={th} />}
      {tab === "profile"  && <TutorProfileTab profile={myProfile} setTutors={setTutors} theme={th} />}
      {tab === "upload"   && <div style={{ maxWidth: 680 }}><PageHeader title="Upload Material" sub="Share study materials with students" /><MaterialUploadForm user={user} theme={th} onClose={() => setTab("home")} /></div>}
    </Shell>
  );
}

function TutorHome({ profile, bookings, messages, reviews, theme }: { profile: TutorProfile; bookings: Booking[]; messages: Message[]; reviews: Review[]; theme: AnyTheme }) {
  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const earned = bookings.filter(b => b.status === "completed").reduce((s, b) => s + b.amount, 0);
  const unread = messages.filter(m => !m.read).length;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Welcome, {profile.name.split(" ")[0]}</h1>
          {profile.verified === "pending"  && <Badge label="Pending Review"  color={theme.warning} bg="rgba(232,151,42,0.12)" />}
          {profile.verified === "approved" && <Badge label="Verified"        color={theme.success} bg="rgba(31,214,160,0.12)" />}
          {profile.verified === "rejected" && <Badge label="Not Verified"    color={theme.danger}  bg="rgba(240,82,82,0.12)"  />}
        </div>
        <p style={{ color: C.textSub, fontSize: 14, margin: 0 }}>{profile.verified === "pending" ? "Your profile is under review by admin." : "Your tutoring dashboard overview."}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Pending" value={pending} icon={Icon.clock} color={theme.warning} theme={theme} />
        <StatCard label="Active Sessions" value={confirmed} icon={Icon.calendar} color={theme.accent} theme={theme} />
        <StatCard label="Total Earned" value={`P${earned}`} icon={Icon.money} color={theme.success} theme={theme} />
        <StatCard label="Avg. Rating" value={avgRating} icon={Icon.star} color="#E8A020" theme={theme} />
        <StatCard label="Unread Messages" value={unread} icon={Icon.message} color="#6366F1" theme={theme} />
        <StatCard label="Reviews" value={reviews.length} icon={Icon.fileText} color={C.textSub} theme={theme} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DashCard title="Pending Requests" theme={theme}>
          {bookings.filter(b => b.status === "pending").slice(0,4).length === 0 ? <EmptyState icon={Icon.list} text="No pending requests" /> : bookings.filter(b => b.status === "pending").slice(0,4).map(b => (
            <div key={b.id} style={{ padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.text }}>{b.studentName}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.textSub }}>{b.module} · {b.date}</p>
            </div>
          ))}
        </DashCard>
        <DashCard title="Recent Reviews" theme={theme}>
          {reviews.slice(0,3).length === 0 ? <EmptyState icon={Icon.star} text="No reviews yet" /> : reviews.slice(0,3).map(r => (
            <div key={r.id} style={{ padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{r.studentName}</p>
                <StarRow rating={r.rating} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: C.textSub }}>{r.comment.slice(0,70)}…</p>
            </div>
          ))}
        </DashCard>
      </div>
    </div>
  );
}

function TutorRequests({ profile, bookings, setBookings, setPayments, theme }: { profile: TutorProfile; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>; theme: AnyTheme }) {
  const update = async (id: number, status: BookingStatus) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
    if (status === "completed") await supabase.from("payments").update({ status: "completed" }).eq("booking_id", id);
  };
  const pending = bookings.filter(b => b.status === "pending");
  const others = bookings.filter(b => b.status !== "pending");
  return (
    <div>
      <PageHeader title="Student Requests" sub={`${pending.length} pending`} />
      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>Pending ({pending.length})</p>
          {pending.map(b => (
            <div key={b.id} style={{ background: theme.card, borderRadius: 10, padding: "18px", border: `1px solid ${theme.accent}2A`, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar initials={b.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={40} gradient={theme.gradient} />
                  <div><p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: C.text }}>{b.studentName}</p><p style={{ margin: "0 0 2px", fontSize: 12, color: C.textSub }}>{b.module}</p><p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{b.date} at {b.time}</p></div>
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: theme.accent }}>P{b.amount}</span>
              </div>
              {b.note && <div style={{ background: theme.accentLight, borderRadius: 7, padding: "8px 12px", marginBottom: 12 }}><p style={{ margin: 0, fontSize: 12, color: theme.accent }}>{b.note}</p></div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => update(b.id, "confirmed")} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Accept</button>
                <button onClick={() => update(b.id, "cancelled")} style={{ background: "rgba(240,82,82,0.08)", color: C.danger, border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>All Bookings</p>
          {others.map(b => (
            <div key={b.id} style={{ background: theme.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${theme.border}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar initials={b.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={34} gradient={theme.gradient} />
                <div><p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: C.text }}>{b.studentName}</p><p style={{ margin: 0, fontSize: 11, color: C.textSub }}>{b.module} · {b.date}</p></div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <StatusBadge status={b.status} />
                {b.status === "confirmed" && <button onClick={() => update(b.id, "completed")} style={{ background: "rgba(31,214,160,0.08)", color: theme.success, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Mark Complete</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {bookings.length === 0 && <EmptyState icon={Icon.list} text="No student requests yet" />}
    </div>
  );
}

function TutorSchedule({ profile, bookings, setTutors, theme }: { profile: TutorProfile; bookings: Booking[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const toggleAvail = async () => {
    const v = !profile.available;
    await supabase.from("tutor_profiles").update({ available: v }).eq("id", profile.id);
    setTutors(p => p.map(t => t.id === profile.id ? { ...t, available: v } : t));
  };
  const upcoming = bookings.filter(b => b.status === "confirmed" || b.status === "pending");
  return (
    <div>
      <PageHeader title="Schedule" sub="Manage availability and upcoming sessions" />
      <div style={{ background: theme.card, borderRadius: 10, padding: "20px", border: `1px solid ${theme.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><h3 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: "0 0 4px", fontWeight: 700 }}>Availability</h3><p style={{ margin: 0, fontSize: 13, color: C.textSub }}>Toggle to let students know if you're accepting bookings</p></div>
          <Toggle value={profile.available} onChange={toggleAvail} color={theme.success} />
        </div>
        <div style={{ background: profile.available ? "rgba(31,214,160,0.07)" : "rgba(240,82,82,0.07)", borderRadius: 7, padding: "10px 14px" }}>
          <p style={{ margin: 0, color: profile.available ? theme.success : theme.danger, fontSize: 13, fontWeight: 600 }}>{profile.available ? "You are available — students can book sessions." : "You are unavailable — bookings are paused."}</p>
        </div>
      </div>
      <DashCard title={`Upcoming Sessions (${upcoming.length})`} theme={theme}>
        {upcoming.length === 0 ? <EmptyState icon={Icon.calendar} text="No upcoming sessions" /> : upcoming.map(b => (
          <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar initials={b.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={34} gradient={theme.gradient} />
              <div><p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: C.text }}>{b.studentName}</p><p style={{ margin: 0, fontSize: 11, color: C.textSub }}>{b.module}</p></div>
            </div>
            <div style={{ textAlign: "right" }}><p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: theme.accent }}>{b.date}</p><p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{b.time}</p></div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </DashCard>
    </div>
  );
}

function TutorMessages({ user, messages, setMessages, bookings, theme }: { user: User; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>; bookings: Booking[]; theme: AnyTheme }) {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const studentIds = [...new Set(bookings.map(b => b.studentId))];
  const convMsgs = activeConv ? messages.filter(m => (m.senderId === user.id && m.receiverId === activeConv) || (m.senderId === activeConv && m.receiverId === user.id)) : [];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convMsgs.length]);
  const sendMsg = async () => {
    if (!newMsg.trim() || !activeConv) return;
    const text = newMsg; setNewMsg("");
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: activeConv, sender_name: user.name, text, read: false });
    const { data } = await supabase.from("messages").select("*").order("created_at");
    if (data) setMessages(data.map((m: any) => ({ id: m.id, senderId: m.sender_id, receiverId: m.receiver_id, senderName: m.sender_name, text: m.text, read: m.read, timestamp: new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) })));
  };
  const getName = (id: string) => bookings.find(b => b.studentId === id)?.studentName || "Student";
  return (
    <div>
      <PageHeader title="Messages" sub="Chat with your students" />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14, height: 560 }}>
        <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "11px 12px", borderBottom: `1px solid ${theme.border}` }}><p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Students</p></div>
          <div style={{ padding: 8, overflowY: "auto", flex: 1 }}>
            {studentIds.length === 0 ? <EmptyState icon={Icon.message} text="No student conversations" /> : studentIds.map(id => (
              <div key={id} onClick={() => { setActiveConv(id); setMessages(p => p.map(m => m.receiverId === user.id && m.senderId === id ? { ...m, read: true } : m)); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 7, cursor: "pointer", background: activeConv === id ? theme.accentLight : "transparent", marginBottom: 2 }}>
                <Avatar initials={getName(id).split(" ").map(w=>w[0]).join("").slice(0,2)} size={30} gradient={theme.gradient} />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{getName(id)}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!activeConv ? <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState icon={Icon.message} text="Select a student to chat" /></div> : (
            <>
              <div style={{ padding: "11px 16px", borderBottom: `1px solid ${theme.border}` }}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{getName(activeConv)}</p></div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {convMsgs.map(m => { const mine = m.senderId === user.id; return (
                  <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                    <div style={{ background: mine ? theme.gradient : "rgba(255,255,255,0.05)", color: mine ? "#fff" : C.text, borderRadius: mine ? "14px 14px 3px 14px" : "14px 14px 14px 3px", padding: "9px 13px", maxWidth: "72%", fontSize: 13 }}>
                      <p style={{ margin: "0 0 3px" }}>{m.text}</p><p style={{ margin: 0, fontSize: 10, opacity: 0.55 }}>{m.timestamp}</p>
                    </div>
                  </div>
                ); })}
                <div ref={endRef} />
              </div>
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 8 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message…" style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "rgba(255,255,255,0.03)", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none" }} />
                <button onClick={sendMsg} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 600, cursor: "pointer", fontFamily: F.body, fontSize: 13 }}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TutorEarnings({ profile, bookings, payments, theme }: { profile: TutorProfile; bookings: Booking[]; payments: Payment[]; theme: AnyTheme }) {
  const completed = bookings.filter(b => b.status === "completed");
  const total = completed.reduce((s, b) => s + b.amount, 0);
  const pending = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.amount, 0);
  return (
    <div>
      <PageHeader title="Earnings" sub="Income from tutoring sessions" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 22 }}>
        <StatCard label="Total Earned" value={`P${total}`} icon={Icon.money} color={theme.accent} theme={theme} />
        <StatCard label="Pending" value={`P${pending}`} icon={Icon.clock} color={theme.warning} theme={theme} />
        <StatCard label="Sessions" value={completed.length} icon={Icon.check} color={theme.success} theme={theme} />
        <StatCard label="Hourly Rate" value={`P${profile.rate}/hr`} icon={Icon.user} color="#6366F1" theme={theme} />
      </div>
      <DashCard title="Earnings History" theme={theme}>
        {completed.length === 0 ? <EmptyState icon={Icon.money} text="No completed sessions yet" /> : completed.map(b => (
          <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "11px 0", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.text }}>{b.studentName}</span>
            <span style={{ fontSize: 12, color: C.textSub }}>{b.module} · {b.date}</span>
            <span style={{ fontSize: 15, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>+P{b.amount}</span>
          </div>
        ))}
      </DashCard>
    </div>
  );
}

function TutorReviewsTab({ reviews, theme }: { reviews: Review[]; theme: AnyTheme }) {
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  return (
    <div>
      <PageHeader title="My Reviews" sub={`${reviews.length} from students`} />
      {reviews.length > 0 && (
        <div style={{ background: theme.card, borderRadius: 10, padding: "20px", border: `1px solid ${theme.border}`, marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <p style={{ fontFamily: F.display, fontSize: 44, fontWeight: 900, color: theme.accent, margin: "0 0 4px", lineHeight: 1 }}>{avg}</p>
            <StarRow rating={parseFloat(avg) || 0} size={16} />
            <p style={{ color: C.textMuted, fontSize: 12, margin: "5px 0 0" }}>{reviews.length} reviews</p>
          </div>
          <div style={{ flex: 1 }}>
            {[5,4,3,2,1].map(n => { const count = reviews.filter(r => r.rating === n).length; const pct = reviews.length ? (count / reviews.length) * 100 : 0; return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ color: "#E8A020", fontSize: 12, width: 16, textAlign: "right" }}>{n}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>★</span>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: theme.gradient, borderRadius: 3 }} />
                </div>
                <span style={{ color: C.textMuted, fontSize: 11, width: 16 }}>{count}</span>
              </div>
            ); })}
          </div>
        </div>
      )}
      {reviews.length === 0 ? <EmptyState icon={Icon.star} text="No reviews yet — complete sessions to get reviews." /> : reviews.map(r => (
        <div key={r.id} style={{ background: theme.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${theme.border}`, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Avatar initials={r.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={28} gradient={theme.gradient} />
              <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{r.studentName}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}><StarRow rating={r.rating} /><span style={{ color: C.textMuted, fontSize: 11 }}>{r.date}</span></div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.55 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

function TutorProfileTab({ profile, setTutors, theme }: { profile: TutorProfile; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const [bio, setBio] = useState(profile.bio);
  const [rate, setRate] = useState(String(profile.rate));
  const [modules, setModules] = useState(profile.modules.join(", "));
  const [qualifications, setQualifications] = useState(profile.qualifications.join(", "));
  const [saved, setSaved] = useState(false);
  const save = async () => {
    const mods = modules.split(",").map((s: string) => s.trim()).filter(Boolean);
    const quals = qualifications.split(",").map((q: string) => q.trim()).filter(Boolean);
    const r = parseFloat(rate) || profile.rate;
    await supabase.from("tutor_profiles").update({ bio, rate: r, modules: mods, qualifications: quals }).eq("id", profile.id);
    setTutors(p => p.map(t => t.id === profile.id ? { ...t, bio, rate: r, modules: mods, qualifications: quals } : t));
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };
  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" };
  return (
    <div>
      <PageHeader title="Profile Settings" sub="Update your tutor profile information" />
      <div style={{ background: theme.card, borderRadius: 10, padding: "20px", border: `1px solid ${theme.border}`, marginBottom: 14, display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar initials={profile.avatar} size={56} gradient={theme.gradient} />
        <div>
          <h2 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, color: C.text, margin: "0 0 3px" }}>{profile.name}</h2>
          <p style={{ color: C.textSub, margin: "0 0 7px", fontSize: 13 }}>{profile.university}</p>
          <Badge label={profile.verified === "approved" ? "Verified Tutor" : profile.verified === "pending" ? "Pending Verification" : "Not Verified"} color={profile.verified === "approved" ? theme.success : profile.verified === "pending" ? theme.warning : theme.danger} bg={profile.verified === "approved" ? "rgba(31,214,160,0.1)" : profile.verified === "pending" ? "rgba(232,151,42,0.1)" : "rgba(240,82,82,0.1)"} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: theme.card, borderRadius: 10, padding: "18px", border: `1px solid ${theme.border}` }}>
          <label style={lbl}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inp, resize: "vertical" }} />
        </div>
        <div style={{ background: theme.card, borderRadius: 10, padding: "18px", border: `1px solid ${theme.border}` }}>
          <div style={{ marginBottom: 12 }}><label style={lbl}>Hourly Rate (BWP)</label><input value={rate} onChange={e => setRate(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Modules (comma separated)</label><input value={modules} onChange={e => setModules(e.target.value)} style={inp} /></div>
        </div>
        <div style={{ background: theme.card, borderRadius: 10, padding: "18px", border: `1px solid ${theme.border}`, gridColumn: "1/-1" }}>
          <label style={lbl}>Qualifications (comma separated)</label>
          <input value={qualifications} onChange={e => setQualifications(e.target.value)} style={inp} />
        </div>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={save} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Save Changes</button>
        {saved && <span style={{ color: theme.success, fontSize: 13, fontWeight: 600 }}>Saved successfully.</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ user, ...shared }: { user: User } & SharedProps) {
  const [tab, setTab] = useState("overview");
  const th = T.admin;
  const { tutors, setTutors, students, setStudents, bookings, reviews, setReviews, payments, onLogout } = shared;
  const pendingVerif = tutors.filter(t => t.verified === "pending").length;
  const navItems = [
    { id: "overview",     label: "Overview",     icon: Icon.grid },
    { id: "students",     label: "Students",     icon: Icon.users },
    { id: "tutors",       label: "Tutors",       icon: Icon.user },
    { id: "verification", label: "Verification", icon: Icon.shield, badge: pendingVerif },
    { id: "payments",     label: "Payments",     icon: Icon.card },
    { id: "reviews",      label: "Reviews",      icon: Icon.star },
    { id: "maintenance",  label: "Maintenance",  icon: Icon.settings },
  ];
  return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
      {tab === "overview"     && <AdminOverview tutors={tutors} students={students} bookings={bookings} reviews={reviews} payments={payments} theme={th} />}
      {tab === "students"     && <AdminStudents students={students} setStudents={setStudents} theme={th} />}
      {tab === "tutors"       && <AdminTutors tutors={tutors} setTutors={setTutors} theme={th} />}
      {tab === "verification" && <AdminVerification tutors={tutors} setTutors={setTutors} theme={th} />}
      {tab === "payments"     && <AdminPayments payments={payments} bookings={bookings} theme={th} />}
      {tab === "reviews"      && <AdminReviews reviews={reviews} setReviews={setReviews} theme={th} />}
      {tab === "maintenance"  && <AdminMaintenance theme={th} />}
    </Shell>
  );
}

function AdminOverview({ tutors, students, bookings, reviews, payments, theme }: { tutors: TutorProfile[]; students: StudentProfile[]; bookings: Booking[]; reviews: Review[]; payments: Payment[]; theme: AnyTheme }) {
  const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Platform Overview</h1>
        <p style={{ color: C.textSub, margin: 0, fontSize: 14 }}>Welcome back, Mark.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Students" value={students.length} icon={Icon.users} color={theme.accent} theme={theme} />
        <StatCard label="Tutors" value={tutors.length} icon={Icon.user} color={C.success} theme={theme} />
        <StatCard label="Bookings" value={bookings.length} icon={Icon.calendar} color={C.warning} theme={theme} />
        <StatCard label="Revenue" value={`P${totalRevenue}`} icon={Icon.money} color="#8B5CF6" theme={theme} />
        <StatCard label="Reviews" value={reviews.length} icon={Icon.star} color={C.warning} theme={theme} />
        <StatCard label="Avg. Rating" value={avgRating} icon={Icon.fileText} color={theme.accent} theme={theme} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <DashCard title="Recent Bookings" theme={theme}>
          {bookings.length === 0 ? <EmptyState icon={Icon.calendar} text="No bookings yet" /> : bookings.slice(-5).reverse().map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: C.text }}>{b.studentName} → {b.tutorName}</p><p style={{ margin: 0, fontSize: 11, color: C.textSub }}>{b.module} · {b.date}</p></div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </DashCard>
        <DashCard title="Platform Health" theme={theme}>
          {[["API Server",true],["Database",true],["Payment Gateway",true],["File Storage",true],["Email Service",true]].map(([name, ok]) => (
            <div key={String(name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: 13, color: C.textSub }}>{String(name)}</span>
              <Badge label={ok ? "Operational" : "Degraded"} color={ok ? C.success : C.danger} bg={ok ? "rgba(31,214,160,0.1)" : "rgba(240,82,82,0.1)"} />
            </div>
          ))}
        </DashCard>
      </div>
    </div>
  );
}

function AdminStudents({ students, setStudents, theme }: { students: StudentProfile[]; setStudents: React.Dispatch<React.SetStateAction<StudentProfile[]>>; theme: AnyTheme }) {
  const [search, setSearch] = useState("");
  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  const remove = async (id: string) => { if (window.confirm("Delete this student?")) { await supabase.from("profiles").delete().eq("id", id); setStudents(p => p.filter(s => s.id !== id)); } };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <PageHeader title="Students" sub={`${students.length} registered`} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "0 12px" }}>
          <span style={{ color: C.textMuted, display: "flex" }}>{Icon.search}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ border: "none", outline: "none", fontSize: 13, color: C.text, background: "transparent", fontFamily: F.body, padding: "9px 0" }} />
        </div>
      </div>
      <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr 1fr 70px", padding: "10px 16px", borderBottom: `1px solid ${theme.border}`, background: theme.accentLight }}>
          {["Name","University","Course","Year","Plan",""].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
        </div>
        {filtered.length === 0 ? <EmptyState icon={Icon.users} text="No students registered yet" /> : filtered.map(s => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr 1fr 70px", padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar initials={s.avatar} size={28} gradient={theme.gradient} /><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.name}</span></div>
            <span style={{ fontSize: 12, color: C.textSub }}>{s.university || "—"}</span>
            <span style={{ fontSize: 12, color: C.textSub }}>{s.course || "—"}</span>
            <span style={{ fontSize: 12, color: C.textSub }}>{s.year}</span>
            <Badge label={s.plan} color={s.plan === "premium" ? C.warning : theme.accent} bg={s.plan === "premium" ? "rgba(232,151,42,0.1)" : theme.accentLight} />
            <button onClick={() => remove(s.id)} style={{ background: "rgba(240,82,82,0.08)", color: C.danger, border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontFamily: F.body, display: "flex", alignItems: "center", gap: 3 }}>{Icon.trash}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTutors({ tutors, setTutors, theme }: { tutors: TutorProfile[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const [search, setSearch] = useState("");
  const filtered = tutors.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
  const remove = async (id: string) => { if (window.confirm("Delete this tutor?")) { await supabase.from("profiles").delete().eq("id", id); setTutors(p => p.filter(t => t.id !== id)); } };
  const suspend = async (id: string) => { const t = tutors.find(t => t.id === id); if (!t) return; const v = !t.available; await supabase.from("tutor_profiles").update({ available: v }).eq("id", id); setTutors(p => p.map(t => t.id === id ? { ...t, available: v } : t)); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <PageHeader title="Tutors" sub={`${tutors.length} registered`} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "0 12px" }}>
          <span style={{ color: C.textMuted, display: "flex" }}>{Icon.search}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ border: "none", outline: "none", fontSize: 13, color: C.text, background: "transparent", fontFamily: F.body, padding: "9px 0" }} />
        </div>
      </div>
      <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.8fr 100px", padding: "10px 16px", borderBottom: `1px solid ${theme.border}`, background: theme.accentLight }}>
          {["Name","University","Rate","Rating","Status","Verified",""].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
        </div>
        {filtered.length === 0 ? <EmptyState icon={Icon.user} text="No tutors registered yet" /> : filtered.map(t => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.8fr 100px", padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar initials={t.avatar} size={28} gradient={C.roles.tutor.grad} /><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</span></div>
            <span style={{ fontSize: 12, color: C.textSub }}>{t.university || "—"}</span>
            <span style={{ fontSize: 13, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>P{t.rate}/hr</span>
            <StarRow rating={t.rating} />
            <Badge label={t.available ? "Active" : "Paused"} color={t.available ? C.success : C.danger} bg={t.available ? "rgba(31,214,160,0.1)" : "rgba(240,82,82,0.1)"} />
            <Badge label={t.verified} color={t.verified === "approved" ? C.success : t.verified === "pending" ? C.warning : C.danger} bg={t.verified === "approved" ? "rgba(31,214,160,0.1)" : t.verified === "pending" ? "rgba(232,151,42,0.1)" : "rgba(240,82,82,0.1)"} />
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={() => suspend(t.id)} style={{ background: theme.accentLight, color: theme.accent, border: "none", borderRadius: 5, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontFamily: F.body }}>Toggle</button>
              <button onClick={() => remove(t.id)} style={{ background: "rgba(240,82,82,0.08)", color: C.danger, border: "none", borderRadius: 5, padding: "4px", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center" }}>{Icon.trash}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminVerification({ tutors, setTutors, theme }: { tutors: TutorProfile[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  // FIX: Write to DB first, THEN update local state — this persists across refreshes
  const approve = async (id: string) => {
    const { error } = await supabase.from("tutor_profiles").update({ verified: "approved" }).eq("id", id);
    if (!error) {
      setTutors(p => p.map(t => t.id === id ? { ...t, verified: "approved" as VerifStatus } : t));
      try { const tutor = tutors.find(t => t.id === id); if (tutor?.email) await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "tutor_verification", tutorEmail: tutor.email, tutorName: tutor.name, approved: true }) }); } catch {}
    }
  };
  const reject = async (id: string) => {
    const { error } = await supabase.from("tutor_profiles").update({ verified: "rejected" }).eq("id", id);
    if (!error) {
      setTutors(p => p.map(t => t.id === id ? { ...t, verified: "rejected" as VerifStatus } : t));
      try { const tutor = tutors.find(t => t.id === id); if (tutor?.email) await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "tutor_verification", tutorEmail: tutor.email, tutorName: tutor.name, approved: false }) }); } catch {}
    }
  };
  const pending = tutors.filter(t => t.verified === "pending");
  const reviewed = tutors.filter(t => t.verified !== "pending");
  return (
    <div>
      <PageHeader title="Tutor Verification" sub="Review and approve tutor applications" />
      <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>Pending ({pending.length})</p>
      {pending.length === 0 ? <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, marginBottom: 20 }}><EmptyState icon={Icon.check} text="No pending verifications — all caught up." /></div> : (
        <div style={{ marginBottom: 24 }}>
          {pending.map(t => (
            <div key={t.id} style={{ background: theme.card, borderRadius: 10, padding: "18px", border: `1px solid ${C.warning}33`, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                <Avatar initials={t.avatar} size={48} gradient={C.roles.tutor.grad} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: F.display, fontSize: 16, color: C.text, margin: "0 0 3px", fontWeight: 700 }}>{t.name}</h3>
                  <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 8px" }}>{t.university || "No university listed"} · P{t.rate}/hr</p>
                  {t.modules.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>{t.modules.map(s => <Pill key={s} label={s} color={theme.accent} bg={theme.accentLight} />)}</div>}
                  {t.qualifications.length > 0 && <p style={{ color: C.textSub, fontSize: 12, margin: "0 0 5px" }}>{t.qualifications.join(" · ")}</p>}
                  {t.bio && <p style={{ color: C.textSub, fontSize: 12, margin: 0, lineHeight: 1.55 }}>{t.bio}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => approve(t.id)} style={{ background: "rgba(31,214,160,0.1)", color: C.success, border: "1px solid rgba(31,214,160,0.2)", borderRadius: 7, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Approve</button>
                <button onClick={() => reject(t.id)} style={{ background: "rgba(240,82,82,0.08)", color: C.danger, border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {reviewed.length > 0 && (
        <>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>Reviewed ({reviewed.length})</p>
          {reviewed.map(t => (
            <div key={t.id} style={{ background: theme.card, borderRadius: 10, padding: "12px 16px", border: `1px solid ${theme.border}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar initials={t.avatar} size={32} gradient={C.roles.tutor.grad} />
                <div><p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</p><p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{t.university}</p></div>
              </div>
              <Badge label={t.verified} color={t.verified === "approved" ? C.success : C.danger} bg={t.verified === "approved" ? "rgba(31,214,160,0.1)" : "rgba(240,82,82,0.1)"} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function AdminPayments({ payments, bookings, theme }: { payments: Payment[]; bookings: Booking[]; theme: AnyTheme }) {
  const total = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <PageHeader title="Payments" sub="All platform transactions" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Revenue" value={`P${total}`} icon={Icon.money} color={C.success} theme={theme} />
        <StatCard label="Pending" value={`P${pending}`} icon={Icon.clock} color={C.warning} theme={theme} />
        <StatCard label="Transactions" value={payments.length} icon={Icon.card} color={theme.accent} theme={theme} />
        <StatCard label="Bookings" value={bookings.length} icon={Icon.calendar} color="#8B5CF6" theme={theme} />
      </div>
      <DashCard title="All Transactions" theme={theme}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "9px 0", borderBottom: `1px solid ${theme.border}`, marginBottom: 4 }}>
          {["Student","Tutor","Amount","Date","Status"].map(h => <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
        </div>
        {payments.length === 0 ? <EmptyState icon={Icon.card} text="No transactions yet" /> : payments.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "11px 0", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.text }}>{p.studentName}</span>
            <span style={{ fontSize: 13, color: C.text }}>{p.tutorName}</span>
            <span style={{ fontSize: 14, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>P{p.amount}</span>
            <span style={{ fontSize: 12, color: C.textSub }}>{p.date}</span>
            <PayBadge status={p.status} />
          </div>
        ))}
      </DashCard>
    </div>
  );
}

function AdminReviews({ reviews, setReviews, theme }: { reviews: Review[]; setReviews: React.Dispatch<React.SetStateAction<Review[]>>; theme: AnyTheme }) {
  const [filter, setFilter] = useState("all");
  const toggleFlag = async (id: number) => { const r = reviews.find(r => r.id === id); if (!r) return; await supabase.from("reviews").update({ flagged: !r.flagged }).eq("id", id); setReviews(p => p.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r)); };
  const toggleHide = async (id: number) => { const r = reviews.find(r => r.id === id); if (!r) return; await supabase.from("reviews").update({ hidden: !r.hidden }).eq("id", id); setReviews(p => p.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r)); };
  const del = async (id: number) => { if (window.confirm("Delete this review?")) { await supabase.from("reviews").delete().eq("id", id); setReviews(p => p.filter(r => r.id !== id)); } };
  const visible = reviews.filter(r => filter === "all" ? true : filter === "flagged" ? r.flagged : r.hidden);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  return (
    <div>
      <PageHeader title="Reviews" sub="Monitor and moderate all platform reviews" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Avg Rating" value={avg} icon={Icon.star} color={C.warning} theme={theme} />
        <StatCard label="Total" value={reviews.length} icon={Icon.fileText} color={theme.accent} theme={theme} />
        <StatCard label="Flagged" value={reviews.filter(r=>r.flagged).length} icon={Icon.flag} color={C.danger} theme={theme} />
        <StatCard label="Hidden" value={reviews.filter(r=>r.hidden).length} icon={Icon.eyeOff} color={C.textSub} theme={theme} />
      </div>
      <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontFamily: F.display, fontSize: 16, color: C.text, fontWeight: 700 }}>All Reviews</h3>
          <div style={{ display: "flex", gap: 4 }}>
            {["all","flagged","hidden"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: filter === f ? theme.accentLight : "transparent", color: filter === f ? theme.accent : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body, textTransform: "capitalize" }}>{f}</button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? <EmptyState icon={Icon.star} text="No reviews found" /> : visible.map(r => (
          <div key={r.id} style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}`, opacity: r.hidden ? 0.5 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.studentName}</span>
                  <span style={{ color: C.textMuted, fontSize: 12 }}>→</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: theme.accent }}>{r.tutorName}</span>
                  <StarRow rating={r.rating} />
                  <span style={{ color: C.textMuted, fontSize: 11 }}>{r.date}</span>
                  {r.flagged && <Badge label="Flagged" color={C.danger} bg="rgba(240,82,82,0.1)" />}
                  {r.hidden && <Badge label="Hidden" color={C.textMuted} bg="rgba(255,255,255,0.05)" />}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.55 }}>{r.comment}</p>
              </div>
              <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                <button onClick={() => toggleFlag(r.id)} style={{ background: r.flagged ? "rgba(240,82,82,0.08)" : theme.accentLight, color: r.flagged ? C.danger : theme.accent, border: "none", borderRadius: 6, padding: "4px 9px", fontSize: 11, cursor: "pointer", fontFamily: F.body, display: "flex", alignItems: "center" }}>{Icon.flag}</button>
                <button onClick={() => toggleHide(r.id)} style={{ background: "rgba(255,255,255,0.04)", color: C.textMuted, border: "none", borderRadius: 6, padding: "4px 9px", fontSize: 11, cursor: "pointer", fontFamily: F.body, display: "flex", alignItems: "center" }}>{r.hidden ? Icon.eye : Icon.eyeOff}</button>
                <button onClick={() => del(r.id)} style={{ background: "rgba(240,82,82,0.08)", color: C.danger, border: "none", borderRadius: 6, padding: "4px 9px", fontSize: 11, cursor: "pointer", fontFamily: F.body, display: "flex", alignItems: "center" }}>{Icon.trash}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMaintenance({ theme }: { theme: AnyTheme }) {
  const [settings, setSettings] = useState({ registration: true, payments: true, tutorMarket: true, emails: true, autoApprove: false, maintenance: false });
  const [msg, setMsg] = useState("");
  const action = (label: string) => { setMsg(`${label}…`); setTimeout(() => { setMsg(`${label} — done.`); setTimeout(() => setMsg(""), 3000); }, 1200); };
  const toggle = (k: keyof typeof settings) => setSettings(p => ({ ...p, [k]: !p[k] }));
  const items: { key: keyof typeof settings; label: string; desc: string; danger?: boolean }[] = [
    { key: "registration", label: "Student Registration",  desc: "Allow new students to sign up" },
    { key: "payments",     label: "Payment Processing",    desc: "Enable subscription payments" },
    { key: "tutorMarket",  label: "Tutor Marketplace",     desc: "Students can browse and book tutors" },
    { key: "emails",       label: "Email Notifications",   desc: "Send automated email alerts" },
    { key: "autoApprove",  label: "Auto-Approve Tutors",   desc: "Skip manual verification — not recommended" },
    { key: "maintenance",  label: "Maintenance Mode",      desc: "Redirect all users to a maintenance page", danger: true },
  ];
  return (
    <div>
      <PageHeader title="Maintenance" sub="Platform settings and system controls" />
      <div style={{ background: theme.card, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}` }}><h3 style={{ margin: 0, fontFamily: F.display, fontSize: 16, color: C.text, fontWeight: 700 }}>Feature Toggles</h3></div>
        {items.map(item => (
          <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${theme.border}` }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: item.danger && settings[item.key] ? C.danger : C.text }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: C.textSub }}>{item.desc}</p>
            </div>
            <Toggle value={settings[item.key]} onChange={() => toggle(item.key)} color={item.danger ? C.danger : C.success} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <DashCard title="Quick Actions" theme={theme}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {["Clear System Cache","Backup Database","Export Reports (CSV)","Send Test Email"].map(a => (
              <button key={a} onClick={() => action(a)} style={{ padding: "9px 14px", borderRadius: 7, border: `1px solid ${theme.border}`, background: "transparent", color: C.textSub, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left", transition: "background 0.12s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
                {a}
              </button>
            ))}
          </div>
          {msg && <p style={{ color: theme.success, fontSize: 12, margin: "10px 0 0" }}>{msg}</p>}
        </DashCard>
        <DashCard title="Danger Zone" theme={theme}>
          <p style={{ fontSize: 12, color: C.textSub, margin: "0 0 12px", lineHeight: 1.5 }}>These actions are permanent and cannot be undone.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => window.confirm("Purge all reviews?") && alert("Reviews purged.")} style={{ padding: "9px 14px", borderRadius: 7, border: "1px solid rgba(240,82,82,0.2)", background: "rgba(240,82,82,0.06)", color: C.danger, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}>Purge All Reviews</button>
            <button onClick={() => window.confirm("Reset the entire platform?") && alert("Platform reset.")} style={{ padding: "9px 14px", borderRadius: 7, border: "1px solid rgba(240,82,82,0.2)", background: "rgba(240,82,82,0.06)", color: C.danger, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}>Reset Platform Data</button>
          </div>
        </DashCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD + MATERIAL FORM
// ═══════════════════════════════════════════════════════════════════════════════
function FileUploadWidget({ user, theme, onUploaded }: { user: User; theme: AnyTheme; onUploaded: (url: string, name: string, pages: number) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    if (!file) return;
    const ok = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!ok.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) { setError("Only PDF and Word documents are allowed."); return; }
    if (file.size > 50 * 1024 * 1024) { setError("File must be under 50MB."); return; }
    setError(""); setUploading(true); setProgress(20);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      setProgress(50);
      const { data, error: upErr } = await supabase.storage.from("materials").upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      setProgress(90);
      const { data: urlData } = supabase.storage.from("materials").getPublicUrl(data.path);
      setProgress(100);
      onUploaded(urlData.publicUrl, file.name, Math.max(1, Math.round(file.size / 2048)));
    } catch (e: any) { setError(e.message || "Upload failed."); }
    finally { setUploading(false); setProgress(0); }
  };
  return (
    <div>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        style={{ border: `1.5px dashed ${dragging ? theme.accent : C.border}`, borderRadius: 10, padding: "24px 20px", textAlign: "center", cursor: "pointer", background: dragging ? theme.accentLight : "transparent", transition: "all 0.15s" }}>
        {uploading ? (
          <div>
            <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 10px" }}>Uploading… {progress}%</p>
            <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${progress}%`, height: "100%", background: theme.gradient, transition: "width 0.3s" }} /></div>
          </div>
        ) : (
          <div>
            <div style={{ color: theme.accent, display: "flex", justifyContent: "center", marginBottom: 8 }}>{Icon.upload}</div>
            <p style={{ color: C.text, fontSize: 13, fontWeight: 600, margin: "0 0 3px" }}>Drag & drop or <span style={{ color: theme.accent }}>click to upload</span></p>
            <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>PDF or Word · Max 50MB</p>
          </div>
        )}
      </div>
      {error && <p style={{ color: C.danger, fontSize: 12, margin: "6px 0 0" }}>{error}</p>}
    </div>
  );
}

function MaterialUploadForm({ user, theme, onClose }: { user: User; theme: AnyTheme; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Notes"|"Exam Paper"|"Summary"|"Textbook">("Notes");
  const [module, setModule] = useState("");
  const [university, setUniversity] = useState("");
  const [field, setField] = useState("");
  const [yearLevel, setYearLevel] = useState("1st Year");
  const [premium, setPremium] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" };
  const submit = async () => {
    if (!title || !module || !university || !field || !fileUrl) { setErr("Please fill all fields and upload a file."); return; }
    setSubmitting(true); setErr("");
    try { await supabase.from("materials").insert({ title, type, module, university, field, year_level: yearLevel, pages, premium, file_url: fileUrl, uploaded_by: user.id }); setDone(true); }
    catch (e: any) { setErr(e.message); }
    finally { setSubmitting(false); }
  };
  if (done) return (
    <div style={{ background: theme.card, borderRadius: 10, padding: "28px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
      <div style={{ color: theme.success, display: "flex", justifyContent: "center", marginBottom: 12 }}>{Icon.check}</div>
      <h3 style={{ fontFamily: F.display, fontSize: 18, color: C.text, margin: "0 0 6px" }}>Material Uploaded</h3>
      <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 18px" }}>Your material is now visible to students.</p>
      <button onClick={onClose} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Done</button>
    </div>
  );
  return (
    <div style={{ background: theme.card, borderRadius: 10, padding: "22px", border: `1px solid ${theme.accent}2A` }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><label style={lbl}>Document Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Java Week 1 Notes" style={inp} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Type</label><select value={type} onChange={e => setType(e.target.value as any)} style={inp}>{["Notes","Exam Paper","Summary","Textbook"].map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label style={lbl}>Year Level</label><select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={inp}>{["1st Year","2nd Year","3rd Year","4th Year","Postgraduate"].map(y => <option key={y}>{y}</option>)}</select></div>
        </div>
        <div><label style={lbl}>Module</label><input value={module} onChange={e => setModule(e.target.value)} placeholder="e.g. Introduction to Java" style={inp} /></div>
        <div><label style={lbl}>University</label><input value={university} onChange={e => setUniversity(e.target.value)} placeholder="e.g. Botswana Accountancy College" style={inp} /></div>
        <div><label style={lbl}>Field of Study</label><input value={field} onChange={e => setField(e.target.value)} placeholder="e.g. Software Engineering & IT" style={inp} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Toggle value={premium} onChange={() => setPremium(!premium)} color={theme.accent} />
          <span style={{ fontSize: 13, color: C.textSub }}>Mark as Premium (requires subscription)</span>
        </div>
        <div>
          <label style={lbl}>Upload File</label>
          {fileUrl ? (
            <div style={{ background: "rgba(31,214,160,0.07)", border: "1px solid rgba(31,214,160,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: theme.success, fontWeight: 600 }}>{fileName}</p>
              <button onClick={() => { setFileUrl(""); setFileName(""); }} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 12 }}>Remove</button>
            </div>
          ) : <FileUploadWidget user={user} theme={theme} onUploaded={(url, name, pg) => { setFileUrl(url); setFileName(name); setPages(pg); }} />}
        </div>
        {err && <p style={{ color: C.danger, fontSize: 13, margin: 0 }}>{err}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit} disabled={submitting} style={{ background: submitting ? "rgba(255,255,255,0.06)" : theme.gradient, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: F.body }}>{submitting ? "Uploading…" : "Submit Material"}</button>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.textSub, borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer", fontFamily: F.body }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ReferralWidget({ referralCode, theme }: { referralCode: string; theme: AnyTheme }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}?ref=${referralCode}` : `https://kitsolink.vercel.app?ref=${referralCode}`;
  const copy = () => { navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <div style={{ background: theme.card, borderRadius: 10, padding: "22px", border: `1px solid ${theme.border}` }}>
      <h3 style={{ fontFamily: F.display, fontSize: 18, color: C.text, margin: "0 0 6px", fontWeight: 700 }}>Refer a Friend</h3>
      <p style={{ color: C.textSub, fontSize: 13, margin: "0 0 18px", lineHeight: 1.6 }}>Share your link. When a friend signs up, you both get <strong style={{ color: C.text }}>7 free days of Premium</strong>.</p>
      <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 12, color: C.textSub, fontFamily: F.mono, wordBreak: "break-all" }}>{link}</p>
        <button onClick={copy} style={{ background: copied ? "rgba(31,214,160,0.1)" : theme.gradient, color: copied ? theme.success : "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F.body, flexShrink: 0 }}>{copied ? "Copied" : "Copy Link"}</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Badge label={`Code: ${referralCode}`} color={theme.accent} bg={theme.accentLight} />
        <Badge label="7 days Premium per referral" color="#7BAAF7" bg="rgba(75,130,247,0.1)" />
      </div>
    </div>
  );
}