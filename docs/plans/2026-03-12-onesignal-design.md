# Diseño Técnico: Infraestructura de Notificaciones (OneSignal)

**Fecha**: 2026-03-12
**Estado**: Finalizado
**Bloque**: 4.2 / 4.3

## 🎯 Objetivo
Implementar un sistema de notificaciones push robusto y escalable para AGENTI utilizando OneSignal. Esto permitirá alertar a los dueños de negocios sobre escalaciones urgentes de forma inmediata, incluso si no tienen el dashboard abierto.

## 🏗️ Arquitectura

### 1. Frontend (Next.js 15 + React 19)
- **SDK**: Utilizaremos `react-onesignal` para inicializar el servicio en el cliente.
- **Service Worker**: Se requiere un archivo `OneSignalSDKWorker.js` en la carpeta `public/`.
- **Flujo de Usuario**:
  1. Al iniciar sesión exitosamente, se inicializa OneSignal.
  2. Se solicita permiso de notificaciones (si no ha sido otorgado).
  3. Se captura el `onesignal_id` (Player ID) único del dispositivo/navegador.
  4. Se envía este ID a la base de Datos de Supabase para asociarlo con el `owner_id`.

### 2. Base de Datos (Supabase/Postgres)
- **Cambio en Esquema**: Agregar columna `onesignal_id` (text) a la tabla `public.owners`.
- **Update Logic**: Un endpoint o función RPC para actualizar el `onesignal_id` desde el frontend.

### 3. Backend (Supabase Edge Functions / Deno)
- **Función `send-notification`**:
  - Orquestador centralizado.
  - Recibe: `owner_id`, `title`, `body`, `action_url`.
  - Proceso:
    1. Busca el `onesignal_id` del dueño en la DB.
    2. Realiza un POST a `https://onesignal.com/api/v1/notifications` con el API Key de OneSignal.
    3. Registra el evento en la tabla `public.notifications` como `sent` o `failed`.

## 🛠️ Requerimientos para el Usuario (TÚ)
Para completar la integración, necesito que realices los siguientes pasos en el panel de OneSignal:

1.  **Crear Cuenta**: Regístrate en [onesignal.com](https://onesignal.com).
2.  **Crear Web App**:
    - Selecciona "Web Push".
    - Configura tu sitio (URL de desarrollo: `http://agenti-setup.localhost:3001`).
    - Elige "Custom Code" como método de integración.
3.  **Configurar IDs**: Proporcióname (o configura en Supabase Vault) lo siguiente:
    - **OneSignal App ID**
    - **REST API Key** (¡Cuidado! No la pegues en el chat, ponla en Supabase Secrets o dámela para guardarla vía MCP).

## ✅ Próximos Pasos (Tras aprobación)
1. Ejecutar migración SQL para `owners.onesignal_id`.
2. Instalar `react-onesignal` en el frontend.
3. Configurar variables de entorno.
