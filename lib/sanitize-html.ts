const BLOCKED_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "button",
  "svg",
  "math"
].join("|");

const blockedPairPattern = new RegExp(`<(${BLOCKED_TAGS})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, "gi");
const blockedSinglePattern = new RegExp(`<(${BLOCKED_TAGS})\\b[^>]*\\/?>`, "gi");

export function sanitizeRichText(html: string) {
  return String(html || "")
    .replace(blockedPairPattern, "")
    .replace(blockedSinglePattern, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s+(href|src)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"');
}
