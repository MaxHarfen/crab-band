"""Redraw the README's crab GIFs (light and dark) from crab-band/hooks: the pictures from the ART block in
crab.ts, the dances from the MOVES block in moves.ts, so the GIFs show what the plugin draws.

Only the props' motion is a Python copy (of PROP_CSS in crab.ts), so when a prop or its animation changes,
change it here too.

Usage: python3 docs/make_crab_gif.py docs       writes docs/crabs-light.gif and docs/crabs-dark.gif
       python3 docs/make_crab_gif.py --check    writes nothing: prints each outfit's measured extent and
                                                exits 1 if any frame leaves its routine's box
"""
import json
import math
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

HOOKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'crab-band', 'hooks')
CRAB_TS = os.path.join(HOOKS, 'crab.ts')


def block(path, name):
    """The strict JSON between a file's `// NAME:BEGIN` and `// NAME:END` lines."""
    text = open(path).read()
    start = text.index(f'// {name}:BEGIN') + len(f'// {name}:BEGIN')
    return json.loads(text[start:text.index(f'// {name}:END')])


def table(path, name):
    """One of crab.ts's `Record<string, string>` literals (COSTUME_ACCENT, COSTUME_NAME)."""
    text = open(path).read()
    body = text[text.index(f'export const {name}'):]
    return dict(re.findall(r"(\w+): '([^']*)'", body[body.index('{') + 1:body.index('}')]))


ART = block(CRAB_TS, 'ART')
MOVES = block(os.path.join(HOOKS, 'moves.ts'), 'MOVES')
ACCENT = table(CRAB_TS, 'COSTUME_ACCENT')
NAME = table(CRAB_TS, 'COSTUME_NAME')

S = 5                           # pixels per grid unit
WX, WY, WW, WH = 16, 20, 62, 64  # the working canvas in units, far larger than any routine's box, and where
#                                 the crab's grid origin sits on it: nothing is clipped while a frame is built
MS, LOOP = 50, 4.0              # 80 frames of 50 ms: one 4 s loop


def rects(outfit):
    out = []
    for y, row in enumerate(ART['base']['rows']):
        for x, ch in enumerate(row):
            if ch in ART['base']['legend']:
                cell = ART['base']['legend'][ch]
                if len(cell) > 2:  # an underlay in the body beneath a group that moves on its own
                    out.append((x, y, 1, 1, cell[2], 'bd'))
                out.append((x, y, 1, 1, cell[0], cell[1]))
    for part in ART['outfits'][outfit]['parts']:
        for j, row in enumerate(part['rows']):
            for i, ch in enumerate(row):
                if ch in part['legend']:
                    colour = part['legend'][ch]
                    out.append((part['x'] + i, part['y'] + j, 1, 1, ACCENT[outfit] if colour == 'accent' else colour,
                                part['group']))
    return out


def color(c):
    c = c.lstrip('#')
    return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), 255)


def groups_of(costume):
    groups, order = {}, []
    for (x, y, w, h, c, g) in rects(costume):
        if g not in groups:
            groups[g] = []
            order.append(g)
        groups[g].append((x, y, w, h, c))
    return groups, order


def blank():
    return Image.new('RGBA', (WW * S, WH * S), (0, 0, 0, 0))


def layer(rects):
    img = blank()
    for (x, y, w, h, c) in rects:
        img.alpha_composite(Image.new('RGBA', (w * S, h * S), color(c)), ((x + WX) * S, (y + WY) * S))
    return img


def bbox(rects):
    return (min(r[0] for r in rects), min(r[1] for r in rects),
            max(r[0] + r[2] for r in rects), max(r[1] + r[3] for r in rects))


def ease(p):
    return 0.5 - 0.5 * math.cos(math.pi * p)


def half(t, period, delay=0.0):
    """Whether t falls in the second half of a period that starts delay in, in whole ms as crabCss reckons it."""
    ms, p, d = round(t * 1000), round(period * 1000), round(delay * 1000)
    return (ms - d) % p >= p / 2


def px(gx, gy):
    return ((gx + WX) * S, (gy + WY) * S)


def move(img, dx=0, dy=0, angle=0, origin=None, opacity=1.0, skew=None):
    out = img
    if angle:
        out = out.rotate(-angle, resample=Image.NEAREST, center=origin)
    if skew:
        ox, oy, k, sx = skew
        out = out.transform(out.size, Image.AFFINE, (1 / sx, 0, ox - ox / sx, -math.tan(k), 1, math.tan(k) * ox),
                            resample=Image.NEAREST)
    if dx or dy:
        ox, oy = int(round(dx * S)), int(round(dy * S))
        moved = blank()
        sx0, sy0 = max(0, -ox), max(0, -oy)
        sx1, sy1 = min(out.width, out.width - ox), min(out.height, out.height - oy)
        if sx1 > sx0 and sy1 > sy0:
            moved.alpha_composite(out.crop((sx0, sy0, sx1, sy1)), (sx0 + ox, sy0 + oy))
        out = moved
    if opacity < 1:
        out = out.copy()
        out.putalpha(out.getchannel('A').point(lambda v: int(v * max(0.0, opacity))))
    return out


def rise(canvas, img, t, off=0.0, start=3, end=-4):
    """A prop floating up and fading, once a second: the `rise` keyframes (eased out)."""
    q = (t + off) % 1
    eo = 1 - (1 - q) ** 2
    a = q / 0.25 if q < 0.25 else max(0.0, 1 - (q - 0.25) / 0.75)
    canvas.alpha_composite(move(img, dy=start + (end - start) * eo, opacity=a))


# --- The dance: a pose of the whole crab, the body's squat, each claw and each leg pair, from MOVES ------

REST = {'jx': 0, 'jy': 0, 'rot': 0, 'mirror': False, 'b': 0, 'cl': (0, 0), 'cr': (0, 0), 'la': 0, 'lb': 0}


def pose(name, t):
    """The routine's pose at t: each key holds until the next one (steps(1,end))."""
    keys = MOVES[name]['keys']
    cur = keys[0][1]
    for second, p in keys:
        if second <= t + 1e-9:
            cur = p
    return {**REST, **cur}


def props(name, groups, order, layers, t):
    """Each outfit's own prop motion, as PROP_CSS has it: drawn into the body, which rides the dance."""
    out, later = [], []
    ms = round((t % LOOP) * 1000)
    for cls in order:
        if cls in ('la', 'lb', 'cl', 'cr', 'nt', 'nt2'):
            continue
        img, rects = layers[cls], groups[cls]
        x0, y0, x1, y1 = bbox(rects)
        p = t % 1
        kw, dy = {}, 0
        if name == 'fable' and cls == 'it':          # the wand waves
            kw['angle'], kw['origin'] = 15 * math.sin(2 * math.pi * p), px(x0, y1)
        elif name == 'fable' and cls == 'star':      # the star blinks, twice as fast while he rises
            kw['opacity'] = 0.2 if half(t, 0.25 if 1000 <= ms < 2500 else 0.5, 0.125) else 1
        elif name == 'heavy' and cls == 'bub':       # bubbles rise out of the flask, but not while it blows
            if not 2000 <= ms < 3000:
                later.append(img)
            continue
        elif name == 'heavy' and cls == 'pop':
            if not 2000 <= ms < 2150:
                continue
        elif name == 'heavy' and cls == 'boom':
            if not 2150 <= ms < 2450:
                continue
        elif name == 'heavy' and cls == 'smoke':
            q = (ms - 2400) / 800
            if not 0 <= q < 1:
                continue
            dy, kw['opacity'] = -3 * q, 1 - q
        elif name == 'careful' and cls == 'it':      # the brush strokes
            q = (t % 0.5) / 0.5
            kw['angle'], kw['origin'] = -25 * ease(q / 0.5 if q < 0.5 else (1 - q) / 0.5), px((x0 + x1) / 2, y1)
        elif name == 'careful' and cls in ('pa', 'pb', 'pc'):   # colours appear one by one, then fade
            q = t % 2
            start = {'pa': 0.2, 'pb': 0.5, 'pc': 0.8}[cls]
            if q < start:
                continue
            kw['opacity'] = 1 if q < 1.6 else max(0.0, 1 - (q - 1.6) / 0.4)
        elif name == 'doll' and cls == 'hair':       # the hair swings out on the flip
            a = 10 if 2000 <= ms < 2150 else (-12 if 2150 <= ms < 2300 else 0)
            if a:
                kw['angle'], kw['origin'] = a, px(15, 8)
        elif name == 'doll' and cls == 'skirt' and 2500 <= ms < 2875:   # the skirt flares on the turn
            cx = px((x0 + x1) / 2, 0)[0]
            img = img.transform(img.size, Image.AFFINE, (1 / 1.2, 0, cx - cx / 1.2, 0, 1, 0), resample=Image.NEAREST)
        elif name == 'doll' and cls == 'sp':         # the sparkle twinkles, faster in the closing pose
            kw['opacity'] = 0.15 if half(t, 0.25 if ms >= 3000 else 0.5, 0.1) else 1
        elif name == 'doll' and cls == 'ht':         # a heart floats up every second
            eo = 1 - (1 - p) ** 2
            kw['opacity'] = p / 0.25 if p < 0.25 else max(0.0, 1 - (p - 0.25) / 0.75)
            dy = 2 - 7 * eo
        elif name == 'medium' and cls == 'loop':     # the lasso spins: its loop narrows and widens
            w = max(abs(math.cos(math.pi * p)), 0.2)
            cx = px((x0 + x1) / 2, 0)[0]
            img = img.transform(img.size, Image.AFFINE, (1 / w, 0, cx - cx / w, 0, 1, 0), resample=Image.NEAREST)
        elif name == 'light' and cls == 'flag' and half(t, 0.25):   # the headband flutters
            ox, oy = px(x0, (y0 + y1) / 2)
            kw['skew'] = (ox, oy, math.radians(-14), 0.85)
        elif name == 'light' and cls == 'it':        # the throwing star spins
            kw['angle'], kw['origin'] = 45 * (int(t / 0.125) % 2), px((x0 + x1) / 2, (y0 + y1) / 2)
        elif name == 'haiku' and cls == 'can':       # the can tips to pour
            a = 0 if p >= 0.6 else (-15 * (p / 0.2) if p < 0.2 else (-15 if p < 0.4 else -15 * (1 - (p - 0.4) / 0.2)))
            kw['angle'], kw['origin'] = a, px(x1, (y0 + y1) / 2)
        elif name == 'haiku' and cls == 'drop':      # drops fall
            kw['opacity'] = max(0.0, 1 - p)
            dy = 4 * p
        elif name == 'explore' and cls == 'eye':     # the eyes glance left, then right
            q = t % 2
            kw['dx'] = -1 if q < 0.8 else (0 if q < 1 else (1 if q < 1.8 else 0))
        elif name == 'explore' and cls == 'needle':  # the compass needle swings
            kw['angle'], kw['origin'] = 30 * math.sin(2 * math.pi * p), px(27, 11)
        out.append((img, dy, kw))
    return out, later


def notes(canvas, layers, t):
    """The musician's notes, outside the dance: they rise in place while he spins."""
    for cls, off in (('nt', 0.0), ('nt2', 0.5)):
        if cls in layers:
            rise(canvas, layers[cls], t, off=off, start=3, end=-4)


def frame(name, groups, order, layers, t):
    """One frame on the working canvas, as the SVG nests it: props in the body, then the claws, the legs
    outside the body, the whole crab mirrored and turned about its pivot, then moved; the still props last."""
    P = pose(name, t % LOOP)
    ox, oy = MOVES[name]['origin']
    body = blank()
    drawn, later = props(name, groups, order, layers, t)
    for img, dy, kw in drawn:
        body.alpha_composite(move(img, dx=kw.pop('dx', 0), dy=dy + P['b'], **kw))
    for c in ('cl', 'cr'):
        if c in layers:
            dx, dy = P[c]
            body.alpha_composite(move(layers[c], dx=dx, dy=dy + P['b']))
    for c in ('la', 'lb'):
        if c in layers:
            body.alpha_composite(move(layers[c], dy=P[c]))
    for img in later:
        rise(body, img, t, start=1 + P['b'], end=-4)
    if P['mirror']:  # about the pivot's x: flip the canvas, then put the pivot back where it was
        body = move(body.transpose(Image.FLIP_LEFT_RIGHT), dx=(2 * px(ox, 0)[0] - WW * S) / S)
    if P['rot'] % 360:
        body = body.rotate(-P['rot'], resample=Image.NEAREST, center=px(ox, oy))
    canvas = move(body, dx=P['jx'], dy=P['jy'])
    notes(canvas, layers, t)
    return canvas


CREW = [('fable', 'Fable'), ('heavy', 'Opus max'), ('careful', 'Opus xhigh'), ('doll', 'Opus high'),
        ('medium', 'Opus medium'), ('light', 'Opus low'), ('haiku', 'Haiku'), ('sonnet', 'Sonnet'),
        ('explore', 'Explore'), ('other', 'other agents')]
FRAMES = int(LOOP * 1000 / MS)

prepared = []
for name, rule in CREW:
    g, o = groups_of(name)
    prepared.append((name, rule, g, o, {c: layer(r) for c, r in g.items()}))


def check():
    """Every frame of every outfit inside its routine's box, measured on the working canvas."""
    bad = False
    for name, rule, g, o, layers in prepared:
        ext = None
        for k in range(FRAMES):
            b = frame(name, g, o, layers, k * MS / 1000).getchannel('A').getbbox()
            if b:
                ext = b if ext is None else (min(ext[0], b[0]), min(ext[1], b[1]), max(ext[2], b[2]), max(ext[3], b[3]))
        clipped = ext[0] <= 0 or ext[1] <= 0 or ext[2] >= WW * S or ext[3] >= WH * S
        x0, y0 = math.floor(ext[0] / S) - WX, math.floor(ext[1] / S) - WY
        x1, y1 = math.ceil(ext[2] / S) - WX, math.ceil(ext[3] / S) - WY
        bx, by, bw, bh = MOVES[name]['box']
        inside = bx <= x0 and by <= y0 and x1 <= bx + bw and y1 <= by + bh and not clipped
        bad = bad or not inside
        print(f'{name:8} extent x {x0}..{x1} y {y0}..{y1}  box {MOVES[name]["box"]}  '
              f'{"ok" if inside else "TOUCHES THE CANVAS EDGE" if clipped else "LEAVES ITS BOX"}')
    return 1 if bad else 0


if __name__ == '__main__':
    if sys.argv[1:] == ['--check']:
        sys.exit(check())
    OUT = sys.argv[1]

    # One cell per crab, all the same size: every routine's box fits, the crabs' grids aligned.
    UX0 = min(MOVES[n]['box'][0] for n, _ in CREW)
    UY0 = min(MOVES[n]['box'][1] for n, _ in CREW)
    UX1 = max(MOVES[n]['box'][0] + MOVES[n]['box'][2] for n, _ in CREW)
    UY1 = max(MOVES[n]['box'][1] + MOVES[n]['box'][3] for n, _ in CREW)
    CROP = ((WX + UX0) * S, (WY + UY0) * S, (WX + UX1) * S, (WY + UY1) * S)
    CW, CH = (UX1 - UX0) * S, (UY1 - UY0) * S

    try:
        BOLD = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 15)
        REG = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13)
    except OSError:
        BOLD = REG = ImageFont.load_default()

    GAP, LABEL, PAD = 8, 44, 16   # one row: each crab in its cell, its name and rule under it
    W = PAD * 2 + len(CREW) * (CW + GAP) - GAP
    H = PAD + CH + LABEL + 6
    cells = [[frame(name, g, o, layers, i * MS / 1000).crop(CROP) for i in range(FRAMES)]
             for name, rule, g, o, layers in prepared]

    def board(i, bg, fg, sub):
        img = Image.new('RGBA', (W, H), color(bg))
        d = ImageDraw.Draw(img)
        for k, (name, rule, g, o, layers) in enumerate(prepared):
            x = PAD + k * (CW + GAP)
            img.alpha_composite(cells[k][i], (x, PAD))
            ty = PAD + CH + 2
            d.text((x + CW / 2, ty), NAME[name], fill=fg, font=BOLD, anchor='mt')
            d.text((x + CW / 2, ty + 20), rule, fill=sub, font=REG, anchor='mt')
        return img

    for theme, bg, fg, sub in [('light', '#FFFFFF', '#1F1F1F', '#6B6B68'), ('dark', '#0D1117', '#E6EDF3', '#9198A1')]:
        frames = [board(i, bg, fg, sub).convert('RGB') for i in range(FRAMES)]
        strip = Image.new('RGB', (W, H * len(frames)))  # one palette for every frame, so pixels that stay put
        for i, f in enumerate(frames):                   # are written once and the GIF stays small
            strip.paste(f, (0, i * H))
        shared = strip.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        pal = [f.quantize(palette=shared, dither=Image.Dither.NONE) for f in frames]
        pal[0].save(f'{OUT}/crabs-{theme}.gif', save_all=True, append_images=pal[1:], duration=MS, loop=0,
                    optimize=True, disposal=1)
        print(f'{OUT}/crabs-{theme}.gif', (W, H), f'{os.path.getsize(f"{OUT}/crabs-{theme}.gif") // 1024} KB')
