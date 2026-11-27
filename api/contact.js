// Vercel serverless function: emails Contact Us messages from the website.
// Sent through SMTP (Namecheap Private Email) as admin@equilibria.net; replies go to the visitor.
// Required Vercel environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.
import nodemailer from 'nodemailer';

const SENDER = {name: 'Equilibria Website', address: 'admin@equilibria.net'};
/** Every contact form message is delivered to this inbox. */
const CONTACT_INBOX = 'admin@equilibria.net';

const LIMITS = {name: 100, email: 254, subject: 200, messageMin: 10, messageMax: 5000};
const MIN_FILL_MS = 2500; // humans take longer than this to fill the form
const MAX_PER_HOUR = 5; // per visitor IP, per running instance (best effort; no database)
const recent = new Map();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const text = v => String(v ?? '').trim();
const escapeHtml = s => s.replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

let transport;
function smtp() {
  const port = Number(process.env.SMTP_PORT || 465);
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = SSL from the start; 587 = upgrade with STARTTLS
    auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD},
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
  });
  return transport;
}

function tooManyRecent(ip) {
  if (!ip) return false;
  const hourAgo = Date.now() - 60 * 60_000;
  const times = (recent.get(ip) || []).filter(t => t > hourAgo);
  times.push(Date.now());
  recent.set(ip, times);
  return times.length > MAX_PER_HOUR;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed.'});
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const values = {
    name: text(body.name),
    email: text(body.email).toLowerCase(),
    subject: text(body.subject),
    message: text(body.message),
  };

  // Spam traps: a hidden field people never see, and a form submitted faster than anyone could type it.
  // Bots get the normal "sent" answer so they don't learn anything.
  const startedAt = Number(body.startedAt || 0);
  if (text(body.website) || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) return res.status(200).json({ok: true});

  const fieldErrors = {};
  if (!values.name) fieldErrors.name = 'Enter your name.';
  else if (values.name.length > LIMITS.name) fieldErrors.name = `Use at most ${LIMITS.name} characters.`;
  if (!EMAIL_RE.test(values.email) || values.email.length > LIMITS.email) fieldErrors.email = 'Enter a valid email address.';
  if (values.subject.length > LIMITS.subject) fieldErrors.subject = `Use at most ${LIMITS.subject} characters.`;
  if (values.message.length < LIMITS.messageMin) fieldErrors.message = `Write at least ${LIMITS.messageMin} characters.`;
  else if (values.message.length > LIMITS.messageMax) fieldErrors.message = `Use at most ${LIMITS.messageMax} characters.`;
  if (Object.keys(fieldErrors).length) return res.status(400).json({error: 'Please check the highlighted fields.', fieldErrors});

  const ip = text(req.headers['x-forwarded-for']).split(',')[0].trim() || text(req.headers['x-real-ip']);
  if (tooManyRecent(ip)) return res.status(429).json({error: "You've sent several messages in the last hour. Please try again later."});

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('[contact] SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)');
    return res.status(503).json({error: "Sorry, we couldn't send your message right now. Please try again later."});
  }

  const rows = [['Name', values.name], ['Email', values.email], ['Subject', values.subject || '(none)']];
  // The Readiness Score page posts here too, with this fixed subject.
  const formName = values.subject === 'Exit Options Readiness Score' ? 'Readiness Score' : 'Contact Us';
  const sentAt = new Date().toLocaleString('en-GB', {timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'}) + ' IST';
  try {
    await smtp().sendMail({
      from: SENDER,
      to: CONTACT_INBOX,
      replyTo: {name: values.name, address: values.email},
      subject: `Website contact: ${values.subject || values.name}`.slice(0, 200),
      text: `New message from the ${formName} form on equilibria.net (${sentAt}).\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${values.message}\n\nReply to this email to answer ${values.name} directly.`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.5">
<p>New message from the ${formName} form on equilibria.net (${escapeHtml(sentAt)}).</p>
<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td style="padding:2px 0">${escapeHtml(v)}</td></tr>`).join('')}</table>
<p style="margin:16px 0 4px;color:#666">Message</p>
<div style="white-space:pre-wrap;border-left:3px solid #b86518;padding:8px 12px;background:#f5f2ea">${escapeHtml(values.message)}</div>
<p style="color:#666;font-size:12px">Reply to this email to answer ${escapeHtml(values.name)} directly.</p></div>`,
    });
  } catch (e) {
    console.error('[contact] send failed', e);
    return res.status(502).json({error: "Sorry, we couldn't send your message right now. Please try again later."});
  }
  return res.status(200).json({ok: true});
}
