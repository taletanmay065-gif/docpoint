import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Search, ShieldCheck, Clock, ArrowRight, Activity, Globe2, HeartPulse, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import CobeGlobe from '../components/CobeGlobe';

interface HomeProps {
  onExplore: () => void;
  onCheckSymptoms: () => void;
  onJoinAsDoctor: () => void;
}

export default function Home({ onExplore, onCheckSymptoms, onJoinAsDoctor }: HomeProps) {
  const { profile } = useAuth();

  return (
    <div className="space-y-32 pb-24 overflow-hidden">
      {/* Hero Section Container (Full Height-ish) */}
      <section className="relative min-h-[90vh] flex items-center justify-center -mt-10 overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[120px] opacity-50 -z-20"></div>

        <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-full text-sm font-bold shadow-md uppercase tracking-widest border border-blue-50"
            >
              <Globe2 size={16} /> Global Healthcare Access
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl lg:text-[5.5rem] font-black text-slate-900 leading-[1.05] tracking-tight"
            >
              Connecting <br />
              <span className="text-blue-600">Doctors</span> <br />
              Around Earth.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl text-slate-600 max-w-xl leading-relaxed font-sans"
            >
              DocPoint provides instant access to the world's best medical professionals. 
              Book appointments, check symptoms with AI, and manage your health securely.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-5"
            >
              <button 
                onClick={onExplore}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-blue-300 transition-all active:scale-95 text-lg w-full sm:w-auto"
              >
                Get Started <ArrowRight size={22} />
              </button>
              <button 
                onClick={onCheckSymptoms}
                className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-10 py-5 rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center gap-3 transition-all active:scale-95 text-lg border border-slate-100 w-full sm:w-auto"
              >
                <HeartPulse size={22} className="text-red-500" /> AI Symptoms
              </button>
            </motion.div>
          </div>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="relative hidden lg:flex justify-center items-center"
          >
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-[150px] opacity-20 transform scale-75 -z-10 animate-pulse mix-blend-multiply"></div>
            <CobeGlobe />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Our Services</h2>
          <p className="text-lg text-slate-600 font-sans">Everything you need for your healthcare journey, all in one secure platform.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Search className="text-blue-600" size={36} />,
              title: "Find Specialists",
              desc: "Search globally or locally for verified doctors across 50+ specializations."
            },
            {
              icon: <Clock className="text-green-600" size={36} />,
              title: "Instant Booking",
              desc: "Real-time slot availability. Book instantly without waiting for manual confirmations."
            },
            {
              icon: <HeartPulse className="text-red-500" size={36} />,
              title: "AI Symptom Checker",
              desc: "Analyze your symptoms with advanced AI to find the right department immediately."
            },
            {
              icon: <Activity className="text-purple-600" size={36} />,
              title: "Health Records",
              desc: "Store and manage your medical history, prescriptions, and test results securely."
            },
            {
              icon: <Globe2 className="text-cyan-600" size={36} />,
              title: "Telemedicine",
              desc: "Consult with doctors worldwide through high-quality secure video calls."
            },
            {
              icon: <ShieldCheck className="text-orange-500" size={36} />,
              title: "Verified network",
              desc: "Every practitioner undergoes strict background and certification checks."
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-10 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all border border-slate-50 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500 -z-10"></div>
              <div className="mb-6 bg-white shadow-sm w-fit p-5 rounded-3xl border border-slate-100">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-sans">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process / How to get started */}
      <section className="bg-slate-900 py-32 text-white relative overflow-hidden -mx-6 px-6 lg:-mx-12 lg:px-12 rounded-[3rem]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 blur-[150px] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">How to Get Started</h2>
            <p className="text-xl text-slate-400 font-sans max-w-2xl mx-auto">Your journey to better health takes less than 3 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-1 border-t-2 border-dashed border-slate-700 -z-10"></div>

            {[
              { step: "01", title: "Create Profile", desc: "Sign up instantly and fill in your basic health information to get customized care." },
              { step: "02", title: "Find Doctor", desc: "Use AI symptoms or browse our global directory to find the perfect specialist." },
              { step: "03", title: "Book & Consult", desc: "Select a real-time slot, book instantly, and get your consultation." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center space-y-6"
              >
                <div className="w-32 h-32 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl shadow-black relative">
                  <span className="text-4xl font-black text-blue-500">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-slate-400 font-sans leading-relaxed px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 flex justify-center">
            <button 
                onClick={onExplore}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-12 py-5 rounded-[2rem] flex items-center gap-3 shadow-lg transition-all active:scale-95 text-lg uppercase tracking-wide"
              >
                Begin Your Journey <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Rules & Regulations Section */}
      <section className="max-w-4xl mx-auto px-6">
         <div className="mb-16 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Rules & Regulations</h2>
          <p className="text-lg text-slate-600 font-sans">DocPoint operates under strict global compliance to ensure safety and privacy.</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
           <div className="flex gap-6 items-start">
             <div className="shrink-0 w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                <ShieldCheck size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-2">HIPAA & GDPR Compliant</h3>
                <p className="text-slate-600 font-sans leading-relaxed">All medical records, chats, and video sessions are secured using end-to-end encryption. Only authorized personnel and your chosen doctors can view your medical history.</p>
             </div>
           </div>

           <div className="flex gap-6 items-start">
             <div className="shrink-0 w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <CheckCircle2 size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-2">Verified Medical Licenses</h3>
                <p className="text-slate-600 font-sans leading-relaxed">Doctors must submit valid medical licensing and documentation before being listed. We routinely audit certificates to maintain the highest quality of healthcare.</p>
             </div>
           </div>

           <div className="flex gap-6 items-start">
             <div className="shrink-0 w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <FileText size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-2">Cancellation & Refund Policy</h3>
                <p className="text-slate-600 font-sans leading-relaxed">Appointments can be rescheduled or cancelled up to 24 hours prior without penalty. Refunds are processed within 3-5 business days.</p>
             </div>
           </div>
        </div>
      </section>

      {/* Specialist CTA */}
      <section className="bg-blue-600 rounded-[3rem] p-10 md:p-20 text-center text-white mx-6 lg:mx-12 shadow-2xl shadow-blue-600/30">
        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">Expand your practice globally.</h2>
          <p className="text-blue-100 text-xl font-sans max-w-2xl mx-auto">Join thousands of healthcare professionals on DocPoint. Manage your schedule, connect with patients worldwide, and grow your digital presence.</p>
          <button 
            onClick={onJoinAsDoctor}
            className="bg-white text-blue-900 font-black px-12 py-5 rounded-[2rem] inline-flex items-center gap-3 hover:bg-slate-50 hover:scale-105 shadow-xl transition-all active:scale-95 text-lg uppercase tracking-wider"
          >
            Apply as a Doctor <ArrowRight size={24} />
          </button>
        </div>
      </section>
    </div>
  );
}
