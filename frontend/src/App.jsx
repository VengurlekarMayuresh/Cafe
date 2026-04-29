import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './utils/ProtectedRoute';
import './index.css'
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import CustomerHome from './pages/customer/Home';
import CustomerMenu from './pages/customer/Menu';
import CustomerOrders from './pages/customer/Orders';
import Cart from './pages/customer/Cart';
import Profile from './pages/customer/Profile';
import StaffDashboard from './pages/staff/Dashboard';
import StaffPOS from './pages/staff/POS';
import StaffProducts from './pages/staff/Products';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCustomers from './pages/admin/Customers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Customer Routes */}
          <Route path="/" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><CustomerHome /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><CustomerMenu /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><CustomerOrders /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><Cart /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}><Profile /></ProtectedRoute>} />

          {/* Staff Routes */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/pos" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffPOS /></ProtectedRoute>} />
          <Route path="/staff/products" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffProducts /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><AdminCustomers /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
