"use client";

import { FiUpload, FiX } from "react-icons/fi";

interface MediaUploaderProps {
  preview: string | null;
  setPreview: (url: string | null) => void;
  setFile: (file: File | null) => void;
  file?: File | null;
  albumArt?: string; // album art fallback
}

export default function MediaUploader({
  preview,
  setPreview,
  setFile,
  file,
  albumArt,
}: MediaUploaderProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
      
        // ✅ Check file size before setting it
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          alert("File too large! Max 100MB.");
          return;
        }
      
        setFile(file);
        setPreview(URL.createObjectURL(file));
      };

  const handleRemove = () => {
    setFile(null);
    setPreview(albumArt || "/default-album-cover.png"); // always fallback to album art
  };

  const displayPreview = preview || albumArt || null;
  // Only treat as video if the user uploaded a video file
  const isVideo = file ? file.type.startsWith("video") : false;

  return (
    <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700 w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-zinc-400 font-medium">
          Add an image or video... (Optional)
        </span>
        {displayPreview && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1"
          >
            <FiX /> Remove
          </button>
        )}
      </div>

      <label className="flex items-center gap-2 text-purple-500 hover:text-purple-400 cursor-pointer">
        <FiUpload />
        Upload
        <input
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={handleChange}
        />
      </label>

      {displayPreview && (
        <div className="mt-4 w-full rounded overflow-hidden bg-black flex items-center justify-center">
          {isVideo ? (
            <video
              src={displayPreview}
              className="w-full h-64 object-contain object-center rounded"
              muted
              loop
              autoPlay
              playsInline
              controls={false}
            />
          ) : (
            <img
              src={displayPreview}
              alt="Uploaded preview"
              className="w-full h-64 object-cover rounded"
            />
          )}
        </div>
      )}
    </div>
  );
}
