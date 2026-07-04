# demo-programmable-email

One account, one API key, many domains — the reusable MailKite email setup you copy
into every project. This is the runnable companion to two posts:
[Why we built free programmable email for developers](https://mailkite.dev/blog/why-free-programmable-email-developers/)
and [Email you set up once and reuse for every project](https://mailkite.dev/blog/set-up-email-once-reuse-every-project/).
Every code block in those posts maps to a file here — send from three domains on one
key, then receive with a single inbound webhook that fans out to every project you run.

[![ci](https://github.com/mailkite/demo-programmable-email/actions/workflows/ci.yml/badge.svg)](https://github.com/mailkite/demo-programmable-email/actions/workflows/ci.yml)

## Run it in one click

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mailkite/demo-programmable-email?file=send-from-many-domains.mjs)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/mailkite/demo-programmable-email?quickstart=1)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mailkite/demo-programmable-email)

StackBlitz runs the whole thing in your browser tab (WebContainers — real Node, no
account needed). It opens on `send-from-many-domains.mjs`; in the terminal run
`node send-from-many-domains.mjs` to watch one key send from three domains. There's no
real sending without an account, so with no `MAILKITE_API_KEY` set the demo **dry-runs**:
it logs each intended send instead of hitting the network.

## Run it locally

```sh
git clone https://github.com/mailkite/demo-programmable-email
cd demo-programmable-email
npm install                          # express + the mailkite SDK

node send-from-many-domains.mjs      # one key → three domains (dry-run without a key)
```

Expected output:

```
[dry-run] would send { from: 'hello@side-project-a.dev', to: 'you@example.com', subject: 'Welcome' }
[dry-run] would send { from: 'team@startup-b.io', to: 'you@example.com', subject: 'Your code' }
[dry-run] would send { from: 'noreply@weekend-test-c.app', to: 'you@example.com', subject: 'Ping' }
```

Then the inbound half — one webhook that dispatches to the right project. In two terminals:

```sh
node server.mjs                      # terminal 1 → listening on :3000/hooks/email
node fire-sample-event.mjs           # terminal 2 → fires a signed email.received event
```

`fire-sample-event.mjs` sends a message addressed to `support@startup-b.io`, so the
dispatcher routes it to that project. Terminal 1 logs:

```
[startup-b.io] opened a support ticket from ada@example.com: "Re: invoice #1042"
```

and terminal 2 prints `→ 200 ok`. Tamper with the body or the secret and the server
answers `401`. `npm test` runs the signature vectors (valid, wrong secret, tampered
body, replayed timestamp, malformed header) plus an SDK/raw parity check.

## How it works

- `mailer.js` — the reusable module you paste into every project. `makeMailer(domain)`
  returns `{ welcome, magicLink }`; the API key comes from the environment, the domain
  is the one argument that changes. Also exports the `send()` dry-run seam.
- `send-from-many-domains.mjs` — post 1's "one key, three domains" example. Sends
  Welcome from `side-project-a.dev`, Your code from `startup-b.io`, Ping from
  `weekend-test-c.app` — no plan change between them.
- `server.mjs` — post 2's one-inbound-handler dispatcher (Express).
  `MailKite.verifyWebhook()` checks the HMAC signature, replay window, and does a
  constant-time compare in one call; then it dispatches by recipient domain to a
  `projects` map. Add a project = add a line.
- `raw-server.mjs` — **labeled raw alternative** (zero dependencies): the hand-rolled
  HMAC-SHA256 verification the SDK absorbs, with a 5-minute replay window and
  constant-time compare. This is what `server.test.mjs` imports.
- `fire-sample-event.mjs` — signs and POSTs the same payload shape MailKite's delivery
  worker sends, so the demo works with no account.
- `server.test.mjs` — signature vectors for the raw implementation + an SDK/raw parity
  test (`node --test`).

To point real email at it: [verify a domain on MailKite](https://mailkite.dev/docs/quickstart),
reuse the same key on every project, set your webhook URL to this server, and set
`MAILKITE_API_KEY` and `MAILKITE_WEBHOOK_SECRET` (see `.dev.vars.example`).

## License

MIT — built by the MailKite team. This demo accompanies
[Why we built free programmable email for developers](https://mailkite.dev/blog/why-free-programmable-email-developers/)
and [Email you set up once and reuse for every project](https://mailkite.dev/blog/set-up-email-once-reuse-every-project/).
Questions or issues → [open an issue](https://github.com/mailkite/demo-programmable-email/issues).
