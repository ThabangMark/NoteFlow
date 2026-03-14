"use client";

import React, { useState, useEffect } from "react";

type DocType = "Notes" | "Exam" | "Summary" | "Textbook";
type NavPage = "explore" | "universities" | "courses" | "upload" | "pricing" | "dashboard";
type UserPlan = "free" | "premium";

interface User {
  name: string;
  email: string;
  avatar: string;
  plan: UserPlan;
  accessExpiry?: number; // timestamp for free timed access
}

interface Document {
  id: number;
  title: string;
  subject: string;
  university: string;
  course: string;
  pages: number;
  downloads: number;
  rating: number;
  type: DocType;
  year: string;
  preview: string;
  premium: boolean;
}

interface University {
  name: string;
  short: string;
  location: string;
  courses: string[];
  emoji: string;
}

const universities: University[] = [
  { name: "Botswana Accountancy College", short: "BAC", location: "Gaborone", emoji: "🏫", courses: ["Computer Systems Engineering", "Accounting & Finance", "Business Administration", "Information Technology"] },
  { name: "University of Botswana", short: "UB", location: "Gaborone", emoji: "🎓", courses: ["Computer Science", "Law", "Medicine", "Engineering", "Economics", "Education"] },
  { name: "BIUST", short: "BIUST", location: "Palapye", emoji: "🔬", courses: ["Civil Engineering", "Electrical Engineering", "Computer Science", "Environmental Science", "Mining Engineering"] },
  { name: "Botho University", short: "Botho", location: "Gaborone", emoji: "📘", courses: ["Nursing", "Business Computing", "Project Management", "Hospitality Management", "IT Management"] },
  { name: "Limkokwing University", short: "Limkokwing", location: "Gaborone", emoji: "🎨", courses: ["Graphic Design", "Fashion Design", "Mass Communication", "Architecture", "Film & Animation"] },
  { name: "Ba Isago University", short: "Ba Isago", location: "Gaborone", emoji: "📚", courses: ["Accounting", "Human Resources", "Marketing", "Supply Chain Management", "Early Childhood Education"] },
  { name: "Botswana Open University", short: "BOU", location: "Gaborone", emoji: "🌐", courses: ["Distance Education", "Public Administration", "Development Studies", "Agriculture", "Education Management"] },
];

const documents: Document[] = [
  { id: 1, title: "Introduction to Java - Full Notes", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 45, downloads: 1230, rating: 4.8, type: "Notes", year: "1st Year", preview: "OOP concepts, classes, objects, inheritance, polymorphism...", premium: false },
  { id: 2, title: "Mobile Application Development - Android Basics", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 38, downloads: 980, rating: 4.7, type: "Notes", year: "2nd Year", preview: "Android Studio, XML layouts, Activities, Intents, APIs...", premium: true },
  { id: 3, title: "Database Systems Exam 2023", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 12, downloads: 2100, rating: 4.9, type: "Exam", year: "2nd Year", preview: "SQL queries, normalization, ER diagrams, transactions...", premium: true },
  { id: 4, title: "Web Development Summary - HTML, CSS & JS", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 22, downloads: 1540, rating: 4.6, type: "Summary", year: "1st Year", preview: "HTML5 structure, CSS flexbox/grid, JavaScript DOM manipulation...", premium: false },
  { id: 5, title: "Computer Networks Textbook - Full Edition", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 320, downloads: 870, rating: 4.5, type: "Textbook", year: "3rd Year", preview: "OSI model, TCP/IP, routing protocols, network security...", premium: true },
  { id: 6, title: "Financial Accounting Principles - Complete Notes", subject: "Accounting & Finance", university: "Botswana Accountancy College", course: "Accounting & Finance", pages: 60, downloads: 3200, rating: 4.9, type: "Notes", year: "1st Year", preview: "Double entry, trial balance, income statement, balance sheet...", premium: false },
  { id: 7, title: "Botswana Taxation Law - Summary", subject: "Accounting & Finance", university: "Botswana Accountancy College", course: "Accounting & Finance", pages: 30, downloads: 1890, rating: 4.7, type: "Summary", year: "3rd Year", preview: "BURS regulations, VAT, PAYE, corporate tax, withholding tax...", premium: true },
  { id: 8, title: "Accounting Textbook - Managerial Accounting", subject: "Accounting & Finance", university: "Botswana Accountancy College", course: "Accounting & Finance", pages: 280, downloads: 1200, rating: 4.6, type: "Textbook", year: "2nd Year", preview: "Cost accounting, budgeting, variance analysis, decision making...", premium: true },
  { id: 9, title: "Data Structures & Algorithms - UB Notes", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 48, downloads: 2750, rating: 4.8, type: "Notes", year: "2nd Year", preview: "Arrays, linked lists, trees, graphs, sorting algorithms, Big O...", premium: false },
  { id: 10, title: "Operating Systems Past Paper Pack 2019-2023", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 35, downloads: 3100, rating: 4.9, type: "Exam", year: "3rd Year", preview: "Process management, memory management, file systems, scheduling...", premium: true },
  { id: 11, title: "Computer Science Textbook - Fundamentals", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 410, downloads: 900, rating: 4.7, type: "Textbook", year: "1st Year", preview: "Programming fundamentals, logic, problem solving, algorithms...", premium: true },
  { id: 12, title: "Constitutional Law of Botswana - Full Notes", subject: "Law", university: "University of Botswana", course: "Law", pages: 70, downloads: 2300, rating: 4.7, type: "Notes", year: "2nd Year", preview: "Constitution of Botswana, Bill of Rights, separation of powers...", premium: false },
  { id: 13, title: "Law Past Exam Papers 2018-2023", subject: "Law", university: "University of Botswana", course: "Law", pages: 55, downloads: 1900, rating: 4.8, type: "Exam", year: "3rd Year", preview: "Constitutional law, contract law, criminal law exam questions...", premium: true },
  { id: 14, title: "Thermodynamics - Engineering Notes", subject: "Civil Engineering", university: "BIUST", course: "Civil Engineering", pages: 55, downloads: 1100, rating: 4.6, type: "Notes", year: "2nd Year", preview: "Laws of thermodynamics, heat transfer, entropy, Carnot cycle...", premium: false },
  { id: 15, title: "Engineering Textbook - Structural Analysis", subject: "Civil Engineering", university: "BIUST", course: "Civil Engineering", pages: 380, downloads: 760, rating: 4.5, type: "Textbook", year: "3rd Year", preview: "Beams, trusses, frames, loads, stress analysis...", premium: true },
  { id: 16, title: "Nursing Fundamentals - Anatomy & Physiology", subject: "Nursing", university: "Botho University", course: "Nursing", pages: 80, downloads: 2900, rating: 4.9, type: "Notes", year: "1st Year", preview: "Human body systems, homeostasis, cell biology, organ functions...", premium: false },
  { id: 17, title: "Nursing Past Exam Papers 2020-2023", subject: "Nursing", university: "Botho University", course: "Nursing", pages: 45, downloads: 2100, rating: 4.8, type: "Exam", year: "2nd Year", preview: "Pharmacology, patient care, clinical procedures, ethics...", premium: true },
  { id: 18, title: "Graphic Design Principles - Visual Notes", subject: "Graphic Design", university: "Limkokwing University", course: "Graphic Design", pages: 33, downloads: 990, rating: 4.6, type: "Notes", year: "1st Year", preview: "Typography, color theory, composition, Adobe Illustrator basics...", premium: false },
];

const typeColors: Record<DocType, { bg: string; text: string }> = {
  Notes: { bg: "#EAF3FF", text: "#2563EB" },
  Exam: { bg: "#FFF0EA", text: "#C2410C" },
  Summary: { bg: "#EAFAF1", text: "#15803D" },
  Textbook: { bg: "#F5F0FF", text: "#7C3AED" },
};

const PLANS = [
  { id: "monthly", name: "Monthly", price: "P89", period: "/month", saves: null, color: "#3B5BDB" },
  { id: "semester", name: "Per Semester", price: "P199", period: "/6 months", saves: "Save 55%", color: "#7C3AED" },
  { id: "annual", name: "Annual", price: "P299", period: "/year", saves: "Save 72%", color: "#059669" },
];

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

const StarRating = ({ rating }: { rating: number }) => (
  <span style={{ color: "#F59E0B", fontSize: "13px", fontWeight: 600 }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    <span style={{ color: "#64748B", marginLeft: "4px", fontFamily: "'DM Sans', sans-serif" }}>{rating}</span>
  </span>
);

// ─── PAYMENT MODAL ─────────────────────────────────────────────────────────────
const PaymentModal = ({ plan, onSuccess, onClose }: { plan: typeof PLANS[0]; onSuccess: () => void; onClose: () => void }) => {
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const handlePay = () => {
    if (!cardNum || !expiry || !cvv || !name) { alert("Please fill in all card details."); return; }
    setStep("processing");
    setTimeout(() => { setStep("success"); setTimeout(() => { onSuccess(); }, 1500); }, 2500);
  };

  const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#F8FAFF", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "460px", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, #1E3A8A, #3B5BDB)`, padding: "24px 28px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>NoteFlow Premium</p>
              <h3 style={{ margin: "4px 0 0", fontFamily: "'Playfair Display', serif", fontSize: "22px" }}>{plan.name} Plan</h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>{plan.price}</div>
              <div style={{ fontSize: "12px", opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>{plan.period}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "28px" }}>
          {step === "details" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "13px", color: "#0F172A", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>Card Details</p>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Cardholder Name" style={inp} />
              <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} placeholder="1234 5678 9012 3456" style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input value={expiry} onChange={e => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); setExpiry(v); }} placeholder="MM/YY" style={inp} />
                <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="CVV" style={inp} />
              </div>
              <div style={{ background: "#F0FDF4", borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "8px", alignItems: "center" }}>
                <span>🔒</span>
                <p style={{ margin: 0, fontSize: "12px", color: "#15803D", fontFamily: "'DM Sans', sans-serif" }}>Your payment is secured with 256-bit SSL encryption</p>
              </div>
              <button onClick={handlePay} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Pay {plan.price} →
              </button>
              <button onClick={onClose} style={{ background: "transparent", color: "#64748B", border: "none", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            </div>
          )}
          {step === "processing" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", animation: "spin 1s linear infinite" }}>⏳</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#0F172A" }}>Processing Payment...</h3>
              <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>Please wait while we confirm your payment</p>
            </div>
          )}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#0F172A", fontSize: "22px" }}>Payment Successful!</h3>
              <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>Welcome to NoteFlow Premium 🇧🇼</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PRICING PAGE ──────────────────────────────────────────────────────────────
const PricingPage = ({ user, onSubscribe }: { user: User | null; onSubscribe: (plan: typeof PLANS[0]) => void }) => {
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {selectedPlan && <PaymentModal plan={selectedPlan} onSuccess={() => { onSubscribe(selectedPlan); setSelectedPlan(null); }} onClose={() => setSelectedPlan(null)} />}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ display: "inline-block", background: "#EAF3FF", color: "#2563EB", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, marginBottom: "16px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>💎 Premium Access</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "38px", color: "#0F172A", margin: "0 0 12px" }}>Unlock Everything</h2>
        <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "500px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>Subscribe to get full access to all notes, textbooks, past exam papers and more from every Botswana university.</p>
      </div>

      {/* Free vs Premium comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "48px", maxWidth: "700px", margin: "0 auto 48px" }}>
        {[
          { title: "Free", color: "#64748B", bg: "#F8FAFF", features: ["✅ Browse all documents", "✅ Preview first 2 pages", "⏱️ 30 min timed access per day", "❌ No downloads", "❌ No textbooks", "❌ No past exam papers"] },
          { title: "Premium", color: "#3B5BDB", bg: "linear-gradient(135deg, #1E3A8A, #3B5BDB)", features: ["✅ Full access to all documents", "✅ All notes, textbooks & exams", "✅ Unlimited access anytime", "✅ New materials every week", "✅ All universities included", "✅ Priority support"] },
        ].map(tier => (
          <div key={tier.title} style={{ borderRadius: "20px", padding: "28px", background: tier.bg, border: tier.title === "Free" ? "1.5px solid #E8EDF5" : "none" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: tier.title === "Free" ? "#0F172A" : "#fff", margin: "0 0 16px" }}>{tier.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tier.features.map(f => (
                <p key={f} style={{ margin: 0, fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: tier.title === "Free" ? "#475569" : "rgba(255,255,255,0.9)" }}>{f}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", maxWidth: "960px", margin: "0 auto" }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{ background: "#fff", borderRadius: "20px", padding: "32px", border: plan.id === "semester" ? `2px solid ${plan.color}` : "1.5px solid #E8EDF5", position: "relative", boxShadow: plan.id === "semester" ? "0 8px 32px rgba(124,58,237,0.15)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
            {plan.id === "semester" && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", borderRadius: "20px", padding: "4px 16px", fontSize: "12px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>⭐ Most Popular</div>}
            {plan.saves && <div style={{ background: "#EAFAF1", color: "#15803D", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "inline-block", marginBottom: "12px" }}>{plan.saves}</div>}
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#0F172A", margin: "0 0 4px" }}>{plan.name}</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", margin: "12px 0 20px" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: plan.color, fontFamily: "'Playfair Display', serif" }}>{plan.price}</span>
              <span style={{ color: "#94A3B8", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>{plan.period}</span>
            </div>
            <button
              onClick={() => user ? setSelectedPlan(plan) : alert("Please sign in first!")}
              style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: plan.id === "semester" ? `linear-gradient(135deg, #7C3AED, #6366F1)` : `linear-gradient(135deg, ${plan.color}, #6366F1)`, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {user?.plan === "premium" ? "✅ Current Plan" : "Subscribe Now →"}
            </button>
          </div>
        ))}
      </div>

      <p style={{ textAlign: "center", marginTop: "28px", color: "#94A3B8", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>🔒 Secure payment · Cancel anytime · Instant access after payment</p>
    </div>
  );
};

// ─── DOC VIEWER ────────────────────────────────────────────────────────────────
const DocViewer = ({ doc, user, onClose, onUpgrade }: { doc: Document; user: User | null; onClose: () => void; onUpgrade: () => void }) => {
  const colors = typeColors[doc.type];
  const canAccess = !doc.premium || user?.plan === "premium";
  const [timeLeft, setTimeLeft] = useState(1800);

  useEffect(() => {
    if (!canAccess || !user) return;
    if (user.plan === "free") {
      const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); onClose(); return 0; } return p - 1; }), 1000);
      return () => clearInterval(t);
    }
  }, [canAccess, user]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "24px 28px 18px", borderBottom: "1px solid #E8EDF5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, marginRight: "16px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ background: colors.bg, color: colors.text, fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{doc.type}</span>
              {doc.premium && <span style={{ background: "#FFF8E1", color: "#B45309", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>💎 Premium</span>}
              <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>{doc.year}</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#0F172A", margin: "0 0 4px" }}>{doc.title}</h2>
            <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>🎓 {doc.university}</p>
          </div>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: "10px", width: "36px", height: "36px", fontSize: "16px", cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        {/* Timer for free users */}
        {canAccess && user?.plan === "free" && (
          <div style={{ background: "#FFF8E1", padding: "12px 28px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #FDE68A" }}>
            <span style={{ fontSize: "16px" }}>⏱️</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#B45309", fontFamily: "'DM Sans', sans-serif" }}>
              Free access time remaining: <strong>{mins}:{secs}</strong> — <span style={{ color: "#3B5BDB", cursor: "pointer", fontWeight: 600 }} onClick={onUpgrade}>Upgrade to Premium</span> for unlimited access
            </p>
          </div>
        )}

        {/* Premium lock */}
        {!canAccess && (
          <div style={{ padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>💎</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#0F172A", margin: "0 0 8px" }}>Premium Content</h3>
            <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>Subscribe to NoteFlow Premium to access this {doc.type.toLowerCase()}, plus all notes, textbooks and past exam papers.</p>
            <button onClick={onUpgrade} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 32px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View Plans & Pricing →</button>
          </div>
        )}

        {/* Document content */}
        {canAccess && (
          <>
            <div style={{ padding: "16px 28px", background: "#F8FAFF", borderBottom: "1px solid #E8EDF5", display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[["📄", `${doc.pages} pages`], ["⬇️", `${doc.downloads.toLocaleString()} views`], ["⭐", `${doc.rating} rating`], ["📚", doc.subject]].map(([icon, label]) => (
                <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "24px 28px" }}>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>Document Preview</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Array.from({ length: Math.min(doc.pages, 5) }, (_, i) => i + 1).map(page => (
                  <div key={page} style={{ background: "#F8FAFF", border: "1px solid #E8EDF5", borderRadius: "12px", padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Page {page}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                      {[0.9, 0.75, 0.85, 0.6].map((w, i) => <div key={i} style={{ height: "9px", background: "#E2E8F0", borderRadius: "4px", width: `${w * 100}%` }} />)}
                      {page === 1 && <div style={{ marginTop: "8px", padding: "10px 14px", background: "#EAF3FF", borderRadius: "8px", borderLeft: "3px solid #3B5BDB" }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#1E3A8A", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}><strong>Topics: </strong>{doc.preview}</p>
                      </div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "18px 28px", borderTop: "1px solid #E8EDF5", display: "flex", gap: "12px", justifyContent: "flex-end", alignItems: "center" }}>
              {user?.plan !== "premium" && (
                <p style={{ margin: 0, fontSize: "13px", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ color: "#3B5BDB", fontWeight: 600, cursor: "pointer" }} onClick={onUpgrade}>Upgrade to Premium</span> to download
                </p>
              )}
              <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#475569", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Close</button>
              {user?.plan === "premium" && (
                <button style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>⬇️ Download PDF</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── SIGN IN MODAL ─────────────────────────────────────────────────────────────
const SignInModal = ({ onSignIn, onClose }: { onSignIn: (user: User) => void; onClose: () => void }) => {
  const handleGoogleSignIn = () => {
    // Simulate Google sign in
    const mockUser: User = {
      name: "Thabang Odirile",
      email: "thabang@gmail.com",
      avatar: "TO",
      plan: "free",
    };
    onSignIn(mockUser);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "400px", margin: "0 20px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 52, height: 52, borderRadius: "14px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 16px" }}>📚</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#0F172A", margin: "0 0 8px" }}>Welcome to NoteFlow</h2>
        <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif" }}>Sign in to access study materials from Botswana universities</p>

        <button onClick={handleGoogleSignIn} style={{ width: "100%", padding: "13px 20px", borderRadius: "12px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#0F172A", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <p style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>By signing in you agree to our Terms of Service</p>
      </div>
    </div>
  );
};

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard = ({ user, onUpgrade }: { user: User; onUpgrade: () => void }) => (
  <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
    <div style={{ background: "linear-gradient(135deg, #1E3A8A, #3B5BDB)", borderRadius: "20px", padding: "32px", color: "#fff", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{user.avatar}</div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: "0 0 4px" }}>{user.name}</h2>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>{user.email}</p>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 20px", textAlign: "center" }}>
        <p style={{ margin: "0 0 2px", fontSize: "12px", opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>Current Plan</p>
        <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{user.plan === "premium" ? "💎 Premium" : "🆓 Free"}</p>
      </div>
    </div>

    {user.plan === "free" && (
      <div style={{ background: "#FFF8E1", border: "1.5px solid #FDE68A", borderRadius: "16px", padding: "24px 28px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#92400E", margin: "0 0 4px" }}>You&apos;re on the Free Plan</h3>
          <p style={{ color: "#B45309", fontSize: "13px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Upgrade to access all notes, textbooks and past exam papers with no time limits.</p>
        </div>
        <button onClick={onUpgrade} style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>Upgrade Now →</button>
      </div>
    )}

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
      {[
        { icon: "📄", label: "Documents Viewed", value: "12" },
        { icon: "⭐", label: "Saved Documents", value: "5" },
        { icon: "🎓", label: "Courses Following", value: "3" },
        { icon: user.plan === "premium" ? "💎" : "⏱️", label: user.plan === "premium" ? "Premium Access" : "Daily Time Left", value: user.plan === "premium" ? "Unlimited" : "30 min" },
      ].map(stat => (
        <div key={stat.label} style={{ background: "#fff", borderRadius: "14px", padding: "20px", border: "1.5px solid #E8EDF5", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
          <p style={{ margin: "0 0 2px", fontSize: "22px", fontWeight: 800, color: "#0F172A", fontFamily: "'Playfair Display', serif" }}>{stat.value}</p>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── UPLOAD PAGE ───────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#FFFFFF", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: "13px", color: "#0F172A", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" };

const UploadPage = ({ user, onSignIn }: { user: User | null; onSignIn: () => void }) => {
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedType, setSelectedType] = useState("Notes");
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uniObj = universities.find(u => u.name === selectedUni);

  if (!user) return (
    <div style={{ maxWidth: "500px", margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
      <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔐</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#0F172A" }}>Sign In to Upload</h2>
      <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif", marginBottom: "24px" }}>You need to be signed in to share your study materials.</p>
      <button onClick={onSignIn} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 32px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "15px" }}>Sign In with Google →</button>
    </div>
  );

  if (submitted) return (
    <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
      <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A" }}>Upload Successful!</h2>
      <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}><strong>{fileName}</strong> has been submitted for review.</p>
      <button onClick={() => { setSubmitted(false); setFileName(""); setTitle(""); setSelectedUni(""); }} style={{ marginTop: "24px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 28px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Upload Another</button>
    </div>
  );

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "6px" }}>Upload Your Notes</h2>
      <p style={{ color: "#64748B", marginBottom: "36px", fontFamily: "'DM Sans', sans-serif" }}>Share your study materials and help fellow students in Botswana</p>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "36px", border: "1.5px solid #E8EDF5", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "22px" }}>
        <div><label style={labelStyle}>Document Title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Java - Week 1 Notes" style={inputStyle} /></div>
        <div><label style={labelStyle}>University / College *</label>
          <select value={selectedUni} onChange={e => setSelectedUni(e.target.value)} style={inputStyle}>
            <option value="">— Select your institution —</option>
            {universities.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        {uniObj && <div><label style={labelStyle}>Course *</label>
          <select style={inputStyle}><option value="">— Select your course —</option>{uniObj.courses.map(c => <option key={c}>{c}</option>)}</select>
        </div>}
        <div><label style={labelStyle}>Document Type *</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["Notes", "Exam", "Summary", "Textbook"].map(type => (
              <button key={type} onClick={() => setSelectedType(type)} style={{ padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, border: selectedType === type ? "none" : "1.5px solid #CBD5E1", background: selectedType === type ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#fff", color: selectedType === type ? "#fff" : "#475569", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{type}</button>
            ))}
          </div>
        </div>
        <div><label style={labelStyle}>Upload File *</label>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setFileName(e.target.files[0].name); }} />
          <div onClick={() => fileInputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) setFileName(e.dataTransfer.files[0].name); }}
            style={{ border: dragging ? "2px dashed #3B5BDB" : fileName ? "2px solid #22C55E" : "2px dashed #CBD5E1", borderRadius: "14px", padding: "32px", textAlign: "center", cursor: "pointer", background: fileName ? "#F0FDF4" : "#F8FAFF", transition: "all 0.2s" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{fileName ? "✅" : "📂"}</div>
            {fileName ? <><p style={{ color: "#15803D", fontSize: "14px", fontWeight: 700, margin: "0 0 2px", fontFamily: "'DM Sans', sans-serif" }}>{fileName}</p><p style={{ color: "#64748B", fontSize: "12px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Click to change</p></>
              : <><p style={{ color: "#0F172A", fontSize: "14px", fontWeight: 600, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>Drag & drop or <span style={{ color: "#3B5BDB" }}>browse your computer</span></p><p style={{ color: "#94A3B8", fontSize: "12px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>PDF, DOCX, PPT · Max 50MB</p></>}
          </div>
        </div>
        <button onClick={() => { if (title && selectedUni && fileName) setSubmitted(true); else alert("Please fill in title, university and upload a file."); }} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "15px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Upload Document →</button>
      </div>
    </div>
  );
};

// ─── UNIVERSITIES PAGE ─────────────────────────────────────────────────────────
const UniversitiesPage = ({ onSearch }: { onSearch: (u: string) => void }) => (
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "8px" }}>Universities & Colleges in Botswana</h2>
    <p style={{ color: "#64748B", marginBottom: "32px", fontFamily: "'DM Sans', sans-serif" }}>Click any institution to browse its study materials</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
      {universities.map(uni => (
        <div key={uni.name} onClick={() => onSearch(uni.short)} style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1.5px solid #E8EDF5", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#3B5BDB"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8EDF5"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>{uni.emoji}</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#0F172A", margin: "0 0 4px" }}>{uni.name}</h3>
          <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>📍 {uni.location}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {uni.courses.slice(0, 3).map(c => <span key={c} style={{ background: "#EAF3FF", color: "#2563EB", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>{c}</span>)}
            {uni.courses.length > 3 && <span style={{ background: "#F1F5F9", color: "#64748B", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>+{uni.courses.length - 3} more</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── DOC CARD ──────────────────────────────────────────────────────────────────
const DocCard = ({ doc, onOpen }: { doc: Document; onOpen: (d: Document) => void }) => {
  const [hovered, setHovered] = useState(false);
  const colors = typeColors[doc.type];
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onOpen(doc)} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: hovered ? "1.5px solid #3B5BDB" : "1.5px solid #E8EDF5", boxShadow: hovered ? "0 8px 32px rgba(59,91,219,0.10)" : "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer", transition: "all 0.22s", transform: hovered ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column", gap: "14px", position: "relative" }}>
      {doc.premium && <div style={{ position: "absolute", top: 16, right: 16, background: "#FFF8E1", color: "#B45309", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>💎 Premium</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ background: colors.bg, color: colors.text, fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{doc.type}</span>
        <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", marginRight: doc.premium ? "64px" : "0" }}>{doc.year}</span>
      </div>
      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: "#0F172A", lineHeight: 1.4, margin: 0 }}>{doc.title}</h3>
        <p style={{ color: "#64748B", fontSize: "12.5px", margin: "6px 0 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{doc.preview}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "13px" }}>🎓</span>
        <span style={{ color: "#475569", fontSize: "12.5px", fontFamily: "'DM Sans', sans-serif" }}>{doc.university}</span>
      </div>
      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StarRating rating={doc.rating} />
        <div style={{ display: "flex", gap: "12px", color: "#64748B", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
          <span>📄 {doc.pages}p</span>
          <span>👁️ {doc.downloads.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function NoteFlow() {
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState<NavPage>("explore");
  const [activeUni, setActiveUni] = useState("All Universities");
  const [activeType, setActiveType] = useState<DocType | "All Types">("All Types");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  const allUnis = ["All Universities", ...universities.map(u => u.short)];
  const docTypes: (DocType | "All Types")[] = ["All Types", "Notes", "Exam", "Summary", "Textbook"];

  const filtered = documents.filter(doc => {
    const q = search.toLowerCase();
    const matchSearch = !q || doc.title.toLowerCase().includes(q) || doc.subject.toLowerCase().includes(q) || doc.university.toLowerCase().includes(q) || doc.preview.toLowerCase().includes(q);
    const matchUni = activeUni === "All Universities" || universities.find(u => u.short === activeUni)?.name === doc.university;
    const matchType = activeType === "All Types" || doc.type === activeType;
    return matchSearch && matchUni && matchType;
  });

  const handleSignIn = (u: User) => { setUser(u); setShowSignIn(false); };
  const handleSignOut = () => { setUser(null); setActivePage("explore"); };
  const handleSubscribe = () => { if (user) setUser({ ...user, plan: "premium" }); setActivePage("explore"); };

  const navItems: { label: string; page: NavPage }[] = [
    { label: "Explore", page: "explore" },
    { label: "Universities", page: "universities" },
    { label: "Courses", page: "courses" },
    { label: "Upload", page: "upload" },
    { label: "💎 Premium", page: "pricing" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFF", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {showSignIn && <SignInModal onSignIn={handleSignIn} onClose={() => setShowSignIn(false)} />}
      {selectedDoc && <DocViewer doc={selectedDoc} user={user} onClose={() => setSelectedDoc(null)} onUpgrade={() => { setSelectedDoc(null); setActivePage("pricing"); }} />}

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8EDF5", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setActivePage("explore")}>
          <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>📚</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 800, background: "linear-gradient(135deg, #3B5BDB, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NoteFlow</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {navItems.map(item => (
            <span key={item.page} onClick={() => setActivePage(item.page)} style={{ color: activePage === item.page ? "#3B5BDB" : "#475569", fontSize: "14px", fontWeight: activePage === item.page ? 700 : 500, cursor: "pointer", borderBottom: activePage === item.page ? "2px solid #3B5BDB" : "2px solid transparent", paddingBottom: "4px" }}>{item.label}</span>
          ))}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {user.plan === "premium" && <span style={{ background: "#FFF8E1", color: "#B45309", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>💎 Premium</span>}
              <div onClick={() => setActivePage("dashboard")} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>{user.avatar}</div>
              <span onClick={handleSignOut} style={{ color: "#94A3B8", fontSize: "13px", cursor: "pointer" }}>Sign out</span>
            </div>
          ) : (
            <button onClick={() => setShowSignIn(true)} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "10px", padding: "9px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Sign In</button>
          )}
        </div>
      </nav>

      {/* PAGES */}
      {activePage === "universities" && <UniversitiesPage onSearch={s => { setActiveUni(s); setActivePage("explore"); }} />}
      {activePage === "courses" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "32px" }}>Courses & Modules</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {universities.map(uni => (
              <div key={uni.name} style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1.5px solid #E8EDF5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "28px" }}>{uni.emoji}</span>
                  <div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#0F172A", margin: 0 }}>{uni.name}</h3><p style={{ color: "#64748B", fontSize: "12px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>📍 {uni.location}</p></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                  {uni.courses.map(course => {
                    const count = documents.filter(d => d.university === uni.name && d.course === course).length;
                    return <div key={course} style={{ background: "#F8FAFF", borderRadius: "10px", padding: "12px 16px", border: "1px solid #E8EDF5" }}><p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "13px", color: "#0F172A", fontFamily: "'DM Sans', sans-serif" }}>{course}</p><p style={{ margin: 0, fontSize: "12px", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>{count} document{count !== 1 ? "s" : ""}</p></div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activePage === "upload" && <UploadPage user={user} onSignIn={() => setShowSignIn(true)} />}
      {activePage === "pricing" && <PricingPage user={user} onSubscribe={handleSubscribe} />}
      {activePage === "dashboard" && user && <Dashboard user={user} onUpgrade={() => setActivePage("pricing")} />}

      {activePage === "explore" && (
        <>
          <div style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #3B5BDB 50%, #6366F1 100%)", padding: "72px 32px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px", color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}>🇧🇼 BUILT FOR BOTSWANA STUDENTS</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 16px", lineHeight: 1.15 }}>Study Smarter,<br /><span style={{ color: "#A5B4FC" }}>Not Harder.</span></h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "18px", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.6 }}>Access notes, textbooks, past papers from UB, BAC, BIUST, Botho and more.</p>
              <div style={{ maxWidth: "580px", margin: "0 auto", background: "white", borderRadius: "14px", display: "flex", alignItems: "center", padding: "6px 6px 6px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <span style={{ fontSize: "18px", marginRight: "10px" }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes, modules, universities..." style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#0F172A", background: "transparent", fontFamily: "'DM Sans', sans-serif" }} />
                <button style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Search</button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "40px", flexWrap: "wrap" }}>
                {[["500+", "Documents"], ["7+", "Institutions"], ["20+", "Courses"]].map(([num, label]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", fontFamily: "'Playfair Display', serif" }}>{num}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "2px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {allUnis.map(uni => <button key={uni} onClick={() => setActiveUni(uni)} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, border: activeUni === uni ? "none" : "1.5px solid #E2E8F0", background: activeUni === uni ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#fff", color: activeUni === uni ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{uni}</button>)}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {docTypes.map(type => <button key={type} onClick={() => setActiveType(type)} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, border: activeType === type ? "none" : "1.5px solid #E2E8F0", background: activeType === type ? "#0F172A" : "#fff", color: activeType === type ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{type}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: "20px", color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
              Showing <strong style={{ color: "#0F172A" }}>{filtered.length}</strong> documents
              {search && <> for &quot;<strong style={{ color: "#3B5BDB" }}>{search}</strong>&quot;</>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filtered.length > 0 ? filtered.map(doc => <DocCard key={doc.id} doc={doc} onOpen={setSelectedDoc} />) : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "#475569" }}>No documents found</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0F172A, #1E3A8A)", margin: "20px 24px 0", borderRadius: "24px", padding: "56px 40px", textAlign: "center", maxWidth: "1152px", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: "#fff", margin: "0 0 12px" }}>Unlock All Study Materials</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", maxWidth: "480px", margin: "0 auto 28px", lineHeight: 1.6 }}>Get unlimited access to all notes, textbooks and past exam papers from every Botswana university.</p>
            <button onClick={() => setActivePage("pricing")} style={{ background: "linear-gradient(135deg, #6366F1, #3B5BDB)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginRight: "12px" }}>View Plans →</button>
            <button onClick={() => setActivePage("upload")} style={{ background: "transparent", color: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>Upload Notes</button>
          </div>
        </>
      )}

      <footer style={{ borderTop: "1px solid #E8EDF5", marginTop: "60px", padding: "32px", textAlign: "center", color: "#94A3B8", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ width: 26, height: 26, borderRadius: "8px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>📚</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>NoteFlow</span>
        </div>
        <p style={{ margin: 0 }}>© 2024 NoteFlow · Built for Botswana students 🇧🇼</p>
      </footer>
    </div>
  );
}