// Draws the extension's icons from crab-band's own art (the plain crab), so nothing is drawn by hand:
// crop to the crab's pixels, scale by nearest neighbour to fit, centre on transparent. PNGs are
// written by hand with node:zlib, so the build needs no image library.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32, deflateSync } from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// crab.ts imports './moves' without an extension; the same hook the tests use resolves it.
await import('../test/resolve-ts.mjs')
const { ART } = await import('../../crab-band/hooks/crab.ts')

const SIZES = [16, 32, 48, 128]

const rgba = hex => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]
}

// The plain crab as a grid of colours (null is empty); an underlay sits beneath its pixel.
const grid = ART.base.rows.map(row => [...row].map(ch => (ART.base.legend[ch] ? rgba(ART.base.legend[ch][0]) : null)))
const filled = grid.flatMap((row, y) => row.flatMap((c, x) => (c ? [[x, y]] : [])))
const x0 = Math.min(...filled.map(([x]) => x))
const x1 = Math.max(...filled.map(([x]) => x)) + 1
const y0 = Math.min(...filled.map(([, y]) => y))
const y1 = Math.max(...filled.map(([, y]) => y)) + 1
const w = x1 - x0
const h = y1 - y0

const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), body.length + 4)
  return out
}

const png = (size, pixel) => {
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const c = pixel(x, y)
      if (c) Buffer.from(c).copy(raw, y * (size * 4 + 1) + 1 + x * 4)
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(join(root, 'icons'), { recursive: true })
for (const size of SIZES) {
  const fit = size / Math.max(w, h)
  const scale = size >= 128 ? Math.floor(fit) : fit
  const ox = (size - w * scale) / 2
  const oy = (size - h * scale) / 2
  const pixel = (x, y) => {
    const gx = Math.floor((x + 0.5 - ox) / scale)
    const gy = Math.floor((y + 0.5 - oy) / scale)
    return gx >= 0 && gx < w && gy >= 0 && gy < h ? grid[y0 + gy][x0 + gx] : null
  }
  writeFileSync(join(root, 'icons', `${size}.png`), png(size, pixel))
}
