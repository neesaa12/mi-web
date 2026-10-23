# Web Personal de Vanesa Petrova Aygarova (1º DAM)

## Descripción
Web personal desarrollada como proyecto de 1º de DAM. Incluye consumo de API real (GitHub), sistema de componentes reutilizables en Vanilla JS, modo oscuro/claro, y un sudoku interactivo.

## Requisitos cumplidos
- [x] **Canal con respuesta automática**: Formulario que abre issue/PR en GitHub con datos codificados en la URL.
- [x] **Identidad propia**: Logo SVG propio, favicon, microinteracciones y consistencia visual en 4 páginas.
- [x] **Función con estado**: Login demo con `localStorage` y consumo de API real de GitHub con estado de carga/error.
- [x] **Componentes y Arquitectura**: Sistema de plantillas en `components.js` y decisiones documentadas en `ADR.md`.
- [x] **Historial legible**: Este README documenta el recorrido, y el repositorio contiene issues/PR reales.

## Estructura del proyecto
- `index.html`, `sobre-mi.html`, `proyectos.html`, `contacto.html`: Páginas principales.
- `components.js`: Inyección de cabecera y pie de página reutilizables (Req 6).
- `script.js`: Lógica de la aplicación (tema, sudoku, API, login demo, canvas optimizado).
- `styles.css`: Estilos con variables CSS para modo oscuro/claro.
- `README.md` y `ADR.md`: Documentación técnica y de decisiones de arquitectura.

## Cómo ejecutar
Simplemente abre `index.html` en tu navegador o usa una extensión como "Live Server" en VS Code.