self.addEventListener("push", (event) => {
    // Fallback in case data isn't JSON
    let data = { title: "Trasora", body: "New activity!", url: "/" };
  
    try {
      if (event.data) {
        data = event.data.json(); // works if JSON
      }
    } catch (e) {
      if (event.data && event.data.text) {
        data = { title: "Trasora", body: event.data.text(), url: "/" };
      }
    }
  
    const options = {
      body: data.body,
      icon: "/icons/android-chrome-192x192.png",
      badge: "/icons/android-chrome-192x192.png",
      data: { url: data.url },
    };
  
    event.waitUntil(self.registration.showNotification(data.title, options));
  });
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data || "/")
    );
  });
  