import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, label, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-soft ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Loader2 className="animate-spin" size={size} aria-hidden />
      </span>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
