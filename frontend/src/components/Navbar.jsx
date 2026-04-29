import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Search,
  User,
  Truck,
  Coffee,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [hasPendingOrders, setHasPendingOrders] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.length; // Matching the badge '3' logic in the image
      setCartItemCount(total);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  useEffect(() => {
    if (user?.role === 'staff' || user?.role === 'admin') {
      const checkPending = async () => {
        try {
          const res = await api.get('/orders', { params: { status: 'pending' } });
          const pendingOrders = res.data || res;
          setHasPendingOrders(pendingOrders.length > 0);
        } catch (e) {
          console.error('Failed to check pending orders');
        }
      };
      checkPending();
      const interval = setInterval(checkPending, 15000); // Check every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let navLinks = [
    { name: 'Home', path: '/' }
  ];

  if (user?.role === 'admin' || user?.role === 'staff') {
    navLinks.push({ name: 'Products', path: '/staff/products' });
  } else {
    navLinks.push({ name: 'Menu', path: '/menu' });
  }

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Dashboard', path: '/admin', hasBadge: hasPendingOrders });
    navLinks.push({ name: 'Customers', path: '/admin/customers' });
  } else if (user?.role === 'staff') {
    navLinks.push({ name: 'Dashboard', path: '/staff', hasBadge: hasPendingOrders });
  } else {
    navLinks.push({ name: 'Orders', path: '/orders' });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* 2. Main Navigation Bar */}
      <nav className="border-b border-[#EBE3D5] px-4 md:px-8 lg:px-12 py-3.5">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          
          {/* LEFT: Logo Section */}
          <div className="flex items-center gap-4 lg:gap-12">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="bg-[#412918] p-1.5 rounded-lg shadow-sm">
                <Coffee className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-serif font-bold text-[#412918] leading-none">
                  Society Café
                </span>
                <span className="text-[9px] md:text-[10px] text-gray-500 font-medium tracking-tight mt-0.5">
                  Good Food, Close to Home
                </span>
              </div>
            </Link>

            {/* Links - Desktop Only */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '');
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-[14px] font-bold transition-all relative py-1 ${
                      isActive ? 'text-[#8B5E3C]' : 'text-gray-600 hover:text-[#8B5E3C]'
                    }`}
                  >
                    {link.name}
                    {link.hasBadge && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#8B5E3C] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Search, Cart, Profile */}
          <div className="flex items-center gap-3 md:gap-7">
            
            {/* Search Bar - Exact pill shape from image */}
            {/* <div className="hidden lg:flex relative items-center group">
              <input
                type="text"
                placeholder="Search for items..."
                className="bg-[#F5F1ED] border-none rounded-full py-2.5 pl-5 pr-12 text-sm w-60 xl:w-72 focus:ring-2 focus:ring-[#D4A373]/30 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-4 group-hover:text-[#8B5E3C] transition-colors" />
            </div> */}

            {/* Cart Icon with badge */}
            <Link to="/cart" className="relative group p-1">
              <ShoppingCart className="w-6 h-6 text-[#412918] group-hover:text-[#8B5E3C] transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B5E3C] text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Profile Section */}
            <div className="h-8 w-[1px] bg-[#EBE3D5] mx-1 hidden sm:block" />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#F5F1ED] border border-[#EBE3D5] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <p className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Hello, {user.name.split(' ')[0]}</p>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[13px] font-bold text-[#412918]">Account</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-[#EBE3D5] py-3 z-[60]"
                    >
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F1ED] font-medium">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F1ED] font-medium">My Orders</Link>
                      <div className="border-t border-[#F5F1ED] mt-2 pt-2">
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="bg-[#412918] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#5a3f2c] transition-all shadow-md active:scale-95">
                Login
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1 text-[#412918]"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE SIDE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white z-[80] shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-serif font-bold text-[#412918] text-xl">Menu</span>
                <X className="w-6 h-6 text-gray-400" onClick={() => setMobileMenuOpen(false)} />
              </div>
              <div className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-bold text-gray-700 hover:text-[#8B5E3C] transition-colors relative inline-block w-fit"
                  >
                    {link.name}
                    {link.hasBadge && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}