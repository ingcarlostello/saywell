# Pronunciador EN→ES

Entrenador de pronunciación de inglés americano. Escribes una palabra o frase corta en inglés y la app
te explica cómo se pronuncia con "fonética casera" (letras normales, sin IPA), sílaba por sílaba, con
una frase de ejemplo y audio del navegador. Interfaz en español o inglés, tema claro/oscuro e instalable
como PWA.

## Stack

- React 19 + TypeScript 6 + Vite 8, Tailwind CSS v4 + shadcn/ui (Radix), Zustand, zod.
- Vercel Function `POST /api/pronounce` → DeepSeek (`deepseek-flash`, salida JSON).
- Rate limit en Upstash Redis: 30 consultas/hora por usuario y 90/hora por IP (la hora empieza con la
  primera consulta).
- PWA con `vite-plugin-pwa`.

La arquitectura sigue `rules/react-architecture.md`; los overrides y convenciones están en `CLAUDE.md`.

## Requisitos

- Node 22 (recomendado 22.17+ o 24 LTS).
- Cuenta de Vercel con la integración **Upstash for Redis** (Marketplace) y una API key de DeepSeek.

## Variables de entorno (solo servidor)

| Variable | Origen |
|---|---|
| `DEEPSEEK_API_KEY` | platform.deepseek.com |
| `DEEPSEEK_MODEL` | opcional; por defecto `deepseek-flash` |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | los inyecta la integración de Upstash (también se aceptan `UPSTASH_REDIS_REST_URL`/`_TOKEN`) |

Ver `.env.example`. Nunca uses el prefijo `VITE_` para secretos.

## Desarrollo

```bash
npm install
npm run dev          # solo la UI (sin /api)
npm run dev:full     # UI + /api con `vercel dev` (antes: vercel login, vercel link, vercel pull)
npm run verify       # lint + check de arquitectura + typecheck + build
```

Para probar la PWA: `npm run build && npm run preview`.

## Despliegue

1. Sube el repo a GitHub e impórtalo en Vercel (detecta Vite: build `npm run build`, salida `dist`).
2. Storage → Upstash for Redis (Free, `us-east-1`, sin prefijo de variables, en los 3 entornos).
3. Añade `DEEPSEEK_API_KEY` en Settings → Environment Variables y redepliega.
4. Valida la instalación de la PWA en el dominio de producción.

## Notas

- La ruta de la API es `/api/pronounce` (la especificación original decía `/api/pronunciate`).
- Privacidad: las palabras que consultas se envían a DeepSeek. El historial solo vive en tu navegador.
  Las IP se guardan hasheadas y solo durante una hora para el límite de uso.
