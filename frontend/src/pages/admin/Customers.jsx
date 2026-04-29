import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Phone, MapPin, 
  ShoppingBag, ChevronRight, X, TrendingUp, Package
} from 'lucide-react';
import api from '../../utils/api';
import InvoiceModal from '../../components/InvoiceModal';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const usersRes = await api.get('/admin/users');
      const allUsers = usersRes.data || usersRes;
      setCustomers(allUsers.filter(u => u.role === 'customer'));
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async (customerId) => {
    try {
      setIsHistoryLoading(true);
      const res = await api.get('/admin/orders', { params: { customerId, limit: 1000 } });
      setCustomerOrders(res.data || res);
    } catch (err) {
      console.error('Failed to fetch customer history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerHistory(customer.id);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').includes(searchQuery) ||
      (c.flat || '').includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Aggregate Stats for selected customer
  const aggregateStats = useMemo(() => {
    if (!customerOrders.length) return { items: 0, revenue: 0 };
    let items = 0;
    let revenue = 0;
    customerOrders.forEach(order => {
      if (order.status === 'delivered') {
        revenue += parseFloat(order.total_price);
        order.items?.forEach(item => {
          items += item.quantity;
        });
      }
    });
    return { items, revenue };
  }, [customerOrders]);

  if (loading) return <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#412918] mb-1">Customer Database</h1>
            <p className="text-gray-500 font-medium text-sm">View and manage all registered cafe customers.</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone or flat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/10 text-sm placeholder:text-gray-400 bg-white"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="space-y-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={customer.id}
                onClick={() => handleCustomerClick(customer)}
                className="bg-white border border-[#EBE3D5] rounded-3xl p-6 hover:shadow-xl hover:border-[#8B5E3C]/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row items-center gap-10 flex-1">
                  <div className="min-w-[200px]">
                    <h3 className="text-xl font-black text-[#412918] mb-1">{customer.name}</h3>
                    <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest">Registered Customer</p>
                  </div>

                  <div className="hidden md:block w-[1px] h-10 bg-gray-100" />

                  <div className="flex-1 min-w-[200px] flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact Number</p>
                        <p className="text-sm font-bold text-[#412918]">{customer.phone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                        <p className="text-sm font-bold text-[#412918]">Bldg {customer.building || 'N/A'}, Flat {customer.flat || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F1ED] flex items-center justify-center text-[#412918] group-hover:bg-[#412918] group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-[#EBE3D5] p-20 text-center">
              <Users className="w-20 h-20 text-gray-200 mx-auto mb-6 opacity-30" />
              <h2 className="text-2xl font-bold text-[#412918]">No customers found</h2>
              <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>

        {/* Big Modal for Customer History */}
        <AnimatePresence>
          {selectedCustomer && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedCustomer(null)}
                className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-[1100px] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto"
                >
                  <div className="p-8 sm:p-12 border-b border-gray-100 bg-white relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#F5F1ED] rounded-3xl flex items-center justify-center text-[#8B5E3C]">
                             <Users className="w-8 h-8" />
                          </div>
                          <div>
                             <h2 className="text-3xl font-black text-[#412918]">{selectedCustomer.name}</h2>
                             <div className="flex items-center gap-4 text-sm text-gray-500 font-bold mt-1">
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Bldg {selectedCustomer.building}, Flat {selectedCustomer.flat}</span>
                             </div>
                          </div>
                       </div>

                       {/* Aggregated Stats - NEW */}
                       <div className="flex gap-6">
                          <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl min-w-[160px]">
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Package className="w-3 h-3" /> Items Purchased
                             </p>
                             <p className="text-2xl font-black text-blue-700">{aggregateStats.items}</p>
                          </div>
                          <div className="bg-green-50 border border-green-100 p-4 rounded-3xl min-w-[160px]">
                             <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" /> Total Revenue
                             </p>
                             <p className="text-2xl font-black text-green-700">₹{aggregateStats.revenue.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="absolute top-8 right-8 p-3 text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-8 h-8" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-[#FDFBF7]/30">
                     <div className="space-y-6">
                        {isHistoryLoading ? (
                          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B5E3C]"></div></div>
                        ) : customerOrders.length > 0 ? (
                           customerOrders.map(order => (
                              <motion.div 
                                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                 key={order.id} 
                                 onClick={() => setSelectedOrder(order)}
                                 className="bg-white border border-[#EBE3D5] rounded-[2rem] p-6 hover:shadow-xl hover:border-[#8B5E3C]/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer shadow-sm"
                              >
                                 <div className="flex flex-col sm:flex-row items-center gap-10 flex-1">
                                    <div className="min-w-[150px]">
                                       <div className="flex items-center gap-2 mb-1">
                                          <h4 className="text-xl font-black text-[#412918]">#{order.id.slice(0, 8).toUpperCase()}</h4>
                                          <span className="text-[9px] font-black text-[#8B5E3C] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{order.order_type}</span>
                                       </div>
                                       <p className="text-sm font-bold text-gray-400">
                                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                                       </p>
                                    </div>

                                    <div className="hidden md:block w-[1px] h-10 bg-gray-100" />

                                    <div className="flex-1 min-w-[200px]">
                                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Staff Handler</p>
                                       <p className="text-base font-black text-[#412918] mb-0.5">{order.handler?.name || 'Unassigned'}</p>
                                       <p className="text-xs font-bold text-gray-500">Processing Team</p>
                                    </div>

                                    <div className="hidden md:block w-[1px] h-10 bg-gray-100" />

                                    <div className="flex-1 min-w-[180px]">
                                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Status</p>
                                       <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 border uppercase ${
                                            order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                            order.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-100'
                                          }`}>
                                             {order.status === 'delivered' ? 'Completed' : order.status}
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-gray-100">
                                    <div className="text-right">
                                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                       <p className="text-2xl font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-[#F5F1ED] flex items-center justify-center text-[#412918] group-hover:bg-[#412918] group-hover:text-white transition-all shadow-sm">
                                       <ShoppingBag className="w-5 h-5" />
                                    </div>
                                 </div>
                              </motion.div>
                           ))
                        ) : (
                           <div className="text-center py-20 text-gray-400">
                              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                              <p className="text-lg font-bold">No orders found for this customer.</p>
                           </div>
                        )}
                     </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Shared Invoice Modal */}
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
