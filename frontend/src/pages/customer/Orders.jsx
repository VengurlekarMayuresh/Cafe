import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight, X, Coffee, Truck } from 'lucide-react';
import api from '../../utils/api';

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
      // Sort orders newest first
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

  if (loading) return <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#412918] mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#8B5E3C]" /> Order History
        </h1>

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#EBE3D5] flex flex-col items-center justify-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-[#F5F1ED] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-[#A67B5B]" />
            </div>
            <h2 className="text-2xl font-bold text-[#412918] mb-3">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-md">You haven't placed any orders. Discover our delicious menu and place your first order!</p>
            <Link to="/menu" className="bg-[#412918] hover:bg-[#5a3f2c] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
              Browse Menu
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const { date, time } = formatDate(order.createdAt || order.created_at);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-[#EBE3D5] hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-[#412918]">Order #{order.id.slice(0, 6).toUpperCase()}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} uppercase tracking-wider`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {date} • {time} • {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-0 border-[#F5F1ED] pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
                      <p className="text-xl font-bold text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#F5F1ED] flex items-center justify-center group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors text-gray-400">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal (Sheet) */}
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
                  {/* Header - Invoice Style */}
                  <div className="p-8 border-b-2 border-dashed border-[#EBE3D5] bg-white relative">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Coffee className="w-6 h-6 text-[#8B5E3C]" />
                           <h1 className="text-2xl font-serif font-black text-[#412918] tracking-tight">SOCIETY CAFÉ</h1>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Good Food, Close to Home</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-3xl font-black text-[#EBE3D5] leading-none mb-1">INVOICE</h2>
                        <p className="text-xs font-bold text-[#8B5E3C]">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Bill To:</p>
                        <p className="font-bold text-[#412918] text-base">{selectedOrder.customer?.name || 'Walk-in Customer'}</p>
                        <p className="text-gray-500 font-medium">Bldg {selectedOrder.customer?.building || 'N/A'}, Flat {selectedOrder.customer?.flat || 'N/A'}</p>
                        <p className="text-gray-500 font-medium">📞 {selectedOrder.customer?.phone || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <div className="mb-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Date & Time:</p>
                          <p className="font-bold text-[#412918]">{new Date(selectedOrder.createdAt || selectedOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs font-medium text-gray-500">{new Date(selectedOrder.createdAt || selectedOrder.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Billing Mode:</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${selectedOrder.order_type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {selectedOrder.order_type} Order
                          </span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Invoice Body */}
                  <div className="flex-1 overflow-y-auto p-8 bg-white">
                    <div className="w-full mb-6">
                      <div className="flex text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                        <span className="flex-1">Description</span>
                        <span className="w-16 text-center">Qty</span>
                        <span className="w-24 text-right">Price</span>
                        <span className="w-24 text-right">Total</span>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedOrder.items?.map(item => (
                          <div key={item.id} className="flex items-center text-sm">
                            <div className="flex-1">
                              <p className="font-bold text-[#412918]">{item.product?.name || 'Unknown Item'}</p>
                              <p className="text-[10px] text-gray-400">Unit Price: ₹{parseFloat(item.price).toFixed(2)}</p>
                            </div>
                            <span className="w-16 text-center font-bold text-gray-600">x{item.quantity}</span>
                            <span className="w-24 text-right font-medium text-gray-500">₹{parseFloat(item.price).toFixed(2)}</span>
                            <span className="w-24 text-right font-bold text-[#412918]">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-[#EBE3D5] space-y-2">
                       <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                          <span>Subtotal</span>
                          <span>₹{parseFloat(selectedOrder.total_price).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                          <span>Service Charge (Included)</span>
                          <span>₹0.00</span>
                       </div>
                       <div className="flex justify-between items-center pt-4">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Payment Method:</p>
                            <span className={`text-[11px] font-bold px-2 py-1 rounded ${selectedOrder.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {selectedOrder.payment_status === 'paid' ? `Paid via ${selectedOrder.payment_method?.toUpperCase() || 'Online/Cash'}` : 'Payment Pending'}
                            </span>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase mb-1">Grand Total</p>
                             <p className="text-3xl font-black text-[#8B5E3C]">₹{parseFloat(selectedOrder.total_price).toFixed(2)}</p>
                          </div>
                       </div>

                       <div className="mt-6 pt-4 border-t border-gray-100 print:hidden">
                          <button 
                            onClick={() => window.print()}
                            className="w-full py-3 rounded-xl font-bold bg-[#412918] text-white shadow-md hover:bg-[#2c1b10] transition-colors flex items-center justify-center gap-2"
                          >
                             Print Invoice
                          </button>
                       </div>
                    </div>
                  </div>

                  {/* Footer Decoration */}
                  <div className="p-6 bg-[#412918] text-white text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Thank you for visiting Society Café</p>
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
