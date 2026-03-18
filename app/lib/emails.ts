import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'NoteFlow <onboarding@resend.dev>';

export async function sendBookingConfirmation({
  studentEmail, studentName, tutorName, module, date, time, amount,
}: { studentEmail: string; studentName: string; tutorName: string; module: string; date: string; time: string; amount: number; }) {
  await resend.emails.send({
    from: FROM, to: studentEmail,
    subject: `Booking Confirmed — ${tutorName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8faff;border-radius:16px">
        <div style="background:linear-gradient(135deg,#1E3A8A,#3B82F6);padding:24px;border-radius:12px;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">NoteFlow</h1>
          <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:14px">Tutoring Session Confirmed</p>
        </div>
        <h2 style="color:#0F172A;margin:0 0 16px">Hi ${studentName},</h2>
        <p style="color:#475569;line-height:1.6">Your session with <strong>${tutorName}</strong> has been confirmed.</p>
        <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Module</td><td style="padding:8px 0;font-weight:600;color:#0F172A;font-size:14px">${module}</td></tr>
            <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Date</td><td style="padding:8px 0;font-weight:600;color:#0F172A;font-size:14px">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Time</td><td style="padding:8px 0;font-weight:600;color:#0F172A;font-size:14px">${time}</td></tr>
            <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Amount</td><td style="padding:8px 0;font-weight:700;color:#1E3A8A;font-size:16px">P${amount}</td></tr>
          </table>
        </div>
        <p style="color:#64748B;font-size:13px">Log in to NoteFlow to message your tutor or manage your booking.</p>
        <p style="color:#94A3B8;font-size:12px;margin-top:32px">NoteFlow · Built for Botswana Students</p>
      </div>
    `,
  });
}

export async function sendBookingRequestToTutor({
  tutorEmail, tutorName, studentName, module, date, time, amount, note,
}: { tutorEmail: string; tutorName: string; studentName: string; module: string; date: string; time: string; amount: number; note?: string; }) {
  await resend.emails.send({
    from: FROM, to: tutorEmail,
    subject: `New Booking Request — ${studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0D0F1A;border-radius:16px">
        <div style="background:linear-gradient(135deg,#F4A228,#E07B00);padding:24px;border-radius:12px;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">NoteFlow</h1>
          <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:14px">You have a new session request</p>
        </div>
        <h2 style="color:#F0F2FF;margin:0 0 16px">Hi ${tutorName},</h2>
        <p style="color:#8892B0;line-height:1.6"><strong style="color:#F0F2FF">${studentName}</strong> has requested a tutoring session with you.</p>
        <div style="background:#13162A;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#8892B0;font-size:14px">Module</td><td style="padding:8px 0;font-weight:600;color:#F0F2FF;font-size:14px">${module}</td></tr>
            <tr><td style="padding:8px 0;color:#8892B0;font-size:14px">Date</td><td style="padding:8px 0;font-weight:600;color:#F0F2FF;font-size:14px">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#8892B0;font-size:14px">Time</td><td style="padding:8px 0;font-weight:600;color:#F0F2FF;font-size:14px">${time}</td></tr>
            <tr><td style="padding:8px 0;color:#8892B0;font-size:14px">Rate</td><td style="padding:8px 0;font-weight:700;color:#F4A228;font-size:16px">P${amount}</td></tr>
            ${note ? `<tr><td style="padding:8px 0;color:#8892B0;font-size:14px;vertical-align:top">Note</td><td style="padding:8px 0;color:#F0F2FF;font-size:14px">${note}</td></tr>` : ''}
          </table>
        </div>
        <p style="color:#8892B0;font-size:13px">Log in to NoteFlow to accept or decline this request.</p>
        <p style="color:#4A5568;font-size:12px;margin-top:32px">NoteFlow · Built for Botswana Students</p>
      </div>
    `,
  });
}

export async function sendTutorVerificationResult({
  tutorEmail, tutorName, approved,
}: { tutorEmail: string; tutorName: string; approved: boolean; }) {
  await resend.emails.send({
    from: FROM, to: tutorEmail,
    subject: approved ? 'Your NoteFlow Tutor Account is Approved!' : 'NoteFlow Tutor Application Update',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8faff;border-radius:16px">
        <div style="background:linear-gradient(135deg,#1E3A8A,#3B82F6);padding:24px;border-radius:12px;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">NoteFlow</h1>
        </div>
        <h2 style="color:#0F172A;margin:0 0 16px">Hi ${tutorName},</h2>
        ${approved
          ? `<div style="background:#D1FAE5;border-radius:12px;padding:20px;margin-bottom:20px">
               <p style="color:#065F46;font-weight:700;margin:0 0 8px;font-size:16px">Congratulations! Your account has been approved.</p>
               <p style="color:#047857;margin:0;font-size:14px">You can now receive bookings from students on NoteFlow. Log in and set up your profile to get started.</p>
             </div>`
          : `<div style="background:#FEE2E2;border-radius:12px;padding:20px;margin-bottom:20px">
               <p style="color:#991B1B;font-weight:700;margin:0 0 8px;font-size:16px">Your application needs more information.</p>
               <p style="color:#DC2626;margin:0;font-size:14px">Please log in and update your profile with complete qualifications and bio, then contact admin for re-review.</p>
             </div>`
        }
        <p style="color:#94A3B8;font-size:12px;margin-top:32px">NoteFlow · Built for Botswana Students</p>
      </div>
    `,
  });
}

export async function sendNewMessageNotification({
  receiverEmail, receiverName, senderName, preview,
}: { receiverEmail: string; receiverName: string; senderName: string; preview: string; }) {
  await resend.emails.send({
    from: FROM, to: receiverEmail,
    subject: `New message from ${senderName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8faff;border-radius:16px">
        <div style="background:linear-gradient(135deg,#1E3A8A,#3B82F6);padding:24px;border-radius:12px;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">NoteFlow</h1>
        </div>
        <h2 style="color:#0F172A;margin:0 0 8px">Hi ${receiverName},</h2>
        <p style="color:#475569">You have a new message from <strong>${senderName}</strong>:</p>
        <div style="background:#EFF6FF;border-left:4px solid #3B82F6;border-radius:0 12px 12px 0;padding:16px 20px;margin:16px 0">
          <p style="color:#1E3A8A;margin:0;font-style:italic">"${preview.slice(0, 120)}${preview.length > 120 ? '...' : ''}"</p>
        </div>
        <p style="color:#64748B;font-size:13px">Log in to NoteFlow to reply.</p>
        <p style="color:#94A3B8;font-size:12px;margin-top:32px">NoteFlow · Built for Botswana Students</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({
  email, name, role,
}: { email: string; name: string; role: string; }) {
  await resend.emails.send({
    from: FROM, to: email,
    subject: `Welcome to NoteFlow, ${name}!`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8faff;border-radius:16px">
        <div style="background:linear-gradient(135deg,#0F172A,#1E3A8A,#3B82F6);padding:32px 24px;border-radius:12px;margin-bottom:24px;text-align:center">
          <h1 style="color:#fff;margin:0 0 8px;font-size:28px">NoteFlow</h1>
          <p style="color:rgba(255,255,255,0.7);margin:0;font-size:15px">Botswana's Student Resource Platform</p>
        </div>
        <h2 style="color:#0F172A;margin:0 0 16px">Welcome, ${name}!</h2>
        <p style="color:#475569;line-height:1.6">
          Your ${role} account has been created successfully. 
          ${role === 'student' ? "You can now browse tutors, book sessions and access study materials." : ""}
          ${role === 'tutor' ? "Your account is under review. We'll notify you once approved by our admin team." : ""}
        </p>
        <div style="background:#EFF6FF;border-radius:12px;padding:20px;margin:20px 0">
          <p style="color:#1E3A8A;font-weight:600;margin:0 0 8px">What's next?</p>
          ${role === 'student'
            ? `<ul style="color:#3B82F6;margin:0;padding-left:20px;line-height:2">
                 <li>Browse available tutors</li>
                 <li>Book your first session</li>
                 <li>Access free study materials</li>
               </ul>`
            : `<ul style="color:#3B82F6;margin:0;padding-left:20px;line-height:2">
                 <li>Complete your profile</li>
                 <li>Wait for admin verification</li>
                 <li>Start receiving bookings</li>
               </ul>`
          }
        </div>
        <p style="color:#94A3B8;font-size:12px;margin-top:32px">NoteFlow · Built for Botswana Students</p>
      </div>
    `,
  });
}

export async function sendReferralReward({
  email, name, referredName,
}: { email: string; name: string; referredName: string; }) {
  await resend.emails.send({
    from: FROM, to: email,
    subject: 'You earned a free week of Premium!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8faff;border-radius:16px">
        <div style="background:linear-gradient(135deg,#1E3A8A,#3B82F6);padding:24px;border-radius:12px;margin-bottom:24px">
          <h1 style="color:#fff;margin:0;font-size:22px">NoteFlow</h1>
        </div>
        <h2 style="color:#0F172A">You earned a reward!</h2>
        <p style="color:#475569;line-height:1.6"><strong>${referredName}</strong> joined NoteFlow using your referral link. You've earned <strong>7 free days of Premium</strong> access!</p>
        <div style="background:#D1FAE5;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
          <p style="color:#065F46;font-size:32px;font-weight:800;margin:0">+7 Days</p>
          <p style="color:#047857;margin:4px 0 0">Premium Access Added</p>
        </div>
        <p style="color:#94A3B8;font-size:12px;margin-top:32px">NoteFlow · Built for Botswana Students</p>
      </div>
    `,
  });
}