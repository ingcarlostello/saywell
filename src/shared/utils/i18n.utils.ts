const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

// Replaces `{key}` placeholders; unknown keys are left untouched so missing values are visible.
export function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(PLACEHOLDER_PATTERN, (placeholder, key: string) => {
    const value = values[key];
    return value === undefined ? placeholder : String(value);
  });
}
