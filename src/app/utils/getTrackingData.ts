export const getTrackingData = () => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
    let app = false;
    if (
      typeof window !== "undefined" &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function"
    ) {
      app = window.Capacitor.isNativePlatform();
    }
  
    return {
      platform: app ? "app" : "web",
      device: mobile ? "mobile" : "desktop",
    };
  };