import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'NoteFlow <onboarding@resend.dev>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...d } = body;
    switch (type) {
      case 'booking_confirmation':
        await resend.emails.send({ from: FROM, to: d.studentEmail||'noreply@noteflow.bw', subject: `Booking Confirmed — ${d.tutorName}`, html: `<p>Hi ${d.studentName}, your session with ${d.tutorName} on ${d.date} at ${d.time} for module ${d.module} (P${d.amount}) is confirmed.</p><p>NoteFlow · Built for Botswana Students</p>` });
        break;
      case 'booking_request':
        await resend.emails.send({ from: FROM, to: d.tutorEmail||'noreply@noteflow.bw', subject: `New Booking Request — ${d.studentName}`, html: `<p>Hi ${d.tutorName}, ${d.studentName} requested a session for ${d.module} on ${d.date} at ${d.time}. Log in to accept or decline.</p><p>NoteFlow · Built for Botswana Students</p>` });
        break;
      case 'tutor_verification':
        await resend.emails.send({ from: FROM, to: d.tutorEmail||'noreply@noteflow.bw', subject: d.approved ? 'Your NoteFlow Account is Approved!' : 'NoteFlow Application Update', html: `<p>Hi ${d.tutorName}, your tutor account has been ${d.approved ? 'approved — you can now receive bookings!' : 'rejected — please update your profile and contact admin.'}.</p><p>NoteFlow · Built for Botswana Students</p>` });
        break;
      case 'new_message':
        await resend.emails.send({ from: FROM, to: d.receiverEmail||'noreply@noteflow.bw', subject: `New message from ${d.senderName}`, html: `<p>Hi ${d.receiverName}, you have a new message from ${d.senderName}: "${String(d.preview||'').slice(0,120)}". Log in to reply.</p><p>NoteFlow · Built for Botswana Students</p>` });
        break;
      case 'welcome':
        await resend.emails.send({ from: FROM, to: d.email, subject: `Welcome to NoteFlow, ${d.name}!`, html: `<p>Welcome ${d.name}! Your ${d.role} account on NoteFlow has been created. ${d.role==='tutor'?'Your profile is under review.':'You can now browse tutors and study materials.'}</p><p>NoteFlow · Built for Botswana Students</p>` });
        break;
      case 'referral_reward':
        await resend.emails.send({ from: FROM, to: d.email||'noreply@noteflow.bw', subject: 'You earned 7 free days of Premium!', html: `<p>A friend joined NoteFlow using your referral link. You have earned 7 free days of Premium access!</p><p>NoteFlow · Built for Botswana Students</p>` });
        break;
      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}