const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export const CATEGORY_ICON_MAX_GRAPHEMES = 2;

export function splitGraphemes(value: string): string[] {
  if (!value) return [];
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(value), (s) => s.segment);
  }
  return [...value];
}

export function truncateCategoryIcon(value: string): string {
  return splitGraphemes(value).slice(0, CATEGORY_ICON_MAX_GRAPHEMES).join("");
}

export function isValidCategoryIcon(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return splitGraphemes(trimmed).length <= CATEGORY_ICON_MAX_GRAPHEMES;
}
