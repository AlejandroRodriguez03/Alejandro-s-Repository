// =====================================================================
// ia.js: la CPU. Decide qué "apretar" cada fotograma según la distancia,
// lo que hace el rival y el nivel de dificultad. Reacciona con un retraso
// (como una persona) para que se le pueda ganar.
// =====================================================================
(function () {
  const RW = window.RW;

  const NIVELES = [
    { nombre: 'FÁCIL', reaccion: 24, bloqueo: 0.28, antiaereo: 0.15, castigo: 0.2, combo: 0.15, proy: 0.012, aire: 0.06, ritmo: 28, agresion: 0.35, salto: 0.004, super: 0.004 },
    { nombre: 'NORMAL', reaccion: 14, bloqueo: 0.58, antiaereo: 0.5, castigo: 0.5, combo: 0.45, proy: 0.02, aire: 0.12, ritmo: 16, agresion: 0.55, salto: 0.006, super: 0.01 },
    { nombre: 'DIFÍCIL', reaccion: 7, bloqueo: 0.86, antiaereo: 0.82, castigo: 0.85, combo: 0.8, proy: 0.03, aire: 0.25, ritmo: 9, agresion: 0.7, salto: 0.008, super: 0.03 },
  ];

  class IA {
    constructor(nivel, extra) {
      const base = NIVELES[RW.limitar(nivel, 0, 2)];
      this.p = Object.assign({}, base);
      // En el modo arcade cada rival es un poquito más difícil
      if (extra) {
        this.p.reaccion = Math.max(5, this.p.reaccion - extra * 3);
        ['bloqueo', 'antiaereo', 'castigo', 'combo'].forEach((k) => { this.p[k] = Math.min(0.95, this.p[k] + extra * 0.06); });
      }
      this.modo = 'cpu';          // en entrenamiento: 'quieto' | 'agachado' | 'bloquear' | 'saltar' | 'cpu'
      this.espera = 0;
      this.mantener = {};
      this.amenazaDesde = -1;
      this.respuesta = null;
      this.ultimaAmenaza = null;
    }

    leer(L, r, c) {
      const s = { izq: false, der: false, arriba: false, abajo: false, pulsar: [], comando: null };
      const adelante = L.mirando > 0 ? 'der' : 'izq';
      const atras = L.mirando > 0 ? 'izq' : 'der';
      const dist = Math.abs(r.x - L.x);
      const P = this.p;
      const azar = Math.random;

      if (!c.controlesActivos) return s;

      if (L.estado === 'mareado') {
        if (c.frame % 4 === 0) s.pulsar.push(RW.elegir(['A', 'B', 'R']));
        s[c.frame % 10 < 5 ? 'izq' : 'der'] = true;
        return s;
      }

      // ----- Modos del muñeco de entrenamiento -----
      if (this.modo !== 'cpu') {
        if (this.modo === 'agachado') s.abajo = true;
        if (this.modo === 'saltar' && L.neutro()) s.arriba = true;
        if (this.modo === 'bloquear') {
          const amenaza = r.estado === 'ataque' || c.proyectiles.some((p) => p.dueno === r);
          if (amenaza || L.estado === 'guardia') {
            s[atras] = true;
            const bajo = r.estado === 'ataque' && r.ataque && r.ataque.nivel === 'bajo';
            const aereo = r.estado === 'ataque' && r.ataque && r.ataque.nivel === 'aereo';
            if (bajo || (!aereo && c.frame % 120 < 60)) s.abajo = true;
            const proy = c.proyectiles.find((p) => p.dueno === r);
            if (proy && proy.nivel === 'bajo') s.abajo = true;
          }
        }
        return s;
      }

      // ----- En el aire: atacar al caer cerca -----
      if (L.estado === 'salto') {
        if (!L.ataqueAereoUsado && L.vy > -0.5 && dist < 36 && azar() < P.aire * 3) s.pulsar.push(RW.elegir(['R', 'B', 'A']));
        return s;
      }

      // ----- Combos: cancelar un golpe que conectó -----
      if (L.estado === 'ataque' && L.golpeConectado && L.ataque && L.ataque.cancelable && !this.yaCancelo) {
        this.yaCancelo = true;
        if (azar() < P.combo) {
          if (L.sabrosura >= 100 && azar() < 0.5) s.comando = 'super';
          else if (dist < 34 && azar() < 0.4) s.comando = 'antiaereoB';
          else if (!c.tieneProyectil(L) && azar() < 0.5) s.comando = 'proyectilB';
          else s.comando = 'giro';
        }
        return s;
      }
      if (L.estado !== 'ataque') this.yaCancelo = false;

      // Defensa automática mientras dura la guardia
      if (L.estado === 'guardia') {
        s[atras] = true;
        if (L.guardiaAgachado) s.abajo = true;
        return s;
      }

      // ----- Detectar amenazas -----
      const proy = c.proyectiles.find((p) => p.dueno === r && Math.sign(L.x - p.x) === Math.sign(p.vx) && Math.abs(p.x - L.x) < 110);
      let amenaza = null;
      if (r.enAire && (r.estado === 'salto' || r.estado === 'ataque') && dist < 72 && (Math.sign(r.vx) === Math.sign(L.x - r.x) || dist < 30)) amenaza = 'aire';
      else if (r.estado === 'ataque' && r.ataque && dist < 80 && r.af <= r.ataque.fin && !r.enAire) amenaza = 'suelo';
      else if (proy) amenaza = 'proyectil';

      if (amenaza) {
        if (this.ultimaAmenaza !== amenaza) {
          this.ultimaAmenaza = amenaza;
          this.amenazaDesde = c.frame;
          this.respuesta = null;
        }
        if (c.frame - this.amenazaDesde >= P.reaccion && L.neutro()) {
          if (!this.respuesta) this.respuesta = this.elegirRespuesta(amenaza, L, r, c, dist, proy);
          const resp = this.respuesta;
          if (resp === 'bloquearAlto') { s[atras] = true; return s; }
          if (resp === 'bloquearBajo') { s[atras] = true; s.abajo = true; return s; }
          if (resp === 'saltarProy') { s.arriba = true; s[adelante] = true; this.respuesta = 'nada'; return s; }
          if (resp && resp !== 'nada') { s.comando = resp; this.respuesta = 'nada'; return s; }
        }
      } else {
        this.ultimaAmenaza = null;
        this.respuesta = null;
      }

      if (!L.neutro()) return s;

      // ----- Castigar si el rival quedó vendido -----
      const vendido = (r.estado === 'ataque' && r.ataque && r.af > r.ataque.fin && !r.enAire) ||
        r.estado === 'aterrizaje' || r.estado === 'provocar' || r.estado === 'mareado';
      if (vendido && dist < 44 && azar() < P.castigo * 0.25) {
        if (L.sabrosura >= 100 && azar() < 0.5) s.comando = 'super';
        else s.comando = RW.elegir(['antiaereoB', 'B', 'R', 'agR']);
        return s;
      }
      if (r.estado === 'mareado' && dist >= 44) { s[adelante] = true; return s; }

      // Súper
      if (L.sabrosura >= 100 && dist < 110 && azar() < P.super) { s.comando = 'super'; return s; }

      // ----- Plan según la distancia -----
      if (this.espera > 0) {
        this.espera--;
        Object.assign(s, this.mantener);
        return s;
      }
      this.espera = Math.round(P.ritmo * (0.6 + azar() * 0.8));
      this.mantener = {};

      if (dist > 120) {
        const x = azar();
        if (!c.tieneProyectil(L) && x < P.proy * 18) s.comando = azar() < 0.5 ? 'proyectilA' : 'proyectilB';
        else if (x < 0.06) s.comando = 'provocar';
        else if (x < 0.75) this.mantener[adelante] = true;
        else this.espera = Math.round(this.espera * 0.5);
      } else if (dist > 42) {
        const x = azar();
        if (x < P.agresion * 0.5) this.mantener[adelante] = true;
        else if (x < P.agresion * 0.5 + 0.12 && dist < 95) { this.mantener.arriba = true; this.mantener[adelante] = true; this.espera = 4; }
        else if (x < P.agresion * 0.5 + 0.22 && !c.tieneProyectil(L)) s.comando = azar() < 0.5 ? 'proyectilA' : 'proyectilB';
        else if (x < P.agresion * 0.5 + 0.32 && dist < 50) s.comando = RW.elegir(['R', 'agR']);
        else if (x < P.agresion * 0.5 + 0.4) this.mantener[atras] = true;
        else this.mantener[adelante] = true;
      } else {
        const x = azar();
        if (x < 0.22) s.comando = 'A';
        else if (x < 0.34) s.comando = 'agA';
        else if (x < 0.48) s.comando = 'B';
        else if (x < 0.58) s.comando = 'agR';
        else if (x < 0.68 && dist < 28) s.comando = 'agarre';
        else if (x < 0.74) s.comando = 'giro';
        else if (x < 0.84) this.mantener[atras] = true;
        else { this.mantener.abajo = true; this.mantener[atras] = true; }
        this.espera = Math.round(this.espera * 0.6);
      }
      Object.assign(s, this.mantener);
      return s;
    }

    elegirRespuesta(amenaza, L, r, c, dist, proy) {
      const P = this.p;
      const azar = Math.random;
      if (amenaza === 'aire') {
        const x = azar();
        if (x < P.antiaereo) return dist < 40 ? 'antiaereoB' : 'agB';
        if (x < P.antiaereo + P.bloqueo * 0.6) return 'bloquearAlto';
        return 'nada';
      }
      if (amenaza === 'suelo') {
        if (azar() < P.bloqueo) {
          const bajo = r.ataque && r.ataque.nivel === 'bajo';
          if (bajo) return 'bloquearBajo';
          return azar() < 0.5 ? 'bloquearBajo' : 'bloquearAlto';
        }
        return 'nada';
      }
      if (amenaza === 'proyectil') {
        const x = azar();
        const d = Math.abs(proy.x - L.x);
        if (x < 0.3 && d > 40 && d < 90) return 'saltarProy';
        if (x < 0.45 && !c.tieneProyectil(L)) return 'proyectilB';
        if (x < 0.45 + P.bloqueo) return proy.nivel === 'bajo' ? 'bloquearBajo' : 'bloquearAlto';
        return 'nada';
      }
      return 'nada';
    }
  }

  RW.IA = IA;
  RW.NIVELES_IA = NIVELES;
})();
