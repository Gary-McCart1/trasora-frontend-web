import Foundation
import Capacitor

@objc(APNTokenPlugin)
public class APNTokenPlugin: CAPPlugin {

    @objc func getPendingToken(_ call: CAPPluginCall) {
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate,
           let token = appDelegate.sendPendingTokenIfNeeded() {
            call.resolve([
                "token": token
            ])
        } else {
            call.resolve([
                "token": NSNull()
            ])
        }
    }
}
