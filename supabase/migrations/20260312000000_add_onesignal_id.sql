-- Migración: Agregar soporte para OneSignal ID en dueños
-- Descripción: Permite asociar un dispositivo de OneSignal a un dueño de negocio.

ALTER TABLE public.owners 
ADD COLUMN IF NOT EXISTS onesignal_id TEXT;

COMMENT ON COLUMN public.owners.onesignal_id IS 'ID único de OneSignal (Player ID) para envío de notificaciones push.';
