import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, TrendingUp, AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    fetchData();
  }, []);

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
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE3D5] hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-[#412918]">{stats.totalCustomers}</p>
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

      </div>
    </div>
  );
}
