// Common abbreviations accepted in Russian (per normative dictionaries / widely adopted)
export const WHITELIST_WORDS = new Set([
  // Technology
  'wifi', 'wi-fi', 'sms', 'gps', 'qr', 'pdf', 'usb', 'id', 'tv', 'vip',
  'dj', 'pr', 'it', 'hr', 'kpi', 'ceo', 'spa', 'ok', 'vs', 'faq',
  'url', 'http', 'https', 'www', 'html', 'css', 'api',
  // Common borrowed words in normative dictionaries
  'bar', 'fitness', 'lobby', 'junior', 'senior',
]);

// Regex patterns for things to skip entirely
export const WHITELIST_PATTERNS: RegExp[] = [
  // URLs and emails
  /^https?:\/\//i,
  /^www\./i,
  /\S+@\S+\.\S+/,
  // Domain-like strings
  /^[a-z0-9-]+\.[a-z]{2,}$/i,
  // Numbers with units (24h, 5km, 100m2)
  /^\d+[a-z]{1,3}$/i,
  // Single Latin character
  /^[a-zA-Z]$/,
  // Pure numbers
  /^\d+$/,
];

/**
 * Check if a text string should be excluded from compliance findings.
 * Returns true if the text is whitelisted (acceptable in Latin script).
 */
export function isWhitelisted(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  // Check pattern matches
  for (const pattern of WHITELIST_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  // Check if ALL Latin words in text are whitelisted
  const latinWords = trimmed.match(/[a-zA-Z]{2,}/g);
  if (!latinWords) return true; // No Latin words found

  return latinWords.every(word => WHITELIST_WORDS.has(word.toLowerCase()));
}
