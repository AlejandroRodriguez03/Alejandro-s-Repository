// =====================================================================
// pixel.js: lienzo de píxeles para dibujar los sprites a mano (sin suavizado).
// Todo se pinta píxel por píxel en un búfer de 32 bits y después se pasa a canvas.
// =====================================================================
(function () {
  const RW = window.RW;

  // Dirección de la luz (arriba a la izquierda): sirve para sombrear piezas.
  const LUZ_X = -0.9, LUZ_Y = -0.9;

  function distSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = x0 + dx * t - px, ey = y0 + dy * t - py;
    return Math.sqrt(ex * ex + ey * ey);
  }

  class Lienzo {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.datos = new Uint32Array(w * h);
    }

    px(x, y, c) {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
      this.datos[y * this.w + x] = c;
    }

    obtener(x, y) {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
      return this.datos[y * this.w + x];
    }

    rect(x, y, w, h, c) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
    }

    // Recorre los píxeles de una caja y pinta los que cumplan la función.
    // fn(cx, cy) debe devolver un color u32 o 0 para no pintar.
    pintar(x0, y0, x1, y1, fn) {
      const ax = Math.max(0, Math.floor(x0)), ay = Math.max(0, Math.floor(y0));
      const bx = Math.min(this.w - 1, Math.ceil(x1)), by = Math.min(this.h - 1, Math.ceil(y1));
      for (let y = ay; y <= by; y++) {
        for (let x = ax; x <= bx; x++) {
          const c = fn(x + 0.5, y + 0.5);
          if (c) this.datos[y * this.w + x] = c;
        }
      }
    }

    // Cápsula (segmento grueso con puntas redondas): extremidades del cuerpo.
    // c = color base, cs = color de sombra (opcional).
    capsula(x0, y0, x1, y1, r, c, cs) {
      const m = r + 1;
      const lx = LUZ_X * 0.8, ly = LUZ_Y * 0.8;
      this.pintar(Math.min(x0, x1) - m, Math.min(y0, y1) - m, Math.max(x0, x1) + m, Math.max(y0, y1) + m,
        (px, py) => {
          const d = distSeg(px, py, x0, y0, x1, y1);
          if (d > r) return 0;
          if (!cs) return c;
          const d2 = distSeg(px + lx, py + ly, x0, y0, x1, y1);
          return d2 <= r - 0.7 ? c : cs;
        });
    }

    // Cápsula con borde oscuro (para piezas que van delante de otras).
    capsulaBorde(x0, y0, x1, y1, r, borde) {
      this.capsula(x0, y0, x1, y1, r + 1, borde);
    }

    circulo(cx, cy, r, c, cs) {
      this.elipse(cx, cy, r, r, c, cs);
    }

    elipse(cx, cy, rx, ry, c, cs) {
      this.pintar(cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1, (px, py) => {
        const dx = (px - cx) / rx, dy = (py - cy) / ry;
        if (dx * dx + dy * dy > 1) return 0;
        if (!cs) return c;
        const ex = (px + LUZ_X - cx) / (rx - 0.6), ey = (py + LUZ_Y - cy) / (ry - 0.6);
        return ex * ex + ey * ey <= 1 ? c : cs;
      });
    }

    // Polígono relleno. fnColor(px, py) permite estampados (rayas, flores...).
    poligono(puntos, c, fnColor) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of puntos) {
        x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]);
        x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
      }
      const n = puntos.length;
      this.pintar(x0 - 1, y0 - 1, x1 + 1, y1 + 1, (px, py) => {
        let dentro = false;
        for (let i = 0, j = n - 1; i < n; j = i++) {
          const xi = puntos[i][0], yi = puntos[i][1], xj = puntos[j][0], yj = puntos[j][1];
          if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) dentro = !dentro;
        }
        if (!dentro) return 0;
        return fnColor ? fnColor(px, py) : c;
      });
    }

    // Línea fina de 1 píxel (Bresenham).
    linea(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.px(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }

    // Contorno exterior de 1 píxel alrededor de todo lo dibujado.
    contorno(c) {
      const w = this.w, h = this.h, d = this.datos;
      const copia = new Uint32Array(d);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (copia[y * w + x]) continue;
          if ((x > 0 && copia[y * w + x - 1]) || (x < w - 1 && copia[y * w + x + 1]) ||
              (y > 0 && copia[(y - 1) * w + x]) || (y < h - 1 && copia[(y + 1) * w + x])) {
            d[y * w + x] = c;
          }
        }
      }
    }

    // Copia otro lienzo encima (los píxeles vacíos no tapan).
    estampar(otro, ox, oy) {
      for (let y = 0; y < otro.h; y++) {
        for (let x = 0; x < otro.w; x++) {
          const c = otro.datos[y * otro.w + x];
          if (c) this.px(x + ox, y + oy, c);
        }
      }
    }

    // Convierte en canvas. Si espejo = true lo voltea horizontalmente.
    aCanvas(espejo, escala) {
      escala = escala || 1;
      const base = RW.crearCanvas(this.w, this.h);
      const ctx = base.getContext('2d');
      const img = ctx.createImageData(this.w, this.h);
      const dst = new Uint32Array(img.data.buffer);
      if (espejo) {
        for (let y = 0; y < this.h; y++) {
          for (let x = 0; x < this.w; x++) dst[y * this.w + x] = this.datos[y * this.w + (this.w - 1 - x)];
        }
      } else {
        dst.set(this.datos);
      }
      ctx.putImageData(img, 0, 0);
      if (escala === 1) return base;
      const grande = RW.crearCanvas(this.w * escala, this.h * escala);
      const g = grande.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(base, 0, 0, this.w * escala, this.h * escala);
      return grande;
    }
  }

  RW.Lienzo = Lienzo;
  RW.distSeg = distSeg;

  // Silueta de un canvas en un solo color (para destellos al recibir golpes).
  RW.silueta = function (canvas, color) {
    const c = RW.crearCanvas(canvas.width, canvas.height);
    const ctx = c.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
    return c;
  };
})();
