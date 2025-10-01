import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    // ⚠️ REMOVED: pendingDeviceToken is no longer needed as Capacitor handles bridging the token.
    // var pendingDeviceToken: String?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Ensure Capacitor plugins are registered
        UNUserNotificationCenter.current().delegate = self
        CAPBridge.registerPlugin("AppleNowPlayingPlugin", plugin: AppleNowPlayingPlugin.self)
        
        // ⚠️ Removed the call to registerForPushNotifications(application:)
        
        return true
    }

    

    // MARK: - Push Notification Registration
    // ⚠️ REMOVED: The custom func registerForPushNotifications is deleted.
    /*
    func registerForPushNotifications(application: UIApplication) {
        // ... (Custom logic deleted)
    }
    */

    // Called when APNs successfully registers the device
    // This method is still needed. Capacitor uses it to capture the token and bridge it to JS.
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Log the token (optional, but useful for debugging)
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("✅ APNs Device Token: \(tokenString)")
        
        // Let the Capacitor Push Notifications plugin handle the token
        // and send it to the 'registration' listener in push.ts
        CAPLog.print("Capacitor sending device token to JS...")
        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidRegisterForRemoteNotificationsWithDeviceToken.name()),
            object: deviceToken
        )

        // ⚠️ REMOVED: The manual token storage is deleted.
        // pendingDeviceToken = tokenString
    }

    /// ⚠️ REMOVED: This helper is no longer needed since the token is bridged directly via Capacitor.
    /*
    func sendPendingTokenIfNeeded() -> String? {
        let token = pendingDeviceToken
        pendingDeviceToken = nil
        return token
    }
    */

    // Called when APNs registration fails
    // This method is still needed. Capacitor uses it to bridge the error to JS.
    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error)")
        
        // Let the Capacitor Push Notifications plugin handle the error
        CAPLog.print("Capacitor sending registration error to JS...")
        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidFailToRegisterForRemoteNotificationsWithError.name()),
            object: error
        )
    }

    // MARK: - Foreground Notification Handling
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                 willPresent notification: UNNotification,
                                 withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.alert, .sound])
    }

    // MARK: - URL Handling (Capacitor)
    func application(_ app: UIApplication,
                      open url: URL,
                      options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication,
                      continue userActivity: NSUserActivity,
                      restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
