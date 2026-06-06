import { useMemo, useState } from 'react';
import { Filter, Inbox, Map as MapIcon, List, X } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard.jsx';
import ComplaintMap from '../components/ComplaintMap.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import useComplaints from '../hooks/useComplaints.js';
import {
  TYPE_OPTIONS,
  SEVERITY_OPTIONS
} from '../utils/formatters.js';

const PAGE_SIZE = 12;

export default function ComplaintFeed() {
  const [filters, setFilters] = useState({
    type: '',
    severity: ''
  });
  const [page, setPage] = useState(1);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            All complaints
          </h1>
          <p className="text-sm text-gray-600">
            {loading
              ? 'Loading…'
              : `${total} complaint${total === 1 ? '' : 's'} ${
                  hasFilters ? 'matching your filters' : 'reported so far'
                }`}
          </p>
        </div>

        {/* Mobile view toggle */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium ${
              mobileView === 'list' ? 'bg-brand-600 text-white' : 'text-gray-700'
            }`}
          >
            <List size={14} /> List
          </button>
          <button
            type="button"
            onClick={() => setMobileView('map')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium ${
              mobileView === 'map' ? 'bg-brand-600 text-white' : 'text-gray-700'
            }`}
          >
            <MapIcon size={14} /> Map
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Filter size={14} aria-hidden />
            Filters:
          </div>

          <FilterSelect
            label="Type"
            value={filters.type}
            onChange={(v) => updateFilter('type', v)}
            options={TYPE_OPTIONS}
          />
          <FilterSelect
            label="Severity"
            value={filters.severity}
            onChange={(v) => updateFilter('severity', v)}
            options={SEVERITY_OPTIONS}
          />

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* MAP */}
        <section
          className={`lg:col-span-3 ${
            mobileView === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="lg:sticky lg:top-20">
            <ComplaintMap
              complaints={complaints}
              height="calc(100vh - 220px)"
              initialZoom={5}
            />
          </div>
        </section>

        {/* LIST */}
        <section
          className={`lg:col-span-2 ${
            mobileView === 'list' ? 'block' : 'hidden lg:block'
          }`}
        >
          {loading && complaints.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-10 shadow-sm">
              <LoadingSpinner label="Loading complaints…" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && complaints.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <Inbox className="mx-auto mb-2 text-gray-400" aria-hidden />
              <p className="text-sm text-gray-600">
                No complaints found{hasFilters ? ' for these filters.' : ' yet.'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {complaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-600">
                Page <strong>{page}</strong> of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
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
