import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Coffee, Loader2, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';
import api from '../../utils/api';

import ConfirmationModal from '../../components/ConfirmationModal';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateCartStorage = (updated) => {
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    const updated = cart.map(item => item.id === id ? { ...item, qty } : item);
    updateCartStorage(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id);
    updateCartStorage(updated);
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  const total = subtotal;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const items = cart.map(item => ({ product_id: item.id, qty: item.qty }));
      await api.post('/orders', { items });
      updateCartStorage([]);
      navigate('/orders', { state: { message: 'Order placed successfully!' } });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans pb-32 pt-8 sm:pt-12 text-[#333333]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <ConfirmationModal 
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handlePlaceOrder}
          title="Confirm Your Order"
          message={`Ready to enjoy your coffee? Total amount: ₹${total.toFixed(2)}`}
          confirmText="Place Order Now"
          icon={ShoppingBag}
        />
        
        <header className="mb-10 sm:mb-16 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F5F1ED] rounded-full text-[#8B5E3C] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Checkout
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#412918] tracking-tight">
            Your <span className="text-[#8B5E3C]">Cart</span>
          </h1>
        </header>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 sm:p-20 text-center shadow-2xl shadow-[#412918]/5 border border-[#EBE3D5] flex flex-col items-center justify-center max-w-2xl mx-auto"
          >
            <div className="w-32 h-32 bg-[#FBF9F7] rounded-full flex items-center justify-center mb-8 relative group">
              <div className="absolute inset-0 bg-[#D4A373]/10 rounded-full animate-ping group-hover:animate-none opacity-20" />
              <ShoppingBag className="w-16 h-16 text-[#A67B5B] opacity-20" />
              <Coffee className="w-12 h-12 text-[#8B5E3C] absolute transition-transform group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#412918] mb-4">Your bag is empty</h2>
            <p className="text-gray-500 mb-10 max-w-sm leading-relaxed text-sm sm:text-base">
              Looks like you haven't picked your favorite coffee yet. Explore our freshly brewed menu and find your perfect cup!
            </p>
            <Link to="/menu" className="w-full sm:w-auto bg-[#412918] hover:bg-[#5a3f2c] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#412918]/20 active:scale-95 group">
              Explore Menu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left side - Cart Items */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              
              {/* Delivery Banner - Now at the Top */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-6 border border-[#F5F1ED] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FDF8F3] rounded-2xl flex items-center justify-center text-[#8B5E3C] shadow-inner">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Delivering To</p>
                    <p className="font-bold text-[#412918] text-sm sm:text-base">
                      {user?.building}, {user?.flat} <span className="text-gray-300 font-normal ml-2">|</span> <span className="text-gray-500 font-medium ml-2">Society Complex</span>
                    </p>
                  </div>
                </div>
                <Link to="/profile" className="text-xs font-bold text-[#8B5E3C] hover:underline underline-offset-4 decoration-[#D4A373]/30">
                  Change Address
                </Link>
              </motion.div>
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-[#F5F1ED]">
                <div className="p-6 sm:p-8 border-b border-[#F5F1ED] bg-[#FBF9F7]/30 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-[#412918]">Order Items</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag</p>
                  </div>
                  <button onClick={() => updateCartStorage([])} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Clear all items">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col gap-10">
                    <AnimatePresence initial={false}>
                      {cart.map((item, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ delay: idx * 0.05 }}
                          key={item.id} 
                          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 group relative"
                        >
                          {/* Item Image */}
                          <div className="w-32 h-32 sm:w-24 sm:h-24 bg-[#FBF9F7] rounded-[2rem] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#F5F1ED] p-3 group-hover:border-[#D4A373]/30 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#D4A373]/5">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                            ) : (
                              <Coffee className="w-10 h-10 text-[#A67B5B] opacity-20" />
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-grow flex flex-col items-center sm:items-start text-center sm:text-left pt-1">
                            <div className="mb-4">
                              <h4 className="font-bold text-[#412918] text-xl sm:text-lg mb-1 group-hover:text-[#8B5E3C] transition-colors">{item.name}</h4>
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                <span className="px-2 py-0.5 bg-[#F5F1ED] text-[#8B5E3C] text-[10px] font-bold rounded-md uppercase tracking-wider">{item.category || 'Cafe'}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-sm font-bold text-gray-500">₹{parseFloat(item.price).toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Mobile-focused Qty Controls */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 bg-[#F5F1ED] rounded-xl p-1 border border-[#EBE3D5]/50">
                                <button 
                                  onClick={() => updateQty(item.id, item.qty - 1)}
                                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#412918] shadow-sm hover:bg-[#F5F1ED] active:scale-90 transition-all"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-[#412918] px-3 min-w-[2.5rem] text-center text-sm">{item.qty}</span>
                                <button 
                                  onClick={() => updateQty(item.id, item.qty + 1)}
                                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#412918] shadow-sm hover:bg-[#F5F1ED] active:scale-90 transition-all"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Total Price & Action */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-1 border-t sm:border-0 border-[#F5F1ED]">
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total</span>
                              <span className="font-bold text-2xl sm:text-xl text-[#412918]">₹{(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="sm:mt-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>


            </div>

            {/* Right side - Sticky Checkout Summary */}
            <div className="lg:col-span-4 sticky top-24 pb-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-[#412918] rounded-[2.5rem] p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(65,41,24,0.3)] text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4A373]/10 rounded-full -ml-12 -mb-12 blur-xl" />

                <h3 className="font-serif font-bold text-3xl mb-10 relative z-10">Total Order</h3>
                
                <div className="space-y-5 mb-10 relative z-10">
                  <div className="flex justify-between items-center text-white/70">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span className="font-bold font-mono">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="text-sm font-medium">Delivery Fee</span>
                    <span className="text-[#D4A373] font-bold uppercase tracking-widest text-[10px] bg-white/10 px-2 py-1 rounded-md">Free</span>
                  </div>
                  <div className="flex justify-between items-center text-white/70 pb-5">
                    <span className="text-sm font-medium">Taxes & Charges</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Included</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Payable Amount</span>
                      <span className="text-4xl font-serif font-bold tracking-tight">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  {user?.status !== 'approved' ? (
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-[1.5rem]">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-[#D4A373] shrink-0 mt-0.5" />
                          <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                            Your account is in <span className="text-white font-bold underline decoration-[#D4A373]">pending approval</span>. 
                            Our team is verifying your details. You'll be notified once you can order!
                          </p>
                        </div>
                      </div>
                      <button 
                        disabled
                        className="w-full bg-white/5 border border-white/10 text-white/30 py-5 rounded-[1.5rem] font-bold text-sm uppercase tracking-[0.2em] cursor-not-allowed"
                      >
                        Awaiting Admin
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowConfirm(true)}
                      disabled={placingOrder}
                      className="w-full bg-[#8B5E3C] hover:bg-[#a16d46] text-white py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/20 active:scale-[0.98] disabled:opacity-70 group"
                    >
                      {placingOrder ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
                      ) : (
                        <>Place Your Order <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  )}
                </div>
                
                <p className="mt-8 text-center text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Guaranteed Fresh Delivery
                </p>
              </motion.div>
            </div>

          </div>
        )}
      </div>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-[#F5F1ED] p-4 z-40 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-bold text-[#412918]">₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  if (user?.status === 'approved') setShowConfirm(true);
                  else {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }}
                className={`flex-grow py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                  user?.status === 'approved' 
                  ? 'bg-[#8B5E3C] text-white shadow-[#8B5E3C]/20' 
                  : 'bg-[#412918] text-white shadow-[#412918]/20'
                }`}
              >
                {user?.status === 'approved' ? (
                  <>Checkout <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>View Status</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
