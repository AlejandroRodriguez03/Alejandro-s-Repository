# Algoritmo de LinkedIn y alcance orgánico esperado (2025-2026)

Nota metodológica: el proxy de red bloqueó WebFetch para socialinsider.io, buffer.com, searchengineland.com, dataslayer.ai y writtenlyhub.com, así que todas las cifras provienen de resúmenes de búsqueda (snippets) y no de lectura completa de las fuentes primarias. Muchas cifras son citadas por agregadores/blogs de marketing que reinterpretan estudios originales (Socialinsider, van der Blom, Buffer); tratarlas como orientativas y verificar antes de citar en el curso.

## ¿Cómo funciona el feed hoy (prueba inicial, dwell time, comentarios, guardados, enlaces externos)?

### Takeaway
El feed usa ranking neuronal/LLM (LinkedIn habló de integración de LLM en 2025; la comunidad lo llama 360Brew) que prioriza relevancia temática, conversación de calidad, dwell time y guardados sobre el alcance viral. Los enlaces externos penalizan, y el truco de poner el enlace en el primer comentario ya no funciona según fuentes secundarias.

### Cited Findings
- El feed está impulsado por sistemas neuronales de ranking (transformers sobre recuperación neuronal); las palancas observables más fuertes son conversación de calidad, relevancia temática y dwell time. — [Digital Codex / resultados de búsqueda](https://www.clarigital.com/codex/social-media/linkedin-algorithm/)
- La ingeniería de LinkedIn reveló en agosto de 2025 la integración de LLM (embeddings para entender de qué trata un post y la experiencia del creador). — [Search Engine Land](https://searchengineland.com/linkedin-updates-feed-algorithm-llm-ranking-retrieval-471708) (solo snippet)
- Dwell time se usa como señal desde 2020; el modelo LiRank de LinkedIn lo trata como clasificador binario "Long Dwell" y una predicción de dwell corto actúa como señal negativa, ponderada aparte y más que los likes. — [Meet-Lea, dwell time](https://meet-lea.com/en/blog/linkedin-dwell-time-hidden-metric)
- El sistema busca "engagement significativo": comentarios sustanciales, guardados y dwell time. — [Meet-Lea, algoritmo](https://meet-lea.com/en/blog/linkedin-algorithm-explained)
- 360Brew: descrito como un LLM de 150 mil millones de parámetros que reemplaza el ranking por señales con razonamiento semántico (afirmación de blogs, no confirmada en un documento oficial que yo haya podido leer). — [PostEverywhere](https://posteverywhere.ai/blog/how-the-linkedin-algorithm-works)
- Prueba inicial ("golden hour"): el post se muestra a una muestra pequeña (según blogs, 2 a 5 % de la red) durante 60 a 90 minutos; si hay comentarios sustanciales, se amplía. — [ContentIn, glosario](https://contentin.io/glossary/golden-hour/); [Frontal](https://frontal.so/blog/linkedin-algorithm)
- Enlace externo en el cuerpo: reduce el alcance mediano 18,8 % (van der Blom, 2025, 1,3 millones de posts, abril 2025); una actualización 2026 citada reporta un costo distinto (cifra no visible en el snippet). — [Búsqueda: Gromming / Ordinal / Substack M. Goodman](https://gromming.com/blog/linkedin-external-links-penalty)
- Afirmación secundaria: los comentarios con enlaces externos se suprimen hasta 80 % y el enlace en el primer comentario ya no evita la penalización (el modelo 2026 detectaría "comportamiento puente"). — [Substack M. Goodman](https://melaniegoodmanlinkedinconsultant.substack.com/p/linkedin-algorithm-2026-reach-topic-authority) (fuente débil, sin muestra)
- Van der Blom (Algorithm Insights 2025): LinkedIn opera varios algoritmos en paralelo (noticias, engagement, confianza y seguridad, diseño) y prioriza relevancia sobre alcance. — [Agorapulse / resultados de búsqueda](https://www.agorapulse.com/blog/linkedin/linkedin-algorithm-2025/)

### Inferences
- Para un curso de petróleo (nicho técnico), la relevancia temática y la experiencia demostrada en el perfil pesan más que el tamaño de la red; conviene poner el enlace al curso en el perfil/Destacados o vía mensaje, no en el post.
- Las cifras de la "prueba inicial" (2 a 5 %) provienen de blogs, no de LinkedIn; usarlas como heurística.

### Gaps
- No pude leer la publicación oficial de ingeniería de LinkedIn ni el informe completo de van der Blom (PDF de pago, 240 páginas).
- No hay fuente primaria que confirme el nombre "360Brew" con esos parámetros ni el porcentaje de la muestra inicial.

## Benchmarks de alcance y engagement por formato

### Takeaway
Documentos/carruseles nativos lideran en engagement (6,1 a 7,0 % por impresiones según Socialinsider); el video rinde ~5,6 a 6,0 % pero con caída de vistas; las encuestas cayeron fuerte; los enlaces rinden peor. El alcance total de la plataforma cayó ~50 % interanual según van der Blom.

### Cited Findings
- Socialinsider, "2025 LinkedIn Benchmarks": 1 millón de posts publicados en 2024; engagement medio 5,20 % por impresiones; multiimagen 6,60 %, documentos nativos 6,10 %, video 5,60 %. — [Socialinsider](https://www.socialinsider.io/social-media-benchmarks/linkedin) (vía snippet)
- Versión 2026 citada por agregadores: documentos nativos 7,00 % (+14 % interanual desde 6,10 %), multiimagen 6,45 %, video 6,00 %, enlaces bajan de 3,70 % a 3,30 %. — [Meet-Lea](https://meet-lea.com/en/blog/linkedin-engagement-metrics-benchmarks) (discrepa levemente de las cifras anteriores; puede mezclar ediciones)
- Van der Blom, Algorithm Insights 2025 (1,8 millones de posts, 5 años): vistas -50 %, engagement -25 %, crecimiento de seguidores -59 %; documentos/PDF 6,60 % de engagement, el más alto. — [Writtenly](https://www.writtenlyhub.com/news/linkedin-engagement-down-50-algorithm-insights-report-2025); [Scribd capítulo 1](https://www.scribd.com/document/984921783/Algorithm-Insights-Report-2025-chapter-1-Richard-Van-der-Blom)
- Documentos cayeron menos (-43 %) que el promedio en alcance. — [Authoredup / resultados de búsqueda](https://authoredup.com/blog/linkedin-algorithm)
- Encuestas: multiplicador de alcance de 1,64x a 1,19x; caída de 35 % del alcance mediano en perfiles personales; una fuente afirma 0,07 % de engagement tras una "Authenticity Update" de marzo 2026 (cifra extrema, no verificada). — [SocialPilot](https://www.socialpilot.co/blog/linkedin-algorithm)
- Video: caída de 36 % interanual en vistas en páginas (según agregador). — [Meet-Lea](https://meet-lea.com/en/blog/linkedin-engagement-metrics-benchmarks)
- Estimaciones por 1.000 seguidores (B2B): texto ~800 impresiones, imagen ~1.200, video ~2.000 (fuente secundaria sin muestra). — [ConnectSafely](https://connectsafely.ai/articles/how-many-impressions-good-linkedin-benchmarks-2026)
- Newsletters: 28 millones de miembros suscritos a al menos una; cada edición genera correo, push y alerta in-app sin filtrado algorítmico; posts de feed alcanzan 8 a 12 % de seguidores; páginas 1,6 %. — [Moburst / Sales So / resultados de búsqueda](https://salesso.com/blog/linkedin-newsletter-statistics/)
- Alcance orgánico de creadores activos -60 % en dos años (fuente secundaria). — [Substack Lou Bortone](https://aitodaywithloubortone.substack.com/p/linkedins-strange-brew-why-newsletters)

### Inferences
- Para el curso: carrusel PDF (10 diapositivas) como formato principal y texto puro para opinión; evitar encuestas; newsletter como canal de retención no dependiente del feed.

### Gaps
- No encontré benchmarks fiables de alcance para eventos de LinkedIn ni para artículos (no newsletter) en 2025-2026.
- Las cifras de Socialinsider difieren entre ediciones (multiimagen 6,60 vs 6,45 %); no pude abrir la fuente para aclarar.

## Horarios, frecuencia, longitud del texto y hashtags

### Takeaway
Martes a jueves, con Buffer (4,8 millones de posts, 2026) señalando miércoles 16:00 y ventana 15:00 a 20:00; 2 a 5 posts por semana dan mejora modesta; textos de ~1.300 a 2.500 caracteres rinden mejor; hashtags aportan poco (1 a 5 relevantes).

### Cited Findings
- Buffer 2026: 4,8 millones de posts; mejor franja 15:00 a 20:00 en días laborables, miércoles 16:00 el mejor slot; en 2025 el pico caía tras las 17:00. Zona horaria no verificada. — [Buffer](https://buffer.com/resources/best-time-to-post-on-linkedin/) (snippet)
- Tres estudios coinciden en martes a jueves, fines de semana débiles. — [Growtempo](https://www.growtempo.com/blog/best-time-to-post-on-linkedin)
- Buffer, más de 2 millones de posts: 2 a 5 posts/semana +1.182 impresiones por post y +0,23 puntos de engagement; 6 a 10/semana +5.001; 11+/semana +16.946 (frente a menos de 1/semana). — [Buffer](https://buffer.com/resources/how-often-to-post-on-linkedin/)
- Longitud: 1.301 a 2.500 caracteres con engagement mediano 2,61 a 2,67 % vs 2,10 % bajo 400; el "ver más" corta a ~210 caracteres en escritorio y ~140 en móvil. — [Authoredup](https://authoredup.com/blog/linkedin-character-limit)
- Hashtags: efecto casi neutro en alcance (+9 % alcance, +12,6 % engagement según un análisis); 1 a 3 (o 3 a 5) relevantes; nicho supera a genéricos en 28 %. — [ContentIn](https://contentin.io/blog/do-hashtags-work-on-linkedin/); [Closely, 10.000 posts](https://blog.closelyhq.com/linkedin-hashtag-strategy-data-from-10000-posts-analysis/)

### Inferences
- Hay conflicto entre "mañana" (guías clásicas) y "tarde" (Buffer 2026); probar 2 horarios propios. Para público latinoamericano ajustar zona horaria.
- Frecuencia realista para una cuenta pequeña: 3 a 4 posts/semana.

### Gaps
- No hay muestra ni metodología visible para los datos de hashtags (blogs); ninguna fuente oficial de LinkedIn sobre hashtags 2026.
- No se abrió el estudio de Sprout Social ni Hootsuite.

## Perfil personal vs página de empresa y alcance esperado para cuentas pequeñas

### Takeaway
El perfil personal obtiene entre ~2,75x y 10x más alcance/engagement que una página. Para menos de 5.000 seguidores, rangos realistas: ~300 a 2.000 impresiones por post, mediana ~527 en 1.000 a 5.000 seguidores.

### Cited Findings
- Perfiles personales: 2,75x más impresiones con el mismo contenido; 5 a 8x el engagement de páginas; páginas alcanzan 1,6 % de sus seguidores en 2025 vs 7 % en 2021. — [Digital Applied](https://www.digitalapplied.com/blog/linkedin-personal-profiles-vs-company-pages-8x-engagement); [Ordinal](https://www.tryordinal.com/blog/the-declining-reach-of-linkedin-company-pages)
- Advocacy de empleados: amplificación 5 a 10x (autoinformada). — [Refine Labs](https://www.refinelabs.com/blog/personal-linkedin-engagement-vs-company-page)
- Cuentas menores de 5.000 seguidores: ~16 impresiones por cada 100 seguidores por post; 300 a 2.000 impresiones es objetivo realista; mediana de 527 en el tramo 1.000 a 5.000. — [ContentIn](https://contentin.io/blog/what-are-impressions-on-linkedin/); [OutX](https://www.outx.ai/blog/good-number-linkedin-impressions)
- Tras 360Brew, alcances más pequeños pero más segmentados; las cuentas top concentran la visibilidad. — [ConnectSafely](https://connectsafely.ai/articles/how-many-impressions-good-linkedin-benchmarks-2026)

### Inferences
- Publicar desde el perfil personal del instructor; usar la página solo como respaldo/reposteo.
- Un objetivo de 8 a 15 % de seguidores por post es razonable en cuentas pequeñas (coherente con el 8 a 12 % citado).

### Gaps
- Muestras y metodología de los estudios de perfil vs página no verificadas (agregadores, algunos con incentivos comerciales).

## Cambios recientes 2025-2026

### Takeaway
2025 trajo caída generalizada de alcance (-50 % vistas), integración de LLM y relevancia por experiencia; 2026 endureció penalizaciones a enlaces, encuestas y contenido genérico de IA.

### Cited Findings
- Agosto 2025: LinkedIn revela integración LLM en retrieval y ranking. — [Search Engine Land](https://searchengineland.com/linkedin-updates-feed-algorithm-llm-ranking-retrieval-471708)
- Q4 2025 "reset" con caídas de vistas. — [Propel Growth](https://www.learning.propelgrowth.com/blog/linkedin-algorithm-reset-q4-2025-why-views-dropped-and-how-to-fix-it)
- 2026: contenido genérico de IA penalizado; saves y dwell con más peso. — [ZoomSphere](https://www.zoomsphere.com/blog/linkedin-algorithm-2026-why-generic-ai-content-kills-your-organic-reach); [SocialPilot](https://www.socialpilot.co/blog/linkedin-algorithm)
- Marzo 2026 "Authenticity Update" y abril 2026 analítica de newsletters con demografía (fuentes secundarias). — [SocialPilot](https://www.socialpilot.co/blog/linkedin-algorithm); [Sales So](https://salesso.com/blog/linkedin-newsletter-statistics/)

### Inferences
- Datos de 2024 (Socialinsider) conviven con datos 2026; no mezclar al citar.

### Gaps
- La "Authenticity Update" de marzo 2026 no fue confirmada por comunicación oficial de LinkedIn en lo que pude ver.
