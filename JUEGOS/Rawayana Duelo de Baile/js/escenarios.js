// =====================================================================
// escenarios.js: los tres escenarios del duelo, en formato ancho.
//   1. El Barrio (Caracas) al atardecer: el escenario principal
//   2. Los Roques: fiesta en la playa, arena blanca y agua turquesa
//   3. El Ávila: la montaña con Caracas y el teleférico
// Cada escenario tiene capas con paralaje, público que reacciona a los
// golpes y una tarima de DJ con los dos integrantes que no están bailando.
// Todo se dibuja en píxeles de pantalla (el mundo mide 800 px de ancho).
// =====================================================================
(function () {
  const RW = window.RW;
  const R = RW.rect;
  const MUNDO_PX = RW.MUNDO_ANCHO * RW.K;
  const PISO = RW.PISO;

  // ---------- Ayudantes ----------
  function capa(factor) {
    const ancho = Math.ceil(RW.ANCHO + (MUNDO_PX - RW.ANCHO) * factor);
    const c = RW.crearCanvas(ancho, RW.ALTO);
    return { canvas: c, ctx: c.getContext('2d'), factor, ancho };
  }
  function dibujarCapa(ctx, c, camPx) {
    ctx.drawImage(c.canvas, -Math.round(camPx * c.factor), 0);
  }
  const off = (c, camPx) => -Math.round(camPx * c.factor);

  function nube(ctx, x, y, w, color, sombra) {
    const h = Math.max(6, Math.round(w / 3.5));
    RW.elipse(ctx, x + w * 0.5, y + h * 0.7, w * 0.5, h * 0.42, sombra || color);
    RW.elipse(ctx, x + w * 0.32, y + h * 0.45, w * 0.22, h * 0.5, color);
    RW.elipse(ctx, x + w * 0.58, y + h * 0.32, w * 0.24, h * 0.6, color);
    RW.elipse(ctx, x + w * 0.5, y + h * 0.55, w * 0.44, h * 0.32, color);
    RW.elipse(ctx, x + w * 0.55, y + h * 0.25, w * 0.12, h * 0.25, RW.aclarar(color, 0.4));
  }

  function cable(ctx, x0, y0, x1, y1, caida, color) {
    ctx.fillStyle = color;
    const n = Math.max(2, Math.abs(x1 - x0));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      ctx.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * caida), 1, 1);
    }
  }

  // Textura de bloques/ladrillos
  function ladrillos(g, x, y, w, h, base, junta, luz) {
    R(g, x, y, w, h, base);
    for (let yy = y; yy < y + h; yy += 4) {
      R(g, x, yy, w, 1, junta);
      const desf = ((yy - y) / 4) % 2 ? 4 : 0;
      for (let xx = x + desf; xx < x + w; xx += 8) R(g, xx, yy, 1, 4, junta);
      if (luz) for (let xx = x + desf + 1; xx < x + w - 2; xx += 8) R(g, xx, yy + 1, 3, 1, luz);
    }
  }

  function tanque(g, x, y, w, h, color) {
    const claro = RW.aclarar(color, 0.25), oscuro = RW.oscurecer(color, 0.3);
    R(g, x, y, w, h, color);
    R(g, x, y, 2, h, claro);
    R(g, x + w - 2, y, 2, h, oscuro);
    for (let yy = y + 3; yy < y + h; yy += 4) R(g, x, yy, w, 1, oscuro);
    RW.elipse(g, x + w / 2, y, w / 2, 2, claro);
    R(g, x + w / 2 - 2, y - 3, 4, 2, oscuro);
  }

  function techoZinc(g, x, y, w, inclin) {
    for (let i = 0; i < w; i++) {
      const yy = Math.round(y + (i / w) * inclin);
      R(g, x + i, yy, 1, 4, i % 3 === 0 ? '#6e6e80' : '#a8a8b8');
    }
    R(g, x, Math.round(y + inclin) + 4, w, 1, '#3a3446');
  }

  function palmera(ctx, x, yBase, alto, incl, t, fase) {
    for (let i = 0; i < alto; i++) {
      const tt = i / alto;
      const px = x + Math.sin(tt * 1.4) * incl;
      R(ctx, px - 3, yBase - i, 6, 1, i % 6 < 2 ? '#6e4a2c' : '#9a7048');
      if (i % 6 === 2) R(ctx, px - 3, yBase - i, 2, 1, '#5a3a22');
    }
    const cx = x + Math.sin(1.4) * incl, cy = yBase - alto;
    const hojas = [-160, -120, -75, -30, 15, 60, 105, 150, 190];
    hojas.forEach((a, i) => {
      const mov = Math.sin(t * 0.04 + fase + i) * 5;
      const ang = ((a + mov) * Math.PI) / 180;
      const largo = 34 + (i % 3) * 6;
      for (let j = 0; j < largo; j++) {
        const caida = (j * j) / (largo * 1.8);
        const hx = cx + Math.sin(ang) * j, hy = cy - Math.cos(ang) * j * 0.5 + caida;
        R(ctx, hx, hy, 3, 2, j % 4 < 2 ? '#2f8a3a' : '#46aa4a');
        if (j > 4 && j % 3 === 0) { R(ctx, hx - 1, hy + 2, 2, 4, '#2a6a32'); R(ctx, hx + 2, hy + 2, 2, 3, '#3a8a3a'); }
      }
    });
    RW.circulo(ctx, cx, cy + 2, 4, '#5a3a22');
    RW.circulo(ctx, cx - 3, cy + 4, 3, '#7a5230');
  }

  // ---------- Público (personas detrás de la baranda o en la orilla) ----------
  function crearPublico(semilla, cantidad, x0, x1, yBase, tonosPiel, ropa, estilo) {
    const az = RW.azar(semilla);
    const lista = [];
    for (let i = 0; i < cantidad; i++) {
      lista.push({
        x: x0 + (x1 - x0) * (i + az() * 0.7) / cantidad, y: yBase + az.entero(-4, 4), escala: 0.85 + az() * 0.3,
        fase: az() * 6.28, piel: az.elegir(tonosPiel), ropa: az.elegir(ropa),
        pelo: az.elegir(['#1d1410', '#3a2516', '#5a3a1e', '#2a1a12', '#7a4a2a']), largo: az() < 0.4,
        gorra: az() < 0.25 ? az.elegir(['#e74c6f', '#26315f', '#ffcc3d', '#f2efe8']) : null,
        telefono: az() < 0.15, estilo,
      });
    }
    return lista;
  }

  function persona(ctx, p, x, t, animo) {
    const e = p.escala;
    const bote = Math.round(Math.abs(Math.sin(t * (0.07 + animo * 0.1) + p.fase)) * (2 + animo * 5));
    const y = Math.round(p.y - bote);
    const arriba = animo > 0.3 && Math.sin(t * 0.1 + p.fase * 2) > -0.3;
    const hombro = 16 * e, cuerpo = 26 * e;
    // Cuerpo
    RW.elipse(ctx, x, y - cuerpo * 0.5, hombro * 0.62, cuerpo * 0.55, '#1a0f26');
    RW.elipse(ctx, x, y - cuerpo * 0.5, hombro * 0.56, cuerpo * 0.5, p.ropa);
    R(ctx, x - hombro * 0.3, y - cuerpo * 0.9, hombro * 0.15, cuerpo * 0.7, RW.aclarar(p.ropa, 0.15));
    // Brazos
    const brazo = (lado) => {
      const bx = x + lado * hombro * 0.5;
      if (arriba) {
        const sway = Math.sin(t * 0.15 + p.fase + lado) * 3;
        R(ctx, bx - 2 + sway * 0.3, y - cuerpo - 18 * e, 5, 20 * e, '#1a0f26');
        R(ctx, bx - 1 + sway * 0.3, y - cuerpo - 17 * e, 3, 19 * e, p.piel);
        RW.circulo(ctx, bx + sway * 0.3 + 0.5, y - cuerpo - 18 * e, 2.5, p.piel);
        if (p.telefono && lado > 0) { R(ctx, bx - 1, y - cuerpo - 26 * e, 5, 8, '#1a1a26'); R(ctx, bx, y - cuerpo - 25 * e, 3, 6, '#9adfff'); }
      } else {
        R(ctx, bx - 2, y - cuerpo * 0.85, 5, cuerpo * 0.75, '#1a0f26');
        R(ctx, bx - 1, y - cuerpo * 0.8, 3, cuerpo * 0.7, p.piel);
      }
    };
    brazo(-1); brazo(1);
    // Cabeza
    const cy = y - cuerpo - 6 * e;
    RW.circulo(ctx, x, cy, 7 * e, '#1a0f26');
    RW.circulo(ctx, x, cy, 6 * e, p.piel);
    RW.elipse(ctx, x, cy - 3 * e, 6.5 * e, 4 * e, p.pelo);
    if (p.largo) R(ctx, x - 7 * e, cy - 2, 3 * e, 10 * e, p.pelo);
    if (p.gorra) { RW.elipse(ctx, x, cy - 4 * e, 6.5 * e, 3.5 * e, p.gorra); R(ctx, x, cy - 3 * e, 8 * e, 2, p.gorra); }
  }

  function dibujarPublico(ctx, lista, camPx, factor, t, animo) {
    const o = -Math.round(camPx * factor);
    lista.forEach((p) => {
      const x = Math.round(p.x + o);
      if (x < -30 || x > RW.ANCHO + 30) return;
      persona(ctx, p, x, t, animo);
    });
  }

  // ---------- Tarima del DJ con los otros dos integrantes ----------
  function tarimaDJ(ctx, xc, t, djs, colorLed) {
    const P = RW.POSES;
    if (xc < -120 || xc > RW.ANCHO + 120) return;
    // Los integrantes detrás de la mesa (un poco más al fondo y en penumbra)
    const base = PISO - 22;
    if ('filter' in ctx) ctx.filter = 'brightness(0.78) saturate(0.9)';
    // Solo aparecen los integrantes que tienen imagen real (los muñecos de código no)
    const conArte = (djs || []).filter((pj) => RW.arte && (RW.arte.imagen(pj.id, 'dj') || RW.arte.imagen(pj.id, 'quieto')));
    conArte.sort((a, b) => (RW.arte.imagen(b.id, 'dj') ? 1 : 0) - (RW.arte.imagen(a.id, 'dj') ? 1 : 0));
    conArte.forEach((pj, i) => {
      const dj = RW.arte.imagen(pj.id, 'dj');
      const golpe = Math.floor((t + i * 17) / 15) % 4;
      if (dj) {
        const w = dj.normal.width / 2, h = dj.normal.height / 2;
        const bote = golpe % 2 ? 1 : 0;
        RW.dibujarImg(ctx, dj.normal, xc - w / 2 + (conArte.length > 1 ? -18 : 0), base - 44 - h + 14 + bote);
      } else {
        const x = xc + (i === 0 ? (conArte.length > 1 ? 40 : 0) : 46);
        const pose = golpe === 3 ? P.dj3 : (golpe % 2 ? P.dj2 : P.q2);
        RW.sprites.dibujar(ctx, pj, pose, 0, x, base, -1);
      }
    });
    if ('filter' in ctx) ctx.filter = 'none';
    // Mesa
    const top = base - 44, w = 128, x0 = xc - w / 2;
    R(ctx, x0 - 2, top - 2, w + 4, base - top + 2, '#1a0f26');
    R(ctx, x0, top + 8, w, base - top - 8, '#2a1a4a');
    for (let i = -40; i < w; i += 12) {
      ctx.fillStyle = '#3a2a6a';
      for (let j = 0; j < 36; j++) ctx.fillRect(Math.round(x0 + i + j * 0.6), top + 10 + j, 5, 1);
    }
    R(ctx, x0, top + 8, w, 2, '#4a3a7a');
    R(ctx, x0, top, w, 8, '#3a3050');
    R(ctx, x0, top, w, 2, '#6a5a8a');
    RW.textoEstilo(ctx, 'RAWAYANA', xc, top + 22, 'blanco', 1, 'centro');
    // Tornamesas y mezcladora
    [-38, 38].forEach((dx, i) => {
      RW.elipse(ctx, xc + dx, top + 3, 19, 5, '#1a0f26');
      RW.elipse(ctx, xc + dx, top + 3, 17, 4, '#2a2236');
      RW.elipse(ctx, xc + dx, top + 3, 11, 2.6, '#7a4ab0');
      const a = t * 0.2 + i;
      R(ctx, xc + dx + Math.cos(a) * 9, top + 3 + Math.sin(a) * 2, 2, 1, '#ffffff');
    });
    R(ctx, xc - 14, top - 2, 28, 8, '#1a1626');
    for (let i = 0; i < 5; i++) {
      R(ctx, xc - 11 + i * 5, top - 1, 2, 5, '#6a6680');
      R(ctx, xc - 11 + i * 5, top + 1 + ((t >> 3) + i) % 3, 2, 1, '#ffffff');
    }
    for (let i = 0; i < 8; i++) {
      const on = ((t >> 2) + i) % 4 !== 0;
      R(ctx, x0 + 6 + i * 15, base - 8, 6, 3, on ? (i % 2 ? colorLed : '#ffd24a') : '#2a2040');
    }
  }

  // =====================================================================
  // 1. EL BARRIO (atardecer)
  // =====================================================================
  function crearBarrio() {
    const az = RW.azar(1987);
    const cielo = capa(0);
    let g = cielo.ctx;
    RW.degradadoTramado(g, 0, 0, RW.ANCHO, 150, ['#2a2a78', '#4a3a8a', '#8a4a92', '#d0708e', '#f89a72', '#ffd080']);
    // Sol con rayos
    g.fillStyle = 'rgba(255, 230, 160, 0.18)';
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      for (let j = 22; j < 90; j += 2) g.fillRect(Math.round(300 + Math.cos(a) * j), Math.round(112 + Math.sin(a) * j * 0.8), 2, 2);
    }
    RW.circulo(g, 300, 112, 26, 'rgba(255, 220, 150, 0.35)');
    RW.circulo(g, 300, 112, 17, '#ffe8a0');
    RW.circulo(g, 300, 112, 13, '#fff6d0');
    [[20, 50, 110], [150, 36, 90], [250, 64, 120], [60, 84, 80]].forEach((n) => {
      R(g, n[0], n[1], n[2], 3, '#c06a9a'); R(g, n[0] + 10, n[1] - 2, n[2] - 30, 2, '#e08aa0'); R(g, n[0] + 20, n[1] + 3, n[2] - 40, 1, '#a05a90');
    });
    for (let i = 0; i < 40; i++) R(g, az.entero(0, 383), az.entero(0, 40), 1, 1, '#d8d0ff');

    // Montañas lejanas
    const lejos = capa(0.12);
    g = lejos.ctx;
    for (let x = 0; x < lejos.ancho; x++) {
      const y1 = 104 + Math.sin(x * 0.018) * 10 + Math.sin(x * 0.05) * 4;
      R(g, x, y1, 1, 120, '#7a5aa8');
      const y2 = 116 + Math.sin(x * 0.024 + 2) * 8 + Math.sin(x * 0.07) * 3;
      R(g, x, y2, 1, 120, '#6a4a98');
    }
    R(g, 120, 86, 2, 18, '#5a3a88'); R(g, 116, 92, 10, 1, '#5a3a88');

    // Cerro lleno de ranchos
    const cerro = capa(0.3);
    g = cerro.ctx;
    const borde = (x) => 112 + Math.sin(x * 0.012 + 1) * 14 + Math.sin(x * 0.045) * 4;
    for (let x = 0; x < cerro.ancho; x++) R(g, x, borde(x), 1, 200, '#8a5a7a');
    const coloresLejos = ['#b0606a', '#c07070', '#a85a70', '#c88070', '#9a5a7a', '#d09080', '#b87878', '#8a5a80'];
    const lucesCerro = [];
    for (let y = 100; y < 180; y += 7) {
      let x = az.entero(0, 6);
      while (x < cerro.ancho) {
        const w = az.entero(9, 18), h = az.entero(7, 11);
        if (y > borde(x) - 2) {
          const c = az.elegir(coloresLejos);
          R(g, x, y, w, h, c);
          R(g, x, y, w, 1, RW.oscurecer(c, 0.35));
          R(g, x + w - 2, y + 1, 2, h - 1, RW.oscurecer(c, 0.2));
          for (let vx = x + 2; vx < x + w - 3; vx += 5) {
            const lit = az() < 0.25;
            R(g, vx, y + 3, 2, 3, lit ? '#ffd27a' : '#4a2a40');
            if (lit) lucesCerro.push({ x: vx, y: y + 3, fase: az() * 60 });
          }
          if (az() < 0.12) tanque(g, x + 2, y - 5, 5, 5, '#3a6ad0');
        }
        x += w + az.entero(0, 2);
      }
    }

    // Casas cercanas (dos grupos a los lados)
    const medio = capa(0.6);
    g = medio.ctx;
    const grupo = (desde, hasta) => {
      let x = desde;
      while (x < hasta) {
        const w = az.entero(44, 74), h = az.entero(50, 92);
        const top = 132 - h;
        ladrillos(g, x, top, w, h + 10, '#b8644a', '#8a4636', '#cc7a5a');
        R(g, x + w - 4, top, 4, h + 10, 'rgba(40, 10, 40, 0.35)');
        techoZinc(g, x - 3, top - 6, w + 6, az.entero(-3, 3));
        // Ventanas con rejas
        for (let vy = top + 10; vy < 120; vy += 22) {
          for (let vx = x + 7; vx < x + w - 14; vx += 18) {
            const lit = az() < 0.35;
            R(g, vx - 1, vy - 1, 12, 13, '#4a2a2a');
            R(g, vx, vy, 10, 11, lit ? '#ffd27a' : '#2a1a2a');
            for (let k = 2; k < 10; k += 3) R(g, vx + k, vy, 1, 11, '#1a0f1a');
            R(g, vx, vy + 5, 10, 1, '#1a0f1a');
          }
        }
        if (az() < 0.7) tanque(g, x + az.entero(4, w - 18), top - 20, 14, 15, '#2f6fd6');
        if (az() < 0.3) { RW.elipse(g, x + w - 12, top - 12, 7, 6, '#e8e8f0'); RW.elipse(g, x + w - 12, top - 12, 4, 3, '#b8b8c8'); R(g, x + w - 12, top - 8, 1, 6, '#6a6a7a'); }
        if (az() < 0.4) { RW.circulo(g, x + 8, top - 5, 6, '#3a8a3a'); RW.circulo(g, x + 6, top - 7, 4, '#5aaa4a'); }
        x += w + az.entero(-4, 6);
      }
    };
    grupo(-10, 210);
    grupo(450, medio.ancho);
    // Escalera con baranda amarilla
    for (let i = 0; i < 14; i++) R(g, 214 + i * 5, 128 - i * 4, 10, 4, i % 2 ? '#a8a2b0' : '#bab4c2');
    for (let i = 0; i < 70; i++) R(g, 214 + i, 112 - i * 0.8, 1, 1, '#f2c230');
    for (let i = 0; i < 70; i += 10) R(g, 214 + i, 112 - i * 0.8, 1, 16, '#f2c230');
    [[40, 40], [420, 34], [600, 44]].forEach((p) => { R(g, p[0], p[1], 4, 100, '#3a2a3a'); R(g, p[0] - 8, p[1] + 4, 20, 3, '#3a2a3a'); });
    cable(g, 0, 50, 40, 44, 6, '#1a1424');
    cable(g, 42, 44, 420, 38, 24, '#1a1424');
    cable(g, 42, 48, 420, 42, 30, '#1a1424');
    cable(g, 424, 38, 600, 48, 12, '#1a1424');
    cable(g, 604, 48, medio.ancho, 40, 8, '#1a1424');

    // Muro de concreto y piso
    const cerca = capa(1);
    g = cerca.ctx;
    R(g, 0, 128, cerca.ancho, 50, '#9a8aa0');
    R(g, 0, 122, cerca.ancho, 7, '#bcaabc');
    R(g, 0, 128, cerca.ancho, 2, '#7a6a84');
    for (let x = 0; x < cerca.ancho; x += 64) R(g, x, 129, 2, 48, '#7a6a84');
    for (let i = 0; i < 90; i++) {
      const sx = az.entero(0, cerca.ancho), sy = az.entero(132, 170), sw = az.entero(6, 26), sh = az.entero(4, 14);
      g.fillStyle = 'rgba(70, 40, 80, 0.18)';
      for (let yy = 0; yy < sh; yy++) for (let xx = 0; xx < sw; xx++) if (((xx + yy) & 1) && Math.hypot(xx - sw / 2, (yy - sh / 2) * 2) < sw / 2) g.fillRect(sx + xx, sy + yy, 1, 1);
    }
    // Grafitis
    const tags = [[60, '#6a4ad8'], [250, '#3a8ad8'], [560, '#9a3ad0'], [700, '#3a6ad8']];
    tags.forEach((t) => {
      let x = t[0], y = 150;
      g.fillStyle = t[1];
      for (let i = 0; i < 60; i++) { x += az.entero(0, 2); y += Math.round(Math.sin(i * 0.6) * 2); g.fillRect(x, y, 2, 2); }
    });
    RW.textoEstilo(g, 'RAWAYANA', 470, 140, 'rosa', 2, 'centro');
    RW.degradadoTramado(g, 0, 176, cerca.ancho, 40, ['#8a7a9a', '#7a6a90', '#6a5a84', '#5a4a78']);
    for (let i = 0; i < 40; i++) {
      const lx = az.entero(0, cerca.ancho), ly = az.entero(180, 212);
      g.fillStyle = 'rgba(255, 200, 220, 0.12)';
      g.fillRect(lx, ly, az.entero(10, 40), az.entero(2, 5));
    }
    for (let i = 0; i < 300; i++) R(g, az.entero(0, cerca.ancho), az.entero(178, 215), 1, 1, az() < 0.5 ? '#9a8aa8' : '#4a3a64');

    const publico = crearPublico(77, 18, 0, 800, 128, ['#f0c29a', '#d9a07a', '#c18562', '#9c6a4a', '#7a4f36'],
      ['#5a4a9a', '#7a3a8a', '#3a4a8a', '#8a4a6a', '#4a3a7a', '#e8e0f0'], 'barrio');

    return {
      dibujar(ctx, camPx, t, animo, djs) {
        dibujarCapa(ctx, cielo, camPx);
        dibujarCapa(ctx, lejos, camPx);
        dibujarCapa(ctx, cerro, camPx);
        const oc = off(cerro, camPx);
        lucesCerro.forEach((l) => { if (Math.sin(t * 0.02 + l.fase) < -0.7) R(ctx, l.x + oc, l.y, 2, 3, '#4a2a40'); });
        dibujarCapa(ctx, medio, camPx);
        dibujarPublico(ctx, publico, camPx, 1, t, animo);
        dibujarCapa(ctx, cerca, camPx);
        tarimaDJ(ctx, 400 - Math.round(camPx), t, djs, '#ff5a8a');
      },
    };
  }

  // =====================================================================
  // 2. LOS ROQUES (fiesta en la playa)
  // =====================================================================
  function crearRoques() {
    const az = RW.azar(2024);
    const cielo = capa(0);
    let g = cielo.ctx;
    RW.degradadoTramado(g, 0, 0, RW.ANCHO, 116, ['#2a62d0', '#3a7ae0', '#5a9cec', '#8cc4f6', '#c8e8ff', '#eaf8ff']);
    RW.circulo(g, 320, 34, 30, 'rgba(255, 250, 220, 0.35)');
    RW.circulo(g, 320, 34, 18, '#fffbe0');
    RW.circulo(g, 320, 34, 14, '#ffffff');

    const mar = capa(0.2);
    g = mar.ctx;
    RW.degradadoTramado(g, 0, 112, mar.ancho, 46, ['#1a5aa8', '#1f74c0', '#22a0d0', '#2ec4d0', '#62dcd4', '#9aeee0']);
    [[30, 70], [180, 50], [330, 90]].forEach((c) => {
      RW.elipse(g, c[0] + c[1] / 2, 112, c[1] / 2, 4, '#e9dcae');
      RW.elipse(g, c[0] + c[1] / 2, 110, c[1] / 2 - 6, 4, '#3f8f4a');
      for (let i = 0; i < 4; i++) {
        const px = c[0] + 10 + i * (c[1] / 4);
        R(g, px, 96, 2, 12, '#6e4a2c');
        R(g, px - 6, 95, 14, 2, '#2f7a3a'); R(g, px - 4, 93, 10, 2, '#3f9a48');
      }
    });
    R(g, 0, 112, mar.ancho, 1, '#d8f4ff');

    const medio = capa(0.55);
    g = medio.ctx;
    // Posada de dos pisos
    const px0 = 470;
    R(g, px0, 70, 110, 82, '#fbf7ee');
    R(g, px0, 70, 110, 3, '#ddd6c6');
    R(g, px0 - 6, 62, 122, 10, '#2b7fd6'); R(g, px0 - 6, 62, 122, 2, '#6aaaf0');
    R(g, px0 - 4, 108, 118, 5, '#2b7fd6');
    for (let i = 0; i < 4; i++) {
      R(g, px0 + 10 + i * 25, 80, 14, 16, '#ffcc3d'); R(g, px0 + 16 + i * 25, 80, 2, 16, '#e0a020');
      R(g, px0 + 10 + i * 25, 120, 14, 18, i === 1 ? '#2b7fd6' : '#ffcc3d');
    }
    RW.textoEstilo(g, 'POSADA', px0 + 55, 48, 'azul', 1, 'centro');

    const cerca = capa(1);
    g = cerca.ctx;
    RW.degradadoTramado(g, 0, 150, cerca.ancho, 66, ['#d8c494', '#ead8ac', '#f4e6c4', '#f8eed6', '#eedcb4']);
    for (let i = 0; i < 700; i++) R(g, az.entero(0, cerca.ancho), az.entero(156, 215), 1, 1, az() < 0.5 ? '#dcc898' : '#fffaf0');
    for (let i = 0; i < 14; i++) {
      const sx = az.entero(10, 790), sy = az.entero(180, 212);
      if (az() < 0.5) { RW.elipse(g, sx, sy, 3, 2, '#f7c6b8'); R(g, sx - 1, sy - 1, 2, 1, '#ffffff'); }
      else { R(g, sx, sy - 2, 2, 6, '#f28c38'); R(g, sx - 2, sy, 6, 2, '#f28c38'); }
    }
    for (let i = 0; i < 16; i++) RW.elipse(g, 60 + i * 26 + (i % 2) * 6, 206 - (i % 2) * 8, 2, 3, '#dcc898');
    // Churuata (techo de palma) detrás de la tarima
    R(g, 336, 96, 5, 100, '#7a5230'); R(g, 459, 96, 5, 100, '#7a5230');
    for (let y = 0; y < 34; y++) {
      const w = 20 + y * 4.6;
      for (let x = 0; x < w; x++) {
        const c = (x + y * 3) % 7 < 2 ? '#a07830' : (x % 5 === 0 ? '#e0c070' : '#c8a050');
        R(g, 400 - w / 2 + x, 70 + y, 1, 1, c);
      }
    }
    for (let x = 0; x < 176; x += 3) R(g, 312 + x, 104 + (x % 6 === 0 ? 3 : 1), 2, 3, '#a07830');
    // Toldo y cava
    R(g, 720, 120, 3, 76, '#ffffff');
    for (let i = 0; i < 8; i++) R(g, 690 + i * 8, 112 + Math.abs(i - 3.5) * 2, 8, 6, i % 2 ? '#e74c6f' : '#ffffff');
    R(g, 640, 176, 28, 18, '#2f9ad6'); R(g, 640, 176, 28, 4, '#ffffff'); R(g, 648, 172, 12, 4, '#ffffff');

    const publico = crearPublico(31, 14, 0, 800, 160, ['#f0c29a', '#d9a07a', '#c18562', '#9c6a4a', '#7a4f36'],
      ['#e74c6f', '#ffcc3d', '#39d0c0', '#6fa8ff', '#f28c38', '#ffffff'], 'playa');
    const nubes = [[10, 22, 70], [120, 40, 50], [220, 14, 80], [330, 46, 60]];

    return {
      dibujar(ctx, camPx, t, animo, djs) {
        dibujarCapa(ctx, cielo, camPx);
        nubes.forEach((n) => {
          const nx = ((n[0] + t * 0.04 - camPx * 0.05) % 520 + 520) % 520 - 100;
          nube(ctx, nx, n[1], n[2], '#ffffff', '#d6ecff');
        });
        dibujarCapa(ctx, mar, camPx);
        const om = off(mar, camPx);
        for (let i = 0; i < 40; i++) {
          const sx = ((i * 53 + Math.floor(t / 14) * 17) % mar.ancho) + om;
          const sy = 116 + ((i * 23) % 40);
          if ((i + Math.floor(t / 9)) % 4 === 0) R(ctx, sx, sy, 3, 1, '#ffffff');
        }
        const vx = ((t * 0.08) % 520) - 60;
        R(ctx, vx, 108, 16, 3, '#ffffff'); R(ctx, vx + 8, 88, 2, 20, '#5a4a3a');
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 18; i++) ctx.fillRect(Math.round(vx + 10), 89 + i, Math.round(i * 0.5), 1);
        const by = 132 + Math.round(Math.sin(t * 0.05) * 2);
        const bx = 200 + om;
        R(ctx, bx, by, 46, 7, '#e74c6f'); R(ctx, bx + 4, by + 7, 38, 3, '#2b59c3'); R(ctx, bx, by, 46, 2, '#ffcc3d'); R(ctx, bx + 34, by - 6, 9, 6, '#ffffff');
        for (let i = 0; i < 3; i++) {
          const px = ((t * (0.4 + i * 0.08) + i * 170) % 520) - 70;
          const py = 56 + i * 14 + Math.sin(t * 0.03 + i) * 6;
          const ala = Math.sin(t * 0.18 + i * 2) > 0 ? -4 : 2;
          R(ctx, px, py, 8, 4, '#7a6a5a'); R(ctx, px + 8, py, 6, 2, '#f2b84a');
          R(ctx, px - 6, py + ala, 6, 2, '#5a4a3a'); R(ctx, px + 4, py + ala, 6, 2, '#5a4a3a');
        }
        dibujarCapa(ctx, medio, camPx);
        const o2 = off(medio, camPx);
        palmera(ctx, 60 + o2, 158, 110, 16, t, 0);
        palmera(ctx, 300 + o2, 158, 96, -14, t, 2);
        palmera(ctx, 640 + o2, 158, 120, 10, t, 4);
        // Orilla con espuma
        const ola = Math.round(Math.sin(t * 0.03) * 4);
        R(ctx, 0, 149 + ola, RW.ANCHO, 3, '#bff5ee');
        for (let i = 0; i < RW.ANCHO; i += 8) R(ctx, i + ((t >> 3) % 8), 152 + ola, 5, 2, '#ffffff');
        dibujarCapa(ctx, cerca, camPx);
        dibujarPublico(ctx, publico, camPx, 1, t, animo);
        tarimaDJ(ctx, 400 - Math.round(camPx), t, djs, '#3ad0c0');
      },
    };
  }

  // =====================================================================
  // 3. EL ÁVILA (Caracas, la montaña y el teleférico)
  // =====================================================================
  function crearAvila() {
    const az = RW.azar(1567);
    const cielo = capa(0);
    let g = cielo.ctx;
    RW.degradadoTramado(g, 0, 0, RW.ANCHO, 150, ['#2a5ad0', '#3a72e0', '#5a92ec', '#8ab8f4', '#c0dcf8']);
    [[0, 50, 120], [140, 30, 100], [270, 60, 130]].forEach((n) => nube(g, n[0], n[1], n[2], '#f4eefc', '#c8c0e8'));

    // El Ávila
    const monte = capa(0.1);
    g = monte.ctx;
    const altura = (x) => {
      const p1 = Math.max(0, 70 - Math.abs(x - 140) * 0.55);
      const p2 = Math.max(0, 64 - Math.abs(x - 290) * 0.6);
      return 140 - Math.max(p1, p2, 20) + Math.sin(x * 0.08) * 2;
    };
    for (let x = 0; x < monte.ancho; x++) {
      const y = altura(x);
      for (let yy = Math.round(y); yy < 170; yy++) {
        const surco = Math.sin(x * 0.11 + yy * 0.05) + Math.sin(x * 0.05 - yy * 0.03);
        let c = surco > 1 ? '#5aaa5a' : surco < -1 ? '#2a6a3a' : '#3a8a4a';
        if (yy > 140) c = RW.mezclar(c, '#9ab8d8', (yy - 140) / 40);
        R(g, x, yy, 1, 1, c);
      }
      R(g, x, y, 1, 1, '#7aca6a');
    }
    // Hotel en la cima
    R(g, 286, 60, 10, 22, '#eef0f6'); R(g, 293, 60, 3, 22, '#c0c6d4');
    for (let yy = 62; yy < 82; yy += 2) R(g, 287, yy, 6, 1, '#7a84a0');
    R(g, 285, 58, 12, 3, '#d8dce6');

    // Ciudad
    const ciudad = capa(0.3);
    g = ciudad.ctx;
    const pasteles = ['#e8d8c8', '#d8c0c8', '#c8d0e0', '#e0e0e8', '#f0e0c0', '#b8c8d8', '#e8c8b8'];
    let x = 0;
    while (x < ciudad.ancho) {
      const w = az.entero(12, 28), h = az.entero(24, 72);
      const top = 168 - h;
      const c = az.elegir(pasteles);
      R(g, x, top, w, h + 10, c);
      R(g, x + w - 3, top, 3, h + 10, RW.oscurecer(c, 0.18));
      R(g, x, top, w, 2, RW.aclarar(c, 0.3));
      for (let wy = top + 4; wy < 160; wy += 5) for (let wx = x + 2; wx < x + w - 4; wx += 4) R(g, wx, wy, 2, 3, az() < 0.15 ? '#ffe8a0' : '#7a8aa8');
      x += w + az.entero(0, 3);
    }
    R(g, 200, 76, 16, 96, '#c8ccd8'); R(g, 222, 70, 16, 102, '#c8ccd8');
    for (let wy = 80; wy < 168; wy += 4) { R(g, 202, wy, 12, 2, '#7a84a0'); R(g, 224, wy - 4, 12, 2, '#7a84a0'); }
    for (let i = 0; i < 60; i++) {
      const tx = az.entero(0, ciudad.ancho), ty = az.entero(158, 176);
      RW.circulo(g, tx, ty, az.entero(5, 9), '#2f7a3a');
      RW.circulo(g, tx - 2, ty - 2, az.entero(3, 6), '#4a9a4a');
    }

    // Muro de autopista con grafitis
    const cerca = capa(1);
    g = cerca.ctx;
    R(g, 0, 132, cerca.ancho, 46, '#a8a0b0');
    R(g, 0, 126, cerca.ancho, 7, '#c8c0d0');
    R(g, 0, 132, cerca.ancho, 2, '#88809a');
    for (let xx = 0; xx < cerca.ancho; xx += 80) R(g, xx, 133, 2, 44, '#88809a');
    for (let i = 0; i < 80; i++) {
      const sx = az.entero(0, cerca.ancho), sy = az.entero(136, 174);
      R(g, sx, sy, az.entero(4, 18), 1, 'rgba(90, 80, 110, 0.35)');
    }
    [[90, '#7a4ad8'], [610, '#5a3ad0'], [740, '#3a7ad8']].forEach((t2) => {
      let gx = t2[0], gy = 156;
      g.fillStyle = t2[1];
      for (let i = 0; i < 70; i++) { gx += az.entero(0, 2); gy += Math.round(Math.sin(i * 0.5) * 3); g.fillRect(gx, gy, 3, 2); }
    });
    RW.textoEstilo(g, 'WARAIRA REPANO', 250, 146, 'verde', 1, 'centro');
    R(g, 0, 176, cerca.ancho, 6, '#f2c230');
    for (let xx = 0; xx < cerca.ancho; xx += 24) R(g, xx, 176, 12, 6, '#2a2a36');
    RW.degradadoTramado(g, 0, 182, cerca.ancho, 34, ['#6a6a80', '#5a5a74', '#4a4a66']);
    for (let i = 0; i < 300; i++) R(g, az.entero(0, cerca.ancho), az.entero(183, 215), 1, 1, az() < 0.5 ? '#7a7a92' : '#3a3a52');

    const publico = crearPublico(55, 16, 0, 800, 132, ['#f0c29a', '#d9a07a', '#c18562', '#9c6a4a', '#7a4f36'],
      ['#d8323c', '#2b59c3', '#3a8a4a', '#f28c38', '#ffffff', '#6a4ad8'], 'montana');

    return {
      dibujar(ctx, camPx, t, animo, djs) {
        dibujarCapa(ctx, cielo, camPx);
        dibujarCapa(ctx, monte, camPx);
        dibujarCapa(ctx, ciudad, camPx);
        // Teleférico
        const oc = off(ciudad, camPx);
        const x0 = 560 + oc, y0 = 8, x1 = 120 + oc, y1 = 120;
        cable(ctx, x0, y0, x1, y1, 10, '#2a2a36');
        cable(ctx, x0, y0 + 4, x1, y1 + 4, 10, '#3a3a46');
        for (let i = 0; i < 2; i++) {
          const tt = ((t * 0.0011 + i / 2) % 1);
          const cx = x0 + (x1 - x0) * tt, cy = y0 + (y1 - y0) * tt + Math.sin(tt * Math.PI) * 10;
          R(ctx, cx, cy, 2, 8, '#2a2a36');
          R(ctx, cx - 9, cy + 8, 20, 15, '#1a0f26');
          R(ctx, cx - 8, cy + 9, 18, 13, '#d8323c');
          R(ctx, cx - 7, cy + 11, 16, 5, '#bfe4ff');
          R(ctx, cx - 8, cy + 20, 18, 2, '#9a1f2a');
        }
        // Guacamayas
        for (let i = 0; i < 3; i++) {
          const gx = ((t * (0.55 + i * 0.12) + i * 180) % 520) - 70;
          const gy = 40 + i * 16 + Math.sin(t * 0.04 + i * 2) * 8;
          const ala = Math.sin(t * 0.25 + i) > 0;
          const cuerpo = i === 1 ? '#2b7fd6' : '#e2322e';
          R(ctx, gx, gy, 10, 4, cuerpo);
          R(ctx, gx + 10, gy - 2, 4, 4, cuerpo); R(ctx, gx + 14, gy, 2, 2, '#f2e6c9');
          R(ctx, gx - 12, gy + 2, 12, 2, cuerpo); R(ctx, gx - 16, gy + 4, 6, 2, '#2b7fd6');
          if (ala) { R(ctx, gx + 2, gy - 8, 6, 8, '#ffcc3d'); R(ctx, gx + 2, gy - 10, 4, 2, '#2b7fd6'); }
          else { R(ctx, gx + 2, gy + 4, 6, 6, '#ffcc3d'); R(ctx, gx + 2, gy + 10, 4, 2, '#2b7fd6'); }
        }
        dibujarPublico(ctx, publico, camPx, 1, t, animo);
        dibujarCapa(ctx, cerca, camPx);
        tarimaDJ(ctx, 400 - Math.round(camPx), t, djs, '#6fbf5f');
      },
    };
  }

  RW.ESCENARIOS = [
    { id: 'barrio', nombre: 'EL BARRIO', lugar: 'CARACAS, VENEZUELA', musica: 'barrio', crear: crearBarrio, color: '#e74c6f' },
    { id: 'roques', nombre: 'LOS ROQUES', lugar: 'ARCHIPIÉLAGO CARIBEÑO', musica: 'roques', crear: crearRoques, color: '#39d0c0' },
    { id: 'avila', nombre: 'EL ÁVILA', lugar: 'WARAIRA REPANO, CARACAS', musica: 'avila', crear: crearAvila, color: '#6fbf5f' },
  ];

  const creados = {};
  const miniaturas = {};
  RW.escenario = function (id) {
    if (!creados[id]) {
      const datos = RW.ESCENARIOS.find((e) => e.id === id) || RW.ESCENARIOS[0];
      const base = datos.crear();
      creados[id] = {
        id: datos.id,
        datos,
        // Si hay una imagen real del escenario, se usa como fondo; si no, el dibujado con código
        dibujar(ctx, camPx, t, animo, djs) {
          const fondo = RW.arte && RW.arte.escenario(datos.id);
          if (!fondo) { base.dibujar(ctx, camPx, t, animo, djs); return; }
          const img = fondo.normal;
          const w = img.width / 2, h = img.height / 2;
          const sobra = Math.max(0, w - RW.ANCHO);
          const desp = Math.round((camPx / (MUNDO_PX - RW.ANCHO)) * sobra);
          ctx.drawImage(img, -desp, RW.ALTO - h, w, h);
          tarimaDJ(ctx, 400 - Math.round(camPx), t, djs, datos.color);
        },
      };
    }
    return creados[id];
  };

  RW.miniaturaEscenario = function (id, w, h) {
    const clave = id + w + 'x' + h;
    if (!miniaturas[clave]) {
      const grande = RW.crearCanvas(RW.ANCHO, RW.ALTO);
      const gctx = grande.getContext('2d');
      const djs = RW.PERSONAJES.slice(0, 2);
      RW.escenario(id).dibujar(gctx, (MUNDO_PX - RW.ANCHO) / 2, 120, 0.3, djs);
      const c = RW.crearCanvas(w, h);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(grande, 0, 0, RW.ANCHO, RW.ALTO, 0, 0, w, h);
      miniaturas[clave] = c;
    }
    return miniaturas[clave];
  };
})();
