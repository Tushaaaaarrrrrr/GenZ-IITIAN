import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Package, PenLine, BookOpen, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, profile, signIn, signOut, isManager, openLoginModal } = useAuth();
  const { cart } = useCart();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1">
          <span className="font-black text-2xl tracking-tight text-[#0b1120]">Gen-Z</span>
          <span className="font-black text-2xl tracking-tight text-red-500">IITian</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <Link to="/courses" className="hover:text-black transition-colors">Courses</Link>
          <Link to="/syllabus" className="hover:text-black transition-colors">Syllabus</Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center gap-1 hover:text-black transition-colors"
            >
              Resources
              <svg className={`w-3.5 h-3.5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {resourcesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white border-[3px] border-[#0b1120] rounded-xl shadow-[4px_4px_0px_#0b1120] py-2 z-50">
                <Link to="/resources" onClick={() => setResourcesOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#0b1120] transition-colors">
                  <Package className="w-[18px] h-[18px] text-gray-500" /> Resources
                </Link>
                <Link to="/blog" onClick={() => setResourcesOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#0b1120] transition-colors">
                  <PenLine className="w-[18px] h-[18px] text-gray-500" /> Blog
                </Link>
                <Link to="/docs" onClick={() => setResourcesOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#0b1120] transition-colors">
                  <BookOpen className="w-[18px] h-[18px] text-gray-500" /> Documentation
                </Link>
              </div>
            )}
          </div>
          <Link to="/about" className="hover:text-black transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-black transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/refer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors border-2 border-transparent shadow-[4px_4px_0px_#0b1120]"
              >
                <Gift className="w-4 h-4" />
                <span>Refer & Earn</span>
              </Link>
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0b1120] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors border-2 border-transparent"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black uppercase border border-white/20">
                    {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{profile?.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white border-[3px] border-[#0b1120] rounded-xl shadow-[6px_6px_0px_#0b1120] py-2 z-50">
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                      <UserIcon className="w-4 h-4" /> My Profile
                    </Link>
                    {isManager && (
                      <Link to="/manager" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Manager Panel
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        window.open('https://class.genziitian.in', '_blank', 'noopener,noreferrer');
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Class Dashboard
                    </button>
                    <div className="h-0.5 bg-gray-100 my-2 mx-4" />
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={openLoginModal} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#0b1120] text-white hover:bg-gray-800 transition-colors">
              Log in
            </button>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border-2 border-[#0b1120]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-6 flex flex-col gap-4 text-base font-bold text-gray-700">
          <Link to="/" onClick={() => setMobileOpen(false)} className="py-2">Home</Link>
          <Link to="/courses" onClick={() => setMobileOpen(false)} className="py-2">Courses</Link>
          <Link to="/syllabus" onClick={() => setMobileOpen(false)} className="py-2">Syllabus</Link>
          <Link to="/resources" onClick={() => setMobileOpen(false)} className="py-2">Resources</Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)} className="py-2">Blog</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="py-2">About Us</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-2">Contact</Link>
          {user && (
            <Link to="/refer" onClick={() => setMobileOpen(false)} className="py-2 text-blue-600">Refer & Earn</Link>
          )}
          <div className="h-0.5 bg-gray-100 my-2" />
          <a href="https://youtube.com/@Gen-ZIITian/" target="_blank" rel="noopener noreferrer" className="py-2 text-red-500 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            YouTube
          </a>
        </div>
      )}
    </nav>
  );
}
