"use client";

import React, { useState } from "react";

type DocType = "Notes" | "Exam" | "Summary" | "Essay";
type NavPage = "explore" | "universities" | "courses" | "upload";

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
}

interface University {
  name: string;
  short: string;
  location: string;
  courses: string[];
  emoji: string;
}

const universities: University[] = [
  {
    name: "Botswana Accountancy College",
    short: "BAC",
    location: "Gaborone",
    emoji: "🏫",
    courses: ["Computer Systems Engineering", "Accounting & Finance", "Business Administration", "Information Technology"],
  },
  {
    name: "University of Botswana",
    short: "UB",
    location: "Gaborone",
    emoji: "🎓",
    courses: ["Computer Science", "Law", "Medicine", "Engineering", "Economics", "Education"],
  },
  {
    name: "BIUST",
    short: "BIUST",
    location: "Palapye",
    emoji: "🔬",
    courses: ["Civil Engineering", "Electrical Engineering", "Computer Science", "Environmental Science", "Mining Engineering"],
  },
  {
    name: "Botho University",
    short: "Botho",
    location: "Gaborone",
    emoji: "📘",
    courses: ["Nursing", "Business Computing", "Project Management", "Hospitality Management", "IT Management"],
  },
  {
    name: "Limkokwing University",
    short: "Limkokwing",
    location: "Gaborone",
    emoji: "🎨",
    courses: ["Graphic Design", "Fashion Design", "Mass Communication", "Architecture", "Film & Animation"],
  },
  {
    name: "Ba Isago University",
    short: "Ba Isago",
    location: "Gaborone",
    emoji: "📚",
    courses: ["Accounting", "Human Resources", "Marketing", "Supply Chain Management", "Early Childhood Education"],
  },
  {
    name: "Botswana Open University",
    short: "BOU",
    location: "Gaborone",
    emoji: "🌐",
    courses: ["Distance Education", "Public Administration", "Development Studies", "Agriculture", "Education Management"],
  },
];

const documents: Document[] = [
  // BAC - Computer Systems Engineering
  { id: 1, title: "Introduction to Java - Full Notes", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 45, downloads: 1230, rating: 4.8, type: "Notes", year: "1st Year", preview: "OOP concepts, classes, objects, inheritance, polymorphism..." },
  { id: 2, title: "Mobile Application Development - Android Basics", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 38, downloads: 980, rating: 4.7, type: "Notes", year: "2nd Year", preview: "Android Studio, XML layouts, Activities, Intents, APIs..." },
  { id: 3, title: "Database Systems Exam 2023", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 12, downloads: 2100, rating: 4.9, type: "Exam", year: "2nd Year", preview: "SQL queries, normalization, ER diagrams, transactions..." },
  { id: 4, title: "Web Development Summary - HTML, CSS & JS", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 22, downloads: 1540, rating: 4.6, type: "Summary", year: "1st Year", preview: "HTML5 structure, CSS flexbox/grid, JavaScript DOM manipulation..." },
  { id: 5, title: "Computer Networks - Lecture Notes", subject: "Computer Systems Engineering", university: "Botswana Accountancy College", course: "Computer Systems Engineering", pages: 55, downloads: 870, rating: 4.5, type: "Notes", year: "3rd Year", preview: "OSI model, TCP/IP, routing protocols, network security..." },
  // BAC - Accounting & Finance
  { id: 6, title: "Financial Accounting Principles - Complete Notes", subject: "Accounting & Finance", university: "Botswana Accountancy College", course: "Accounting & Finance", pages: 60, downloads: 3200, rating: 4.9, type: "Notes", year: "1st Year", preview: "Double entry, trial balance, income statement, balance sheet..." },
  { id: 7, title: "Botswana Taxation Law - Summary", subject: "Accounting & Finance", university: "Botswana Accountancy College", course: "Accounting & Finance", pages: 30, downloads: 1890, rating: 4.7, type: "Summary", year: "3rd Year", preview: "BURS regulations, VAT, PAYE, corporate tax, withholding tax..." },
  // UB - Computer Science
  { id: 8, title: "Data Structures & Algorithms - UB Notes", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 48, downloads: 2750, rating: 4.8, type: "Notes", year: "2nd Year", preview: "Arrays, linked lists, trees, graphs, sorting algorithms, Big O..." },
  { id: 9, title: "Operating Systems Past Paper Pack", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 35, downloads: 3100, rating: 4.9, type: "Exam", year: "3rd Year", preview: "Process management, memory management, file systems, scheduling..." },
  { id: 10, title: "Software Engineering - Project Management Notes", subject: "Computer Science", university: "University of Botswana", course: "Computer Science", pages: 42, downloads: 1600, rating: 4.6, type: "Notes", year: "3rd Year", preview: "SDLC, Agile, Scrum, UML diagrams, testing methodologies..." },
  // UB - Law
  { id: 11, title: "Constitutional Law of Botswana - Full Notes", subject: "Law", university: "University of Botswana", course: "Law", pages: 70, downloads: 2300, rating: 4.7, type: "Notes", year: "2nd Year", preview: "Constitution of Botswana, Bill of Rights, separation of powers..." },
  { id: 12, title: "Contract Law Essay Guide", subject: "Law", university: "University of Botswana", course: "Law", pages: 25, downloads: 1450, rating: 4.5, type: "Essay", year: "2nd Year", preview: "Offer, acceptance, consideration, breach of contract, remedies..." },
  // BIUST
  { id: 13, title: "Thermodynamics - Engineering Notes", subject: "Civil Engineering", university: "BIUST", course: "Civil Engineering", pages: 55, downloads: 1100, rating: 4.6, type: "Notes", year: "2nd Year", preview: "Laws of thermodynamics, heat transfer, entropy, Carnot cycle..." },
  { id: 14, title: "Electrical Circuits - Exam Solutions 2023", subject: "Electrical Engineering", university: "BIUST", course: "Electrical Engineering", pages: 20, downloads: 1800, rating: 4.8, type: "Exam", year: "1st Year", preview: "Ohm's law, Kirchhoff's laws, AC/DC circuits, capacitors..." },
  // Botho University
  { id: 15, title: "Nursing Fundamentals - Anatomy & Physiology", subject: "Nursing", university: "Botho University", course: "Nursing", pages: 80, downloads: 2900, rating: 4.9, type: "Notes", year: "1st Year", preview: "Human body systems, homeostasis, cell biology, organ functions..." },
  { id: 16, title: "Project Management Principles - Summary", subject: "Project Management", university: "Botho University", course: "Project Management", pages: 28, downloads: 1350, rating: 4.5, type: "Summary", year: "2nd Year", preview: "PMBOK, project lifecycle, risk management, stakeholder management..." },
  // Limkokwing
  { id: 17, title: "Graphic Design Principles - Visual Notes", subject: "Graphic Design", university: "Limkokwing University", course: "Graphic Design", pages: 33, downloads: 990, rating: 4.6, type: "Notes", year: "1st Year", preview: "Typography, color theory, composition, Adobe Illustrator basics..." },
  // Ba Isago
  { id: 18, title: "Human Resources Management - Full Notes", subject: "Human Resources", university: "Ba Isago University", course: "Human Resources", pages: 50, downloads: 1700, rating: 4.7, type: "Notes", year: "2nd Year", preview: "Recruitment, performance management, labour law Botswana, training..." },
];

const typeColors: Record<DocType, { bg: string; text: string }> = {
  Notes: { bg: "#EAF3FF", text: "#2563EB" },
  Exam: { bg: "#FFF0EA", text: "#C2410C" },
  Summary: { bg: "#EAFAF1", text: "#15803D" },
  Essay: { bg: "#F5F0FF", text: "#7C3AED" },
};

const allUnis = ["All Universities", ...universities.map(u => u.short)];
const docTypes: (DocType | "All Types")[] = ["All Types", "Notes", "Exam", "Summary", "Essay"];

const StarRating = ({ rating }: { rating: number }) => (
  <span style={{ color: "#F59E0B", fontSize: "13px", fontWeight: 600 }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    <span style={{ color: "#64748B", marginLeft: "4px", fontFamily: "'DM Sans', sans-serif" }}>{rating}</span>
  </span>
);

const DocViewer = ({ doc, onClose }: { doc: Document; onClose: () => void }) => {
  const colors = typeColors[doc.type];
  const fakePages = Array.from({ length: Math.min(doc.pages, 6) }, (_, i) => i + 1);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "780px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #E8EDF5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, marginRight: "16px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
              <span style={{ background: colors.bg, color: colors.text, fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{doc.type}</span>
              <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>{doc.year}</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#0F172A", margin: "0 0 6px", lineHeight: 1.3 }}>{doc.title}</h2>
            <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>🎓 {doc.university} · {doc.course}</p>
          </div>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: "10px", width: "36px", height: "36px", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        {/* Stats bar */}
        <div style={{ padding: "16px 32px", background: "#F8FAFF", borderBottom: "1px solid #E8EDF5", display: "flex", gap: "28px", flexWrap: "wrap" }}>
          {[["📄", `${doc.pages} pages`], ["⬇️", `${doc.downloads.toLocaleString()} downloads`], ["⭐", `${doc.rating} rating`], ["📚", doc.subject]].map(([icon, label]) => (
            <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>

        {/* Document preview */}
        <div style={{ padding: "28px 32px", flex: 1 }}>
          <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>Document Preview</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {fakePages.map(page => (
              <div key={page} style={{ background: "#F8FAFF", border: "1px solid #E8EDF5", borderRadius: "12px", padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>Page {page}</span>
                  <span style={{ fontSize: "11px", color: "#CBD5E1", fontFamily: "'DM Sans', sans-serif" }}>{doc.title}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[0.9, 0.75, 0.85, 0.6, 0.8].map((w, i) => (
                    <div key={i} style={{ height: "10px", background: "#E2E8F0", borderRadius: "4px", width: `${w * 100}%` }} />
                  ))}
                  {page === 1 && (
                    <div style={{ marginTop: "8px", padding: "12px 16px", background: "#EAF3FF", borderRadius: "8px", borderLeft: "3px solid #3B5BDB" }}>
                      <p style={{ margin: 0, fontSize: "13px", color: "#1E3A8A", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                        <strong>Topic: </strong>{doc.preview}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {doc.pages > 6 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
                🔒 <strong style={{ color: "#3B5BDB" }}>{doc.pages - 6} more pages</strong> — Sign up to unlock full document
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: "20px 32px", borderTop: "1px solid #E8EDF5", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "11px 24px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#475569", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Close</button>
          <button style={{ padding: "11px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>⬇️ Download Full PDF</button>
        </div>
      </div>
    </div>
  );
};

const DocCard = ({ doc, onOpen }: { doc: Document; onOpen: (doc: Document) => void }) => {
  const [hovered, setHovered] = useState(false);
  const colors = typeColors[doc.type];
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onOpen(doc)} style={{
      background: "#FFFFFF", borderRadius: "16px", padding: "24px",
      border: hovered ? "1.5px solid #3B5BDB" : "1.5px solid #E8EDF5",
      boxShadow: hovered ? "0 8px 32px rgba(59,91,219,0.10)" : "0 2px 8px rgba(0,0,0,0.04)",
      cursor: "pointer", transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
      transform: hovered ? "translateY(-3px)" : "none",
      display: "flex", flexDirection: "column", gap: "14px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ background: colors.bg, color: colors.text, fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{doc.type}</span>
        <span style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>{doc.year}</span>
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
          <span>⬇️ {doc.downloads.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const UniversitiesPage = ({ onSearch }: { onSearch: (uni: string) => void }) => (
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "8px" }}>Universities & Colleges in Botswana</h2>
    <p style={{ color: "#64748B", marginBottom: "32px", fontFamily: "'DM Sans', sans-serif" }}>Click any institution to browse its study materials</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
      {universities.map(uni => (
        <div key={uni.name} onClick={() => onSearch(uni.short)}
          style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1.5px solid #E8EDF5", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#3B5BDB"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8EDF5"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>{uni.emoji}</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#0F172A", margin: "0 0 4px" }}>{uni.name}</h3>
          <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>📍 {uni.location} · {uni.short}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {uni.courses.slice(0, 3).map(c => (
              <span key={c} style={{ background: "#EAF3FF", color: "#2563EB", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>{c}</span>
            ))}
            {uni.courses.length > 3 && <span style={{ background: "#F1F5F9", color: "#64748B", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Sans', sans-serif" }}>+{uni.courses.length - 3} more</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CoursesPage = () => {
  const [selectedUni, setSelectedUni] = useState("All");
  const filtered = selectedUni === "All" ? universities : universities.filter(u => u.short === selectedUni);
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "8px" }}>Courses & Modules</h2>
      <p style={{ color: "#64748B", marginBottom: "24px", fontFamily: "'DM Sans', sans-serif" }}>Browse courses by institution</p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
        {["All", ...universities.map(u => u.short)].map(s => (
          <button key={s} onClick={() => setSelectedUni(s)} style={{
            padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
            border: selectedUni === s ? "none" : "1.5px solid #E2E8F0",
            background: selectedUni === s ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#fff",
            color: selectedUni === s ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
          }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {filtered.map(uni => (
          <div key={uni.name} style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1.5px solid #E8EDF5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "28px" }}>{uni.emoji}</span>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#0F172A", margin: 0 }}>{uni.name}</h3>
                <p style={{ color: "#64748B", fontSize: "12px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>📍 {uni.location}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
              {uni.courses.map(course => {
                const count = documents.filter(d => d.university === uni.name && d.course === course).length;
                return (
                  <div key={course} style={{ background: "#F8FAFF", borderRadius: "10px", padding: "12px 16px", border: "1px solid #E8EDF5" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "13px", color: "#0F172A", fontFamily: "'DM Sans', sans-serif" }}>{course}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>{count} document{count !== 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: "10px",
  border: "1.5px solid #CBD5E1", fontSize: "14px",
  fontFamily: "'DM Sans', sans-serif", outline: "none",
  color: "#0F172A", background: "#FFFFFF", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: 700, fontSize: "13px",
  color: "#0F172A", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif",
  textTransform: "uppercase", letterSpacing: "0.04em",
};

const UploadPage = () => {
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedType, setSelectedType] = useState("Notes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uniObj = universities.find(u => u.name === selectedUni);

  const handleFile = (file: File) => {
    if (file) setFileName(file.name);
  };

  if (submitted) return (
    <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
      <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A" }}>Upload Successful!</h2>
      <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif", marginBottom: "8px" }}>
        <strong style={{ color: "#0F172A" }}>{fileName || "Your document"}</strong> has been submitted.
      </p>
      <p style={{ color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>Your notes are now helping students across Botswana 🇧🇼</p>
      <button onClick={() => { setSubmitted(false); setFileName(""); setTitle(""); setSelectedUni(""); setSelectedCourse(""); }} style={{ marginTop: "24px", background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 28px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Upload Another Document</button>
    </div>
  );

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#0F172A", marginBottom: "6px" }}>Upload Your Notes</h2>
      <p style={{ color: "#64748B", marginBottom: "36px", fontFamily: "'DM Sans', sans-serif", fontSize: "15px" }}>Share your study materials and help fellow students in Botswana</p>

      <div style={{ background: "#fff", borderRadius: "20px", padding: "36px", border: "1.5px solid #E8EDF5", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Title */}
        <div>
          <label style={labelStyle}>Document Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Java - Week 1 Notes" style={inputStyle} />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Brief Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Briefly describe what topics are covered in this document..." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }} />
        </div>

        {/* University */}
        <div>
          <label style={labelStyle}>University / College *</label>
          <select value={selectedUni} onChange={e => { setSelectedUni(e.target.value); setSelectedCourse(""); }} style={inputStyle}>
            <option value="">— Select your institution —</option>
            {universities.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
          </select>
        </div>

        {/* Course — only shows after uni selected */}
        {uniObj && (
          <div>
            <label style={labelStyle}>Course *</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={inputStyle}>
              <option value="">— Select your course —</option>
              {uniObj.courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Document Type */}
        <div>
          <label style={labelStyle}>Document Type *</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["Notes", "Exam", "Summary", "Essay"].map(type => (
              <button key={type} onClick={() => setSelectedType(type)} style={{
                padding: "10px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                border: selectedType === type ? "none" : "1.5px solid #CBD5E1",
                background: selectedType === type ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#fff",
                color: selectedType === type ? "#fff" : "#475569", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
              }}>{type}</button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div>
          <label style={labelStyle}>Year of Study</label>
          <select style={inputStyle}>
            <option value="">— Select year —</option>
            <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Postgraduate</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label style={labelStyle}>Upload File (PDF, DOCX, PPT) *</label>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            style={{
              border: dragging ? "2px dashed #3B5BDB" : fileName ? "2px solid #22C55E" : "2px dashed #CBD5E1",
              borderRadius: "14px", padding: "36px", textAlign: "center", cursor: "pointer",
              background: dragging ? "#EAF3FF" : fileName ? "#F0FDF4" : "#F8FAFF",
              transition: "all 0.2s"
            }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>{fileName ? "✅" : "📂"}</div>
            {fileName ? (
              <>
                <p style={{ color: "#15803D", fontSize: "14px", fontWeight: 700, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{fileName}</p>
                <p style={{ color: "#64748B", fontSize: "12px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Click to change file</p>
              </>
            ) : (
              <>
                <p style={{ color: "#0F172A", fontSize: "14px", fontWeight: 600, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>Drag & drop your file here</p>
                <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>or <span style={{ color: "#3B5BDB", fontWeight: 700 }}>click to browse your computer</span></p>
                <p style={{ color: "#94A3B8", fontSize: "12px", margin: "8px 0 0", fontFamily: "'DM Sans', sans-serif" }}>Supports PDF, DOCX, PPT · Max 50MB</p>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => { if (title && selectedUni && fileName) setSubmitted(true); else alert("Please fill in the title, university and upload a file."); }}
          style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "15px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: "4px" }}>
          Upload Document →
        </button>

        <p style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          By uploading you confirm this is your own work and agree to our terms of use.
        </p>
      </div>
    </div>
  );
};

const SignUpModal = ({ onClose }: { onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
    <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "420px", margin: "0 20px" }} onClick={e => e.stopPropagation()}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0F172A", margin: "0 0 8px" }}>Join NoteFlow 🇧🇼</h2>
      <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif" }}>Access thousands of notes from Botswana universities</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <input placeholder="Full Name" style={{ padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#F8FAFF" }} />
        <input placeholder="Email Address" style={{ padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#F8FAFF" }} />
        <select style={{ padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#F8FAFF", color: "#0F172A" }}>
          <option value="">Select your university...</option>
          {universities.map(u => <option key={u.name}>{u.name}</option>)}
        </select>
        <input placeholder="Password" type="password" style={{ padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #CBD5E1", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#0F172A", background: "#F8FAFF" }} />
        <button style={{ background: "linear-gradient(135deg, #3B5BDB, #6366F1)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Create Free Account →</button>
      </div>
      <p style={{ textAlign: "center", marginTop: "16px", color: "#64748B", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>Already have an account? <span style={{ color: "#3B5BDB", fontWeight: 600, cursor: "pointer" }}>Log in</span></p>
    </div>
  </div>
);

export default function NoteFlow() {
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState<NavPage>("explore");
  const [activeUni, setActiveUni] = useState("All Universities");
  const [activeType, setActiveType] = useState<DocType | "All Types">("All Types");
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const filtered = documents.filter(doc => {
    const q = search.toLowerCase();
    const matchSearch = !q || doc.title.toLowerCase().includes(q) || doc.subject.toLowerCase().includes(q) || doc.university.toLowerCase().includes(q) || doc.course.toLowerCase().includes(q) || doc.preview.toLowerCase().includes(q);
    const matchUni = activeUni === "All Universities" || universities.find(u => u.short === activeUni)?.name === doc.university;
    const matchType = activeType === "All Types" || doc.type === activeType;
    return matchSearch && matchUni && matchType;
  });

  const handleUniSearch = (uniShort: string) => {
    setActiveUni(uniShort);
    setActivePage("explore");
  };

  const navItems: { label: string; page: NavPage }[] = [
    { label: "Explore", page: "explore" },
    { label: "Universities", page: "universities" },
    { label: "Courses", page: "courses" },
    { label: "Upload", page: "upload" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFF", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} />}
      {selectedDoc && <DocViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}

      {/* NAV */}
      <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #E8EDF5", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setActivePage("explore")}>
          <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg, #3B5BDB 0%, #6366F1 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>📚</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 800, background: "linear-gradient(135deg, #3B5BDB, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NoteFlow</span>
        </div>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {navItems.map(item => (
            <span key={item.page} onClick={() => setActivePage(item.page)} style={{
              color: activePage === item.page ? "#3B5BDB" : "#475569",
              fontSize: "14px", fontWeight: activePage === item.page ? 700 : 500,
              cursor: "pointer", transition: "color 0.15s",
              borderBottom: activePage === item.page ? "2px solid #3B5BDB" : "2px solid transparent",
              paddingBottom: "4px"
            }}>{item.label}</span>
          ))}
          <button onClick={() => setShowSignUp(true)} style={{ background: "linear-gradient(135deg, #3B5BDB 0%, #6366F1 100%)", color: "white", border: "none", borderRadius: "10px", padding: "9px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Sign Up Free</button>
        </div>
      </nav>

      {activePage === "universities" && <UniversitiesPage onSearch={handleUniSearch} />}
      {activePage === "courses" && <CoursesPage />}
      {activePage === "upload" && <UploadPage />}

      {activePage === "explore" && (
        <>
          <div style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #3B5BDB 50%, #6366F1 100%)", padding: "72px 32px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", bottom: -80, left: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px", color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}>🇧🇼 BUILT FOR BOTSWANA STUDENTS</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 16px", lineHeight: 1.15 }}>
                Study Smarter,<br /><span style={{ color: "#A5B4FC" }}>Not Harder.</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "18px", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.6 }}>
                Access notes, past papers and summaries from UB, BAC, BIUST, Botho and more.
              </p>
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
                {allUnis.map(uni => (
                  <button key={uni} onClick={() => setActiveUni(uni)} style={{
                    padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
                    border: activeUni === uni ? "none" : "1.5px solid #E2E8F0",
                    background: activeUni === uni ? "linear-gradient(135deg, #3B5BDB, #6366F1)" : "#fff",
                    color: activeUni === uni ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
                  }}>{uni}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {docTypes.map(type => (
                  <button key={type} onClick={() => setActiveType(type as DocType | "All Types")} style={{
                    padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
                    border: activeType === type ? "none" : "1.5px solid #E2E8F0",
                    background: activeType === type ? "#0F172A" : "#fff",
                    color: activeType === type ? "#fff" : "#64748B", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
                  }}>{type}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "20px", color: "#64748B", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
              Showing <strong style={{ color: "#0F172A" }}>{filtered.length}</strong> documents
              {search && <> for &quot;<strong style={{ color: "#3B5BDB" }}>{search}</strong>&quot;</>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filtered.length > 0 ? filtered.map(doc => <DocCard key={doc.id} doc={doc} onOpen={setSelectedDoc} />) : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "#94A3B8" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "#475569" }}>No documents found</p>
                  <p style={{ fontSize: "14px" }}>Try a different search or filter</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)", margin: "20px 24px 0", borderRadius: "24px", padding: "56px 40px", textAlign: "center", maxWidth: "1152px", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: "#FFFFFF", margin: "0 0 12px" }}>Share Your Notes, Help Others</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", maxWidth: "480px", margin: "0 auto 28px", lineHeight: 1.6 }}>Upload your study materials and help thousands of Botswana students pass their exams.</p>
            <button onClick={() => setActivePage("upload")} style={{ background: "linear-gradient(135deg, #6366F1, #3B5BDB)", color: "white", border: "none", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginRight: "12px" }}>Upload Now →</button>
            <button onClick={() => setActivePage("universities")} style={{ background: "transparent", color: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "12px", padding: "14px 32px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>Browse Universities</button>
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