import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './utils/ProtectedRoute';
import './index.css'
import Navbar from './components/Navbar';
import Login from './pages/Login';
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
import Footer from './components/Footer';
import NewOrderAlert from './components/NewOrderAlert';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <NewOrderAlert />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<CustomerHome />} />
              <Route path="/menu" element={<CustomerMenu />} />

              {/* Protected Customer Routes */}
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

              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
