import { useEffect } from 'react';
import { Copy, ExternalLink, Phone, Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PetitionModal({ open, onClose, portal, petitionText }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(petitionText || '');
      toast.success('Petition copied to clipboard');
    } catch {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Petition & Government Portal
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {portal && (
            <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Submit to
              </h4>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {portal.name}
              </p>
              {portal.officer && (
                <p className="mt-0.5 text-sm text-gray-600">
                  Officer: {portal.officer}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {portal.url && (
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    <ExternalLink size={14} />
                    Open portal
                  </a>
                )}
                {portal.phone && (
                  <a
                    href={`tel:${portal.phone}`}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Phone size={14} />
                    {portal.phone}
                  </a>
                )}
                {portal.email && (
                  <a
                    href={`mailto:${portal.email}`}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Mail size={14} />
                    {portal.email}
                  </a>
                )}
              </div>
            </section>
          )}

          {Array.isArray(portal?.steps) && portal.steps.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                How to submit
              </h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
                {portal.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {petitionText && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Petition letter
                </h4>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
              <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 font-sans">
                {petitionText}
              </pre>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
