// =====================================================================
// pantallas.js: todas las pantallas del juego (encendido, arranque,
// título, menú, selección, escenario, VS, combate, resultado, continuar,
// final, cómo jugar y opciones), en formato ancho de 384x216.
// =====================================================================
(function () {
  const RW = window.RW;
  const R = RW.rect;
  const E = () => RW.entrada;
  const W = () => RW.ANCHO;
  const OSCURO = '#1a0f26';
  const CX = 192;

  // ---------------- Utilidades de interfaz ----------------
  const ui = {};
  RW.ui = ui;

  let cieloTitulo = null;
  ui.fondoTitulo = function (ctx, t, oscuro) {
    if (!cieloTitulo) {
      cieloTitulo = RW.crearCanvas(RW.ANCHO, RW.ALTO);
      const g = cieloTitulo.getContext('2d');
      RW.degradadoTramado(g, 0, 0, RW.ANCHO, 130, ['#100828', '#24104e', '#4a1868', '#8a2470', '#d0446a', '#ff7a4a', '#ffc45a']);
      for (let i = 0; i < 60; i++) R(g, (i * 97) % 384, (i * 37) % 60, 1, 1, '#d8d0ff');
      for (let dy = -46; dy <= 46; dy++) {
        if (dy > 6 && dy % 6 < 2) continue;
        const dx = Math.floor(Math.sqrt(46 * 46 - dy * dy));
        R(g, 192 - dx, 124 + dy, dx * 2 + 1, 1, dy < -16 ? '#fff1a8' : dy < 8 ? '#ffd86b' : '#ff9a4a');
      }
      R(g, 0, 130, RW.ANCHO, 86, '#1a0838');
      for (let x = 0; x < RW.ANCHO; x++) {
        const y = 116 + Math.sin(x * 0.035) * 6 + Math.sin(x * 0.009 + 1) * 9;
        R(g, x, y, 1, 130 - y, '#3a1450');
      }
    }
    ctx.drawImage(cieloTitulo, 0, 0);
    const hor = 130;
    for (let i = 0; i < 14; i++) {
      const z = (i + (t * 0.02) % 1) / 14;
      R(ctx, 0, hor + Math.round(Math.pow(z, 2.2) * 86), RW.ANCHO, 1, i % 2 ? '#ff4a9a' : '#c03aa0');
    }
    for (let i = -14; i <= 14; i++) {
      const x0 = 192 + i * 8, x1 = 192 + i * 60;
      for (let j = 0; j < 44; j++) { const tt = j / 44; R(ctx, x0 + (x1 - x0) * tt, hor + tt * 86, 1, 2, '#8a2aa0'); }
    }
    [[22, 1], [362, -1]].forEach((p) => {
      for (let i = 0; i < 110; i++) R(ctx, p[0] + Math.sin(i / 110 * 1.6) * 12 * p[1], 216 - i, 6, 1, '#12061e');
      const cx = p[0] + Math.sin(1.6) * 12 * p[1] + 3, cy = 108;
      for (let h = 0; h < 8; h++) {
        const a = (h / 8) * Math.PI * 2 + Math.sin(t * 0.03 + h) * 0.08;
        for (let j = 0; j < 40; j++) R(ctx, cx + Math.cos(a) * j, cy + Math.sin(a) * j * 0.5 + (j * j) / 70, 3, 2, '#12061e');
      }
    });
    if (oscuro) { ctx.fillStyle = 'rgba(12, 4, 30, ' + oscuro + ')'; ctx.fillRect(0, 0, RW.ANCHO, RW.ALTO); }
  };

  // Logotipo con trazo de pincel rosado
  ui.logo = function (ctx, x, y, grande) {
    const e = grande ? 6 : 4;
    const ancho = RW.anchoTexto('RAWAYANA', e);
    ctx.fillStyle = '#ff4a8a';
    ctx.beginPath();
    ctx.moveTo(x - ancho / 2 - 10, y + 7 * e + 4);
    ctx.lineTo(x + ancho / 2 + 16, y + 7 * e - 2);
    ctx.lineTo(x + ancho / 2 + 6, y + 7 * e + 8);
    ctx.lineTo(x - ancho / 2 - 4, y + 7 * e + 12);
    ctx.fill();
    RW.textoEstilo(ctx, 'RAWAYANA', x, y, 'oro', e, 'centro');
    RW.textoEstilo(ctx, 'DUELO DE BAILE', x, y + 7 * e + 14, 'blanco', grande ? 3 : 2, 'centro');
  };

  // Título de sección con banderitas de cuadros y trazo rosado
  ui.titulo = function (ctx, txt, y) {
    const ancho = RW.anchoTexto(txt, 3);
    ctx.fillStyle = '#ff4a8a';
    ctx.beginPath();
    ctx.moveTo(CX - ancho / 2 - 12, y + 24);
    ctx.lineTo(CX + ancho / 2 + 18, y + 19);
    ctx.lineTo(CX + ancho / 2 + 8, y + 27);
    ctx.lineTo(CX - ancho / 2 - 6, y + 30);
    ctx.fill();
    RW.textoEstilo(ctx, txt, CX, y, 'oro', 3, 'centro');
    const bandera = (x) => {
      for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) R(ctx, x + i * 5, y + 4 + j * 5, 5, 5, (i + j) % 2 ? '#ffffff' : '#1a0f26');
    };
    bandera(CX - ancho / 2 - 46);
    bandera(CX + ancho / 2 + 18);
  };

  ui.panel = function (ctx, x, y, w, h, borde) {
    R(ctx, x - 2, y - 2, w + 4, h + 4, OSCURO);
    R(ctx, x, y, w, h, 'rgba(26, 14, 60, 0.92)');
    R(ctx, x, y, w, 2, borde || '#ffd24a');
    R(ctx, x, y + h - 2, w, 2, borde || '#ffd24a');
    R(ctx, x, y, 2, h, borde || '#ffd24a');
    R(ctx, x + w - 2, y, 2, h, borde || '#ffd24a');
  };

  // Oscurece arriba y abajo para que se lea el texto sobre los fondos
  ui.velo = function (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, RW.ALTO);
    g.addColorStop(0, 'rgba(14, 6, 40, 0.75)');
    g.addColorStop(0.35, 'rgba(14, 6, 40, 0.15)');
    g.addColorStop(0.75, 'rgba(14, 6, 40, 0.2)');
    g.addColorStop(1, 'rgba(14, 6, 40, 0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, RW.ANCHO, RW.ALTO);
  };

  ui.marco = function (ctx, x, y, w, h, color, grosor) {
    grosor = grosor || 1;
    for (let i = 0; i < grosor; i++) {
      R(ctx, x - 1 - i, y - 1 - i, w + 2 + i * 2, 1, color);
      R(ctx, x - 1 - i, y + h + i, w + 2 + i * 2, 1, color);
      R(ctx, x - 1 - i, y - 1 - i, 1, h + 2 + i * 2, color);
      R(ctx, x + w + i, y - 1 - i, 1, h + 2 + i * 2, color);
    }
  };

  // Bloques verdes de estadísticas (como en la referencia)
  ui.bloques = function (ctx, x, y, n, max) {
    for (let i = 0; i < max; i++) {
      R(ctx, x + i * 11, y, 10, 8, OSCURO);
      if (i < n) { R(ctx, x + i * 11 + 1, y + 1, 8, 6, '#7af03a'); R(ctx, x + i * 11 + 1, y + 1, 8, 2, '#c8ff8a'); }
      else { R(ctx, x + i * 11 + 1, y + 1, 8, 6, '#2a2a40'); R(ctx, x + i * 11 + 2, y + 2, 6, 4, '#1a1a2a'); }
    }
  };

  ui.parale = function (ctx, x, y, w, h, incl, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + incl, y); ctx.lineTo(x + w + incl, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
  };

  ui.placaNombre = function (ctx, x, y, nombre, color) {
    ui.parale(ctx, x - 2, y - 2, 124, 26, 10, color || '#7af03a');
    ui.parale(ctx, x + 1, y + 1, 118, 20, 9, '#120a20');
    RW.textoEstilo(ctx, nombre, x + 64, y + 7, 'blanco', 2, 'centro');
  };

  // Lista de movimientos de un personaje
  ui.listaPasos = function (ctx, pj, y) {
    const e = pj.especiales;
    RW.textoEstilo(ctx, 'PASOS DE ' + pj.nombre, CX, y, 'oro', 2, 'centro');
    const filas = [
      ['↓↘→ + A/B', e.proyectil.nombre],
      ['→↓↘ + A/B', e.antiaereo.nombre],
      ['↓↙← + R', e.giro.nombre],
      ['L (UN NIVEL DE SABROSURA)', e.super.nombre],
      ['→ + B (PEGADO)', 'VUELTA EN PAREJA'],
      ['→→ / ←←', 'DESLIZAR / MOONWALK'],
      ['L (SIN NIVEL)', 'POSE: +SABROSURA'],
    ];
    filas.forEach((f, i) => {
      const fy = y + 28 + i * 20;
      R(ctx, 16, fy - 3, 352, 16, i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)');
      RW.texto(ctx, f[0], 22, fy + 1, '#ffd24a', { contorno: OSCURO });
      RW.texto(ctx, f[1], 362, fy + 1, '#ffffff', { alinear: 'der', contorno: OSCURO });
    });
  };

  function menuVertical(ctx, ops, sel, x, y, ancho, t) {
    ops.forEach((o, i) => {
      const s = i === sel;
      if (s) {
        ui.parale(ctx, x - 6, y + i * 18 - 4, ancho, 16, 4, 'rgba(255, 74, 138, 0.55)');
        RW.texto(ctx, '▶', x - 2 + (t % 30 < 15 ? 0 : 2), y + i * 18, '#ffd24a', { contorno: OSCURO });
      }
      RW.texto(ctx, o, x + 12, y + i * 18, s ? '#ffffff' : '#c8b8f0', { contorno: OSCURO });
    });
  }

  function aceptar() { return E().aceptar(); }
  function atras() { return E().atras(); }

  // =====================================================================
  // Escenas
  // =====================================================================
  const S = {};
  RW.escenas = S;

  S.encendido = {
    entrar() { this.t = 0; },
    actualizar() {
      this.t++;
      if (E().algoPulsado) RW.juego.encender();
    },
    dibujar(ctx) {
      R(ctx, 0, 0, W(), RW.ALTO, '#0c0816');
      if (this.t % 60 < 40) RW.texto(ctx, 'PRESIONA CUALQUIER BOTÓN', CX, 100, '#8f86b8', { alinear: 'centro' });
      RW.texto(ctx, 'PARA ENCENDER', CX, 114, '#5a5280', { alinear: 'centro' });
    },
  };

  S.arranque = {
    entrar() { this.t = 0; RW.audio.detener(); },
    actualizar() {
      this.t++;
      if (this.t === 70) RW.audio.musica('arranque');
      if (this.t > 170 || (this.t > 20 && E().algoPulsado)) RW.juego.cambiar(S.titulo);
    },
    dibujar(ctx) {
      R(ctx, 0, 0, W(), RW.ALTO, '#f4f0ff');
      const y = Math.min(76, -30 + this.t * 2);
      RW.texto(ctx, 'RAWAYANA', CX, y, '#4b3bb0', { escala: 4, alinear: 'centro' });
      if (this.t > 70) {
        const colores = ['#e74c6f', '#ffcc3d', '#39d0c0', '#6fa8ff'];
        colores.forEach((c, i) => { if (this.t > 70 + i * 6) RW.circulo(ctx, 162 + i * 20, 128, 6, c); });
        RW.texto(ctx, '16 BITS DE SABROSURA', CX, 148, '#6a5ad1', { alinear: 'centro' });
      }
    },
  };

  S.titulo = {
    entrar() { this.t = 0; RW.audio.musica('titulo'); },
    actualizar() {
      this.t++;
      if (E().pulsado('START') || E().pulsado('A')) { RW.audio.sfx('aceptar'); RW.juego.cambiar(S.menu); }
    },
    dibujar(ctx) {
      // Caracas al atardecer de fondo, moviéndose despacio
      RW.escenario('barrio').dibujar(ctx, 208 + Math.sin(this.t * 0.004) * 200, this.t, 0.5, null);
      ui.velo(ctx);
      ui.logo(ctx, CX, 8, true);
      // Los cuatro integrantes en tarjetas, bailando por turnos
      const fondos = ['#c85a8a', '#3a6ad8', '#7a4ac8', '#3a7ad8'];
      RW.PERSONAJES.forEach((pj, i) => {
        const turno = Math.floor(this.t / 20) % 4 === i;
        const x = 52 + i * 74, y = 96 - (turno ? 4 : 0);
        ui.parale(ctx, x - 3, y - 3, 70, 72, 6, OSCURO);
        ui.parale(ctx, x - 1, y - 1, 66, 68, 5, '#e8e4f8');
        ui.parale(ctx, x + 1, y + 1, 62, 64, 4, fondos[i]);
        ctx.save();
        ctx.beginPath(); ctx.rect(x + 1, y + 1, 66, 64); ctx.clip();
        ctx.drawImage(RW.sprites.retrato(pj, 0, turno ? 'feliz' : 'normal', 64), x + 2, y + 1);
        ctx.restore();
        RW.textoEstilo(ctx, pj.nombre, x + 34, y + 70, turno ? 'oro' : 'blanco', 1, 'centro');
      });
      if (this.t % 50 < 36) {
        ui.parale(ctx, 104, 182, 176, 18, 8, OSCURO);
        ui.parale(ctx, 106, 184, 172, 14, 7, '#ff4a8a');
        RW.textoEstilo(ctx, 'PRESIONA START', CX + 4, 188, 'blanco', 1, 'centro');
      }
      RW.texto(ctx, 'JUEGO DE FANS · NO OFICIAL', CX, 206, '#e8dcff', { alinear: 'centro', contorno: OSCURO });
    },
  };

  const OPCIONES_MENU = [
    { txt: 'ARCADE', desc: 'Baila contra los otros tres, del barrio hasta El Ávila.', modo: 'arcade' },
    { txt: 'VS CPU', desc: 'Un duelo libre contra la CPU: escoges a los dos y la pista.', modo: 'vscpu' },
    { txt: '2 JUGADORES', desc: 'Duelo entre dos personas en el mismo teclado o con dos mandos.', modo: '2j' },
    { txt: 'ENTRENAMIENTO', desc: 'Practica los pasos y combos sin reloj contra un muñeco.', modo: 'entreno' },
    { txt: 'CÓMO JUGAR', desc: 'Controles, reglas del duelo y la lista de pasos de cada uno.' },
    { txt: 'OPCIONES', desc: 'Dificultad, rondas, tiempo, volumen, locutor y filtro LCD.' },
  ];
  S.menu = {
    entrar() { this.t = 0; this.sel = this.sel || 0; RW.audio.musica('titulo'); RW.entrada.dosJugadores = false; },
    actualizar() {
      this.t++;
      const n = OPCIONES_MENU.length;
      if (E().repetir('abajo')) { this.sel = (this.sel + 1) % n; RW.audio.sfx('menu'); }
      if (E().repetir('arriba')) { this.sel = (this.sel + n - 1) % n; RW.audio.sfx('menu'); }
      if (atras()) { RW.audio.sfx('atras'); RW.juego.cambiar(S.titulo); return; }
      if (aceptar()) {
        RW.audio.sfx('aceptar');
        const o = OPCIONES_MENU[this.sel];
        if (o.modo) {
          RW.juego.modo = o.modo;
          RW.entrada.dosJugadores = o.modo === '2j';
          RW.juego.cambiar(S.seleccion);
        } else if (o.txt === 'CÓMO JUGAR') RW.juego.cambiar(S.comoJugar);
        else RW.juego.cambiar(S.opciones);
      }
    },
    dibujar(ctx) {
      // El Ávila y Caracas de fondo, como en la pantalla de selección
      RW.escenario('avila').dibujar(ctx, 120 + Math.sin(this.t * 0.003) * 110, this.t, 0.3, null);
      const g = ctx.createLinearGradient(0, 0, 250, 0);
      g.addColorStop(0, 'rgba(14, 6, 40, 0.92)');
      g.addColorStop(1, 'rgba(14, 6, 40, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 250, RW.ALTO);
      // Logo pequeño
      ctx.fillStyle = '#ff4a8a';
      ctx.beginPath(); ctx.moveTo(14, 36); ctx.lineTo(160, 31); ctx.lineTo(152, 39); ctx.lineTo(18, 42); ctx.fill();
      RW.textoEstilo(ctx, 'RAWAYANA', 16, 10, 'oro', 3);
      RW.textoEstilo(ctx, 'DUELO DE BAILE', 18, 42, 'blanco', 1);
      // Opciones en barras inclinadas
      OPCIONES_MENU.forEach((o, i) => {
        const s = i === this.sel;
        const x = 14 + (s ? 10 + Math.round(Math.sin(this.t * 0.15) * 1) : 0), y = 60 + i * 22;
        ui.parale(ctx, x - 2, y - 2, 178, 22, 8, OSCURO);
        if (s) {
          const gr = ctx.createLinearGradient(x, 0, x + 180, 0);
          gr.addColorStop(0, '#ff4a8a'); gr.addColorStop(1, '#ffb83a');
          ui.parale(ctx, x, y, 174, 18, 7, gr);
          ui.parale(ctx, x, y, 174, 3, 1, 'rgba(255,255,255,0.45)');
        } else {
          ui.parale(ctx, x, y, 174, 18, 7, 'rgba(58, 36, 110, 0.92)');
        }
        RW.textoEstilo(ctx, o.txt, x + 14, y + 6, s ? 'blanco' : 'blanco', s ? 2 : 1);
        if (s) RW.texto(ctx, '▶', x - 10, y + 6, '#ffd24a', { contorno: OSCURO });
      });
      // A la derecha, el integrante que "presenta" cada opción
      const pj = RW.PERSONAJES[this.sel % 4];
      const bote = Math.round(Math.sin(this.t * 0.12) * 2);
      ctx.drawImage(RW.sprites.retrato(pj, 0, 'feliz', 128), 252, 54 + bote);
      ui.placaNombre(ctx, 252, 176, pj.nombre, pj.color);
      R(ctx, 0, 204, W(), 12, 'rgba(12,4,30,0.88)');
      RW.texto(ctx, OPCIONES_MENU[this.sel].desc.toUpperCase(), CX, 207, '#e8dcff', { alinear: 'centro' });
    },
  };

  // ---------- Selección de personaje (estilo de la referencia) ----------
  S.seleccion = {
    entrar() {
      this.t = 0;
      this.dos = RW.juego.modo === '2j';
      this.cursor = [0, 3];
      this.listo = [false, false];
      this.fase = 0;
      this.salida = 0;
      this.tListo = [0, 0];
      RW.audio.musica('seleccion');
    },
    controlador(i) { return this.dos ? i : 0; },
    cursorActivo(i) {
      if (this.dos) return !this.listo[i];
      if (RW.juego.modo === 'arcade') return i === 0 && !this.listo[0];
      return i === this.fase && !this.listo[i];
    },
    visible(i) {
      const modo = RW.juego.modo;
      if (i === 0) return true;
      if (modo === 'arcade') return false;
      if (this.dos) return true;
      return this.fase === 1;
    },
    actualizar() {
      this.t++;
      const modo = RW.juego.modo;
      for (let i = 0; i < 2; i++) {
        this.tListo[i]++;
        if (!this.cursorActivo(i)) continue;
        const m = RW.entrada.j[this.controlador(i)];
        let c = this.cursor[i];
        if (m.repetir('der')) c = (c + 1) % 4;
        else if (m.repetir('izq')) c = (c + 3) % 4;
        if (c !== this.cursor[i]) { this.cursor[i] = c; RW.audio.sfx('menu'); }
        if (m.pulsado('A') || m.pulsado('START')) {
          this.listo[i] = true;
          this.tListo[i] = 0;
          RW.audio.sfx('aceptar');
          RW.audio.locutor(RW.PERSONAJES[c].nombre.toLowerCase());
          if (!this.dos && modo !== 'arcade' && i === 0) this.fase = 1;
        }
      }
      for (let i = 0; i < 2; i++) {
        const m = RW.entrada.j[i];
        if (!(m.pulsado('B') || m.pulsado('ATRAS'))) continue;
        if (!this.dos && i === 1) continue;
        RW.audio.sfx('atras');
        if (this.dos) {
          if (this.listo[i]) this.listo[i] = false;
          else if (i === 0) { RW.juego.cambiar(S.menu); return; }
        } else if (this.fase === 1 && !this.listo[1]) { this.fase = 0; this.listo[0] = false; }
        else if (this.listo[1]) this.listo[1] = false;
        else if (this.listo[0]) this.listo[0] = false;
        else { RW.juego.cambiar(S.menu); return; }
      }
      const todos = modo === 'arcade' ? this.listo[0] : this.listo[0] && this.listo[1];
      if (todos) {
        this.salida++;
        if (this.salida > 45) {
          const J = RW.juego;
          J.p1 = RW.PERSONAJES[this.cursor[0]].id;
          if (modo === 'arcade') { J.iniciarArcade(J.p1); J.cambiar(S.vs); }
          else { J.p2 = RW.PERSONAJES[this.cursor[1]].id; J.cambiar(S.escenario); }
        }
      } else this.salida = 0;
    },
    dibujar(ctx) {
      const esc = RW.escenario('avila');
      esc.dibujar(ctx, 200 + Math.sin(this.t * 0.004) * 120, this.t, 0.2, null);
      ctx.fillStyle = 'rgba(20, 10, 60, 0.25)';
      ctx.fillRect(0, 0, W(), RW.ALTO);
      const modo = RW.juego.modo;
      const titulo = modo === 'entreno' && this.fase === 1 ? 'ESCOGE AL MUÑECO' : (!this.dos && this.fase === 1 ? 'ESCOGE A TU RIVAL' : 'ESCOGE TU BAILARÍN');
      ui.titulo(ctx, titulo, 8);
      // Tarjetas
      RW.PERSONAJES.forEach((pj, i) => {
        const x = 62 + i * 68, y = 44;
        const fondos = ['#c85a8a', '#3a6ad8', '#7a4ac8', '#3a7ad8'];
        R(ctx, x - 2, y - 2, 64, 68, OSCURO);
        R(ctx, x - 1, y - 1, 62, 66, '#e8e4f8');
        R(ctx, x + 1, y + 1, 58, 62, fondos[i]);
        ctx.save();
        ctx.beginPath(); ctx.rect(x + 1, y + 1, 58, 62); ctx.clip();
        ctx.drawImage(RW.sprites.retrato(pj, 0, 'normal', 64), x - 2, y);
        ctx.restore();
      });
      for (let i = 1; i >= 0; i--) {
        if (!this.visible(i)) continue;
        const x = 62 + this.cursor[i] * 68, y = 44;
        const color = i === 0 ? '#7af03a' : '#ff4a6a';
        const brilla = this.listo[i] || this.t % 20 < 14;
        if (brilla) ui.marco(ctx, x - 1, y - 1, 62, 66, color, 3);
        const tri = (ty, abajo) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(x + 22, ty); ctx.lineTo(x + 38, ty); ctx.lineTo(x + 30, ty + (abajo ? -9 : 9));
          ctx.fill();
        };
        const sube = Math.round(Math.sin(this.t * 0.15) * 1.5);
        if (i === 0) { tri(y - 14 + sube, false); tri(y + 78 - sube, true); }
        else { RW.textoEstilo(ctx, this.dos ? '2P' : (modo === 'entreno' ? 'MUÑ.' : 'CPU'), x + 30, y + 70, 'rosa', 1, 'centro'); }
      }
      // Información de cada lado: busto grande, placa con el nombre y estadísticas
      const lados = [0, 1].filter((i) => this.visible(i));
      const solo = lados.length === 1;
      lados.forEach((i) => {
        const pj = RW.PERSONAJES[this.cursor[i]];
        const pal = i === 1 && this.cursor[0] === this.cursor[1] ? 1 : 0;
        const izq = i === 0;
        const expr = this.listo[i] ? 'feliz' : 'normal';
        const busto = RW.sprites.retrato(pj, pal, expr, 104);
        const bote = this.listo[i] && this.tListo[i] < 20 ? -Math.round(Math.sin(this.tListo[i] * 0.3) * 4) : 0;
        if (izq) ctx.drawImage(busto, -4, 112 + bote);
        else { ctx.save(); ctx.translate(W() + 4, 112 + bote); ctx.scale(-1, 1); ctx.drawImage(busto, 0, 0); ctx.restore(); }
        const px = solo ? 128 : (izq ? 98 : 192);
        ui.placaNombre(ctx, solo ? px : px - 4, 118, pj.nombre, izq ? '#7af03a' : '#ff4a6a');
        const b = pj.barras;
        const filas = solo
          ? [['POTENCIA', b.potencia], ['TÉCNICA', b.tecnica], ['VELOCIDAD', b.velocidad], ['RESISTENCIA', b.flow]]
          : [['POT.', b.potencia], ['TÉC.', b.tecnica], ['VEL.', b.velocidad], ['RES.', b.flow]];
        const ancho = solo ? 140 : 96;
        R(ctx, px - 4, 146, ancho, 46, 'rgba(18, 10, 32, 0.82)');
        filas.forEach((f, k) => {
          RW.texto(ctx, f[0], px, 150 + k * 10, '#ffffff', { contorno: OSCURO });
          ui.bloques(ctx, px + (solo ? 72 : 26), 150 + k * 10, Math.round(f[1] * 6 / 5), 6);
        });
        if (this.listo[i]) RW.textoEstilo(ctx, '¡LISTO!', px + ancho / 2 - 4, 132 + 64, 'verde', 1, 'centro');
      });
      if (modo === 'arcade') {
        RW.textoEstilo(ctx, '¿RIVALES?', 326, 128, 'rosa', 2, 'centro');
        RW.texto(ctx, 'LOS OTROS TRES', 326, 152, '#ffffff', { alinear: 'centro', contorno: OSCURO });
        RW.texto(ctx, 'TE ESPERAN', 326, 164, '#ffffff', { alinear: 'centro', contorno: OSCURO });
      }
      // Cinta con la historia del integrante
      const activo = this.cursorActivo(1) ? 1 : 0;
      const pj = RW.PERSONAJES[this.cursor[activo]];
      R(ctx, 0, 204, W(), 12, '#120a24');
      R(ctx, 0, 204, W(), 1, pj.color);
      if (this.pjCinta !== pj.id) { this.pjCinta = pj.id; this.tCinta = 0; }
      this.tCinta = (this.tCinta || 0) + 1;
      const cinta = (pj.nombreCompleto + ' · ' + pj.rol + ' · ' + pj.bio + '   ♪   ').toUpperCase();
      const recorrido = RW.anchoTexto(cinta) + W();
      RW.texto(ctx, cinta, W() - (Math.floor(this.tCinta * 0.8) % recorrido), 207, '#ffffff');
    },
  };

  // ---------- Selección de escenario ----------
  S.escenario = {
    entrar() { this.t = 0; this.sel = 0; },
    actualizar() {
      this.t++;
      const n = RW.ESCENARIOS.length;
      if (E().repetir('der')) { this.sel = (this.sel + 1) % n; RW.audio.sfx('menu'); }
      if (E().repetir('izq')) { this.sel = (this.sel + n - 1) % n; RW.audio.sfx('menu'); }
      if (atras()) { RW.audio.sfx('atras'); RW.juego.cambiar(S.seleccion); return; }
      if (aceptar()) {
        RW.audio.sfx('aceptar');
        RW.juego.escenario = RW.ESCENARIOS[this.sel].id;
        RW.audio.locutor(RW.ESCENARIOS[this.sel].nombre.toLowerCase());
        RW.juego.cambiar(S.vs);
      }
    },
    dibujar(ctx) {
      const e = RW.ESCENARIOS[this.sel];
      const djs = RW.PERSONAJES.filter((p) => p.id !== RW.juego.p1 && p.id !== RW.juego.p2).slice(0, 2);
      RW.escenario(e.id).dibujar(ctx, 208 + Math.sin(this.t * 0.01) * 160, this.t, 0.4, djs);
      ctx.fillStyle = 'rgba(12, 4, 30, 0.5)';
      ctx.fillRect(0, 0, W(), RW.ALTO);
      ui.titulo(ctx, 'ESCOGE LA PISTA', 8);
      RW.ESCENARIOS.forEach((es, i) => {
        const x = 16 + i * 122, s = i === this.sel, y = s ? 52 : 58;
        R(ctx, x - 3, y - 3, 118, 92, s ? es.color : '#2a1a40');
        R(ctx, x - 1, y - 1, 114, 88, OSCURO);
        ctx.drawImage(RW.miniaturaEscenario(es.id, 112, 63), x, y);
        RW.textoEstilo(ctx, es.nombre, x + 56, y + 71, s ? 'oro' : 'blanco', 1, 'centro');
        if (i === 0) { ui.parale(ctx, x, y + 2, 66, 12, 3, '#e74c6f'); RW.texto(ctx, 'PRINCIPAL', x + 6, y + 4, '#ffffff'); }
      });
      RW.textoEstilo(ctx, e.lugar, CX, 160, 'blanco', 1, 'centro');
      RW.texto(ctx, '← → ESCOGER     A: ACEPTAR     B: VOLVER', CX, 196, '#c8b8f0', { alinear: 'centro', contorno: OSCURO });
    },
  };

  // ---------- Pantalla VS ----------
  S.vs = {
    entrar() {
      this.t = 0;
      RW.audio.detener();
      RW.audio.sfx('ronda');
      const J = RW.juego;
      this.p1 = RW.personaje(J.p1);
      this.p2 = RW.personaje(J.p2);
      setTimeout(() => RW.audio.locutor(this.p1.nombre.toLowerCase() + ' contra ' + this.p2.nombre.toLowerCase()), 300);
    },
    actualizar() {
      this.t++;
      if (this.t === 30) RW.audio.sfx('pelea');
      if (this.t > 160 || (this.t > 40 && aceptar())) RW.juego.iniciarCombate();
    },
    dibujar(ctx) {
      const t = this.t;
      for (let y = 0; y < RW.ALTO; y++) {
        const corte = CX + (y - 108) * 0.4;
        R(ctx, 0, y, corte, 1, RW.oscurecer('#e8642a', 0.25));
        R(ctx, corte, y, W() - corte, 1, RW.oscurecer('#2a5ad8', 0.25));
      }
      for (let i = 0; i < 16; i++) {
        const y = (i * 14 + t * 3) % RW.ALTO;
        R(ctx, 0, y, 170, 2, 'rgba(255,255,255,0.08)');
        R(ctx, 214, RW.ALTO - y, 170, 2, 'rgba(255,255,255,0.08)');
      }
      const entra = Math.min(1, t / 14);
      const x1 = Math.round(-140 + entra * 158), x2 = Math.round(W() + 12 - entra * 158);
      const pal2 = this.p1.id === this.p2.id ? 1 : 0;
      ctx.drawImage(RW.sprites.retrato(this.p1, 0, 'normal', 128), x1, 26);
      ctx.save();
      ctx.translate(x2 + 128, 26);
      ctx.scale(-1, 1);
      ctx.drawImage(RW.sprites.retrato(this.p2, pal2, 'normal', 128), 0, 0);
      ctx.restore();
      RW.textoEstilo(ctx, this.p1.nombre, x1 + 64, 160, 'oro', 3, 'centro');
      RW.textoEstilo(ctx, this.p2.nombre, x2 + 64, 160, 'oro', 3, 'centro');
      if (t > 14) RW.textoEstilo(ctx, 'VS', CX, t < 22 ? 72 : 78, 'rosa', t < 22 ? 7 : 6, 'centro');
      const e = RW.ESCENARIOS.find((x) => x.id === RW.juego.escenario);
      RW.textoEstilo(ctx, 'PISTA: ' + e.nombre, CX, 190, 'blanco', 1, 'centro');
      if (RW.juego.modo === 'arcade' && RW.juego.arcade) {
        RW.textoEstilo(ctx, 'RIVAL ' + (RW.juego.arcade.indice + 1) + ' DE ' + RW.juego.arcade.rivales.length, CX, 202, 'oro', 1, 'centro');
      }
      if (t < 6) { ctx.fillStyle = 'rgba(255,255,255,' + (1 - t / 6) + ')'; ctx.fillRect(0, 0, W(), RW.ALTO); }
    },
  };

  S.combate = {
    entrar() {},
    actualizar() { if (this.c) this.c.actualizar(); },
    dibujar(ctx) { if (this.c) this.c.dibujar(ctx); },
  };

  // ---------- Resultado ----------
  S.resultado = {
    entrar() {
      this.t = 0;
      const r = RW.juego.ultimoResultado;
      this.r = r;
      if (r.ganador >= 0) {
        this.ganador = RW.personaje(r.ganador === 0 ? r.p1 : r.p2);
        this.perdedor = RW.personaje(r.ganador === 0 ? r.p2 : r.p1);
        this.palG = r.ganador === 1 && r.p1 === r.p2 ? 1 : 0;
        this.palP = r.ganador === 0 && r.p1 === r.p2 ? 1 : 0;
        this.frase = RW.elegir(this.ganador.frases);
      }
    },
    actualizar() {
      this.t++;
      if (this.t > 30 && aceptar()) { RW.audio.sfx('aceptar'); RW.juego.despuesDelResultado(); }
    },
    dibujar(ctx) {
      ui.fondoTitulo(ctx, this.t, 0.55);
      if (this.r.ganador < 0) {
        RW.textoEstilo(ctx, 'EMPATE', CX, 90, 'azul', 5, 'centro');
      } else {
        const g = this.ganador;
        ui.parale(ctx, 8, 12, 128, 128, 8, OSCURO);
        ui.parale(ctx, 10, 14, 122, 124, 7, '#ffffff');
        ui.parale(ctx, 12, 16, 118, 120, 6, g.color);
        ctx.save(); ctx.beginPath(); ctx.rect(12, 16, 124, 120); ctx.clip();
        ctx.drawImage(RW.sprites.retrato(g, this.palG, 'feliz', 128), 8, 10);
        ctx.restore();
        R(ctx, 300, 70, 68, 68, OSCURO);
        R(ctx, 302, 72, 64, 64, '#3a2a50');
        ctx.drawImage(RW.sprites.retrato(this.perdedor, this.palP, 'derrota', 64), 302, 72);
        RW.textoEstilo(ctx, '¡' + g.nombre + ' GANA!', 148, 26, 'oro', 3);
        if (this.r.perfecto) RW.textoEstilo(ctx, '¡DUELO PERFECTO!', 150, 56, 'azul', 1);
        ui.panel(ctx, 10, 150, 364, 42, '#ffffff');
        const lineas = RW.partirTexto('"' + this.frase.toUpperCase() + '"', 344);
        lineas.slice(0, 3).forEach((l, i) => RW.texto(ctx, l, 20, 158 + i * 11, '#ffffff', { contorno: OSCURO }));
      }
      if (this.t > 30 && this.t % 40 < 28) RW.textoEstilo(ctx, 'PRESIONA A', CX, 202, 'blanco', 1, 'centro');
    },
  };

  // ---------- Continuar (arcade) ----------
  S.continuar = {
    entrar() { this.t = 0; this.cuenta = 9; RW.audio.musica('derrota'); },
    actualizar() {
      this.t++;
      if (this.cuenta >= 0 && this.t % 60 === 0) {
        this.cuenta--;
        RW.audio.sfx('cuenta');
        if (this.cuenta >= 0) RW.audio.locutor(String(this.cuenta));
      }
      if (this.cuenta >= 0 && (E().pulsado('START') || E().pulsado('A'))) {
        RW.audio.sfx('aceptar');
        RW.audio.locutor('¡Otra vez!');
        RW.juego.cambiar(S.vs);
        return;
      }
      if (this.cuenta >= 0 && E().pulsado('B')) { this.cuenta--; this.t = 1; RW.audio.sfx('cuenta'); }
      if (this.cuenta < 0 && this.t % 60 > 50) RW.juego.cambiar(S.titulo);
    },
    dibujar(ctx) {
      R(ctx, 0, 0, W(), RW.ALTO, '#0c0816');
      const pj = RW.personaje(RW.juego.p1);
      if (this.cuenta >= 0) {
        ctx.drawImage(RW.sprites.retrato(pj, 0, 'derrota', 112), 30, 50);
        RW.textoEstilo(ctx, '¿CONTINUAR?', 250, 60, 'oro', 3, 'centro');
        RW.textoEstilo(ctx, String(this.cuenta), 250, 110, 'rosa', 6, 'centro');
        RW.texto(ctx, 'START: SÍ   B: MÁS RÁPIDO', 250, 190, '#c8b8f0', { alinear: 'centro' });
      } else {
        RW.textoEstilo(ctx, 'SE ACABÓ', CX, 80, 'rosa', 4, 'centro');
        RW.textoEstilo(ctx, 'LA FIESTA', CX, 120, 'rosa', 4, 'centro');
      }
    },
  };

  // ---------- Final del arcade ----------
  const TEXTO_FINAL = [
    '¡LO LOGRASTE!', '',
    'DEL BARRIO A LOS ROQUES', 'Y DE LOS ROQUES AL ÁVILA,', 'NADIE TE AGUANTÓ EL PASO.', '',
    'LA BANDA SE JUNTÓ OTRA VEZ', 'PARA EL AFTER MÁS GRANDE', 'QUE HA VISTO CARACAS.', '',
    '¿DÓNDE ES EL AFTER?', '¡AQUÍ MISMO, MI PANA!', '', '',
    'RAWAYANA: DUELO DE BAILE', 'UN JUEGO DE FANS, HECHO', 'CON CARIÑO PARA LA BANDA.', '',
    'MÚSICA, ARTE Y CÓDIGO', 'ORIGINALES EN 16 BITS.', '', '',
    '¡GRACIAS POR JUGAR!',
  ];
  S.final = {
    entrar() { this.t = 0; RW.audio.musica('titulo'); RW.audio.locutor('¡Lo lograste!'); },
    actualizar() {
      this.t++;
      if ((this.t > 60 && aceptar()) || this.t * 0.3 > TEXTO_FINAL.length * 12 + 200) RW.juego.cambiar(S.titulo);
    },
    dibujar(ctx) {
      RW.escenario('barrio').dibujar(ctx, 208, this.t, 1, null);
      ctx.fillStyle = 'rgba(12, 4, 30, 0.3)';
      ctx.fillRect(0, 0, W(), RW.ALTO);
      const P = RW.POSES;
      RW.PERSONAJES.forEach((pj, i) => {
        const t = this.t + i * 13;
        const poses = [P.q1, P.q2, P.q3, P.q4, P.victoria1, RW.posePj(pj.id, 'victoria3'), P.victoria2, P.provocar2];
        const x = 66 + i * 84;
        RW.sprites.sombra(ctx, x, RW.PISO, 44);
        RW.sprites.dibujar(ctx, pj, poses[Math.floor(t / 10) % poses.length], 0, x, RW.PISO, i < 2 ? 1 : -1);
      });
      const desp = this.t * 0.3;
      R(ctx, 92, 0, 200, 76, 'rgba(12, 4, 30, 0.6)');
      ctx.save();
      ctx.beginPath(); ctx.rect(92, 0, 200, 76); ctx.clip();
      TEXTO_FINAL.forEach((l, i) => {
        const y = 80 + i * 12 - desp;
        if (y < -12 || y > 84) return;
        const destacado = l.startsWith('¡') || l.startsWith('¿');
        RW.texto(ctx, l, CX, y, destacado ? '#ffd24a' : '#ffffff', { alinear: 'centro', contorno: OSCURO });
      });
      ctx.restore();
    },
  };

  // ---------- Cómo jugar ----------
  S.comoJugar = {
    entrar() { this.t = 0; this.pag = 0; },
    paginas() { return 3 + RW.PERSONAJES.length; },
    actualizar() {
      this.t++;
      const n = this.paginas();
      if (E().repetir('der') || E().pulsado('A')) { this.pag = (this.pag + 1) % n; RW.audio.sfx('menu'); }
      if (E().repetir('izq')) { this.pag = (this.pag + n - 1) % n; RW.audio.sfx('menu'); }
      if (E().pulsado('B') || E().pulsado('ATRAS') || E().pulsado('START')) { RW.audio.sfx('atras'); RW.juego.cambiar(S.menu); }
    },
    dibujar(ctx) {
      ui.fondoTitulo(ctx, this.t, 0.78);
      const p = this.pag;
      const tabla = (filas, y0) => filas.forEach((f, i) => {
        const fy = y0 + i * 18;
        R(ctx, 16, fy - 3, 352, 15, i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)');
        RW.texto(ctx, f[0], 22, fy + 1, '#ffd24a', { contorno: OSCURO });
        RW.texto(ctx, f[1], 362, fy + 1, '#ffffff', { alinear: 'der', contorno: OSCURO });
      });
      if (p === 0) {
        RW.textoEstilo(ctx, 'EL DUELO', CX, 10, 'oro', 3, 'centro');
        [
          'AQUÍ NO SE PELEA: SE BAILA.',
          'CADA PASO QUE CONECTA LE ROBA FLOW AL RIVAL.',
          'QUIEN SE QUEDE SIN FLOW PIERDE LA RONDA.',
          'LAS ESTRELLAS DE ARRIBA SON LAS RONDAS GANADAS.',
          'LOS CÍRCULOS SE LLENAN CUANDO TE ESTÁN MAREANDO.',
          '',
          'ATRÁS: TE CUBRES (DE PIE O AGACHADO).',
          'LAS BARRIDAS SE CUBREN AGACHADO; LOS SALTOS, DE PIE.',
          'LA SABROSURA LLEGA HASTA NIVEL 3 (MAX).',
          'CON UN NIVEL, APRIETA L PARA TU SÚPER.',
        ].forEach((l, i) => RW.texto(ctx, l, CX, 44 + i * 14, l.includes('SÚPER') || l.includes('FLOW') ? '#ffe9a8' : '#ffffff', { alinear: 'centro', contorno: OSCURO }));
      } else if (p === 1) {
        RW.textoEstilo(ctx, 'CONTROLES', CX, 10, 'oro', 3, 'centro');
        tabla([
          ['CRUCETA', 'MOVERSE, SALTAR, AGACHARSE'], ['A', 'PASO LIGERO (RÁPIDO)'], ['B', 'PASO FUERTE'],
          ['R', 'PATADA'], ['L', 'SÚPER O POSE'], ['START', 'PAUSA'],
          ['TECLADO JUGADOR 1', 'WASD + J K L I'], ['TECLADO JUGADOR 2', 'FLECHAS + , . - M'], ['UN SOLO JUGADOR', 'FLECHAS + Z X C V'],
        ], 42);
      } else if (p === 2) {
        RW.textoEstilo(ctx, 'PASOS DE TODOS', CX, 10, 'oro', 3, 'centro');
        tabla([
          ['↓↘→ + A/B', 'PROYECTIL MUSICAL'], ['→↓↘ + A/B', 'SALTO ANTIAÉREO'], ['↓↙← + R', 'REMOLINO DE BAILE'],
          ['L (UN NIVEL)', 'SÚPER'], ['→ + B (PEGADO)', 'VUELTA EN PAREJA'], ['→ →', 'DESLIZAR'], ['← ←', 'MOONWALK'],
          ['L (SIN NIVEL)', 'POSE: +SABROSURA'],
        ], 42);
        RW.texto(ctx, '(MIRANDO A LA DERECHA)', CX, 190, '#b8a9dc', { alinear: 'centro' });
      } else {
        ui.listaPasos(ctx, RW.PERSONAJES[p - 3], 10);
      }
      RW.texto(ctx, '◀ ' + (p + 1) + '/' + this.paginas() + ' ▶     B: SALIR', CX, 204, '#c8b8f0', { alinear: 'centro', contorno: OSCURO });
    },
  };

  // ---------- Opciones ----------
  S.opciones = {
    entrar() { this.t = 0; this.sel = 0; },
    items() {
      const o = RW.opciones;
      const barra = (v) => '■'.repeat(Math.round(v * 10)) + '□'.repeat(10 - Math.round(v * 10));
      return [
        { txt: 'DIFICULTAD', val: RW.NIVELES_IA[o.dificultad].nombre, cambiar: (d) => { o.dificultad = (o.dificultad + d + 3) % 3; } },
        { txt: 'RONDAS', val: 'AL MEJOR DE ' + o.rondas, cambiar: (d) => { const l = [1, 3, 5]; o.rondas = l[(l.indexOf(o.rondas) + d + 3) % 3]; } },
        { txt: 'TIEMPO', val: o.tiempo ? String(o.tiempo) : 'SIN LÍMITE', cambiar: (d) => { const l = [60, 99, 0]; o.tiempo = l[(l.indexOf(o.tiempo) + d + 3) % 3]; } },
        { txt: 'MÚSICA', val: barra(o.musica), cambiar: (d) => { o.musica = RW.limitar(Math.round((o.musica + d * 0.1) * 10) / 10, 0, 1); RW.audio.aplicarVolumen(); } },
        { txt: 'EFECTOS', val: barra(o.efectos), cambiar: (d) => { o.efectos = RW.limitar(Math.round((o.efectos + d * 0.1) * 10) / 10, 0, 1); RW.audio.aplicarVolumen(); RW.audio.sfx('golpeLigero'); } },
        { txt: 'LOCUTOR', val: o.locutor ? 'SÍ' : 'NO', cambiar: () => { o.locutor = !o.locutor; if (o.locutor) RW.audio.locutor('¡A bailar!'); } },
        { txt: 'FILTRO LCD', val: o.lcd ? 'SÍ' : 'NO', cambiar: () => { o.lcd = !o.lcd; RW.juego.aplicarLcd(); } },
        { txt: 'VOLVER', val: '' },
      ];
    },
    actualizar() {
      this.t++;
      const it = this.items();
      if (E().repetir('abajo')) { this.sel = (this.sel + 1) % it.length; RW.audio.sfx('menu'); }
      if (E().repetir('arriba')) { this.sel = (this.sel + it.length - 1) % it.length; RW.audio.sfx('menu'); }
      const actual = it[this.sel];
      if (actual.cambiar) {
        if (E().repetir('der') || E().pulsado('A')) { actual.cambiar(1); RW.audio.sfx('menu'); RW.guardarOpciones(); }
        if (E().repetir('izq')) { actual.cambiar(-1); RW.audio.sfx('menu'); RW.guardarOpciones(); }
      } else if (aceptar()) { RW.audio.sfx('atras'); RW.juego.cambiar(S.menu); return; }
      if (atras()) { RW.audio.sfx('atras'); RW.guardarOpciones(); RW.juego.cambiar(S.menu); }
    },
    dibujar(ctx) {
      ui.fondoTitulo(ctx, this.t, 0.7);
      ui.titulo(ctx, 'OPCIONES', 8);
      ui.panel(ctx, 52, 48, 280, 146);
      this.items().forEach((o, i) => {
        const y = 58 + i * 17;
        const s = i === this.sel;
        if (s) ui.parale(ctx, 58, y - 4, 266, 15, 3, 'rgba(255, 74, 138, 0.5)');
        RW.texto(ctx, (s ? '▶ ' : '  ') + o.txt, 64, y, s ? '#ffffff' : '#c8b8f0', { contorno: OSCURO });
        RW.texto(ctx, o.val, 320, y, s ? '#ffd24a' : '#e8dcff', { alinear: 'der', contorno: OSCURO });
      });
      RW.texto(ctx, '← → CAMBIAR     B: VOLVER', CX, 204, '#c8b8f0', { alinear: 'centro', contorno: OSCURO });
    },
  };
})();
