import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ArrowRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NewOrderAlert() {
  const [show, setShow] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'staff') return;

    const handleNewOrder = (e) => {
      setOrderCount(e.detail);
      setShow(true);
      
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
      } catch (err) {
        console.log('Audio playback blocked');
      }
    };

    window.addEventListener('new-order-alert', handleNewOrder);
    return () => window.removeEventListener('new-order-alert', handleNewOrder);
  }, [user]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShow(false)}
            className="absolute inset-0 bg-[#412918]/60 backdrop-blur-md"
          />

          {/* Alert Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(65,41,24,0.4)] overflow-hidden border border-[#EBE3D5]"
          >
            <div className="p-8 sm:p-12 text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#8B5E3C] blur-2xl opacity-20 animate-pulse" />
                  <div className="relative w-20 h-20 bg-[#412918] rounded-3xl flex items-center justify-center shadow-2xl">
                    <Bell className="w-10 h-10 text-white animate-bounce" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-serif font-black text-[#412918] mb-4 leading-tight">
                New Order Incoming!
              </h3>
              <p className="text-gray-500 text-base sm:text-lg mb-10 leading-relaxed max-w-sm mx-auto">
                A new order has been received and is waiting for your approval. Please check the dashboard to start preparing.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShow(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShow(false);
                    navigate(user.role === 'admin' ? '/admin' : '/staff');
                  }}
                  className="flex-1 bg-[#8B5E3C] hover:bg-[#412918] text-white px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1 active:scale-95 group"
                >
                  View Orders <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Decorative bottom bar */}
            <div className="h-2 bg-gradient-to-r from-[#412918] via-[#8B5E3C] to-[#412918]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
