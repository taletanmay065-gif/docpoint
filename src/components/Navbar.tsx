import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, User, LogOut, Calendar, Home as HomeIcon, MessageSquare, Users, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => handleNavigate('home')}
          >
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Stethoscope size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">DocPoint</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => handleNavigate('home')}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              <HomeIcon size={18} /> Home
            </button>
            <button 
              onClick={() => handleNavigate('doctors')}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${currentPage === 'doctors' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              <Users size={18} /> Doctors
            </button>
            <button 
              onClick={() => handleNavigate('symptoms')}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${currentPage === 'symptoms' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              <MessageSquare size={18} /> Symptom AI
            </button>
            <button 
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              <Calendar size={18} /> Dashboard
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-slate-900">{profile?.displayName || 'User'}</span>
              <span className="text-xs text-slate-500 capitalize">{profile?.role}</span>
            </div>
            <button 
              onClick={signOut}
              className="hidden md:block p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full left-0 z-40">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <div className="flex items-center justify-between p-3 mb-2 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">{profile?.displayName || 'User'}</span>
                <span className="text-xs text-slate-500 capitalize">{profile?.role}</span>
              </div>
              <button 
                onClick={signOut}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
            <button 
              onClick={() => handleNavigate('home')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-colors ${currentPage === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <HomeIcon size={20} /> Home
            </button>
            <button 
              onClick={() => handleNavigate('doctors')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-colors ${currentPage === 'doctors' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Users size={20} /> Doctors
            </button>
            <button 
              onClick={() => handleNavigate('symptoms')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-colors ${currentPage === 'symptoms' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MessageSquare size={20} /> Symptom AI
            </button>
            <button 
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-colors ${currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Calendar size={20} /> Dashboard
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
