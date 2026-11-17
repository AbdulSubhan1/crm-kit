import { after } from "next/server";

// Sends security events (logins, blocked attempts) to a monitor such as Pulse (github.com/AbdulSubhan1/monitor), which
// keeps the account and address only as keyed hashes. Off until MONITOR_URL and MONITOR_LOG_TOKEN are both set, and it
// can never break a login: sent after the response (the visitor never waits), failures only logged.

// Generous because nobody waits for it: a cold monitor on a sleeping free database can take a few seconds
const TIMEOUT_MS = 10_000;

export type SecurityEvent = {
  type: "login_failed" | "login_succeeded" | "login_blocked";
  account?: string;
  ip?: string;
  path?: string;
  // snake_case reason, never free text: "wrong_password", "unknown_account", "inactive", "rate_limited"
  reason?: string;
};

function target() {
  const url = process.env.MONITOR_URL?.trim().replace(/\/$/, "");
  const token = process.env.MONITOR_LOG_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

async function send(event: SecurityEvent, to: { url: string; token: string }): Promise<void> {
  try {
    const res = await fetch(`${to.url}/api/security`, {
      method: "POST",
      headers: { Authorization: `Bearer ${to.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // One line in the logs, so a lost event has a visible reason (never the token or the event's data)
    if (!res.ok) console.warn(`[monitor] security event not stored: HTTP ${res.status}`);
  } catch (err) {
    console.warn(`[monitor] security event not sent: ${err instanceof Error ? err.name : "error"}`);
  }
}

export function reportSecurity(event: SecurityEvent): void {
  const to = target();
  if (!to) return;
  try {
    after(() => send(event, to));
  } catch {
    // Outside a request (a script): send it now, still without waiting
    void send(event, to);
  }
}
