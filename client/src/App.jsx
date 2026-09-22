import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ConsultationList from './pages/ConsultationList';
import ConsultationDetail from './pages/ConsultationDetail';
import Transparency from './pages/Transparency';
import OfficerDesk from './pages/OfficerDesk';
import CreateConsultation from './pages/CreateConsultation';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import About from './pages/About';
import Contact from './pages/Contact';
import GrievancePortal from './pages/GrievancePortal';
import GrievanceQueue from './pages/GrievanceQueue';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/consultations" element={<ConsultationList />} />
          <Route path="/consultations/:id" element={<ConsultationDetail />} />
          <Route path="/consultations/:id/transparency" element={<Transparency />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/grievances"
            element={
              <ProtectedRoute>
                <GrievancePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/grievances"
            element={
              <ProtectedRoute roles={['officer', 'admin']}>
                <GrievanceQueue />
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer"
            element={
              <ProtectedRoute roles={['officer', 'admin']}>
                <OfficerDesk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/new"
            element={
              <ProtectedRoute roles={['officer', 'admin']}>
                <CreateConsultation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/dashboard/:consultationId"
            element={
              <ProtectedRoute roles={['officer', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-sarokar-mist py-6 text-center text-xs text-ink/40">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link to="/about" className="hover:text-ink/70">About</Link>
          <Link to="/contact" className="hover:text-ink/70">Contact</Link>
          <Link to="/grievances" className="hover:text-ink/70">Grievance Portal</Link>
        </div>
        सरोकार · Sarokar — an e-consultation prototype for Nepal's e-governance ecosystem
      </footer>
    </div>
  );
}
