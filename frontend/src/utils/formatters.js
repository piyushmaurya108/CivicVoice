// Type → human label
export const TYPE_LABELS = {
  broken_road: 'Broken Road',
  waterlogging: 'Waterlogging',
  garbage: 'Garbage',
  streetlight: 'Streetlight',
  sewage: 'Sewage',
  water_supply: 'Water Supply',
  other: 'Other'
};

export const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));

// Severity badge colour classes
export const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

// Severity → marker hex (for map pins)
export const SEVERITY_MARKER_HEX = {
  low: '#16a34a',
  medium: '#d97706',
  high: '#ea580c',
  critical: '#dc2626'
};

export const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelative(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return formatDate(dateInput);
}

export function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function shortAddress(address) {
  if (!address) return '';
  return [address.locality, address.city, address.state]
    .filter(Boolean)
    .join(', ');
}

export function fullAddress(address) {
  if (!address) return '';
  return (
    address.fullAddress ||
    [address.locality, address.city, address.district, address.state, address.pincode]
      .filter(Boolean)
      .join(', ')
  );
}

// "Reported on 05 Jun 2025" — the only date-tracking that remains (Change 1)
export function reportedOn(dateInput) {
  const d = formatDate(dateInput);
  return d ? `Reported on ${d}` : '';
}

export function severityBadgeClass(severity) {
  return (
    SEVERITY_COLORS[severity] ||
    'bg-gray-100 text-gray-800 border-gray-200'
  );
}
