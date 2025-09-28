import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?
    
    // Store the device token temporarily until a user is logged in
    var pendingDeviceToken: String?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Do NOT request notification permissions here
        // We'll request them after the user logs in
        return true
    }

    // MARK: - Push Notification Registration

    /// Call this after login to request permission and register
    func registerForPushNotifications(application: UIApplication) {
        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            guard granted else {
                print("⚠️ Push notifications permission denied")
                return
            }
            DispatchQueue.main.async {
                application.registerForRemoteNotifications()
            }
        }
    }

    // Called when APNs successfully registers the device
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("✅ APNs Device Token: \(tokenString)")
        
        if let currentUser = AuthManager.shared.currentUser {
            // Send immediately if logged in
            sendDeviceTokenToBackend(token: tokenString)
        } else {
            // Otherwise store temporarily
            pendingDeviceToken = tokenString
        }
    }

    /// Call after login if there was a pending token
    func sendPendingTokenIfNeeded() {
        guard let token = pendingDeviceToken else { return }
        sendDeviceTokenToBackend(token: token)
        pendingDeviceToken = nil
    }

    /// Send APNs token to backend
    private func sendDeviceTokenToBackend(token: String) {
        guard let currentUser = AuthManager.shared.currentUser else { return }
        guard let url = URL(string: "https://trasora-backend-e03193d24a86.herokuapp.com/api/push/subscribe/apn") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Include JWT for authentication
        if let jwt = AuthManager.shared.jwtToken {
            request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        }

        let body = ["deviceToken": token]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("❌ Failed to save device token: \(error)")
            } else {
                print("✅ Device token saved for user \(currentUser.username)")
            }
        }.resume()
    }

    // Called when APNs registration fails
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error)")
    }

    // MARK: - Foreground Notification Handling
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.alert, .sound])
    }

    // MARK: - URL Handling (Capacitor)
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

