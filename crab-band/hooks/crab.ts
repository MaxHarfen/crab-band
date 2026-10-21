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

import { DANCE_SECONDS, keyframes, move, routineCss } from './moves'

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

// Every crab dances its outfit's routine (moves.ts) while its agent works; its props keep their own
// motion on top. Loops longer than the once-a-second redraw (the dances, the scientist's flask, the
// painter's strokes, the explorer's glances, the wizard's star, the doll's flip and twinkle) run from
// the phase the drawing passes in (`--d`, a negative delay), so they carry on where they were instead
// of starting over.
export { DANCE_SECONDS }

// Whether `ms` into the loop falls in the second half of a `period` that starts `delay` in.
const late = (ms: number, period: number, delay: number): boolean => (((ms - delay) % period) + period) % period >= period / 2

// A prop that dims and brightens over the 4 s loop, read every `stepMs`, held between changes.
const blinks = (name: string, stepMs: number, dimmed: string, isDim: (ms: number) => boolean): string => {
  const steps: Array<[number, string]> = []
  for (let ms = 0; ms < DANCE_SECONDS * 1000; ms += stepMs) {
    const rule = isDim(ms) ? `opacity:${dimmed}` : 'opacity:1'
    if (steps[steps.length - 1]?.[1] !== rule) steps.push([ms / 1000, rule])
  }
  return keyframes(name, steps)
}

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
const loop = (cls: string, name: string, timing: string, outfit: string, extra = ''): string =>
  `.c-${outfit}.run .${cls}{${extra}animation:${name} ${DANCE_SECONDS}s ${timing} infinite var(--d,0s)}`

// Each outfit's props and how they move, with the routine's timing where they follow the dance.
const PROP_CSS: Record<string, string[]> = {
  fable: [
    '.c-fable.run .it{transform-origin:0 100%;animation:wand 1s ease-in-out infinite}',
    '@keyframes wand{25%{transform:rotate(15deg)}75%{transform:rotate(-15deg)}}',
    // The star blinks every half second, and twice as fast while he rises (1 s to 2.5 s).
    blinks('star', 125, '.2', ms => late(ms, ms >= 1000 && ms < 2500 ? 250 : 500, 125)),
    loop('star', 'star', 'steps(1,end)', 'fable'),
  ],
  heavy: [
    keyframes('bub', BUBBLES),
    keyframes('pop', flashes(2, 2.15)),
    keyframes('boom', flashes(2.15, 2.45)),
    keyframes('smoke', [[0, 'transform:translateY(0);opacity:0'], [2.4, 'transform:translateY(0);opacity:0'],
      [2.401, 'transform:translateY(0);opacity:1'], [3.2, 'transform:translateY(-3px);opacity:0']]),
    '.c-heavy .pop,.c-heavy .boom,.c-heavy .smoke{opacity:0}',
    loop('bub', 'bub', 'ease-out', 'heavy'),
    loop('pop', 'pop', 'steps(1,end)', 'heavy'),
    loop('boom', 'boom', 'steps(1,end)', 'heavy'),
    loop('smoke', 'smoke', 'linear', 'heavy'),
  ],
  careful: [
    '.c-careful.run .it{transform-origin:50% 100%;animation:brush .5s ease-in-out infinite}',
    '@keyframes brush{50%{transform:rotate(-25deg)}}',
    keyframes('pa', stroke(0.2), 2),
    keyframes('pb', stroke(0.5), 2),
    keyframes('pc', stroke(0.8), 2),
    ...['pa', 'pb', 'pc'].map(cls => `.c-careful.run .${cls}{animation:${cls} 2s linear infinite var(--d,0s)}`),
  ],
  doll: [
    // The hair swings out on the flip, the skirt flares on the turn, the sparkle twinkles (faster in
    // the closing pose) and a heart floats up every second.
    keyframes('hair', move([[0, 'rotate(0deg)'], [2, 'rotate(10deg)'], [2.15, 'rotate(-12deg)'], [2.3, 'rotate(0deg)']])),
    loop('hair', 'hair', 'steps(1,end)', 'doll', 'transform-origin:50% 18.75%;'),
    keyframes('flare', move([[0, 'scaleX(1)'], [2.5, 'scaleX(1.2)'], [2.875, 'scaleX(1)']])),
    loop('skirt', 'flare', 'steps(1,end)', 'doll', 'transform-origin:50% 0;'),
    blinks('twinkle', 25, '.15', ms => late(ms, ms >= 3000 ? 250 : 500, 100)),
    loop('sp', 'twinkle', 'steps(1,end)', 'doll'),
    '@keyframes heart{0%{transform:translateY(2px);opacity:0}25%{opacity:1}100%{transform:translateY(-5px);opacity:0}}',
    '.c-doll.run .ht{animation:heart 1s ease-out infinite var(--d,0s)}',
  ],
  medium: [
    '.c-medium.run .loop{transform-origin:50% 50%;animation:lasso 1s ease-in-out infinite}',
    '@keyframes lasso{50%{transform:scaleX(.2)}}',
  ],
  light: [
    '.c-light.run .flag{transform-origin:0 50%;animation:flutter .25s steps(1) infinite}',
    '.c-light.run .it{transform-origin:50% 50%;animation:spin .25s steps(1) infinite}',
    '@keyframes flutter{50%{transform:skewY(-14deg) scaleX(.85)}}@keyframes spin{50%{transform:rotate(45deg)}}',
  ],
  haiku: [
    '.c-haiku.run .can{transform-origin:100% 50%;animation:pour 1s ease-in-out infinite}',
    '.c-haiku.run .drop{animation:drip 1s linear infinite}',
    '@keyframes pour{20%,40%{transform:rotate(-15deg)}60%{transform:rotate(0)}}',
    '@keyframes drip{0%{transform:translateY(0);opacity:1}100%{transform:translateY(4px);opacity:0}}',
  ],
  sonnet: [
    '.c-sonnet.run .nt{animation:rise 1s ease-out infinite var(--d,0s)}.c-sonnet.run .nt2{animation:rise 1s ease-out infinite calc(var(--d,0s) - .5s)}',
    '@keyframes rise{0%{transform:translateY(3px);opacity:0}25%{opacity:1}100%{transform:translateY(-4px);opacity:0}}',
  ],
  explore: [
    '.c-explore.run .needle{transform-origin:50% 50%;animation:swing 1s ease-in-out infinite}',
    '@keyframes swing{25%{transform:rotate(30deg)}75%{transform:rotate(-30deg)}}',
    keyframes('look', [[0, 'transform:translateX(-1px)'], [0.8, 'transform:translateX(0)'], [1, 'transform:translateX(1px)'],
      [1.8, 'transform:translateX(0)']], 2),
    '.c-explore.run .eye{animation:look 2s steps(1,end) infinite var(--d,0s)}',
  ],
  other: [],
}

// An outfit nobody drew (a new savvy tier, a typo) is the plain crab, its dance and all.
const outfitOf = (costume: string): string => (ART.outfits[costume] ? costume : 'other')

// One crab's stylesheet: pure CSS, run by the compositor. It holds only that crab's outfit: the
// shared rules, its props' motion and its dance. Reduced motion freezes all of it.
export const crabCss = (costume: string): string => {
  const outfit = outfitOf(costume)
  return [
    '<style>',
    '.run g{transform-box:fill-box}',
    ...(PROP_CSS[outfit] ?? []),
    routineCss(outfit),
    '@media (prefers-reduced-motion: reduce){.run,.run g{animation:none!important}}',
    '</style>',
  ].join('\n')
}

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
// The claws, drawn after every other prop so they sit in front of the outfit (the doll's hair).
const CLAWS = ['cl', 'cr']

// One crab's markup in its own 30 x 28 grid, for a caller to place and scale. Body and props nest
// inside `bd` so a prop rides the squat and adds its own motion, the claws last; legs stay outside it
// and lift on their own; `dn` holds all of them (and a frame that fixes its box, the dance's pivot),
// and the still props sit outside it. `phase` is how long the agent has run, in seconds: where the
// dance and the long loops pick up after a redraw.
export const crabMarkup = (costume: string, accent: string, isWalking: boolean, phase = 0): string => {
  const outfit = outfitOf(costume)
  const groups = new Map<string, string[]>([['bd', []]])
  for (const r of runsOf(outfit, accent)) {
    if (!groups.has(r.group)) groups.set(r.group, [])
    groups.get(r.group)?.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="${r.colour}"/>`)
  }
  const group = (cls: string) => `<g class="${cls}">${(groups.get(cls) ?? []).join('')}</g>`
  const props = [...groups.keys()].filter(k => k !== 'bd' && k !== 'la' && k !== 'lb')
  const moving = [...props.filter(k => !STILL_PROPS.has(k) && !CLAWS.includes(k)), ...CLAWS.filter(k => groups.has(k))]
  const still = props.filter(k => STILL_PROPS.has(k))
  const body = `<g class="bd">${(groups.get('bd') ?? []).join('')}${moving.map(group).join('')}</g>`
  const delay = isWalking && phase > 0 ? ` style="--d:-${(phase % DANCE_SECONDS).toFixed(2)}s"` : ''
  return (
    `<g class="c-${outfit}${isWalking ? ' run' : ''}"${delay}>` +
    `<g class="dn"><rect x="0" y="0" width="30" height="28" fill="none"/>${body}${group('la')}${group('lb')}</g>` +
    `${still.map(group).join('')}</g>`
  )
}

