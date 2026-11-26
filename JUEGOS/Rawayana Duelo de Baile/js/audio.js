// =====================================================================
// audio.js: música chiptune original y efectos de sonido con WebAudio.
// Canales al estilo de las consolas viejas: dos pulsos, un triángulo y ruido.
// Las melodías son originales (inspiradas en ritmos caribeños), no son
// canciones de la banda.
// =====================================================================
(function () {
  const RW = window.RW;

  let ctx = null, maestro, gMusica, gSfx, bufRuido;
  const ondas = {};
  let cancion = null;
  let temporizador = null;

  // ---------- Notas ----------
  const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function frecuencia(nombre) {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(nombre);
    if (!m) return 0;
    let s = SEMITONOS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (parseInt(m[3], 10) + 1) * 12 + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Patrón de "montuno" de piano salsero con tres notas del acorde.
  function montuno(bajo, medio, alto) {
    const a = bajo + ',' + alto, b = medio + ',' + alto, c = bajo + ',' + medio;
    return [a, '.', '.', b, '.', '.', a, '.', b, '.', c, b, '.', '.', a, '.'].join(' ');
  }
  // Bajo reggae: raíz, quinta, raíz, tercera...
  function bajoReggae(r, t, f) {
    return [r, '-', '-', '.', '.', '.', f, '.', r, '-', '.', t, '.', '.', f, '.'].join(' ');
  }
  // Rasgueo corto en los tiempos 2 y 4 (el "chk" del reggae).
  function skank(ac) {
    return ['.', '.', '.', '.', ac, '.', '.', '.', '.', '.', '.', '.', ac, '.', ac, '.'].join(' ');
  }
  function chopFunk(ac) {
    return ['.', '.', ac, '.', '.', '.', ac, ac, '.', '.', ac, '.', '.', '.', ac, '.'].join(' ');
  }
  function bajoOctavas(r, R) {
    return [r, '.', R, '.', r, '.', R, '.', r, '.', R, '.', r, '.', R, '.'].join(' ');
  }
  function arpegio(n1, n2, n3, n4) {
    return [n1, n2, n3, n4, n3, n2, n1, n2, n1, n2, n3, n4, n3, n2, n1, n2].join(' ');
  }

  // ---------- Canciones ----------
  const CANCIONES = {
    // Salsa de barrio, en La menor
    barrio: {
      bpm: 124, bucle: true,
      canales: [
        { inst: 'pulso50', vol: 0.16, notas: [
          'E5 . A5 . C6 - B5 A5 . G5 - E5 . . . .',
          'D5 . F5 . A5 - G5 F5 . E5 - D5 . . . .',
          'B4 . D5 . G5 - F5 D5 . B4 . D5 - - . .',
          'C5 - E5 - G5 . E5 . C5 . . . . . . .',
          'A5 - . A5 . G5 . F5 - . E5 . F5 - . .',
          'D5 - . D5 . E5 . F5 - . A5 . G5 - F5 -',
          'E5 - . . G#5 - . . B5 - . . D6 - C6 B5',
          'G#5 - - - E5 - - - . . . . . . . .'] },
        { inst: 'pulso25', vol: 0.07, notas: [
          montuno('A4', 'C5', 'E5'), montuno('A4', 'D5', 'F5'), montuno('G4', 'B4', 'D5'), montuno('G4', 'C5', 'E5'),
          montuno('A4', 'C5', 'F5'), montuno('A4', 'D5', 'F5'), montuno('G#4', 'B4', 'D5'), montuno('G#4', 'B4', 'E5')] },
        { inst: 'triangulo', vol: 0.32, notas: [
          'A2 - - - - - E2 - - - - - D2 - - -',
          '- - - - - - A2 - - - - - G2 - - -',
          '- - - - - - D3 - - - - - C3 - - -',
          '- - - - - - G2 - - - - - F2 - - -',
          '- - - - - - C3 - - - - - D3 - - -',
          '- - - - - - A2 - - - - - E2 - - -',
          '- - - - - - B2 - - - - - E2 - - -',
          '- - - - - - B2 - - - - - A2 - - -'] },
        { inst: 'ruido', vol: 0.5, notas: [
          'k+h . h . c+h . h . k+c+h . h . h . t+h t',
          'k+c+h . h . h . c+h . k+h . h . c+h . t+h t'] },
      ],
    },
    // Reggae playero, en Sol mayor
    roques: {
      bpm: 90, bucle: true,
      canales: [
        { inst: 'pulso12', vol: 0.15, notas: [
          'D5 - - - B4 - D5 - E5 - D5 - B4 - - -',
          'C5 - E5 - G5 - - - E5 - D5 - C5 - - -',
          'D5 - F#5 - A5 - - - F#5 - E5 - D5 - - -',
          'E5 - - - D5 - - - C5 - B4 - A4 - - -',
          'G5 - - - D5 - G5 - A5 - G5 - E5 - D5 -',
          'E5 - G5 - B5 - - - A5 - G5 - E5 - - -',
          'G5 - - - E5 - - - C5 - D5 - E5 - - -',
          'D5 - - - - - - - . . A4 . B4 . C5 .'] },
        { inst: 'pulso25', vol: 0.07, notas: [
          skank('G4,B4,D5'), skank('G4,C5,E5'), skank('F#4,A4,D5'), skank('G4,C5,E5'),
          skank('G4,B4,D5'), skank('G4,B4,E5'), skank('G4,C5,E5'), skank('F#4,A4,D5')] },
        { inst: 'triangulo', vol: 0.34, notas: [
          bajoReggae('G2', 'B2', 'D3'), bajoReggae('C3', 'E3', 'G3'), bajoReggae('D3', 'F#3', 'A3'), bajoReggae('C3', 'E3', 'G3'),
          bajoReggae('G2', 'B2', 'D3'), bajoReggae('E2', 'G2', 'B2'), bajoReggae('C3', 'E3', 'G3'), bajoReggae('D3', 'F#3', 'A3')] },
        { inst: 'ruido', vol: 0.5, notas: [
          '. . h . . . h . k+s . h . . . h h',
          '. . h . . . h . k+s . h . . . h h',
          '. . h . . . h . k+s . h . . . h h',
          '. . h . t . t . k+s . t t s . s s'] },
      ],
    },
    // Funk tropical en la montaña, en Mi menor
    avila: {
      bpm: 112, bucle: true,
      canales: [
        { inst: 'pulso50', vol: 0.15, notas: [
          'B4 - - - E5 - - - G5 - F#5 - E5 - D5 -',
          'E5 - - - - - . . C#5 - E5 - A5 - - -',
          'G5 - - - F#5 - E5 - D5 - E5 - B4 - - -',
          'C#5 - - - E5 - - - . . . . . . . .',
          'G5 - - - E5 - G5 - C6 - - - B5 - G5 -',
          'A5 - - - F#5 - A5 - D6 - - - C6 - A5 -',
          'B5 - - - - - - - G5 - A5 - B5 - - -',
          'A5 - - - F#5 - - - D#5 - - - B4 - - -'] },
        { inst: 'pulso12', vol: 0.07, notas: [
          chopFunk('D5,G5'), chopFunk('C#5,E5'), chopFunk('D5,G5'), chopFunk('C#5,E5'),
          chopFunk('C5,E5'), chopFunk('D5,F#5'), chopFunk('D5,G5'), chopFunk('D#5,A5')] },
        { inst: 'triangulo', vol: 0.34, notas: [
          'E2 . . E2 . . E3 . . E2 . D3 . B2 . .',
          'A2 . . A2 . . A3 . . A2 . G3 . E3 . .',
          'E2 . . E2 . . E3 . . E2 . D3 . B2 . .',
          'A2 . . A2 . . A3 . . A2 . G3 . E3 . .',
          'C3 . . C3 . . C4 . . C3 . B2 . G2 . .',
          'D3 . . D3 . . D4 . . D3 . C4 . A3 . .',
          'E2 . . E2 . . E3 . . E2 . G2 . A2 . .',
          'B2 . . B2 . . B3 . . A3 . F#3 . D#3 . .'] },
        { inst: 'ruido', vol: 0.5, notas: [
          'k+h . h . s+h . h k h . k+h . s+h . h h'] },
      ],
    },
    // Tema de título, en Do mayor
    titulo: {
      bpm: 136, bucle: true,
      canales: [
        { inst: 'pulso50', vol: 0.15, notas: [
          'G5 - - - E5 - G5 - C6 - - - G5 - - -',
          'A5 - - - G5 - E5 - C5 - - - E5 - - -',
          'F5 - - - A5 - C6 - F6 - - - E6 - D6 -',
          'D6 - - - B5 - - - G5 - - - . . . .',
          'G5 - - - E5 - G5 - C6 - - - D6 - E6 -',
          'E6 - D6 - C6 - - - A5 - - - C6 - - -',
          'C6 - A5 - F5 - - - G5 - B5 - D6 - - -',
          'C6 - - - - - - - . . . . . . . .'] },
        { inst: 'pulso25', vol: 0.06, notas: [
          arpegio('C5', 'E5', 'G5', 'C6'), arpegio('A4', 'C5', 'E5', 'A5'), arpegio('F4', 'A4', 'C5', 'F5'), arpegio('G4', 'B4', 'D5', 'G5'),
          arpegio('C5', 'E5', 'G5', 'C6'), arpegio('A4', 'C5', 'E5', 'A5'), 'F4 A4 C5 F5 C5 A4 F4 A4 G4 B4 D5 G5 D5 B4 G4 B4', arpegio('C5', 'E5', 'G5', 'C6')] },
        { inst: 'triangulo', vol: 0.32, notas: [
          bajoOctavas('C3', 'C4'), bajoOctavas('A2', 'A3'), bajoOctavas('F2', 'F3'), bajoOctavas('G2', 'G3'),
          bajoOctavas('C3', 'C4'), bajoOctavas('A2', 'A3'), 'F2 . F3 . F2 . F3 . G2 . G3 . G2 . G3 .', bajoOctavas('C3', 'C4')] },
        { inst: 'ruido', vol: 0.45, notas: ['k . h . s . h . k . k . s . h h'] },
      ],
    },
    // Selección de personaje, en Fa mayor
    seleccion: {
      bpm: 120, bucle: true,
      canales: [
        { inst: 'pulso25', vol: 0.13, notas: [
          'A5 . C6 . A5 . F5 . G5 . A5 . . . . .',
          'F5 . A5 . F5 . D5 . E5 . F5 . . . . .',
          'D5 . F5 . Bb5 . A5 . G5 . F5 . D5 . . .',
          'E5 . G5 . C6 . Bb5 . A5 . G5 . E5 . C5 .'] },
        { inst: 'triangulo', vol: 0.32, notas: [
          'F2 - . F2 . . C3 . F2 - . F2 . C3 . .',
          'D2 - . D2 . . A2 . D2 - . D2 . A2 . .',
          'Bb2 - . Bb2 . . F2 . Bb2 - . Bb2 . F2 . .',
          'C3 - . C3 . . G2 . C3 - . C3 . G2 . .'] },
        { inst: 'ruido', vol: 0.42, notas: ['k . h . c . h . k . h c . . h .'] },
      ],
    },
    // Pequeñas melodías que no se repiten
    victoria: {
      bpm: 150, bucle: false,
      canales: [
        { inst: 'pulso50', vol: 0.16, notas: ['C5 E5 G5 C6 - - G5 C6 - - - - E6 - - - - - - - . . . .'] },
        { inst: 'pulso25', vol: 0.08, notas: ['E4 G4 C5 E5 - - C5 E5 - - - - G5 - - - - - - - . . . .'] },
        { inst: 'triangulo', vol: 0.32, notas: ['C3 - - - - - G2 - - - - - C3 - - - - - - - . . . .'] },
      ],
    },
    derrota: {
      bpm: 100, bucle: false,
      canales: [
        { inst: 'pulso50', vol: 0.14, notas: ['E5 - D5 - C5 - B4 - A4 - - - - - - - . .'] },
        { inst: 'triangulo', vol: 0.3, notas: ['A2 - - - E2 - - - A2 - - - - - - - . .'] },
      ],
    },
    arranque: {
      bpm: 160, bucle: false,
      canales: [
        { inst: 'pulso12', vol: 0.16, notas: ['C6 - G6 - - - - - - - - - . .'] },
        { inst: 'pulso25', vol: 0.1, notas: ['E5 - C6 - - - - - - - - - . .'] },
        { inst: 'triangulo', vol: 0.3, notas: ['C3 - C4 - - - - - - - - - . .'] },
      ],
    },
  };

  // Convierte las cadenas de notas en eventos listos para tocar.
  function preparar(c) {
    if (c.preparada) return c;
    c.pistas = c.canales.map((canal) => {
      const tokens = (Array.isArray(canal.notas) ? canal.notas.join(' ') : canal.notas).trim().split(/\s+/);
      const ev = new Array(tokens.length).fill(null);
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t === '.' || t === '-') continue;
        if (canal.inst === 'ruido') {
          ev[i] = { golpes: t.split('+') };
        } else {
          let largo = 1;
          while (tokens[(i + largo) % tokens.length] === '-' && largo < tokens.length) largo++;
          ev[i] = { frecs: t.split(',').map(frecuencia), largo };
        }
      }
      return { inst: canal.inst, vol: canal.vol, ev, largo: tokens.length };
    });
    c.largo = Math.max.apply(null, c.pistas.map((p) => p.largo));
    c.preparada = true;
    return c;
  }

  // ---------- Síntesis ----------
  function crearOndas() {
    [0.125, 0.25, 0.5].forEach((ciclo) => {
      const n = 40;
      const real = new Float32Array(n), imag = new Float32Array(n);
      for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * ciclo);
      ondas[ciclo] = ctx.createPeriodicWave(real, imag);
    });
    const largo = ctx.sampleRate;
    bufRuido = ctx.createBuffer(1, largo, ctx.sampleRate);
    const d = bufRuido.getChannelData(0);
    for (let i = 0; i < largo; i++) d[i] = Math.random() * 2 - 1;
  }

  function oscilador(inst, frec, t) {
    const o = ctx.createOscillator();
    if (inst === 'pulso50') o.setPeriodicWave(ondas[0.5]);
    else if (inst === 'pulso25') o.setPeriodicWave(ondas[0.25]);
    else if (inst === 'pulso12') o.setPeriodicWave(ondas[0.125]);
    else if (inst === 'sierra') o.type = 'sawtooth';
    else if (inst === 'seno') o.type = 'sine';
    else o.type = 'triangle';
    o.frequency.setValueAtTime(frec, t);
    return o;
  }

  function nota(t, frec, dur, inst, vol, destino) {
    if (!frec) return;
    const o = oscilador(inst, frec, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    if (inst !== 'triangulo') g.gain.linearRampToValueAtTime(vol * 0.65, t + Math.min(0.09, dur * 0.5));
    g.gain.setValueAtTime(inst !== 'triangulo' ? vol * 0.65 : vol, t + Math.max(0.01, dur - 0.03));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  function ruido(t, dur, vol, filtro, frec, q, destino) {
    const s = ctx.createBufferSource();
    s.buffer = bufRuido;
    const f = ctx.createBiquadFilter();
    f.type = filtro;
    f.frequency.setValueAtTime(frec, t);
    if (q) f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(destino);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
    return f;
  }

  function barrido(t, f0, f1, dur, inst, vol, destino, exp) {
    const o = oscilador(inst, f0, t);
    if (exp) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    else o.frequency.linearRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // Percusión de la batería chiptune.
  function percusion(t, tipo, vol, destino) {
    switch (tipo) {
      case 'k': barrido(t, 150, 40, 0.14, 'seno', vol * 1.6, destino, true); break;
      case 's': ruido(t, 0.13, vol * 0.7, 'bandpass', 1800, 0.8, destino); barrido(t, 220, 140, 0.06, 'triangulo', vol * 0.6, destino); break;
      case 'h': ruido(t, 0.035, vol * 0.35, 'highpass', 7000, 0, destino); break;
      case 'c': barrido(t, 2400, 2300, 0.04, 'triangulo', vol * 0.55, destino); break;
      case 'b': barrido(t, 800, 790, 0.12, 'pulso50', vol * 0.18, destino); barrido(t, 540, 535, 0.12, 'pulso50', vol * 0.18, destino); break;
      case 't': barrido(t, 240, 180, 0.13, 'seno', vol * 0.9, destino, true); break;
    }
  }

  // ---------- Secuenciador ----------
  function programar() {
    if (!ctx || !cancion) return;
    const limite = ctx.currentTime + 0.15;
    while (cancion && cancion.proximo < limite) {
      const c = cancion;
      for (const p of c.datos.pistas) {
        const ev = p.ev[c.paso % p.largo];
        if (!ev) continue;
        if (p.inst === 'ruido') ev.golpes.forEach((g) => percusion(c.proximo, g, p.vol, gMusica));
        else ev.frecs.forEach((f) => nota(c.proximo, f, ev.largo * c.dur * 0.96, p.inst, p.vol, gMusica));
      }
      c.proximo += c.dur;
      c.paso++;
      if (!c.datos.bucle && c.paso >= c.datos.largo) cancion = null;
    }
  }

  const A = {
    listo: false,
    actual: null,

    iniciar() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      maestro = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      maestro.connect(comp).connect(ctx.destination);
      gMusica = ctx.createGain();
      gSfx = ctx.createGain();
      gMusica.connect(maestro);
      gSfx.connect(maestro);
      crearOndas();
      A.aplicarVolumen();
      temporizador = setInterval(programar, 25);
      document.addEventListener('visibilitychange', () => {
        if (!ctx) return;
        if (document.hidden) ctx.suspend();
        else {
          ctx.resume();
          if (cancion) cancion.proximo = ctx.currentTime + 0.05;
        }
      });
      A.listo = true;
    },

    aplicarVolumen() {
      if (!ctx) return;
      const on = RW.opciones.sonido ? 1 : 0;
      maestro.gain.value = on;
      gMusica.gain.value = RW.opciones.musica;
      gSfx.gain.value = RW.opciones.efectos;
    },

    musica(nombre) {
      if (A.actual === nombre && cancion) return;
      A.actual = nombre;
      if (!ctx) return;
      const datos = CANCIONES[nombre];
      if (!datos) { cancion = null; return; }
      preparar(datos);
      cancion = { datos, paso: 0, dur: 60 / datos.bpm / 4, proximo: ctx.currentTime + 0.06 };
    },

    detener() {
      cancion = null;
      A.actual = null;
    },

    // Efectos de sonido
    sfx(nombre) {
      if (!ctx || !RW.opciones.sonido) return;
      const t = ctx.currentTime + 0.005;
      const d = gSfx;
      switch (nombre) {
        case 'menu': barrido(t, 880, 880, 0.05, 'pulso25', 0.18, d); break;
        case 'aceptar': barrido(t, 660, 660, 0.06, 'pulso50', 0.2, d); barrido(t + 0.06, 990, 990, 0.1, 'pulso50', 0.2, d); break;
        case 'atras': barrido(t, 520, 300, 0.12, 'pulso25', 0.18, d); break;
        case 'error': barrido(t, 160, 150, 0.15, 'pulso50', 0.2, d); break;
        case 'golpeLigero':
          ruido(t, 0.07, 0.5, 'bandpass', 2200, 1, d);
          barrido(t, 420, 180, 0.06, 'pulso50', 0.18, d);
          break;
        case 'golpeFuerte':
          ruido(t, 0.16, 0.7, 'lowpass', 1600, 0, d);
          barrido(t, 180, 45, 0.18, 'seno', 0.7, d, true);
          barrido(t, 300, 90, 0.12, 'pulso50', 0.15, d);
          break;
        case 'bloqueo':
          barrido(t, 1400, 1300, 0.04, 'pulso25', 0.15, d);
          ruido(t, 0.05, 0.3, 'highpass', 4000, 0, d);
          break;
        case 'aire': {
          const f = ruido(t, 0.13, 0.22, 'bandpass', 500, 2, d);
          f.frequency.exponentialRampToValueAtTime(2600, t + 0.12);
          break;
        }
        case 'salto': barrido(t, 300, 600, 0.08, 'triangulo', 0.25, d); break;
        case 'aterrizar': barrido(t, 120, 60, 0.06, 'seno', 0.35, d, true); break;
        case 'proyectil':
          [523, 659, 784, 1047].forEach((f, i) => barrido(t + i * 0.035, f, f, 0.05, 'pulso25', 0.16, d));
          break;
        case 'especial': barrido(t, 220, 880, 0.22, 'sierra', 0.12, d, true); break;
        case 'super':
          barrido(t, 110, 1760, 0.6, 'sierra', 0.12, d, true);
          [523, 659, 784].forEach((f) => barrido(t + 0.35, f, f * 1.01, 0.6, 'pulso25', 0.09, d));
          break;
        case 'ko':
          barrido(t, 880, 90, 0.8, 'pulso50', 0.22, d, true);
          ruido(t, 0.5, 0.5, 'lowpass', 900, 0, d);
          break;
        case 'agarre':
          barrido(t, 330, 330, 0.07, 'pulso50', 0.18, d);
          barrido(t + 0.08, 494, 494, 0.1, 'pulso50', 0.18, d);
          break;
        case 'mareo':
          for (let i = 0; i < 6; i++) barrido(t + i * 0.08, 900 - i * 40, 700 - i * 40, 0.07, 'triangulo', 0.15, d);
          break;
        case 'cuenta': barrido(t, 1200, 1200, 0.05, 'pulso12', 0.18, d); break;
        case 'pose':
          [784, 988, 1175, 1568].forEach((f, i) => barrido(t + i * 0.05, f, f, 0.07, 'pulso12', 0.14, d));
          break;
        case 'ronda':
          barrido(t, 392, 392, 0.12, 'pulso50', 0.2, d);
          barrido(t + 0.12, 523, 523, 0.25, 'pulso50', 0.2, d);
          break;
        case 'pelea':
          barrido(t, 523, 523, 0.08, 'pulso50', 0.2, d);
          barrido(t + 0.08, 659, 659, 0.08, 'pulso50', 0.2, d);
          barrido(t + 0.16, 1047, 1047, 0.3, 'pulso50', 0.22, d);
          ruido(t + 0.16, 0.3, 0.4, 'highpass', 3000, 0, d);
          break;
        case 'choque':
          ruido(t, 0.2, 0.6, 'bandpass', 1200, 1.5, d);
          barrido(t, 1500, 300, 0.2, 'pulso25', 0.15, d, true);
          break;
      }
    },

    // Voz del presentador usando la síntesis de voz del navegador.
    locutor(texto) {
      if (!RW.opciones.locutor || !RW.opciones.sonido || !('speechSynthesis' in window)) return;
      try {
        const s = window.speechSynthesis;
        s.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        const voces = s.getVoices();
        const pref = ['es-VE', 'es-US', 'es-MX', 'es-419', 'es-CO', 'es-ES'];
        let voz = null;
        for (const p of pref) { voz = voces.find((v) => v.lang === p); if (voz) break; }
        if (!voz) voz = voces.find((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
        if (voz) u.voice = voz;
        u.lang = voz ? voz.lang : 'es-ES';
        u.rate = 1.05;
        u.pitch = 0.7;
        u.volume = Math.min(1, RW.opciones.efectos + 0.2);
        s.speak(u);
      } catch (e) { /* sin voz, no pasa nada */ }
    },
  };

  RW.audio = A;
})();
