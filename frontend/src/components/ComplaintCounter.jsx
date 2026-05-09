import { Users } from 'lucide-react';

export default function ComplaintCounter({ count = 1, className = '' }) {
  if (!count || count < 1) return null;
  const isCluster = count > 1;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 ${className}`}
    >
      <Users size={16} aria-hidden />
      {isCluster ? (
        <span>
          <strong>{count}</strong> citizens reported this nearby
        </span>
      ) : (
        <span>First report in this area</span>
      )}
    </div>
  );
}
