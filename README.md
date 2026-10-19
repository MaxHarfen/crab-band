# crab-band

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/crabs-dark.gif">
    <img src="docs/crabs-light.gif" alt="Nine pixel crabs at work in their outfits: wizard, scientist, painter, cowboy, ninja, gardener, musician, explorer and a plain crab" width="100%">
  </picture>
</p>

**crab-band**, an unofficial Claude Code mod (a plugin built on function hooks) that does three things:

- **Usage limits in the status line.** Your Claude 5-hour and weekly limits, each with a gauge and a countdown to its reset:
  `5h ▓▓▓░░░░░░░ 31% ↺2h14m   7d ▓▓▓▓▓░░░░░ 52% ↺4d`. It works in the desktop app's Code tab, where a `statusLine` command is not drawn.
- **A band of crabs above the prompt.** It always leads with a row for the main session: the step it is on from its task list, a progress gauge, the model, context and turn time. Below it, a row per running subagent. Each row starts with a pixel crab dressed by model and effort (desktop app). A finished subagent's row stays 30 seconds.

```
[crab] ● Write the parser · 2/5 ▓▓░░░░ · Opus 5.5 · ctx 24% · 2:13
[crab] ● Count hooks · Haiku 5.5 · ctx 6% · 0:15
```

- **`/agents-info`, a pane with big crabs.** The same agents on a plain background, three times the size: the main session, the subagents running now, and every subagent that finished this session (the band keeps a finished one only 30 seconds). `/agents-info` opens or closes it, `/agents-info open` only opens it. It runs at once, even typed while Claude is working, without stopping the turn.

The band in the desktop app (an illustration, not a screenshot):

<img src="docs/band-illustration.png" alt="Three band rows: a scientist crab, a musician crab and an explorer crab, each followed by a status dot, the task, the model, context and time" width="520">

Crab outfits:

| Agent | Crab | While it works |
| --- | --- | --- |
| Fable | wizard | floats, waves its wand, a spark twinkles |
| Opus, effort xhigh or max | scientist | the flask bubbles, then blows up in a puff of smoke |
| Opus, effort high | painter | strokes the brush, colours appear one by one |
| Opus, effort medium | cowboy | spins a lasso |
| Opus, effort low | ninja | runs, the headband flutters, a throwing star spins |
| Haiku | gardener | tips the watering can, drops fall |
| Sonnet | musician | breakdances: toprock, headspin, freeze, pop |
| Explore | explorer | glances left and right, the compass needle swings |
| anything else | plain crab | walks |

The main row reads the task list the model keeps (the desktop app's task list, or TodoWrite in the terminal). It only reads those calls and never changes them. Between turns it rests, dimmed, on the last state.

## Requirements

- A Claude Code build with function-hook mods (an early-access API that may change between releases). Tested on Claude Code 2.1.299.
- The limits show only on a Claude Pro or Max subscription, after the session's first reply.
- The crabs are drawn in the desktop app; the terminal shows the same rows as text. In VS Code the band shows only while
  the session or a subagent is at work, as VS Code's label for it would otherwise cover the slash-command menu.

## Install

At the prompt of a terminal session:

```
/plugin install crab-band --marketplace MaxHarfen/crab-band
```

Answer `y` to add the marketplace, then pick a scope (user: every project). From a shell:

```bash
claude plugin install crab-band --marketplace MaxHarfen/crab-band
```

Start a new session afterwards. The status line and the band appear by themselves; `/agents-info` opens the pane.

## Developing

The plugin is `crab-band/`: `hooks/register.tsx` holds every hook, `hooks/crab.ts` the crab art (the ART block) and its animations.
Check it with `claude plugin validate crab-band` and `claude plugin test crab-band`.
The art lives in one place: the JSON between `// ART:BEGIN` and `// ART:END` in `crab-band/hooks/crab.ts`. Edit a picture
there and run `python3 docs/make_crab_gif.py docs` (it needs Pillow) to redraw the GIFs above from it. The GIF script keeps a Python copy of
the motion only, so a new prop or animation needs adding there too.

## License

MIT (see [LICENSE](LICENSE)).

crab-band is a fan-made mod. It is not made, endorsed or supported by Anthropic.

Credits: the crab is drawn after Clawd, Claude Code's pixel mascot, by Anthropic. crab-band began as a fork of
[johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit)'s savvy-progress, which had the idea of dressing
each agent's crab by its model. The outfits and their animations here are crab-band's own; the parts of the code still
adapted from savvy-progress are listed, with its MIT license, in [crab-band/NOTICE.md](crab-band/NOTICE.md).
