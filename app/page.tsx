"use client";

import React, { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════════
type DocType = "Notes" | "Exam" | "Summary" | "Textbook";
type NavPage = "explore" | "universities" | "courses" | "upload" | "pricing" | "dashboard" | "tutors" | "admin";
type UserPlan = "free" | "premium";

interface UserObj {
  name: string;
  email: string;
  avatar: string;
  plan: UserPlan;
}

interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface Doc {
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
  reviews: Review[];
}

interface Tutor {
  id: number;
  name: string;
  avatar: string;
  university: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  rate: string;
  bio: string;
  available: boolean;
  reviews: Review[];
  email?: string;
  status?: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  saves: string | null;
  color: string;
}

interface AdminStudent {
  id: number;
  name: string;
  email: string;
  university?: string;
  plan?: string;
  status?: string;
  joined?: string;
}

interface AdminTutor {
  id: number;
  name: string;
  email?: string;
  university?: string;
  subjects?: string[];
  rating?: number;
  status?: string;
}

interface Verification {
  id: number;
  name: string;
  avatar: string;
  university: string;
  subjects: string[];
  rate: string;
  bio?: string;
  status: string;
  date: string;
}

interface Payment {
  id: number;
  student: string;
  plan: string;
  amount: number;
  date: string;
  method?: string;
  status?: string;
  month?: number;
}

interface Rating {
  id: number;
  user: string;
  target: string;
  rating: number;
  comment: string;
  date: string;
  flagged?: boolean;
  hidden?: boolean;
}

interface AdminSettings {
  registrationEnabled: boolean;
  paymentsEnabled: boolean;
  tutorMarketEnabled: boolean;
  emailNotifications: boolean;
  autoApprove: boolean;
  maintenanceMode: boolean;
}

interface Log {
  id: number;
  action: string;
  user: string;
  time: string;
  type: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN THEME + CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════════════
const AC = {
  bg:         '#0B0D1A', sidebar:   '#07080F',  card:       '#111422',
  cardHov:    '#161B2E', border:    'rgba(255,255,255,0.07)', borderMd: 'rgba(255,255,255,0.12)',
  accent:     '#F0A500', accentDim: 'rgba(240,165,0,0.12)',  accentBdr: 'rgba(240,165,0,0.35)',
  text:       '#E8EDF5', textSub:   '#94A3B8',  textMuted:  '#4E5A6B',
  success:    '#22C55E', successDim:'rgba(34,197,94,0.12)',
  danger:     '#EF4444', dangerDim: 'rgba(239,68,68,0.12)',
  warning:    '#F59E0B', warningDim:'rgba(245,158,11,0.12)',
  info:       '#6366F1', infoDim:   'rgba(99,102,241,0.12)',
};
const AF = { head:"'Syne',sans-serif", body:"'Outfit',sans-serif", mono:"'Space Mono',monospace" };
const ADMIN_CREDS = { username:'mark', password:'mark12345', name:'Mark' };

// ═══════════════════════════════════════════════════════════════════════════════
//  ORIGINAL NOTEFLOW DATA
// ═══════════════════════════════════════════════════════════════════════════════
const universities = [
  { name:"Botswana Accountancy College", short:"BAC",        location:"Gaborone", emoji:"🏫", courses:["Computer Systems Engineering","Accounting & Finance","Business Administration","Information Technology"] },
  { name:"University of Botswana",        short:"UB",         location:"Gaborone", emoji:"🎓", courses:["Computer Science","Law","Medicine","Engineering","Economics","Education"] },
  { name:"BIUST",                          short:"BIUST",      location:"Palapye",  emoji:"🔬", courses:["Civil Engineering","Electrical Engineering","Computer Science","Environmental Science","Mining Engineering"] },
  { name:"Botho University",              short:"Botho",      location:"Gaborone", emoji:"📘", courses:["Nursing","Business Computing","Project Management","Hospitality Management","IT Management"] },
  { name:"Limkokwing University",         short:"Limkokwing", location:"Gaborone", emoji:"🎨", courses:["Graphic Design","Fashion Design","Mass Communication","Architecture","Film & Animation"] },
  { name:"Ba Isago University",           short:"Ba Isago",   location:"Gaborone", emoji:"📚", courses:["Accounting","Human Resources","Marketing","Supply Chain Management","Early Childhood Education"] },
  { name:"Botswana Open University",      short:"BOU",        location:"Gaborone", emoji:"🌐", courses:["Distance Education","Public Administration","Development Studies","Agriculture","Education Management"] },
];

const initialDocs: Doc[] = [
  { id:1,  title:"Introduction to Java - Full Notes",            subject:"Computer Systems Engineering", university:"Botswana Accountancy College", course:"Computer Systems Engineering", pages:45,  downloads:1230, rating:4.8, type:"Notes",    year:"1st Year", preview:"OOP concepts, classes, objects, inheritance, polymorphism...",        premium:false, reviews:[{id:1,user:"Kabo M.",   avatar:"KM",rating:5,comment:"Extremely helpful for my Java exam! Covered everything perfectly.",    date:"Feb 2024"},{id:2,user:"Lesedi T.", avatar:"LT",rating:4,comment:"Great notes but could use more code examples.",                    date:"Jan 2024"}] },
  { id:2,  title:"Mobile Application Development - Android Basics", subject:"Computer Systems Engineering", university:"Botswana Accountancy College", course:"Computer Systems Engineering", pages:38,  downloads:980,  rating:4.7, type:"Notes",    year:"2nd Year", preview:"Android Studio, XML layouts, Activities, Intents, APIs...",            premium:true,  reviews:[{id:1,user:"Thato K.",  avatar:"TK",rating:5,comment:"Best Android notes I've found. Saved my project!",                  date:"Mar 2024"}] },
  { id:3,  title:"Database Systems Exam 2023",                   subject:"Computer Systems Engineering", university:"Botswana Accountancy College", course:"Computer Systems Engineering", pages:12,  downloads:2100, rating:4.9, type:"Exam",     year:"2nd Year", preview:"SQL queries, normalization, ER diagrams, transactions...",              premium:true,  reviews:[{id:1,user:"Neo B.",    avatar:"NB",rating:5,comment:"Exact same questions came up in my exam. 10/10.",               date:"Nov 2023"},{id:2,user:"Mpho S.",  avatar:"MS",rating:5,comment:"Essential for exam prep. Highly recommend!",                    date:"Oct 2023"}] },
  { id:4,  title:"Web Development Summary - HTML, CSS & JS",     subject:"Computer Systems Engineering", university:"Botswana Accountancy College", course:"Computer Systems Engineering", pages:22,  downloads:1540, rating:4.6, type:"Summary",  year:"1st Year", preview:"HTML5 structure, CSS flexbox/grid, JavaScript DOM manipulation...",   premium:false, reviews:[{id:1,user:"Boago R.",  avatar:"BR",rating:4,comment:"Clean and well organized summary.",                            date:"Mar 2024"}] },
  { id:5,  title:"Computer Networks Textbook - Full Edition",    subject:"Computer Systems Engineering", university:"Botswana Accountancy College", course:"Computer Systems Engineering", pages:320, downloads:870,  rating:4.5, type:"Textbook", year:"3rd Year", preview:"OSI model, TCP/IP, routing protocols, network security...",              premium:true,  reviews:[] },
  { id:6,  title:"Financial Accounting Principles - Complete Notes", subject:"Accounting & Finance",     university:"Botswana Accountancy College", course:"Accounting & Finance",          pages:60,  downloads:3200, rating:4.9, type:"Notes",    year:"1st Year", preview:"Double entry, trial balance, income statement, balance sheet...",       premium:false, reviews:[{id:1,user:"Tshego M.", avatar:"TM",rating:5,comment:"These notes are a lifesaver. Very clear explanations.",            date:"Apr 2024"}] },
  { id:7,  title:"Botswana Taxation Law - Summary",              subject:"Accounting & Finance",        university:"Botswana Accountancy College", course:"Accounting & Finance",          pages:30,  downloads:1890, rating:4.7, type:"Summary",  year:"3rd Year", preview:"BURS regulations, VAT, PAYE, corporate tax, withholding tax...",        premium:true,  reviews:[] },
  { id:8,  title:"Data Structures & Algorithms - UB Notes",      subject:"Computer Science",            university:"University of Botswana",       course:"Computer Science",              pages:48,  downloads:2750, rating:4.8, type:"Notes",    year:"2nd Year", preview:"Arrays, linked lists, trees, graphs, sorting algorithms, Big O...",    premium:false, reviews:[{id:1,user:"Oratile N.",avatar:"ON",rating:5,comment:"Best DSA notes for UB students!",                               date:"Feb 2024"}] },
  { id:9,  title:"Operating Systems Past Paper Pack 2019-2023",  subject:"Computer Science",            university:"University of Botswana",       course:"Computer Science",              pages:35,  downloads:3100, rating:4.9, type:"Exam",     year:"3rd Year", preview:"Process management, memory management, file systems, scheduling...",   premium:true,  reviews:[{id:1,user:"Kagiso P.", avatar:"KP",rating:5,comment:"5 years of past papers in one place. Incredible.",               date:"Jan 2024"}] },
  { id:10, title:"Constitutional Law of Botswana - Full Notes",  subject:"Law",                         university:"University of Botswana",       course:"Law",                           pages:70,  downloads:2300, rating:4.7, type:"Notes",    year:"2nd Year", preview:"Constitution of Botswana, Bill of Rights, separation of powers...",    premium:false, reviews:[{id:1,user:"Amogelang D.",avatar:"AD",rating:4,comment:"Very thorough, covers all the key cases.",                    date:"Mar 2024"}] },
  { id:11, title:"Thermodynamics - Engineering Notes",           subject:"Civil Engineering",           university:"BIUST",                        course:"Civil Engineering",             pages:55,  downloads:1100, rating:4.6, type:"Notes",    year:"2nd Year", preview:"Laws of thermodynamics, heat transfer, entropy, Carnot cycle...",      premium:false, reviews:[] },
  { id:12, title:"Nursing Fundamentals - Anatomy & Physiology",  subject:"Nursing",                     university:"Botho University",            course:"Nursing",                       pages:80,  downloads:2900, rating:4.9, type:"Notes",    year:"1st Year", preview:"Human body systems, homeostasis, cell biology, organ functions...",    premium:false, reviews:[{id:1,user:"Gaone K.",  avatar:"GK",rating:5,comment:"Perfect for 1st year nursing. Very detailed!",                 date:"Apr 2024"}] },
  { id:13, title:"Graphic Design Principles - Visual Notes",     subject:"Graphic Design",              university:"Limkokwing University",        course:"Graphic Design",                pages:33,  downloads:990,  rating:4.6, type:"Notes",    year:"1st Year", preview:"Typography, color theory, composition, Adobe Illustrator basics...",  premium:false, reviews:[] },
];

const initialTutors: Tutor[] = [
  { id:1, name:"Keabetswe Molefe",  avatar:"KM", university:"University of Botswana",       subjects:["Computer Science","Data Structures","Algorithms"],       rating:4.9, reviewCount:34, rate:"P80/hr", bio:"3rd year CS student at UB. Tutored 40+ students. Specializes in making complex algorithms easy to understand.", available:true,  reviews:[{id:1,user:"Thato N.",  avatar:"TN",rating:5,comment:"Keabo explained binary trees in a way my lecturer never could. Highly recommend!",date:"Mar 2024"},{id:2,user:"Mpho R.",   avatar:"MR",rating:5,comment:"Very patient and knowledgeable. Worth every pula.",date:"Feb 2024"}] },
  { id:2, name:"Naledi Sithole",    avatar:"NS", university:"Botswana Accountancy College", subjects:["Accounting","Financial Reporting","Taxation"],            rating:4.8, reviewCount:28, rate:"P70/hr", bio:"BAC Accounting finalist with distinctions. I break down complex financial concepts into simple, exam-ready notes.", available:true,  reviews:[{id:1,user:"Boago M.",  avatar:"BM",rating:5,comment:"Naledi helped me go from failing to distinction in 3 weeks!",date:"Apr 2024"},{id:2,user:"Kabo T.",   avatar:"KT",rating:4,comment:"Great tutor, very well prepared for every session.",date:"Mar 2024"}] },
  { id:3, name:"Tshepiso Ramotswe", avatar:"TR", university:"BIUST",                        subjects:["Electrical Engineering","Circuit Analysis","Mathematics"], rating:4.7, reviewCount:19, rate:"P90/hr", bio:"Engineering student at BIUST. Top of my class in circuits and maths. I make engineering approachable for all levels.", available:false, reviews:[{id:1,user:"Neo K.",    avatar:"NK",rating:5,comment:"Best engineering tutor in Botswana. Period.",date:"Feb 2024"}] },
  { id:4, name:"Onkabetse Dithebe", avatar:"OD", university:"University of Botswana",       subjects:["Law","Constitutional Law","Contract Law"],                rating:4.9, reviewCount:22, rate:"P85/hr", bio:"UB Law student in final year. I help students understand Botswana law cases and how to write high-scoring essays.", available:true,  reviews:[{id:1,user:"Lesego P.", avatar:"LP",rating:5,comment:"Onka's essay framework got me an A in constitutional law!",date:"Apr 2024"},{id:2,user:"Refilwe S.",avatar:"RS",rating:5,comment:"Very knowledgeable. Made contract law click for me.",date:"Mar 2024"}] },
  { id:5, name:"Goabaone Seretse",  avatar:"GS", university:"Botho University",             subjects:["Nursing","Anatomy","Pharmacology"],                       rating:4.8, reviewCount:15, rate:"P75/hr", bio:"Final year nursing student with clinical experience. I help fellow nursing students with theory and practical exam prep.", available:true,  reviews:[{id:1,user:"Gaone M.",  avatar:"GM",rating:5,comment:"Goab's anatomy sessions saved my semester. So helpful!",date:"Mar 2024"}] },
  { id:6, name:"Lorato Kgosi",      avatar:"LK", university:"Limkokwing University",        subjects:["Graphic Design","UI/UX","Branding"],                      rating:4.6, reviewCount:11, rate:"P65/hr", bio:"Creative design student at Limkokwing. I teach design principles, Adobe tools and how to build a strong portfolio.", available:true,  reviews:[{id:1,user:"Botho K.",  avatar:"BK",rating:4,comment:"Really helpful for design theory and Adobe tips.",date:"Feb 2024"}] },
];

const typeColors: Record<DocType, { bg: string; text: string }> = {
  Notes:    { bg:"#EAF3FF", text:"#2563EB" },
  Exam:     { bg:"#FFF0EA", text:"#C2410C" },
  Summary:  { bg:"#EAFAF1", text:"#15803D" },
  Textbook: { bg:"#F5F0FF", text:"#7C3AED" },
};

const PLANS: Plan[] = [
  { id:"monthly",  name:"Monthly",      price:"P89",  period:"/month",   saves:null,      color:"#3B5BDB" },
  { id:"semester", name:"Per Semester", price:"P199", period:"/6 months",saves:"Save 55%", color:"#7C3AED" },
  { id:"annual",   name:"Annual",       price:"P299", period:"/year",    saves:"Save 72%", color:"#059669" },
];

// Fix boxSizing type errors by using CSSProperties-typed style objects
const inp: React.CSSProperties = { width:"100%",padding:"12px 14px",borderRadius:"10px",border:"1.5px solid #CBD5E1",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",outline:"none",color:"#0F172A",background:"#F8FAFF",boxSizing:"border-box" };
const inputStyle: React.CSSProperties = { width:"100%",padding:"13px 16px",borderRadius:"10px",border:"1.5px solid #CBD5E1",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",outline:"none",color:"#0F172A",background:"#FFFFFF",boxSizing:"border-box" };
const labelStyle: React.CSSProperties = { display:"block",fontWeight:700,fontSize:"13px",color:"#0F172A",marginBottom:"8px",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.04em" };

// ═══════════════════════════════════════════════════════════════════════════════
//  ORIGINAL NOTEFLOW COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const Stars = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <span style={{ color:"#F59E0B",fontSize:`${size}px`,fontWeight:600 }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5-Math.floor(rating))}
    <span style={{ color:"#64748B",marginLeft:"4px",fontFamily:"'DM Sans',sans-serif" }}>{rating}</span>
  </span>
);

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hovered,setHovered] = useState(0);
  return (
    <div style={{ display:"flex",gap:"4px" }}>
      {[1,2,3,4,5].map(n=>(
        <span key={n} onMouseEnter={()=>setHovered(n)} onMouseLeave={()=>setHovered(0)} onClick={()=>onChange(n)}
          style={{ fontSize:"28px",cursor:"pointer",color:n<=(hovered||value)?"#F59E0B":"#E2E8F0",transition:"color 0.1s" }}>★</span>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => (
  <div style={{ background:"#F8FAFF",borderRadius:"12px",padding:"16px 18px",border:"1px solid #E8EDF5" }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
        <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"11px",fontWeight:700,fontFamily:"'DM Sans',sans-serif" }}>{review.avatar}</div>
        <span style={{ fontWeight:600,fontSize:"14px",color:"#0F172A",fontFamily:"'DM Sans',sans-serif" }}>{review.user}</span>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
        <Stars rating={review.rating} />
        <span style={{ color:"#94A3B8",fontSize:"12px",fontFamily:"'DM Sans',sans-serif" }}>{review.date}</span>
      </div>
    </div>
    <p style={{ margin:0,fontSize:"13px",color:"#475569",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6 }}>{review.comment}</p>
  </div>
);

const ReviewForm = ({ onSubmit, onCancel }: { onSubmit: (rating: number, comment: string) => void; onCancel: () => void }) => {
  const [rating,setRating] = useState(0);
  const [comment,setComment] = useState("");
  return (
    <div style={{ background:"#fff",border:"1.5px solid #3B5BDB",borderRadius:"14px",padding:"20px" }}>
      <p style={{ margin:"0 0 10px",fontWeight:700,fontSize:"14px",color:"#0F172A",fontFamily:"'DM Sans',sans-serif" }}>Your Rating</p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your thoughts about this document..." rows={3}
        style={{ ...inputStyle,marginTop:"14px",resize:"vertical",lineHeight:1.5 }} />
      <div style={{ display:"flex",gap:"10px",marginTop:"12px" }}>
        <button onClick={()=>{ if(rating&&comment)onSubmit(rating,comment); else alert("Please give a rating and write a comment."); }}
          style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"10px",padding:"10px 20px",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Submit Review</button>
        <button onClick={onCancel} style={{ background:"#F1F5F9",color:"#475569",border:"none",borderRadius:"10px",padding:"10px 20px",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
      </div>
    </div>
  );
};

const DocViewer = ({ doc, allDocs, user, onClose, onUpgrade, onReview }: {
  doc: Doc; allDocs: Doc[]; user: UserObj | null;
  onClose: () => void; onUpgrade: () => void; onReview: (docId: number, rating: number, comment: string) => void;
}) => {
  const [showReviewForm,setShowReviewForm] = useState(false);
  const [timeLeft,setTimeLeft] = useState(1800);
  const canAccess = !doc.premium || user?.plan === "premium";
  const recommended = allDocs.filter(d=>d.id!==doc.id&&(d.course===doc.course||d.university===doc.university)).slice(0,3);

  React.useEffect(()=>{
    if(!canAccess||user?.plan!=="free") return;
    const t = setInterval(()=>setTimeLeft(p=>{ if(p<=1){clearInterval(t);onClose();return 0;} return p-1; }),1000);
    return ()=>clearInterval(t);
  },[canAccess, onClose, user?.plan]);

  const mins = Math.floor(timeLeft/60).toString().padStart(2,"0");
  const secs = (timeLeft%60).toString().padStart(2,"0");
  const avgRating = doc.reviews.length ? (doc.reviews.reduce((a,r)=>a+r.rating,0)/doc.reviews.length).toFixed(1) : doc.rating.toFixed(1);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:"24px",width:"100%",maxWidth:"820px",maxHeight:"92vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"24px 28px 18px",borderBottom:"1px solid #E8EDF5",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div style={{ flex:1,marginRight:"16px" }}>
            <div style={{ display:"flex",gap:"8px",marginBottom:"8px",flexWrap:"wrap" }}>
              <span style={{ background:typeColors[doc.type].bg,color:typeColors[doc.type].text,fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif" }}>{doc.type}</span>
              {doc.premium&&<span style={{ background:"#FFF8E1",color:"#B45309",fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif" }}>💎 Premium</span>}
              <span style={{ color:"#94A3B8",fontSize:"12px",fontFamily:"'DM Sans',sans-serif" }}>{doc.year}</span>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"20px",color:"#0F172A",margin:"0 0 6px" }}>{doc.title}</h2>
            <div style={{ display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap" }}>
              <span style={{ color:"#64748B",fontSize:"13px",fontFamily:"'DM Sans',sans-serif" }}>🎓 {doc.university}</span>
              <Stars rating={parseFloat(avgRating)} />
              <span style={{ color:"#94A3B8",fontSize:"12px",fontFamily:"'DM Sans',sans-serif" }}>({doc.reviews.length} reviews)</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#F1F5F9",border:"none",borderRadius:"10px",width:"36px",height:"36px",fontSize:"16px",cursor:"pointer",flexShrink:0 }}>✕</button>
        </div>
        {canAccess&&user?.plan==="free"&&(
          <div style={{ background:"#FFF8E1",padding:"10px 28px",display:"flex",alignItems:"center",gap:"8px",borderBottom:"1px solid #FDE68A" }}>
            <span>⏱️</span>
            <p style={{ margin:0,fontSize:"13px",color:"#B45309",fontFamily:"'DM Sans',sans-serif" }}>
              Free access: <strong>{mins}:{secs}</strong> remaining — <span style={{ color:"#3B5BDB",cursor:"pointer",fontWeight:600 }} onClick={onUpgrade}>Upgrade for unlimited</span>
            </p>
          </div>
        )}
        {!canAccess?(
          <div style={{ padding:"48px 28px",textAlign:"center" }}>
            <div style={{ fontSize:"56px",marginBottom:"16px" }}>💎</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"24px",color:"#0F172A",margin:"0 0 8px" }}>Premium Content</h3>
            <p style={{ color:"#64748B",fontFamily:"'DM Sans',sans-serif",maxWidth:"380px",margin:"0 auto 24px",lineHeight:1.6 }}>Subscribe to access this {doc.type.toLowerCase()} and all premium materials.</p>
            <button onClick={onUpgrade} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"12px",padding:"13px 32px",fontSize:"15px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>View Plans →</button>
          </div>
        ):(
          <>
            <div style={{ padding:"14px 28px",background:"#F8FAFF",borderBottom:"1px solid #E8EDF5",display:"flex",gap:"24px",flexWrap:"wrap" }}>
              {([["📄",`${doc.pages} pages`],["👁️",`${doc.downloads.toLocaleString()} views`],["📚",doc.subject]] as [string,string][]).map(([icon,label])=>(
                <div key={label} style={{ display:"flex",alignItems:"center",gap:"6px",color:"#475569",fontSize:"13px",fontFamily:"'DM Sans',sans-serif" }}><span>{icon}</span><span>{label}</span></div>
              ))}
            </div>
            <div style={{ padding:"24px 28px" }}>
              <h4 style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 14px" }}>Document Preview</h4>
              <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
                {Array.from({length:Math.min(doc.pages,4)},(_,i)=>i+1).map(page=>(
                  <div key={page} style={{ background:"#F8FAFF",border:"1px solid #E8EDF5",borderRadius:"12px",padding:"16px 20px" }}>
                    <span style={{ fontSize:"11px",fontWeight:700,color:"#94A3B8",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase" }}>Page {page}</span>
                    <div style={{ display:"flex",flexDirection:"column",gap:"6px",marginTop:"10px" }}>
                      {[0.9,0.7,0.85,0.6].map((w,i)=><div key={i} style={{ height:"9px",background:"#E2E8F0",borderRadius:"4px",width:`${w*100}%` }}/>)}
                      {page===1&&<div style={{ marginTop:"8px",padding:"10px 14px",background:"#EAF3FF",borderRadius:"8px",borderLeft:"3px solid #3B5BDB" }}>
                        <p style={{ margin:0,fontSize:"13px",color:"#1E3A8A",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6 }}><strong>Topics: </strong>{doc.preview}</p>
                      </div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:"0 28px 24px" }}>
              <div style={{ borderTop:"1px solid #E8EDF5",paddingTop:"24px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px" }}>
                  <div>
                    <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:"18px",color:"#0F172A",margin:"0 0 4px" }}>Ratings & Reviews</h4>
                    <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                      <span style={{ fontSize:"36px",fontWeight:800,color:"#0F172A",fontFamily:"'Playfair Display',serif" }}>{avgRating}</span>
                      <div><Stars rating={parseFloat(avgRating)} size={16}/><p style={{ margin:"2px 0 0",fontSize:"12px",color:"#64748B",fontFamily:"'DM Sans',sans-serif" }}>{doc.reviews.length} review{doc.reviews.length!==1?"s":""}</p></div>
                    </div>
                  </div>
                  {user&&!showReviewForm&&(
                    <button onClick={()=>setShowReviewForm(true)} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"10px",padding:"10px 20px",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>✍️ Write a Review</button>
                  )}
                  {!user&&<p style={{ fontSize:"13px",color:"#64748B",fontFamily:"'DM Sans',sans-serif",margin:0 }}>Sign in to leave a review</p>}
                </div>
                {showReviewForm&&(
                  <div style={{ marginBottom:"20px" }}>
                    <ReviewForm onSubmit={(r,c)=>{ onReview(doc.id,r,c); setShowReviewForm(false); }} onCancel={()=>setShowReviewForm(false)} />
                  </div>
                )}
                <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
                  {doc.reviews.length>0?doc.reviews.map(review=><ReviewCard key={review.id} review={review}/>):(
                    <div style={{ textAlign:"center",padding:"24px",color:"#94A3B8",fontFamily:"'DM Sans',sans-serif" }}>
                      <p style={{ fontSize:"24px",margin:"0 0 8px" }}>✍️</p><p style={{ fontSize:"14px",margin:0 }}>No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {recommended.length>0&&(
              <div style={{ padding:"0 28px 28px" }}>
                <div style={{ borderTop:"1px solid #E8EDF5",paddingTop:"24px" }}>
                  <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:"18px",color:"#0F172A",margin:"0 0 16px" }}>📖 You Might Also Like</h4>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"12px" }}>
                    {recommended.map(rec=>(
                      <div key={rec.id} style={{ background:"#F8FAFF",borderRadius:"12px",padding:"16px",border:"1px solid #E8EDF5",cursor:"pointer" }}
                        onClick={()=>{ onClose(); }}>
                        <div style={{ display:"flex",gap:"8px",marginBottom:"8px" }}>
                          <span style={{ background:typeColors[rec.type].bg,color:typeColors[rec.type].text,fontSize:"10px",fontWeight:700,padding:"3px 8px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif" }}>{rec.type}</span>
                          {rec.premium&&<span style={{ fontSize:"10px" }}>💎</span>}
                        </div>
                        <p style={{ fontFamily:"'Playfair Display',serif",fontSize:"13px",fontWeight:700,color:"#0F172A",margin:"0 0 6px",lineHeight:1.3 }}>{rec.title}</p>
                        <Stars rating={rec.rating}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div style={{ padding:"18px 28px",borderTop:"1px solid #E8EDF5",display:"flex",gap:"12px",justifyContent:"flex-end" }}>
              <button onClick={onClose} style={{ padding:"10px 20px",borderRadius:"10px",border:"1.5px solid #E2E8F0",background:"#fff",color:"#475569",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Close</button>
              {user?.plan==="premium"&&<button style={{ padding:"10px 20px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>⬇️ Download PDF</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TutorCard = ({ tutor, onOpen }: { tutor: Tutor; onOpen: (t: Tutor) => void }) => {
  const [hovered,setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={()=>onOpen(tutor)}
      style={{ background:"#fff",borderRadius:"16px",padding:"24px",border:hovered?"1.5px solid #3B5BDB":"1.5px solid #E8EDF5",boxShadow:hovered?"0 8px 32px rgba(59,91,219,0.10)":"0 2px 8px rgba(0,0,0,0.04)",cursor:"pointer",transition:"all 0.2s",transform:hovered?"translateY(-3px)":"none" }}>
      <div style={{ display:"flex",alignItems:"center",gap:"14px",marginBottom:"14px" }}>
        <div style={{ width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"16px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",flexShrink:0 }}>{tutor.avatar}</div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"16px",color:"#0F172A",margin:"0 0 2px" }}>{tutor.name}</h3>
          <p style={{ color:"#64748B",fontSize:"12px",margin:0,fontFamily:"'DM Sans',sans-serif" }}>🎓 {tutor.university}</p>
        </div>
        <span style={{ background:tutor.available?"#EAFAF1":"#FEF2F2",color:tutor.available?"#15803D":"#DC2626",fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif",flexShrink:0 }}>{tutor.available?"✅ Available":"❌ Busy"}</span>
      </div>
      <p style={{ color:"#64748B",fontSize:"13px",margin:"0 0 14px",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5 }}>{tutor.bio}</p>
      <div style={{ display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"14px" }}>
        {tutor.subjects.map(s=><span key={s} style={{ background:"#EAF3FF",color:"#2563EB",fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif" }}>{s}</span>)}
      </div>
      <div style={{ borderTop:"1px solid #F1F5F9",paddingTop:"12px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"8px" }}><Stars rating={tutor.rating}/><span style={{ color:"#94A3B8",fontSize:"12px",fontFamily:"'DM Sans',sans-serif" }}>({tutor.reviewCount})</span></div>
        <span style={{ fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,color:"#3B5BDB" }}>{tutor.rate}</span>
      </div>
    </div>
  );
};

const TutorViewer = ({ tutor, user, onClose, onSignIn, onReview }: {
  tutor: Tutor; user: UserObj | null;
  onClose: () => void; onSignIn: () => void; onReview: (tutorId: number, rating: number, comment: string) => void;
}) => {
  const [showReviewForm,setShowReviewForm] = useState(false);
  const [showBook,setShowBook] = useState(false);
  const [booked,setBooked] = useState(false);
  const avg = tutor.reviews.length ? (tutor.reviews.reduce((a,r)=>a+r.rating,0)/tutor.reviews.length).toFixed(1) : tutor.rating.toFixed(1);
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:"24px",width:"100%",maxWidth:"700px",maxHeight:"92vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#1E3A8A,#3B5BDB)",padding:"28px",borderRadius:"24px 24px 0 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div style={{ display:"flex",gap:"16px",alignItems:"center" }}>
            <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"22px",fontWeight:700,fontFamily:"'DM Sans',sans-serif" }}>{tutor.avatar}</div>
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"22px",color:"#fff",margin:"0 0 4px" }}>{tutor.name}</h2>
              <p style={{ color:"rgba(255,255,255,0.75)",fontSize:"13px",margin:"0 0 6px",fontFamily:"'DM Sans',sans-serif" }}>🎓 {tutor.university}</p>
              <Stars rating={parseFloat(avg)}/>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"10px",width:"36px",height:"36px",fontSize:"16px",cursor:"pointer",color:"#fff" }}>✕</button>
        </div>
        <div style={{ padding:"28px",display:"flex",flexDirection:"column",gap:"24px" }}>
          <div>
            <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:"17px",color:"#0F172A",margin:"0 0 8px" }}>About</h4>
            <p style={{ color:"#475569",fontSize:"14px",margin:"0 0 14px",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6 }}>{tutor.bio}</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:"8px" }}>
              {tutor.subjects.map(s=><span key={s} style={{ background:"#EAF3FF",color:"#2563EB",fontSize:"12px",fontWeight:600,padding:"5px 12px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif" }}>{s}</span>)}
            </div>
          </div>
          <div style={{ background:"#F8FAFF",borderRadius:"14px",padding:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"16px" }}>
            <div>
              <p style={{ margin:"0 0 2px",fontSize:"12px",color:"#64748B",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",fontWeight:600 }}>Session Rate</p>
              <p style={{ margin:0,fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:800,color:"#3B5BDB" }}>{tutor.rate}</p>
            </div>
            {booked?(
              <div style={{ background:"#EAFAF1",borderRadius:"12px",padding:"12px 20px",textAlign:"center" }}>
                <p style={{ margin:0,color:"#15803D",fontWeight:700,fontFamily:"'DM Sans',sans-serif" }}>✅ Session Requested!</p>
                <p style={{ margin:"4px 0 0",fontSize:"12px",color:"#64748B",fontFamily:"'DM Sans',sans-serif" }}>{tutor.name} will contact you soon</p>
              </div>
            ):(
              <button onClick={()=>user?setShowBook(true):onSignIn()} style={{ background:tutor.available?"linear-gradient(135deg,#3B5BDB,#6366F1)":"#94A3B8",color:"#fff",border:"none",borderRadius:"12px",padding:"13px 28px",fontSize:"15px",fontWeight:700,cursor:tutor.available?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif" }}>
                {tutor.available?"📅 Book a Session":"Currently Unavailable"}
              </button>
            )}
          </div>
          {showBook&&!booked&&(
            <div style={{ background:"#fff",border:"1.5px solid #3B5BDB",borderRadius:"14px",padding:"20px",display:"flex",flexDirection:"column",gap:"14px" }}>
              <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:"17px",color:"#0F172A",margin:0 }}>Book a Session</h4>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
                <div><label style={labelStyle}>Preferred Date</label><input type="date" style={inputStyle}/></div>
                <div><label style={labelStyle}>Preferred Time</label><input type="time" style={inputStyle}/></div>
              </div>
              <div><label style={labelStyle}>Topic to Cover</label><input placeholder="e.g. Binary Trees, SQL Joins..." style={inputStyle}/></div>
              <div><label style={labelStyle}>Additional Notes</label><textarea rows={2} placeholder="Any specific questions or areas of concern..." style={{ ...inputStyle,resize:"vertical" }}/></div>
              <div style={{ display:"flex",gap:"10px" }}>
                <button onClick={()=>{ setBooked(true); setShowBook(false); }} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"10px",padding:"11px 24px",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Confirm Booking</button>
                <button onClick={()=>setShowBook(false)} style={{ background:"#F1F5F9",color:"#475569",border:"none",borderRadius:"10px",padding:"11px 24px",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              </div>
            </div>
          )}
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
              <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:"18px",color:"#0F172A",margin:0 }}>Student Reviews ({tutor.reviews.length})</h4>
              {user&&!showReviewForm&&<button onClick={()=>setShowReviewForm(true)} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"10px",padding:"9px 18px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>✍️ Rate Tutor</button>}
            </div>
            {showReviewForm&&<div style={{ marginBottom:"16px" }}><ReviewForm onSubmit={(r,c)=>{ onReview(tutor.id,r,c); setShowReviewForm(false); }} onCancel={()=>setShowReviewForm(false)}/></div>}
            <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
              {tutor.reviews.length>0?tutor.reviews.map(r=><ReviewCard key={r.id} review={r}/>):(
                <div style={{ textAlign:"center",padding:"24px",color:"#94A3B8",fontFamily:"'DM Sans',sans-serif" }}>
                  <p style={{ fontSize:"24px",margin:"0 0 8px" }}>✍️</p><p style={{ fontSize:"14px",margin:0 }}>No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TutorsPage = ({ user, onSignIn, tutors, onReview }: {
  user: UserObj | null; onSignIn: () => void; tutors: Tutor[]; onReview: (tutorId: number, rating: number, comment: string) => void;
}) => {
  const [selectedTutor,setSelectedTutor] = useState<Tutor | null>(null);
  const [search,setSearch] = useState("");
  const [filterUni,setFilterUni] = useState("All");
  const filtered = tutors.filter(t=>{
    const q = search.toLowerCase();
    const matchQ = !q||t.name.toLowerCase().includes(q)||t.subjects.some(s=>s.toLowerCase().includes(q));
    const matchUni = filterUni==="All"||t.university===filterUni;
    return matchQ&&matchUni;
  });
  return (
    <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"40px 24px 80px" }}>
      {selectedTutor&&<TutorViewer tutor={tutors.find(t=>t.id===selectedTutor.id)||selectedTutor} user={user} onClose={()=>setSelectedTutor(null)} onSignIn={()=>{ setSelectedTutor(null); onSignIn(); }} onReview={onReview}/>}
      <div style={{ textAlign:"center",marginBottom:"40px" }}>
        <div style={{ display:"inline-block",background:"#EAF3FF",color:"#2563EB",borderRadius:"20px",padding:"6px 16px",fontSize:"12px",fontWeight:700,marginBottom:"14px",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase" }}>👨‍🏫 Tutor Marketplace</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"36px",color:"#0F172A",margin:"0 0 10px" }}>Find Your Perfect Tutor</h2>
        <p style={{ color:"#64748B",fontSize:"16px",maxWidth:"500px",margin:"0 auto",fontFamily:"'DM Sans',sans-serif" }}>Connect with top students from Botswana universities for 1-on-1 tutoring sessions</p>
      </div>
      <div style={{ display:"flex",gap:"12px",marginBottom:"28px",flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:"200px",display:"flex",alignItems:"center",background:"#fff",borderRadius:"12px",border:"1.5px solid #E2E8F0",padding:"0 16px" }}>
          <span style={{ marginRight:"8px",fontSize:"16px" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or subject..." style={{ flex:1,border:"none",outline:"none",fontSize:"14px",color:"#0F172A",background:"transparent",fontFamily:"'DM Sans',sans-serif",padding:"12px 0" }}/>
        </div>
        <select value={filterUni} onChange={e=>setFilterUni(e.target.value)} style={{ padding:"12px 16px",borderRadius:"12px",border:"1.5px solid #E2E8F0",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#475569",background:"#fff",outline:"none" }}>
          <option value="All">All Universities</option>
          {universities.map(u=><option key={u.name} value={u.name}>{u.name}</option>)}
        </select>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"20px" }}>
        {filtered.map(tutor=><TutorCard key={tutor.id} tutor={tutor} onOpen={setSelectedTutor}/>)}
        {filtered.length===0&&(
          <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:"#94A3B8" }}>
            <p style={{ fontSize:"40px",margin:"0 0 12px" }}>👨‍🏫</p>
            <p style={{ fontSize:"16px",fontWeight:600,color:"#475569",fontFamily:"'DM Sans',sans-serif" }}>No tutors found</p>
          </div>
        )}
      </div>
      <div style={{ marginTop:"48px",background:"linear-gradient(135deg,#1E3A8A,#3B5BDB)",borderRadius:"20px",padding:"40px",textAlign:"center" }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"26px",color:"#fff",margin:"0 0 10px" }}>Are You a Top Student?</h3>
        <p style={{ color:"rgba(255,255,255,0.75)",fontFamily:"'DM Sans',sans-serif",maxWidth:"400px",margin:"0 auto 20px" }}>Join our tutor marketplace and earn money helping fellow students pass their exams.</p>
        <button style={{ background:"rgba(255,255,255,0.2)",color:"#fff",border:"1.5px solid rgba(255,255,255,0.4)",borderRadius:"12px",padding:"12px 28px",fontSize:"14px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Apply to Become a Tutor →</button>
      </div>
    </div>
  );
};

const PaymentModal = ({ plan, onSuccess, onClose }: { plan: Plan; onSuccess: () => void; onClose: () => void }) => {
  const [step,setStep] = useState("details");
  const [cardNum,setCardNum] = useState("");
  const [expiry,setExpiry] = useState("");
  const [cvv,setCvv] = useState("");
  const [name,setName] = useState("");
  const handlePay = () => {
    if(!cardNum||!expiry||!cvv||!name){alert("Please fill in all card details.");return;}
    setStep("processing");
    setTimeout(()=>{ setStep("success"); setTimeout(onSuccess,1500); },2500);
  };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:"24px",width:"100%",maxWidth:"460px",overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#1E3A8A,#3B5BDB)",padding:"24px 28px",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div><p style={{ margin:0,fontSize:"12px",opacity:0.75,fontFamily:"'DM Sans',sans-serif" }}>NoteFlow Premium</p><h3 style={{ margin:"4px 0 0",fontFamily:"'Playfair Display',serif",fontSize:"22px" }}>{plan.name} Plan</h3></div>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:"28px",fontWeight:800,fontFamily:"'Playfair Display',serif" }}>{plan.price}</div><div style={{ fontSize:"12px",opacity:0.75,fontFamily:"'DM Sans',sans-serif" }}>{plan.period}</div></div>
        </div>
        <div style={{ padding:"28px" }}>
          {step==="details"&&<div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
            <p style={{ margin:"0 0 4px",fontWeight:700,fontSize:"13px",color:"#0F172A",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.04em" }}>Card Details</p>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Cardholder Name" style={inp}/>
            <input value={cardNum} onChange={e=>setCardNum(e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim())} placeholder="1234 5678 9012 3456" style={inp}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
              <input value={expiry} onChange={e=>{ let v=e.target.value.replace(/\D/g,"").slice(0,4); if(v.length>2)v=v.slice(0,2)+"/"+v.slice(2); setExpiry(v); }} placeholder="MM/YY" style={inp}/>
              <input value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="CVV" style={inp}/>
            </div>
            <div style={{ background:"#F0FDF4",borderRadius:"10px",padding:"12px 16px",display:"flex",gap:"8px" }}><span>🔒</span><p style={{ margin:0,fontSize:"12px",color:"#15803D",fontFamily:"'DM Sans',sans-serif" }}>256-bit SSL encryption</p></div>
            <button onClick={handlePay} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"12px",padding:"14px",fontSize:"15px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Pay {plan.price} →</button>
            <button onClick={onClose} style={{ background:"transparent",color:"#64748B",border:"none",fontSize:"13px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
          </div>}
          {step==="processing"&&<div style={{ textAlign:"center",padding:"40px 0" }}><div style={{ fontSize:"48px",marginBottom:"16px" }}>⏳</div><h3 style={{ fontFamily:"'Playfair Display',serif",color:"#0F172A" }}>Processing...</h3></div>}
          {step==="success"&&<div style={{ textAlign:"center",padding:"40px 0" }}><div style={{ fontSize:"56px",marginBottom:"16px" }}>🎉</div><h3 style={{ fontFamily:"'Playfair Display',serif",color:"#0F172A" }}>Payment Successful!</h3><p style={{ color:"#64748B",fontFamily:"'DM Sans',sans-serif" }}>Welcome to NoteFlow Premium 🇧🇼</p></div>}
        </div>
      </div>
    </div>
  );
};

const SignInModal = ({ onSignIn, onClose }: { onSignIn: (user: UserObj) => void; onClose: () => void }) => (
  <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
    <div style={{ background:"#fff",borderRadius:"24px",padding:"40px",width:"100%",maxWidth:"400px",margin:"0 20px",textAlign:"center" }} onClick={e=>e.stopPropagation()}>
      <div style={{ width:52,height:52,borderRadius:"14px",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",margin:"0 auto 16px" }}>📚</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"26px",color:"#0F172A",margin:"0 0 8px" }}>Welcome to NoteFlow</h2>
      <p style={{ color:"#64748B",fontSize:"14px",margin:"0 0 28px",fontFamily:"'DM Sans',sans-serif" }}>Sign in to access study materials from Botswana universities</p>
      <button onClick={()=>onSignIn({ name:"Thabang Odirile",email:"thabang@gmail.com",avatar:"TO",plan:"free" })}
        style={{ width:"100%",padding:"13px 20px",borderRadius:"12px",border:"1.5px solid #E2E8F0",background:"#fff",color:"#0F172A",fontSize:"15px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginBottom:"16px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>
      <p style={{ color:"#94A3B8",fontSize:"12px",fontFamily:"'DM Sans',sans-serif",margin:0 }}>By signing in you agree to our Terms of Service</p>
    </div>
  </div>
);

const DocCard = ({ doc, onOpen }: { doc: Doc; onOpen: (d: Doc) => void }) => {
  const [hovered,setHovered] = useState(false);
  const colors = typeColors[doc.type];
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={()=>onOpen(doc)}
      style={{ background:"#fff",borderRadius:"16px",padding:"24px",border:hovered?"1.5px solid #3B5BDB":"1.5px solid #E8EDF5",boxShadow:hovered?"0 8px 32px rgba(59,91,219,0.10)":"0 2px 8px rgba(0,0,0,0.04)",cursor:"pointer",transition:"all 0.22s",transform:hovered?"translateY(-3px)":"none",display:"flex",flexDirection:"column",gap:"14px",position:"relative" }}>
      {doc.premium&&<div style={{ position:"absolute",top:16,right:16,background:"#FFF8E1",color:"#B45309",fontSize:"10px",fontWeight:700,padding:"3px 8px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif" }}>💎 Premium</div>}
      <div style={{ display:"flex",justifyContent:"space-between" }}>
        <span style={{ background:colors.bg,color:colors.text,fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif" }}>{doc.type}</span>
        <span style={{ color:"#94A3B8",fontSize:"12px",fontFamily:"'DM Sans',sans-serif",marginRight:doc.premium?"64px":"0" }}>{doc.year}</span>
      </div>
      <div>
        <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,color:"#0F172A",lineHeight:1.4,margin:0 }}>{doc.title}</h3>
        <p style={{ color:"#64748B",fontSize:"12.5px",margin:"6px 0 0",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5 }}>{doc.preview}</p>
      </div>
      <p style={{ color:"#475569",fontSize:"12.5px",margin:0,fontFamily:"'DM Sans',sans-serif" }}>🎓 {doc.university}</p>
      <div style={{ borderTop:"1px solid #F1F5F9",paddingTop:"12px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <Stars rating={doc.rating}/>
        <div style={{ display:"flex",gap:"10px",color:"#64748B",fontSize:"12px",fontFamily:"'DM Sans',sans-serif" }}>
          <span>📄 {doc.pages}p</span><span>💬 {doc.reviews.length}</span>
        </div>
      </div>
    </div>
  );
};

const PricingPage = ({ user, onSubscribe }: { user: UserObj | null; onSubscribe: () => void }) => {
  const [selectedPlan,setSelectedPlan] = useState<Plan | null>(null);
  return (
    <div style={{ maxWidth:"1100px",margin:"0 auto",padding:"40px 24px 80px" }}>
      {selectedPlan&&<PaymentModal plan={selectedPlan} onSuccess={()=>{ onSubscribe(); setSelectedPlan(null); }} onClose={()=>setSelectedPlan(null)}/>}
      <div style={{ textAlign:"center",marginBottom:"48px" }}>
        <div style={{ display:"inline-block",background:"#EAF3FF",color:"#2563EB",borderRadius:"20px",padding:"6px 16px",fontSize:"12px",fontWeight:700,marginBottom:"16px",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase" }}>💎 Premium Access</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"38px",color:"#0F172A",margin:"0 0 12px" }}>Unlock Everything</h2>
        <p style={{ color:"#64748B",fontSize:"16px",maxWidth:"500px",margin:"0 auto",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6 }}>Full access to all notes, textbooks, past exam papers and more from every Botswana university.</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px",maxWidth:"960px",margin:"0 auto" }}>
        {PLANS.map(plan=>(
          <div key={plan.id} style={{ background:"#fff",borderRadius:"20px",padding:"32px",border:plan.id==="semester"?`2px solid ${plan.color}`:"1.5px solid #E8EDF5",position:"relative",boxShadow:plan.id==="semester"?"0 8px 32px rgba(124,58,237,0.15)":"0 2px 8px rgba(0,0,0,0.04)" }}>
            {plan.id==="semester"&&<div style={{ position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:plan.color,color:"#fff",borderRadius:"20px",padding:"4px 16px",fontSize:"12px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap" }}>⭐ Most Popular</div>}
            {plan.saves&&<div style={{ background:"#EAFAF1",color:"#15803D",borderRadius:"20px",padding:"4px 12px",fontSize:"11px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"inline-block",marginBottom:"12px" }}>{plan.saves}</div>}
            <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"22px",color:"#0F172A",margin:"0 0 4px" }}>{plan.name}</h3>
            <div style={{ display:"flex",alignItems:"baseline",gap:"4px",margin:"12px 0 20px" }}>
              <span style={{ fontSize:"36px",fontWeight:800,color:plan.color,fontFamily:"'Playfair Display',serif" }}>{plan.price}</span>
              <span style={{ color:"#94A3B8",fontSize:"14px",fontFamily:"'DM Sans',sans-serif" }}>{plan.period}</span>
            </div>
            <button onClick={()=>user?setSelectedPlan(plan):alert("Please sign in first!")} style={{ width:"100%",padding:"13px",borderRadius:"12px",border:"none",background:user?.plan==="premium"?"#E2E8F0":`linear-gradient(135deg,${plan.color},#6366F1)`,color:user?.plan==="premium"?"#64748B":"#fff",fontSize:"14px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
              {user?.plan==="premium"?"✅ Current Plan":"Subscribe Now →"}
            </button>
          </div>
        ))}
      </div>
      <p style={{ textAlign:"center",marginTop:"28px",color:"#94A3B8",fontSize:"13px",fontFamily:"'DM Sans',sans-serif" }}>🔒 Secure payment · Cancel anytime · Instant access</p>
    </div>
  );
};

const UploadPage = ({ user, onSignIn }: { user: UserObj | null; onSignIn: () => void }) => {
  const [selectedUni,setSelectedUni] = useState("");
  const [selectedType,setSelectedType] = useState("Notes");
  const [title,setTitle] = useState("");
  const [fileName,setFileName] = useState("");
  const [submitted,setSubmitted] = useState(false);
  const [dragging,setDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uniObj = universities.find(u=>u.name===selectedUni);
  if(!user) return <div style={{ maxWidth:"500px",margin:"80px auto",textAlign:"center",padding:"0 24px" }}><div style={{ fontSize:"56px",marginBottom:"16px" }}>🔐</div><h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"26px",color:"#0F172A" }}>Sign In to Upload</h2><p style={{ color:"#64748B",fontFamily:"'DM Sans',sans-serif",marginBottom:"24px" }}>You need to be signed in to share your study materials.</p><button onClick={onSignIn} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"12px",padding:"13px 32px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"15px" }}>Sign In with Google →</button></div>;
  if(submitted) return <div style={{ maxWidth:"600px",margin:"80px auto",textAlign:"center",padding:"0 24px" }}><div style={{ fontSize:"64px",marginBottom:"20px" }}>🎉</div><h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"28px",color:"#0F172A" }}>Upload Successful!</h2><p style={{ color:"#64748B",fontFamily:"'DM Sans',sans-serif" }}><strong>{fileName}</strong> has been submitted.</p><button onClick={()=>{ setSubmitted(false); setFileName(""); setTitle(""); setSelectedUni(""); }} style={{ marginTop:"24px",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"12px",padding:"13px 28px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Upload Another</button></div>;
  return(
    <div style={{ maxWidth:"720px",margin:"0 auto",padding:"40px 24px 80px" }}>
      <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"32px",color:"#0F172A",marginBottom:"6px" }}>Upload Your Notes</h2>
      <p style={{ color:"#64748B",marginBottom:"36px",fontFamily:"'DM Sans',sans-serif" }}>Share your study materials and help fellow students in Botswana</p>
      <div style={{ background:"#fff",borderRadius:"20px",padding:"36px",border:"1.5px solid #E8EDF5",display:"flex",flexDirection:"column",gap:"22px" }}>
        <div><label style={labelStyle}>Document Title *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Introduction to Java - Week 1 Notes" style={inputStyle}/></div>
        <div><label style={labelStyle}>University / College *</label><select value={selectedUni} onChange={e=>setSelectedUni(e.target.value)} style={inputStyle}><option value="">— Select your institution —</option>{universities.map(u=><option key={u.name} value={u.name}>{u.name}</option>)}</select></div>
        {uniObj&&<div><label style={labelStyle}>Course *</label><select style={inputStyle}><option value="">— Select your course —</option>{uniObj.courses.map(c=><option key={c}>{c}</option>)}</select></div>}
        <div><label style={labelStyle}>Document Type *</label><div style={{ display:"flex",gap:"10px",flexWrap:"wrap" }}>{["Notes","Exam","Summary","Textbook"].map(type=><button key={type} onClick={()=>setSelectedType(type)} style={{ padding:"10px 22px",borderRadius:"10px",fontSize:"14px",fontWeight:600,border:selectedType===type?"none":"1.5px solid #CBD5E1",background:selectedType===type?"linear-gradient(135deg,#3B5BDB,#6366F1)":"#fff",color:selectedType===type?"#fff":"#475569",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>{type}</button>)}</div></div>
        <div><label style={labelStyle}>Upload File *</label>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" style={{ display:"none" }} onChange={e=>{ if(e.target.files?.[0]) setFileName(e.target.files[0].name); }}/>
          <div onClick={()=>fileInputRef.current?.click()} onDragOver={e=>{ e.preventDefault(); setDragging(true); }} onDragLeave={()=>setDragging(false)} onDrop={e=>{ e.preventDefault(); setDragging(false); if(e.dataTransfer.files[0]) setFileName(e.dataTransfer.files[0].name); }}
            style={{ border:dragging?"2px dashed #3B5BDB":fileName?"2px solid #22C55E":"2px dashed #CBD5E1",borderRadius:"14px",padding:"32px",textAlign:"center",cursor:"pointer",background:fileName?"#F0FDF4":"#F8FAFF",transition:"all 0.2s" }}>
            <div style={{ fontSize:"32px",marginBottom:"8px" }}>{fileName?"✅":"📂"}</div>
            {fileName?<><p style={{ color:"#15803D",fontSize:"14px",fontWeight:700,margin:"0 0 2px",fontFamily:"'DM Sans',sans-serif" }}>{fileName}</p><p style={{ color:"#64748B",fontSize:"12px",margin:0,fontFamily:"'DM Sans',sans-serif" }}>Click to change</p></>
              :<><p style={{ color:"#0F172A",fontSize:"14px",fontWeight:600,margin:"0 0 4px",fontFamily:"'DM Sans',sans-serif" }}>Drag & drop or <span style={{ color:"#3B5BDB" }}>browse your computer</span></p><p style={{ color:"#94A3B8",fontSize:"12px",margin:0,fontFamily:"'DM Sans',sans-serif" }}>PDF, DOCX, PPT · Max 50MB</p></>}
          </div>
        </div>
        <button onClick={()=>{ if(title&&selectedUni&&fileName) setSubmitted(true); else alert("Please fill in title, university and upload a file."); }} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"12px",padding:"15px",fontSize:"15px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Upload Document →</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — mini-components (prefixed A to avoid conflicts)
// ═══════════════════════════════════════════════════════════════════════════════

const ABadge = ({ label, color = AC.info }: { label: string; color?: string }) => (
  <span style={{ background:color+'22',color,fontSize:'11px',fontWeight:600,padding:'3px 10px',borderRadius:'20px',fontFamily:AF.mono,whiteSpace:'nowrap' }}>{label}</span>
);

const AStatCard = ({ icon, label, value, sub, color = AC.accent }: { icon: string; label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ background:AC.card,borderRadius:'14px',padding:'22px 20px',border:`1px solid ${AC.border}`,flex:1,minWidth:150 }}>
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
      <div>
        <p style={{ margin:'0 0 8px',fontSize:'11px',color:AC.textMuted,fontFamily:AF.body,textTransform:'uppercase',letterSpacing:'0.07em',fontWeight:600 }}>{label}</p>
        <p style={{ margin:0,fontSize:'28px',fontWeight:700,color:AC.text,fontFamily:AF.mono }}>{value}</p>
        {sub&&<p style={{ margin:'4px 0 0',fontSize:'12px',color:AC.textSub,fontFamily:AF.body }}>{sub}</p>}
      </div>
      <div style={{ width:40,height:40,borderRadius:'12px',background:color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0 }}>{icon}</div>
    </div>
  </div>
);

const AEmpty = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div style={{ textAlign:'center',padding:'56px 20px' }}>
    <div style={{ fontSize:'40px',marginBottom:'12px' }}>{icon}</div>
    <p style={{ fontFamily:AF.body,fontSize:'15px',fontWeight:600,color:AC.textSub,margin:'0 0 6px' }}>{title}</p>
    <p style={{ fontFamily:AF.body,fontSize:'13px',color:AC.textMuted,margin:0 }}>{desc}</p>
  </div>
);

const ASectionHead = ({ title, sub }: { title: string; sub: string }) => (
  <div style={{ marginBottom:'28px' }}>
    <h1 style={{ fontFamily:AF.head,fontSize:'26px',color:AC.text,margin:'0 0 6px',fontWeight:800 }}>{title}</h1>
    <p style={{ color:AC.textMuted,fontSize:'14px',margin:0,fontFamily:AF.body }}>{sub}</p>
  </div>
);

const ATableHead = ({ cols, template }: { cols: string[]; template: string }) => (
  <div style={{ display:'grid',gridTemplateColumns:template,padding:'12px 20px',borderBottom:`1px solid ${AC.border}`,background:'rgba(255,255,255,0.025)' }}>
    {cols.map(h=>(
      <span key={h} style={{ fontSize:'11px',fontWeight:600,color:AC.textMuted,textTransform:'uppercase',letterSpacing:'0.07em',fontFamily:AF.body }}>{h}</span>
    ))}
  </div>
);

const AToggle = ({ active, onChange, danger = false }: { active: boolean; onChange: () => void; danger?: boolean }) => {
  const bg = active?(danger?AC.danger:AC.success):AC.border;
  return (
    <div onClick={onChange} style={{ width:44,height:24,borderRadius:12,background:bg,cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0,border:`1px solid ${active?bg:AC.borderMd}` }}>
      <div style={{ position:'absolute',top:3,left:active?22:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s' }}/>
    </div>
  );
};

const ASearchBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div style={{ display:'flex',alignItems:'center',gap:8,background:AC.card,border:`1px solid ${AC.border}`,borderRadius:10,padding:'8px 14px' }}>
    <span style={{ fontSize:14 }}>🔍</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ background:'none',border:'none',outline:'none',color:AC.text,fontSize:13,fontFamily:AF.body,width:200 }}/>
  </div>
);

const AActionBtn = ({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) => (
  <button onClick={onClick} style={{ padding:'5px 10px',borderRadius:6,border:danger?'none':`1px solid ${AC.border}`,background:danger?AC.dangerDim:'none',color:danger?AC.danger:AC.textMuted,fontSize:11,cursor:'pointer',fontFamily:AF.body,whiteSpace:'nowrap' }}>{label}</button>
);

const AGroupLabel = ({ label }: { label: string }) => (
  <p style={{ fontFamily:AF.body,fontSize:12,fontWeight:600,color:AC.textMuted,textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 12px' }}>{label}</p>
);

// ── Admin sub-pages ──────────────────────────────────────────────────────────

function AdminOverview({ students, tutors, payments, ratings, verifications }: {
  students: AdminStudent[]; tutors: AdminTutor[]; payments: Payment[];
  ratings: Rating[]; verifications: Verification[];
}) {
  const totalRev = payments.reduce((s,p)=>s+(p.amount||0),0);
  const pendingV = verifications.filter(v=>v.status==='pending').length;
  const avgRat = ratings.length?(ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1):'—';
  const statuses = [{label:'API Server',ok:true},{label:'Database',ok:true},{label:'Payment Gateway',ok:true},{label:'Storage',ok:true},{label:'Email Service',ok:true}];
  return (
    <div>
      <ASectionHead title="Dashboard Overview" sub="Welcome back, Mark — here's what's happening on NoteFlow today."/>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:14,marginBottom:24 }}>
        <AStatCard icon="👥" label="Total Students"  value={students.length}                    sub="Registered"      color={AC.info}    />
        <AStatCard icon="👨‍🏫" label="Total Tutors"   value={tutors.length}                      sub="Active profiles" color={AC.success} />
        <AStatCard icon="💰" label="Total Revenue"   value={`P${totalRev.toLocaleString()}`}    sub="All time"        color={AC.accent}  />
        <AStatCard icon="⏳" label="Pending Verif."  value={pendingV}                           sub="Awaiting review" color={AC.danger}  />
        <AStatCard icon="⭐" label="Avg. Rating"     value={avgRat}                             sub="Platform-wide"   color={AC.warning} />
        <AStatCard icon="💬" label="Total Reviews"   value={ratings.length}                     sub="All submitted"   color={AC.info}    />
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
        <div style={{ background:AC.card,borderRadius:14,padding:24,border:`1px solid ${AC.border}` }}>
          <h3 style={{ fontFamily:AF.head,fontSize:16,color:AC.text,margin:'0 0 16px',fontWeight:700 }}>Recent Activity</h3>
          <AEmpty icon="📋" title="No activity yet" desc="All admin actions will be logged here"/>
        </div>
        <div style={{ background:AC.card,borderRadius:14,padding:24,border:`1px solid ${AC.border}` }}>
          <h3 style={{ fontFamily:AF.head,fontSize:16,color:AC.text,margin:'0 0 16px',fontWeight:700 }}>Platform Status</h3>
          {statuses.map(s=>(
            <div key={s.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:`1px solid ${AC.border}` }}>
              <span style={{ fontSize:13,color:AC.textSub,fontFamily:AF.body }}>{s.label}</span>
              <span style={{ fontSize:11,color:s.ok?AC.success:AC.danger,background:s.ok?AC.successDim:AC.dangerDim,padding:'3px 10px',borderRadius:20,fontFamily:AF.mono }}>{s.ok?'● Operational':'● Degraded'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminStudents({ students, setStudents }: { students: AdminStudent[]; setStudents: React.Dispatch<React.SetStateAction<AdminStudent[]>> }) {
  const [search,setSearch] = useState('');
  const filtered = students.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase())||s.email?.toLowerCase().includes(search.toLowerCase()));
  const suspend = (id: number) => setStudents(p=>p.map(s=>s.id===id?{...s,status:s.status==='suspended'?'active':'suspended'}:s));
  const remove = (id: number) => { if(window.confirm('Permanently delete this student account?')) setStudents(p=>p.filter(s=>s.id!==id)); };
  const cols = ['Name','Email','University','Plan','Status','Joined','Actions'];
  const template = '1.8fr 2fr 2fr 0.8fr 0.9fr 0.9fr 130px';
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:12 }}>
        <ASectionHead title="Student Accounts" sub="View and manage all registered student accounts"/>
        <ASearchBox value={search} onChange={setSearch} placeholder="Search students…"/>
      </div>
      <div style={{ background:AC.card,borderRadius:14,border:`1px solid ${AC.border}`,overflow:'hidden' }}>
        <ATableHead cols={cols} template={template}/>
        {filtered.length===0
          ?<AEmpty icon="👥" title="No students registered yet" desc="Student accounts will appear here once they sign up"/>
          :filtered.map(s=>(
            <div key={s.id} style={{ display:'grid',gridTemplateColumns:template,padding:'13px 20px',borderBottom:`1px solid ${AC.border}`,alignItems:'center',gap:4 }}>
              <span style={{ fontSize:13,color:AC.text,fontFamily:AF.body,fontWeight:500 }}>{s.name}</span>
              <span style={{ fontSize:12,color:AC.textMuted,fontFamily:AF.body }}>{s.email}</span>
              <span style={{ fontSize:12,color:AC.textSub,fontFamily:AF.body }}>{s.university||'—'}</span>
              <ABadge label={s.plan||'free'} color={s.plan==='premium'?AC.accent:AC.info}/>
              <ABadge label={s.status||'active'} color={s.status==='suspended'?AC.danger:AC.success}/>
              <span style={{ fontSize:12,color:AC.textMuted,fontFamily:AF.mono }}>{s.joined||'—'}</span>
              <div style={{ display:'flex',gap:6 }}>
                <AActionBtn label={s.status==='suspended'?'Restore':'Suspend'} onClick={()=>suspend(s.id)}/>
                <AActionBtn label="Delete" danger onClick={()=>remove(s.id)}/>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AdminTutors({ tutors, setTutors }: { tutors: AdminTutor[]; setTutors: React.Dispatch<React.SetStateAction<AdminTutor[]>> }) {
  const [search,setSearch] = useState('');
  const filtered = tutors.filter(t=>!search||t.name?.toLowerCase().includes(search.toLowerCase())||t.subjects?.some(s=>s.toLowerCase().includes(search.toLowerCase())));
  const suspend = (id: number) => setTutors(p=>p.map(t=>t.id===id?{...t,status:t.status==='suspended'?'active':'suspended'}:t));
  const remove = (id: number) => { if(window.confirm('Permanently delete this tutor account?')) setTutors(p=>p.filter(t=>t.id!==id)); };
  const cols = ['Name','Email','University','Subjects','Rating','Status','Actions'];
  const template = '1.5fr 2fr 1.8fr 2fr 0.7fr 0.9fr 120px';
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:12 }}>
        <ASectionHead title="Tutor Accounts" sub="Manage all registered and verified tutor profiles"/>
        <ASearchBox value={search} onChange={setSearch} placeholder="Search tutors…"/>
      </div>
      <div style={{ background:AC.card,borderRadius:14,border:`1px solid ${AC.border}`,overflow:'hidden' }}>
        <ATableHead cols={cols} template={template}/>
        {filtered.length===0
          ?<AEmpty icon="👨‍🏫" title="No tutors registered yet" desc="Tutor profiles will appear here once they apply"/>
          :filtered.map(t=>(
            <div key={t.id} style={{ display:'grid',gridTemplateColumns:template,padding:'13px 20px',borderBottom:`1px solid ${AC.border}`,alignItems:'center',gap:4 }}>
              <span style={{ fontSize:13,color:AC.text,fontFamily:AF.body,fontWeight:500 }}>{t.name}</span>
              <span style={{ fontSize:12,color:AC.textMuted,fontFamily:AF.body }}>{t.email}</span>
              <span style={{ fontSize:12,color:AC.textSub,fontFamily:AF.body }}>{t.university||'—'}</span>
              <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                {(t.subjects||[]).slice(0,2).map(s=><span key={s} style={{ fontSize:10,background:AC.infoDim,color:AC.info,padding:'2px 8px',borderRadius:20,fontFamily:AF.body }}>{s}</span>)}
                {(t.subjects||[]).length>2&&<span style={{ fontSize:10,color:AC.textMuted,fontFamily:AF.body }}>+{(t.subjects||[]).length-2}</span>}
              </div>
              <span style={{ fontSize:13,color:AC.accent,fontFamily:AF.mono }}>★ {t.rating||'—'}</span>
              <ABadge label={t.status||'active'} color={t.status==='suspended'?AC.danger:AC.success}/>
              <div style={{ display:'flex',gap:6 }}>
                <AActionBtn label={t.status==='suspended'?'Restore':'Suspend'} onClick={()=>suspend(t.id)}/>
                <AActionBtn label="Delete" danger onClick={()=>remove(t.id)}/>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AdminVerifications({ verifications, onVerify }: { verifications: Verification[]; onVerify: (id: number, action: string) => void }) {
  const pending = verifications.filter(v=>v.status==='pending');
  const reviewed = verifications.filter(v=>v.status!=='pending');
  const VerifCard = ({ v }: { v: Verification }) => (
    <div style={{ background:AC.cardHov,borderRadius:12,padding:20,border:`1px solid ${AC.border}`,marginBottom:12 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
        <div style={{ display:'flex',gap:12,alignItems:'center' }}>
          <div style={{ width:44,height:44,borderRadius:'50%',background:AC.infoDim,display:'flex',alignItems:'center',justifyContent:'center',color:AC.info,fontFamily:AF.mono,fontSize:13,fontWeight:700 }}>{v.avatar}</div>
          <div>
            <p style={{ margin:'0 0 2px',fontSize:15,fontWeight:600,color:AC.text,fontFamily:AF.body }}>{v.name}</p>
            <p style={{ margin:0,fontSize:12,color:AC.textMuted,fontFamily:AF.body }}>🎓 {v.university}</p>
          </div>
        </div>
        <ABadge label={v.status} color={v.status==='pending'?AC.warning:v.status==='approved'?AC.success:AC.danger}/>
      </div>
      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:12 }}>
        {(v.subjects||[]).map(s=><span key={s} style={{ background:AC.infoDim,color:AC.info,fontSize:11,padding:'3px 10px',borderRadius:20,fontFamily:AF.body }}>{s}</span>)}
      </div>
      <p style={{ fontSize:12,color:AC.textMuted,margin:'0 0 4px',fontFamily:AF.body }}>Rate: {v.rate} · Applied: {v.date}</p>
      {v.bio&&<p style={{ fontSize:12,color:AC.textSub,margin:'0 0 14px',fontFamily:AF.body,lineHeight:1.5 }}>{v.bio}</p>}
      {v.status==='pending'&&(
        <div style={{ display:'flex',gap:8,marginTop:8 }}>
          <button onClick={()=>onVerify(v.id,'approved')} style={{ padding:'8px 20px',borderRadius:8,border:'none',background:AC.successDim,color:AC.success,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:AF.body }}>✓ Approve</button>
          <button onClick={()=>onVerify(v.id,'rejected')} style={{ padding:'8px 20px',borderRadius:8,border:'none',background:AC.dangerDim,color:AC.danger,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:AF.body }}>✕ Reject</button>
          <button style={{ padding:'8px 20px',borderRadius:8,border:`1px solid ${AC.border}`,background:'none',color:AC.textMuted,fontSize:13,cursor:'pointer',fontFamily:AF.body }}>Request More Info</button>
        </div>
      )}
    </div>
  );
  return (
    <div>
      <ASectionHead title="Tutor Verification" sub="Review and approve tutor applications before they go live"/>
      <AGroupLabel label={`Pending (${pending.length})`}/>
      {pending.length===0
        ?<div style={{ background:AC.card,borderRadius:14,border:`1px solid ${AC.border}`,marginBottom:28 }}><AEmpty icon="✅" title="All caught up!" desc="No pending verifications right now"/></div>
        :<div style={{ marginBottom:28 }}>{pending.map(v=><VerifCard key={v.id} v={v}/>)}</div>}
      {reviewed.length>0&&<><AGroupLabel label={`Recently Reviewed (${reviewed.length})`}/>{reviewed.map(v=><VerifCard key={v.id} v={v}/>)}</>}
    </div>
  );
}

function AdminPayments({ payments }: { payments: Payment[] }) {
  const total = payments.reduce((s,p)=>s+(p.amount||0),0);
  const nowMonth = new Date().getMonth();
  const thisMonth = payments.filter(p=>p.month===nowMonth).reduce((s,p)=>s+(p.amount||0),0);
  const pending = payments.filter(p=>p.status==='pending').reduce((s,p)=>s+(p.amount||0),0);
  const refunded = payments.filter(p=>p.status==='refunded').reduce((s,p)=>s+(p.amount||0),0);
  const cols = ['Student','Plan','Amount','Date','Method','Status'];
  const template = '2fr 1.5fr 1fr 1.2fr 1.2fr 1fr';
  return (
    <div>
      <ASectionHead title="Payment Monitoring" sub="Track all transactions, subscriptions, and revenue"/>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:14,marginBottom:24 }}>
        <AStatCard icon="💰" label="Total Revenue" value={`P${total.toLocaleString()}`}     sub="All time"      color={AC.accent}  />
        <AStatCard icon="📅" label="This Month"    value={`P${thisMonth.toLocaleString()}`} sub="Current month" color={AC.success} />
        <AStatCard icon="⏳" label="Pending"       value={`P${pending.toLocaleString()}`}   sub="Processing"    color={AC.warning} />
        <AStatCard icon="↩️" label="Refunded"      value={`P${refunded.toLocaleString()}`}  sub="All time"      color={AC.danger}  />
      </div>
      <div style={{ background:AC.card,borderRadius:14,border:`1px solid ${AC.border}`,overflow:'hidden' }}>
        <div style={{ padding:'16px 20px',borderBottom:`1px solid ${AC.border}`,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <h3 style={{ fontFamily:AF.head,fontSize:16,color:AC.text,margin:0,fontWeight:700 }}>Transaction History</h3>
          <span style={{ fontSize:12,color:AC.textMuted,fontFamily:AF.body }}>{payments.length} records</span>
        </div>
        <ATableHead cols={cols} template={template}/>
        {payments.length===0
          ?<AEmpty icon="💳" title="No transactions yet" desc="Payment records will appear here as students subscribe"/>
          :payments.map(p=>(
            <div key={p.id} style={{ display:'grid',gridTemplateColumns:template,padding:'13px 20px',borderBottom:`1px solid ${AC.border}`,alignItems:'center' }}>
              <span style={{ fontSize:13,color:AC.text,fontFamily:AF.body }}>{p.student}</span>
              <span style={{ fontSize:12,color:AC.textSub,fontFamily:AF.body }}>{p.plan}</span>
              <span style={{ fontSize:13,color:AC.accent,fontFamily:AF.mono }}>P{p.amount}</span>
              <span style={{ fontSize:12,color:AC.textMuted,fontFamily:AF.mono }}>{p.date}</span>
              <span style={{ fontSize:12,color:AC.textSub,fontFamily:AF.body }}>{p.method||'Card'}</span>
              <ABadge label={p.status||'success'} color={p.status==='refunded'?AC.danger:p.status==='pending'?AC.warning:AC.success}/>
            </div>
          ))}
      </div>
    </div>
  );
}

function AdminRatings({ ratings, setRatings }: { ratings: Rating[]; setRatings: React.Dispatch<React.SetStateAction<Rating[]>> }) {
  const [filter,setFilter] = useState('all');
  const toggleHide = (id: number) => setRatings(p=>p.map(r=>r.id===id?{...r,hidden:!r.hidden}:r));
  const toggleFlag = (id: number) => setRatings(p=>p.map(r=>r.id===id?{...r,flagged:!r.flagged}:r));
  const deleteRev = (id: number) => { if(window.confirm('Delete this review?')) setRatings(p=>p.filter(r=>r.id!==id)); };
  const visible = ratings.filter(r=>filter==='all'?true:filter==='flagged'?r.flagged:filter==='hidden'?r.hidden:true);
  const avg = ratings.length?(ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1):'—';
  return (
    <div>
      <ASectionHead title="Ratings & Reviews" sub="Monitor and moderate all platform reviews"/>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:14,marginBottom:24 }}>
        <AStatCard icon="⭐" label="Avg. Rating"   value={avg}                                    sub="Platform-wide"  color={AC.warning} />
        <AStatCard icon="💬" label="Total Reviews" value={ratings.length}                         sub="All submitted"  color={AC.info}    />
        <AStatCard icon="🚩" label="Flagged"       value={ratings.filter(r=>r.flagged).length}    sub="Needs review"   color={AC.danger}  />
        <AStatCard icon="🙈" label="Hidden"        value={ratings.filter(r=>r.hidden).length}     sub="Admin-hidden"   color={AC.textSub} />
      </div>
      <div style={{ background:AC.card,borderRadius:14,border:`1px solid ${AC.border}`,overflow:'hidden' }}>
        <div style={{ padding:'16px 20px',borderBottom:`1px solid ${AC.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
          <h3 style={{ fontFamily:AF.head,fontSize:16,color:AC.text,margin:0,fontWeight:700 }}>All Reviews</h3>
          <div style={{ display:'flex',gap:6 }}>
            {['all','flagged','hidden'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:'6px 14px',borderRadius:20,border:'none',background:filter===f?AC.accentDim:'transparent',color:filter===f?AC.accent:AC.textMuted,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:AF.body,textTransform:'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>
        {visible.length===0
          ?<AEmpty icon="⭐" title="No reviews found" desc="Student and tutor reviews will appear here"/>
          :visible.map(r=>(
            <div key={r.id} style={{ padding:'16px 20px',borderBottom:`1px solid ${AC.border}`,opacity:r.hidden?0.55:1 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap' }}>
                    <span style={{ color:AC.accent,fontFamily:AF.mono,fontSize:13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    <span style={{ fontSize:12,color:AC.textMuted,fontFamily:AF.body }}>by {r.user} · {r.target} · {r.date}</span>
                    {r.flagged&&<ABadge label="Flagged" color={AC.danger}/>}
                    {r.hidden&&<ABadge label="Hidden" color={AC.textMuted}/>}
                  </div>
                  <p style={{ margin:0,fontSize:13,color:AC.textSub,fontFamily:AF.body,lineHeight:1.5 }}>{r.comment}</p>
                </div>
                <div style={{ display:'flex',gap:6,flexShrink:0 }}>
                  <AActionBtn label={r.flagged?'Unflag':'Flag'} onClick={()=>toggleFlag(r.id)}/>
                  <AActionBtn label={r.hidden?'Restore':'Hide'} onClick={()=>toggleHide(r.id)}/>
                  <AActionBtn label="Delete" danger onClick={()=>deleteRev(r.id)}/>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AdminMaintenance({ settings, onToggle, logs }: { settings: AdminSettings; onToggle: (key: keyof AdminSettings) => void; logs: Log[] }) {
  const [cacheMsg,setCacheMsg] = useState('');
  const [backupMsg,setBackupMsg] = useState('');
  const clearCache = () => { setCacheMsg('Clearing…'); setTimeout(()=>{ setCacheMsg('Cache cleared ✓'); setTimeout(()=>setCacheMsg(''),3000); },1200); };
  const doBackup = () => { setBackupMsg('Backing up…'); setTimeout(()=>{ setBackupMsg('Backup complete ✓'); setTimeout(()=>setBackupMsg(''),3000); },1800); };
  const toggleItems: { key: keyof AdminSettings; label: string; desc: string; danger?: boolean }[] = [
    { key:'registrationEnabled', label:'Student Registration', desc:'Allow new students to sign up'            },
    { key:'paymentsEnabled',     label:'Payment Processing',   desc:'Enable subscription payments'             },
    { key:'tutorMarketEnabled',  label:'Tutor Marketplace',    desc:'Students can browse & book tutors'        },
    { key:'emailNotifications',  label:'Email Notifications',  desc:'Send automated email alerts to users'     },
    { key:'autoApprove',         label:'Auto-Approve Tutors',  desc:'Skip manual verification — not recommended'},
    { key:'maintenanceMode',     label:'Maintenance Mode',     desc:'Redirect all users to maintenance notice', danger:true },
  ];
  return (
    <div>
      <ASectionHead title="System Maintenance" sub="Control platform features, run diagnostics, and manage system health"/>
      <div style={{ background:AC.card,borderRadius:14,border:`1px solid ${AC.border}`,marginBottom:20,overflow:'hidden' }}>
        <div style={{ padding:'16px 20px',borderBottom:`1px solid ${AC.border}` }}>
          <h3 style={{ fontFamily:AF.head,fontSize:16,color:AC.text,margin:0,fontWeight:700 }}>Feature Toggles</h3>
        </div>
        {toggleItems.map(item=>(
          <div key={item.key} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 20px',borderBottom:`1px solid ${AC.border}` }}>
            <div>
              <p style={{ margin:'0 0 2px',fontSize:14,fontWeight:600,color:item.danger&&settings[item.key]?AC.danger:AC.text,fontFamily:AF.body }}>{item.label}</p>
              <p style={{ margin:0,fontSize:12,color:AC.textMuted,fontFamily:AF.body }}>{item.desc}</p>
            </div>
            <AToggle active={settings[item.key] as boolean} onChange={()=>onToggle(item.key)} danger={item.danger}/>
          </div>
        ))}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20 }}>
        <div style={{ background:AC.card,borderRadius:14,padding:22,border:`1px solid ${AC.border}` }}>
          <h4 style={{ fontFamily:AF.head,fontSize:15,color:AC.text,margin:'0 0 14px',fontWeight:700 }}>Quick Actions</h4>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            <button onClick={clearCache} style={{ padding:'10px 16px',borderRadius:8,border:`1px solid ${AC.border}`,background:'none',color:AC.textSub,fontSize:13,cursor:'pointer',fontFamily:AF.body,textAlign:'left' }}>🗑️  Clear System Cache</button>
            <button onClick={doBackup}   style={{ padding:'10px 16px',borderRadius:8,border:`1px solid ${AC.border}`,background:'none',color:AC.textSub,fontSize:13,cursor:'pointer',fontFamily:AF.body,textAlign:'left' }}>💾  Backup Database</button>
            <button style={{ padding:'10px 16px',borderRadius:8,border:`1px solid ${AC.border}`,background:'none',color:AC.textSub,fontSize:13,cursor:'pointer',fontFamily:AF.body,textAlign:'left' }}>📊  Export Reports (CSV)</button>
            <button style={{ padding:'10px 16px',borderRadius:8,border:`1px solid ${AC.border}`,background:'none',color:AC.textSub,fontSize:13,cursor:'pointer',fontFamily:AF.body,textAlign:'left' }}>📧  Send Test Email</button>
          </div>
          {cacheMsg&&<p style={{ margin:'10px 0 0',fontSize:12,color:AC.success,fontFamily:AF.body }}>{cacheMsg}</p>}
          {backupMsg&&<p style={{ margin:'10px 0 0',fontSize:12,color:AC.success,fontFamily:AF.body }}>{backupMsg}</p>}
        </div>
        <div style={{ background:AC.card,borderRadius:14,padding:22,border:`1px solid ${AC.border}` }}>
          <h4 style={{ fontFamily:AF.head,fontSize:15,color:AC.text,margin:'0 0 14px',fontWeight:700 }}>Activity Log</h4>
          {logs.length===0?<AEmpty icon="📋" title="No logs yet" desc=""/>:logs.map(log=>(
            <div key={log.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`1px solid ${AC.border}` }}>
              <div>
                <p style={{ margin:'0 0 1px',fontSize:13,color:AC.text,fontFamily:AF.body }}>{log.action}</p>
                <p style={{ margin:0,fontSize:11,color:AC.textMuted,fontFamily:AF.body }}>{log.user} · {log.time}</p>
              </div>
              <span style={{ width:7,height:7,borderRadius:'50%',background:log.type==='success'?AC.success:log.type==='danger'?AC.danger:AC.info,flexShrink:0 }}/>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:AC.card,borderRadius:14,border:'1px solid rgba(239,68,68,0.3)',padding:22 }}>
        <h4 style={{ fontFamily:AF.head,fontSize:15,color:AC.danger,margin:'0 0 4px',fontWeight:700 }}>⚠️ Danger Zone</h4>
        <p style={{ fontSize:12,color:AC.textMuted,margin:'0 0 16px',fontFamily:AF.body }}>These actions are irreversible. Only proceed if you are absolutely certain.</p>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
          <button onClick={()=>window.confirm('Purge ALL reviews?')&&alert('Reviews purged.')} style={{ padding:'9px 18px',borderRadius:8,border:'1px solid rgba(239,68,68,0.35)',background:AC.dangerDim,color:AC.danger,fontSize:13,cursor:'pointer',fontFamily:AF.body }}>Purge All Reviews</button>
          <button onClick={()=>window.confirm('RESET the entire platform?')&&alert('Platform reset.')} style={{ padding:'9px 18px',borderRadius:8,border:'1px solid rgba(239,68,68,0.35)',background:AC.dangerDim,color:AC.danger,fontSize:13,cursor:'pointer',fontFamily:AF.body }}>Reset Platform</button>
        </div>
      </div>
    </div>
  );
}

// ── Admin shell (login + sidebar + content) ──────────────────────────────────
const ADMIN_NAV = [
  { id:'overview',      label:'Overview',      emoji:'◈' },
  { id:'students',      label:'Students',       emoji:'◉' },
  { id:'tutors',        label:'Tutors',         emoji:'◎' },
  { id:'verifications', label:'Verifications',  emoji:'◆' },
  { id:'payments',      label:'Payments',       emoji:'◇' },
  { id:'ratings',       label:'Ratings',        emoji:'◈' },
  { id:'maintenance',   label:'Maintenance',    emoji:'⊕' },
];

function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [screen,setScreen]      = useState('login');
  const [adminTab,setAdminTab]  = useState('overview');
  const [uInput,setUInput]      = useState('');
  const [pInput,setPInput]      = useState('');
  const [showPass,setShowPass]  = useState(false);
  const [loginErr,setLoginErr]  = useState('');

  const [adminStudents,      setAdminStudents]      = useState<AdminStudent[]>([]);
  const [adminTutors,        setAdminTutors]        = useState<AdminTutor[]>([]);
  const [adminVerifications, setAdminVerifications] = useState<Verification[]>([]);
  const [adminPayments]                             = useState<Payment[]>([]);
  const [adminRatings,       setAdminRatings]       = useState<Rating[]>([]);
  const [adminSettings,      setAdminSettings]      = useState<AdminSettings>({
    registrationEnabled:true, paymentsEnabled:true, tutorMarketEnabled:true,
    emailNotifications:true, autoApprove:false, maintenanceMode:false,
  });
  const adminLogs: Log[] = [
    { id:1,action:'Admin signed in',    user:'Mark',  time:'Just now',  type:'info'    },
    { id:2,action:'System initialised', user:'System',time:'1 min ago', type:'success' },
    { id:3,action:'Database connected', user:'System',time:'1 min ago', type:'success' },
  ];

  const handleLogin = () => {
    if(uInput.toLowerCase()===ADMIN_CREDS.username&&pInput===ADMIN_CREDS.password){
      setScreen('dashboard'); setLoginErr('');
    } else { setLoginErr('Invalid username or password. Please try again.'); }
  };

  const handleVerify = (id: number, action: string) => setAdminVerifications(p=>p.map(v=>v.id===id?{...v,status:action}:v));
  const handleToggle = (key: keyof AdminSettings) => setAdminSettings(p=>({...p,[key]:!p[key]}));
  const pendingCount = adminVerifications.filter(v=>v.status==='pending').length;

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if(screen==='login') return (
    <div style={{ minHeight:'100vh',background:AC.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden' }}>
      <div style={{ position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(240,165,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(240,165,0,0.04) 1px,transparent 1px)',backgroundSize:'44px 44px',pointerEvents:'none',zIndex:0 }}/>
      <div style={{ position:'fixed',top:'20%',left:'50%',transform:'translateX(-50%)',width:500,height:300,background:'radial-gradient(ellipse,rgba(240,165,0,0.07) 0%,transparent 70%)',pointerEvents:'none',zIndex:0 }}/>
      <div style={{ background:AC.card,border:`1px solid ${AC.borderMd}`,borderRadius:22,padding:'44px 40px',width:'100%',maxWidth:410,position:'relative',zIndex:1 }}>
        <div style={{ textAlign:'center',marginBottom:36 }}>
          <div style={{ width:60,height:60,borderRadius:18,background:AC.accentDim,border:`1.5px solid ${AC.accentBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 16px' }}>🛡️</div>
          <h1 style={{ fontFamily:AF.head,fontSize:24,color:AC.text,margin:'0 0 5px',fontWeight:800 }}>NoteFlow Admin</h1>
          <p style={{ color:AC.textMuted,fontSize:13,margin:0,fontFamily:AF.body }}>Restricted access · Authorised personnel only</p>
        </div>
        <div style={{ background:AC.accentDim,border:`1px solid ${AC.accentBdr}`,borderRadius:10,padding:'10px 14px',marginBottom:22 }}>
          <p style={{ color:AC.accent,fontSize:12,margin:0,fontFamily:AF.mono }}>Demo: mark / mark12345</p>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:600,color:AC.textSub,marginBottom:7,textTransform:'uppercase',letterSpacing:'0.07em',fontFamily:AF.body }}>Username</label>
            <input value={uInput} onChange={e=>setUInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="Enter username"
              style={{ width:'100%',padding:'12px 14px',background:AC.bg,border:`1px solid ${AC.border}`,borderRadius:10,color:AC.text,fontSize:14,fontFamily:AF.body,outline:'none',boxSizing:'border-box' as const }}/>
          </div>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:600,color:AC.textSub,marginBottom:7,textTransform:'uppercase',letterSpacing:'0.07em',fontFamily:AF.body }}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPass?'text':'password'} value={pInput} onChange={e=>setPInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="Enter password"
                style={{ width:'100%',padding:'12px 44px 12px 14px',background:AC.bg,border:`1px solid ${AC.border}`,borderRadius:10,color:AC.text,fontSize:14,fontFamily:AF.body,outline:'none',boxSizing:'border-box' as const }}/>
              <button onClick={()=>setShowPass((p:boolean)=>!p)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:AC.textMuted,fontSize:14,lineHeight:1 }}>{showPass?'🙈':'👁️'}</button>
            </div>
          </div>
          {loginErr&&(
            <div style={{ background:AC.dangerDim,border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,padding:'10px 14px' }}>
              <p style={{ color:AC.danger,fontSize:13,margin:0,fontFamily:AF.body }}>⚠️ {loginErr}</p>
            </div>
          )}
          <button onClick={handleLogin} style={{ background:`linear-gradient(135deg,${AC.accent},#D97706)`,color:'#0B0D1A',border:'none',borderRadius:12,padding:14,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:AF.body,marginTop:4 }}>
            Sign In to Admin Panel →
          </button>
          <button onClick={onExit} style={{ background:'transparent',color:AC.textMuted,border:'none',fontSize:13,cursor:'pointer',fontFamily:AF.body }}>← Back to NoteFlow</button>
        </div>
        <p style={{ textAlign:'center',marginTop:20,fontSize:12,color:AC.textMuted,fontFamily:AF.body,margin:'20px 0 0' }}>🔐 All activity is logged and monitored</p>
      </div>
    </div>
  );

  // ── DASHBOARD ────────────────────────────────────────────────────────────
  const renderAdminTab = () => {
    switch(adminTab){
      case 'overview':      return <AdminOverview students={adminStudents} tutors={adminTutors} payments={adminPayments} ratings={adminRatings} verifications={adminVerifications}/>;
      case 'students':      return <AdminStudents students={adminStudents} setStudents={setAdminStudents}/>;
      case 'tutors':        return <AdminTutors tutors={adminTutors} setTutors={setAdminTutors}/>;
      case 'verifications': return <AdminVerifications verifications={adminVerifications} onVerify={handleVerify}/>;
      case 'payments':      return <AdminPayments payments={adminPayments}/>;
      case 'ratings':       return <AdminRatings ratings={adminRatings} setRatings={setAdminRatings}/>;
      case 'maintenance':   return <AdminMaintenance settings={adminSettings} onToggle={handleToggle} logs={adminLogs}/>;
      default: return null;
    }
  };

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:AC.bg,fontFamily:AF.body }}>
      {adminSettings.maintenanceMode&&(
        <div style={{ position:'fixed',top:0,left:0,right:0,background:AC.danger,zIndex:9999,padding:'8px 20px',textAlign:'center' }}>
          <span style={{ color:'#fff',fontSize:13,fontWeight:600,fontFamily:AF.body }}>⚠️ Maintenance Mode is ON — users see a maintenance notice</span>
        </div>
      )}
      {/* Sidebar */}
      <aside style={{ width:230,background:AC.sidebar,borderRight:`1px solid ${AC.border}`,padding:'22px 14px',display:'flex',flexDirection:'column',position:'sticky',top:adminSettings.maintenanceMode?38:0,height:'100vh',flexShrink:0,boxSizing:'border-box' }}>
        <div style={{ padding:'0 8px 24px',borderBottom:`1px solid ${AC.border}`,marginBottom:16 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:10,background:AC.accentDim,border:`1px solid ${AC.accentBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>📚</div>
            <div>
              <p style={{ margin:0,fontFamily:AF.head,fontSize:15,color:AC.text,fontWeight:800 }}>NoteFlow</p>
              <p style={{ margin:0,fontSize:10,color:AC.accent,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:AF.body }}>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav style={{ flex:1,display:'flex',flexDirection:'column',gap:3 }}>
          {ADMIN_NAV.map(item=>{
            const isActive = adminTab===item.id;
            const badge = item.id==='verifications'?pendingCount:item.id==='students'?adminStudents.length:item.id==='tutors'?adminTutors.length:0;
            return(
              <button key={item.id} onClick={()=>setAdminTab(item.id)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderRadius:10,border:'none',cursor:'pointer',background:isActive?AC.accentDim:'transparent',color:isActive?AC.accent:AC.textSub,fontSize:14,fontFamily:AF.body,fontWeight:isActive?600:400,transition:'all 0.15s',textAlign:'left',width:'100%' }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:11,opacity:0.5 }}>{item.emoji}</span>{item.label}
                </div>
                {badge>0&&<span style={{ background:item.id==='verifications'?AC.danger:AC.accentDim,color:item.id==='verifications'?'#fff':AC.accent,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,fontFamily:AF.mono }}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ borderTop:`1px solid ${AC.border}`,paddingTop:14,display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:'50%',background:AC.accentDim,border:`1.5px solid ${AC.accentBdr}`,display:'flex',alignItems:'center',justifyContent:'center',color:AC.accent,fontSize:13,fontWeight:700,fontFamily:AF.mono,flexShrink:0 }}>MK</div>
          <div style={{ flex:1,overflow:'hidden' }}>
            <p style={{ margin:0,fontSize:13,fontWeight:600,color:AC.text,fontFamily:AF.body }}>Mark</p>
            <p style={{ margin:0,fontSize:11,color:AC.textMuted,fontFamily:AF.body }}>Super Admin</p>
          </div>
          <button onClick={()=>{ setScreen('login'); setUInput(''); setPInput(''); }} title="Sign out" style={{ background:'none',border:'none',cursor:'pointer',color:AC.textMuted,fontSize:16,padding:4,lineHeight:1 }}>⎋</button>
        </div>
        <button onClick={onExit} style={{ marginTop:10,background:'none',border:`1px solid ${AC.border}`,borderRadius:8,padding:'8px 12px',color:AC.textMuted,fontSize:12,cursor:'pointer',fontFamily:AF.body,textAlign:'left' }}>← Back to NoteFlow</button>
      </aside>
      {/* Main */}
      <main style={{ flex:1,overflowY:'auto',padding:'36px 36px 60px',marginTop:adminSettings.maintenanceMode?38:0 }}>
        {renderAdminTab()}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function NoteFlow() {
  const [docs,setDocs]               = useState<Doc[]>(initialDocs);
  const [tutors,setTutors]           = useState<Tutor[]>(initialTutors);
  const [search,setSearch]           = useState("");
  const [activePage,setActivePage]   = useState<NavPage>("explore");
  const [activeUni,setActiveUni]     = useState("All Universities");
  const [activeType,setActiveType]   = useState("All Types");
  const [selectedDoc,setSelectedDoc] = useState<Doc | null>(null);
  const [user,setUser]               = useState<UserObj | null>(null);
  const [showSignIn,setShowSignIn]   = useState(false);

  if(activePage==="admin"){
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne:wght@700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
        <AdminDashboard onExit={()=>setActivePage("explore")}/>
      </>
    );
  }

  const allUnis  = ["All Universities",...universities.map(u=>u.short)];
  const docTypes = ["All Types","Notes","Exam","Summary","Textbook"];

  const handleDocReview = (docId: number, rating: number, comment: string) => {
    setDocs(prev=>prev.map(d=>d.id!==docId?d:{
      ...d,
      reviews:[...d.reviews,{ id:d.reviews.length+1,user:user?.name||"Anonymous",avatar:user?.avatar||"AN",rating,comment,date:new Date().toLocaleDateString("en-GB",{month:"short",year:"numeric"}) }],
      rating:parseFloat(((d.reviews.reduce((a,r)=>a+r.rating,0)+rating)/(d.reviews.length+1)).toFixed(1))
    }));
  };

  const handleTutorReview = (tutorId: number, rating: number, comment: string) => {
    setTutors(prev=>prev.map(t=>t.id!==tutorId?t:{
      ...t,
      reviews:[...t.reviews,{ id:t.reviews.length+1,user:user?.name||"Anonymous",avatar:user?.avatar||"AN",rating,comment,date:new Date().toLocaleDateString("en-GB",{month:"short",year:"numeric"}) }],
      rating:parseFloat(((t.reviews.reduce((a,r)=>a+r.rating,0)+rating)/(t.reviews.length+1)).toFixed(1)),
      reviewCount:t.reviewCount+1
    }));
  };

  const filtered = docs.filter(doc=>{
    const q = search.toLowerCase();
    const matchSearch = !q||doc.title.toLowerCase().includes(q)||doc.subject.toLowerCase().includes(q)||doc.university.toLowerCase().includes(q)||doc.preview.toLowerCase().includes(q);
    const matchUni = activeUni==="All Universities"||universities.find(u=>u.short===activeUni)?.name===doc.university;
    const matchType = activeType==="All Types"||doc.type===activeType;
    return matchSearch&&matchUni&&matchType;
  });

  const navItems = [
    { label:"Explore",      page:"explore"       as NavPage },
    { label:"Universities", page:"universities"  as NavPage },
    { label:"Courses",      page:"courses"       as NavPage },
    { label:"Tutors",       page:"tutors"        as NavPage },
    { label:"Upload",       page:"upload"        as NavPage },
    { label:"💎 Premium",   page:"pricing"       as NavPage },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",background:"#F8FAFF",minHeight:"100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {showSignIn&&<SignInModal onSignIn={u=>{ setUser(u); setShowSignIn(false); }} onClose={()=>setShowSignIn(false)}/>}
      {selectedDoc&&<DocViewer doc={docs.find(d=>d.id===selectedDoc.id)||selectedDoc} allDocs={docs} user={user} onClose={()=>setSelectedDoc(null)} onUpgrade={()=>{ setSelectedDoc(null); setActivePage("pricing"); }} onReview={handleDocReview}/>}

      {/* NAV */}
      <nav style={{ background:"#fff",borderBottom:"1px solid #E8EDF5",padding:"0 32px",height:"64px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px",cursor:"pointer" }} onClick={()=>setActivePage("explore")}>
          <div style={{ width:34,height:34,borderRadius:"10px",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px" }}>📚</div>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:800,background:"linear-gradient(135deg,#3B5BDB,#6366F1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>NoteFlow</span>
        </div>
        <div style={{ display:"flex",gap:"20px",alignItems:"center" }}>
          {navItems.map(item=>(
            <span key={item.page} onClick={()=>setActivePage(item.page)} style={{ color:activePage===item.page?"#3B5BDB":"#475569",fontSize:"14px",fontWeight:activePage===item.page?700:500,cursor:"pointer",borderBottom:activePage===item.page?"2px solid #3B5BDB":"2px solid transparent",paddingBottom:"4px" }}>{item.label}</span>
          ))}
          {user?(
            <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
              {user.plan==="premium"&&<span style={{ background:"#FFF8E1",color:"#B45309",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px" }}>💎</span>}
              <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer" }}>{user.avatar}</div>
              <span onClick={()=>setUser(null)} style={{ color:"#94A3B8",fontSize:"13px",cursor:"pointer" }}>Sign out</span>
            </div>
          ):(
            <button onClick={()=>setShowSignIn(true)} style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"#fff",border:"none",borderRadius:"10px",padding:"9px 20px",fontSize:"14px",fontWeight:600,cursor:"pointer" }}>Sign In</button>
          )}
          <span onClick={()=>setActivePage("admin")} title="Admin Panel" style={{ color:"#94A3B8",fontSize:"12px",cursor:"pointer",padding:"4px 8px",borderRadius:"6px",border:"1px solid #E2E8F0",fontFamily:"'DM Sans',sans-serif" }}>🛡️ Admin</span>
        </div>
      </nav>

      {/* PAGES */}
      {activePage==="tutors"       && <TutorsPage user={user} onSignIn={()=>setShowSignIn(true)} tutors={tutors} onReview={handleTutorReview}/>}
      {activePage==="upload"       && <UploadPage user={user} onSignIn={()=>setShowSignIn(true)}/>}
      {activePage==="pricing"      && <PricingPage user={user} onSubscribe={()=>{ if(user) setUser({...user,plan:"premium"}); setActivePage("explore"); }}/>}

      {activePage==="universities"&&(
        <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"40px 24px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"32px",color:"#0F172A",marginBottom:"32px" }}>Universities & Colleges in Botswana</h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"20px" }}>
            {universities.map(uni=>(
              <div key={uni.name} onClick={()=>{ setActiveUni(uni.short); setActivePage("explore"); }} style={{ background:"#fff",borderRadius:"16px",padding:"28px",border:"1.5px solid #E8EDF5",cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor="#3B5BDB"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor="#E8EDF5"; (e.currentTarget as HTMLDivElement).style.transform="none"; }}>
                <div style={{ fontSize:"36px",marginBottom:"12px" }}>{uni.emoji}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"18px",color:"#0F172A",margin:"0 0 4px" }}>{uni.name}</h3>
                <p style={{ color:"#64748B",fontSize:"13px",margin:"0 0 16px",fontFamily:"'DM Sans',sans-serif" }}>📍 {uni.location}</p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:"6px" }}>
                  {uni.courses.slice(0,3).map(c=><span key={c} style={{ background:"#EAF3FF",color:"#2563EB",fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif" }}>{c}</span>)}
                  {uni.courses.length>3&&<span style={{ background:"#F1F5F9",color:"#64748B",fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"20px",fontFamily:"'DM Sans',sans-serif" }}>+{uni.courses.length-3} more</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePage==="courses"&&(
        <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"40px 24px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"32px",color:"#0F172A",marginBottom:"32px" }}>Courses & Modules</h2>
          <div style={{ display:"flex",flexDirection:"column",gap:"20px" }}>
            {universities.map(uni=>(
              <div key={uni.name} style={{ background:"#fff",borderRadius:"16px",padding:"28px",border:"1.5px solid #E8EDF5" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px" }}>
                  <span style={{ fontSize:"28px" }}>{uni.emoji}</span>
                  <div><h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"18px",color:"#0F172A",margin:0 }}>{uni.name}</h3><p style={{ color:"#64748B",fontSize:"12px",margin:0,fontFamily:"'DM Sans',sans-serif" }}>📍 {uni.location}</p></div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"10px" }}>
                  {uni.courses.map(course=>{ const count=docs.filter(d=>d.university===uni.name&&d.course===course).length; return<div key={course} style={{ background:"#F8FAFF",borderRadius:"10px",padding:"12px 16px",border:"1px solid #E8EDF5" }}><p style={{ margin:"0 0 4px",fontWeight:600,fontSize:"13px",color:"#0F172A",fontFamily:"'DM Sans',sans-serif" }}>{course}</p><p style={{ margin:0,fontSize:"12px",color:"#64748B",fontFamily:"'DM Sans',sans-serif" }}>{count} document{count!==1?"s":""}</p></div>; })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePage==="explore"&&(
        <>
          <div style={{ background:"linear-gradient(135deg,#1E3A8A 0%,#3B5BDB 50%,#6366F1 100%)",padding:"72px 32px 60px",textAlign:"center",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-60,right:-60,width:320,height:320,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }}/>
            <div style={{ position:"relative",zIndex:1 }}>
              <div style={{ display:"inline-block",background:"rgba(255,255,255,0.15)",borderRadius:"20px",padding:"6px 16px",marginBottom:"20px",color:"rgba(255,255,255,0.9)",fontSize:"13px",fontWeight:600 }}>🇧🇼 BUILT FOR BOTSWANA STUDENTS</div>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(36px,5vw,60px)",fontWeight:800,color:"#FFFFFF",margin:"0 0 16px",lineHeight:1.15 }}>Study Smarter,<br/><span style={{ color:"#A5B4FC" }}>Not Harder.</span></h1>
              <p style={{ color:"rgba(255,255,255,0.75)",fontSize:"18px",maxWidth:"520px",margin:"0 auto 36px",lineHeight:1.6 }}>Notes, textbooks, past papers and tutors from UB, BAC, BIUST, Botho and more.</p>
              <div style={{ maxWidth:"580px",margin:"0 auto",background:"white",borderRadius:"14px",display:"flex",alignItems:"center",padding:"6px 6px 6px 20px",boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
                <span style={{ fontSize:"18px",marginRight:"10px" }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes, modules, universities..." style={{ flex:1,border:"none",outline:"none",fontSize:"15px",color:"#0F172A",background:"transparent",fontFamily:"'DM Sans',sans-serif" }}/>
                <button style={{ background:"linear-gradient(135deg,#3B5BDB,#6366F1)",color:"white",border:"none",borderRadius:"10px",padding:"12px 24px",fontSize:"14px",fontWeight:600,cursor:"pointer" }}>Search</button>
              </div>
              <div style={{ display:"flex",justifyContent:"center",gap:"40px",marginTop:"40px",flexWrap:"wrap" }}>
                {([["500+","Documents"],["7+","Institutions"],["6","Tutors"]] as [string,string][]).map(([num,label])=>(
                  <div key={label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"26px",fontWeight:800,color:"#FFFFFF",fontFamily:"'Playfair Display',serif" }}>{num}</div>
                    <div style={{ fontSize:"13px",color:"rgba(255,255,255,0.65)",marginTop:"2px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"40px 24px" }}>
            <div style={{ display:"flex",gap:"16px",marginBottom:"20px",flexWrap:"wrap",justifyContent:"space-between" }}>
              <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                {allUnis.map(uni=><button key={uni} onClick={()=>setActiveUni(uni)} style={{ padding:"8px 16px",borderRadius:"20px",fontSize:"13px",fontWeight:600,border:activeUni===uni?"none":"1.5px solid #E2E8F0",background:activeUni===uni?"linear-gradient(135deg,#3B5BDB,#6366F1)":"#fff",color:activeUni===uni?"#fff":"#64748B",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>{uni}</button>)}
              </div>
              <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                {docTypes.map(type=><button key={type} onClick={()=>setActiveType(type)} style={{ padding:"8px 16px",borderRadius:"20px",fontSize:"13px",fontWeight:600,border:activeType===type?"none":"1.5px solid #E2E8F0",background:activeType===type?"#0F172A":"#fff",color:activeType===type?"#fff":"#64748B",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>{type}</button>)}
              </div>
            </div>
            <div style={{ marginBottom:"20px",color:"#64748B",fontSize:"14px",fontFamily:"'DM Sans',sans-serif" }}>
              Showing <strong style={{ color:"#0F172A" }}>{filtered.length}</strong> documents{search&&<> for &quot;<strong style={{ color:"#3B5BDB" }}>{search}</strong>&quot;</>}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"20px" }}>
              {filtered.length>0?filtered.map(doc=><DocCard key={doc.id} doc={doc} onOpen={setSelectedDoc}/>):(
                <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"80px 0" }}><div style={{ fontSize:"48px",marginBottom:"16px" }}>🔍</div><p style={{ fontSize:"18px",fontWeight:600,color:"#475569" }}>No documents found</p></div>
              )}
            </div>
          </div>

          <div style={{ background:"linear-gradient(135deg,#0F172A,#1E3A8A)",margin:"20px 24px 0",borderRadius:"24px",padding:"56px 40px",textAlign:"center",maxWidth:"1152px",marginLeft:"auto",marginRight:"auto" }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"36px",color:"#fff",margin:"0 0 12px" }}>Unlock All Study Materials</h2>
            <p style={{ color:"rgba(255,255,255,0.65)",fontSize:"16px",maxWidth:"480px",margin:"0 auto 28px",lineHeight:1.6 }}>Get full access to all notes, textbooks, past papers and connect with top tutors.</p>
            <button onClick={()=>setActivePage("pricing")} style={{ background:"linear-gradient(135deg,#6366F1,#3B5BDB)",color:"#fff",border:"none",borderRadius:"12px",padding:"14px 32px",fontSize:"15px",fontWeight:700,cursor:"pointer",marginRight:"12px" }}>View Plans →</button>
            <button onClick={()=>setActivePage("tutors")} style={{ background:"transparent",color:"rgba(255,255,255,0.75)",border:"1.5px solid rgba(255,255,255,0.25)",borderRadius:"12px",padding:"14px 32px",fontSize:"15px",fontWeight:600,cursor:"pointer" }}>Find a Tutor</button>
          </div>
        </>
      )}

      <footer style={{ borderTop:"1px solid #E8EDF5",marginTop:"60px",padding:"32px",textAlign:"center",color:"#94A3B8",fontSize:"13px",fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:"8px",marginBottom:"12px" }}>
          <div style={{ width:26,height:26,borderRadius:"8px",background:"linear-gradient(135deg,#3B5BDB,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px" }}>📚</div>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:700,color:"#0F172A" }}>NoteFlow</span>
        </div>
        <p style={{ margin:0 }}>© 2024 NoteFlow · Built for Botswana students 🇧🇼</p>
      </footer>
    </div>
  );
}