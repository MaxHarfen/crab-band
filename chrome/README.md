# crab-band for claude.ai

Unofficial: not made or endorsed by Anthropic.

A Chrome extension that brings [crab-band](https://github.com/MaxHarfen/crab-band)'s pixel crab to claude.ai in the browser. While Claude
answers, a crab dances at the end of the reply, dressed for the model and effort picked in the model picker, and
walks sideways across the empty row under it, there and back. When the reply is done, the crab stands still. The 5-hour and 7-day usage limits
show as a short line next to the model picker (`5h 6% · 7d 91%`; hover it for the reset times).

It costs no tokens: the extension draws the crab itself, from the page, and never calls Claude.

| Model picker says | Outfit |
|---|---|
| Fable | wizard |
| Opus, effort Max | scientist |
| Opus, effort Extra | painter |
| Opus, effort High | doll |
| Opus, effort Medium | cowboy |
| Opus, effort Low | ninja |
| Sonnet | musician |
| Haiku | gardener |
| anything else | plain crab |

Effort is read from the picker's English labels, so with claude.ai in another language an Opus crab stays plain.

## Install (Load unpacked)

```bash
cd chrome
npm install
npm run build
```

Then open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick the `chrome/dist`
folder. It works in Chrome and other Chromium browsers (Edge, Brave, Arc). After a rebuild, press the reload
icon on the extension's card.

## What it reads and sends

- **Reads** claude.ai's page: whether the Stop button is there (or the last reply is still streaming), the model
  picker's label, and where the footer row under the last reply is. It reads no chat text.
- **Reads** the `lastActiveOrg` cookie, to know which organization's limits to ask for.
- **Sends** one request: `GET /api/organizations/<that org>/usage` on claude.ai, the same request claude.ai's
  Settings page makes, with your own session. It runs when the page loads, when a reply ends, and every 5 minutes
  while the tab is visible.

Nothing else, and nowhere else: no other host, no analytics, no remote code. The privacy policy is
[`PRIVACY.md`](PRIVACY.md). It runs only on
`https://claude.ai/*`, asks for no permissions, and draws only inside its own two elements (each with its own
shadow root). If claude.ai changes and a selector misses, it draws nothing.

## Tests

```bash
npm test
```

## Credits

The crab art and its dances come from crab-band (`crab-band/hooks/`), imported at build time, not copied. The
crab is drawn after Clawd, Claude Code's pixel mascot, by Anthropic. Parts of the crab code are adapted from
savvy-progress (MIT); `NOTICE.md` lists them. MIT licence, see `LICENSE`.
