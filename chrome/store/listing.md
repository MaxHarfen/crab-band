# Chrome Web Store listing: crab-band 0.1.0

What to paste into each field of the Chrome Web Store Developer Dashboard. The dashboard cannot be
scripted by extensions, so it is filled in by hand. Package: `npm run zip` makes `chrome/crab-band-0.1.0.zip`.

## Package

Upload `crab-band-0.1.0.zip`. The title and the summary come from `manifest.json`:

- **Title:** crab-band
- **Summary** (104 of 132 characters): Pixel crabs that dance while Claude answers on claude.ai. Unofficial: not made or
  endorsed by Anthropic.

## Store listing

**Description**

```
crab-band puts a small pixel crab on claude.ai that shows, at a glance, when Claude is working and how much of your usage limits you have used.

• While Claude answers, a crab dances under the reply and walks slowly across the empty row, with two orange footprints blinking behind it. When the reply is done, it runs back and stands still.
• The crab dresses for the model and effort you picked: a wizard for Fable, a scientist for Opus Max, a painter for Opus Extra, a doll for Opus High, a cowboy for Opus Medium, a ninja for Opus Low, a musician for Sonnet and a gardener for Haiku.
• Your 5-hour and 7-day usage limits show as a short line next to the model picker, for example "5h 6% · 7d 91%". Hover it for the reset times.

It uses no tokens: the extension draws the crab itself and never calls Claude.

Privacy: crab-band runs only on claude.ai and asks for no permissions. It reads the page (whether Claude is answering and which model is picked, never your conversation text) and makes one request to claude.ai's own usage endpoint, the same one Settings > Usage uses. Nothing is sent to the developer or anyone else, and nothing is stored.

Open source: https://github.com/MaxHarfen/crab-band. The crab and its dances come from crab-band, a mod for Claude Code.

Unofficial: crab-band is a fan-made extension, not made or endorsed by Anthropic. The crab is drawn after Clawd, Claude Code's pixel mascot.
```

- **Category:** a fun or entertainment category if the dropdown has one, otherwise one for browser look and
  functionality. Pick from the dashboard's list.
- **Language:** English
- **Store icon:** `chrome/icons/128.png` (96 px crab with 16 px of transparent padding)
- **Screenshots:** 1 to 5, 1280 x 800, taken from a demo chat made for the purpose (never a real one): the crab
  walking under a reply with its footprints, and the limits line next to the model picker.
- **Small promo tile** (440 x 280, optional): none yet.
- **Homepage URL:** https://github.com/MaxHarfen/crab-band
- **Support URL:** https://github.com/MaxHarfen/crab-band/issues
- **Mature content:** No

## Privacy

**Single purpose description**

```
Show, at a glance on claude.ai, when Claude is working (an animated pixel crab under the reply) and how much of the account's usage limits is used (a short line next to the model picker).
```

**Host permission justification** (the content script on `https://claude.ai/*`)

```
The content script runs only on https://claude.ai/* because that is the page it decorates. It reads whether Claude is answering and which model is selected, draws the crab and the limits line in its own elements, and asks claude.ai's own usage endpoint for the 5-hour and 7-day limits. It requests no other permissions and contacts no other host.
```

**Remote code:** No, I am not using remote code.

**Data usage:** tick **Website content** only. The extension reads parts of the claude.ai page and the usage
numbers claude.ai returns, in the browser, and sends nothing to the developer. Google counts data handled only on
the device as handled, so it is declared. The organization ID read from the `lastActiveOrg` cookie is used only to
build the request to claude.ai. Leave every other category unticked, and tick the three certifications (no sale or
transfer to third parties, no use unrelated to the single purpose, no use for creditworthiness or lending).

**Privacy policy URL:** the public URL of `chrome/PRIVACY.md` once it is pushed, for example
`https://github.com/MaxHarfen/crab-band/blob/main/chrome/PRIVACY.md` after a merge to main.

## Distribution

- **Payments:** Free
- **Visibility:** Public, or Unlisted to share it by link first
- **Regions:** All regions

## Test instructions

```
Needs a claude.ai account. Open https://claude.ai, start a chat and send any message. While Claude answers, a pixel crab appears under the reply, dances and walks across the row; when the reply ends it runs back and stands still. The 5h / 7d usage line appears next to the model picker (hidden if the account has no usage limits to show). Nothing appears on any other site.
```
