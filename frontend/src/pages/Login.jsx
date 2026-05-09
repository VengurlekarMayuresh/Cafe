import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Coffee, Phone, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

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
    try {
      const data = await googleLogin();
      if (data.isIncomplete) {
        navigate('/profile', { state: { message: 'Welcome! Please provide your phone and address details.' } });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#F5F1ED] px-4 py-12">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#6F4E37] blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#D4A373] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(111,78,55,0.15)] border border-[#E5DCCF] overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-[#6F4E37] rounded-2xl flex items-center justify-center shadow-lg mb-6 rotate-3">
                <Coffee className="w-8 h-8 text-white -rotate-3" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#412918] mb-2 text-center">Welcome Back</h2>
              <p className="text-gray-500 text-center text-sm font-medium">Log in to your Society Café account</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-center text-sm mb-8 px-4">
                Welcome to Society Café. Please sign in with your Google account to access the menu and place orders.
              </p>

              <button 
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading}
                className="w-full bg-white border-2 border-[#E5DCCF] hover:bg-[#FBF9F7] hover:border-[#D4A373] text-[#412918] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#6F4E37]" />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
                )}
                <span className="text-lg">Continue with Google</span>
              </button>

              <p className="mt-8 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                Secure Authentication by Firebase
              </p>
            </div>
          </div>

          <div className="bg-[#FBF9F7] p-6 text-center border-t border-[#E5DCCF]">
            <p className="text-xs text-gray-500 font-medium italic">
              New users will be asked for delivery details after login.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
