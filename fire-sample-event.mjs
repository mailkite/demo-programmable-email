// Fires a signed sample `email.received` event at the local dispatcher — exactly the
// shape MailKite's delivery worker POSTs. Run `node server.mjs` first, then this
// (or just `npm start`, which boots the dispatcher and self-fires this in one command).
// The `to` domain (startup-b.io) is what the dispatcher routes on.
import { fireSampleEvent } from "./sample-event.mjs";

const SECRET = process.env.MAILKITE_WEBHOOK_SECRET ?? "whsec_demo_secret";
const URL = process.env.HOOK_URL ?? "http://localhost:3000/hooks/email";

const { status, text } = await fireSampleEvent({ url: URL, secret: SECRET });
console.log(`→ ${status} ${text}`);
