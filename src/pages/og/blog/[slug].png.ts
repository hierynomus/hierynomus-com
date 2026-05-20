import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({ params: { slug: post.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const post = posts.find(p => p.id === params.slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const png = await generateOgImage({
    title: post.data.title,
    subtitle: post.data.description,
    badge: 'Blog',
    badgeColor: '#fe7c3f', // persimmon
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
