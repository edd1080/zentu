# AGENTI — WhatsApp Integration Specs v1.0
## Meta Cloud API + Embedded Signup

**Versión:** 1.0
**Tipo:** System Execution Doc — referencia obligatoria para todo lo relacionado con la integración de WhatsApp: onboarding del canal, recepción de mensajes, envío de mensajes, manejo de webhooks y estados de conexión.
**Stack:** Meta Cloud API (Graph API v21.0+), Supabase Edge Functions, Next.js frontend.

---

## Arquitectura general de la integración

```
Cliente WhatsApp
       ↓ mensaje entrante
Meta Cloud API
       ↓ webhook POST
Supabase Edge Function: whatsapp-webhook
       ↓ verificación de firma + encolado asíncrono
       ↓ responde 200 inmediatamente a Meta
Supabase Edge Function: process-message (invocada async)
       ↓ motor del agente
       ↓ genera Suggestion o Escalation
       ↓ si modo autónomo activo: envío inmediato
Meta Cloud API ← POST mensajes salientes
       ↓
Cliente WhatsApp
```

---

## Parte 1 — Setup de la Meta Developer App

### 1.1 Configuración de la app en Meta for Developers

La app de Meta debe estar configurada como Business App con los siguientes productos habilitados:
- WhatsApp Business Platform
- Facebook Login (para el flujo de Embedded Signup)

**Permisos necesarios para la app (solicitar en App Review):**
- `whatsapp_business_management` — para gestionar WABA y números
- `whatsapp_business_messaging` — para enviar y recibir mensajes
- `business_management` — para acceder al Business Manager del usuario

**Scopes para Embedded Signup:**
```
whatsapp_business_management,
whatsapp_business_messaging,
business_management
```

**Configuración del webhook en la app:**
- URL: `https://[proyecto].supabase.co/functions/v1/whatsapp-webhook`
- Verify Token: string secreto almacenado en `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (variable de entorno)
- Campos suscritos: `messages`, `message_status` (para delivery receipts)

### 1.2 Variables de entorno requeridas

```
WHATSAPP_APP_ID=[Meta App ID]
WHATSAPP_APP_SECRET=[Meta App Secret — nunca exponer en frontend]
WHATSAPP_WEBHOOK_VERIFY_TOKEN=[string secreto para verificación del webhook]
WHATSAPP_GRAPH_API_VERSION=v21.0
WHATSAPP_GRAPH_API_BASE=https://graph.facebook.com/v21.0
```

---

## Parte 2 — Embedded Signup: flujo de conexión del negocio

### 2.1 Flujo completo desde la perspectiva del dueño

El dueño está en el paso M1.5 del onboarding (o en M4.4 si reconecta después). Toca "Conectar mi WhatsApp Business." Lo que ocurre:

**Paso 1 — Frontend abre el popup de Meta:**
El botón dispara `window.open()` con la URL de autorización de Meta. El popup tiene dimensiones fijas (600x800px) para que no parezca una redirección completa.

La URL de autorización tiene esta estructura:
```
https://www.facebook.com/dialog/oauth
  ?client_id=[WHATSAPP_APP_ID]
  &display=popup
  &response_type=code
  &scope=whatsapp_business_management,whatsapp_business_messaging,business_management
  &redirect_uri=[AGENTI_REDIRECT_URI]
  &state=[state_token]
  &extras={"setup":{"solutionID":"[solution_id_si_aplica]"}}
```

El `state_token` es un string aleatorio generado en el momento de abrir el popup. Se almacena temporalmente en el frontend para verificarlo cuando Meta redirecciona de vuelta.

**Paso 2 — Usuario completa el flujo de Meta:**
El usuario se autentica con su cuenta de Facebook/Meta, selecciona o crea su WhatsApp Business Account (WABA), y selecciona o registra el número de teléfono del negocio.

**Paso 3 — Meta redirecciona al redirect_uri con un code:**
```
https://[agenti-app]/whatsapp-callback
  ?code=[authorization_code]
  &state=[state_token]
```

**Paso 4 — Frontend verifica el state y llama al backend:**
El frontend verifica que el `state` recibido coincide con el generado. Luego hace POST a una Edge Function con el `code`.

**Paso 5 — Backend intercambia el code por token:**
```
POST https://graph.facebook.com/v21.0/oauth/access_token
  ?client_id=[APP_ID]
  &client_secret=[APP_SECRET]
  &code=[code]
  &redirect_uri=[REDIRECT_URI]
```

Respuesta de Meta:
```json
{
  "access_token": "EAAx...",
  "token_type": "bearer"
}
```

**Paso 6 — Backend obtiene el WABA y el phone_number_id:**
```
GET https://graph.facebook.com/v21.0/me/whatsapp_business_accounts
  ?access_token=[access_token]
  &fields=id,name,phone_numbers
```

Del resultado se extrae el `waba_id` y el `phone_number_id` del número que el usuario conectó.

**Paso 7 — Backend registra el número en la Cloud API:**
Si el número no está registrado aún en la Cloud API:
```
POST https://graph.facebook.com/v21.0/[phone_number_id]/register
  {
    "messaging_product": "whatsapp",
    "pin": "000000"
  }
```

**Paso 8 — Backend suscribe el WABA al webhook de AGENTI:**
```
POST https://graph.facebook.com/v21.0/[waba_id]/subscribed_apps
  ?access_token=[access_token]
```

**Paso 9 — Backend persiste en Business:**
Actualizar `Business` con:
- `whatsapp_phone_number_id`
- `whatsapp_waba_id`
- `whatsapp_access_token` (encriptado con `SUPABASE_VAULT` o equivalente)
- `whatsapp_status = connected`

**Paso 10 — Backend envía mensaje de verificación:**
Enviar un mensaje de texto simple al número personal del dueño (no al número del negocio) confirmando que la conexión fue exitosa. Esto también verifica que el sistema puede enviar mensajes.

### 2.2 Manejo de coexistencia con WhatsApp Business App

Cuando un número ya está siendo usado con la app de WhatsApp Business, Meta lo indica en el proceso de Embedded Signup. El backend debe detectar esta condición mirando el campo `code_verification_status` o el error específico de Meta.

Si se detecta coexistencia, antes de completar el registro:
1. Mostrar al dueño (en frontend) el mensaje de coexistencia en lenguaje simple
2. El dueño confirma que entiende las implicaciones
3. Continuar con el registro normalmente — Meta soporta coexistencia

El dueño podrá seguir usando la app de WhatsApp Business para ver mensajes, pero el envío de respuestas debe pasar por AGENTI para mantener consistencia.

### 2.3 Estados de error en Embedded Signup y su manejo

**Error: usuario canceló el popup de Meta:**
El popup se cierra sin redirección. El frontend detecta que el popup se cerró (con `window.closed` polling) y muestra el estado de "conexión cancelada" con opción de reintentar.

**Error: el número ya está registrado en otra WABA:**
Meta devuelve error específico. AGENTI muestra: "Este número ya está conectado a otro sistema. Si quieres usarlo con AGENTI, necesitas desconectarlo primero." Con enlace a soporte.

**Error: el business manager del usuario no tiene permisos suficientes:**
Meta devuelve error de permisos. AGENTI muestra: "Tu cuenta de Meta no tiene los permisos necesarios. Pide al administrador de tu empresa en Meta que te dé acceso." Con enlace a documentación de ayuda.

**Error: timeout del servidor al intercambiar el code:**
El `code` de autorización de Meta expira en 10 minutos. Si el intercambio falla por timeout, el dueño debe iniciar el flujo de nuevo. AGENTI muestra: "Algo salió mal durante la conexión. Inténtalo de nuevo."

---

## Parte 3 — Webhook: recepción de mensajes entrantes

### 3.1 Edge Function: whatsapp-webhook

Esta función tiene DOS responsabilidades y las dos son críticas:

**Responsabilidad 1 — Verificación del webhook (GET):**
Meta verifica el webhook enviando una petición GET con tres parámetros:
```
?hub.mode=subscribe
&hub.verify_token=[WHATSAPP_WEBHOOK_VERIFY_TOKEN]
&hub.challenge=[string_aleatorio]
```
La función debe verificar que `hub.verify_token` coincide con el almacenado en variables de entorno y responder con el valor de `hub.challenge` como texto plano. Sin esta verificación, el webhook no funciona.

**Responsabilidad 2 — Recepción de mensajes (POST):**
Cuando llega un mensaje:
1. Verificar la firma `X-Hub-Signature-256` usando el `APP_SECRET`
2. Responder con HTTP 200 **inmediatamente** — antes de hacer cualquier procesamiento
3. Invocar asincrónicamente la función `process-message` con el payload del webhook
4. Si la invocación asíncrona falla: guardar el payload en una tabla `webhook_queue` para reintento

**Por qué responder 200 antes de procesar:** Meta espera respuesta en menos de 5 segundos. Si no recibe 200, reintenta el webhook y puede desactivarlo si hay muchos fallos. El procesamiento real puede tardar hasta 10-15 segundos (LLM incluido) sin problema si ya devolvimos 200.

### 3.2 Verificación de firma

```javascript
// El header llega como: sha256=abc123...
const signature = request.headers.get('X-Hub-Signature-256');
const expectedSignature = 'sha256=' + hmacSha256(APP_SECRET, rawBody);

if (signature !== expectedSignature) {
  return new Response('Forbidden', { status: 403 });
}
```

Todo request que no pase verificación de firma se rechaza con 403 y se loguea.

### 3.3 Estructura del payload de Meta (mensaje entrante)

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "[waba_id]",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "502XXXXXXXX",
          "phone_number_id": "[phone_number_id]"
        },
        "contacts": [{
          "profile": { "name": "Nombre del Cliente" },
          "wa_id": "502XXXXXXXXX"
        }],
        "messages": [{
          "from": "502XXXXXXXXX",
          "id": "wamid.XXXXX",
          "timestamp": "1234567890",
          "type": "text",
          "text": { "body": "¿A qué hora abren?" }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### 3.4 Edge Function: process-message

Esta función recibe el payload del webhook y ejecuta la lógica completa de procesamiento:

1. Extraer `phone_number_id` del metadata para identificar el Business
2. Buscar el Business por `whatsapp_phone_number_id`
3. Si no se encuentra el Business: loguear el evento y no procesar (puede ser un número de prueba)
4. Extraer datos del mensaje: `from` (cliente), `id` (whatsapp_message_id), `type`, contenido
5. Buscar o crear la Conversation para ese cliente
6. Crear el Message con `direction = inbound`, `sender_type = client`
7. Si el tipo de mensaje no es `text`: disparar escalamiento informativo, terminar
8. Si el mensaje pasa los filtros determinísticos: llamar al motor del agente
9. Crear Suggestion o Escalation según el resultado del motor
10. Crear y enviar Notifications según las reglas del sistema
11. Registrar todo en `system_logs` con el `trace_id`

---

## Parte 4 — Envío de mensajes salientes

### 4.1 Endpoint de envío

```
POST https://graph.facebook.com/v21.0/[phone_number_id]/messages
Authorization: Bearer [access_token]
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "[numero_cliente]",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "Texto del mensaje aquí"
  }
}
```

### 4.2 Respuesta de Meta al envío exitoso

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "502XXXXXXXX", "wa_id": "502XXXXXXXX" }],
  "messages": [{ "id": "wamid.XXXXX" }]
}
```

El `id` devuelto es el `whatsapp_message_id` del mensaje enviado. Se almacena en el registro de `Message` correspondiente.

### 4.3 Función de envío con manejo de errores

El envío de mensajes es una operación crítica. La función que lo ejecuta debe:

1. Intentar el envío con el token del negocio
2. Si recibe error 401 (token inválido): marcar `Business.whatsapp_status = error`, disparar evento `whatsapp_disconnected`, no reintentar
3. Si recibe error 429 (rate limit): esperar 1 segundo y reintentar una vez. Si falla de nuevo: encolar para reintento en 5 minutos
4. Si recibe error 500 de Meta: reintentar después de 3 segundos, máximo 2 reintentos
5. Si todos los reintentos fallan: registrar en logs, notificar al dueño que el mensaje no se pudo enviar
6. Siempre actualizar el `Message.status` según el resultado

### 4.4 Ventana de mensajería de Meta

Meta tiene dos tipos de conversaciones con restricciones distintas:

**Conversación de servicio (customer-initiated):** el cliente escribió primero. AGENTI puede responder libremente con cualquier tipo de mensaje durante 24 horas desde el último mensaje del cliente. El 99% de los casos de AGENTI son de este tipo.

**Conversación de marketing/utilidad (business-initiated):** el negocio inicia el contacto. Requiere usar Message Templates aprobados por Meta. AGENTI en el MVP no inicia conversaciones, solo responde, por lo que este caso es irrelevante excepto para el mensaje de resumen de WhatsApp al dueño.

**Implicación para los mensajes de resumen diario y notificaciones urgentes al dueño:**
Los WhatsApps al número personal del dueño (resúmenes, notificaciones urgentes) son mensajes que AGENTI inicia. Deben usar Message Templates aprobados por Meta. Hay que crear y aprobar al menos dos templates en Meta Business Manager:
- Template de resumen diario
- Template de notificación urgente

Alternativamente, para el MVP, si el número del dueño fue verificado y le envió un primer mensaje desde ese número, hay una ventana de 24 horas. El mensaje de verificación inicial durante el onboarding abre esa ventana para el primer resumen.

---

## Parte 5 — Estados de conexión y reconexión

### 5.1 Detección de desconexión

El sistema detecta desconexión del canal por dos vías:

**Vía activa:** cada vez que se intenta enviar un mensaje y Meta devuelve error 401 o error de token inválido.

**Vía pasiva:** un job programado (cron en Supabase) verifica cada 6 horas si `Business.whatsapp_status = connected` para todos los negocios activos, haciendo una llamada GET a la API de Meta para verificar que el token sigue válido:
```
GET https://graph.facebook.com/v21.0/[phone_number_id]
  ?access_token=[token]
  &fields=display_phone_number,verified_name
```
Si la respuesta es error 401: marcar como desconectado.

### 5.2 Flujo de reconexión

Cuando `Business.whatsapp_status = error` o `expired`:
1. El dueño ve el indicador rojo en el home y en M4.4
2. El dueño toca "Reconectar"
3. Se abre el mismo flujo de Embedded Signup pero con el número ya pre-seleccionado si está disponible
4. Al completar exitosamente: `whatsapp_status = connected` y el agente retoma operación

### 5.3 Mensajes pendientes durante desconexión

Si llegaron mensajes de clientes mientras el canal estaba desconectado (lo cual no debería pasar porque Meta tampoco entregaría mensajes si el webhook no responde, pero puede ocurrir en edge cases):
- Los mensajes se procesan en orden cronológico cuando el canal se reconecta
- Si hay más de 10 mensajes acumulados: activar flujo de backlog masivo
- No enviar respuestas de agente a mensajes que tienen más de 4 horas de antigüedad sin revisión del dueño

---

## Parte 6 — Consideraciones de seguridad

### 6.1 Almacenamiento de tokens

Los `whatsapp_access_token` son credenciales de alta sensibilidad. Se almacenan encriptados usando Supabase Vault o `pgcrypto` con una clave de encriptación almacenada en variables de entorno, nunca en la base de datos.

Para leer el token en una Edge Function:
```sql
SELECT pgp_sym_decrypt(whatsapp_access_token::bytea, current_setting('app.encryption_key')) 
FROM businesses WHERE id = [business_id];
```

### 6.2 Nunca exponer credenciales de Meta al frontend

El `APP_SECRET`, los tokens de acceso de los negocios, y el `WEBHOOK_VERIFY_TOKEN` nunca viajan al frontend. Todas las operaciones que requieren estas credenciales ocurren en Edge Functions.

### 6.3 Validación del número del cliente

El campo `from` en el webhook de Meta ya viene validado como número de WhatsApp real. Sin embargo, se debe validar que el formato sea E.164 (ej: `502XXXXXXXX`) antes de persistir.

### 6.4 Prevención de replay attacks en webhooks

Verificar la firma de cada webhook es suficiente para prevenir mensajes falsos. Adicionalmente, si el mismo `wamid` (whatsapp_message_id) llega dos veces (Meta puede reenviar webhooks si no recibe confirmación), el sistema debe detectar la duplicación verificando que no existe ya un Message con ese `whatsapp_message_id` antes de procesar.

---

*AGENTI — WhatsApp Integration Specs v1.0*
