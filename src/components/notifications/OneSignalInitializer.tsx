'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { createClient } from '@/lib/supabase/client';

export default function OneSignalInitializer() {
  const supabase = createClient();

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: '5e7e7011-6594-4786-a0e9-cfccc5d2fde7',
          safari_web_id: 'web.onesignal.auto.246fdfe2-a404-4480-aa8a-d2b211d431d5',
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
            displayPredicate: () => true,
            prenotify: true,
            showCredit: false,
            position: 'bottom-right',
            size: 'medium',
            text: {
              'tip.state.unsubscribed': 'Suscríbete a las notificaciones',
              'tip.state.subscribed': 'Estás suscrito',
              'tip.state.blocked': 'Has bloqueado las notificaciones',
              'message.prenotify': 'Haz clic para recibir notificaciones importantes',
              'message.action.subscribed': '¡Gracias por suscribirte!',
              'message.action.resubscribed': 'Estás suscrito de nuevo',
              'message.action.unsubscribed': 'Ya no recibirás notificaciones',
              'dialog.main.title': 'Gestionar notificaciones',
              'dialog.main.button.subscribe': 'SUSCRIBIRSE',
              'dialog.main.button.unsubscribe': 'DESUSCRIBIRSE',
              'dialog.blocked.title': 'Desbloquear notificaciones',
              'dialog.blocked.message': 'Sigue estas instrucciones para permitir las notificaciones:',
              'tip.state.unsubscribed.with.email': 'Suscríbete con tu email',
              'tip.state.unsubscribed.with.email.and.sms': 'Suscríbete con email y SMS',
              'tip.state.unsubscribed.with.sms': 'Suscríbete con SMS'
            }
          },
        });

        // Al suscribirse, guardar el ID en la base de datos
        OneSignal.Notifications.addEventListener('permissionChange', async (permission) => {
          if (permission) {
            // @ts-ignore - OneSignal v16 API
            const subscriptionId = OneSignal.User.PushSubscription.id;
            if (subscriptionId) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // @ts-ignore - typed later
                await supabase
                  .from('owners')
                  .update({ onesignal_id: subscriptionId })
                  .eq('id', user.id);
                console.log('OneSignal ID actualizado en DB:', subscriptionId);
              }
            }
          }
        });

        // Intentar capturar el ID si ya tiene permiso
        if (OneSignal.Notifications.permission) {
           // @ts-ignore - OneSignal v16 API
           const subscriptionId = OneSignal.User.PushSubscription.id;
           if (subscriptionId) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // @ts-ignore - typed later
                await supabase
                  .from('owners')
                  .update({ onesignal_id: subscriptionId })
                  .eq('id', user.id);
                console.log('OneSignal ID ya existente, sincronizado:', subscriptionId);
              }
           }
        }

      } catch (error) {
        console.error('Error inicializando OneSignal:', error);
      }
    };

    initOneSignal();
  }, [supabase]);

  return null;
}
