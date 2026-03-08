---
name: ui-conventions
description: >
  Convenciones de UI para AGENTI. Cargar cuando se construya cualquier componente,
  pantalla o interacción visual. Incluye design system, colores, tipografía,
  patrones de componentes y reglas de accesibilidad.
---

# UI Conventions — AGENTI

> Leer junto con `docs/ui-spec.md` y `docs/screen-specs.md` para el detalle completo.

## Principio de diseño

"Cálido, simple y operativo." Cada decisión visual se valida contra este principio.
Si un componente es frío, complicado o lento — está mal.

## Colores

```
Primary:   #1B4332  (emerald profundo)
Primary hover: #2D6A4F
Accent:    #D97706  (amber)
Background: #FAFAF9 (warm white)
Surface:   #FFFFFF
Border:    #E5E7EB
Text primary: #111827
Text secondary: #6B7280
Text disabled: #9CA3AF

Semánticos:
Success: #059669
Warning: #D97706
Error:   #DC2626
Info:    #2563EB
```

## Tipografía

```
UI general: Geist (sans-serif) — todos los tamaños funcionales
Display/celebración: Instrument Serif italic — solo para momentos de celebración,
                     no para UI funcional
```

Escala tipográfica:
```
text-xs:   12px — metadata, timestamps
text-sm:   14px — body secundario, labels
text-base: 16px — body principal
text-lg:   18px — subtítulos
text-xl:   20px — títulos de sección
text-2xl:  24px — títulos de pantalla
text-3xl:  30px — títulos de onboarding
```

## Estructura de componentes

Server Components por defecto. `'use client'` solo cuando hay hooks de estado o event handlers:

```typescript
// Correcto — Server Component por defecto
export function ConversationCard({ conversation }: ConversationCardProps) {
  return (...)
}

// Con client cuando es necesario
'use client'
export function ApprovalButton({ suggestionId }: ApprovalButtonProps) {
  const [loading, setLoading] = useState(false)
  return (...)
}
```

Máximo 150 líneas por componente. Si excede → dividir.
Props interface siempre junto al componente, no en archivo separado.

## Navegación

Bottom navigation bar en mobile — 5 ítems fijos:
```
Inicio | Conversaciones | Agente | Entrenar | Ajustes
```
Sidebar izquierda en desktop con los mismos 5 ítems.
No añadir ítems ni modificar esta estructura sin consultar `docs/screen-specs.md`.

## Patrones de estado

Cada pantalla e componente interactivo tiene estos estados definidos en `docs/screen-specs.md`:
- Vacío / primer uso
- Cargando
- Con datos
- Error recuperable
- Error no recuperable

Nunca mostrar un estado de error genérico. Siempre mensaje específico y acción de recuperación.

## Burbujas de chat

El hilo de conversación usa burbujas diferenciadas por actor:
```
Cliente:  alineado a la izquierda, fondo gris claro, sin cola
Agente:   alineado a la derecha, fondo primary muy claro, con indicador de sugerencia
Dueño:    alineado a la derecha, fondo primary, texto blanco
Sistema:  centrado, texto pequeño secondary, sin burbuja
```

## Indicadores de estado del agente

Tres estados visuales en el home:
```
Verde:   agente activo, todo bien
Amarillo: agente activo con advertencia (conocimiento bajo, token por renovar)
Rojo:    agente desconectado o con error
```

## Accesibilidad

- Contraste mínimo 4.5:1 para texto sobre fondo.
- Todos los botones con label descriptivo (no solo iconos en acciones importantes).
- Focus visible en todos los elementos interactivos.
- Touch targets mínimo 44x44px en mobile.

## Reglas de NO hacer

- Sin dark mode en MVP.
- Sin animaciones complejas — solo transiciones funcionales (aparición de elementos, loading states).
- Sin gradientes excepto en el background de onboarding.
- Sin glassmorphism ni efectos visuales pesados.
- Sin emojis en la UI funcional (solo en mensajes del agente cuando el tono lo justifica).
- Instrument Serif SOLO en celebración (activación del agente, primera semana completada).
