# DESIGN.md

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

Unsplash verificadas con curl antes de usarse (IDs en `src/data/images.ts`).
Filtros CSS (contrast, saturate, wash verde) para coherencia de marca.
Alt text con voz: "Cafetal en Marcala bajo niebla matinal", no "cafe".
