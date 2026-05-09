import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Coffee, Phone, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isIncomplete) {
        navigate('/profile');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(phone, password);
      if (data.isIncomplete) {
        navigate('/profile', { state: { message: 'Please complete your profile to continue.' } });
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await googleLogin();
      // Page will redirect, no need to handle response here
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-y-auto bg-[#412918]">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/cafe_login_bg_1778317009400.png" 
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
        className="w-full max-w-[440px] relative z-10 my-auto py-10"
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
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#412918] mb-3 text-center tracking-tight leading-tight">Society Café</h2>
              <div className="h-1 w-10 sm:w-12 bg-[#D4A373] rounded-full mb-4" />
              <p className="text-gray-400 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Premium Ordering Experience</p>
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

            <div className="space-y-6 sm:space-y-8">
              <div className="text-center space-y-2">
                 <p className="text-[#412918] font-bold text-base sm:text-lg">Taste the Perfection</p>
                 <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-[260px] mx-auto">
                   Sign in to access our exclusive menu and enjoy freshly brewed moments.
                 </p>
              </div>

              <button 
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading}
                className="w-full bg-[#412918] hover:bg-[#5a3f2c] text-white font-black py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <>
                    <div className="bg-white p-1 rounded-full">
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 sm:w-5 sm:h-5" alt="Google" />
                    </div>
                    <span className="text-base sm:text-lg">Continue with Google</span>
                  </>
                )}
                
                {/* Gloss Effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
              </button>

              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 w-full opacity-50">
                  <div className="h-[1px] bg-gray-200 flex-1" />
                  <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-widest text-center">Firebase Secure</p>
                  <div className="h-[1px] bg-gray-200 flex-1" />
                </div>
                
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium italic text-center leading-relaxed">
                  Fast, secure & one-tap login.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-white/40 text-[9px] sm:text-[10px] text-center mt-8 sm:mt-10 font-bold tracking-widest uppercase">© 2024 SOCIETY CAFÉ PLATFORM</p>
      </motion.div>
    </div>
  );
}
