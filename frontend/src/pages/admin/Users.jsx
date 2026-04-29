import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle, Ban, Clock, Users as UsersIcon, Trash2, Key } from 'lucide-react';
import api from '../../utils/api';

export default function AdminUsers() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'customers', 'staff'

  const fetchUsers = async () => {
    try {
      const [pending, all] = await Promise.all([
        api.get('/admin/users/pending'),
        api.get('/admin/users'),
      ]);
      setPendingUsers(pending.data || pending);
      setAllUsers(all.data || all);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to approve user');
    }
  };

  const handleBlock = async (id) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    try {
      await api.patch(`/admin/users/${id}/block`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to block user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  const handleChangePassword = async (id) => {
    const newPassword = window.prompt('Enter new password (minimum 6 characters):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    try {
      await api.patch(`/admin/users/${id}/password`, { password: newPassword });
      alert('Password changed successfully');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to change password');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div></div>;

  const filteredUsers = allUsers.filter(u => u.role !== 'admin');
  const pendingList = pendingUsers.filter(u => u.role !== 'admin');
  const customersList = filteredUsers.filter(u => u.role === 'customer' && u.status !== 'pending');
  const staffList = filteredUsers.filter(u => u.role === 'staff' && u.status !== 'pending');

  const displayedUsers = activeTab === 'pending' ? pendingList : 
                        activeTab === 'customers' ? customersList : staffList;

  return (
    <div className="min-h-screen bg-[#F5F1ED] font-sans pb-24 pt-8 text-[#333333]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#412918] mb-1 flex items-center gap-3">
              <UsersIcon className="w-8 h-8 text-[#8B5E3C]" /> User Management
            </h1>
            <p className="text-gray-500 font-medium">Approve new registrations and manage existing users.</p>
          </div>
          
          <div className="flex bg-white rounded-full p-1 border border-[#EBE3D5] shadow-sm overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'pending' ? 'bg-[#8B5E3C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Approval ({pendingList.length})
            </button>
            <button 
              onClick={() => setActiveTab('customers')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'customers' ? 'bg-[#412918] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Customers ({customersList.length})
            </button>
            <button 
              onClick={() => setActiveTab('staff')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'staff' ? 'bg-[#412918] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Staff ({staffList.length})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {displayedUsers.map(user => (
            <div key={user.id} className="bg-white border border-[#EBE3D5] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  user.status === 'approved' ? 'bg-green-50 text-green-600' :
                  user.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {user.status === 'approved' ? <ShieldCheck className="w-6 h-6" /> :
                   user.status === 'pending' ? <Clock className="w-6 h-6" /> :
                   <ShieldAlert className="w-6 h-6" />}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-[#412918]">{user.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                    <span>{user.phone}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium">Flat {user.flat}, Building {user.building}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-600">{user.role}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-none border-gray-100">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize hidden sm:inline-block ${
                  user.status === 'approved' ? 'bg-green-100 text-green-800' :
                  user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
                
                {user.status === 'pending' && (
                  <button 
                    onClick={() => handleApprove(user.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#8B5E3C] hover:bg-[#724a2e] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
                
                {user.role !== 'admin' && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    {user.status !== 'blocked' && (
                      <button 
                        onClick={() => handleBlock(user.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 p-2.5 rounded-xl font-bold transition-colors"
                        title="Block User"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleChangePassword(user.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 p-2.5 rounded-xl font-bold transition-colors"
                      title="Change Password"
                    >
                      <Key className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2.5 rounded-xl font-bold transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
            </div>
          ))}
          
          {displayedUsers.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EBE3D5] shadow-sm">
              <ShieldCheck className="w-16 h-16 text-[#D4A373] mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-[#412918]">No {activeTab} users found</h2>
              <p className="text-gray-500 mt-2">You are all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
