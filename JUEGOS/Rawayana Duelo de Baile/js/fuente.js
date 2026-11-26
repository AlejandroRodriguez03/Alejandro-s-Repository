// =====================================================================
// fuente.js: fuente de mapa de bits de 5x7 píxeles, con tildes y eñe.
// Cada letra son 7 filas; cada fila es un número de 5 bits (bit 4 = izquierda).
// =====================================================================
(function () {
  const RW = window.RW;

  const G = {
    'A': [0x0E, 0x11, 0x11, 0x11, 0x1F, 0x11, 0x11],
    'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
    'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
    'D': [0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C],
    'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
    'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
    'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0F],
    'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
    'I': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
    'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C],
    'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
    'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
    'M': [0x11, 0x1B, 0x15, 0x15, 0x11, 0x11, 0x11],
    'N': [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
    'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
    'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
    'Q': [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
    'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
    'S': [0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E],
    'T': [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
    'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
    'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
    'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0A],
    'X': [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
    'Y': [0x11, 0x11, 0x11, 0x0A, 0x04, 0x04, 0x04],
    'Z': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
    '0': [0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E],
    '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
    '2': [0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F],
    '3': [0x1F, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0E],
    '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
    '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
    '6': [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E],
    '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
    '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
    '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C],
    ' ': [0, 0, 0, 0, 0, 0, 0],
    '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
    '¡': [0x04, 0x00, 0x04, 0x04, 0x04, 0x04, 0x04],
    '?': [0x0E, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
    '¿': [0x04, 0x00, 0x04, 0x08, 0x10, 0x11, 0x0E],
    '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x0C],
    ',': [0x00, 0x00, 0x00, 0x00, 0x0C, 0x04, 0x08],
    ':': [0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x0C, 0x00],
    ';': [0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x04, 0x08],
    '-': [0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00],
    '+': [0x00, 0x04, 0x04, 0x1F, 0x04, 0x04, 0x00],
    '/': [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x00],
    "'": [0x0C, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00],
    '"': [0x0A, 0x0A, 0x0A, 0x00, 0x00, 0x00, 0x00],
    '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
    ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
    '%': [0x18, 0x19, 0x02, 0x04, 0x08, 0x13, 0x03],
    '=': [0x00, 0x00, 0x1F, 0x00, 0x1F, 0x00, 0x00],
    '<': [0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02],
    '>': [0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08],
    '*': [0x00, 0x04, 0x15, 0x0E, 0x15, 0x04, 0x00],
    '#': [0x0A, 0x0A, 0x1F, 0x0A, 0x1F, 0x0A, 0x0A],
    '&': [0x0C, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0D],
    '_': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F],
    '©': [0x0E, 0x11, 0x17, 0x15, 0x17, 0x11, 0x0E],
    // Símbolos especiales del juego
    '♪': [0x07, 0x05, 0x04, 0x04, 0x0C, 0x1C, 0x18],
    '♥': [0x00, 0x0A, 0x1F, 0x1F, 0x0E, 0x04, 0x00],
    '★': [0x04, 0x04, 0x1F, 0x0E, 0x0E, 0x1B, 0x11],
    '→': [0x00, 0x04, 0x02, 0x1F, 0x02, 0x04, 0x00],
    '←': [0x00, 0x04, 0x08, 0x1F, 0x08, 0x04, 0x00],
    '↑': [0x04, 0x0E, 0x15, 0x04, 0x04, 0x04, 0x00],
    '↓': [0x00, 0x04, 0x04, 0x04, 0x15, 0x0E, 0x04],
    '↘': [0x00, 0x10, 0x08, 0x05, 0x03, 0x07, 0x00],
    '↙': [0x00, 0x01, 0x02, 0x14, 0x18, 0x1C, 0x00],
    '▶': [0x08, 0x0C, 0x0E, 0x0F, 0x0E, 0x0C, 0x08],
    '◀': [0x02, 0x06, 0x0E, 0x1E, 0x0E, 0x06, 0x02],
    '·': [0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00],
    '■': [0x00, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x00],
    '□': [0x00, 0x1F, 0x11, 0x11, 0x11, 0x1F, 0x00],
    '∞': [0x00, 0x00, 0x0A, 0x15, 0x0A, 0x00, 0x00],
    '×': [0x00, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x00],
  };

  // Letras con tilde: se dibuja la mayúscula completa y la marca encima
  // (en las filas -3 y -2, dejando una fila libre).
  const ACENTOS = {
    'Á': ['A', 'agudo'], 'É': ['E', 'agudo'], 'Í': ['I', 'agudo'], 'Ó': ['O', 'agudo'], 'Ú': ['U', 'agudo'],
    'Ñ': ['N', 'tilde'], 'Ü': ['U', 'dieresis'],
  };
  const MARCAS = {
    agudo: [[3, -3], [2, -2]],
    tilde: [[1, -3], [2, -3], [4, -3], [0, -2], [2, -2], [3, -2]],
    dieresis: [[1, -2], [3, -2]],
  };

  const AVANCE = 6;   // 5 píxeles de letra + 1 de espacio
  const ALTO_LINEA = 10;

  function glifo(c) {
    if (ACENTOS[c]) return G[ACENTOS[c][0]];
    let g = G[c];
    if (!g) g = G[c.toUpperCase()];
    if (!g) g = G['?'];
    return g;
  }

  // Ancho en píxeles de un texto de una sola línea.
  RW.anchoTexto = function (str, escala) {
    escala = escala || 1;
    const lineas = String(str).split('\n');
    let max = 0;
    for (const l of lineas) max = Math.max(max, l.length);
    return Math.max(0, max * AVANCE - 1) * escala;
  };

  function dibujarLinea(ctx, str, x, y, color, escala) {
    ctx.fillStyle = color;
    let cx = x;
    for (let c of str) {
      if (!G[c] && !ACENTOS[c]) c = c.toUpperCase();
      const g = glifo(c);
      if (ACENTOS[c]) {
        for (const m of MARCAS[ACENTOS[c][1]]) ctx.fillRect(cx + m[0] * escala, y + m[1] * escala, escala, escala);
      }
      for (let fila = 0; fila < 7; fila++) {
        const bits = g[fila];
        if (!bits) continue;
        for (let col = 0; col < 5; col++) {
          if (bits & (0x10 >> col)) {
            ctx.fillRect(cx + col * escala, y + fila * escala, escala, escala);
          }
        }
      }
      cx += AVANCE * escala;
    }
  }

  // Dibuja texto. Opciones: escala, alinear ('izq' | 'centro' | 'der'),
  // sombra (color), contorno (color), degradado (lista de colores por fila).
  RW.texto = function (ctx, str, x, y, color, op) {
    op = op || {};
    const escala = op.escala || 1;
    const lineas = String(str).split('\n');
    x = Math.round(x);
    y = Math.round(y);
    lineas.forEach((linea, i) => {
      let lx = x;
      const ancho = RW.anchoTexto(linea, escala);
      if (op.alinear === 'centro') lx = Math.round(x - ancho / 2);
      else if (op.alinear === 'der') lx = x - ancho;
      const ly = y + i * (op.interlineado || ALTO_LINEA) * escala;
      if (op.contorno) {
        const o = escala >= 2 && op.contornoGrueso ? 2 : 1;
        for (let dx = -o; dx <= o; dx++) {
          for (let dy = -o; dy <= o; dy++) {
            if (dx || dy) dibujarLinea(ctx, linea, lx + dx, ly + dy, op.contorno, escala);
          }
        }
      }
      if (op.sombra) dibujarLinea(ctx, linea, lx + escala, ly + escala, op.sombra, escala);
      if (op.degradado) {
        // Dibuja fila por fila con el color correspondiente (para logotipos).
        const cols = op.degradado;
        for (let fila = -3; fila < 7; fila++) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(lx - 2, ly + fila * escala, ancho + 4, escala);
          ctx.clip();
          dibujarLinea(ctx, linea, lx, ly, cols[RW.limitar(fila, 0, cols.length - 1)], escala);
          ctx.restore();
        }
      } else {
        dibujarLinea(ctx, linea, lx, ly, color, escala);
      }
    });
  };

  // Parte un texto largo en líneas que quepan en un ancho dado.
  RW.partirTexto = function (str, anchoMax, escala) {
    escala = escala || 1;
    const maxCar = Math.max(1, Math.floor((anchoMax + escala) / (AVANCE * escala)));
    const salida = [];
    String(str).split('\n').forEach((parrafo) => {
      let linea = '';
      parrafo.split(' ').forEach((palabra) => {
        const prueba = linea ? linea + ' ' + palabra : palabra;
        if (prueba.length > maxCar && linea) {
          salida.push(linea);
          linea = palabra;
        } else {
          linea = prueba;
        }
      });
      salida.push(linea);
    });
    return salida;
  };

  // ---------- Texto grueso en itálica, con degradado, contorno y sombra ----------
  // (para títulos, nombres, reloj y mensajes grandes). Se guarda en caché.
  const DEG = (a, b, c) => [a, a, b, b, c, c, c];
  RW.ESTILOS = {
    oro: { colores: ['#fffbd8', '#ffef90', '#ffd83a', '#ffc020', '#ffa018', '#f47a10', '#d85810'], contorno: '#1a0f26', sombra: '#6a1a20' },
    blanco: { colores: DEG('#ffffff', '#f2eeff', '#d8d0f0'), contorno: '#1a0f26', sombra: '#3a2060' },
    rosa: { colores: ['#ffe8f4', '#ffc0dc', '#ff8ab8', '#ff5a96', '#f03a7a', '#d02a64', '#a81a4c'], contorno: '#1a0f26', sombra: '#3a0a24' },
    azul: { colores: ['#e8fcff', '#b8f2ff', '#80e0ff', '#50c4f4', '#3aa4e8', '#2a84d0', '#1a64b0'], contorno: '#0a0f26', sombra: '#0a1a40' },
    verde: { colores: ['#f0ffe0', '#d0ffa0', '#a8f060', '#80e040', '#60c830', '#48a828', '#308818'], contorno: '#0a1a10', sombra: '#103010' },
  };
  const cacheEstilo = new Map();
  function renderEstilo(str, estilo, E, italica) {
    const est = RW.ESTILOS[estilo] || RW.ESTILOS.blanco;
    const o = E >= 2 ? 2 : 1;
    const pad = o + 2;
    const inclinar = (fila) => (italica ? Math.round((6 - fila) * E * 0.3) : 0);
    const grueso = Math.max(1, Math.floor(E / 2));
    const w = Math.max(1, str.length * AVANCE * E + inclinar(-3) + grueso + pad * 2);
    const h = 10 * E + pad * 2;
    const base = RW.crearCanvas(w, h);
    const g = base.getContext('2d');
    let cx = pad;
    for (let c of str) {
      if (!G[c] && !ACENTOS[c]) c = c.toUpperCase();
      const gl = glifo(c);
      for (let fila = 0; fila < 7; fila++) {
        g.fillStyle = est.colores[fila];
        for (let col = 0; col < 5; col++) {
          if (gl[fila] & (0x10 >> col)) g.fillRect(cx + col * E + inclinar(fila), pad + (fila + 3) * E, E + grueso, E);
        }
      }
      if (ACENTOS[c]) {
        g.fillStyle = est.colores[0];
        for (const m of MARCAS[ACENTOS[c][1]]) g.fillRect(cx + m[0] * E + inclinar(m[1]), pad + (m[1] + 3) * E, E + grueso, E);
      }
      cx += AVANCE * E;
    }
    const salida = RW.crearCanvas(w + 2, h + 2);
    const s = salida.getContext('2d');
    const sil = (color) => {
      const c = RW.crearCanvas(w, h);
      const cc = c.getContext('2d');
      cc.drawImage(base, 0, 0);
      cc.globalCompositeOperation = 'source-in';
      cc.fillStyle = color;
      cc.fillRect(0, 0, w, h);
      return c;
    };
    const sombra = sil(est.sombra), contorno = sil(est.contorno);
    for (let dx = -o; dx <= o; dx++) for (let dy = -o; dy <= o; dy++) s.drawImage(sombra, dx + o, dy + o);
    for (let dx = -o; dx <= o; dx++) for (let dy = -o; dy <= o; dy++) if (dx || dy) s.drawImage(contorno, dx, dy);
    s.drawImage(base, 0, 0);
    return { canvas: salida, pad, ancho: cx - pad };
  }
  // Dibuja texto con estilo. y es la parte de arriba de las letras (sin contar las tildes).
  RW.textoEstilo = function (ctx, str, x, y, estilo, escala, alinear, recta) {
    const E = escala || 2;
    const clave = str + '|' + estilo + '|' + E + '|' + (recta ? 0 : 1);
    let r = cacheEstilo.get(clave);
    if (!r) {
      r = renderEstilo(String(str), estilo, E, !recta);
      cacheEstilo.set(clave, r);
      if (cacheEstilo.size > 400) cacheEstilo.delete(cacheEstilo.keys().next().value);
    }
    let dx = x - r.pad;
    if (alinear === 'centro') dx = x - r.ancho / 2 - r.pad;
    else if (alinear === 'der') dx = x - r.ancho - r.pad;
    ctx.drawImage(r.canvas, Math.round(dx), Math.round(y - r.pad - 3 * E));
    return r.ancho;
  };

  RW.FUENTE = { AVANCE, ALTO_LINEA };
})();
