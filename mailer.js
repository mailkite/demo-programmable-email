// mailer.js — the one email module you paste into every project.
// Companion to https://mailkite.dev/blog/set-up-email-once-reuse-every-project/
import { MailKite } from "mailkite";

const mk = new MailKite(process.env.MAILKITE_API_KEY); // same key, everywhere

// Dry-run seam so this repo runs with no account (e.g. in StackBlitz). With no
// MAILKITE_API_KEY set we don't hit the network — we log the intent and return a
// SendResult-shaped stub. Set the key and it's a plain `mk.send`. Real sending needs
// an account with a verified domain.
export function send(message) {
  if (!process.env.MAILKITE_API_KEY) {
    const { from, to, subject } = message;
    console.log("[dry-run] would send", { from, to, subject });
    return Promise.resolve({ id: "dry-run", status: "skipped" });
  }
  return mk.send(message);
}

// each project passes its own domain; nothing else changes.
export function makeMailer(fromDomain) {
  return {
    welcome: (to) =>
      send({ from: `hello@${fromDomain}`, to, subject: "Welcome", html: "<p>You're in.</p>" }),
    magicLink: (to, url) =>
      send({ from: `login@${fromDomain}`, to, subject: "Your sign-in link",
             html: `<p><a href="${url}">Sign in</a></p>` }),
  };
}
