# Pronunciador — reglas del proyecto

@rules/react-architecture.md

Las reglas viven en `rules/` (decisión del usuario; sustituye a la ruta `.claude/rules/` de §15).

## Overrides del usuario (prevalecen sobre las reglas)

1. **Sin tests de ningún tipo.** No aplican §12.5, §13.7, la casilla "test en el mismo PR" de §13.4,
   los pasos de test de §14.1–§14.4 ni `test:ci` del gate. Prohibidos `.test.ts(x)`, `.fixtures.ts`,
   `__fixtures__/`, `.testing.ts`, `src/test/`, vitest y msw. `reset()` SÍ existe en todo store (§8.1.2).
2. **Sin TanStack Query ni RTK Query.** Las reglas (R) de queries no aplican. El estado de una petición
   vive en un `useReducer` de un hook interno del facade, nunca en un store (§8.1).
3. **Zustand solo en:** `src/store/ui` (tema, idioma) y `features/pronunciation/store` (historial y
   snapshot del rate limit + clientId). El snapshot `{limit, remaining, resetAt}` que devuelve el servidor
   se cachea por decisión explícita del usuario (§13.5 presupone una caché de queries).
4. **Modelo DeepSeek:** `deepseek-chat` se retiró el 2026-07-24. Se usa `deepseek-flash` con
   `thinking: {type: 'disabled'}`; se puede cambiar con la env `DEEPSEEK_MODEL`.
5. **Rate limit:** 30/h por usuario (`X-Client-Id`) + techo de 90/h por IP; la ventana empieza con la
   primera petición.

## Interpretaciones fijadas

- Stores: `<entity>Store.ts` y `<entity>Store.types.ts` (§4.3 y §14.1 prevalecen sobre el `.store.ts`
  del árbol de §8.3). Un store solo importa types y constants; la lógica la aplica el hook que lo usa.
- Features en kebab-case **singular**: `preference`, `pronunciation`, `install-app`.
- Callbacks `on*`: siempre `() => void` con closures construidos en el facade. Única excepción:
  `onValueChange(value: string)` de un input.
- Regiones condicionales: se resuelven en el JSX del container con constantes
  (`view.kind === RESULT_VIEW.ready && <X …/>`) o por slots `ReactNode`; nunca props huérfanas (§11.2.3).
- Componentes anidados (`components/A/B/B.tsx`) importan tipos/constantes de su feature con
  `@/features/<misma-feature>/…`, porque la ruta relativa necesitaría `../../` (§4.4).
- Un adapter nunca importa otro adapter: el service compone los adapters.
- Infraestructura de `shared/` (singleton por diseño): `shared/api/*`, `shared/ui/*`,
  `shared/utils/cn.utils.ts`.
- Textos de UI: en el `.constants.ts` de cada entidad como `{ es, en } as const satisfies Localized<X>`.
  El facade elige por `lang` y pasa `labels` a los componentes. No hay librería de i18n.
- Lo persistido llega sin validar (§12.6 #4): el facade que lee `theme`/`lang` del store los pasa por
  `toSupportedTheme` / `toSupportedLang` (mismo fallback que el script de `index.html`); el store no valida.
- `typecheck` = `tsc -b` (el `tsconfig.json` raíz solo tiene references; `tsc --noEmit` no revisa nada).
- Variantes de `shared/ui` que choquen con atributos nativos se renombran (`inputSize`, no `size`).
- `api/` (Vercel Functions) queda fuera de `src/`: TS con NodeNext, imports relativos **con `.js`**,
  sin `@/`, sin importar `src/`. Solo `api/_lib/env.config.ts` lee `process.env`; solo
  `api/_lib/*.services.ts` usa `fetch`.
- Contrato HTTP duplicado a propósito entre `api/_lib/pronounce.schema.ts` y
  `src/features/pronunciation/schemas/*`, con comentario `// CONTRACT:` en ambos.

## Comandos

- `npm run dev` — Vite (solo frontend; `/api` no responde)
- `npm run dev:full` — `vercel dev` (frontend + `/api`; requiere `vercel link`: baja las variables de
  Development al arrancar, sin `vercel pull`. Nunca crear un `.env` en la raíz: hace que ignore las de la nube)
- `npm run lint` — ESLint `--max-warnings=0`
- `npm run lint:arch` — `scripts/check-arch.mjs`
- `npm run typecheck` — `tsc -b` (app + node + api)
- `npm run build` — `tsc -b && vite build`
- `npm run verify` — gate: lint && lint:arch && typecheck && build
- `npm run generate-pwa-assets` — iconos PWA desde `public/favicon.svg`

## shadcn

Tras cada `npx shadcn@latest add <x>`: mover a `src/shared/ui/<Pascal>/<Pascal>.tsx`, separar
`<Pascal>.variants.ts` y `<Pascal>.types.ts`, importar `cn` de `@/shared/utils/cn.utils`, solo named
exports, `focus-visible` en la clase base, tamaños táctiles ≥44 px, podar lo que no se use y exportarlo
(enumerado) en `src/shared/ui/index.ts`.

## PWA

El service worker solo existe en build: se prueba con `npm run build && npm run preview`. La instalación
se valida en el dominio de producción (los previews protegidos devuelven 401 en el manifest; por LAN en
http no hay service worker ni `crypto.randomUUID`).
