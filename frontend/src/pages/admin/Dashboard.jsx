import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingBag, TrendingUp, AlertCircle, Clock, 
  CheckCircle2, ChevronRight, X, Search, Mail, 
  Phone, MapPin, Calendar, Package, User 
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Customer List States
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detailed Customer View States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users/pending')
      ]);
      setStats(statsRes.data || statsRes);
      setPendingUsers((pendingRes.data || pendingRes).length);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { role: 'customer' } });
      setCustomers(res.data || res);
      setShowCustomerModal(true);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchCustomerHistory = async (customer) => {
    setSelectedCustomer(customer);
    setIsHistoryLoading(true);
    try {
      const res = await api.get('/admin/orders', { params: { user_id: customer.id } });
      setCustomerOrders(res.data || res);
    } catch (err) {
      console.error('Failed to fetch customer history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* User Approval Call to Action */}
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

        {/* Analytics Grid */}
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
          
          <div 
            onClick={fetchCustomers}
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
            <p className="text-[10px] text-purple-600 font-bold uppercase mt-2 tracking-wider">Click to view all</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">Today's Orders</p>
              <p className="text-3xl font-bold text-[#412918]">{stats.todayOrders}</p>
            </div>
            <div className="w-12 h-12 bg-[#F5F1ED] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#8B5E3C]" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-[#412918]">₹{parseFloat(stats.todayRevenue).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 bg-[#F5F1ED] rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#8B5E3C]" />
            </div>
          </div>
        </div>

        {/* Customer List Modal */}
        <AnimatePresence>
          {showCustomerModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}
                className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                  <div>
                    <h2 className="text-2xl font-black text-[#412918] flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#8B5E3C]" /> Customer Database
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">Browse and analyze your customer base</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                      <input 
                        type="text" 
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 w-64"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button 
                      onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}
                      className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-400"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                  {/* Left Column: List */}
                  <div className={`w-full md:w-1/2 border-r border-gray-100 overflow-y-auto ${selectedCustomer ? 'hidden md:block' : 'block'}`}>
                    <div className="p-4 space-y-2">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                          <div 
                            key={customer.id}
                            onClick={() => fetchCustomerHistory(customer)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                              selectedCustomer?.id === customer.id 
                                ? 'bg-[#FDFBF7] border-[#8B5E3C] shadow-sm' 
                                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#412918] text-white flex items-center justify-center font-black text-lg shrink-0">
                                {customer.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-[#412918] truncate">{customer.name}</h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {customer.phone || 'No phone'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm font-medium">No customers found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Detailed View */}
                  <div className={`w-full md:w-1/2 overflow-y-auto bg-gray-50/50 ${selectedCustomer ? 'block' : 'hidden md:flex items-center justify-center'}`}>
                    {selectedCustomer ? (
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-8">
                          <button 
                            onClick={() => setSelectedCustomer(null)}
                            className="md:hidden p-2 -ml-2 text-gray-400 mb-4"
                          >
                            <ChevronRight className="w-5 h-5 rotate-180" /> Back to list
                          </button>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                           <div className="flex items-center gap-5 mb-6">
                              <div className="w-20 h-20 rounded-2xl bg-[#FDFBF7] border border-[#EBE3D5] p-2">
                                 <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCustomer.name}`} 
                                    alt="Avatar" 
                                    className="w-full h-full"
                                 />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black text-[#412918]">{selectedCustomer.name}</h3>
                                 <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest mt-1">Platinum Member</p>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center gap-3 text-sm">
                                 <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4" />
                                 </div>
                                 <span className="text-gray-600 font-medium">{selectedCustomer.email}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                 <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4" />
                                 </div>
                                 <span className="text-gray-600 font-medium">{selectedCustomer.phone || 'Not provided'}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                 <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4" />
                                 </div>
                                 <span className="text-gray-600 font-medium">Flat {selectedCustomer.flat || 'N/A'}, Bldg {selectedCustomer.building || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                 <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                 </div>
                                 <span className="text-gray-600 font-medium">Joined {new Date(selectedCustomer.created_at || selectedCustomer.createdAt).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>

                        <h4 className="text-sm font-black text-[#412918] uppercase tracking-[0.2em] mb-4">Order History</h4>
                        
                        {isHistoryLoading ? (
                          <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5E3C]"></div>
                          </div>
                        ) : customerOrders.length > 0 ? (
                          <div className="space-y-3">
                            {customerOrders.map(order => (
                              <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#8B5E3C]/30 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#8B5E3C]">
                                    <Package className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[#412918]">#{order.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(order.created_at || order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-[#412918]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                                  <span className={`text-[9px] font-black uppercase tracking-tighter ${order.status === 'delivered' ? 'text-green-500' : 'text-orange-500'}`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                             <ShoppingBag className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                             <p className="text-xs font-bold text-gray-400 uppercase">No orders found</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-10">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                           <User className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-[#412918] mb-2">Select a Customer</h3>
                        <p className="text-sm text-gray-500 max-w-[200px]">Click on any customer from the list to view their detailed record and history.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

