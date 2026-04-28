import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/'}
          className="text-xl font-bold text-blue-600">
          Society Order
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            {user.role === 'customer' && (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                <Link to="/orders" className="text-gray-700 hover:text-blue-600">Orders</Link>
                <Link to="/cart" className="text-gray-700 hover:text-blue-600">Cart</Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
              </>
            )}
            {user.role === 'staff' && (
              <>
                <Link to="/staff" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                <Link to="/staff/pos" className="text-gray-700 hover:text-blue-600">POS</Link>
                <Link to="/staff/products" className="text-gray-700 hover:text-blue-600">Products</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                <Link to="/admin/users" className="text-gray-700 hover:text-blue-600">Users</Link>
                <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600">Orders</Link>
              </>
            )}
            <span className="text-sm text-gray-500">{user.name} ({user.role})</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
