// Zips dist/ for the Chrome Web Store: the files exactly as Load unpacked sees them, the manifest at the
// zip's root, no directory entries and no hidden files (a stray .DS_Store). Run `npm run build` first;
// `npm run zip` does both. Uses the system `zip` (macOS and Linux have it).
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const { version } = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf8'))
const out = join(root, `crab-band-${version}.zip`)

rmSync(out, { force: true })
execFileSync('zip', ['-r', '-X', '-D', '-q', out, '.', '-x', '.*', '*/.*'], { cwd: dist })
console.log(out)
