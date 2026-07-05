// One-command demo: boot the inbound dispatcher, self-fire the signed sample event at it,
// print the round trip, and stay up. This is `npm start` — first parsed inbound message
// dispatched to the right project in one command, no domain, no account. A webhook needs
// a public URL in production; here the demo POSTs to its own localhost, so the whole loop
// runs anywhere (your machine, StackBlitz, Codespaces). Point real email at server.mjs
// when you're ready.
import { app } from "./server.mjs";
import { fireSampleEvent } from "./sample-event.mjs";

const PORT = Number(process.env.PORT ?? 3000);
const SECRET = process.env.MAILKITE_WEBHOOK_SECRET ?? "whsec_demo_secret";

app.listen(PORT, async () => {
  console.log(`listening on http://localhost:${PORT}/hooks/email\n`);

  const { status, text } = await fireSampleEvent({
    url: `http://localhost:${PORT}/hooks/email`,
    secret: SECRET,
  });

  // The dispatcher acks 200 and hands the parsed message to the project that owns its
  // recipient domain (startup-b.io), whose handler logs just above this line. Small
  // pause so the round trip reads top-to-bottom.
  await new Promise((r) => setTimeout(r, 300));
  console.log(`\n— self-fired one signed email.received event → ${status} ${text}`);
  console.log(`  server's still up: POST your own events to :${PORT}/hooks/email, or point real email here.`);
});
