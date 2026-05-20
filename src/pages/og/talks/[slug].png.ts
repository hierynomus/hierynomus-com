import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../../lib/og';
import { TYPE_CONFIG } from '../../../config/talks';

// Map TYPE_CONFIG classes to hex colors for OG images
const TYPE_COLORS: Record<string, string> = {
  conference: '#30ba78', // jungle
  keynote: '#fe7c3f',    // persimmon
  meetup: '#0c322c',     // pine (with mint text — use mint as bg for OG)
  podcast: '#192072',    // midnight
  webinar: '#2453ff',    // waterhole
};

export const getStaticPaths: GetStaticPaths = async () => {
  const talks = await getCollection('talks');
  return talks.map(talk => ({ params: { slug: talk.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const talks = await getCollection('talks');
  const talk = talks.find(t => t.id === params.slug);

  if (!talk) {
    return new Response('Not found', { status: 404 });
  }

  const cfg = TYPE_CONFIG[talk.data.type];
  const badgeColor = TYPE_COLORS[talk.data.type] ?? '#30ba78';

  const png = await generateOgImage({
    title: talk.data.title,
    subtitle: talk.data.event,
    badge: cfg.label,
    badgeColor,
    image: talk.data.image,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
