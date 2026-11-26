// =====================================================================
// audio.js: música original y efectos de sonido con WebAudio.
//
// Las canciones son ORIGINALES, compuestas con el sonido de la banda:
// reggae con guitarra en contratiempo, funk con bajo slap, dembow,
// afrobeat, congas, güiro y ecos "trippy". No son canciones de Rawayana
// (tienen derechos de autor). Para bailar con una canción de verdad está
// el botón "Tu música", que reproduce un archivo del propio jugador.
// =====================================================================
(function () {
  const RW = window.RW;

  let ctx = null, maestro, gMusica, gSfx, bufRuido, eco, ecoEntrada, ecoRetorno, reverb, reverbEntrada;
  const ondas = {};
  let cancion = null;
  let propia = null;          // canción cargada por el jugador

  // ---------- Notas ----------
  const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function frecuencia(nombre) {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(nombre);
    if (!m) return 0;
    const s = SEMITONOS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (parseInt(m[3], 10) + 1) * 12 + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Ayudantes para escribir patrones de 16 pasos (semicorcheas)
  const patron = (posiciones, ac) => { const p = new Array(16).fill('.'); posiciones.forEach((i) => { p[i] = ac; }); return p.join(' '); };
  const skank = (ac) => patron([4, 12], ac);                 // reggae: tiempos 2 y 4
  const contra = (ac) => patron([2, 6, 10, 14], ac);         // en el "y" de cada tiempo
  const burbuja = (ac) => patron([2, 3, 6, 10, 11, 14], ac); // órgano de reggae
  const chop = (ac) => patron([2, 3, 7, 10, 14], ac);        // guitarra funk
  const acorde = (ac) => [ac].concat(new Array(15).fill('-')).join(' ');
  const veces = (txt, n) => new Array(n).fill(txt).join(' ');

  // ---------- Canciones ----------
  const CANCIONES = {
    // EL BARRIO: dembow funky en La menor
    barrio: {
      bpm: 98, bucle: true, eco: 0.375,
      canales: [
        { inst: 'lead', vol: 0.12, eco: 0.3, notas: [
          'E5 - . C5 . D5 E5 - . . A4 . C5 - . .',
          'F5 - . E5 . C5 A4 - . . . . . . . .',
          'G5 - . E5 . G5 A5 - . G5 . E5 D5 - . .',
          'D5 - . . B4 - . . G4 - . . . . . .',
          'E5 - . C5 . D5 E5 - . . A5 . G5 - . .',
          'F5 - E5 - C5 - A4 - . . C5 . D5 . . .',
          'E5 - . G5 . . E5 . D5 - . C5 . . . .',
          'B4 - - - D5 - - - G5 - - - . . . .'] },
        { inst: 'skank', vol: 0.09, eco: 0.2, notas: [
          contra('A3,C4,E4'), contra('A3,C4,F4'), contra('G3,C4,E4'), contra('G3,B3,D4'),
          contra('A3,C4,E4'), contra('A3,C4,F4'), contra('G3,C4,E4'), contra('G3,B3,D4')] },
        { inst: 'metales', vol: 0.07, notas: [
          veces('.', 16), '. . . . . . . . . . . . . . A4,C5,E5 -',
          veces('.', 16), '. . . . . . . . . . . . B4,D5,G5 - . .',
          veces('.', 16), '. . . . . . . . . . . . . . A4,C5,E5 -',
          veces('.', 16), 'G4,B4,D5 - - - . . . . G4,B4,D5 - - - . . . .'] },
        { inst: 'pad', vol: 0.035, notas: [acorde('A3,C4,E4'), acorde('F3,A3,C4'), acorde('C4,E4,G4'), acorde('G3,B3,D4')] },
        { inst: 'bajoSlap', vol: 0.3, notas: [
          'A1 - . A2 . . A1 . A1 - . E2 . . G2 .',
          'F1 - . F2 . . F1 . F1 - . C2 . . E2 .',
          'C2 - . C3 . . C2 . C2 - . G1 . . B1 .',
          'G1 - . G2 . . G1 . G1 - . D2 . . E2 .'] },
        { inst: 'perc', vol: 0.55, notas: [
          'k+h . h s k+h . s+h . k+h . h s k+h . s+h m',
          'k+h . h s k+h q s+h g k+h . h+w s k+h q s+h w'] },
      ],
    },
    // LOS ROQUES: reggae caribeño "trippy" en Re mayor
    roques: {
      bpm: 80, bucle: true, eco: 0.375,
      canales: [
        { inst: 'melodica', vol: 0.12, eco: 0.4, notas: [
          'F#5 - - - A5 - - - . . F#5 - E5 - D5 -',
          'B4 - - - - - - - . . D5 - E5 - . .',
          'F#5 - - - D5 - - - . . B4 - D5 - F#5 -',
          'E5 - - - - - - - . . . . . . . .',
          'G5 - - - F#5 - E5 - . . D5 - E5 - . .',
          'D5 - - - B4 - - - . . A4 - B4 - D5 -',
          'F#5 - - - E5 - D5 - . . A4 - D5 - . .',
          'E5 - - - - - - - C#5 - - - . . . .'] },
        { inst: 'skank', vol: 0.1, eco: 0.45, notas: [
          skank('F#3,A3,D4'), skank('G3,B3,D4'), skank('F#3,B3,D4'), skank('E3,A3,C#4'),
          skank('E3,G3,B3'), skank('G3,B3,D4'), skank('F#3,A3,D4'), skank('E3,A3,C#4')] },
        { inst: 'organo', vol: 0.05, notas: [
          burbuja('D3,F#3,A3'), burbuja('D3,G3,B3'), burbuja('D3,F#3,B3'), burbuja('C#3,E3,A3'),
          burbuja('B2,E3,G3'), burbuja('D3,G3,B3'), burbuja('D3,F#3,A3'), burbuja('C#3,E3,A3')] },
        { inst: 'bajoDub', vol: 0.36, notas: [
          'D2 - - - . . A1 . D2 - . F#2 . . E2 .',
          'G1 - - - . . D2 . G1 - . B1 . . A1 .',
          'B1 - - - . . F#2 . B1 - . D2 . . C#2 .',
          'A1 - - - . . E2 . A1 - . C#2 . . E2 .',
          'E2 - - - . . B1 . E2 - . G2 . . F#2 .',
          'G1 - - - . . D2 . G1 - . B1 . . A1 .',
          'D2 - - - . . A1 . D2 - . F#2 . . E2 .',
          'A1 - - - . . E2 . A1 - . C#2 . . E2 .'] },
        { inst: 'perc', vol: 0.5, notas: [
          '. . h . . . h . k+c . h . . . h m',
          '. . h . e . h . k+c . h e . . h e',
          '. . h . . . h . k+c . h . . . h m',
          '. . h . e . h . k+c . h e v . v .'] },
      ],
    },
    // EL ÁVILA: afro funk tropical en Mi menor
    avila: {
      bpm: 104, bucle: true, eco: 0.25,
      canales: [
        { inst: 'lead', vol: 0.11, eco: 0.25, notas: [
          'B4 - - E5 - - G5 - F#5 - E5 - D5 - B4 -',
          'C#5 - - - E5 - - - . . . . . . . .',
          'B4 - - E5 - - G5 - A5 - G5 - E5 - D5 -',
          'E5 - - - - - - - . . . . . . . .',
          'G5 - - - E5 - G5 - C6 - - - B5 - G5 -',
          'A5 - - - F#5 - A5 - D6 - - - C6 - A5 -',
          'B5 - - - - - G5 - A5 - B5 - - - . .',
          'A5 - - - F#5 - - - D#5 - - - B4 - - -'] },
        { inst: 'skank', vol: 0.08, eco: 0.15, notas: [
          chop('D4,G4,B4'), chop('C#4,G4,B4'), chop('D4,G4,B4'), chop('C#4,G4,B4'),
          chop('C4,E4,G4'), chop('D4,F#4,A4'), chop('D4,G4,B4'), chop('D#4,A4,B4')] },
        { inst: 'metales', vol: 0.07, notas: [
          'E4,G4,B4 - . . . . . . . . . . . . . .', veces('.', 16),
          'E4,G4,B4 - . . . . . . . . . . . . . .', '. . . . . . . . . . . . C#5,E5 - D5,F#5 -',
          'E4,G4,C5 - . . . . . . . . . . . . . .', 'F#4,A4,D5 - . . . . . . . . . . . . . .',
          'G4,B4,E5 - . . . . . . . . . . . . . .', 'F#4,A4,D#5 - - - . . . . . . . . . . . .'] },
        { inst: 'bajoSlap', vol: 0.3, notas: [
          'E1 . E2 . . E1 . G1 . A1 . . B1 . D2 .',
          'A1 . A2 . . A1 . C#2 . E2 . . G2 . E2 .',
          'E1 . E2 . . E1 . G1 . A1 . . B1 . D2 .',
          'A1 . A2 . . A1 . C#2 . E2 . . G2 . E2 .',
          'C2 . C3 . . C2 . E2 . G2 . . C3 . B2 .',
          'D2 . D3 . . D2 . F#2 . A2 . . D3 . C3 .',
          'E1 . E2 . . E1 . G1 . A1 . . B1 . D2 .',
          'B1 . B2 . . B1 . D#2 . F#2 . . A2 . F#2 .'] },
        { inst: 'perc', vol: 0.5, notas: [
          'k+b . m b s+m . b k+m . k+b m s+m b m+q w',
          'k+b . m b s+m q b k+m . k+b m s+m b g w'] },
      ],
    },
    // Título: pop tropical con metales
    titulo: {
      bpm: 112, bucle: true, eco: 0.375,
      canales: [
        { inst: 'metales', vol: 0.1, eco: 0.15, notas: [
          'G4 - - - E4 - G4 - C5 - - - G4 - - -',
          'A4 - - - G4 - E4 - C4 - - - E4 - - -',
          'F4 - - - A4 - C5 - F5 - - - E5 - D5 -',
          'D5 - - - B4 - - - G4 - - - . . . .',
          'G4 - - - E4 - G4 - C5 - - - D5 - E5 -',
          'E5 - D5 - C5 - - - A4 - - - C5 - - -',
          'C5 - A4 - F4 - - - G4 - B4 - D5 - - -',
          'C5 - - - - - - - . . . . . . . .'] },
        { inst: 'rhodes', vol: 0.07, eco: 0.2, notas: [
          contra('E4,G4,C5'), contra('E4,A4,C5'), contra('F4,A4,C5'), contra('D4,G4,B4'),
          contra('E4,G4,C5'), contra('E4,A4,C5'), contra('F4,A4,C5'), contra('E4,G4,C5')] },
        { inst: 'bajoSlap', vol: 0.28, notas: [
          'C2 - . C3 . . C2 . C2 . G1 . A1 . B1 .', 'A1 - . A2 . . A1 . A1 . E1 . G1 . G#1 .',
          'F1 - . F2 . . F1 . F1 . C2 . D2 . E2 .', 'G1 - . G2 . . G1 . G1 . D2 . B1 . G1 .'] },
        { inst: 'perc', vol: 0.5, notas: ['k+h . h q s+h . h k+w h . k+h q s+h . h m', 'k+h . h q s+h . h k+w h . k+h q s+h g h w'] },
      ],
    },
    // Selección: groove tranquilo con rhodes
    seleccion: {
      bpm: 96, bucle: true, eco: 0.375,
      canales: [
        { inst: 'rhodes', vol: 0.1, eco: 0.35, notas: [
          'A4 . C5 . A4 . F4 . G4 . A4 . . . . .', 'F4 . A4 . F4 . D4 . E4 . F4 . . . . .',
          'D4 . F4 . Bb4 . A4 . G4 . F4 . D4 . . .', 'E4 . G4 . C5 . Bb4 . A4 . G4 . E4 . C4 .'] },
        { inst: 'pad', vol: 0.04, notas: [acorde('F3,A3,C4'), acorde('D3,F3,A3'), acorde('Bb2,D3,F3'), acorde('C3,E3,G3')] },
        { inst: 'bajoDub', vol: 0.32, notas: [
          'F2 - . F2 . . C2 . F2 - . F2 . C2 . .', 'D2 - . D2 . . A1 . D2 - . D2 . A1 . .',
          'Bb1 - . Bb1 . . F1 . Bb1 - . Bb1 . F1 . .', 'C2 - . C2 . . G1 . C2 - . C2 . G1 . .'] },
        { inst: 'perc', vol: 0.42, notas: ['k . m . c . m . k . m c e . m .'] },
      ],
    },
    victoria: {
      bpm: 150, bucle: false,
      canales: [
        { inst: 'metales', vol: 0.12, notas: ['C5 E5 G5 C6 - - G5 C6 - - - - E6 - - - - - - - . . . .'] },
        { inst: 'bajoSlap', vol: 0.28, notas: ['C2 - - - - - G1 - - - - - C2 - - - - - - - . . . .'] },
        { inst: 'perc', vol: 0.5, notas: ['k+h . h . s . h . k . . . s+v . . . v . . . . . . .'] },
      ],
    },
    derrota: {
      bpm: 90, bucle: false,
      canales: [
        { inst: 'melodica', vol: 0.12, eco: 0.4, notas: ['E5 - D5 - C5 - B4 - A4 - - - - - - - . .'] },
        { inst: 'bajoDub', vol: 0.3, notas: ['A1 - - - E1 - - - A1 - - - - - - - . .'] },
      ],
    },
    arranque: {
      bpm: 160, bucle: false, eco: 0.25,
      canales: [
        { inst: 'rhodes', vol: 0.12, eco: 0.4, notas: ['C6 - G6 - - - - - - - - - . .'] },
        { inst: 'pad', vol: 0.06, notas: ['C4,E4,G4 - - - - - - - - - - - . .'] },
      ],
    },
  };

  function preparar(c) {
    if (c.preparada) return c;
    c.pistas = c.canales.map((canal) => {
      const tokens = (Array.isArray(canal.notas) ? canal.notas.join(' ') : canal.notas).trim().split(/\s+/);
      const ev = new Array(tokens.length).fill(null);
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t === '.' || t === '-') continue;
        if (canal.inst === 'perc') {
          ev[i] = { golpes: t.split('+') };
        } else {
          let largo = 1;
          while (tokens[(i + largo) % tokens.length] === '-' && largo < tokens.length) largo++;
          ev[i] = { frecs: t.split(',').map(frecuencia), largo };
        }
      }
      return { inst: canal.inst, vol: canal.vol, eco: canal.eco || 0, ev, largo: tokens.length };
    });
    c.largo = Math.max.apply(null, c.pistas.map((p) => p.largo));
    c.preparada = true;
    return c;
  }

  // ---------- Síntesis básica ----------
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
    else if (inst === 'cuadrada') o.type = 'square';
    else if (inst === 'seno') o.type = 'sine';
    else o.type = 'triangle';
    o.frequency.setValueAtTime(frec, t);
    return o;
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

  // ---------- Instrumentos de la banda ----------
  // Cada uno arma su propio sonido; "salida" es la mezcla de música.
  function envolvente(g, t, vol, ataque, dur, sostener) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + ataque);
    if (sostener) {
      g.gain.setValueAtTime(vol * sostener, t + Math.max(ataque + 0.01, dur - 0.04));
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    }
  }

  function tocar(inst, t, f, dur, vol, salida, envioEco) {
    const g = ctx.createGain();
    g.connect(salida);
    if (envioEco) {
      const e = ctx.createGain();
      e.gain.value = envioEco;
      g.connect(e);
      e.connect(ecoEntrada);
    }
    const osc = (tipo, frec, detune) => {
      const o = oscilador(tipo, frec, t);
      if (detune) o.detune.setValueAtTime(detune, t);
      return o;
    };
    const arrancar = (nodos, fin) => nodos.forEach((o) => { o.start(t); o.stop(fin); });
    switch (inst) {
      case 'bajoSlap': {
        // Bajo funk: sierra + subgrave, filtro que se cierra rápido (el "pop" del slap)
        const a = osc('sierra', f), b = osc('seno', f);
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.Q.value = 7;
        filtro.frequency.setValueAtTime(2200, t);
        filtro.frequency.exponentialRampToValueAtTime(260, t + 0.14);
        a.connect(filtro).connect(g);
        const gb = ctx.createGain(); gb.gain.value = 0.8; b.connect(gb).connect(g);
        const largo = Math.min(dur, 0.5);
        envolvente(g, t, vol, 0.004, largo, 0.6);
        arrancar([a, b], t + largo + 0.05);
        break;
      }
      case 'bajoDub': {
        // Bajo de reggae: redondo y profundo
        const a = osc('seno', f), b = osc('triangulo', f);
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = 520;
        const gb = ctx.createGain(); gb.gain.value = 0.5;
        a.connect(g); b.connect(gb).connect(filtro).connect(g);
        envolvente(g, t, vol * 1.2, 0.01, dur, 0.75);
        arrancar([a, b], t + dur + 0.05);
        break;
      }
      case 'skank': {
        // Guitarra en contratiempo: rasgueo corto y brillante ("chk")
        const a = osc('cuadrada', f), b = osc('sierra', f, 8);
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 700;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 0.9;
        a.connect(hp); b.connect(hp); hp.connect(bp).connect(g);
        envolvente(g, t, vol, 0.003, 0.11);
        arrancar([a, b], t + 0.14);
        break;
      }
      case 'organo': {
        const a = osc('seno', f), b = osc('seno', f * 2), c = osc('seno', f * 3);
        const gb = ctx.createGain(); gb.gain.value = 0.5;
        const gc = ctx.createGain(); gc.gain.value = 0.25;
        a.connect(g); b.connect(gb).connect(g); c.connect(gc).connect(g);
        envolvente(g, t, vol, 0.005, 0.12);
        arrancar([a, b, c], t + 0.15);
        break;
      }
      case 'rhodes': {
        // Piano eléctrico: tono suave con una "campanita" al inicio
        const a = osc('seno', f), b = osc('seno', f * 2), c = osc('seno', f * 7);
        const gb = ctx.createGain(); gb.gain.setValueAtTime(0.35, t); gb.gain.exponentialRampToValueAtTime(0.02, t + 0.3);
        const gc = ctx.createGain(); gc.gain.setValueAtTime(0.12, t); gc.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        a.connect(g); b.connect(gb).connect(g); c.connect(gc).connect(g);
        const largo = Math.max(0.25, Math.min(dur * 1.2, 1.2));
        envolvente(g, t, vol, 0.006, largo);
        arrancar([a, b, c], t + largo + 0.05);
        break;
      }
      case 'lead':
      case 'melodica': {
        // Sintetizador principal (o melódica en el reggae) con vibrato
        const tipo = inst === 'lead' ? 'sierra' : 'cuadrada';
        const a = osc(tipo, f, -7), b = osc(tipo, f, 7);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
        lp.frequency.value = inst === 'lead' ? 2600 : 1500;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 5.5;
        const prof = ctx.createGain();
        prof.gain.setValueAtTime(0, t); prof.gain.linearRampToValueAtTime(inst === 'lead' ? 14 : 9, t + 0.25);
        lfo.connect(prof); prof.connect(a.detune); prof.connect(b.detune);
        a.connect(lp); b.connect(lp); lp.connect(g);
        envolvente(g, t, vol, inst === 'lead' ? 0.01 : 0.03, dur, 0.8);
        arrancar([a, b, lfo], t + dur + 0.05);
        break;
      }
      case 'metales': {
        // Metales: tres sierras con un filtro que se abre
        const os = [osc('sierra', f, -9), osc('sierra', f, 0), osc('sierra', f, 9)];
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
        lp.frequency.setValueAtTime(700, t); lp.frequency.linearRampToValueAtTime(3200, t + 0.06); lp.frequency.exponentialRampToValueAtTime(1300, t + 0.3);
        os.forEach((o) => o.connect(lp));
        lp.connect(g);
        envolvente(g, t, vol, 0.02, Math.max(0.12, dur), 0.7);
        arrancar(os, t + Math.max(0.12, dur) + 0.05);
        break;
      }
      case 'pad': {
        const a = osc('sierra', f, -10), b = osc('sierra', f, 10);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
        a.connect(lp); b.connect(lp); lp.connect(g);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.4);
        g.gain.setValueAtTime(vol, t + Math.max(0.45, dur - 0.3));
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.2);
        arrancar([a, b], t + dur + 0.25);
        break;
      }
      default: {
        const o = osc(inst, f);
        o.connect(g);
        envolvente(g, t, vol, 0.006, dur, 0.65);
        arrancar([o], t + dur + 0.03);
      }
    }
  }

  // Percusión: batería y percusión caribeña
  function percusion(t, tipo, vol, d) {
    switch (tipo) {
      case 'k': barrido(t, 130, 42, 0.18, 'seno', vol * 1.7, d, true); ruido(t, 0.01, vol * 0.4, 'highpass', 3000, 0, d); break;
      case 's': ruido(t, 0.16, vol * 0.75, 'bandpass', 1900, 0.7, d); barrido(t, 210, 150, 0.07, 'triangulo', vol * 0.6, d); break;
      case 'h': ruido(t, 0.035, vol * 0.32, 'highpass', 8000, 0, d); break;
      case 'o': ruido(t, 0.2, vol * 0.25, 'highpass', 7000, 0, d); break;
      case 'c': barrido(t, 1750, 1700, 0.035, 'triangulo', vol * 0.6, d); ruido(t, 0.02, vol * 0.3, 'bandpass', 2500, 2, d); break;
      case 'b': barrido(t, 845, 840, 0.14, 'cuadrada', vol * 0.08, d); barrido(t, 560, 556, 0.14, 'cuadrada', vol * 0.08, d); break;
      case 'q': barrido(t, 200, 165, 0.22, 'seno', vol * 0.9, d, true); break;          // conga grave
      case 'w': barrido(t, 330, 295, 0.16, 'seno', vol * 0.75, d, true); break;          // conga aguda
      case 'e': barrido(t, 540, 480, 0.1, 'seno', vol * 0.6, d, true); break;            // bongó
      case 'v': barrido(t, 700, 640, 0.25, 'triangulo', vol * 0.4, d); ruido(t, 0.2, vol * 0.25, 'bandpass', 4000, 1, d); break; // timbal
      case 'm': ruido(t, 0.05, vol * 0.18, 'highpass', 5500, 0, d); break;               // shaker
      case 'x': for (let i = 0; i < 3; i++) ruido(t + i * 0.012, 0.05, vol * 0.5, 'bandpass', 1300, 1, d); break; // palmas
      case 'g': for (let i = 0; i < 5; i++) ruido(t + i * 0.022, 0.02, vol * 0.35, 'bandpass', 3600, 3, d); break; // güiro
    }
  }

  // ---------- Efectos de la mezcla (eco y reverb) ----------
  function crearMezcla() {
    eco = ctx.createDelay(2);
    ecoEntrada = ctx.createGain();
    const realim = ctx.createGain(); realim.gain.value = 0.38;
    const filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 2400;
    ecoRetorno = ctx.createGain(); ecoRetorno.gain.value = 0.6;
    ecoEntrada.connect(eco);
    eco.connect(filtro).connect(realim).connect(eco);
    eco.connect(ecoRetorno).connect(gMusica);
    reverb = ctx.createConvolver();
    const largo = Math.floor(ctx.sampleRate * 1.6);
    const imp = ctx.createBuffer(2, largo, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = imp.getChannelData(c);
      for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 3);
    }
    reverb.buffer = imp;
    reverbEntrada = ctx.createGain(); reverbEntrada.gain.value = 0.18;
    gMusica.connect(reverbEntrada).connect(reverb).connect(maestro);
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
        if (p.inst === 'perc') ev.golpes.forEach((g) => percusion(c.proximo, g, p.vol, gMusica));
        else ev.frecs.forEach((f) => { if (f) tocar(p.inst, c.proximo, f, ev.largo * c.dur * 0.95, p.vol, gMusica, p.eco); });
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
      crearMezcla();
      A.aplicarVolumen();
      setInterval(programar, 25);
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
      maestro.gain.value = RW.opciones.sonido ? 1 : 0;
      gMusica.gain.value = RW.opciones.musica;
      gSfx.gain.value = RW.opciones.efectos;
    },

    musica(nombre) {
      if (A.actual === nombre && cancion) return;
      A.actual = nombre;
      if (!ctx || propia) return;          // con la canción del jugador no suena la del juego
      const datos = CANCIONES[nombre];
      if (!datos) { cancion = null; return; }
      preparar(datos);
      const dur = 60 / datos.bpm / 4;
      eco.delayTime.setValueAtTime((datos.eco || 0.375) * 4 * dur, ctx.currentTime);
      cancion = { datos, paso: 0, dur, proximo: ctx.currentTime + 0.06 };
    },

    detener() {
      cancion = null;
      A.actual = null;
    },

    // Reproduce una canción del jugador (archivo de su teléfono o computadora)
    cancionPropia(archivo) {
      A.iniciar();
      if (!ctx) return null;
      A.quitarCancionPropia();
      const el = new Audio();
      el.src = URL.createObjectURL(archivo);
      el.loop = true;
      const fuente = ctx.createMediaElementSource(el);
      fuente.connect(gMusica);
      propia = { el, fuente, nombre: archivo.name };
      cancion = null;
      el.play().catch(() => {});
      return propia.nombre;
    },

    quitarCancionPropia() {
      if (!propia) return;
      propia.el.pause();
      try { propia.fuente.disconnect(); } catch (e) { /* nada */ }
      URL.revokeObjectURL(propia.el.src);
      propia = null;
      const nombre = A.actual;
      A.actual = null;
      if (nombre) A.musica(nombre);
    },

    tienePropia() { return !!propia; },

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
