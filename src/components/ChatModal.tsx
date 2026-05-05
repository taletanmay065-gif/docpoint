import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Message, Appointment } from '../types';
import { X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatModalProps {
  appointment: Appointment;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

export default function ChatModal({ appointment, onClose, receiverId, receiverName }: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'messages'),
      where('appointmentId', '==', appointment.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Message;
      });
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error(error);
      toast.error('Failed to load messages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appointment.id, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        appointmentId: appointment.id,
        senderId: user.uid,
        receiverId,
        text: newMessage.trim(),
        createdAt: serverTimestamp()
      });
      setNewMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-lg">Chat with {receiverName}</h3>
            <p className="text-blue-100 text-xs">Appointment: {appointment.date} at {appointment.startTime}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs mt-1">Start the conversation below.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.uid;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-900 rounded-bl-sm'}`}>
                    <p className="text-sm font-sans">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-200"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
