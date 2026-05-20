import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

// Load Inter Bold from @fontsource/inter (woff — satori does not support woff2)
const fontPath = path.resolve('node_modules/@fontsource/inter/files/inter-latin-700-normal.woff');
const fontData = fs.readFileSync(fontPath);

/**
 * Read a file from /public and return a base64 PNG data URL.
 * SVGs are pre-rasterized via resvg because satori cannot render
 * SVG images embedded as data URLs — it silently drops them.
 */
function publicFileToDataUrl(publicPath: string): string {
  const fullPath = path.join(process.cwd(), 'public', publicPath);
  const data = fs.readFileSync(fullPath);
  const ext = path.extname(publicPath).toLowerCase();

  if (ext === '.svg') {
    const resvg = new Resvg(data, { fitTo: { mode: 'width', value: 1200 } });
    const png = resvg.render().asPng();
    return `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
  }

  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${data.toString('base64')}`;
}

export async function generateOgImage(opts: {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  /** Path relative to /public, e.g. /images/talks/kubecon-eu-2026.svg */
  image?: string;
}): Promise<Buffer> {
  const { title, subtitle, badge, badgeColor = '#30ba78', image } = opts;

  const imageDataUrl = image ? publicFileToDataUrl(image) : null;

  const titleFontSize = title.length > 60 ? 44 : title.length > 40 ? 52 : 60;
  const titleTruncated = title.length > 95 ? title.slice(0, 92) + '…' : title;
  const subtitleTruncated = subtitle && subtitle.length > 70 ? subtitle.slice(0, 67) + '…' : subtitle;

  // ── No-image layout (solid pine) ─────────────────────────────────────────
  if (!imageDataUrl) {
    return render({
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column' as const,
          backgroundColor: '#0c322c',
          fontFamily: 'Inter',
        },
        children: [
          { type: 'div', props: { style: { height: '4px', backgroundColor: '#90ebcd', width: '100%' } } },
          {
            type: 'div',
            props: {
              style: { flex: 1, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', padding: '40px 80px' },
              children: [
                ...(badge ? [{
                  type: 'div',
                  props: {
                    style: { display: 'flex', marginBottom: '24px' },
                    children: [{
                      type: 'div',
                      props: {
                        style: { backgroundColor: badgeColor, color: '#ffffff', fontSize: '18px', fontWeight: 700, padding: '6px 18px', borderRadius: '999px' },
                        children: badge,
                      },
                    }],
                  },
                }] : [{ type: 'div', props: { style: { marginBottom: '24px' }, children: '' } }]),
                {
                  type: 'div',
                  props: {
                    style: { color: '#ffffff', fontSize: `${titleFontSize}px`, fontWeight: 700, lineHeight: 1.1, maxWidth: '1000px', marginBottom: subtitle ? '20px' : '0px' },
                    children: titleTruncated,
                  },
                },
                ...(subtitleTruncated ? [{
                  type: 'div',
                  props: { style: { color: 'rgba(144,235,205,0.65)', fontSize: '28px', fontWeight: 700 }, children: subtitleTruncated },
                }] : []),
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column' as const },
              children: [
                { type: 'div', props: { style: { height: '2px', backgroundColor: 'rgba(144,235,205,0.5)', margin: '0 80px' } } },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 80px 28px 80px' },
                    children: [
                      { type: 'div', props: { style: { color: 'rgba(239,239,239,0.55)', fontSize: '20px', fontWeight: 700 }, children: 'Jeroen van Erp' } },
                      { type: 'div', props: { style: { color: 'rgba(239,239,239,0.55)', fontSize: '20px', fontWeight: 700 }, children: 'speaking.hierynomus.com' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    });
  }

  // ── Diagonal-split layout (image present) ────────────────────────────────
  //
  // Strategy: two-pass compositing.
  //   Pass 1 — satori renders the overlay (pine trapezoid + text + footer)
  //            on a transparent root (no background). resvg can't render
  //            satori's backgroundImage patterns, so we keep background out.
  //   Pass 2 — a hand-built SVG places the background PNG as a plain <image>
  //            element (which resvg supports), then embeds the overlay SVG
  //            inline. resvg renders the composite to the final PNG.
  //
  // The pine trapezoid covers the left ~63%:
  //   (0,0) → (760,0) → (590,630) → (0,630)
  // The image shows through the right portion.

  const overlaySvg = await satori({
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        position: 'relative' as const,
        fontFamily: 'Inter',
        // No backgroundColor — root is transparent so background image shows through
      },
      children: [
        // Pine trapezoid
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute' as const,
              top: '0px',
              left: '0px',
              width: '1200px',
              height: '630px',
              backgroundColor: '#0c322c',
              clipPath: 'polygon(0px 0px, 760px 0px, 590px 630px, 0px 630px)',
            },
          },
        },

        // Top mint stripe
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute' as const,
              top: '0px',
              left: '0px',
              width: '760px',
              height: '4px',
              backgroundColor: '#90ebcd',
            },
          },
        },

        // Text content
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute' as const,
              top: '0px',
              left: '0px',
              width: '650px',
              height: '566px',
              display: 'flex',
              flexDirection: 'column' as const,
              justifyContent: 'center',
              padding: '48px 56px',
            },
            children: [
              ...(badge ? [{
                type: 'div',
                props: {
                  style: { display: 'flex', marginBottom: '24px' },
                  children: [{
                    type: 'div',
                    props: {
                      style: { backgroundColor: badgeColor, color: '#ffffff', fontSize: '18px', fontWeight: 700, padding: '6px 18px', borderRadius: '999px' },
                      children: badge,
                    },
                  }],
                },
              }] : [{ type: 'div', props: { style: { marginBottom: '24px' }, children: '' } }]),
              {
                type: 'div',
                props: {
                  style: { color: '#ffffff', fontSize: `${titleFontSize}px`, fontWeight: 700, lineHeight: 1.1, marginBottom: subtitle ? '18px' : '0px' },
                  children: titleTruncated,
                },
              },
              ...(subtitleTruncated ? [{
                type: 'div',
                props: { style: { color: 'rgba(144,235,205,0.75)', fontSize: '24px', fontWeight: 700 }, children: subtitleTruncated },
              }] : []),
            ],
          },
        },

        // Footer strip — full-width dark band
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute' as const,
              bottom: '0px',
              left: '0px',
              width: '1200px',
              height: '64px',
              backgroundColor: 'rgba(6,20,16,0.80)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0px 72px',
            },
            children: [
              { type: 'div', props: { style: { color: 'rgba(239,239,239,0.65)', fontSize: '18px', fontWeight: 700 }, children: 'Jeroen van Erp' } },
              { type: 'div', props: { style: { color: 'rgba(144,235,205,0.55)', fontSize: '18px', fontWeight: 700 }, children: 'speaking.hierynomus.com' } },
            ],
          },
        },
      ],
    },
  }, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }],
  });

  // Composite: background PNG + overlay SVG in a single SVG that resvg can render.
  // Strip the outer <svg ...> wrapper from the satori output so we can embed it
  // as a nested <svg> inside our composite root.
  const innerSvg = overlaySvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

  const compositeSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image x="0" y="0" width="1200" height="630" href="${imageDataUrl}" preserveAspectRatio="xMidYMid slice"/>
  <svg x="0" y="0" width="1200" height="630" viewBox="0 0 1200 630">${innerSvg}</svg>
</svg>`;

  const resvg = new Resvg(compositeSvg, { fitTo: { mode: 'width', value: 1200 } });
  return Buffer.from(resvg.render().asPng());
}

async function render(element: object): Promise<Buffer> {
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return Buffer.from(resvg.render().asPng());
}
