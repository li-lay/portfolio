# Iosevka (subset)

Self-hosted monospace face for the UI. `app/layout.tsx` registers the subset in
`assets/fonts/iosevka/` with `next/font/local` as `--font-iosevka`; `--font-mono`
in `app/globals.css` resolves to it.

- Upstream: Iosevka 11.1.1, built and published on cdnjs
  (`https://cdnjs.cloudflare.com/ajax/libs/Iosevka/11.1.1/iosevka/woff2/`).
- The cdnjs woff2 files are ~816 kB each (24,194 glyphs, all scripts), which is
  far too heavy to ship. The shipped file is a `fontTools` subset of that exact
  file: ASCII, Latin-1 Supplement, and the arrows / punctuation the UI uses
  (`→ ← ↑ ↓ ⇒ ↗ ° ≈ × · — – … ▸ ± □ ─ ↵`).
- Glyph count drops to 1,850; weight 400 only, no bold, no italics. Nothing in
  the UI uses mono bold, so the browser synthesises it if ever needed.
- `⌘` (U+2318) is absent from Iosevka 11.1.1 itself, so it falls back to the
  system font exactly as it did before this change.
- No Reserved Font Name is declared in `LICENSE.txt`, so the subset keeps the
  font's name.
- License: SIL Open Font License 1.1, full text in `LICENSE.txt`. The copyright
  and license strings are retained in the font's `name` table.
- The woff2 binary lives in `assets/fonts/iosevka/`, not `public/`: Next compiles
  it into `/_next/static/media` under a content hash, so a copy under `public/`
  would ship the same bytes twice. This `LICENSE.txt` stays public to satisfy the
  OFL distribution requirement.

## Regenerating

```sh
curl -sLO https://cdnjs.cloudflare.com/ajax/libs/Iosevka/11.1.1/iosevka/woff2/iosevka-regular.woff2

UNICODES=U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+203A,U+20AC,U+2190-2193,U+2197,U+2198,U+21B5,U+21D2,U+2248,U+2318,U+2500,U+25A1,U+25B8,U+25CF,U+2B1B

python3 -m fontTools.subset iosevka-regular.woff2 \
  --unicodes="$UNICODES" --flavor=woff2 --layout-features='*' \
  --no-hinting --desubroutinize --drop-tables+=DSIG --name-IDs='*' \
  --output-file="../../assets/fonts/iosevka/iosevka-regular.woff2"
```

Requires `fonttools` and `brotli` (`pip install fonttools brotli`).
