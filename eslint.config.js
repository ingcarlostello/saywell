import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

// ── Slot 1 (core rules): network only in .services.ts and apiClient.ts (§12.2 block 1)
const NET_EXEMPT = ['src/**/*.services.ts', 'src/**/*.api.ts', 'src/shared/api/apiClient.ts'];
const NET_GLOBALS = [
  { name: 'fetch', message: 'La red vive en .services.ts / apiClient.ts' },
  { name: 'XMLHttpRequest', message: 'Usa .services.ts' },
  { name: 'EventSource', message: 'Usa .services.ts' },
  { name: 'WebSocket', message: 'Usa .services.ts' },
];
const STORAGE_GLOBALS = [
  { name: 'localStorage', message: 'Presentación sin storage: el estado persiste en un store (§13.1)' },
  { name: 'sessionStorage', message: 'Presentación sin storage: el estado persiste en un store (§13.1)' },
];
const NET_PATHS = ['axios', 'ky', 'ofetch'].map((name) => ({ name, message: 'Solo apiClient.ts' }));
const NET_SYNTAX = [
  {
    selector: "MemberExpression[object.name='navigator'][property.name='sendBeacon']",
    message: 'Solo apiClient.ts',
  },
  {
    selector: "MemberExpression[object.name='document'][property.name='cookie']",
    message: 'Prohibido document.cookie (§13.1)',
  },
];

// ── Slot 2 (@typescript-eslint/no-restricted-imports): layer boundaries (§12.2 blocks 2-3, §13.5)
const UI_MSG = 'Presentación y cableado: sin estado ni I/O; se usa el facade (§2.5, §13.1)';
const UI_PATTERNS = [
  {
    group: [
      '**/store/**', '**/*.store', '**/*Store', '**/*.slice', '**/*Slice', '**/*.selectors',
      '**/*.services', '**/*.api', '**/*.adapter', '@/store', '@/store/*',
    ],
    message: UI_MSG,
  },
];
const UI_PATHS = ['react-redux', 'zustand', '@tanstack/react-query'].map((name) => ({ name, message: UI_MSG }));
const COMPONENT_PATTERNS = [
  {
    group: ['@/features/*/hooks/*', '**/hooks/use*'],
    message: 'Los componentes reciben props del container; no llaman hooks de feature',
  },
];
const SHARED_PATTERNS = [
  {
    group: ['@/features/*', '@/features/**', '../features/*', '@/store', '@/store/*', '@/app/*'],
    message: 'shared/ no conoce features, store ni app (§2.6)',
  },
];
const STORE_PATTERNS = [
  { group: ['@/features/*', '@/features/**', '@/app/*'], message: 'src/store no importa features ni app (§8.2)' },
];
const APP_PATTERNS = [{ group: ['@/features/*/*'], message: 'app/ importa features solo por su barrel (§4.5)' }];
const restrict = (patterns, paths = []) => ({
  '@typescript-eslint/no-restricted-imports': ['error', { patterns, paths }],
});

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', '.vercel']),
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      // §5.2 exige `interface XProps extends ComponentProps<'x'> {}` aunque no añada miembros
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', 'ts-ignore': true, 'ts-nocheck': true },
      ],
    },
  },
  {
    files: ['api/**/*.ts', 'scripts/**/*.mjs', '*.config.{ts,js,mjs}'],
    languageOptions: { globals: globals.node },
  },

  // ── Slot 1: network (and storage in presentation/wiring layers)
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: NET_EXEMPT,
    rules: {
      'no-restricted-globals': ['error', ...NET_GLOBALS],
      'no-restricted-imports': ['error', { paths: NET_PATHS }],
      'no-restricted-syntax': ['error', ...NET_SYNTAX],
    },
  },
  {
    // Later block wins per rule: repeat NET_GLOBALS so they are not dropped.
    files: ['src/features/*/components/**/*.tsx', 'src/features/*/containers/**/*.tsx', 'src/shared/ui/**/*.tsx'],
    rules: { 'no-restricted-globals': ['error', ...NET_GLOBALS, ...STORAGE_GLOBALS] },
  },

  // ── Slot 2: layer boundaries, general → specific (shared/ui is the explicit union)
  { files: ['src/shared/**/*.{ts,tsx}'], rules: restrict(SHARED_PATTERNS) },
  { files: ['src/shared/ui/**/*.tsx'], rules: restrict([...UI_PATTERNS, ...SHARED_PATTERNS], UI_PATHS) },
  { files: ['src/store/**/*.ts'], rules: restrict(STORE_PATTERNS) },
  {
    files: ['src/features/*/components/**/*.tsx'],
    rules: restrict([...UI_PATTERNS, ...COMPONENT_PATTERNS], UI_PATHS),
  },
  { files: ['src/features/*/containers/**/*.tsx'], rules: restrict(UI_PATTERNS, UI_PATHS) },
  { files: ['src/app/**/*.{ts,tsx}', 'src/main.tsx'], rules: restrict([...UI_PATTERNS, ...APP_PATTERNS], UI_PATHS) },

  // ── api/ (Vercel Functions): self-contained, env and network in fixed places
  {
    files: ['api/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*', '**/src/**'],
              message: 'api/ no importa src/: Vercel compila api/ archivo por archivo y sin alias',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['api/**/*.ts'],
    ignores: ['api/_lib/env.config.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'process', property: 'env', message: 'Solo api/_lib/env.config.ts lee process.env' },
      ],
    },
  },
  {
    files: ['api/**/*.ts'],
    ignores: ['api/_lib/*.services.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'La red de api/ vive en api/_lib/*.services.ts' },
      ],
    },
  },
]);
