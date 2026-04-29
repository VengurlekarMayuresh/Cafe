import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight, Coffee, User, Plus } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import InvoiceModal from '../../components/InvoiceModal';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders', { params: { status: activeTab === 'all' ? undefined : activeTab } });
      let fetchedOrders = res.data || res;

      if (user?.role === 'staff') {
        fetchedOrders = fetchedOrders.filter(
          (o) => o.status === 'pending' || o.handled_by === user.id
        );
      }

      const sorted = fetchedOrders.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, user]);

  const handleAction = async (orderId, action, extraData = {}) => {
    try {
      await api.patch(`/orders/${orderId}/${action}`, extraData);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      setShowPaymentPrompt(false);
    } catch (err) {
      alert(err.message || `Failed to ${action} order.`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      setShowPaymentPrompt(false);
    } finally {
      fetchOrders();
    }
  };

  const handlePrint = () => {
    window.print();
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
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { date: 'N/A', time: 'N/A' };
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Top Action Bar */}
        <div className="mb-10 flex items-center justify-between bg-[#412918] p-6 rounded-[2rem] shadow-xl text-white">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#8B5E3C] rounded-2xl flex items-center justify-center">
                 <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                 <h1 className="text-2xl font-serif font-black tracking-tight">Staff Command Center</h1>
                 <p className="text-[10px] text-[#D4A373] font-bold uppercase tracking-[0.2em]">Live Kitchen & POS Terminal</p>
              </div>
           </div>
           <Link 
              to="/staff/pos" 
              className="bg-[#D4A373] hover:bg-[#c39162] text-[#412918] px-8 py-3.5 rounded-2xl text-sm font-black transition-all flex items-center gap-3 hover:-translate-y-0.5 shadow-lg active:scale-95"
           >
              <Plus className="w-5 h-5" /> New Walk-in Order
           </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-serif font-bold text-[#412918]">
            Order Management
          </h2>
          
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
              const { date, time } = formatDate(order.createdAt || order.created_at);

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

        <AnimatePresence>
          {selectedOrder && (
            <InvoiceModal 
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onAction={handleAction}
              onPrint={handlePrint}
              showPaymentPrompt={showPaymentPrompt}
              setShowPaymentPrompt={setShowPaymentPrompt}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
