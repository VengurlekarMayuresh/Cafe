import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingBag, TrendingUp, AlertCircle, Clock, 
  CheckCircle2, ChevronRight, Search, Package, Filter, CheckCircle
} from 'lucide-react';
import api from '../../utils/api';
import InvoiceModal from '../../components/InvoiceModal';

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
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

  useEffect(() => {
    fetchDashboardData();
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
      const matchStatus = statusFilter === 'all' || 
                          (statusFilter === 'completed' && order.status === 'delivered') ||
                          (statusFilter === 'pending' && order.status === 'pending') ||
                          (statusFilter === 'preparing' && order.status === 'accepted') ||
                          (statusFilter === 'rejected' && order.status === 'rejected');
      
      const matchSearch = order.id.includes(searchQuery) || 
                          (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (order.customer?.flat || '').includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return { label: 'Pending', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
      case 'accepted': return { label: 'Preparing', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'delivered': return { label: 'Delivered', color: 'bg-green-50 text-green-600 border-green-100' };
      case 'rejected': return { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-100' };
      default: return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const getCounts = (status) => {
    if (status === 'all') return orders.length;
    if (status === 'completed') return orders.filter(o => o.status === 'delivered').length;
    if (status === 'preparing') return orders.filter(o => o.status === 'accepted').length;
    return orders.filter(o => o.status === status).length;
  };

  const handleAction = async (orderId, action, extraData = {}) => {
    try {
      await api.patch(`/orders/${orderId}/${action}`, extraData);
      setSelectedOrder(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div></div>;
  if (!stats) return <div className="min-h-screen bg-[#F5F1ED] text-center py-24 font-bold text-xl text-[#412918]">Failed to load admin dashboard.</div>;

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#412918] mb-1">Admin Overview</h1>
            <p className="text-gray-500 font-medium text-sm">Monitor your cafe's performance and manage users.</p>
          </div>
        </div>

        {/* 1. User Management - TOP CARD */}
        <div className="bg-[#412918] rounded-[2rem] p-6 sm:p-8 mb-10 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#5a3f2c]">
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
            className="relative z-10 bg-[#D4A373] hover:bg-[#c39162] text-[#412918] px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5 whitespace-nowrap shadow-lg"
          >
            Manage Users <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* 2. Business Analytics (Analytics Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-black text-[#412918]">{stats.totalOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-[#412918]">₹{parseFloat(stats.totalRevenue).toLocaleString('en-IN')}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Orders</p>
            <p className="text-3xl font-black text-[#412918]">{stats.pendingOrders}</p>
          </div>
          
          <Link 
            to="/admin/customers"
            className="bg-white p-6 rounded-3xl shadow-sm border border-[#EBE3D5] hover:shadow-md hover:border-[#8B5E3C]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#8B5E3C] transition-colors" />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Customers</p>
            <p className="text-3xl font-black text-[#412918]">{stats.totalCustomers}</p>
          </Link>
        </div>

        {/* 3. Main Operational Container */}
        <div className="bg-white rounded-[2.5rem] border border-[#EBE3D5] p-6 sm:p-10 shadow-sm min-h-[700px]">
           
           <div className="flex justify-center mb-10">
              <div className="flex bg-[#F5F1ED] p-1.5 rounded-2xl shadow-inner w-full max-w-md">
                 <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-white text-[#412918] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                  Order Management
                 </button>
                 <button 
                  onClick={() => setActiveTab('staff')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-white text-[#412918] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                  Staff Performance
                 </button>
              </div>
           </div>

           {activeTab === 'orders' ? (
             <>
               <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10 border-b border-gray-100 pb-10">
                  <div className="relative w-full max-w-md">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                        type="text" 
                        placeholder="Search by ID, name or flat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/10 text-sm placeholder:text-gray-400"
                     />
                  </div>

                  <div className="flex flex-wrap justify-center items-center gap-3">
                     {[
                        { id: 'all', label: 'All Orders' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'preparing', label: 'Preparing' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'rejected', label: 'Rejected' }
                     ].map(tab => (
                        <button 
                           key={tab.id}
                           onClick={() => setStatusFilter(tab.id)}
                           className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                              statusFilter === tab.id 
                                 ? 'bg-[#412918] text-white border-[#412918] shadow-lg' 
                                 : 'bg-white text-gray-500 border-gray-200 hover:border-[#8B5E3C]/30'
                           }`}
                        >
                           {tab.label}
                           <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${statusFilter === tab.id ? 'bg-white/10' : 'bg-gray-100 text-gray-400'}`}>
                              {getCounts(tab.id)}
                           </span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  {filteredOrders.length > 0 ? (
                     filteredOrders.map(order => (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                           key={order.id} 
                           onClick={() => setSelectedOrder(order)}
                           className="bg-[#FDFBF7]/40 border border-[#EBE3D5] rounded-[2rem] p-6 hover:shadow-xl hover:border-[#8B5E3C]/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer"
                        >
                           <div className="flex flex-col sm:flex-row items-center gap-10 flex-1">
                              <div className="min-w-[150px]">
                                 <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-xl font-black text-[#412918]">#{order.id.slice(0, 8).toUpperCase()}</h4>
                                    <span className="text-[9px] font-black text-[#8B5E3C] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{order.order_type}</span>
                                 </div>
                                 <p className="text-sm font-bold text-gray-400">
                                    {new Date(order.createdAt || order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {new Date(order.createdAt || order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                                 </p>
                              </div>

                              <div className="hidden md:block w-[1px] h-12 bg-gray-200" />

                              <div className="flex-1 min-w-[200px]">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Customer Details</p>
                                 <p className="text-base font-black text-[#412918] mb-0.5">{order.customer?.name || 'Walk-in'}</p>
                                 <p className="text-xs font-bold text-gray-500">Bldg {order.customer?.building || 'N/A'}, Flat {order.customer?.flat || 'N/A'}</p>
                              </div>

                              <div className="hidden md:block w-[1px] h-12 bg-gray-200" />

                              <div className="flex-1 min-w-[180px]">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status & Handler</p>
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 border ${getStatusBadge(order.status).color}`}>
                                       <CheckCircle className="w-3.5 h-3.5" /> {getStatusBadge(order.status).label}
                                    </span>
                                 </div>
                                 <p className="text-xs font-bold text-gray-600">By: <span className="text-[#412918]">{order.handler?.name || 'Unassigned'}</span></p>
                              </div>
                           </div>

                           <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-gray-100">
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                 <p className="text-2xl font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EBE3D5] flex items-center justify-center text-[#412918] hover:bg-[#412918] hover:text-white transition-all shadow-sm">
                                 <ShoppingBag className="w-5 h-5" />
                              </div>
                           </div>
                        </motion.div>
                     ))
                  ) : (
                     <div className="text-center py-24">
                        <Filter className="w-16 h-16 mx-auto text-gray-200 mb-4 opacity-30" />
                        <p className="text-xl font-bold text-[#412918]">No orders found</p>
                        <p className="text-gray-400 text-sm">Try searching or changing filters.</p>
                     </div>
                  )}
               </div>
             </>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {staffPerformance.length > 0 ? (
                   staffPerformance.map((staff, idx) => (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        key={staff.id}
                        className="bg-[#FDFBF7]/40 border border-[#EBE3D5] rounded-[2.5rem] p-8 relative overflow-hidden group hover:shadow-xl hover:border-[#8B5E3C]/30 transition-all"
                     >
                        {idx === 0 && (
                          <div className="absolute top-0 right-0 bg-[#8B5E3C] text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest shadow-lg z-10">
                             Top Performer
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 mb-8">
                           <div className="w-20 h-20 rounded-3xl bg-white border-2 border-[#EBE3D5] p-1 shadow-sm overflow-hidden transition-transform">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} alt={staff.name} className="w-full h-full" />
                           </div>
                           <div>
                              <h3 className="font-black text-[#412918] text-xl leading-tight mb-1">{staff.name}</h3>
                              <p className="text-[11px] font-black text-[#8B5E3C] uppercase tracking-widest">Certified Team Member</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="bg-white rounded-2xl p-5 border border-[#EBE3D5] shadow-sm text-center">
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Orders</p>
                              <p className="text-3xl font-black text-[#8B5E3C]">{staff.completedCount}</p>
                           </div>
                           <div className="bg-white rounded-2xl p-5 border border-[#EBE3D5] shadow-sm text-center">
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Revenue</p>
                              <p className="text-xl font-black text-[#412918]">₹{staff.totalRevenue.toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Activity</p>
                           {staff.orders.slice(0, 3).map(order => (
                              <div key={order.id} className="flex items-center justify-between text-[11px] bg-white/50 p-3 rounded-xl border border-white hover:bg-white transition-all">
                                 <span className="font-bold text-gray-500">#{order.id.slice(0, 6).toUpperCase()}</span>
                                 <span className="font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</span>
                              </div>
                           ))}
                        </div>
                     </motion.div>
                   ))
                ) : (
                   <div className="col-span-full text-center py-24 text-gray-400">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-bold">No performance data available yet.</p>
                   </div>
                )}
             </div>
           )}
        </div>

      </div>

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
  );
}
