import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Login from './pages/Login';
import Home from './pages/Home';
import DoctorList from './pages/DoctorList';
import DoctorProfile from './pages/DoctorProfile';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorOnboarding from './pages/DoctorOnboarding';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import SymptomChecker from './components/SymptomChecker';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Redirect to onboarding if doctor hasn't completed it
  // Or if they click "Join as Doctor"
  
  const navigateTo = (page: string, doctorId?: string) => {
    setCurrentPage(page);
    if (doctorId) setSelectedDoctorId(doctorId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home 
          onExplore={() => navigateTo('doctors')} 
          onCheckSymptoms={() => navigateTo('symptoms')} 
          onJoinAsDoctor={() => navigateTo('doctor-onboarding')} 
        />;
      case 'doctors':
        return <DoctorList onSelectDoctor={(id) => navigateTo('profile', id)} />;
      case 'profile':
        return <DoctorProfile doctorId={selectedDoctorId!} onBack={() => navigateTo('doctors')} onBooked={() => navigateTo('dashboard')} />;
      case 'dashboard':
        if (profile?.role === 'admin') return <AdminPanel />;
        return profile?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard onBookNew={() => navigateTo('doctors')} />;
      case 'symptoms':
        return <SymptomChecker onBack={() => navigateTo('home')} />;
      case 'doctor-onboarding':
        return <DoctorOnboarding onComplete={() => navigateTo('dashboard')} onBack={() => navigateTo('home')} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Home 
          onExplore={() => navigateTo('doctors')} 
          onCheckSymptoms={() => navigateTo('symptoms')} 
          onJoinAsDoctor={() => navigateTo('doctor-onboarding')}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onNavigate={navigateTo} currentPage={currentPage} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
