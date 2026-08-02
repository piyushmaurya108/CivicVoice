import { useMemo, useState } from 'react';
import { Filter, Inbox, List, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard.jsx';
import ComplaintMap from '../components/ComplaintMap.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import useComplaints from '../hooks/useComplaints.js';
import { TYPE_OPTIONS, SEVERITY_OPTIONS } from '../utils/formatters.js';

const PAGE_SIZE = 12;

export default function ComplaintFeed() {
  const [filters, setFilters] = useState({ type: '', severity: '' });
  const [page, setPage] = useState(1);
  const [mobileView, setMobileView] = useState('list');

  const params = useMemo(() => {
    const p = { page, limit: PAGE_SIZE };
    if (filters.type) p.type = filters.type;
    if (filters.severity) p.severity = filters.severity;
    return p;
  }, [filters, page]);

  const { complaints, total, totalPages, loading, error } = useComplaints(params);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', severity: '' });
    setPage(1);
  };

  const hasFilters = filters.type || filters.severity;

  return (
    <div className="page-container py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <div className="glass-badge border-line bg-white/90">
            <SlidersHorizontal size={15} className="text-brand-600" />
            Live complaint feed
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em] text-ink sm:text-5xl">
            All complaints
          </h1>
          <p className="mt-4 text-lg leading-8 text-soft">
            {loading
              ? 'Loading complaints...'
              : `${total} complaint${total === 1 ? '' : 's'} ${hasFilters ? 'matching your filters' : 'reported so far'}.`}
          </p>
        </div>

        <div className="inline-flex rounded-2xl border border-line bg-white p-1 shadow-soft sm:hidden">
          <button type="button" onClick={() => setMobileView('list')} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${mobileView === 'list' ? 'bg-brand-500 text-white' : 'text-soft'}`}>
            <span className="inline-flex items-center gap-2"><List size={14} /> List</span>
          </button>
          <button type="button" onClick={() => setMobileView('map')} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${mobileView === 'map' ? 'bg-brand-500 text-white' : 'text-soft'}`}>
            <span className="inline-flex items-center gap-2"><MapIcon size={14} /> Map</span>
          </button>
        </div>
      </div>

      <div className="premium-card mb-6 px-5 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <Filter size={14} />
            Filters
          </div>
          <FilterSelect label="Type" value={filters.type} onChange={(v) => updateFilter('type', v)} options={TYPE_OPTIONS} />
          <FilterSelect label="Severity" value={filters.severity} onChange={(v) => updateFilter('severity', v)} options={SEVERITY_OPTIONS} />
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="secondary-button px-4 py-2.5">
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className={`lg:col-span-3 ${mobileView === 'map' ? 'block' : 'hidden lg:block'}`}>
          <div className="premium-card overflow-hidden lg:sticky lg:top-28">
            <ComplaintMap complaints={complaints} height="calc(100vh - 210px)" initialZoom={5} />
          </div>
        </section>

        <section className={`lg:col-span-2 ${mobileView === 'list' ? 'block' : 'hidden lg:block'}`}>
          {loading && complaints.length === 0 && (
            <div className="premium-card px-6 py-12">
              <LoadingSpinner label="Loading complaints..." />
            </div>
          )}

          {error && (
            <div className="premium-card border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && complaints.length === 0 && (
            <div className="premium-card px-6 py-12 text-center">
              <Inbox className="mx-auto mb-3 text-mist" />
              <p className="text-sm text-soft">No complaints found{hasFilters ? ' for these filters.' : ' yet.'}</p>
            </div>
          )}

          <div className="space-y-4">
            {complaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="premium-card mt-5 flex items-center justify-between px-5 py-4">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className="secondary-button px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50">
                Prev
              </button>
              <span className="text-sm text-soft">
                Page <strong className="text-ink">{page}</strong> of {totalPages}
              </span>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading} className="secondary-button px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-input min-w-[170px]">
        <option value="">{label}: All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {label}: {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
