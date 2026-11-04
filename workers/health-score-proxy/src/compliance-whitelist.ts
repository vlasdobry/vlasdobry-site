// Only technical abbreviations with NO Cyrillic equivalent.
// Per 168-FZ: borrowed words with Russian form (СПА, фитнес, бар, лобби) are violations in Latin.
// Registered trademarks are exempt but cannot be auto-detected.
export const WHITELIST_WORDS = new Set([
  // Technical protocol/format terms (no established Cyrillic form)
  'url', 'http', 'https', 'www', 'html', 'css', 'api', 'ip',
  'pdf', 'usb', 'gps', 'qr',
  // Trademarks (exempt per 168-FZ)
  'wifi', 'wi-fi',
  // NOTE: Removed words WITH Cyrillic equivalents:
  // sms→СМС, id→идентификатор, it→ИТ, hr→кадры, kpi→КПЭ,
  // pr→пиар, ok→ОК, vs→против, faq→ЧаВо
]);

// Regex patterns for things to skip entirely
export const WHITELIST_PATTERNS: RegExp[] = [
  // URLs and emails
  /^https?:\/\//i,
  /^www\./i,
  // Domain-like strings
  /^[a-z0-9-]+\.[a-z]{2,}$/i,
  // Numbers with units (24h, 5km, 100m2)
  /^\d+[a-z]{1,3}$/i,
  // Single Latin character
  /^[a-zA-Z]$/,
  // Pure numbers
  /^\d+$/,
];

// HTML entities to strip before Latin detection (e.g. &nbsp; &mdash; &amp;)
const HTML_ENTITY_RE = /&[a-z]+;/gi;

/** Strip HTML entities from text, replacing with spaces */
export function stripHtmlEntities(text: string): string {
  return text.replace(HTML_ENTITY_RE, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Check if a text string should be excluded from compliance findings.
 * Returns true if the text is whitelisted (acceptable in Latin script).
 */
export function isWhitelisted(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  // Preserve the embedded-email rule without the quadratic backtracking of
  // an unanchored greedy regex on long text without an @ delimiter.
  for (const token of trimmed.split(/\s+/)) {
    const at = token.indexOf('@', 1);
    if (at < 1) continue;
    const dot = token.indexOf('.', at + 2);
    if (dot >= 0 && dot < token.length - 1) return true;
  }

  // Check pattern matches
  for (const pattern of WHITELIST_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  // Strip HTML entities before Latin check (&nbsp; &mdash; &amp; etc.)
  const cleaned = trimmed.replace(HTML_ENTITY_RE, ' ');

  // Check if ALL Latin words in cleaned text are whitelisted
  const latinWords = cleaned.match(/[a-zA-Z]{2,}/g);
  if (!latinWords) return true; // No Latin words found

  return latinWords.every(word => WHITELIST_WORDS.has(word.toLowerCase()));
}
