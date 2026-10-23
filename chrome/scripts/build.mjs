// Bundles the content script into dist/ with everything the extension folder needs, ready for
// Load unpacked (and, later, the same folder zipped for the store). Not minified, so it reads.
import { build } from 'esbuild'
import { cpSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

rmSync(dist, { recursive: true, force: true })
await build({
  entryPoints: [join(root, 'src/main.ts')],
  outfile: join(dist, 'content.js'),
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  minify: false,
  legalComments: 'none',
  logLevel: 'warning',
})
for (const [from, to] of [
  ['manifest.json', 'manifest.json'],
  ['icons', 'icons'],
  ['README.md', 'README.md'],
  ['PRIVACY.md', 'PRIVACY.md'],
  ['../LICENSE', 'LICENSE'],
  ['../crab-band/NOTICE.md', 'NOTICE.md'],
]) cpSync(join(root, from), join(dist, to), { recursive: true })
