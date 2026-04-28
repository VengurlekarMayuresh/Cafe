import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="font-semibold">{user.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <p className="font-semibold">{user.phone}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="font-semibold capitalize">{user.role}</p>
          </div>
          {user.building && (
            <div>
              <label className="text-sm text-gray-500">Building</label>
              <p className="font-semibold">{user.building}</p>
            </div>
          )}
          {user.flat && (
            <div>
              <label className="text-sm text-gray-500">Flat</label>
              <p className="font-semibold">{user.flat}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <p className={`font-semibold capitalize ${user.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
              {user.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
