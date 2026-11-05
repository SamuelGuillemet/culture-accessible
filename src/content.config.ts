import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection, reference } from "astro:content";
import { parseSpotifyId, parseYoutubeId } from "./lib/media";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const episodes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/episodes" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      episodeNumber: z.number().int().positive().optional(),
      spotifyId: optionalText
        .refine((value) => !value || parseSpotifyId(value), {
          message: "Identifiant Spotify invalide : 22 caractères après /episode/ dans le lien.",
        })
        .transform((value) => (value ? parseSpotifyId(value) : undefined)),
      youtubeUrl: optionalText.refine((value) => !value || parseYoutubeId(value), {
        message: "Lien YouTube invalide.",
      }),
      draft: z.boolean().default(true),
    })
    .refine((data) => data.spotifyId || data.youtubeUrl, {
      message: "Renseigne au moins un identifiant Spotify ou un lien YouTube.",
    }),
});

const resources = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/resources" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      episode: reference("episodes").optional(),
      extractStart: z.number().int().min(0).optional(),
      extractEnd: z.number().int().min(1).optional(),
      image: optionalText,
      imageAlt: optionalText,
      draft: z.boolean().default(true),
    })
    .refine((data) => data.extractEnd === undefined || data.extractEnd > (data.extractStart ?? 0), {
      message: "La fin de l’extrait doit être après son début.",
      path: ["extractEnd"],
    }),
});

export const collections = { episodes, resources };
