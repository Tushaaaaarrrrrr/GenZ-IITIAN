import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Package, PenLine, BookOpen } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
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
          <a
            href="https://youtube.com/@Gen-ZIITian/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500 text-white border-2 border-[#0b1120] hover:bg-red-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"></polygon></svg>
            YouTube
          </a>
          <a href="https://live.iitpathshala.in/dashboard" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#0b1120] text-white hover:bg-gray-800 transition-colors">
            Log in
          </a>
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
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 flex flex-col gap-3 text-sm font-semibold text-gray-700">
          <Link to="/" onClick={() => setMobileOpen(false)} className="py-2 hover:text-black">Home</Link>
          <Link to="/courses" onClick={() => setMobileOpen(false)} className="py-2 hover:text-black">Courses</Link>
          <Link to="/resources" onClick={() => setMobileOpen(false)} className="py-2 hover:text-black">Resources</Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)} className="py-2 hover:text-black">Blog</Link>
          <Link to="/docs" onClick={() => setMobileOpen(false)} className="py-2 hover:text-black">Documentation</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="py-2 hover:text-black">About Us</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-2 hover:text-black">Contact</Link>
          <a href="https://youtube.com/@Gen-ZIITian/" target="_blank" rel="noopener noreferrer" className="py-2 text-red-500 font-bold flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            YouTube
          </a>
        </div>
      )}
    </nav>
  );
}
