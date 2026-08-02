import { Link } from 'react-router-dom';
import { Calendar, MapPin, MoveRight, Users } from 'lucide-react';
import {
  TYPE_LABELS,
  reportedOn,
  shortAddress,
  severityBadgeClass
} from '../utils/formatters.js';

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;
  const typeLabel = TYPE_LABELS[complaint.type] || 'Other';

  return (
    <Link
      to={`/complaints/${complaint._id}`}
      className="premium-card premium-card-hover block overflow-hidden"
    >
      <div className="flex h-full flex-col">
        <div className="h-56 bg-surfaceAlt">
          {complaint.imageUrl ? (
            <img
              src={complaint.imageUrl}
              alt={typeLabel}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-mist">
              No image provided
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink">
              {typeLabel}
            </h3>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${severityBadgeClass(
                complaint.severity
              )}`}
            >
              {complaint.severity}
            </span>
            {complaint.nearbyCount > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                <Users size={12} />
                {complaint.nearbyCount} nearby
              </span>
            )}
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-soft">
            {complaint.aiDescription || complaint.description || 'No description available.'}
          </p>

          <div className="mt-6 space-y-2 text-sm text-soft">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-500" />
              {shortAddress(complaint.address) || 'Location pending'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-brand-500" />
              {reportedOn(complaint.createdAt)}
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
            View details <MoveRight size={15} />
          </div>
        </div>
      </div>
    </Link>
  );
}
