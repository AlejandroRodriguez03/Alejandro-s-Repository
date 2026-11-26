// =====================================================================
// entrada.js: teclado, mandos (gamepad) y botones táctiles de la consola.
// Cada jugador tiene un "mando" virtual con los botones de la portátil:
// arriba, abajo, izq, der, A, B, L, R, START y SELECT.
// =====================================================================
(function () {
  const RW = window.RW;

  const BOTONES = ['arriba', 'abajo', 'izq', 'der', 'A', 'B', 'L', 'R', 'START', 'SELECT', 'ATRAS'];

  // Teclas: [jugador, botón]. En modo de 1 jugador todo va al jugador 1.
  const TECLAS = {
    KeyW: [0, 'arriba'], KeyS: [0, 'abajo'], KeyA: [0, 'izq'], KeyD: [0, 'der'],
    KeyJ: [0, 'A'], KeyZ: [0, 'A'], KeyF: [0, 'A'], Space: [0, 'A'],
    KeyK: [0, 'B'], KeyX: [0, 'B'], KeyG: [0, 'B'],
    KeyL: [0, 'R'], KeyC: [0, 'R'], KeyH: [0, 'R'],
    KeyI: [0, 'L'], KeyV: [0, 'L'], KeyT: [0, 'L'],
    Enter: [0, 'START'], ShiftLeft: [0, 'SELECT'], Tab: [0, 'SELECT'],
    Escape: [0, 'ATRAS'],
    ArrowUp: [1, 'arriba'], ArrowDown: [1, 'abajo'], ArrowLeft: [1, 'izq'], ArrowRight: [1, 'der'],
    Comma: [1, 'A'], Numpad1: [1, 'A'],
    Period: [1, 'B'], Numpad2: [1, 'B'],
    Slash: [1, 'R'], Minus: [1, 'R'], Numpad3: [1, 'R'],
    KeyM: [1, 'L'], Numpad0: [1, 'L'],
    Backspace: [1, 'START'], NumpadEnter: [1, 'START'], ShiftRight: [1, 'SELECT'],
  };

  class Mando {
    constructor() {
      this.ahora = {};
      this.antes = {};
      this.tiempo = {};
      BOTONES.forEach((b) => { this.ahora[b] = false; this.antes[b] = false; this.tiempo[b] = 0; });
    }
    sostenido(b) { return this.ahora[b]; }
    pulsado(b) { return this.ahora[b] && !this.antes[b]; }
    soltado(b) { return !this.ahora[b] && this.antes[b]; }
    // Para menús: se repite si se mantiene apretado.
    repetir(b) {
      if (this.pulsado(b)) return true;
      const t = this.tiempo[b];
      return this.ahora[b] && t > 18 && t % 6 === 0;
    }
  }

  const crudo = [{}, {}];           // estado del teclado por jugador
  const tactil = {};                // estado de los botones táctiles (jugador 1)
  let ultimaTeclaFrame = 0;

  const E = {
    j: [new Mando(), new Mando()],
    dosJugadores: false,
    algoPulsado: false,
    alPrimerToque: null,

    iniciar() {
      window.addEventListener('keydown', (ev) => {
        const m = TECLAS[ev.code];
        if (m) {
          ev.preventDefault();
          crudo[m[0]][m[1]] = true;
        }
        E.primerToque();
      });
      window.addEventListener('keyup', (ev) => {
        const m = TECLAS[ev.code];
        if (m) {
          ev.preventDefault();
          crudo[m[0]][m[1]] = false;
        }
      });
      window.addEventListener('blur', () => {
        crudo[0] = {}; crudo[1] = {};
        Object.keys(tactil).forEach((k) => { tactil[k] = false; });
      });

      // Botones táctiles de la consola
      document.querySelectorAll('[data-boton]').forEach((el) => {
        const b = el.getAttribute('data-boton');
        const bajar = (ev) => {
          ev.preventDefault();
          tactil[b] = true;
          el.classList.add('activo');
          try { el.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ }
          E.primerToque();
        };
        const subir = (ev) => {
          ev.preventDefault();
          tactil[b] = false;
          el.classList.remove('activo');
        };
        el.addEventListener('pointerdown', bajar);
        el.addEventListener('pointerup', subir);
        el.addEventListener('pointercancel', subir);
        el.addEventListener('contextmenu', (ev) => ev.preventDefault());
      });

      // Cruceta: la dirección depende de dónde se toque (permite diagonales).
      const cruceta = document.getElementById('cruceta');
      if (cruceta) {
        let activo = null;
        const leer = (ev) => {
          const r = cruceta.getBoundingClientRect();
          const dx = ev.clientX - (r.left + r.width / 2);
          const dy = ev.clientY - (r.top + r.height / 2);
          const zona = r.width * 0.12;
          tactil.izq = dx < -zona; tactil.der = dx > zona;
          tactil.arriba = dy < -zona; tactil.abajo = dy > zona;
          // Evita diagonales accidentales cuando se apunta claramente a un lado
          if (Math.abs(dx) > Math.abs(dy) * 2.2) { tactil.arriba = false; tactil.abajo = false; }
          if (Math.abs(dy) > Math.abs(dx) * 2.2) { tactil.izq = false; tactil.der = false; }
          const dir = ['arriba', 'abajo', 'izq', 'der'].filter((k) => tactil[k]).join(' ');
          cruceta.setAttribute('data-dir', dir);
        };
        const soltar = () => {
          activo = null;
          tactil.izq = tactil.der = tactil.arriba = tactil.abajo = false;
          cruceta.setAttribute('data-dir', '');
        };
        cruceta.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          activo = ev.pointerId;
          try { cruceta.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ }
          leer(ev);
          E.primerToque();
        });
        cruceta.addEventListener('pointermove', (ev) => { if (activo === ev.pointerId) leer(ev); });
        cruceta.addEventListener('pointerup', soltar);
        cruceta.addEventListener('pointercancel', soltar);
      }
    },

    primerToque() {
      if (E.alPrimerToque) {
        const f = E.alPrimerToque;
        E.alPrimerToque = null;
        f();
      }
    },

    // Se llama una vez por fotograma.
    actualizar() {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      for (let i = 0; i < 2; i++) {
        const m = E.j[i];
        const nuevo = {};
        BOTONES.forEach((b) => { nuevo[b] = false; });

        // Teclado: en 1 jugador, las teclas del jugador 2 también mueven al 1.
        const fuentes = E.dosJugadores ? [crudo[i]] : (i === 0 ? [crudo[0], crudo[1]] : []);
        fuentes.forEach((f) => BOTONES.forEach((b) => { if (f[b]) nuevo[b] = true; }));

        // Botones táctiles: siempre del jugador 1
        if (i === 0) BOTONES.forEach((b) => { if (tactil[b]) nuevo[b] = true; });

        // Mandos
        const misPads = E.dosJugadores ? (pads[i] ? [pads[i]] : []) : (i === 0 ? pads : []);
        misPads.forEach((p) => {
          const bt = (n) => p.buttons[n] && p.buttons[n].pressed;
          const ax = p.axes || [];
          if (bt(12) || ax[1] < -0.5) nuevo.arriba = true;
          if (bt(13) || ax[1] > 0.5) nuevo.abajo = true;
          if (bt(14) || ax[0] < -0.5) nuevo.izq = true;
          if (bt(15) || ax[0] > 0.5) nuevo.der = true;
          if (bt(0)) nuevo.A = true;
          if (bt(1)) nuevo.B = true;
          if (bt(2) || bt(5) || bt(7)) nuevo.R = true;
          if (bt(3) || bt(4) || bt(6)) nuevo.L = true;
          if (bt(9)) nuevo.START = true;
          if (bt(8)) nuevo.SELECT = true;
        });

        // No se puede apretar izquierda y derecha a la vez
        if (nuevo.izq && nuevo.der) { nuevo.izq = false; nuevo.der = false; }
        if (nuevo.arriba && nuevo.abajo) { nuevo.arriba = false; nuevo.abajo = false; }

        BOTONES.forEach((b) => {
          m.antes[b] = m.ahora[b];
          m.ahora[b] = nuevo[b];
          m.tiempo[b] = nuevo[b] ? m.tiempo[b] + 1 : 0;
        });
      }
      E.algoPulsado = BOTONES.some((b) => E.j[0].pulsado(b) || E.j[1].pulsado(b));
      ultimaTeclaFrame++;
    },

    // Para menús que acepta cualquiera de los dos jugadores.
    pulsado(b) { return E.j[0].pulsado(b) || E.j[1].pulsado(b); },
    repetir(b) { return E.j[0].repetir(b) || E.j[1].repetir(b); },
    aceptar(i) {
      const m = i === undefined ? null : E.j[i];
      if (m) return m.pulsado('A') || m.pulsado('START');
      return E.pulsado('A') || E.pulsado('START');
    },
    atras(i) {
      const m = i === undefined ? null : E.j[i];
      if (m) return m.pulsado('B') || m.pulsado('ATRAS');
      return E.pulsado('B') || E.pulsado('ATRAS');
    },

    // Dirección como en un teclado numérico (5 = neutro), relativa a hacia dónde mira.
    //   7 8 9
    //   4 5 6     6 = adelante, 4 = atrás
    //   1 2 3
    direccion(i, mirando) {
      const m = E.j[i];
      let h = (m.sostenido('der') ? 1 : 0) - (m.sostenido('izq') ? 1 : 0);
      if (mirando < 0) h = -h;
      const v = m.sostenido('arriba') ? 1 : m.sostenido('abajo') ? -1 : 0;
      return 5 + h + v * 3;
    },

    // Simula botones (lo usa el modo de prueba automática).
    simular(jugador, boton, estado) {
      crudo[jugador][boton] = estado;
    },
  };

  RW.entrada = E;
})();
