import React, { useState } from 'react';
import { ChevronLeft, Send, Sparkles, AlertCircle, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface SymptomCheckerProps {
  onBack: () => void;
}

export default function SymptomChecker({ onBack }: SymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const prompt = `You are a medical assistant chatbot. A user reports the following symptoms: "${symptoms}". 
      Provide a brief analysis of possible conditions (always with a disclaimer that you are an AI, not a doctor), 
      and suggest the type of medical specialist they should book an appointment with. 
      Respond in Markdown format. Keep it concise.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAnalysis(response.text || "No analysis generated.");
    } catch (err) {
      console.error("AI Analysis Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold"
      >
        <ChevronLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">AI Symptom Assistant</h1>
          </div>
          <p className="text-blue-100 text-sm max-w-xl">
            Describe how you are feeling in plain English. Our AI will analyze your symptoms and suggest the right medical specialist for you.
          </p>
        </div>

        <div className="p-8 space-y-8">
           <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="relative">
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] resize-none"
                  placeholder="e.g., I have been feeling a sharp pain in my lower back for the last 2 days, especially when I sit down. I also feel slightly nauseous."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={loading || !symptoms.trim()}
                  className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
           </form>

           <AnimatePresence>
             {analysis && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-6"
               >
                 <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-4">
                   <Sparkles className="text-blue-600" size={20} />
                   <h2 className="text-lg font-bold uppercase">Analysis & Recommendations</h2>
                 </div>

                 <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                 </div>

                 <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex gap-4">
                   <AlertCircle className="text-amber-600 shrink-0" size={24} />
                   <div>
                     <h4 className="text-amber-900 font-bold text-sm mb-1 uppercase tracking-wider">Medical Disclaimer</h4>
                     <p className="text-amber-700 text-xs leading-relaxed">
                       This AI assistant provides information based on general medical data and patterns. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                     </p>
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
