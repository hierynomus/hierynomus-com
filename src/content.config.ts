import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    type: z.enum(['conference', 'keynote', 'meetup', 'podcast', 'webinar', 'workshop']),
    tags: z.array(z.string()).default([]),
    conference_url: z.string().optional(),
    slides_url: z.string().optional(),
    video_url: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    bookable: z.boolean().default(true),
    co_presenters: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
    })).default([]),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    publication: z.string(),
    publication_url: z.string().optional(),
    url: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: z.string(),
    featured: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string(),
    language: z.string(),
    license: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { talks, writing, blog, projects };
