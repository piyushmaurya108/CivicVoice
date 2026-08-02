import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  FilePenLine,
  MapPinned,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Waypoints
} from 'lucide-react';
import { describeError, fetchComplaints, fetchStats } from '../api/index.js';
import ComplaintCard from '../components/ComplaintCard.jsx';
import HeroIllustration from '../components/HeroIllustration.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const STEPS = [
  {
    icon: Camera,
    title: '1. Capture',
    description: 'Take a photo of the issue around you or describe it clearly if a photo is not available.'
  },
  {
    icon: MapPinned,
    title: '2. Pin',
    description: 'Drop a precise location pin so the report is tied to the right street and authority.'
  },
  {
    icon: Waypoints,
    title: '3. AI Match',
    description: 'We identify similar nearby reports and surface the strongest cluster for collective action.'
  },
  {
    icon: FilePenLine,
    title: '4. Submit',
    description: 'Get a ready-to-submit petition with the most relevant portal and escalation paths.'
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
};

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
    <div className="pb-10 pt-5 sm:pb-16 sm:pt-7">
      <div className="page-container space-y-8 sm:space-y-10">
        <motion.section
          className="premium-card overflow-hidden rounded-[30px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="max-w-[640px]">
              <motion.p variants={fadeUp} className="glass-badge px-3.5 py-2 text-[0.82rem]">
                <ShieldCheck size={15} className="text-brand-600" />
                Anonymous · Free · No login required
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mt-7 max-w-[640px] text-[3rem] font-bold leading-[0.95] tracking-[-0.065em] text-ink sm:text-[4.1rem]"
              >
                Turn Individual
                <br />
                Complaints Into
                <br />
                <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                  Collective Action
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 max-w-[560px] text-[1.05rem] leading-8 text-soft sm:text-[1.18rem]">
                Upload a photo, drop a pin, and CivicVoice will identify the issue,
                find others nearby, and hand you a ready-to-submit petition for the
                correct government authority.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3.5">
                <Link to="/report" className="primary-button h-12 rounded-[14px] px-5 text-[0.98rem]">
                  Report a Problem <ArrowRight size={17} />
                </Link>
                <Link to="/complaints" className="secondary-button h-12 rounded-[14px] px-5 text-[0.98rem]">
                  Browse complaints
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="lg:justify-self-end">
              <HeroIllustration />
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="premium-card rounded-[28px] px-4 py-4 sm:px-6 sm:py-5"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
        >
          <div className="grid gap-2 md:grid-cols-3 md:divide-x md:divide-line">
            <StatBox
              icon={TrendingUp}
              label="Total Complaints"
              value={loading ? '…' : stats?.total ?? 0}
            />
            <StatBox
              icon={Users}
              label="Reports This Week"
              value={loading ? '…' : stats?.recentCount ?? 0}
            />
            <StatBox
              icon={MapPinned}
              label="States Covered"
              value={loading ? '…' : stats?.statesCovered ?? 0}
            />
          </div>
          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
        </motion.section>

        <motion.section
          className="pt-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
        >
          <div className="text-center">
            <h2 className="section-title">How it works</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500/70" />
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-soft sm:text-lg">
              Four simple steps from photo to formal petition. No paperwork. No
              bureaucracy. No login.
            </p>
          </div>

          <div className="relative mt-10 grid gap-6 lg:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-[5.2rem] hidden border-t-2 border-dashed border-brand-200 lg:block" />
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                className="premium-card premium-card-hover relative px-6 py-8"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 shadow-[0_10px_25px_rgba(51,102,255,0.12)]">
                  <Icon size={28} />
                </div>
                <h3 className="mt-6 text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-soft sm:text-base">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="glass-badge border-line bg-white/90">
                <Sparkles size={15} className="text-brand-600" />
                Live civic reporting
              </div>
              <h2 className="section-title mt-5">Recent complaints</h2>
              <p className="section-copy mt-3 max-w-2xl">
                Latest issues reported by citizens across the platform.
              </p>
            </div>
            <Link to="/complaints" className="secondary-button">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {loading && (
              <div className="premium-card lg:col-span-3 px-6 py-12">
                <LoadingSpinner label="Loading recent complaints..." />
              </div>
            )}
            {!loading && recent.length > 0 && recent.map((c) => <ComplaintCard key={c._id} complaint={c} />)}
            {!loading && recent.length === 0 && !error && (
              <div className="premium-card lg:col-span-3 px-6 py-12 text-center text-sm text-soft">
                No complaints yet. Be the first to report a civic issue.
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] px-4 py-3 sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-brand-50 text-brand-600">
        <Icon size={28} />
      </div>
      <div>
        <div className="text-[2rem] font-bold tracking-[-0.05em] text-ink">{value}</div>
        <div className="text-sm text-soft">{label}</div>
      </div>
    </div>
  );
}
