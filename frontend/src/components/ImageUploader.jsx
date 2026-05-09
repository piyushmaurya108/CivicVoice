import { useDropzone } from 'react-dropzone';
import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';

const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUploader({ value, onChange }) {
  const [preview, setPreview] = useState(null);

  // Generate / revoke preview URL whenever the file changes
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const onDrop = (accepted, rejected) => {
    if (rejected && rejected.length) {
      const reason = rejected[0].errors?.[0]?.code;
      if (reason === 'file-too-large') {
        alert('File is too large. Maximum size is 5MB.');
      } else if (reason === 'file-invalid-type') {
        alert('Only JPEG, PNG, and WebP images are allowed.');
      } else {
        alert('That file could not be uploaded.');
      }
      return;
    }
    if (accepted && accepted.length) {
      onChange(accepted[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize: MAX_BYTES,
    multiple: false
  });

  const clear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Photo of the issue <span className="text-red-500">*</span>
      </label>

      <div
        {...getRootProps()}
        className={`group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition ${
          isDragActive
            ? 'border-brand-500 bg-brand-50'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : value
            ? 'border-gray-200 bg-white'
            : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/50'
        }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="max-h-64 w-auto rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-black/70 p-1.5 text-white shadow transition hover:bg-black"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
            {value && (
              <p className="mt-3 text-center text-xs text-gray-500">
                <strong className="text-gray-700">{value.name}</strong> · {formatBytes(value.size)}
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-brand-100 p-3 text-brand-700 group-hover:bg-brand-200">
              <ImagePlus size={24} aria-hidden />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop the photo here' : 'Drag a photo here, or click to choose'}
            </p>
            <p className="text-xs text-gray-500">JPEG, PNG, or WebP · max 5 MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
