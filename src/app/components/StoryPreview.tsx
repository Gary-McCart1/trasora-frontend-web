import { FC } from "react";
import Image from "next/image";
import { StoryDto } from "../types/Story";

interface StoryPreviewProps {
  story: StoryDto;
}

const StoryPreview: FC<StoryPreviewProps> = ({ story }) => {
  const isVideo = story.type === "VIDEO";
  const mediaUrl = story.contentUrl || story.albumArtUrl || "/placeholder.png";

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden bg-black flex items-center justify-center">
      {isVideo ? (
        <video
          src={mediaUrl}
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <Image
          src={mediaUrl}
          alt="Story Preview"
          width={256}
          height={256}
          className="object-contain w-full h-full"
        />
      )}
    </div>
  );
};

export default StoryPreview;
