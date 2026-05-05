import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { DoctorProfile } from '../types';
import { Search, MapPin, Star, Filter, Briefcase, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DoctorListProps {
  onSelectDoctor: (id: string) => void;
}

export default function DoctorList({ onSelectDoctor }: DoctorListProps) {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'fees' | 'experience'>('rating');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const q = specialization === 'All' 
          ? query(collection(db, 'doctors'))
          : query(collection(db, 'doctors'), where('specialization', '==', specialization));
        
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data()
        })) as DoctorProfile[];
        
        if (docs.length === 0 && specialization === 'All') {
          const mockDocs: DoctorProfile[] = [
            { userId: 'doc-1', displayName: 'Dr. Sarah Johnson', specialization: 'Cardiologist', experience: 12, fees: 1500, description: 'Expert in non-invasive cardiology.', rating: 4.9, availability: {}, registrationNumber: 'MP-88220' },
            { userId: 'doc-2', displayName: 'Dr. Michael Chen', specialization: 'Dermatologist', experience: 8, fees: 1000, description: 'Specializes in cosmetic dermatology.', rating: 4.8, availability: {}, registrationNumber: 'MP-11223' },
            { userId: 'doc-3', displayName: 'Dr. Elena Rodriguez', specialization: 'Pediatrician', experience: 15, fees: 1200, description: 'Compassionate care for children.', rating: 5.0, availability: {}, registrationNumber: 'MP-99001' },
            { userId: 'doc-4', displayName: 'Dr. David Wilson', specialization: 'Neurologist', experience: 20, fees: 2000, description: 'Focuses on complex neurological disorders.', rating: 4.7, availability: {}, registrationNumber: 'MP-33445' }
          ];
          setDoctors(mockDocs);
        } else {
          setDoctors(docs);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [specialization]);

  const filteredDoctors = doctors
    .filter(doc => 
      doc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fees') return a.fees - b.fees;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });

  const specializations = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Gastroenterologist'];

  return (
    <div className="space-y-12">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight leading-none italic">
            Find Your <span className="text-blue-400">Specialist</span>
          </h1>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={24} />
            <input 
              type="text"
              placeholder="Search by name, specialization, or condition..."
              className="w-full bg-white/10 border border-white/20 rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder:text-slate-500 focus:outline-none focus:bg-white focus:text-slate-900 transition-all text-lg shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
          {specializations.map(s => (
            <button
              key={s}
              onClick={() => setSpecialization(s)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${specialization === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <Filter size={14} className="ml-3 text-slate-400" />
          <button onClick={() => setSortBy('rating')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${sortBy === 'rating' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Rating</button>
          <button onClick={() => setSortBy('fees')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${sortBy === 'fees' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Fees</button>
          <button onClick={() => setSortBy('experience')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${sortBy === 'experience' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Experience</button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-[3rem] h-96 animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectDoctor(doctor.userId)}
              className="group cursor-pointer bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-blue-200/40 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] group-hover:bg-blue-600 transition-colors" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  {doctor.photoURL ? (
                    <img 
                      src={doctor.photoURL} 
                      alt={doctor.displayName}
                      className="w-20 h-20 rounded-3xl object-cover shadow-lg group-hover:scale-110 transition-transform border-2 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center font-black text-3xl uppercase shadow-lg group-hover:scale-110 transition-transform">
                      {doctor.displayName.split(' ').map(n=>n[0]).join('')}
                    </div>
                  )}
                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> {doctor.rating}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-tight mb-1">{doctor.displayName}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">{doctor.specialization}</p>
                    {doctor.registrationNumber && (
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black border border-emerald-100 uppercase">Verified</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6 mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee</p>
                    <p className="text-xl font-black text-slate-900 leading-none">₹{doctor.fees}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exp.</p>
                    <p className="text-xl font-black text-slate-900 leading-none">{doctor.experience}+ Yrs</p>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                  Check Schedule <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
              <Search className="mx-auto text-slate-200 mb-6 opacity-20" size={80} />
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No matching specialists</h3>
              <p className="text-slate-300 text-sm mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
