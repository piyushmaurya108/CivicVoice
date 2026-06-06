import { ExternalLink, Phone, Mail, Building2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function PortalItem({ portal, prominent }) {
  const [open, setOpen] = useState(prominent);

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        prominent ? 'border-brand-200 bg-brand-50/40' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-gray-900">{portal.name}</h4>
            {portal.tag && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  prominent
                    ? 'bg-brand-600 text-white'
                    : 'border border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {portal.tag}
              </span>
            )}
          </div>
          {portal.description && (
            <p className="mt-1 text-sm text-gray-600">{portal.description}</p>
          )}
          {portal.officer && (
            <p className="mt-1 text-xs text-gray-500">Officer: {portal.officer}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {portal.url && (
          <a
            href={portal.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <ExternalLink size={14} aria-hidden /> Open portal
          </a>
        )}
        {portal.phone && (
          <a
            href={`tel:${portal.phone}`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Phone size={14} aria-hidden /> {portal.phone}
          </a>
        )}
        {portal.email && (
          <a
            href={`mailto:${portal.email}`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Mail size={14} aria-hidden /> {portal.email}
          </a>
        )}
      </div>

      {Array.isArray(portal.steps) && portal.steps.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
          >
            <ChevronDown
              size={14}
              className={`transition ${open ? 'rotate-180' : ''}`}
              aria-hidden
            />
            {open ? 'Hide steps' : `How to submit (${portal.steps.length} steps)`}
          </button>
          {open && (
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-700">
              {portal.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Ranked list of relevant portals (Change 4).
 * The most relevant is shown prominently first; others follow as options.
 */
export default function PortalSuggestions({ portals }) {
  if (!Array.isArray(portals) || portals.length === 0) return null;
  const [top, ...rest] = portals;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 size={18} className="text-brand-700" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">
          Where to submit your complaint
        </h3>
      </div>

      <PortalItem portal={top} prominent />

      {rest.length > 0 && (
        <>
          <p className="pt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            Other relevant options
          </p>
          <div className="space-y-3">
            {rest.map((p, i) => (
              <PortalItem key={`${p.name}-${i}`} portal={p} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
