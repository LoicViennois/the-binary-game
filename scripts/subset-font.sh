#!/usr/bin/env sh
# Builds src/assets/fonts/recursive-latin-subset.woff2 from the full Recursive variable
# font: Latin glyphs only, slant and cursive axes pinned, weight and casual axes limited
# to the ranges src/index.css uses. Rerun after changing font weights or variations.
# Requires fonttools and brotli: pip install fonttools brotli
set -eu

cd "$(dirname "$0")/.."
SRC=node_modules/@fontsource-variable/recursive/files/recursive-latin-full-normal.woff2
OUT=src/assets/fonts/recursive-latin-subset.woff2
TMP=$(mktemp --suffix=.ttf)
trap 'rm -f "$TMP"' EXIT

fonttools varLib.instancer "$SRC" slnt=0 CRSV=0.5 wght=400:800 CASL=0:0.6 MONO=0:1 -o "$TMP"
pyftsubset "$TMP" \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' \
  --layout-features='*' \
  --flavor=woff2 \
  --output-file="$OUT"
