import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Tag, ArrowRight, ShoppingCart, Info, BellRing, Coffee, Carrot, Cookie } from 'lucide-react';
import api from '../../utils/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock product data for UI visualization if DB is empty
  const mockProducts = [
    { id: 1, name: 'Cold Coffee', price: 90, originalPrice: 100, category: 'Cafe Items', available: true, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400' },
    { id: 2, name: 'Veg Sandwich', price: 85, originalPrice: 100, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400' },
    { id: 3, name: 'Chocolate Shake', price: 112, originalPrice: 125, category: 'Cafe Items', available: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400' },
    { id: 4, name: 'Veg Maggi', price: 60, originalPrice: 60, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=400' },
    { id: 5, name: 'Paneer Pakora', price: 70, originalPrice: 80, category: 'Snacks', available: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400' },
    { id: 6, name: 'Banana (1 Dozen)', price: 30, originalPrice: 30, category: 'Vegetables', available: false, image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&q=80&w=400' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        // If DB is empty, use mock data for showcase
        const data = res.data || res;
        setProducts(data.length > 0 ? data : mockProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Trigger storage event to update navbar badge
    window.dispatchEvent(new Event('storage'));
  };

  const categories = [
    { name: 'Café Items', desc: 'Coffees, teas, shakes & more', icon: <Coffee className="w-6 h-6" />, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=300' },
    { name: 'Vegetables', desc: 'Fresh & handpicked vegetables', icon: <Carrot className="w-6 h-6" />, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300' },
    { name: 'Snacks', desc: 'Chips, biscuits, namkeen & more', icon: <Cookie className="w-6 h-6" />, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=300' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1ED] text-[#333333] pb-20 font-sans">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Hero Carousel Area */}
        <section className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-xl group">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/cafe_hero_banner_1777396877066.png'), url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1600')` }}
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3a2211]/90 via-[#4e2e17]/70 to-transparent" />

          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-20 text-white w-full md:w-2/3">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight drop-shadow-md"
            >
              Fresh Café <br/>
              <span className="text-[#D4A373]">Delivered to Your Door</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-[#F5F1ED] mb-8 font-medium max-w-lg leading-relaxed drop-shadow-sm"
            >
              Hot coffees, delicious snacks & daily essentials <br className="hidden md:block" />
              — all within your society!
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#A67B5B] hover:bg-[#D4A373] text-white px-8 py-3.5 rounded-full font-bold w-max flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              ORDER NOW <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Carousel Controls (Mock) */}
          <button className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-[#6F4E37] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-[#6F4E37] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-y-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373] shadow-sm"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer shadow-sm"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer shadow-sm"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer shadow-sm"></div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div 
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 flex justify-between items-center shadow-sm border border-[#E5DCCF] hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#F5F1ED] rounded-full flex items-center justify-center text-[#6F4E37] mb-4 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#6F4E37] mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-[140px]">{cat.desc}</p>
                </div>
                <button className="text-xs font-bold text-[#6F4E37] border border-[#E5DCCF] rounded-full px-4 py-1.5 w-max flex items-center gap-1 group-hover:border-[#A67B5B] group-hover:bg-[#F5F1ED] transition-colors">
                  EXPLORE <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-inner border-4 border-white shrink-0">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </motion.div>
          ))}
        </section>

        {/* Discount Banner */}
        <section className="bg-gradient-to-r from-[#F3E2C8] to-[#EAD5BA] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm border border-[#E5DCCF]">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-[#6F4E37] rounded-full flex items-center justify-center text-[#F5F1ED] transform -rotate-12 shadow-lg">
              <Tag className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#6F4E37] flex items-baseline gap-2">
                10% OFF <span className="text-lg font-sans font-medium text-[#8c6b54]">on all Café Items</span>
              </h2>
              <p className="text-sm font-medium text-gray-700 mt-1">
                Use Code: <span className="font-bold text-[#6F4E37]">CAFE10</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="hidden lg:inline-block border border-[#6F4E37] border-dashed rounded px-4 py-2 text-sm font-bold text-[#6F4E37] uppercase tracking-wide">
              Limited Time Offer
            </span>
            <button className="bg-[#6F4E37] hover:bg-[#5a3f2c] text-white px-8 py-3 rounded-lg font-bold transition-colors w-full md:w-auto shadow-md">
              ORDER NOW
            </button>
          </div>
        </section>

        {/* Popular Items (Product Grid) */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#6F4E37]">Popular Items</h2>
            <button className="text-sm font-medium text-[#A67B5B] hover:text-[#6F4E37] flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {products.map((product) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={product.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E5DCCF] hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Area */}
                <div className="relative aspect-square bg-[#F5F1ED] overflow-hidden p-4 flex items-center justify-center">
                  <img 
                    src={product.image || product.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400`} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md rounded-xl mix-blend-multiply" 
                  />
                  
                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-3 left-3 bg-[#6F4E37]/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>
                
                {/* Content Area */}
                <div className="p-4 flex flex-col flex-grow bg-white">
                  <h3 className="font-bold text-gray-800 text-[15px] mb-1 line-clamp-1">{product.name}</h3>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-bold text-[17px] text-[#333333]">₹{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  
                  {/* Availability */}
                  <div className="flex items-center gap-1.5 mb-4 text-xs font-medium">
                    {product.available !== false ? (
                      <><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-green-700">Available</span></>
                    ) : (
                      <><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-red-700">Out of Stock</span></>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-auto">
                    {product.available !== false ? (
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-[#6F4E37] hover:bg-[#5a3f2c] text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <ShoppingCart className="w-4 h-4" /> ADD TO CART
                      </button>
                    ) : (
                      <button 
                        className="w-full bg-white border border-[#E5DCCF] text-gray-600 font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <BellRing className="w-4 h-4" /> NOTIFY ME
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        
      </main>
    </div>
  );
}
