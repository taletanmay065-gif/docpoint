import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Smartphone, Landmark, CheckCircle2, ChevronRight, Lock } from 'lucide-react';

interface PaymentModalProps {
  amount: number;
  onSuccess: (method: string) => void;
  onCancel: () => void;
}

export default function PaymentModal({ amount, onSuccess, onCancel }: PaymentModalProps) {
  const [method, setMethod] = useState<'upi' | 'card' | 'nb' | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!method) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });

      const data = await response.json();
      
      if (data.isMock) {
        // Fallback for preview demo (if no Stripe key provided)
        console.log("Using mock payment intent:", data.clientSecret);
        setTimeout(() => {
          setLoading(false);
          onSuccess(method);
        }, 2000);
      } else {
        // In a real app, you'd use the Stripe SDK to confirm the payment
        // with the clientSecret from the server.
        // For now, we simulate the completion.
        setTimeout(() => {
          setLoading(false);
          onSuccess(method);
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Secure Payment</h2>
              <p className="text-slate-500 text-sm">Choose your preferred method</p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl mb-8 flex justify-between items-center">
            <span className="text-blue-600 font-bold uppercase text-xs tracking-widest">Total Amount</span>
            <span className="text-2xl font-black text-blue-700">₹{amount}</span>
          </div>

          <div className="space-y-3 mb-8">
            <button 
              onClick={() => setMethod('upi')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                method === 'upi' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-100'
              }`}
            >
              <div className="flex items-center gap-4 text-slate-700">
                <Smartphone size={24} className={method === 'upi' ? 'text-blue-600' : 'text-slate-400'} />
                <span className="font-bold">UPI (PhonePe, Google Pay)</span>
              </div>
              {method === 'upi' && <CheckCircle2 size={20} className="text-blue-600" />}
            </button>

            <button 
              onClick={() => setMethod('card')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                method === 'card' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-100'
              }`}
            >
              <div className="flex items-center gap-4 text-slate-700">
                <CreditCard size={24} className={method === 'card' ? 'text-blue-600' : 'text-slate-400'} />
                <span className="font-bold">Credit / Debit Card</span>
              </div>
              {method === 'card' && <CheckCircle2 size={20} className="text-blue-600" />}
            </button>

            <button 
              onClick={() => setMethod('nb')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                method === 'nb' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-100'
              }`}
            >
              <div className="flex items-center gap-4 text-slate-700">
                <Landmark size={24} className={method === 'nb' ? 'text-blue-600' : 'text-slate-400'} />
                <span className="font-bold">Net Banking</span>
              </div>
              {method === 'nb' && <CheckCircle2 size={20} className="text-blue-600" />}
            </button>
          </div>

          <button 
            disabled={!method || loading}
            onClick={handlePay}
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-[1.5rem] hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Pay Now <ChevronRight size={20} /></>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 mt-6 flex items-center justify-center gap-1 uppercase font-bold tracking-widest">
            <Lock size={12} /> SSL Secure 256-bit Encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}
