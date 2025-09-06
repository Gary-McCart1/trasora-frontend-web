"use client";

import { FiUpload, FiX } from "react-icons/fi";
import { useAlert } from "../context/AlertContext";

interface MediaUploaderProps {
  preview: string | null;
  setPreview: (url: string | null) => void;
  setFile: (file: File | null) => void;
  file?: File | null;
  albumArt?: string; // album art fallback
}

// Helper function to compress the image using a canvas
const compressImage = (file: File, quality: number): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        // Maintain aspect ratio while resizing for a maximum width
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              resolve(file); // Fallback to original file on failure
            }
          },
          "image/jpeg",
          quality
        );
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  });
};

export default function MediaUploader({
  preview,
  setPreview,
  setFile,
  file,
  albumArt,
}: MediaUploaderProps) {
  const { showAlert } = useAlert();
  const MAX_VIDEO_SIZE_MB = 100;
  const MAX_IMAGE_SIZE_MB_FOR_COMPRESSION = 5;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type.startsWith("video")) {
      // For videos, just check the size and don't compress
      if (selectedFile.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        showAlert(
          `Video file is too large. Max size is ${MAX_VIDEO_SIZE_MB}MB.`,
          "error"
        );
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else if (selectedFile.type.startsWith("image")) {
      // For images, check size and compress if necessary
      if (selectedFile.size > MAX_IMAGE_SIZE_MB_FOR_COMPRESSION * 1024 * 1024) {
        showAlert("Compressing your image for a faster upload...", "info");
        const compressedFile = await compressImage(selectedFile, 0.8);
        setFile(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
      } else {
        // If image is small enough, set it directly
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    } else {
      // Handle other file types or show an error
      showAlert("Unsupported file type selected.", "error");
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(albumArt || "/default-album-cover.png");
  };

  const displayPreview = preview || albumArt || null;
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