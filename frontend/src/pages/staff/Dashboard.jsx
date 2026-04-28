import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders', { params: { status: activeTab === 'all' ? undefined : activeTab } });
      setOrders(res.data || res);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/accept`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to accept order');
    }
  };

  const handleDeliver = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/deliver`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to deliver order');
    }
  };

  const handleReject = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/reject`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to reject order');
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

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'accepted', 'delivered', 'rejected', 'all'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); }}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString()} - {order.order_type}
                </p>
                <p className="text-sm">Customer: {order.customer?.name} ({order.customer?.building}-{order.customer?.flat})</p>
                <p className="text-sm font-medium">Total: ₹{parseFloat(order.total_price).toFixed(2)}</p>
                <ul className="mt-2 text-sm text-gray-600">
                  {order.items?.map(item => (
                    <li key={item.id}>{item.quantity}x {item.product?.name}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(order.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm">Accept</button>
                    <button onClick={() => handleReject(order.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
                  </div>
                )}
                {order.status === 'accepted' && !order.delivered_at && (
                  <button onClick={() => handleDeliver(order.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Deliver</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <p className="text-gray-500 text-center py-8">No orders found.</p>
        )}
      </div>
    </div>
  );
}
