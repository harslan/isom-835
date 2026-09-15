import { defineCollection, z } from 'astro:content';

const sessionsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    number: z.number(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    duration: z.string(),
    icon: z.string(),
    tags: z.array(z.string()).default([]),
    heroTitle: z.string().optional(),
    objectives: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })).default([]),
    agenda: z.array(z.object({
      time: z.string(),
      title: z.string(),
      duration: z.string(),
      description: z.string(),
      bulletPoints: z.array(z.string()).default([]),
      isBreak: z.boolean().default(false),
    })).default([]),
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      description: z.string(),
      icon: z.string(),
      badge: z.string().optional(),
      badgeType: z.enum(['interactive', 'video', 'tool', 'reference', 'code']).default('interactive'),
      linkText: z.string().default('Explore now'),
    })).default([]),
    activities: z.array(z.object({
      number: z.number(),
      icon: z.string(),
      title: z.string(),
      description: z.string(),
      steps: z.array(z.object({
        title: z.string(),
        description: z.string(),
      })).default([]),
      codeBlock: z.object({
        language: z.string(),
        code: z.string(),
      }).optional(),
      discussionNote: z.string().optional(),
    })).default([]),
    videos: z.array(z.object({
      youtubeId: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })).default([]),
    takeaways: z.array(z.object({
      icon: z.string(),
      text: z.string(),
    })).default([]),
    homework: z.array(z.object({
      label: z.string(),
      text: z.string(),
    })).default([]),
    nextSession: z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()).default([]),
      slug: z.string().optional(),
    }).optional(),
  }),
});

export const collections = {
  sessions: sessionsCollection,
};
