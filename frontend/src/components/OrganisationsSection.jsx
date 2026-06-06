import { HeartHandshake, Globe, Phone, Twitter, FileText, Lightbulb } from 'lucide-react';

const KIND_STYLE = {
  NGO: 'bg-green-100 text-green-800 border-green-200',
  'Government body': 'bg-blue-100 text-blue-800 border-blue-200',
  'Government platform': 'bg-blue-100 text-blue-800 border-blue-200',
  'Civic platform': 'bg-purple-100 text-purple-800 border-purple-200'
};

function OrgCard({ org }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-gray-900">{org.name}</h4>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
            KIND_STYLE[org.kind] || 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          {org.kind}
        </span>
      </div>
      {org.description && (
        <p className="mt-1.5 text-sm text-gray-600">{org.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        {org.website && (
          <a
            href={org.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline"
          >
            <Globe size={14} aria-hidden /> Website
          </a>
        )}
        {org.phone && (
          <a
            href={`tel:${org.phone}`}
            className="inline-flex items-center gap-1.5 text-gray-700 hover:text-brand-700"
          >
            <Phone size={14} aria-hidden /> {org.phone}
          </a>
        )}
        {org.twitter && (
          <a
            href={org.twitter}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-700 hover:text-brand-700"
          >
            <Twitter size={14} aria-hidden /> Twitter
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * "Get Help From Organisations" section (Change 7).
 * Props: data = { list: [...], rti: {...}, meta }
 */
export default function OrganisationsSection({ data }) {
  const list = data?.list || [];
  const rti = data?.rti;
  if (!list.length && !rti) return null;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <HeartHandshake size={18} className="text-brand-700" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Get Help From Organisations</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        NGOs, government bodies and civic platforms that can help with this issue.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((org) => (
          <OrgCard key={org.name} org={org} />
        ))}
      </div>

      {/* Fixed RTI card at the bottom (Change 7) */}
      {rti && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <FileText size={16} className="text-amber-700" aria-hidden />
            <h4 className="text-sm font-semibold text-amber-900">{rti.name}</h4>
            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
              {rti.kind}
            </span>
          </div>
          {rti.description && (
            <p className="mt-1.5 text-sm text-amber-900/90">{rti.description}</p>
          )}
          {rti.tip && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800">
              <Lightbulb size={13} className="mt-0.5 flex-shrink-0" aria-hidden />
              <span>{rti.tip}</span>
            </p>
          )}
          {rti.website && (
            <a
              href={rti.website}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              <Globe size={14} aria-hidden /> File an RTI
            </a>
          )}
        </div>
      )}
    </section>
  );
}
