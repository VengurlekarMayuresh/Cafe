import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Phone, Lock, Home, Hash, Loader2, Coffee, ArrowRight } from 'lucide-react';

const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, required = false }) => (
  <div>
    <label className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-2 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-[#6F4E37] transition-colors" />
      </div>
      <input 
        type={type} 
        value={value} 
        onChange={onChange}
        className="w-full bg-[#FBF9F7] border border-[#E5DCCF] rounded-2xl py-3 pl-11 pr-4 text-[#412918] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30 focus:border-[#D4A373] transition-all font-medium" 
        placeholder={placeholder} 
        required={required} 
      />
    </div>
  </div>
);

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', building: '', flat: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { message: 'Registration successful! Awaiting admin approval.' } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#F5F1ED] px-4 py-12">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#6F4E37] blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#D4A373] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(111,78,55,0.15)] border border-[#E5DCCF] overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-[#6F4E37] rounded-2xl flex items-center justify-center shadow-lg mb-6 rotate-3">
                <Coffee className="w-8 h-8 text-white -rotate-3" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#412918] mb-2 text-center">Join Society Café</h2>
              <p className="text-gray-500 text-center text-sm font-medium">Create your account to start ordering</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField 
                icon={User} label="Full Name" type="text" 
                value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="John Doe" required 
              />
              
              <InputField 
                icon={Phone} label="Phone Number" type="text" 
                value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                placeholder="e.g. 9876543210" required 
              />
              
              <InputField 
                icon={Lock} label="Password" type="password" 
                value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="••••••••" required 
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  icon={Home} label="Building" type="text" 
                  value={form.building} onChange={(e) => setForm({...form, building: e.target.value})}
                  placeholder="A Wing" 
                />
                <InputField 
                  icon={Hash} label="Flat No" type="text" 
                  value={form.flat} onChange={(e) => setForm({...form, flat: e.target.value})}
                  placeholder="402" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-[#6F4E37] hover:bg-[#5a3f2c] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6F4E37]/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <span className="flex items-center gap-2">Create Account <ArrowRight className="w-5 h-5" /></span>
                )}
              </button>
            </form>
          </div>

          <div className="bg-[#FBF9F7] p-6 text-center border-t border-[#E5DCCF]">
            <p className="text-sm text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-[#6F4E37] hover:text-[#8B5E3C] font-bold transition-colors underline underline-offset-4 decoration-[#D4A373]/50 hover:decoration-[#D4A373]">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
