import { useDropzone } from 'react-dropzone';
import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';

const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUploader({ value, onChange }) {
  const [preview, setPreview] = useState(null);

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
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-ink">
        Photo of the issue{' '}
        <span className="font-medium text-mist">(optional, but recommended)</span>
      </label>

      <div
        {...getRootProps()}
        className={`group relative flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed p-6 text-center transition ${
          isDragActive
            ? 'border-brand-500 bg-brand-50'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : value
            ? 'border-line bg-white'
            : 'border-line bg-surfaceAlt hover:border-brand-300 hover:bg-brand-50/60'
        }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="max-h-72 w-auto rounded-[22px] object-contain shadow-soft"
            />
            <button
              type="button"
              onClick={clear}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-ink/75 p-2 text-white shadow-soft transition hover:bg-ink"
              aria-label="Remove image"
            >
              <X size={15} />
            </button>
            {value && (
              <p className="mt-4 text-sm text-soft">
                <strong className="text-ink">{value.name}</strong> · {formatBytes(value.size)}
              </p>
            )}
          </>
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 shadow-[0_14px_32px_rgba(51,102,255,0.14)] transition group-hover:scale-105">
              <ImagePlus size={28} />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">
                {isDragActive ? 'Drop the photo here' : 'Drag a photo here, or click to choose'}
              </p>
              <p className="mt-2 text-sm leading-7 text-soft">
                JPEG, PNG, or WebP · max 5 MB · adding a photo improves AI analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
