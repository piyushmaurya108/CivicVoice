import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import SubmitComplaint from './pages/SubmitComplaint.jsx';
import ComplaintFeed from './pages/ComplaintFeed.jsx';
import ComplaintDetail from './pages/ComplaintDetail.jsx';
import NotFound from './pages/NotFound.jsx';

function Footer() {
  return (
    <footer className="page-container pb-8 pt-16">
      <div className="premium-card px-6 py-5 text-center text-sm text-soft sm:px-8">
        CivicVoice helps citizens turn local reports into coordinated public action.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[580px] bg-[radial-gradient(circle_at_center,rgba(51,102,255,0.09),transparent_58%)]" />
      <Navbar />
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<SubmitComplaint />} />
          <Route path="/complaints" element={<ComplaintFeed />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.main>
      <Footer />
    </div>
  );
}
