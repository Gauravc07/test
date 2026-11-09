// Notification emails: rendering and sending. Rendering is pure so it can
// be tested without a mail provider.

export type QueuedNotification = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  kind: string;
  title: string;
  body: string | null;
  created_at: string;
};

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Groups queued notifications into one email per person, oldest first. */
export function groupByRecipient(rows: QueuedNotification[]): QueuedNotification[][] {
  const groups = new Map<string, QueuedNotification[]>();
  for (const r of rows) {
    const list = groups.get(r.user_id) ?? [];
    list.push(r);
    groups.set(r.user_id, list);
  }
  return [...groups.values()].map((g) =>
    g.sort((a, b) => a.created_at.localeCompare(b.created_at))
  );
}

/** One email for one person's notifications. */
export function renderEmail(items: QueuedNotification[], appUrl: string, settingsNote = true): Email {
  if (items.length === 0) throw new Error("Nothing to send");
  const first = items[0];
  const name = (first.full_name ?? "").trim().split(/\s+/)[0];
  const subject = items.length === 1 ? first.title : `${items.length} updates on Shor`;
  const link = appUrl.replace(/\/$/, "");

  const rowsHtml = items.map((n) => `
      <tr><td style="padding:14px 0;border-top:1px solid #E4E7EC">
        <div style="font-size:15px;font-weight:600;color:#0A1628">${escape(n.title)}</div>
        ${n.body ? `<div style="font-size:14px;color:#475467;margin-top:4px">${escape(n.body)}</div>` : ""}
      </td></tr>`).join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#F7F5F0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#FFFFFF;border:1px solid #E4E7EC;border-radius:12px;padding:24px">
        <tr><td style="font-size:20px;font-weight:800;color:#0A1628;padding-bottom:12px">Shor</td></tr>
        <tr><td style="font-size:15px;color:#0A1628;padding-bottom:6px">${name ? `Hi ${escape(name)},` : "Hi,"}</td></tr>
        <tr><td style="font-size:15px;color:#475467;padding-bottom:6px">
          ${items.length === 1 ? "Here's what happened on Shor." : "Here's what happened on Shor while you were away."}
        </td></tr>
        ${rowsHtml}
        <tr><td style="padding-top:20px">
          <a href="${escape(link)}" style="display:inline-block;background:#0A1628;color:#FFFFFF;text-decoration:none;
             font-weight:600;font-size:15px;padding:12px 20px;border-radius:8px">Open Shor</a>
        </td></tr>
        ${settingsNote ? `<tr><td style="font-size:12px;color:#98A2B3;padding-top:20px">
          You get these emails for things that need you on Shor. Turn them off in
          Help and settings &rarr; Email notifications in the app.</td></tr>` : ""}
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    name ? `Hi ${name},` : "Hi,",
    "",
    ...items.flatMap((n) => [n.title, ...(n.body ? [n.body] : []), ""]),
    `Open Shor: ${link}`,
    "",
    "Turn these emails off in the app: Help and settings → Email notifications.",
  ].join("\n");

  return { to: first.email, subject, html, text };
}

export type Mailer = (email: Email) => Promise<void>;

/**
 * Resend in production (RESEND_API_KEY + EMAIL_FROM). For local testing,
 * MAILPIT_URL sends to the Supabase local inbox instead. Null when neither
 * is set: notifications stay in the app only.
 */
export function mailerFromEnv(): Mailer | null {
  const from = Deno.env.get("EMAIL_FROM") ?? "Shor <notifications@shor.app>";
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    return async (e) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [e.to], subject: e.subject, html: e.html, text: e.text }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    };
  }
  const mailpit = Deno.env.get("MAILPIT_URL");
  if (mailpit) {
    const match = from.match(/^(.*)<(.+)>$/);
    const sender = match ? { Name: match[1].trim(), Email: match[2].trim() } : { Email: from };
    return async (e) => {
      const res = await fetch(`${mailpit.replace(/\/$/, "")}/api/v1/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ From: sender, To: [{ Email: e.to }], Subject: e.subject, HTML: e.html, Text: e.text }),
      });
      if (!res.ok) throw new Error(`Mailpit ${res.status}: ${await res.text()}`);
    };
  }
  return null;
}
