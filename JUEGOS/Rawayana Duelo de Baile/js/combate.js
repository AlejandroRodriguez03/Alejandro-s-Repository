// =====================================================================
// combate.js: un duelo completo. Rondas, reloj, cámara, colisiones,
// proyectiles, súper, pausa, entrenamiento y la interfaz (HUD).
// =====================================================================
(function () {
  const RW = window.RW;
  const R = RW.rect;

  const NUMEROS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];

  function chocan(a, b) {
    return a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  class Combate {
    // cfg: { p1, p2, escenario, modo, cpu1, cpu2, dificultad, extraIA, rondas, tiempo, alTerminar }
    constructor(cfg) {
      this.cfg = cfg;
      this.esc = RW.escenario(cfg.escenario);
      this.efectos = new RW.Efectos();
      this.proyectiles = [];
      this.frame = 0;
      this.hitstop = 0;
      this.temblor = 0;
      this.controlesActivos = false;
      this.entrenamiento = cfg.modo === 'entreno';
      this.sabrosuraInfinita = false;
      const pj1 = RW.personaje(cfg.p1), pj2 = RW.personaje(cfg.p2);
      this.L = [new RW.Luchador(pj1, 0, 0, this), new RW.Luchador(pj2, 1, cfg.p1 === cfg.p2 ? 1 : 0, this)];
      this.L[0].rival = this.L[1];
      this.L[1].rival = this.L[0];
      if (cfg.cpu1) this.L[0].ia = new RW.IA(cfg.dificultad, cfg.extraIA);
      if (cfg.cpu2) this.L[1].ia = new RW.IA(cfg.dificultad, cfg.extraIA);
      if (this.entrenamiento && this.L[1].ia) this.L[1].ia.modo = 'quieto';
      this.victorias = [0, 0];
      this.necesarias = this.entrenamiento ? 999 : Math.ceil((cfg.rondas || 3) / 2);
      this.ronda = 1;
      this.tiempo = this.entrenamiento ? 0 : cfg.tiempo;
      this.animo = 0.2;
      this.camX = (RW.MUNDO_ANCHO - RW.VISTA) / 2;
      this.superFlash = null;
      this.cornetas = null;
      this.pausa = null;
      this.textoCombo = [null, null];
      this.ultimoLocutor = -999;
      this.L.forEach((l) => { RW.sprites.precargar(l.pj, l.paleta); });
      // Los dos integrantes que no están bailando animan desde la tarima del DJ
      this.djs = RW.PERSONAJES.filter((p) => p.id !== cfg.p1 && p.id !== cfg.p2).slice(0, 2);
      this.cambiarFase(this.entrenamiento ? 'anuncio' : 'presentacion');
      this.L.forEach((l) => { if (!this.entrenamiento) l.cambiarEstado('intro'); });
      RW.audio.musica(this.esc.datos.musica);
    }

    cambiarFase(f) {
      this.fase = f;
      this.tf = 0;
    }

    hablar(txt, prioridad) {
      if (!prioridad && this.frame - this.ultimoLocutor < 90) return;
      this.ultimoLocutor = this.frame;
      RW.audio.locutor(txt);
    }

    // ---------- Proyectiles ----------
    tieneProyectil(L) {
      return this.proyectiles.some((p) => p.dueno === L && !p.esSuper);
    }

    lanzarProyectil(L, fuerte) {
      const e = L.pj.especiales.proyectil;
      const m = L.mirando;
      const p = {
        dueno: L, tipo: e.tipo, x: L.x + m * 18, y: L.y - 36, vx: (fuerte ? e.velB : e.velA) * m,
        w: 14, h: 12, dano: Math.round(e.dano * L.pj.stats.dano), nivel: 'medio', golpes: 1, intervalo: 0, t: 0, vida: 260,
        hitstun: 18, blockstun: 14, empuje: 2, hitstop: 8, chip: true, aturde: 12, fuerte: true,
      };
      if (e.tipo === 'grave') { p.y = L.y - 4; p.h = 12; p.w = 24; p.nivel = 'bajo'; }
      if (e.tipo === 'baqueta') p.y = L.y - 42;
      this.proyectiles.push(p);
      RW.audio.sfx('proyectil');
      this.hablar(e.nombre.toLowerCase());
    }

    lanzarSuper(L, tipo) {
      const m = L.mirando;
      const sup = L.pj.especiales.super;
      const dm = L.pj.stats.dano;
      const base = { dueno: L, tipo, t: 0, esSuper: true, chip: true, hitstun: 20, blockstun: 10, empuje: 0.8, hitstop: 7, aturde: 0, fuerte: true, nivel: 'medio' };
      if (tipo === 'rayo') {
        this.proyectiles.push(Object.assign(base, { sigue: true, x: L.x + m * 14, y: L.y - 40, vx: 0.001 * m, largo: 230, w: 230, h: 18,
          golpes: 6, intervalo: 8, dano: Math.round((sup.dano / 6) * dm), vida: 52 }));
      } else if (tipo === 'riff' || tipo === 'riffGrande') {
        const grande = tipo === 'riffGrande';
        this.proyectiles.push(Object.assign(base, { x: L.x + m * 18, y: L.y - 36, vx: 4.2 * m, w: grande ? 20 : 14, h: grande ? 26 : 16,
          golpes: 1, intervalo: 0, dano: Math.round((grande ? 80 : 55) * dm), vida: 120, derriba: grande }));
      } else if (tipo === 'ondaGigante') {
        this.proyectiles.push(Object.assign(base, { x: L.x + m * 22, y: L.y, vx: 2.8 * m, w: 36, h: 48,
          golpes: 4, intervalo: 9, dano: Math.round((sup.dano / 4) * dm), vida: 160 }));
        this.cornetas = { t: 0, dueno: L };
        this.sacudir(10);
      }
      RW.audio.sfx('choque');
    }

    cajaProyectil(p) {
      if (p.tipo === 'rayo') {
        const x0 = p.vx >= 0 ? p.x : p.x - p.largo;
        return { x: x0, y: p.y - p.h / 2, w: p.largo, h: p.h };
      }
      if (p.tipo === 'grave' || p.tipo === 'ondaGigante') return { x: p.x - p.w / 2, y: p.y - p.h + 4, w: p.w, h: p.h };
      return { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
    }

    // ---------- Eventos ----------
    alGolpear(atacante, defensor, dano, fuerte) {
      this.animo = Math.min(1, this.animo + (fuerte ? 0.18 : 0.07));
      if (defensor.combo >= 2) {
        this.textoCombo[atacante.lado] = { n: defensor.combo, dano: defensor.danoCombo, t: 70 };
        if (defensor.combo === 4) this.hablar('¡Qué combo!', true);
      }
      if (this.entrenamiento) this.ultimoDano = { dano, combo: defensor.combo, total: defensor.danoCombo };
    }

    sacudir(n) {
      this.temblor = Math.max(this.temblor, n);
    }

    flashSuper(L) {
      this.superFlash = { L, t: 0 };
      RW.audio.sfx('super');
      this.hablar(L.pj.especiales.super.nombre, true);
      for (let i = 0; i < 6; i++) this.efectos.nota(L.x, L.y - 40, L.pj.color);
    }

    // ---------- Bucle ----------
    actualizar() {
      const E = RW.entrada;
      // Pausa
      if (this.pausa) { this.actualizarPausa(); return; }
      if (this.fase === 'pelea' && (E.pulsado('START') || E.j[0].pulsado('ATRAS'))) {
        this.pausa = { sel: 0, viendoPasos: false };
        RW.audio.sfx('menu');
        return;
      }
      if (this.entrenamiento && E.pulsado('SELECT')) this.cambiarMuneco(1);

      this.frame++;
      this.tf++;
      if (this.temblor > 0) this.temblor--;
      this.animo = Math.max(0.15, this.animo - 0.002);
      this.textoCombo.forEach((t, i) => { if (t && --t.t <= 0) this.textoCombo[i] = null; });

      // Entradas (se leen aunque haya pausa de impacto, para no perder botones)
      this.L.forEach((l) => l.leerEntrada(this.frame));

      // Destello del súper: todo se congela un momento
      if (this.superFlash) {
        this.superFlash.t++;
        this.efectos.actualizar();
        if (this.superFlash.t >= 44) this.superFlash = null;
        return;
      }

      if (this.hitstop > 0) {
        this.hitstop--;
        this.efectos.actualizar();
        return;
      }

      // Cámara lenta tras el K.O.
      const lento = this.fase === 'ko' && this.tf < 60 && this.tf % 3 !== 0;
      if (!lento) {
        this.L.forEach((l) => l.actualizar());
        this.resolverEspacio();
        this.colisiones();
        this.actualizarProyectiles();
        if (this.cornetas && ++this.cornetas.t > 110) this.cornetas = null;
      }
      this.efectos.actualizar();
      this.L.forEach((l) => {
        // La barra roja baja despacio
        if (l.vidaRoja > l.vida) l.vidaRoja = Math.max(l.vida, l.vidaRoja - (l.estado === 'golpeado' || l.estado === 'derribado' ? 0 : 6));
        else l.vidaRoja = l.vida;
      });
      this.actualizarFase();
    }

    resolverEspacio() {
      const [a, b] = this.L;
      // No se pueden atravesar (salvo saltando por encima)
      const dx = b.x - a.x;
      const solapan = Math.abs(dx) < 18 && Math.abs(a.y - b.y) < 40 &&
        a.estado !== 'agarrado' && b.estado !== 'agarrado' && a.estado !== 'ko' && b.estado !== 'ko';
      if (solapan) {
        const empuje = (18 - Math.abs(dx)) / 2;
        const s = dx === 0 ? (a.mirando > 0 ? 1 : -1) : Math.sign(dx);
        a.x -= s * empuje;
        b.x += s * empuje;
      }
      // Cámara
      const medio = (a.x + b.x) / 2;
      const objetivo = RW.limitar(medio - RW.VISTA / 2, 0, RW.MUNDO_ANCHO - RW.VISTA);
      this.camX += (objetivo - this.camX) * 0.25;
      if (Math.abs(objetivo - this.camX) < 0.3) this.camX = objetivo;
      // Bordes del escenario y de la pantalla
      const min = Math.max(12, this.camX + 12), max = Math.min(RW.MUNDO_ANCHO - 12, this.camX + RW.VISTA - 12);
      [a, b].forEach((l) => {
        const antes = l.x;
        l.x = RW.limitar(l.x, min, max);
        const exceso = antes - l.x;
        // Si el que recibe está contra la pared, el empuje lo absorbe el atacante
        if (exceso !== 0 && (l.estado === 'golpeado' || l.estado === 'guardia')) {
          l.rival.x -= exceso * 0.9;
        }
      });
    }

    colisiones() {
      const golpes = [];
      this.L.forEach((a) => {
        const caja = a.cajaGolpe();
        if (!caja) return;
        const at = a.ataque;
        const multi = at.golpes > 1;
        const puede = multi ? (a.golpesRestantes > 0 && a.af - a.ultimoGolpeAf >= at.intervalo) : !a.golpeConectado;
        if (!puede) return;
        const d = a.rival;
        const cuerpo = d.cajaCuerpo();
        const extra = d.cajaGolpe();
        const toca = chocan(caja, cuerpo) || (extra && chocan(caja, { x: extra.x + 3, y: extra.y + 2, w: extra.w - 6, h: extra.h - 4 }));
        if (!toca) return;
        const ref = cuerpo || extra;
        const ix = Math.max(caja.x, ref.x), ax = Math.min(caja.x + caja.w, ref.x + ref.w);
        const iy = Math.max(caja.y, ref.y), ay = Math.min(caja.y + caja.h, ref.y + ref.h);
        const ultimo = multi && a.golpesRestantes === 1;
        golpes.push({ a, d, g: {
          dano: at.dano, nivel: at.nivel, hitstun: at.hitstun, blockstun: at.blockstun, empuje: at.empuje,
          derriba: at.derriba || (ultimo && at.golpeFinalDerriba), chip: at.chip || at.especial, aturde: at.aturde, hitstop: at.hitstop,
          fuerte: at.fuerte || ultimo, origenX: a.x, x: (ix + ax) / 2, y: (iy + ay) / 2, esSuper: at.esSuper,
        } });
      });
      // Se aplican después de revisar ambos (así los intercambios de golpes son justos)
      golpes.forEach((x) => {
        const res = x.d.recibirGolpe(x.a, x.g);
        if (res !== 'nada') {
          x.a.golpeConectado = true;
          x.a.golpesRestantes--;
          x.a.ultimoGolpeAf = x.a.af;
        }
      });
    }

    actualizarProyectiles() {
      for (const p of this.proyectiles) {
        p.t++;
        if (p.sigue) {
          p.x = p.dueno.x + p.dueno.mirando * 14;
          p.y = p.dueno.y - 40;
          if (p.dueno.estado !== 'ataque') p.golpes = 0;
        } else {
          p.x += p.vx;
        }
        if (p.tipo === 'baqueta' || p.tipo === 'nota') p.y += Math.sin(p.t * 0.2) * 0.3;
        p.vida--;
        if (p.vida <= 0 || p.x < this.camX - 40 || p.x > this.camX + RW.VISTA + 40) p.golpes = 0;
        if (p.golpes <= 0) continue;
        // Impacto con el rival
        const d = p.dueno.rival;
        const caja = this.cajaProyectil(p);
        if ((p.ultimo === undefined || p.t - p.ultimo >= p.intervalo) && chocan(caja, d.cajaCuerpo())) {
          const ultimo = p.golpes === 1;
          const res = d.recibirGolpe(p.dueno, {
            dano: p.dano, nivel: p.nivel, hitstun: p.hitstun, blockstun: p.blockstun, empuje: p.empuje,
            derriba: p.derriba || (p.esSuper && ultimo && p.golpes !== undefined && p.tipo !== 'riff'), chip: p.chip, aturde: p.aturde,
            hitstop: p.hitstop, fuerte: p.fuerte, origenX: d.x - Math.sign(p.vx) * 10,
            x: d.x - Math.sign(p.vx) * 6, y: p.tipo === 'grave' || p.tipo === 'ondaGigante' ? d.y - 14 : p.y, esSuper: p.esSuper,
          });
          if (res !== 'nada') { p.golpes--; p.ultimo = p.t; }
        }
      }
      // Choque entre proyectiles
      for (let i = 0; i < this.proyectiles.length; i++) {
        for (let j = i + 1; j < this.proyectiles.length; j++) {
          const p = this.proyectiles[i], q = this.proyectiles[j];
          if (p.dueno === q.dueno || p.golpes <= 0 || q.golpes <= 0) continue;
          if (p.ultimoChoque && p.t - p.ultimoChoque < 8) continue;
          if (chocan(this.cajaProyectil(p), this.cajaProyectil(q))) {
            p.golpes--; q.golpes--;
            p.ultimoChoque = p.t; q.ultimoChoque = q.t;
            const x = (p.x + q.x) / 2;
            this.efectos.chispa(x, (p.y + q.y) / 2 - 4, true, '#ffffff');
            RW.audio.sfx('choque');
          }
        }
      }
      this.proyectiles = this.proyectiles.filter((p) => p.golpes > 0);
    }

    actualizarFase() {
      const [a, b] = this.L;
      switch (this.fase) {
        case 'presentacion':
          if (this.tf >= 100) {
            this.L.forEach((l) => l.cambiarEstado('quieto'));
            this.cambiarFase('anuncio');
          }
          break;

        case 'anuncio':
          if (this.tf === 1) {
            RW.audio.sfx('ronda');
            if (this.entrenamiento) this.hablar('Entrenamiento', true);
            else if (this.esRondaFinal()) this.hablar('¡Ronda final!', true);
            else this.hablar('Ronda ' + (NUMEROS[this.ronda] || this.ronda), true);
          }
          if (this.tf === 70) { RW.audio.sfx('pelea'); this.hablar('¡A bailar!', true); }
          if (this.tf >= 100) {
            this.cambiarFase('pelea');
            this.controlesActivos = true;
            this.relojFrames = 0;
          }
          break;

        case 'pelea': {
          if (this.entrenamiento) { this.actualizarEntrenamiento(); break; }
          if (a.ko || b.ko) {
            this.controlesActivos = false;
            this.cambiarFase('ko');
            RW.audio.sfx('ko');
            this.hablar(a.ko && b.ko ? '¡Doble K O!' : '¡Sin flow!', true);
            this.animo = 1;
            break;
          }
          if (this.tiempo > 0) {
            this.relojFrames++;
            if (this.relojFrames >= 60) {
              this.relojFrames = 0;
              this.tiempo--;
              if (this.tiempo <= 10 && this.tiempo > 0) RW.audio.sfx('cuenta');
              if (this.tiempo <= 0) {
                this.controlesActivos = false;
                this.cambiarFase('tiempo');
                this.hablar('¡Se acabó el tiempo!', true);
              }
            }
          }
          break;
        }

        case 'ko': {
          const listos = this.L.every((l) => !l.ko || l.estado === 'ko');
          if (this.tf > 70 && listos && !this.decidida) {
            this.decidida = true;
            this.ganadorRonda = a.ko && b.ko ? -1 : (a.ko ? 1 : 0);
            if (this.ganadorRonda >= 0) {
              const g = this.L[this.ganadorRonda];
              g.cambiarEstado('victoria');
              g.vx = 0;
            }
            this.tfGanador = this.tf;
            this.anunciarGanador();
          }
          if (this.decidida && this.tf - this.tfGanador > 150) this.terminarRonda();
          break;
        }

        case 'tiempo':
          if (this.tf === 80) {
            this.decidida = true;
            const va = a.vida / a.vidaMax, vb = b.vida / b.vidaMax;
            this.ganadorRonda = Math.abs(va - vb) < 0.001 ? -1 : (va > vb ? 0 : 1);
            if (this.ganadorRonda >= 0) {
              this.L[this.ganadorRonda].cambiarEstado('victoria');
              this.L[1 - this.ganadorRonda].cambiarEstado('derrotaTiempo');
            }
            this.tfGanador = this.tf;
            this.anunciarGanador();
          }
          if (this.tf > 80 && this.tf - this.tfGanador > 150) this.terminarRonda();
          break;

        case 'fin':
          if (this.tf === 140 && this.cfg.alTerminar) {
            this.cfg.alTerminar({
              ganador: this.ganadorCombate, p1: this.cfg.p1, p2: this.cfg.p2,
              perfecto: this.perfecto, victorias: this.victorias.slice(),
            });
          }
          break;
      }
    }

    anunciarGanador() {
      const g = this.ganadorRonda;
      this.perfecto = g >= 0 && this.L[g].vida === this.L[g].vidaMax;
      if (g < 0) this.hablar('Empate', true);
      else if (this.perfecto) this.hablar('¡Perfecto!', true);
      else this.hablar('Gana ' + this.L[g].pj.nombre.toLowerCase(), true);
      if (g >= 0) RW.audio.sfx('pose');
    }

    esRondaFinal() {
      return this.victorias[0] === this.necesarias - 1 && this.victorias[1] === this.necesarias - 1;
    }

    terminarRonda() {
      const g = this.ganadorRonda;
      if (g === -1) { this.victorias[0]++; this.victorias[1]++; }
      else this.victorias[g]++;
      this.ganadorRonda = null;
      this.decidida = false;
      const v = this.victorias;
      const termino = v[0] >= this.necesarias || v[1] >= this.necesarias || this.ronda >= 9;
      if (termino) {
        this.ganadorCombate = v[0] === v[1] ? -1 : (v[0] > v[1] ? 0 : 1);
        if (this.ganadorCombate === -1 && this.ronda < 9) {
          // Empate en el global: una ronda más
          this.siguienteRonda();
          return;
        }
        this.cambiarFase('fin');
        if (this.ganadorCombate >= 0) {
          this.L[this.ganadorCombate].cambiarEstado('victoria');
          const humano = !this.L[this.ganadorCombate].ia;
          RW.audio.musica(humano || this.cfg.modo === '2j' ? 'victoria' : 'derrota');
        }
        return;
      }
      this.siguienteRonda();
    }

    siguienteRonda() {
      this.ronda++;
      this.tiempo = this.cfg.tiempo;
      this.proyectiles = [];
      this.cornetas = null;
      this.L[0].reiniciar(160);
      this.L[1].reiniciar(240);
      this.camX = (RW.MUNDO_ANCHO - RW.VISTA) / 2;
      this.animo = 0.2;
      this.controlesActivos = false;
      this.cambiarFase('anuncio');
    }

    // ---------- Entrenamiento ----------
    actualizarEntrenamiento() {
      this.L.forEach((l) => {
        if (l.ko) { l.ko = false; }
        if (this.frame - l.ultimoGolpeRecibido > 70 && l.neutro()) l.vida = l.vidaMax;
        if (l.vida <= 0) l.vida = 1;
      });
    }

    cambiarMuneco(d) {
      const ia = this.L[1].ia;
      if (!ia) return;
      const modos = ['quieto', 'agachado', 'bloquear', 'saltar', 'cpu'];
      ia.modo = modos[(modos.indexOf(ia.modo) + d + modos.length) % modos.length];
      RW.audio.sfx('menu');
    }

    // ---------- Pausa ----------
    opcionesPausa() {
      const o = ['CONTINUAR', 'LISTA DE PASOS'];
      if (this.entrenamiento) {
        o.push('MUÑECO: ' + { quieto: 'QUIETO', agachado: 'AGACHADO', bloquear: 'BLOQUEA', saltar: 'SALTA', cpu: 'CPU' }[this.L[1].ia ? this.L[1].ia.modo : 'cpu']);
        o.push('SABROSURA LLENA: ' + (this.sabrosuraInfinita ? 'SÍ' : 'NO'));
      }
      o.push('SALIR AL MENÚ');
      return o;
    }

    actualizarPausa() {
      const E = RW.entrada;
      const p = this.pausa;
      if (p.viendoPasos) {
        if (E.aceptar() || E.atras()) { p.viendoPasos = false; RW.audio.sfx('atras'); }
        return;
      }
      const ops = this.opcionesPausa();
      if (E.repetir('abajo')) { p.sel = (p.sel + 1) % ops.length; RW.audio.sfx('menu'); }
      if (E.repetir('arriba')) { p.sel = (p.sel + ops.length - 1) % ops.length; RW.audio.sfx('menu'); }
      const elegido = ops[p.sel];
      if (E.atras()) { this.pausa = null; RW.audio.sfx('atras'); return; }
      if (elegido.startsWith('MUÑECO') && (E.repetir('der') || E.repetir('izq'))) this.cambiarMuneco(E.repetir('der') ? 1 : -1);
      if (E.aceptar()) {
        RW.audio.sfx('aceptar');
        if (elegido === 'CONTINUAR') this.pausa = null;
        else if (elegido === 'LISTA DE PASOS') p.viendoPasos = true;
        else if (elegido.startsWith('MUÑECO')) this.cambiarMuneco(1);
        else if (elegido.startsWith('SABROSURA')) {
          this.sabrosuraInfinita = !this.sabrosuraInfinita;
          if (this.sabrosuraInfinita) this.L.forEach((l) => { l.sabrosura = 300; });
        } else if (elegido === 'SALIR AL MENÚ') {
          this.pausa = null;
          if (this.cfg.alSalir) this.cfg.alSalir();
        }
      }
    }

    // ---------- Dibujo ----------
    dibujar(ctx) {
      const sx = this.temblor > 0 ? Math.round((Math.random() - 0.5) * 6) : 0;
      const sy = this.temblor > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
      const camX = this.camX;
      ctx.save();
      ctx.translate(sx, sy);
      this.esc.dibujar(ctx, Math.round(camX * RW.K), this.frame, this.animo, this.djs);

      if (this.cornetas) {
        const caida = Math.min(1, this.cornetas.t / 12);
        const y = RW.PISO - (1 - caida) * 220;
        RW.dibujarCorneta(ctx, 34, y, this.frame);
        RW.dibujarCorneta(ctx, RW.ANCHO - 34, y, this.frame);
      }

      if (this.superFlash) {
        ctx.fillStyle = 'rgba(10, 4, 30, 0.6)';
        ctx.fillRect(-8, -8, RW.ANCHO + 16, RW.ALTO + 16);
        const L = this.superFlash.L;
        const t = this.superFlash.t;
        const cx = RW.aPx(L.x, camX), cy = RW.aPy(L.y) - 60;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2 + t * 0.05;
          for (let j = 20; j < 200; j += 3) R(ctx, cx + Math.cos(a) * j, cy + Math.sin(a) * j, 2, 2, i % 2 ? L.pj.color : '#ffffff');
        }
      }

      // El que ataca se dibuja encima
      const orden = this.L.slice().sort((p, q) => (p.estado === 'ataque' ? 1 : 0) - (q.estado === 'ataque' ? 1 : 0));
      orden.forEach((l) => l.dibujar(ctx, camX));
      this.proyectiles.forEach((p) => RW.dibujarProyectil(ctx, p, camX));
      this.efectos.dibujar(ctx, camX);
      ctx.restore();

      if (this.superFlash) this.dibujarBandaSuper(ctx);
      this.dibujarHUD(ctx);
      this.dibujarMensajes(ctx);
      if (this.pausa) this.dibujarPausa(ctx);
    }

    dibujarBandaSuper(ctx) {
      const s = this.superFlash;
      const L = s.L;
      const entrada = Math.min(1, s.t / 8);
      const desliz = Math.round((1 - entrada) * RW.ANCHO) * (L.lado === 0 ? -1 : 1);
      const y = 84;
      ctx.save();
      ctx.translate(desliz, 0);
      ctx.fillStyle = RW.oscurecer(L.pj.color, 0.5);
      ctx.beginPath(); ctx.moveTo(0, y - 4); ctx.lineTo(RW.ANCHO, y - 14); ctx.lineTo(RW.ANCHO, y + 50); ctx.lineTo(0, y + 60); ctx.fill();
      ctx.fillStyle = L.pj.color;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(RW.ANCHO, y - 10); ctx.lineTo(RW.ANCHO, y + 46); ctx.lineTo(0, y + 56); ctx.fill();
      for (let i = 0; i < RW.ANCHO; i += 16) R(ctx, (i + s.t * 6) % RW.ANCHO, y - 6, 6, 60, 'rgba(255,255,255,0.12)');
      ctx.drawImage(RW.sprites.retrato(L.pj, L.paleta, 'normal', 72), 8, y - 14);
      RW.textoEstilo(ctx, '¡SÚPER!', 90, y + 6, 'oro', 3);
      RW.textoEstilo(ctx, L.pj.especiales.super.nombre, 92, y + 34, 'blanco', 1);
      ctx.restore();
    }

    // Paralelogramo (las barras inclinadas del HUD)
    para(ctx, x, y, w, h, incl, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(Math.round(x + incl), y);
      ctx.lineTo(Math.round(x + w + incl), y);
      ctx.lineTo(Math.round(x + w), y + h);
      ctx.lineTo(Math.round(x), y + h);
      ctx.closePath();
      ctx.fill();
    }

    estrella(ctx, cx, cy, r, relleno, borde) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.45 : r;
        ctx.lineTo(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr));
      }
      ctx.closePath();
      ctx.fillStyle = borde;
      ctx.save(); ctx.translate(1, 1); ctx.fill(); ctx.restore();
      ctx.fillStyle = relleno;
      ctx.fill();
    }

    dibujarRetratoHUD(ctx, l, izq) {
      const w = 46, h = 44, y = 3;
      const x = izq ? 4 : RW.ANCHO - 4 - w;
      const fondo = izq ? '#e8642a' : '#2a5ad8';
      ctx.save();
      ctx.beginPath();
      const i = izq ? 6 : -6;
      ctx.moveTo(x + Math.max(0, i), y); ctx.lineTo(x + w + Math.max(0, i), y);
      ctx.lineTo(x + w + Math.min(0, i), y + h); ctx.lineTo(x + Math.min(0, i), y + h); ctx.closePath();
      ctx.fillStyle = '#1a0f26'; ctx.fill();
      ctx.restore();
      this.para(ctx, x + 1, y + 1, w - 3, h - 2, i * 0.9, '#ffffff');
      this.para(ctx, x + 2, y + 2, w - 5, h - 4, i * 0.85, fondo);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, w - 4, h - 4);
      ctx.clip();
      const ret = RW.sprites.retrato(l.pj, l.paleta, l.vida <= l.vidaMax * 0.25 ? 'derrota' : 'normal', 52);
      if (izq) ctx.drawImage(ret, x - 2, y - 4);
      else { ctx.translate(x + w + 2, y - 4); ctx.scale(-1, 1); ctx.drawImage(ret, 0, 0); }
      ctx.restore();
    }

    dibujarBarraVida(ctx, l, izq) {
      const w = 124, h = 9, y = 26;
      const x = izq ? 56 : RW.ANCHO - 56 - w;
      const incl = izq ? 5 : -5;
      this.para(ctx, x - 2, y - 2, w + 4, h + 4, incl, '#1a0f26');
      this.para(ctx, x, y, w, h, incl, '#3a1a3a');
      const frac = l.vida / l.vidaMax, fracRoja = l.vidaRoja / l.vidaMax;
      const wr = Math.round(w * fracRoja), wv = Math.round(w * frac);
      const peligro = frac < 0.25 && this.frame % 20 < 10;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + Math.max(0, incl), y); ctx.lineTo(x + w + Math.max(0, incl), y);
      ctx.lineTo(x + w + Math.min(0, incl), y + h); ctx.lineTo(x + Math.min(0, incl), y + h);
      ctx.closePath();
      ctx.clip();
      // La vida que queda está del lado de afuera
      const xr = izq ? x - 6 : x + w - wr + 6;
      const xv = izq ? x - 6 : x + w - wv + 6;
      R(ctx, xr, y, wr, h, '#ff4a3a');
      R(ctx, xv, y, wv, h, peligro ? '#ff7a6a' : '#ffd23a');
      R(ctx, xv, y, wv, 2, peligro ? '#ffc0b0' : '#fff4a8');
      R(ctx, xv, y + h - 2, wv, 2, peligro ? '#c83a2a' : '#e8a020');
      ctx.restore();
    }

    dibujarHUD(ctx) {
      const [a, b] = this.L;
      [a, b].forEach((l, i) => {
        const izq = i === 0;
        this.dibujarRetratoHUD(ctx, l, izq);
        this.dibujarBarraVida(ctx, l, izq);
        RW.textoEstilo(ctx, l.pj.nombre, izq ? 58 : RW.ANCHO - 58, 6, 'blanco', 2, izq ? 'izq' : 'der');
        // Estrellas: rondas ganadas
        const n = this.entrenamiento ? 0 : this.necesarias;
        for (let k = 0; k < n; k++) {
          const ganada = k < this.victorias[i];
          const ex = izq ? 162 - k * 14 : RW.ANCHO - 162 + k * 14;
          this.estrella(ctx, ex, 12, 6, ganada ? (izq ? '#ff3a3a' : '#3a7aff') : '#3a2a50', '#1a0f26');
        }
        // Círculos: aturdimiento acumulado
        for (let k = 0; k < 3; k++) {
          const cx = izq ? 168 - k * 10 : RW.ANCHO - 168 + k * 10;
          const lleno = l.aturdimiento >= (k + 1) * 30 || l.estado === 'mareado';
          RW.circulo(ctx, cx, 42, 4, '#1a0f26');
          RW.circulo(ctx, cx, 42, 3, lleno ? '#ff9a2a' : '#2a6a8a');
          if (!lleno) RW.circulo(ctx, cx, 42, 1.5, '#0a1a2a');
        }
        // Barra de SABROSURA (súper) con niveles
        const nivel = Math.floor(l.sabrosura / 100);
        const resto = nivel >= 3 ? 1 : (l.sabrosura % 100) / 100;
        const bw = 112, bh = 7, by = 200;
        const bx = izq ? 40 : RW.ANCHO - 40 - bw;
        const incl = izq ? 4 : -4;
        this.para(ctx, bx - 2, by - 2, bw + 4, bh + 4, incl, '#1a0f26');
        this.para(ctx, bx, by, bw, bh, incl, '#2a1a40');
        const w = Math.round(bw * resto);
        if (w > 0) {
          ctx.save();
          ctx.beginPath(); ctx.rect(izq ? bx : bx + bw - w, by, w + 6, bh); ctx.clip();
          const grad = izq ? ['#e8323c', '#ff8a2a', '#ffd23a'] : ['#2a5ad8', '#3aa8ff', '#7ae8ff'];
          for (let k = 0; k < bw + 8; k++) {
            const t = k / bw;
            const c = t < 0.5 ? RW.mezclar(grad[0], grad[1], t * 2) : RW.mezclar(grad[1], grad[2], (t - 0.5) * 2);
            R(ctx, izq ? bx - 4 + k : bx + bw + 4 - k, by, 1, bh, c);
          }
          R(ctx, izq ? bx : bx + bw - w, by, w + 6, 2, 'rgba(255,255,255,0.45)');
          ctx.restore();
          if (nivel >= 3 && this.frame % 20 < 10) this.para(ctx, bx, by, bw, bh, incl, 'rgba(255,255,255,0.35)');
        }
        RW.textoEstilo(ctx, String(nivel), izq ? 8 : RW.ANCHO - 8, 182, 'oro', 4, izq ? 'izq' : 'der');
        if (nivel >= 3) RW.textoEstilo(ctx, 'MAX', izq ? 40 : RW.ANCHO - 40, 186, 'oro', 1, izq ? 'izq' : 'der');
        else if (nivel >= 1 && this.frame % 40 < 28) RW.textoEstilo(ctx, 'L: SÚPER', izq ? 40 : RW.ANCHO - 40, 186, 'blanco', 1, izq ? 'izq' : 'der');
      });

      // Reloj dentro de un estallido
      ctx.beginPath();
      for (let i = 0; i < 32; i++) {
        const ang = (i / 32) * Math.PI * 2;
        const r = i % 2 ? 17 : 25 + (i % 4 === 0 ? 3 : 0);
        ctx.lineTo(Math.round(192 + Math.cos(ang) * r * 1.05), Math.round(22 + Math.sin(ang) * r * 0.92));
      }
      ctx.closePath();
      ctx.fillStyle = '#5a1a2a';
      ctx.save(); ctx.translate(1, 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#0c0814';
      ctx.fill();
      const txt = this.tiempo > 0 ? String(this.tiempo).padStart(2, '0') : '∞';
      RW.textoEstilo(ctx, txt, 192, 13, this.tiempo > 0 && this.tiempo <= 10 && this.frame % 30 < 15 ? 'rosa' : 'oro', 3, 'centro');

      // Contador de combo
      this.textoCombo.forEach((t, i) => {
        if (!t) return;
        const izq = i === 0;
        const x = izq ? 10 : RW.ANCHO - 10;
        RW.textoEstilo(ctx, t.n + ' PASOS', x, 62, 'oro', 2, izq ? 'izq' : 'der');
        RW.textoEstilo(ctx, '¡COMBO!', x, 84, 'blanco', 1, izq ? 'izq' : 'der');
      });

      if (this.entrenamiento) {
        const ia = this.L[1].ia;
        const modo = ia ? { quieto: 'QUIETO', agachado: 'AGACHADO', bloquear: 'BLOQUEA', saltar: 'SALTA', cpu: 'CPU' }[ia.modo] : '';
        RW.textoEstilo(ctx, 'ENTRENAMIENTO', 192, 56, 'blanco', 1, 'centro');
        RW.textoEstilo(ctx, 'MUÑECO: ' + modo + ' (SELECT)', 192, 186, 'azul', 1, 'centro');
        if (this.ultimoDano) RW.textoEstilo(ctx, 'DAÑO ' + this.ultimoDano.dano + '  TOTAL ' + this.ultimoDano.total, 192, 70, 'oro', 1, 'centro');
      }
    }

    mensaje(ctx, txt, y, estilo, escala, tf) {
      tf = tf === undefined ? this.tf : tf;
      const entrada = Math.min(1, tf / 8);
      const x = 192 + Math.round((1 - entrada) * 320);
      RW.textoEstilo(ctx, txt, x, y, estilo, escala || 4, 'centro');
    }

    dibujarMensajes(ctx) {
      switch (this.fase) {
        case 'presentacion':
          if (this.tf > 10) {
            RW.textoEstilo(ctx, this.L[0].pj.nombre, 96, 90, 'oro', 3, 'centro');
            RW.textoEstilo(ctx, 'VS', 192, 90, 'blanco', 3, 'centro');
            RW.textoEstilo(ctx, this.L[1].pj.nombre, 288, 90, 'oro', 3, 'centro');
          }
          break;
        case 'anuncio':
          if (this.tf < 70) {
            const t = this.entrenamiento ? 'PRÁCTICA' : this.esRondaFinal() ? 'RONDA FINAL' : 'RONDA ' + this.ronda;
            this.mensaje(ctx, t, 84, 'oro', this.esRondaFinal() ? 3 : 4);
          } else if (this.tf < 100) {
            this.mensaje(ctx, '¡A BAILAR!', 84, 'rosa', 4, this.tf - 70);
          }
          break;
        case 'ko':
          if (this.tf < 90 || !this.decidida) this.mensaje(ctx, this.L[0].ko && this.L[1].ko ? '¡DOBLE K.O.!' : '¡SIN FLOW!', 82, 'rosa', 4);
          else this.mensajeGanador(ctx);
          break;
        case 'tiempo':
          if (this.tf < 80) this.mensaje(ctx, '¡TIEMPO!', 82, 'azul', 4);
          else this.mensajeGanador(ctx);
          break;
        case 'fin':
          if (this.ganadorCombate >= 0) {
            const g = this.L[this.ganadorCombate];
            RW.textoEstilo(ctx, '¡' + g.pj.nombre + ' GANA', 192, 74, 'oro', 3, 'centro');
            RW.textoEstilo(ctx, 'LA PISTA!', 192, 104, 'oro', 3, 'centro');
          } else {
            RW.textoEstilo(ctx, 'EMPATE', 192, 84, 'azul', 4, 'centro');
          }
          break;
      }
    }

    mensajeGanador(ctx) {
      const g = this.ganadorRonda !== null && this.ganadorRonda !== undefined ? this.ganadorRonda : this.ultimoGanadorMostrado;
      this.ultimoGanadorMostrado = g;
      if (g === -1) RW.textoEstilo(ctx, 'EMPATE', 192, 82, 'azul', 4, 'centro');
      else if (g !== undefined && g !== null) {
        RW.textoEstilo(ctx, 'GANA ' + this.L[g].pj.nombre, 192, 78, 'oro', 3, 'centro');
        if (this.perfecto) RW.textoEstilo(ctx, '¡PERFECTO!', 192, 108, 'azul', 3, 'centro');
      }
    }

    dibujarPausa(ctx) {
      ctx.fillStyle = 'rgba(10, 4, 30, 0.72)';
      ctx.fillRect(0, 0, RW.ANCHO, RW.ALTO);
      if (this.pausa.viendoPasos) {
        const humano = this.L.find((l) => !l.ia) || this.L[0];
        RW.ui.listaPasos(ctx, humano.pj, 14);
        RW.texto(ctx, 'A / B: VOLVER', 192, 202, '#bfe4ff', { alinear: 'centro' });
        return;
      }
      const ops = this.opcionesPausa();
      const h = ops.length * 16 + 40;
      const y0 = Math.round((RW.ALTO - h) / 2);
      RW.ui.panel(ctx, 92, y0, 200, h);
      RW.textoEstilo(ctx, 'PAUSA', 192, y0 + 10, 'oro', 2, 'centro');
      ops.forEach((o, i) => {
        const sel = i === this.pausa.sel;
        if (sel) RW.rect(ctx, 100, y0 + 30 + i * 16, 184, 13, 'rgba(255, 90, 150, 0.35)');
        RW.texto(ctx, (sel ? '▶ ' : '  ') + o, 108, y0 + 33 + i * 16, sel ? '#ffffff' : '#c8b8f0', { contorno: '#1a0f26' });
      });
    }
  }

  RW.Combate = Combate;
})();
