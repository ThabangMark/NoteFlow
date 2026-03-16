"use client";

import React, { useState } from "react";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
type DocType = "Notes" | "Exam" | "Summary" | "Textbook";
type NavPage = "explore" | "universities" | "courses" | "upload" | "pricing" | "dashboard" | "tutors";
type UserPlan = "free" | "premium";

interface User { name: string; email: string; avatar: string; plan: UserPlan; }
interface Review { id: number; user: string; avatar: string; rating: number; comment: string; date: string; }
interface Document {
  id: number; title: string; subject: string; university: string; course: string;
  pages: number; downloads: number; rating: number; type: DocType; year: string;
  preview: string; premium: boolean; reviews: Review[];
}
interface Tutor {
  id: number; name: string; avatar: string; university: string; subjects: string[];
  rating: number; reviewCount: number; rate: string; bio: string; available: boolean;
  reviews: Review[];
}
interface University { name: string; short: string; location: string; courses: string[]; emoji: string; }

// ─── DATA ──────────────────────────────────────────────────────────────────────
const universities: University[] = [
  { name: "Botswana Accountancy College", short: "BAC", location: "Gaborone", emoji: "🏫", courses: ["Computer Systems Engineering", "Accounting & Finance", "Business Administration", "Information Technology"] },
  { name: "University of Botswana", short: "UB", location: "Gaborone", emoji: "🎓", courses: ["Computer Science", "Law", "Medicine", "Engineering", "Economics", "Education"] },
  { name: "BIUST", short: "BIUST", location: "Palapye", emoji: "🔬", courses: ["Civil Engineering", "Electrical Engineering", "Computer Science", "Environmental Science", "Mining Engineering"] },
  { name: "Botho University", short: "Botho", location: "Gaborone", emoji: "📘", courses: ["Nursing", "Business Computing", "Project Management", "Hospitality Management", "IT Management"] },
  { name: "Limkokwing University", short: "Limkokwing", location: "Gaborone", emoji: "🎨", courses: ["Graphic Design", "Fashion Design", "Mass Communication", "Architecture", "Film & Animation"] },
  { name: "Ba Isago University", short: "Ba Isago", location: "Gaborone", emoji: "📚", courses: ["Accounting", "Human Resources", "Marketing", "Supply Chain Management", "Early Childhood Education"] },
  { name: "Botswana Open University", short: "BOU", location: "Gaborone", emoji: "🌐", courses: ["Distance Education", "Public Administration", "Development Studies", "Agriculture", "Education Management"] },
];

const initialDocs: Document[] = [
  { id: 1, title: "Introduction to Java - Full Notes", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 45, downloads: 1230, rating: 4.8, type: "Notes", year: "1st Year", preview: "OOP concepts, classes, objects, inheritance, polymorphism...", premium: false, reviews: [{ id: 1, user: "Kabo M.", avatar: "KM", rating: 5, comment: "Extremely helpful for my Java exam! Covered everything perfectly.", date: "Feb 2024" }, { id: 2, user: "Lesedi T.", avatar: "LT", rating: 4, comment: "Great notes but could use more code examples.", date: "Jan 2024" }] },
  { id: 2, title: "Mobile Application Development - Android Basics", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 38, downloads: 980, rating: 4.7, type: "Notes", year: "2nd Year", preview: "Android Studio, XML layouts, Activities, Intents, APIs...", premium: true, reviews: [{ id: 1, user: "Thato K.", avatar: "TK", rating: 5, comment: "Best Android notes I've found. Saved my project!", date: "Mar 2024" }] },
  { id: 3, title: "Database Systems Exam 2023", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 12, downloads: 2100, rating: 4.9, type: "Exam", year: "2nd Year", preview: "SQL queries, normalization, ER diagrams, transactions...", premium: true, reviews: [{ id: 1, user: "Neo B.", avatar: "NB", rating: 5, comment: "Exact same questions came up in my exam. 10/10.", date: "Nov 2023" }, { id: 2, user: "Mpho S.", avatar: "MS", rating: 5, comment: "Essential for exam prep. Highly recommend!", date: "Oct 2023" }] },
  { id: 4, title: "Web Development Summary - HTML, CSS & JS", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 22, downloads: 1540, rating: 4.6, type: "Summary", year: "1st Year", preview: "HTML5 structure, CSS flexbox/grid, JavaScript DOM manipulation...", premium: false, reviews: [{ id: 1, user: "Boago R.", avatar: "BR", rating: 4, comment: "Clean and well organized summary.", date: "Mar 2024" }] },
  { id: 5, title: "Computer Networks Textbook - Full Edition", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 320, downloads: 870, rating: 4.5, type: "Textbook", year: "3rd Year", preview: "OSI model, TCP/IP, routing protocols, network security...", premium: true, reviews: [] },
  { id: 6, title: "Financial Accounting Principles - Complete Notes", subject: "Accounting & Finance", university: "Botswana Accountancy College", course: "Accounting & Finance", pages: 60, downloads: 3200, rating: 4.9, type: "Notes", year: "1st Year", preview: "Double entry, trial balance, income statement, balance sheet...", premium: false, reviews: [{ id: 1, user: "Tshego M.", avatar: "TM", rating: 5, comment: "These notes are a lifesaver. Very clear explanations.", date: "Apr 2024" }] },
  { id: 7, title: "Botswana Taxation Law - Summary", subject: "Accounting & Finance", university: "Botswana Accountancy College", course: "Accounting & Finance", pages: 30, downloads: 1890, rating: 4.7, type: "Summary", year: "3rd Year", preview: "BURS regulations, VAT, PAYE, corporate tax, withholding tax...", premium: true, reviews: [] },
  { id: 8, title: "Data Structures & Algorithms - UB Notes", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 48, downloads: 2750, rating: 4.8, type: "Notes", year: "2nd Year", preview: "Arrays, linked lists, trees, graphs, sorting algorithms, Big O...", premium: false, reviews: [{ id: 1, user: "Oratile N.", avatar: "ON", rating: 5, comment: "Best DSA notes for UB students!", date: "Feb 2024" }] },
  { id: 9, title: "Operating Systems Past Paper Pack 2019-2023", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 35, downloads: 3100, rating: 4.9, type: "Exam", year: "3rd Year", preview: "Process management, memory management, file systems, scheduling...", premium: true, reviews: [{ id: 1, user: "Kagiso P.", avatar: "KP", rating: 5, comment: "5 years of past papers in one place. Incredible.", date: "Jan 2024" }] },
  { id: 10, title: "Constitutional Law of Botswana - Full Notes", subject: "Law", university: "University of Botswana", course: "Law", pages: 70, downloads: 2300, rating: 4.7, type: "Notes", year: "2nd Year", preview: "Constitution of Botswana, Bill of Rights, separation of powers...", premium: false, reviews: [{ id: 1, user: "Amogelang D.", avatar: "AD", rating: 4, comment: "Very thorough, covers all the key cases.", date: "Mar 2024" }] },
  { id: 11, title: "Thermodynamics - Engineering Notes", subject: "Civil Engineering", university: "BIUST", course: "Civil Engineering", pages: 55, downloads: 1100, rating: 4.6, type: "Notes", year: "2nd Year", preview: "Laws of thermodynamics, heat transfer, entropy, Carnot cycle...", premium: false, reviews: [] },
  { id: 12, title: "Nursing Fundamentals - Anatomy & Physiology", subject: "Nursing", university: "Botho University", course: "Nursing", pages: 80, downloads: 2900, rating: 4.9, type: "Notes", year: "1st Year", preview: "Human body systems, homeostasis, cell biology, organ functions...", premium: false, reviews: [{ id: 1, user: "Gaone K.", avatar: "GK", rating: 5, comment: "Perfect for 1st year nursing. Very detailed!", date: "Apr 2024" }] },
  { id: 13, title: "Graphic Design Principles - Visual Notes", subject: "Graphic Design", university: "Limkokwing University", course: "Graphic Design", pages: 33, downloads: 990, rating: 4.6, type: "Notes", year: "1st Year", preview: "Typography, color theory, composition, Adobe Illustrator basics...", premium: false, reviews: [] },
];

const initialTutors: Tutor[] = [
  { id: 1, name: "Keabetswe Molefe", avatar: "KM", university: "University of Botswana", subjects: ["Computer Science", "Data Structures", "Algorithms"], rating: 4.9, reviewCount: 34, rate: "P80/hr", bio: "3rd year CS student at UB. Tutored 40+ students. Specializes in making complex algorithms easy to understand.", available: true, reviews: [{ id: 1, user: "Thato N.", avatar: "TN", rating: 5, comment: "Keabo explained binary trees in a way my lecturer never could. Highly recommend!", date: "Mar 2024" }, { id: 2, user: "Mpho R.", avatar: "MR", rating: 5, comment: "Very patient and knowledgeable. Worth every pula.", date: "Feb 2024" }] },
  { id: 2, name: "Naledi Sithole", avatar: "NS", university: "Botswana Accountancy College", subjects: ["Accounting", "Financial Reporting", "Taxation"], rating: 4.8, reviewCount: 28, rate: "P70/hr", bio: "BAC Accounting finalist with distinctions. I break down complex financial concepts into simple, exam-ready notes.", available: true, reviews: [{ id: 1, user: "Boago M.", avatar: "BM", rating: 5, comment: "Naledi helped me go from failing to distinction in 3 weeks!", date: "Apr 2024" }, { id: 2, user: "Kabo T.", avatar: "KT", rating: 4, comment: "Great tutor, very well prepared for every session.", date: "Mar 2024" }] },
  { id: 3, name: "Tshepiso Ramotswe", avatar: "TR", university: "BIUST", subjects: ["Electrical Engineering", "Circuit Analysis", "Mathematics"], rating: 4.7, reviewCount: 19, rate: "P90/hr", bio: "Engineering student at BIUST. Top of my class in circuits and maths. I make engineering approachable for all levels.", available: false, reviews: [{ id: 1, user: "Neo K.", avatar: "NK", rating: 5, comment: "Best engineering tutor in Botswana. Period.", date: "Feb 2024" }] },
  { id: 4, name: "Onkabetse Dithebe", avatar: "OD", university: "University of Botswana", subjects: ["Law", "Constitutional Law", "Contract Law"], rating: 4.9, reviewCount: 22, rate: "P85/hr", bio: "UB Law student in final year. I help students understand Botswana law cases and how to write high-scoring essays.", available: true, reviews: [{ id: 1, user: "Lesego P.", avatar: "LP", rating: 5, comment: "Onka's essay framework got me an A in constitutional law!", date: "Apr 2024" }, { id: 2, user: "Refilwe S.", avatar: "RS", rating: 5, comment: "Very knowledgeable. Made contract law click for me.", date: "Mar 2024" }] },
  { id: 5, name: "Goabaone Seretse", avatar: "GS", university: "Botho University", subjects: ["Nursing", "Anatomy", "Pharmacology"], rating: 4.8, reviewCount: 15, rate: "P75/hr", bio: "Final year nursing student with clinical experience. I help fellow nursing students with theory and practical exam prep.", available: true, reviews: [{ id: 1, user: "Gaone M.", avatar: "GM", rating: 5, comment: "Goab's anatomy sessions saved my semester. So helpful!", date: "Mar 2024" }] },
  { id: 6, name: "Lorato Kgosi", avatar: "LK", university: "Limkokwing University", subjects: ["Graphic Design", "UI/UX", "Branding"], rating: 4.6, reviewCount: 11, rate: "P65/hr", bio: "Creative design student at Limkokwing. I teach design principles, Adobe tools and how to build a strong portfolio.", available: true, reviews: [{ id: 1, user: "Botho K.", avatar: "BK", rating: 4, comment: "Really helpful for design theory and Adobe tips.", date: "Feb 2024" }] },
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

// ─── SHARED STYLES ─────────────────────────────────────────────────────────────
const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#F8FAFF", boxSizing: "border-box" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#FFFFFF", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: "13px", color: "#0F172A", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" };

// ─── STAR RATING DISPLAY ───────────────────────────────────────────────────────
const Stars = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <span style={{ color: "#F59E0B", fontSize: `${size}px`, fontWeight: 600 }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    <span style={{ color: "#64748B", marginLeft: "4px", fontFamily: "'DM Sans', sans-serif" }}>{rating}</span>
  </span>
);

// ─── INTERACTIVE STAR PICKER ───────────────────────────────────────────────────
const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(n)}
          style={{ fontSize: "28px", cursor: "pointer", color: n <= (hovered || value) ? "#F59E0B" : "#E2E8F0", transition: "color 0.1s" }}>★</span>
      ))}
    </div>
  );
};

// ─── REVIEW CARD ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review }: { review: Review }) => (
  <div style={{ background: "#F8FAFF", borderRadius: "12px", padding: "16px 18px", border: "1px solid #E8EDF5" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{review.avatar}</div>
        <span style={{ fontWeight: 600, fontSize: "14px", color: "#0F172A", fontFamily: "'DM Sans', sans-serif" }}>{review.user}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Stars rating={review.rating} />
        <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>{review.date}</span>
      </div>
    </div>
    <p style={{ margin: 0, fontSize: "13px", color: "#475569", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{review.comment}</p>
  </div>
);

// ─── REVIEW FORM ──────────────────────────────────────────────────────────────
const ReviewForm = ({ onSubmit, onCancel }: { onSubmit: (rating: number, comment: string) => void; onCancel: () => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div style={{ background: "#fff", border: "1.5px solid #3B5BDB", borderRadius: "14px", padding: "20px" }}>
      <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: "14px", color: "#0F172A", fontFamily: "'DM Sans', sans-serif" }}>Your Rating</p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts about this document..." rows={3}
        style={{ ...inputStyle, marginTop: "14px", resize: "vertical", lineHeight: 1.5 }} />
      <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
        <button onClick={() => { if (rating && comment) onSubmit(rating, comment); else alert("Please give a rating and write a comment."); }}
          style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Submit Review</button>
        <button onClick={onCancel} style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
      </div>
    </div>
  );
};

// ─── DOC VIEWER WITH REVIEWS ───────────────────────────────────────────────────
const DocViewer = ({ doc, allDocs, user, onClose, onUpgrade, onReview }: { doc: Document; allDocs: Document[]; user: User | null; onClose: () => void; onUpgrade: () => void; onReview: (docId: number, rating: number, comment: string) => void; }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const canAccess = !doc.premium || user?.plan === "premium";
  const recommended = allDocs.filter(d => d.id !== doc.id && (d.course === doc.course || d.university === doc.university)).slice(0, 3);

  React.useEffect(() => {
    if (!canAccess || user?.plan !== "free") return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); onClose(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [canAccess]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const avgRating = doc.reviews.length ? (doc.reviews.reduce((a, r) => a + r.rating, 0) / doc.reviews.length).toFixed(1) : doc.rating.toFixed(1);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "820px", maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "24px 28px 18px", borderBottom: "1px solid #E8EDF5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, marginRight: "16px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span style={{ background: typeColors[doc.type].bg, color: typeColors[doc.type].text, fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{doc.type}</span>
              {doc.premium && <span style={{ background: "#FFF8E1", color: "#B45309", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>💎 Premium</span>}
              <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>{doc.year}</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#0F172A", margin: "0 0 6px" }}>{doc.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ color: "#64748B", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>🎓 {doc.university}</span>
              <Stars rating={parseFloat(avgRating)} />
              <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>({doc.reviews.length} reviews)</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: "10px", width: "36px", height: "36px", fontSize: "16px", cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>
        {canAccess && user?.plan === "free" && (
          <div style={{ background: "#FFF8E1", padding: "10px 28px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #FDE68A" }}>
            <span>⏱️</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#B45309", fontFamily: "'DM Sans', sans-serif" }}>
              Free access: <strong>{mins}:{secs}</strong> remaining — <span style={{ color: "#3B5BDB", cursor: "pointer", fontWeight: 600 }} onClick={onUpgrade}>Upgrade for unlimited</span>
            </p>
          </div>
        )}
        {!canAccess ? (
          <div style={{ padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>💎</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#0F172A", margin: "0 0 8px" }}>Premium Content</h3>
            <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.6 }}>Subscribe to access this {doc.type.toLowerCase()} and all premium materials.</p>
            <button onClick={onUpgrade} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 32px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View Plans →</button>
          </div>
        ) : (
          <>
            <div style={{ padding: "14px 28px", background: "#F8FAFF", borderBottom: "1px solid #E8EDF5", display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[["📄", `${doc.pages} pages`], ["👁️", `${doc.downloads.toLocaleString()} views`], ["📚", doc.subject]].map(([icon, label]) => (
                <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}><span>{icon}</span><span>{label}</span></div>
              ))}
            </div>
            <div style={{ padding: "24px 28px" }}>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>Document Preview</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Array.from({ length: Math.min(doc.pages, 4) }, (_, i) => i + 1).map(page => (
                  <div key={page} style={{ background: "#F8FAFF", border: "1px solid #E8EDF5", borderRadius: "12px", padding: "16px 20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Page {page}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                      {[0.9, 0.7, 0.85, 0.6].map((w, i) => <div key={i} style={{ height: "9px", background: "#E2E8F0", borderRadius: "4px", width: `${w * 100}%` }} />)}
                      {page === 1 && <div style={{ marginTop: "8px", padding: "10px 14px", background: "#EAF3FF", borderRadius: "8px", borderLeft: "3px solid #3B5BDB" }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#1E3A8A", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}><strong>Topics: </strong>{doc.preview}</p>
                      </div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "0 28px 24px" }}>
              <div style={{ borderTop: "1px solid #E8EDF5", paddingTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#0F172A", margin: "0 0 4px" }}>Ratings & Reviews</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "36px", fontWeight: 800, color: "#0F172A", fontFamily: "'Playfair Display', serif" }}>{avgRating}</span>
                      <div>
                        <Stars rating={parseFloat(avgRating)} size={16} />
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>{doc.reviews.length} review{doc.reviews.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </div>
                  {user && !showReviewForm && (
                    <button onClick={() => setShowReviewForm(true)} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✍️ Write a Review</button>
                  )}
                  {!user && <p style={{ fontSize: "13px", color: "#64748B", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>Sign in to leave a review</p>}
                </div>
                {showReviewForm && (
                  <div style={{ marginBottom: "20px" }}>
                    <ReviewForm onSubmit={(r, c) => { onReview(doc.id, r, c); setShowReviewForm(false); }} onCancel={() => setShowReviewForm(false)} />
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {doc.reviews.length > 0 ? doc.reviews.map(review => <ReviewCard key={review.id} review={review} />) : (
                    <div style={{ textAlign: "center", padding: "24px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
                      <p style={{ fontSize: "24px", margin: "0 0 8px" }}>✍️</p>
                      <p style={{ fontSize: "14px", margin: 0 }}>No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {recommended.length > 0 && (
              <div style={{ padding: "0 28px 28px" }}>
                <div style={{ borderTop: "1px solid #E8EDF5", paddingTop: "24px" }}>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#0F172A", margin: "0 0 16px" }}>📖 You Might Also Like</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                    {recommended.map(rec => (
                      <div key={rec.id} style={{ background: "#F8FAFF", borderRadius: "12px", padding: "16px", border: "1px solid #E8EDF5", cursor: "pointer" }}
                        onClick={() => { onClose(); setTimeout(() => document.dispatchEvent(new CustomEvent("openDoc", { detail: rec })), 100); }}>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ background: typeColors[rec.type].bg, color: typeColors[rec.type].text, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>{rec.type}</span>
                          {rec.premium && <span style={{ fontSize: "10px" }}>💎</span>}
                        </div>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: 700, color: "#0F172A", margin: "0 0 6px", lineHeight: 1.3 }}>{rec.title}</p>
                        <Stars rating={rec.rating} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div style={{ padding: "18px 28px", borderTop: "1px solid #E8EDF5", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#475569", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Close</button>
              {user?.plan === "premium" && <button style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>⬇️ Download PDF</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── TUTOR CARD ────────────────────────────────────────────────────────────────
const TutorCard = ({ tutor, onOpen }: { tutor: Tutor; onOpen: (t: Tutor) => void }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onOpen(tutor)}
      style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: hovered ? "1.5px solid #3B5BDB" : "1.5px solid #E8EDF5", boxShadow: hovered ? "0 8px 32px rgba(59,91,219,0.10)" : "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer", transition: "all 0.2s", transform: hovered ? "translateY(-3px)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{tutor.avatar}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#0F172A", margin: "0 0 2px" }}>{tutor.name}</h3>
          <p style={{ color: "#64748B", fontSize: "12px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>🎓 {tutor.university}</p>
        </div>
        <span style={{ background: tutor.available ? "#EAFAF1" : "#FEF2F2", color: tutor.available ? "#15803D" : "#DC2626", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{tutor.available ? "✅ Available" : "❌ Busy"}</span>
      </div>
      <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 14px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{tutor.bio}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
        {tutor.subjects.map(s => <span key={s} style={{ background: "#EAF3FF", color: "#2563EB", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>{s}</span>)}
      </div>
      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Stars rating={tutor.rating} />
          <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>({tutor.reviewCount})</span>
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#3B5BDB" }}>{tutor.rate}</span>
      </div>
    </div>
  );
};

// ─── TUTOR VIEWER ──────────────────────────────────────────────────────────────
const TutorViewer = ({ tutor, user, onClose, onSignIn, onReview }: { tutor: Tutor; user: User | null; onClose: () => void; onSignIn: () => void; onReview: (tutorId: number, rating: number, comment: string) => void }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [booked, setBooked] = useState(false);
  const avg = tutor.reviews.length ? (tutor.reviews.reduce((a, r) => a + r.rating, 0) / tutor.reviews.length).toFixed(1) : tutor.rating.toFixed(1);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "700px", maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg, #1E3A8A, #3B5BDB)", padding: "28px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "22px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{tutor.avatar}</div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#fff", margin: "0 0 4px" }}>{tutor.name}</h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif" }}>🎓 {tutor.university}</p>
              <Stars rating={parseFloat(avg)} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "10px", width: "36px", height: "36px", fontSize: "16px", cursor: "pointer", color: "#fff" }}>✕</button>
        </div>
        <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: "0 0 8px" }}>About</h4>
            <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 14px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{tutor.bio}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {tutor.subjects.map(s => <span key={s} style={{ background: "#EAF3FF", color: "#2563EB", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>{s}</span>)}
            </div>
          </div>
          <div style={{ background: "#F8FAFF", borderRadius: "14px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#64748B", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", fontWeight: 600 }}>Session Rate</p>
              <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: "#3B5BDB" }}>{tutor.rate}</p>
            </div>
            {booked ? (
              <div style={{ background: "#EAFAF1", borderRadius: "12px", padding: "12px 20px", textAlign: "center" }}>
                <p style={{ margin: 0, color: "#15803D", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>✅ Session Requested!</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>{tutor.name} will contact you soon</p>
              </div>
            ) : (
              <button onClick={() => user ? setShowBook(true) : onSignIn()} style={{ background: tutor.available ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#94A3B8", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 28px", fontSize: "15px", fontWeight: 700, cursor: tutor.available ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}>
                {tutor.available ? "📅 Book a Session" : "Currently Unavailable"}
              </button>
            )}
          </div>
          {showBook && !booked && (
            <div style={{ background: "#fff", border: "1.5px solid #3B5BDB", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: 0 }}>Book a Session</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div><label style={labelStyle}>Preferred Date</label><input type="date" style={inputStyle} /></div>
                <div><label style={labelStyle}>Preferred Time</label><input type="time" style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Topic to Cover</label><input placeholder="e.g. Binary Trees, SQL Joins..." style={inputStyle} /></div>
              <div><label style={labelStyle}>Additional Notes</label><textarea rows={2} placeholder="Any specific questions or areas of concern..." style={{ ...inputStyle, resize: "vertical" }} /></div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { setBooked(true); setShowBook(false); }} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Confirm Booking</button>
                <button onClick={() => setShowBook(false)} style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              </div>
            </div>
          )}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#0F172A", margin: 0 }}>Student Reviews ({tutor.reviews.length})</h4>
              {user && !showReviewForm && <button onClick={() => setShowReviewForm(true)} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "10px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✍️ Rate Tutor</button>}
            </div>
            {showReviewForm && <div style={{ marginBottom: "16px" }}><ReviewForm onSubmit={(r, c) => { onReview(tutor.id, r, c); setShowReviewForm(false); }} onCancel={() => setShowReviewForm(false)} /></div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tutor.reviews.length > 0 ? tutor.reviews.map(r => <ReviewCard key={r.id} review={r} />) : (
                <div style={{ textAlign: "center", padding: "24px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
                  <p style={{ fontSize: "24px", margin: "0 0 8px" }}>✍️</p><p style={{ fontSize: "14px", margin: 0 }}>No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TUTORS PAGE ───────────────────────────────────────────────────────────────
const TutorsPage = ({ user, onSignIn, tutors, onReview }: { user: User | null; onSignIn: () => void; tutors: Tutor[]; onReview: (id: number, r: number, c: string) => void }) => {
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [search, setSearch] = useState("");
  const [filterUni, setFilterUni] = useState("All");
  const filtered = tutors.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.subjects.some(s => s.toLowerCase().includes(q));
    const matchUni = filterUni === "All" || t.university === filterUni;
    return matchQ && matchUni;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {selectedTutor && <TutorViewer tutor={tutors.find(t => t.id === selectedTutor.id) || selectedTutor} user={user} onClose={() => setSelectedTutor(null)} onSignIn={() => { setSelectedTutor(null); onSignIn(); }} onReview={onReview} />}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ display: "inline-block", background: "#EAF3FF", color: "#2563EB", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, marginBottom: "14px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>👨‍🏫 Tutor Marketplace</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: "#0F172A", margin: "0 0 10px" }}>Find Your Perfect Tutor</h2>
        <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "500px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>Connect with top students from Botswana universities for 1-on-1 tutoring sessions</p>
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", background: "#fff", borderRadius: "12px", border: "1.5px solid #E2E8F0", padding: "0 16px" }}>
          <span style={{ marginRight: "8px", fontSize: "16px" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or subject..." style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#0F172A", background: "transparent", fontFamily: "'DM Sans', sans-serif", padding: "12px 0" }} />
        </div>
        <select value={filterUni} onChange={e => setFilterUni(e.target.value)} style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E2E8F0", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#475569", background: "#fff", outline: "none" }}>
          <option value="All">All Universities</option>
          {universities.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {filtered.map(tutor => <TutorCard key={tutor.id} tutor={tutor} onOpen={setSelectedTutor} />)}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
            <p style={{ fontSize: "40px", margin: "0 0 12px" }}>👨‍🏫</p>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>No tutors found</p>
          </div>
        )}
      </div>
      <div style={{ marginTop: "48px", background: "linear-gradient(135deg, #1E3A8A, #3B5BDB)", borderRadius: "20px", padding: "40px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#fff", margin: "0 0 10px" }}>Are You a Top Student?</h3>
        <p style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif", maxWidth: "400px", margin: "0 auto 20px" }}>Join our tutor marketplace and earn money helping fellow students pass their exams.</p>
        <button style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: "12px", padding: "12px 28px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Apply to Become a Tutor →</button>
      </div>
    </div>
  );
};

// ─── PAYMENT MODAL ─────────────────────────────────────────────────────────────
const PaymentModal = ({ plan, onSuccess, onClose }: { plan: typeof PLANS[0]; onSuccess: () => void; onClose: () => void }) => {
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [cardNum, setCardNum] = useState(""); const [expiry, setExpiry] = useState(""); const [cvv, setCvv] = useState(""); const [name, setName] = useState("");
  const handlePay = () => { if (!cardNum || !expiry || !cvv || !name) { alert("Please fill in all card details."); return; } setStep("processing"); setTimeout(() => { setStep("success"); setTimeout(onSuccess, 1500); }, 2500); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "460px", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg, #1E3A8A, #3B5BDB)", padding: "24px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ margin: 0, fontSize: "12px", opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>NoteFlow Premium</p><h3 style={{ margin: "4px 0 0", fontFamily: "'Playfair Display', serif", fontSize: "22px" }}>{plan.name} Plan</h3></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>{plan.price}</div><div style={{ fontSize: "12px", opacity: 0.75, fontFamily: "'DM Sans', sans-serif" }}>{plan.period}</div></div>
        </div>
        <div style={{ padding: "28px" }}>
          {step === "details" && <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "13px", color: "#0F172A", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>Card Details</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Cardholder Name" style={inp} />
            <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} placeholder="1234 5678 9012 3456" style={inp} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input value={expiry} onChange={e => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); setExpiry(v); }} placeholder="MM/YY" style={inp} />
              <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="CVV" style={inp} />
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "8px" }}><span>🔒</span><p style={{ margin: 0, fontSize: "12px", color: "#15803D", fontFamily: "'DM Sans', sans-serif" }}>256-bit SSL encryption</p></div>
            <button onClick={handlePay} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Pay {plan.price} →</button>
            <button onClick={onClose} style={{ background: "transparent", color: "#64748B", border: "none", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          </div>}
          {step === "processing" && <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div><h3 style={{ fontFamily: "'Playfair Display', serif", color: "#0F172A" }}>Processing...</h3></div>}
          {step === "success" && <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div><h3 style={{ fontFamily: "'Playfair Display', serif", color: "#0F172A" }}>Payment Successful!</h3><p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>Welcome to NoteFlow Premium 🇧🇼</p></div>}
        </div>
      </div>
    </div>
  );
};

// ─── SIGN IN MODAL ─────────────────────────────────────────────────────────────
const SignInModal = ({ onSignIn, onClose }: { onSignIn: (u: User) => void; onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
    <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "400px", margin: "0 20px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
      <div style={{ width: 52, height: 52, borderRadius: "14px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 16px" }}>📚</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#0F172A", margin: "0 0 8px" }}>Welcome to NoteFlow</h2>
      <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif" }}>Sign in to access study materials from Botswana universities</p>
      <button onClick={() => onSignIn({ name: "Thabang Odirile", email: "thabang@gmail.com", avatar: "TO", plan: "free" })}
        style={{ width: "100%", padding: "13px 20px", borderRadius: "12px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#0F172A", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
        Continue with Google
      </button>
      <p style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>By signing in you agree to our Terms of Service</p>
    </div>
  </div>
);

// ─── DOC CARD ──────────────────────────────────────────────────────────────────
const DocCard = ({ doc, onOpen }: { doc: Document; onOpen: (d: Document) => void }) => {
  const [hovered, setHovered] = useState(false);
  const colors = typeColors[doc.type];
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onOpen(doc)}
      style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: hovered ? "1.5px solid #3B5BDB" : "1.5px solid #E8EDF5", boxShadow: hovered ? "0 8px 32px rgba(59,91,219,0.10)" : "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer", transition: "all 0.22s", transform: hovered ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column", gap: "14px", position: "relative" }}>
      {doc.premium && <div style={{ position: "absolute", top: 16, right: 16, background: "#FFF8E1", color: "#B45309", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>💎 Premium</div>}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ background: colors.bg, color: colors.text, fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{doc.type}</span>
        <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", marginRight: doc.premium ? "64px" : "0" }}>{doc.year}</span>
      </div>
      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: "#0F172A", lineHeight: 1.4, margin: 0 }}>{doc.title}</h3>
        <p style={{ color: "#64748B", fontSize: "12.5px", margin: "6px 0 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{doc.preview}</p>
      </div>
      <p style={{ color: "#475569", fontSize: "12.5px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>🎓 {doc.university}</p>
      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stars rating={doc.rating} />
        <div style={{ display: "flex", gap: "10px", color: "#64748B", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
          <span>📄 {doc.pages}p</span>
          <span>💬 {doc.reviews.length}</span>
        </div>
      </div>
    </div>
  );
};

// ─── PRICING PAGE ──────────────────────────────────────────────────────────────
const PricingPage = ({ user, onSubscribe }: { user: User | null; onSubscribe: () => void }) => {
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {selectedPlan && <PaymentModal plan={selectedPlan} onSuccess={() => { onSubscribe(); setSelectedPlan(null); }} onClose={() => setSelectedPlan(null)} />}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ display: "inline-block", background: "#EAF3FF", color: "#2563EB", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, marginBottom: "16px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>💎 Premium Access</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "38px", color: "#0F172A", margin: "0 0 12px" }}>Unlock Everything</h2>
        <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "500px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>Full access to all notes, textbooks, past exam papers and more from every Botswana university.</p>
      </div>
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
            <button onClick={() => user ? setSelectedPlan(plan) : alert("Please sign in first!")} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: user?.plan === "premium" ? "#E2E8F0" : `linear-gradient(135deg, ${plan.color}, #6366F1)`, color: user?.plan === "premium" ? "#64748B" : "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {user?.plan === "premium" ? "✅ Current Plan" : "Subscribe Now →"}
            </button>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", marginTop: "28px", color: "#94A3B8", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>🔒 Secure payment · Cancel anytime · Instant access</p>
    </div>
  );
};

// ─── UPLOAD PAGE ───────────────────────────────────────────────────────────────
const UploadPage = ({ user, onSignIn }: { user: User | null; onSignIn: () => void }) => {
  const [selectedUni, setSelectedUni] = useState(""); const [selectedType, setSelectedType] = useState("Notes");
  const [title, setTitle] = useState(""); const [fileName, setFileName] = useState(""); const [submitted, setSubmitted] = useState(false); const [dragging, setDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uniObj = universities.find(u => u.name === selectedUni);
  if (!user) return <div style={{ maxWidth: "500px", margin: "80px auto", textAlign: "center", padding: "0 24px" }}><div style={{ fontSize: "56px", marginBottom: "16px" }}>🔐</div><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#0F172A" }}>Sign In to Upload</h2><p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif", marginBottom: "24px" }}>You need to be signed in to share your study materials.</p><button onClick={onSignIn} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 32px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "15px" }}>Sign In with Google →</button></div>;
  if (submitted) return <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "0 24px" }}><div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A" }}>Upload Successful!</h2><p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}><strong>{fileName}</strong> has been submitted.</p><button onClick={() => { setSubmitted(false); setFileName(""); setTitle(""); setSelectedUni(""); }} style={{ marginTop: "24px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 28px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Upload Another</button></div>;
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "6px" }}>Upload Your Notes</h2>
      <p style={{ color: "#64748B", marginBottom: "36px", fontFamily: "'DM Sans', sans-serif" }}>Share your study materials and help fellow students in Botswana</p>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "36px", border: "1.5px solid #E8EDF5", display: "flex", flexDirection: "column", gap: "22px" }}>
        <div><label style={labelStyle}>Document Title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Java - Week 1 Notes" style={inputStyle} /></div>
        <div><label style={labelStyle}>University / College *</label><select value={selectedUni} onChange={e => setSelectedUni(e.target.value)} style={inputStyle}><option value="">— Select your institution —</option>{universities.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}</select></div>
        {uniObj && <div><label style={labelStyle}>Course *</label><select style={inputStyle}><option value="">— Select your course —</option>{uniObj.courses.map(c => <option key={c}>{c}</option>)}</select></div>}
        <div><label style={labelStyle}>Document Type *</label><div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>{["Notes", "Exam", "Summary", "Textbook"].map(type => <button key={type} onClick={() => setSelectedType(type)} style={{ padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, border: selectedType === type ? "none" : "1.5px solid #CBD5E1", background: selectedType === type ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#fff", color: selectedType === type ? "#fff" : "#475569", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{type}</button>)}</div></div>
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN PORTAL ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const ADMIN_CREDENTIALS = { username: "Mark", password: "mark12345" };

const adminSidebarItems = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "users", icon: "👥", label: "User Management" },
  { id: "verification", icon: "✅", label: "Tutor Verification" },
  { id: "payments", icon: "💳", label: "Payment Monitoring" },
  { id: "ratings", icon: "⭐", label: "Ratings Monitor" },
  { id: "maintenance", icon: "⚙️", label: "System Maintenance" },
];

const mockVerifications = [
  { id: 1, name: "—", university: "University of Botswana", subject: "Computer Science", submitted: "10 Mar 2026", status: "pending", docs: "ID, Transcript" },
  { id: 2, name: "—", university: "BIUST", subject: "Electrical Engineering", submitted: "09 Mar 2026", status: "pending", docs: "ID, Transcript, Certificate" },
  { id: 3, name: "—", university: "BAC", subject: "Accounting", submitted: "08 Mar 2026", status: "approved" as const, docs: "ID" },
  { id: 4, name: "—", university: "Botho University", subject: "Nursing", submitted: "07 Mar 2026", status: "rejected" as const, docs: "ID" },
];

const mockPayments = [
  { id: "TXN-001", student: "—", plan: "Monthly", amount: "P89", date: "15 Mar 2026", status: "completed" as const },
  { id: "TXN-002", student: "—", plan: "Semester", amount: "P199", date: "14 Mar 2026", status: "completed" as const },
  { id: "TXN-003", student: "—", plan: "Annual", amount: "P299", date: "13 Mar 2026", status: "pending" as const },
  { id: "TXN-004", student: "—", plan: "Monthly", amount: "P89", date: "12 Mar 2026", status: "failed" as const },
  { id: "TXN-005", student: "—", plan: "Semester", amount: "P199", date: "11 Mar 2026", status: "completed" as const },
];

const mockAdminRatings = [
  { id: 1, reviewer: "—", target: "Document: Java Notes", rating: 5, comment: "Excellent resource.", date: "15 Mar 2026", type: "doc", flagged: false },
  { id: 2, reviewer: "—", target: "Tutor: —", rating: 1, comment: "Did not show up for session.", date: "14 Mar 2026", type: "tutor", flagged: true },
  { id: 3, reviewer: "—", target: "Document: DB Exam 2023", rating: 4, comment: "Very helpful for revision.", date: "13 Mar 2026", type: "doc", flagged: false },
  { id: 4, reviewer: "—", target: "Tutor: —", rating: 2, comment: "Poor explanation skills.", date: "12 Mar 2026", type: "tutor", flagged: true },
];

const StatusPill = ({ status }: { status: string }) => {
  const styles: Record<string, { bg: string; color: string }> = {
    completed: { bg: "#D1FAE5", color: "#065F46" }, pending: { bg: "#FEF3C7", color: "#92400E" },
    failed: { bg: "#FEE2E2", color: "#991B1B" }, approved: { bg: "#D1FAE5", color: "#065F46" },
    rejected: { bg: "#FEE2E2", color: "#991B1B" }, active: { bg: "#DBEAFE", color: "#1E40AF" },
    inactive: { bg: "#F1F5F9", color: "#475569" }, online: { bg: "#D1FAE5", color: "#065F46" },
    degraded: { bg: "#FEF3C7", color: "#92400E" },
  };
  const s = styles[status] || styles.inactive;
  return <span style={{ background: s.bg, color: s.color, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize" }}>{status}</span>;
};

// Admin: Overview
const AdminOverview = () => {
  const cards = [
    { label: "Total Students", value: "0", sub: "Registered accounts", icon: "🎓", color: "#3B5BDB" },
    { label: "Active Tutors", value: "0", sub: "Verified profiles", icon: "👨‍🏫", color: "#059669" },
    { label: "Total Revenue", value: "P0", sub: "All-time earnings", icon: "💰", color: "#D97706" },
    { label: "Pending Verifications", value: "2", sub: "Awaiting review", icon: "⏳", color: "#DC2626" },
  ];
  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A", margin: "0 0 6px" }}>Dashboard Overview</h1>
      <p style={{ color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: "0 0 28px" }}>Welcome back, Mark. Here's what's happening on NoteFlow today.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {cards.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #E8EDF5" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "12px", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{s.icon}</div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", marginTop: 4 }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>{s.value}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F172A", marginBottom: "2px" }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8" }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #E8EDF5" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: "0 0 20px" }}>Platform Statistics</h3>
          {[["Documents Uploaded", "13"], ["Sessions Booked", "0"], ["Premium Subscribers", "0"], ["Flagged Reviews", "2"]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{label}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #E8EDF5" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: "0 0 20px" }}>Recent Activity</h3>
          {[
            { dot: "#3B5BDB", text: "2 new tutor verification requests", time: "2h ago" },
            { dot: "#D97706", text: "New transaction: P199 (Semester Plan)", time: "5h ago" },
            { dot: "#DC2626", text: "2 reviews flagged for moderation", time: "1d ago" },
            { dot: "#059669", text: "System backup completed successfully", time: "2d ago" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, marginTop: 5, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#0F172A", margin: "0 0 2px" }}>{a.text}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94A3B8", margin: 0 }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Admin: User Management
const AdminUserManagement = () => {
  const [tab, setTab] = useState<"students" | "tutors">("students");
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", university: "", course: "", subjects: "", rate: "", plan: "free" });
  const iS: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#F8FAFF", boxSizing: "border-box" };
  const lS: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: "4px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" };

  const save = () => {
    if (!form.name || !form.email) { alert("Name and email are required."); return; }
    if (tab === "students") setStudents(p => [...p, { ...form, id: Date.now(), joined: "Today", status: "active" }]);
    else setTutors(p => [...p, { ...form, id: Date.now(), joined: "Today", status: "pending" }]);
    setForm({ name: "", email: "", university: "", course: "", subjects: "", rate: "", plan: "free" });
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A", margin: "0 0 4px" }}>User Management</h1>
          <p style={{ color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>Manage all student and tutor accounts.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Add {tab === "students" ? "Student" : "Tutor"}</button>
      </div>
      <div style={{ display: "flex", gap: "4px", background: "#F1F5F9", borderRadius: "10px", padding: "4px", width: "fit-content", marginBottom: "24px" }}>
        {(["students", "tutors"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} style={{ padding: "8px 24px", borderRadius: "8px", border: "none", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#0F172A" : "#64748B", fontWeight: tab === t ? 700 : 500, fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none", textTransform: "capitalize" }}>
            {t} ({t === "students" ? students.length : tutors.length})
          </button>
        ))}
      </div>
      {showForm && (
        <div style={{ background: "#fff", border: "1.5px solid #3B5BDB", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: "0 0 16px" }}>Add New {tab === "students" ? "Student" : "Tutor"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div><label style={lS}>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" style={iS} /></div>
            <div><label style={lS}>Email *</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" style={iS} /></div>
            <div><label style={lS}>University</label><input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} placeholder="University name" style={iS} /></div>
            {tab === "students" ? (
              <>
                <div><label style={lS}>Course</label><input value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} placeholder="e.g. Computer Science" style={iS} /></div>
                <div><label style={lS}>Plan</label><select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} style={iS}><option value="free">Free</option><option value="premium">Premium</option></select></div>
              </>
            ) : (
              <>
                <div><label style={lS}>Subjects</label><input value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} placeholder="e.g. Maths, Physics" style={iS} /></div>
                <div><label style={lS}>Session Rate</label><input value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="e.g. P80/hr" style={iS} /></div>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={save} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #E8EDF5", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFF" }}>
              {(tab === "students" ? ["Name", "Email", "University", "Course", "Plan", "Joined", "Status", ""] : ["Name", "Email", "University", "Subjects", "Rate", "Joined", "Status", ""]).map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748B", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #E8EDF5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(tab === "students" ? students : tutors).length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>No {tab} yet. Add one above.</td></tr>
            ) : (tab === "students" ? students : tutors).map((u: any) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>{u.name}</td>
                <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{u.email}</td>
                <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{u.university || "—"}</td>
                <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{tab === "students" ? (u.course || "—") : (u.subjects || "—")}</td>
                <td style={{ padding: "13px 16px" }}>
                  {tab === "students"
                    ? <span style={{ background: u.plan === "premium" ? "#FFF8E1" : "#F1F5F9", color: u.plan === "premium" ? "#B45309" : "#64748B", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>{u.plan === "premium" ? "💎 Premium" : "Free"}</span>
                    : <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#3B5BDB", fontWeight: 600 }}>{u.rate || "—"}</span>}
                </td>
                <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8" }}>{u.joined}</td>
                <td style={{ padding: "13px 16px" }}><StatusPill status={u.status} /></td>
                <td style={{ padding: "13px 16px" }}><button onClick={() => tab === "students" ? setStudents(p => p.filter((x: any) => x.id !== u.id)) : setTutors(p => p.filter((x: any) => x.id !== u.id))} style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin: Tutor Verification
const AdminVerification = () => {
  const [verifications, setVerifications] = useState(mockVerifications);
  const update = (id: number, status: string) => setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  const pending = verifications.filter(v => v.status === "pending");
  const reviewed = verifications.filter(v => v.status !== "pending");

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A", margin: "0 0 4px" }}>Tutor Verification</h1>
      <p style={{ color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: "0 0 24px" }}>Review and verify tutor applications before they go live on the platform.</p>
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
        {[{ label: "Pending Review", val: pending.length, color: "#D97706", bg: "#FEF3C7" }, { label: "Approved", val: verifications.filter(v => v.status === "approved").length, color: "#059669", bg: "#D1FAE5" }, { label: "Rejected", val: verifications.filter(v => v.status === "rejected").length, color: "#DC2626", bg: "#FEE2E2" }].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "12px", padding: "14px 20px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: s.color, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {pending.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#64748B", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>⏳ Pending Review</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
            {pending.map(v => (
              <div key={v.id} style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", border: "1.5px solid #FDE68A" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#0F172A", margin: "0 0 4px" }}>{v.name}</h4>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569", margin: "0 0 8px" }}>🎓 {v.university} · {v.subject}</p>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#64748B" }}>📅 Submitted: {v.submitted}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#64748B" }}>📎 Documents: {v.docs}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => update(v.id, "approved")} style={{ background: "#D1FAE5", color: "#065F46", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✓ Approve</button>
                    <button onClick={() => update(v.id, "rejected")} style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✕ Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {reviewed.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#64748B", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>📋 Previously Reviewed</h3>
          <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #E8EDF5", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#F8FAFF" }}>{["Name", "University", "Subject", "Submitted", "Status"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748B", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", borderBottom: "1px solid #E8EDF5" }}>{h}</th>)}</tr></thead>
              <tbody>{reviewed.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>{v.name}</td>
                  <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{v.university}</td>
                  <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{v.subject}</td>
                  <td style={{ padding: "13px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8" }}>{v.submitted}</td>
                  <td style={{ padding: "13px 16px" }}><StatusPill status={v.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// Admin: Payment Monitoring
const AdminPayments = () => {
  const total = mockPayments.filter(p => p.status === "completed").reduce((a, p) => a + parseInt(p.amount.replace("P", "")), 0);
  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A", margin: "0 0 4px" }}>Payment Monitoring</h1>
      <p style={{ color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: "0 0 24px" }}>Track all transactions and subscription payments.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        {[{ label: "Total Revenue", value: `P${total}`, icon: "💰", color: "#059669", bg: "#D1FAE5" }, { label: "Completed", value: String(mockPayments.filter(p => p.status === "completed").length), icon: "✅", color: "#059669", bg: "#D1FAE5" }, { label: "Pending", value: String(mockPayments.filter(p => p.status === "pending").length), icon: "⏳", color: "#D97706", bg: "#FEF3C7" }, { label: "Failed", value: String(mockPayments.filter(p => p.status === "failed").length), icon: "❌", color: "#DC2626", bg: "#FEE2E2" }].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "14px", padding: "18px 20px" }}>
            <div style={{ fontSize: "18px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: s.color, marginBottom: "2px" }}>{s.value}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: s.color, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #E8EDF5", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8EDF5" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: 0 }}>Transaction History</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#F8FAFF" }}>{["Transaction ID", "Student", "Plan", "Amount", "Date", "Status"].map(h => <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748B", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #E8EDF5" }}>{h}</th>)}</tr></thead>
          <tbody>{mockPayments.map(p => (
            <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
              <td style={{ padding: "14px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3B5BDB" }}>{p.id}</td>
              <td style={{ padding: "14px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{p.student}</td>
              <td style={{ padding: "14px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{p.plan}</td>
              <td style={{ padding: "14px 20px", fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 700, color: "#059669" }}>{p.amount}</td>
              <td style={{ padding: "14px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8" }}>{p.date}</td>
              <td style={{ padding: "14px 20px" }}><StatusPill status={p.status} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

// Admin: Ratings Monitor
const AdminRatings = () => {
  const [ratings, setRatings] = useState(mockAdminRatings);
  const [filter, setFilter] = useState("all");
  const remove = (id: number) => setRatings(prev => prev.filter(r => r.id !== id));
  const unflag = (id: number) => setRatings(prev => prev.map(r => r.id === id ? { ...r, flagged: false } : r));
  const displayed = filter === "flagged" ? ratings.filter(r => r.flagged) : filter === "doc" ? ratings.filter(r => r.type === "doc") : filter === "tutor" ? ratings.filter(r => r.type === "tutor") : ratings;

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A", margin: "0 0 4px" }}>Ratings Monitor</h1>
      <p style={{ color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: "0 0 24px" }}>Monitor all reviews and manage flagged content.</p>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[{ label: "All Reviews", value: "all" }, { label: `⚑ Flagged (${ratings.filter(r => r.flagged).length})`, value: "flagged" }, { label: "Document Reviews", value: "doc" }, { label: "Tutor Reviews", value: "tutor" }].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, border: filter === f.value ? "none" : "1.5px solid #E2E8F0", background: filter === f.value ? "#0F172A" : "#fff", color: filter === f.value ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {displayed.map(r => (
          <div key={r.id} style={{ background: "#fff", borderRadius: "14px", padding: "18px 22px", border: `1.5px solid ${r.flagged ? "#FCA5A5" : "#E8EDF5"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                  {r.flagged && <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>⚑ Flagged</span>}
                  <span style={{ background: r.type === "doc" ? "#EAF3FF" : "#F5F0FF", color: r.type === "doc" ? "#2563EB" : "#7C3AED", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>{r.type === "doc" ? "Document" : "Tutor"}</span>
                  <span style={{ color: "#F59E0B", fontSize: "13px" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F172A", margin: "0 0 3px" }}>{r.target}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569", margin: "0 0 6px" }}>{r.comment}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94A3B8", margin: 0 }}>By {r.reviewer} · {r.date}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {r.flagged && <button onClick={() => unflag(r.id)} style={{ background: "#D1FAE5", color: "#065F46", border: "none", borderRadius: "7px", padding: "7px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Clear Flag</button>}
                <button onClick={() => remove(r.id)} style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: "7px", padding: "7px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        {displayed.length === 0 && <div style={{ textAlign: "center", padding: "48px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>No reviews in this category.</div>}
      </div>
    </div>
  );
};

// Admin: System Maintenance
const AdminMaintenance = () => {
  const [features, setFeatures] = useState({ uploads: true, payments: true, tutorBooking: true, freeAccess: true, premiumOnly: false, maintenanceMode: false });
  const [backupStatus, setBackupStatus] = useState<"idle" | "running" | "done">("idle");
  const toggle = (key: keyof typeof features) => setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  const featureList = [
    { key: "uploads" as const, label: "Document Uploads", desc: "Allow users to upload new study materials" },
    { key: "payments" as const, label: "Payment Processing", desc: "Enable subscription payments and upgrades" },
    { key: "tutorBooking" as const, label: "Tutor Booking", desc: "Allow students to book tutoring sessions" },
    { key: "freeAccess" as const, label: "Free Document Access", desc: "Let free users access non-premium documents" },
    { key: "premiumOnly" as const, label: "Premium-Only Mode", desc: "Restrict all documents to premium subscribers" },
    { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Show maintenance banner to all users" },
  ];
  const services = [{ name: "API Server", status: "online" }, { name: "Database", status: "online" }, { name: "File Storage", status: "online" }, { name: "Payment Gateway", status: "degraded" }, { name: "Email Service", status: "online" }];

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A", margin: "0 0 4px" }}>System Maintenance</h1>
      <p style={{ color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: "0 0 28px" }}>Manage platform features, monitor service health and run system operations.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #E8EDF5" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: "0 0 20px" }}>Feature Toggles</h3>
          {featureList.map(f => (
            <div key={f.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "14px", marginBottom: "14px", borderBottom: "1px solid #F1F5F9" }}>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F172A", margin: "0 0 2px" }}>{f.label}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94A3B8", margin: 0 }}>{f.desc}</p>
              </div>
              <div onClick={() => toggle(f.key)} style={{ width: 44, height: 24, borderRadius: "12px", background: features[f.key] ? "#3B5BDB" : "#CBD5E1", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: features[f.key] ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #E8EDF5" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: "0 0 16px" }}>Service Health</h3>
            {services.map(s => (
              <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569" }}>{s.name}</span>
                <StatusPill status={s.status} />
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #E8EDF5" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0F172A", margin: "0 0 6px" }}>System Backup</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#64748B", margin: "0 0 16px" }}>Last backup: 15 Mar 2026, 02:00 AM</p>
            <button onClick={() => { setBackupStatus("running"); setTimeout(() => setBackupStatus("done"), 2500); }} disabled={backupStatus === "running"}
              style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "none", background: backupStatus === "done" ? "#D1FAE5" : backupStatus === "running" ? "#F1F5F9" : "linear-gradient(135deg, #3B5BDB, #6366F1)", color: backupStatus === "done" ? "#065F46" : backupStatus === "running" ? "#94A3B8" : "#fff", fontSize: "13px", fontWeight: 700, cursor: backupStatus === "running" ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {backupStatus === "idle" ? "🔄 Run Manual Backup" : backupStatus === "running" ? "⏳ Running Backup..." : "✅ Backup Complete"}
            </button>
          </div>
          <div style={{ background: "#FEF3C7", borderRadius: "16px", padding: "20px", border: "1.5px solid #FDE68A" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#92400E", margin: "0 0 6px" }}>⚠️ Danger Zone</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#B45309", margin: "0 0 12px" }}>These actions are irreversible. Proceed with caution.</p>
            <button onClick={() => alert("Disabled in demo mode.")} style={{ background: "#FEE2E2", color: "#991B1B", border: "1.5px solid #FCA5A5", borderRadius: "8px", padding: "9px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>🗑️ Clear All Test Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin: Login Screen
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (!username || !password) { setError("Please enter your credentials."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) { onLogin(); }
      else { setError("Invalid username or password."); setLoading(false); }
    }, 900);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, #0D1526 0%, #1E3A8A 100%)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "48px 44px", width: "100%", maxWidth: "420px", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ width: 52, height: 52, borderRadius: "16px", background: "linear-gradient(135deg, #0D1526, #1E3A8A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 18px" }}>🔐</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>Admin Portal</h1>
          <p style={{ color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>NoteFlow · Botswana 🇧🇼</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#0F172A", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter username" style={{ ...inp, background: "#fff" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#0F172A", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} type={showPass ? "text" : "password"} placeholder="Enter password" style={{ ...inp, background: "#fff", paddingRight: "48px" }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#94A3B8" }}>{showPass ? "🙈" : "👁"}</button>
            </div>
          </div>
          {error && <div style={{ background: "#FEE2E2", borderRadius: "8px", padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#991B1B", fontWeight: 600 }}>⚠️ {error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ background: loading ? "#94A3B8" : "linear-gradient(135deg, #0D1526, #1E3A8A)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: "4px" }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8", marginTop: "24px", marginBottom: 0 }}>Restricted to authorized administrators only</p>
      </div>
    </div>
  );
};

// Admin: Full Dashboard Wrapper
const AdminDashboard = ({ onExit }: { onExit: () => void }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  const sectionLabels: Record<string, string> = { overview: "Overview", users: "User Management", verification: "Tutor Verification", payments: "Payment Monitoring", ratings: "Ratings Monitor", maintenance: "System Maintenance" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", background: "#F8FAFF" }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? "64px" : "236px", background: "#0D1526", display: "flex", flexDirection: "column", transition: "width 0.25s", flexShrink: 0, overflowX: "hidden" }}>
        <div style={{ padding: collapsed ? "18px 14px" : "22px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {!collapsed && <div><div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 800, color: "#fff" }}>NoteFlow</div><div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Portal</div></div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "7px", width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: "12px", flexShrink: 0 }}>{collapsed ? "→" : "←"}</button>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {adminSidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "11px 8px" : "10px 12px", borderRadius: "9px", border: "none", background: activeSection === item.id ? "rgba(59,91,219,0.3)" : "transparent", color: activeSection === item.id ? "#93C5FD" : "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: "13px", fontWeight: activeSection === item.id ? 700 : 500, fontFamily: "'DM Sans', sans-serif", textAlign: "left", marginBottom: "2px", borderLeft: activeSection === item.id ? "3px solid #3B5BDB" : "3px solid transparent", justifyContent: collapsed ? "center" : "flex-start", whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ fontSize: "15px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: collapsed ? "14px 8px" : "14px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", marginBottom: "8px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>M</div>
            {!collapsed && <div><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>Mark</p><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Administrator</p></div>}
          </div>
          <button onClick={() => { setLoggedIn(false); onExit(); }} style={{ width: "100%", padding: "8px", borderRadius: "7px", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            {collapsed ? "↩" : "↩ Exit Admin"}
          </button>
        </div>
      </aside>
      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #E8EDF5", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8" }}>NoteFlow Admin / </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#0F172A", fontWeight: 600 }}>{sectionLabels[activeSection]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8" }}>🇧🇼 {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#22C55E", fontWeight: 600 }}>System Online</span>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
          {activeSection === "overview" && <AdminOverview />}
          {activeSection === "users" && <AdminUserManagement />}
          {activeSection === "verification" && <AdminVerification />}
          {activeSection === "payments" && <AdminPayments />}
          {activeSection === "ratings" && <AdminRatings />}
          {activeSection === "maintenance" && <AdminMaintenance />}
        </main>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN NOTEFLOW APP ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function NoteFlow() {
  const [docs, setDocs] = useState<Document[]>(initialDocs);
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState<NavPage>("explore");
  const [activeUni, setActiveUni] = useState("All Universities");
  const [activeType, setActiveType] = useState<DocType | "All Types">("All Types");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const allUnis = ["All Universities", ...universities.map(u => u.short)];
  const docTypes: (DocType | "All Types")[] = ["All Types", "Notes", "Exam", "Summary", "Textbook"];

  const handleDocReview = (docId: number, rating: number, comment: string) => {
    setDocs(prev => prev.map(d => d.id !== docId ? d : {
      ...d,
      reviews: [...d.reviews, { id: d.reviews.length + 1, user: user?.name || "Anonymous", avatar: user?.avatar || "AN", rating, comment, date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }) }],
      rating: parseFloat(((d.reviews.reduce((a, r) => a + r.rating, 0) + rating) / (d.reviews.length + 1)).toFixed(1))
    }));
  };

  const handleTutorReview = (tutorId: number, rating: number, comment: string) => {
    setTutors(prev => prev.map(t => t.id !== tutorId ? t : {
      ...t,
      reviews: [...t.reviews, { id: t.reviews.length + 1, user: user?.name || "Anonymous", avatar: user?.avatar || "AN", rating, comment, date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }) }],
      rating: parseFloat(((t.reviews.reduce((a, r) => a + r.rating, 0) + rating) / (t.reviews.length + 1)).toFixed(1)),
      reviewCount: t.reviewCount + 1
    }));
  };

  const filtered = docs.filter(doc => {
    const q = search.toLowerCase();
    const matchSearch = !q || doc.title.toLowerCase().includes(q) || doc.subject.toLowerCase().includes(q) || doc.university.toLowerCase().includes(q) || doc.preview.toLowerCase().includes(q);
    const matchUni = activeUni === "All Universities" || universities.find(u => u.short === activeUni)?.name === doc.university;
    const matchType = activeType === "All Types" || doc.type === activeType;
    return matchSearch && matchUni && matchType;
  });

  const navItems: { label: string; page: NavPage }[] = [
    { label: "Explore", page: "explore" },
    { label: "Universities", page: "universities" },
    { label: "Courses", page: "courses" },
    { label: "Tutors", page: "tutors" },
    { label: "Upload", page: "upload" },
    { label: "💎 Premium", page: "pricing" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFF", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Admin Portal — renders as full-screen overlay */}
      {showAdmin && <AdminDashboard onExit={() => setShowAdmin(false)} />}

      {showSignIn && <SignInModal onSignIn={u => { setUser(u); setShowSignIn(false); }} onClose={() => setShowSignIn(false)} />}
      {selectedDoc && <DocViewer doc={docs.find(d => d.id === selectedDoc.id) || selectedDoc} allDocs={docs} user={user} onClose={() => setSelectedDoc(null)} onUpgrade={() => { setSelectedDoc(null); setActivePage("pricing"); }} onReview={handleDocReview} />}

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8EDF5", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setActivePage("explore")}>
          <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>📚</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 800, background: "linear-gradient(135deg, #3B5BDB, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NoteFlow</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {navItems.map(item => (
            <span key={item.page} onClick={() => setActivePage(item.page)} style={{ color: activePage === item.page ? "#3B5BDB" : "#475569", fontSize: "14px", fontWeight: activePage === item.page ? 700 : 500, cursor: "pointer", borderBottom: activePage === item.page ? "2px solid #3B5BDB" : "2px solid transparent", paddingBottom: "4px" }}>{item.label}</span>
          ))}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {user.plan === "premium" && <span style={{ background: "#FFF8E1", color: "#B45309", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>💎</span>}
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>{user.avatar}</div>
              <span onClick={() => setUser(null)} style={{ color: "#94A3B8", fontSize: "13px", cursor: "pointer" }}>Sign out</span>
            </div>
          ) : (
            <button onClick={() => setShowSignIn(true)} style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "10px", padding: "9px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Sign In</button>
          )}
        </div>
      </nav>

      {/* PAGES */}
      {activePage === "tutors" && <TutorsPage user={user} onSignIn={() => setShowSignIn(true)} tutors={tutors} onReview={handleTutorReview} />}
      {activePage === "upload" && <UploadPage user={user} onSignIn={() => setShowSignIn(true)} />}
      {activePage === "pricing" && <PricingPage user={user} onSubscribe={() => { if (user) setUser({ ...user, plan: "premium" }); setActivePage("explore"); }} />}
      {activePage === "universities" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "32px" }}>Universities & Colleges in Botswana</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {universities.map(uni => (
              <div key={uni.name} onClick={() => { setActiveUni(uni.short); setActivePage("explore"); }} style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1.5px solid #E8EDF5", cursor: "pointer", transition: "all 0.2s" }}
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
      )}
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
                  {uni.courses.map(course => { const count = docs.filter(d => d.university === uni.name && d.course === course).length; return <div key={course} style={{ background: "#F8FAFF", borderRadius: "10px", padding: "12px 16px", border: "1px solid #E8EDF5" }}><p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "13px", color: "#0F172A", fontFamily: "'DM Sans', sans-serif" }}>{course}</p><p style={{ margin: 0, fontSize: "12px", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>{count} document{count !== 1 ? "s" : ""}</p></div>; })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePage === "explore" && (
        <>
          <div style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #3B5BDB 50%, #6366F1 100%)", padding: "72px 32px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px", color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 600 }}>🇧🇼 BUILT FOR BOTSWANA STUDENTS</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 16px", lineHeight: 1.15 }}>Study Smarter,<br /><span style={{ color: "#A5B4FC" }}>Not Harder.</span></h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "18px", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.6 }}>Notes, textbooks, past papers and tutors from UB, BAC, BIUST, Botho and more.</p>
              <div style={{ maxWidth: "580px", margin: "0 auto", background: "white", borderRadius: "14px", display: "flex", alignItems: "center", padding: "6px 6px 6px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <span style={{ fontSize: "18px", marginRight: "10px" }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes, modules, universities..." style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#0F172A", background: "transparent", fontFamily: "'DM Sans', sans-serif" }} />
                <button style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Search</button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "40px", flexWrap: "wrap" }}>
                {[["500+", "Documents"], ["7+", "Institutions"], ["6", "Tutors"]].map(([num, label]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", fontFamily: "'Playfair Display', serif" }}>{num}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "2px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {allUnis.map(uni => <button key={uni} onClick={() => setActiveUni(uni)} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, border: activeUni === uni ? "none" : "1.5px solid #E2E8F0", background: activeUni === uni ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#fff", color: activeUni === uni ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{uni}</button>)}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {docTypes.map(type => <button key={type} onClick={() => setActiveType(type)} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, border: activeType === type ? "none" : "1.5px solid #E2E8F0", background: activeType === type ? "#0F172A" : "#fff", color: activeType === type ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{type}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: "20px", color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
              Showing <strong style={{ color: "#0F172A" }}>{filtered.length}</strong> documents{search && <> for &quot;<strong style={{ color: "#3B5BDB" }}>{search}</strong>&quot;</>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filtered.length > 0 ? filtered.map(doc => <DocCard key={doc.id} doc={doc} onOpen={setSelectedDoc} />) : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0" }}><div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div><p style={{ fontSize: "18px", fontWeight: 600, color: "#475569" }}>No documents found</p></div>
              )}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0F172A, #1E3A8A)", margin: "20px 24px 0", borderRadius: "24px", padding: "56px 40px", textAlign: "center", maxWidth: "1152px", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: "#fff", margin: "0 0 12px" }}>Unlock All Study Materials</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", maxWidth: "480px", margin: "0 auto 28px", lineHeight: 1.6 }}>Get full access to all notes, textbooks, past papers and connect with top tutors.</p>
            <button onClick={() => setActivePage("pricing")} style={{ background: "linear-gradient(135deg, #6366F1, #3B5BDB)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginRight: "12px" }}>View Plans →</button>
            <button onClick={() => setActivePage("tutors")} style={{ background: "transparent", color: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>Find a Tutor</button>
          </div>
        </>
      )}

      {/* FOOTER — Admin access hidden in copyright */}
      <footer style={{ borderTop: "1px solid #E8EDF5", marginTop: "60px", padding: "32px", textAlign: "center", color: "#94A3B8", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ width: 26, height: 26, borderRadius: "8px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>📚</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>NoteFlow</span>
        </div>
        <p style={{ margin: 0 }}>
          © <span onClick={() => setShowAdmin(true)} style={{ cursor: "default", userSelect: "none" }}>2024</span> NoteFlow · Built for Botswana students 🇧🇼
        </p>
      </footer>
    </div>
  );
}
