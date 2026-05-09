import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, label, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-gray-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="animate-spin" size={size} aria-hidden />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
