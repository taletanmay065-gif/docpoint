import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, User, CheckCircle, XCircle, Download, ExternalLink, Filter, Plus, ArrowRight, Activity, ClipboardList, FileText, Video, MessageCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import ChatModal from '../components/ChatModal';

interface PatientDashboardProps {
  onBookNew: () => void;
}

export default function PatientDashboard({ onBookNew }: PatientDashboardProps) {
  const { profile, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'schedules' | 'vault'>('schedules');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [activeChat, setActiveChat] = useState<{ appointment: Appointment, receiverId: string, receiverName: string } | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('patientId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setAppointments(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleUpdateProfilePicture = async (url: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to update profile picture in database.');
    }
  };

  const handleCancel = async (appId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await updateDoc(doc(db, 'appointments', appId), { status: 'cancelled' });
      setAppointments(apps => apps.map(app => app.id === appId ? { ...app, status: 'cancelled' } : app));
      toast.success('Appointment cancelled successfully.');
    } catch (err) {
      toast.error('Failed to cancel.');
    }
  };

  const downloadReceipt = (app: Appointment) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('DocPoint Appointment Receipt', 20, 30);
    doc.setFontSize(14);
    doc.text(`Patient: ${app.patientName}`, 20, 50);
    doc.text(`Doctor: ${app.doctorName}`, 20, 60);
    doc.text(`Date: ${app.date}`, 20, 70);
    doc.text(`Time: ${app.startTime}`, 20, 80);
    doc.text(`Status: ${app.status.toUpperCase()}`, 20, 90);
    doc.text(`Payment: ${app.paymentStatus?.toUpperCase() || 'PAID'}`, 20, 100);
    if (app.prescription) {
        doc.text('Prescription:', 20, 120);
        doc.text(app.prescription, 20, 130);
    }
    doc.save(`DocPoint_Receipt_${app.id.slice(0, 6)}.pdf`);
    toast.success('Receipt downloaded!');
  };

  const filteredApps = filter === 'all' ? appointments : appointments.filter(app => app.status === filter);
  const medicalVault = appointments.filter(app => app.status === 'completed' || app.prescription);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6">
        <div className="flex items-center gap-6">
          <div className="shrink-0 transform scale-75 -ml-4 -mt-4 origin-top-left">
             <ImageUpload 
                userId={user?.uid || 'temp'} 
                pathPrefix="profiles"
                currentImage={profile?.photoURL}
                onImageUploaded={handleUpdateProfilePicture}
             />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              DocPoint Vault
            </h1>
            <p className="text-slate-500 font-medium">Manage your personal health data & schedules.</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[1.25rem]">
          <button 
            onClick={() => setActiveTab('schedules')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedules' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Schedules
          </button>
          <button 
            onClick={() => setActiveTab('vault')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'vault' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Health Vault
          </button>
        </div>
      </div>

      {activeTab === 'schedules' ? (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex bg-white p-1 rounded-xl border border-slate-100">
                {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button 
                onClick={onBookNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm"
              >
                New Booking <Plus size={16} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="bg-white h-32 rounded-[2rem] animate-pulse"></div>)}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredApps.length === 0 ? (
                  <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                    <Calendar className="mx-auto text-slate-300 mb-4 opacity-30" size={64} />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching activities</p>
                  </div>
                ) : (
                  filteredApps.map((app) => (
                    <div 
                      key={app.id} 
                      className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-blue-100/30 transition-all flex flex-col md:flex-row md:items-center gap-8 group"
                    >
                      <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : app.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                         {app.status === 'confirmed' ? <CheckCircle size={32} /> : app.status === 'cancelled' ? <XCircle size={32} /> : <Clock size={32} />}
                      </div>

                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-xl font-bold text-slate-900 uppercase group-hover:text-blue-600 transition-colors">{app.doctorName}</h3>
                           <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                             {app.status}
                           </span>
                         </div>
                         <div className="flex flex-wrap gap-5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                           <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-600" /> {app.date}</div>
                           <div className="flex items-center gap-2"><Clock size={14} className="text-blue-600" /> {app.startTime}</div>
                           <div className="flex items-center gap-2"><Activity size={14} className="text-blue-600" /> {app.paymentStatus || 'Paid'}</div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {app.status === 'confirmed' && (
                          <a 
                            href={`https://meet.jit.si/docpoint-consultation-${app.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-12 px-4 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 rounded-2xl text-[10px] uppercase font-bold tracking-widest transition-all gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                            title="Join Video Call"
                          >
                            <Video size={16} /> Join Call
                          </a>
                        )}
                        {(app.status === 'confirmed' || app.status === 'completed') && (
                          <button 
                            onClick={() => setActiveChat({ appointment: app, receiverId: app.doctorId, receiverName: app.doctorName || 'Doctor' })}
                            className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 rounded-2xl transition-all"
                            title="Message Doctor"
                          >
                            <MessageCircle size={20} />
                          </button>
                        )}
                        <button 
                          onClick={() => downloadReceipt(app)}
                          className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                          title="Download Receipt"
                        >
                          <Download size={20} />
                        </button>
                        {app.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancel(app.id)}
                            className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 rounded-2xl transition-all"
                            title="Cancel Appointment"
                          >
                            <XCircle size={20} />
                          </button>
                        )}
                        {app.prescription && (
                          <button 
                             className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                             onClick={() => toast.success('Viewing Medical Note')}
                          >
                             Medical Note <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-10 -mt-10" />
               <h3 className="text-xl font-bold mb-8 flex items-center gap-2 relative z-10">
                 <Activity className="text-blue-400" size={20} /> Health Snapshot
               </h3>
               <div className="space-y-6 relative z-10">
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Visits</p>
                   <p className="text-4xl font-black text-white">{appointments.length}</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Active Prescriptions</p>
                   <p className="text-4xl font-black text-white">{appointments.filter(a => a.prescription).length}</p>
                 </div>
                 <div className="p-8 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-600/40">
                   <p className="font-bold text-lg mb-3">Quick Records</p>
                   <p className="text-white/70 text-xs mb-6 leading-relaxed">Share your entire history with a new doctor instantly via secure profile link.</p>
                   <button className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95">Open Sharing Console</button>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
               <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase flex items-center gap-2">
                 <ClipboardList size={18} className="text-purple-600" /> Notifications
               </h3>
               <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                     <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0 animate-pulse" />
                     <div>
                        <p className="text-xs font-bold text-slate-900 uppercase mb-1">Follow-up Reminder</p>
                        <p className="text-[10px] text-slate-500">Don't forget your sessions with Dr. Sarah tomorrow.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Vault Header Card */}
          <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 blur-[120px] -mr-64 -mt-64" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Secure Medical Cloud</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Encrypted
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic tracking-tighter leading-none">
                  Your <span className="text-blue-400">Medical History</span>
                </h2>
                <p className="text-slate-400 font-medium text-lg">
                  A consolidated repository of all your consultations, prescriptions, and medical insights.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] w-full md:w-auto min-w-[300px]">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Privacy Score</p>
                  <span className="text-xl font-black text-emerald-400 italic">9.8/10</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-blue-500 w-[98%] rounded-full" />
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed font-bold uppercase tracking-widest text-center">Data strictly protected by DocPoint Protocol</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-12">
            {/* Sidebar Filters & Search */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Quick Search</h4>
                <div className="relative group">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={16} />
                  <input 
                    type="text"
                    placeholder="Search by diagnosis or doctor..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-[2rem] p-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Security Tip</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Never share your health profile link with unauthorized individuals. You can revoke doctor access anytime from the Sharing Console.
                </p>
              </div>
            </div>

            {/* Main Records List */}
            <div className="lg:col-span-3 space-y-8">
              {loading ? (
                <div className="space-y-6">
                  {[1,2].map(i => <div key={i} className="h-48 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />)}
                </div>
              ) : medicalVault.length > 0 ? (
                <div className="space-y-6">
                  {medicalVault
                    .filter(app => 
                      app.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      app.prescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      app.notes?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((app, idx) => (
                    <div key={app.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-blue-200 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 text-[120px] font-black italic text-slate-50 leading-none select-none -mr-10 -mt-10 pointer-events-none group-hover:text-blue-50 transition-colors">
                        0{idx + 1}
                      </div>

                      <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-[10deg] transition-transform">
                              <FileText size={32} />
                            </div>
                            <div>
                              <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight mb-1">{app.doctorName}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{app.date}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference ID: #{app.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => downloadReceipt(app)}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl active:scale-95"
                          >
                            Generate Report <Download size={16} />
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <ClipboardList size={16} className="text-blue-600" />
                              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Consultation Notes</h5>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-white transition-all min-h-[100px]">
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {app.notes || 'No doctor notes were recorded for this session.'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity size={16} className="text-emerald-500" />
                              <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Medical Prescription</h5>
                            </div>
                            <div className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100/50 group-hover:bg-white transition-all min-h-[100px]">
                              <p className={`text-sm leading-relaxed font-bold italic ${app.prescription ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {app.prescription ? `"${app.prescription}"` : 'No active prescriptions record.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-32 rounded-[4rem] text-center border-2 border-dashed border-slate-200">
                  <ClipboardList className="mx-auto text-slate-200 mb-6 opacity-20" size={80} />
                  <p className="text-slate-400 font-black uppercase text-sm tracking-[0.2em] mb-2">Health Vault Empty</p>
                  <p className="text-slate-300 text-sm max-w-xs mx-auto">Once consultations are completed, their records will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeChat && (
        <ChatModal
          appointment={activeChat.appointment}
          receiverId={activeChat.receiverId}
          receiverName={activeChat.receiverName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
