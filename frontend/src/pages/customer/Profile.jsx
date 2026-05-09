import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Home, Hash, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import api from '../../utils/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    building: user?.building || '',
    flat: user?.flat || ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        building: user.building || '',
        flat: user.flat || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put('/auth/profile', form);
      const updatedUser = res.data.data || res.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1ED]">
      <Loader2 className="w-10 h-10 animate-spin text-[#6F4E37]" />
    </div>
  );

  const isIncomplete = !user.name || !user.phone || !user.building || !user.flat;

  return (
    <div className="min-h-screen bg-[#F5F1ED] pb-20 pt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#412918] mb-2">My Profile</h1>
          <p className="text-gray-500 font-medium">Manage your account and delivery information</p>
        </div>

        {location.state?.message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-2xl mb-6 flex items-center gap-3 font-medium"
          >
            <AlertCircle className="w-5 h-5" />
            {location.state.message}
          </motion.div>
        )}

        {isIncomplete && !location.state?.message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-2xl mb-6 flex items-center gap-3 font-medium"
          >
            <AlertCircle className="w-5 h-5" />
            Your profile is incomplete. Please fill in your details to start ordering.
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl mb-6 flex items-center gap-3 font-medium"
          >
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 font-medium"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#EBE3D5] overflow-hidden">
          <div className="p-8 sm:p-10">
            
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-[#F5F1ED]">
              <div className="w-24 h-24 rounded-3xl bg-[#F5F1ED] border border-[#EBE3D5] flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.email}`} alt="Avatar" className="w-20 h-20" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#412918]">{user.name || 'Guest User'}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-bold text-[#8B5E3C] bg-[#F5F1ED] px-3 py-1 rounded-full border border-[#EBE3D5] uppercase tracking-wider">
                    {user.role}
                  </span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                    user.status === 'approved' 
                    ? 'text-green-600 bg-green-50 border-green-100' 
                    : 'text-amber-600 bg-amber-50 border-amber-100'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors" />
                    <input 
                      type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full bg-[#FBF9F7] border border-[#E5DCCF] rounded-2xl py-3.5 pl-12 pr-4 text-[#412918] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all font-medium"
                      placeholder="Your full name" required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors" />
                    <input 
                      type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                      className="w-full bg-[#FBF9F7] border border-[#E5DCCF] rounded-2xl py-3.5 pl-12 pr-4 text-[#412918] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all font-medium"
                      placeholder="Your contact number" required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-2 ml-1">Building / Wing</label>
                  <div className="relative group">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors" />
                    <input 
                      type="text" value={form.building} onChange={(e) => setForm({...form, building: e.target.value})}
                      className="w-full bg-[#FBF9F7] border border-[#E5DCCF] rounded-2xl py-3.5 pl-12 pr-4 text-[#412918] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all font-medium"
                      placeholder="e.g. A Wing" required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-2 ml-1">Flat / House No.</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors" />
                    <input 
                      type="text" value={form.flat} onChange={(e) => setForm({...form, flat: e.target.value})}
                      className="w-full bg-[#FBF9F7] border border-[#E5DCCF] rounded-2xl py-3.5 pl-12 pr-4 text-[#412918] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all font-medium"
                      placeholder="e.g. 402" required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" disabled={loading}
                  className="w-full md:w-max bg-[#6F4E37] hover:bg-[#5a3f2c] text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-[#6F4E37]/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Save Profile Details</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
