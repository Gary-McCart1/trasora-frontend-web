import UIKit
import Capacitor
import UserNotifications
import Firebase   // ✅ Firebase
import FirebaseAnalytics

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {

        // Notifications
        UNUserNotificationCenter.current().delegate = self

        // Firebase
        FirebaseApp.configure()
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            Analytics.logEvent("test_event", parameters: nil)
        }

        return true
    }

    // MARK: - Push Notification Registration

    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {

        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("✅ APNs Device Token: \(tokenString)")

        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidRegisterForRemoteNotificationsWithDeviceToken.name()),
            object: deviceToken
        )
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {

        print("❌ Failed to register for remote notifications: \(error)")

        NotificationCenter.default.post(
            name: Notification.Name(CAPNotifications.DidFailToRegisterForRemoteNotificationsWithError.name()),
            object: error
        )
    }

    // MARK: - Foreground Notifications

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.alert, .sound])
    }

    // MARK: - 🔥 CUSTOM DEEP LINK HANDLING (IMPORTANT)

    func application(_ app: UIApplication,
                     open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {

        print("🔥 Deep link received:", url.absoluteString)

        // ✅ Handle your custom scheme FIRST
        if url.scheme == "trasora" {

            if url.host == "create-post" {
                print("🚀 Navigate to Create Post screen")

                NotificationCenter.default.post(
                    name: Notification.Name("OPEN_CREATE_POST"),
                    object: nil
                )
            }

            return true
        }

        // 👇 Fallback to Capacitor for everything else
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
