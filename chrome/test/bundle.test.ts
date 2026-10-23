import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

execFileSync('node', ['scripts/icons.mjs']); execFileSync('node', ['scripts/build.mjs'])
const js = readFileSync('dist/content.js', 'utf8')
const manifest = JSON.parse(readFileSync('dist/manifest.json', 'utf8'))

// URLs in the bundle that are names, not requests.
const NAMESPACES = new Set([
  'http://www.w3.org/2000/svg', // the crab's <svg xmlns>
])

test('no remote code and no other host', () => {
  assert.doesNotMatch(js, /\beval\(|new Function\(/)
  const urls = new Set(js.match(/https?:\/\/[^\s"'`)]+/g) ?? [])
  assert.deepEqual([...urls].filter(u => !NAMESPACES.has(u)), [])
  assert.match(js, /\/api\/organizations\//)
})
test('the manifest asks for claude.ai and nothing else', () => {
  assert.equal(manifest.manifest_version, 3)
  assert.equal(manifest.name, 'crab-band')
  assert.equal(manifest.version, '0.1.0')
  assert.match(manifest.description, /not made or endorsed by Anthropic/)
  assert.deepEqual(manifest.content_scripts.map((c: any) => c.matches), [['https://claude.ai/*']])
  for (const k of ['permissions', 'host_permissions', 'background', 'web_accessible_resources']) assert.equal(k in manifest, false, k)
})
test('the icons are PNGs of the size they claim', () => {
  for (const size of [16, 32, 48, 128]) {
    const png = readFileSync(`dist/icons/${size}.png`)
    assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size)
  }
})
test('the licence and notice travel with the package', () => {
  for (const f of ['LICENSE', 'NOTICE.md', 'README.md']) assert.ok(readFileSync(`dist/${f}`, 'utf8').length > 0, f)
})

// The alpha channel of one of our PNGs (RGBA, 8-bit, every row filter 0, which is what icons.mjs writes).
const alphaOf = (png: Buffer) => {
  let at = 8; let w = 0; const idat: Buffer[] = []
  while (at < png.length) {
    const len = png.readUInt32BE(at); const type = png.toString('ascii', at + 4, at + 8)
    const data = png.subarray(at + 8, at + 8 + len)
    if (type === 'IHDR') w = data.readUInt32BE(0)
    if (type === 'IDAT') idat.push(data)
    at += 12 + len
  }
  const raw = inflateSync(Buffer.concat(idat))
  const row = w * 4 + 1
  for (let y = 0; y < raw.length / row; y++) assert.equal(raw[y * row], 0, `row ${y} filter`)
  return (x: number, y: number): number => raw[y * row + 1 + x * 4 + 3]
}
test('the store icon keeps 16 px of transparent padding around a 96 px crab', () => {
  const alpha = alphaOf(readFileSync('dist/icons/128.png'))
  let crab = 0
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const edge = x < 16 || y < 16 || x >= 112 || y >= 112
    if (edge) assert.equal(alpha(x, y), 0, `${x},${y} should be transparent`)
    else if (alpha(x, y) > 0) crab++
  }
  assert.ok(crab > 2000, `crab pixels: ${crab}`)
})
