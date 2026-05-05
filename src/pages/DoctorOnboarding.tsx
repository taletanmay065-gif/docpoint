import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Award, IndianRupee, Clock, CheckCircle, ChevronRight, ChevronLeft, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

interface OnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 
  'Pediatrician', 'Psychiatrist', 'Orthopedic', 'Gynecologist', 'Dentist'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export default function DoctorOnboarding({ onComplete, onBack }: OnboardingProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    photoURL: profile?.photoURL || '',
    specialization: '',
    experience: 0,
    fees: 500,
    description: '',
    registrationNumber: '',
    certificateInfo: '',
    availability: DAYS.reduce((acc, day) => ({ ...acc, [day]: ['09:00', '10:00', '11:00'] }), {} as Record<string, string[]>)
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update user role to doctor
      const updateData: any = {
        role: 'doctor',
        displayName: formData.displayName
      };
      if (formData.photoURL) {
        updateData.photoURL = formData.photoURL;
      }
      await updateDoc(doc(db, 'users', user.uid), updateData);

      // 2. Create doctor profile
      const doctorProfile = {
        userId: user.uid,
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        specialization: formData.specialization,
        experience: Number(formData.experience),
        fees: Number(formData.fees),
        description: formData.description,
        registrationNumber: formData.registrationNumber,
        certificateInfo: formData.certificateInfo,
        availability: formData.availability,
        rating: 5.0,
      };

      await setDoc(doc(db, 'doctors', user.uid), doctorProfile);

      
      toast.success('Professional profile created successfully!');
      onComplete();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'doctors');
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (day: string, slot: string) => {
    setFormData(prev => {
      const daySlots = prev.availability[day] || [];
      const newSlots = daySlots.includes(slot)
        ? daySlots.filter(s => s !== slot)
        : [...daySlots, slot];
      return {
        ...prev,
        availability: { ...prev.availability, [day]: newSlots }
      };
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professional Onboarding</h1>
          <p className="text-slate-500">Tell us more about your medical practice.</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all ${step >= i ? 'bg-blue-600 w-8' : 'bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  <Stethoscope size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 uppercase">Basic Information</h2>
                  <p className="text-sm text-slate-500">Let's start with your identity and expertise.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="mb-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="shrink-0">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Profile Picture</label>
                    <ImageUpload 
                      userId={user?.uid || 'temp'} 
                      pathPrefix="profiles"
                      currentImage={formData.photoURL}
                      onImageUploaded={(url) => setFormData({ ...formData, photoURL: url })}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Professional Name</label>
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                      placeholder="e.g. Dr. Jane Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Specialization</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SPECIALIZATIONS.map(spec => (
                      <button
                        key={spec}
                        onClick={() => setFormData({ ...formData, specialization: spec })}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                          formData.specialization === spec 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-100 hover:bg-blue-50'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2">
                  <ChevronLeft size={20} /> Exit
                </button>
                <button 
                  onClick={nextStep} 
                  disabled={!formData.displayName || !formData.specialization}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95"
                >
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                  <Award size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 uppercase">Expertise & Fees</h2>
                  <p className="text-sm text-slate-500">Your experience and consultation charges.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Registration Number</label>
                  <input 
                    type="text" 
                    value={formData.registrationNumber}
                    onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="e.g. MCI-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Degree / College</label>
                  <input 
                    type="text" 
                    value={formData.certificateInfo}
                    onChange={e => setFormData({ ...formData, certificateInfo: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="e.g. MBBS, AIIMS Delhi"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Years of Experience</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Consultation Fee (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      value={formData.fees}
                      onChange={e => setFormData({ ...formData, fees: Number(e.target.value) })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Profile Description / About Bio</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell patients about your background, expertise, and clinics..."
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium h-32 resize-none"
                />
              </div>

              <div className="flex justify-between pt-8">
                <button onClick={prevStep} className="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2">
                  <ChevronLeft size={20} /> Back
                </button>
                <button 
                  onClick={nextStep} 
                  disabled={!formData.description}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95"
                >
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                  <Clock size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 uppercase">Availability Schedule</h2>
                  <p className="text-sm text-slate-500">Pick the days and times you are available for consultations.</p>
                </div>
              </div>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {DAYS.map(day => (
                  <div key={day} className="bg-slate-50 p-6 rounded-3xl">
                    <h4 className="font-bold text-slate-900 mb-3">{day}</h4>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          onClick={() => toggleSlot(day, slot)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                            formData.availability[day]?.includes(slot)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <button onClick={prevStep} className="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2">
                  <ChevronLeft size={20} /> Back
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-200"
                >
                  {loading ? 'Completing...' : 'Complete Registration'} <CheckCircle size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
