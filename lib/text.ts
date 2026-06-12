// Capitalize the first letter of each word (title case). Used for names like
// locations, bait, and fish species so "bedok jetty" and "Bedok Jetty" store
// identically. Only the leading letter of each word is changed — the rest is
// left as typed (so "McDonald" or acronyms aren't mangled).
export function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
