import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQty = (id, qty) => {
    const updated = cart.map(item => item.id === id ? { ...item, qty: Math.max(1, qty) } : item);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map(item => ({ product_id: item.id, qty: item.qty }));
      await api.post('/orders', { items });
      localStorage.removeItem('cart');
      setCart([]);
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert(err.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b py-3">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₹{parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}
                    className="px-2 py-1 border rounded">-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}
                    className="px-2 py-1 border rounded">+</button>
                  <button onClick={() => removeItem(item.id)}
                    className="ml-2 text-red-500 text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <span className="text-xl font-bold">Total: ₹{total.toFixed(2)}</span>
            <button onClick={placeOrder}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
