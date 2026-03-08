# AGENTI — Requisitos del MVP

Fuente: PRD v1.0, sección 4.
- **v1** = MVP (lo que construimos ahora)
- **v2** = Post-piloto (lo que viene después)

---

## Onboarding (Mundo 1)

- [v1] Registro con email + contraseña
- [v1] Google OAuth como alternativa de registro
- [v1] Verificación de número personal por WhatsApp con código de 6 dígitos
- [v1] Selección de industria con preview de plantilla (6 industrias)
- [v1] Captura de conocimiento inicial por texto libre
- [v1] Captura de conocimiento por nota de voz con transcripción
- [v1] Captura de conocimiento por imagen OCR (menú/lista de precios)
- [v1] Captura de conocimiento por link de sitio web
- [v1] Configuración de reglas de escalamiento iniciales con toggles por industria
- [v1] Conexión de WhatsApp Business vía Meta Embedded Signup
- [v1] Soporte de coexistencia con WhatsApp Business App
- [v1] Omisión de conexión con sandbox como alternativa
- [v1] Prueba del agente en sandbox con chat real y correcciones persistentes
- [v1] Activación del agente
- [v2] Registro por número de teléfono sin email
- [v2] Onboarding por video o llamada asistida
- [v2] Importación de datos desde CRM, hojas de cálculo u otros sistemas
- [v2] Configuración de múltiples agentes en el mismo onboarding
- [v2] Selección de idioma distinto al español

## Operación diaria (Mundo 2)

- [v1] Home con estado del agente, instrucción rápida y bandeja resumida
- [v1] Bandeja de conversaciones con tres secciones: necesitan atención, atendidas, archivadas
- [v1] Vista de conversación individual con hilo de mensajes completo
- [v1] Modo colaborador: aprobar, editar, rechazar sugerencias del agente
- [v1] Clasificación de correcciones: permanente, temporal con fecha, solo esta vez
- [v1] Escalamiento en tres niveles: informativo, sensible, urgente
- [v1] Mensaje de contención automático para escalamientos sensibles y urgentes
- [v1] Escalamiento urgente con notificación WhatsApp al dueño si no responde en 5 min
- [v1] Respuesta de espera automática cuando Suggestion lleva > 30 min sin resolución
- [v2] Responder múltiples conversaciones en batch desde la bandeja
- [v2] Asignar conversaciones a otros miembros del equipo
- [v2] Etiquetas o categorías manuales de conversaciones
- [v2] Búsqueda de conversaciones por contenido
- [v2] Exportar historial de conversaciones
- [v2] Vista de perfil del cliente con historial completo unificado

## Entrenamiento (Mundo 3)

- [v1] Instrucción rápida desde el home: texto, nota de voz, imagen OCR, link
- [v1] Confirmación del agente con validación del dueño antes de persistir
- [v1] Clasificación de vigencia: permanente, temporal, una sola vez
- [v1] Mapa de competencias por tema con indicador de tres estados (verde/amarillo/rojo)
- [v1] Historial de aprendizaje con opción de revertir cualquier entrada
- [v1] Oportunidades de entrenamiento: temas donde el agente no pudo responder bien
- [v2] Subida de documentos PDF o Word para alimentar el agente
- [v2] Entrenamiento por conversación: marcar hilo completo como fuente de conocimiento
- [v2] Generación automática de FAQ desde el historial
- [v2] Editor visual de conocimiento por capa (KnowledgeItems como lista editable)

## Configuración (Mundo 4)

- [v1] Perfil del negocio editable (mismos campos del onboarding, siempre accesibles)
- [v1] Reglas de escalamiento avanzadas con estadísticas de frecuencia por tema
- [v1] Nivel de autonomía por tema (Nivel 0 colaborador, Nivel 1 autónomo con guardrails)
- [v1] Estado y reconexión del canal de WhatsApp
- [v1] Configuración de notificaciones push y resumen diario por WhatsApp
- [v1] Datos de cuenta del dueño y plan activo
- [v2] Nivel 2 de autonomía (autónomo amplio)
- [v2] Horarios de atención configurables con fuera de horario automático
- [v2] Múltiples números de WhatsApp por negocio
- [v2] Gestión de facturación y cambio de plan dentro del producto
- [v2] Configuración de plantillas de mensajes de Meta
- [v2] Control parental o permisos por usuario

## Inteligencia (Mundo 5)

- [v1] Resumen semanal de actividad en lenguaje humano
- [v1] Resumen de primera semana con análisis de temas fuertes y débiles
- [v1] Lista de oportunidades de entrenamiento agrupadas por tema
- [v2] Dashboard con gráficas de tendencias históricas
- [v2] Comparativa con promedios de la industria
- [v2] Exportación de reportes
- [v2] Análisis de sentimiento de los clientes
- [v2] Predicciones o recomendaciones basadas en ML propio

## Notificaciones

- [v1] Push para Suggestions pendientes (agrupadas en ventanas de 15 min, máximo 8/día)
- [v1] Push inmediata para escalamientos sensibles
- [v1] Push inmediata para escalamientos urgentes
- [v1] WhatsApp al número personal del dueño para urgencias no atendidas en 5 min
- [v1] WhatsApp diario con resumen de actividad (si hubo actividad)
- [v1] WhatsApp de primera semana a los 7 días de activación
- [v1] Silencio nocturno entre 10 PM y 7 AM (excepto urgencias)
- [v1] In-app para sugerencias de autonomía cuando sistema detecta tema maduro
- [v2] Email transaccional para notificaciones operativas
- [v2] SMS como canal alternativo a WhatsApp
- [v2] Notificaciones configurables por tipo de evento a nivel granular

## Landing page (Mundo 0)

- [v1] Landing page con headline, propuesta de valor, demo interactiva, pricing y captura de registro
- [v1] Demo interactiva que simula el agente sin crear cuenta
- [v1] Pre-carga de industria desde la demo al registro
- [v2] Blog o contenido SEO
- [v2] Página de casos de éxito o testimonios
- [v2] Programa de referidos
- [v2] Integración con herramientas de analytics de marketing

---

## Resumen

| Categoría | v1 (MVP) | v2 (Post-piloto) |
|---|---|---|
| Onboarding | 14 | 5 |
| Operación diaria | 9 | 6 |
| Entrenamiento | 6 | 4 |
| Configuración | 6 | 6 |
| Inteligencia | 3 | 5 |
| Notificaciones | 8 | 3 |
| Landing page | 3 | 4 |
| **Total** | **49** | **33** |
