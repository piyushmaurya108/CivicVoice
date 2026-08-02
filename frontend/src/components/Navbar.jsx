import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/report', label: 'Report Problem' },
  { to: '/complaints', label: 'View Complaints' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50 px-3 pt-3 sm:px-5"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        className={`page-container premium-card flex items-center justify-between rounded-[26px] px-4 py-3.5 transition-all sm:px-6 ${
          scrolled ? 'bg-white/85 backdrop-blur-xl' : 'bg-white/92'
        }`}
      >
        <Link
          to="/"
          className="flex items-center gap-3 text-[1.55rem] font-bold tracking-[-0.04em] text-ink"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Building2 size={21} strokeWidth={2.1} />
          </span>
          <span>CivicVoice</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 shadow-[inset_0_0_0_1px_rgba(51,102,255,0.08)]'
                    : 'text-soft hover:bg-surfaceAlt hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white text-soft lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="page-container mt-3 lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="premium-card flex flex-col gap-2 rounded-[28px] px-3 py-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-soft hover:bg-surfaceAlt hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
