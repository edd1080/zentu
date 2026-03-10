# Guía Definitiva: Configuración del Webhook de WhatsApp en Meta

## 1. El Concepto Clave: Webhook vs. Embedded Signup

Antes de comenzar, es vital aclarar una duda común: **¿Los clientes (las empresas) tendrán que hacer esta configuración?**

**La respuesta es un rotundo NO.**

La arquitectura funciona de la siguiente manera:
1. **El Webhook es a nivel de Plataforma (App):** Esta configuración que haremos a continuación se hace **UNA SOLA VEZ** por parte del equipo de desarrollo (nosotros). Este Webhook es la puerta de entrada global para TODOS los mensajes de TODAS las empresas que usen AGENTI.
2. **El Embedded Signup es a nivel de Cliente:** Cuando una nueva clínica o cafetería se registra en el Onboarding de AGENTI, ellos usan el **Embedded Signup**. Este proceso es como un "Iniciar Sesión con Google", donde el cliente simplemente autoriza a nuestra App (AGENTI) a acceder a su línea de WhatsApp.
3. **El Enrutamiento Mágico:** Una vez que el cliente completa el Embedded Signup, Meta automáticamente sabe que los mensajes enviados al número de esa empresa deben enviarse a nuestro Webhook global. Nuestra función `process-message` lee el `phone_number_id` que viene en la carga útil (payload) del mensaje y mapea correctamente qué mensaje le pertenece a qué negocio en nuestra base de datos.

Por lo tanto, la fricción técnica para el usuario final es cero. Todo depende de que este Webhook maestro esté bien configurado.

---

## 2. Configurando las Variables de Entorno en Supabase

Para que nuestro Webhook pueda verificar legítimamente que un mensaje viene de Meta (y no de un atacante), necesitamos guardar dos secretos en Supabase.

### Paso 2.1: Obtener el App Secret de Meta
1. Inicia sesión en [Meta for Developers](https://developers.facebook.com/).
2. Ve a **Mis aplicaciones** y selecciona la app de AGENTI.
3. En el menú lateral izquierdo, ve a **Configuración de la app** > **Información básica**.
4. Busca el campo llamado **Clave secreta de la aplicación** (App Secret).
5. Haz clic en el botón "Mostrar" (te pedirá tu contraseña de Facebook).
6. Copia esa clave de 32 caracteres.

### Paso 2.2: Crear el Verify Token
El **Verify Token** no te lo da Meta, es una contraseña que **tú inventas** para que Meta se autentique con tu servidor la primera vez que configuras el Webhook.
- Inventa algo difícil, por ejemplo: `agenti_webhook_secure_2026_xyz`. Guárdalo en un bloc de notas por un momento.

### Paso 2.3: Inyectar Secretos en Supabase
1. Ingresa a tu panel de **[Supabase](https://supabase.com/dashboard/projects)** y selecciona el proyecto `rutzgbwziinixdrryirv` (AGENTI).
2. Ve al ícono de engranaje **Project Settings** (Configuración) en el lado izquierdo.
3. Navega a **Edge Functions**.
4. En la sección de "Edge Function Secrets" o "Environment Variables" haz clic en **Add new secret**.
5. Agrega el primer secreto:
   - **Name:** `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - **Value:** El token que inventaste (ej. `agenti_webhook_secure_2026_xyz`).
6. Agrega el segundo secreto:
   - **Name:** `WHATSAPP_APP_SECRET`
   - **Value:** La Clave secreta de la app que copiaste en el Paso 2.1.
7. Guarda los cambios. (Las Edge Functions leerán estos valores en el próximo inicio).

---

## 3. Configurando el Webhook en el Panel de Meta

Ahora le diremos a Meta a dónde enviar los mensajes.

### Paso 3.1: Enlazar la URL
1. Regresa al panel de tu aplicación en **Meta for Developers**.
2. En el menú lateral izquierdo, despliega la pestaña **WhatsApp** y haz clic en **Configuración** (Setup / Configuration).
3. Busca la sección que dice **Webhooks**.
4. Haz clic en el botón **Editar**.
5. Aparecerá un cuadro de diálogo con dos campos:
   - **URL de devolución de llamada (Callback URL):** Escribe exactamente la ruta a tu Edge Function: 
     `https://rutzgbwziinixdrryirv.supabase.co/functions/v1/whatsapp-webhook`
   - **Token de verificación (Verify Token):** Pega el exacto mismo token que pusiste en Supabase en el paso 2.2 (`agenti_webhook_secure_2026_xyz`).
6. Haz clic en **Verificar y guardar**.

**¿Qué pasa tras bambalinas aquí?** Meta hará una petición GET súper rápida a nuestra URL con ese token. Si nuestro código en Supabase recibe el token, lo compara (y coinciden), responde "OK". El botón de Meta se pondrá verde.

### Paso 3.2: Suscribirse a los Eventos (IMPORTANTE)
Meta no nos envía los mensajes entrantes por defecto aunque la URL esté bien. Tenemos que suscribirnos al evento específico de lectura de mensajes.

1. En esa misma pantalla, verás una tabla llamada "Campos de Webhook" (Webhook Fields).
2. Haz clic en **Administrar** (Manage).
3. Aparecerá una lista larga de eventos disponibles.
4. Busca la fila que se llama explícitamente **`messages`**.
5. Haz clic en el hipervínculo que dice **Suscribirse** (Subscribe) al final de esa fila.
6. Cierra el diálogo. Deberías ver el campo `messages` listado activamente en la página principal.

---

## 4. Testing End-to-End y Expectativas Correctas

Es hora de verificar que la tubería funciona enviando un mensaje real de prueba.

### Pasos de la Prueba:
1. Asegúrate de tener registrado un "Número de WhatsApp de prueba" o el número oficial provisto por Meta en tu panel. (En *WhatsApp > Configuración de la API* lo puedes ver).
2. Manda un mensaje como "¡Hola probando!" desde tu WhatsApp personal hacia ese número de prueba de Meta.
3. Ve a tu panel de Supabase > **Table Editor** > **`webhook_queue`**.
4. Ve también a **Table Editor** > **`messages`**.

### 🟢 Escenario de Éxito (El Resultado Correcto):
Si todo fue perfecto:
- Al abrir `webhook_queue`, deberías ver un nuevo registro cuyo `status` dice **`completed`**.
- Al abrir la tabla `messages`, deberías ver la fila con el texto "¡Hola probando!", ligado a un `conversation_id` y con la dirección `inbound`.

---

## 5. Troubleshooting: Errores Comunes y Códigos

Si algo falla, esto es lo que verás y cómo arreglarlo.

### 🔴 Error 1: Meta dice "Token de verificación no coincide" o "Hub Verify Token failed"
**Qué pasó:** El paso 3.1 falló al darle en "Verificar y guardar".
**Causa probable:** El token que escribiste en la caja de Meta no es exactamente igual (espacios vacíos, mayúsculas) al secreto `WHATSAPP_WEBHOOK_VERIFY_TOKEN` que pusiste en Supabase.
**Solución:** Vuelve a Supabase, elimina el secreto, genéralo de nuevo sin espacios y vuelve a intentar en Meta.

### 🔴 Error 2: Meta guarda la URL bién, pero no llegan los mensajes al enviar WhatsApps
**Qué pasó:** Escribes de tu celular pero la tabla `webhook_queue` en Supabase sigue vacía.
**Causa probable:** Olvidaste el Paso 3.2. No te has suscrito al campo `messages` en el panel de Meta.
**Solución:** Ve a *WhatsApp > Configuración*, haz clic en administrar webhooks y confirma que la casilla al lado de `messages` esté suscrita.

### 🔴 Error 3: El mensaje llega a `webhook_queue` pero el estatus dice `error` (o no llega a la tabla `messages`)
**Qué pasó:** El Webhook funciona y recibe datos, pero nuestra función interna `process-message` explotó.
**Causa probable:** 
- Meta te envió un cambio de estado ("Mensaje Entregado", "Mensaje Leído") que nuestra BD aún no almacena en otra parte. (Esto a veces lo ignoramos a propósito y se marca como completed, pero puede generar alertas).
- ¡El negocio no existe en la BD! El `phone_number_id` al que escribiste en Meta no tiene ninguna entrada emparejada en la tabla `businesses.whatsapp_phone_number_id` en tu Supabase. (Este es el famoso error 404 que depuramos en entorno dev).
**Solución:** Ve a la tabla `businesses` de Supabase y asegúrate de que el registro de la clínica/negocio tenga bien copiado el número de ID de teléfono proporcionado por Meta.

### 🔴 Error 4: Los mensajes no llegan a `webhook_queue` y Meta empieza a enviar correos de "Webhook en mal estado"
**Qué pasó:** Nuestra Edge Function está tardando más de 5 segundos en responder, o peor, los secretos de la firma HMAC no coinciden y la función devuelve 403.
**Causa probable:** El `WHATSAPP_APP_SECRET` que almacenaste en Supabase está mal, o acabas de rotar secretos en Meta. Por lo que la validación criptográfica rechaza todo.
**Solución:** Actualiza el `WHATSAPP_APP_SECRET` en Supabase con el valor vigente de la sección Información Básica de Meta.
