import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Search, User, Truck, Coffee, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // For the badge, ideally you'd get this from a CartContext. 
  // We'll mock it or get it from localStorage for now.
  const cartItemCount = JSON.parse(localStorage.getItem('cart') || '[]').length || 3; 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Orders', path: '/orders' },
    { name: 'Offers', path: '/offers' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-[#6F4E37] text-white text-xs py-1.5 flex justify-center items-center gap-2 font-medium">
        <Truck className="w-4 h-4" />
        <span>Free delivery within the society on orders above ₹199</span>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#F5F1ED] shadow-sm px-6 py-4 border-b border-[#E5DCCF]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-[#6F4E37]">
              <Coffee className="w-8 h-8 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-[#6F4E37] leading-none tracking-tight">
                Society Café
              </span>
              <span className="text-[0.65rem] text-[#A67B5B] uppercase tracking-wider font-semibold">
                Good Food, Close to Home
              </span>
            </div>
          </Link>

          {/* Center Links (Customer only) */}
          {(!user || user.role === 'customer') && (
            <div className="hidden md:flex items-center gap-8 font-medium">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '');
                return (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className={`relative text-sm transition-colors ${
                      isActive ? 'text-[#6F4E37] font-semibold' : 'text-gray-600 hover:text-[#A67B5B]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-[#6F4E37] rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {(!user || user.role === 'customer') ? (
              <>
                {/* Search Bar */}
                <div className="hidden lg:flex relative items-center">
                  <input 
                    type="text" 
                    placeholder="Search for items..." 
                    className="bg-white border border-[#E5DCCF] rounded-full py-2 pl-4 pr-10 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#A67B5B] focus:border-[#A67B5B] transition-all shadow-sm"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                </div>

                {/* Cart Icon */}
                <Link to="/cart" className="relative text-[#6F4E37] hover:text-[#A67B5B] transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#6F4E37] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#F5F1ED]">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {/* User Profile */}
                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#6F4E37] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E5DCCF] flex items-center justify-center text-[#6F4E37]">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="hidden sm:inline-block">Hello, {user.name?.split(' ')[0] || 'User'}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5DCCF] py-2 z-50">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F1ED]">My Profile</Link>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F1ED]">My Orders</Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="bg-[#6F4E37] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#5a3f2c] transition-colors shadow-sm">
                    Login
                  </Link>
                )}
              </>
            ) : (
              // Staff / Admin Right Section
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 bg-[#E5DCCF] px-3 py-1 rounded-full">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Mode
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
        </div>
      </nav>
    </div>
  );
}
