// =====================================================================
// luchador.js: el bailarín en combate. Estados, física, golpes de baile,
// especiales con movimientos de cruceta, agarres, mareos y súper.
//
// Movimientos especiales (mirando a la derecha):
//   ↓↘→ + A/B   proyectil (A lento, B rápido)
//   →↓↘ + A/B   antiaéreo con salto
//   ↓↙← + R     giro (remolino de baile)
//   L con la barra de SABROSURA llena: súper
//   B + adelante o atrás, pegado al rival: agarre de pareja
//   Doble toque adelante / atrás: deslizarse / moonwalk
// =====================================================================
(function () {
  const RW = window.RW;
  const GRAV = 0.2;

  // ---------- Tabla de movimientos de cada personaje ----------
  function crearMovimientos(pj) {
    const dm = pj.stats.dano;
    const E = pj.especiales;

    function atq(def) {
      def.fases = def.fases.map((f) => ({ pose: RW.posePj(pj.id, f[0]), dur: f[1], activa: !!f[2] }));
      let t = 0;
      def.inicio = -1; def.fin = -1;
      def.fases.forEach((f) => {
        f.desde = t;
        if (f.activa) { if (def.inicio < 0) def.inicio = t; def.fin = t + f.dur - 1; }
        t += f.dur;
      });
      def.total = t;
      if (def.dano) def.dano = Math.round(def.dano * dm);
      def.nivel = def.nivel || 'medio';
      def.golpes = def.golpes || 1;
      return def;
    }

    const mov = {
      A: atq({ nombre: 'PASO LIGERO', fases: [['ligero1', 4], ['ligero2', 3, 1], ['ligero1', 4], ['q3', 3]],
        caja: { x: 10, y: -43, w: 17, h: 10 }, dano: 35, hitstun: 13, blockstun: 9, empuje: 1.5, cancelable: true, hitstop: 6, aturde: 6 }),
      B: atq({ nombre: 'PASO FUERTE', fases: [['fuerte1', 7], ['fuerte2', 4, 1], ['fuerte3', 9], ['q1', 5]],
        caja: { x: 12, y: -51, w: 20, h: 17 }, dano: 85, hitstun: 19, blockstun: 14, empuje: 2.6, cancelable: true, hitstop: 9, aturde: 14, fuerte: true,
        alFrame: (f, L) => { if (f === 7) L.vx = 1.2 * L.mirando; } }),
      R: atq({ nombre: 'PATADA SALSERA', fases: [['patada1', 6], ['patada2', 4, 1], ['patada1', 6], ['q1', 5]],
        caja: { x: 12, y: -38, w: 21, h: 14 }, dano: 70, hitstun: 17, blockstun: 12, empuje: 2.4, cancelable: true, hitstop: 8, aturde: 12, fuerte: true }),
      agA: atq({ nombre: 'PASO BAJO', agachado: true, fases: [['agLigero1', 4], ['agLigero2', 3, 1], ['agLigero1', 4]],
        caja: { x: 14, y: -31, w: 17, h: 12 }, dano: 30, hitstun: 12, blockstun: 8, empuje: 1.4, cancelable: true, hitstop: 6, aturde: 5 }),
      agB: atq({ nombre: 'DEDO AL CIELO', fases: [['agFuerte1', 5], ['agFuerte2', 6, 1], ['agFuerte1', 12]], agachadoFinal: true,
        caja: { x: -2, y: -66, w: 19, h: 32 }, dano: 80, hitstun: 19, blockstun: 13, empuje: 2, cancelable: true, hitstop: 9, aturde: 12, fuerte: true }),
      agR: atq({ nombre: 'BARRIDA BREAK', agachado: true, fases: [['barrida1', 6], ['barrida2', 5, 1], ['barrida2', 10], ['barrida1', 6]],
        caja: { x: 8, y: -10, w: 27, h: 10 }, dano: 75, nivel: 'bajo', derriba: true, hitstun: 20, blockstun: 14, empuje: 2, hitstop: 9, aturde: 12, fuerte: true }),
      aireA: atq({ nombre: 'TIJERA', aereo: true, fases: [['saltoMedio', 3], ['aereoLigero', 40, 1]],
        caja: { x: 6, y: -42, w: 19, h: 28 }, dano: 45, nivel: 'aereo', hitstun: 15, blockstun: 10, empuje: 1.4, hitstop: 7, aturde: 8 }),
      aireB: atq({ nombre: 'CAÍDA DE PALMAS', aereo: true, fases: [['saltoMedio', 5], ['aereoFuerte', 40, 1]],
        caja: { x: 6, y: -40, w: 23, h: 26 }, dano: 75, nivel: 'aereo', hitstun: 18, blockstun: 13, empuje: 2, hitstop: 9, aturde: 12, fuerte: true }),
      aireR: atq({ nombre: 'PATADA VOLADORA', aereo: true, fases: [['saltoMedio', 4], ['aereoPatada', 40, 1]],
        caja: { x: 10, y: -27, w: 21, h: 17 }, dano: 70, nivel: 'aereo', hitstun: 17, blockstun: 12, empuje: 2, hitstop: 8, aturde: 10, fuerte: true }),
    };

    ['A', 'B'].forEach((b) => {
      const fuerte = b === 'B';
      mov['proyectil' + b] = atq({ nombre: E.proyectil.nombre, especial: true, fases: [['proy1', 10], ['proy2', 22], ['q1', 6]],
        alFrame: (f, L, c) => { if (f === 10) c.lanzarProyectil(L, fuerte); } });
      mov['antiaereo' + b] = atq({ nombre: E.antiaereo.nombre, especial: true, fases: [['dp1', 3], ['dp2', 12, 1], ['dp3', 60]],
        caja: { x: 0, y: -68, w: 21, h: 54 }, dano: fuerte ? E.antiaereo.dano : Math.round(E.antiaereo.dano * 0.82), derriba: true,
        hitstun: 30, blockstun: 16, empuje: 1, hitstop: 10, aturde: 20, fuerte: true, invul: [0, fuerte ? 9 : 6], chip: true, recupAterrizaje: 14,
        alFrame: (f, L, c) => {
          if (f === 3) {
            L.vy = fuerte ? -5.3 : -4.5; L.vx = (fuerte ? 1.4 : 0.9) * L.mirando; L.enAire = true; L.y -= 1;
            RW.audio.sfx('especial');
            if (pj.id === 'abeja') c.efectos.hojas(L.x, L.y - 30, '#4fbf5a');
            else for (let i = 0; i < 3; i++) c.efectos.nota(L.x, L.y - 30, pj.color);
          }
        } });
    });
    mov.giro = atq({ nombre: E.giro.nombre, especial: true,
      fases: [['giro2', 5], ['giro1', 4, 1], ['giro2', 4, 1], ['giro3', 4, 1], ['giro4', 4, 1], ['giro1', 4, 1], ['giro2', 4, 1], ['giro3', 4, 1], ['giro4', 4, 1], ['giro2', 8]],
      caja: { x: -22, y: -52, w: 44, h: 26 }, dano: E.giro.dano, golpes: 3, intervalo: 10, hitstun: 16, blockstun: 10, empuje: 1.3, hitstop: 6,
      aturde: 8, chip: true, recupAterrizaje: 8, flotar: [5, 37],
      alFrame: (f, L, c) => {
        if (f === 5) { L.vy = -1.7; L.enAire = true; L.y -= 1; RW.audio.sfx('aire'); }
        if (f >= 5 && f <= 37) { L.vx = 1.9 * L.mirando; if (f % 4 === 0) c.efectos.nota(L.x - L.mirando * 10, L.y - 30, pj.color); }
        if (f === 38) L.vx = 0.6 * L.mirando;
      } });

    // Súper según el tipo de cada integrante
    const sup = E.super;
    const base = { nombre: sup.nombre, especial: true, esSuper: true, invul: [0, 16] };
    if (sup.tipo === 'rayo') {
      mov.super = atq(Object.assign(base, { fases: [['super1', 8], ['super2', 54], ['q1', 10]],
        alFrame: (f, L, c) => { if (f === 8) c.lanzarSuper(L, 'rayo'); } }));
    } else if (sup.tipo === 'riffs') {
      mov.super = atq(Object.assign(base, { fases: [['super1', 6], ['super2', 8], ['proy2', 8], ['super2', 8], ['proy2', 8], ['super2', 8], ['proy2', 10], ['q1', 8]],
        alFrame: (f, L, c) => { if (f >= 8 && f <= 40 && (f - 8) % 8 === 0) c.lanzarSuper(L, f === 40 ? 'riffGrande' : 'riff'); } }));
    } else if (sup.tipo === 'embestida') {
      mov.super = atq(Object.assign(base, {
        fases: [['super1', 6], ['dashAdelante', 4], ['super2', 6, 1], ['proy2', 6, 1], ['super2', 6, 1], ['proy2', 6, 1], ['super2', 6, 1], ['victoria3', 12, 1], ['q1', 10]],
        caja: { x: -4, y: -54, w: 30, h: 54 }, dano: Math.round(sup.dano / 6), golpes: 6, intervalo: 7, hitstun: 20, blockstun: 10, empuje: 0.6,
        hitstop: 7, chip: true, aturde: 0, golpeFinalDerriba: true,
        alFrame: (f, L, c) => {
          if (f >= 6 && f < 46) {
            const cerca = Math.abs(L.rival.x - L.x) < 24;
            L.vx = (cerca ? 0.5 : 3.4) * L.mirando;
            if (f % 3 === 0) c.efectos.nota(L.x, L.y - 40, pj.color);
            if (f % 7 === 0) RW.audio.sfx('golpeLigero');
          }
          if (f === 46) { L.vx = 0; c.sacudir(8); }
        } }));
    } else {
      mov.super = atq(Object.assign(base, { fases: [['super1', 10], ['super2', 40], ['q1', 10]],
        alFrame: (f, L, c) => { if (f === 10) c.lanzarSuper(L, 'ondaGigante'); } }));
    }
    return mov;
  }

  const ESTADOS_NEUTROS = ['quieto', 'caminar', 'agachado'];
  const SIN_DANO = ['suelo', 'levantarse', 'ko', 'agarrado', 'victoria', 'intro', 'derrotaTiempo'];

  class Luchador {
    constructor(pj, lado, paleta, combate) {
      this.pj = pj;
      this.lado = lado;            // 0 = jugador 1, 1 = jugador 2
      this.paleta = paleta || 0;
      this.combate = combate;
      this.mov = crearMovimientos(pj);
      this.vidaMax = pj.stats.vida;
      this.sabrosura = 0;
      this.ia = null;
      this.reiniciar(lado === 0 ? 160 : 240);
    }

    reiniciar(x) {
      this.x = x;
      this.y = RW.SUELO;
      this.vx = 0; this.vy = 0;
      this.mirando = this.lado === 0 ? 1 : -1;
      this.enAire = false;
      this.vida = this.vidaMax;
      this.vidaRoja = this.vidaMax;
      this.aturdimiento = 0;
      this.ultimoGolpeRecibido = -999;
      this.mareoPendiente = false;
      this.estado = 'quieto';
      this.te = 0;
      this.reloj = 0;
      this.invul = 0;
      this.ataque = null;
      this.af = 0;
      this.combo = 0;
      this.danoCombo = 0;
      this.historial = [];
      this.buffer = [];
      this.h = 0; this.v = 0; this.dir = 5;
      this.destello = 0;
      this.sacudida = 0;
      this.ko = false;
      this.ataqueAereoUsado = false;
      this.saltoTipo = 0;
      this.guardiaVisual = false;
      this.comando = null;
    }

    cambiarEstado(e) {
      this.estado = e;
      this.te = 0;
    }

    enSuelo() { return !this.enAire && this.y >= RW.SUELO - 0.01; }
    neutro() { return ESTADOS_NEUTROS.includes(this.estado); }

    // ---------- Entrada ----------
    leerEntrada(frame) {
      let s;
      if (this.ia) {
        s = this.ia.leer(this, this.rival, this.combate);
      } else {
        const m = RW.entrada.j[this.indiceMando !== undefined ? this.indiceMando : this.lado];
        s = { izq: m.sostenido('izq'), der: m.sostenido('der'), arriba: m.sostenido('arriba'), abajo: m.sostenido('abajo'), pulsar: [] };
        ['A', 'B', 'R', 'L'].forEach((b) => { if (m.pulsado(b)) s.pulsar.push(b); });
      }
      this.h = (s.der ? 1 : 0) - (s.izq ? 1 : 0);
      this.v = s.arriba ? 1 : s.abajo ? -1 : 0;
      const hr = this.h * this.mirando;
      this.dir = 5 + hr + this.v * 3;
      this.historial.push({ d: this.dir, f: frame });
      if (this.historial.length > 40) this.historial.shift();
      (s.pulsar || []).forEach((b) => this.buffer.push({ b, f: frame }));
      this.buffer = this.buffer.filter((x) => frame - x.f <= 6);
      this.comando = s.comando || null;
      this.pulsosMareo = (s.pulsar || []).length + (s.izq || s.der ? 0.3 : 0);
    }

    // Busca una secuencia de direcciones en el historial reciente.
    hayMovimiento(secuencia, ventana) {
      const ahora = this.combate.frame;
      let i = 0;
      for (const h of this.historial) {
        if (ahora - h.f > ventana) continue;
        if (secuencia[i].includes(h.d)) { i++; if (i === secuencia.length) return true; }
      }
      return false;
    }

    tomarBoton(permitidos) {
      for (let i = this.buffer.length - 1; i >= 0; i--) {
        if (!permitidos || permitidos.includes(this.buffer[i].b)) {
          const b = this.buffer[i].b;
          this.buffer.splice(i, 1);
          return b;
        }
      }
      return null;
    }

    // ---------- Acciones ----------
    hacerAtaque(nombre) {
      const a = this.mov[nombre];
      if (!a) return false;
      this.ataque = a;
      this.af = 0;
      this.golpeConectado = false;
      this.golpesRestantes = a.golpes;
      this.ultimoGolpeAf = -99;
      this.cambiarEstado('ataque');
      if (!a.aereo && !this.enAire) this.vx = 0;
      if (a.especial && !a.esSuper) this.sumarSabrosura(3);
      if (!a.especial) RW.audio.sfx('aire');
      return true;
    }

    intentarEspecial(cancelando) {
      const c = this.comando;
      // Órdenes directas de la CPU
      if (c) {
        this.comando = null;
        if (c === 'super') return this.sabrosura >= 100 ? this.iniciarSuper() : false;
        if (c === 'proyectilA' || c === 'proyectilB') {
          if (!this.combate.tieneProyectil(this)) return this.hacerAtaque(c);
          return false;
        }
        if (c.startsWith('antiaereo') || c === 'giro') return this.hacerAtaque(c);
        if (!cancelando) {
          if (c === 'agarre' && this.intentarAgarre()) return true;
          if (c === 'provocar') { this.cambiarEstado('provocar'); RW.audio.sfx('pose'); return true; }
          if (this.mov[c]) return this.hacerAtaque(c);
        }
        return false;
      }
      const ventana = 18;
      if (this.buffer.some((x) => x.b === 'L') && this.sabrosura >= 100) {
        this.tomarBoton(['L']);
        return this.iniciarSuper();
      }
      const ab = this.buffer.find((x) => x.b === 'A' || x.b === 'B');
      if (ab) {
        if (this.hayMovimiento([[6], [2, 1], [3]], ventana)) { this.tomarBoton([ab.b]); return this.hacerAtaque('antiaereo' + ab.b); }
        if (this.hayMovimiento([[2], [3], [6]], ventana) && !this.combate.tieneProyectil(this)) {
          this.tomarBoton([ab.b]);
          return this.hacerAtaque('proyectil' + ab.b);
        }
      }
      if (this.buffer.some((x) => x.b === 'R') && this.hayMovimiento([[2], [1], [4]], ventana)) {
        this.tomarBoton(['R']);
        return this.hacerAtaque('giro');
      }
      return false;
    }

    iniciarSuper() {
      this.sabrosura = Math.max(0, this.sabrosura - 100);
      this.hacerAtaque('super');
      this.invul = 20;
      this.combate.flashSuper(this);
      return true;
    }

    intentarAgarre() {
      const r = this.rival;
      if (Math.abs(r.x - this.x) > 30 || !r.enSuelo() || r.invul > 0) return false;
      if (!['quieto', 'caminar', 'agachado', 'aterrizaje', 'provocar', 'dash', 'dashAtras', 'ataque'].includes(r.estado)) return false;
      if (r.estado === 'ataque' && r.ataque && r.ataque.esSuper) return false;
      const atras = this.dir === 4 || this.dir === 1 || this.dir === 7;
      this.dirLanzamiento = (atras ? -1 : 1) * this.mirando;
      this.cambiarEstado('agarrando');
      this.vx = 0;
      r.cambiarEstado('agarrado');
      r.vx = 0; r.vy = 0; r.enAire = false;
      r.ataque = null;
      RW.audio.sfx('agarre');
      return true;
    }

    intentarAcciones() {
      if (this.intentarEspecial(false)) return true;
      const b = this.tomarBoton(['A', 'B', 'R', 'L']);
      if (!b) return false;
      if (b === 'L') {
        this.cambiarEstado('provocar');
        RW.audio.sfx('pose');
        return true;
      }
      if (b === 'B' && (this.dir === 4 || this.dir === 6) && this.intentarAgarre()) return true;
      const abajo = this.dir <= 3;
      return this.hacerAtaque(abajo ? 'ag' + b : b);
    }

    saltar(h) {
      this.cambiarEstado('saltoPrep');
      this.saltoTipo = h;
    }

    sumarSabrosura(n) {
      if (this.combate.entrenamiento && this.combate.sabrosuraInfinita) { this.sabrosura = 300; return; }
      this.sabrosura = Math.min(300, this.sabrosura + n);
    }

    // ---------- Actualización ----------
    actualizar() {
      const c = this.combate;
      this.te++;
      this.reloj++;
      if (this.invul > 0) this.invul--;
      if (this.destello > 0) this.destello--;
      if (c.frame - this.ultimoGolpeRecibido > 90 && this.aturdimiento > 0) this.aturdimiento = Math.max(0, this.aturdimiento - 0.3);
      this.guardiaVisual = false;

      switch (this.estado) {
        case 'intro':
        case 'victoria':
        case 'derrotaTiempo':
          this.vx = 0;
          break;

        case 'quieto':
        case 'caminar':
        case 'agachado': {
          this.mirarRival();
          if (c.controlesActivos && this.intentarAcciones()) break;
          if (!c.controlesActivos) { this.vx = 0; if (this.estado !== 'quieto') this.cambiarEstado('quieto'); break; }
          const d = this.dir;
          // Doble toque: deslizarse o moonwalk
          if (d === 6 && this.historial.length > 2 && this.historial[this.historial.length - 2].d !== 6 &&
              this.hayMovimiento([[6], [5], [6]], 14)) {
            this.cambiarEstado('dash'); this.historial.length = 0; RW.audio.sfx('aire'); c.efectos.polvo(this.x, this.y, 3); break;
          }
          if (d === 4 && this.historial.length > 2 && this.historial[this.historial.length - 2].d !== 4 &&
              this.hayMovimiento([[4], [5], [4]], 14)) {
            this.cambiarEstado('dashAtras'); this.invul = 6; this.historial.length = 0; RW.audio.sfx('aire'); break;
          }
          if (d >= 7) { this.saltar(d === 9 ? 1 : d === 7 ? -1 : 0); break; }
          if (d <= 3) {
            if (this.estado !== 'agachado') this.cambiarEstado('agachado');
            this.vx = 0;
            if (d === 1 && this.rivalAmenaza()) this.guardiaVisual = true;
            break;
          }
          if (d === 6) {
            if (this.estado !== 'caminar') this.cambiarEstado('caminar');
            this.vx = this.pj.stats.caminar * this.mirando;
            this.caminaAtras = false;
          } else if (d === 4) {
            if (this.rivalAmenaza()) {
              this.guardiaVisual = true;
              this.vx = 0;
              if (this.estado !== 'quieto') this.cambiarEstado('quieto');
            } else {
              if (this.estado !== 'caminar') this.cambiarEstado('caminar');
              this.vx = -this.pj.stats.retroceder * this.mirando;
              this.caminaAtras = true;
            }
          } else {
            if (this.estado !== 'quieto') this.cambiarEstado('quieto');
            this.vx = 0;
          }
          break;
        }

        case 'saltoPrep':
          this.vx = 0;
          if (this.te >= 3) {
            this.cambiarEstado('salto');
            this.enAire = true;
            this.vy = this.pj.stats.saltoVy;
            this.vx = this.saltoTipo * this.pj.stats.saltoVx * this.mirando;
            this.y -= 1;
            this.ataqueAereoUsado = false;
            RW.audio.sfx('salto');
          }
          break;

        case 'salto': {
          const b = this.tomarBoton(['A', 'B', 'R']);
          if (b && !this.ataqueAereoUsado) {
            this.ataqueAereoUsado = true;
            this.hacerAtaque('aire' + b);
          }
          break;
        }

        case 'aterrizaje':
          this.vx = 0;
          if (this.te >= (this.recupAterrizaje || 4)) {
            this.recupAterrizaje = 0;
            this.cambiarEstado('quieto');
            this.mirarRival();
          }
          break;

        case 'ataque':
          this.actualizarAtaque();
          break;

        case 'golpeado':
          if (!this.enAire) this.vx *= 0.8;
          if (this.te >= this.hitstun && !this.enAire) {
            this.combo = 0;
            if (this.mareoPendiente) this.marear();
            else this.cambiarEstado(this.v === -1 ? 'agachado' : 'quieto');
          }
          break;

        case 'guardia':
          this.vx *= 0.8;
          if (this.te >= this.blockstun) this.cambiarEstado(this.v === -1 ? 'agachado' : 'quieto');
          break;

        case 'derribado':
          // Se mueve en el aire hasta tocar el suelo (ver física)
          break;

        case 'suelo':
          this.vx *= 0.7;
          if (this.ko) { this.cambiarEstado('ko'); break; }
          if (this.te >= 34) { this.cambiarEstado('levantarse'); this.invul = 26; }
          break;

        case 'levantarse':
          if (this.te >= 22) {
            this.mirarRival();
            this.combo = 0;
            if (this.mareoPendiente) this.marear();
            else { this.cambiarEstado('quieto'); this.invul = 4; }
          }
          break;

        case 'mareado':
          this.mareoRestante -= 1 + (this.pulsosMareo || 0) * 3;
          if (this.reloj % 30 === 0) RW.audio.sfx('mareo');
          if (this.mareoRestante <= 0) { this.cambiarEstado('quieto'); this.aturdimiento = 0; }
          break;

        case 'agarrando': {
          const r = this.rival;
          this.invul = 2;
          r.x = this.x + this.mirando * 16;
          r.y = RW.SUELO;
          if (this.te === 26) {
            r.x = this.x + this.dirLanzamiento * 20;
            r.mirando = -this.dirLanzamiento;
            const dano = Math.round(110 * this.pj.stats.dano);
            r.vida = Math.max(0, r.vida - dano);
            r.ko = r.vida <= 0;
            r.cambiarEstado('derribado');
            r.enAire = true;
            r.vy = -3.4;
            r.vx = this.dirLanzamiento * 2.4;
            r.y = RW.SUELO - 2;
            r.ultimoGolpeRecibido = c.frame;
            this.sumarSabrosura(10);
            r.sumarSabrosura(5);
            c.alGolpear(this, r, dano, true);
            c.efectos.chispa(r.x, r.y - 30, true, this.pj.color);
            c.efectos.texto(r.x, r.y - 56, '¡VUELTA!', '#ffd24a');
            RW.audio.sfx('golpeFuerte');
            c.sacudir(6);
          }
          if (this.te >= 34) { this.cambiarEstado('quieto'); this.mirarRival(); }
          break;
        }

        case 'agarrado':
          this.invul = 2;
          if (this.rival.estado !== 'agarrando') this.cambiarEstado('quieto');
          break;

        case 'provocar':
          this.vx = 0;
          if (this.te === 20) { this.sumarSabrosura(25); c.efectos.texto(this.x, this.y - 60, '¡EPA!', this.pj.color); c.efectos.nota(this.x, this.y - 50, this.pj.color); }
          if (this.te >= 40) this.cambiarEstado('quieto');
          break;

        case 'dash':
          this.vx = this.mirando * (this.te < 10 ? 2.8 : 1.2);
          if (this.te % 4 === 0) c.efectos.polvo(this.x - this.mirando * 8, this.y, 1);
          if (this.te >= 16) { this.cambiarEstado('quieto'); this.vx = 0; }
          break;

        case 'dashAtras':
          this.vx = -this.mirando * (this.te < 12 ? 2.3 : 1);
          if (this.te >= 18) { this.cambiarEstado('quieto'); this.vx = 0; }
          break;

        case 'ko':
          this.vx *= 0.7;
          break;
      }

      this.fisica();
    }

    actualizarAtaque() {
      const a = this.ataque;
      const c = this.combate;
      if (a.alFrame) a.alFrame(this.af, this, c);

      // Cancelar un golpe que conectó con un especial (combos)
      if (a.cancelable && this.golpeConectado && this.af <= a.fin + 8 && c.controlesActivos) {
        if (this.intentarEspecial(true)) return;
      }
      this.af++;
      if (this.af >= a.total) {
        if (this.enAire) {
          this.af = a.total - 1;     // se queda en la última pose hasta aterrizar
        } else {
          this.ataque = null;
          if (a.agachado || a.agachadoFinal) this.cambiarEstado('agachado');
          else this.cambiarEstado('quieto');
          this.mirarRival();
        }
      }
    }

    marear() {
      this.mareoPendiente = false;
      this.cambiarEstado('mareado');
      this.mareoRestante = 150;
      this.combate.efectos.texto(this.x, this.y - 64, '¡MAREADO!', '#ffd24a');
      RW.audio.locutor('¡Mareado!');
    }

    fisica() {
      const c = this.combate;
      const flotando = this.estado === 'ataque' && this.ataque.flotar && this.af >= this.ataque.flotar[0] && this.af <= this.ataque.flotar[1];
      if (this.estado !== 'agarrado' && this.estado !== 'agarrando') {
        this.x += this.vx;
        if (this.enAire) {
          this.y += this.vy;
          this.vy += flotando ? 0.06 : GRAV;
          if (this.y >= RW.SUELO) this.aterrizar();
        }
      }
      if (!this.enAire && ['quieto', 'agachado', 'aterrizaje'].includes(this.estado)) this.vx = 0;
      void c;
    }

    aterrizar() {
      const c = this.combate;
      this.y = RW.SUELO;
      this.vy = 0;
      this.enAire = false;
      if (this.estado === 'victoria' || this.estado === 'derrotaTiempo') { this.vx = 0; return; }
      if (this.estado === 'derribado') {
        this.cambiarEstado(this.ko ? 'ko' : 'suelo');
        this.vx *= 0.4;
        c.efectos.polvo(this.x, this.y, 6);
        RW.audio.sfx('aterrizar');
        if (this.ko) c.sacudir(5);
        return;
      }
      if (this.estado === 'golpeado') { this.vx = 0; return; }
      if (this.estado === 'ataque') {
        const recup = this.ataque.recupAterrizaje || 4;
        this.ataque = null;
        this.recupAterrizaje = recup;
        this.cambiarEstado('aterrizaje');
      } else {
        this.recupAterrizaje = 4;
        this.cambiarEstado('aterrizaje');
      }
      this.vx = 0;
      c.efectos.polvo(this.x, this.y, 3);
      RW.audio.sfx('aterrizar');
    }

    mirarRival() {
      if (!this.rival) return;
      const d = this.rival.x - this.x;
      if (Math.abs(d) > 2) this.mirando = d > 0 ? 1 : -1;
    }

    // ¿El rival está atacando cerca? (para levantar la guardia al ir hacia atrás)
    rivalAmenaza() {
      const r = this.rival;
      const dist = Math.abs(r.x - this.x);
      if (r.estado === 'ataque' && dist < 90) return true;
      return this.combate.proyectiles.some((p) => p.dueno !== this && Math.abs(p.x - this.x) < 80);
    }

    // ---------- Cajas ----------
    cajaCuerpo() {
      const e = this.estado;
      if (['suelo', 'ko', 'levantarse'].includes(e)) return null;
      let c;
      const agachado = e === 'agachado' || (e === 'guardia' && this.guardiaAgachado) ||
        (e === 'golpeado' && this.poseGolpe === RW.POSES.golpeAgachado) ||
        (e === 'ataque' && this.ataque && (this.ataque.agachado || (this.ataque.agachadoFinal && this.af > this.ataque.fin)));
      if (this.enAire) c = { x: -9, y: -52, w: 18, h: 44 };
      else if (agachado) c = { x: -11, y: -38, w: 22, h: 38 };
      else c = { x: -9, y: -55, w: 18, h: 55 };
      return { x: this.x + c.x, y: this.y + c.y, w: c.w, h: c.h };
    }

    // Caja de golpe del ataque activo (en coordenadas del mundo)
    cajaGolpe() {
      if (this.estado !== 'ataque' || !this.ataque || !this.ataque.caja) return null;
      const a = this.ataque;
      if (this.af < a.inicio || this.af > a.fin) return null;
      const k = a.caja;
      const x = this.mirando > 0 ? this.x + k.x : this.x - k.x - k.w;
      return { x, y: this.y + k.y, w: k.w, h: k.h };
    }

    // ---------- Recibir un golpe ----------
    // g: { dano, nivel, hitstun, blockstun, empuje, derriba, chip, aturde, hitstop, fuerte, origenX, x, y, esSuper }
    recibirGolpe(atacante, g) {
      const c = this.combate;
      if (this.invul > 0 || SIN_DANO.includes(this.estado)) return 'nada';
      if (this.estado === 'derribado' && this.te > 3 && !g.esSuper) return 'nada';
      const atras = this.x >= g.origenX ? 1 : -1;     // hacia dónde queda "atrás" (lejos del golpe)
      const sosteniendoAtras = this.h === atras;
      const agachado = this.v === -1;
      const puedeBloquear = this.enSuelo() && (['quieto', 'caminar', 'agachado', 'guardia'].includes(this.estado) ||
        (this.estado === 'aterrizaje' && this.te > 2));
      const enGuardia = this.estado === 'guardia';
      let bloquea = puedeBloquear && (sosteniendoAtras || enGuardia);
      const agachadoDef = enGuardia && !sosteniendoAtras ? this.guardiaAgachado : agachado;
      if (bloquea && g.nivel === 'bajo' && !agachadoDef) bloquea = false;
      if (bloquea && g.nivel === 'aereo' && agachadoDef) bloquea = false;

      if (bloquea) {
        this.cambiarEstado('guardia');
        this.guardiaAgachado = agachadoDef;
        this.blockstun = g.blockstun || 10;
        this.vx = atras * (g.empuje || 1.5) * 0.9;
        if (g.chip) {
          const chip = Math.max(1, Math.round(g.dano * 0.18));
          this.vida = Math.max(0, this.vida - chip);
          if (this.vida <= 0) { this.ko = true; return this.aplicarImpacto(atacante, g, atras, 0, true); }
        }
        this.sumarSabrosura(2);
        atacante.sumarSabrosura(g.dano * 0.03);
        c.efectos.bloqueo(g.x, g.y, atras);
        RW.audio.sfx('bloqueo');
        c.hitstop = Math.max(c.hitstop, Math.round((g.hitstop || 6) * 0.7));
        return 'bloqueo';
      }

      const escala = Math.max(0.45, 1 - 0.1 * this.combo);
      const dano = Math.max(1, Math.round(g.dano * escala));
      this.vida = Math.max(0, this.vida - dano);
      if (this.vida <= 0) this.ko = true;
      return this.aplicarImpacto(atacante, g, atras, dano, false);
    }

    aplicarImpacto(atacante, g, atras, dano, porChip) {
      const c = this.combate;
      this.combo++;
      this.danoCombo = (this.combo === 1 ? 0 : this.danoCombo) + dano;
      this.ultimoGolpeRecibido = c.frame;
      this.destello = 3;
      this.sacudida = g.hitstop || 6;
      if (!this.mareoPendiente && this.estado !== 'mareado') {
        this.aturdimiento += g.aturde || 0;
        if (this.aturdimiento >= 100 && !this.ko) { this.mareoPendiente = true; this.aturdimiento = 0; }
      } else if (this.estado === 'mareado') {
        this.mareoRestante = 0;
      }
      const derriba = this.ko || g.derriba || this.enAire;
      this.ataque = null;
      if (derriba) {
        this.cambiarEstado('derribado');
        this.enAire = true;
        this.vy = this.ko ? -3.8 : -3.2;
        this.vx = atras * (this.ko ? 2 : 1.7);
        this.y = Math.min(this.y, RW.SUELO - 2);
      } else {
        this.cambiarEstado('golpeado');
        this.hitstun = g.hitstun || 14;
        this.vx = atras * (g.empuje || 1.5);
        const agachado = this.v === -1;
        this.poseGolpe = agachado ? RW.POSES.golpeAgachado : (g.y > this.y - 34 ? RW.POSES.golpeBajo : RW.POSES.golpeAlto);
      }
      this.sumarSabrosura(dano * 0.05);
      atacante.sumarSabrosura(dano * 0.09);
      c.alGolpear(atacante, this, dano, g.fuerte || derriba);
      c.efectos.chispa(g.x, g.y, g.fuerte || derriba, atacante.pj.color);
      if ((g.fuerte && Math.random() < 0.3) || g.esSuper && Math.random() < 0.4) c.efectos.texto(g.x, g.y - 18);
      RW.audio.sfx(g.fuerte || derriba ? 'golpeFuerte' : 'golpeLigero');
      c.hitstop = Math.max(c.hitstop, g.hitstop || 6);
      if (derriba && (g.fuerte || this.ko)) c.sacudir(4);
      void porChip;
      return 'golpe';
    }

    // ---------- Dibujo ----------
    poseActual() {
      const P = RW.POSES;
      const pp = (n) => RW.posePj(this.pj.id, n);
      switch (this.estado) {
        case 'quieto': {
          if (this.guardiaVisual) return P.guardia;
          const ciclo = [P.q1, P.q2, P.q3, P.q4];
          return ciclo[Math.floor(this.reloj / 8) % 4];
        }
        case 'caminar': {
          const ciclo = [P.c1, P.c2, P.c3, P.c4];
          const i = Math.floor(this.te / 7) % 4;
          return ciclo[this.caminaAtras ? 3 - i : i];
        }
        case 'agachado': return this.guardiaVisual ? P.guardiaAgachado : P.ag;
        case 'saltoPrep': case 'aterrizaje': return P.aterrizaje;
        case 'salto':
          if (this.vy < -1.8) return P.saltoArriba;
          if (this.vy > 1.8) return P.saltoAbajo;
          if (this.saltoTipo !== 0) {
            const i = Math.floor(this.te / 4) % 4;
            return P['voltereta' + (this.saltoTipo * this.mirando > 0 ? i : 3 - i)];
          }
          return P.saltoMedio;
        case 'ataque': {
          const a = this.ataque;
          if (!a) return P.q1;
          let f = a.fases[a.fases.length - 1];
          for (const fase of a.fases) { if (this.af >= fase.desde && this.af < fase.desde + fase.dur) { f = fase; break; } }
          return f.pose;
        }
        case 'golpeado': return this.poseGolpe || P.golpeAlto;
        case 'guardia': return this.guardiaAgachado ? P.guardiaAgachado : P.guardia;
        case 'derribado': return P.derribado;
        case 'suelo': case 'ko': return P.acostado;
        case 'levantarse': return this.te < 11 ? P.levantarse1 : P.levantarse2;
        case 'mareado': return Math.floor(this.te / 16) % 2 ? P.mareado1 : P.mareado2;
        case 'agarrando': return this.te < 6 ? P.agarre1 : P.agarre2;
        case 'agarrado': return P['lanzado' + (Math.floor(this.te / 3) % 6)];
        case 'provocar': return Math.floor(this.te / 10) % 2 ? P.provocar1 : P.provocar2;
        case 'dash': return P.dashAdelante;
        case 'dashAtras': return Math.floor(this.te / 5) % 2 ? P.moon1 : P.moon2;
        case 'victoria': return Math.floor(this.te / 24) % 2 ? pp('victoria3') : P.victoria1;
        case 'intro': return this.te < 50 ? pp('victoria3') : P.q1;
        case 'derrotaTiempo': return P.golpeBajo;
      }
      return P.q1;
    }

    dibujar(ctx, camX) {
      const pose = this.poseActual();
      let x = RW.aPx(this.x, camX);
      if (this.sacudida > 0 && this.combate.hitstop > 0) x += (this.combate.frame % 2 ? 2 : -2);
      const y = RW.aPy(this.y);
      const alto = RW.SUELO - this.y;
      RW.sprites.sombra(ctx, x, RW.PISO, Math.max(20, 48 - alto * 0.5));
      const parpadeo = this.estado === 'levantarse' && this.te % 4 < 2;
      if (parpadeo) ctx.globalAlpha = 0.75;
      RW.sprites.dibujar(ctx, this.pj, pose, this.paleta, x, y, this.mirando, this.destello > 0);
      ctx.globalAlpha = 1;
      // Estrellitas y notas girando sobre la cabeza cuando está mareado
      if (this.estado === 'mareado') {
        for (let i = 0; i < 3; i++) {
          const a = this.reloj * 0.12 + (i * Math.PI * 2) / 3;
          const sx = x + Math.cos(a) * 20, sy = y - 124 + Math.sin(a) * 6;
          RW.texto(ctx, i % 2 ? '★' : '♪', sx - 5, sy - 7, i % 2 ? '#ffd24a' : '#ff8ac0', { escala: 2, contorno: '#1a0f26' });
        }
      }
    }
  }

  RW.Luchador = Luchador;
})();
