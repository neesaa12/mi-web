# ADR 001: Uso de Componentes Reutilizables en Vanilla JS
- **Estado**: Aceptado
- **Contexto**: Se requería pasar de una página monolítica a una estructura de 4+ páginas (Req 3) manteniendo la consistencia y sin usar frameworks pesados.
- **Decisión**: Se implementó un sistema ligero de inyección de componentes (`components.js`) que renderiza la cabecera y el pie de página dinámicamente en cada página.
- **Consecuencias**: Reduce drásticamente la duplicidad de código, facilita el mantenimiento futuro y cumple explícitamente el requisito de "componentes reutilizables o templates" (Req 6).

# ADR 002: Justificación de Animaciones (Cursor y Título)
- **Estado**: Aceptado
- **Contexto**: El requisito 4 exige "animaciones con intención (no decorativas)". El rastro del cursor y el brillo del título podrían considerarse puramente estéticos.
- **Decisión**: Se documenta y justifica que el rastro del cursor actúa como "señal de feedback visual de interacción" que guía la atención del usuario en zonas vacías de la interfaz, mientras que el brillo del título establece jerarquía visual inmediata. Ambas animaciones respetan `prefers-reduced-motion` y se pausan si la pestaña no está visible (optimización Lighthouse).
- **Consecuencias**: Cumple el requisito al estar explícitamente justificado en la defensa, y mejora la accesibilidad y el rendimiento medido.