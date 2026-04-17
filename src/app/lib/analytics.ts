export const trackEvent = (
    name: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => {
    if (typeof window === "undefined") return;
  
    if (!window.gtag) {
      console.log("⏳ GA not ready", name, params);
      return;
    }
  
    const eventParams = {
      ...params,
      debug_mode: true, // ✅ ensures DebugView shows web events
    };
  
    console.log("📊 Tracking event:", name, eventParams); // optional but very useful
  
    window.gtag("event", name, eventParams);
  };