import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Loader2, Coffee, Filter } from 'lucide-react';
import ProductModal from '../../components/ProductModal';
import api from '../../utils/api';

export default function Menu() {
  const location = useLocation();
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
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ ...product, qty: qty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Trigger storage event to update navbar badge
    window.dispatchEvent(new Event('storage'));
  };

  // Extract unique categories from products, fallback to defaults if none exist
  const dbCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const categories = ['All', ...(dbCategories.length > 0 ? dbCategories : ['Cafe Items', 'Snacks', 'Vegetables'])];

  // Filter products based on search query and active category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || 
                            (product.category && product.category.toLowerCase() === activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F5F1ED] text-[#333333] font-sans pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#412918] mb-4">Our Full Menu</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Explore our wide range of freshly prepared hot coffees, snacks, and daily essential vegetables. Everything delivered straight to your door!
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          
          {/* Categories */}
          <div className="w-full md:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-sm ${
                    activeCategory === cat 
                      ? 'bg-[#8B5E3C] text-white ring-2 ring-[#8B5E3C] ring-offset-2 ring-offset-[#F5F1ED]' 
                      : 'bg-white text-gray-600 border border-[#EBE3D5] hover:bg-[#EBE3D5] hover:text-[#412918]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative group">
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#EBE3D5] rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#A67B5B] transition-all shadow-sm placeholder-gray-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8B5E3C]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium text-lg">Brewing the menu...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-[#EBE3D5] shadow-sm max-w-2xl mx-auto"
          >
            <Coffee className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-[#412918] mb-2">No items found</h3>
            <p className="text-gray-500">We couldn't find any items matching your search criteria. Try a different category or term.</p>
            <button 
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-6 border border-[#8B5E3C] text-[#8B5E3C] px-6 py-2 rounded-full font-bold hover:bg-[#8B5E3C] hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EBE3D5] hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Image Area */}
                  <div className="relative h-48 bg-[#F5F1ED] overflow-hidden flex items-center justify-center shrink-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#EBE3D5] rounded-xl text-[#A67B5B]">
                        <Coffee className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs font-bold opacity-70">No Image</span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#412918] text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-[#EBE3D5]">
                      {product.category || 'Item'}
                    </div>

                    {/* Discount Badge (Mocked for UI feel) */}
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <div className="absolute top-3 left-3 bg-[#8B5E3C] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        {Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-[#412918] text-lg mb-1 line-clamp-1">{product.name}</h3>
                    
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-8">
                      {product.description || 'Delicious freshly prepared item.'}
                    </p>
                    
                    <div className="flex items-end justify-between mb-4 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xl text-[#8B5E3C]">₹{parseFloat(product.price).toFixed(2)}</span>
                          {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                            <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.original_price).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                        {product.is_available !== false ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">In Stock</span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">Out of Stock</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); product.is_available !== false ? addToCart(product) : null; }}
                      disabled={product.is_available === false}
                      className={`w-full font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                        product.is_available !== false 
                          ? 'bg-[#412918] hover:bg-[#5a3f2c] text-white hover:shadow-md hover:-translate-y-0.5' 
                          : 'bg-[#F5F1ED] text-gray-400 border border-[#EBE3D5] cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" /> 
                      {product.is_available !== false ? 'ADD TO CART' : 'NOT AVAILABLE'}
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
