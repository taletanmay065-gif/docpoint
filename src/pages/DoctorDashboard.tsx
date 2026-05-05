import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, getDoc } from 'firebase/firestore';
import { Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, CheckCircle, User, FileText, Send, XCircle, Shield, Video, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import ChatModal from '../components/ChatModal';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>('appointments');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<{ appointment: Appointment, receiverId: string, receiverName: string } | null>(null);

  useEffect(() => {
    const fetchDocProfile = async () => {
      if (!user) return;
      const d = await getDoc(doc(db, 'doctors', user.uid));
      if (d.exists()) setDoctorProfile(d.data());
    };
    fetchDocProfile();
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', user.uid),
          orderBy('createdAt', 'desc')
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

  const handleUpdate = async () => {
    if (!selectedApp) return;
    try {
      await updateDoc(doc(db, 'appointments', selectedApp.id), {
        status: 'completed',
        notes,
        prescription
      });
      setAppointments(apps => apps.map(app => app.id === selectedApp.id ? { ...app, status: 'completed', notes, prescription } : app));
      toast.success('Appointment updated and completed!');
      setSelectedApp(null);
      setNotes('');
      setPrescription('');
    } catch (err) {
      toast.error('Failed to update.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase">Doctor Console</h1>
          <p className="text-slate-500">Manage your patients and professional credentials.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Appointments
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            My Profile
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'appointments' ? (
          <motion.div 
            key="apps"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-8"
          >
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" /> Recent Appointments
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="bg-white h-24 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
               <span className="text-slate-400">No appointments scheduled.</span>
            </div>
          ) : (
            appointments.map(app => (
              <div 
                key={app.id} 
                onClick={() => app.status === 'confirmed' && setSelectedApp(app)}
                className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer flex items-center justify-between ${app.status === 'confirmed' ? 'border-blue-100 hover:border-blue-300 hover:shadow-md' : 'border-slate-100 opacity-60'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">
                    {app.patientName?.[0] || 'P'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase">{app.patientName}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                       <span>{app.date}</span>
                       <span>{app.startTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(app.status === 'confirmed' || app.status === 'completed') && (
                     <button 
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         setActiveChat({ appointment: app, receiverId: app.patientId, receiverName: app.patientName || 'Patient' }); 
                       }}
                       className={`p-2 rounded-full transition-all ${app.status === 'confirmed' ? 'text-indigo-500 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
                       title="Message Patient"
                     >
                       <MessageCircle size={18} />
                     </button>
                  )}
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {app.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`lg:col-span-1 ${selectedApp ? 'order-first lg:order-none' : ''}`}>
          {selectedApp ? (
            <div className="bg-white rounded-[2rem] p-8 border border-blue-200 shadow-xl shadow-blue-50 lg:sticky lg:top-24 mb-8 lg:mb-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase">Patient Session</h3>
                  <p className="text-blue-600 font-medium text-sm">{selectedApp.patientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveChat({ appointment: selectedApp, receiverId: selectedApp.patientId, receiverName: selectedApp.patientName || 'Patient' })}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <a
                    href={`https://meet.jit.si/docpoint-consultation-${selectedApp.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Video size={14} /> Call
                  </a>
                  <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Clinical Notes</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    placeholder="Add symptoms, diagnosis, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prescription</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    rows={3}
                    placeholder="Medicines and dosage"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  Save & Complete <Send size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[2rem] p-12 text-center border border-dashed border-slate-200 sticky top-24">
              <FileText className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-400 font-medium italic">Select an active appointment to start the session.</p>
            </div>
          )}
        </div>
      </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl uppercase">
                  {doctorProfile?.displayName?.[0] || 'D'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase">{doctorProfile?.displayName}</h3>
                  <p className="text-blue-600 font-semibold">{doctorProfile?.specialization}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Registration No</span>
                    <span className="font-bold text-slate-900">{doctorProfile?.registrationNumber || 'Not provided'}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Experience</span>
                    <span className="font-bold text-slate-900">{doctorProfile?.experience} Years</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Degree / Certifications</span>
                  <span className="font-bold text-slate-900">{doctorProfile?.certificateInfo || 'Not provided'}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Consultation Fee</span>
                  <span className="text-xl font-bold text-slate-900">₹{doctorProfile?.fees}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2 px-1">About Me</span>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl">
                    {doctorProfile?.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-bold text-slate-900 uppercase mb-8 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} /> Weekly Availability
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {doctorProfile?.availability && Object.entries(doctorProfile.availability).map(([day, slots]: [string, any]) => (
                  <div key={day} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-900 text-sm">{day}</span>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot: string) => (
                        <span key={slot} className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-blue-600 border border-blue-100 shadow-sm">
                          {slot}
                        </span>
                      ))}
                      {slots.length === 0 && <span className="text-xs text-slate-400 italic">No slots available</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
