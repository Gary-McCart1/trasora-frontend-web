import UIKit
import Capacitor
import UserNotifications
import Firebase   // ✅ Added

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Ensure Capacitor plugins are registered
        UNUserNotificationCenter.current().delegate = self
        
        // ✅ Initialize Firebase
        FirebaseApp.configure()

        return true
    }

    // MARK: - Push Notification Registration

    // Called when APNs successfully registers the device
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("✅ APNs Device Token: \(tokenString)")
        
        CAPLog.print("Capacitor sending device token to JS...")
        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidRegisterForRemoteNotificationsWithDeviceToken.name()),
            object: deviceToken
        )
    }

    // Called when APNs registration fails
    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error)")
        
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
        return ApplicationDelegateProxy.shared.application(
            application,
            continue: userActivity,
            restorationHandler: restorationHandler
        )
    }
}
