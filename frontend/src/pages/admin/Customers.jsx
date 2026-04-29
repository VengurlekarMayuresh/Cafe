import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Mail, Phone, MapPin, 
  ShoppingBag, Package, ArrowUpDown, ChevronRight, X, User
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params: { role: 'customer' } });
      setCustomers(res.data || res);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
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

  const sortedAndFilteredCustomers = useMemo(() => {
    let result = customers.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone?.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [customers, searchQuery, sortBy]);

  if (loading) return <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#412918] flex items-center gap-3 mb-1">
              <Users className="w-8 h-8 text-[#8B5E3C]" /> Customer Base
            </h1>
            <p className="text-gray-500 font-medium">Manage and analyze your growing customer community.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#EBE3D5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-[#EBE3D5] rounded-xl px-3 py-2.5">
              <ArrowUpDown className="w-4 h-4 text-[#8B5E3C]" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List Section */}
          <div className="lg:col-span-7 space-y-4">
            {sortedAndFilteredCustomers.length > 0 ? (
              sortedAndFilteredCustomers.map(customer => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={customer.id}
                  onClick={() => fetchCustomerHistory(customer)}
                  className={`p-5 rounded-3xl cursor-pointer transition-all border flex items-center justify-between group ${
                    selectedCustomer?.id === customer.id 
                      ? 'bg-[#412918] border-[#412918] text-white shadow-xl' 
                      : 'bg-white border-[#EBE3D5] hover:border-[#8B5E3C]/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                      selectedCustomer?.id === customer.id ? 'bg-white/10' : 'bg-gray-50 text-[#8B5E3C]'
                    }`}>
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`} 
                        alt="Avatar" 
                        className="w-full h-full p-1"
                      />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${selectedCustomer?.id === customer.id ? 'text-white' : 'text-[#412918]'}`}>{customer.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <p className={`text-xs flex items-center gap-1.5 ${selectedCustomer?.id === customer.id ? 'text-white/70' : 'text-gray-500 font-medium'}`}>
                          <Phone className="w-3.5 h-3.5" /> {customer.phone || 'N/A'}
                        </p>
                        <p className={`text-xs flex items-center gap-1.5 ${selectedCustomer?.id === customer.id ? 'text-white/70' : 'text-gray-500 font-medium'}`}>
                          <Mail className="w-3.5 h-3.5" /> {customer.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                    selectedCustomer?.id === customer.id ? 'text-white' : 'text-gray-300'
                  }`} />
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border border-[#EBE3D5]">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <h3 className="text-xl font-bold text-[#412918]">No customers found</h3>
                <p className="text-gray-500">Try broadening your search criteria.</p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5 h-fit sticky top-28">
            <AnimatePresence mode="wait">
              {selectedCustomer ? (
                <motion.div 
                  key={selectedCustomer.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-[#EBE3D5] overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-24 h-24 rounded-3xl bg-[#FDFBF7] border-2 border-[#EBE3D5] p-2 mb-4 shadow-sm">
                       <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCustomer.name}`} 
                          alt="Avatar" 
                          className="w-full h-full"
                       />
                    </div>
                    <h3 className="text-2xl font-black text-[#412918]">{selectedCustomer.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider border border-purple-100">Loyal Customer</span>
                       <span className="px-3 py-1 rounded-full bg-[#FDFBF7] text-[#8B5E3C] text-[10px] font-black uppercase tracking-wider border border-[#EBE3D5]">Approved</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 mb-10">
                     <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                           <Mail className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                           <p className="text-sm font-bold text-[#412918] truncate">{selectedCustomer.email}</p>
                        </div>
                     </div>
                     <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-white text-green-600 flex items-center justify-center shadow-sm">
                           <Phone className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact Number</p>
                           <p className="text-sm font-bold text-[#412918]">{selectedCustomer.phone || 'Not provided'}</p>
                        </div>
                     </div>
                     <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-sm">
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Residential Details</p>
                           <p className="text-sm font-bold text-[#412918]">Bldg {selectedCustomer.building || 'N/A'}, Flat {selectedCustomer.flat || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-5">
                        <h4 className="text-xs font-black text-[#412918] uppercase tracking-[0.2em]">Order History</h4>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{customerOrders.length} Total</span>
                     </div>
                     
                     {isHistoryLoading ? (
                       <div className="flex justify-center py-10">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5E3C]"></div>
                       </div>
                     ) : customerOrders.length > 0 ? (
                       <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                         {customerOrders.map(order => (
                           <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#8B5E3C]/30 transition-all shadow-sm">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#8B5E3C]">
                                 <Package className="w-5 h-5" />
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-[#412918]">#{order.id.slice(0, 8).toUpperCase()}</p>
                                 <p className="text-[9px] text-gray-400 font-bold">{new Date(order.created_at || order.createdAt).toLocaleDateString()}</p>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-sm font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                               <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${order.status === 'delivered' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                                 {order.status}
                               </span>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <ShoppingBag className="w-10 h-10 mx-auto text-gray-200 mb-2 opacity-30" />
                          <p className="text-[10px] font-black text-gray-400 uppercase">New customer - No orders yet</p>
                       </div>
                     )}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-[#EBE3D5] flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <User className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-[#412918] mb-2">Select a Customer</h3>
                  <p className="text-sm text-gray-400 max-w-[220px]">Choose a customer from the left to view their full profile and order history.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
