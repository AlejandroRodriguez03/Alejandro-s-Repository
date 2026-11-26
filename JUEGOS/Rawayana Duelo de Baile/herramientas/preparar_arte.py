#!/usr/bin/env python3
"""Prepara las imágenes de la carpeta arte/ para que el juego las use.

Uso (desde la carpeta del juego):
    python3 herramientas/preparar_arte.py

Estructura que espera (los nombres pueden estar en mayúsculas o minúsculas):
    arte/beto/quieto.png      bailando quieto (la más importante)
    arte/beto/golpe.png       golpe con el brazo
    arte/beto/patada.png      patada
    arte/beto/golpeado.png    recibiendo un golpe
    arte/beto/suelo.png       tirado en el piso
    arte/beto/victoria.png    celebrando
    arte/beto/especial.png    haciendo su especial
    arte/beto/agachado.png    agachado (opcional)
    arte/beto/salto.png       en el aire (opcional)
    arte/beto/retrato.png     cara para el HUD y la selección (opcional, se usa tal cual)
    arte/beto/busto.png       medio cuerpo para la selección (opcional)
    arte/beto/dj.png          medio cuerpo pinchando, para la tarima del DJ (opcional)
    (lo mismo para abeja, fofo y tony)
    arte/escenarios/barrio.png, roques.png, avila.png   fondos sin personajes

Cada imagen puede tener fondo transparente o un fondo de un solo color
(por ejemplo verde): la herramienta lo quita, recorta al personaje, lo
escala al tamaño del juego y escribe todo en js/arte.js.

Necesita Pillow y numpy:  pip install pillow numpy
"""
import base64
import io
import os
import sys
from collections import deque

import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETA_ARTE = os.path.join(RAIZ, "arte")
SALIDA = os.path.join(RAIZ, "js", "arte.js")

INTEGRANTES = ["beto", "abeja", "fofo", "tony"]
# Alto de cada pose en píxeles (el doble de lo que ocupa en la pantalla de 384x216,
# porque el juego dibuja las imágenes reales a doble resolución)
ALTOS = {
    "quieto": 244, "golpe": 240, "patada": 236, "golpeado": 232, "victoria": 252,
    "especial": 244, "agachado": 172, "salto": 208, "suelo": 104,
}
ALTO_BUSTO = 224
ALTO_DJ = 140      # medio cuerpo detrás de la mesa del DJ
ANCHO_MAX = 340
TAM_RETRATO = 256
ESCENARIO = (1600, 432)
EXTENSIONES = (".png", ".jpg", ".jpeg", ".webp")


def buscar(carpeta, nombre):
    """Busca un archivo sin importar mayúsculas ni extensión."""
    if not os.path.isdir(carpeta):
        return None
    for archivo in os.listdir(carpeta):
        base, ext = os.path.splitext(archivo)
        if base.lower() == nombre and ext.lower() in EXTENSIONES:
            return os.path.join(carpeta, archivo)
    return None


def quitar_fondo(img):
    """Quita el fondo: si ya es transparente lo deja; si es de un color, lo borra
    desde los bordes (relleno por inundación) para no borrar ropa del mismo color."""
    rgba = np.array(img.convert("RGBA"), dtype=np.int16)
    alto, ancho = rgba.shape[:2]
    if (rgba[:, :, 3] < 250).mean() > 0.05:
        return Image.fromarray(rgba.astype(np.uint8), "RGBA")
    esquinas = np.concatenate([rgba[:4, :4, :3].reshape(-1, 3), rgba[:4, -4:, :3].reshape(-1, 3),
                               rgba[-4:, :4, :3].reshape(-1, 3), rgba[-4:, -4:, :3].reshape(-1, 3)])
    fondo = np.median(esquinas, axis=0)
    distancia = np.sqrt(((rgba[:, :, :3] - fondo) ** 2).sum(axis=2))
    parecido = distancia < 70
    borrar = np.zeros((alto, ancho), dtype=bool)
    cola = deque()
    for x in range(ancho):
        for y in (0, alto - 1):
            if parecido[y, x] and not borrar[y, x]:
                borrar[y, x] = True
                cola.append((y, x))
    for y in range(alto):
        for x in (0, ancho - 1):
            if parecido[y, x] and not borrar[y, x]:
                borrar[y, x] = True
                cola.append((y, x))
    while cola:
        y, x = cola.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < alto and 0 <= nx < ancho and parecido[ny, nx] and not borrar[ny, nx]:
                borrar[ny, nx] = True
                cola.append((ny, nx))
    rgba[borrar, 3] = 0
    # Quitar el tinte verde que queda en los bordes
    borde = np.zeros_like(borrar)
    borde[1:, :] |= borrar[:-1, :]
    borde[:-1, :] |= borrar[1:, :]
    borde[:, 1:] |= borrar[:, :-1]
    borde[:, :-1] |= borrar[:, 1:]
    borde &= ~borrar
    if fondo[1] > fondo[0] and fondo[1] > fondo[2]:
        tope = np.maximum(rgba[:, :, 0], rgba[:, :, 2])
        rgba[:, :, 1] = np.where(borde, np.minimum(rgba[:, :, 1], tope), rgba[:, :, 1])
    return Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA")


def recortar(img):
    caja = img.getbbox()
    return img.crop(caja) if caja else img


def a_data_uri(img):
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def escalar_alto(img, alto):
    factor = alto / img.height
    if img.width * factor > ANCHO_MAX * (1.6 if alto < 60 else 1):
        factor = ANCHO_MAX * (1.6 if alto < 60 else 1) / img.width
    return img.resize((max(1, round(img.width * factor)), max(1, round(img.height * factor))), Image.LANCZOS)


def retrato_desde(img):
    """Cuadrado con la cara, tomado de la parte de arriba de la imagen."""
    lado = min(img.width, round(img.height * 0.42))
    x0 = max(0, (img.width - lado) // 2)
    cara = img.crop((x0, 0, x0 + lado, lado))
    return cara.resize((TAM_RETRATO, TAM_RETRATO), Image.LANCZOS)


def main():
    if not os.path.isdir(CARPETA_ARTE):
        print("No existe la carpeta arte/. Crea arte/beto/quieto.png y las demás.")
        return 1
    datos = {}
    for pj in INTEGRANTES:
        carpeta = os.path.join(CARPETA_ARTE, pj)
        poses = {}
        original_quieto = None
        for pose, alto in ALTOS.items():
            ruta = buscar(carpeta, pose)
            if not ruta:
                continue
            img = recortar(quitar_fondo(Image.open(ruta)))
            if pose == "quieto":
                original_quieto = img
            poses[pose] = a_data_uri(escalar_alto(img, alto))
            print(f"  {pj}/{pose}: listo")
        for extra, alto_extra in (("busto", ALTO_BUSTO), ("dj", ALTO_DJ)):
            ruta_extra = buscar(carpeta, extra)
            if ruta_extra:
                img = recortar(quitar_fondo(Image.open(ruta_extra)))
                factor = alto_extra / img.height
                poses[extra] = a_data_uri(img.resize((round(img.width * factor), alto_extra), Image.LANCZOS))
                print(f"  {pj}/{extra}: listo")
        ruta_ret = buscar(carpeta, "retrato")
        if ruta_ret:
            img = Image.open(ruta_ret).convert("RGBA")
            lado = min(img.width, img.height)
            img = img.crop(((img.width - lado) // 2, 0, (img.width - lado) // 2 + lado, lado))
            poses["retrato"] = a_data_uri(img.resize((TAM_RETRATO, TAM_RETRATO), Image.LANCZOS))
            print(f"  {pj}/retrato: listo")
        elif original_quieto is not None:
            poses["retrato"] = a_data_uri(retrato_desde(original_quieto))
            print(f"  {pj}/retrato: sacado de la pose quieto")
        if poses:
            datos[pj] = poses
    fondos = {}
    for esc in ("barrio", "roques", "avila"):
        ruta = buscar(os.path.join(CARPETA_ARTE, "escenarios"), esc)
        if not ruta:
            continue
        img = Image.open(ruta).convert("RGB")
        factor = max(ESCENARIO[0] / img.width, ESCENARIO[1] / img.height)
        img = img.resize((round(img.width * factor), round(img.height * factor)), Image.LANCZOS)
        x0 = (img.width - ESCENARIO[0]) // 2
        y0 = img.height - ESCENARIO[1]
        fondos[esc] = a_data_uri(img.crop((x0, y0, x0 + ESCENARIO[0], y0 + ESCENARIO[1])))
        print(f"  escenario {esc}: listo")
    if fondos:
        datos["escenarios"] = fondos

    with open(SALIDA, "w", encoding="utf-8") as f:
        f.write("// Generado por herramientas/preparar_arte.py: no editar a mano.\n")
        f.write("window.RW = window.RW || {};\nwindow.RW.ARTE_DATOS = {\n")
        for clave, valor in datos.items():
            f.write(f"  {clave}: {{\n")
            for nombre, uri in valor.items():
                f.write(f"    {nombre}: '{uri}',\n")
            f.write("  },\n")
        f.write("};\n")
    print(f"Escrito {os.path.relpath(SALIDA, RAIZ)} con {sum(len(v) for v in datos.values())} imágenes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
