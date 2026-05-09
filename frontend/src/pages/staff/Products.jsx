import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Loader2, Tag, Coffee } from 'lucide-react';
import api from '../../utils/api';

export default function StaffProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    original_price: '',
    category: 'Cafe Items',
    description: '',
    is_available: true 
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProducts(); }, []);

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

  const resetForm = () => {
    setForm({ name: '', price: '', original_price: '', category: 'Cafe Items', description: '', is_available: true });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('is_available', form.is_available);
      if (form.original_price) formData.append('original_price', form.original_price);
      if (form.category) formData.append('category', form.category);
      if (form.description) formData.append('description', form.description);
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setForm({ 
      name: product.name, 
      price: product.price, 
      original_price: product.original_price || '',
      category: product.category || 'Cafe Items',
      description: product.description || '',
      is_available: product.is_available 
    });
    setImagePreview(product.image_url || null);
    setImageFile(null);
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/products/${id}/toggle`);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6 lg:p-10 font-sans text-[#333333]">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-[#EBE3D5] shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#412918]">Menu Management</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Add, edit, or remove items from the cafe menu.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#412918] hover:bg-[#5a3f2c] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" /> Add Item
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-3xl p-5 md:p-8 shadow-xl border border-[#EBE3D5] relative">
                <button 
                  onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#412918] mb-6 border-b border-[#EBE3D5] pb-4 pr-10">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column - Image Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Product Image</label>
                    <div 
                      className="relative h-48 md:h-64 w-full bg-[#F5F1ED] rounded-2xl border-2 border-dashed border-[#EBE3D5] flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-[#8B5E3C] transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-white mb-2" />
                            <span className="text-white font-medium text-xs md:text-sm">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform text-[#A67B5B]">
                            <ImageIcon className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <span className="text-[#8B5E3C] font-bold text-sm">Upload Image</span>
                          <span className="text-[10px] text-gray-500 mt-1">JPG, PNG or WEBP (Max 5MB)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Name *</label>
                      <input 
                        type="text" 
                        value={form.name} 
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full bg-[#F5F1ED] border border-[#EBE3D5] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] transition-all outline-none" 
                        placeholder="e.g., Caramel Macchiato"
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Price (₹) *</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={form.price} 
                          onChange={(e) => setForm({...form, price: e.target.value})}
                          className="w-full bg-[#F5F1ED] border border-[#EBE3D5] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#8B5E3C] outline-none" 
                          placeholder="0.00"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                          <span>Original Price</span>
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded uppercase">Offer</span>
                        </label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={form.original_price} 
                          onChange={(e) => setForm({...form, original_price: e.target.value})}
                          className="w-full bg-[#F5F1ED] border border-[#EBE3D5] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#8B5E3C] outline-none" 
                          placeholder="Crossed out price"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                      <select 
                        value={form.category} 
                        onChange={(e) => setForm({...form, category: e.target.value})}
                        className="w-full bg-[#F5F1ED] border border-[#EBE3D5] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#8B5E3C] outline-none"
                      >
                        <option value="Cafe Items">Cafe Items</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Desserts">Desserts</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                      <textarea 
                        value={form.description} 
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        className="w-full bg-[#F5F1ED] border border-[#EBE3D5] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#8B5E3C] outline-none min-h-[80px] resize-none" 
                        placeholder="Short tasty description..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer group order-2 sm:order-1">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={form.is_available} 
                            onChange={(e) => setForm({...form, is_available: e.target.checked})}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${form.is_available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="font-bold text-gray-700 select-none text-sm">Currently Available</span>
                      </label>

                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-[#8B5E3C] hover:bg-[#6c482e] text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-md order-1 sm:order-2 w-full sm:w-auto"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingId ? 'Save Changes' : 'Publish Product'}
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8B5E3C]" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-[#EBE3D5]">
            <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#412918]">No products yet</h3>
            <p className="text-gray-500 mt-2">Start adding items to build your menu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EBE3D5] flex flex-col group relative">
                
                {/* Image */}
                <div className="h-48 bg-[#F5F1ED] relative flex items-center justify-center shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Coffee className="w-12 h-12 text-gray-300" />
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold text-[#412918] px-2 py-1 rounded-md shadow-sm">
                    {product.category || 'Item'}
                  </div>

                  {/* Discount Badge */}
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      {Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}% OFF
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button onClick={() => handleEdit(product)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#412918] hover:bg-[#F5F1ED] hover:scale-110 transition-all shadow-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 transition-all shadow-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#412918] line-clamp-1 flex-1 pr-2">{product.name}</h3>
                    <button 
                      onClick={() => handleToggle(product.id)}
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                        product.is_available 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {product.is_available ? 'Active' : 'Hidden'}
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2 mt-auto">
                    <span className="font-bold text-lg text-[#8B5E3C]">₹{parseFloat(product.price).toFixed(2)}</span>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.original_price).toFixed(2)}</span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
