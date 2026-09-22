# DESIGN.md

## Identidad vigente — entrega 1A

Directo Café identifica la plataforma; La Reserva identifica la tostaduría inicial.
Se conserva el sistema visual y la fotografía existente. El encabezado utiliza un
wordmark tipográfico transitorio y el favicon una inicial D; no se reutiliza el
isotipo de La Reserva como supuesto logo oficial de Directo Café.
La relación entre las marcas debe quedar visible en navegación, historia y footer.

## Estrategia de color

**Committed** en storefront (el verde carga hero, footer y superficies de identidad),
**Restrained** en admin. Referencia nombrada: "Aesop verde-botanico sobre blanco puro,
con dorado miel como acento" — NO marron/crema (cliche IA de cafe, primer reflejo),
NO espresso-negro-lujo (segundo reflejo).

## Tokens (OKLCH)

| Rol | Valor | Uso |
|---|---|---|
| `--background` | `oklch(1 0 0)` | blanco puro, sin calidez oculta |
| `--ink` | `oklch(0.20 0.015 130)` | texto cuerpo, >=7:1 |
| `--primary` | `oklch(0.43 0.10 132)` | verde cafetal profundo |
| `--forest` | `oklch(0.26 0.055 135)` | superficies drenched (hero, footer, sidebar admin) |
| `--accent` | `oklch(0.76 0.13 80)` | dorado miel — badges, precios, hover |
| `--muted-foreground` | `oklch(0.46 0.02 130)` | texto secundario, >=3.5:1 |

Texto sobre verde saturado: siempre blanco (Helmholtz-Kohlrausch).

## Tipografia

- Display: **Cabinet Grotesk** (Fontshare) — pesos 500/700/800.
- Cuerpo/UI: **General Sans** (Fontshare) — 400/500/600.
- Storefront: escala fluida clamp(), h1 max 5.5rem, 2-3 lineas maximo,
  contenedor ancho (max-w-6xl). Admin: escala rem fija, ratio 1.2.

## Motion

- Storefront: entrada de hero orquestada (CSS), hover scale-105 700ms ease-out
  en imagenes dentro de overflow-hidden, reveals con IntersectionObserver que
  SOLO mejoran contenido ya visible. `prefers-reduced-motion` obligatorio.
- Admin: 150-250ms, solo estado, cero coreografia.

## Bans activos (de los skills)

Side-stripes, gradient text, glassmorphism decorativo, hero-metric template,
grids de cards identicas, eyebrows uppercase en cada seccion, marcadores 01/02/03,
meta-labels ("SECCION 01"), mono como disfraz tecnico, emojis en codigo.

## Imagenes

Fotografías locales de La Reserva en `frontend/public/marca/`, referenciadas desde
`frontend/src/data/images.ts`. Conservar su atribución a la tostaduría.
Los textos alternativos deben describir la imagen real; las claves históricas
como `heroFog` ya no implican que la foto sea un bosque o una finca.
