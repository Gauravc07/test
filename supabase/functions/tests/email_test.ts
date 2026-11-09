// Run: deno test --allow-env supabase/functions/tests/
import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { groupByRecipient, type QueuedNotification, renderEmail } from "../_shared/email.ts";

const n = (over: Partial<QueuedNotification>): QueuedNotification => ({
  id: crypto.randomUUID(),
  user_id: "u1",
  email: "riya@test.dev",
  full_name: "Riya Sharma",
  kind: "hired",
  title: "You're hired for Monsoon skincare",
  body: "Glow Labs accepted your application.",
  created_at: "2026-11-11T10:00:00Z",
  ...over,
});

Deno.test("one email per person, oldest first", () => {
  const groups = groupByRecipient([
    n({ user_id: "u2", email: "b@test.dev" }),
    n({ created_at: "2026-11-11T10:05:00Z", title: "second" }),
    n({ created_at: "2026-11-11T09:00:00Z", title: "first" }),
  ]);
  assertEquals(groups.length, 2);
  const riya = groups.find((g) => g[0].user_id === "u1")!;
  assertEquals(riya.map((i) => i.title), ["first", "second"]);
});

Deno.test("a single notification becomes the subject", () => {
  const e = renderEmail([n({})], "https://shor.app/");
  assertEquals(e.subject, "You're hired for Monsoon skincare");
  assertEquals(e.to, "riya@test.dev");
  assertStringIncludes(e.text, "Hi Riya,");
  assertStringIncludes(e.html, 'href="https://shor.app"');
});

Deno.test("several notifications are summarised", () => {
  const e = renderEmail([n({}), n({ title: "New message from Glow Labs" })], "https://shor.app");
  assertEquals(e.subject, "2 updates on Shor");
  assertStringIncludes(e.text, "New message from Glow Labs");
});

Deno.test("user text is escaped in the HTML", () => {
  const e = renderEmail([n({ body: '<script>alert("x")</script>' })], "https://shor.app");
  assert(!e.html.includes("<script>"));
  assertStringIncludes(e.html, "&lt;script&gt;");
});
