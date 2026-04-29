import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingBag, TrendingUp, AlertCircle, Clock, 
  CheckCircle2, ChevronRight, X, Search, Package, Coffee, Filter
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'staff'
  
  // Orders Data State
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Live refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes, ordersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users/pending'),
        api.get('/admin/orders', { params: { limit: 1000 } })
      ]);
      
      setStats(statsRes.data || statsRes);
      setPendingUsers((pendingRes.data || pendingRes).length);
      
      let fetchedOrders = [];
      if (Array.isArray(ordersRes)) fetchedOrders = ordersRes;
      else if (ordersRes?.data?.data) fetchedOrders = ordersRes.data.data;
      else if (ordersRes?.data) fetchedOrders = ordersRes.data;
      setOrders(fetchedOrders);
      
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Staff Performance
  const staffPerformance = useMemo(() => {
    const staffStats = {};
    orders.forEach(order => {
      if (order.status === 'delivered' && order.handler) {
        const staffId = order.handler.id;
        if (!staffStats[staffId]) {
          staffStats[staffId] = {
            id: staffId,
            name: order.handler.name,
            completedCount: 0,
            totalRevenue: 0,
            orders: []
          };
        }
        staffStats[staffId].completedCount++;
        staffStats[staffId].totalRevenue += parseFloat(order.total_price);
        staffStats[staffId].orders.push(order);
      }
    });
    return Object.values(staffStats).sort((a, b) => b.completedCount - a.completedCount);
  }, [orders]);

  // Filtered Orders
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

  if (loading) return <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div></div>;
  if (!stats) return <div className="min-h-screen bg-[#F5F1ED] text-center py-24 font-bold text-xl text-[#412918]">Failed to load admin dashboard.</div>;

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#412918] mb-1">Admin Overview</h1>
            <p className="text-gray-500 font-medium">Monitor your cafe's performance and manage users.</p>
          </div>
        </div>

        {/* 1. User Management (Pending Approvals) - TOP CARD */}
        <div className="bg-[#412918] rounded-3xl p-6 sm:p-8 mb-10 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#5a3f2c]">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Users className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-[#5a3f2c] rounded-2xl flex items-center justify-center shrink-0">
              {pendingUsers > 0 ? (
                <div className="relative">
                  <AlertCircle className="w-8 h-8 text-[#D4A373]" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">User Management</h2>
              <p className="text-[#D4A373] text-sm font-medium">
                {pendingUsers > 0 
                  ? `You have ${pendingUsers} new registration${pendingUsers > 1 ? 's' : ''} awaiting approval.` 
                  : 'All user accounts are up to date.'}
              </p>
            </div>
          </div>
          <Link 
            to="/admin/users" 
            className="relative z-10 bg-[#D4A373] hover:bg-[#c39162] text-[#412918] px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5 whitespace-nowrap"
          >
            Manage Users <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* 2. Business Analytics (Analytics Grid) */}
        <h3 className="text-xl font-bold text-[#412918] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#8B5E3C]" /> Business Analytics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-[#412918]">{stats.totalOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-[#412918]">₹{parseFloat(stats.totalRevenue).toLocaleString('en-IN')}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-[#412918]">{stats.pendingOrders}</p>
          </div>
          
          <Link 
            to="/admin/customers"
            className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE3D5] hover:shadow-md hover:border-[#8B5E3C]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#8B5E3C] transition-colors" />
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-[#412918]">{stats.totalCustomers}</p>
            <p className="text-[10px] text-purple-600 font-bold uppercase mt-2 tracking-wider">View Database</p>
          </Link>
        </div>

        {/* 3. Order Management & Staff Performance Tabs */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#EBE3D5] overflow-hidden min-h-[600px] mt-12">
           
           {/* Tab Navigation */}
           <div className="p-8 border-b border-[#EBE3D5] bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex bg-[#F5F1ED] p-1.5 rounded-2xl shadow-inner">
                 <button 
                  onClick={() => setActiveTab('orders')}
                  className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'orders' ? 'bg-white text-[#412918] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                  Order Management
                 </button>
                 <button 
                  onClick={() => setActiveTab('staff')}
                  className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'staff' ? 'bg-white text-[#412918] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                  Staff Performance
                 </button>
              </div>

              {activeTab === 'orders' && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <div className="relative flex-1 sm:w-64">
                      <input 
                        type="text" 
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#EBE3D5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   </div>
                   <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-[#EBE3D5] rounded-xl px-4 py-2.5 text-sm font-bold text-[#412918] focus:outline-none"
                   >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="delivered">Delivered</option>
                      <option value="rejected">Rejected</option>
                   </select>
                </div>
              )}
           </div>

           <div className="p-8">
              {activeTab === 'orders' ? (
                /* Order List Section */
                <div className="space-y-4">
                   {filteredOrders.length > 0 ? (
                      filteredOrders.map(order => (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                           key={order.id} 
                           onClick={() => setSelectedOrder(order)}
                           className="bg-[#FDFBF7] border border-[#EBE3D5] rounded-3xl p-6 hover:shadow-xl hover:border-[#8B5E3C]/30 transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                        >
                           <div className="flex flex-col sm:flex-row items-center gap-8 flex-1">
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref</p>
                                 <p className="text-lg font-black text-[#412918]">#{order.id.slice(0, 8).toUpperCase()}</p>
                                 <span className="text-[9px] font-black text-[#8B5E3C] bg-[#8B5E3C]/5 px-2 py-0.5 rounded uppercase tracking-tighter">{order.order_type}</span>
                              </div>

                              <div className="hidden lg:block w-[1px] h-10 bg-gray-200" />

                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                 <p className="text-base font-bold text-[#412918]">{order.customer?.name || 'Walk-in'}</p>
                                 <p className="text-[10px] text-gray-500 font-medium">Bldg {order.customer?.building || 'N/A'}, Flat {order.customer?.flat || 'N/A'}</p>
                              </div>

                              <div className="hidden lg:block w-[1px] h-10 bg-gray-200" />

                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-wider flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" /> {order.status}
                                 </span>
                              </div>
                           </div>

                           <div className="flex items-center justify-between lg:justify-end gap-12 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                                 <p className="text-2xl font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-white border border-[#EBE3D5] flex items-center justify-center text-[#412918] group-hover:bg-[#412918] group-hover:text-white transition-all shadow-sm">
                                 <ChevronRight className="w-6 h-6" />
                              </div>
                           </div>
                        </motion.div>
                      ))
                   ) : (
                      <div className="text-center py-24">
                         <Filter className="w-16 h-16 mx-auto text-gray-200 mb-4 opacity-30" />
                         <p className="text-xl font-bold text-[#412918]">No orders found matching filters</p>
                         <p className="text-gray-400">Try adjusting your search or status selection.</p>
                      </div>
                   )}
                </div>
              ) : (
                /* Staff Performance Section */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {staffPerformance.length > 0 ? (
                      staffPerformance.map((staff, idx) => (
                        <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                           key={staff.id}
                           className="bg-[#FDFBF7] border border-[#EBE3D5] rounded-[2rem] p-8 relative overflow-hidden group hover:shadow-2xl hover:border-[#8B5E3C]/30 transition-all"
                        >
                           {idx === 0 && (
                             <div className="absolute top-0 right-0 bg-[#8B5E3C] text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest shadow-lg z-10">
                                Top Star
                             </div>
                           )}
                           
                           <div className="flex items-center gap-6 mb-8">
                              <div className="w-20 h-20 rounded-3xl bg-white border-2 border-[#EBE3D5] p-1 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} alt={staff.name} className="w-full h-full" />
                              </div>
                              <div>
                                 <h3 className="font-black text-[#412918] text-xl leading-tight mb-1">{staff.name}</h3>
                                 <p className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest">Certified Staff</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 mb-8">
                              <div className="bg-white rounded-2xl p-5 border border-[#EBE3D5] shadow-sm">
                                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Orders</p>
                                 <p className="text-3xl font-black text-[#8B5E3C]">{staff.completedCount}</p>
                              </div>
                              <div className="bg-white rounded-2xl p-5 border border-[#EBE3D5] shadow-sm">
                                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Earnings</p>
                                 <p className="text-xl font-black text-[#412918]">₹{staff.totalRevenue.toLocaleString()}</p>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Activity</p>
                              {staff.orders.slice(0, 3).map(order => (
                                 <div key={order.id} className="flex items-center justify-between text-[11px] bg-white/50 p-3 rounded-xl border border-white group-hover:bg-white transition-all">
                                    <span className="font-bold text-gray-500">#{order.id.slice(0, 6).toUpperCase()}</span>
                                    <span className="font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</span>
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                      ))
                   ) : (
                      <div className="col-span-full text-center py-24">
                         <Users className="w-16 h-16 mx-auto text-gray-200 mb-4 opacity-30" />
                         <p className="text-xl font-bold text-[#412918]">No staff performance data</p>
                         <p className="text-gray-400">Activity will appear here once orders are delivered.</p>
                      </div>
                   )}
                </div>
              )}
           </div>
        </div>

      </div>

      {/* Order Details Modal (Shared Invoice logic) */}
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
                  className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto"
                >
                  {/* Header - Invoice Style */}
                  <div className="p-10 border-b-2 border-dashed border-[#EBE3D5] bg-white relative">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Coffee className="w-7 h-7 text-[#8B5E3C]" />
                           <h1 className="text-2xl font-serif font-black text-[#412918] tracking-tight">SOCIETY CAFÉ</h1>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Good Food, Close to Home</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-3xl font-black text-[#EBE3D5] leading-none mb-2">INVOICE</h2>
                        <p className="text-xs font-bold text-[#8B5E3C]">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Bill To:</p>
                        <p className="font-bold text-[#412918] text-base">{selectedOrder.customer?.name || 'Walk-in Customer'}</p>
                        <p className="text-gray-500 font-medium leading-relaxed">Bldg {selectedOrder.customer?.building || 'N/A'}, Flat {selectedOrder.customer?.flat || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Date & Status:</p>
                        <p className="font-bold text-[#412918]">{new Date(selectedOrder.createdAt || selectedOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${selectedOrder.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                           {selectedOrder.status}
                        </span>
                      </div>
                    </div>

                    <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 bg-white">
                    <div className="w-full mb-8">
                       <div className="flex text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6">
                          <span className="flex-1">Item Description</span>
                          <span className="w-16 text-center">Qty</span>
                          <span className="w-24 text-right">Total</span>
                       </div>
                       
                       <div className="space-y-6">
                         {selectedOrder.items?.map(item => (
                           <div key={item.id} className="flex items-center text-sm">
                             <div className="flex-1">
                               <p className="font-bold text-[#412918]">{item.product?.name || 'Unknown Item'}</p>
                               <p className="text-[10px] text-gray-400">₹{parseFloat(item.price).toFixed(2)} / unit</p>
                             </div>
                             <span className="w-16 text-center font-bold text-gray-600">x{item.quantity}</span>
                             <span className="w-24 text-right font-black text-[#412918]">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="pt-8 border-t-2 border-dashed border-[#EBE3D5]">
                       <div className="flex justify-between items-center mb-2 text-sm text-gray-500 font-medium">
                          <span>Service Total</span>
                          <span>₹{parseFloat(selectedOrder.total_price).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center mb-8 text-sm text-gray-500 font-medium">
                          <span>Discount/Tax</span>
                          <span>₹0.00</span>
                       </div>
                       <div className="flex justify-between items-center bg-[#FDFBF7] p-6 rounded-3xl border border-[#EBE3D5]">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-3xl font-black text-[#8B5E3C]">₹{parseFloat(selectedOrder.total_price).toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Paid via</p>
                             <span className="text-[11px] font-bold text-[#412918] capitalize bg-white px-3 py-1 rounded-full shadow-sm border border-[#EBE3D5]">
                                {selectedOrder.payment_method || 'Unknown'}
                             </span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 bg-[#412918] text-center">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Society Café • Est. 2024</p>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

    </div>
  );
}
