# crab-band for claude.ai: privacy policy

Effective 2026-10-23. This policy covers the crab-band Chrome extension published by MaxHarfen.

**In short:** crab-band collects, stores, sells and shares nothing. What it reads stays in your browser,
apart from one request it makes to claude.ai itself.

crab-band is unofficial: it is not made or endorsed by Anthropic.

## What it reads

The extension runs only on `https://claude.ai/*`, and reads only these, in your browser:

- **The claude.ai page:** whether the Stop button is showing (or the last reply is still streaming), the model
  picker's label (for example "Opus 5.5 Medium"), and where the row under the last reply is. It does not read the
  text of your conversations.
- **The `lastActiveOrg` cookie** that claude.ai sets. It holds your organization's ID, which the extension needs to
  ask claude.ai for your usage limits.
- **Your usage limits:** the 5-hour and 7-day percentages and their reset times, from claude.ai's own usage
  endpoint (below).

## What it sends

One request: `GET https://claude.ai/api/organizations/<your organization ID>/usage`. It goes to claude.ai, with
your existing claude.ai session, which is the same request claude.ai's Settings > Usage page makes. It is sent
when a claude.ai page loads, when a reply ends, and every 5 minutes while the tab is visible. The answer is shown
next to the model picker and is kept only in the page's memory.

## What it does not do

- It sends nothing to the developer or to any third party, and makes no request to any host other than claude.ai.
- No analytics, tracking, advertising or remote code.
- It stores nothing: no extension storage and no cookies of its own.
- It does not sell or transfer data, and uses what it reads only to draw the crab and the limits line.
- It asks for no browser permissions.

## Changes

Any change to this policy is published in this file with a new effective date.

## Contact

Open an issue at https://github.com/MaxHarfen/crab-band/issues.
