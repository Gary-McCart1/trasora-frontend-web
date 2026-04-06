export const trackEvent = (
    name: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", name, params);
    }
  };