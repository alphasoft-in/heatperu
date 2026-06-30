import React, { useState, useEffect } from 'react';
import { FaYoutube as Youtube, FaFacebookF as Facebook, FaInstagram as Instagram, FaLinkedinIn as Linkedin } from 'react-icons/fa6';
import { FiSearch as Search, FiMenu as Menu, FiX as Close } from 'react-icons/fi';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Productos', path: '/productos' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Proyectos', path: '/proyectos' },
    { name: 'Tutoriales', path: '/tutoriales' },
    { name: 'Contáctenos', path: '/contacto' },
  ];

  const getDesktopLinkClass = (path: string) => {
    const isActive = path === '/' ? currentPath === '/' : currentPath.startsWith(path);
    return `transition-colors ${isActive ? 'text-[#ff7b00]' : 'text-white hover:text-[#ff7b00]'}`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = path === '/' ? currentPath === '/' : currentPath.startsWith(path);
    return `px-6 py-3 border-b border-gray-50 transition-colors ${isActive ? 'text-[#f04f23] bg-orange-50/50' : 'text-gray-800 hover:bg-gray-50'}`;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q');
    if (q && typeof q === 'string' && q.trim() !== '') {
      window.location.href = `/buscar?q=${encodeURIComponent(q.trim())}`;
    }
  };

  return (
    <header className="w-full flex flex-col font-sans relative">
      {/* Top section: Logo, Search, Socials */}
      <div className="w-full bg-white relative z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 md:py-6 md:px-8">
          
          {/* Logo Area */}
          <a href="/" className="flex items-center">
            <img src="/logoheat.png" alt="Heat Factory" className="h-16 md:h-24 object-contain" />
          </a>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-12">
            <input 
              type="text" 
              name="q"
              placeholder="Buscar por producto, marca, SKU..." 
              className="w-full border border-gray-300 rounded-l-md px-4 py-3 text-sm focus:outline-none focus:border-[#f04f23] focus:ring-1 focus:ring-[#f04f23]"
            />
            <button type="submit" className="bg-[#f04f23] text-white px-8 py-3 rounded-r-md hover:bg-[#d8401a] transition-colors flex items-center justify-center cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Desktop Social Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <a href="https://www.youtube.com/@HEATFACTORYPERU" target="_blank" rel="noopener noreferrer" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Youtube className="w-6 h-6" /></a>
            <a href="https://www.facebook.com/heatfactoryperu" target="_blank" rel="noopener noreferrer" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Facebook className="w-[1.2rem] h-[1.2rem]" /></a>
            <a href="https://www.instagram.com/calderas_quemadores_peru" target="_blank" rel="noopener noreferrer" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Instagram className="w-6 h-6" /></a>
            <a href="https://pe.linkedin.com/company/heat-factory" target="_blank" rel="noopener noreferrer" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Linkedin className="w-6 h-6" /></a>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden text-gray-800 p-2 focus:outline-none cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <Close className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Permanent Search Bar */}
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="flex w-full shadow-sm">
            <input 
              type="text" 
              name="q"
              placeholder="Buscar por producto, marca, SKU..." 
              className="w-full border-2 border-[#f04f23] border-r-0 rounded-l-md px-4 py-2 text-sm focus:outline-none text-gray-800"
            />
            <button type="submit" className="bg-[#f04f23] text-white px-5 py-2 rounded-r-md flex items-center justify-center cursor-pointer hover:bg-[#d8401a] transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Bottom Nav */}
      <nav className="hidden md:block w-full bg-[#1e1a17] relative z-40">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center py-4 px-8 space-x-6 lg:space-x-10 text-sm lg:text-base font-semibold tracking-wide">
          {navLinks.map((link) => (
            <a key={link.path} href={link.path} className={getDesktopLinkClass(link.path)}>
              {link.name}
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-30 border-t border-gray-100 flex flex-col">
          {/* Mobile Nav Links */}

          {/* Mobile Nav Links */}
          <nav className="flex flex-col py-2 font-semibold text-sm text-center">
            {navLinks.map((link) => (
              <a key={link.path} href={link.path} className={getMobileLinkClass(link.path)}>
                {link.name}
              </a>
            ))}
          </nav>

          {/* Mobile Socials */}
          <div className="flex items-center justify-center space-x-6 p-6 bg-gray-50">
            <a href="https://www.youtube.com/@HEATFACTORYPERU" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f04f23]"><Youtube className="w-6 h-6" /></a>
            <a href="https://www.facebook.com/heatfactoryperu" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f04f23]"><Facebook className="w-5 h-5" /></a>
            <a href="https://www.instagram.com/calderas_quemadores_peru" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f04f23]"><Instagram className="w-6 h-6" /></a>
            <a href="https://pe.linkedin.com/company/heat-factory" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f04f23]"><Linkedin className="w-6 h-6" /></a>
          </div>
        </div>
      )}
    </header>
  );
}
