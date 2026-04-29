import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, 
  Coffee, ChevronRight, Package, Loader2, 
  CheckCircle2, ArrowLeft, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import InvoiceModal from '../../components/InvoiceModal';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function POS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isPlacing, setIsPlacing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data || res);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && p.is_available;
    });
  }, [products, activeCategory, searchQuery]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || isPlacing) return;
    
    try {
      setIsPlacing(true);
      const items = cart.map(item => ({ product_id: item.id, qty: item.qty }));
      const res = await api.post('/orders/onsite', { items });
      
      setCreatedOrder(res.data?.data || res.data || res);
      setCart([]);
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setIsPlacing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F1ED] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#8B5E3C]" />
      <p className="font-bold text-[#412918]">Loading POS Terminal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F1ED] flex flex-col">
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handlePlaceOrder}
        title="Place Order?"
        message={`Are you sure you want to place this on-site order for ₹${total.toFixed(2)}?`}
        confirmText="Yes, Place Order"
        icon={ShoppingBag}
        confirmColor="bg-[#412918]"
      />

      {/* POS Header */}
      <div className="bg-[#412918] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/staff')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-serif font-black tracking-tight">On-Site POS</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Society Café Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live System
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Product Selection */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none focus:ring-2 focus:ring-[#8B5E3C]/20 text-sm shadow-sm"
              />
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 lg:pb-0">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-[#8B5E3C] text-white shadow-md' 
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-3xl border border-[#EBE3D5] hover:border-[#8B5E3C] hover:shadow-xl transition-all text-left flex flex-col gap-3 group h-full"
              >
                <div className="w-full aspect-square bg-[#F5F1ED] rounded-2xl overflow-hidden relative">
                   {product.image_url ? (
                     <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-[#D4A373]">
                        <Coffee className="w-8 h-8 opacity-50" />
                     </div>
                   )}
                   <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] font-black px-2 py-0.5 rounded-full text-[#412918] shadow-sm">
                      {product.category}
                   </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#412918] text-sm line-clamp-1 mb-0.5">{product.name}</h3>
                  <p className="text-[#8B5E3C] font-black text-base">₹{parseFloat(product.price).toFixed(2)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* RIGHT: Cart & Billing */}
        <div className="w-[400px] bg-white border-l border-[#EBE3D5] flex flex-col shadow-2xl z-10">
          <div className="p-6 border-b border-[#F5F1ED] flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#412918] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B5E3C]" /> Current Order
            </h2>
            <button 
              onClick={() => setCart([])}
              className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#F5F1ED] rounded-full flex items-center justify-center mb-4 text-[#D4A373]/30">
                  <Package className="w-10 h-10" />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cart is Empty</h3>
                <p className="text-xs text-gray-400 mt-2">Select items from the left to begin</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-[#F5F1ED]/50 p-3 rounded-2xl border border-[#F5F1ED]">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#8B5E3C] font-black text-xs shrink-0 overflow-hidden">
                    {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#412918] line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-[#8B5E3C] font-bold">₹{(parseFloat(item.price) * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-gray-50 text-gray-500"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-gray-50 text-gray-500"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Billing Footer */}
          <div className="p-6 bg-[#FDFBF7] border-t border-[#EBE3D5] space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-[#412918]">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Tax / Service Charge</span>
                <span className="font-bold text-green-500">Included</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-black text-[#412918]">Grand Total</span>
                <span className="text-2xl font-black text-[#8B5E3C]">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0 || isPlacing}
              onClick={() => setShowConfirm(true)}
              className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                cart.length === 0 || isPlacing 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-[#412918] hover:bg-[#5a3f2c] text-white hover:-translate-y-1'
              }`}
            >
              {isPlacing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" /> Complete Order
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Shared Invoice Modal for Receipt */}
      <AnimatePresence>
        {createdOrder && (
          <InvoiceModal 
            order={createdOrder}
            onClose={() => {
               setCreatedOrder(null);
               navigate('/staff');
            }}
            onPrint={() => window.print()}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
