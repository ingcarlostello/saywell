# Prompt para construir una app web de pronunciación inglés → español

## Objetivo
Construir una aplicación web que funcione como **entrenador personal de pronunciación** para hispanohablantes (y usuarios en inglés) que están aprendiendo inglés americano. El usuario escribe una palabra o frase corta en inglés y la app devuelve, generada por un LLM, una explicación clara y breve de cómo pronunciarla usando **fonética casera** (letras normales del español, sin símbolos IPA).

La app debe estar lista para **producción real**: deploy en Vercel, instalable como PWA, responsive, con modo claro/oscuro, e interfaz bilingüe (ES/EN).

---

## Stack técnico

- **Frontend**: React 18+ con **Vite**
- **Estilos**: **Tailwind CSS** + **shadcn/ui** (componentes accesibles y personalizables)
- **Backend**: **Vercel Serverless Functions** (`/api`) — necesario para ocultar la API key de DeepSeek
- **LLM**: **DeepSeek** (`https://api.deepseek.com/v1/chat/completions`), modelo `deepseek-chat`
- **Sin base de datos**
- **Historial** y preferencias en `localStorage`
- **i18n**: librería ligera como `react-i18next` o un contexto propio (ES/EN)
- **Tema**: `next-themes` o contexto propio para light/dark
- **PWA**: `vite-plugin-pwa` con Workbox (genera manifest + service worker automáticamente)
- **Deploy**: **Vercel** (dominio gratuito `*.vercel.app`)

---

## Deploy y producción

- Repo conectado a Vercel (GitHub)
- Variables de entorno en Vercel: `DEEPSEEK_API_KEY` (nunca en el cliente)
- Build command: `npm run build` (default de Vite)
- Output dir: `dist` (default)
- Dominio por defecto: `https://<nombre-app>.vercel.app` (se puede custom después)
- HTTPS automático (lo da Vercel)

---

## Interfaz de usuario

### Estructura visual
- Layout limpio, moderno, mobile-first
- **Header** con: nombre de la app, switcher de idioma (ES/EN), toggle de tema (sol/luna)
- **Input grande centrado** debajo del header — placeholder cambia según idioma
  - **Límite de 50 caracteres** (atributo `maxLength={50}` en el input)
  - Contador visible "X / 50" debajo del input, se pone naranja a los 40, rojo a los 50
  - Si el usuario pega algo más largo, truncar automáticamente
- **Botón "Pronunciar" / "Pronounce"** debajo del input
  - **Deshabilitado** cuando el input está vacío, llega al límite con espacios, o el rate limit está agotado
- **Área de resultado** debajo, con animación de entrada cuando llega la respuesta
- **Indicador de rate limit** visible (ej: "Te quedan 23 de 30 consultas esta hora" o "Espera 47 min para volver a consultar")
- **Sección de historial** debajo del resultado (en móvil) o en panel lateral (desktop)
- Spinner durante la carga
- Empty state amigable si no hay historial

### Modo claro / oscuro
- Default: oscuro (queda más "app nativa" y ahorra batería en OLED)
- Persistir preferencia en `localStorage`
- Usar el sistema de variables CSS de shadcn (`:root` y `.dark`)
- Toggle visible siempre en el header (icono sol/luna de lucide-react)

### Responsive
- Mobile-first: diseñar pensando en pantalla de 375px
- Breakpoints Tailwind: `sm` 640, `md` 768, `lg` 1024
- En móvil: input + resultado + historial en columna
- En desktop (md+): historial en sidebar derecho, input y resultado centrados
- Touch targets mínimo 44x44px (importante para PWA en móvil)

### i18n (ES/EN)
- Toda la UI traducida: botones, labels, placeholders, mensajes de error
- Idioma por defecto: español (asumiendo usuario hispanohablante)
- Persistir idioma en `localStorage`
- Switcher en el header (dropdown o toggle)
- **Importante**: el idioma de la UI determina el idioma en que el LLM responde las explicaciones. Ver sección de system prompt.

---

## PWA (Progressive Web App)

La app debe sentirse como app nativa en Android e iOS.

### Configuración con `vite-plugin-pwa`
- Auto-registrar service worker
- Manifest con:
  - `name`: "Pronunciador EN→ES"
  - `short_name`: "Pronunciador"
  - `description`: corta
  - `theme_color`: el color primario de shadcn
  - `background_color`: el del tema oscuro
  - `display`: `standalone` (clave para que se sienta nativa)
  - `orientation`: `portrait` (o `any` si se quiere flexible)
  - `start_url`: `/`
  - Iconos: 192x192, 512x512, maskable 512x512 (todos en `/public`)

### iOS específico (no se puede obviar)
Apple no sigue el estándar PWA al 100%. Agregar en `index.html`:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Pronunciador" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```
- El icono apple-touch debe ser **opaco** (sin transparencia), si no iOS le pone fondo negro feo
- Probar el "Add to Home Screen" desde Safari en iPhone real antes de dar por terminada la PWA

### Android
- Manifest estándar funciona
- Chrome mostrará banner automático para instalar después de 2-3 visitas
- Probar desde Chrome en Android real

### Verificación PWA
- Lighthouse en Chrome DevTools: debe dar 100 en "Installable" y "PWA"
- Sin errores en consola
- Service worker registrado correctamente

---

## Funcionalidad

### Flujo principal
1. Usuario escribe palabra (ej: `delivered`)
2. Click en "Pronunciar" o Enter
3. Frontend hace `POST /api/pronunciate` con `{ word: "delivered", lang: "es" }`
4. La serverless function llama a DeepSeek con el system prompt + la palabra
5. Devuelve la respuesta al frontend
6. Frontend muestra el resultado con formato
7. Guarda la consulta en el historial de `localStorage`
8. El historial es clickeable: al hacer click, rellena el input

---

## Backend: Vercel Serverless Function

### `/api/pronunciate.js`

```js
export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word, lang } = req.body;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word is required' });
  }

  // System prompt dinámico según idioma de la UI
  const systemPrompt = lang === 'en'
    ? SYSTEM_PROMPT_EN
    : SYSTEM_PROMPT_ES;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: word }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    const data = await response.json();
    return res.status(200).json({ 
      result: data.choices[0].message.content 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get pronunciation' });
  }
}
```

### Variable de entorno
- En Vercel dashboard: Settings → Environment Variables
- `DEEPSEEK_API_KEY` = `sk-...` (la key real)
- Marcar para Production, Preview y Development

### Rate limiting

**Regla**: máximo **30 peticiones por hora por usuario**. Después de agotar las 30, el usuario debe **esperar 1 hora completa** (desde la primera petición de la ventana) para poder enviar otras 30.

#### Implementación sugerida: doble capa (cliente + servidor)

**Capa cliente (localStorage)** — para dar feedback inmediato al usuario sin gastar requests:
```json
{
  "rate_limit": {
    "count": 23,
    "window_start": 1727000000000
  }
}
```
- Al hacer cada request:
  - Si `Date.now() - window_start > 3600000` (1h): resetear `count = 0`, `window_start = Date.now()`
  - Si no: incrementar `count`
- Si `count >= 30`: bloquear el envío en frontend, mostrar tiempo restante hasta que se libere la ventana
- Ventaja: el usuario ve "Te quedan X consultas" sin hacer una llamada al servidor

**Capa servidor (Vercel Serverless Function)** — protección real anti-abuso:
- Usar un KV store externo porque las serverless functions de Vercel no tienen estado entre invocaciones. Opciones gratuitas:
  - **Vercel KV** (free tier: 30k requests/mes)
  - **Upstash Redis** (free tier: 10k requests/día)
  - **Cloudflare KV** (free tier generoso)
- Identificar al usuario por IP (`req.headers['x-forwarded-for']`) o, idealmente, generar un UUID en el cliente la primera vez y guardarlo en localStorage, enviarlo como header
- Si el servidor detecta >30 requests en la ventana de 1h, responder con HTTP 429 y mensaje: `"Has alcanzado el límite de 30 consultas por hora. Intenta de nuevo en X minutos."`

**Nota importante**: la capa cliente es solo para UX — un usuario técnico podría bypassearla. La capa servidor es la verdadera protección. Para una app personal basta con la cliente, pero si esperas tráfico de terceros, implementa las dos.

---

## Prompt del sistema (el corazón de la app)

Hay dos versiones según el idioma de la UI. La diferencia es solo el idioma de las explicaciones.

### Versión en español (default)

```
Eres un entrenador personal de pronunciación de inglés americano para hispanohablantes. Tu única tarea es explicar cómo se pronuncia una palabra o frase corta en inglés.

REGLAS ESTRICTAS DE FORMATO:

1. NO uses símbolos del Alfabeto Fonético Internacional (IPA). Nada de /.../, nada de [..]. Solo letras normales del alfabeto en español.

2. Para escribir la pronunciación usa MAYÚSCULAS en la sílaba tónica (donde va la fuerza). Ejemplo: "delivered" → "de-LI-verd".

3. Para indicar sonidos largos, repite la letra. Ejemplo: "improved" → "im-PRUUV".

4. Para sonidos cortos, usa la letra normal sin repetir.

5. Después de la pronunciación, da una explicación breve (máximo 3 líneas) de cómo suena cada parte usando referencias cotidianas en español. Ejemplo: "LI suena como la i de libro pero cortita, verd suena como ver relajado".

6. Al final, da UN ejemplo corto en inglés usando la palabra en una oración natural. Resáltalo entre comillas. Ejemplo: "The package was delivered this morning."

7. Todo en español, excepto la palabra en inglés y el ejemplo de oración.

8. Solo inglés americano. Si la palabra tiene variante británica, IGNÓRALA. No la menciones.

9. Respuestas CORTAS. Nada de introducciones largas, nada de "¡Claro!". Ve directo a la pronunciación.

10. **FUERA DE ALCANCE**: Si el usuario pide algo que NO sea pronunciar una palabra o frase en inglés (por ejemplo: "cómo hago una pared", "cómo pinto una casa", "qué tiempo hace hoy", "escribe un poema", "traduce esto al francés"), debes responder EXACTAMENTE con este mensaje corto y amable, sin dar la pronunciación ni añadir nada más:

"No estoy programado para eso — solo te ayudo con la pronunciación de palabras en inglés. Escribe una palabra o frase corta en inglés y te explico cómo suena."

Si el usuario pide la pronunciación de algo que no es palabra en inglés (por ejemplo una cadena de caracteres sin sentido, emojis, o algo que claramente no es pronunciable), aplica la misma regla de "fuera de alcance".

FORMATO DE RESPUESTA EXACTO:

[pronunciación fonética]

[explicación de cada parte en 1-3 líneas]

[oración de ejemplo entre comillas]

EJEMPLO COMPLETO para "delivered":

**delivered** → **de-LI-verd**

Cómo suena cada parte:
- **de** — la "e" suena cortita y relajada
- **LI** — la "i" suena corta como en libro
- **verd** — la e se vuelve floja, la r se pronuncia suave, la d apenas se toca

"The package was delivered this morning."

Ahora espera la palabra del usuario.
```

### Versión en inglés

```
You are a personal American English pronunciation coach for English-speaking users. Your only task is to explain how to pronounce a short word or phrase in English.

STRICT FORMAT RULES:

1. DO NOT use International Phonetic Alphabet (IPA) symbols. No /.../, no [...]. Only normal English alphabet letters.

2. To write the pronunciation, use UPPERCASE on the stressed syllable (where the emphasis goes). Example: "delivered" → "de-LI-verd".

3. To indicate long sounds, repeat the letter. Example: "improved" → "im-PRUUV".

4. For short sounds, use the letter normally without repeating.

5. After the pronunciation, give a brief explanation (max 3 lines) of how each part sounds using everyday English references. Example: "LI sounds like the i in 'it' but shorter, verd sounds like 'verd' relaxed".

6. At the end, give ONE short example sentence in English using the word in a natural sentence. Highlight it in quotes. Example: "The package was delivered this morning."

7. Everything in English.

8. American English only. If the word has a British variant, IGNORE it. Don't mention it.

9. SHORT responses. No long introductions, no "Sure!". Go straight to the pronunciation.

10. **OUT OF SCOPE**: If the user asks for something that is NOT pronouncing an English word or phrase (for example: "how do I build a wall", "how to paint a house", "what's the weather today", "write me a poem", "translate this to French"), you must respond EXACTLY with this short, friendly message — no pronunciation, nothing else:

"I'm not programmed for that — I only help with English pronunciation. Type a short English word or phrase and I'll explain how it sounds."

If the user asks for the pronunciation of something that is not an English word (e.g. random characters, emojis, or clearly unpronounceable input), apply the same out-of-scope rule.

EXACT RESPONSE FORMAT:

[phonetic pronunciation]

[explanation of each part in 1-3 lines]

[example sentence in quotes]

COMPLETE EXAMPLE for "delivered":

**delivered** → **de-LI-verd**

How each part sounds:
- **de** — the "e" sounds short and relaxed
- **LI** — the "i" sounds short, like in "it"
- **verd** — the e becomes weak, the r is soft, the d barely touches

"The package was delivered this morning."

Now wait for the user's word.
```

---

## Llamada desde el frontend

```js
async function getPronunciation(word, lang) {
  const response = await fetch('/api/pronunciate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, lang })
  });
  
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  return data.result;
}
```

---

## LocalStorage schema

```json
{
  "history": [
    { "word": "delivered", "timestamp": 1727000000000 },
    { "word": "schedule", "timestamp": 1727000001000 }
  ],
  "theme": "dark",
  "lang": "es",
  "rate_limit": {
    "count": 23,
    "window_start": 1727000000000
  },
  "user_id": "uuid-v4-generado-una-vez"
}
```

- **NO** guardar la API key aquí (ahora vive solo en Vercel como variable de entorno)
- Máximo 20 entradas en el historial
- Persistir tema, lang y rate_limit para que la app recuerde preferencias
- `user_id` se genera con `crypto.randomUUID()` la primera vez y se envía al backend para rate limiting server-side

---

## Estructura de archivos

```
/
├── api/
│   └── pronunciate.js          # serverless function
├── public/
│   ├── icon-192.png            # PWA icon
│   ├── icon-512.png            # PWA icon
│   ├── icon-maskable-512.png   # PWA maskable icon
│   ├── apple-touch-icon.png    # iOS specific
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                 # componentes shadcn (button, input, card, etc.)
│   │   ├── Header.jsx
│   │   ├── PronunciationForm.jsx
│   │   ├── ResultCard.jsx
│   │   ├── HistoryList.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── LanguageSwitcher.jsx
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── lib/
│   │   ├── systemPrompt.js     # los dos system prompts exportados
│   │   ├── api.js              # función getPronunciation
│   │   └── utils.js            # cn() de shadcn
│   ├── i18n/
│   │   ├── es.json             # traducciones al español
│   │   └── en.json             # traducciones al inglés
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               # tailwind + variables de tema shadcn
├── index.html                  # con meta tags PWA y apple
├── vite.config.js              # con vite-plugin-pwa
├── tailwind.config.js
├── postcss.config.js
├── components.json             # config de shadcn
├── package.json
├── vercel.json                 # config de Vercel (si hace falta)
└── README.md
```

---

## Pasos de implementación (orden sugerido)

1. **Setup base**: `npm create vite@latest`, instalar Tailwind, configurar shadcn (`npx shadcn@latest init`)
2. **UI base**: armar Header, Form vacío, ResultCard vacío, HistoryList vacío con datos mock
3. **Tema claro/oscuro**: implementar con `next-themes` o contexto propio
4. **i18n**: configurar `react-i18next`, traducir todos los textos visibles
5. **Serverless function**: crear `/api/pronunciate.js`, probar localmente con `vercel dev`
6. **Integración frontend-backend**: conectar el form con la API
7. **LocalStorage**: implementar historial, tema, lang persistentes
8. **PWA**: instalar `vite-plugin-pwa`, configurar manifest, generar iconos, agregar meta tags de Apple
9. **Responsive**: ajustar para móvil, probar en DevTools
10. **Tests manuales**: probar palabras varias, dark/light, ES/EN, instalar en iPhone y Android
11. **Deploy**: pushear a GitHub, conectar repo a Vercel, agregar env var, deploy
12. **Verificación PWA en producción**: Lighthouse + instalar desde navegador real en iOS y Android

---

## Mejoras futuras (fuera de scope, pero tener en mente)

### Fase 2 — Audio de pronunciación
Botón al lado de cada resultado para escuchar la pronunciación. Opciones gratuitas/gratuitas-con-tier evaluadas:

| Opción | Costo | Calidad | Latencia | Notas |
|---|---|---|---|---|
| **Web Speech API** (`SpeechSynthesisUtterance`, `lang='en-US'`) | Gratis total | Media (variable por navegador) | Instantánea (cliente) | Ya viene en el navegador. Chrome y Safari tienen voces decentes. Edge usa voces de Azure (mejores). Limitación: no controlas la voz exacta. |
| **ResponsiveVoice** | Gratis (con attribution) | Media | Rápida | Librería JS, fácil de integrar. Voz algo robótica. |
| **Cloudflare Workers AI** (modelo TTS) | Free tier generoso | Alta | Media | Si migramos el backend a Cloudflare, podría ser buena opción. |
| **ElevenLabs** | Free tier (10k caracteres/mes) | Muy alta | Baja | Voz super natural, pero el free tier se queda corto rápido con muchos usuarios. |
| **Google Cloud TTS** | Free tier (1M chars/mes en Standard, 4M en WaveNet) | Alta | Baja | Barato y escalable, pero requiere API key y un proxy server-side (no se puede llamar directo desde el cliente). |
| **Azure Speech** | Free tier (500k chars/mes) | Muy alta | Baja | Similar a Google, mismas limitaciones. |

**Recomendación para Fase 2**: empezar con **Web Speech API** porque:
- Cero costo
- Cero configuración
- Funciona offline en algunos navegadores
- Suficiente para validar la feature

Si la calidad no convence, migrar a **Cloudflare Workers AI** o **Google TTS** con un endpoint server-side que cachee los resultados.

### Otras mejoras
- Soporte para frases completas
- Categorías o favoritos
- Exportar historial
- Compartir pronunciación como link
- Modo "práctica" donde la app dicta y el usuario repite (combina audio + speech-to-text)

---

## Resumen para quien construya
App fullstack simple: input del usuario → serverless function en Vercel → DeepSeek → respuesta. UI en React + Tailwind + shadcn, con tema dark/light, i18n ES/EN, y todo empaquetado como PWA instalable. El truco está en el **prompt del sistema** (que es bilíngüe), que garantiza el formato consistente. La interfaz es la envoltura pulida.