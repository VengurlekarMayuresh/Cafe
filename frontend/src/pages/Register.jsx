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
  const { register, googleLogin } = useAuth();
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await googleLogin();
    } catch (err) {
      setError(err.message || 'Google Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-y-auto bg-[#412918]">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/cafe_register_bg_1778319596712.png" 
          alt="Cafe Background" 
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#412918] via-transparent to-black/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10 my-auto py-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-12">
            <div className="flex flex-col items-center mb-8 sm:mb-10">
              <motion.div 
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 3, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-[#412918] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl mb-6 sm:mb-8 border-4 border-[#D4A373]/30"
              >
                <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-white -rotate-3" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#412918] mb-3 text-center tracking-tight leading-tight">Join Society Café</h2>
              <div className="h-1 w-10 sm:w-12 bg-[#D4A373] rounded-full mb-4" />
              <p className="text-gray-400 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Create Your Premium Account</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-xs sm:text-sm flex items-center gap-3 font-bold"
              >
                <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-8">
              {/* Google Option */}
              <button 
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading}
                className="w-full bg-[#412918] hover:bg-[#5a3f2c] text-white font-black py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-70 group relative overflow-hidden"
              >
                <div className="bg-white p-1 rounded-full">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 sm:w-5 sm:h-5" alt="Google" />
                </div>
                <span className="text-base sm:text-lg">Sign up with Google</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
              </button>

              <div className="flex items-center gap-3 w-full opacity-30">
                <div className="h-[1px] bg-[#412918] flex-1" />
                <p className="text-[10px] font-black uppercase tracking-widest">OR USE FORM</p>
                <div className="h-[1px] bg-[#412918] flex-1" />
              </div>

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
                  className="w-full mt-4 bg-white border-2 border-[#E5DCCF] hover:border-[#412918] text-[#412918] font-black py-4 rounded-2xl sm:rounded-[2rem] transition-all flex items-center justify-center gap-2 group shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-[#FDFBF7] p-6 sm:p-8 text-center border-t border-gray-50">
            <p className="text-xs text-gray-400 font-bold mb-3">ALREADY HAVE AN ACCOUNT?</p>
            <Link to="/login" className="text-[#8B5E3C] text-sm font-black hover:underline underline-offset-8 decoration-2">
              Sign In to Your Workspace
            </Link>
          </div>
        </div>
        
        <p className="text-white/40 text-[9px] sm:text-[10px] text-center mt-8 sm:mt-10 font-bold tracking-widest uppercase">© 2024 SOCIETY CAFÉ PLATFORM</p>
      </motion.div>
    </div>
  );
}    </div>
  );
}
