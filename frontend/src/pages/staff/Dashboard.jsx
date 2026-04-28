import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight, X, Coffee, User } from 'lucide-react';
import api from '../../utils/api';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders', { params: { status: activeTab === 'all' ? undefined : activeTab } });
      const sorted = (res.data || res).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId, action) => {
    try {
      await api.patch(`/orders/${orderId}/${action}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null); // Close modal on action
      }
      fetchOrders();
    } catch (err) {
      alert(err.message || `Failed to ${action} order`);
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending': return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock, label: 'Pending Approval' };
      case 'accepted': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Coffee, label: 'Preparing' };
      case 'delivered': return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2, label: 'Delivered' };
      case 'rejected': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, label: 'Cancelled' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: Clock, label: status };
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#412918] flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[#8B5E3C]" /> Kitchen Dashboard
          </h1>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 sm:pb-0">
            {['pending', 'accepted', 'delivered', 'rejected', 'all'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  activeTab === tab 
                    ? 'bg-[#412918] text-white' 
                    : 'bg-white text-gray-500 border border-[#EBE3D5] hover:bg-[#EBE3D5]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B5E3C]"></div></div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#EBE3D5]">
            <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#412918]">No {activeTab !== 'all' ? activeTab : ''} orders found</h2>
            <p className="text-gray-500 mt-2">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const { date, time } = formatDate(order.created_at);

              return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-[#EBE3D5] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4 border-b border-[#F5F1ED] pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#412918]">#{order.id.slice(0, 6).toUpperCase()}</h3>
                        <p className="text-[11px] text-gray-500 font-medium">{date} at {time}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} uppercase`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1 font-medium">
                        <User className="w-4 h-4" /> {order.customer?.name}
                      </div>
                      <p className="text-xs text-gray-400 pl-5">{order.customer?.building} - Flat {order.customer?.flat}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                        <p className="text-lg font-bold text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#F5F1ED] flex items-center justify-center group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors text-gray-400">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Staff Action Modal (Sheet) */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full max-w-[500px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-[#EBE3D5] bg-[#F5F1ED] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#412918]">Manage Order #{selectedOrder.id.slice(0, 6).toUpperCase()}</h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">
                      Placed: {formatDate(selectedOrder.created_at).date} at {formatDate(selectedOrder.created_at).time}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full text-gray-500 hover:text-[#412918] shadow-sm">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                  
                  {/* Customer Info */}
                  <div className="p-4 rounded-xl bg-[#F5F1ED] border border-[#EBE3D5]">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Customer Details</h3>
                    <p className="font-bold text-[#412918]">{selectedOrder.customer?.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.customer?.building} - Flat {selectedOrder.customer?.flat}</p>
                    <p className="text-sm text-gray-600 mt-1">📞 {selectedOrder.customer?.phone}</p>
                  </div>

                  {/* Items List */}
                  <div>
                    <h3 className="font-bold text-[#412918] mb-3 border-b border-[#EBE3D5] pb-2">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-[#412918] text-white font-bold flex items-center justify-center text-xs">
                              {item.quantity}x
                            </div>
                            <span className="font-medium text-[#333333]">{item.product?.name || 'Unknown Item'}</span>
                          </div>
                          <span className="font-bold text-[#8B5E3C]">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer Totals & Actions */}
                <div className="p-6 bg-[#F5F1ED] border-t border-[#EBE3D5]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg text-[#412918]">Total Bill</span>
                    <span className="text-2xl font-bold text-[#8B5E3C]">₹{parseFloat(selectedOrder.total_price).toFixed(2)}</span>
                  </div>

                  {/* Actions based on status */}
                  {selectedOrder.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleAction(selectedOrder.id, 'reject')}
                        className="py-3 rounded-xl font-bold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAction(selectedOrder.id, 'accept')}
                        className="py-3 rounded-xl font-bold bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors"
                      >
                        Accept Order
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'accepted' && (
                    <button 
                      onClick={() => handleAction(selectedOrder.id, 'deliver')}
                      className="w-full py-3 rounded-xl font-bold bg-[#8B5E3C] text-white shadow-md hover:bg-[#6c482e] transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}

                  {(selectedOrder.status === 'delivered' || selectedOrder.status === 'rejected') && (
                    <div className="text-center py-2 text-sm font-bold text-gray-500 uppercase">
                      Order is {selectedOrder.status}
                    </div>
                  )}
                </div>

              </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
