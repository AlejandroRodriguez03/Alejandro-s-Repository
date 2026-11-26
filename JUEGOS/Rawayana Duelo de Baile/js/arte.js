// =====================================================================
// arte.js: imágenes reales de los integrantes y de los escenarios.
//
// Este archivo lo genera la herramienta herramientas/preparar_arte.py a
// partir de las imágenes de la carpeta arte/. Mientras no haya imágenes,
// el juego usa los muñecos dibujados con código.
//
// Formato: RW.ARTE_DATOS = {
//   beto: { quieto: 'data:image/png;base64,...', golpe: '...', retrato: '...' },
//   escenarios: { barrio: '...' },
// }
// =====================================================================
window.RW = window.RW || {};
window.RW.ARTE_DATOS = window.RW.ARTE_DATOS || {};
