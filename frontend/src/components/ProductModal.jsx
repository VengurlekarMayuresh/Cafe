import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Coffee, X, Plus, Minus } from 'lucide-react';

export default function ProductModal({ selectedProduct, setSelectedProduct, addToCart }) {
  const [modalQty, setModalQty] = useState(1);

  // Reset quantity whenever a new product is selected
  useEffect(() => {
    if (selectedProduct) {
      setModalQty(1);
    }
  }, [selectedProduct]);

  return (
    <AnimatePresence>
      {selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[450px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto relative z-10"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-800 hover:bg-white shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Header */}
            <div className="relative h-64 bg-[#F5F1ED] flex items-center justify-center shrink-0 w-full overflow-hidden">
              {selectedProduct.image_url || selectedProduct.image ? (
                <img 
                  src={selectedProduct.image_url || selectedProduct.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400`} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Coffee className="w-16 h-16 text-gray-300" />
              )}
              {/* Category & Discount */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm text-[#412918] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#EBE3D5]">
                  {selectedProduct.category || 'Item'}
                </span>
                {(selectedProduct.original_price || selectedProduct.originalPrice) && parseFloat(selectedProduct.original_price || selectedProduct.originalPrice) > parseFloat(selectedProduct.price) && (
                  <span className="bg-[#8B5E3C] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {Math.round(((parseFloat(selectedProduct.original_price || selectedProduct.originalPrice) - parseFloat(selectedProduct.price)) / parseFloat(selectedProduct.original_price || selectedProduct.originalPrice)) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-[#412918] pr-4">{selectedProduct.name}</h2>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-bold text-2xl text-[#8B5E3C]">₹{parseFloat(selectedProduct.price).toFixed(2)}</span>
                  {(selectedProduct.original_price || selectedProduct.originalPrice) && parseFloat(selectedProduct.original_price || selectedProduct.originalPrice) > parseFloat(selectedProduct.price) && (
                    <span className="text-sm text-gray-400 line-through">₹{parseFloat(selectedProduct.original_price || selectedProduct.originalPrice).toFixed(2)}</span>
                  )}
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>
              )}

              {/* Quantity Selector */}
              {selectedProduct.available !== false && selectedProduct.is_available !== false && (
                <div className="flex items-center justify-between mb-6 p-4 bg-[#F5F1ED] rounded-2xl border border-[#EBE3D5]">
                  <span className="font-bold text-[#412918]">Quantity</span>
                  <div className="flex items-center gap-4 bg-white px-2 py-1 rounded-xl shadow-sm border border-[#EBE3D5]">
                    <button 
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="p-1.5 text-gray-500 hover:text-[#8B5E3C] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg w-6 text-center text-[#412918]">{modalQty}</span>
                    <button 
                      onClick={() => setModalQty(modalQty + 1)}
                      className="p-1.5 text-gray-500 hover:text-[#8B5E3C] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {(selectedProduct.available === false || selectedProduct.is_available === false) && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-bold text-center">
                  Currently Out of Stock
                </div>
              )}

              {/* Add to Cart Button */}
              <button 
                onClick={() => {
                  if (selectedProduct.available !== false && selectedProduct.is_available !== false) {
                    addToCart(selectedProduct, modalQty);
                    setSelectedProduct(null);
                  }
                }}
                disabled={selectedProduct.available === false || selectedProduct.is_available === false}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
                  selectedProduct.available !== false && selectedProduct.is_available !== false
                    ? 'bg-[#412918] hover:bg-[#5a3f2c] text-white hover:-translate-y-1 hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {selectedProduct.available !== false && selectedProduct.is_available !== false ? `ADD ${modalQty} TO CART - ₹${(parseFloat(selectedProduct.price) * modalQty).toFixed(2)}` : 'UNAVAILABLE'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
