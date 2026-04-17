// Парсит все script[type="application/ld+json"] блоки из HTML, пытается JSON.parse
// каждый, собирает все @type (включая @graph, массивы, вложенные объекты).
// Возвращает массив уникальных типов. Битые блоки молча игнорируются — мы не хотим,
// чтобы один невалидный JSON обнулил всю оценку.

const SCRIPT_RE = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function extractJsonLdTypes(html: string): string[] {
  const types = new Set<string>();

  const matches = html.matchAll(SCRIPT_RE);
  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    collectTypes(parsed, types);
  }

  return [...types];
}

function collectTypes(node: unknown, acc: Set<string>): void {
  if (!node) return;

  if (Array.isArray(node)) {
    for (const item of node) {
      collectTypes(item, acc);
    }
    return;
  }

  if (typeof node !== 'object') return;

  const obj = node as Record<string, unknown>;

  // @type может быть строкой или массивом строк.
  const type = obj['@type'];
  if (typeof type === 'string') {
    acc.add(type);
  } else if (Array.isArray(type)) {
    for (const t of type) {
      if (typeof t === 'string') acc.add(t);
    }
  }

  // @graph — массив сущностей внутри одного документа.
  const graph = obj['@graph'];
  if (Array.isArray(graph)) {
    for (const item of graph) {
      collectTypes(item, acc);
    }
  }

  // Рекурсивно обходим вложенные объекты (mainEntity, author, publisher и т.д.).
  for (const key of Object.keys(obj)) {
    if (key === '@type' || key === '@graph') continue;
    const value = obj[key];
    if (value && typeof value === 'object') {
      collectTypes(value, acc);
    }
  }
}

// Быстрая проверка, есть ли JSON-LD вообще (для краткого критического сообщения).
export function hasJsonLd(html: string): boolean {
  return /<script\b[^>]*type=["']application\/ld\+json["']/i.test(html);
}
