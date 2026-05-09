import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Users,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ComplaintMap from '../components/ComplaintMap.jsx';
import ComplaintCounter from '../components/ComplaintCounter.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { describeError, fetchComplaintById } from '../api/index.js';
import {
  TYPE_LABELS,
  formatDateTime,
  fullAddress,
  severityBadgeClass
} from '../utils/formatters.js';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchComplaintById(id);
        if (cancelled) return;
        setComplaint(data.complaint);
      } catch (err) {
        if (cancelled) return;
        setError(describeError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const copyPetition = async () => {
    if (!complaint?.petitionText) return;
    try {
      await navigator.clipboard.writeText(complaint.petitionText);
      toast.success('Petition copied to clipboard');
    } catch {
      toast.error('Failed to copy.');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <LoadingSpinner label="Loading complaint…" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" aria-hidden />
          <span>{error || 'Complaint not found'}</span>
        </div>
        <Link
          to="/complaints"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
        >
          <ArrowLeft size={14} /> Back to all complaints
        </Link>
      </div>
    );
  }

  const typeLabel = TYPE_LABELS[complaint.type] || 'Issue';
  const portal = complaint.matchedPortal || {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Link
        to="/complaints"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-700"
      >
        <ArrowLeft size={14} /> All complaints
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Image */}
          {complaint.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <img
                src={complaint.imageUrl}
                alt={typeLabel}
                className="max-h-[480px] w-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{typeLabel}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${severityBadgeClass(
                complaint.severity
              )}`}
            >
              {complaint.severity}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700">
              {complaint.status?.replace('_', ' ')}
            </span>
          </div>

          {complaint.aiDescription && (
            <p className="mt-3 text-sm text-gray-700">{complaint.aiDescription}</p>
          )}
          {complaint.description && (
            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <strong className="text-gray-900">Reporter's note:</strong>{' '}
              {complaint.description}
            </div>
          )}

          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} aria-hidden />
              {fullAddress(complaint.address) || 'Location coordinates only'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} aria-hidden />
              {formatDateTime(complaint.createdAt)}
            </span>
            {complaint.landmark && (
              <span className="inline-flex items-center gap-1.5">
                <strong className="text-gray-900">Landmark:</strong>
                {complaint.landmark}
              </span>
            )}
          </div>

          <div className="mt-4">
            <ComplaintCounter count={complaint.nearbyCount} />
          </div>

          {/* Petition */}
          {complaint.petitionText && (
            <section className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Petition letter
                </h2>
                <button
                  type="button"
                  onClick={copyPetition}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-sans text-sm text-gray-800">
                {complaint.petitionText}
              </pre>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {portal && portal.name && (
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Submit to
              </h3>
              <p className="mt-1 text-base font-semibold text-gray-900">{portal.name}</p>
              {portal.officer && (
                <p className="mt-0.5 text-sm text-gray-600">Officer: {portal.officer}</p>
              )}
              <div className="mt-3 flex flex-col gap-2">
                {portal.url && (
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    <ExternalLink size={14} />
                    Open portal
                  </a>
                )}
                {portal.phone && (
                  <a
                    href={`tel:${portal.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Phone size={14} />
                    {portal.phone}
                  </a>
                )}
                {portal.email && (
                  <a
                    href={`mailto:${portal.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Mail size={14} />
                    {portal.email}
                  </a>
                )}
              </div>

              {Array.isArray(portal.steps) && portal.steps.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Steps
                  </h4>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-700">
                    {portal.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          )}

          <section className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
            <ComplaintMap
              complaints={[complaint]}
              height="320px"
              initialCenter={
                complaint.location?.coordinates
                  ? [
                      complaint.location.coordinates[1],
                      complaint.location.coordinates[0]
                    ]
                  : undefined
              }
              initialZoom={15}
            />
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Cluster
            </h3>
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700">
              <Users size={14} aria-hidden />
              <span>
                <strong>{complaint.nearbyCount}</strong> citizen
                {complaint.nearbyCount === 1 ? '' : 's'} reported a similar issue within
                500 m
              </span>
            </div>
            {complaint.clusterId && (
              <p className="mt-1 break-all text-xs text-gray-400">
                Cluster ID: {complaint.clusterId}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
