// =====================================================================
// principal.js: arranca el juego, el bucle a 60 fotogramas por segundo,
// las transiciones entre pantallas, el modo arcade y la escala del canvas.
// =====================================================================
(function () {
  const RW = window.RW;
  const S = RW.escenas;
  const canvas = document.getElementById('pantalla');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const params = new URLSearchParams(location.search);

  const J = {
    escena: null,
    trans: null,
    modo: 'arcade',
    p1: 'beto',
    p2: 'tony',
    escenario: 'barrio',
    arcade: null,
    ultimoResultado: null,
    encendida: false,

    cambiar(destino) {
      if (this.trans) return;
      this.trans = { fase: 'sale', t: 0, destino };
    },

    encender() {
      if (this.encendida) return;
      this.encendida = true;
      RW.audio.iniciar();
      const led = document.getElementById('led');
      if (led) led.classList.add('encendido');
      this.cambiar(S.arranque);
    },

    iniciarArcade(p1) {
      const otros = RW.PERSONAJES.map((p) => p.id).filter((id) => id !== p1);
      for (let i = otros.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otros[i], otros[j]] = [otros[j], otros[i]];
      }
      this.arcade = { rivales: otros, escenarios: ['barrio', 'roques', 'avila'], indice: 0 };
      this.p2 = otros[0];
      this.escenario = 'barrio';
    },

    iniciarCombate() {
      const o = RW.opciones;
      const modo = this.modo;
      S.combate.c = new RW.Combate({
        p1: this.p1, p2: this.p2, escenario: this.escenario, modo,
        cpu1: false, cpu2: modo !== '2j',
        dificultad: o.dificultad, extraIA: modo === 'arcade' && this.arcade ? this.arcade.indice : 0,
        rondas: o.rondas, tiempo: o.tiempo,
        alTerminar: (r) => { this.ultimoResultado = r; this.cambiar(S.resultado); },
        alSalir: () => { RW.entrada.dosJugadores = false; this.cambiar(S.menu); },
      });
      this.cambiar(S.combate);
    },

    despuesDelResultado() {
      const r = this.ultimoResultado;
      if (this.modo === 'arcade') {
        if (r.ganador === 0) {
          this.arcade.indice++;
          if (this.arcade.indice >= this.arcade.rivales.length) { this.cambiar(S.final); return; }
          this.p2 = this.arcade.rivales[this.arcade.indice];
          this.escenario = this.arcade.escenarios[this.arcade.indice] || 'barrio';
          this.cambiar(S.vs);
        } else {
          this.cambiar(S.continuar);
        }
        return;
      }
      this.cambiar(S.seleccion);
    },

    aplicarLcd() {
      const f = document.getElementById('filtroLcd');
      if (f) f.classList.toggle('apagado', !RW.opciones.lcd);
      const b = document.getElementById('btnLcd');
      if (b) b.textContent = 'Filtro LCD: ' + (RW.opciones.lcd ? 'sí' : 'no');
    },
  };
  RW.juego = J;

  // ---------- Bucle principal ----------
  function tick() {
    RW.entrada.actualizar();
    if (J.trans) {
      J.trans.t++;
      if (J.trans.fase === 'sale') {
        if (J.trans.t >= 10) {
          J.escena = J.trans.destino;
          J.escena.entrar();
          J.trans = { fase: 'entra', t: 0 };
        }
        return;
      }
      if (J.trans.t >= 10) J.trans = null;
    }
    J.escena.actualizar();
  }

  function dibujar() {
    // El juego se dibuja en 384x216 sobre un lienzo del doble (las imágenes reales usan todo el detalle)
    ctx.setTransform(canvas.width / RW.ANCHO, 0, 0, canvas.height / RW.ALTO, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    J.escena.dibujar(ctx);
    ctx.restore();
    if (J.trans) {
      const a = J.trans.fase === 'sale' ? J.trans.t / 10 : 1 - J.trans.t / 10;
      ctx.fillStyle = 'rgba(8, 4, 18, ' + RW.limitar(a, 0, 1) + ')';
      ctx.fillRect(0, 0, RW.ANCHO, RW.ALTO);
    }
  }

  let ultimo = performance.now();
  let acumulado = 0;
  const PASO = 1000 / 60;
  const VELOCIDAD = RW.limitar(parseInt(params.get('velocidad') || '1', 10) || 1, 1, 20);   // solo para pruebas
  function bucle(ahora) {
    acumulado += Math.min(100, ahora - ultimo);
    ultimo = ahora;
    let n = 0;
    while (acumulado >= PASO && n < 4) {
      for (let v = 0; v < VELOCIDAD; v++) {
        try { tick(); } catch (e) { console.error(e); }
      }
      acumulado -= PASO;
      n++;
    }
    if (n >= 4) acumulado = 0;
    try { dibujar(); } catch (e) { console.error(e); }
    requestAnimationFrame(bucle);
  }

  // ---------- Escala del canvas ----------
  function ajustarPantalla() {
    const vertical = window.matchMedia('(orientation: portrait) and (max-width: 760px)').matches;
    const prop = RW.ANCHO / RW.ALTO;
    let w;
    if (document.fullscreenElement) w = Math.min(window.innerWidth - 340, (window.innerHeight - 140) * prop);
    else if (vertical) w = Math.min(window.innerWidth - 44, window.innerHeight * 0.45 * prop);
    else w = Math.min(window.innerWidth - 380, (window.innerHeight - 230) * prop);
    let esc = w / RW.ANCHO;
    if (esc >= 2) esc = Math.floor(esc);
    esc = RW.limitar(esc, 0.8, 4);
    canvas.style.width = Math.round(RW.ANCHO * esc) + 'px';
    canvas.style.height = Math.round(RW.ALTO * esc) + 'px';
  }

  // ---------- Botones del panel ----------
  function prepararPanel() {
    const pc = document.getElementById('btnPantallaCompleta');
    if (pc) {
      pc.addEventListener('click', () => {
        pc.blur();
        const el = document.querySelector('.escena');
        if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      });
    }
    const lcd = document.getElementById('btnLcd');
    if (lcd) lcd.addEventListener('click', () => { lcd.blur(); RW.opciones.lcd = !RW.opciones.lcd; RW.guardarOpciones(); J.aplicarLcd(); });
    const son = document.getElementById('btnSonido');
    const pintarSonido = () => { if (son) son.textContent = 'Sonido: ' + (RW.opciones.sonido ? 'sí' : 'no'); };
    if (son) {
      son.addEventListener('click', () => {
        son.blur();
        RW.opciones.sonido = !RW.opciones.sonido;
        RW.guardarOpciones();
        RW.audio.aplicarVolumen();
        if (!RW.opciones.sonido && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        pintarSonido();
      });
    }
    pintarSonido();
    // Tu música: el jugador escoge una canción de su teléfono o computadora
    const btnMusica = document.getElementById('btnMusica');
    const archivo = document.getElementById('archivoMusica');
    if (btnMusica && archivo) {
      btnMusica.addEventListener('click', () => {
        btnMusica.blur();
        if (RW.audio.tienePropia()) {
          RW.audio.quitarCancionPropia();
          btnMusica.textContent = 'Tu música';
          return;
        }
        archivo.click();
      });
      archivo.addEventListener('change', () => {
        const f = archivo.files && archivo.files[0];
        if (!f) return;
        if (!J.encendida) J.encender();
        const nombre = RW.audio.cancionPropia(f);
        if (nombre) btnMusica.textContent = 'Quitar: ' + (nombre.length > 22 ? nombre.slice(0, 21) + '…' : nombre);
        archivo.value = '';
      });
    }
    J.aplicarLcd();
    document.addEventListener('fullscreenchange', ajustarPantalla);
  }

  // ---------- Inicio ----------
  RW.entrada.iniciar();
  prepararPanel();
  ajustarPantalla();
  window.addEventListener('resize', ajustarPantalla);

  // Modo de prueba: ?prueba=combate&p1=beto&p2=tony&esc=barrio (CPU contra CPU)
  const prueba = params.get('prueba');
  if (prueba) {
    J.encendida = true;
    if (prueba === 'combate') {
      J.modo = params.get('modo') || 'vscpu';
      J.p1 = params.get('p1') || 'beto';
      J.p2 = params.get('p2') || 'tony';
      J.escenario = params.get('esc') || 'barrio';
      J.escena = S.combate;
      S.combate.c = new RW.Combate({
        p1: J.p1, p2: J.p2, escenario: J.escenario, modo: J.modo,
        cpu1: params.get('cpu') === '2', cpu2: J.modo !== '2j',
        dificultad: parseInt(params.get('nivel') || '2', 10), rondas: 3, tiempo: parseInt(params.get('tiempo') || '99', 10),
        alTerminar: (r) => { window.__resultado = r; J.ultimoResultado = r; J.cambiar(S.resultado); },
        alSalir: () => J.cambiar(S.menu),
      });
    } else {
      J.escena = S[prueba] || S.titulo;
      if (prueba === 'seleccion' || prueba === 'escenario') J.modo = params.get('modo') || 'vscpu';
      if (prueba === 'vs' || prueba === 'resultado') { J.p1 = params.get('p1') || 'beto'; J.p2 = params.get('p2') || 'abeja'; }
      if (prueba === 'resultado') J.ultimoResultado = { ganador: 0, p1: J.p1, p2: J.p2, perfecto: false };
      J.escena.entrar();
    }
  } else {
    J.escena = S.encendido;
    J.escena.entrar();
    RW.entrada.alPrimerToque = () => J.encender();
  }
  requestAnimationFrame(bucle);
})();
