// Structural checks for rules/react-architecture.md (§12.3) plus project overrides (CLAUDE.md).
// Node >= 22, no dependencies. Uses readdirSync (stable) instead of globSync (experimental in 22.13).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const errors = [];
const fail = (rule, file, detail = '') => errors.push(`✗ [${rule}] ${file}${detail ? ` → ${detail}` : ''}`);

const files = readdirSync('src', { recursive: true })
  .map((p) => join('src', String(p)).replaceAll('\\', '/'))
  .filter((p) => /\.tsx?$/.test(p));
const source = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));

const IMPORT_RE = /^\s*(?:import|export)\s+(type\s+)?[^'"]*?\bfrom\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm;
const importsOf = (f) =>
  [...source.get(f).matchAll(IMPORT_RE)].map((m) => ({ spec: m[2] ?? m[3], typeOnly: Boolean(m[1]) }));
const featureOf = (f) => /^src\/features\/([^/]+)\//.exec(f)?.[1];
const toPascal = (kebab) => kebab.replace(/(?:^|-)([a-z])/g, (_, c) => c.toUpperCase());
const lineCount = (f) => source.get(f).split('\n').length;

// 1 · File suffixes (§4.3) and the no-tests override
const ALLOWED_SUFFIX = /\.(types|constants|helper|utils|services|adapter|schema|variants|config)\.tsx?$/;
for (const f of files) {
  const name = basename(f);
  if (/\.(test|spec|testing|fixtures)\.tsx?$/.test(name) || f.includes('__fixtures__') || f.startsWith('src/test/')) {
    fail('override: sin tests', f);
  }
  if (/\.(type|constant|util|service|helpers|adapters|schemas)\.tsx?$/.test(name)) fail('§4.3 sufijo no permitido', f);
  if ((name.match(/\./g) ?? []).length > 1 && !ALLOWED_SUFFIX.test(name)) fail('§4.3 sufijo no permitido', f);
}

// 2 · Barrels and exports (§4.5, §12.6 #19)
const LEGAL_BARREL = /^src\/(features\/[^/]+|shared\/ui|store)\/index\.ts$/;
for (const f of files) {
  const code = source.get(f);
  if (basename(f) === 'index.ts' && !LEGAL_BARREL.test(f)) fail('§4.5 barrel no permitido', f);
  if (/^\s*export\s+\*/m.test(code)) fail('§4.5 export *', f);
  if (/^\s*export\s+default\b/m.test(code)) fail('§12.6 #19 export default', f);
}

// 3 · Features: kebab-case singular folder with exactly one facade
if (existsSync('src/features')) {
  for (const feature of readdirSync('src/features')) {
    if (!/^[a-z]+(-[a-z]+)*$/.test(feature)) fail('§4.1 feature en kebab-case', `src/features/${feature}`);
    const hooksDir = `src/features/${feature}/hooks`;
    const facade = `${hooksDir}/use${toPascal(feature)}.ts`;
    if (existsSync(hooksDir) && !source.has(facade)) fail('§7 falta el facade', facade);
  }
}

// 4 · Imports per layer
for (const f of files) {
  const own = featureOf(f);
  for (const { spec, typeOnly } of importsOf(f)) {
    if (spec.startsWith('../../')) fail('§4.4 import ../../', f, spec);
    const target = /^@\/features\/([^/]+)/.exec(spec)?.[1];
    if (target && own && target !== own) fail('§13.6 import entre features', f, spec);
    if (f.includes('/containers/') && /(^|\/)hooks\//.test(spec) && spec !== `../hooks/use${toPascal(own ?? '')}`) {
      fail('§6 el container solo usa el facade', f, spec);
    }
    if (f.endsWith('.adapter.ts') && !typeOnly && !/\.(types|constants)$/.test(spec)) {
      fail('§3 un adapter solo importa types y constants', f, spec);
    }
    if (/\/store\/[^/]+Store\.ts$/.test(f) && !typeOnly && !/\.(types|constants)$|^zustand(\/|$)/.test(spec)) {
      fail('§3 un store solo importa types, constants y zustand', f, spec);
    }
  }
}

// 5 · Sizes (§11.1, §13.2)
for (const f of files) {
  if (/\/(components|shared\/ui)\/.+\.tsx$/.test(f) && lineCount(f) > 300) fail('§11.1 más de 300 líneas', f);
  if (/\/hooks\/use\w+\.ts$/.test(f)) {
    if (lineCount(f) > 100) fail('§13.2 hook de más de 100 líneas', f, String(lineCount(f)));
    const useStates = (source.get(f).match(/\buseState\s*[<(]/g) ?? []).length;
    if (useStates > 3) fail('§7 más de 3 useState', f, String(useStates));
  }
}

// 6 · Code smells (§13.4, §13.9)
for (const [f, code] of source) {
  if (/\bas\s+(any|never)\b|\bas\s+unknown\s+as\b/.test(code)) fail('§13.4 cast prohibido', f);
  for (const m of code.matchAll(/eslint-disable[^\n]*/g)) {
    if (!m[0].includes(' -- ')) fail('§13.9 eslint-disable sin motivo', f);
    if (m[0].includes('exhaustive-deps')) fail('§7 exhaustive-deps desactivado', f);
  }
  if (f.endsWith('.types.ts') && /^\s*export\s+(const|let|var|function|class)\b/m.test(code)) {
    fail('§4.3 .types.ts con valores de runtime', f);
  }
}

// 7 · Literals duplicated outside src/ must stay in sync (§9.2 cannot reach index.html / vite.config.ts)
const indexHtml = readFileSync('index.html', 'utf8');
const persistKey = /ui:\s*'([^']+)'/.exec(source.get('src/store/store.constants.ts') ?? '')?.[1];
if (persistKey && !indexHtml.includes(`'${persistKey}'`)) {
  fail('sync clave de persist', 'index.html', persistKey);
}
const preferenceConstants = source.get('src/features/preference/constants/preference.constants.ts') ?? '';
const themeColors = /THEME_META_COLORS\s*=\s*\{([^}]*)\}/.exec(preferenceConstants)?.[1] ?? '';
const darkColor = /dark:\s*'(#[0-9a-fA-F]{6})'/.exec(themeColors)?.[1];
const lightColor = /light:\s*'(#[0-9a-fA-F]{6})'/.exec(themeColors)?.[1];
if (darkColor) {
  if (!indexHtml.includes(darkColor)) fail('sync theme-color oscuro', 'index.html', darkColor);
  const viteConfig = readFileSync('vite.config.ts', 'utf8');
  if (viteConfig.includes('VitePWA') && !viteConfig.includes(darkColor)) {
    fail('sync theme-color oscuro', 'vite.config.ts', darkColor);
  }
}
if (lightColor && !indexHtml.includes(lightColor)) fail('sync theme-color claro', 'index.html', lightColor);

// 8 · Every component folder matches its file name (§4.2)
for (const f of files) {
  if (!/\/(components|shared\/ui)\/.+\/[^/]+\.tsx?$/.test(f)) continue;
  const stem = basename(f).replace(/(\.types|\.variants)?\.tsx?$/, '');
  if (basename(f) !== 'index.ts' && stem !== basename(dirname(f))) fail('§4.2 archivo ≠ carpeta del componente', f);
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\ncheck-arch: ${errors.length} error(es)`);
  process.exit(1);
}
console.log(`check-arch OK (${files.length} archivos)`);
