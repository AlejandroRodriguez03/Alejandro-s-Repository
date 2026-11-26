// =====================================================================
// personajes.js: los cuatro integrantes de Rawayana.
//
// Datos confirmados en la investigación: nombres, apodos e instrumentos
// (Beto: voz y guitarra; Tony: bajo y sintetizador; Fofo: batería,
// percusión y producción; Abeja: guitarra y sintetizador).
// La apariencia sigue las imágenes de referencia del proyecto:
//   BETO:  pelo rizado, lentes oscuros, camiseta de béisbol "Bravos"
//   ABEJA: pelo oscuro ondulado, lentes naranja, chivera, franela "EN ALTA"
//   FOFO:  sombrero pescador amarillo de lunares, lentes, barba, franela blanca
//   TONY:  pelo ondulado, lentes oscuros, barba corta
//
// Para ajustar cómo se ven, cambia los valores de "look":
//   peinado: 'rizado' | 'ondulado' | 'largo' | 'corto' | 'bajoGorro' | 'calvo'
//   barba:   null | 'barbaCorta' | 'candado' | 'barba'
//   lentes:  null | 'sol' | 'normales'      colorLente: color del cristal
//   gorro:   null | 'pescador' | 'gorra'    gorroLunares: color de los lunares
//   camisa.tipo: 'jersey' | 'franela' | 'camisaAbierta'
//   camisa.estampa: null | 'bravos' | 'enalta' | 'emblema'
//   camisa.estampado: null | 'flores'
//   pantalon.ancho (ropa ancha), pantalon.cargo (bolsillo lateral)
//   collar: null | 'perlas' | 'dije' | 'cadena'      reloj: null | 'D' | 'T'
//   instrumento (aparece en los especiales): null | 'guitarra' | 'bajo'
//   mano: null | 'microfono'
// =====================================================================
(function () {
  const RW = window.RW;

  RW.PERSONAJES = [
    {
      id: 'beto',
      nombre: 'BETO',
      nombreCompleto: 'BETO MONTENEGRO',
      rol: 'VOZ Y GUITARRA',
      color: '#e74c6f',
      bio: 'Voz principal y cofundador de la banda en Caracas. Baila con el micrófono en la mano y canta hasta dejarte sin flow.',
      estilo: 'EQUILIBRADO',
      barras: { flow: 3, velocidad: 3, potencia: 3, tecnica: 4 },
      stats: { vida: 1000, caminar: 1.25, retroceder: 1.0, saltoVy: -3.95, saltoVx: 1.6, dano: 1.0 },
      especiales: {
        proyectil: { nombre: 'NOTA FERIADO', tipo: 'nota', velA: 2.0, velB: 3.0, dano: 80 },
        antiaereo: { nombre: 'SALTO VENEKA', dano: 120 },
        giro: { nombre: 'VUELTA POR TI', dano: 36 },
        super: { nombre: '¿DÓNDE ES EL AFTER?', tipo: 'rayo', dano: 300 },
      },
      frases: [
        '¡Eso es pura sabrosura, mi pana!',
        '¿Y dónde es el after? Aquí mismo.',
        'Chamo, te faltó flow para esta rumba.',
      ],
      look: {
        piel: '#d9a074',
        cabello: '#3a2418',
        peinado: 'rizado',
        barba: 'barbaCorta',
        colorBarba: '#3a2418',
        lentes: 'sol',
        colorLente: '#1e2238',
        gorro: null,
        camisa: { tipo: 'jersey', color: '#f2efe8', color2: '#d4d8e8', ribete: '#1f9a96', manga: 'corta', mangaInterior: '#7a2238', interior: '#7a2238', estampa: 'bravos' },
        pantalon: { color: '#3a4466', ancho: true },
        zapatos: { color: '#f4f4f6', suela: '#c0bfcc', acento: '#7a2238' },
        collar: 'perlas',
        reloj: null,
        instrumento: null,
        mano: 'microfono',
      },
      alt: { camisa: { color: '#9aa8c8', color2: '#8a98b8', ribete: '#d8323c', mangaInterior: '#24305e', interior: '#24305e' }, pantalon: { color: '#2a2a36' } },
    },
    {
      id: 'abeja',
      nombre: 'ABEJA',
      nombreCompleto: 'ALEJANDRO "ABEJA" ABEIJÓN',
      rol: 'GUITARRA Y SINTE',
      color: '#ffcc3d',
      bio: 'Guitarrista desde el primer día. Rápido como su apodo: entra, pica con un riff y se va zumbando.',
      estilo: 'VELOCIDAD',
      barras: { flow: 3, velocidad: 5, potencia: 2, tecnica: 4 },
      stats: { vida: 950, caminar: 1.45, retroceder: 1.15, saltoVy: -4.1, saltoVx: 1.8, dano: 0.92 },
      especiales: {
        proyectil: { nombre: 'RIFF PICANTE', tipo: 'riff', velA: 2.6, velB: 3.6, dano: 70 },
        antiaereo: { nombre: 'PALMERA DEL DESIERTO', dano: 115 },
        giro: { nombre: 'ZUMBIDO TROPICAL', dano: 32 },
        super: { nombre: 'TRIPPY CARIBBEAN', tipo: 'riffs', dano: 300 },
      },
      frases: [
        'Este riff no se aprende, se siente.',
        'Zum, zum... ¡te picó la Abeja!',
        'Tranquilo, pana. Mañana practicas más.',
      ],
      look: {
        piel: '#d29a70',
        cabello: '#1e1612',
        peinado: 'ondulado',
        barba: 'candado',
        colorBarba: '#1e1612',
        lentes: 'sol',
        colorLente: '#e8862a',
        gorro: null,
        camisa: { tipo: 'franela', color: '#211e2a', manga: 'corta', estampa: 'enalta' },
        pantalon: { color: '#5a3f8a', ancho: true },
        zapatos: { color: '#ecebf2', suela: '#b8b6c4', acento: '#8a8aa0' },
        collar: null,
        reloj: 'T',
        instrumento: 'guitarra',
        colorInstrumento: '#d0602a',
        mano: null,
      },
      alt: { camisa: { color: '#f2efe8' }, pantalon: { color: '#2a6a6a' }, colorLente: '#3a8ad8', colorInstrumento: '#3b8f5a' },
    },
    {
      id: 'fofo',
      nombre: 'FOFO',
      nombreCompleto: 'ANDRÉS "FOFO" STORY',
      rol: 'BATERÍA Y PERCUSIÓN',
      color: '#39d0c0',
      bio: 'Baterista, productor y director musical. Cada paso suyo es un redoble: lento para arrancar, pero pega durísimo.',
      estilo: 'POTENCIA',
      barras: { flow: 4, velocidad: 2, potencia: 5, tecnica: 3 },
      stats: { vida: 1050, caminar: 1.05, retroceder: 0.85, saltoVy: -3.8, saltoVx: 1.5, dano: 1.12 },
      especiales: {
        proyectil: { nombre: 'BAQUETA VOLADORA', tipo: 'baqueta', velA: 2.2, velB: 3.0, dano: 90 },
        antiaereo: { nombre: 'REDOBLE AL CIELO', dano: 130 },
        giro: { nombre: 'PLATILLAZO', dano: 40 },
        super: { nombre: 'WELCOME TO EL SUR', tipo: 'embestida', dano: 320 },
      },
      frases: [
        'Llevaste el ritmo como un cuatro sin cuerdas.',
        'Mi redoble no perdona, vale.',
        '¡A ese compás no le aguantas ni un tema!',
      ],
      look: {
        piel: '#c98d66',
        cabello: '#1d1410',
        peinado: 'bajoGorro',
        barba: 'barba',
        colorBarba: '#1d1410',
        lentes: 'sol',
        colorLente: '#1e2238',
        gorro: 'pescador',
        colorGorro: '#f2c230',
        gorroLunares: '#ffffff',
        camisa: { tipo: 'franela', color: '#f2f0ec', manga: 'corta', estampa: 'emblema' },
        pantalon: { color: '#5c5470', ancho: true, cargo: true },
        zapatos: { color: '#ecebf2', suela: '#c0bfcc', acento: '#3a3a4a' },
        collar: 'dije',
        reloj: 'D',
        instrumento: null,
        mano: null,
      },
      alt: { colorGorro: '#e74c6f', camisa: { color: '#2a2a36' }, pantalon: { color: '#4a5a3a' } },
    },
    {
      id: 'tony',
      nombre: 'TONY',
      nombreCompleto: 'ANTONIO "TONY" CASAS',
      rol: 'BAJO Y SINTE',
      color: '#6fa8ff',
      bio: 'Bajista y cofundador. El groove le viene de familia: su papá también tocó percusión con la banda. Aguanta todo y responde con graves.',
      estilo: 'RESISTENCIA',
      barras: { flow: 5, velocidad: 2, potencia: 4, tecnica: 3 },
      stats: { vida: 1100, caminar: 1.1, retroceder: 0.9, saltoVy: -3.75, saltoVx: 1.5, dano: 1.05 },
      especiales: {
        proyectil: { nombre: 'ONDA GRAVE', tipo: 'grave', velA: 1.8, velB: 2.6, dano: 80 },
        antiaereo: { nombre: 'SLAP VOLADOR', dano: 120 },
        giro: { nombre: 'JUGANDO CHAPITA', dano: 36 },
        super: { nombre: '¿QUIÉN TRAE LAS CORNETAS?', tipo: 'cornetas', dano: 300 },
      },
      frases: [
        'Con este bajo retumba hasta El Ávila.',
        '¿Quién trae las cornetas? Yo, mi pana.',
        'Tranquilo, que el groove se hereda.',
      ],
      look: {
        piel: '#dda884',
        cabello: '#3a2516',
        peinado: 'ondulado',
        barba: 'barbaCorta',
        colorBarba: '#3a2516',
        lentes: 'sol',
        colorLente: '#202638',
        gorro: null,
        camisa: { tipo: 'camisaAbierta', color: '#2f6fb0', color2: '#f5ecd0', manga: 'corta', estampado: 'flores', interior: '#f4f2ee' },
        pantalon: { color: '#cbb48a', ancho: true },
        zapatos: { color: '#f2efe6', suela: '#b8a88a', acento: '#2f6fb0' },
        collar: 'cadena',
        reloj: null,
        instrumento: 'bajo',
        colorInstrumento: '#24203a',
        mano: null,
      },
      alt: { camisa: { color: '#d8503c', color2: '#ffe0a0' }, pantalon: { color: '#3a3a4a' }, colorInstrumento: '#b8322e' },
    },
  ];

  RW.personaje = (id) => RW.PERSONAJES.find((p) => p.id === id) || RW.PERSONAJES[0];

  // Mezcla el look con la paleta alternativa (para cuando ambos eligen al mismo).
  RW.lookDe = function (pj, paleta) {
    const base = JSON.parse(JSON.stringify(pj.look));
    if (paleta === 1 && pj.alt) {
      for (const k in pj.alt) {
        if (typeof pj.alt[k] === 'object' && base[k]) Object.assign(base[k], pj.alt[k]);
        else base[k] = pj.alt[k];
      }
    }
    return base;
  };
})();
