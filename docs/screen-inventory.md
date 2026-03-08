# AGENTI — Entregable 3B v1.0
## Inventario de pantallas priorizado + objetos de interfaz

**Versión:** 1.0
**Estado:** Oficial
**Origen:** Derivado del análisis de arquitectura del segundo modelo. Entregable puente entre los flujos de experiencia (Entregable 3) y la arquitectura de UI (Entregable 5).

---

## Principio de arquitectura

AGENTI no se estructura como dashboard-first sino como action-first. La vista principal no es "métricas", sino "lo que necesita tu atención ahora." Esto no es solo una decisión de UX; es una declaración de identidad de producto. La app se siente como el WhatsApp del dueño con superpoderes, no como un panel administrativo con una bandeja adentro.

---

## Modelo de navegación principal

**Mobile (bottom navigation bar) — 5 ítems:**

| Ítem | Qué responde en la mente del dueño |
|---|---|
| Inicio | ¿Qué necesita mi atención ahora mismo? |
| Conversaciones | ¿Quién me escribió y qué pasa con cada chat? |
| Agente | ¿Cómo va mi agente y qué tan listo está? |
| Entrenar | ¿Qué le enseño hoy? |
| Ajustes | ¿Dónde cambio algo de la configuración? |

**Por qué esta navegación y no otra:**

Las conversaciones pendientes de aprobación NO son una tab separada. Viven dentro de "Conversaciones" como sección promovida al tope de la bandeja. Separar "Pendientes" como tab independiente crea duplicación mental: el dueño no distingue entre "ver conversaciones" y "ver pendientes" como destinos distintos, sino como un mismo lugar con prioridades distintas.

"Agente" agrupa estado del agente, resumen de impacto y autonomía por tema. Concentra todo lo relacionado con confianza y desempeño en un solo dominio mental.

"Entrenar" agrupa conocimiento actual, oportunidades de entrenamiento y correcciones recientes. Separa claramente operar de enseñar.

**Desktop (sidebar izquierda):** exactamente las mismas 5 áreas. Desktop es una extensión cómoda, no una versión más compleja.

---

## Inventario completo de pantallas

### Grupo 1 — Pantallas esenciales para MVP
*Sin estas pantallas no existe el producto ni se puede pilotar.*

**Públicas / pre-registro**
1. Landing page
2. Demo interactiva (embebida en landing o vista dedicada liviana)
3. Captura de lead no convertido

**Acceso**
4. Crear cuenta
5. Verificación por código
6. Login
7. Recuperar acceso

**Onboarding**
8. Selección de industria con preview de plantilla
9. Personalización del negocio — bloque principal (nombre, horarios, servicios, precios, tono)
10. Añadir fuentes extra (web, documentos, nota de voz)
11. Reglas de escalamiento iniciales
12. Conectar WhatsApp (Embedded Signup)
13. Estado de conexión / reintento / asistencia
14. Prueba del agente *(pantalla más crítica del MVP — ver principio de construcción prioritaria)*
15. Editor de corrección en prueba (inline, no pantalla separada)
16. Activación
17. Dashboard primera vez (post-activación)

**Operación diaria**
18. Home / Command Center
19. Bandeja de conversaciones (con secciones: necesitan tu atención / atendidas / archivadas)
20. Vista de conversación individual con hilo de mensajes
21. Componente de modo colaborador — aprobar / editar / rechazar (dentro de la vista de conversación)
22. Vista de escalamiento urgente (estado especial de la conversación, no pantalla separada)
23. Estado del agente — mapa de competencias por tema
24. Lo que sabe tu agente — vista de conocimiento actual por capa
25. Instrucción rápida (componente del home, no pantalla separada)
26. Ajustes básicos (perfil del negocio, WhatsApp conectado, notificaciones, plan)
27. Soporte / ayuda contextual

**Total pantallas esenciales MVP: 27**
*(Nota: varios "componentes" del listado viven dentro de otras pantallas, no como vistas independientes. El número real de rutas navegables es menor.)*

---

### Grupo 2 — Pantallas recomendadas para MVP+
*Necesarias para los primeros 20-30 pilotos operando de forma autónoma sin soporte constante del fundador.*

28. Historial de resúmenes diarios / semanales (dentro de la sección Agente)
29. Resumen de impacto — métricas simples en lenguaje humano (dentro de la sección Agente)
30. Autonomía por tema — configuración con indicadores de evidencia (dentro de la sección Agente)
31. Oportunidades de entrenamiento — preguntas repetidas sin respuesta (dentro de Entrenar)
32. Correcciones recientes — historial con clasificación puntual/permanente/temporal (dentro de Entrenar)
33. Aprobación masiva / backlog (variante de la bandeja para volumen alto)
34. Reanudar onboarding incompleto (estado del onboarding en Ajustes)

**Total pantallas MVP+: 7 adicionales**

---

### Grupo 3 — Pantallas futuras
*No construir hasta que la Fase 2 demuestre retención y unit economics.*

35. Gestión de equipo / usuarios adicionales
36. Calendario y agendamiento integrado
37. Links de pago
38. Plantillas avanzadas editables por industria
39. Canales adicionales (Instagram DM, webchat)
40. Voz
41. API / integraciones externas

**Total pantallas futuras: 7**

---

## Objetos de interfaz principales

Estos son los objetos primarios del sistema. Deben tener representación visual consistente en toda la app. Si estos objetos no se definen antes del diseño UI, las pantallas se sienten como vistas aisladas en lugar de un sistema coherente.

| Objeto | Descripción | Aparece en |
|---|---|---|
| **Conversación** | El hilo completo de mensajes entre un cliente y el negocio. Tiene estado, prioridad, etiquetas y acciones. | Bandeja, Home, Vista de conversación |
| **Mensaje** | Unidad individual dentro de una conversación. Tiene origen (cliente / agente / dueño), estado de entrega, y tipo (texto, audio, imagen, sistema). | Vista de conversación |
| **Sugerencia** | Respuesta propuesta por el agente, pendiente de aprobación del dueño. Tiene nivel de confianza, intención detectada y tres acciones posibles. | Vista de conversación, Home, Bandeja |
| **Escalamiento** | Evento en que el agente detecta que no puede o no debe responder solo. Tiene nivel (informativo / sensible / urgente), contexto y opciones de acción. | Bandeja, Home, Vista de conversación |
| **Tema** | Categoría de conocimiento del agente (horarios, precios, servicios, etc.). Tiene nivel de cobertura, nivel de autonomía y estadísticas de desempeño. | Estado del agente, Autonomía, Instrucción rápida |
| **Competencia del agente** | La evaluación del dominio del agente en un tema específico. Representada con indicador verde / amarillo / rojo. | Estado del agente, Home |
| **Dato del negocio** | Unidad de información del negocio almacenada en una de las cuatro capas del modelo de conocimiento. | Lo que sabe tu agente, Instrucción rápida |
| **Corrección** | Modificación hecha por el dueño a una sugerencia del agente. Tiene clasificación (puntual / permanente / temporal) y genera entrada en el historial de aprendizaje. | Vista de conversación, Correcciones recientes |
| **Instrucción** | Dato o regla nueva enviada por el dueño al agente a través del componente de instrucción rápida. Tiene confirmación del agente y clasificación de vigencia. | Home, Instrucciones recientes |
| **Regla de autonomía** | Configuración por tema que define si el agente sugiere, actúa con guardrails o actúa libremente. Tiene indicadores de evidencia para activación. | Autonomía por tema, Estado del agente |

---

## Jerarquía funcional del producto en una frase

> Primero operar, luego confiar, luego entrenar, luego configurar.

Esto significa: la app abre en el Home o en Conversaciones según si hay pendientes. "Agente" sirve para entender qué tan listo está. "Entrenar" sirve para mejorarlo. "Ajustes" queda atrás. Si esta jerarquía se invierte en cualquier decisión de diseño, el producto pierde alma.

---

## Alineación con el roadmap por fases

| Fase | Pantallas incluidas |
|---|---|
| **Fase 1 — MVP y pilotos** | Todas las del Grupo 1 (pantallas esenciales) |
| **Fase 2 — Producto y crecimiento** | Grupo 1 + Grupo 2 (pantallas MVP+) |
| **Fase 3 — Escala y expansión** | Grupo 1 + 2 + pantallas 35-37 del Grupo 3 |
| **Fase 4 — Plataforma** | Completo incluyendo pantallas 38-41 del Grupo 3 |

---

*AGENTI — Entregable 3B v1.0 — Inventario de pantallas priorizado + objetos de interfaz*
