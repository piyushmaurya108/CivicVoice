import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Brain,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPinned
} from 'lucide-react';
import { describeError, fetchComplaints, fetchStats } from '../api/index.js';
import ComplaintCard from '../components/ComplaintCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const STEPS = [
  {
    icon: Camera,
    title: '1. Upload a photo',
    description: 'Snap or upload a picture of the problem — pothole, garbage, sewage, anything broken in your area.'
  },
  {
    icon: Brain,
    title: '2. AI analyses it',
    description: 'Gemini Vision automatically identifies the issue type, severity, and writes a formal description.'
  },
  {
    icon: Users,
    title: '3. We find others',
    description: 'Within 500 metres, we cluster similar reports — your complaint is no longer just one voice.'
  },
  {
    icon: Building2,
    title: '4. Get the right portal',
    description: 'You receive the correct government grievance portal, contact details, and a ready-to-paste petition.'
  }
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, complaintsRes] = await Promise.allSettled([
          fetchStats(),
          fetchComplaints({ page: 1, limit: 3 })
        ]);
        if (cancelled) return;

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value);
        } else {
          setError(describeError(statsRes.reason));
        }
        if (complaintsRes.status === 'fulfilled') {
          setRecent(complaintsRes.value.complaints || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <ShieldCheck size={14} />
              Anonymous · Free · No login required
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Turn Individual Complaints Into Collective Action
            </h1>
            <p className="mt-4 text-base text-white/90 sm:text-lg">
              Upload a photo, drop a pin, and CivicVoice will identify the issue, find others nearby, and hand you a ready-to-submit petition for the correct government authority.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
              >
                Report a Problem <ArrowRight size={16} />
              </Link>
              <Link
                to="/complaints"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Browse complaints
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-3 sm:p-6">
          <StatBox
            icon={TrendingUp}
            label="Total complaints"
            value={loading ? '…' : stats?.total ?? 0}
          />
          <StatBox
            icon={Users}
            label="Reports this week"
            value={loading ? '…' : stats?.recentCount ?? 0}
          />
          <StatBox
            icon={MapPinned}
            label="States covered"
            value={loading ? '…' : stats?.statesCovered ?? 0}
          />
        </div>
        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How it works</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">
            Four steps from photo to formal petition. No paperwork. No bureaucracy. No login.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Icon size={20} aria-hidden />
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent complaints</h2>
              <p className="text-sm text-gray-600">Latest issues reported by citizens</p>
            </div>
            <Link
              to="/complaints"
              className="hidden items-center gap-1 text-sm font-medium text-brand-700 hover:underline sm:inline-flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {loading && (
              <div className="lg:col-span-3">
                <LoadingSpinner label="Loading recent complaints…" />
              </div>
            )}
            {!loading &&
              recent.length > 0 &&
              recent.map((c) => <ComplaintCard key={c._id} complaint={c} />)}
            {!loading && recent.length === 0 && !error && (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 lg:col-span-3">
                No complaints yet. Be the first to report a civic issue.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
        <Icon size={20} aria-hidden />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      </div>
    </div>
  );
}
