const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export function reviveDateInData<T>(input: T): T {
  if (input === null || input === undefined) return input;

  if (typeof input === 'string' && ISO_DATE_RE.test(input)) {
    return new Date(input) as unknown as T;
  }

  if (!isObjectOrArray(input)) return input;

  const rootRef: { value: unknown } = { value: input as unknown };
  const stack: Array<{
    parent: Record<string | number, unknown>;
    key: string | number;
    value: unknown;
  }> = [
    {
      parent: rootRef as unknown as Record<string | number, unknown>,
      key: 'value',
      value: input as unknown,
    },
  ];

  const seen = new WeakSet<object>();

  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;

    const { parent, key, value } = node;

    if (value === null || value === undefined) continue;

    if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
      parent[key] = new Date(value);
      continue;
    }

    if (!isObjectOrArray(value)) continue;

    if (seen.has(value as object)) continue;
    seen.add(value as object);

    if (Array.isArray(value)) {
      for (let i = value.length - 1; i >= 0; i--) {
        const child = value[i];
        if (typeof child === 'string' && ISO_DATE_RE.test(child)) {
          value[i] = new Date(child) as unknown;
        } else if (isObjectOrArray(child)) {
          stack.push({
            parent: value as unknown as Record<string | number, unknown>,
            key: i,
            value: child,
          });
        }
      }
    } else {
      for (const k of Object.keys(value)) {
        const child = (value as Record<string, unknown>)[k];
        if (typeof child === 'string' && ISO_DATE_RE.test(child)) {
          (value as Record<string, unknown>)[k] = new Date(child);
        } else if (isObjectOrArray(child)) {
          stack.push({
            parent: value as unknown as Record<string | number, unknown>,
            key: k,
            value: child,
          });
        }
      }
    }
  }

  return rootRef.value as T;
}

function isObjectOrArray(x: unknown): x is object {
  if (x === null) return false;
  const t = typeof x;
  if (t !== 'object') return false;
  const tag = Object.prototype.toString.call(x);
  return tag === '[object Object]' || tag === '[object Array]';
}
