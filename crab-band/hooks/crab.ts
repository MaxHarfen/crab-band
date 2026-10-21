// The crabs: a Clawd-style crab (Claude Code's mascot, by Anthropic) on a 30 x 28 grid, in outfits of
// crab-band's own, and how each one moves.
//
// The art is the ART block below: strict JSON between the ART:BEGIN and ART:END lines, so
// docs/make_crab_gif.py reads the very same pictures. Edit it there and both the plugin and the
// README GIFs follow. Each picture is a list of rows, one character per pixel ('.' is empty); its
// legend gives a character's colour ("accent" is the outfit's accent colour). A pixel belongs to a
// group that moves as one: bd the body (bobs), la / lb the two leg pairs (step in turn), cl / cr the
// arms, eye the eyes, and each outfit's props (it, star, bub, pop, boom, smoke, pa, pb, pc, loop,
// flag, can, drop, nt, nt2, needle, hair, skirt, sp, ht).

import { DANCE_SECONDS, keyframes, move } from './moves'

type Part = { x: number; y: number; group: string; rows: string[]; legend: Record<string, string> }
type Art = {
  // A base legend entry is [colour, group], or [colour, group, underlay]: a body pixel in that colour
  // drawn beneath it, for a group that moves on its own (the eyes glance without leaving a hole).
  base: { rows: string[]; legend: Record<string, [string, string] | [string, string, string]> }
  outfits: Record<string, { parts: Part[] }>
}

export const ART: Art =
// ART:BEGIN
{
  "base": {
    "rows": [
      "..............................",
      "..............................",
      "..............................",
      "..............................",
      "..............................",
      "..............................",
      "..............................",
      "..............................",
      "..............................",
      "..............................",
      ".......cccccccccccccccc.......",
      ".......cccccccccccccccc.......",
      ".......cckkcccccccckkcc.......",
      ".......cckkcccccccckkcc.......",
      "...LLLLccccccccccccccccRRRR...",
      "...LLLLccccccccccccccccRRRR...",
      "...LLLLccccccccccccccccRRRR...",
      "...LLLLccccccccccccccccRRRR...",
      ".......cccccccccccccccc.......",
      ".......cccccccccccccccc.......",
      ".......cccccccccccccccc.......",
      ".......cccccccccccccccc.......",
      ".......11..22....11..22.......",
      ".......11..22....11..22.......",
      ".......11..22....11..22.......",
      ".......11..22....11..22.......",
      "..............................",
      ".............................."
    ],
    "legend": {
      "c": [
        "#D97757",
        "bd"
      ],
      "k": ["#1F1E1D", "eye", "#D97757"],
      "L": [
        "#D97757",
        "cl"
      ],
      "R": [
        "#D97757",
        "cr"
      ],
      "1": [
        "#D97757",
        "la"
      ],
      "2": [
        "#D97757",
        "lb"
      ]
    }
  },
  "outfits": {
    "fable": {
      "parts": [
        {
          "x": 4,
          "y": 0,
          "group": "bd",
          "rows": [
            "...............tt.....",
            "..............tt......",
            ".............ttt......",
            "............tttt......",
            "...........tYttt......",
            ".........ttttttt......",
            "........tYtttttt......",
            "......tttttttYttt.....",
            ".....ttYtttYttttt.....",
            "BBBBBBBBBBBBBBBBBBBBBB"
          ],
          "legend": {
            "t": "accent",
            "Y": "#F5C542",
            "B": "#4E46A8"
          }
        },
        {
          "x": 25,
          "y": 9,
          "group": "it",
          "rows": [
            "..n",
            ".n.",
            ".n.",
            "n..",
            "n.."
          ],
          "legend": {
            "n": "#8A5A33"
          }
        },
        {
          "x": 26,
          "y": 5,
          "group": "star",
          "rows": [
            ".y.",
            "yWy",
            ".y."
          ],
          "legend": {
            "y": "#F5C542",
            "W": "#FFF6C8"
          }
        }
      ]
    },
    "heavy": {
      "parts": [
        {
          "x": 7,
          "y": 8,
          "group": "bd",
          "rows": [
            "kkkkkkkkkkkkkkkk",
            "kggggkkkkkkggggk"
          ],
          "legend": {
            "k": "#3B3B40",
            "g": "#9AA0A8"
          }
        },
        {
          "x": 8,
          "y": 7,
          "group": "bd",
          "rows": [
            ".gg.......gg.",
            "gvvg.....gvvg",
            "gvvg.....gvvg",
            ".gg.......gg."
          ],
          "legend": {
            "g": "#9AA0A8",
            "v": "#BFE3F7"
          }
        },
        {
          "x": 2,
          "y": 8,
          "group": "bd",
          "rows": [
            "..GG..",
            "..GG..",
            ".GttG.",
            "GttttG",
            "GttttG",
            ".GGGG."
          ],
          "legend": {
            "G": "#DCE6EE",
            "t": "accent"
          }
        },
        {
          "x": 3,
          "y": 5,
          "group": "bub",
          "rows": [
            "b.",
            "..",
            ".b"
          ],
          "legend": {
            "b": "accent"
          }
        },
        {
          "x": 2,
          "y": 4,
          "group": "pop",
          "rows": [
            ".y.",
            "yoy",
            ".y."
          ],
          "legend": {
            "y": "#F5C542",
            "o": "#F08A24"
          }
        },
        {
          "x": 0,
          "y": 1,
          "group": "boom",
          "rows": [
            "y.y.y.",
            ".yoooy",
            "yorroo",
            ".oorry",
            "yoooy.",
            ".y.y.y"
          ],
          "legend": {
            "y": "#F5C542",
            "o": "#F08A24",
            "r": "#E5484D"
          }
        },
        {
          "x": 1,
          "y": 0,
          "group": "smoke",
          "rows": [
            ".ss.",
            "ssss",
            ".ss."
          ],
          "legend": {
            "s": "#B8BEC6"
          }
        }
      ]
    },
    "careful": {
      "parts": [
        {
          "x": 7,
          "y": 7,
          "group": "bd",
          "rows": [
            ".........tt......",
            "...bbbbbbbbbbbb..",
            ".bbbbbbbbbbbbbbbb",
            "..BBBBBBBBBBBBBB."
          ],
          "legend": {
            "t": "accent",
            "b": "#2E3A59",
            "B": "#1F2840"
          }
        },
        {
          "x": 1,
          "y": 11,
          "group": "bd",
          "rows": [
            ".PPPP.",
            "PrPbPP",
            "PPyPP."
          ],
          "legend": {
            "P": "#C98E54",
            "r": "#E5484D",
            "b": "#3B82F6",
            "y": "#F5C542"
          }
        },
        {
          "x": 25,
          "y": 7,
          "group": "it",
          "rows": [
            "..p",
            ".pp",
            ".g.",
            ".n.",
            "n..",
            "n..",
            "n.."
          ],
          "legend": {
            "p": "#3B82F6",
            "g": "#9AA0A8",
            "n": "#8A5A33"
          }
        },
        {
          "x": 27,
          "y": 5,
          "group": "pa",
          "rows": [
            "rrr"
          ],
          "legend": {
            "r": "#E5484D"
          }
        },
        {
          "x": 26,
          "y": 3,
          "group": "pb",
          "rows": [
            "yyy."
          ],
          "legend": {
            "y": "#F5C542"
          }
        },
        {
          "x": 27,
          "y": 1,
          "group": "pc",
          "rows": [
            "bbb"
          ],
          "legend": {
            "b": "#3B82F6"
          }
        }
      ]
    },
    "doll": {
      "parts": [
        {
          "x": 4,
          "y": 5,
          "group": "hair",
          "rows": [
            "......hhhhhhhhhh......",
            "....hhhhhhhhhhhhhh....",
            "...hhhHHhhhhhhhhhhh...",
            "..hhhHhhhhhhhhhhhhhh..",
            "..hhHhhhhhhhhhhhhhhh..",
            ".hhhhhhhhhhhhhhhhhhhh.",
            ".hHh..............hhd.",
            ".hHd..............dhh.",
            ".hHd..............dhh.",
            ".hHd..............dhh.",
            ".hHd..............dhh.",
            ".hHd..............dhh.",
            ".hHd..............dhh.",
            ".hHd..............dhh.",
            "hhd................dhh",
            "hd..................dh"
          ],
          "legend": {
            "h": "#F2CF5B",
            "H": "#FBE7A1",
            "d": "#D4A93A"
          }
        },
        {
          "x": 19,
          "y": 2,
          "group": "bd",
          "rows": [
            "aa...aa",
            "aaa.aaa",
            "aaaAaaa",
            "aaa.aaa",
            "aa...aa"
          ],
          "legend": {
            "a": "accent",
            "A": "#A3165F"
          }
        },
        {
          "x": 8,
          "y": 11,
          "group": "bd",
          "rows": [
            "k"
          ],
          "legend": {
            "k": "#1F1E1D"
          }
        },
        {
          "x": 21,
          "y": 11,
          "group": "bd",
          "rows": [
            "k"
          ],
          "legend": {
            "k": "#1F1E1D"
          }
        },
        {
          "x": 9,
          "y": 15,
          "group": "bd",
          "rows": [
            "pp"
          ],
          "legend": {
            "p": "#F59BC3"
          }
        },
        {
          "x": 19,
          "y": 15,
          "group": "bd",
          "rows": [
            "pp"
          ],
          "legend": {
            "p": "#F59BC3"
          }
        },
        {
          "x": 26,
          "y": 0,
          "group": "sp",
          "rows": [
            ".p.",
            "pwp",
            ".p."
          ],
          "legend": {
            "w": "#FFFFFF",
            "p": "#F7A8D0"
          }
        },
        {
          "x": 0,
          "y": 5,
          "group": "ht",
          "rows": [
            "aa.aa",
            "aaaaa",
            ".aaa.",
            "..a.."
          ],
          "legend": {
            "a": "accent"
          }
        },
        {
          "x": 5,
          "y": 18,
          "group": "skirt",
          "rows": [
            "..AAAAAAAAAAAAAAAA..",
            "..aalaalaalaalaala..",
            ".aalaalaalaalaalaaa.",
            "aalaalaalaalaalaalaa"
          ],
          "legend": {
            "a": "accent",
            "A": "#A3165F",
            "l": "#F59BC3"
          }
        }
      ]
    },
    "medium": {
      "parts": [
        {
          "x": 4,
          "y": 5,
          "group": "bd",
          "rows": [
            ".......bbb..bbb.......",
            "......bbbbbbbbbb......",
            "......tttttttttt......",
            ".b....bbbbbbbbbb....b.",
            "..bbbbbbbbbbbbbbbbbb.."
          ],
          "legend": {
            "b": "#8B5A2B",
            "t": "accent"
          }
        },
        {
          "x": 22,
          "y": 0,
          "group": "loop",
          "rows": [
            "..rrrr..",
            ".r....r.",
            "r......r",
            ".r....r.",
            "..rrrr.."
          ],
          "legend": {
            "r": "#C8A165"
          }
        },
        {
          "x": 23,
          "y": 5,
          "group": "bd",
          "rows": [
            "r..",
            "r..",
            ".r.",
            ".r.",
            "..r",
            "..r",
            "..r",
            "..r"
          ],
          "legend": {
            "r": "#C8A165"
          }
        }
      ]
    },
    "light": {
      "parts": [
        {
          "x": 7,
          "y": 10,
          "group": "bd",
          "rows": [
            "tttttttttttttttt",
            "tttttttttttttttt"
          ],
          "legend": {
            "t": "accent"
          }
        },
        {
          "x": 23,
          "y": 9,
          "group": "flag",
          "rows": [
            "..tt",
            "ttt.",
            ".ttt"
          ],
          "legend": {
            "t": "accent"
          }
        },
        {
          "x": 0,
          "y": 9,
          "group": "it",
          "rows": [
            ".s.",
            "sks",
            ".s."
          ],
          "legend": {
            "s": "#B8BEC6",
            "k": "#3B3B40"
          }
        }
      ]
    },
    "haiku": {
      "parts": [
        {
          "x": 5,
          "y": 5,
          "group": "bd",
          "rows": [
            ".......ssssss.......",
            "......ssSsssSs......",
            "......tttttttt......",
            "..ssssssssssssssss..",
            ".sSssSssSssSssSssSs."
          ],
          "legend": {
            "s": "#E2C27A",
            "S": "#C9A65A",
            "t": "accent"
          }
        },
        {
          "x": 0,
          "y": 9,
          "group": "can",
          "rows": [
            "c.....",
            ".c.hh.",
            "..cGGh",
            "..GGGG",
            "..GGGG"
          ],
          "legend": {
            "c": "#3E8E5C",
            "h": "#3E8E5C",
            "G": "#4FA36B"
          }
        },
        {
          "x": 0,
          "y": 11,
          "group": "drop",
          "rows": [
            "d",
            ".",
            "d"
          ],
          "legend": {
            "d": "#5AB0F0"
          }
        }
      ]
    },
    "sonnet": {
      "parts": [
        {
          "x": 5,
          "y": 5,
          "group": "bd",
          "rows": [
            "....kkkkkkkkkkkk....",
            "..kk............kk..",
            ".k................k.",
            ".k................k.",
            "ttt..............ttt",
            "tpt..............tpt",
            "tpt..............tpt",
            "tpt..............tpt",
            "ttt..............ttt"
          ],
          "legend": {
            "k": "#76767B",
            "t": "accent",
            "p": "#55514C"
          }
        },
        {
          "x": 25,
          "y": 2,
          "group": "nt",
          "rows": [
            ".nn",
            ".n.",
            "nn.",
            "nn."
          ],
          "legend": {
            "n": "accent"
          }
        },
        {
          "x": 0,
          "y": 5,
          "group": "nt2",
          "rows": [
            ".nn",
            ".n.",
            "nn.",
            "nn."
          ],
          "legend": {
            "n": "accent"
          }
        }
      ]
    },
    "explore": {
      "parts": [
        {
          "x": 7,
          "y": 5,
          "group": "bd",
          "rows": [
            ".....hhhhhh.....",
            "...hhhhhhhhhh...",
            "..hhhhhhhhhhhh..",
            "..tttttttttttt..",
            "hhhhhhhhhhhhhhhh"
          ],
          "legend": {
            "h": "#D8C49A",
            "t": "accent"
          }
        },
        {
          "x": 24,
          "y": 8,
          "group": "bd",
          "rows": [
            ".YYYY.",
            "YWWWWY",
            "YWWWWY",
            "YWWWWY",
            "YWWWWY",
            ".YYYY."
          ],
          "legend": {
            "Y": "#C9A13B",
            "W": "#F7F4EC"
          }
        },
        {
          "x": 26,
          "y": 9,
          "group": "needle",
          "rows": [
            ".r",
            ".r",
            "k.",
            "k."
          ],
          "legend": {
            "r": "#E5484D",
            "k": "#3B3B40"
          }
        }
      ]
    },
    "other": {
      "parts": []
    }
  }
}
// ART:END

// Each outfit's accent ("accent" in the art).
export const COSTUME_ACCENT: Record<string, string> = {
  fable: '#7F77DD',
  heavy: '#D85A30',
  careful: '#BA7517',
  doll: '#E0218A',
  medium: '#378ADD',
  light: '#1D9E75',
  haiku: '#3E9B5F',
  sonnet: '#C2569B',
  explore: '#888780',
  other: '#888780',
}

// What each outfit is called, for an image's alt text.
export const COSTUME_NAME: Record<string, string> = {
  fable: 'wizard',
  heavy: 'scientist',
  careful: 'painter',
  doll: 'doll',
  medium: 'cowboy',
  light: 'ninja',
  haiku: 'gardener',
  sonnet: 'musician',
  explore: 'explorer',
  other: 'crab',
}

// --- Motion -------------------------------------------------------------------------------------

// Loops longer than the once-a-second redraw (the musician's dance, the scientist's flask, the
// painter's strokes, the explorer's glances) run from the phase the drawing passes in (`--d`, a
// negative delay), so they carry on where they were instead of starting over.
export { DANCE_SECONDS }

// The musician's b-boy routine: toprock (sway and bounce on the beat), a drop, a one-turn headspin in
// 45 degree steps, a freeze upside down with the legs to the sky, then a pop back up and a hop.
const DANCE: Array<[number, string]> = [
  [0, 'translate(-1px,0)'], [0.25, 'translate(0,1px)'], [0.5, 'translate(1px,0)'], [0.75, 'translate(0,1px)'],
  [1, 'translate(-1px,0)'], [1.25, 'translate(0,1px)'],
  [1.5, 'translate(0,1px) rotate(45deg)'], [1.55, 'translate(0,1px) rotate(90deg)'], [1.6, 'translate(0,1px) rotate(135deg)'],
  ...Array.from({ length: 8 }, (_, k): [number, string] => [1.65 + k * 0.10625, `translate(0,1px) rotate(${180 + 45 * k}deg)`]),
  [2.5, 'translate(0,2px) rotate(180deg)'], [2.56, 'translate(0,2px) rotate(135deg)'],
  [3.5, 'translate(0,1px) rotate(90deg)'], [3.55, 'translate(0,1px) rotate(45deg)'], [3.6, 'translate(0,1px) rotate(0deg)'],
  [3.65, 'translate(0,-2px)'], [3.7, 'translate(0,-3px)'], [3.8, 'translate(0,-2px)'], [3.85, 'translate(0,-1px)'],
  [3.9, 'translate(0,0)'],
]
// Legs and arms through the same loop, as [second, lift]: on the beat in the toprock, legs tucked in
// the spin, one arm up in the freeze.
const DANCE_LIMBS: Record<string, Array<[number, number]>> = {
  la: [[0, -1], [0.25, 0], [0.5, -1], [0.75, 0], [1, -1], [1.25, 0], [1.5, 0], [1.65, -1], [2.5, 0]],
  lb: [[0, 0], [0.25, -1], [0.5, 0], [0.75, -1], [1, 0], [1.25, -1], [1.5, 0], [1.65, -1], [2.5, 0]],
  cl: [[0, -3], [0.25, 0], [0.5, -3], [0.75, 0], [1, -3], [1.25, 0], [1.5, 0]],
  cr: [[0, 0], [0.25, -3], [0.5, 0], [0.75, -3], [1, 0], [1.25, -3], [1.5, 0], [2.5, -4], [3.5, 0]],
}

// The scientist's body: the walking bounce, and a shake while the flask blows (2.15 s to 2.45 s).
const SHAKE: Array<[number, string]> = Array.from({ length: 80 }, (_, k): [number, string] => {
  const t = k * 0.05
  const bob = ((t + 0.125) % 0.5) / 0.5 >= 0.5 ? 1 : 0
  const shake = t >= 2.15 && t < 2.45 ? (k % 2 ? 1 : -1) : 0
  return [t, `translate(${shake}px,${bob}px)`]
})

// The scientist's bubbles: three rise from the flask, then the fourth second is the blast.
const BUBBLES: Array<[number, string]> = [0, 1, 3].flatMap((k): Array<[number, string]> => [
  [k, 'transform:translateY(1px);opacity:0'],
  [k + 0.25, 'opacity:1'],
  [k + 0.99, 'transform:translateY(-4px);opacity:0'],
]).concat([[2, 'transform:translateY(1px);opacity:0'], [2.99, 'transform:translateY(1px);opacity:0']])

const flashes = (on: number, off: number): Array<[number, string]> => [[0, 'opacity:0'], [on, 'opacity:1'], [off, 'opacity:0']]
const stroke = (start: number): Array<[number, string]> => [
  [0, 'opacity:0'], [start - 0.01, 'opacity:0'], [start, 'opacity:1'], [1.6, 'opacity:1'], [2, 'opacity:0'],
]

const LONG_LOOPS = [
  keyframes('bb', move(DANCE)),
  ...Object.entries(DANCE_LIMBS).map(([cls, steps]) =>
    keyframes(`bb-${cls}`, steps.map(([second, lift]): [number, string] => [second, `transform:translateY(${lift}px)`])),
  ),
  '.c-sonnet.run .bd{animation:none}',
  `.c-sonnet.run .dn{transform-origin:50% 57.143%;animation:bb ${DANCE_SECONDS}s steps(1,end) infinite var(--d,0s)}`,
  ...Object.keys(DANCE_LIMBS).map(
    cls => `.c-sonnet.run .${cls}{animation:bb-${cls} ${DANCE_SECONDS}s steps(1,end) infinite var(--d,0s)}`,
  ),
  keyframes('shake', move(SHAKE)),
  keyframes('bub', BUBBLES),
  keyframes('pop', flashes(2, 2.15)),
  keyframes('boom', flashes(2.15, 2.45)),
  keyframes('smoke', [[0, 'transform:translateY(0);opacity:0'], [2.4, 'transform:translateY(0);opacity:0'],
    [2.401, 'transform:translateY(0);opacity:1'], [3.2, 'transform:translateY(-3px);opacity:0']]),
  '.c-heavy .pop,.c-heavy .boom,.c-heavy .smoke{opacity:0}',
  `.c-heavy.run .bd{animation:shake 4s steps(1,end) infinite var(--d,0s)}`,
  `.c-heavy.run .bub{animation:bub 4s ease-out infinite var(--d,0s)}`,
  `.c-heavy.run .pop{animation:pop 4s steps(1,end) infinite var(--d,0s)}`,
  `.c-heavy.run .boom{animation:boom 4s steps(1,end) infinite var(--d,0s)}`,
  `.c-heavy.run .smoke{animation:smoke 4s linear infinite var(--d,0s)}`,
  keyframes('pa', stroke(0.2), 2),
  keyframes('pb', stroke(0.5), 2),
  keyframes('pc', stroke(0.8), 2),
  ...['pa', 'pb', 'pc'].map(cls => `.c-careful.run .${cls}{animation:${cls} 2s linear infinite var(--d,0s)}`),
  keyframes('look', [[0, 'transform:translateX(-1px)'], [0.8, 'transform:translateX(0)'], [1, 'transform:translateX(1px)'],
    [1.8, 'transform:translateX(0)']], 2),
  `.c-explore.run .eye{animation:look 2s steps(1,end) infinite var(--d,0s)}`,
].join('\n')

// Pure CSS, run by the compositor. Every crab walks: legs step in turn, the body bobs, the arms wave
// by turns; each outfit adds its props' motion on top.
export const CRAB_CSS = `<style>
.run .la{animation:st .5s steps(1) infinite}.run .lb{animation:st .5s steps(1) infinite -.25s}
.run .bd{animation:bob .5s steps(1) infinite -.125s}
.run .cl{animation:st 1s steps(1) infinite}.run .cr{animation:st 1s steps(1) infinite -.5s}
.run g{transform-box:fill-box}
@keyframes st{50%{transform:translateY(-1px)}}@keyframes bob{50%{transform:translateY(1px)}}@keyframes blink{50%{opacity:.2}}
.c-fable.run{animation:float 1s ease-in-out infinite}
.c-fable.run .la,.c-fable.run .lb,.c-fable.run .bd,.c-fable.run .cl,.c-fable.run .cr{animation:none}
.c-fable.run .it{transform-origin:0 100%;animation:wand 1s ease-in-out infinite}
.c-fable.run .star{animation:blink .5s steps(1) infinite -.25s}
@keyframes float{50%{transform:translateY(-2px)}}@keyframes wand{25%{transform:rotate(15deg)}75%{transform:rotate(-15deg)}}
.c-careful.run .it{transform-origin:50% 100%;animation:brush .5s ease-in-out infinite}
@keyframes brush{50%{transform:rotate(-25deg)}}
.c-medium.run .loop{transform-origin:50% 50%;animation:lasso 1s ease-in-out infinite}
@keyframes lasso{50%{transform:scaleX(.2)}}
.c-light.run .la{animation-duration:.25s}.c-light.run .lb{animation-duration:.25s;animation-delay:-.125s}
.c-light.run .flag{transform-origin:0 50%;animation:flutter .25s steps(1) infinite}
.c-light.run .it{transform-origin:50% 50%;animation:spin .25s steps(1) infinite}
@keyframes flutter{50%{transform:skewY(-14deg) scaleX(.85)}}@keyframes spin{50%{transform:rotate(45deg)}}
.c-haiku.run .can{transform-origin:100% 50%;animation:pour 1s ease-in-out infinite}
.c-haiku.run .drop{animation:drip 1s linear infinite}
@keyframes pour{20%,40%{transform:rotate(-15deg)}60%{transform:rotate(0)}}
@keyframes drip{0%{transform:translateY(0);opacity:1}100%{transform:translateY(4px);opacity:0}}
.c-sonnet.run .nt{animation:rise 1s ease-out infinite var(--d,0s)}.c-sonnet.run .nt2{animation:rise 1s ease-out infinite calc(var(--d,0s) - .5s)}
@keyframes rise{0%{transform:translateY(3px);opacity:0}25%{opacity:1}100%{transform:translateY(-4px);opacity:0}}
.c-explore.run .needle{transform-origin:50% 50%;animation:swing 1s ease-in-out infinite}
@keyframes swing{25%{transform:rotate(30deg)}75%{transform:rotate(-30deg)}}
${LONG_LOOPS}
@media (prefers-reduced-motion: reduce){.run,.run g{animation:none!important}}
</style>`

// --- Drawing ------------------------------------------------------------------------------------

type Run = { x: number; y: number; w: number; colour: string; group: string }

// The outfit's pixels, merged into horizontal runs of one colour in one group, base first.
const runsOf = (outfit: string, accent: string): Run[] => {
  const pixels: Array<{ x: number; y: number; colour: string; group: string }> = []
  ART.base.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const cell = ART.base.legend[ch]
      if (!cell) return
      if (cell[2]) pixels.push({ x, y, colour: cell[2], group: 'bd' })
      pixels.push({ x, y, colour: cell[0], group: cell[1] })
    }),
  )
  for (const part of ART.outfits[outfit]?.parts ?? []) {
    part.rows.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        const colour = part.legend[ch]
        if (colour) pixels.push({ x: part.x + i, y: part.y + j, colour: colour === 'accent' ? accent : colour, group: part.group })
      }),
    )
  }
  const runs: Run[] = []
  for (const p of pixels) {
    const last = runs[runs.length - 1]
    if (last && last.y === p.y && last.x + last.w === p.x && last.colour === p.colour && last.group === p.group) last.w += 1
    else runs.push({ x: p.x, y: p.y, w: 1, colour: p.colour, group: p.group })
  }
  return runs
}

// Props that stay put while the crab dances: drawn outside the dancing group.
const STILL_PROPS = new Set(['nt', 'nt2'])

// One crab's markup in its own 30 x 28 grid, for a caller to place and scale. Body and props nest
// inside `bd` so a prop rides the bob and adds its own motion; legs stay outside it and step on
// their own; `dn` holds all of them (and a frame that fixes its box, the dance's pivot), and the
// still props sit outside it. `phase` is how long the agent has run, in seconds: where the long
// loops pick up after a redraw.
export const crabMarkup = (costume: string, accent: string, isWalking: boolean, phase = 0): string => {
  const groups = new Map<string, string[]>([['bd', []]])
  for (const r of runsOf(ART.outfits[costume] ? costume : 'other', accent)) {
    if (!groups.has(r.group)) groups.set(r.group, [])
    groups.get(r.group)?.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="${r.colour}"/>`)
  }
  const group = (cls: string) => `<g class="${cls}">${(groups.get(cls) ?? []).join('')}</g>`
  const props = [...groups.keys()].filter(k => k !== 'bd' && k !== 'la' && k !== 'lb')
  const moving = props.filter(k => !STILL_PROPS.has(k))
  const still = props.filter(k => STILL_PROPS.has(k))
  const body = `<g class="bd">${(groups.get('bd') ?? []).join('')}${moving.map(group).join('')}</g>`
  const delay = isWalking && phase > 0 ? ` style="--d:-${(phase % DANCE_SECONDS).toFixed(2)}s"` : ''
  return (
    `<g class="c-${costume}${isWalking ? ' run' : ''}"${delay}>` +
    `<g class="dn"><rect x="0" y="0" width="30" height="28" fill="none"/>${body}${group('la')}${group('lb')}</g>` +
    `${still.map(group).join('')}</g>`
  )
}
