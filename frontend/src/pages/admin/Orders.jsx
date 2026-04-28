import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/orders', { params });
      setOrders(res.data || res);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded ${statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          All
        </button>
        {['pending', 'accepted', 'delivered', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString()} - {order.order_type}
                </p>
                <p className="text-sm">Customer: {order.customer?.name} ({order.customer?.building}-{order.customer?.flat})</p>
                <p className="text-sm">Handler: {order.handler?.name || 'N/A'}</p>
                <p className="text-sm font-medium">Total: ₹{parseFloat(order.total_price).toFixed(2)}</p>
                <ul className="mt-2 text-sm text-gray-600">
                  {order.items?.map(item => (
                    <li key={item.id}>{item.quantity}x {item.product?.name}</li>
                  ))}
                </ul>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-gray-500 text-center py-8">No orders found.</p>
        )}
      </div>
    </div>
  );
}
