"use client";
import React, { useState, useEffect, useRef } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
);

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Role = "admin" | "student" | "tutor";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type VerifStatus = "pending" | "approved" | "rejected";

interface User { id: number; name: string; email: string; role: Role; avatar: string; }
interface TutorProfile {
  id: number; userId: number; name: string; avatar: string; university: string;
  subjects: string[]; qualifications: string[]; bio: string; rate: number;
  available: boolean; rating: number; reviewCount: number; verified: VerifStatus;
  earnings: number; joined: string;
}
interface StudentProfile {
  id: number; userId: number; name: string; avatar: string; university: string;
  course: string; year: string; joined: string; plan: "free" | "premium";
}
interface Booking {
  id: number; studentId: number; tutorId: number; studentName: string; tutorName: string;
  subject: string; date: string; time: string; status: BookingStatus;
  note: string; amount: number; createdAt: string;
}
interface Message {
  id: number; senderId: number; receiverId: number; senderName: string;
  text: string; timestamp: string; read: boolean;
}
interface Review {
  id: number; studentId: number; tutorId: number; studentName: string;
  tutorName: string; rating: number; comment: string; date: string; flagged: boolean; hidden: boolean;
}
interface Payment {
  id: number; studentId: number; tutorId: number; bookingId: number;
  studentName: string; tutorName: string; amount: number; status: "completed" | "pending" | "refunded";
  date: string; method: string;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  // Student theme: warm cream + deep teal
  student: {
    bg: "#FAFAF7", sidebar: "#1A2E2A", card: "#FFFFFF", border: "#E8EAE3",
    accent: "#2D6A4F", accentLight: "#D8F3DC", text: "#1A1A18", textSub: "#6B7280",
    textMuted: "#9CA3AF", success: "#059669", danger: "#DC2626", warning: "#D97706",
    gradient: "linear-gradient(135deg,#2D6A4F,#52B788)",
  },
  // Tutor theme: dark navy + gold
  tutor: {
    bg: "#0D0F1A", sidebar: "#080910", card: "#13162A", border: "rgba(255,255,255,0.08)",
    accent: "#F4A228", accentLight: "rgba(244,162,40,0.12)", text: "#F0F2FF", textSub: "#8892B0",
    textMuted: "#4A5568", success: "#43D9AD", danger: "#FF6B6B", warning: "#F4A228",
    gradient: "linear-gradient(135deg,#F4A228,#E07B00)",
  },
  // Admin theme: slate + electric blue
  admin: {
    bg: "#F1F5F9", sidebar: "#0F172A", card: "#FFFFFF", border: "#E2E8F0",
    accent: "#3B82F6", accentLight: "#EFF6FF", text: "#0F172A", textSub: "#475569",
    textMuted: "#94A3B8", success: "#10B981", danger: "#EF4444", warning: "#F59E0B",
    gradient: "linear-gradient(135deg,#3B82F6,#6366F1)",
  },
};

const F = { display: "'Fraunces',serif", body: "'DM Sans',sans-serif", mono: "'JetBrains Mono',monospace" };

// ─── SHARED UTILITIES ────────────────────────────────────────────────────────
const Avatar = ({ initials, size = 40, gradient = "linear-gradient(135deg,#2D6A4F,#52B788)" }: { initials: string; size?: number; gradient?: string }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.35, fontWeight: 700, fontFamily: F.body, flexShrink: 0 }}>{initials}</div>
);

const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, fontFamily: F.body, whiteSpace: "nowrap" }}>{label}</span>
);

const StarRow = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <span style={{ color: "#F59E0B", fontSize: size }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    <span style={{ color: "#94A3B8", marginLeft: 4, fontFamily: F.body, fontSize: size - 1 }}>{rating.toFixed(1)}</span>
  </span>
);

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)} onClick={() => onChange(n)}
          style={{ fontSize: 28, cursor: "pointer", color: n <= (hov || value) ? "#F59E0B" : "#E2E8F0", transition: "color .1s" }}>★</span>
      ))}
    </div>
  );
};

// ─── INITIAL STATE (empty — admin adds users, tutors register, students sign up) ─
const ADMIN_USER: User = { id: 0, name: "Mark", email: "mark@noteflow.bw", role: "admin", avatar: "MK" };

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<"landing" | "login" | "dashboard">("landing");
  const [loginRole, setLoginRole] = useState<Role>("student");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Global state
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const handleLogin = (user: User) => { setCurrentUser(user); setScreen("dashboard"); };
  const handleLogout = () => { setCurrentUser(null); setScreen("landing"); };

  if (screen === "landing") return (
    <>
      <FontLink />
      <LandingPage onChooseRole={(role) => { setLoginRole(role); setScreen("login"); }} />
    </>
  );

  if (screen === "login") return (
    <>
      <FontLink />
      <LoginPage role={loginRole} onLogin={handleLogin} onBack={() => setScreen("landing")}
        tutors={tutors} students={students} setTutors={setTutors} setStudents={setStudents} />
    </>
  );

  if (!currentUser) return null;

  const sharedProps = { tutors, setTutors, students, setStudents, bookings, setBookings, messages, setMessages, reviews, setReviews, payments, setPayments, onLogout: handleLogout };

  return (
    <>
      <FontLink />
      {currentUser.role === "student" && <StudentDashboard user={currentUser} {...sharedProps} />}
      {currentUser.role === "tutor"   && <TutorDashboard   user={currentUser} {...sharedProps} />}
      {currentUser.role === "admin"   && <AdminDashboard   user={currentUser} {...sharedProps} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onChooseRole }: { onChooseRole: (r: Role) => void }) {
  const roles: { role: Role; icon: string; title: string; desc: string; gradient: string }[] = [
    { role: "student",  icon: "🎓", title: "Student",       desc: "Browse tutors, book sessions & track your learning journey.", gradient: "linear-gradient(135deg,#2D6A4F,#52B788)" },
    { role: "tutor",    icon: "👨‍🏫", title: "Tutor",         desc: "Manage bookings, earn money & grow your student base.",       gradient: "linear-gradient(135deg,#F4A228,#E07B00)" },
    { role: "admin",    icon: "🛡️",  title: "Administrator",  desc: "Monitor the platform, verify tutors & manage accounts.",      gradient: "linear-gradient(135deg,#3B82F6,#6366F1)" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#0D0F1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: F.body, position: "relative", overflow: "hidden" }}>
      {/* bg decoration */}
      <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,106,79,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", marginBottom: 56, position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#2D6A4F,#52B788)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📚</div>
          <span style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: "#F0F2FF", letterSpacing: "-0.02em" }}>NoteFlow</span>
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: "#F0F2FF", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Connecting Botswana's<br /><span style={{ color: "#52B788" }}>Students & Tutors</span>
        </h1>
        <p style={{ color: "#8892B0", fontSize: 18, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>Choose your role to enter your personalised dashboard</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, width: "100%", maxWidth: 900 }}>
        {roles.map(r => (
          <RoleCard key={r.role} {...r} onClick={() => onChooseRole(r.role)} />
        ))}
      </div>
      <p style={{ color: "#4A5568", fontSize: 13, marginTop: 40 }}>🇧🇼 Built for Botswana · NoteFlow 2024</p>
    </div>
  );
}

function RoleCard({ icon, title, desc, gradient, onClick }: { icon: string; title: string; desc: string; gradient: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ background: hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)", border: hov ? "1.5px solid rgba(255,255,255,0.15)" : "1.5px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 28px", cursor: "pointer", transition: "all 0.25s", transform: hov ? "translateY(-6px)" : "none", boxShadow: hov ? "0 24px 48px rgba(0,0,0,0.4)" : "none" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>{icon}</div>
      <h3 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: "#F0F2FF", margin: "0 0 10px" }}>{title}</h3>
      <p style={{ color: "#8892B0", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>{desc}</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: gradient, padding: "10px 20px", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600 }}>
        Enter as {title} →
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({ role, onLogin, onBack, tutors, students, setTutors, setStudents }: {
  role: Role; onLogin: (u: User) => void; onBack: () => void;
  tutors: TutorProfile[]; students: StudentProfile[];
  setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>;
  setStudents: React.Dispatch<React.SetStateAction<StudentProfile[]>>;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("1st Year");
  const [subjects, setSubjects] = useState("");
  const [rate, setRate] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [err, setErr] = useState("");

  const themeColor = role === "student" ? "#2D6A4F" : role === "tutor" ? "#F4A228" : "#3B82F6";
  const roleIcon = role === "student" ? "🎓" : role === "tutor" ? "👨‍🏫" : "🛡️";

  const handleSubmit = () => {
    setErr("");
    if (role === "admin") {
      if (email.toLowerCase() === "mark" && password === "mark12345") {
        onLogin(ADMIN_USER);
      } else { setErr("Invalid admin credentials."); }
      return;
    }
    if (mode === "login") {
      // find existing user
      if (role === "student") {
        const s = students.find(s => s.name.toLowerCase() === email.toLowerCase());
        if (!s) { setErr("Account not found. Please register first."); return; }
        onLogin({ id: s.userId, name: s.name, email: s.name + "@student.bw", role: "student", avatar: s.avatar });
      } else {
        const t = tutors.find(t => t.name.toLowerCase() === email.toLowerCase());
        if (!t) { setErr("Account not found. Please register first."); return; }
        onLogin({ id: t.userId, name: t.name, email: t.name + "@tutor.bw", role: "tutor", avatar: t.avatar });
      }
    } else {
      // register
      if (!name || !email || !password) { setErr("Please fill all required fields."); return; }
      const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      if (role === "student") {
        const newId = Date.now();
        const sp: StudentProfile = { id: newId, userId: newId, name, avatar: initials, university, course, year, joined: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }), plan: "free" };
        setStudents(p => [...p, sp]);
        onLogin({ id: newId, name, email, role: "student", avatar: initials });
      } else {
        const newId = Date.now();
        const tp: TutorProfile = { id: newId, userId: newId, name, avatar: initials, university, subjects: subjects.split(",").map(s => s.trim()).filter(Boolean), qualifications: qualifications.split(",").map(q => q.trim()).filter(Boolean), bio, rate: parseFloat(rate) || 80, available: true, rating: 0, reviewCount: 0, verified: "pending", earnings: 0, joined: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }) };
        setTutors(p => [...p, tp]);
        onLogin({ id: newId, name, email, role: "tutor", avatar: initials });
      }
    }
  };

  const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #2A2D3E", background: "#0D0F1A", color: "#F0F2FF", fontSize: 14, fontFamily: F.body, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "#8892B0", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: F.body };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0F1A", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#13162A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "44px 40px", width: "100%", maxWidth: 480, position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "#8892B0", cursor: "pointer", fontSize: 13, fontFamily: F.body }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `${themeColor}22`, border: `1.5px solid ${themeColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 14px" }}>{roleIcon}</div>
          <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: "#F0F2FF", margin: "0 0 6px" }}>
            {role === "admin" ? "Admin Login" : mode === "login" ? `${role.charAt(0).toUpperCase()+role.slice(1)} Login` : `Register as ${role.charAt(0).toUpperCase()+role.slice(1)}`}
          </h2>
          {role !== "admin" && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
              {(["login","register"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ padding: "6px 18px", borderRadius: 20, border: "none", background: mode === m ? themeColor : "transparent", color: mode === m ? "#fff" : "#8892B0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>{m === "login" ? "Sign In" : "Register"}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {role === "admin" ? (
            <>
              <div><label style={lbl}>Username</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="mark" style={inp} /></div>
              <div><label style={lbl}>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} /></div>
              <div style={{ background: `${themeColor}22`, border: `1px solid ${themeColor}44`, borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ color: themeColor, fontSize: 12, margin: 0, fontFamily: F.mono }}>Demo: mark / mark12345</p>
              </div>
            </>
          ) : mode === "login" ? (
            <div><label style={lbl}>Your Name (used as login)</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your full name" style={inp} /></div>
          ) : (
            <>
              <div><label style={lbl}>Full Name *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Thabang Molefe" style={inp} /></div>
              <div><label style={lbl}>Email *</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={inp} /></div>
              <div><label style={lbl}>Password *</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp} /></div>
              <div><label style={lbl}>University / College</label><input value={university} onChange={e=>setUniversity(e.target.value)} placeholder="e.g. University of Botswana" style={inp} /></div>
              {role === "student" && (
                <>
                  <div><label style={lbl}>Course</label><input value={course} onChange={e=>setCourse(e.target.value)} placeholder="e.g. Computer Science" style={inp} /></div>
                  <div><label style={lbl}>Year of Study</label>
                    <select value={year} onChange={e=>setYear(e.target.value)} style={{ ...inp }}>
                      {["1st Year","2nd Year","3rd Year","4th Year","Postgraduate"].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </>
              )}
              {role === "tutor" && (
                <>
                  <div><label style={lbl}>Subjects (comma separated)</label><input value={subjects} onChange={e=>setSubjects(e.target.value)} placeholder="e.g. Data Structures, Algorithms" style={inp} /></div>
                  <div><label style={lbl}>Qualifications (comma separated)</label><input value={qualifications} onChange={e=>setQualifications(e.target.value)} placeholder="e.g. BSc Computer Science, Dean's List" style={inp} /></div>
                  <div><label style={lbl}>Hourly Rate (BWP)</label><input value={rate} onChange={e=>setRate(e.target.value)} placeholder="e.g. 80" style={inp} /></div>
                  <div><label style={lbl}>Bio</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} placeholder="Tell students about yourself..." style={{ ...inp, resize: "vertical" }} /></div>
                </>
              )}
            </>
          )}
          {err && <div style={{ background: "#FF6B6B22", border: "1px solid #FF6B6B44", borderRadius: 10, padding: "10px 14px" }}><p style={{ color: "#FF6B6B", fontSize: 13, margin: 0, fontFamily: F.body }}>⚠️ {err}</p></div>}
          <button onClick={handleSubmit} style={{ background: `linear-gradient(135deg,${themeColor},${themeColor}cc)`, color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.body, marginTop: 4 }}>
            {role === "admin" ? "Sign In to Admin Panel →" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED DASHBOARD SHELL
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

type AnyTheme = typeof T.student | typeof T.tutor | typeof T.admin;
function Shell({ navItems, activeTab, setActiveTab, user, theme, headerRight, children }: {
  navItems: { id: string; label: string; icon: string; badge?: number }[];
  activeTab: string; setActiveTab: (t: string) => void;
  user: User; theme: AnyTheme; headerRight?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: F.body }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: theme.sidebar, display: "flex", flexDirection: "column", padding: "24px 14px", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <div style={{ padding: "0 10px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📚</div>
            <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 900, color: "#F0F2FF" }}>NoteFlow</span>
          </div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active ? theme.accentLight : "transparent", color: active ? theme.accent : "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: F.body, fontWeight: active ? 600 : 400, transition: "all 0.15s", textAlign: "left", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
                </div>
                {item.badge != null && item.badge > 0 && <span style={{ background: theme.danger, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, fontFamily: F.mono }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 10 }}>
            <Avatar initials={user.avatar} size={34} gradient={theme.gradient} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#F0F2FF", fontFamily: F.body, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: F.body, textTransform: "capitalize" }}>{user.role}</p>
            </div>
          </div>
          <button onClick={() => {}} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}>
            ← Sign Out
          </button>
        </div>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: "36px 32px 60px" }}>
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
  const unreadMsgs = myMessages.filter(m => !m.read).length;
  const pendingBookings = myBookings.filter(b => b.status === "pending").length;

  const navItems = [
    { id: "home",     label: "Overview",       icon: "◈" },
    { id: "tutors",   label: "Find Tutors",     icon: "👨‍🏫" },
    { id: "bookings", label: "My Bookings",     icon: "📅", badge: pendingBookings },
    { id: "messages", label: "Messages",        icon: "💬", badge: unreadMsgs },
    { id: "payments", label: "Payments",        icon: "💳" },
    { id: "reviews",  label: "My Reviews",      icon: "⭐" },
  ];

  return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th}>
      {tab === "home"     && <StudentHome     user={user} bookings={myBookings} tutors={tutors} messages={myMessages} theme={th} />}
      {tab === "tutors"   && <StudentTutors   user={user} tutors={tutors} bookings={bookings} setBookings={setBookings} setPayments={setPayments} reviews={reviews} theme={th} />}
      {tab === "bookings" && <StudentBookings user={user} bookings={myBookings} setBookings={setBookings} theme={th} />}
      {tab === "messages" && <StudentMessages user={user} messages={messages} setMessages={setMessages} tutors={tutors} theme={th} />}
      {tab === "payments" && <StudentPayments user={user} payments={payments.filter(p => p.studentId === user.id)} theme={th} />}
      {tab === "reviews"  && <StudentReviews  user={user} reviews={reviews.filter(r => r.studentId === user.id)} tutors={tutors} setReviews={setReviews} bookings={myBookings} theme={th} />}
    </Shell>
  );
}

function StudentHome({ user, bookings, tutors, messages, theme }: { user: User; bookings: Booking[]; tutors: TutorProfile[]; messages: Message[]; theme: AnyTheme }) {
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const completed = bookings.filter(b => b.status === "completed").length;
  const unread = messages.filter(m => m.receiverId === user.id && !m.read).length;
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: theme.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p style={{ color: theme.textSub, fontSize: 15, margin: 0 }}>Here's your learning overview for today</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Active Bookings", value: confirmed, icon: "📅", color: theme.accent },
          { label: "Sessions Done", value: completed, icon: "✅", color: theme.success },
          { label: "Unread Messages", value: unread, icon: "💬", color: theme.warning },
          { label: "Available Tutors", value: tutors.filter(t => t.available && t.verified === "approved").length, icon: "👨‍🏫", color: "#6366F1" },
        ].map(s => (
          <div key={s.label} style={{ background: theme.card, borderRadius: 16, padding: "22px 20px", border: `1px solid ${theme.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 16px" }}>Recent Bookings</h3>
          {bookings.length === 0 ? <EmptyState icon="📅" text="No bookings yet — find a tutor to get started!" /> : bookings.slice(0, 4).map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.tutorName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.subject} · {b.date}</p></div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 16px" }}>Top Rated Tutors</h3>
          {tutors.filter(t => t.verified === "approved").slice(0, 4).map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <Avatar initials={t.avatar} size={36} gradient={theme.gradient} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{t.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{t.subjects.slice(0, 2).join(", ")}</p>
              </div>
              <StarRow rating={t.rating || 0} />
            </div>
          ))}
          {tutors.filter(t => t.verified === "approved").length === 0 && <EmptyState icon="👨‍🏫" text="No approved tutors yet" />}
        </div>
      </div>
    </div>
  );
}

function StudentTutors({ user, tutors, bookings, setBookings, setPayments, reviews, theme }: { user: User; tutors: TutorProfile[]; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; setPayments: React.Dispatch<React.SetStateAction<Payment[]>>; reviews: Review[]; theme: AnyTheme }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TutorProfile | null>(null);
  const [bookModal, setBookModal] = useState(false);
  const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [subject, setSubject] = useState(""); const [note, setNote] = useState("");
  const [booked, setBooked] = useState(false);

  const approved = tutors.filter(t => t.verified === "approved");
  const filtered = approved.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase())));
  const tutorReviews = selected ? reviews.filter(r => r.tutorId === selected.id) : [];

  const doBook = () => {
    if (!selected || !date || !time || !subject) { alert("Please fill all fields."); return; }
    const nb: Booking = { id: Date.now(), studentId: user.id, tutorId: selected.id, studentName: user.name, tutorName: selected.name, subject, date, time, status: "pending", note, amount: selected.rate, createdAt: new Date().toISOString() };
    setBookings(p => [...p, nb]);
    setPayments(p => [...p, { id: Date.now()+1, studentId: user.id, tutorId: selected.id, bookingId: nb.id, studentName: user.name, tutorName: selected.name, amount: selected.rate, status: "pending", date: new Date().toLocaleDateString("en-GB"), method: "Card" }]);
    setBooked(true);
  };

  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none", boxSizing: "border-box" };

  if (selected) return (
    <div>
      <button onClick={() => { setSelected(null); setBooked(false); setBookModal(false); }} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontSize: 14, fontFamily: F.body, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back to Tutors</button>
      <div style={{ background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ background: theme.gradient, padding: "32px 28px", display: "flex", gap: 20, alignItems: "center" }}>
          <Avatar initials={selected.avatar} size={72} gradient="rgba(255,255,255,0.2)" />
          <div>
            <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>{selected.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 8px" }}>🎓 {selected.university}</p>
            <StarRow rating={selected.rating} size={15} />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginLeft: 8 }}>({selected.reviewCount} reviews)</span>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>P{selected.rate}/hr</p>
            <span style={{ background: selected.available ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>{selected.available ? "✅ Available" : "❌ Busy"}</span>
          </div>
        </div>
        <div style={{ padding: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div><h4 style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>Subjects</h4>{selected.subjects.map(s => <span key={s} style={{ display: "inline-block", background: theme.accentLight, color: theme.accent, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, marginRight: 6, marginBottom: 6 }}>{s}</span>)}</div>
            <div><h4 style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>Qualifications</h4>{selected.qualifications.map(q => <p key={q} style={{ margin: "0 0 4px", fontSize: 13, color: theme.text }}>🎓 {q}</p>)}</div>
            <div><h4 style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>About</h4><p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.6 }}>{selected.bio || "No bio provided."}</p></div>
          </div>
          {!booked ? (
            <>
              {!bookModal ? (
                <button onClick={() => setBookModal(true)} disabled={!selected.available} style={{ background: selected.available ? theme.gradient : "#e2e8f0", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: selected.available ? "pointer" : "not-allowed", fontFamily: F.body }}>📅 Book a Session</button>
              ) : (
                <div style={{ background: theme.bg, border: `1.5px solid ${theme.accent}`, borderRadius: 16, padding: 24 }}>
                  <h4 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 18px" }}>Book a Session with {selected.name}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></div>
                    <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} /></div>
                  </div>
                  <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Subject</label><input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Binary Trees, SQL Joins" style={inp} /></div>
                  <div style={{ marginBottom: 18 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Notes (optional)</label><textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} /></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={doBook} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Confirm & Pay P{selected.rate}</button>
                    <button onClick={() => setBookModal(false)} style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textSub, borderRadius: 10, padding: "11px 20px", fontSize: 14, cursor: "pointer", fontFamily: F.body }}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: "#D8F3DC", borderRadius: 14, padding: "20px 24px" }}>
              <p style={{ color: "#2D6A4F", fontWeight: 700, margin: "0 0 4px", fontSize: 15 }}>✅ Booking Requested!</p>
              <p style={{ color: "#2D6A4F", margin: 0, fontSize: 13 }}>Your session request has been sent to {selected.name}. They will confirm shortly.</p>
            </div>
          )}
        </div>
      </div>
      {/* Reviews */}
      <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
        <h3 style={{ fontFamily: F.display, fontSize: 20, color: theme.text, margin: "0 0 20px" }}>Student Reviews</h3>
        {tutorReviews.length === 0 ? <EmptyState icon="⭐" text="No reviews yet for this tutor" /> : tutorReviews.map(r => (
          <div key={r.id} style={{ padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={r.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={32} />
                <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{r.studentName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><StarRow rating={r.rating} /><span style={{ color: theme.textMuted, fontSize: 12 }}>{r.date}</span></div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.6 }}>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Find a Tutor" sub={`${filtered.length} approved tutors available`} theme={th} />
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "0 16px", display: "flex", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 16, marginRight: 8 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or subject..." style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: theme.text, background: "transparent", fontFamily: F.body, padding: "13px 0" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
        {filtered.length === 0 ? <div style={{ gridColumn: "1/-1" }}><EmptyState icon="👨‍🏫" text="No approved tutors match your search" /></div> : filtered.map(t => (
          <TutorCard key={t.id} tutor={t} theme={theme} onClick={() => setSelected(t)} reviews={reviews.filter(r => r.tutorId === t.id)} />
        ))}
      </div>
    </div>
  );
}

function TutorCard({ tutor, theme, onClick, reviews }: { tutor: TutorProfile; theme: AnyTheme; onClick: () => void; reviews: Review[] }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ background: theme.card, borderRadius: 16, padding: 24, border: hov ? `1.5px solid ${theme.accent}` : `1.5px solid ${theme.border}`, cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? `0 8px 24px ${theme.accent}18` : "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
        <Avatar initials={tutor.avatar} size={52} gradient={theme.gradient} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: F.display, fontSize: 17, color: theme.text, margin: "0 0 2px" }}>{tutor.name}</h3>
          <p style={{ color: theme.textSub, fontSize: 12, margin: "0 0 6px" }}>🎓 {tutor.university}</p>
          <StarRow rating={tutor.rating} /><span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 4 }}>({reviews.length})</span>
        </div>
        <span style={{ background: tutor.available ? "#D8F3DC" : "#FEE2E2", color: tutor.available ? "#2D6A4F" : "#DC2626", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>{tutor.available ? "Available" : "Busy"}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {tutor.subjects.slice(0, 3).map(s => <span key={s} style={{ background: theme.accentLight, color: theme.accent, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{s}</span>)}
        {tutor.subjects.length > 3 && <span style={{ background: theme.border, color: theme.textMuted, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>+{tutor.subjects.length - 3}</span>}
      </div>
      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.4 }}>{tutor.bio?.slice(0, 60)}...</p>
        <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: theme.accent, flexShrink: 0, marginLeft: 8 }}>P{tutor.rate}/hr</span>
      </div>
    </div>
  );
}

function StudentBookings({ user, bookings, setBookings, theme }: { user: User; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; theme: AnyTheme }) {
  const cancel = (id: number) => setBookings(p => p.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  return (
    <div>
      <PageHeader title="My Bookings" sub={`${bookings.length} total bookings`} theme={th} />
      {bookings.length === 0 ? <EmptyState icon="📅" text="No bookings yet — find a tutor and book your first session!" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {bookings.map(b => (
            <div key={b.id} style={{ background: theme.card, borderRadius: 16, padding: 20, border: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Avatar initials={b.tutorName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={44} gradient={theme.gradient} />
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: theme.text }}>{b.tutorName}</p>
                  <p style={{ margin: "0 0 2px", fontSize: 13, color: theme.textSub }}>{b.subject}</p>
                  <p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}>📅 {b.date} at {b.time}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p style={{ margin: 0, fontFamily: F.mono, fontSize: 16, fontWeight: 700, color: theme.accent }}>P{b.amount}</p>
                <StatusBadge status={b.status} />
                {b.status === "pending" && <button onClick={() => cancel(b.id)} style={{ background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentMessages({ user, messages, setMessages, tutors, theme }: { user: User; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>; tutors: TutorProfile[]; theme: AnyTheme }) {
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const conversations = tutors.map(t => {
    const msgs = messages.filter(m => (m.senderId === user.id && m.receiverId === t.userId) || (m.senderId === t.userId && m.receiverId === user.id));
    return { tutor: t, msgs, lastMsg: msgs[msgs.length - 1], unread: msgs.filter(m => m.receiverId === user.id && !m.read).length };
  }).filter(c => c.msgs.length > 0 || activeConv === c.tutor.userId);

  const activeTutor = tutors.find(t => t.userId === activeConv);
  const convMsgs = activeConv ? messages.filter(m => (m.senderId === user.id && m.receiverId === activeConv) || (m.senderId === activeConv && m.receiverId === user.id)) : [];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convMsgs.length]);

  const sendMsg = () => {
    if (!newMsg.trim() || !activeConv) return;
    setMessages(p => [...p, { id: Date.now(), senderId: user.id, receiverId: activeConv, senderName: user.name, text: newMsg, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), read: false }]);
    setNewMsg("");
  };

  return (
    <div>
      <PageHeader title="Messages" sub="Chat with your tutors" theme={th} />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, height: 600 }}>
        {/* Sidebar */}
        <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}` }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conversations</p>
          </div>
          <div style={{ padding: 12 }}>
            {tutors.filter(t => t.verified === "approved").map(t => (
              <div key={t.id} onClick={() => { setActiveConv(t.userId); setMessages(p => p.map(m => m.receiverId === user.id && m.senderId === t.userId ? { ...m, read: true } : m)); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: activeConv === t.userId ? theme.accentLight : "transparent", marginBottom: 4 }}>
                <Avatar initials={t.avatar} size={36} gradient={theme.gradient} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: theme.textMuted }}>{t.subjects[0]}</p>
                </div>
              </div>
            ))}
            {tutors.filter(t => t.verified === "approved").length === 0 && <EmptyState icon="💬" text="No approved tutors to message" />}
          </div>
        </div>
        {/* Chat area */}
        <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EmptyState icon="💬" text="Select a tutor to start messaging" />
            </div>
          ) : (
            <>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={activeTutor?.avatar || "??"} size={36} gradient={theme.gradient} />
                <div><p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: theme.text }}>{activeTutor?.name}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{activeTutor?.available ? "🟢 Available" : "🔴 Busy"}</p></div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {convMsgs.length === 0 && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState icon="💬" text="No messages yet — say hello!" /></div>}
                {convMsgs.map(m => {
                  const mine = m.senderId === user.id;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <div style={{ background: mine ? theme.gradient : theme.bg, color: mine ? "#fff" : theme.text, borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 16px", maxWidth: "70%", fontSize: 14, lineHeight: 1.5 }}>
                        <p style={{ margin: "0 0 4px" }}>{m.text}</p>
                        <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{m.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 10 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none" }} />
                <button onClick={sendMsg} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentPayments({ user, payments, theme }: { user: User; payments: Payment[]; theme: AnyTheme }) {
  const total = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <PageHeader title="Payments" sub="Your transaction history" theme={th} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Spent", value: `P${total}`, icon: "💰", color: theme.danger },
          { label: "Pending", value: `P${payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0)}`, icon: "⏳", color: theme.warning },
          { label: "Sessions Paid", value: payments.filter(p => p.status === "completed").length, icon: "✅", color: theme.success },
        ].map(s => (
          <div key={s.label} style={{ background: theme.card, borderRadius: 14, padding: "20px", border: `1px solid ${theme.border}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}><h3 style={{ margin: 0, fontFamily: F.display, fontSize: 18, color: theme.text }}>Transaction History</h3></div>
        {payments.length === 0 ? <EmptyState icon="💳" text="No transactions yet" /> : payments.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{p.tutorName}</span>
            <span style={{ fontSize: 12, color: theme.textSub }}>{p.date}</span>
            <span style={{ fontSize: 14, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>P{p.amount}</span>
            <Badge label={p.status} color={p.status === "completed" ? T.student.success : p.status === "pending" ? T.student.warning : T.student.danger} bg={p.status === "completed" ? "#D8F3DC" : p.status === "pending" ? "#FFF3CD" : "#FEE2E2"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentReviews({ user, reviews, tutors, setReviews, bookings, theme }: { user: User; reviews: Review[]; tutors: TutorProfile[]; setReviews: React.Dispatch<React.SetStateAction<Review[]>>; bookings: Booking[]; theme: AnyTheme }) {
  const [showForm, setShowForm] = useState(false);
  const [selTutor, setSelTutor] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const completedTutors = [...new Set(bookings.filter(b => b.status === "completed").map(b => b.tutorId))];
  const submit = () => {
    if (!selTutor || !rating || !comment) { alert("Please fill all fields."); return; }
    const tutor = tutors.find(t => t.id === selTutor);
    if (!tutor) return;
    setReviews(p => [...p, { id: Date.now(), studentId: user.id, tutorId: selTutor, studentName: user.name, tutorName: tutor.name, rating, comment, date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }), flagged: false, hidden: false }]);
    setShowForm(false); setRating(0); setComment(""); setSelTutor(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <PageHeader title="My Reviews" sub={`${reviews.length} reviews written`} theme={th} inline />
        {completedTutors.length > 0 && <button onClick={() => setShowForm(true)} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>✍️ Write a Review</button>}
      </div>
      {showForm && (
        <div style={{ background: theme.card, border: `1.5px solid ${theme.accent}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h4 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 18px" }}>Write a Review</h4>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Select Tutor</label>
            <select value={selTutor || ""} onChange={e => setSelTutor(Number(e.target.value))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none" }}>
              <option value="">— Select a tutor —</option>
              {completedTutors.map(id => { const t = tutors.find(t => t.id === id); return t ? <option key={id} value={id}>{t.name}</option> : null; })}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Rating</label><StarPicker value={rating} onChange={setRating} /></div>
          <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Comment</label><textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none", resize: "vertical", boxSizing: "border-box" }} /></div>
          <div style={{ display: "flex", gap: 10 }}><button onClick={submit} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Submit Review</button><button onClick={() => setShowForm(false)} style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textSub, borderRadius: 10, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: F.body }}>Cancel</button></div>
        </div>
      )}
      {reviews.length === 0 ? <EmptyState icon="⭐" text="No reviews yet. Complete a session to leave a review!" /> : reviews.map(r => (
        <div key={r.id} style={{ background: theme.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${theme.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: theme.text }}>Review for {r.tutorName}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><StarRow rating={r.rating} /><span style={{ color: theme.textMuted, fontSize: 12 }}>{r.date}</span></div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.6 }}>{r.comment}</p>
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
  const { tutors, setTutors, bookings, setBookings, messages, setMessages, reviews, payments } = shared;

  const myProfile = tutors.find(t => t.userId === user.id);
  const myBookings = bookings.filter(b => b.tutorId === (myProfile?.id || -1));
  const myMessages = messages.filter(m => m.receiverId === user.id);
  const newRequests = myBookings.filter(b => b.status === "pending").length;
  const unreadMsgs = myMessages.filter(m => !m.read).length;

  const navItems = [
    { id: "home",     label: "Overview",      icon: "◈" },
    { id: "requests", label: "Student Requests", icon: "📥", badge: newRequests },
    { id: "schedule", label: "Schedule",       icon: "📅" },
    { id: "messages", label: "Messages",       icon: "💬", badge: unreadMsgs },
    { id: "earnings", label: "Earnings",       icon: "💰" },
    { id: "reviews",  label: "My Reviews",     icon: "⭐" },
    { id: "profile",  label: "My Profile",     icon: "👤" },
  ];

  if (!myProfile) return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th}>
      <EmptyState icon="⏳" text="Your profile is being set up. Please refresh or contact admin if this persists." />
    </Shell>
  );

  return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th}>
      {tab === "home"     && <TutorHome     profile={myProfile} bookings={myBookings} messages={myMessages} reviews={reviews.filter(r => r.tutorId === myProfile.id)} theme={th} />}
      {tab === "requests" && <TutorRequests profile={myProfile} bookings={myBookings} setBookings={setBookings} theme={th} />}
      {tab === "schedule" && <TutorSchedule profile={myProfile} bookings={myBookings} setTutors={setTutors} theme={th} />}
      {tab === "messages" && <TutorMessages user={user} messages={messages} setMessages={setMessages} bookings={myBookings} theme={th} />}
      {tab === "earnings" && <TutorEarnings profile={myProfile} bookings={myBookings} payments={payments.filter(p => p.tutorId === myProfile.id)} theme={th} />}
      {tab === "reviews"  && <TutorReviewsTab reviews={reviews.filter(r => r.tutorId === myProfile.id)} theme={th} />}
      {tab === "profile"  && <TutorProfileTab profile={myProfile} setTutors={setTutors} theme={th} />}
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
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: theme.text, margin: 0, letterSpacing: "-0.02em" }}>Welcome, {profile.name.split(" ")[0]}</h1>
          {profile.verified === "pending" && <Badge label="Verification Pending" color={theme.warning} bg={theme.accentLight} />}
          {profile.verified === "approved" && <Badge label="✓ Verified" color={theme.success} bg="rgba(67,217,173,0.12)" />}
          {profile.verified === "rejected" && <Badge label="Not Verified" color={theme.danger} bg="rgba(255,107,107,0.12)" />}
        </div>
        <p style={{ color: theme.textSub, fontSize: 15, margin: 0 }}>{profile.verified === "pending" ? "Your profile is under review by admin." : "Here's your tutoring dashboard overview."}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Pending Requests", value: pending, icon: "📥", color: theme.warning },
          { label: "Active Sessions",  value: confirmed, icon: "📅", color: theme.accent },
          { label: "Total Earned",     value: `P${earned}`, icon: "💰", color: theme.success },
          { label: "Avg. Rating",      value: avgRating, icon: "⭐", color: "#F59E0B" },
          { label: "Unread Messages",  value: unread, icon: "💬", color: "#6366F1" },
          { label: "Total Reviews",    value: reviews.length, icon: "📝", color: theme.textSub },
        ].map(s => (
          <div key={s.label} style={{ background: theme.card, borderRadius: 16, padding: "20px", border: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 16px" }}>Latest Requests</h3>
          {bookings.filter(b => b.status === "pending").slice(0, 4).length === 0 ? <EmptyState icon="📥" text="No pending requests" /> : bookings.filter(b => b.status === "pending").slice(0, 4).map(b => (
            <div key={b.id} style={{ padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.studentName}</p>
              <p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.subject} · {b.date}</p>
            </div>
          ))}
        </div>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 16px" }}>Recent Reviews</h3>
          {reviews.slice(0, 3).length === 0 ? <EmptyState icon="⭐" text="No reviews yet" /> : reviews.slice(0, 3).map(r => (
            <div key={r.id} style={{ padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.text }}>{r.studentName}</p>
                <StarRow rating={r.rating} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{r.comment.slice(0, 80)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TutorRequests({ profile, bookings, setBookings, theme }: { profile: TutorProfile; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; theme: AnyTheme }) {
  const confirm = (id: number) => setBookings(p => p.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
  const decline = (id: number) => setBookings(p => p.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  const complete = (id: number) => setBookings(p => p.map(b => b.id === id ? { ...b, status: "completed" } : b));
  const pending = bookings.filter(b => b.status === "pending");
  const others = bookings.filter(b => b.status !== "pending");
  return (
    <div>
      <PageHeader title="Student Requests" sub={`${pending.length} pending requests`} theme={th} tutor />
      {pending.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>Pending ({pending.length})</p>
          {pending.map(b => (
            <div key={b.id} style={{ background: theme.card, borderRadius: 16, padding: 20, border: `1px solid ${theme.accent}44`, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar initials={b.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={44} gradient={theme.gradient} />
                  <div><p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: theme.text }}>{b.studentName}</p><p style={{ margin: "0 0 2px", fontSize: 13, color: theme.textSub }}>{b.subject}</p><p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}>📅 {b.date} at {b.time}</p></div>
                </div>
                <p style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: theme.accent, margin: 0 }}>P{b.amount}</p>
              </div>
              {b.note && <div style={{ background: theme.accentLight, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}><p style={{ margin: 0, fontSize: 13, color: theme.accent }}>📝 {b.note}</p></div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => confirm(b.id)} style={{ background: theme.gradient, color: "#0D0F1A", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>✓ Accept</button>
                <button onClick={() => decline(b.id)} style={{ background: "rgba(255,107,107,0.12)", color: theme.danger, border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>✕ Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>All Bookings</p>
          {others.map(b => (
            <div key={b.id} style={{ background: theme.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${theme.border}`, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar initials={b.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={36} gradient={theme.gradient} />
                <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.studentName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.subject} · {b.date}</p></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StatusBadge status={b.status} />
                {b.status === "confirmed" && <button onClick={() => complete(b.id)} style={{ background: "rgba(67,217,173,0.15)", color: theme.success, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Mark Complete</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {bookings.length === 0 && <EmptyState icon="📥" text="No student requests yet" />}
    </div>
  );
}

function TutorSchedule({ profile, bookings, setTutors, theme }: { profile: TutorProfile; bookings: Booking[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const toggleAvail = () => setTutors(p => p.map(t => t.id === profile.id ? { ...t, available: !t.available } : t));
  const upcoming = bookings.filter(b => b.status === "confirmed" || b.status === "pending");
  return (
    <div>
      <PageHeader title="Schedule Management" sub="Manage your availability and upcoming sessions" theme={th} tutor />
      <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 6px" }}>Availability Status</h3>
            <p style={{ margin: 0, fontSize: 14, color: theme.textSub }}>Toggle to let students know if you're accepting bookings</p>
          </div>
          <div onClick={toggleAvail} style={{ width: 56, height: 28, borderRadius: 14, background: profile.available ? theme.success : theme.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: profile.available ? 30 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </div>
        </div>
        <div style={{ marginTop: 16, background: profile.available ? "rgba(67,217,173,0.1)" : "rgba(255,107,107,0.1)", borderRadius: 10, padding: "12px 16px" }}>
          <p style={{ margin: 0, color: profile.available ? theme.success : theme.danger, fontSize: 14, fontWeight: 600 }}>{profile.available ? "✅ You are available — students can book sessions" : "❌ You are unavailable — new bookings are paused"}</p>
        </div>
      </div>
      <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
        <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 20px" }}>Upcoming Sessions ({upcoming.length})</h3>
        {upcoming.length === 0 ? <EmptyState icon="📅" text="No upcoming sessions" /> : upcoming.map(b => (
          <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📅</div>
              <div><p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: theme.text }}>{b.studentName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.subject}</p></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.accent }}>{b.date}</p>
              <p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}>{b.time}</p>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TutorMessages({ user, messages, setMessages, bookings, theme }: { user: User; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>; bookings: Booking[]; theme: AnyTheme }) {
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Find unique students who booked
  const studentIds = [...new Set(bookings.map(b => b.studentId))];
  const convMsgs = activeConv ? messages.filter(m => (m.senderId === user.id && m.receiverId === activeConv) || (m.senderId === activeConv && m.receiverId === user.id)) : [];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convMsgs.length]);

  const sendMsg = () => {
    if (!newMsg.trim() || !activeConv) return;
    const booking = bookings.find(b => b.studentId === activeConv);
    setMessages(p => [...p, { id: Date.now(), senderId: user.id, receiverId: activeConv, senderName: user.name, text: newMsg, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), read: false }]);
    setNewMsg("");
  };

  const getStudentName = (id: number) => bookings.find(b => b.studentId === id)?.studentName || "Student";

  return (
    <div>
      <PageHeader title="Messages" sub="Chat with your students" theme={th} tutor />
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, height: 600 }}>
        <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}` }}><p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Students</p></div>
          <div style={{ padding: 10 }}>
            {studentIds.length === 0 ? <EmptyState icon="💬" text="No student conversations" /> : studentIds.map(id => (
              <div key={id} onClick={() => { setActiveConv(id); setMessages(p => p.map(m => m.receiverId === user.id && m.senderId === id ? { ...m, read: true } : m)); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: activeConv === id ? theme.accentLight : "transparent", marginBottom: 4 }}>
                <Avatar initials={getStudentName(id).split(" ").map(w=>w[0]).join("").slice(0,2)} size={34} gradient={theme.gradient} />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.text }}>{getStudentName(id)}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState icon="💬" text="Select a student to chat" /></div>
          ) : (
            <>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: theme.text }}>{getStudentName(activeConv)}</p>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {convMsgs.map(m => {
                  const mine = m.senderId === user.id;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <div style={{ background: mine ? theme.gradient : theme.bg, color: mine ? "#0D0F1A" : theme.text, borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 16px", maxWidth: "70%" }}>
                        <p style={{ margin: "0 0 4px", fontSize: 14 }}>{m.text}</p>
                        <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>{m.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 10 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none" }} />
                <button onClick={sendMsg} style={{ background: theme.gradient, color: "#0D0F1A", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Send</button>
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
      <PageHeader title="Earnings" sub="Track your income from tutoring sessions" theme={th} tutor />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Earned", value: `P${total}`, icon: "💰", color: theme.accent },
          { label: "Pending Payout", value: `P${pending}`, icon: "⏳", color: theme.warning },
          { label: "Sessions Done", value: completed.length, icon: "✅", color: theme.success },
          { label: "Hourly Rate", value: `P${profile.rate}/hr`, icon: "💵", color: "#6366F1" },
        ].map(s => (
          <div key={s.label} style={{ background: theme.card, borderRadius: 16, padding: "20px", border: `1px solid ${theme.border}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}><h3 style={{ margin: 0, fontFamily: F.display, fontSize: 18, color: theme.text }}>Earnings History</h3></div>
        {completed.length === 0 ? <EmptyState icon="💰" text="No completed sessions yet" /> : completed.map(b => (
          <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{b.studentName}</span>
            <span style={{ fontSize: 12, color: theme.textSub }}>{b.subject} · {b.date}</span>
            <span style={{ fontSize: 16, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>+P{b.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TutorReviewsTab({ reviews, theme }: { reviews: Review[]; theme: AnyTheme }) {
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  return (
    <div>
      <PageHeader title="My Reviews" sub={`${reviews.length} reviews from students`} theme={th} tutor />
      {reviews.length > 0 && (
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: F.display, fontSize: 52, fontWeight: 900, color: theme.accent, margin: "0 0 4px" }}>{avg}</p>
            <StarRow rating={parseFloat(avg) || 0} size={18} />
            <p style={{ color: theme.textSub, fontSize: 13, margin: "4px 0 0" }}>{reviews.length} reviews</p>
          </div>
          <div style={{ flex: 1 }}>
            {[5,4,3,2,1].map(n => {
              const count = reviews.filter(r => r.rating === n).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ color: "#F59E0B", fontSize: 13, width: 20 }}>{n}★</span>
                  <div style={{ flex: 1, height: 8, background: theme.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: theme.gradient, borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ color: theme.textMuted, fontSize: 12, width: 20 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {reviews.length === 0 ? <EmptyState icon="⭐" text="No reviews yet — complete sessions to get reviews" /> : reviews.map(r => (
        <div key={r.id} style={{ background: theme.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${theme.border}`, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={r.studentName.split(" ").map(w=>w[0]).join("").slice(0,2)} size={32} gradient={theme.gradient} />
              <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{r.studentName}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><StarRow rating={r.rating} /><span style={{ color: theme.textMuted, fontSize: 12 }}>{r.date}</span></div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.6 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

function TutorProfileTab({ profile, setTutors, theme }: { profile: TutorProfile; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const [bio, setBio] = useState(profile.bio);
  const [rate, setRate] = useState(String(profile.rate));
  const [subjects, setSubjects] = useState(profile.subjects.join(", "));
  const [qualifications, setQualifications] = useState(profile.qualifications.join(", "));
  const [saved, setSaved] = useState(false);
  const save = () => {
    setTutors(p => p.map(t => t.id === profile.id ? { ...t, bio, rate: parseFloat(rate) || t.rate, subjects: subjects.split(",").map(s => s.trim()).filter(Boolean), qualifications: qualifications.split(",").map(q => q.trim()).filter(Boolean) } : t));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" };
  return (
    <div>
      <PageHeader title="My Profile" sub="Update your tutor profile" theme={th} tutor />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, gridColumn: "1/-1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <Avatar initials={profile.avatar} size={72} gradient={theme.gradient} />
            <div>
              <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, color: theme.text, margin: "0 0 4px" }}>{profile.name}</h2>
              <p style={{ color: theme.textSub, margin: "0 0 8px", fontSize: 14 }}>🎓 {profile.university}</p>
              <Badge label={profile.verified === "approved" ? "✓ Verified Tutor" : profile.verified === "pending" ? "⏳ Pending Verification" : "✕ Not Verified"} color={profile.verified === "approved" ? theme.success : profile.verified === "pending" ? theme.warning : theme.danger} bg={profile.verified === "approved" ? "rgba(67,217,173,0.12)" : profile.verified === "pending" ? theme.accentLight : "rgba(255,107,107,0.12)"} />
            </div>
          </div>
        </div>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <label style={lbl}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inp, resize: "vertical" }} />
        </div>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Hourly Rate (BWP)</label><input value={rate} onChange={e => setRate(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Subjects (comma separated)</label><input value={subjects} onChange={e => setSubjects(e.target.value)} style={inp} /></div>
        </div>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, gridColumn: "1/-1" }}>
          <label style={lbl}>Qualifications (comma separated)</label>
          <input value={qualifications} onChange={e => setQualifications(e.target.value)} style={inp} />
        </div>
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={save} style={{ background: theme.gradient, color: "#0D0F1A", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Save Changes</button>
        {saved && <span style={{ color: theme.success, fontSize: 14, fontWeight: 600 }}>✓ Saved successfully!</span>}
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
  const { tutors, setTutors, students, setStudents, bookings, reviews, setReviews, payments } = shared;

  const pendingVerif = tutors.filter(t => t.verified === "pending").length;

  const navItems = [
    { id: "overview",      label: "Overview",         icon: "◈" },
    { id: "students",      label: "Students",          icon: "🎓" },
    { id: "tutors",        label: "Tutors",            icon: "👨‍🏫" },
    { id: "verification",  label: "Verification",      icon: "✅", badge: pendingVerif },
    { id: "payments",      label: "Payments",          icon: "💳" },
    { id: "reviews",       label: "Reviews",           icon: "⭐" },
    { id: "maintenance",   label: "Maintenance",       icon: "⚙️" },
  ];

  return (
    <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th}>
      {tab === "overview"     && <AdminOverview   tutors={tutors} students={students} bookings={bookings} reviews={reviews} payments={payments} theme={th} />}
      {tab === "students"     && <AdminStudents   students={students} setStudents={setStudents} theme={th} />}
      {tab === "tutors"       && <AdminTutors     tutors={tutors} setTutors={setTutors} theme={th} />}
      {tab === "verification" && <AdminVerification tutors={tutors} setTutors={setTutors} theme={th} />}
      {tab === "payments"     && <AdminPayments   payments={payments} bookings={bookings} theme={th} />}
      {tab === "reviews"      && <AdminReviews    reviews={reviews} setReviews={setReviews} theme={th} />}
      {tab === "maintenance"  && <AdminMaintenance theme={th} />}
    </Shell>
  );
}

function AdminOverview({ tutors, students, bookings, reviews, payments, theme }: { tutors: TutorProfile[]; students: StudentProfile[]; bookings: Booking[]; reviews: Review[]; payments: Payment[]; theme: AnyTheme }) {
  const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const stats = [
    { label: "Total Students",   value: students.length,  icon: "🎓", color: theme.accent },
    { label: "Total Tutors",     value: tutors.length,    icon: "👨‍🏫", color: "#10B981" },
    { label: "Total Bookings",   value: bookings.length,  icon: "📅", color: "#F59E0B" },
    { label: "Platform Revenue", value: `P${totalRevenue}`, icon: "💰", color: "#8B5CF6" },
    { label: "Total Reviews",    value: reviews.length,   icon: "⭐", color: "#F59E0B" },
    { label: "Avg. Rating",      value: avgRating,        icon: "📊", color: theme.accent },
  ];
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: theme.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Admin Overview</h1>
        <p style={{ color: theme.textSub, margin: 0 }}>Welcome back, Mark — platform status at a glance.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: theme.card, borderRadius: 16, padding: "22px 20px", border: `1px solid ${theme.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 16px" }}>Recent Bookings</h3>
          {bookings.slice(-5).reverse().map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.studentName} → {b.tutorName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.subject} · {b.date}</p></div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {bookings.length === 0 && <EmptyState icon="📅" text="No bookings yet" />}
        </div>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 16px" }}>Platform Health</h3>
          {[["API Server","Operational",true],["Database","Operational",true],["Payment Gateway","Operational",true],["File Storage","Operational",true],["Email Service","Operational",true]].map(([name, status, ok]) => (
            <div key={String(name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: 13, color: theme.textSub }}>{name}</span>
              <Badge label={ok ? "● Operational" : "● Degraded"} color={ok ? theme.success : theme.danger} bg={ok ? "#D1FAE5" : "#FEE2E2"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminStudents({ students, setStudents, theme }: { students: StudentProfile[]; setStudents: React.Dispatch<React.SetStateAction<StudentProfile[]>>; theme: AnyTheme }) {
  const [search, setSearch] = useState("");
  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  const remove = (id: number) => { if (window.confirm("Delete this student?")) setStudents(p => p.filter(s => s.id !== id)); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <PageHeader title="Student Accounts" sub={`${students.length} registered students`} theme={th} inline />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 14px" }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ border: "none", outline: "none", fontSize: 13, fontFamily: F.body, color: theme.text, background: "transparent" }} />
        </div>
      </div>
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr 1fr 80px", padding: "12px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.accentLight }}>
          {["Name","University","Course","Year","Plan",""].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
        </div>
        {filtered.length === 0 ? <EmptyState icon="🎓" text="No students registered yet" /> : filtered.map(s => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr 1fr 80px", padding: "13px 20px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar initials={s.avatar} size={30} gradient={theme.gradient} /><span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{s.name}</span></div>
            <span style={{ fontSize: 12, color: theme.textSub }}>{s.university || "—"}</span>
            <span style={{ fontSize: 12, color: theme.textSub }}>{s.course || "—"}</span>
            <span style={{ fontSize: 12, color: theme.textSub }}>{s.year}</span>
            <Badge label={s.plan} color={s.plan === "premium" ? "#D97706" : theme.accent} bg={s.plan === "premium" ? "#FFF3CD" : theme.accentLight} />
            <button onClick={() => remove(s.id)} style={{ background: "#FEE2E2", color: theme.danger, border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: F.body }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTutors({ tutors, setTutors, theme }: { tutors: TutorProfile[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const [search, setSearch] = useState("");
  const filtered = tutors.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
  const remove = (id: number) => { if (window.confirm("Delete this tutor?")) setTutors(p => p.filter(t => t.id !== id)); };
  const suspend = (id: number) => setTutors(p => p.map(t => t.id === id ? { ...t, available: !t.available } : t));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <PageHeader title="Tutor Accounts" sub={`${tutors.length} registered tutors`} theme={th} inline />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 14px" }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tutors..." style={{ border: "none", outline: "none", fontSize: 13, fontFamily: F.body, color: theme.text, background: "transparent" }} />
        </div>
      </div>
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.8fr 120px", padding: "12px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.accentLight }}>
          {["Name","University","Rate","Rating","Status","Verified",""].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
        </div>
        {filtered.length === 0 ? <EmptyState icon="👨‍🏫" text="No tutors registered yet" /> : filtered.map(t => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.8fr 120px", padding: "13px 20px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar initials={t.avatar} size={30} gradient="linear-gradient(135deg,#F4A228,#E07B00)" /><span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{t.name}</span></div>
            <span style={{ fontSize: 12, color: theme.textSub }}>{t.university || "—"}</span>
            <span style={{ fontSize: 13, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>P{t.rate}/hr</span>
            <StarRow rating={t.rating} />
            <Badge label={t.available ? "Available" : "Busy"} color={t.available ? theme.success : theme.danger} bg={t.available ? "#D1FAE5" : "#FEE2E2"} />
            <Badge label={t.verified} color={t.verified === "approved" ? theme.success : t.verified === "pending" ? theme.warning : theme.danger} bg={t.verified === "approved" ? "#D1FAE5" : t.verified === "pending" ? "#FFF3CD" : "#FEE2E2"} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => suspend(t.id)} style={{ background: theme.accentLight, color: theme.accent, border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontFamily: F.body }}>Toggle</button>
              <button onClick={() => remove(t.id)} style={{ background: "#FEE2E2", color: theme.danger, border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontFamily: F.body }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminVerification({ tutors, setTutors, theme }: { tutors: TutorProfile[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const approve = (id: number) => setTutors(p => p.map(t => t.id === id ? { ...t, verified: "approved" } : t));
  const reject  = (id: number) => setTutors(p => p.map(t => t.id === id ? { ...t, verified: "rejected" } : t));
  const pending  = tutors.filter(t => t.verified === "pending");
  const reviewed = tutors.filter(t => t.verified !== "pending");
  return (
    <div>
      <PageHeader title="Tutor Verification" sub="Review and approve tutor applications" theme={th} />
      <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>Pending ({pending.length})</p>
      {pending.length === 0 ? <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, marginBottom: 24 }}><EmptyState icon="✅" text="All caught up! No pending verifications" /></div> : (
        <div style={{ marginBottom: 28 }}>
          {pending.map(t => (
            <div key={t.id} style={{ background: theme.card, borderRadius: 16, padding: 22, border: `1.5px solid ${theme.warning}55`, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 14 }}>
                <Avatar initials={t.avatar} size={52} gradient="linear-gradient(135deg,#F4A228,#E07B00)" />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 4px" }}>{t.name}</h3>
                  <p style={{ color: theme.textSub, fontSize: 13, margin: "0 0 8px" }}>🎓 {t.university} · P{t.rate}/hr</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {t.subjects.map(s => <span key={s} style={{ background: "#EFF6FF", color: theme.accent, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{s}</span>)}
                  </div>
                  {t.qualifications.length > 0 && <p style={{ color: theme.textSub, fontSize: 13, margin: "0 0 6px" }}>🎓 {t.qualifications.join(" · ")}</p>}
                  {t.bio && <p style={{ color: theme.textSub, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{t.bio}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => approve(t.id)} style={{ background: "#D1FAE5", color: theme.success, border: "none", borderRadius: 10, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>✓ Approve</button>
                <button onClick={() => reject(t.id)}  style={{ background: "#FEE2E2", color: theme.danger,  border: "none", borderRadius: 10, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {reviewed.length > 0 && (
        <>
          <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>Reviewed ({reviewed.length})</p>
          {reviewed.map(t => (
            <div key={t.id} style={{ background: theme.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${theme.border}`, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar initials={t.avatar} size={36} gradient="linear-gradient(135deg,#F4A228,#E07B00)" />
                <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{t.name}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{t.university}</p></div>
              </div>
              <Badge label={t.verified} color={t.verified === "approved" ? theme.success : theme.danger} bg={t.verified === "approved" ? "#D1FAE5" : "#FEE2E2"} />
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
      <PageHeader title="Payment Monitoring" sub="Track all transactions and revenue" theme={th} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Revenue",  value: `P${total}`,   icon: "💰", color: theme.success },
          { label: "Pending",        value: `P${pending}`, icon: "⏳", color: theme.warning },
          { label: "Transactions",   value: payments.length, icon: "📋", color: theme.accent },
          { label: "Total Bookings", value: bookings.length, icon: "📅", color: "#8B5CF6" },
        ].map(s => (
          <div key={s.label} style={{ background: theme.card, borderRadius: 14, padding: "20px", border: `1px solid ${theme.border}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}><h3 style={{ margin: 0, fontFamily: F.display, fontSize: 18, color: theme.text }}>All Transactions</h3></div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "11px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.accentLight }}>
          {["Student","Tutor","Amount","Date","Status"].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase" }}>{h}</span>)}
        </div>
        {payments.length === 0 ? <EmptyState icon="💳" text="No transactions yet" /> : payments.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "13px 20px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: theme.text }}>{p.studentName}</span>
            <span style={{ fontSize: 13, color: theme.text }}>{p.tutorName}</span>
            <span style={{ fontSize: 14, color: theme.accent, fontFamily: F.mono, fontWeight: 700 }}>P{p.amount}</span>
            <span style={{ fontSize: 12, color: theme.textSub }}>{p.date}</span>
            <Badge label={p.status} color={p.status === "completed" ? theme.success : p.status === "pending" ? theme.warning : theme.danger} bg={p.status === "completed" ? "#D1FAE5" : p.status === "pending" ? "#FFF3CD" : "#FEE2E2"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReviews({ reviews, setReviews, theme }: { reviews: Review[]; setReviews: React.Dispatch<React.SetStateAction<Review[]>>; theme: AnyTheme }) {
  const [filter, setFilter] = useState("all");
  const toggleFlag = (id: number) => setReviews(p => p.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));
  const toggleHide = (id: number) => setReviews(p => p.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  const del = (id: number) => { if (window.confirm("Delete this review?")) setReviews(p => p.filter(r => r.id !== id)); };
  const visible = reviews.filter(r => filter === "all" ? true : filter === "flagged" ? r.flagged : r.hidden);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  return (
    <div>
      <PageHeader title="Reviews & Ratings" sub="Monitor and moderate all platform reviews" theme={th} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Avg Rating", value: avg, icon: "⭐" },
          { label: "Total Reviews", value: reviews.length, icon: "💬" },
          { label: "Flagged", value: reviews.filter(r => r.flagged).length, icon: "🚩" },
          { label: "Hidden", value: reviews.filter(r => r.hidden).length, icon: "🙈" },
        ].map(s => (
          <div key={s.label} style={{ background: theme.card, borderRadius: 14, padding: "18px", border: `1px solid ${theme.border}` }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontFamily: F.display, fontSize: 18, color: theme.text }}>All Reviews</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {["all","flagged","hidden"].map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: filter === f ? theme.accentLight : "transparent", color: filter === f ? theme.accent : theme.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body, textTransform: "capitalize" }}>{f}</button>)}
          </div>
        </div>
        {visible.length === 0 ? <EmptyState icon="⭐" text="No reviews found" /> : visible.map(r => (
          <div key={r.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, opacity: r.hidden ? 0.55 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{r.studentName}</span>
                  <span style={{ color: theme.textMuted, fontSize: 13 }}>→</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: theme.accent }}>{r.tutorName}</span>
                  <StarRow rating={r.rating} />
                  <span style={{ color: theme.textMuted, fontSize: 12 }}>{r.date}</span>
                  {r.flagged && <Badge label="Flagged" color={theme.danger} bg="#FEE2E2" />}
                  {r.hidden  && <Badge label="Hidden"  color={theme.textMuted} bg={theme.border} />}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.5 }}>{r.comment}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleFlag(r.id)} style={{ background: r.flagged ? "#FEE2E2" : theme.accentLight, color: r.flagged ? theme.danger : theme.accent, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: F.body }}>{r.flagged ? "Unflag" : "Flag"}</button>
                <button onClick={() => toggleHide(r.id)} style={{ background: theme.border, color: theme.textSub, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: F.body }}>{r.hidden ? "Restore" : "Hide"}</button>
                <button onClick={() => del(r.id)} style={{ background: "#FEE2E2", color: theme.danger, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: F.body }}>Delete</button>
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
  const action = (label: string) => { setMsg(`${label}...`); setTimeout(() => { setMsg(`${label} ✓`); setTimeout(() => setMsg(""), 3000); }, 1200); };
  const toggle = (k: keyof typeof settings) => setSettings(p => ({ ...p, [k]: !p[k] }));
  const items: { key: keyof typeof settings; label: string; desc: string; danger?: boolean }[] = [
    { key: "registration", label: "Student Registration", desc: "Allow new students to sign up" },
    { key: "payments",     label: "Payment Processing",   desc: "Enable subscription payments" },
    { key: "tutorMarket",  label: "Tutor Marketplace",    desc: "Students can browse & book tutors" },
    { key: "emails",       label: "Email Notifications",  desc: "Send automated email alerts" },
    { key: "autoApprove",  label: "Auto-Approve Tutors",  desc: "Skip manual verification — not recommended" },
    { key: "maintenance",  label: "Maintenance Mode",     desc: "Redirect all users to maintenance page", danger: true },
  ];
  return (
    <div>
      <PageHeader title="System Maintenance" sub="Platform settings, diagnostics and controls" theme={th} />
      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}><h3 style={{ margin: 0, fontFamily: F.display, fontSize: 18, color: theme.text }}>Feature Toggles</h3></div>
        {items.map(item => (
          <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: item.danger && settings[item.key] ? theme.danger : theme.text }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{item.desc}</p>
            </div>
            <div onClick={() => toggle(item.key)} style={{ width: 48, height: 26, borderRadius: 13, background: settings[item.key] ? (item.danger ? theme.danger : theme.success) : theme.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: settings[item.key] ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h4 style={{ fontFamily: F.display, fontSize: 17, color: theme.text, margin: "0 0 16px" }}>Quick Actions</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Clear System Cache","Backup Database","Export Reports (CSV)","Send Test Email"].map(a => (
              <button key={a} onClick={() => action(a)} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${theme.border}`, background: "none", color: theme.textSub, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}>{a}</button>
            ))}
          </div>
          {msg && <p style={{ color: theme.success, fontSize: 13, margin: "10px 0 0", fontFamily: F.body }}>{msg}</p>}
        </div>
        <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
          <h4 style={{ fontFamily: F.display, fontSize: 17, color: theme.text, margin: "0 0 16px" }}>Danger Zone</h4>
          <p style={{ fontSize: 13, color: theme.textSub, margin: "0 0 16px" }}>These actions are permanent and cannot be undone.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => window.confirm("Purge all reviews?") && alert("Reviews purged.")} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${theme.danger}44`, background: "#FEE2E2", color: theme.danger, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}>⚠️ Purge All Reviews</button>
            <button onClick={() => window.confirm("Reset the entire platform?") && alert("Platform reset.")} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${theme.danger}44`, background: "#FEE2E2", color: theme.danger, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}>⚠️ Reset Platform Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MINI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Needed for non-student themed refs — safe fallback to student theme
const th = T.student;

function PageHeader({ title, sub, theme, tutor = false, inline = false }: { title: string; sub: string; theme: AnyTheme; tutor?: boolean; inline?: boolean }) {
  if (inline) return (
    <div>
      <h1 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 900, color: (theme as typeof T.student).text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ color: (theme as typeof T.student).textSub, fontSize: 14, margin: 0 }}>{sub}</p>
    </div>
  );
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 900, color: (theme as typeof T.student).text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ color: (theme as typeof T.student).textSub, fontSize: 14, margin: 0 }}>{sub}</p>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <p style={{ color: "#94A3B8", fontSize: 14, margin: 0, fontFamily: F.body }}>{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; color: string; bg: string }> = {
    pending:   { label: "Pending",   color: "#D97706", bg: "#FFF3CD" },
    confirmed: { label: "Confirmed", color: "#2563EB", bg: "#DBEAFE" },
    completed: { label: "Completed", color: "#059669", bg: "#D1FAE5" },
    cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEE2E2" },
  };
  const c = config[status];
  return <Badge label={c.label} color={c.color} bg={c.bg} />;
}