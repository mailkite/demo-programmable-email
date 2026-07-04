// send-from-many-domains.mjs — one API key, three products, three domains you own.
// Companion to https://mailkite.dev/blog/why-free-programmable-email-developers/
//
// Runs with no account: without MAILKITE_API_KEY it dry-runs and prints the three
// intended sends. Set the key (and verify the domains) and the same code sends for real.
import { send } from "./mailer.js";

const user = { email: "you@example.com" };
const html = "<p>Hello from one free MailKite account.</p>";

// three different products, three domains you own, one free account.
// no "add a domain" upsell, no per-seat plan — the only meter is volume.
await send({ from: "hello@side-project-a.dev",   to: user.email, subject: "Welcome",   html });
await send({ from: "team@startup-b.io",          to: user.email, subject: "Your code", html });
await send({ from: "noreply@weekend-test-c.app", to: user.email, subject: "Ping",      html });
