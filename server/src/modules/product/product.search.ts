import { env } from "@/config/env.config";
import { escapeRegex } from "@/validation/common.schema";

export type SearchSort = Record<string, 1 | -1 | { $meta: string }>;

export const atlasSearchEnabled = () => env.ATLAS_SEARCH_INDEX.length > 0;

/**
 * Atlas Search gives the storefront typo tolerance and edge-gram autocomplete.
 * The MongoDB text index below is the portable fallback for local development
 * and CI, where `$search` is not available.
 */
export const buildAtlasSearchStage = (
  search: string,
  index = env.ATLAS_SEARCH_INDEX,
) => ({
  $search: {
    index,
    compound: {
      should: [
        {
          autocomplete: {
            query: search,
            path: "name",
            fuzzy: { maxEdits: 1, prefixLength: 2 },
          },
        },
        {
          text: {
            query: search,
            path: ["description", "slug", "tag"],
            fuzzy: { maxEdits: 1, prefixLength: 2 },
          },
        },
      ],
      minimumShouldMatch: 1,
    },
  },
});

/** Case-insensitive prefix search, backed by the name collation index. */
export const buildPrefixSearchFilter = (keyword: string) => ({
  name: { $regex: `^${escapeRegex(keyword)}`, $options: "i" },
});

export const buildTextSearchFilter = (search: string) => ({
  $text: { $search: search },
});

export const buildTextSearchSort = (
  sortOption: Record<string, 1 | -1>,
): SearchSort => ({
  score: { $meta: "textScore" },
  ...sortOption,
});

export const isAtlasSearchUnavailable = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: unknown } | null)?.code;

  if (code === 6047401 || code === 40324) return true;

  return [
    /Unrecognized pipeline stage name: '\$search'/i,
    /search stages are only allowed on mongodb atlas/i,
    /search index .*not found/i,
    /search index .*does not exist/i,
    /invalid search index/i,
    /search is not enabled/i,
    /SearchNotEnabled/i,
  ].some((pattern) => pattern.test(message));
};
