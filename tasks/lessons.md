# Lessons Learned

## 2026-03-12 - Workflow / Planning

**Mistake**: Proceder con la implementación de una extensión solicitada en chat (notificaciones de actividad) sin presentar un plan formal y obtener aprobación previa.
**Pattern**: Saltarse el protocolo de planeación (`/planning-protocol`) bajo la presión de completar la sesión o ante solicitudes que parecen "pequeñas".
**Rule**: SIEMPRE presentar un `implementation_plan.md` y obtener aprobación explícita antes de tocar CUALQUIER código, independientemente de la aparente simplicidad del cambio.
**Applied**: Todos los flujos de trabajo, especialmente al expandir scopes ya cerrados.

---

## 2026-03-13 - Testing / Tooling

**Mistake**: Indicar al usuario que el desarrollo de Edge Functions estaba listo sin haberlas desplegado realmente al proyecto de Supabase ni verificado su correcto acceso.
**Pattern**: Asumir que el guardado local del archivo equivale a funcionalidad en el entorno de ejecución, saltándose el paso de verificación de conectividad ("reachability").
**Rule**: NUNCA marcar una integración frontend-backend como completa sin evidencia técnica de éxito (curl, logs o status HTTP 200) desde el contexto de ejecución. El despliegue de Edge Functions debe verificarse con `supabase functions list` o invocaciones de prueba.
**Applied**: Desarrollo de Edge Functions, integraciones de API y cualquier cambio que afecte la comunicación cliente-servidor.
