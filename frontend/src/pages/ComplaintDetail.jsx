import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Calendar, Copy, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ComplaintMap from '../components/ComplaintMap.jsx';
import ComplaintCounter from '../components/ComplaintCounter.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PortalSuggestions from '../components/PortalSuggestions.jsx';
import RepresentativesSection from '../components/RepresentativesSection.jsx';
import OrganisationsSection from '../components/OrganisationsSection.jsx';
import { describeError, fetchComplaintById } from '../api/index.js';
import {
  TYPE_LABELS,
  reportedOn,
  formatDateTime,
  fullAddress,
  severityBadgeClass
} from '../utils/formatters.js';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [representatives, setRepresentatives] = useState(null);
  const [organisations, setOrganisations] = useState(null);
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
        setRepresentatives(data.representatives || null);
        setOrganisations(data.organisations || null);
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
      <div className="page-container py-16">
        <LoadingSpinner label="Loading complaint..." />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="page-container py-16">
        <div className="premium-card border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error || 'Complaint not found'}</span>
          </div>
        </div>
        <Link to="/complaints" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
          <ArrowLeft size={14} /> Back to all complaints
        </Link>
      </div>
    );
  }

  const typeLabel = TYPE_LABELS[complaint.type] || 'Issue';
  const portalList =
    complaint.portalSuggestions && complaint.portalSuggestions.length
      ? complaint.portalSuggestions
      : complaint.matchedPortal && complaint.matchedPortal.name
      ? [complaint.matchedPortal]
      : [];

  return (
    <div className="page-container py-10 sm:py-14">
      <Link to="/complaints" className="inline-flex items-center gap-2 text-sm font-semibold text-soft transition hover:text-brand-600">
        <ArrowLeft size={14} /> All complaints
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          {complaint.imageUrl && (
            <div className="premium-card overflow-hidden">
              <img src={complaint.imageUrl} alt={typeLabel} className="max-h-[520px] w-full object-cover" />
            </div>
          )}

          <div className="premium-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-[-0.05em] text-ink">{typeLabel}</h1>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${severityBadgeClass(complaint.severity)}`}>
                {complaint.severity}
              </span>
            </div>

            {complaint.aiDescription && <p className="mt-4 text-base leading-8 text-soft">{complaint.aiDescription}</p>}
            {complaint.description && (
              <div className="mt-5 rounded-[24px] border border-line bg-surfaceAlt p-4 text-sm leading-7 text-soft">
                <strong className="text-ink">Reporter&apos;s note:</strong> {complaint.description}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-soft">
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-brand-500" />
                {fullAddress(complaint.address) || 'Location coordinates only'}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar size={14} className="text-brand-500" />
                {reportedOn(complaint.createdAt) || formatDateTime(complaint.createdAt)}
              </span>
              {complaint.landmark && <span><strong className="text-ink">Landmark:</strong> {complaint.landmark}</span>}
            </div>

            <div className="mt-6">
              <ComplaintCounter count={complaint.nearbyCount} />
            </div>
          </div>

          {complaint.petitionText && (
            <section className="premium-card px-6 py-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-mist">Petition letter</h2>
                <button type="button" onClick={copyPetition} className="secondary-button">
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-[24px] border border-line bg-surfaceAlt p-5 font-sans text-sm leading-7 text-ink">
                {complaint.petitionText}
              </pre>
            </section>
          )}

          {portalList.length > 0 && <PortalSuggestions portals={portalList} />}
          {representatives && <RepresentativesSection data={representatives} type={complaint.type} address={complaint.address} />}
          {organisations && <OrganisationsSection data={organisations} />}
        </div>

        <aside className="space-y-6">
          <div className="premium-card p-3">
            <ComplaintMap
              complaints={[complaint]}
              height="360px"
              initialCenter={
                complaint.location?.coordinates
                  ? [complaint.location.coordinates[1], complaint.location.coordinates[0]]
                  : undefined
              }
              initialZoom={15}
            />
          </div>

          <div className="premium-card px-6 py-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-mist">Cluster</h3>
            <div className="mt-4 inline-flex items-center gap-2 text-sm leading-7 text-soft">
              <Users size={15} className="text-brand-500" />
              <span>
                <strong className="text-ink">{complaint.nearbyCount}</strong> report{complaint.nearbyCount === 1 ? '' : 's'} of a similar issue within 500 m
              </span>
            </div>
            {complaint.clusterId && (
              <p className="mt-3 break-all text-xs text-mist">Cluster ID: {complaint.clusterId}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
