/**
 * Shared input patterns for name, phone and postal code, so the checkout and
 * address forms reject the same characters.
 */

/** Letters plus the separators that legitimately appear in names. */
export const NAME_PATTERN = /^[\p{L}\p{M}'’.\- ]+$/u;

/** Digits with the punctuation dialling formats actually use. */
export const PHONE_PATTERN = /^\+?[\d\s\-().]+$/;

/** Digits with optional space/hyphen grouping, e.g. 400001 or 1234-567. */
export const ZIP_PATTERN = /^[\d\s-]+$/;
