import Capacitor
import MediaPlayer
import UIKit

@objc(AppleNowPlayingPlugin)
public class AppleNowPlayingPlugin: CAPPlugin {

    @objc func setNowPlayingArtwork(_ call: CAPPluginCall) {
        guard let imageUrl = call.getString("url") else {
            call.reject("Missing URL")
            return
        }

        // Download the image (or fallback to AppIcon)
        let url = URL(string: imageUrl)
        var image: UIImage? = UIImage(named: "AppIcon") // fallback

        if let url = url, let data = try? Data(contentsOf: url), let downloadedImage = UIImage(data: data) {
            image = downloadedImage
        }

        if let img = image {
            let artwork = MPMediaItemArtwork(boundsSize: img.size) { _ in img }
            var nowPlayingInfo: [String: Any] = [:]
            nowPlayingInfo[MPMediaItemPropertyTitle] = "Trasora"
            nowPlayingInfo[MPMediaItemPropertyArtist] = "Trasora App"
            nowPlayingInfo[MPMediaItemPropertyArtwork] = artwork
            MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
        }

        call.resolve()
    }
}
