// global.d.ts
interface AppDelegateInterface {
    registerForPushNotifications: (args?: unknown) => void;
    sendPendingTokenIfNeeded: () => void;
  }
  
  interface CapacitorInterface {
    isNativePlatform: () => boolean;
  }
  
  interface Window {
    Capacitor?: CapacitorInterface;
    AppDelegate?: AppDelegateInterface;
  }
  