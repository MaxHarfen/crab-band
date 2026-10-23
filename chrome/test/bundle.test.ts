import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

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
