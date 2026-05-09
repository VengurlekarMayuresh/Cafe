import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Loader2, Coffee, Filter, Star, Clock, ArrowRight } from 'lucide-react';
import ProductModal from '../../components/ProductModal';
import api from '../../utils/api';

export default function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data || res);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product, qty = 1) => {
    if (!user) {
      navigate('/login', { state: { from: location, message: 'Please login to add items to your cart.' } });
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ ...product, qty: qty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  };

  const dbCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const categories = ['All', ...(dbCategories.length > 0 ? dbCategories : ['Coffee', 'Snacks', 'Desserts'])];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || 
                            (product.category && product.category.toLowerCase() === activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#333333] font-sans pb-32 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Premium Header */}
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F1ED] rounded-full text-[#8B5E3C] text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
          >
            <Star className="w-3.5 h-3.5 fill-current" /> Premium Selection
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#412918] mb-6 tracking-tight">
            Our <span className="text-[#8B5E3C]">Full Menu</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
            Discover our curated collection of aromatic coffees, delicious bites, and fresh essentials—all crafted with passion.
          </p>
        </header>

        {/* Search & Filter Section */}
        <div className="sticky top-20 z-40 bg-[#FDFCFB]/80 backdrop-blur-xl py-6 mb-12 border-b border-[#F5F1ED]">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            
            {/* Horizontal Categories */}
            <div className="w-full lg:w-auto overflow-x-auto hide-scrollbar">
              <div className="flex gap-3 pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-black transition-all uppercase tracking-widest border-2 ${
                      activeCategory === cat 
                        ? 'bg-[#412918] text-white border-[#412918] shadow-lg shadow-[#412918]/20 scale-105' 
                        : 'bg-white text-gray-400 border-[#F5F1ED] hover:border-[#D4A373]/30 hover:text-[#412918]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Search Bar */}
            <div className="w-full lg:w-96 relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-300 group-focus-within:text-[#8B5E3C] transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Find your favorite..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FBF9F7] border-2 border-[#F5F1ED] rounded-[2rem] py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-[#D4A373]/10 focus:border-[#D4A373] transition-all font-medium placeholder-gray-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Product Grid - 2 columns on smallest screens */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#8B5E3C]">
            <Loader2 className="w-12 h-12 animate-spin mb-6 opacity-40" />
            <p className="font-bold text-sm uppercase tracking-widest animate-pulse">Brewing the collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-[#F5F1ED] shadow-sm max-w-2xl mx-auto px-8"
          >
            <div className="w-20 h-20 bg-[#FDF8F3] rounded-full flex items-center justify-center mb-6">
              <Coffee className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#412918] mb-4">No results found</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">
              We couldn't find any items matching your criteria. Try adjusting your filters or search term.
            </p>
            <button 
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="bg-[#412918] text-white px-10 py-4 rounded-2xl font-bold text-sm tracking-widest hover:bg-[#5a3f2c] transition-all"
            >
              RESET FILTERS
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm border border-[#F5F1ED] hover:shadow-[0_20px_50px_rgba(65,41,24,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col group cursor-pointer relative"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-[#FBF9F7] overflow-hidden flex items-center justify-center shrink-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <Coffee className="w-12 h-12 text-[#A67B5B] opacity-10" />
                    )}
                    
                    {/* Floating Info */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-2">
                      {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                        <div className="bg-[#8B5E3C] text-white text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest">
                          Offer
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4 bg-gradient-to-t from-black/20 to-transparent">
                      <span className="text-[9px] sm:text-[10px] font-bold text-white bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg uppercase tracking-wider">
                        {product.category || 'Cafe'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-3 sm:p-6 flex flex-col flex-grow">
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                        <h3 className="font-bold text-[#412918] text-sm sm:text-lg lg:text-xl line-clamp-1 group-hover:text-[#8B5E3C] transition-colors">{product.name}</h3>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium line-clamp-2 h-7 sm:h-9 leading-relaxed">
                        {product.description || 'Delicately prepared for your perfect moment.'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 sm:mb-6 mt-auto">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="font-bold text-lg sm:text-2xl text-[#412918]">₹{parseFloat(product.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); product.is_available !== false ? addToCart(product) : null; }}
                      disabled={product.is_available === false}
                      className={`w-full font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-sm ${
                        product.is_available !== false 
                          ? 'bg-[#412918] hover:bg-[#8B5E3C] text-white hover:shadow-xl hover:shadow-[#8B5E3C]/20 active:scale-95' 
                          : 'bg-gray-100 text-gray-300 border border-gray-100 cursor-not-allowed'
                      }`}
                    >
                      {product.is_available !== false ? (
                        <>ADD TO CART <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" /></>
                      ) : (
                        'UNAVAILABLE'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductModal 
        selectedProduct={selectedProduct} 
        setSelectedProduct={setSelectedProduct} 
        addToCart={addToCart} 
      />

    </div>
  );
}
