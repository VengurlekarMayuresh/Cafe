import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight, Coffee, History, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import InvoiceModal from '../../components/InvoiceModal';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?me=true');
      const sorted = (res.data || res).sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, label: 'Pending Approval' };
      case 'accepted': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Coffee, label: 'Preparing' };
      case 'delivered': return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: CheckCircle2, label: 'Delivered' };
      case 'rejected': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle, label: 'Cancelled' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: Clock, label: status };
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

  if (loading) return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5E3C]" />
        <p className="text-gray-400 font-medium animate-pulse">Loading your orders...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans pb-24 pt-12 text-[#333333]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F1ED] rounded-full text-[#8B5E3C] text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              <History className="w-3.5 h-3.5" /> Your Activity
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#412918] tracking-tight">
              Order <span className="text-[#8B5E3C]">History</span>
            </h1>
          </div>
          <div className="hidden sm:block">
            <p className="text-gray-400 text-sm font-medium">Tracking {orders.length} total orders</p>
          </div>
        </header>

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl shadow-[#412918]/5 border border-[#EBE3D5] flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 bg-[#FBF9F7] rounded-full flex items-center justify-center mb-8 relative">
              <ShoppingBag className="w-12 h-12 text-[#A67B5B] opacity-30" />
              <div className="absolute inset-0 border-2 border-dashed border-[#D4A373]/20 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#412918] mb-4">No orders placed yet</h2>
            <p className="text-gray-500 mb-10 max-w-sm leading-relaxed text-sm">
              Discover our freshly brewed collection and start your first order with Society Café.
            </p>
            <Link to="/menu" className="bg-[#412918] hover:bg-[#5a3f2c] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg active:scale-95 group">
              Browse Menu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const { date, time } = formatDate(order.createdAt || order.created_at);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-[#F5F1ED] hover:border-[#D4A373]/30 hover:shadow-xl hover:shadow-[#412918]/5 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${statusConfig.bg.replace('bg-', 'bg-')}`} style={{ backgroundColor: 'currentColor' }} />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500 ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="w-7 h-7" />
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-[#412918]">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-[0.1em] ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {date} at {time}
                          </div>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <div className="flex items-center gap-1.5 text-[#8B5E3C] font-bold">
                            {order.items?.length || 0} Items
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto pt-6 md:pt-0 border-t md:border-0 border-[#F5F1ED]">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-2xl font-serif font-bold text-[#412918]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#FBF9F7] flex items-center justify-center group-hover:bg-[#412918] group-hover:text-white transition-all duration-500 text-gray-400 shadow-inner">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {selectedOrder && (
            <InvoiceModal 
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onPrint={() => window.print()}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Loader2({ className }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
