import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const postsCollection = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published: z.coerce.date(),
      // updated: z.coerce.date().optional(),
      draft: z.boolean().optional().default(false),
      description: z.string().optional(),
      author: z.string().optional(),
      series: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      coverImage: z
        .strictObject({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      toc: z.boolean().optional().default(true),
    }),
})

const homeCollection = defineCollection({
  loader: glob({ pattern: ['home.md', 'home.mdx'], base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
      githubCalendar: z.string().optional(), // GitHub username for calendar
    }),
})

const addendumCollection = defineCollection({
  loader: glob({ pattern: ['addendum.md', 'addendum.mdx'], base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
    }),
})

const aboutCollection = defineCollection({
  loader: glob({ pattern: ['about.md', 'about.mdx'], base: './src/content' }),
  schema: () =>
    z.object({
      skills: z.array(z.string()).optional().default([]),
      experience: z
        .array(
          z.object({
            title: z.string(),
            company: z.string(),
            period: z.string(),
            description: z.union([z.string(), z.array(z.string())]),
          }),
        )
        .optional()
        .default([]),
      education: z
        .array(
          z.object({
            title: z.string(),
            institution: z.string(),
            description: z.string(),
          }),
        )
        .optional()
        .default([]),
      certifications: z
        .array(
          z.object({
            title: z.string(),
            issuer: z.string(),
            url: z.string().optional(),
          }),
        )
        .optional()
        .default([]),
      projects: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            url: z.string().optional(),
            tags: z.array(z.string()).optional().default([]),
          }),
        )
        .optional()
        .default([]),
      resumeUrl: z.string().optional(),
    }),
})

export const collections = {
  posts: postsCollection,
  home: homeCollection,
  addendum: addendumCollection,
  about: aboutCollection,
}
