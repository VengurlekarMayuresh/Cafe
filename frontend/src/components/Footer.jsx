import { Link } from 'react-router-dom';
import { 
  Coffee, 
  Phone, Mail, MapPin, 
  ArrowRight, Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#412918] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-[#8B5E3C] p-2 rounded-xl">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">Society Café</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Bringing premium coffee, delicious snacks, and daily essentials directly to your doorstep. Your neighborhood cafe, just a click away.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#8B5E3C] transition-all group">
                <svg className="w-5 h-5 fill-gray-400 group-hover:fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.353 2.615 6.777 6.974 6.977 1.28.058 1.688.072 4.954.072 3.266 0 3.674-.014 4.954-.072 4.354-.2 6.777-2.615 6.977-6.977.058-1.28.072-1.688.072-4.954s-.014-3.674-.072-4.954c-.2-4.354-2.615-6.777-6.977-6.977C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#8B5E3C] transition-all group">
                <svg className="w-5 h-5 fill-gray-400 group-hover:fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-green-600 transition-all group">
                <svg className="w-5 h-5 fill-gray-400 group-hover:fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.553 4.197 1.608 6.033L0 24l6.135-1.61a11.787 11.787 0 005.91 1.586h.005c6.634 0 12.048-5.414 12.048-12.05a11.8 11.8 0 00-3.483-8.52z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/menu" className="text-gray-400 hover:text-[#8B5E3C] transition-colors flex items-center gap-2 text-sm font-medium group">
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" /> Full Menu
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-[#8B5E3C] transition-colors flex items-center gap-2 text-sm font-medium group">
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" /> Track Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-[#8B5E3C] transition-colors flex items-center gap-2 text-sm font-medium group">
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" /> My Profile
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-[#8B5E3C] transition-colors flex items-center gap-2 text-sm font-medium group">
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" /> Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#8B5E3C]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-gray-200">+91 98765 43210</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#8B5E3C]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Email Support</p>
                  <p className="text-sm font-bold text-gray-200">hello@societycafe.com</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#8B5E3C]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Our Location</p>
                  <p className="text-sm font-bold text-gray-200">Main Square, Society Complex, Mumbai</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter/Action */}
          <div>
            <h3 className="text-lg font-bold mb-6">Special Offers</h3>
            <p className="text-gray-400 text-sm mb-6">
              Subscribe to get latest updates and offers from Society Café.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email..." 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] transition-all"
              />
              <button className="bg-[#8B5E3C] hover:bg-[#a16d46] p-2.5 rounded-xl transition-all shadow-lg active:scale-95">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs font-medium">
            © {currentYear} Society Café. All rights reserved. Designed for the community.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by <span className="text-white font-bold">Society Tech Team</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-gray-500 hover:text-white text-xs font-medium transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white text-xs font-medium transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
