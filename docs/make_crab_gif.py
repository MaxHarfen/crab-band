"""Redraw the README's crab GIFs (light and dark) from the ART block in crab-band/hooks/crab.ts.

The pictures are read from crab.ts itself; only the motion is a Python copy of CRAB_CSS, so when an
outfit's props or their animation change, change them here too.

Usage: python3 docs/make_crab_gif.py docs
"""
import json
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
CRAB_TS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'crab-band', 'hooks', 'crab.ts')


def load_art(path):
    text = open(path).read()
    start = text.index('// ART:BEGIN') + len('// ART:BEGIN')
    return json.loads(text[start:text.index('// ART:END')])


ART = load_art(CRAB_TS)
ACCENT = {'fable': '#7F77DD', 'heavy': '#D85A30', 'careful': '#BA7517', 'medium': '#378ADD', 'light': '#1D9E75',
          'haiku': '#3E9B5F', 'sonnet': '#C2569B', 'explore': '#888780', 'other': '#888780'}
NAME = {'fable': 'wizard', 'heavy': 'scientist', 'careful': 'painter', 'medium': 'cowboy', 'light': 'ninja',
        'haiku': 'gardener', 'sonnet': 'musician', 'explore': 'explorer', 'other': 'crab'}


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
S = 5              # pixels per grid unit
GX, GY = 2, 7      # where the crab's grid origin sits in its cell: the body centred under its label
GW, GH = 34, 41    # cell in grid units: room for floating props and the dance
MS, LOOP = 50, 4.0


def color(c):
    if c.startswith('rgba'):
        r, g, b, a = [float(v) for v in c[5:-1].split(',')]
        return (int(r), int(g), int(b), int(a * 255))
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


def layer(rects):
    img = Image.new('RGBA', (GW * S, GH * S), (0, 0, 0, 0))
    for (x, y, w, h, c) in rects:
        img.alpha_composite(Image.new('RGBA', (w * S, h * S), color(c)), ((x + GX) * S, (y + GY) * S))
    return img


def bbox(rects):
    return (min(r[0] for r in rects), min(r[1] for r in rects),
            max(r[0] + r[2] for r in rects), max(r[1] + r[3] for r in rects))


def ease(p):
    return 0.5 - 0.5 * math.cos(math.pi * p)


def half(t, period, delay=0.0):
    return ((t - delay) % period) / period >= 0.5


def px(gx, gy):
    return ((gx + GX) * S, (gy + GY) * S)


def move(img, dx=0, dy=0, angle=0, origin=None, opacity=1.0, flip=None, skew=None):
    out = img
    if angle:
        out = out.rotate(-angle, resample=Image.NEAREST, center=origin)
    if skew:
        ox, oy, k, sx = skew
        out = out.transform(out.size, Image.AFFINE, (1 / sx, 0, ox - ox / sx, -math.tan(k), 1, math.tan(k) * ox),
                            resample=Image.NEAREST)
    if flip:
        x0, y0, x1, y1 = (int(v) for v in flip)
        part = out.crop((x0, y0, x1, y1)).transpose(Image.FLIP_TOP_BOTTOM)
        out = out.copy()
        out.paste((0, 0, 0, 0), (x0, y0, x1, y1))
        out.alpha_composite(part, (x0, y0))
    if dx or dy:
        ox, oy = int(round(dx * S)), int(round(dy * S))
        moved = Image.new('RGBA', out.size, (0, 0, 0, 0))
        sx0, sy0 = max(0, -ox), max(0, -oy)
        sx1, sy1 = min(out.width, out.width - ox), min(out.height, out.height - oy)
        if sx1 > sx0 and sy1 > sy0:
            moved.alpha_composite(out.crop((sx0, sy0, sx1, sy1)), (sx0 + ox, sy0 + oy))
        out = moved
    if opacity < 1:
        out = out.copy()
        out.putalpha(out.getchannel('A').point(lambda v: int(v * max(0.0, opacity))))
    return out


# The musician's b-boy routine, as crab.ts's DANCE / DANCE_LIMBS.
DANCE = [(0, (0, -1, 0)), (0.25, (0, 0, 1)), (0.5, (0, 1, 0)), (0.75, (0, 0, 1)), (1, (0, -1, 0)), (1.25, (0, 0, 1)),
         (1.5, (45, 0, 1)), (1.55, (90, 0, 1)), (1.6, (135, 0, 1))] + \
        [(1.65 + k * 0.10625, (180 + 45 * k, 0, 1)) for k in range(8)] + \
        [(2.5, (180, 0, 2)), (2.56, (135, 0, 2)), (3.5, (90, 0, 1)), (3.55, (45, 0, 1)), (3.6, (0, 0, 1)),
         (3.65, (0, 0, -2)), (3.7, (0, 0, -3)), (3.8, (0, 0, -2)), (3.85, (0, 0, -1)), (3.9, (0, 0, 0))]
LIMBS = {
    'la': [(0, -1), (0.25, 0), (0.5, -1), (0.75, 0), (1, -1), (1.25, 0), (1.5, 0), (1.65, -1), (2.5, 0)],
    'lb': [(0, 0), (0.25, -1), (0.5, 0), (0.75, -1), (1, 0), (1.25, -1), (1.5, 0), (1.65, -1), (2.5, 0)],
    'cl': [(0, -3), (0.25, 0), (0.5, -3), (0.75, 0), (1, -3), (1.25, 0), (1.5, 0)],
    'cr': [(0, 0), (0.25, -3), (0.5, 0), (0.75, -3), (1, 0), (1.25, -3), (1.5, 0), (2.5, -4), (3.5, 0)],
}


def at(steps, t):
    value = steps[0][1]
    for second, v in steps:
        if second <= t + 1e-9:
            value = v
    return value


def notes(canvas, layers, t):
    for cls, off in (('nt', 0.0), ('nt2', 0.5)):
        if cls in layers:
            q = (t + off) % 1
            eo = 1 - (1 - q) ** 2
            a = q / 0.25 if q < 0.25 else max(0.0, 1 - (q - 0.25) / 0.75)
            canvas.alpha_composite(move(layers[cls], dy=3 - 7 * eo, opacity=a))


def dance(groups, order, layers, t):
    t = t % 4
    angle, dx, dy = at(DANCE, t)
    body = Image.new('RGBA', (GW * S, GH * S), (0, 0, 0, 0))
    for cls in order:
        if cls in ('nt', 'nt2'):
            continue
        body.alpha_composite(move(layers[cls], dy=at(LIMBS[cls], t) if cls in LIMBS else 0))
    if angle % 360:
        body = body.rotate(-angle, resample=Image.NEAREST, center=px(15, 16))
    canvas = move(body, dx=dx, dy=dy)
    notes(canvas, layers, t)
    return canvas


def rise(canvas, layer, t, off=0.0, start=3, end=-4):
    q = (t + off) % 1
    eo = 1 - (1 - q) ** 2
    a = q / 0.25 if q < 0.25 else max(0.0, 1 - (q - 0.25) / 0.75)
    canvas.alpha_composite(move(layer, dy=start + (end - start) * eo, opacity=a))


def frame(name, groups, order, layers, t, still=False):
    if still:
        canvas = Image.new('RGBA', (GW * S, GH * S), (0, 0, 0, 0))
        for cls in order:
            if cls not in ('pop', 'boom', 'smoke'):   # the explosion only shows in motion
                canvas.alpha_composite(layers[cls])
        return canvas
    if name == 'sonnet':
        return dance(groups, order, layers, t)
    leg_p = 0.25 if name == 'light' else 0.5
    floats = name == 'fable'
    fl = -2 * ease((t % 1) / 0.5 if (t % 1) < 0.5 else (1 - (t % 1)) / 0.5) if floats else 0
    bob = 0 if floats else (1 if half(t, 0.5, -0.125) else 0)
    canvas = Image.new('RGBA', (GW * S, GH * S), (0, 0, 0, 0))
    later = []
    for cls in order:
        if cls in ('la', 'lb'):
            continue
        img, rects = layers[cls], groups[cls]
        x0, y0, x1, y1 = bbox(rects)
        p = t % 1
        kw = {}
        dy = 0
        if cls == 'cl' and not floats:
            dy = -1 if half(t, 1.0) else 0
        elif cls == 'cr' and not floats:
            dy = -1 if half(t, 1.0, 0.5) else 0
        elif name == 'fable' and cls == 'it':      # wand waves
            kw['angle'], kw['origin'] = 15 * math.sin(2 * math.pi * p), px(x0, y1)
        elif name == 'fable' and cls == 'star':    # spark twinkles
            kw['opacity'] = 0.2 if half(t, 0.5, 0.25) else 1
        elif name == 'heavy' and cls == 'bub':     # bubbles rise out of the flask, until it blows
            if not 1.9 <= t % 4 < 3.2:
                later.append(('rise', img, t))
            continue
        elif name == 'heavy' and cls == 'pop':
            if not 2.0 <= t % 4 < 2.15:
                continue
        elif name == 'heavy' and cls == 'boom':
            if not 2.15 <= t % 4 < 2.45:
                continue
        elif name == 'heavy' and cls == 'smoke':
            q = (t % 4 - 2.4) / 0.8
            if not 0 <= q < 1:
                continue
            dy, kw['opacity'] = -3 * q, 1 - q
        elif name == 'careful' and cls == 'it':    # brush strokes
            q = (t % 0.5) / 0.5
            kw['angle'], kw['origin'] = -25 * ease(q / 0.5 if q < 0.5 else (1 - q) / 0.5), px((x0 + x1) / 2, y1)
        elif name == 'haiku' and cls == 'can':    # can tips to pour
            a = 0 if p >= 0.6 else (-15 * (p / 0.2) if p < 0.2 else (-15 if p < 0.4 else -15 * (1 - (p - 0.4) / 0.2)))
            kw['angle'], kw['origin'] = a, px(x1, (y0 + y1) / 2)
        elif name == 'haiku' and cls == 'drop':   # drops fall
            q = t % 1
            kw['opacity'] = max(0.0, 1 - q)
            dy = 4 * q
        elif name == 'light' and cls == 'flag' and half(t, 0.25):
            ox, oy = px(x0, (y0 + y1) / 2)
            kw['skew'] = (ox, oy, math.radians(-14), 0.85)
        elif name == 'light' and cls == 'it':      # throwing star spins
            kw['angle'], kw['origin'] = 45 * (int(t / 0.125) % 2), px((x0 + x1) / 2, (y0 + y1) / 2)
        elif name == 'explore' and cls == 'eye':      # glances left, then right
            q = t % 2
            kw['dx'] = -1 if q < 0.8 else (0 if q < 1 else (1 if q < 1.8 else 0))
        elif name == 'explore' and cls == 'needle':
            kw['angle'], kw['origin'] = 30 * math.sin(2 * math.pi * p), px(27, 11)
        elif name == 'careful' and cls in ('pa', 'pb', 'pc'):   # strokes appear one by one, then fade
            q = t % 2
            start = {'pa': 0.2, 'pb': 0.5, 'pc': 0.8}[cls]
            if q < start:
                continue
            kw['opacity'] = 1 if q < 1.6 else max(0.0, 1 - (q - 1.6) / 0.4)
        elif name == 'medium' and cls == 'loop':     # the lasso spins: its loop narrows and widens
            w = abs(math.cos(math.pi * (t % 1)))
            cx = px((x0 + x1) / 2, 0)[0]
            kw['skew'] = None
            img = img.transform(img.size, Image.AFFINE, (1 / max(w, 0.2), 0, cx - cx / max(w, 0.2), 0, 1, 0), resample=Image.NEAREST)
        if cls in ('nt', 'nt2'):
            continue
        shake = (1 if int(t / 0.05) % 2 else -1) if name == 'heavy' and 2.15 <= t % 4 < 2.45 else 0
        canvas.alpha_composite(move(img, dx=kw.pop('dx', 0) + shake, dy=dy + bob + fl, **kw))
    for cls, delay in (('la', 0.0), ('lb', leg_p / 2)):
        if cls in layers:
            up = 0 if floats else (-1 if half(t, leg_p, delay) else 0)
            canvas.alpha_composite(move(layers[cls], dy=up + fl))
    for kind, img, tt in later:
        rise(canvas, img, tt, start=1, end=-4)
    notes(canvas, layers, t)
    return canvas


CREW = [('fable', 'Fable'), ('heavy', 'Opus xhigh / max'), ('careful', 'Opus high'),
        ('medium', 'Opus medium'), ('light', 'Opus low'), ('haiku', 'Haiku'),
        ('sonnet', 'Sonnet'), ('explore', 'Explore'), ('other', 'other agents')]
try:
    BOLD = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 15)
    REG = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13)
except OSError:
    BOLD = REG = ImageFont.load_default()

CELL, GAP, LABEL, PAD = GW * S, 8, 44, 16   # one row: each crab in its cell, its name and rule under it
W = PAD * 2 + len(CREW) * (CELL + GAP) - GAP
H = PAD + GH * S + LABEL + 6

prepared = []
for name, rule in CREW:
    g, o = groups_of(name)
    prepared.append((name, rule, g, o, {c: layer(r) for c, r in g.items()}))


def board(t, bg, fg, sub, still=False):
    img = Image.new('RGBA', (W, H), color(bg))
    d = ImageDraw.Draw(img)
    for k, (name, rule, g, o, layers) in enumerate(prepared):
        x = PAD + k * (CELL + GAP)
        img.alpha_composite(frame(name, g, o, layers, t, still), (x, PAD - 10))
        ty = PAD + GH * S - 4
        d.text((x + CELL / 2, ty), NAME[name], fill=fg, font=BOLD, anchor='mt')
        d.text((x + CELL / 2, ty + 20), rule, fill=sub, font=REG, anchor='mt')
    return img


for theme, bg, fg, sub in [('light', '#FFFFFF', '#1F1F1F', '#6B6B68'), ('dark', '#0D1117', '#E6EDF3', '#9198A1')]:
    frames = [board(i * MS / 1000, bg, fg, sub).convert('RGB') for i in range(int(LOOP * 1000 / MS))]
    strip = Image.new('RGB', (W, H * len(frames)))  # one palette for every frame, so pixels that stay put
    for i, f in enumerate(frames):                   # are written once and the GIF stays small
        strip.paste(f, (0, i * H))
    shared = strip.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = [f.quantize(palette=shared, dither=Image.Dither.NONE) for f in frames]
    pal[0].save(f'{OUT}/crabs-{theme}.gif', save_all=True, append_images=pal[1:], duration=MS, loop=0, optimize=True,
                disposal=1)
    print(f'{OUT}/crabs-{theme}.gif', (W, H))
