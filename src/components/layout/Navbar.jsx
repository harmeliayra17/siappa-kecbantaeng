import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePanic = () => {
    window.location.replace("https://www.google.com");
  };

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Lapor', path: '/lapor' },
    { label: 'Kegiatan', path: '/agenda' },
    { label: 'Edukasi', path: '/edukasi' },
    { label: 'Profil', path: '/profil' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl">
      <div className={`bg-white/80 backdrop-blur-xl shadow-lg px-6 py-3 md:px-8 md:py-4 border border-white/40 transition-all duration-300 ${isOpen ? 'rounded-2xl' : 'rounded-full'}`}>
        <div className="flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg group-hover:scale-105 transition flex items-center">
            <img 
                src="/si-appa-logo-circle.png"  
                alt="SI-APPA Logo"
                className="w-full h-full object-contain p-1" 
            />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-gray-900 text-sm md:text-base">SI-APPA</span>
              <span className="text-xs text-gray-500"> Kecamatan Bantaeng</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:text-accent transition relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handlePanic}
              className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white text-xs md:text-sm px-4 md:px-5 py-1.5 md:py-2 rounded-full font-semibold transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <LogOut size={16} /> Keluar Cepat
            </button>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-700 hover:text-accent transition p-2 hover:bg-gray-100 rounded-full"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-2 border-t border-gray-100 pt-4 animate-fade-in-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-accent rounded-lg transition"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button 
              onClick={handlePanic}
              className="w-full bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg font-semibold transition mt-2 flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Keluar Cepat
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
