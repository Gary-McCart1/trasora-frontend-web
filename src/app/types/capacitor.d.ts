
import { Plugin } from "@capacitor/core";

export interface AppleNowPlayingPlugin extends Plugin {
  setNowPlayingArtwork(options: { url: string }): Promise<void>;
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    AppleNowPlayingPlugin: AppleNowPlayingPlugin;
  }
}
