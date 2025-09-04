"use client";

import { FiUpload, FiX } from "react-icons/fi";

interface ImageUploaderProps {
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
  setImageFile: (file: File | null) => void;
}

export default function ImageUploader({ imagePreview, setImagePreview, setImageFile }: ImageUploaderProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-zinc-400 font-medium">Optional Image</span>
        {imagePreview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1"
          >
            <FiX /> Remove
          </button>
        )}
      </div>
      <label className="flex items-center gap-2 text-purple-500 hover:text-purple-400 cursor-pointer">
        <FiUpload />
        Upload
        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
      </label>
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Custom"
          className="mt-4 w-full max-h-64 rounded object-cover"
        />
      )}
    </div>
  );
}