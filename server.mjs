// server.mjs — one inbound webhook, fanned out to every project you run.
// Companion to https://mailkite.dev/blog/set-up-email-once-reuse-every-project/
//
// One verified endpoint dispatches each inbound message to the project that owns its
// recipient domain. Add a project = add a line to `projects`. The message arrives as
// decoded JSON (event.text, event.html, event.attachments, event.auth) — no MIME parsing.
import express from "express";
import { MailKite } from "mailkite";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
// Falls back to a demo secret so `node fire-sample-event.mjs` verifies with no setup.
const SECRET = process.env.MAILKITE_WEBHOOK_SECRET ?? "whsec_demo_secret";

// MailKite signs the exact bytes it sent, so verify over the raw body.
app.use("/hooks/email", express.raw({ type: "application/json" }));

// map a domain to whatever that project does with an inbound email.
const projects = {
  "side-project-a.dev": (msg) => saveFeedback(msg),
  "startup-b.io":       (msg) => routeSupportTicket(msg),
  "weekend-test-c.app": (msg) => replyWithAI(msg),
};

app.post("/hooks/email", (req, res) => {
  // HMAC signature, replay window, constant-time compare — one call, verify once.
  if (!MailKite.verifyWebhook(req.headers["x-mailkite-signature"], req.body, SECRET)) {
    return res.sendStatus(401);
  }
  res.sendStatus(200); // ack fast; do heavy work out of band

  const event = JSON.parse(req.body);
  if (event.type !== "email.received") return;

  const domain = event.to[0].address.split("@")[1]; // e.g. "startup-b.io"
  const handler = projects[domain];
  if (!handler) {
    console.log(`no project owns ${domain} — ignoring`);
    return;
  }
  handler(event); // hand the parsed message to the right project
});

// Each project's handler. The message is already decoded, so these just do their thing.
function saveFeedback(msg) {
  console.log(`[side-project-a.dev] saved feedback from ${msg.from.address}: "${msg.subject}"`);
}
function routeSupportTicket(msg) {
  console.log(`[startup-b.io] opened a support ticket from ${msg.from.address}: "${msg.subject}"`);
}
function replyWithAI(msg) {
  console.log(`[weekend-test-c.app] drafting an AI reply to ${msg.from.address}: "${msg.subject}"`);
}

// Auto-listen only when run directly (`node server.mjs`), not when imported by
// demo.mjs — importing the app must not also bind the port.
import { fileURLToPath } from "node:url";
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}/hooks/email`));
}

export { app };
