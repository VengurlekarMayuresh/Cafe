import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Coffee, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateCartStorage = (updated) => {
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage')); // Update navbar badge
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

  const placeOrder = async () => {
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
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#412918] mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#8B5E3C]" /> Your Cart
        </h1>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#EBE3D5] flex flex-col items-center justify-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-[#F5F1ED] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-[#A67B5B]" />
            </div>
            <h2 className="text-2xl font-bold text-[#412918] mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any delicious items to your cart yet. Let's fix that!</p>
            <Link to="/menu" className="bg-[#412918] hover:bg-[#5a3f2c] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
              Browse Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side - Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE3D5]">
                <h3 className="font-bold text-lg border-b border-[#EBE3D5] pb-4 mb-4 text-[#412918]">Items in your Order</h3>
                
                <div className="flex flex-col gap-6">
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0, padding: 0, margin: 0 }}
                        key={item.id} 
                        className="flex flex-col sm:flex-row items-center gap-4 py-2 border-b border-[#F5F1ED] last:border-0 pb-4 last:pb-0"
                      >
                        {/* Item Image */}
                        <div className="w-24 h-24 sm:w-20 sm:h-20 bg-[#F5F1ED] rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#EBE3D5] p-2">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <Coffee className="w-8 h-8 text-[#A67B5B] opacity-50" />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-grow text-center sm:text-left flex flex-col justify-center">
                          <h4 className="font-bold text-[#412918] text-lg leading-tight">{item.name}</h4>
                          <span className="text-[#8B5E3C] font-bold text-sm mt-1">₹{parseFloat(item.price).toFixed(2)}</span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-[#F5F1ED] rounded-full p-1 border border-[#EBE3D5]">
                          <button 
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#412918] shadow-sm hover:bg-[#EBE3D5] transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-[#412918] min-w-[1.5rem] text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#412918] shadow-sm hover:bg-[#EBE3D5] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Total & Remove */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-2 ml-2">
                          <span className="font-bold text-lg text-[#412918]">
                            ₹{(parseFloat(item.price) * item.qty).toFixed(2)}
                          </span>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Remove</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right side - Order Summary */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#EBE3D5]">
                <h3 className="font-bold text-xl text-[#412918] mb-6">Order Summary</h3>
                
                <div className="space-y-3 text-sm text-gray-600 border-b border-[#EBE3D5] pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-medium text-[#333333]">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="text-3xl font-bold text-[#412918]">₹{total.toFixed(2)}</span>
                </div>

                <button 
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="w-full bg-[#412918] hover:bg-[#5a3f2c] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
                >
                  {placingOrder ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>Place Order <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <Link to="/menu" className="text-sm font-bold text-[#8B5E3C] hover:text-[#412918] transition-colors">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
