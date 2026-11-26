# Bisagra Cero · el juego del mostrador de portátiles

Juego de preguntas y decisión rápida con los **4 portátiles nuevos más baratos** de la primera
página de la categoría Portátiles de PcComponentes (captura de noviembre de 2026):

| Portátil | Precio | Lo que lo distingue |
|---|---|---|
| Alurin Flex Advance i3-1210U | 398,99 € | El más barato, Windows incluido, lector microSD |
| ASUS Vivobook Go 15 E1504FA-BQ4442 | 437,99 € | Único AMD, Wi-Fi 6E, 2 × USB-C, el más fino… sin sistema |
| Alurin Flex Advance i5-1250P | 449,00 € | 12 núcleos, Iris Xe, lector de huella |
| Lenovo V15 G5 IRL i3-1315U | 499,00 € | RJ-45, RAM ampliable a 32 GB, SSD PCIe 4.0, panel TN |

Hecho con HTML, CSS y JavaScript puros: **sin librerías, sin compilación y sin servidor**.

## Cómo jugar

Abre `index.html` con doble clic en cualquier navegador moderno.

- **Mostrador** (modo principal): cada cliente pide 1-3 requisitos. Elige el único portátil que
  los cumple todos, o rechaza el pedido si ninguno vale. 3 cargas de batería.
  Teclas `1`-`4` para elegir, `R` rechazar, `P` diagnóstico (descarta uno que no vale),
  `Espacio` empezar / siguiente. El *modo aprendiz* muestra qué cumple cada portátil.
- **Duelo de fichas**: dos portátiles y un dato (precio, núcleos, batería, peso, Wi-Fi…).
  ¿Cuál gana o empatan? `←` / `→` / `E`.
- **Escaparate**: fichas completas con ilustración ampliable.
- **Comparador**: radar de prestaciones, barras de valor y tabla completa.

### Niveles de tiempo (en los dos modos)

| Nivel | Tiempo por pedido / duelo | Puntos |
|---|---|---|
| 20 s | 20 segundos | ×1,3 + bonus por tiempo sobrante |
| 1 min | 60 segundos | ×1 + bonus por tiempo sobrante |
| Sin tiempo | sin reloj, a tu ritmo | ×0,6, sin bonus de tiempo |

Se elige con el selector «Nivel de tiempo» o con las teclas `1`, `2` y `3` antes de empezar
(o al terminar una partida). Durante la partida queda bloqueado. Cada modo recuerda su
nivel y guarda un récord distinto por nivel.

Los récords, los niveles elegidos y la preferencia de sonido se guardan en el navegador.

## Estructura

```
index.html            página y secciones
css/styles.css        estilos
img/                  ilustraciones SVG de cada portátil (generadas desde su ficha), logo y fondo
js/data.js            fichas técnicas de los 4 portátiles  ← edita aquí precios o datos
js/engine.js          requisitos, trampas, generador de pedidos y duelos, puntuación
js/ui.js              utilidades y tarjeta de portátil
js/icons.js · sound.js · charts.js   iconos, sonido sintetizado y gráficos canvas
js/intro.js · taller.js · duelo.js · fichas.js · comparador.js · main.js   secciones
```

Los precios cambian a diario en la tienda: antes de comprar, comprueba la ficha en la web.
Juego no oficial; ni PcComponentes ni los fabricantes lo patrocinan.
