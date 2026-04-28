import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminUsers() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => { fetchUsers(); }, []);

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

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to approve user');
    }
  };

  const handleBlock = async (id) => {
    if (!confirm('Block this user?')) return;
    try {
      await api.patch(`/admin/users/${id}/block`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to block user');
    }
  };

  if (loading) return <div className="text-center py-8">Loading users...</div>;

  const users = activeTab === 'pending' ? pendingUsers : allUsers;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          Pending ({pendingUsers.length})
        </button>
        <button onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          All Users ({allUsers.length})
        </button>
      </div>

      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.phone}</p>
              <p className="text-xs text-gray-500">{user.building}-{user.flat} | {user.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                user.status === 'approved' ? 'bg-green-100 text-green-800' :
                user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
              {user.status === 'pending' && (
                <button onClick={() => handleApprove(user.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm">Approve</button>
              )}
              {user.status !== 'blocked' && (
                <button onClick={() => handleBlock(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm">Block</button>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-gray-500 text-center py-8">No users found.</p>
        )}
      </div>
    </div>
  );
}
