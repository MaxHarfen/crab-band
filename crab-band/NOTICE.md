# Third-party notice

crab-band began as a fork of the savvy-progress mod in
[johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit) (v1.2.1, commit c871c15). The crab outfits
and their animations were redrawn for crab-band, but these parts are still adapted from savvy-progress:

- `hooks/crab.ts`: the base crab's geometry, the walking, bob, float and blink rules and keyframes in
  `CRAB_CSS` with its reduced-motion rule, the grouping of parts in `crabMarkup`, and the accent colours in
  `COSTUME_ACCENT`
- `hooks/costume.ts`: `savvyTier`
- `hooks/format.ts`: `windowOf` and the model-name pattern in `modelName`
- `hooks/register.tsx`: the lines that nest other mods' bands beneath the band

They are used under savvy-progress's MIT license:

```
MIT License

Copyright (c) 2026 johnnyvizz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
