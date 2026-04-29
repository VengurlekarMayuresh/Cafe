import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, XCircle, TrendingUp, Coffee, Clock, Package, Filter, Search, X } from 'lucide-react';
import api from '../../utils/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      // Fetch all orders for comprehensive analytics
      const res = await api.get('/admin/orders', { params: { limit: 1000 } });
      console.log('Admin orders response:', res);
      
      let fetchedData = [];
      if (Array.isArray(res)) {
        fetchedData = res;
      } else if (res && Array.isArray(res.data)) {
        fetchedData = res.data;
      } else if (res && res.data && Array.isArray(res.data.data)) {
        fetchedData = res.data.data;
      }
      
      setOrders(fetchedData);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 15 seconds for live updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute Meaningful Insights
  const insights = useMemo(() => {
    let completed = 0;
    let rejected = 0;
    let pending = 0;
    let accepted = 0;
    let totalItemsSold = 0;
    let totalRevenue = 0;
    const itemCounts = {};

    orders.forEach(order => {
      if (order.status === 'delivered') {
        completed++;
        totalRevenue += parseFloat(order.total_price);
      } else if (order.status === 'rejected') {
        rejected++;
      } else if (order.status === 'pending') {
        pending++;
      } else if (order.status === 'accepted') {
        accepted++;
      }

      // Count items for all non-rejected orders to show live popularity
      if (order.status !== 'rejected') {
        order.items?.forEach(item => {
          totalItemsSold += item.quantity;
          const name = item.product?.name || 'Unknown Item';
          itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
        });
      }
    });

    // Sort to get top selling items list
    const topItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3 items

    return { completed, rejected, pending, accepted, totalItemsSold, totalRevenue, topItems };
  }, [orders]);

  // Filter Orders locally
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchSearch = order.id.includes(searchQuery) || 
                          (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (order.customer?.flat || '').includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <Coffee className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#412918] flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-[#8B5E3C]" /> Orders Center
          </h1>
          <p className="text-gray-500 font-medium">Review insights and track all customer orders globally.</p>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE3D5] flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">Delivered Orders</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-2xl font-black text-[#412918]">{insights.completed}</h3>
                  <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full mb-1 flex items-center gap-1">
                    Earned ₹{insights.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE3D5] flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">Rejected Orders</p>
                <h3 className="text-2xl font-black text-[#412918]">{insights.rejected}</h3>
              </div>
            </div>
          </div>

          <div className="bg-[#412918] rounded-3xl p-6 shadow-xl relative overflow-hidden text-white flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Package className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-[#D4A373]" />
              </div>
              <p className="text-[#D4A373] text-sm font-bold mb-1 uppercase tracking-wider">Total Items Sold</p>
              <h3 className="text-5xl font-black mb-2">{insights.totalItemsSold}</h3>
              <p className="text-sm font-medium opacity-80">Across all non-rejected orders.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE3D5]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-gray-800 font-bold">Top Selling Items</p>
            </div>
            
            <div className="space-y-3">
              {insights.topItems.length > 0 ? (
                insights.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${index === 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'}`}>
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-[#412918] truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-[#8B5E3C] bg-orange-50 px-2 py-1 rounded shrink-0">{item.count} Sold</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 font-medium text-sm">
                  No items sold yet
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#EBE3D5] overflow-hidden">
          
          <div className="p-6 border-b border-[#EBE3D5] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <input 
                type="text"
                placeholder="Search by ID, name or flat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#EBE3D5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Pills */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2">
              {[
                { id: 'all', label: 'All Orders', count: orders.length },
                { id: 'pending', label: 'Pending', count: insights.pending },
                { id: 'accepted', label: 'Preparing', count: insights.accepted },
                { id: 'delivered', label: 'Completed', count: insights.completed },
                { id: 'rejected', label: 'Rejected', count: insights.rejected }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                    statusFilter === tab.id 
                      ? 'bg-[#412918] text-white border-[#412918] shadow-sm' 
                      : 'bg-white text-gray-600 border-[#EBE3D5] hover:bg-gray-50'
                  }`}
                >
                  {tab.label} <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${statusFilter === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>{tab.count}</span>
                </button>
              ))}
            </div>

          </div>

          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#412918]">No orders found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map(order => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-[#FDFBF7] border border-[#EBE3D5] rounded-2xl p-5 hover:border-[#8B5E3C]/30 hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#412918] text-lg">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{order.order_type}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                          {new Date(order.createdAt || order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="h-10 w-[1px] bg-gray-200 hidden sm:block mx-2" />

                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Customer Details</p>
                        <p className="font-bold text-sm text-[#412918]">{order.customer?.name || 'Walk-in'}</p>
                        {order.customer?.building && <p className="text-xs text-gray-600">Bldg {order.customer.building}, Flat {order.customer.flat}</p>}
                      </div>

                      <div className="h-10 w-[1px] bg-gray-200 hidden sm:block mx-2" />

                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Status & Handler</p>
                        <div className="flex flex-col items-center sm:items-start gap-1">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 capitalize ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                          <p className="text-xs font-bold text-[#412918] truncate max-w-[120px]">By: {order.handler?.name || 'Pending'}</p>
                        </div>
                      </div>

                      <div className="h-10 w-[1px] bg-gray-200 hidden sm:block mx-2" />

                      <div className="text-center sm:text-right flex-shrink-0 min-w-[100px]">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Amount</p>
                        <p className="text-xl font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2">
                       <div className="w-10 h-10 rounded-full bg-white border border-[#EBE3D5] flex items-center justify-center group-hover:bg-[#8B5E3C] group-hover:text-white transition-all shadow-sm">
                          <ShoppingBag className="w-5 h-5" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

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
                              {selectedOrder.payment_status === 'paid' ? 'Paid via Online/Cash' : 'Payment Pending'}
                            </span>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase mb-1">Grand Total</p>
                             <p className="text-3xl font-black text-[#8B5E3C]">₹{parseFloat(selectedOrder.total_price).toFixed(2)}</p>
                          </div>
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
