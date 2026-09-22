# Arquitectura React — reglas del proyecto

Documento normativo. Se aplica a todo el código de `src/`. Un agente debe poder auditar un diff
contra él sin interpretar intenciones: cada regla es verificable o no existe.

Idioma: las reglas están en español; el código, los identificadores, los nombres de archivo y de
carpeta están **siempre en inglés**.

---

## Tabla de contenidos

- [1. Propósito y alcance](#1-propósito-y-alcance)
- [2. Principios no negociables](#2-principios-no-negociables)
- [3. Mapa de capas](#3-mapa-de-capas)
- [4. Estructura de carpetas y nomenclatura](#4-estructura-de-carpetas-y-nomenclatura)
- [5. Componentes presentacionales](#5-componentes-presentacionales)
- [6. Containers](#6-containers)
- [7. Hooks y el facade](#7-hooks-y-el-facade)
- [8. Estado](#8-estado)
- [9. Services, schemas y adapters](#9-services-schemas-y-adapters)
- [10. SOLID aplicado a React](#10-solid-aplicado-a-react)
- [11. División de componentes](#11-división-de-componentes)
- [12. Tooling, testing y anti-patrones](#12-tooling-testing-y-anti-patrones)
- [13. Checklist de auditoría](#13-checklist-de-auditoría)
- [14. Procedimiento para el agente](#14-procedimiento-para-el-agente)
- [15. Instalación de este documento](#15-instalación-de-este-documento)

---

## 1. Propósito y alcance

Stack asumido: **React 19 + TypeScript 5.9 + Vite o Next.js App Router**. Estado de servidor con
TanStack Query o RTK Query. Estado de cliente con Zustand, Redux Toolkit o Context API.

**Reglas base vs. recomendadas.** Las reglas marcadas con `(R)` dependen de una dependencia del
stack asumido (zod, msw, TanStack Query / RTK Query) o de un límite numérico afinable. Si el
proyecto no usa esa dependencia, la regla no aplica y no bloquea el merge. **Todo lo demás es
obligatorio.**

Ante una ambigüedad no resuelta por este documento, aplica la opción más restrictiva y documéntala
según [§14.5](#145-cuando-la-regla-no-se-puede-cumplir).

---

## 2. Principios no negociables

1. **La UI es presentacional.** Un `.tsx` de `components/` recibe props y emite eventos. Nada más.
2. **La lógica de negocio vive fuera del `.tsx`**: hooks, `.helper.ts`, `.utils.ts`,
   `.constants.ts`, `.types.ts`.
3. **La red vive solo en `.services.ts`** (o `.api.ts` con RTK Query) y en el `apiClient` compartido.
4. **`.adapter.ts` traduce forma, no reglas**: `toX(dto)` y `toXDto(input)`, puros y síncronos.
5. **FACADE obligatorio.** Todo acceso al estado desde la UI pasa por
   `features/<f>/hooks/use<Feature>.ts`. Ningún componente ni container importa `zustand`,
   `react-redux`, un store, un slice, un selector ni un hook `*Query`/`*Mutation`.
6. **`shared/` no conoce el dominio.** Reutilizable entre features: `ui`, `utils`, `api`, `config`.
7. **SOLID es auditable**, no decorativo: ver [§10](#10-solid-aplicado-a-react) y
   [§13.8](#138-solid-verificable).
8. **Un componente > 300 líneas o con más de un propósito visual se divide.**
9. **Los manejadores de estado viven en sus carpetas**: `src/store/` (global) y
   `features/<f>/store/` (dominio). Ver [§8](#8-estado).
10. **El sufijo de tipos es `.types.ts`, en plural, siempre.** La forma en singular está prohibida.

---

## 3. Mapa de capas

```text
                 ┌───────────────────────────────────────────┐
  red externa ──►│ apiClient (shared/api)                    │
                 │   └─ <f>.services.ts / <f>.api.ts         │  I/O
                 │        └─ <f>.schema.ts   (valida DTO)    │
                 │             └─ <f>.adapter.ts (DTO⇄model) │
                 └──────────────────┬────────────────────────┘
                                    ▼
                 ┌───────────────────────────────────────────┐
                 │ <f>.helper.ts · <f>.constants.ts          │  reglas puras
                 │ store/ (cliente) · hooks *Query/*Mutation │  estado
                 └──────────────────┬────────────────────────┘
                                    ▼
                 ┌───────────────────────────────────────────┐
                 │ hooks/use<Feature>.ts  ◄── FACADE ÚNICO   │
                 └──────────────────┬────────────────────────┘
                                    ▼
                 ┌───────────────────────────────────────────┐
                 │ containers/<X>Container.tsx  (cableado)   │
                 │   └─ components/**.tsx  (presentacional)  │
                 └───────────────────────────────────────────┘
```

| Capa | Archivo | Puede importar | Prohibido importar |
|---|---|---|---|
| Presentación | `components/**/*.tsx` | `shared/ui`, `.types.ts`, `.constants.ts` | red, estado, services, adapters, hooks de datos |
| Cableado | `containers/*Container.tsx` | el facade, componentes | todo lo que §13.1 prohíbe a components |
| Facade | `hooks/use<Feature>.ts` | store, hooks de datos, helpers, services | JSX |
| Datos | `hooks/use*Query.ts`, `use*Mutation.ts` | services, constants | JSX, componentes |
| Estado | `store/**` | types, constants | React DOM, services de otra feature |
| I/O | `*.services.ts`, `*.api.ts` | `apiClient`, schema, adapter, constants | JSX, hooks de React, router, toasts |
| Traducción | `*.adapter.ts` | types, constants | todo lo demás |
| Puras | `*.helper.ts`, `*.utils.ts` | types, constants | `react`, red, estado |

---

## 4. Estructura de carpetas y nomenclatura

### 4.1 Árbol raíz

```text
src/
├─ app/                     # composición de la aplicación: rutas, layouts, providers
│  ├─ providers/
│  └─ routes/               # o app/ de Next.js App Router
├─ store/                   # manejador de estado: configuración global + estado transversal
├─ shared/                  # reutilizable entre features, sin dominio
│  ├─ api/                  # apiClient.ts, api.types.ts, ApiError.ts
│  ├─ config/               # env.config.ts
│  ├─ ui/                   # primitivas presentacionales (Button, Input, Modal)
│  ├─ hooks/                # useDebounce, useMediaQuery…
│  ├─ utils/                # date.utils.ts, string.utils.ts…
│  ├─ constants/
│  └─ types/
├─ features/                # una carpeta por dominio, en kebab-case singular
│  └─ auth/
└─ test/                    # msw.server.ts, TestProviders.tsx, resetAllStores.ts
```

### 4.2 Anatomía de una feature

```text
src/features/auth/
├─ types/auth.types.ts              # modelo de dominio, input, contrato del facade
├─ schemas/auth.schema.ts           # (R) schemas zod; DTO derivado con z.infer
├─ constants/auth.constants.ts      # endpoints, query keys, unions as const
├─ adapters/auth.adapter.ts         # toUser(dto), toLoginDto(input)
├─ services/auth.services.ts        # una función exportada por endpoint
├─ helpers/auth.helper.ts           # reglas de negocio puras
├─ store/
│  ├─ auth.store.ts                  # o auth.slice.ts con Redux Toolkit
│  ├─ authStore.types.ts
│  └─ auth.store.testing.ts          # resetAuthStore()
├─ hooks/
│  ├─ useAuth.ts                    # FACADE — única puerta de la UI al estado
│  ├─ useSessionQuery.ts            # (R) hook de datos, solo lo consume el facade
│  └─ useLoginMutation.ts           # (R)
├─ components/LoginForm/
│  ├─ LoginForm.tsx
│  └─ LoginForm.types.ts
├─ containers/LoginContainer.tsx
├─ __fixtures__/auth.fixtures.ts
└─ index.ts                         # barrel público, exports enumerados
```

Nombre de archivo = nombre de la **entidad** de la feature. Si la feature maneja varias entidades,
usa la entidad como prefijo (`order.adapter.ts`, `orderItem.adapter.ts`) y mantén la misma entidad
en todos sus archivos. Prohibido mezclar `auth.types.ts` con `user.adapter.ts` en la misma entidad.

### 4.3 Tabla de sufijos

Sufijos base (convención literal del proyecto):

| Sufijo | Contiene | Nunca contiene |
|---|---|---|
| `.types.ts` | `interface`, `type`, re-export **de tipo** | valores de runtime |
| `.constants.ts` | literales `as const`, endpoints, query keys | funciones con lógica |
| `.helper.ts` | reglas de negocio puras de una feature | `react`, red |
| `.utils.ts` | utilidades genéricas sin dominio | imports de `features/` |
| `.services.ts` | I/O: una función exportada por endpoint | JSX, store, toasts |
| `.adapter.ts` | `toX(dto)` / `toXDto(input)` | `await`, relojes, aleatoriedad |

Sufijos derivados permitidos (definidos en este documento; cualquier otro sufijo es una infracción):

| Sufijo | Capa | Definido en | Obligatoriedad |
|---|---|---|---|
| `.api.ts` | I/O con RTK Query `createApi` | §9.1 | alternativa a `.services.ts` |
| `.schema.ts` | schemas de validación de DTO | §9.3 | (R) |
| `Store.ts` / `Store.types.ts` | store de cliente y su contrato | §8 | obligatoria si hay store |
| `Slice.ts` / `.selectors.ts` | Redux Toolkit | §8.4 | si el proyecto usa Redux |
| `.variants.ts` | variantes visuales de `shared/ui` | §5 | si el componente tiene variantes |
| `.config.ts` | configuración validada (`env.config.ts`) | §12.2 | obligatoria para env |
| `Container.tsx` | cableado facade → props | §6 | obligatoria si hay facade |
| `.test.ts(x)` | tests | §12.5 | obligatoria |
| `.fixtures.ts` | datos de test tipados, en `__fixtures__/` | §12.5 | obligatoria en tests |
| `.testing.ts` | utilidades de test de un store (`reset<X>Store`) | §8.3 | obligatoria si hay store |

Regla mecánica de tipos: **el archivo de tipos de un módulo es el nombre del módulo + `.types.ts`**
(`apiClient.ts` → `apiClient.types.ts`). Excepción única y explícita: el contrato del estado de una
feature siempre se llama `<entity>Store.types.ts`, con ambas librerías, y vive en `store/`, nunca
en `types/`. `types/` guarda modelo de dominio, inputs y el contrato del facade.

El nombre de entidad usa `camelCase` aunque la carpeta sea `kebab-case`:
feature `user-profile` → `store/userProfileStore.ts`, `store/userProfileStore.types.ts`,
`hooks/useUserProfile.ts`.

### 4.4 Alias e imports

- Dentro de la misma feature: rutas relativas de **como máximo un nivel**
  (`./LoginForm`, `../services/auth.services`). Prohibido `../../`.
- Cruzando feature, `shared/`, `app/` o `store/`: alias `@/`.

### 4.5 Barrels

Solo existen tres barrels legales:

1. `src/features/<f>/index.ts` — API pública de la feature, con exports enumerados.
2. `src/shared/ui/index.ts` — primitivas.
3. `src/store/index.ts` — provider y hooks tipados del store global.

Prohibido `index.ts` en `shared/utils`, `shared/hooks`, `shared/constants`, `shared/types` y en
cualquier carpeta de categoría dentro de una feature (`components/`, `hooks/`, `services/`…).
Prohibido `export * from`.

---

## 5. Componentes presentacionales

Reglas:

1. Los datos entran por props; los eventos salen por props `on*` con firma `() => void`.
2. Props tipadas con `interface <Component>Props` en `<Component>.types.ts`.
3. Sin `export default` (salvo páginas exigidas por el framework).
4. Sin `fetch`, `localStorage`, `document.cookie`, URLs, `async`, `await`, `.then(`, `try/catch`.
5. Sin reglas de negocio ni formateo de dominio (`Intl.NumberFormat`, `toFixed`) sobre datos crudos.
6. `key` con id estable del dominio, nunca el índice.
7. Los componentes de `shared/ui` reenvían props nativas y `ref`, y definen variantes en
   `<Component>.variants.ts`.

```tsx
// mal — el componente decide, calcula y llama a la red
export function OrderCard({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/orders/${orderId}`).then((r) => r.json()).then(setOrder);
  }, [orderId]);
  const total = order?.items.reduce((a: number, i: any) => a + i.price * i.qty, 0) ?? 0;
  return <p>{order?.status === 'PENDING' ? 'Pendiente' : ''} {total.toFixed(2)}</p>;
}
```

```tsx
// bien — recibe todo calculado y solo pinta
import type { OrderCardProps } from './OrderCard.types';

export function OrderCard({ statusLabel, formattedTotal, onRetry }: OrderCardProps) {
  return (
    <article>
      <p>{statusLabel}</p>
      <p>{formattedTotal}</p>
      <button type="button" onClick={onRetry}>Reintentar</button>
    </article>
  );
}
```

Excepciones tasadas al punto 4:

- **RSC**: un React Server Component (`async function`, sin `'use client'`, sin hooks, sin
  handlers) que **solo** invoca a un `.services.ts`. Márcalo con `// RSC:` en la primera línea.
- **ErrorBoundary**: `shared/ui/ErrorBoundary.tsx` puede usar `componentDidCatch` /
  `getDerivedStateFromError` y `console.error`, sin lógica de dominio.

---

## 6. Containers

Un container conecta el facade con componentes presentacionales. Solo contiene: llamada al facade,
destructuring y un único `return` de JSX que pasa props. Cero `if/else` fuera del JSX, cero
`try/catch`, cero aritmética, cero `.map/.filter/.reduce`, cero literales de negocio.

```tsx
// src/features/auth/containers/LoginContainer.tsx
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm/LoginForm';

export function LoginContainer() {
  const { signIn, isSubmitting, errorMessage } = useAuth();
  return <LoginForm onSubmit={signIn} isSubmitting={isSubmitting} errorMessage={errorMessage} />;
}
```

---

## 7. Hooks y el facade

- Cada feature con estado expone **exactamente un** facade: `hooks/use<Feature>.ts`, con **tipo de
  retorno explícito** declarado en `types/<name>.types.ts`.
- El facade no expone `dispatch`, `store`, `getState`, `queryClient` ni acciones crudas.
- Los hooks de datos (`use*Query`, `use*Mutation`) los consume **solo** el facade.
- Ningún hook retorna JSX ni construye URLs.
- Si un hook necesita más de 3 `useState` (R), consolida en `useReducer` con acciones tipadas en
  `.types.ts`, o promueve al store. Prohibido esquivarlo con un `useState` de objeto que agrupe
  estados no relacionados.
- Todo `useEffect` con suscripción o timer devuelve función de limpieza. Cero
  `eslint-disable react-hooks/exhaustive-deps`.

```ts
// src/features/auth/types/auth.types.ts
export type { UserDto, LoginDto } from '../schemas/auth.schema'; // re-export DE TIPO

export type Role = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  avatarUrl?: string;
  companyName?: string;
  jobTitle?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthFacade {
  user?: User;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => void;
}
```

```ts
// src/features/auth/hooks/useAuth.ts — la única puerta de la UI al estado de auth
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/auth.store';
import { useSessionQuery } from './useSessionQuery';
import { useLoginMutation } from './useLoginMutation';
import { AUTH_MESSAGES } from '../constants/auth.constants';
import type { AuthFacade, LoginInput } from '../types/auth.types';

export function useAuth(): AuthFacade {
  const { sessionStatus, setSessionStatus, reset } = useAuthStore(
    useShallow((s) => ({
      sessionStatus: s.sessionStatus,
      setSessionStatus: s.setSessionStatus,
      reset: s.reset,
    })),
  );
  const session = useSessionQuery({ enabled: sessionStatus === 'authenticated' });
  const login = useLoginMutation();

  const signIn = async (input: LoginInput): Promise<void> => {
    await login.mutateAsync(input);
    setSessionStatus('authenticated');
  };

  return {
    user: session.data,
    isAuthenticated: sessionStatus === 'authenticated',
    isSubmitting: login.isPending,
    errorMessage: login.error ? AUTH_MESSAGES.loginFailed : undefined,
    signIn,
    signOut: reset,
  };
}
```

---

## 8. Estado

### 8.1 Decisión de dónde vive cada dato

| Dato | Dónde |
|---|---|
| Respuesta de API (entidades, listas, detalle) | TanStack Query / RTK Query (R). Nunca copiado a un store de cliente |
| Estado de UI transversal (tema, sidebar, modales, toasts) | `src/store/` |
| Estado de cliente propio de un dominio | `features/<f>/store/` |
| Estado efímero de un componente | `useState` local |
| Valor derivable de otro | **no se guarda**: se calcula en render o en el facade |

**Sesión.** El store de auth guarda únicamente `{ sessionStatus, accessTokenExpiry }`. El objeto
`user` es dato de servidor y vive en la query `authKeys.session()`; el facade lo compone.
`status`/`error` de una petición **nunca** se copian al store: se leen de `isPending`/`error`.

Reglas comunes a cualquier librería:

1. Ningún reducer, acción o `set` navega, muestra toasts ni toca el DOM.
2. Todo store expone `reset()`; los tests restauran con `reset()`, nunca con `setState` directo.
3. Los tipos del store viven en `store/<entity>Store.types.ts`.
4. Estados mutuamente excluyentes se modelan con union discriminada, no con banderas sueltas.

### 8.2 Estructura canónica con Redux Toolkit

```text
src/
├─ store/                              # RAÍZ: configuración global + estado transversal de app
│  ├─ store.ts                         # configureStore + middlewares
│  ├─ store.types.ts                   # RootState, AppDispatch, AppStore
│  ├─ hooks.ts                         # useAppDispatch / useAppSelector tipados
│  ├─ rootReducer.ts
│  ├─ index.ts                         # barrel permitido (§4.5)
│  └─ slices/
│     ├─ ui.slice.ts                    # tema, sidebar, modales
│     ├─ ui.selectors.ts
│     └─ uiStore.types.ts
└─ features/
   └─ auth/
      ├─ store/                        # ESTADO DE DOMINIO de la feature
      │  ├─ auth.slice.ts
      │  ├─ auth.selectors.ts          # createSelector
      │  └─ authStore.types.ts         # AuthState, AuthStore
      ├─ services/auth.services.ts     # o auth.api.ts con createApi (baseQuery → apiClient)
      ├─ hooks/useAuth.ts              # FACADE OBLIGATORIO: único acceso de la UI
      ├─ containers/LoginContainer.tsx
      └─ components/                   # jamás importa react-redux ni un slice
```

`features/<f>/store/` registra su reducer en `src/store/rootReducer.ts`. La dirección de
dependencia es siempre feature → raíz: `src/store/` nunca importa de `features/`, salvo el
ensamblado explícito del `rootReducer`.

### 8.3 Estructura canónica con Zustand

```text
src/
├─ store/                              # RAÍZ: estado transversal de app
│  ├─ ui/
│  │  ├─ ui.store.ts                   # create()(devtools(...))
│  │  ├─ uiStore.types.ts              # interfaces del estado y acciones globales
│  │  └─ ui.store.testing.ts           # resetUiStore()
│  ├─ store.constants.ts               # claves de persist
│  └─ index.ts                         # re-exportación limpia (§4.5)
└─ features/
   └─ auth/
      ├─ store/                        # ESTADO DE DOMINIO de la feature
      │  ├─ auth.store.ts              # store principal (create)
      │  ├─ authStore.types.ts         # State + Actions
      │  ├─ auth.store.testing.ts      # resetAuthStore()
      │  └─ slices/                    # OPCIONAL: solo si el store supera el umbral de §8.3.1
      │     ├─ user.slice.ts
      │     └─ session.slice.ts
      ├─ services/auth.services.ts
      ├─ hooks/useAuth.ts              # FACADE OBLIGATORIO: único acceso de la UI
      ├─ containers/LoginContainer.tsx
      └─ components/                   # jamás importa zustand ni el store
```

#### 8.3.1 Cuándo dividir el store en `slices/`

`slices/` es **opcional**. Crea la carpeta solo cuando el store cruza cualquiera de estos umbrales:

- el archivo `<entity>.store.ts` supera **150 líneas**, o
- el estado agrupa **dos o más subdominios** que se pueden nombrar por separado (`user`, `session`), o
- **más de 8 acciones** en un mismo `create()`.

Cada slice es un `StateCreator` tipado que recibe el estado completo y devuelve su porción; el
`create()` de `<entity>.store.ts` los compone. Un slice **nunca** se consume directamente desde la
UI: el facade sigue siendo el único acceso.

```ts
// src/features/auth/store/slices/session.slice.ts
import type { StateCreator } from 'zustand';
import type { AuthStore, SessionSlice } from '../authStore.types';

export const createSessionSlice: StateCreator<AuthStore, [], [], SessionSlice> = (set) => ({
  sessionStatus: 'anonymous',
  setSessionStatus: (sessionStatus) => set({ sessionStatus }, false, 'auth/setSessionStatus'),
});
```

```ts
// src/features/auth/store/auth.store.ts  (variante con slices)
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthStore } from './authStore.types';
import { createSessionSlice } from './slices/session.slice';
import { createUserSlice } from './slices/user.slice';

export const useAuthStore = create<AuthStore>()(
  devtools(
    (...a) => ({ ...createSessionSlice(...a), ...createUserSlice(...a) }),
    { name: 'auth', enabled: import.meta.env.DEV },
  ),
);
```

```ts
// src/features/auth/store/authStore.types.ts
export type SessionStatus = 'anonymous' | 'authenticating' | 'authenticated';

export interface AuthState {
  sessionStatus: SessionStatus;
  accessTokenExpiry?: number;
}

export interface AuthStore extends AuthState {
  setSessionStatus: (status: SessionStatus) => void;
  setAccessTokenExpiry: (expiry: number) => void;
  reset: () => void;
}
```

```ts
// src/features/auth/store/auth.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthState, AuthStore } from './authStore.types';

const initialState: AuthState = { sessionStatus: 'anonymous' };

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      ...initialState,
      setSessionStatus: (sessionStatus) => set({ sessionStatus }, false, 'auth/setSessionStatus'),
      setAccessTokenExpiry: (accessTokenExpiry) =>
        set({ accessTokenExpiry }, false, 'auth/setAccessTokenExpiry'),
      reset: () => set(initialState, false, 'auth/reset'),
    }),
    { name: 'auth', enabled: import.meta.env.DEV },
  ),
);
```

```ts
// src/features/auth/store/auth.store.testing.ts
import { useAuthStore } from './auth.store';

export function resetAuthStore(): void {
  useAuthStore.getState().reset();
}
```

Reglas específicas de Zustand:

- Todo `set` lleva tercer argumento con el nombre de acción namespaced; por tanto el store se crea
  siempre con `devtools` (sin él, el tercer argumento no compila).
- Suscripciones multi-campo:
  `import { useShallow } from 'zustand/react/shallow'` y
  `useAuthStore(useShallow((s) => ({ a: s.a, b: s.b })))`.
  Prohibido `useAuthStore()` sin selector y prohibido pasar `shallow` como segundo argumento
  (eliminado en Zustand 5).
- `persist` declara `partialize` y **nunca** persiste tokens.

### 8.4 Reglas específicas de Redux Toolkit

- Un slice por dominio; nada de un slice “global” con todo.
- Todo selector derivado usa `createSelector`; ningún `useAppSelector` devuelve un literal nuevo.
- Con RTK Query, `<name>.api.ts` sustituye a `<name>.services.ts` y su `baseQuery` delega en el
  `apiClient` compartido.
- `RootState` y `AppDispatch` se declaran en `src/store/store.types.ts` y se consumen vía
  `src/store/hooks.ts`. Ningún componente importa `useSelector`/`useDispatch` crudos.

### 8.5 Reglas específicas de Context API

- Estado y acciones en **dos contextos separados** (`<X>StateContext`, `<X>ActionsContext`) para no
  re-renderizar consumidores que solo despachan.
- El provider no contiene lógica: llama al facade o a un hook de estado.
- El hook de consumo lanza error si se usa fuera del provider.
- Archivos: `features/<f>/context/<entity>Context.tsx` + `<entity>Store.types.ts`.

---

## 9. Services, schemas y adapters

### 9.1 Services

- Una `export async function` nombrada **por endpoint**. Prohibido el objeto agregador
  (`export const authServices = {...}`) y prohibido `export default`.
- Último parámetro: `options?: RequestOptions`, y propaga `options?.signal` al `apiClient`.
- Las URLs viven en `.constants.ts`; el servicio no escribe rutas.
- El servicio no navega, no muestra toasts, no lee el store.
- Excepción tasada para RTK Query: `<name>.api.ts` puede importar `createApi`/`fetchBaseQuery` de
  `@reduxjs/toolkit/query/react` y hacer `import type { RootState } from '@/store/store.types'`
  (**solo `import type`**, para no crear un ciclo en runtime).

```ts
// src/shared/api/api.types.ts
export interface RequestOptions {
  signal?: AbortSignal;
}
```

```ts
// src/shared/api/ApiError.ts
export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'contract'
  | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options?.status;
  }
}
```

```ts
// src/features/auth/services/auth.services.ts
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/ApiError';
import type { RequestOptions } from '@/shared/api/api.types';
import { AUTH_ENDPOINTS } from '../constants/auth.constants';
import { userDtoSchema } from '../schemas/auth.schema';
import { toLoginDto, toUser } from '../adapters/auth.adapter';
import type { LoginInput, User } from '../types/auth.types';

export async function login(input: LoginInput, options?: RequestOptions): Promise<User> {
  const raw = await apiClient.post(AUTH_ENDPOINTS.login, toLoginDto(input), {
    signal: options?.signal,
  });
  const parsed = userDtoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError('contract', `Respuesta inválida en POST ${AUTH_ENDPOINTS.login}`, {
      cause: parsed.error,
    });
  }
  return toUser(parsed.data);
}
```

### 9.2 Constantes

```ts
// src/features/auth/constants/auth.constants.ts
export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  session: '/auth/session',
} as const;

export const ROLE = { ADMIN: 'admin', MEMBER: 'member' } as const;

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
} as const;

export const AUTH_MESSAGES = { loginFailed: 'No pudimos iniciar sesión.' } as const;
```

Un literal va a `.constants.ts` si cumple al menos una condición: (a) aparece 2 o más veces en el
repo, (b) se compara con `===` o `switch`, (c) forma parte de una URL, query key o clave de
storage, (d) es un umbral numérico distinto de `0`, `1` o `-1`. Quedan exentos: clases de
CSS/Tailwind, textos visibles de UI (van a i18n), atributos `aria-*` y `0/1/-1`.

### 9.3 Schemas (R)

Los schemas son la **única** capa autorizada a exportar validadores de runtime. El DTO se **deriva**
del schema: prohibido declararlo a mano y prohibido `satisfies z.ZodType<XDto>` (permite schemas
más laxos que el tipo).

```ts
// src/features/auth/schemas/auth.schema.ts  (Zod 4)
import { z } from 'zod';

export const userDtoSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email_address: z.email(),
  avatar_url: z.url().nullable(),
  created_at: z.iso.datetime(),
  role: z.enum(['admin', 'member']),
  profile: z.object({
    company_name: z.string().nullable(),
    job_title: z.string().nullable(),
  }),
});

export const loginDtoSchema = z.object({
  email_address: z.email(),
  password: z.string().min(1),
});

export type UserDto = z.infer<typeof userDtoSchema>;
export type LoginDto = z.infer<typeof loginDtoSchema>;
```

**Toda** respuesta con cuerpo JSON —lectura o mutación— pasa por `safeParse` antes del adapter. Si
falla, el servicio lanza `ApiError` con `kind: 'contract'`. Prohibido `return null`, `return []` o
`catch {}` ante un fallo de schema.

### 9.4 Adapters

- `toX(dto): X` y, cuando el backend espera otra forma, `toXDto(input): XDto`. Ambos puros y
  síncronos.
- Prohibido derivar flags de negocio (`isAdmin`, `canEdit`, `isExpired`): eso es `.helper.ts`.
- Prohibido generar ids: si el DTO no trae uno, deriva una **clave compuesta determinista** a partir
  de campos inmutables. Prohibido `crypto.randomUUID()`, `Math.random()` y contadores.
- El modelo de dominio **nunca contiene `null`**: el adapter convierte `null` en `undefined` o en el
  valor por defecto de `.constants.ts`.
- Si un cálculo necesita el reloj, se recibe por un parámetro explícito `deps` (`{ now: Date }`); el
  adapter nunca lee el reloj por su cuenta.

```ts
// src/features/auth/adapters/auth.adapter.ts — solo forma, cero reglas
import type { LoginDto, LoginInput, User, UserDto } from '../types/auth.types';

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.full_name,
    email: dto.email_address,
    role: dto.role,
    createdAt: new Date(dto.created_at),
    avatarUrl: dto.avatar_url ?? undefined,
    companyName: dto.profile.company_name ?? undefined,
    jobTitle: dto.profile.job_title ?? undefined,
  };
}

export function toLoginDto(input: LoginInput): LoginDto {
  return { email_address: input.email, password: input.password };
}
```

```ts
// src/features/auth/helpers/auth.helper.ts — aquí sí viven las reglas
import { ROLE } from '../constants/auth.constants';
import type { User } from '../types/auth.types';

export const isAdmin = (user: User): boolean => user.role === ROLE.ADMIN;
```

---

## 10. SOLID aplicado a React

| Principio | Traducción operativa |
|---|---|
| **S**RP | Un archivo no mezcla dos de estas categorías: render, estado, I/O, reglas de negocio, mapeo DTO⇄modelo |
| **O**CP | Una variante nueva no añade un `if`/`switch` al componente: se resuelve por props, `.variants.ts` o composición |
| **L**SP | Un wrapper de `shared/ui` acepta y reenvía las props nativas del elemento (`ComponentPropsWithoutRef<'button'>`) y `ref` |
| **I**SP | Ninguna `interface Props` obliga a pasar lo que el caso de uso no consume; el facade no devuelve de más |
| **D**IP | La UI depende del facade, no de `zustand`/`react-redux`; los services dependen del `apiClient`, no de `fetch` |

Su verificación está en [§13.8](#138-solid-verificable).

---

## 11. División de componentes

### 11.1 Umbral duro

Más de **300 líneas** o **más de un propósito visual** ⇒ divide antes de añadir nada.
Más de **8 props no nativas** ⇒ divide o compón con `children`.

### 11.2 Las cuatro pruebas de “un solo propósito”

Si alguna da positivo, el componente tiene más de un propósito y debe dividirse:

1. **Prueba del nombre**: nombrarlo exige una conjunción (`HeaderAndFilters`, `ListWithModal`).
2. **Prueba del bloque**: dos o más bloques del JSX podrían renderizarse en pantallas distintas.
3. **Prueba de la prop huérfana**: existe una prop que solo consume una rama del JSX.
4. **Prueba del estado aislado**: un `useState` solo lo usa una región del árbol.

### 11.3 División canónica

```text
components/OrderDashboard/
├─ OrderDashboard.tsx          # layout: compone, no decide
├─ OrderDashboard.types.ts
├─ OrderFilters/OrderFilters.tsx
├─ OrderTable/OrderTable.tsx
└─ OrderSummary/OrderSummary.tsx
```

---

## 12. Tooling, testing y anti-patrones

### 12.1 TypeScript

```jsonc
// tsconfig.json (extracto obligatorio)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 12.2 ESLint: las fronteras se compilan, no se revisan a ojo

```js
// eslint.config.js (extracto)
export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.services.ts', 'src/**/*.api.ts', 'src/shared/api/apiClient.ts'],
    rules: {
      'no-restricted-globals': ['error',
        { name: 'fetch', message: 'La red vive en .services.ts / .api.ts / apiClient.ts' },
        { name: 'XMLHttpRequest', message: 'Usa .services.ts' },
        { name: 'EventSource', message: 'Usa .services.ts' },
        { name: 'WebSocket', message: 'Usa .services.ts' },
      ],
      'no-restricted-imports': ['error', { paths: [
        { name: 'axios', message: 'Solo apiClient.ts' },
        { name: 'ky', message: 'Solo apiClient.ts' },
        { name: 'ofetch', message: 'Solo apiClient.ts' },
      ]}],
      'no-restricted-syntax': ['error', {
        selector: "MemberExpression[object.name='navigator'][property.name='sendBeacon']",
        message: 'Solo apiClient.ts',
      }],
    },
  },
  {
    files: ['src/features/*/components/**/*.tsx', 'src/shared/ui/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          '**/store/**', '**/*.store', '**/*Store', '**/*.slice', '**/*Slice',
          '**/*.selectors', '**/*.services', '**/*.api', '**/*.adapter', '@/store', '@/store/*',
        ],
        paths: [
          { name: 'react-redux' }, { name: 'zustand' }, { name: '@tanstack/react-query' },
        ],
      }],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['@/features/*', '../features/*'] }] },
  },
];
```

`env.config.ts` es el único lugar que lee variables de entorno, y las lee con su **referencia
literal completa** (`process.env.NEXT_PUBLIC_API_URL`, `import.meta.env.VITE_API_URL`). Prohibido
desestructurar `process.env` / `import.meta.env` y prohibido el acceso por índice: el bundler no
inlinea esas formas y el valor queda `undefined` en cliente sin aviso. Valida con schema, exporta un
objeto congelado y falla en el arranque si el `safeParse` falla.

### 12.3 Verificación estructural multiplataforma

`grep` no existe en PowerShell: las comprobaciones de estructura son un script de Node, no un
comando de shell en un checklist.

```js
// scripts/check-arch.mjs — Node 22, sin dependencias
import { globSync } from 'node:fs';

const fail = (msg, list) => { console.error(`${msg}\n${list.join('\n')}`); process.exitCode = 1; };

const badSuffix = globSync('src/**/*.{type,constant,util,service}.{ts,tsx}');
if (badSuffix.length) fail('Sufijo en singular prohibido (usa la tabla de §4.3):', badSuffix);

const badBarrels = globSync('src/{shared/{utils,hooks,constants,types},features/*/*}/index.ts')
  .filter((p) => !/src[\\/]shared[\\/]ui[\\/]index\.ts$/.test(p));
if (badBarrels.length) fail('Barrel no permitido (§4.5):', badBarrels);
```

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "lint:arch": "node scripts/check-arch.mjs",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ci": "vitest run --coverage"
  }
}
```

Gate único del proyecto, idéntico en pre-commit, en CI y en los procedimientos de §14:

```bash
npm run lint && npm run lint:arch && npm run typecheck && npm run test:ci && npm run build
```

### 12.4 CI

```yaml
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run lint:arch
      - run: npm run typecheck
      - run: npm run test:ci
      - run: npm run build
```

### 12.5 Estrategia de testing por capa

| Capa | Herramienta | Qué se testea | Qué está prohibido |
|---|---|---|---|
| `.utils.ts`, `.helper.ts` | Vitest puro | Entradas → salidas, casos límite, errores | Montar React, mocks de red |
| `.adapter.ts` | Vitest puro | DTO real → modelo, campos `null`/ausentes | Leer el reloj dentro del adapter |
| `.schema.ts` | Vitest puro | DTO válido pasa, DTO corrupto falla | Duplicar el tipo a mano |
| `.constants.ts` | Sin test propio | Cobertura indirecta | Tests de valores literales |
| `.services.ts` / `.api.ts` | Vitest + msw | URL, método, body, parsing, `ApiError` | Mockear `fetch` o el propio service |
| Facade y hooks | Vitest + `renderHook` + msw | Contrato devuelto, transiciones | Montar el componente real |
| Presentacionales | RTL + `user-event` | Render según props, a11y, eventos | Providers de red o de store |
| Containers | RTL + msw + `TestProviders` | Flujo completo con red simulada | `setTimeout` manual, asserts a internals |
| Stores | Vitest puro | Acciones, selectores, `reset()` | Testear a través de un componente |

```ts
// vitest.setup.ts — msw y reset centralizados: ningún test repite este bloque
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './src/test/msw.server';
import { resetAllStores } from './src/test/resetAllStores';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetAllStores();
  vi.clearAllMocks();
});

afterAll(() => server.close());
```

```ts
// src/features/auth/adapters/auth.adapter.test.ts — puro, determinista
import { describe, expect, it } from 'vitest';
import { toUser } from './auth.adapter';
import { userDtoFixture } from '../__fixtures__/auth.fixtures';

describe('toUser', () => {
  it('mapea snake_case a camelCase y no propaga null', () => {
    const user = toUser(userDtoFixture);
    expect(user.name).toBe('Ada Lovelace');
    expect(user.avatarUrl).toBeUndefined();
    expect(user.jobTitle).toBeUndefined();
    expect(user.role).toBe('admin');
    expect(user.createdAt).toBeInstanceOf(Date);
  });
});
```

```ts
// src/features/auth/services/auth.services.test.ts — msw, URL desde constantes
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw.server';
import { env } from '@/shared/config/env.config';
import { ApiError } from '@/shared/api/ApiError';
import { AUTH_ENDPOINTS } from '../constants/auth.constants';
import { userDtoFixture } from '../__fixtures__/auth.fixtures';
import { login } from './auth.services';

const url = `${env.API_URL}${AUTH_ENDPOINTS.login}`;

describe('login', () => {
  it('envía el DTO y devuelve el modelo de dominio', async () => {
    server.use(
      http.post(url, async ({ request }) => {
        const body = (await request.json()) as { email_address: string };
        expect(body.email_address).toBe('ada@example.com');
        return HttpResponse.json(userDtoFixture);
      }),
    );

    const user = await login({ email: 'ada@example.com', password: 'secret' });
    expect(user.name).toBe('Ada Lovelace');
    expect(user).not.toHaveProperty('full_name');
  });

  it('propaga un ApiError unauthorized', async () => {
    server.use(http.post(url, () => new HttpResponse(null, { status: 401 })));
    const call = () => login({ email: 'x@example.com', password: 'x' });

    await expect(call()).rejects.toBeInstanceOf(ApiError);
    await expect(call()).rejects.toMatchObject({ kind: 'unauthorized', status: 401 });
  });
});
```

```tsx
// src/features/auth/hooks/useAuth.test.tsx — el facade se testea contra red simulada, cero vi.mock
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw.server';
import { TestProviders } from '@/test/TestProviders';
import { env } from '@/shared/config/env.config';
import { AUTH_ENDPOINTS } from '../constants/auth.constants';
import { userDtoFixture } from '../__fixtures__/auth.fixtures';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('expone isAuthenticated derivado del estado de sesión', async () => {
    server.use(
      http.post(`${env.API_URL}${AUTH_ENDPOINTS.login}`, () => HttpResponse.json(userDtoFixture)),
      http.get(`${env.API_URL}${AUTH_ENDPOINTS.session}`, () => HttpResponse.json(userDtoFixture)),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: TestProviders });

    expect(result.current.isAuthenticated).toBe(false);
    await act(async () => {
      await result.current.signIn({ email: 'ada@example.com', password: 'secret' });
    });
    await waitFor(() => expect(result.current.user?.name).toBe('Ada Lovelace'));
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

Reglas de testing no negociables:

1. Prohibido mockear el módulo que estás testeando.
2. Prohibido mockear `fetch` a mano: usa msw con `onUnhandledRequest: 'error'` (R).
3. Prohibido `await new Promise(r => setTimeout(r, N))`: usa `waitFor` o `findBy*`.
4. `vi.mock` solo se permite sobre módulos del navegador o del framework (`next/navigation`,
   `IntersectionObserver`). Nunca sobre `.services.ts`, `.api.ts`, `.adapter.ts`, `.helper.ts` ni
   stores.
5. Ningún test fuera de `store/` llama a `setState`, `dispatch` o `getState`: usa
   `reset<Entity>Store()` de `<entity>Store.testing.ts`.
6. Los datos de test se construyen con fixtures tipadas (`export const userDtoFixture: UserDto`),
   nunca con casts.
7. Ningún handler de msw usa `*` en el path: la URL se construye desde `.constants.ts` y
   `env.config.ts`.
8. Un test que requiere mockear 3 o más módulos indica un fallo de arquitectura: refactoriza.

### 12.6 Tabla de anti-patrones

Si el revisor encuentra el patrón de la columna 2, el cambio se rechaza.

| # | Anti-patrón | Corrección obligatoria |
|---|---|---|
| 1 | `fetch`/`axios` dentro de un `.tsx` | Mueve a `.services.ts`; la UI consume vía facade |
| 2 | Lógica de negocio dentro del JSX | Extrae a `.helper.ts`; el JSX recibe el valor calculado |
| 3 | `useEffect` + `setState` para derivar estado | Calcula en render; memoiza solo bajo §12.6 #12 |
| 4 | `any` explícito, `as any`, o `any` que entra por `JSON.parse`, `Response.json()` y librerías sin tipos | Tipa con `.types.ts`; usa `unknown` + schema o type guard |
| 5 | `key={index}` en listas reordenables | Id estable del dominio. Si el DTO no lo trae, deriva en el adapter una clave compuesta **determinista** de campos inmutables (`` `${dto.type}:${dto.code}` ``). Prohibido `crypto.randomUUID()`, `Math.random()` y contadores. Si no existe combinación estable, el backend debe exponer un id: abre la incidencia |
| 6 | Prop drilling de más de 2 niveles | Composición con `children`/slots, o facade |
| 7 | Barrel reexportando una categoría completa | Solo los tres barrels de §4.5 |
| 8 | Componente-dios (>300 líneas **o más de un propósito visual**) | Divide por propósito visual (§11) |
| 9 | Guardar data de servidor en Zustand/Redux | Server state en TanStack Query / RTK Query (R). Del estado de sesión solo se guarda `sessionStatus`/`accessTokenExpiry` (§8.1) |
| 10 | Import cruzado entre features | Sube a `shared/` o compón en `app/` |
| 11 | Magic strings/numbers | `.constants.ts` con `as const` + union derivada (§9.2) |
| 12 | Objetos/funciones nuevas hacia hijos memoizados | `useMemo`/`useCallback` solo si: es dependencia de otro hook, se pasa a un hijo en `React.memo`, o hay perfilado adjunto. Con React Compiler activo, no añadas memoización manual y elimina la existente en los archivos que toques |
| 13 | Un único `AppContext` con todo el estado global | Divide por dominio; separa state/actions (§8.5) |
| 14 | Servicio que muestra toasts, navega o lee del store | El servicio propaga el error; la UI decide el feedback |
| 15 | Adapter con side effects | `(dto) => model`, o `(dto, deps)` con `deps` explícito; puro y síncrono |
| 16 | Hook que hace `fetch` saltándose el servicio | El hook llama a `.services.ts` |
| 17 | Tipos duplicados DTO/modelo | `UserDto` (derivado del schema) vs `User`; puente en `.adapter.ts` |
| 18 | `utils.ts` cajón de sastre | Un archivo por dominio semántico |
| 19 | `export default` en componentes, hooks o services | `export function` nombrado; `default` solo donde el framework lo exige |
| 20 | `catch {}` o `catch { return null }` | Propaga o mapea a `ApiError` |
| 21 | Condicional de permisos repetido | Centraliza en `.helper.ts`: `isAdmin(user)`, `canEditOrder(user, order)` |
| 22 | `process.env.X` / `import.meta.env.X` disperso | Único `shared/config/env.config.ts` validado, con referencias literales completas (§12.2) |
| 23 | Componente que importa `useAuthStore` o `useSelector` | `useAuth()` |
| 24 | Componente o container que importa un hook `*Query`/`*Mutation` | Lo envuelve el facade |

---

## 13. Checklist de auditoría

Recorre el checklist archivo por archivo del diff.
Marca `[x]` cumplido, `[-]` no aplica, `[ ]` incumplido. **Solo `[ ]` bloquea el merge.** Prohibido
marcar `[-]` si el diff toca al menos un archivo de esa categoría: entonces el bloque se audita
entero. Las casillas `(R)` no aplican si el proyecto no usa esa dependencia.

### 13.1 Componentes (`components/**/*.tsx`)

- [ ] No supera las 300 líneas.
- [ ] Tiene un único propósito visual (las cuatro pruebas de §11.2 dan negativo).
- [ ] No contiene `fetch`, `axios`, `localStorage`, `sessionStorage`, `document.cookie` ni literales de URL.
- [ ] **Lista canónica de imports prohibidos**: `.services`, `.api`, `.adapter`, `**/store/**`, `*.store`, `*Store`, `*.slice`, `*Slice`, `*.selectors`, `@/store` y cualquier subruta suya, `react-redux`, `zustand`, `@tanstack/react-query`, y cualquier hook `*Query`/`*Mutation`.
- [ ] No declara funciones `async` ni usa `await`, `.then(`, `.catch(` ni `try {`. Excepciones únicas: RSC marcado con `// RSC:` que solo invoca un `.services.ts`, y `shared/ui/ErrorBoundary.tsx`.
- [ ] No contiene reglas de negocio ni `Intl.NumberFormat`/`toFixed` sobre datos de dominio.
- [ ] Props tipadas con `interface <Component>Props` en `<Component>.types.ts`. Sin `any`.
- [ ] `key` usa un identificador estable del dominio, nunca el índice.
- [ ] No hay `export default` (salvo páginas exigidas por el framework).
- [ ] Ninguna prop atraviesa 3 o más niveles sin uso intermedio.
- [ ] Todo `useEffect` toca exclusivamente APIs del navegador (`focus`, `scroll`, `addEventListener`, `matchMedia`, observers) y devuelve función de limpieza. Si llama a un servicio, al store, a `dispatch`, a un setter del facade o a `navigate`, es un error.

### 13.2 Containers y hooks

- [ ] El container solo contiene: llamada al facade, destructuring y un `return` de JSX. Cero `if/else` fuera del JSX, cero `try/catch`, cero aritmética, cero `.map/.filter/.reduce`, cero literales de negocio.
- [ ] Cada feature con estado expone exactamente un facade `hooks/use<Feature>.ts` con **tipo de retorno explícito**.
- [ ] El facade no expone `dispatch`, `store`, `getState`, `queryClient` ni acciones crudas.
- [ ] Ningún container ni componente importa un hook `*Query`/`*Mutation` directamente.
- [ ] Ningún hook hace `fetch` directo ni construye URLs.
- [ ] Ningún hook retorna JSX.
- [ ] (R) Ningún hook declara más de 3 `useState` ni supera 100 líneas; si lo necesita, usa `useReducer` con acciones tipadas o promueve al store. Prohibido agrupar estados no relacionados en un `useState` de objeto.
- [ ] Ningún `useEffect` llama a `setState` con un valor derivable en render.
- [ ] Ningún `useEffect` con suscripción o timer carece de limpieza.
- [ ] Cero `eslint-disable` sobre `react-hooks/exhaustive-deps`.
- [ ] (R) Todo `queryFn` de lectura reenvía el `signal`: `queryFn: ({ signal }) => getUser(id, { signal })`.
- [ ] (R) Toda mutación invalida sus query keys en el `onSuccess` del hook, no en el componente.

### 13.3 Services, schemas y adapters

- [ ] `npm run lint` pasa: las fronteras de red están en `eslint.config.js` (§12.2), no en un `grep` manual.
- [ ] `.services.ts` exporta funciones nombradas, una por endpoint. Prohibido el objeto contenedor `xServices` y prohibido `export default`.
- [ ] Ningún `.services.ts` / `.api.ts` importa JSX, hooks de React, `react-router`, `next/navigation` ni una librería de toast.
- [ ] Excepción tasada RTK Query: `<name>.api.ts` puede importar `createApi`/`fetchBaseQuery` de `@reduxjs/toolkit/query/react` y `import type { RootState } from '@/store/store.types'` (**solo `import type`**); su `baseQuery` delega en el `apiClient`.
- [ ] Toda función exportada retorna el modelo de dominio, no el DTO, cuando existe adapter.
- [ ] Toda función de lectura acepta `options?: RequestOptions` como último parámetro y propaga `options?.signal` al `apiClient`.
- [ ] (R) **Toda** respuesta con cuerpo JSON —lectura o mutación— pasa por `safeParse` con un schema importado de `schemas/<name>.schema.ts`; ningún schema declarado inline.
- [ ] (R) Todo `safeParse` fallido lanza `ApiError` con `kind: 'contract'`. Cero `return null`, `return []` o `catch {}` ante fallo de schema.
- [ ] (R) El DTO se deriva con `z.infer`; prohibido declararlo a mano y prohibido `satisfies z.ZodType<XDto>`.
- [ ] `ApiError` extiende `Error`, asigna `this.name = 'ApiError'`, expone `kind` (union) y `status`, y propaga `cause`.
- [ ] Un único `apiClient` en todo el repositorio.
- [ ] Ningún `.services.ts` construye el body a mano: el mapeo modelo → DTO vive en `.adapter.ts` (`toXDto`).
- [ ] Las funciones de mapeo se llaman `to<Entity>` y `to<Entity>Dto`. Prohibido el nombre genérico `toDomain`.
- [ ] Ningún adapter contiene `await`, `try`, `fetch`, `Date.now()`, `new Date()` sin argumento, `Math.random()` ni imports de React; las dependencias no deterministas llegan por `deps`.
- [ ] Ningún adapter deriva flags de permisos o de negocio; solo renombra, castea y aplana.
- [ ] El modelo de dominio no contiene `null`: el adapter lo convierte en `undefined` o en un valor por defecto de `.constants.ts`.
- [ ] Ningún adapter es identidad.
- [ ] Todo `*Dto` es importado únicamente por `.services.ts`, `.api.ts`, `.adapter.ts`, `.schema.ts`, sus tests (`*.test.ts`) y los fixtures de `__fixtures__/`.

### 13.4 Lógica pura, constantes y tipos

- [ ] Ningún `.helper.ts` / `.utils.ts` importa `react`.
- [ ] Ningún `.utils.ts` importa de `features/`.
- [ ] Cada función exportada de `.helper.ts`, `.utils.ts` y `.adapter.ts` tiene test en el mismo PR.
- [ ] Cero literales con significado de negocio fuera de `.constants.ts`, según el test de §9.2.
- [ ] (R) Cero query keys inline.
- [ ] Todo objeto de `.constants.ts` usa `as const`.
- [ ] Cero `any`, `as any`, `as never`, `as unknown as X`, `enum`, `const enum`, `@ts-ignore`. `@ts-expect-error` solo con `-- <motivo>` en la misma línea, máximo uno por PR y contabilizado como `ARCH-EXCEPTION` (§14.5).
- [ ] `tsconfig.json` tiene `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` y `erasableSyntaxOnly` en `true`.
- [ ] `interface` para formas de objeto; `type` para uniones, intersecciones y funciones.
- [ ] Estados mutuamente excluyentes modelados con union discriminada.
- [ ] Ningún `.types.ts` exporta valores de runtime (los schemas viven en `.schema.ts`).

### 13.5 Estado

- [ ] Ningún archivo de `components/` ni `containers/` incumple la lista canónica de imports de §13.1.
- [ ] `src/store/` no contiene estado de dominio de ninguna feature, y no importa de `features/` salvo el ensamblado del `rootReducer`.
- [ ] Ningún dato de servidor está copiado en un store de cliente; del estado de sesión solo viven `sessionStatus` y `accessTokenExpiry` (§8.1).
- [ ] Ningún campo del state es derivable de otro campo.
- [ ] Ningún reducer, acción o `set` navega, muestra toasts ni toca el DOM.
- [ ] Todo store expone `reset()` y un `<entity>Store.testing.ts` con `reset<Entity>Store()`.
- [ ] Zustand: el store se crea con `create<T>()(devtools(..., { name, enabled: import.meta.env.DEV }))` y **todo** `set` pasa el tercer argumento con el nombre de acción namespaced.
- [ ] Zustand: las suscripciones multi-campo usan `import { useShallow } from 'zustand/react/shallow'`. Prohibido `shallow` como segundo argumento y prohibido el store sin selector.
- [ ] Zustand: `persist` declara `partialize` y no persiste tokens.
- [ ] Redux: todo selector derivado usa `createSelector`; ningún `useAppSelector` devuelve un literal nuevo; los componentes no usan `useSelector`/`useDispatch` crudos.
- [ ] Context: estado y acciones en contextos separados, provider sin lógica, hook que lanza error fuera del provider.
- [ ] Los tipos de estado de una feature están en `store/<entity>Store.types.ts`, nunca en `types/`.

### 13.6 Fronteras y estructura

- [ ] Ningún archivo bajo `src/shared/**` importa de `features/`.
- [ ] Ninguna feature importa de otra feature.
- [ ] Todo módulo de `shared/` tiene 2 o más features importándolo, salvo la infraestructura declarada (`shared/api/apiClient.ts`, `shared/api/ApiError.ts`, `shared/config/env.config.ts`, `src/test/*`, primitivas de `shared/ui`), que es singleton por diseño.
- [ ] Ningún archivo de `shared/` menciona una entidad de dominio en su nombre o sus tipos.
- [ ] `npm run lint:arch` pasa (sufijos y barrels, §12.3).
- [ ] Ningún archivo en `shared/utils` se llama `helpers`, `common`, `misc` o `general`.
- [ ] Todo componente de `shared/ui` recibe datos por props, expone `ref`, tiene `focus-visible` y define variantes en `<Component>.variants.ts`.
- [ ] Los imports dentro de una feature usan como máximo un nivel relativo (`./x`, `../categoria/x`); todo import que cruce feature, `shared/`, `app/` o `store/` usa `@/`. Cero `../../`.
- [ ] Todo nombre de archivo aparece en una de las dos tablas de §4.3, con `.types.ts` en plural.

### 13.7 Testing

- [ ] Ningún test mockea el módulo bajo prueba ni un `.services.ts`, `.api.ts`, `.adapter.ts`, `.helper.ts` o store.
- [ ] (R) Los tests de red usan msw con `onUnhandledRequest: 'error'`; ningún handler usa `*` en el path.
- [ ] Cero esperas por `setTimeout`; se usa `waitFor` o `findBy*`.
- [ ] Ningún test fuera de `store/` llama a `setState`, `dispatch` o `getState`.
- [ ] Los datos de test salen de fixtures tipadas; cero casts para satisfacer un mock.
- [ ] Ningún test de presentacional monta providers de red o de store.

### 13.8 SOLID (verificable)

- [ ] **SRP**: ningún archivo mezcla dos de estas categorías: render, estado, I/O, reglas de negocio, mapeo DTO⇄modelo.
- [ ] **SRP**: cada `.services.ts` expone una función por endpoint; cada `.helper.ts` cubre un solo dominio semántico.
- [ ] **OCP**: añadir una variante visual no introduce un `if`/`switch` nuevo en el componente; se resuelve por props, `<Component>.variants.ts` o composición.
- [ ] **LSP**: todo componente de `shared/ui` que envuelve un elemento nativo acepta y reenvía sus props nativas (`ComponentPropsWithoutRef<'button'>`) y `ref`.
- [ ] **ISP**: ninguna `interface <Component>Props` obliga a pasar props que el caso de uso no consume; ningún facade devuelve más de lo que su feature usa.
- [ ] **DIP**: los componentes dependen del facade; los servicios dependen del `apiClient`, nunca de `fetch` directo.

### 13.9 Transversal

- [ ] `npm run lint && npm run lint:arch && npm run typecheck && npm run test:ci && npm run build` termina en 0 errores y 0 warnings.
- [ ] Sin `console.log` fuera de código de desarrollo explícito.
- [ ] Sin código muerto ni imports sin usar.
- [ ] Cada `eslint-disable` lleva la cláusula `-- <motivo>`.
- [ ] Las excepciones se rigen por §14.5: máximo una por PR, reportada en la descripción.

---

## 14. Procedimiento para el agente

Sigue los pasos en orden. No omitas pasos ni cambies el orden.

### 14.1 Crear una feature nueva

1. Crea `src/features/<feature-name>/` en `kebab-case`, singular del dominio.
2. Crea solo los archivos que la feature necesita, en este orden:
   1. `types/<name>.types.ts` — modelo de dominio (`X`), inputs y contrato del facade (`XFacade`).
   2. `schemas/<name>.schema.ts` (R) — schema del DTO con los nombres **exactos** del backend;
      `export type XDto = z.infer<typeof xDtoSchema>`. Re-exporta el tipo desde `types/`.
   3. `constants/<name>.constants.ts` — endpoints, query keys, unions `as const`, mensajes.
   4. `adapters/<name>.adapter.ts` — `toX(dto)` y `toXDto(input)` si el backend espera otra forma.
   5. `services/<name>.services.ts` — una función por endpoint (o `<name>.api.ts` con RTK Query).
   6. `helpers/<name>.helper.ts` — reglas de negocio puras.
   7. **Escribe y ejecuta aquí los tests de `adapter`, `schema` y `helper`.** No continúes sin ellos.
   8. `store/<entity>Store.ts` + `store/<entity>Store.types.ts` + `store/<entity>Store.testing.ts` —
      solo si hay client state compartido. `<entity>` en `camelCase`
      (feature `user-profile` → `userProfileStore.ts`).
   9. `hooks/use<Entity>Query.ts` / `use<Action>Mutation.ts` (R) — hooks de datos; solo los consume
      el facade.
   10. `hooks/use<Feature>.ts` — **el facade**, con tipo de retorno explícito `XFacade`.
   11. `components/` — presentacionales, tipados en `<Component>.types.ts`.
   12. `containers/<X>Container.tsx` — conecta facade → props.
   13. `__fixtures__/<name>.fixtures.ts` y tests restantes.
   14. `index.ts` — barrel público mínimo, con exports enumerados.
3. Verifica que ningún archivo nuevo importe de otra feature y que `shared/` no importe de la feature.
4. Ejecuta el gate de §12.3.
5. Recorre el [checklist](#13-checklist-de-auditoría) sobre los archivos creados y reporta el resultado.

### 14.2 Añadir un endpoint

1. (R) Define el schema del DTO en `<name>.schema.ts` con los nombres de campo **exactos** del
   backend. Prohibido renombrar aquí. Sin zod, declara el DTO en `<name>.types.ts` con esos mismos
   nombres.
2. Añade la ruta en `<name>.constants.ts`. Prohibido escribir la URL en el servicio.
3. (R) Deriva el tipo con `export type XDto = z.infer<typeof xDtoSchema>`. Prohibido declararlo a
   mano y prohibido `satisfies z.ZodType<XDto>`.
4. Si el modelo difiere del DTO, extiende el adapter (`toX`, y `toXDto` si el backend espera otra
   forma) y sus tests.
5. Añade la función en `<name>.services.ts`: una por endpoint, con `options?: RequestOptions` y tipo
   de retorno explícito del modelo. Valida con `safeParse` y lanza `ApiError('contract', …)` si
   falla. Prohibido agrupar las funciones en un objeto.
6. (R) Añade o extiende la query key en `<name>.constants.ts` (factories jerárquicas).
7. (R) Expón el consumo desde un hook de datos (`use<Entity>Query` / `use<Action>Mutation`); el
   facade lo envuelve. Nunca desde el componente.
8. (R) Para mutaciones: define la invalidación en el `onSuccess` del hook.
9. Añade el handler de msw (URL desde constantes, sin `*`) y el test del servicio.
10. Ejecuta el gate de §12.3.

### 14.3 Modificar un componente existente

1. Cuenta las líneas. Si al terminar el cambio supera 300, divide **antes** de añadir nada.
2. Separa qué parte del cambio es lógica y qué parte es presentación antes de editar.
3. Mueve toda lógica nueva a facade/helper/service. Prohibido añadir lógica al `.tsx` "temporalmente".
4. Si pasa a recibir más de 8 props no nativas, divide o compón con `children`.
5. Si aparece un tercer nivel de prop drilling, detente y propón composición o facade.
6. Actualiza los tipos en `<Component>.types.ts`; nunca amplíes con `any` ni con tipo inline.
7. Actualiza o añade test del componente (RTL, sin mocks de red) y del facade si cambió su contrato.
8. Ejecuta el gate de §12.3 y recorre el checklist sobre el diff.

### 14.4 Migrar de un manejador de estado a otro

1. **Prohibido** modificar cualquier archivo bajo `components/` o `containers/`. Si el cambio los
   exige, el facade estaba mal construido: detén la migración, corrígelo en un commit aparte y
   reinicia este procedimiento.
2. Reescribe `store/` (o `context/`) con la nueva librería, respetando §8.2–§8.5.
3. Reescribe `hooks/use<Feature>.ts` para seguir devolviendo exactamente `<Feature>Facade`.
4. La migración es correcta solo si se cumplen las cuatro condiciones:
   a. `git diff --exit-code` sobre `types/<name>.types.ts` está limpio: el contrato del facade no cambió.
   b. `git diff --exit-code` sobre `components/` y `containers/` está limpio.
   c. Los tests del facade (`hooks/use<Feature>.test.tsx`) pasan **sin haber sido modificados**.
   d. Los tests del store se reescriben para la nueva librería, cubren las mismas transiciones y
      pasan, y el gate de §12.3 está en verde.

### 14.5 Cuando la regla no se puede cumplir

1. No la incumplas en silencio.
2. Documenta la excepción con `// ARCH-EXCEPTION: <motivo>` en la línea afectada.
3. Repórtala en el mensaje final de la tarea.
4. Máximo una por PR; dos o más significan que la regla o el diseño deben revisarse.

---

## 15. Instalación de este documento

```bash
mkdir -p .claude/rules
# guarda este documento como:
# .claude/rules/react-architecture.md
```

Y en la raíz del proyecto, `CLAUDE.md`:

```markdown
# Reglas del proyecto

@.claude/rules/react-architecture.md

## Comandos
- `npm run dev`        — servidor de desarrollo
- `npm run lint`       — ESLint (`eslint . --max-warnings=0`)
- `npm run lint:arch`  — sufijos de archivo y barrels permitidos (§4.5, §12.3)
- `npm run typecheck`  — tsc --noEmit
- `npm run test`       — Vitest
- `npm run test:ci`    — Vitest con cobertura
- `npm run build`      — build de producción
```

Verificación de la instalación:

1. `CLAUDE.md` existe en la raíz y contiene la línea `@.claude/rules/react-architecture.md`.
2. `.claude/rules/react-architecture.md` existe y no está en `.gitignore`.
3. `package.json` define `"lint": "eslint . --max-warnings=0"`; sin esa bandera la casilla de §13.9
   no se puede cumplir.
4. `eslint.config.js`, `tsconfig.json`, `scripts/check-arch.mjs`, `vitest.setup.ts` y el workflow de
   CI reflejan la sección 12.
5. `npm run lint && npm run lint:arch && npm run typecheck && npm run test:ci && npm run build`
   termina en 0 errores en un repo limpio.
6. El sufijo singular está erradicado; la comprobación es sobre **nombres de archivo**, no sobre
   contenido (los imports de TypeScript se escriben sin extensión):

   ```bash
   # debe imprimir 0
   git ls-files 'src/**' | grep -Ec '\.(type|constant|util|service)\.tsx?$'
   ```

   En Windows, la misma comprobación la ejecuta `npm run lint:arch`.
