// =====================================================================
// sprites.js: los bailarines se dibujan como "marionetas" de píxeles.
// Cada pose es un conjunto de ángulos (torso, brazos, piernas) y con eso
// se arma el sprite en un lienzo de 168x172, con sombreado de 4 tonos,
// tramado y contorno, al estilo de los juegos de pelea de 16 bits.
//
// Convención de ángulos (personaje mirando a la derecha):
//   extremidades: 0 = hacia abajo, 90 = hacia adelante, 180 = hacia arriba,
//                 -90 = hacia atrás
//   torso (t) y cabeza (cab): 0 = derecho, positivo = inclinado hacia adelante
//   giro: rota todo el cuerpo (positivo = hacia adelante)
// =====================================================================
(function () {
  const RW = window.RW;

  const SW = 168, SH = 172, OX = 84, OY = 164;
  // Medidas del cuerpo en píxeles (el doble de las unidades del juego)
  const M = { muslo: 24, pierna: 24, brazo: 18, antebrazo: 17, torso: 34, cuello: 5, cabeza: 11, pie: 9 };
  const CONTORNO = '#1a0f26';
  const U_CONTORNO = RW.u32(CONTORNO);

  const sin = (g) => Math.sin((g * Math.PI) / 180);
  const cos = (g) => Math.cos((g * Math.PI) / 180);
  const dir = (g) => [sin(g), cos(g)];
  const sumar = (a, b, k) => [a[0] + b[0] * (k === undefined ? 1 : k), a[1] + b[1] * (k === undefined ? 1 : k)];
  // Inclina un vector hacia adelante g grados
  const girar = (v, g) => [v[0] * cos(g) - v[1] * sin(g), v[1] * cos(g) + v[0] * sin(g)];

  // ---------------- Poses ----------------
  const DEF = {
    t: 6, cab: -4, bd1: 30, bd2: 140, bt1: 10, bt2: 120, pd1: 22, pd2: -2, pt1: -18, pt2: -8,
    cx: 0, cy: -25, giro: 0, suelo: true, cara: 'normal',
  };
  let contadorPoses = 0;
  function P(base, cambios) {
    if (!cambios) { cambios = base; base = DEF; }
    const p = Object.assign({}, DEF, base, cambios);
    p._id = ++contadorPoses;
    return p;
  }

  const ag = P({ t: 30, cab: -18, pd1: 80, pd2: -20, pt1: 50, pt2: -60, bd1: 40, bd2: 150, bt1: 30, bt2: 135 });
  const POSES = {
    q1: P({}),
    q2: P({ t: 9, cab: -2, bd2: 150, bt2: 128, pd1: 30, pd2: -8, pt1: -10, pt2: -22 }),
    q3: P({ t: 5, cab: -6, bd1: 36, bd2: 134, bt1: 16, bt2: 112, pd1: 20, pd2: 0, pt1: -20, pt2: -6 }),
    q4: P({ t: 10, cab: -1, bd1: 26, bd2: 152, bt2: 132, pd1: 30, pd2: -8, pt1: -10, pt2: -22, cx: 1 }),

    c1: P({ pd1: 25, pd2: 8, pt1: -20, pt2: -10, bd1: 24, bt1: 22, t: 8 }),
    c2: P({ pd1: 2, pd2: -2, pt1: 22, pt2: -30, bd1: 32, bt1: 12, t: 7 }),
    c3: P({ pd1: -20, pd2: -10, pt1: 25, pt2: 8, bd1: 40, bt1: 2, t: 8 }),
    c4: P({ pd1: 22, pd2: -30, pt1: 2, pt2: -2, bd1: 32, bt1: 12, t: 7 }),

    ag,
    aterrizaje: P({ t: 18, cab: -10, pd1: 55, pd2: -15, pt1: 25, pt2: -45, bd1: 50, bd2: 130, bt1: 30, bt2: 110 }),

    saltoArriba: P({ suelo: false, cy: -26, t: 0, cab: -6, pd1: 60, pd2: -10, pt1: 20, pt2: -40, bd1: 140, bd2: 170, bt1: -30, bt2: 10 }),
    saltoMedio: P({ suelo: false, cy: -24, t: 12, cab: -10, pd1: 85, pd2: -35, pt1: 55, pt2: -60, bd1: 60, bd2: 150, bt1: 30, bt2: 140 }),
    saltoAbajo: P({ suelo: false, cy: -26, t: 4, cab: -4, pd1: 30, pd2: 5, pt1: -10, pt2: -25, bd1: 70, bd2: 120, bt1: -40, bt2: -10 }),

    // Ataques normales
    ligero1: P({ t: 4, bd1: 40, bd2: 160, bt1: 10, bt2: 120 }),
    ligero2: P({ t: 12, cab: -6, bd1: 84, bd2: 90, bt1: -25, bt2: 45, pd1: 28, pd2: -4, pt1: -22, pt2: -10, cara: 'grito' }),
    fuerte1: P({ t: -4, cab: -8, bd1: -50, bd2: -10, bt1: 30, bt2: 100, pd1: 15, pd2: 0, pt1: -25, pt2: -10 }),
    fuerte2: P({ t: 20, cab: -14, cx: 3, bd1: 115, bd2: 105, bt1: -95, bt2: -100, pd1: 40, pd2: -5, pt1: -30, pt2: -15, cara: 'grito' }),
    fuerte3: P({ t: 14, bd1: 70, bd2: 80, bt1: -50, bt2: -30, pd1: 32, pd2: -4, pt1: -26, pt2: -12 }),
    patada1: P({ t: -8, cab: 4, pd1: 85, pd2: 0, pt1: -4, pt2: -4, bd1: 50, bd2: 120, bt1: -50, bt2: -20 }),
    patada2: P({ t: -18, cab: 12, pd1: 102, pd2: 98, pt1: -6, pt2: -6, bd1: 40, bd2: 80, bt1: -80, bt2: -60, cara: 'grito' }),
    agLigero1: P(ag, { bd1: 45, bd2: 165 }),
    agLigero2: P(ag, { bd1: 78, bd2: 86, bt1: 20, bt2: 130, cara: 'grito' }),
    agFuerte1: P(ag, { bd1: 40, bd2: 170, t: 24 }),
    agFuerte2: P({ t: -4, cab: -10, pd1: 45, pd2: -15, pt1: 10, pt2: -40, bd1: 168, bd2: 175, bt1: -40, bt2: 0, cara: 'grito' }),
    barrida1: P({ t: 35, cab: -25, pd1: 90, pd2: -40, pt1: 70, pt2: -80, bd1: 60, bd2: 30, bt1: 10, bt2: 0, manosSuelo: true }),
    barrida2: P({ t: -10, cab: -5, pd1: 84, pd2: 88, pt1: 90, pt2: -95, bd1: 50, bd2: 80, bt1: -20, bt2: -10, manosSuelo: true, cara: 'grito' }),
    aereoLigero: P({ suelo: false, cy: -24, t: 10, pd1: 95, pd2: 10, pt1: 20, pt2: -50, bd1: 110, bd2: 60, bt1: -20, bt2: 30, cara: 'grito' }),
    aereoFuerte: P({ suelo: false, cy: -24, t: 28, cab: -16, pd1: 70, pd2: -40, pt1: 30, pt2: -70, bd1: 75, bd2: 50, bt1: 60, bt2: 40, cara: 'grito' }),
    aereoPatada: P({ suelo: false, cy: -24, t: -12, cab: 6, pd1: 62, pd2: 62, pt1: -10, pt2: -95, bd1: 120, bd2: 150, bt1: -60, bt2: -30, cara: 'grito' }),

    // Especiales (genéricos, cada personaje puede cambiarlos)
    proy1: P({ t: -8, cab: -6, bd1: -45, bd2: 10, bt1: -60, bt2: -20, pd1: 20, pd2: -5, pt1: -25, pt2: -10 }),
    proy2: P({ t: 16, cab: -12, cx: 2, bd1: 82, bd2: 88, bt1: 74, bt2: 84, pd1: 38, pd2: -6, pt1: -30, pt2: -14, cara: 'grito' }),
    dp1: P({ t: 20, cab: -12, pd1: 65, pd2: -20, pt1: 35, pt2: -50, bd1: 30, bd2: 150, bt1: 20, bt2: 140 }),
    dp2: P({ suelo: false, cy: -26, t: -6, cab: -14, pd1: 85, pd2: 0, pt1: -6, pt2: -4, bd1: 172, bd2: 178, bt1: -30, bt2: 10, cara: 'grito' }),
    dp3: P({ suelo: false, cy: -26, t: 8, pd1: 40, pd2: -10, pt1: -15, pt2: -30, bd1: 120, bd2: 140, bt1: -50, bt2: -20 }),
    giro1: P({ suelo: false, cy: -28, t: 0, cab: -4, pd1: 92, pd2: 92, pt1: -10, pt2: -30, bd1: 100, bd2: 100, bt1: -100, bt2: -100, cara: 'grito' }),
    giro2: P({ suelo: false, cy: -28, t: 0, pd1: 10, pd2: -10, pt1: -5, pt2: -20, bd1: 20, bd2: 60, bt1: -20, bt2: -60 }),
    giro3: P({ suelo: false, cy: -28, t: 0, pd1: 10, pd2: -30, pt1: -92, pt2: -92, bd1: -100, bd2: -100, bt1: 100, bt2: 100, cara: 'grito' }),
    giro4: P({ suelo: false, cy: -28, t: 2, pd1: 14, pd2: -14, pt1: -2, pt2: -16, bd1: 30, bd2: 70, bt1: -30, bt2: -70 }),
    super1: P({ t: -4, cab: -20, bd1: 140, bd2: 150, bt1: -140, bt2: -150, pd1: 25, pd2: 10, pt1: -25, pt2: -10, cara: 'grito' }),

    // Reacciones
    golpeAlto: P({ t: -22, cab: -22, cx: -2, bd1: 70, bd2: 30, bt1: -50, bt2: -20, pd1: 18, pd2: 12, pt1: -24, pt2: -16, cara: 'dolor' }),
    golpeBajo: P({ t: 28, cab: 18, bd1: 10, bd2: 40, bt1: -10, bt2: 30, pd1: 10, pd2: -10, pt1: -20, pt2: -20, cara: 'dolor' }),
    golpeAgachado: P(ag, { t: 12, cab: -30, bd1: 60, bd2: 20, cara: 'dolor' }),
    guardia: P({ t: -4, cab: 6, bd1: 45, bd2: 168, bt1: 35, bt2: 158, pd1: 16, pd2: 2, pt1: -24, pt2: -12 }),
    guardiaAgachado: P(ag, { bd1: 55, bd2: 170, bt1: 45, bt2: 162, cab: -10 }),
    derribado: P({ suelo: false, cy: -20, giro: -55, t: 0, cab: -20, pd1: 40, pd2: 20, pt1: 10, pt2: -10, bd1: 110, bd2: 140, bt1: 70, bt2: 110, cara: 'dolor' }),
    acostado: P({ giro: -90, t: 0, cab: 6, pd1: 25, pd2: -10, pt1: 5, pt2: -5, bd1: 150, bd2: 170, bt1: 30, bt2: 10, cara: 'ko' }),
    levantarse1: P({ giro: -40, t: 0, cab: -10, pd1: 80, pd2: -10, pt1: 60, pt2: -30, bd1: 0, bd2: 10, bt1: -30, bt2: -10, manosSuelo: true }),
    levantarse2: P({ t: 20, cab: -10, pd1: 75, pd2: -5, pt1: 20, pt2: -88, bd1: 40, bd2: 60, bt1: 30, bt2: 50 }),
    mareado1: P({ t: 12, cab: 18, bd1: 5, bd2: 0, bt1: -5, bt2: -5, pd1: 10, pd2: 10, pt1: -14, pt2: -10, cara: 'ko' }),
    mareado2: P({ t: -2, cab: -14, cx: -1, bd1: 15, bd2: 10, bt1: 5, bt2: 0, pd1: 14, pd2: 6, pt1: -10, pt2: -14, cara: 'ko' }),

    // Celebraciones, burlas y movimientos
    victoria1: P({ t: -8, cab: -16, bd1: 160, bd2: 165, bt1: -25, bt2: 45, pd1: 25, pd2: 22, pt1: -8, pt2: -8, cara: 'feliz' }),
    victoria2: P({ t: -4, cab: -14, bd1: 155, bd2: 170, bt1: 150, bt2: 165, pd1: 18, pd2: 8, pt1: -18, pt2: -8, cara: 'feliz' }),
    provocar1: P({ t: -8, cab: 6, bd1: 80, bd2: 140, bt1: -25, bt2: 45, pd1: 16, pd2: 16, pt1: -16, pt2: -6, cx: -1, cara: 'feliz' }),
    provocar2: P({ t: -6, cab: 2, bd1: 80, bd2: 175, bt1: -25, bt2: 45, pd1: 24, pd2: 10, pt1: -16, pt2: -6, cx: 1, cara: 'feliz' }),
    dashAdelante: P({ t: 26, cab: -18, bd1: -40, bd2: -20, bt1: -60, bt2: -40, pd1: 50, pd2: -10, pt1: -40, pt2: -30 }),
    moon1: P({ t: -2, bd1: 20, bd2: 40, bt1: -10, bt2: 20, pd1: 0, pd2: 0, pt1: -12, pt2: -32, pieT: 125, cara: 'feliz' }),
    moon2: P({ t: -2, bd1: 30, bd2: 50, bt1: -4, bt2: 30, pd1: -12, pd2: -32, pieD: 125, pt1: 0, pt2: 0, cara: 'feliz' }),
    agarre1: P({ t: 14, bd1: 80, bd2: 80, bt1: 70, bt2: 75, pd1: 30, pd2: -4, pt1: -24, pt2: -10 }),
    agarre2: P({ t: 0, cab: -10, bd1: 160, bd2: 168, bt1: -60, bt2: -20, pd1: 20, pd2: 5, pt1: -20, pt2: -10, cara: 'feliz' }),
    // En la tarima del DJ
    dj1: P({ t: 14, cab: 2, bd1: 40, bd2: 78, bt1: 35, bt2: 72, pd1: 8, pd2: 0, pt1: -8, pt2: 0 }),
    dj2: P({ t: 18, cab: 14, bd1: 46, bd2: 84, bt1: 30, bt2: 64, pd1: 10, pd2: 0, pt1: -8, pt2: 0, cara: 'feliz' }),
    dj3: P({ t: 6, cab: -12, bd1: 165, bd2: 172, bt1: 35, bt2: 72, pd1: 8, pd2: 0, pt1: -8, pt2: 0, cara: 'grito' }),
  };

  // Voltereta del salto hacia adelante (el cuerpo gira completo)
  [0, 90, 180, 270].forEach((g, i) => {
    POSES['voltereta' + i] = P({ suelo: false, cy: -22, t: 30, cab: 10, pd1: 100, pd2: -50, pt1: 90, pt2: -60,
      bd1: 80, bd2: 20, bt1: 70, bt2: 10, giro: g });
  });
  // Cuando lo hacen girar en un agarre de baile
  [0, 60, 120, 180, 240, 300].forEach((g, i) => {
    POSES['lanzado' + i] = P(POSES.golpeAlto, { suelo: false, cy: -26, giro: g });
  });

  // Poses propias de cada integrante (especiales y celebraciones)
  const POSES_PJ = {
    beto: {
      proy1: P({ t: -6, cab: -14, bd1: 40, bd2: 165, bt1: -70, bt2: -40, pd1: 20, pd2: -5, pt1: -25, pt2: -10 }),
      proy2: P({ t: 14, cab: -6, cx: 2, bd1: 60, bd2: 122, bt1: -110, bt2: -120, pd1: 36, pd2: -6, pt1: -30, pt2: -14, cara: 'grito' }),
      super2: P({ t: 12, cab: -10, cx: 2, bd1: 70, bd2: 118, bt1: -120, bt2: -140, pd1: 40, pd2: -6, pt1: -32, pt2: -16, cara: 'grito' }),
      victoria3: P({ t: -10, cab: -22, bd1: 120, bd2: 160, bt1: -130, bt2: -150, pd1: 22, pd2: 10, pt1: -20, pt2: -8, cara: 'grito' }),
    },
    abeja: {
      proy1: P({ frente: true, t: 2, cab: -4, bd1: 30, bd2: 80, bt1: 60, bt2: 100, pd1: 22, pd2: -4, pt1: -20, pt2: -8 }),
      proy2: P({ frente: true, t: 10, cab: -14, bd1: 60, bd2: 20, bt1: 70, bt2: 95, pd1: 34, pd2: -6, pt1: -26, pt2: -12, cara: 'grito' }),
      super2: P({ frente: true, t: -10, cab: -20, bd1: 50, bd2: 10, bt1: 90, bt2: 120, pd1: 30, pd2: 10, pt1: -24, pt2: -8, cara: 'grito' }),
      victoria3: P({ frente: true, t: -12, cab: -18, bd1: 40, bd2: 30, bt1: 80, bt2: 110, pd1: 30, pd2: 24, pt1: -14, pt2: -10, cara: 'grito' }),
    },
    fofo: {
      proy1: P({ t: -6, cab: -8, bd1: 160, bd2: 175, bt1: 150, bt2: 170, pd1: 20, pd2: -5, pt1: -25, pt2: -10, baquetas: true }),
      proy2: P({ t: 18, cab: -12, cx: 2, bd1: 90, bd2: 95, bt1: 40, bt2: 60, pd1: 38, pd2: -6, pt1: -30, pt2: -14, cara: 'grito', sinBaquetaD: true, baquetas: true }),
      super2: P({ t: 22, cab: -16, cx: 3, bd1: 100, bd2: 60, bt1: 80, bt2: 40, pd1: 44, pd2: -6, pt1: -32, pt2: -16, cara: 'grito', baquetas: true }),
      victoria3: P({ t: -6, cab: -16, bd1: 165, bd2: 140, bt1: 160, bt2: -160, pd1: 22, pd2: 8, pt1: -20, pt2: -8, cara: 'feliz', baquetas: true }),
    },
    tony: {
      proy1: P({ frente: true, t: 4, cab: 4, bd1: 40, bd2: 150, bt1: 60, bt2: 100, pd1: 26, pd2: -6, pt1: -22, pt2: -10 }),
      proy2: P({ frente: true, t: 12, cab: -10, bd1: 40, bd2: 10, bt1: 70, bt2: 95, pd1: 40, pd2: -8, pt1: -30, pt2: -14, cara: 'grito' }),
      super2: P({ frente: true, t: 20, cab: -14, bd1: 60, bd2: -10, bt1: 75, bt2: 95, pd1: 50, pd2: -10, pt1: -34, pt2: -18, cara: 'grito' }),
      victoria3: P({ frente: true, t: 6, cab: 10, bd1: 35, bd2: 60, bt1: 70, bt2: 95, pd1: 30, pd2: -8, pt1: -16, pt2: -10, cara: 'feliz' }),
    },
  };

  RW.POSES = POSES;
  RW.posePj = function (pjId, nombre) {
    const propias = POSES_PJ[pjId];
    if (propias && propias[nombre]) return propias[nombre];
    if (nombre === 'super2') return POSES.proy2;
    if (nombre === 'victoria3') return POSES.victoria2;
    return POSES[nombre];
  };

  // ---------------- Esqueleto ----------------
  function esqueleto(p) {
    const S = {};
    const u = [sin(p.t), -cos(p.t)];      // eje del torso (hacia arriba)
    const q = [cos(p.t), sin(p.t)];       // perpendicular (hacia adelante)
    S.cadera = [0, 0];
    S.cuello = sumar(S.cadera, u, M.torso);
    S.hD = sumar(sumar(S.cuello, q, 8.5), u, -5);
    S.hT = sumar(sumar(S.cuello, q, -8.5), u, -5);
    S.cD = sumar(S.cadera, q, 6);
    S.cT = sumar(S.cadera, q, -6);
    S.codoD = sumar(S.hD, dir(p.bd1), M.brazo);
    S.manoD = sumar(S.codoD, dir(p.bd2), M.antebrazo);
    S.codoT = sumar(S.hT, dir(p.bt1), M.brazo);
    S.manoT = sumar(S.codoT, dir(p.bt2), M.antebrazo);
    S.rodD = sumar(S.cD, dir(p.pd1), M.muslo);
    S.tobD = sumar(S.rodD, dir(p.pd2), M.pierna);
    S.pieD = sumar(S.tobD, dir(p.pieD !== undefined ? p.pieD : p.pd2 + 90), M.pie);
    S.rodT = sumar(S.cT, dir(p.pt1), M.muslo);
    S.tobT = sumar(S.rodT, dir(p.pt2), M.pierna);
    S.pieT = sumar(S.tobT, dir(p.pieT !== undefined ? p.pieT : p.pt2 + 90), M.pie);
    const angCab = p.t + p.cab;
    S.cabeza = sumar(S.cuello, [sin(angCab), -cos(angCab)], M.cuello + M.cabeza * 0.9);
    S.angCabeza = angCab;

    const claves = ['cadera', 'cuello', 'hD', 'hT', 'cD', 'cT', 'codoD', 'manoD', 'codoT', 'manoT',
      'rodD', 'tobD', 'pieD', 'rodT', 'tobT', 'pieT', 'cabeza'];
    if (p.giro) {
      claves.forEach((k) => { S[k] = girar(S[k], p.giro); });
      S.angCabeza += p.giro;
    }
    let dx = p.cx * 2, dy;
    if (p.suelo) {
      let bajo = -Infinity;
      const ver = (pt, r) => { bajo = Math.max(bajo, pt[1] + r); };
      ver(S.tobD, 4); ver(S.tobT, 4); ver(S.pieD, 4.4); ver(S.pieT, 4.4);
      ver(S.rodD, 7); ver(S.rodT, 7); ver(S.cadera, 8); ver(S.hD, 6); ver(S.hT, 6);
      ver(S.cabeza, M.cabeza + 2);
      if (p.manosSuelo) { ver(S.manoD, 4); ver(S.manoT, 4); }
      dy = -bajo;
    } else {
      dy = p.cy * 2;
    }
    claves.forEach((k) => { S[k] = [S[k][0] + dx + OX, S[k][1] + dy + OY]; });
    const ex = S.cuello[0] - S.cadera[0], ey = S.cuello[1] - S.cadera[1];
    const l = Math.hypot(ex, ey) || 1;
    S.u = [ex / l, ey / l];
    S.q = [-S.u[1], S.u[0]];
    return S;
  }

  // ---------------- Tonos y sombreado ----------------
  // Luz desde arriba a la izquierda. Cuatro tonos por material: luz, base, sombra y oscuro,
  // con tramado (dithering) en los bordes entre tonos, como en los juegos de 16 bits.
  const LX = 0.6, LY = 0.8;
  const UMBRALES = [0.42, -0.14, -0.6];
  function tonos(hex, extra) {
    const base = extra ? RW.oscurecer(hex, extra) : hex;
    return [RW.u32(RW.mezclar(base, '#fff6dc', 0.3)), RW.u32(base), RW.u32(RW.oscurecer(base, 0.3)), RW.u32(RW.oscurecer(base, 0.56))];
  }
  let BANDA = 0.07;   // ancho del tramado entre tonos (más fino en los retratos grandes)
  function tono(T, lum, x, y) {
    for (let k = 0; k < 3; k++) {
      const d = lum - UMBRALES[k];
      if (d > BANDA) return T[k];
      if (d > -BANDA) return ((x + y) & 1) ? T[k] : T[k + 1];
    }
    return T[3];
  }

  // Cápsula afinada (r0 al inicio, r1 al final), sombreada como un cilindro.
  function capsula(L, a, b, r0, r1, T, borde) {
    const x0 = a[0], y0 = a[1], x1 = b[0], y1 = b[1];
    const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
    const m = Math.max(r0, r1) + 3;
    L.pintar(Math.min(x0, x1) - m, Math.min(y0, y1) - m, Math.max(x0, x1) + m, Math.max(y0, y1) + m, (px, py) => {
      let t = l2 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = px - (x0 + dx * t), ey = py - (y0 + dy * t);
      const r = r0 + (r1 - r0) * t;
      const d = Math.sqrt(ex * ex + ey * ey);
      if (borde) return d <= r + 1.4 ? U_CONTORNO : 0;
      if (d > r) return 0;
      if (typeof T === 'number') return T;
      return tono(T, -(ex * LX + ey * LY) / r + 0.12, px | 0, py | 0);
    });
  }

  function bola(L, c, r, T, borde) {
    L.pintar(c[0] - r - 2, c[1] - r - 2, c[0] + r + 2, c[1] + r + 2, (px, py) => {
      const ex = px - c[0], ey = py - c[1];
      const d = Math.sqrt(ex * ex + ey * ey);
      if (borde) return d <= r + 1.3 ? U_CONTORNO : 0;
      if (d > r) return 0;
      if (typeof T === 'number') return T;
      return tono(T, -(ex * LX + ey * LY) / r + 0.15, px | 0, py | 0);
    });
  }

  // ---------------- Estampados de la ropa ----------------
  // Mini fuente de 3x5 para las letras de las franelas.
  const MICRO = {
    A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], E: [7, 4, 6, 4, 7], I: [7, 2, 2, 2, 7],
    L: [4, 4, 4, 4, 7], N: [5, 7, 7, 7, 5], O: [2, 5, 5, 5, 2], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6],
    T: [7, 2, 2, 2, 2], U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], Z: [7, 1, 2, 4, 7], ' ': [0, 0, 0, 0, 0],
  };
  function crearEstampa(w, h, dibujo) {
    const d = new Uint32Array(w * h);
    const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = RW.u32(c); };
    const rect = (x, y, rw, rh, c) => { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) px(x + i, y + j, c); };
    const letras = (txt, x, y, c, sep) => {
      let cx = x;
      for (const ch of txt) {
        const g = MICRO[ch] || MICRO[' '];
        for (let f = 0; f < 5; f++) for (let col = 0; col < 3; col++) if (g[f] & (4 >> col)) px(cx + col, y + f, c);
        cx += ch === ' ' ? (sep || 2) : 4;
      }
    };
    dibujo({ px, rect, letras });
    return { w, h, d };
  }
  const ESTAMPAS = {
    bravos: crearEstampa(26, 10, (e) => {
      e.letras('BRAVOS', 2, 2, '#13404a');
      e.letras('BRAVOS', 1, 1, '#1f9a96');
      for (let x = 3; x < 23; x++) e.px(x, 8, '#1f9a96');
      e.px(23, 7, '#1f9a96'); e.px(24, 6, '#1f9a96');
    }),
    enalta: crearEstampa(27, 12, (e) => {
      e.rect(0, 0, 27, 12, '#f2c230');
      e.rect(0, 0, 27, 2, '#d8323c');
      e.rect(0, 10, 27, 2, '#d8323c');
      e.letras('EN ALTA', 1, 4, '#24305e', 3);
      for (let x = 2; x < 25; x += 2) e.px(x, 1, '#ffd8a0');
    }),
    emblema: crearEstampa(24, 16, (e) => {
      for (let a = 0; a <= 180; a += 4) {
        const r = (a * Math.PI) / 180;
        for (let k = 0; k < 2; k++) e.px(Math.round(12 + Math.cos(r) * (9 - k)), Math.round(9 - Math.sin(r) * (8 - k)), '#2a9a4a');
      }
      e.rect(2, 8, 20, 7, '#d8323c');
      e.letras('VZLA', 5, 9, '#ffffff');
      e.px(12, 2, '#d8323c'); e.px(11, 3, '#d8323c'); e.px(13, 3, '#d8323c');
    }),
  };
  function muestraEstampa(est, a, b, a0, b0) {
    const x = Math.floor(b - b0 + est.w / 2), y = Math.floor(a0 - a + est.h / 2);
    if (x < 0 || y < 0 || x >= est.w || y >= est.h) return 0;
    return est.d[y * est.w + x];
  }

  // ---------------- Paleta del personaje ----------------
  function paleta(look) {
    const k = {};
    const cam = look.camisa;
    k.piel = tonos(look.piel);
    k.pielT = tonos(look.piel, 0.18);
    k.cab = tonos(look.cabello);
    k.barba = tonos(look.colorBarba || look.cabello);
    k.cam = tonos(cam.color);
    k.camT = tonos(cam.color, 0.18);
    k.cam2 = tonos(cam.color2 || cam.color);
    k.ribete = tonos(cam.ribete || cam.color2 || cam.color);
    k.interior = tonos(cam.interior || '#f4f1ea');
    k.mangaInt = tonos(cam.mangaInterior || look.piel);
    k.mangaIntT = tonos(cam.mangaInterior || look.piel, 0.18);
    k.pan = tonos(look.pantalon.color);
    k.panT = tonos(look.pantalon.color, 0.18);
    k.zap = tonos(look.zapatos.color);
    k.zapT = tonos(look.zapatos.color, 0.15);
    k.suela = tonos(look.zapatos.suela || '#b8b6c4');
    k.acento = RW.u32(look.zapatos.acento || '#d8323c');
    k.gorro = tonos(look.colorGorro || '#333333');
    k.lunar = RW.u32(look.gorroLunares || '#ffffff');
    k.lente = tonos(look.colorLente || '#2a2a44');
    k.marco = RW.u32('#14121c');
    k.boca = RW.u32('#7a2a32');
    k.dientes = RW.u32('#fbf6ee');
    k.metal = tonos('#c9ccd6');
    k.perla = tonos('#f4f0e6');
    k.oro = tonos('#e9bd3f');
    k.inst = tonos(look.colorInstrumento || '#c8541d');
    k.madera = tonos('#7a4a26');
    k.negro = tonos('#26222e');
    k.baqueta = tonos('#ecd09a');
    k.oscuro = U_CONTORNO;
    return k;
  }

  // ---------------- Brazos ----------------
  function dibujarBrazo(L, S, lado, k, look, p, borde) {
    const h = lado === 'D' ? S.hD : S.hT;
    const c = lado === 'D' ? S.codoD : S.codoT;
    const m = lado === 'D' ? S.manoD : S.manoT;
    const tras = lado === 'T';
    const piel = tras ? k.pielT : k.piel;
    const cam = tras ? k.camT : k.cam;
    const cm = look.camisa;
    const larga = cm.manga === 'larga';
    const interior = cm.mangaInterior ? (tras ? k.mangaIntT : k.mangaInt) : null;
    if (borde) {
      capsula(L, h, c, cm.manga === 'corta' ? 8.6 : 6.2, 5.4, 0, true);
      capsula(L, c, m, 5.2, 4.4, 0, true);
      bola(L, m, 5, 0, true);
    }
    const colorBrazo = larga ? cam : (interior || piel);
    capsula(L, h, c, 6, 5.2, colorBrazo);
    capsula(L, c, m, 5, 4.1, larga ? cam : (interior || piel));
    // Manga corta (ancha en las franelas grandes)
    if (cm.manga === 'corta') {
      const fin = [h[0] + (c[0] - h[0]) * 0.62, h[1] + (c[1] - h[1]) * 0.62];
      const ancha = cm.tipo === 'franela' || cm.tipo === 'jersey' ? 8.6 : 7.6;
      if (cm.ribete && cm.tipo === 'jersey') capsula(L, h, fin, ancha, ancha - 0.6, tras ? tonos(cm.ribete, 0.18) : k.ribete);
      const fin2 = [h[0] + (c[0] - h[0]) * 0.54, h[1] + (c[1] - h[1]) * 0.54];
      capsula(L, h, cm.ribete && cm.tipo === 'jersey' ? fin2 : fin, ancha, ancha - 0.8, cam);
    }
    // Reloj o pulsera
    if (look.reloj === lado) {
      const r = [c[0] + (m[0] - c[0]) * 0.82, c[1] + (m[1] - c[1]) * 0.82];
      bola(L, r, 3.9, k.metal);
      bola(L, r, 1.6, U_CONTORNO);
    }
    // Mano
    bola(L, m, 4.6, piel);
    const pulgar = [m[0] + (m[0] - c[0]) * 0.12 - 1.4, m[1] + (m[1] - c[1]) * 0.12 - 1.9];
    bola(L, pulgar, 2, piel);

    // Objetos en la mano
    const ang = (lado === 'D' ? p.bd2 : p.bt2) - (p.giro || 0);
    const baquetas = look.mano === 'baquetas' || p.baquetas;
    if (baquetas && !(lado === 'D' && p.sinBaquetaD)) {
      const d = dir(p.ab !== undefined ? p.ab : ang);
      capsula(L, [m[0] - d[0] * 2, m[1] - d[1] * 2], [m[0] + d[0] * 17, m[1] + d[1] * 17], 1.5, 1.1, 0, true);
      capsula(L, [m[0] - d[0] * 2, m[1] - d[1] * 2], [m[0] + d[0] * 17, m[1] + d[1] * 17], 1.4, 1.0, k.baqueta);
      bola(L, [m[0] + d[0] * 17, m[1] + d[1] * 17], 1.4, k.perla);
      bola(L, m, 3.4, piel);
    }
    if (look.mano === 'microfono' && lado === 'D') {
      const d = dir(p.ap !== undefined ? p.ap : ang + 90);
      const fin = [m[0] + d[0] * 9, m[1] + d[1] * 9];
      capsula(L, m, fin, 2.4, 2.0, 0, true);
      capsula(L, m, fin, 1.9, 1.5, k.negro);
      bola(L, [m[0] + d[0] * 11.5, m[1] + d[1] * 11.5], 3.6, 0, true);
      bola(L, [m[0] + d[0] * 11.5, m[1] + d[1] * 11.5], 3.4, k.metal);
      bola(L, m, 3.3, piel);
    }
  }

  // ---------------- Piernas ----------------
  function dibujarPierna(L, S, lado, k, look, borde) {
    const c = lado === 'D' ? S.cD : S.cT;
    const r = lado === 'D' ? S.rodD : S.rodT;
    const t = lado === 'D' ? S.tobD : S.tobT;
    const pie = lado === 'D' ? S.pieD : S.pieT;
    const tras = lado === 'T';
    const pan = tras ? k.panT : k.pan;
    const piel = tras ? k.pielT : k.piel;
    const ancho = look.pantalon.ancho;
    const rm0 = ancho ? 9 : 7.4, rm1 = ancho ? 7.8 : 6, rp0 = ancho ? 7.8 : 5.8, rp1 = ancho ? 7.4 : 5;
    if (borde) {
      capsula(L, c, r, rm0, rm1, 0, true);
      capsula(L, r, t, rp0, rp1, 0, true);
      capsula(L, t, pie, 4.6, 4.2, 0, true);
    }
    capsula(L, c, r, rm0, rm1, pan);
    // Zapato deportivo: suela, franja de color y cordones
    const d = [pie[0] - t[0], pie[1] - t[1]];
    const ld = Math.hypot(d[0], d[1]) || 1;
    const ux = d[0] / ld, uy = d[1] / ld;
    const nx = -uy, ny = ux;          // hacia "abajo" del zapato
    const ini = [t[0] - ux * 2.5, t[1] - uy * 2.5], fin = [pie[0] + ux * 2, pie[1] + uy * 2];
    const zap = tras ? k.zapT : k.zap;
    L.pintar(Math.min(ini[0], fin[0]) - 7, Math.min(ini[1], fin[1]) - 7, Math.max(ini[0], fin[0]) + 7, Math.max(ini[1], fin[1]) + 7, (px, py) => {
      const vx = px - ini[0], vy = py - ini[1];
      const largo = ld + 4.5;
      let tt = (vx * ux + vy * uy) / largo;
      const tc = tt < 0 ? 0 : tt > 1 ? 1 : tt;
      const ex = px - (ini[0] + ux * largo * tc), ey = py - (ini[1] + uy * largo * tc);
      const rr = 4.7 - tc * 0.6;
      const dd = Math.sqrt(ex * ex + ey * ey);
      if (dd > rr) return 0;
      const s = (ex * nx + ey * ny) / rr;
      if (s > 0.42) return tono(k.suela, 0.3 - s * 0.4, px | 0, py | 0);
      if (s > 0.1 && s < 0.42 && tc > 0.35 && tc < 0.75) return k.acento;
      if (s < -0.35 && tc > 0.45 && tc < 0.85 && ((px + py) & 1)) return zap[2];
      return tono(zap, -(ex * LX + ey * LY) / rr + 0.2, px | 0, py | 0);
    });
    if (look.pantalon.corto) {
      capsula(L, r, t, 4.8, 3.8, piel);
      capsula(L, c, [c[0] + (r[0] - c[0]) * 1.05, c[1] + (r[1] - c[1]) * 1.05], rm0 + 0.4, rm1 + 0.6, pan);
    } else {
      capsula(L, r, t, rp0, rp1, pan);
      // Pliegues de la tela
      const pliegue = (frac, largo) => {
        const px = r[0] + (t[0] - r[0]) * frac, py = r[1] + (t[1] - r[1]) * frac;
        const vx = t[0] - r[0], vy = t[1] - r[1], lv = Math.hypot(vx, vy) || 1;
        const pxn = -vy / lv, pyn = vx / lv;
        L.linea(px - pxn * largo * 0.2, py - pyn * largo * 0.2, px + pxn * largo, py + pyn * largo + 1, pan[2]);
      };
      if (ancho) { pliegue(0.72, 4); pliegue(0.88, 5); pliegue(0.12, 3); }
    }
    if (look.pantalon.cargo) {
      const b = [c[0] + (r[0] - c[0]) * 0.55, c[1] + (r[1] - c[1]) * 0.55];
      capsula(L, [b[0] - 1, b[1] - 2.5], [b[0] + 0.5, b[1] + 2.5], 3.6, 3.6, tras ? tonos(look.pantalon.color, 0.3) : tonos(look.pantalon.color, 0.12));
      L.linea(b[0] - 3.5, b[1] - 2.5, b[0] + 3.5, b[1] - 3, pan[3]);
    }
  }

  // ---------------- Torso ----------------
  // s: escala (1 en los sprites, más grande en los retratos)
  function dibujarTorso(L, S, k, look, s) {
    s = s || 1;
    const u = S.u, q = S.q, cad = S.cadera, cue = S.cuello;
    const cam = look.camisa;
    const altoT = M.torso * s;
    const esFranela = cam.tipo === 'franela' || cam.tipo === 'jersey';
    const mitad = (esFranela ? 17.5 : 16.5) * s;
    // Pelvis (pantalón)
    L.poligono([
      sumar(sumar(cad, q, -12.5 * s), u, -5 * s), sumar(sumar(cad, q, 12.5 * s), u, -5 * s),
      sumar(sumar(cad, q, 13.5 * s), u, 6 * s), sumar(sumar(cad, q, -13.5 * s), u, 6 * s),
    ], 1, (px, py) => {
      const b = (px - cad[0]) * q[0] + (py - cad[1]) * q[1];
      return tono(k.pan, -b / (13 * s) * 0.7 + 0.1, px | 0, py | 0);
    });
    const ruedo = (cam.tipo === 'franela' ? -8 : -4) * s;
    const pts = [
      sumar(sumar(cad, q, -(mitad - 2.5 * s)), u, ruedo), sumar(sumar(cad, q, mitad - 2.5 * s), u, ruedo),
      sumar(sumar(cue, q, mitad), u, -6 * s), sumar(sumar(cue, q, mitad - 4 * s), u, -1.5 * s), sumar(sumar(cue, q, 7 * s), u, 1.5 * s),
      sumar(sumar(cue, q, -7 * s), u, 1.5 * s), sumar(sumar(cue, q, -(mitad - 4 * s)), u, -1.5 * s), sumar(sumar(cue, q, -mitad), u, -6 * s),
    ];
    const est = cam.estampa ? ESTAMPAS[cam.estampa] : null;
    L.poligono(pts, 1, (px, py) => {
      const rx = px - cad[0], ry = py - cad[1];
      const a = (rx * u[0] + ry * u[1]) / s;
      const b = (rx * q[0] + ry * q[1]) / s;
      const x = px | 0, y = py | 0;
      let lum = -(b / 17) * 0.85 + 0.18 + (a / M.torso - 0.5) * 0.25;
      // Pliegues
      if (Math.abs(a - (ruedo / s + 7) - b * 0.35) < 0.55 && b > -6 && b < 9) lum -= 0.45;
      if (Math.abs(a - 14 + b * 0.5) < 0.5 && b > 2 && b < 10) lum -= 0.4;
      let T = k.cam;
      const cuelloA = M.torso - a;
      // Cuello de la prenda
      if (cam.tipo === 'jersey') {
        if (cuelloA < 9 && Math.abs(b - 1) < (9 - cuelloA) * 0.55) return tono(k.interior, lum, x, y);
        if (cuelloA < 10.5 && Math.abs(b - 1) < (10.5 - cuelloA) * 0.55 + 0.3) return tono(k.ribete, lum, x, y);
        if (Math.abs(b - 1) < 0.7 && cuelloA > 10) return tono(k.ribete, lum, x, y);
        if (Math.abs(b - 3) < 0.6 && cuelloA > 12 && Math.floor(a) % 6 === 0) return k.ribete[3];
        if (((Math.floor(b + 40)) % 4) === 0) T = k.cam2;
      } else if (cam.tipo === 'franela') {
        if (cuelloA < 2.6 && Math.abs(b - 1) < 5) return cuelloA < 1.4 ? tono(k.piel, lum, x, y) : tono(k.cam, lum - 0.5, x, y);
      } else if (cam.tipo === 'camisaAbierta') {
        const abierto = Math.abs(b - 1.5) < 3.5 + Math.max(0, 6 - cuelloA) * 0.4;
        if (abierto) {
          if (cuelloA < 2.4 && Math.abs(b - 1.5) < 4) return tono(k.piel, lum, x, y);
          return tono(k.interior, lum + 0.1, x, y);
        }
        if (Math.abs(b - 1.5) < 4.6 + Math.max(0, 6 - cuelloA) * 0.4) return tono(k.cam, lum - 0.55, x, y);
      }
      // Estampado de flores
      if (cam.estampado === 'flores') {
        const fa = Math.floor((a + 40) / 7), fb = Math.floor((b + 40 + (fa % 2) * 3.5) / 7);
        const ca = fa * 7 - 40 + 3.5, cb = fb * 7 - 40 - (fa % 2) * 3.5 + 3.5;
        const da = a - ca, db = b - cb, dd = Math.abs(da) + Math.abs(db);
        if (dd < 0.8) return RW.u32('#ffd24a');
        if (dd < 2.2 && (Math.abs(da) < 0.6 || Math.abs(db) < 0.6)) return tono(k.cam2, lum + 0.3, x, y);
        if (Math.abs(da - 2.4) < 0.7 && Math.abs(db + 2.2) < 1.2) return tono(tonos('#2a8a6a'), lum, x, y);
      }
      // Estampa en el pecho
      if (est) {
        const c = muestraEstampa(est, a, b, 21, 2.5);
        if (c) return c;
      }
      return tono(T, lum, x, y);
    });
  }

  function dibujarCollar(L, S, k, look, s) {
    s = s || 1;
    const u = S.u, q = S.q, cue = S.cuello;
    if (look.collar === 'perlas') {
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const pt = sumar(sumar(cue, q, (-5 + t * 12) * s), u, -(2.5 + Math.sin(t * Math.PI) * 6) * s);
        bola(L, pt, 1.25 * s, k.perla);
      }
    } else if (look.collar === 'dije') {
      const a = sumar(sumar(cue, q, -4 * s), u, -1.5 * s), b = sumar(sumar(cue, q, 2 * s), u, -11 * s), c = sumar(sumar(cue, q, 7 * s), u, -2 * s);
      L.linea(a[0], a[1], b[0], b[1], k.negro[1]);
      L.linea(c[0], c[1], b[0], b[1], k.negro[1]);
      capsula(L, b, sumar(b, u, -3.5 * s), 1.6 * s, 1.2 * s, k.metal);
    } else if (look.collar === 'cadena') {
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        const pt = sumar(sumar(cue, q, (-5 + t * 12) * s), u, -(2.5 + Math.sin(t * Math.PI) * 8) * s);
        L.px(pt[0], pt[1], k.oro[i % 2]);
      }
    }
  }

  function dibujarInstrumento(L, S, k, look) {
    const u = S.u, q = S.q;
    const bajo = look.instrumento === 'bajo';
    const B = sumar(sumar(S.cadera, q, 6), u, 8);
    const d = [q[0] * 0.86 + u[0] * 0.5, q[1] * 0.86 + u[1] * 0.5];
    const largo = bajo ? 40 : 32;
    const ini = sumar(B, d, 8), fin = sumar(B, d, largo);
    capsula(L, ini, fin, 2.2, 2.2, 0, true);
    capsula(L, ini, fin, 2, 1.8, k.madera);
    capsula(L, fin, sumar(fin, d, 6), 3, 2.6, 0, true);
    capsula(L, fin, sumar(fin, d, 6), 2.6, 2.4, k.madera);
    for (let i = 10; i < largo; i += 4) { const p = sumar(B, d, i); L.px(p[0], p[1], k.metal[0]); }
    const B2 = sumar(B, d, 7);
    bola(L, B, 10.5, 0, true);
    bola(L, B2, 8.2, 0, true);
    bola(L, B2, 7.6, k.inst);
    bola(L, B, 9.8, k.inst);
    if (bajo) {
      bola(L, sumar(B, d, 2), 4.4, k.perla);
      capsula(L, sumar(sumar(B, q, -4), u, -3), sumar(sumar(B, q, 2), u, -4), 1, 1, k.metal);
    } else {
      bola(L, sumar(B, d, 4), 3, U_CONTORNO);
      capsula(L, sumar(sumar(B, q, -5), u, -4), sumar(sumar(B, q, -1), u, -5), 1.2, 1.2, k.madera);
    }
    // Cuerdas
    const c0 = sumar(B, d, -3), c1 = sumar(B, d, largo);
    L.linea(c0[0], c0[1], c1[0], c1[1], k.metal[0]);
  }

  // ---------------- Cabeza ----------------
  // C: centro, A: inclinación, s: escala (1 = sprite). Coordenadas locales: x hacia adelante, y hacia abajo.
  function dibujarCabeza(L, S, k, look, p, s, C, A) {
    s = s || 1;
    C = C || S.cabeza;
    A = A === undefined ? S.angCabeza : A;
    const ca = cos(A), sa = sin(A);
    const W = (lx, ly) => [C[0] + (lx * ca - ly * sa) * s, C[1] + (ly * ca + lx * sa) * s];
    const zona = (r, fn) => L.pintar(C[0] - r * s, C[1] - r * s, C[0] + r * s, C[1] + r * s, (px, py) => {
      const dx = (px - C[0]) / s, dy = (py - C[1]) / s;
      return fn(dx * ca + dy * sa, dy * ca - dx * sa, px | 0, py | 0);
    });
    const enCabeza = (lx, ly) => {
      const a = (lx + 0.5) / 10, b = (ly + 1) / 12;
      if (a * a + b * b <= 1) return true;
      const c = (lx - 4.5) / 5.8, d = (ly - 6.5) / 5.2;
      return c * c + d * d <= 1;
    };
    const cap = (a, b, r0, r1, T, borde) => capsula(L, W(a[0], a[1]), W(b[0], b[1]), r0 * s, r1 * s, T, borde);
    const rizo = (lx, ly, r, T) => {
      const c = W(lx, ly);
      bola(L, c, r * s, 0, true);
      bola(L, c, r * s, T);
      // Brillo en forma de medialuna
      const h = W(lx - r * 0.35, ly - r * 0.35);
      L.px(h[0], h[1], T[0]);
      L.px(h[0] + 1, h[1], T[0]);
    };
    const peinado = look.peinado;
    const cara = p.cara;

    // ----- Pelo de atrás -----
    if (peinado === 'rizado') {
      const centros = [];
      for (let ang = 115; ang <= 345; ang += 22) centros.push([-1.8 + Math.cos(ang * Math.PI / 180) * 12.5, -2.5 + Math.sin(ang * Math.PI / 180) * 12.5, 5.2]);
      for (let ang = 125; ang <= 335; ang += 30) centros.push([-1.8 + Math.cos(ang * Math.PI / 180) * 8.5, -2.5 + Math.sin(ang * Math.PI / 180) * 8.5, 5]);
      centros.push([-9, 9, 4.6], [-5, 11.5, 4.2], [-12, 4, 4.6]);
      centros.forEach((c) => rizo(c[0], c[1], c[2], k.cab));
    } else if (peinado === 'ondulado' || peinado === 'largo') {
      const largo = peinado === 'largo' ? 17 : 12;
      const masa = [[0, -12.5], [-7, -11.5], [-12, -5], [-13, 3], [-12, largo - 2], [-6.5, largo + 1], [-2.5, largo - 3], [-1.5, 2]];
      L.poligono(masa.map((m) => W(m[0], m[1])), 1, () => U_CONTORNO);
      zona(largo + 6, (lx, ly, x, y) => {
        const pts = masa;
        let dentro = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
          if ((yi > ly) !== (yj > ly) && lx < ((xj - xi) * (ly - yi)) / (yj - yi) + xi) dentro = !dentro;
        }
        if (!dentro) return 0;
        // Contorno interior de 1 px para separar del fondo
        const f = lx * 0.8 + ly * 0.45 + Math.sin(ly * 0.45) * 1.2;
        const mm = ((f % 5) + 5) % 5;
        let lum = 0.05 - ly / 28 - lx / 40;
        if (mm < 0.7) lum += 0.5; else if (mm > 4.3) lum -= 0.35;
        return tono(k.cab, lum, x, y);
      });
    } else if (peinado === 'bajoGorro') {
      [[-9, 3, 3.6], [-10, 7.5, 3.4], [-6.5, 10, 3.2], [-11, -1, 3.4]].forEach((c) => rizo(c[0], c[1], c[2], k.cab));
    }

    // ----- Cuello -----
    const baseCuello = S.cuello && s < 1.5 ? S.cuello : W(-0.5, 16);
    capsula(L, baseCuello, W(0.5, 6), 4.6 * s, 4.3 * s, 0, true);
    capsula(L, baseCuello, W(0.5, 6), 4.4 * s, 4.1 * s, tonos(look.piel, 0.22));

    // ----- Cara -----
    zona(15, (lx, ly) => (enCabeza(lx * 0.92, ly * 0.94) ? U_CONTORNO : 0));
    zona(15, (lx, ly, x, y) => {
      if (!enCabeza(lx, ly)) return 0;
      const nx = (lx + 0.5) / 10, ny = (ly + 1) / 12;
      let lum = -(nx * 0.75 + ny * 0.55) + 0.25;
      if (ly > 9 && lx < 6) lum -= 0.35;          // sombra bajo la quijada
      return tono(k.piel, lum, x, y);
    });
    // Oreja
    zona(15, (lx, ly, x, y) => {
      const a = (lx + 3.6) / 2.6, b = (ly - 1) / 3.6;
      const d = a * a + b * b;
      if (d > 1) return 0;
      if (d > 0.75) return U_CONTORNO;
      return d < 0.3 ? k.piel[3] : k.piel[2];
    });

    // ----- Barba -----
    const barba = look.barba;
    const enBoca = (lx, ly) => lx > 6.6 && lx < 10.6 && ly > 7.9 && ly < 9.6;
    if (barba) {
      zona(15, (lx, ly, x, y) => {
        if (!enCabeza(lx, ly) || enBoca(lx, ly)) return 0;
        const zonaBarba = ly > 3.4 + Math.max(0, -lx) * 0.2 && lx > -4.4;
        const patilla = lx > -3.8 && lx < -1.2 && ly > -3 && ly < 4;
        if (!zonaBarba && !patilla) return 0;
        const lum = -((lx + 0.5) / 10 * 0.75 + (ly + 1) / 12 * 0.55) + 0.2;
        if (barba === 'barbaCorta') return ((x * 2 + y * 3) % 5 === 0) || (ly > 9.6 && ((x + y) & 1)) ? tono(k.barba, lum - 0.2, x, y) : 0;
        if (barba === 'candado') {
          const chivera = lx > 4.2 && ly > 8.2;
          if (chivera) return tono(k.barba, lum, x, y);
          return ((x * 3 + y * 5) % 4 === 0) ? k.barba[2] : 0;
        }
        return tono(k.barba, lum + Math.sin(x * 1.7 + y) * 0.15, x, y);
      });
      // Bigote
      zona(15, (lx, ly, x, y) => {
        const curva = 6.3 + Math.abs(lx - 8.8) * 0.18;
        return lx > 6 && lx < 11.6 && ly > curva && ly < curva + 1.5 ? tono(k.barba, 0, x, y) : 0;
      });
    }

    // ----- Boca -----
    if (cara === 'grito' || cara === 'dolor' || cara === 'ko') {
      zona(15, (lx, ly) => {
        const a = (lx - 8.7) / 2.1, b = (ly - 9.2) / 1.9;
        const d = a * a + b * b;
        if (d > 1) return 0;
        return ly < 8.4 ? k.dientes : k.boca;
      });
    } else if (cara === 'feliz') {
      zona(15, (lx, ly) => {
        const linea = 8.3 + Math.pow((lx - 8.8) / 2.2, 2) * -0.9;
        if (lx < 6.4 || lx > 11.2) return 0;
        if (ly > linea - 0.5 && ly < linea + 0.7) return k.boca;
        if (ly >= linea + 0.7 && ly < linea + 1.6 && lx > 7.2 && lx < 10.4) return k.dientes;
        return 0;
      });
    } else {
      cap([7, 8.7], [10.6, 8.4], 0.6, 0.6, k.boca);
    }

    // ----- Nariz -----
    const nariz = [[9.2, -1.8], [12.9, 4.1], [12.5, 5.5], [9.6, 5.6]];
    L.poligono(nariz.map((n) => W(n[0], n[1])), 1, (px, py) => {
      const dx = (px - C[0]) / s, dy = (py - C[1]) / s;
      const ly = dy * ca - dx * sa;
      return ly > 4.6 ? k.piel[2] : k.piel[1];
    });
    const fosa = W(11.4, 5.4);
    L.px(fosa[0], fosa[1], k.piel[3]);

    // ----- Ojos o lentes -----
    if (look.lentes) {
      const claro = look.lentes === 'normales';
      zona(15, (lx, ly, x, y) => {
        const cerca = lx > 2 && lx < 9.6 && ly > -4 && ly < 1.2 && !(lx < 3 && ly > 0.2) && !(lx > 8.8 && ly > 0.4);
        const lejos = lx > 10 && lx < 12 && ly > -3.6 && ly < 0.8;
        if (!cerca && !lejos) return 0;
        const borde = cerca ? (ly < -3.1 || ly > 0.4 || lx < 2.7 || lx > 9) : (ly < -2.9 || lx > 11.4);
        if (borde) return k.marco;
        if (claro) {
          const brillo = Math.abs((lx - ly * 0.6) - 6) < 0.7;
          return brillo ? RW.u32('#ffffff') : 0;
        }
        if (Math.abs((lx - ly * 0.6) - 6.2) < 0.8 && ly < -0.6) return k.lente[0];
        return tono(k.lente, -(ly + 1.5) / 3 * 0.7 - 0.3, x, y);
      });
      if (look.lentes === 'normales') {
        zona(15, (lx, ly) => (lx > 4.8 && lx < 6.6 && ly > -2.2 && ly < -0.3 ? k.oscuro : 0));
      }
      cap([2, -2.4], [-3.4, -1.1], 0.5, 0.5, k.marco);
    } else {
      zona(15, (lx, ly) => {
        if (lx > 4 && lx < 8 && ly > -2.4 && ly < 0.2) return lx > 5.8 ? k.oscuro : k.dientes;
        return 0;
      });
    }
    // Ceja
    if (cara === 'grito') cap([2.6, -5.4], [8.8, -4.6], 0.75, 0.75, k.cab[2]);
    else if (cara === 'dolor' || cara === 'ko') cap([2.6, -4.6], [8.8, -5.8], 0.75, 0.75, k.cab[2]);
    else cap([2.6, -5.5], [8.8, -5.8], 0.75, 0.75, k.cab[2]);

    // ----- Pelo de arriba -----
    if (peinado === 'rizado') {
      const frente = [[-6, -9], [-2, -11.5], [2.5, -11.5], [6.2, -9.4], [-8.5, -4.5], [8.6, -6.6], [4.5, -8.6]];
      frente.forEach((c) => rizo(c[0], c[1], 3.9, k.cab));
    } else if (peinado === 'ondulado' || peinado === 'largo') {
      zona(16, (lx, ly, x, y) => {
        const a = (lx + 0.5) / 11.2, b = (ly + 1.6) / 12.6;
        if (a * a + b * b > 1) return 0;
        const linea = -6.4 - Math.max(0, lx) * 0.22;
        const pelo = ly < linea || (lx < -2.6 && ly < 3);
        if (!pelo) return 0;
        const f = lx * 0.7 - ly * 0.5;
        const mm = ((f % 4.5) + 4.5) % 4.5;
        let lum = 0.15 - lx / 30 - (ly + 8) / 30;
        if (mm < 0.7) lum += 0.45; else if (mm > 3.9) lum -= 0.3;
        if (ly > linea - 1.2 && lx > -1) lum -= 0.4;
        return tono(k.cab, lum, x, y);
      });
      cap([3.5, -10.4], [9, -6.2], 2.4, 1.2, k.cab);
    } else if (peinado === 'corto') {
      zona(16, (lx, ly, x, y) => {
        const a = (lx + 0.5) / 10.8, b = (ly + 1.4) / 12.4;
        if (a * a + b * b > 1) return 0;
        return ly < -6.2 - Math.max(0, lx) * 0.2 || (lx < -2 && ly < 1) ? tono(k.cab, -(ly / 12) * 0.5 - 0.1, x, y) : 0;
      });
    }

    // ----- Gorro -----
    if (look.gorro === 'pescador') {
      // Ala del sombrero
      const enAla = (lx, ly) => { const a = (lx - 0.5) / 14.5, b = (ly + 5.2 - lx * 0.1) / 3.4; return a * a + b * b <= 1; };
      const enCopa = (lx, ly) => {
        if (ly > -5 || ly < -17.5) return false;
        const t = (ly + 17.5) / 12.5;
        const mitad = 7.2 + t * 2.4;
        return Math.abs(lx - 0.2) < mitad;
      };
      zona(19, (lx, ly) => (enAla(lx * 0.94, ly * 0.85) || enCopa(lx * 0.93, ly * 0.95) ? U_CONTORNO : 0));
      const lunar = (lx, ly) => {
        const gx = Math.floor((lx + 40) / 4.2), gy = Math.floor((ly + 40) / 4.2);
        const cx = gx * 4.2 - 40 + 2.1 + (gy % 2) * 1.4, cy = gy * 4.2 - 40 + 2.1;
        return Math.abs(lx - cx) < 0.9 && Math.abs(ly - cy) < 0.9;
      };
      zona(19, (lx, ly, x, y) => {
        if (!enCopa(lx, ly)) return 0;
        if (ly > -7.6) return tono(k.gorro, -0.4 - lx / 30, x, y);
        if (lunar(lx, ly)) return k.lunar;
        return tono(k.gorro, -(lx / 9) * 0.6 + 0.2 - (ly + 12) / 30, x, y);
      });
      zona(19, (lx, ly, x, y) => {
        if (!enAla(lx, ly)) return 0;
        const b = (ly + 5.2 - lx * 0.1) / 3.4;
        if (lunar(lx, ly) && b < 0.2) return k.lunar;
        return tono(k.gorro, -b * 0.8 - lx / 40, x, y);
      });
    } else if (look.gorro === 'gorra') {
      zona(18, (lx, ly, x, y) => {
        const a = (lx + 0.3) / 11, b = (ly + 1.8) / 12.5;
        if (a * a + b * b > 1 || ly > -4.6) return 0;
        return tono(k.gorro, -(lx / 11) * 0.6 + 0.1, x, y);
      });
      cap([3, -5], [15, -4.2], 1.6, 1.4, 0, true);
      cap([3, -5], [15, -4.2], 1.5, 1.3, k.gorro);
    }
  }

  // ---------------- Sprite completo ----------------
  function construir(pj, look, p) {
    const L = new RW.Lienzo(SW, SH);
    const S = esqueleto(p);
    const k = paleta(look);
    dibujarBrazo(L, S, 'T', k, look, p, false);
    dibujarPierna(L, S, 'T', k, look, false);
    dibujarTorso(L, S, k, look, 1);
    dibujarCollar(L, S, k, look, 1);
    if (look.instrumento && p.frente) dibujarInstrumento(L, S, k, look);
    dibujarPierna(L, S, 'D', k, look, true);
    dibujarCabeza(L, S, k, look, p, 1.12);
    dibujarBrazo(L, S, 'D', k, look, p, true);
    L.contorno(U_CONTORNO);
    return L;
  }

  // ---------------- Caché ----------------
  const cache = new Map();
  const looks = new Map();
  function lookCache(pj, pal) {
    const clave = pj.id + '|' + pal;
    if (!looks.has(clave)) looks.set(clave, RW.lookDe(pj, pal));
    return looks.get(clave);
  }

  RW.sprites = {
    ANCHO: SW, ALTO: SH, OX, OY,

    obtener(pj, pose, pal) {
      const clave = pj.id + '|' + (pal || 0) + '|' + pose._id;
      let s = cache.get(clave);
      if (!s) {
        const L = construir(pj, lookCache(pj, pal || 0), pose);
        s = { normal: L.aCanvas(false), espejo: L.aCanvas(true), blanco: null, blancoE: null };
        cache.set(clave, s);
      }
      return s;
    },

    destello(pj, pose, pal, espejo) {
      const s = RW.sprites.obtener(pj, pose, pal);
      if (espejo) { if (!s.blancoE) s.blancoE = RW.silueta(s.espejo, '#ffffff'); return s.blancoE; }
      if (!s.blanco) s.blanco = RW.silueta(s.normal, '#ffffff');
      return s.blanco;
    },

    // Dibuja un bailarín con los pies en (x, y) de la pantalla (en píxeles).
    dibujar(ctx, pj, pose, pal, x, y, mirando, blanco) {
      const s = RW.sprites.obtener(pj, pose, pal);
      let img = mirando < 0 ? s.espejo : s.normal;
      if (blanco) img = RW.sprites.destello(pj, pose, pal, mirando < 0);
      ctx.drawImage(img, Math.round(x) - OX, Math.round(y) - OY);
    },

    sombra(ctx, x, y, ancho) {
      ctx.fillStyle = 'rgba(10, 4, 24, 0.4)';
      const w = Math.round(ancho || 44);
      RW.elipse(ctx, Math.round(x), Math.round(y), w / 2, 3, 'rgba(10, 4, 24, 0.4)');
    },

    precargar(pj, pal) {
      Object.values(POSES).forEach((p) => RW.sprites.obtener(pj, p, pal));
      const propias = POSES_PJ[pj.id] || {};
      Object.values(propias).forEach((p) => RW.sprites.obtener(pj, p, pal));
    },
  };

  // =====================================================================
  // Retratos en 3/4 mirando hacia arriba (como en las referencias)
  // =====================================================================
  const cacheRetratos = new Map();
  function construirRetrato(pj, look, expresion, tam) {
    const L = new RW.Lienzo(tam, tam);
    const k = paleta(look);
    BANDA = 0.025;
    const s = tam / 40;                     // escala de la cabeza
    const cuello = [tam * 0.5, tam * 0.84];
    const S = { cuello, u: [0, -1], q: [1, 0], cadera: [cuello[0], cuello[1] + M.torso * s * 0.6] };
    // Hombros y ropa
    const esc = s * 0.82;
    const Sx = { cuello: [cuello[0], cuello[1] + 2 * s], u: [0, -1], q: [1, 0], cadera: [cuello[0], cuello[1] + 2 * s + M.torso * esc] };
    dibujarTorso(L, Sx, k, look, esc);
    dibujarCollar(L, Sx, k, look, esc);
    const cara = expresion === 'feliz' ? 'feliz' : expresion === 'derrota' ? 'dolor' : 'normal';
    const C = [tam * 0.5, tam * 0.46];
    const A = expresion === 'derrota' ? 8 : -12;
    dibujarCabeza(L, S, k, look, { cara }, s, C, A);
    L.contorno(U_CONTORNO);
    BANDA = 0.07;
    return L;
  }

  RW.sprites.retrato = function (pj, pal, expresion, tam) {
    tam = tam || 64;
    const clave = pj.id + '|' + (pal || 0) + '|' + (expresion || 'normal') + '|' + tam;
    if (!cacheRetratos.has(clave)) {
      const L = construirRetrato(pj, lookCache(pj, pal || 0), expresion || 'normal', tam);
      cacheRetratos.set(clave, L.aCanvas(false));
    }
    return cacheRetratos.get(clave);
  };

  // =====================================================================
  // Imágenes reales de los integrantes (si existen en RW.ARTE_DATOS).
  // Las prepara herramientas/preparar_arte.py. Si no hay, se usan los
  // muñecos dibujados con código.
  // =====================================================================
  Object.keys(POSES).forEach((k) => { POSES[k]._nombre = k; });
  Object.keys(POSES_PJ).forEach((id) => Object.keys(POSES_PJ[id]).forEach((k) => { POSES_PJ[id][k]._nombre = k; }));

  // Qué imagen usar para cada pose del juego (en orden de preferencia)
  const MAPA_ARTE = [
    [/^(q\d|c\d|dj\d|aterrizaje|moon\d|dashAdelante)$/, ['quieto']],
    [/^(ag|agLigero\d|agFuerte1|guardiaAgachado|barrida1|dp1)$/, ['agachado', 'quieto']],
    [/^(saltoArriba|saltoMedio|saltoAbajo|voltereta\d|dp3)$/, ['salto', 'quieto']],
    [/^(proy1|proy2|super1|super2|dp2)$/, ['especial', 'golpe', 'quieto']],
    [/^(ligero\d|fuerte\d|agarre\d|aereoLigero|aereoFuerte|agFuerte2)$/, ['golpe', 'quieto']],
    [/^(patada\d|barrida2|aereoPatada|giro\d)$/, ['patada', 'golpe', 'quieto']],
    [/^(golpeAlto|golpeBajo|golpeAgachado|guardia|mareado\d|lanzado\d|derribado)$/, ['golpeado', 'quieto']],
    [/^(acostado|levantarse1)$/, ['suelo', 'golpeado', 'quieto']],
    [/^(victoria\d|provocar\d|levantarse2)$/, ['victoria', 'quieto']],
  ];

  const imagenes = {};
  function canvasDe(img, espejo) {
    const c = RW.crearCanvas(img.width, img.height);
    const g = c.getContext('2d');
    if (espejo) { g.translate(img.width, 0); g.scale(-1, 1); }
    g.drawImage(img, 0, 0);
    return c;
  }
  (function cargarArte() {
    const datos = RW.ARTE_DATOS || {};
    Object.keys(datos).forEach((id) => {
      imagenes[id] = {};
      Object.keys(datos[id]).forEach((nombre) => {
        const img = new Image();
        const reg = { listo: false };
        img.onload = () => { reg.normal = canvasDe(img, false); reg.espejo = canvasDe(img, true); reg.listo = true; };
        img.src = datos[id][nombre];
        imagenes[id][nombre] = reg;
      });
    });
  })();

  RW.arte = {
    imagen(id, nombre) {
      const r = imagenes[id] && imagenes[id][nombre];
      return r && r.listo ? r : null;
    },
    escenario(id) { return RW.arte.imagen('escenarios', id); },
  };

  function arteParaPose(id, pose) {
    if (!imagenes[id]) return null;
    const nombre = pose._nombre || '';
    for (const [re, lista] of MAPA_ARTE) {
      if (!re.test(nombre)) continue;
      for (const n of lista) { const r = RW.arte.imagen(id, n); if (r) return r; }
      return null;
    }
    return RW.arte.imagen(id, 'quieto');
  }

  function dibujarArte(ctx, r, pose, pal, x, y, mirando, blanco) {
    let img = mirando < 0 ? r.espejo : r.normal;
    if (blanco) {
      const k = mirando < 0 ? 'blancoE' : 'blanco';
      if (!r[k]) r[k] = RW.silueta(img, '#ffffff');
      img = r[k];
    }
    const n = pose._nombre || '';
    let dx = (pose.cx || 0) * 2 * mirando, dy = 0, rot = 0;
    const m = /^(q|c)(\d)$/.exec(n);
    if (m) dy = [0, 2, 1, 3][parseInt(m[2], 10) - 1];        // bote al ritmo
    if (n === 'dj2') dy = 2;
    if (/^(voltereta|lanzado)/.test(n)) rot = pose.giro;
    if (n === 'derribado') rot = -50;
    if (n === 'golpeAlto' || n === 'golpeBajo') rot = -7;
    if (/^(ligero2|fuerte2|patada2|proy2|super2|agarre1)$/.test(n)) dx += 8 * mirando;
    ctx.save();
    if (pal === 1 && 'filter' in ctx) ctx.filter = 'hue-rotate(150deg) saturate(1.15)';
    ctx.translate(Math.round(x + dx), Math.round(y + dy));
    if (rot) {
      ctx.translate(0, -img.height / 2);
      ctx.rotate((rot * Math.PI / 180) * mirando);
      ctx.translate(0, img.height / 2);
    }
    ctx.drawImage(img, -Math.round(img.width / 2), -img.height);
    ctx.restore();
  }

  const dibujarMuneco = RW.sprites.dibujar;
  RW.sprites.dibujar = function (ctx, pj, pose, pal, x, y, mirando, blanco) {
    const r = arteParaPose(pj.id, pose);
    if (r) { dibujarArte(ctx, r, pose, pal, x, y, mirando, blanco); return; }
    dibujarMuneco(ctx, pj, pose, pal, x, y, mirando, blanco);
  };

  const retratoMuneco = RW.sprites.retrato;
  const cacheRetratosArte = new Map();
  RW.sprites.retrato = function (pj, pal, expresion, tam) {
    const r = RW.arte.imagen(pj.id, 'retrato');
    if (!r) return retratoMuneco(pj, pal, expresion, tam);
    tam = tam || 64;
    const clave = pj.id + '|' + (pal || 0) + '|' + (expresion || 'normal') + '|' + tam;
    if (!cacheRetratosArte.has(clave)) {
      const c = RW.crearCanvas(tam, tam);
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      if ('filter' in g) {
        const f = [];
        if (pal === 1) f.push('hue-rotate(150deg)');
        if (expresion === 'derrota') f.push('grayscale(0.6) brightness(0.8)');
        if (f.length) g.filter = f.join(' ');
      }
      const lado = Math.min(r.normal.width, r.normal.height);
      g.drawImage(r.normal, (r.normal.width - lado) / 2, 0, lado, lado, 0, 0, tam, tam);
      cacheRetratosArte.set(clave, c);
    }
    return cacheRetratosArte.get(clave);
  };
})();
