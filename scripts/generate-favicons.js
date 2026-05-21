/**
 * Generate favicon PNGs from the SVG design using Inter (via satori) + resvg.
 * Same pipeline as src/lib/og.ts — satori turns Inter glyphs into SVG paths,
 * resvg rasterizes the composite.
 *
 * Run whenever the favicon design changes:
 *   node scripts/generate-favicons.js
 *
 * Outputs:
 *   public/favicon.ico          — 32 × 32
 *   public/apple-touch-icon.png — 180 × 180 (iOS home screen)
 *   public/favicon-192.png      — 192 × 192 (Android / PWA)
 *   public/favicon-512.png      — 512 × 512 (PWA splash)
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontData = fs.readFileSync(
  path.join(root, 'node_modules/@fontsource/inter/files/inter-latin-800-normal.woff')
);

/**
 * Render the favicon at `size` × `size` pixels.
 *
 * Strategy (mirrors og.ts):
 *  Pass 1 — satori renders the "J" text as SVG path data using Inter 800.
 *  Pass 2 — hand-built SVG places the pine background, mint mic capsule,
 *            stand/base, and embeds the satori J paths as a nested <svg>.
 *  resvg rasterises the composite.
 */
async function renderFavicon(size) {
  const s = size / 32; // scale factor: all design units are in a 32×32 grid

  // ── Pass 1: satori → Inter J glyph paths ──────────────────────────────────
  // Render just the letter inside a box sized to the mic capsule interior.
  // Pine fill so it sits as a "cut-out" on the mint capsule.
  const capsuleW = Math.round(14 * s);
  const capsuleH = Math.round(19 * s);
  const fontSize = Math.round(14 * s);   // fills ~75 % of capsule height

  const jSvg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: `${capsuleW}px`,
          height: `${capsuleH}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter',
          fontWeight: 800,
          fontSize: `${fontSize}px`,
          color: '#0c322c',
        },
        children: 'J',
      },
    },
    {
      width: capsuleW,
      height: capsuleH,
      fonts: [{ name: 'Inter', data: fontData, weight: 800, style: 'normal' }],
    }
  );

  // Strip the outer <svg …> wrapper — we'll embed the inner content ourselves
  const jInner = jSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

  // ── Pass 2: composite SVG ─────────────────────────────────────────────────
  const bgR  = Math.round(7 * s);
  const mx   = Math.round(9 * s),  my  = Math.round(2 * s);
  const mw   = Math.round(14 * s), mh  = Math.round(19 * s);
  const mr   = Math.round(7 * s);
  // Stand arc control points
  const ax1  = Math.round(8 * s),  ay1 = Math.round(21 * s);
  const acy  = Math.round(27 * s), ax2 = Math.round(24 * s);
  const cx   = Math.round(16 * s);
  const ry1  = Math.round(27 * s), ry2 = Math.round(30 * s);
  const bx1  = Math.round(9 * s),  bx2 = Math.round(23 * s);
  const by   = Math.round(30 * s);
  const sw   = (2 * s).toFixed(1);
  const bsw  = (2.5 * s).toFixed(1);

  const composite = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="card">
      <rect width="${size}" height="${size}" rx="${bgR}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#card)">
    <!-- Pine background -->
    <rect width="${size}" height="${size}" fill="#0c322c"/>

    <!-- Mint mic capsule -->
    <rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="${mr}" fill="#90ebcd"/>

    <!-- J from satori (Inter 800 glyph paths) -->
    <svg x="${mx}" y="${my}" width="${mw}" height="${mh}" viewBox="0 0 ${mw} ${mh}">
      ${jInner}
    </svg>

    <!-- Stand arc -->
    <path d="M${ax1},${ay1} Q${ax1},${acy} ${cx},${acy} Q${ax2},${acy} ${ax2},${ay1}"
          fill="none" stroke="#90ebcd" stroke-width="${sw}" stroke-linecap="round"/>
    <!-- Rod -->
    <line x1="${cx}" y1="${ry1}" x2="${cx}" y2="${ry2}"
          stroke="#90ebcd" stroke-width="${sw}" stroke-linecap="round"/>
    <!-- Base -->
    <line x1="${bx1}" y1="${by}" x2="${bx2}" y2="${by}"
          stroke="#90ebcd" stroke-width="${bsw}" stroke-linecap="round"/>
  </g>
</svg>`;

  const resvg = new Resvg(composite, { fitTo: { mode: 'width', value: size } });
  return Buffer.from(resvg.render().asPng());
}

// ── Generate all sizes ────────────────────────────────────────────────────────
const outputs = [
  { size: 32,  file: 'favicon.ico' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 192, file: 'favicon-192.png' },
  { size: 512, file: 'favicon-512.png' },
];

for (const { size, file } of outputs) {
  const png = await renderFavicon(size);
  const outPath = path.join(root, 'public', file);
  fs.writeFileSync(outPath, png);
  console.log(`  ✓  ${file}  (${size}×${size})`);
}
