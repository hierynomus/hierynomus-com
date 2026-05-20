import type { APIRoute } from 'astro';
import { generateOgImage } from '../../lib/og';
import { SITE } from '../../config/site';

export const GET: APIRoute = async () => {
  const png = await generateOgImage({
    title: SITE.name,
    subtitle: SITE.title,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
