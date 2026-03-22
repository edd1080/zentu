# Lessons Learned

## 2026-03-12 - Workflow / Planning

**Mistake**: Proceder con la implementación de una extensión solicitada en chat (notificaciones de actividad) sin presentar un plan formal y obtener aprobación previa.
**Pattern**: Saltarse el protocolo de planeación (`/planning-protocol`) bajo la presión de completar la sesión o ante solicitudes que parecen "pequeñas".
**Rule**: SIEMPRE presentar un `implementation_plan.md` y obtener aprobación explícita antes de tocar CUALQUIER código, independientemente de la aparente simplicidad del cambio.
**Applied**: Todos los flujos de trabajo, especialmente al expandir scopes ya cerrados.

---

## 2026-03-21 - Performance / Caching

**Observación**: Una app Next.js sin ninguna capa de caché de datos en el cliente se siente lenta incluso si el código es correcto. Cada navegación dispara queries nuevas — el usuario percibe lag.

**Patrón detectado**: Definir hooks de datos localmente en componentes de layout que se montan varias veces crea ráfagas de queries duplicadas silenciosas.

**Regla**: En apps con múltiples componentes en el mismo layout que necesitan los mismos datos → Context Provider + TanStack Query. Datos compartidos = una sola ejecución.

**Sobre TanStack Query vs SWR**: TanStack Query es la elección correcta cuando el proyecto tiene mutations + cache invalidation explícita. `queryClient.invalidateQueries(key)` desde realtime handlers es el patrón limpio para sincronizar datos en tiempo real sin polling manual.

**Applied**: Cualquier dato que se use en más de un componente o que necesite invalidarse tras una mutation.

---

## 2026-03-13 - Testing / Tooling

**Mistake**: Indicar al usuario que el desarrollo de Edge Functions estaba listo sin haberlas desplegado realmente al proyecto de Supabase ni verificado su correcto acceso.
**Pattern**: Asumir que el guardado local del archivo equivale a funcionalidad en el entorno de ejecución, saltándose el paso de verificación de conectividad ("reachability").
**Rule**: NUNCA marcar una integración frontend-backend como completa sin evidencia técnica de éxito (curl, logs o status HTTP 200) desde el contexto de ejecución. El despliegue de Edge Functions debe verificarse con `supabase functions list` o invocaciones de prueba.
**Applied**: Desarrollo de Edge Functions, integraciones de API y cualquier cambio que afecte la comunicación cliente-servidor.
