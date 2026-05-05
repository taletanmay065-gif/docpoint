import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { UserProfile, DoctorProfile, Appointment } from '../types';
import { Users, Calendar, TrendingUp, Search, Stethoscope as UserMd, Trash2, Filter, ShieldAlert, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const doctorsSnap = await getDocs(collection(db, 'doctors'));
      const appsSnap = await getDocs(query(collection(db, 'appointments'), orderBy('createdAt', 'desc')));

      setUsers(usersSnap.docs.map(d => ({ userId: d.id, ...d.data() } as UserProfile)));
      setDoctors(doctorsSnap.docs.map(d => ({ userId: d.id, ...d.data() } as DoctorProfile)));
      setAppointments(appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId: string, role: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (role === 'doctor') {
        await deleteDoc(doc(db, 'doctors', userId));
      }
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.userId !== userId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: 'Total Patients', value: users.filter(u => u.role === 'patient').length, icon: <Users />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Registered Doctors', value: users.filter(u => u.role === 'doctor').length, icon: <UserMd />, color: 'bg-green-50 text-green-600' },
    { label: 'Appointments', value: appointments.length, icon: <Calendar />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Revenue', value: `₹${appointments.length * 1000}`, icon: <TrendingUp />, color: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 uppercase">System Administration</h1>
        <p className="text-slate-500">Monitor platform activity and manage users.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl overflow-hidden flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold text-slate-900 uppercase flex items-center gap-2 shrink-0">
              <Users className="text-blue-600" size={20} /> User List ({filteredUsers.length})
            </h3>
            
            <div className="flex flex-wrap gap-2 grow max-w-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                {(['all', 'patient', 'doctor', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                      roleFilter === r 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button 
                onClick={fetchData}
                className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Refresh users"
              >
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Joined</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map(u => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={u.userId} 
                      className="bg-slate-50/50 hover:bg-slate-50 group rounded-xl"
                    >
                      <td className="px-4 py-3 rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {u.displayName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{u.displayName}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase py-1 px-2 rounded tracking-wider ${
                          u.role === 'admin' ? 'bg-rose-100 text-rose-600' :
                          u.role === 'doctor' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right rounded-r-2xl">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(u.userId, u.role)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <ShieldAlert size={48} />
                        <p className="font-bold uppercase text-xs tracking-widest text-slate-400">No users found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl overflow-hidden">
          <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase flex items-center gap-2">
            <Calendar className="text-purple-600" size={20} /> Recent Bookings
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {appointments.map(app => (
              <div key={app.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-[1.5rem] bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{app.patientName} → {app.doctorName}</p>
                  <p className="text-xs text-slate-500">{app.date} • {app.startTime}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase py-1 px-2 shrink-0 rounded tracking-wider ${
                  app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                  app.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                  app.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
</div>
  );
}

