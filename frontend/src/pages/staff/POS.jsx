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
  const [showMobileCart, setShowMobileCart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      
      // Handle the nested structure from backend { success: true, data: [...] }
      const data = res.data || res;
      const productList = Array.isArray(data) ? data : (data.data || []);
      
      setProducts(productList);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
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
      <div className="bg-[#412918] text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={() => navigate('/staff')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-serif font-black tracking-tight">On-Site POS</h1>
            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Society Café Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live System
          </div>
          <button 
            onClick={() => setShowMobileCart(true)}
            className="lg:hidden relative p-2 bg-[#8B5E3C] rounded-xl text-white shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#412918]">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Product Selection */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl md:rounded-2xl border-none focus:ring-2 focus:ring-[#8B5E3C]/20 text-sm shadow-sm"
                />
              </div>

              {/* Categories Desktop */}
              <div className="hidden md:flex overflow-x-auto hide-scrollbar gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeCategory === cat 
                        ? 'bg-[#8B5E3C] text-white shadow-md' 
                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-[#EBE3D5]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Mobile */}
            <div className="flex md:hidden overflow-x-auto hide-scrollbar gap-2 pb-1">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-[#8B5E3C] text-white shadow-sm' 
                      : 'bg-white text-gray-500 border border-[#EBE3D5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 md:py-20 text-center bg-white rounded-3xl border border-[#EBE3D5]">
                 <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-200 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-[#412918]">No products found</h3>
                 <p className="text-gray-400 text-xs md:sm mb-6">Try adjusting your search or filters.</p>
                 <button 
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                  className="bg-[#412918] text-white px-6 py-2 rounded-xl text-xs font-bold"
                 >
                  Clear Filters
                 </button>
              </div>
            ) : (
              filteredProducts.map(product => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-3 md:p-4 rounded-[1.5rem] md:rounded-3xl border border-[#EBE3D5] hover:border-[#8B5E3C] hover:shadow-xl transition-all text-left flex flex-col gap-2 md:gap-3 group h-full"
                >
                  <div className="w-full aspect-square bg-[#F5F1ED] rounded-xl md:rounded-2xl overflow-hidden relative">
                     {product.image_url ? (
                       <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-[#D4A373]">
                          <Coffee className="w-6 h-6 md:w-8 md:h-8 opacity-50" />
                       </div>
                     )}
                     <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 bg-white/90 backdrop-blur-sm text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full text-[#412918] shadow-sm">
                        {product.category}
                     </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#412918] text-xs md:text-sm line-clamp-1 mb-0.5">{product.name}</h3>
                    <p className="text-[#8B5E3C] font-black text-sm md:text-base">₹{parseFloat(product.price).toFixed(2)}</p>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Billing (Desktop) and Mobile Drawer */}
        <AnimatePresence>
          {(showMobileCart || window.innerWidth >= 1024) && (
            <motion.div 
              initial={window.innerWidth < 1024 ? { x: '100%' } : {}}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`
                fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white border-l border-[#EBE3D5] flex flex-col shadow-2xl z-[60]
                lg:relative lg:translate-x-0 lg:z-10 lg:shadow-none lg:block
                ${!showMobileCart && 'hidden lg:flex'}
              `}
            >
              <div className="p-4 md:p-6 border-b border-[#F5F1ED] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowMobileCart(false)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <h2 className="text-lg md:text-xl font-bold text-[#412918] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#8B5E3C]" /> Current Order
                  </h2>
                </div>
                <button 
                  onClick={() => setCart([])}
                  className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F5F1ED] rounded-full flex items-center justify-center mb-4 text-[#D4A373]/30">
                      <Package className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h3 className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-widest">Cart is Empty</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 mt-2">Select items from the left to begin</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 md:gap-4 bg-[#F5F1ED]/50 p-2 md:p-3 rounded-2xl border border-[#F5F1ED]">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-[#8B5E3C] font-black text-xs shrink-0 overflow-hidden">
                        {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : item.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs md:text-sm font-bold text-[#412918] line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] md:text-xs text-[#8B5E3C] font-bold">₹{(parseFloat(item.price) * item.qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-gray-50 text-gray-500"><Minus className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                          <span className="w-6 md:w-8 text-center text-[10px] md:text-xs font-black">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-gray-50 text-gray-500"><Plus className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Billing Footer */}
              <div className="p-4 md:p-6 bg-[#FDFBF7] border-t border-[#EBE3D5] space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-bold text-[#412918]">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="text-gray-500 font-medium">Tax / Service Charge</span>
                    <span className="font-bold text-green-500">Included</span>
                  </div>
                  <div className="pt-3 md:pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-base md:text-lg font-black text-[#412918]">Grand Total</span>
                    <span className="text-xl md:text-2xl font-black text-[#8B5E3C]">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  disabled={cart.length === 0 || isPlacing}
                  onClick={() => setShowConfirm(true)}
                  className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                    cart.length === 0 || isPlacing 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#412918] hover:bg-[#5a3f2c] text-white hover:-translate-y-1'
                  }`}
                >
                  {isPlacing ? (
                    <>
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> Complete Order
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
