import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import SubmitComplaint from './pages/SubmitComplaint.jsx';
import ComplaintFeed from './pages/ComplaintFeed.jsx';
import ComplaintDetail from './pages/ComplaintDetail.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<SubmitComplaint />} />
          <Route path="/complaints" element={<ComplaintFeed />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        🏛️ CivicVoice — turning individual complaints into collective action
      </footer>
    </div>
  );
}
