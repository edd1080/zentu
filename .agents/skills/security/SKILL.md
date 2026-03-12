---
name: security
description: >
  Reglas de seguridad del proyecto AGENTI. Cargar cuando se trabaje con:
  autenticación, tokens de WhatsApp, webhook de Meta, RLS, encriptación,
  manejo de secretos, o cualquier flujo que toque datos sensibles de negocios.
---

# Security — AGENTI

## Tokens de WhatsApp

- Access tokens encriptados con AES-256-GCM antes de persistir en la base de datos.
- Nunca en logs, nunca en texto plano, nunca en el cliente.
- Almacenados con `business_id` como scope — un token no puede usarse para otro negocio.
- La desencriptación ocurre solo en Edge Functions, justo antes de usarse.
- Rotación soportada: el sistema puede actualizar tokens sin interrumpir la operación.

## Webhook de Meta

Validación obligatoria en este orden antes de cualquier procesamiento:

1. Verificar header `X-Hub-Signature-256` con HMAC-SHA256 usando `WHATSAPP_APP_SECRET`.
2. Si la firma es inválida → retornar 403, no procesar, loggear intento.
3. Verificar que `phone_number_id` pertenece a un negocio registrado en el sistema.
4. Si no pertenece → retornar 200 (no revelar información), no procesar.
5. Verificar que el `whatsapp_message_id` no fue procesado antes (deduplicación).
6. Si es duplicado → retornar 200, no procesar.

Replay protection: almacenar `whatsapp_message_id` en `webhook_queue` y verificar antes de encolar.

## Row Level Security

- RLS activo en toda tabla que contenga datos de negocio.
- El RLS es la primera barrera. El filtro `business_id` en el query es la segunda barrera. Ambos son obligatorios.
- Nunca desactivar RLS aunque el acceso sea desde Edge Function con service role key.
- Verificar que cada nueva tabla tiene su política RLS antes de considerar la migración completa.

## Secretos y variables de entorno

- `SUPABASE_SERVICE_ROLE_KEY` solo en Edge Functions y scripts server-side.
- `WHATSAPP_APP_SECRET` solo en Edge Functions para validar webhooks.
- Variables `NEXT_PUBLIC_*` solo para datos no sensibles (Supabase URL, anon key).
- Ningún secreto en el cliente, en los logs, ni en errores enviados al frontend.
- `.env.local` en `.gitignore`. `.env.example` con todas las variables pero sin valores reales.

## Aislamiento multi-tenant

Todo query que toque datos de negocio debe incluir el filtro correspondiente:

```typescript
// Correcto
const { data } = await supabase
  .from('conversations')
  .select('id, status, phone_client')
  .eq('business_id', businessId)

// Incorrecto — nunca omitir el filtro
const { data } = await supabase
  .from('conversations')
  .select('*')
```

## Audit log obligatorio

Registrar en `system_logs` los siguientes eventos:
- Conexión exitosa de WhatsApp (Embedded Signup completo)
- Fallo en Embedded Signup con razón
- Intercambio de code por token
- Refresco de token
- Desconexión de canal
- Fallos de validación de webhook (firma inválida, phone_number_id desconocido)
- Cualquier intento de acceso con business_id que no corresponde al owner autenticado

## Comportamientos prohibidos

- Configuración manual del webhook (solo Embedded Signup o script de setup autorizado).
- Almacenamiento de tokens en localStorage, sessionStorage o cookies del cliente.
- Secrets hardcoded en el código fuente.
- Tokens compartidos entre negocios (cada Business tiene su propio token).
- Logs de mensajes de clientes sin proceso de anonimización (en MVP, loggear solo metadata — conversation_id, timestamp, tipo — no contenido del mensaje).
