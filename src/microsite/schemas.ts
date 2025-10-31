import { z } from 'zod';

// Bilingual text helpers
const L = z.object({ sr: z.string().optional(), en: z.string().optional() });
const Larr = z.object({ sr: z.array(z.string()).optional(), en: z.array(z.string()).optional() });

export const ThemeSchema = z.object({
  primary: z.string().default('#7C3AED'),
  font: z.string().default('Inter'),
  radius: z.string().default('1rem'),
});

export const SeoSchema = z.object({
  title: L.optional(),
  description: L.optional(),
  ogImage: z.string().url().optional(),
});

// Content Blocks
const Hero = z.object({
  type: z.literal('hero'),
  heading: L,
  subheading: L.optional(),
  ctaLabel: L.optional(),
  ctaHref: z.string().optional(),
  backgroundImage: z.string().url().optional(),
  overlay: z.boolean().default(true),
});

const Schedule = z.object({
  type: z.literal('schedule'),
  items: z.array(z.object({
    time: z.string(),
    title: L,
    description: L.optional(),
    icon: z.string().optional(),
  })),
});

const Venue = z.object({
  type: z.literal('venue'),
  name: L,
  address: L,
  mapUrl: z.string().url().optional(),
  geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
  images: z.array(z.string().url()).default([]),
});

const Gallery = z.object({
  type: z.literal('gallery'),
  images: z.array(z.object({
    url: z.string().url(),
    alt: L.optional(),
  })),
  layout: z.enum(['grid', 'masonry', 'carousel']).default('grid'),
});

const FAQ = z.object({
  type: z.literal('faq'),
  items: z.array(z.object({ q: L, a: L })),
});

const RSVP = z.object({
  type: z.literal('rsvp'),
  heading: L.optional(),
  description: L.optional(),
  submitLabel: L.optional(),
  webhookUrl: z.string().url().optional(),
});

const CustomHTML = z.object({
  type: z.literal('customHtml'),
  html: L,
});

export const SectionSchema = z.discriminatedUnion('type', [
  Hero, Schedule, Venue, Gallery, FAQ, RSVP, CustomHTML,
]);

export const SectionsSchema = z.array(SectionSchema);

export const MicrositeUpsertSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  theme: ThemeSchema.optional(),
  seo: SeoSchema.optional(),
  sections: SectionsSchema.default([]),
});

export const UpdateMicrositeSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  theme: ThemeSchema.optional(),
  seo: SeoSchema.optional(),
  sections: SectionsSchema.optional(),
});

export const MicrositePublishSchema = z.object({
  publish: z.boolean().default(true),
});

export const MicrositePreviewTokenSchema = z.object({
  enable: z.boolean(),
});

export const MediaAssetSchema = z.object({
  url: z.string().url(),
  kind: z.enum(['image', 'video', 'file']),
  alt: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export type MicrositeUpsertInput = z.infer<typeof MicrositeUpsertSchema>;
export type SectionInput = z.infer<typeof SectionSchema>;

