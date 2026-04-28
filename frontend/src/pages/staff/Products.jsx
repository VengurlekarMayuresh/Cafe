import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function StaffProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', is_available: true });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
      setForm({ name: '', price: '', is_available: true });
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, price: product.price, is_available: product.is_available });
    setEditingId(product.id);
    setShowForm(true);
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
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', price: '', is_available: true }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({...form, is_available: e.target.checked })}
                id="available" />
              <label htmlFor="available">Available</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">₹{parseFloat(product.price).toFixed(2)}</p>
                <span className={`text-xs px-2 py-1 rounded ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleEdit(product)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => handleToggle(product.id)} className="text-yellow-600 text-sm">
                  {product.is_available ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(product.id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
