// Zentrale, defensiv geladene Capacitor-Integration.
// Auf dem Web (Browser-Dev) passiert nichts – alle Aufrufe sind no-ops.
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

export async function initNative() {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });      // helle Leiste, dunkle Icons
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#f8f9fa' });
    }
  } catch {}
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {}
}

// Android Hardware-Back-Button: zurueck navigieren, sonst App schliessen.
export function registerBackButton(navigate, canGoBack) {
  if (!isNative()) return () => {};
  let remove = () => {};
  import('@capacitor/app').then(({ App }) => {
    App.addListener('backButton', () => {
      if (canGoBack()) navigate(-1);
      else App.exitApp();
    }).then((h) => { remove = () => h.remove(); });
  }).catch(() => {});
  return () => remove();
}
