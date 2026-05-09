import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Phone,
  Mail,
  Send,
  Loader2,
  RotateCcw,
  Users,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader.jsx';
import ComplaintMap from '../components/ComplaintMap.jsx';
import {
  describeError,
  submitComplaint as apiSubmitComplaint
} from '../api/index.js';
import {
  TYPE_LABELS,
  fullAddress,
  severityBadgeClass
} from '../utils/formatters.js';

const MAX_DESC = 500;

export default function SubmitComplaint() {
  const [image, setImage] = useState(null);
  const [picked, setPicked] = useState(null); // { lat, lng }
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // { complaint, portal, petitionText, nearbyCount }
  const [error, setError] = useState(null);

  const canSubmit = useMemo(
    () => Boolean(image && picked && !submitting),
    [image, picked, submitting]
  );

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
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setProgress(0);

    const toastId = toast.loading('Uploading photo…');
    try {
      const data = await apiSubmitComplaint({
        image,
        latitude: picked.lat,
        longitude: picked.lng,
        description: description.trim() || undefined,
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      });

      toast.success('Complaint submitted! Petition is ready.', { id: toastId });
      setResult(data);
      // smooth scroll to top so the result panel is in view
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {!result ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Report a civic problem
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Upload a photo and pin the location. We'll identify the issue, find similar
              reports nearby, and prepare a formal petition for the right authority.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <ImageUploader value={image} onChange={setImage} />

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <span
                    className={`text-xs ${
                      description.length > MAX_DESC - 50
                        ? 'text-amber-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {description.length}/{MAX_DESC}
                  </span>
                </div>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  rows={4}
                  placeholder="Add any extra context: how long the problem has existed, who's affected, etc."
                  className="block w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 flex-shrink-0"
                    aria-hidden
                  />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      {progress > 0 && progress < 100
                        ? `Uploading… ${progress}%`
                        : 'Analysing…'}
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden />
                      Submit complaint
                    </>
                  )}
                </button>

                {!canSubmit && !submitting && (
                  <p className="text-center text-xs text-gray-500">
                    {!image && !picked
                      ? 'Add a photo and pick a location to continue.'
                      : !image
                      ? 'Add a photo to continue.'
                      : 'Pick a location on the map to continue.'}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <ComplaintMap
                pickedLocation={picked}
                onLocationPick={setPicked}
                height="420px"
              />
            </div>
          </form>
        </>
      ) : (
        <ResultPanel
          result={result}
          onReset={reset}
          onCopyPetition={copyPetition}
        />
      )}
    </div>
  );
}

function ResultPanel({ result, onReset, onCopyPetition }) {
  const { complaint, portal, petitionText, nearbyCount } = result;
  const typeLabel = TYPE_LABELS[complaint?.type] || 'Issue';
  const isCluster = nearbyCount > 1;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={28}
            className="flex-shrink-0 text-green-600"
            aria-hidden
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-green-900 sm:text-xl">
              Complaint Submitted!
            </h2>
            <p className="mt-1 text-sm text-green-800">
              {isCluster ? (
                <>
                  <strong>{nearbyCount}</strong> citizens have now reported a similar{' '}
                  <strong>{typeLabel.toLowerCase()}</strong> within 500 metres of this
                  location. Your collective petition is ready below.
                </>
              ) : (
                <>
                  You're the first to report this <strong>{typeLabel.toLowerCase()}</strong>{' '}
                  in this area. Your petition is ready below.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStat
          icon={Users}
          label="Citizens reporting"
          value={nearbyCount}
        />
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500">Issue type</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-gray-900">{typeLabel}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${severityBadgeClass(
                complaint?.severity
              )}`}
            >
              {complaint?.severity}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
            <MapPin size={12} aria-hidden /> Location
          </div>
          <div className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
            {fullAddress(complaint?.address) || 'Coordinates only'}
          </div>
        </div>
      </div>

      {/* Portal */}
      {portal && (
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Submit your petition to
          </h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">{portal.name}</p>
          {portal.officer && (
            <p className="mt-0.5 text-sm text-gray-600">Officer: {portal.officer}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {portal.url && (
              <a
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <ExternalLink size={14} />
                Open portal
              </a>
            )}
            {portal.phone && (
              <a
                href={`tel:${portal.phone}`}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Phone size={14} />
                {portal.phone}
              </a>
            )}
            {portal.email && (
              <a
                href={`mailto:${portal.email}`}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Mail size={14} />
                {portal.email}
              </a>
            )}
          </div>

          {Array.isArray(portal.steps) && portal.steps.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-gray-700">Submission steps</h4>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-700">
                {portal.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      {/* Petition */}
      {petitionText && (
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Your petition letter
            </h3>
            <button
              type="button"
              onClick={onCopyPetition}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Copy size={14} />
              Copy petition text
            </button>
          </div>
          <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-sans text-sm text-gray-800">
            {petitionText}
          </pre>
          <p className="mt-3 text-xs text-gray-500">
            Tip: paste this text into the description / remarks field on the portal above and attach
            the same photo as evidence.
          </p>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RotateCcw size={14} />
          Submit another complaint
        </button>
        {complaint?._id && (
          <Link
            to={`/complaints/${complaint._id}`}
            className="inline-flex items-center gap-2 rounded-md bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
          >
            View this complaint →
          </Link>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
        <Icon size={12} aria-hidden /> {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
