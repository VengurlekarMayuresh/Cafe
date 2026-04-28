import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Phone, Lock, Home, Hash, Loader2, Coffee } from 'lucide-react';

const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
      </div>
      <input 
        type={type} 
        value={value} 
        onChange={onChange}
        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#0a0a0a] text-white py-12">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-6 relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] mb-6">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-center tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Join the Society
            </h2>
            <p className="text-gray-400 text-center mt-2 text-sm">
              Register to start ordering from your favorite society cafe.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm"
            >
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

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
