const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/592967b4-6f12-49be-b6b5-2dc818aa5ea5_59d5583f-80e9-4929-9f42-7b519c09ae30/pptx/scripts/apply_theme.js");

const THEME = {
  name: "Copa Quoota",
  headFontFace: "Poppins",
  bodyFontFace: "Poppins",
  colors: {
    dk1: "111111", lt1: "FFFFFF", dk2: "555555", lt2: "F2F5F3",
    accent1: "65F89E", accent2: "1E1E1E", accent3: "D9D9D9",
    accent4: "9E9E9E", accent5: "2E7D4F", accent6: "BDBDBD",
    hlink: "2E7D4F", folHlink: "555555",
  },
};

// Fotos (se reemplazan por los archivos finales sin tocar el código)
const IMG = {
  portico: "assets/foto_portico.png",
  tee: "assets/foto_tee.png",
  green18: "assets/foto_green18.png",
  premiacion: "assets/foto_premiacion.png",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Copa Quoota";
pres.author = "Quoota Capital";
const C = pres.SchemeColor;
const W = 13.333, H = 7.5, M = 0.6;
const CW = W - 2 * M;

const shadow = () => ({ type: "outer", color: "000000", opacity: 0.14, blur: 14, offset: 3, angle: 90 });

async function icon(Comp, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- Layouts ----------
const SLIDENUM = (color) => ({ x: W - M - 0.6, y: H - 0.5, w: 0.6, h: 0.3, fontSize: 11, color, align: "right", margin: 0 });
const TITLE = (color) => ({
  _type: "title",
  options: { name: "title", type: "title", x: M, y: 0.45, w: CW, h: 0.8, fontSize: 34, bold: true, color, align: "left", valign: "middle", margin: 0 },
});
pres.defineSlideMaster({ title: "LIGHT", background: { color: "F2F5F3" }, objects: [{ placeholder: TITLE("111111") }], slideNumber: SLIDENUM("9E9E9E") });
pres.defineSlideMaster({ title: "DARK", background: { color: "111111" }, objects: [{ placeholder: TITLE("FFFFFF") }], slideNumber: SLIDENUM("9E9E9E") });
pres.defineSlideMaster({ title: "COVER", background: { color: "111111" } });

const T = (slide, text, o) => slide.addText(text, { isTextBox: true, margin: 0, ...o });
const title = (slide, text) => slide.addText(text, { placeholder: "title" });

(async () => {
  // ===== 1. Portada =====
  {
    const s = pres.addSlide({ masterName: "COVER" });
    s.addImage({ path: IMG.portico, x: 0, y: 0, w: W, h: H, altText: "Pórtico de acceso de la Copa Quoota en el Junko Country Club", objectName: "Foto portada" });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.55, w: W, h: 1.95, fill: { color: "111111", transparency: 12 }, line: { type: "none" }, objectName: "Panel portada" });
    T(s, "PROPUESTA A LA JUNTA DIRECTIVA  ·  JUNKO COUNTRY CLUB", { x: M, y: 5.75, w: CW, h: 0.3, fontSize: 12, color: "65F89E", bold: true, charSpacing: 2, valign: "middle" });
    T(s, "La copa más alta de Venezuela.", { x: M, y: 6.1, w: 7.4, h: 0.6, fontSize: 28, bold: true, color: "FFFFFF", valign: "middle" });
    T(s, "Sábado 20 de febrero de 2027", { x: 8.0, y: 6.1, w: 4.73, h: 0.6, fontSize: 18, bold: true, color: "FFFFFF", align: "right", valign: "middle" });
    T(s, "Quoota Capital  ·  Gerencia de Mercadeo  ·  Octubre 2026", { x: M, y: 6.8, w: CW, h: 0.3, fontSize: 12, color: "D9D9D9", valign: "middle" });
    s.addNotes("Abrir con el concepto: el campo más alto del país para la copa más alta de Venezuela.");
  }

  // ===== 2. La propuesta en una mirada =====
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "La propuesta en una mirada");
    T(s, "Quoota Capital organiza, produce y financia la primera Copa Quoota de Golf en el Junko Country Club: un torneo de 18 hoyos con convocatoria abierta e invitación prioritaria a las empresas aliadas de Quoota.",
      { x: M, y: 1.7, w: 5.0, h: 3.6, fontSize: 18, color: C.text1, valign: "top", paraSpaceAfter: 6 });
    T(s, "Mensaje clave: cero costo y cero riesgo para el club.", { x: M, y: 5.5, w: 5.0, h: 0.9, fontSize: 14, bold: true, color: C.accent5, valign: "top" });
    const stats = [
      ["20.02.27", "Sábado 20 de febrero de 2027. Alterna: 6 de marzo"],
      ["120", "jugadores en 30 equipos de 4"],
      ["220", "asistentes: jugadores, clínica, aliados y prensa"],
      ["USD 0", "de costo para el club"],
    ];
    const cw = 3.2, ch = 2.45, gx = 0.25, gy = 0.25, x0 = W - M - 2 * cw - gx, y0 = 1.7;
    stats.forEach(([n, l], i) => {
      const x = x0 + (i % 2) * (cw + gx), y = y0 + Math.floor(i / 2) * (ch + gy);
      const dark = i === 3;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: ch, fill: { color: dark ? C.text1 : C.background1 }, line: { type: "none" }, shadow: shadow(), objectName: "Tarjeta " + n });
      T(s, n, { x: x + 0.3, y: y + 0.3, w: cw - 0.6, h: 0.9, fontSize: i === 0 ? 32 : 48, bold: true, color: dark ? C.accent1 : C.text1, valign: "middle" });
      T(s, l, { x: x + 0.3, y: y + 1.3, w: cw - 0.6, h: 0.95, fontSize: 14, color: dark ? C.background1 : C.text2, valign: "top" });
    });
    s.addNotes("Mensaje clave: cero costo y cero riesgo para el club.");
  }

  // ===== 3. El concepto =====
  {
    const s = pres.addSlide({ masterName: "DARK" });
    const pw = 6.6;
    s.addImage({ path: IMG.premiacion, x: W - pw, y: 0, w: W, h: H, sizing: { type: "crop", x: 3.4, y: 0, w: pw, h: H }, altText: "Backdrop de la Copa Quoota con el trofeo", objectName: "Foto concepto" });
    // el crop se aplica sobre la imagen completa: se coloca para que el panel quede a la derecha
    title(s, "El concepto");
    T(s, "1.714", { x: M, y: 1.5, w: 5.6, h: 1.7, fontSize: 96, bold: true, color: C.accent1, valign: "middle" });
    T(s, "metros sobre el nivel del mar", { x: M, y: 3.2, w: 5.6, h: 0.4, fontSize: 18, color: C.background1, valign: "top" });
    T(s, "El Junko es el campo más alto del país. La Copa Quoota se juega donde ningún otro torneo puede jugarse y dice lo mismo que Quoota a sus usuarios: las metas se alcanzan subiendo.",
      { x: M, y: 3.95, w: 5.6, h: 1.7, fontSize: 14, color: C.accent3, valign: "top" });
    T(s, "Estética sobria en negro, blanco y acento verde, para convivir con el paisaje del club.",
      { x: M, y: 5.7, w: 5.6, h: 0.6, fontSize: 14, color: C.accent4, valign: "top" });
    T(s, "Juega alto.", { x: M, y: 6.4, w: 5.6, h: 0.6, fontSize: 28, bold: true, italic: true, color: C.accent1, valign: "middle" });
  }

  // ===== 4. Formato del torneo =====
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Formato del torneo");
    const blocks = [
      ["Modalidad", "Scramble a 4 jugadores con hándicap de equipo. Integra niveles distintos en un mismo equipo."],
      ["Categorías", "Campeón gross y neto, 1.º a 3.º lugar. El trofeo queda en la casa club."],
      ["Concursos", "Drive Quoota, Exacto Quoota y Hoyo en Uno Quoota."],
      ["Clínica Pide Quoota", "2 horas en el range con el profesional del club para invitados que no juegan."],
    ];
    const bx = M, bw = 5.5, bh = 1.15, gap = 0.17;
    blocks.forEach(([h, d], i) => {
      const y = 1.65 + i * (bh + gap);
      s.addShape(pres.shapes.RECTANGLE, { x: bx, y, w: bw, h: bh, fill: { color: C.background1 }, line: { type: "none" }, shadow: shadow(), objectName: "Bloque " + h });
      T(s, h.toUpperCase(), { x: bx + 0.25, y: y + 0.12, w: bw - 0.5, h: 0.28, fontSize: 11, bold: true, color: C.accent5, charSpacing: 2, valign: "middle" });
      T(s, d, { x: bx + 0.25, y: y + 0.42, w: bw - 0.5, h: 0.65, fontSize: 13, color: C.text1, valign: "top" });
    });
    // Agenda
    const ax = 6.7, aw = W - M - ax;
    s.addShape(pres.shapes.RECTANGLE, { x: ax, y: 1.65, w: aw, h: 5.15, fill: { color: C.text1 }, line: { type: "none" }, shadow: shadow(), objectName: "Panel agenda" });
    T(s, "Agenda del sábado 20 de febrero", { x: ax + 0.35, y: 1.85, w: aw - 0.7, h: 0.4, fontSize: 16, bold: true, color: C.background1, valign: "middle" });
    const ag = [
      ["6:30", "Acreditación y desayuno"], ["7:15", "Calentamiento"], ["7:45", "Reglas y foto oficial"],
      ["8:00", "Salida simultánea desde los 18 hoyos"], ["9:00", "Clínica Pide Quoota"],
      ["12:30", "Fin de la ronda, abre el Hoyo 19"], ["1:00", "Almuerzo"], ["2:30", "Premiación"], ["4:00", "Cierre"],
    ];
    ag.forEach(([t, d], i) => {
      const y = 2.45 + i * 0.45;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax + 0.35, y: y + 0.03, w: 0.85, h: 0.33, rectRadius: 0.16, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Hora " + t });
      T(s, t, { x: ax + 0.35, y: y + 0.03, w: 0.85, h: 0.33, fontSize: 12, bold: true, color: C.text1, align: "center", valign: "middle" });
      T(s, d, { x: ax + 1.4, y, w: aw - 1.75, h: 0.4, fontSize: 14, color: C.background1, valign: "middle" });
    });
  }

  // ===== 5. Invitados =====
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Invitados: abierto, con foco en aliados");
    s.addChart(pres.charts.DOUGHNUT, [{
      name: "Jugadores", labels: ["Empresas aliadas de Quoota · 56", "Inscripción abierta · 28", "Patrocinantes · 20", "Empresas prospecto · 16"], values: [56, 28, 20, 16],
    }], {
      x: M, y: 1.55, w: 6.3, h: 5.2, holeSize: 62, chartColors: ["65F89E", "111111", "2E7D4F", "BDBDBD"],
      showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: "111111",
      showPercent: false, showValue: false, showLabel: false, dataBorder: { pt: 2, color: "F2F5F3" },
      showTitle: false,
    });
    T(s, "120", { x: M + 1.65, y: 2.95, w: 3.0, h: 0.8, fontSize: 48, bold: true, color: C.text1, align: "center", valign: "middle" });
    T(s, "jugadores", { x: M + 1.65, y: 3.75, w: 3.0, h: 0.35, fontSize: 14, color: C.text2, align: "center", valign: "middle" });
    const rx = 7.5, rw = W - M - rx;
    T(s, "77 %", { x: rx, y: 1.6, w: rw, h: 1.2, fontSize: 72, bold: true, color: C.text1, valign: "middle" });
    T(s, "del cupo se asigna por invitación: aliados, prospectos y patrocinantes.", { x: rx, y: 2.85, w: rw, h: 0.9, fontSize: 16, color: C.text1, valign: "top" });
    [["Socios del Junko primero", "Primera semana de inscripción abierta en exclusiva. USD 800 por equipo para socios, USD 1.000 público general."],
     ["Campo lleno", "Los cupos de aliados no confirmados al 15 de enero se liberan a inscripción abierta."]].forEach(([h, d], i) => {
      const y = 4.05 + i * 1.4;
      s.addShape(pres.shapes.RECTANGLE, { x: rx, y, w: rw, h: 1.25, fill: { color: C.background1 }, line: { type: "none" }, shadow: shadow(), objectName: "Nota " + h });
      T(s, h, { x: rx + 0.25, y: y + 0.1, w: rw - 0.5, h: 0.3, fontSize: 14, bold: true, color: C.accent5, valign: "middle" });
      T(s, d, { x: rx + 0.25, y: y + 0.42, w: rw - 0.5, h: 0.78, fontSize: 12, color: C.text1, valign: "top" });
    });
  }

  // ===== 6. Paquetes de patrocinio =====
  {
    const s = pres.addSlide({ masterName: "DARK" });
    title(s, "Paquetes de patrocinio");
    T(s, "Quoota es el patrocinante titular. Una marca por categoría y ninguna fintech competidora.", { x: M, y: 1.25, w: CW, h: 0.4, fontSize: 16, color: C.accent3, valign: "middle" });
    const tiers = [
      ["Quoota Albatros", "1 cupo", "USD 15.000", ["“Copa Quoota presentada por”", "Hoyo 18 nombrado", "Pórtico, backdrop y trofeo", "2 equipos y activación en el Hoyo 19"], true],
      ["Quoota Eagle", "3 cupos", "USD 7.000", ["Naming de un concurso y su hoyo", "Activación en el hoyo", "1 equipo", "Backdrop y step & repeat"], false],
      ["Quoota Birdie", "14 cupos", "USD 3.000", ["Naming de hoyo", "Monolito y backdrop del tee", "Programa y tarjeta de juego", "2 jugadores"], false],
      ["Quoota Par", "10 cupos", "USD 1.000", ["Step & repeat y programa", "Producto en el kit", "1 jugador", "Pensado para pymes aliadas"], false],
    ];
    const cw = 2.85, gap = 0.2, y = 1.95, ch = 4.85;
    tiers.forEach(([n, cupos, precio, items, hl], i) => {
      const x = M + i * (cw + gap);
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: ch, fill: { color: hl ? C.accent1 : C.background1 }, line: { type: "none" }, shadow: shadow(), objectName: "Paquete " + n });
      T(s, n, { x: x + 0.28, y: y + 0.25, w: cw - 0.56, h: 0.4, fontSize: 16, bold: true, color: C.text1, valign: "middle" });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.28, y: y + 0.78, w: 1.05, h: 0.32, rectRadius: 0.16, fill: { color: hl ? C.text1 : C.accent1 }, line: { type: "none" }, objectName: "Chip " + cupos });
      T(s, cupos, { x: x + 0.28, y: y + 0.78, w: 1.05, h: 0.32, fontSize: 12, bold: true, color: hl ? C.accent1 : C.text1, align: "center", valign: "middle" });
      T(s, precio, { x: x + 0.28, y: y + 1.3, w: cw - 0.56, h: 0.65, fontSize: 22, bold: true, color: C.text1, valign: "middle" });
      T(s, items.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < items.length - 1 } })),
        { x: x + 0.28, y: y + 2.15, w: cw - 0.56, h: 2.5, fontSize: 14, color: C.text1, valign: "top", paraSpaceAfter: 6 });
    });
    s.addNotes("Montos referenciales. Potencial total: USD 88.000 si se venden todos los cupos.");
  }

  // ===== 7. Naming de hoyos =====
  {
    const s = pres.addSlide({ masterName: "DARK" });
    title(s, "Naming de hoyos");
    const iw = 7.6, ih = iw * 9 / 16;
    s.addImage({ path: IMG.tee, x: M, y: 1.6, w: iw, h: ih, altText: "Salida del hoyo 1 con señalización presentada por una marca patrocinante", objectName: "Foto naming" });
    T(s, "Cada hoyo, una marca.", { x: M, y: 6.1, w: iw, h: 0.5, fontSize: 20, bold: true, color: C.accent1, valign: "middle" });
    T(s, "Ejemplo: el hoyo 7 se juega como “Hoyo Grupo BNCI”. El logo oficial del patrocinante sustituye la tipografía.", { x: M, y: 6.62, w: iw, h: 0.5, fontSize: 12, color: C.accent3, valign: "top" });
    const rx = 8.8, rw = W - M - rx;
    [["1", "hoyo 18 para el patrocinante Albatros"], ["3", "hoyos para los patrocinantes Eagle, junto a su concurso"], ["14", "hoyos disponibles como naming Quoota Birdie"]].forEach(([n, d], i) => {
      const y = 1.6 + i * 1.75;
      s.addShape(pres.shapes.RECTANGLE, { x: rx, y, w: rw, h: 1.6, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "Cifra " + n });
      T(s, n, { x: rx + 0.25, y: y + 0.1, w: rw - 0.5, h: 0.8, fontSize: 48, bold: true, color: C.accent1, valign: "middle" });
      T(s, d, { x: rx + 0.25, y: y + 0.92, w: rw - 0.5, h: 0.6, fontSize: 12, color: C.background1, valign: "top" });
    });
  }

  // ===== 8. Branding del evento en el club =====
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Branding del evento en el club");
    T(s, "Temporal y sin intervenir el campo.", { x: M, y: 1.65, w: 3.9, h: 0.9, fontSize: 20, bold: true, color: C.text1, valign: "top" });
    T(s, [
      "Montaje autoportante, retirado en menos de 24 horas.",
      "Nada se perfora, pinta ni ancla en greens, tees ni fairways.",
      "El nombre del Junko Country Club acompaña a la Copa en el pórtico y la premiación.",
      "Medidas finales en visita técnica con el club.",
    ].map((t, k, a) => ({ text: t, options: { bullet: true, breakLine: k < a.length - 1 } })),
      { x: M, y: 2.7, w: 3.9, h: 4.0, fontSize: 14, color: C.text1, valign: "top", paraSpaceAfter: 10 });
    const gx = 4.9, gw = 3.9, gh = gw * 9 / 16, gap = 0.2;
    const pics = [[IMG.portico, "Pórtico de acceso"], [IMG.tee, "Salida del hoyo 1 y Estación Bienestar"], [IMG.green18, "Green del 18, carritos y carpa del Hoyo 19"], [IMG.premiacion, "Premiación en terraza"]];
    pics.forEach(([p, cap], i) => {
      const x = gx + (i % 2) * (gw + gap), y = 1.65 + Math.floor(i / 2) * (gh + 0.65);
      s.addImage({ path: p, x, y, w: gw, h: gh, altText: cap, objectName: "Foto " + cap, shadow: shadow() });
      T(s, cap, { x, y: y + gh + 0.08, w: gw, h: 0.35, fontSize: 12, bold: true, color: C.text1, valign: "top" });
    });
  }

  // ===== 9. Qué gana el Junko Country Club =====
  {
    const s = pres.addSlide({ masterName: "DARK" });
    title(s, "Qué gana el Junko Country Club");
    const items = [
      [fa.FaCoins, "Ingreso directo", "Green fees, carritos, caddies y alimentos para ~220 personas, pagados por Quoota a tarifa de torneo."],
      [fa.FaHandHoldingHeart, "Fondo de caddies", "El 5 % de lo recaudado por inscripciones. Porque nos importa el talento humano."],
      [fa.FaFlag, "Legado", "Un juego nuevo de 18 banderas y marcadores de salida con los colores del club."],
      [fa.FaBullhorn, "Visibilidad", "El club en todas las piezas, los canales de Quoota y sus medios aliados."],
      [fa.FaUserPlus, "Nuevos socios", "Más de 200 ejecutivos en el club en un día, con espacio para membresías en el Hoyo 19."],
      [fa.FaShieldAlt, "Cero riesgo", "Quoota asume la organización, la producción y todos los costos."],
    ];
    const cw = 3.9, ch = 2.5, gx = 0.2, gy = 0.2;
    for (let i = 0; i < items.length; i++) {
      const [Ic, h, d] = items[i];
      const x = M + (i % 3) * (cw + gx), y = 1.6 + Math.floor(i / 3) * (ch + gy);
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: ch, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "Tarjeta " + h });
      s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.28, w: 0.62, h: 0.62, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Círculo " + h });
      s.addImage({ data: await icon(Ic, "111111"), x: x + 0.46, y: y + 0.44, w: 0.3, h: 0.3, altText: h, objectName: "Icono " + h });
      T(s, h, { x: x + 1.1, y: y + 0.28, w: cw - 1.35, h: 0.62, fontSize: 18, bold: true, color: C.background1, valign: "middle" });
      T(s, d, { x: x + 0.3, y: y + 1.1, w: cw - 0.6, h: 1.3, fontSize: 14, color: C.accent3, valign: "top" });
    }
  }

  // ===== 10. Qué necesitamos del club =====
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Qué necesitamos del club");
    const rows = [
      ["Campo y práctica", "Cierre del campo el sábado 20 de febrero hasta las 3:00 p. m.; range y putting green"],
      ["Montaje", "Viernes 19 desde las 12:00 m.; desmontaje antes del domingo 21 a las 12:00 m."],
      ["Carritos y caddies", "Flota del club; Quoota contrata el faltante"],
      ["Comité de golf", "Reglas, salida, marshals y resultados"],
      ["Profesional del club", "Conducción de la Clínica Pide Quoota"],
      ["Alimentos y bebidas", "Desayuno y almuerzo para ~220 personas a tarifa de torneo"],
      ["Autorizaciones", "Branding temporal, fotografía y video con dron"],
      ["Acceso y enlace", "Lista de invitados, estacionamiento y un enlace designado por la directiva"],
    ];
    const hdr = (t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: "111111" }, fontSize: 14 } });
    const body = rows.map(([a, b], i) => [
      { text: a, options: { bold: true, color: "111111", fill: { color: i % 2 ? "FFFFFF" : "F2F5F3" }, fontSize: 14 } },
      { text: b, options: { color: "111111", fill: { color: i % 2 ? "FFFFFF" : "F2F5F3" }, fontSize: 14 } },
    ]);
    s.addTable([[hdr("Requerimiento"), hdr("Detalle")], ...body], {
      x: M, y: 1.5, w: CW, colW: [3.4, CW - 3.4], rowH: 0.62, valign: "middle", margin: [0, 0.2, 0, 0.2],
      border: { type: "solid", pt: 0.5, color: "D9D9D9" }, fontFace: "Poppins", objectName: "Tabla requerimientos",
    });
  }

  // ===== 11. Cronograma =====
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Cronograma");
    const ev = [
      ["30 oct.", "Aprobación de la directiva y carta de intención"],
      ["Nov.", "Visita técnica y anuncio en el aniversario de Quoota"],
      ["15 dic.", "Cierre Albatros e invitaciones a aliados"],
      ["11 ene.", "Inscripción abierta, socios del Junko primero"],
      ["31 ene.", "Cierre de patrocinios"],
      ["12 feb.", "Cierre de inscripciones y grupos"],
      ["20 feb.", "Copa Quoota"],
      ["26 feb.", "Informe de resultados a la directiva"],
    ];
    const ly = 4.15, inset = 1.3, step = (CW - 2 * inset) / (ev.length - 1);
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: ly - 0.02, w: CW, h: 0.04, fill: { color: C.accent4 }, line: { type: "none" }, objectName: "Línea de tiempo" });
    ev.forEach(([d, t], i) => {
      const cx = M + inset + step * i, up = i % 2 === 0;
      const star = d === "20 feb.";
      s.addShape(pres.shapes.OVAL, { x: cx - 0.13, y: ly - 0.13, w: 0.26, h: 0.26, fill: { color: star ? C.accent1 : C.text1 }, line: { color: C.text1, width: 2 }, objectName: "Nodo " + d });
      const bw = 2.6, bx = Math.min(Math.max(cx - bw / 2, M), W - M - bw);
      const chipY = up ? ly - 0.75 : ly + 0.4;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx - 0.55, y: chipY, w: 1.1, h: 0.36, rectRadius: 0.18, fill: { color: star ? C.accent1 : C.text1 }, line: { type: "none" }, objectName: "Fecha " + d });
      T(s, d, { x: cx - 0.55, y: chipY, w: 1.1, h: 0.36, fontSize: 12, bold: true, color: star ? C.text1 : C.accent1, align: "center", valign: "middle" });
      T(s, t, { x: bx, y: up ? ly - 2.35 : ly + 0.9, w: bw, h: 1.5, fontSize: 14, color: C.text1, align: "center", valign: up ? "bottom" : "top", bold: star });
    });
    T(s, "Fechas de 2026 hasta diciembre; de 2027 desde enero.", { x: M, y: 6.75, w: 8, h: 0.3, fontSize: 11, color: C.text2, valign: "middle" });
  }

  // ===== 12. Cierre =====
  {
    const s = pres.addSlide({ masterName: "DARK" });
    s.addImage({ path: IMG.green18, x: 0, y: 0, w: W, h: H, altText: "Green del hoyo 18 y carpa del Hoyo 19", objectName: "Foto cierre" });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: "111111", transparency: 35 }, line: { type: "none" }, objectName: "Velo" });
    title(s, "Lo que pedimos a la Junta Directiva");
    const asks = [["01", "Fecha", "Sábado 20 de febrero de 2027 con cierre del campo. Alterna: sábado 6 de marzo."], ["02", "Branding", "Aprobación del plan de montaje temporal según los renders."], ["03", "Enlace", "Una persona designada para coordinar todo el proceso."]];
    const cw = 3.9, ch = 2.7, gx = 0.2;
    asks.forEach(([n, h, d], i) => {
      const x = M + i * (cw + gx), y = 1.7;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: ch, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "Petición " + n });
      T(s, n, { x: x + 0.3, y: y + 0.2, w: 1.5, h: 0.8, fontSize: 40, bold: true, color: C.accent1, valign: "middle" });
      T(s, h, { x: x + 0.3, y: y + 1.0, w: cw - 0.6, h: 0.45, fontSize: 20, bold: true, color: C.background1, valign: "middle" });
      T(s, d, { x: x + 0.3, y: y + 1.5, w: cw - 0.6, h: 1.1, fontSize: 14, color: C.accent3, valign: "top" });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: 4.7, w: CW, h: 1.7, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Llamado final" });
    T(s, "Respuesta antes del viernes 30 de octubre de 2026.", { x: M + 0.4, y: 4.9, w: CW - 0.8, h: 0.7, fontSize: 24, bold: true, color: C.text1, valign: "middle" });
    T(s, "Con la aprobación firmamos la carta de intención y agendamos la visita técnica.", { x: M + 0.4, y: 5.65, w: CW - 0.8, h: 0.5, fontSize: 16, color: C.text1, valign: "middle" });
  }

  await pres.writeFile({ fileName: "Copa_Quoota_Junko_v2.pptx" });
  await applyTheme("Copa_Quoota_Junko_v2.pptx", THEME);
  console.log("listo");
})();
