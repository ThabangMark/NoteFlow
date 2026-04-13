"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FontLink = () => (
 <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
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
 referralCode?: string; email?: string;
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
 studentName: string; tutorName: string; amount: number; status: "completed" | "pending" | "refunded";
 date: string; method: string;
}

interface MaterialRating {
  id: number; materialId: number; studentId: string; studentName: string;
  rating: number; comment: string; date: string;
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

const MobileStyles = () => (
  <style>{`
    @media (max-width: 768px) {
      .nf-sidebar { transform: translateX(-100%); position: fixed !important; z-index: 200; transition: transform 0.25s; }
      .nf-sidebar.open { transform: translateX(0); }
      .nf-main { padding: 20px 16px 60px !important; }
      .nf-burger { display: flex !important; }
      .nf-overlay { display: block !important; }
    }
    @media (min-width: 769px) { .nf-burger { display: none !important; } .nf-overlay { display: none !important; } }
  `}</style>
);

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
const ADMIN_USER: User = { id: "admin-mark-00000000", name: "Mark", email: "mark@KitsoLink.bw", role: "admin", avatar: "MK" };

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
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
     if (td) setTutors(td.map((t: any) => ({ id: t.id, userId: t.id, name: t.profiles?.name||"", avatar: t.profiles?.avatar||"??", university: t.profiles?.university||"", modules: t.modules||[], qualifications: t.qualifications||[], bio: t.bio||"", rate: t.rate||80, available: t.available??true, rating: t.rating||0, reviewCount: t.review_count||0, verified: t.verified||"pending", earnings: t.earnings||0, joined: t.profiles?.created_at ? new Date(t.profiles.created_at).toLocaleDateString("en-GB",{month:"short",year:"numeric"}) : "" })));
     if (sd) setStudents(sd.map((s: any) => ({ id: s.id, userId: s.id, name: s.profiles?.name||"", avatar: s.profiles?.avatar||"??", university: s.profiles?.university||"", course: s.course||"", year: s.year||"1st Year", plan: s.plan||"free", referralCode: s.referral_code||"", joined: s.profiles?.created_at ? new Date(s.profiles.created_at).toLocaleDateString("en-GB",{month:"short",year:"numeric"}) : "" })));
     if (bd) setBookings(bd.map((b: any) => ({ id: b.id, studentId: b.student_id, tutorId: b.tutor_id, studentName: b.student_name, tutorName: b.tutor_name, module: b.module, date: b.date, time: b.time, status: b.status, note: b.note||"", amount: b.amount, createdAt: b.created_at })));
     if (md) setMessages(md.map((m: any) => ({ id: m.id, senderId: m.sender_id, receiverId: m.receiver_id, senderName: m.sender_name, text: m.text, read: m.read, timestamp: new Date(m.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) })));
     if (rd) setReviews(rd.map((r: any) => ({ id: r.id, studentId: r.student_id, tutorId: r.tutor_id, studentName: r.student_name, tutorName: r.tutor_name, rating: r.rating, comment: r.comment, date: r.created_at, flagged: r.flagged, hidden: r.hidden })));
     if (pd) setPayments(pd.map((p: any) => ({ id: p.id, studentId: p.student_id, tutorId: p.tutor_id, bookingId: p.booking_id, studentName: p.student_name, tutorName: p.tutor_name, amount: p.amount, status: p.status, date: new Date(p.created_at).toLocaleDateString("en-GB"), method: p.method||"Card" })));
   } catch (err) { console.error("Data load error:", err); }
 }, []);

 useEffect(() => {
   const init = async () => {
     const { data: { session } } = await supabase.auth.getSession();
     if (session?.user) {
       const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
       if (profile) { setCurrentUser({ id: profile.id, name: profile.name, email: session.user.email||"", role: profile.role as Role, avatar: profile.avatar||profile.name.slice(0,2).toUpperCase() }); setScreen("dashboard"); }
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
   <div style={{ minHeight:"100vh", background:"#0D0F1A", display:"flex", alignItems:"center", justifyContent:"center" }}>
     <div style={{ textAlign:"center" }}>
       <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#1E3A8A,#3B82F6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:22, fontFamily:F.display, margin:"0 auto 16px" }}>N</div>
       <p style={{ color:"#8892B0", fontFamily:F.body, fontSize:14 }}>Loading KitsoLink...</p>
     </div>
   </div>
 );

 if (screen === "explore") return (
 <>
 <FontLink />
 <PublicExplorePage
   onGetStarted={() => setScreen("landing")}
   onLogin={(role) => { setLoginRole(role); setScreen("login"); }}
 />
 </>
 );

 if (screen === "landing") return (
 <>
 <FontLink />
 <LandingPage onChooseRole={(role) => { setLoginRole(role); setScreen("login"); }} onBack={() => setScreen("explore")} />
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
 {currentUser.role === "tutor" && <TutorDashboard user={currentUser} {...sharedProps} />}
 {currentUser.role === "admin" && <AdminDashboard user={currentUser} {...sharedProps} />}
 </>
 );
}


// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC DATA — Universities, Fields of Study, Materials
// ═══════════════════════════════════════════════════════════════════════════════
interface Material {
  id: number; title: string; type: "Notes" | "Exam Paper" | "Summary" | "Textbook";
  module: string; university: string; field: string;
  pages: number; downloads: number; rating: number; year: string; premium: boolean;
  preview: string;
}

const UNIVERSITIES = [
  {
    name: "Botswana Accountancy College", short: "BAC", location: "Gaborone",
    fields: [
      { name: "Software Engineering & IT", modules: ["Mobile Development", "Introduction to Java", "Fundamentals of Cloud Computing", "Database Systems", "Web Development", "Computer Networks"] },
      { name: "Accounting & Finance", modules: ["Financial Accounting", "Botswana Taxation", "Auditing", "Management Accounting", "Corporate Finance"] },
      { name: "Business Administration", modules: ["Business Law", "Strategic Management", "Entrepreneurship", "Human Resources", "Marketing"] },
      { name: "Information Technology", modules: ["Networking Fundamentals", "Cybersecurity", "Systems Analysis", "IT Project Management"] },
    ],
  },
  {
    name: "University of Botswana", short: "UB", location: "Gaborone",
    fields: [
      { name: "Computer Science", modules: ["Data Structures & Algorithms", "Operating Systems", "Software Engineering", "Artificial Intelligence", "Computer Graphics"] },
      { name: "Law", modules: ["Constitutional Law", "Contract Law", "Criminal Law", "Land Law", "Administrative Law"] },
      { name: "Medicine", modules: ["Anatomy & Physiology", "Pharmacology", "Pathology", "Clinical Medicine", "Public Health"] },
      { name: "Engineering", modules: ["Thermodynamics", "Fluid Mechanics", "Structural Analysis", "Engineering Mathematics"] },
      { name: "Economics", modules: ["Microeconomics", "Macroeconomics", "Econometrics", "Development Economics"] },
    ],
  },
  {
    name: "BIUST", short: "BIUST", location: "Palapye",
    fields: [
      { name: "Civil Engineering", modules: ["Structural Engineering", "Geotechnics", "Hydraulics", "Construction Management"] },
      { name: "Electrical Engineering", modules: ["Circuit Analysis", "Power Systems", "Digital Electronics", "Control Systems"] },
      { name: "Computer Science", modules: ["Programming Fundamentals", "Software Development", "Machine Learning", "Data Science"] },
      { name: "Environmental Science", modules: ["Environmental Impact Assessment", "Ecology", "Climate Change", "Conservation"] },
    ],
  },
  {
    name: "Botho University", short: "Botho", location: "Gaborone",
    fields: [
      { name: "Nursing", modules: ["Anatomy & Physiology", "Pharmacology", "Nursing Practice", "Mental Health", "Paediatrics"] },
      { name: "Business Computing", modules: ["Programming", "Database Management", "Systems Analysis", "E-Commerce"] },
      { name: "Hospitality Management", modules: ["Food & Beverage", "Front Office Operations", "Tourism Management", "Event Management"] },
    ],
  },
  {
    name: "Limkokwing University", short: "Limkokwing", location: "Gaborone",
    fields: [
      { name: "Graphic Design", modules: ["Typography", "Colour Theory", "Adobe Illustrator", "Brand Identity", "Print Design"] },
      { name: "Film & Animation", modules: ["Storyboarding", "3D Modelling", "Video Production", "Motion Graphics"] },
      { name: "Mass Communication", modules: ["Journalism", "Public Relations", "Media Law", "Digital Media"] },
    ],
  },
  {
    name: "Ba Isago University", short: "Ba Isago", location: "Gaborone",
    fields: [
      { name: "Accounting", modules: ["Financial Reporting", "Taxation", "Auditing", "Cost Accounting"] },
      { name: "Human Resources", modules: ["Labour Law", "Recruitment", "Training & Development", "Compensation Management"] },
      { name: "Supply Chain Management", modules: ["Logistics", "Procurement", "Inventory Management", "Operations Management"] },
    ],
  },
  {
    name: "Botswana Open University", short: "BOU", location: "Gaborone",
    fields: [
      { name: "Education Management", modules: ["Curriculum Development", "Educational Psychology", "School Administration", "Research Methods"] },
      { name: "Public Administration", modules: ["Public Policy", "Governance", "Public Finance", "Development Studies"] },
      { name: "Agriculture", modules: ["Crop Production", "Animal Science", "Agricultural Economics", "Soil Science"] },
    ],
  },
];

const SAMPLE_MATERIALS: Material[] = [
  { id:1,  title:"Introduction to Java – Complete Notes",          type:"Notes",      module:"Introduction to Java",           university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:45,  downloads:1230, rating:4.8, year:"1st Year", premium:false, preview:"OOP concepts, classes, objects, inheritance, polymorphism, exception handling and more." },
  { id:2,  title:"Mobile Development – Android Basics",            type:"Notes",      module:"Mobile Development",             university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:38,  downloads:980,  rating:4.7, year:"2nd Year", premium:true,  preview:"Android Studio setup, XML layouts, Activities, Intents, RecyclerView, REST APIs." },
  { id:3,  title:"Cloud Computing Exam Paper 2024",                type:"Exam Paper", module:"Fundamentals of Cloud Computing", university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:12,  downloads:2100, rating:4.9, year:"2nd Year", premium:true,  preview:"AWS, Azure, GCP fundamentals, deployment models, SaaS/PaaS/IaaS, cloud security." },
  { id:4,  title:"Web Development Summary – HTML CSS JS",          type:"Summary",    module:"Web Development",                university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:22,  downloads:1540, rating:4.6, year:"1st Year", premium:false, preview:"HTML5 structure, CSS Flexbox & Grid, JavaScript DOM, fetch API, responsive design." },
  { id:5,  title:"Database Systems Textbook",                      type:"Textbook",   module:"Database Systems",               university:"Botswana Accountancy College", field:"Software Engineering & IT", pages:320, downloads:870,  rating:4.5, year:"2nd Year", premium:true,  preview:"Relational model, SQL, normalization, transactions, NoSQL databases, ER diagrams." },
  { id:6,  title:"Financial Accounting Principles",                type:"Notes",      module:"Financial Accounting",           university:"Botswana Accountancy College", field:"Accounting & Finance",      pages:60,  downloads:3200, rating:4.9, year:"1st Year", premium:false, preview:"Double entry bookkeeping, trial balance, income statement, balance sheet, cash flow." },
  { id:7,  title:"Botswana Taxation Law Summary",                  type:"Summary",    module:"Botswana Taxation",              university:"Botswana Accountancy College", field:"Accounting & Finance",      pages:30,  downloads:1890, rating:4.7, year:"3rd Year", premium:true,  preview:"BURS regulations, VAT, PAYE, corporate tax, withholding tax, transfer pricing." },
  { id:8,  title:"Data Structures & Algorithms – UB Notes",        type:"Notes",      module:"Data Structures & Algorithms",   university:"University of Botswana",       field:"Computer Science",          pages:48,  downloads:2750, rating:4.8, year:"2nd Year", premium:false, preview:"Arrays, linked lists, stacks, queues, trees, graphs, sorting & searching algorithms." },
  { id:9,  title:"Operating Systems Past Papers 2019-2024",        type:"Exam Paper", module:"Operating Systems",              university:"University of Botswana",       field:"Computer Science",          pages:35,  downloads:3100, rating:4.9, year:"3rd Year", premium:true,  preview:"Process management, memory management, file systems, CPU scheduling, deadlocks." },
  { id:10, title:"Constitutional Law of Botswana",                  type:"Notes",      module:"Constitutional Law",             university:"University of Botswana",       field:"Law",                       pages:70,  downloads:2300, rating:4.7, year:"2nd Year", premium:false, preview:"Constitution of Botswana, Bill of Rights, separation of powers, judicial review." },
  { id:11, title:"Structural Engineering Notes",                   type:"Notes",      module:"Structural Engineering",         university:"BIUST",                        field:"Civil Engineering",          pages:55,  downloads:1100, rating:4.6, year:"2nd Year", premium:false, preview:"Load analysis, beam design, structural materials, steel and concrete design." },
  { id:12, title:"Nursing Fundamentals – Anatomy & Physiology",    type:"Notes",      module:"Anatomy & Physiology",           university:"Botho University",             field:"Nursing",                    pages:80,  downloads:2900, rating:4.9, year:"1st Year", premium:false, preview:"Human body systems, homeostasis, cell biology, organ functions, clinical applications." },
  { id:13, title:"Typography & Brand Identity Notes",              type:"Notes",      module:"Typography",                     university:"Limkokwing University",        field:"Graphic Design",             pages:33,  downloads:990,  rating:4.6, year:"1st Year", premium:false, preview:"Type anatomy, font selection, hierarchy, spacing, brand guidelines, logo design." },
  { id:14, title:"Labour Law Botswana – Exam Notes",               type:"Exam Paper", module:"Labour Law",                     university:"Ba Isago University",          field:"Human Resources",            pages:20,  downloads:760,  rating:4.5, year:"2nd Year", premium:true,  preview:"Employment Act, trade unions, termination, dispute resolution, workplace rights." },
  { id:15, title:"Circuit Analysis Complete Notes",                type:"Notes",      module:"Circuit Analysis",               university:"BIUST",                        field:"Electrical Engineering",     pages:62,  downloads:1450, rating:4.7, year:"1st Year", premium:false, preview:"Ohm's law, Kirchhoff's laws, mesh analysis, Thevenin, Norton, AC circuits, filters." },
];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  "Notes":      { bg: "#EAF3FF", color: "#2563EB" },
  "Exam Paper": { bg: "#FFF0EA", color: "#C2410C" },
  "Summary":    { bg: "#EAFAF1", color: "#15803D" },
  "Textbook":   { bg: "#F5F0FF", color: "#7C3AED" },
};

const FIELDS_OF_STUDY = [
  "Software Engineering & IT", "Accounting & Finance", "Business Administration",
  "Computer Science", "Law", "Medicine", "Engineering", "Nursing",
  "Graphic Design", "Human Resources", "Supply Chain Management",
  "Civil Engineering", "Electrical Engineering", "Mass Communication",
];

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPLORE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function PublicExplorePage({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: (role: Role) => void }) {
  const [activeTab, setActiveTab] = useState<"universities" | "fields">("universities");
  const [selectedUni, setSelectedUni] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [search, setSearch] = useState("");

  const uni = UNIVERSITIES.find(u => u.name === selectedUni);

  // Materials for current view
  const getMaterials = () => {
    let mats = SAMPLE_MATERIALS;
    if (selectedModule) mats = mats.filter(m => m.module === selectedModule);
    else if (selectedField) mats = mats.filter(m => m.field === selectedField);
    else if (selectedUni) mats = mats.filter(m => m.university === selectedUni);
    if (search) mats = mats.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.module.toLowerCase().includes(search.toLowerCase()));
    return mats;
  };

  const freeMaterials = getMaterials().filter(m => !m.premium);
  const premiumMaterials = getMaterials().filter(m => m.premium);

  const inp: React.CSSProperties = { padding: "11px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, fontFamily: F.body, outline: "none", color: "#0F172A", background: "#fff", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFF", fontFamily: F.body }}>
      {/* ── NAV ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16, fontFamily: F.display }}>N</div>
          <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KitsoLink</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => onLogin("student")} style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#0F172A", fontFamily: F.body }}>Sign In</button>
          <button onClick={onGetStarted} style={{ background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E3A8A 55%,#3B82F6 100%)", padding: "64px 32px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 18, letterSpacing: "0.08em", textTransform: "uppercase" }}>Built for Botswana Students</div>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(32px,5vw,58px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Botswana's Student<br />Resource Platform</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.6 }}>Browse notes, exam papers, summaries and textbooks from every major university in Botswana. Free and premium materials available.</p>
          <div style={{ maxWidth: 540, margin: "0 auto", background: "#fff", borderRadius: 14, display: "flex", alignItems: "center", padding: "6px 6px 6px 18px", boxShadow: "0 16px 40px rgba(0,0,0,0.18)" }}>
            <svg width="18" height="18" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginRight: 10 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes, modules, exam papers..." style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#0F172A", background: "transparent", fontFamily: F.body }} />
            <button style={{ background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Search</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 36, flexWrap: "wrap" }}>
            {[["500+","Study Materials"],["7","Universities"],["50+","Modules"],["Free","To Browse"]].map(([n,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: "#fff" }}>{n}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ── FIELDS OF STUDY STRIP (Coursera-style) ── */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>Browse by Field of Study</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => { setSelectedField(null); setSelectedModule(null); setSelectedUni(null); }} style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid #E2E8F0", background: !selectedField && !selectedUni ? "#0F172A" : "#fff", color: !selectedField && !selectedUni ? "#fff" : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>All</button>
            {FIELDS_OF_STUDY.map(f => (
              <button key={f} onClick={() => { setSelectedField(f); setSelectedModule(null); setSelectedUni(null); }} style={{ padding: "8px 18px", borderRadius: 20, border: selectedField === f ? "none" : "1.5px solid #E2E8F0", background: selectedField === f ? "linear-gradient(135deg,#1E3A8A,#3B82F6)" : "#fff", color: selectedField === f ? "#fff" : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body, transition: "all 0.15s" }}>{f}</button>
            ))}
          </div>
        </div>

        {/* ── TABS: Universities / Fields ── */}
        <div style={{ display: "flex", borderBottom: "2px solid #E2E8F0", marginBottom: 32 }}>
          {(["universities","fields"] as const).map(t => (
            <button key={t} onClick={() => { setActiveTab(t); setSelectedUni(null); setSelectedField(null); setSelectedModule(null); }} style={{ padding: "12px 24px", background: "none", border: "none", borderBottom: activeTab === t ? "2px solid #3B82F6" : "2px solid transparent", marginBottom: -2, color: activeTab === t ? "#3B82F6" : "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body, textTransform: "capitalize" }}>{t === "universities" ? "By University" : "By Field of Study"}</button>
          ))}
        </div>

        {/* ── BREADCRUMB ── */}
        {(selectedUni || selectedField || selectedModule) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={() => { setSelectedUni(null); setSelectedField(null); setSelectedModule(null); }} style={{ background: "none", border: "none", color: "#3B82F6", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: F.body, padding: 0 }}>Home</button>
            {selectedUni && <><span style={{ color: "#94A3B8" }}>/</span><button onClick={() => { setSelectedModule(null); }} style={{ background: "none", border: "none", color: selectedModule ? "#3B82F6" : "#0F172A", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: F.body, padding: 0 }}>{selectedUni}</button></>}
            {selectedField && !selectedUni && <><span style={{ color: "#94A3B8" }}>/</span><button onClick={() => setSelectedModule(null)} style={{ background: "none", border: "none", color: selectedModule ? "#3B82F6" : "#0F172A", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: F.body, padding: 0 }}>{selectedField}</button></>}
            {selectedModule && <><span style={{ color: "#94A3B8" }}>/</span><span style={{ color: "#0F172A", fontSize: 13, fontWeight: 600, fontFamily: F.body }}>{selectedModule}</span></>}
          </div>
        )}

        {/* ══ UNIVERSITIES TAB ══ */}
        {activeTab === "universities" && !selectedUni && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {UNIVERSITIES.map(u => (
              <UniCard key={u.name} uni={u} onClick={() => setSelectedUni(u.name)} />
            ))}
          </div>
        )}

        {/* ── University selected: show its fields ── */}
        {activeTab === "universities" && selectedUni && !selectedModule && (
          <div>
            <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>{selectedUni}</h2>
            <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 28px" }}>Select a field of study to browse modules and materials</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {uni?.fields.map(field => (
                <FieldCard key={field.name} name={field.name} modules={field.modules} onClick={() => setSelectedField(field.name)} onModuleClick={(mod) => { setSelectedField(field.name); setSelectedModule(mod); }} />
              ))}
            </div>
          </div>
        )}

        {/* ══ FIELDS TAB ══ */}
        {activeTab === "fields" && !selectedField && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {FIELDS_OF_STUDY.map(f => {
              const count = SAMPLE_MATERIALS.filter(m => m.field === f).length;
              return (
                <div key={f} onClick={() => setSelectedField(f)} style={{ background: "#fff", borderRadius: 16, padding: "22px 20px", border: "1.5px solid #E8EAE3", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#3B82F6"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E8EAE3"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <svg width="20" height="20" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                  <h3 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>{f}</h3>
                  <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>{count} material{count !== 1 ? "s" : ""} available</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Field selected (from fields tab): show modules ── */}
        {activeTab === "fields" && selectedField && !selectedModule && (
          <FieldModulesView field={selectedField} onModuleClick={setSelectedModule} />
        )}

        {/* ── MATERIALS VIEW ── */}
        {selectedModule && (
          <MaterialsView
            freeMaterials={freeMaterials}
            premiumMaterials={premiumMaterials}
            selectedModule={selectedModule}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            onPremium={() => setShowPremiumModal(true)}
            onLogin={onLogin}
          />
        )}

      </div>

      {/* ── PREMIUM MODAL ── */}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} onSignUp={() => { setShowPremiumModal(false); onGetStarted(); }} />}

      {/* ── FOOTER ── */}
      <div style={{ background: "#0F172A", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#2D6A4F,#52B788)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontFamily: F.display }}>N</div>
          <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 900, color: "#fff" }}>KitsoLink</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>Built for Botswana · KitsoLink 2026</p>
      </div>
    </div>
  );
}

// ── Sub-components for PublicExplorePage ──────────────────────────────────────

function UniCard({ uni, onClick }: { uni: typeof UNIVERSITIES[0]; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const matCount = SAMPLE_MATERIALS.filter(m => m.university === uni.name).length;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ background: "#fff", borderRadius: 18, padding: "24px", border: hov ? "1.5px solid #3B82F6" : "1.5px solid #E8EAE3", cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? "0 8px 24px rgba(59,130,246,0.12)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#DBEAFE,#BFDBFE)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg width="22" height="22" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 4px", lineHeight: 1.3 }}>{uni.name}</h3>
      <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 14px" }}>{uni.location} · {uni.fields.length} fields</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {uni.fields.slice(0, 2).map(f => <span key={f.name} style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{f.name}</span>)}
        {uni.fields.length > 2 && <span style={{ background: "#F1F5F9", color: "#64748B", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>+{uni.fields.length - 2} more</span>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
        <span style={{ color: "#94A3B8", fontSize: 12 }}>{matCount} materials</span>
        <span style={{ color: "#3B82F6", fontSize: 13, fontWeight: 600 }}>Browse →</span>
      </div>
    </div>
  );
}

function FieldCard({ name, modules, onClick, onModuleClick }: { name: string; modules: string[]; onClick: () => void; onModuleClick: (m: string) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 16, padding: "20px", border: hov ? "1.5px solid #3B82F6" : "1.5px solid #E8EAE3", transition: "all 0.2s", boxShadow: hov ? "0 8px 24px rgba(59,130,246,0.1)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
      <h3 onClick={onClick} style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 14px", cursor: "pointer" }}>{name}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {modules.map(mod => {
          const count = SAMPLE_MATERIALS.filter(m => m.module === mod).length;
          return (
            <div key={mod} onClick={() => onModuleClick(mod)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "#F8FAFF", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#DBEAFE"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#F8FAFF"}>
              <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{mod}</span>
              <span style={{ fontSize: 11, color: "#64748B" }}>{count > 0 ? `${count} file${count > 1 ? "s" : ""}` : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldModulesView({ field, onModuleClick }: { field: string; onModuleClick: (m: string) => void }) {
  const allModules = UNIVERSITIES.flatMap(u => u.fields.filter(f => f.name === field).flatMap(f => f.modules));
  const unique = [...new Set(allModules)];
  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>{field}</h2>
      <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px" }}>Select a module to see available materials</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
        {unique.map(mod => {
          const count = SAMPLE_MATERIALS.filter(m => m.module === mod).length;
          return (
            <div key={mod} onClick={() => onModuleClick(mod)} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1.5px solid #E8EAE3", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#3B82F6"; (e.currentTarget as HTMLDivElement).style.background = "#EFF6FF"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E8EAE3"; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{mod}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>{count} material{count !== 1 ? "s" : ""}</p>
              </div>
              <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MaterialsView({ freeMaterials, premiumMaterials, selectedModule, selectedMaterial, setSelectedMaterial, onPremium, onLogin }: {
  freeMaterials: Material[]; premiumMaterials: Material[]; selectedModule: string;
  selectedMaterial: Material | null; setSelectedMaterial: (m: Material | null) => void;
  onPremium: () => void; onLogin: (r: Role) => void;
}) {
  const [tab, setTab] = useState<"free" | "premium">("free");

  if (selectedMaterial) return (
    <MaterialReader material={selectedMaterial} onBack={() => setSelectedMaterial(null)} onSignUp={() => onLogin("student")} />
  );

  const shown = tab === "free" ? freeMaterials : premiumMaterials;

  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
        {selectedModule}
      </h2>
      <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px" }}>{freeMaterials.length} free · {premiumMaterials.length} premium materials</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
        <button onClick={() => setTab("free")} style={{ padding: "8px 24px", borderRadius: 9, border: "none", background: tab === "free" ? "#fff" : "transparent", color: tab === "free" ? "#0F172A" : "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body, boxShadow: tab === "free" ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
          Free ({freeMaterials.length})
        </button>
        <button onClick={() => setTab("premium")} style={{ padding: "8px 24px", borderRadius: 9, border: "none", background: tab === "premium" ? "#fff" : "transparent", color: tab === "premium" ? "#D97706" : "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body, boxShadow: tab === "premium" ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
          Premium ({premiumMaterials.length})
        </button>
      </div>

      {tab === "premium" && (
        <div style={{ background: "linear-gradient(135deg,#FFF8E1,#FFF3CD)", border: "1px solid #FDE68A", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 15, color: "#92400E" }}>Premium Materials</p>
            <p style={{ margin: 0, fontSize: 13, color: "#B45309" }}>Subscribe to unlock all premium notes, past exam papers and textbooks.</p>
          </div>
          <button onClick={onPremium} style={{ background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Subscribe Now</button>
        </div>
      )}

      {shown.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>No {tab} materials for this module yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
          {shown.map(mat => (
            <MaterialCard key={mat.id} material={mat} onOpen={() => { if (mat.premium) { onPremium(); } else { setSelectedMaterial(mat); } }} />
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialCard({ material: m, onOpen }: { material: Material; onOpen: () => void }) {
  const [hov, setHov] = useState(false);
  const tc = TYPE_COLORS[m.type] || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onOpen}
      style={{ background: "#fff", borderRadius: 16, padding: "20px", border: hov ? "1.5px solid #3B82F6" : "1.5px solid #E8EAE3", cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 8px 20px rgba(59,130,246,0.1)" : "0 2px 6px rgba(0,0,0,0.04)", position: "relative" }}>
      {m.premium && <div style={{ position: "absolute", top: 14, right: 14, background: "#FFF8E1", color: "#B45309", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>Premium</div>}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <span style={{ background: tc.bg, color: tc.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{m.type}</span>
        <span style={{ color: "#94A3B8", fontSize: 12, alignSelf: "center" }}>{m.year}</span>
      </div>
      <h3 style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 8px", lineHeight: 1.4, paddingRight: m.premium ? 52 : 0 }}>{m.title}</h3>
      <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 14px", lineHeight: 1.5 }}>{m.preview.slice(0, 80)}...</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= Math.round(m.rating) ? "#F59E0B" : "#E2E8F0", fontSize: 12 }}>★</span>)}
          <span style={{ color: "#94A3B8", fontSize: 12, marginLeft: 4 }}>{m.rating}</span>
        </div>
        <span style={{ color: "#94A3B8", fontSize: 12 }}>{m.pages} pages · {m.downloads.toLocaleString()} views</span>
      </div>
    </div>
  );
}

function MaterialReader({ material: m, onBack, onSignUp }: { material: Material; onBack: () => void; onSignUp: () => void }) {
  const tc = TYPE_COLORS[m.type] || { bg: "#F1F5F9", color: "#64748B" };
  const freePages = Math.min(3, m.pages);
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 14, fontFamily: F.body, fontWeight: 600, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>← Back to Materials</button>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8EAE3", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A8A)", padding: "28px 28px 24px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{m.type}</span>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{m.year}</span>
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>{m.title}</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: "0 0 10px" }}>{m.university} · {m.module}</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[["Pages", String(m.pages)],["Views", m.downloads.toLocaleString()],["Rating", m.rating.toFixed(1)]].map(([l,v]) => (
              <div key={l}><p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</p><p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: F.mono }}>{v}</p></div>
            ))}
          </div>
        </div>
        {/* Preview pages */}
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Document Preview — {freePages} of {m.pages} pages</h4>
            <span style={{ background: "#DBEAFE", color: "#1E3A8A", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Free Preview</span>
          </div>
          {Array.from({ length: freePages }, (_, i) => (
            <div key={i} style={{ background: "#F8FAFF", border: "1px solid #E8EAE3", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Page {i + 1}</p>
              {i === 0 && <div style={{ background: "#EAF3FF", borderLeft: "3px solid #2563EB", borderRadius: "0 8px 8px 0", padding: "10px 14px", marginBottom: 10 }}><p style={{ margin: 0, fontSize: 13, color: "#1E3A8A", lineHeight: 1.6 }}><strong>Topics covered: </strong>{m.preview}</p></div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[0.9, 0.75, 0.85, 0.6, 0.8].map((w, j) => <div key={j} style={{ height: 9, background: "#E2E8F0", borderRadius: 4, width: `${w * 100}%` }} />)}
              </div>
            </div>
          ))}
          {/* Lock wall */}
          <div style={{ background: "linear-gradient(180deg,rgba(248,250,255,0) 0%,#F8FAFF 40%)", height: 60, marginTop: -60, position: "relative", zIndex: 1 }} />
          <div style={{ background: "linear-gradient(135deg,#FFF8E1,#FFF3CD)", border: "1px solid #FDE68A", borderRadius: 16, padding: "28px 24px", textAlign: "center", marginTop: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, color: "#92400E", margin: "0 0 8px" }}>Full Document Locked</h3>
            <p style={{ color: "#B45309", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>Sign up for free to access full documents, or subscribe for premium materials.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={onSignUp} style={{ background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Sign Up Free</button>
              <button onClick={onSignUp} style={{ background: "linear-gradient(135deg,#1E3A8A,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Subscribe for Premium</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumModal({ onClose, onSignUp }: { onClose: () => void; onSignUp: () => void }) {
  const plans = [
    { name: "Monthly", price: "P89", period: "/month", color: "#1E3A8A" },
    { name: "Per Semester", price: "P199", period: "/6 months", saves: "Save 55%", color: "#7C3AED", popular: true },
    { name: "Annual", price: "P299", period: "/year", saves: "Save 72%", color: "#059669" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 640, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A8A)", padding: "28px 28px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>KitsoLink</p><h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>Unlock Premium Materials</h2></div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 34, height: 34, fontSize: 16, cursor: "pointer", color: "#fff" }}>x</button>
        </div>
        <div style={{ padding: "24px 28px 28px" }}>
          <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>Get unlimited access to all premium notes, past exam papers, textbooks and more from every Botswana university.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            {plans.map(p => (
              <div key={p.name} style={{ borderRadius: 16, padding: "20px 16px", border: p.popular ? `2px solid ${p.color}` : "1.5px solid #E2E8F0", position: "relative", textAlign: "center", boxShadow: p.popular ? `0 4px 20px ${p.color}22` : "none" }}>
                {p.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: p.color, color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>Most Popular</div>}
                {p.saves && <div style={{ background: "#DBEAFE", color: "#1E3A8A", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, marginBottom: 8, display: "inline-block" }}>{p.saves}</div>}
                <h4 style={{ fontFamily: F.display, fontSize: 15, color: "#0F172A", margin: "0 0 8px" }}>{p.name}</h4>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginBottom: 16 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: p.color, fontFamily: F.mono }}>{p.price}</span>
                  <span style={{ color: "#94A3B8", fontSize: 12 }}>{p.period}</span>
                </div>
                <button onClick={onSignUp} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${p.color},${p.color}cc)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Subscribe</button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, margin: 0 }}>Secure payment · Cancel anytime · Instant access</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onChooseRole, onBack }: { onChooseRole: (r: Role) => void; onBack?: () => void }) {
 const roles: { role: Role; icon: string; title: string; desc: string; gradient: string }[] = [
 { role: "student", icon: "", title: "Student", desc: "Browse tutors, book sessions & track your learning journey.", gradient: "linear-gradient(135deg,#2D6A4F,#52B788)" },
 { role: "tutor", icon: "‍", title: "Tutor", desc: "Manage bookings, earn money & grow your student base.", gradient: "linear-gradient(135deg,#F4A228,#E07B00)" },
 { role: "admin", icon: "️", title: "Administrator", desc: "Monitor the platform, verify tutors & manage accounts.", gradient: "linear-gradient(135deg,#3B82F6,#6366F1)" },
 ];
 return (
 <div style={{ minHeight: "100vh", background: "#0D0F1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: F.body, position: "relative", overflow: "hidden" }}>
 {/* bg decoration */}
 <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,106,79,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
 <div style={{ position: "fixed", bottom: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
 <div style={{ textAlign: "center", marginBottom: 56, position: "relative" }}>
 <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
 <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#2D6A4F,#52B788)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}></div>
 <span style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: "#F0F2FF", letterSpacing: "-0.02em" }}>KitsoLink</span>
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
 <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 40 }}>
 {onBack && <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 16px", color: "#8892B0", fontSize: 13, cursor: "pointer", fontFamily: F.body }}>← Back to Explore</button>}
 <p style={{ color: "#4A5568", fontSize: 13, margin: 0 }}>Built for Botswana · KitsoLink 2026</p>
 </div>
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
 const [modules, setModules] = useState("");
 const [rate, setRate] = useState("");
 const [bio, setBio] = useState("");
 const [qualifications, setQualifications] = useState("");
 const [err, setErr] = useState("");

 const themeColor = role === "student" ? "#2D6A4F" : role === "tutor" ? "#F4A228" : "#3B82F6";
 const roleIcon: string = role === "student" ? "S" : role === "tutor" ? "T" : "A";

 const [submitting, setSubmitting] = useState(false);
 const [referralCode, setReferralCode] = useState("");

 const handleSubmit = async () => {
  setErr(""); setSubmitting(true);
  try {
   if (role === "admin") {
     if (email.toLowerCase() === "mark" && password === "mark12345") { onLogin(ADMIN_USER); }
     else { setErr("Invalid admin credentials."); }
     return;
   }
   if (mode === "login") {
     if (!email || !password) { setErr("Please enter your email and password."); return; }
     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
     if (error) { setErr(error.message); return; }
     if (data.user) {
       const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
       if (profile) onLogin({ id: profile.id, name: profile.name, email: data.user.email||"", role: profile.role as Role, avatar: profile.avatar||profile.name.slice(0,2).toUpperCase() });
       else setErr("Profile not found. Please register.");
     }
     return;
   }
   if (!name || !email || !password) { setErr("Please fill all required fields."); return; }
   if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
   const initials = name.split(" ").map((w:string) => w[0]).join("").toUpperCase().slice(0, 2);
   const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
   if (authErr) { setErr(authErr.message); return; }
   if (!authData.user) { setErr("Registration failed. Please try again."); return; }
   const uid = authData.user.id;
   const { error: profErr } = await supabase.from("profiles").insert({ id: uid, name, role, avatar: initials, university });
   if (profErr) { setErr(profErr.message); return; }
   if (role === "student") {
     await supabase.from("student_profiles").insert({ id: uid, course, year, plan: "free" });
     if (referralCode.trim()) {
       const { data: ref } = await supabase.from("student_profiles").select("id").eq("referral_code", referralCode.trim()).single();
       if (ref) await supabase.from("referrals").insert({ referrer_id: ref.id, referred_id: uid });
     }
   } else {
     await supabase.from("tutor_profiles").insert({ id: uid, modules: modules.split(",").map((s:string)=>s.trim()).filter(Boolean), qualifications: qualifications.split(",").map((q:string)=>q.trim()).filter(Boolean), bio, rate: parseFloat(rate)||80, available: true, verified: "pending" });
   }
   try { await fetch("/api/email", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type:"welcome", email, name, role }) }); } catch {}
   onLogin({ id: uid, name, email, role, avatar: initials });
  } catch(e: any) { setErr(e.message||"Something went wrong."); }
  finally { setSubmitting(false); }
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
 <>
 <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={inp} /></div>
 <div><label style={lbl}>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="••••••••" style={inp} /></div>
 </>
 ) : (
 <>
 <div><label style={lbl}>Full Name *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Thabang Mark" style={inp} /></div>
 <div><label style={lbl}>Email *</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={inp} /></div>
 <div><label style={lbl}>Password * (min 6 chars)</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp} /></div>
 <div><label style={lbl}>University / College</label><input value={university} onChange={e=>setUniversity(e.target.value)} placeholder="e.g. Botswana Accountancy College" style={inp} /></div>
 {role === "student" && (
 <>
 <div><label style={lbl}>Course</label><input value={course} onChange={e=>setCourse(e.target.value)} placeholder="e.g. Computer Science" style={inp} /></div>
 <div><label style={lbl}>Year of Study</label>
 <select value={year} onChange={e=>setYear(e.target.value)} style={{ ...inp }}>
 {["1st Year","2nd Year","3rd Year","4th Year","Postgraduate"].map(y => <option key={y}>{y}</option>)}
 </select>
 </div>
 <div><label style={lbl}>Referral Code (optional)</label><input value={referralCode} onChange={e=>setReferralCode(e.target.value)} placeholder="Enter a friend's code for 7 free Premium days" style={inp} /></div>
 </>
 )}
 {role === "tutor" && (
 <>
 <div><label style={lbl}>Modules (comma separated)</label><input value={modules} onChange={e=>setModules(e.target.value)} placeholder="e.g. Data Structures, Algorithms" style={inp} /></div>
 <div><label style={lbl}>Qualifications (comma separated)</label><input value={qualifications} onChange={e=>setQualifications(e.target.value)} placeholder="e.g. BSc Computer Science, Dean's List" style={inp} /></div>
 <div><label style={lbl}>Hourly Rate (BWP)</label><input value={rate} onChange={e=>setRate(e.target.value)} placeholder="e.g. 80" style={inp} /></div>
 <div><label style={lbl}>Bio</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} placeholder="Tell students about yourself..." style={{ ...inp, resize: "vertical" }} /></div>
 </>
 )}
 </>
 )}
 {err && <div style={{ background:"#FF6B6B22", border:"1px solid #FF6B6B44", borderRadius:10, padding:"10px 14px" }}><p style={{ color:"#FF6B6B", fontSize:13, margin:0, fontFamily:F.body }}>{err}</p></div>}
 {mode === "register" && role !== "admin" && <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"10px 14px" }}><p style={{ color:"#8892B0", fontSize:12, margin:0, fontFamily:F.body }}>{role === "tutor" ? "Your profile will be reviewed by admin before appearing to students." : "Check your email to confirm your account before signing in."}</p></div>}
 <button onClick={handleSubmit} disabled={submitting} style={{ background:submitting?"#4A5568":`linear-gradient(135deg,${themeColor},${themeColor}cc)`, color:"#fff", border:"none", borderRadius:12, padding:14, fontSize:15, fontWeight:700, cursor:submitting?"not-allowed":"pointer", fontFamily:F.body, marginTop:4 }}>
 {submitting ? "Please wait..." : role === "admin" ? "Sign In to Admin Panel →" : mode === "login" ? "Sign In →" : "Create Account →"}
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
function Shell({ navItems, activeTab, setActiveTab, user, theme, onLogout, headerRight, children }: {
 navItems: { id: string; label: string; icon: string; badge?: number }[];
 activeTab: string; setActiveTab: (t: string) => void;
 user: User; theme: AnyTheme; onLogout: () => void; headerRight?: React.ReactNode; children: React.ReactNode;
}) {
 return (
 <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: F.body }}>
 {/* Sidebar */}
 <aside style={{ width: 240, background: theme.sidebar, display: "flex", flexDirection: "column", padding: "24px 14px", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
 <div style={{ padding: "0 10px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}></div>
 <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 900, color: "#F0F2FF" }}>KitsoLink</span>
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
 <button onClick={onLogout} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}>
 Sign Out
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
 { id: "home", label: "Overview", icon: "◈" },
 { id: "tutors", label: "Find Tutors", icon: "‍" },
 { id: "bookings", label: "My Bookings", icon: "", badge: pendingBookings },
 { id: "messages", label: "Messages", icon: "", badge: unreadMsgs },
 { id: "payments", label: "Payments", icon: "" },
 { id: "reviews", label: "My Reviews", icon: "" },
 ];

 return (
 <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
 {tab === "home" && <StudentHome user={user} bookings={myBookings} tutors={tutors} messages={myMessages} theme={th} />}
 {tab === "tutors" && <StudentTutors user={user} tutors={tutors} bookings={bookings} setBookings={setBookings} setPayments={setPayments} reviews={reviews} theme={th} />}
 {tab === "bookings" && <StudentBookings user={user} bookings={myBookings} setBookings={setBookings} theme={th} />}
 {tab === "messages" && <StudentMessages user={user} messages={messages} setMessages={setMessages} tutors={tutors} theme={th} />}
 {tab === "payments" && <StudentPayments user={user} payments={payments.filter(p => p.studentId === user.id)} theme={th} />}
 {tab === "reviews" && <StudentReviews user={user} reviews={reviews.filter(r => r.studentId === user.id)} tutors={tutors} setReviews={setReviews} bookings={myBookings} theme={th} />}
      {tab === "upload" && <div style={{ maxWidth:720, margin:"0 auto" }}><PageHeader title="Upload Material" sub="Share study materials with fellow students" theme={th} /><MaterialUploadForm user={user} theme={th} onClose={() => setTab("home")} /></div>}
      {tab === "referral" && <div><PageHeader title="Refer a Friend" sub="Earn 7 free Premium days per referral" theme={th} /><ReferralWidget student={{ id: user.id, userId: user.id, name: user.name, avatar: user.avatar, university: "", course: "", year: "", joined: "", plan: "free", referralCode: user.id.slice(0,8) }} theme={th} /></div>}
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
 <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: theme.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Welcome back, {user.name.split("")[0]} </h1>
 <p style={{ color: theme.textSub, fontSize: 15, margin: 0 }}>Here's your learning overview for today</p>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
 {[
 { label: "Active Bookings", value: confirmed, icon: "", color: theme.accent },
 { label: "Sessions Done", value: completed, icon: "", color: theme.success },
 { label: "Unread Messages", value: unread, icon: "", color: theme.warning },
 { label: "Available Tutors", value: tutors.filter(t => t.available && t.verified === "approved").length, icon: "‍", color: "#6366F1" },
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
 {bookings.length === 0 ? <EmptyState icon="" text="No bookings yet — find a tutor to get started!" /> : bookings.slice(0, 4).map(b => (
 <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
 <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.tutorName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.module} · {b.date}</p></div>
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
 <p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{t.modules.slice(0, 2).join(", ")}</p>
 </div>
 <StarRow rating={t.rating || 0} />
 </div>
 ))}
 {tutors.filter(t => t.verified === "approved").length === 0 && <EmptyState icon="‍" text="No approved tutors yet" />}
 </div>
 </div>
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
      const [{ data: bData },{ data: pData }] = await Promise.all([supabase.from("bookings").select("*"), supabase.from("payments").select("*")]);
      if (bData) setBookings(bData.map((b:any)=>({ id:b.id, studentId:b.student_id, tutorId:b.tutor_id, studentName:b.student_name, tutorName:b.tutor_name, module:b.module, date:b.date, time:b.time, status:b.status, note:b.note||"", amount:b.amount, createdAt:b.created_at })));
      if (pData) setPayments(pData.map((p:any)=>({ id:p.id, studentId:p.student_id, tutorId:p.tutor_id, bookingId:p.booking_id, studentName:p.student_name, tutorName:p.tutor_name, amount:p.amount, status:p.status, date:new Date(p.created_at).toLocaleDateString("en-GB"), method:p.method||"Card" })));
      setBooked(true);
    } catch(e:any) { alert("Booking failed: " + e.message); }
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
 <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 8px" }}> {selected.university}</p>
 <StarRow rating={selected.rating} size={15} />
 <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginLeft: 8 }}>({selected.reviewCount} reviews)</span>
 </div>
 <div style={{ marginLeft: "auto", textAlign: "right" }}>
 <p style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>P{selected.rate}/hr</p>
 <span style={{ background: selected.available ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>{selected.available ? " Available" : " Busy"}</span>
 </div>
 </div>
 <div style={{ padding: "28px" }}>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
 <div><h4 style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>Modules</h4>{selected.modules.map(s => <span key={s} style={{ display: "inline-block", background: theme.accentLight, color: theme.accent, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, marginRight: 6, marginBottom: 6 }}>{s}</span>)}</div>
 <div><h4 style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>Qualifications</h4>{selected.qualifications.map(q => <p key={q} style={{ margin: "0 0 4px", fontSize: 13, color: theme.text }}> {q}</p>)}</div>
 <div><h4 style={{ color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>About</h4><p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.6 }}>{selected.bio || "No bio provided."}</p></div>
 </div>
 {!booked ? (
 <>
 {!bookModal ? (
 <button onClick={() => setBookModal(true)} disabled={!selected.available} style={{ background: selected.available ? theme.gradient : "#e2e8f0", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: selected.available ? "pointer" : "not-allowed", fontFamily: F.body }}> Book a Session</button>
 ) : (
 <div style={{ background: theme.bg, border: `1.5px solid ${theme.accent}`, borderRadius: 16, padding: 24 }}>
 <h4 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 18px" }}>Book a Session with {selected.name}</h4>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
 <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></div>
 <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} /></div>
 </div>
 <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Module</label><input value={module} onChange={e => setModule(e.target.value)} placeholder="e.g. Binary Trees, SQL Joins" style={inp} /></div>
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
 <p style={{ color: "#2D6A4F", fontWeight: 700, margin: "0 0 4px", fontSize: 15 }}> Booking Requested!</p>
 <p style={{ color: "#2D6A4F", margin: 0, fontSize: 13 }}>Your session request has been sent to {selected.name}. They will confirm shortly.</p>
 </div>
 )}
 </div>
 </div>
 {/* Reviews */}
 <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
 <h3 style={{ fontFamily: F.display, fontSize: 20, color: theme.text, margin: "0 0 20px" }}>Student Reviews</h3>
 {tutorReviews.length === 0 ? <EmptyState icon="" text="No reviews yet for this tutor" /> : tutorReviews.map(r => (
 <div key={r.id} style={{ padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <Avatar initials={r.studentName.split("").map(w=>w[0]).join("").slice(0,2)} size={32} />
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
 <span style={{ fontSize: 16, marginRight: 8 }}></span>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or module..." style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: theme.text, background: "transparent", fontFamily: F.body, padding: "13px 0" }} />
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
 {filtered.length === 0 ? <div style={{ gridColumn: "1/-1" }}><EmptyState icon="‍" text="No approved tutors match your search" /></div> : filtered.map(t => (
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
 <p style={{ color: theme.textSub, fontSize: 12, margin: "0 0 6px" }}> {tutor.university}</p>
 <StarRow rating={tutor.rating} /><span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 4 }}>({reviews.length})</span>
 </div>
 <span style={{ background: tutor.available ? "#D8F3DC" : "#FEE2E2", color: tutor.available ? "#2D6A4F" : "#DC2626", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>{tutor.available ? "Available" : "Busy"}</span>
 </div>
 <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
 {tutor.modules.slice(0, 3).map(s => <span key={s} style={{ background: theme.accentLight, color: theme.accent, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{s}</span>)}
 {tutor.modules.length > 3 && <span style={{ background: theme.border, color: theme.textMuted, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>+{tutor.modules.length - 3}</span>}
 </div>
 <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
 <p style={{ margin: 0, fontSize: 13, color: theme.textSub, lineHeight: 1.4 }}>{tutor.bio?.slice(0, 60)}...</p>
 <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: theme.accent, flexShrink: 0, marginLeft: 8 }}>P{tutor.rate}/hr</span>
 </div>
 </div>
 );
}

function StudentBookings({ user, bookings, setBookings, theme }: { user: User; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; theme: AnyTheme }) {
  const cancel = async (id: number) => { await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id); setBookings(p => p.map(b => b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b)); };
 return (
 <div>
 <PageHeader title="My Bookings" sub={`${bookings.length} total bookings`} theme={th} />
 {bookings.length === 0 ? <EmptyState icon="" text="No bookings yet — find a tutor and book your first session!" /> : (
 <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
 {bookings.map(b => (
 <div key={b.id} style={{ background: theme.card, borderRadius: 16, padding: 20, border: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
 <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
 <Avatar initials={b.tutorName.split("").map(w=>w[0]).join("").slice(0,2)} size={44} gradient={theme.gradient} />
 <div>
 <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: theme.text }}>{b.tutorName}</p>
 <p style={{ margin: "0 0 2px", fontSize: 13, color: theme.textSub }}>{b.module}</p>
 <p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}> {b.date} at {b.time}</p>
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
 const [activeConv, setActiveConv] = useState<string | null>(null);
 const [newMsg, setNewMsg] = useState("");
 const endRef = useRef<HTMLDivElement>(null);

 const conversations = tutors.map(t => {
 const msgs = messages.filter(m => (m.senderId === user.id && m.receiverId === t.userId) || (m.senderId === t.userId && m.receiverId === user.id));
 return { tutor: t, msgs, lastMsg: msgs[msgs.length - 1], unread: msgs.filter(m => m.receiverId === user.id && !m.read).length };
 }).filter(c => c.msgs.length > 0 || activeConv === c.tutor.userId);

 const activeTutor = tutors.find(t => t.userId === activeConv);
 const convMsgs = activeConv ? messages.filter(m => (m.senderId === user.id && m.receiverId === activeConv) || (m.senderId === activeConv && m.receiverId === user.id)) : [];

 useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convMsgs.length]);

  const sendMsg = async () => {
    if (!newMsg.trim() || !activeConv) return;
    const text = newMsg; setNewMsg("");
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: activeConv, sender_name: user.name, text, read: false });
    const { data } = await supabase.from("messages").select("*").order("created_at");
    if (data) setMessages(data.map((m:any)=>({ id:m.id, senderId:m.sender_id, receiverId:m.receiver_id, senderName:m.sender_name, text:m.text, read:m.read, timestamp:new Date(m.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) })));
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
 <p style={{ margin: 0, fontSize: 11, color: theme.textMuted }}>{t.modules[0]}</p>
 </div>
 </div>
 ))}
 {tutors.filter(t => t.verified === "approved").length === 0 && <EmptyState icon="" text="No approved tutors to message" />}
 </div>
 </div>
 {/* Chat area */}
 <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
 {!activeConv ? (
 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
 <EmptyState icon="" text="Select a tutor to start messaging" />
 </div>
 ) : (
 <>
 <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12 }}>
 <Avatar initials={activeTutor?.avatar || "??"} size={36} gradient={theme.gradient} />
 <div><p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: theme.text }}>{activeTutor?.name}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{activeTutor?.available ? " Available" : " Busy"}</p></div>
 </div>
 <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
 {convMsgs.length === 0 && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState icon="" text="No messages yet — say hello!" /></div>}
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
 { label: "Total Spent", value: `P${total}`, icon: "", color: theme.danger },
 { label: "Pending", value: `P${payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0)}`, icon: "", color: theme.warning },
 { label: "Sessions Paid", value: payments.filter(p => p.status === "completed").length, icon: "", color: theme.success },
 ].map(s => (
 <div key={s.label} style={{ background: theme.card, borderRadius: 14, padding: "20px", border: `1px solid ${theme.border}` }}>
 <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
 <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
 </div>
 ))}
 </div>
 <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
 <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}><h3 style={{ margin: 0, fontFamily: F.display, fontSize: 18, color: theme.text }}>Transaction History</h3></div>
 {payments.length === 0 ? <EmptyState icon="" text="No transactions yet" /> : payments.map(p => (
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
 const [selTutor, setSelTutor] = useState<string | null>(null);
 const [rating, setRating] = useState(0);
 const [comment, setComment] = useState("");

 const completedTutors = [...new Set(bookings.filter(b => b.status === "completed").map(b => b.tutorId))];
  const submit = async () => {
    if (!selTutor || !rating || !comment) { alert("Please fill all fields."); return; }
    const tutor = tutors.find(t => t.id === selTutor);
    if (!tutor) return;
    const { data: newRev } = await supabase.from("reviews").insert({ student_id: user.id, tutor_id: selTutor, student_name: user.name, tutor_name: tutor.name, rating, comment }).select().single();
    if (newRev) setReviews(p => [...p, { id: newRev.id, studentId: user.id, tutorId: selTutor as string, studentName: user.name, tutorName: tutor.name, rating, comment, date: new Date(newRev.created_at).toLocaleDateString("en-GB",{month:"short",year:"numeric"}), flagged: false, hidden: false }]);
    const tutorRevs = [...reviews.filter(r=>r.tutorId===selTutor), { rating }];
    const avg = parseFloat((tutorRevs.reduce((s:number,r:any)=>s+r.rating,0)/tutorRevs.length).toFixed(1));
    await supabase.from("tutor_profiles").update({ rating: avg, review_count: tutorRevs.length }).eq("id", selTutor);
    setShowForm(false); setRating(0); setComment(""); setSelTutor(null);
  };

 return (
 <div>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
 <PageHeader title="My Reviews" sub={`${reviews.length} reviews written`} theme={th} inline />
 {completedTutors.length > 0 && <button onClick={() => setShowForm(true)} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>️ Write a Review</button>}
 </div>
 {showForm && (
 <div style={{ background: theme.card, border: `1.5px solid ${theme.accent}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
 <h4 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 18px" }}>Write a Review</h4>
 <div style={{ marginBottom: 14 }}>
 <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Select Tutor</label>
 <select value={selTutor || ""} onChange={e => setSelTutor(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none" }}>
 <option value="">— Select a tutor —</option>
 {completedTutors.map(id => { const t = tutors.find(t => t.id === id); return t ? <option key={id} value={id}>{t.name}</option> : null; })}
 </select>
 </div>
 <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Rating</label><StarPicker value={rating} onChange={setRating} /></div>
 <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.textSub, marginBottom: 6, textTransform: "uppercase" }}>Comment</label><textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontFamily: F.body, outline: "none", resize: "vertical", boxSizing: "border-box" }} /></div>
 <div style={{ display: "flex", gap: 10 }}><button onClick={submit} style={{ background: theme.gradient, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Submit Review</button><button onClick={() => setShowForm(false)} style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textSub, borderRadius: 10, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: F.body }}>Cancel</button></div>
 </div>
 )}
 {reviews.length === 0 ? <EmptyState icon="" text="No reviews yet. Complete a session to leave a review!" /> : reviews.map(r => (
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
 const { tutors, setTutors, bookings, setBookings, messages, setMessages, reviews, payments, setPayments, onLogout } = shared;

 const myProfile = tutors.find(t => t.userId === user.id);
 const myBookings = bookings.filter(b => b.tutorId === (myProfile?.id || -1));
 const myMessages = messages.filter(m => m.receiverId === user.id);
 const newRequests = myBookings.filter(b => b.status === "pending").length;
 const unreadMsgs = myMessages.filter(m => !m.read).length;

 const navItems = [
 { id: "home", label: "Overview", icon: "◈" },
 { id: "requests", label: "Student Requests", icon: "", badge: newRequests },
 { id: "schedule", label: "Schedule", icon: "" },
 { id: "messages", label: "Messages", icon: "", badge: unreadMsgs },
 { id: "earnings", label: "Earnings", icon: "" },
 { id: "reviews", label: "My Reviews", icon: "" },
 { id: "profile", label: "My Profile", icon: "" },
 ];

 if (!myProfile) return (
 <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
 <EmptyState icon="" text="Your profile is being set up. Please refresh or contact admin if this persists." />
 </Shell>
 );

 return (
 <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
 {tab === "home" && <TutorHome profile={myProfile} bookings={myBookings} messages={myMessages} reviews={reviews.filter(r => r.tutorId === myProfile.id)} theme={th} />}
 {tab === "requests" && <TutorRequests profile={myProfile} bookings={myBookings} setBookings={setBookings} setPayments={setPayments} theme={th} />}
 {tab === "schedule" && <TutorSchedule profile={myProfile} bookings={myBookings} setTutors={setTutors} theme={th} />}
 {tab === "messages" && <TutorMessages user={user} messages={messages} setMessages={setMessages} bookings={myBookings} theme={th} />}
 {tab === "earnings" && <TutorEarnings profile={myProfile} bookings={myBookings} payments={payments.filter(p => p.tutorId === myProfile.id)} theme={th} />}
 {tab === "reviews" && <TutorReviewsTab reviews={reviews.filter(r => r.tutorId === myProfile.id)} theme={th} />}
 {tab === "profile" && <TutorProfileTab profile={myProfile} setTutors={setTutors} theme={th} />}
      {tab === "upload" && <div style={{ maxWidth:720, margin:"0 auto" }}><PageHeader title="Upload Material" sub="Share your study materials with students" theme={th} tutor /><MaterialUploadForm user={user} theme={th} onClose={() => setTab("home")} /></div>}
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
 <h1 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 900, color: theme.text, margin: 0, letterSpacing: "-0.02em" }}>Welcome, {profile.name.split("")[0]}</h1>
 {profile.verified === "pending" && <Badge label="Verification Pending" color={theme.warning} bg={theme.accentLight} />}
 {profile.verified === "approved" && <Badge label=" Verified" color={theme.success} bg="rgba(67,217,173,0.12)" />}
 {profile.verified === "rejected" && <Badge label="Not Verified" color={theme.danger} bg="rgba(255,107,107,0.12)" />}
 </div>
 <p style={{ color: theme.textSub, fontSize: 15, margin: 0 }}>{profile.verified === "pending" ? "Your profile is under review by admin." : "Here's your tutoring dashboard overview."}</p>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
 {[
 { label: "Pending Requests", value: pending, icon: "", color: theme.warning },
 { label: "Active Sessions", value: confirmed, icon: "", color: theme.accent },
 { label: "Total Earned", value: `P${earned}`, icon: "", color: theme.success },
 { label: "Avg. Rating", value: avgRating, icon: "", color: "#F59E0B" },
 { label: "Unread Messages", value: unread, icon: "", color: "#6366F1" },
 { label: "Total Reviews", value: reviews.length, icon: "", color: theme.textSub },
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
 {bookings.filter(b => b.status === "pending").slice(0, 4).length === 0 ? <EmptyState icon="" text="No pending requests" /> : bookings.filter(b => b.status === "pending").slice(0, 4).map(b => (
 <div key={b.id} style={{ padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
 <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.studentName}</p>
 <p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.module} · {b.date}</p>
 </div>
 ))}
 </div>
 <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
 <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 16px" }}>Recent Reviews</h3>
 {reviews.slice(0, 3).length === 0 ? <EmptyState icon="" text="No reviews yet" /> : reviews.slice(0, 3).map(r => (
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

function TutorRequests({ profile, bookings, setBookings, setPayments, theme }: { profile: TutorProfile; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>; theme: AnyTheme }) {
  const updateStatus = async (id: number, status: BookingStatus) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
    if (status === "completed") { await supabase.from("payments").update({ status: "completed" }).eq("booking_id", id); }
  };
  const confirm = (id: number) => updateStatus(id, "confirmed");
  const decline = (id: number) => updateStatus(id, "cancelled");
  const complete = (id: number) => updateStatus(id, "completed");
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
 <Avatar initials={b.studentName.split("").map(w=>w[0]).join("").slice(0,2)} size={44} gradient={theme.gradient} />
 <div><p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: theme.text }}>{b.studentName}</p><p style={{ margin: "0 0 2px", fontSize: 13, color: theme.textSub }}>{b.module}</p><p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}> {b.date} at {b.time}</p></div>
 </div>
 <p style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: theme.accent, margin: 0 }}>P{b.amount}</p>
 </div>
 {b.note && <div style={{ background: theme.accentLight, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}><p style={{ margin: 0, fontSize: 13, color: theme.accent }}> {b.note}</p></div>}
 <div style={{ display: "flex", gap: 10 }}>
 <button onClick={() => confirm(b.id)} style={{ background: theme.gradient, color: "#0D0F1A", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}> Accept</button>
 <button onClick={() => decline(b.id)} style={{ background: "rgba(255,107,107,0.12)", color: theme.danger, border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}> Decline</button>
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
 <Avatar initials={b.studentName.split("").map(w=>w[0]).join("").slice(0,2)} size={36} gradient={theme.gradient} />
 <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.studentName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.module} · {b.date}</p></div>
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <StatusBadge status={b.status} />
 {b.status === "confirmed" && <button onClick={() => complete(b.id)} style={{ background: "rgba(67,217,173,0.15)", color: theme.success, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Mark Complete</button>}
 </div>
 </div>
 ))}
 </div>
 )}
 {bookings.length === 0 && <EmptyState icon="" text="No student requests yet" />}
 </div>
 );
}

function TutorSchedule({ profile, bookings, setTutors, theme }: { profile: TutorProfile; bookings: Booking[]; setTutors: React.Dispatch<React.SetStateAction<TutorProfile[]>>; theme: AnyTheme }) {
  const toggleAvail = async () => { const v = !profile.available; await supabase.from("tutor_profiles").update({ available: v }).eq("id", profile.id); setTutors(p => p.map(t => t.id === profile.id ? { ...t, available: v } : t)); };
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
 <p style={{ margin: 0, color: profile.available ? theme.success : theme.danger, fontSize: 14, fontWeight: 600 }}>{profile.available ? " You are available — students can book sessions" : " You are unavailable — new bookings are paused"}</p>
 </div>
 </div>
 <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
 <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 20px" }}>Upcoming Sessions ({upcoming.length})</h3>
 {upcoming.length === 0 ? <EmptyState icon="" text="No upcoming sessions" /> : upcoming.map(b => (
 <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
 <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
 <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}></div>
 <div><p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: theme.text }}>{b.studentName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.module}</p></div>
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
 const [activeConv, setActiveConv] = useState<string | null>(null);
 const [newMsg, setNewMsg] = useState("");
 const endRef = useRef<HTMLDivElement>(null);

 // Find unique students who booked
 const studentIds = [...new Set(bookings.map(b => b.studentId))];
 const convMsgs = activeConv ? messages.filter(m => (m.senderId === user.id && m.receiverId === activeConv) || (m.senderId === activeConv && m.receiverId === user.id)) : [];

 useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convMsgs.length]);

  const sendMsg = async () => {
    if (!newMsg.trim() || !activeConv) return;
    const text = newMsg; setNewMsg("");
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: activeConv, sender_name: user.name, text, read: false });
    const { data } = await supabase.from("messages").select("*").order("created_at");
    if (data) setMessages(data.map((m:any)=>({ id:m.id, senderId:m.sender_id, receiverId:m.receiver_id, senderName:m.sender_name, text:m.text, read:m.read, timestamp:new Date(m.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) })));
  };

 const getStudentName = (id: string) => bookings.find(b => b.studentId === id)?.studentName || "Student";

 return (
 <div>
 <PageHeader title="Messages" sub="Chat with your students" theme={th} tutor />
 <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, height: 600 }}>
 <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
 <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}` }}><p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Students</p></div>
 <div style={{ padding: 10 }}>
 {studentIds.length === 0 ? <EmptyState icon="" text="No student conversations" /> : studentIds.map(id => (
 <div key={id} onClick={() => { setActiveConv(id); setMessages(p => p.map(m => m.receiverId === user.id && m.senderId === id ? { ...m, read: true } : m)); }}
 style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: activeConv === id ? theme.accentLight : "transparent", marginBottom: 4 }}>
 <Avatar initials={getStudentName(id).split("").map(w=>w[0]).join("").slice(0,2)} size={34} gradient={theme.gradient} />
 <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.text }}>{getStudentName(id)}</p>
 </div>
 ))}
 </div>
 </div>
 <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
 {!activeConv ? (
 <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState icon="" text="Select a student to chat" /></div>
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
 { label: "Total Earned", value: `P${total}`, icon: "", color: theme.accent },
 { label: "Pending Payout", value: `P${pending}`, icon: "", color: theme.warning },
 { label: "Sessions Done", value: completed.length, icon: "", color: theme.success },
 { label: "Hourly Rate", value: `P${profile.rate}/hr`, icon: "", color: "#6366F1" },
 ].map(s => (
 <div key={s.label} style={{ background: theme.card, borderRadius: 16, padding: "20px", border: `1px solid ${theme.border}` }}>
 <p style={{ margin: "0 0 8px", fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
 <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: theme.text, fontFamily: F.mono }}>{s.value}</p>
 </div>
 ))}
 </div>
 <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
 <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}><h3 style={{ margin: 0, fontFamily: F.display, fontSize: 18, color: theme.text }}>Earnings History</h3></div>
 {completed.length === 0 ? <EmptyState icon="" text="No completed sessions yet" /> : completed.map(b => (
 <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, alignItems: "center" }}>
 <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{b.studentName}</span>
 <span style={{ fontSize: 12, color: theme.textSub }}>{b.module} · {b.date}</span>
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
 {reviews.length === 0 ? <EmptyState icon="" text="No reviews yet — complete sessions to get reviews" /> : reviews.map(r => (
 <div key={r.id} style={{ background: theme.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${theme.border}`, marginBottom: 10 }}>
 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <Avatar initials={r.studentName.split("").map(w=>w[0]).join("").slice(0,2)} size={32} gradient={theme.gradient} />
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
 const [modules, setModules] = useState(profile.modules.join(", "));
 const [qualifications, setQualifications] = useState(profile.qualifications.join(", "));
 const [saved, setSaved] = useState(false);
  const save = async () => {
    const mods = modules.split(",").map((s:string)=>s.trim()).filter(Boolean);
    const quals = qualifications.split(",").map((q:string)=>q.trim()).filter(Boolean);
    const r = parseFloat(rate) || profile.rate;
    await supabase.from("tutor_profiles").update({ bio, rate: r, modules: mods, qualifications: quals }).eq("id", profile.id);
    setTutors(p => p.map(t => t.id === profile.id ? { ...t, bio, rate: r, modules: mods, qualifications: quals } : t));
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
 <p style={{ color: theme.textSub, margin: "0 0 8px", fontSize: 14 }}> {profile.university}</p>
 <Badge label={profile.verified === "approved" ? " Verified Tutor" : profile.verified === "pending" ? " Pending Verification" : " Not Verified"} color={profile.verified === "approved" ? theme.success : profile.verified === "pending" ? theme.warning : theme.danger} bg={profile.verified === "approved" ? "rgba(67,217,173,0.12)" : profile.verified === "pending" ? theme.accentLight : "rgba(255,107,107,0.12)"} />
 </div>
 </div>
 </div>
 <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
 <label style={lbl}>Bio</label>
 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inp, resize: "vertical" }} />
 </div>
 <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}` }}>
 <div style={{ marginBottom: 14 }}><label style={lbl}>Hourly Rate (BWP)</label><input value={rate} onChange={e => setRate(e.target.value)} style={inp} /></div>
 <div><label style={lbl}>Modules (comma separated)</label><input value={modules} onChange={e => setModules(e.target.value)} style={inp} /></div>
 </div>
 <div style={{ background: theme.card, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, gridColumn: "1/-1" }}>
 <label style={lbl}>Qualifications (comma separated)</label>
 <input value={qualifications} onChange={e => setQualifications(e.target.value)} style={inp} />
 </div>
 </div>
 <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
 <button onClick={save} style={{ background: theme.gradient, color: "#0D0F1A", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Save Changes</button>
 {saved && <span style={{ color: theme.success, fontSize: 14, fontWeight: 600 }}> Saved successfully!</span>}
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
 { id: "overview", label: "Overview", icon: "◈" },
 { id: "students", label: "Students", icon: "" },
 { id: "tutors", label: "Tutors", icon: "‍" },
 { id: "verification", label: "Verification", icon: "", badge: pendingVerif },
 { id: "payments", label: "Payments", icon: "" },
 { id: "reviews", label: "Reviews", icon: "" },
 { id: "maintenance", label: "Maintenance", icon: "" },
 ];

 return (
 <Shell navItems={navItems} activeTab={tab} setActiveTab={setTab} user={user} theme={th} onLogout={onLogout}>
 {tab === "overview" && <AdminOverview tutors={tutors} students={students} bookings={bookings} reviews={reviews} payments={payments} theme={th} />}
 {tab === "students" && <AdminStudents students={students} setStudents={setStudents} theme={th} />}
 {tab === "tutors" && <AdminTutors tutors={tutors} setTutors={setTutors} theme={th} />}
 {tab === "verification" && <AdminVerification tutors={tutors} setTutors={setTutors} theme={th} />}
 {tab === "payments" && <AdminPayments payments={payments} bookings={bookings} theme={th} />}
 {tab === "reviews" && <AdminReviews reviews={reviews} setReviews={setReviews} theme={th} />}
 {tab === "maintenance" && <AdminMaintenance theme={th} />}
 </Shell>
 );
}

function AdminOverview({ tutors, students, bookings, reviews, payments, theme }: { tutors: TutorProfile[]; students: StudentProfile[]; bookings: Booking[]; reviews: Review[]; payments: Payment[]; theme: AnyTheme }) {
 const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
 const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
 const stats = [
 { label: "Total Students", value: students.length, icon: "", color: theme.accent },
 { label: "Total Tutors", value: tutors.length, icon: "‍", color: "#10B981" },
 { label: "Total Bookings", value: bookings.length, icon: "", color: "#F59E0B" },
 { label: "Platform Revenue", value: `P${totalRevenue}`, icon: "", color: "#8B5CF6" },
 { label: "Total Reviews", value: reviews.length, icon: "", color: "#F59E0B" },
 { label: "Avg. Rating", value: avgRating, icon: "", color: theme.accent },
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
 <div><p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{b.studentName} → {b.tutorName}</p><p style={{ margin: 0, fontSize: 12, color: theme.textSub }}>{b.module} · {b.date}</p></div>
 <StatusBadge status={b.status} />
 </div>
 ))}
 {bookings.length === 0 && <EmptyState icon="" text="No bookings yet" />}
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
  const remove = async (id: string) => { if (window.confirm('Delete this student?')) { await supabase.from('profiles').delete().eq('id', id); setStudents(p => p.filter(s => s.id !== id)); } };
 return (
 <div>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
 <PageHeader title="Student Accounts" sub={`${students.length} registered students`} theme={th} inline />
 <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 14px" }}>
 <span></span>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ border: "none", outline: "none", fontSize: 13, fontFamily: F.body, color: theme.text, background: "transparent" }} />
 </div>
 </div>
 <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
 <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr 1fr 80px", padding: "12px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.accentLight }}>
 {["Name","University","Course","Year","Plan",""].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
 </div>
 {filtered.length === 0 ? <EmptyState icon="" text="No students registered yet" /> : filtered.map(s => (
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
  const remove = async (id: string) => { if (window.confirm('Delete this tutor?')) { await supabase.from('profiles').delete().eq('id', id); setTutors(p => p.filter(t => t.id !== id)); } };
  const suspend = async (id: string) => { const t = tutors.find(t=>t.id===id); if(!t) return; const v = !t.available; await supabase.from("tutor_profiles").update({ available: v }).eq("id", id); setTutors(p => p.map(t => t.id === id ? { ...t, available: v } : t)); };
 return (
 <div>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
 <PageHeader title="Tutor Accounts" sub={`${tutors.length} registered tutors`} theme={th} inline />
 <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 14px" }}>
 <span></span>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tutors..." style={{ border: "none", outline: "none", fontSize: 13, fontFamily: F.body, color: theme.text, background: "transparent" }} />
 </div>
 </div>
 <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
 <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.8fr 120px", padding: "12px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.accentLight }}>
 {["Name","University","Rate","Rating","Status","Verified",""].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
 </div>
 {filtered.length === 0 ? <EmptyState icon="‍" text="No tutors registered yet" /> : filtered.map(t => (
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
  const approve = async (id: string) => { await supabase.from("tutor_profiles").update({ verified: "approved" }).eq("id", id); setTutors(p => p.map(t => t.id === id ? { ...t, verified: "approved" as VerifStatus } : t)); try { const tutor = tutors.find(t=>t.id===id); if(tutor) await fetch("/api/email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"tutor_verification",tutorEmail:tutor.email||"",tutorName:tutor.name,approved:true})}); } catch {} };
  const reject = async (id: string) => { await supabase.from("tutor_profiles").update({ verified: "rejected" }).eq("id", id); setTutors(p => p.map(t => t.id === id ? { ...t, verified: "rejected" as VerifStatus } : t)); try { const tutor = tutors.find(t=>t.id===id); if(tutor) await fetch("/api/email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"tutor_verification",tutorEmail:tutor.email||"",tutorName:tutor.name,approved:false})}); } catch {} };
 const pending = tutors.filter(t => t.verified === "pending");
 const reviewed = tutors.filter(t => t.verified !== "pending");
 return (
 <div>
 <PageHeader title="Tutor Verification" sub="Review and approve tutor applications" theme={th} />
 <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>Pending ({pending.length})</p>
 {pending.length === 0 ? <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, marginBottom: 24 }}><EmptyState icon="" text="All caught up! No pending verifications" /></div> : (
 <div style={{ marginBottom: 28 }}>
 {pending.map(t => (
 <div key={t.id} style={{ background: theme.card, borderRadius: 16, padding: 22, border: `1.5px solid ${theme.warning}55`, marginBottom: 12 }}>
 <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 14 }}>
 <Avatar initials={t.avatar} size={52} gradient="linear-gradient(135deg,#F4A228,#E07B00)" />
 <div style={{ flex: 1 }}>
 <h3 style={{ fontFamily: F.display, fontSize: 18, color: theme.text, margin: "0 0 4px" }}>{t.name}</h3>
 <p style={{ color: theme.textSub, fontSize: 13, margin: "0 0 8px" }}> {t.university} · P{t.rate}/hr</p>
 <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
 {t.modules.map(s => <span key={s} style={{ background: "#EFF6FF", color: theme.accent, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{s}</span>)}
 </div>
 {t.qualifications.length > 0 && <p style={{ color: theme.textSub, fontSize: 13, margin: "0 0 6px" }}> {t.qualifications.join(" · ")}</p>}
 {t.bio && <p style={{ color: theme.textSub, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{t.bio}</p>}
 </div>
 </div>
 <div style={{ display: "flex", gap: 10 }}>
 <button onClick={() => approve(t.id)} style={{ background: "#D1FAE5", color: theme.success, border: "none", borderRadius: 10, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}> Approve</button>
 <button onClick={() => reject(t.id)} style={{ background: "#FEE2E2", color: theme.danger, border: "none", borderRadius: 10, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}> Reject</button>
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
 { label: "Total Revenue", value: `P${total}`, icon: "", color: theme.success },
 { label: "Pending", value: `P${pending}`, icon: "", color: theme.warning },
 { label: "Transactions", value: payments.length, icon: "", color: theme.accent },
 { label: "Total Bookings", value: bookings.length, icon: "", color: "#8B5CF6" },
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
 {payments.length === 0 ? <EmptyState icon="" text="No transactions yet" /> : payments.map(p => (
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
  const toggleFlag = async (id: number) => { const r = reviews.find(r=>r.id===id); if(!r) return; await supabase.from("reviews").update({ flagged: !r.flagged }).eq("id", id); setReviews(p => p.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r)); };
  const toggleHide = async (id: number) => { const r = reviews.find(r=>r.id===id); if(!r) return; await supabase.from("reviews").update({ hidden: !r.hidden }).eq("id", id); setReviews(p => p.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r)); };
  const del = async (id: number) => { if (window.confirm("Delete this review?")) { await supabase.from("reviews").delete().eq("id", id); setReviews(p => p.filter(r => r.id !== id)); } };
 const visible = reviews.filter(r => filter === "all" ? true : filter === "flagged" ? r.flagged : r.hidden);
 const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
 return (
 <div>
 <PageHeader title="Reviews & Ratings" sub="Monitor and moderate all platform reviews" theme={th} />
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
 {[
 { label: "Avg Rating", value: avg, icon: "" },
 { label: "Total Reviews", value: reviews.length, icon: "" },
 { label: "Flagged", value: reviews.filter(r => r.flagged).length, icon: "" },
 { label: "Hidden", value: reviews.filter(r => r.hidden).length, icon: "" },
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
 {visible.length === 0 ? <EmptyState icon="" text="No reviews found" /> : visible.map(r => (
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
 {r.hidden && <Badge label="Hidden" color={theme.textMuted} bg={theme.border} />}
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
 const action = (label: string) => { setMsg(`${label}...`); setTimeout(() => { setMsg(`${label} `); setTimeout(() => setMsg(""), 3000); }, 1200); };
 const toggle = (k: keyof typeof settings) => setSettings(p => ({ ...p, [k]: !p[k] }));
 const items: { key: keyof typeof settings; label: string; desc: string; danger?: boolean }[] = [
 { key: "registration", label: "Student Registration", desc: "Allow new students to sign up" },
 { key: "payments", label: "Payment Processing", desc: "Enable subscription payments" },
 { key: "tutorMarket", label: "Tutor Marketplace", desc: "Students can browse & book tutors" },
 { key: "emails", label: "Email Notifications", desc: "Send automated email alerts" },
 { key: "autoApprove", label: "Auto-Approve Tutors", desc: "Skip manual verification — not recommended" },
 { key: "maintenance", label: "Maintenance Mode", desc: "Redirect all users to maintenance page", danger: true },
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
 <button onClick={() => window.confirm("Purge all reviews?") && alert("Reviews purged.")} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${theme.danger}44`, background: "#FEE2E2", color: theme.danger, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}> Purge All Reviews</button>
 <button onClick={() => window.confirm("Reset the entire platform?") && alert("Platform reset.")} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${theme.danger}44`, background: "#FEE2E2", color: theme.danger, fontSize: 13, cursor: "pointer", fontFamily: F.body, textAlign: "left" }}> Reset Platform Data</button>
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
 pending: { label: "Pending", color: "#D97706", bg: "#FFF3CD" },
 confirmed: { label: "Confirmed", color: "#2563EB", bg: "#DBEAFE" },
 completed: { label: "Completed", color: "#059669", bg: "#D1FAE5" },
 cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEE2E2" },
 };
 const c = config[status];
 return <Badge label={c.label} color={c.color} bg={c.bg} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const MobileStylesSheet = () => (
  <style>{`
    @media (max-width: 768px) {
      .nf-sidebar { transform: translateX(-100%); position: fixed !important; z-index: 200; transition: transform 0.25s; height: 100vh !important; }
      .nf-sidebar.open { transform: translateX(0) !important; }
      .nf-main { padding: 20px 16px 60px !important; }
      .nf-burger { display: flex !important; }
      .nf-overlay { display: block !important; }
    }
    @media (min-width: 769px) {
      .nf-burger { display: none !important; }
      .nf-overlay { display: none !important; }
    }
    * { box-sizing: border-box; }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD WIDGET
// ═══════════════════════════════════════════════════════════════════════════════
function FileUploadWidget({ user, theme, onUploaded }: {
  user: User;
  theme: AnyTheme;
  onUploaded: (url: string, fileName: string, pages: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const th = theme as typeof T.student;

  const handleFile = async (file: File) => {
    if (!file) return;
    const allowed = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      setError("Only PDF and Word documents are allowed."); return;
    }
    if (file.size > 50 * 1024 * 1024) { setError("File must be under 50MB."); return; }
    setError(""); setUploading(true); setProgress(20);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      setProgress(50);
      const { data, error: uploadErr } = await supabase.storage.from("materials").upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw uploadErr;
      setProgress(90);
      const { data: urlData } = supabase.storage.from("materials").getPublicUrl(data.path);
      setProgress(100);
      const estimatedPages = Math.max(1, Math.round(file.size / 2048));
      onUploaded(urlData.publicUrl, file.name, estimatedPages);
    } catch (e: any) {
      setError(e.message || "Upload failed.");
    } finally { setUploading(false); setProgress(0); }
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        style={{ border:`2px dashed ${dragging ? th.accent : th.border}`, borderRadius:14, padding:"28px 20px", textAlign:"center", cursor:"pointer", background:dragging ? th.accentLight : "transparent", transition:"all 0.2s" }}>
        {uploading ? (
          <div>
            <p style={{ color:th.textSub, fontSize:14, fontFamily:F.body, margin:"0 0 12px" }}>Uploading... {progress}%</p>
            <div style={{ width:"100%", height:6, background:th.border, borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:`${progress}%`, height:"100%", background:th.gradient, transition:"width 0.3s", borderRadius:3 }} />
            </div>
          </div>
        ) : (
          <div>
            <svg width="32" height="32" fill="none" stroke={th.accent} strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom:10 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p style={{ color:th.text, fontSize:14, fontWeight:600, margin:"0 0 4px", fontFamily:F.body }}>
              Drag & drop or <span style={{ color:th.accent }}>click to upload</span>
            </p>
            <p style={{ color:th.textMuted, fontSize:12, margin:0, fontFamily:F.body }}>PDF or Word · Max 50MB</p>
          </div>
        )}
      </div>
      {error && <p style={{ color:"#DC2626", fontSize:12, margin:"8px 0 0", fontFamily:F.body }}>{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF VIEWER
// ═══════════════════════════════════════════════════════════════════════════════
function PDFViewer({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ width:"100%", borderRadius:12, overflow:"hidden", border:"1px solid #E2E8F0" }}>
      <div style={{ background:"#0F172A", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ margin:0, fontSize:13, color:"#F0F2FF", fontFamily:F.body, fontWeight:600 }}>{title}</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ color:"#3B82F6", fontSize:12, fontFamily:F.body, textDecoration:"none", fontWeight:600 }}>
          Open in new tab
        </a>
      </div>
      {!loaded && (
        <div style={{ height:400, background:"#F8FAFF", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <p style={{ color:"#94A3B8", fontFamily:F.body, fontSize:14 }}>Loading document...</p>
        </div>
      )}
      <iframe
        src={`${url}#toolbar=1`}
        style={{ width:"100%", height:600, border:"none", display:loaded?"block":"none" }}
        onLoad={() => setLoaded(true)}
        title={title}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATERIAL UPLOAD FORM
// ═══════════════════════════════════════════════════════════════════════════════
function MaterialUploadForm({ user, theme, onClose }: {
  user: User; theme: AnyTheme; onClose: () => void;
}) {
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
  const th = theme as typeof T.student;
  const inp: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${th.border}`, background:th.bg, color:th.text, fontSize:14, fontFamily:F.body, outline:"none", boxSizing:"border-box" };
  const lbl: React.CSSProperties = { display:"block", fontSize:11, fontWeight:600, color:th.textSub, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:F.body };

  const submit = async () => {
    if (!title || !module || !university || !field || !fileUrl) { setErr("Please fill all fields and upload a file."); return; }
    setSubmitting(true); setErr("");
    try {
      await supabase.from("materials").insert({ title, type, module, university, field, year_level:yearLevel, pages, premium, file_url:fileUrl, uploaded_by:user.id });
      setDone(true);
    } catch (e: any) { setErr(e.message); }
    finally { setSubmitting(false); }
  };

  if (done) return (
    <div style={{ background:th.card, borderRadius:16, padding:32, border:`1px solid ${th.border}`, textAlign:"center" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"#D1FAE5", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
        <svg width="26" height="26" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 style={{ fontFamily:F.display, fontSize:20, color:th.text, margin:"0 0 8px" }}>Material Uploaded!</h3>
      <p style={{ color:th.textSub, fontSize:14, margin:"0 0 20px", fontFamily:F.body }}>Your material is now visible to students.</p>
      <button onClick={onClose} style={{ background:th.gradient, color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:F.body }}>Done</button>
    </div>
  );

  return (
    <div style={{ background:th.card, borderRadius:16, padding:28, border:`1.5px solid ${th.accent}44` }}>
      <h3 style={{ fontFamily:F.display, fontSize:20, color:th.text, margin:"0 0 22px" }}>Upload Study Material</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div><label style={lbl}>Document Title *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Introduction to Java Week 1 Notes" style={inp} /></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div><label style={lbl}>Type</label>
            <select value={type} onChange={e=>setType(e.target.value as any)} style={inp}>
              {["Notes","Exam Paper","Summary","Textbook"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Year Level</label>
            <select value={yearLevel} onChange={e=>setYearLevel(e.target.value)} style={inp}>
              {["1st Year","2nd Year","3rd Year","4th Year","Postgraduate"].map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div><label style={lbl}>Module *</label><input value={module} onChange={e=>setModule(e.target.value)} placeholder="e.g. Introduction to Java" style={inp} /></div>
        <div><label style={lbl}>University *</label><input value={university} onChange={e=>setUniversity(e.target.value)} placeholder="e.g. Botswana Accountancy College" style={inp} /></div>
        <div><label style={lbl}>Field of Study *</label><input value={field} onChange={e=>setField(e.target.value)} placeholder="e.g. Software Engineering & IT" style={inp} /></div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div onClick={()=>setPremium(!premium)} style={{ width:44, height:24, borderRadius:12, background:premium?th.accent:th.border, cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
            <div style={{ position:"absolute", top:3, left:premium?22:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
          </div>
          <span style={{ fontSize:13, color:th.textSub, fontFamily:F.body }}>Mark as Premium (requires subscription)</span>
        </div>
        <div>
          <label style={lbl}>Upload File *</label>
          {fileUrl ? (
            <div style={{ background:"#D1FAE5", border:"1px solid #059669", borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ margin:0, fontSize:13, color:"#065F46", fontFamily:F.body, fontWeight:600 }}>{fileName}</p>
              <button onClick={()=>{setFileUrl("");setFileName("");}} style={{ background:"none", border:"none", color:"#DC2626", cursor:"pointer", fontSize:12, fontFamily:F.body }}>Remove</button>
            </div>
          ) : (
            <FileUploadWidget user={user} theme={theme} onUploaded={(url,name,pg)=>{setFileUrl(url);setFileName(name);setPages(pg);}} />
          )}
        </div>
        {err && <p style={{ color:"#DC2626", fontSize:13, margin:0, fontFamily:F.body }}>{err}</p>}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={submit} disabled={submitting} style={{ background:submitting?"#94A3B8":th.gradient, color:"#fff", border:"none", borderRadius:10, padding:"11px 24px", fontSize:14, fontWeight:700, cursor:submitting?"not-allowed":"pointer", fontFamily:F.body }}>
            {submitting?"Uploading...":"Submit Material"}
          </button>
          <button onClick={onClose} style={{ background:th.bg, border:`1px solid ${th.border}`, color:th.textSub, borderRadius:10, padding:"11px 20px", fontSize:14, cursor:"pointer", fontFamily:F.body }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERRAL WIDGET
// ═══════════════════════════════════════════════════════════════════════════════
function ReferralWidget({ student, theme }: { student: StudentProfile; theme: AnyTheme }) {
  const [copied, setCopied] = useState(false);
  const th = theme as typeof T.student;
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}?ref=${student.referralCode||""}`
    : `https://KitsoLink.vercel.app?ref=${student.referralCode||""}`;

  const copy = () => {
    navigator.clipboard.writeText(referralLink).then(()=>{
      setCopied(true); setTimeout(()=>setCopied(false), 2000);
    });
  };

  return (
    <div style={{ background:th.card, borderRadius:16, padding:24, border:`1px solid ${th.border}`, maxWidth:640 }}>
      <h3 style={{ fontFamily:F.display, fontSize:20, color:th.text, margin:"0 0 6px" }}>Refer a Friend</h3>
      <p style={{ color:th.textSub, fontSize:14, margin:"0 0 20px", fontFamily:F.body, lineHeight:1.6 }}>
        Share your link. When a friend signs up using it, you both get <strong>7 free days of Premium</strong>!
      </p>
      <div style={{ background:th.bg, border:`1.5px solid ${th.border}`, borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <p style={{ margin:0, fontSize:13, color:th.textSub, fontFamily:F.mono, wordBreak:"break-all" }}>{referralLink}</p>
        <button onClick={copy} style={{ background:copied?"#D1FAE5":th.gradient, color:copied?"#065F46":"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:F.body, flexShrink:0 }}>
          {copied?"Copied!":"Copy Link"}
        </button>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <span style={{ background:th.accentLight, color:th.accent, fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:20, fontFamily:F.body }}>
          Your Code: {student.referralCode||"Loading..."}
        </span>
        <span style={{ background:"#EFF6FF", color:"#2563EB", fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:20, fontFamily:F.body }}>
          Reward: 7 Days Premium per referral
        </span>
      </div>
    </div>
  );
}