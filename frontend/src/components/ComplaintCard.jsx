import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import {
  TYPE_LABELS,
  formatRelative,
  shortAddress,
  severityBadgeClass
} from '../utils/formatters.js';

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;
  const typeLabel = TYPE_LABELS[complaint.type] || 'Other';

  return (
    <Link
      to={`/complaints/${complaint._id}`}
      className="block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex">
        <div className="h-32 w-32 flex-shrink-0 bg-gray-100 sm:h-40 sm:w-40">
          {complaint.imageUrl ? (
            <img
              src={complaint.imageUrl}
              alt={typeLabel}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{typeLabel}</h3>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${severityBadgeClass(
                complaint.severity
              )}`}
            >
              {complaint.severity}
            </span>
            {complaint.nearbyCount > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                <Users size={12} aria-hidden />
                {complaint.nearbyCount} nearby
              </span>
            )}
          </div>

          {complaint.aiDescription && (
            <p className="line-clamp-2 text-sm text-gray-600">
              {complaint.aiDescription}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} aria-hidden />
              {shortAddress(complaint.address) || 'Location pending'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} aria-hidden />
              {formatRelative(complaint.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
