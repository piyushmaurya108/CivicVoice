import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  RotateCcw,
  Send,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader.jsx';
import ComplaintMap from '../components/ComplaintMap.jsx';
import PortalSuggestions from '../components/PortalSuggestions.jsx';
import RepresentativesSection from '../components/RepresentativesSection.jsx';
import OrganisationsSection from '../components/OrganisationsSection.jsx';
import { describeError, submitComplaint as apiSubmitComplaint } from '../api/index.js';
import { TYPE_LABELS, fullAddress, severityBadgeClass } from '../utils/formatters.js';

const MAX_DESC = 500;
const MIN_DESC = 20;

export default function SubmitComplaint() {
  const [image, setImage] = useState(null);
  const [picked, setPicked] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const descLen = description.trim().length;
  const descValid = descLen >= MIN_DESC;
  const canSubmit = useMemo(() => Boolean(picked && descValid && !submitting), [picked, descValid, submitting]);

  const reset = () => {
    setImage(null);
    setPicked(null);
    setDescription('');
    setSubmitting(false);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      if (!descValid) setError(`Please describe the issue in at least ${MIN_DESC} characters.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setProgress(0);

    const toastId = toast.loading(image ? 'Uploading photo...' : 'Analysing your report...');
    try {
      const data = await apiSubmitComplaint({
        image: image || undefined,
        latitude: picked.lat,
        longitude: picked.lng,
        description: description.trim(),
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      });

      toast.success('Complaint submitted! Petition is ready.', { id: toastId });
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = describeError(err);
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const copyPetition = async () => {
    if (!result?.petitionText) return;
    try {
      await navigator.clipboard.writeText(result.petitionText);
      toast.success('Petition copied to clipboard');
    } catch {
      toast.error('Failed to copy. Please select text and copy manually.');
    }
  };

  return (
    <div className="page-container py-10 sm:py-14">
      {!result ? (
        <>
          <div className="mb-8 max-w-3xl">
            <div className="glass-badge border-line bg-white/90">Guided complaint filing</div>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em] text-ink sm:text-5xl">
              Report a civic problem
            </h1>
            <p className="mt-4 text-lg leading-8 text-soft">
              Describe the issue and pin the location. A photo is optional but helps.
              We&apos;ll identify the issue, find similar reports nearby, and prepare a
              formal petition for the right authority.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="premium-card space-y-6 px-6 py-6 sm:px-8 sm:py-8">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label htmlFor="description" className="text-sm font-semibold text-ink">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${descLen > MAX_DESC - 50 ? 'text-amber-600' : descValid ? 'text-green-600' : 'text-mist'}`}>
                    {descLen}/{MAX_DESC}
                    {!descValid && ` · min ${MIN_DESC}`}
                  </span>
                </div>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  rows={6}
                  placeholder="Describe the problem: what it is, how long it has been there, and who is affected."
                  className={`field-input min-h-[170px] resize-none ${description && !descValid ? 'border-red-300 focus:ring-red-100' : ''}`}
                />
                {description && !descValid && (
                  <p className="mt-2 text-sm text-red-600">
                    Please write at least {MIN_DESC} characters ({MIN_DESC - descLen} more to go).
                  </p>
                )}
              </div>

              <ImageUploader value={image} onChange={setImage} />

              {error && (
                <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button type="submit" disabled={!canSubmit} className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50">
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {progress > 0 && progress < 100 ? `Uploading... ${progress}%` : 'Analysing...'}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit complaint
                    </>
                  )}
                </button>

                {!canSubmit && !submitting && (
                  <p className="text-center text-sm text-soft">
                    {!descValid && !picked
                      ? 'Write a description and pick a location to continue.'
                      : !descValid
                      ? `Add a description of at least ${MIN_DESC} characters to continue.`
                      : 'Pick a location on the map to continue.'}
                  </p>
                )}
              </div>
            </div>

            <div className="premium-card px-5 py-5 sm:px-6 sm:py-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">Location</h2>
                <p className="mt-2 text-sm leading-7 text-soft">
                  Drop a pin manually, use GPS, or search by address.
                </p>
              </div>
              <ComplaintMap pickedLocation={picked} onLocationPick={setPicked} height="520px" />
            </div>
          </form>
        </>
      ) : (
        <ResultPanel result={result} onReset={reset} onCopyPetition={copyPetition} />
      )}
    </div>
  );
}

function ResultPanel({ result, onReset, onCopyPetition }) {
  const { complaint, portal, portals, petitionText, nearbyCount, representatives, organisations } = result;
  const typeLabel = TYPE_LABELS[complaint?.type] || 'Issue';
  const isCluster = nearbyCount > 1;
  const portalList = portals && portals.length ? portals : portal ? [portal] : [];

  return (
    <div className="space-y-6">
      <div className="premium-card border-green-200 bg-green-50 px-6 py-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={28} className="flex-shrink-0 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-green-900">Complaint Submitted</h2>
            <p className="mt-2 text-sm leading-7 text-green-800">
              {isCluster ? (
                <>
                  <strong>{nearbyCount}</strong> reports of a similar <strong>{typeLabel.toLowerCase()}</strong> exist within 500 metres of this location.
                </>
              ) : (
                <>This is the first report of this <strong>{typeLabel.toLowerCase()}</strong> in this area.</>
              )}{' '}
              Your petition is ready below.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStat icon={Users} label="Reports nearby" value={nearbyCount} />
        <div className="premium-card px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">Issue type</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-ink">{typeLabel}</span>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${severityBadgeClass(complaint?.severity)}`}>
              {complaint?.severity}
            </span>
          </div>
        </div>
        <div className="premium-card px-5 py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-mist">
            <MapPin size={12} /> Location
          </div>
          <div className="mt-3 text-sm leading-7 text-ink">{fullAddress(complaint?.address) || 'Coordinates only'}</div>
        </div>
      </div>

      {petitionText && (
        <section className="premium-card px-6 py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-mist">Your petition letter</h3>
            <button type="button" onClick={onCopyPetition} className="secondary-button">
              <Copy size={14} />
              Copy petition text
            </button>
          </div>
          <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-[24px] border border-line bg-surfaceAlt p-5 font-sans text-sm leading-7 text-ink">
            {petitionText}
          </pre>
          <p className="mt-3 text-sm text-soft">
            Tip: paste this text into the description or remarks field on a portal below
            {complaint?.imageUrl ? ' and attach the same photo as evidence.' : '.'}
          </p>
        </section>
      )}

      {portalList.length > 0 && <PortalSuggestions portals={portalList} />}
      {representatives && <RepresentativesSection data={representatives} type={complaint?.type} address={complaint?.address} />}
      {organisations && <OrganisationsSection data={organisations} />}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onReset} className="secondary-button">
          <RotateCcw size={15} />
          Submit another complaint
        </button>
        {complaint?._id && (
          <Link to={`/complaints/${complaint._id}`} className="primary-button">
            View this complaint
          </Link>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }) {
  return (
    <div className="premium-card px-5 py-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-mist">
        <Icon size={12} /> {label}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-[-0.05em] text-ink">{value}</div>
    </div>
  );
}
