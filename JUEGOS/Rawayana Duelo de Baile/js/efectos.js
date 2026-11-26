// =====================================================================
// efectos.js: partículas (chispas, notas, polvo, textos) y el dibujo de
// los proyectiles de baile de cada integrante.
// =====================================================================
(function () {
  const RW = window.RW;
  const R = RW.rect;

  const FRASES_GOLPE = ['¡EPA!', '¡WEPA!', '¡BURDA!', '¡QUÉ NIVEL!', '¡CHÉVERE!', '¡AZÚCAR!', '¡DALE!', '¡QUÉ FLOW!'];

  class Efectos {
    constructor() {
      this.lista = [];
    }

    agregar(e) {
      e.t = 0;
      this.lista.push(e);
      if (this.lista.length > 220) this.lista.shift();
      return e;
    }

    // Estallido al conectar un golpe
    chispa(x, y, fuerte, color) {
      this.agregar({ tipo: 'estallido', x, y, vida: fuerte ? 12 : 8, tam: fuerte ? 12 : 7, color: color || '#ffe35a' });
      const n = fuerte ? 7 : 4;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 1 + Math.random() * (fuerte ? 2.4 : 1.6);
        this.agregar({ tipo: 'punto', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.5, vida: 14 + Math.random() * 8,
          color: Math.random() < 0.5 ? '#ffffff' : (color || '#ffd24a'), g: 0.08 });
      }
      for (let i = 0; i < (fuerte ? 3 : 1); i++) this.nota(x, y - 4, color);
    }

    bloqueo(x, y, mirando) {
      this.agregar({ tipo: 'escudo', x, y, vida: 10, mirando });
      for (let i = 0; i < 3; i++) {
        this.agregar({ tipo: 'punto', x, y: y + (Math.random() - 0.5) * 10, vx: -mirando * (1 + Math.random()), vy: (Math.random() - 0.5) * 1.5,
          vida: 10, color: '#9fd8ff', g: 0 });
      }
    }

    nota(x, y, color) {
      const colores = ['#ff5a8a', '#ffd24a', '#5ae0d0', '#8fb8ff', '#ffffff'];
      this.agregar({ tipo: 'nota', x: x + (Math.random() - 0.5) * 10, y, vx: (Math.random() - 0.5) * 1.2, vy: -0.6 - Math.random() * 0.8,
        vida: 40 + Math.random() * 20, color: color && Math.random() < 0.5 ? color : RW.elegir(colores) });
    }

    polvo(x, y, cantidad) {
      for (let i = 0; i < (cantidad || 4); i++) {
        this.agregar({ tipo: 'polvo', x: x + (Math.random() - 0.5) * 14, y, vx: (Math.random() - 0.5) * 1.4, vy: -Math.random() * 0.6,
          vida: 16 + Math.random() * 10, color: '#e8dccb' });
      }
    }

    texto(x, y, txt, color) {
      // Las frases al azar no se amontonan: solo una a la vez
      if (!txt && this.lista.some((e) => e.tipo === 'texto' && e.t < 30)) return;
      this.agregar({ tipo: 'texto', x, y, txt: txt || RW.elegir(FRASES_GOLPE), vida: 40, color: color || '#ffffff', vy: -0.5 });
    }

    hojas(x, y, color) {
      for (let i = 0; i < 5; i++) {
        this.agregar({ tipo: 'hoja', x, y, vx: (Math.random() - 0.5) * 2.4, vy: -1.5 - Math.random() * 1.5, vida: 30 + Math.random() * 10,
          color: color || '#4fbf5a', g: 0.08 });
      }
    }

    actualizar() {
      for (const e of this.lista) {
        e.t++;
        if (e.vx) e.x += e.vx;
        if (e.vy) e.y += e.vy;
        if (e.g) e.vy += e.g;
        if (e.tipo === 'nota') e.x += Math.sin(e.t * 0.15) * 0.3;
      }
      this.lista = this.lista.filter((e) => e.t < e.vida);
    }

    dibujar(ctx, camX) {
      const K = RW.K;
      for (const e of this.lista) {
        const x = RW.aPx(e.x, camX), y = RW.aPy(e.y);
        const resto = 1 - e.t / e.vida;
        switch (e.tipo) {
          case 'estallido': {
            const r = Math.round(e.tam * K * Math.min(1, e.t / 4 + 0.3));
            const c = e.t < 3 ? '#ffffff' : e.color;
            for (let i = 0; i < 10; i++) {
              const a = (i / 10) * Math.PI * 2 + 0.2;
              const largo = i % 2 ? r : r * 0.6;
              for (let j = Math.round(largo * 0.35); j < largo; j++) R(ctx, x + Math.cos(a) * j, y + Math.sin(a) * j, 2, 2, c);
            }
            if (e.t < 4) RW.circulo(ctx, x, y, 7 - e.t, '#ffffff');
            break;
          }
          case 'escudo': {
            const c = e.t < 4 ? '#ffffff' : '#7fc8ff';
            for (let i = -14; i <= 14; i++) {
              const dx = Math.round(Math.sqrt(Math.max(0, 196 - i * i)) * 0.5) * -e.mirando;
              R(ctx, x + dx - e.mirando * e.t * 0.6, y + i, 2, 1, c);
              if (i % 2 === 0) R(ctx, x + dx - e.mirando * (4 + e.t * 0.6), y + i, 1, 1, '#c8ecff');
            }
            break;
          }
          case 'punto':
            R(ctx, x, y, resto > 0.5 ? 3 : 2, resto > 0.5 ? 3 : 2, e.color);
            break;
          case 'nota':
            if (resto < 0.25 && e.t % 4 < 2) break;
            RW.texto(ctx, '♪', x - 5, y - 7, e.color, { escala: 2, contorno: '#1a0f26' });
            break;
          case 'polvo':
            RW.circulo(ctx, x, y, resto > 0.5 ? 3 : 2, e.color);
            break;
          case 'hoja':
            R(ctx, x, y, 6, 2, e.color);
            R(ctx, x + 2, y - 2, 2, 2, e.color);
            break;
          case 'texto':
            if (resto < 0.3 && e.t % 4 < 2) break;
            RW.textoEstilo(ctx, e.txt, x, y, e.estilo || 'oro', 2, 'centro');
            break;
        }
      }
    }
  }

  RW.Efectos = Efectos;

  // ---------- Dibujo de proyectiles (en píxeles de pantalla) ----------
  RW.dibujarProyectil = function (ctx, p, camX) {
    const x = RW.aPx(p.x, camX), y = RW.aPy(p.y);
    const m = p.vx >= 0 ? 1 : -1;
    const t = p.t;
    switch (p.tipo) {
      case 'nota': {
        for (let i = 1; i <= 3; i++) {
          if ((t + i) % 2) RW.texto(ctx, '♪', x - m * i * 14 - 5, y - 6 + Math.sin(t * 0.3 + i) * 4, i % 2 ? '#ff9ac0' : '#ffe27a', { escala: 2 });
        }
        RW.circulo(ctx, x, y, 14 + (t % 6 < 3 ? 2 : 0), 'rgba(255, 120, 170, 0.35)');
        RW.texto(ctx, '♪', x - 10, y - 14, t % 4 < 2 ? '#ffffff' : '#ff5a8a', { escala: 4, contorno: '#5a1030', contornoGrueso: true });
        break;
      }
      case 'riff': case 'riffGrande': {
        const g = p.tipo === 'riffGrande' ? 1.6 : 1;
        for (let k = 0; k < 3; k++) {
          const r = (12 + k * 6) * g;
          const c = k === 0 ? '#ffffff' : k === 1 ? '#ffe35a' : '#f2a12e';
          for (let i = -r; i <= r; i++) {
            const dx = Math.round(Math.sqrt(Math.max(0, r * r - i * i)) * 0.45);
            R(ctx, x + m * (dx - k * 8 * g), y + i, 3, 1, c);
          }
        }
        if (t % 3 === 0) RW.texto(ctx, '♪', x - m * 20 - 5, y - 26, '#ffe35a', { escala: 2 });
        break;
      }
      case 'baqueta': {
        const a = t * 0.5 * m;
        const dx = Math.cos(a) * 15, dy = Math.sin(a) * 15;
        for (let i = -15; i <= 15; i++) R(ctx, x + (dx * i) / 15, y + (dy * i) / 15, 3, 3, '#ecd09a');
        R(ctx, x + dx, y + dy, 3, 3, '#ffffff');
        for (let i = 1; i < 4; i++) R(ctx, x - m * (12 + i * 10), y - 6 + i * 4, 8, 2, 'rgba(255,255,255,0.6)');
        if (t % 6 < 3) RW.circulo(ctx, x, y, 6, 'rgba(255, 220, 150, 0.4)');
        break;
      }
      case 'grave': {
        for (let i = -24; i <= 24; i++) {
          const h = Math.round((Math.sin(i * 0.3 - t * 0.6) + 1.3) * 8 * (1 - Math.abs(i) / 28));
          R(ctx, x + i, y + 8 - h, 1, h + 2, Math.abs(i) < 8 ? '#bfe0ff' : '#4f8fff');
          R(ctx, x + i, y + 8 - h, 1, 2, '#ffffff');
        }
        if (t % 4 < 2) RW.texto(ctx, '♪', x - 5, y - 30, '#8fb8ff', { escala: 2 });
        break;
      }
      case 'rayo': {
        const largo = p.largo * RW.K;
        const alto = 28 + (t % 4 < 2 ? 4 : 0);
        const colores = ['#ff5a8a', '#ffd24a', '#5ae0d0', '#8fb8ff', '#c07ae0'];
        const x0 = m > 0 ? x : x - largo;
        for (let i = 0; i < alto; i++) {
          const c = colores[Math.floor((i + t * 0.5) / 5) % colores.length];
          R(ctx, x0, y - alto / 2 + i, largo, 1, c);
        }
        R(ctx, x0, y - 6, largo, 12, '#ffffff');
        for (let i = 0; i < 8; i++) {
          const nx = x + m * ((i * 54 + t * 8) % largo);
          RW.texto(ctx, '♪', nx - 5, y - 8 + Math.sin(i + t * 0.2) * 10, '#1a0f26', { escala: 2 });
        }
        RW.circulo(ctx, x, y, 20 + (t % 3) * 2, '#ffffff');
        break;
      }
      case 'ondaGigante': {
        for (let i = -36; i <= 36; i++) {
          const h = Math.round((Math.sin(i * 0.18 - t * 0.5) + 1.6) * 28 * (1 - Math.abs(i) / 40));
          R(ctx, x + i, y - h, 1, h + 4, Math.abs(i) < 12 ? '#dff0ff' : '#3f7fff');
          R(ctx, x + i, y - h, 1, 3, '#ffffff');
        }
        for (let i = 0; i < 3; i++) if ((t + i) % 3 === 0) RW.texto(ctx, '♪', x - 20 + i * 16, y - 80 - i * 8, '#ffd24a', { escala: 2, contorno: '#1a0f26' });
        break;
      }
    }
  };

  // Corneta gigante (súper de Tony). x, y en píxeles (y = base)
  RW.dibujarCorneta = function (ctx, x, y, t) {
    R(ctx, x - 26, y - 84, 52, 84, '#1a0f26');
    R(ctx, x - 24, y - 82, 48, 80, '#2a2636');
    R(ctx, x - 24, y - 82, 48, 2, '#4a4658');
    const p = Math.sin(t * 0.8) > 0 ? 2 : 0;
    RW.circulo(ctx, x, y - 26, 19 + p, '#3a3644');
    RW.circulo(ctx, x, y - 26, 14, '#14121a');
    RW.circulo(ctx, x, y - 26, 4 + p, '#6a6678');
    RW.circulo(ctx, x, y - 64, 10, '#3a3644');
    RW.circulo(ctx, x, y - 64, 6, '#14121a');
  };
})();
