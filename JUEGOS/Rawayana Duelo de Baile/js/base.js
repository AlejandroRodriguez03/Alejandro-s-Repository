// =====================================================================
// RAWAYANA: DUELO DE BAILE
// base.js: espacio de nombres, constantes y utilidades compartidas.
// =====================================================================
window.RW = window.RW || {};

(function () {
  const RW = window.RW;

  // Resolución nativa de la pantalla (formato ancho, como un arcade de 16 bits).
  RW.ANCHO = 384;
  RW.ALTO = 216;

  // El combate se calcula en "unidades de juego" y se dibuja a 2 píxeles por unidad.
  RW.K = 2;
  RW.VISTA = RW.ANCHO / RW.K;   // 192 unidades de ancho visibles
  RW.CAM_Y = 48;                // unidad que queda en el borde de arriba de la pantalla
  RW.MUNDO_ANCHO = 400;         // ancho del escenario en unidades
  RW.SUELO = 146;               // altura (y) donde pisan los bailarines
  RW.FPS = 60;

  // Pasar de unidades de juego a píxeles de pantalla
  RW.aPx = (x, camX) => Math.round((x - camX) * RW.K);
  RW.aPy = (y) => Math.round((y - RW.CAM_Y) * RW.K);
  RW.PISO = (RW.SUELO - RW.CAM_Y) * RW.K;   // 196: línea del piso en la pantalla

  RW.limitar = (v, min, max) => (v < min ? min : v > max ? max : v);
  RW.signo = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  RW.lerp = (a, b, t) => a + (b - a) * t;
  RW.rad = (g) => (g * Math.PI) / 180;

  // Generador pseudoaleatorio con semilla (para que los fondos salgan siempre iguales).
  RW.azar = function (semilla) {
    let s = semilla >>> 0 || 1;
    const f = function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return (s >>> 0) / 4294967296;
    };
    f.entero = (min, max) => Math.floor(min + f() * (max - min + 1));
    f.elegir = (lista) => lista[Math.floor(f() * lista.length)];
    return f;
  };

  // Elegir un elemento al azar (sin semilla).
  RW.elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];

  // ---------- Colores ----------
  // Convierte "#rrggbb" en sus componentes.
  RW.hexARgb = function (hex) {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.substr(0, 2), 16),
      g: parseInt(h.substr(2, 2), 16),
      b: parseInt(h.substr(4, 2), 16),
    };
  };
  RW.rgbAHex = function (r, g, b) {
    const a = (v) => RW.limitar(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return '#' + a(r) + a(g) + a(b);
  };
  // Mezcla dos colores hex (t = 0 da a, t = 1 da b).
  RW.mezclar = function (a, b, t) {
    const x = RW.hexARgb(a), y = RW.hexARgb(b);
    return RW.rgbAHex(RW.lerp(x.r, y.r, t), RW.lerp(x.g, y.g, t), RW.lerp(x.b, y.b, t));
  };
  RW.oscurecer = (hex, t) => RW.mezclar(hex, '#120a24', t);
  RW.aclarar = (hex, t) => RW.mezclar(hex, '#ffffff', t);

  // Color empaquetado en 32 bits (formato de ImageData en equipos little-endian).
  RW.u32 = function (hex) {
    if (hex === null || hex === undefined) return 0;
    const c = RW.hexARgb(hex);
    return ((255 << 24) | (c.b << 16) | (c.g << 8) | c.r) >>> 0;
  };

  // Crea un canvas fuera de pantalla.
  RW.crearCanvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return c;
  };

  // Dibuja una imagen respetando su escala interna (las imágenes reales vienen al doble de resolución).
  RW.dibujarImg = function (ctx, img, x, y, w, h) {
    const e = img._escala || 1;
    ctx.drawImage(img, Math.round(x), Math.round(y), w || img.width / e, h || img.height / e);
  };

  // Rectángulo con coordenadas enteras (para que todo se vea pixelado y nítido).
  RW.rect = function (ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  // Círculo relleno hecho con filas de píxeles.
  RW.circulo = function (ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    const rr = r * r;
    for (let dy = -Math.floor(r); dy <= Math.floor(r); dy++) {
      const dx = Math.floor(Math.sqrt(Math.max(0, rr - dy * dy)));
      ctx.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
    }
  };

  // Elipse rellena con filas de píxeles.
  RW.elipse = function (ctx, cx, cy, rx, ry, color) {
    ctx.fillStyle = color;
    for (let dy = -Math.floor(ry); dy <= Math.floor(ry); dy++) {
      const t = 1 - (dy * dy) / (ry * ry);
      if (t < 0) continue;
      const dx = Math.floor(rx * Math.sqrt(t));
      ctx.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
    }
  };

  // Degradado vertical "tramado" (con dithering) entre una lista de colores.
  // Da ese aspecto de bandas de color de las consolas de 16 bits.
  RW.degradadoTramado = function (ctx, x, y, w, h, colores) {
    const tramos = colores.length - 1;
    for (let fila = 0; fila < h; fila++) {
      const t = (fila / Math.max(1, h - 1)) * tramos;
      const i = Math.min(tramos - 1, Math.floor(t));
      const f = t - i;
      const c1 = colores[i], c2 = colores[i + 1];
      // Patrón de tramado de 4 niveles
      if (f < 0.2) { RW.rect(ctx, x, y + fila, w, 1, c1); continue; }
      if (f > 0.8) { RW.rect(ctx, x, y + fila, w, 1, c2); continue; }
      RW.rect(ctx, x, y + fila, w, 1, c1);
      ctx.fillStyle = c2;
      const paso = f < 0.4 ? 4 : f < 0.6 ? 2 : 4;
      const desfase = fila % 2;
      if (f < 0.6) {
        for (let px = desfase; px < w; px += paso) ctx.fillRect(x + px, y + fila, 1, 1);
      } else {
        RW.rect(ctx, x, y + fila, w, 1, c2);
        ctx.fillStyle = c1;
        for (let px = desfase; px < w; px += 4) ctx.fillRect(x + px, y + fila, 1, 1);
      }
    }
  };

  // ---------- Opciones guardadas en el navegador ----------
  const OPCIONES_DEFECTO = {
    dificultad: 1,      // 0 = fácil, 1 = normal, 2 = difícil
    rondas: 3,          // al mejor de 1, 3 o 5
    tiempo: 99,         // 60, 99 o 0 (sin límite)
    musica: 0.55,       // volumen de 0 a 1
    efectos: 0.8,
    locutor: true,      // voz del presentador (síntesis de voz del navegador)
    lcd: true,          // rejilla de pantalla LCD
    sonido: true,
  };
  RW.opciones = Object.assign({}, OPCIONES_DEFECTO);
  try {
    const guardadas = JSON.parse(localStorage.getItem('rawayana-opciones') || '{}');
    Object.assign(RW.opciones, guardadas);
  } catch (e) { /* sin almacenamiento: usamos los valores por defecto */ }
  RW.guardarOpciones = function () {
    try { localStorage.setItem('rawayana-opciones', JSON.stringify(RW.opciones)); } catch (e) { /* nada */ }
  };

  // Rectángulo con borde (ventanas de menú estilo retro).
  RW.ventana = function (ctx, x, y, w, h, fondo, borde, brillo) {
    RW.rect(ctx, x + 1, y, w - 2, h, borde);
    RW.rect(ctx, x, y + 1, w, h - 2, borde);
    RW.rect(ctx, x + 1, y + 1, w - 2, h - 2, fondo);
    if (brillo) RW.rect(ctx, x + 2, y + 1, w - 4, 1, brillo);
  };
})();
