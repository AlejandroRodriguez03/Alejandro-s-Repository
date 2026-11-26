# Rawayana: Duelo de Baile

Juego de fans (no oficial) de duelos de baile en estilo 16 bits, con las mecánicas de los juegos de pelea clásicos de arcade, pero aquí no se pelea: **se baila**. Cada paso que conecta le roba *flow* al rival y quien se quede sin flow pierde la ronda.

Se juega dentro de una consola portátil con pantalla ancha, con teclado, mando (gamepad) o con los botones táctiles de la consola en el teléfono.

## Cómo jugar

Abre `index.html` en el navegador (doble clic). No necesita instalar nada ni conexión a internet.

### Controles

| Botón | Acción | Jugador 1 | Jugador 2 |
|---|---|---|---|
| Cruceta | Moverse, saltar, agacharse | `W A S D` (o flechas en 1 jugador) | Flechas |
| A | Paso ligero | `J` o `Z` | `,` o `Num 1` |
| B | Paso fuerte | `K` o `X` | `.` o `Num 2` |
| R | Patada | `L` o `C` | `-` o `Num 3` |
| L | Súper o pose | `I` o `V` | `M` o `Num 0` |
| START | Pausa / aceptar | `Enter` | `Retroceso` |

`Esc` vuelve atrás en los menús y pausa el combate.

### Pasos (mirando a la derecha)

| Comando | Paso |
|---|---|
| ↓↘→ + A/B | Proyectil musical (A lento, B rápido) |
| →↓↘ + A/B | Salto antiaéreo |
| ↓↙← + R | Remolino de baile |
| L con un nivel de SABROSURA | Súper |
| → o ← + B, pegado al rival | Vuelta en pareja (agarre) |
| → → / ← ← | Deslizar / moonwalk |
| L sin nivel | Pose: suma sabrosura |

Para cubrirte, ve hacia atrás: de pie contra los pasos aéreos y agachado contra las barridas. La barra de SABROSURA llega hasta el nivel 3 (MAX) y cada súper gasta un nivel. Si te conectan muchos pasos seguidos te mareas (los círculos de arriba avisan).

## Integrantes

| Integrante | Instrumento | Estilo | Súper |
|---|---|---|---|
| **Beto** Montenegro | Voz y guitarra | Equilibrado | ¿Dónde es el after? |
| **Abeja** (Alejandro Abeijón) | Guitarra y sinte | Velocidad | Trippy Caribbean |
| **Fofo** (Andrés Story) | Batería y percusión | Potencia | Welcome to El Sur |
| **Tony** (Antonio Casas) | Bajo y sinte | Resistencia | ¿Quién trae las cornetas? |

Los nombres de los especiales vienen de canciones y discos de la banda. La apariencia sigue las imágenes de referencia del proyecto. Si quieres ajustar cómo se ve alguien (pelo, lentes, sombrero, ropa, colores), cambia su bloque `look` en `js/personajes.js`: arriba del archivo están todas las opciones.

## Escenarios

1. **El Barrio** (principal): azotea en un cerro de Caracas al atardecer.
2. **Los Roques**: fiesta en la playa con churuata, palmeras y agua turquesa.
3. **El Ávila**: la montaña con Caracas y el teleférico de fondo.

En cada pista, los dos integrantes que no están bailando animan desde la tarima del DJ.

## Modos

- **Arcade**: baila contra los otros tres, del barrio hasta El Ávila, y mira el final.
- **VS CPU**: duelo libre contra la computadora (fácil, normal o difícil).
- **2 Jugadores**: en el mismo teclado o con dos mandos.
- **Entrenamiento**: sin reloj, con muñeco configurable (quieto, agachado, bloquea, salta o CPU).
- **Opciones**: dificultad, rondas, tiempo, volumen, voz del locutor y filtro LCD.

## Cómo está hecho

Todo es HTML, CSS y JavaScript sin librerías. Los gráficos se dibujan píxel a píxel desde el código (no hay imágenes): los bailarines son "marionetas" de píxeles con sombreado de 4 tonos, y la música chiptune es original y se genera con WebAudio.

| Archivo | Qué hace |
|---|---|
| `js/base.js` | Constantes, colores y opciones guardadas |
| `js/fuente.js` | Fuente de píxeles con tildes y texto grueso en itálica |
| `js/pixel.js` | Lienzo para dibujar sprites píxel a píxel |
| `js/audio.js` | Música chiptune, efectos de sonido y locutor |
| `js/entrada.js` | Teclado, mandos y botones táctiles |
| `js/personajes.js` | Datos y apariencia de los cuatro integrantes |
| `js/sprites.js` | Poses, dibujo de los bailarines y retratos |
| `js/escenarios.js` | Los tres escenarios con paralaje y público |
| `js/efectos.js` | Chispas, notas musicales y proyectiles |
| `js/luchador.js` | Estados, golpes, especiales, agarres y mareos |
| `js/ia.js` | La CPU con tres niveles de dificultad |
| `js/combate.js` | Rondas, reloj, cámara, colisiones y HUD |
| `js/pantallas.js` | Título, menús, selección, VS, resultados y final |
| `js/principal.js` | Bucle a 60 FPS, transiciones y modo arcade |

Juego de fans sin fines de lucro, hecho con cariño para la banda. No está afiliado a Rawayana.
