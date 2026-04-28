import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, qty } : item));
    }
  };

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map(item => ({ product_id: item.id, qty: item.qty }));
      await api.post('/orders/onsite', { items });
      alert('POS order created successfully!');
      setCart([]);
    } catch (err) {
      alert(err.message || 'Failed to create order');
    }
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">POS - New Order</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.filter(p => p.is_available).map(product => (
              <button key={product.id} onClick={() => addToCart(product)}
                className="border rounded p-3 text-left hover:bg-gray-50">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">₹{parseFloat(product.price).toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-4">Current Order</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items added</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">₹{parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}
                        className="px-2 border rounded">-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-2 border rounded">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3">
                <p className="font-bold">Total: ₹{total.toFixed(2)}</p>
                <button onClick={placeOrder}
                  className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Complete Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
