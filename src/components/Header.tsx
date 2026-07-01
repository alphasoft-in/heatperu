import React, { useState, useEffect } from 'react';
import { FaYoutube as Youtube, FaFacebookF as Facebook, FaInstagram as Instagram, FaLinkedinIn as Linkedin } from 'react-icons/fa6';
import { FiSearch as Search, FiMenu as Menu, FiX as Close, FiMic as Mic } from 'react-icons/fi';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    // Verificamos soporte de la API de reconocimiento de voz
    if (typeof window !== 'undefined') {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setSpeechSupported(false);
      }
    }
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

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Idioma español
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearchQuery(speechResult);
      // Auto enviar la búsqueda
      window.location.href = `/buscar?q=${encodeURIComponent(speechResult.trim())}`;
    };

    recognition.onerror = (event: any) => {
      console.error("Error en reconocimiento de voz", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="w-full flex flex-col font-sans relative">
      {/* Top section: Logo, Search, Socials */}
      <div className="w-full bg-white relative z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 md:py-6 md:px-8">
          
          {/* Logo Area */}
          <a href="/" className="flex items-center">
            <img src="/logoheat.avif" alt="Heat Factory" className="h-16 md:h-24 object-contain" />
          </a>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-12 relative group">
            <input 
              type="text" 
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isListening ? "Escuchando su búsqueda..." : "Buscar por producto, marca, SKU..."}
              className={`w-full border ${isListening ? 'border-[#f04f23] ring-1 ring-[#f04f23]' : 'border-gray-300'} rounded-l-md px-4 py-3 pr-[4rem] text-sm focus:outline-none focus:border-[#f04f23] focus:ring-1 focus:ring-[#f04f23] transition-all`}
            />
            {speechSupported && (
              <button 
                type="button" 
                onClick={startListening}
                className={`absolute right-[90px] top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors cursor-pointer ${isListening ? 'text-[#f04f23] animate-pulse bg-red-50' : 'text-gray-400 hover:text-[#f04f23] group-hover:text-gray-600'}`}
                title="Búsqueda por voz"
                aria-label="Búsqueda por voz"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
            <button type="submit" aria-label="Buscar" className="bg-[#f04f23] text-white px-8 py-3 rounded-r-md hover:bg-[#d8401a] transition-colors flex items-center justify-center cursor-pointer z-10 relative">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Desktop Social Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <a href="https://www.youtube.com/@HEATFACTORYPERU" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Youtube className="w-6 h-6" /></a>
            <a href="https://www.facebook.com/heatfactoryperu" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Facebook className="w-[1.2rem] h-[1.2rem]" /></a>
            <a href="https://www.instagram.com/calderas_quemadores_peru" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Instagram className="w-6 h-6" /></a>
            <a href="https://pe.linkedin.com/company/heat-factory" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[#0d1624] hover:text-[#f04f23] transition-colors"><Linkedin className="w-6 h-6" /></a>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="lg:hidden text-gray-800 p-2 focus:outline-none cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <Close className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Permanent Search Bar */}
        <div className="lg:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="flex w-full shadow-sm relative group">
            <input 
              type="text" 
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isListening ? "Escuchando..." : "Buscar por producto, marca, SKU..."}
              className={`w-full border-2 ${isListening ? 'border-[#f04f23] bg-red-50/20' : 'border-[#f04f23]'} border-r-0 rounded-l-md px-4 py-2 pr-[2.5rem] text-sm focus:outline-none text-gray-800 transition-colors`}
            />
            {speechSupported && (
              <button 
                type="button" 
                onClick={startListening}
                className={`absolute right-[65px] top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors cursor-pointer ${isListening ? 'text-[#f04f23] animate-pulse bg-red-50' : 'text-gray-400 hover:text-[#f04f23]'}`}
                title="Búsqueda por voz"
                aria-label="Búsqueda por voz"
              >
                <Mic className="w-[18px] h-[18px]" />
              </button>
            )}
            <button type="submit" aria-label="Buscar" className="bg-[#f04f23] text-white px-5 py-2 rounded-r-md flex items-center justify-center cursor-pointer hover:bg-[#d8401a] transition-colors z-10 relative">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Bottom Nav */}
      <nav className="hidden lg:block w-full bg-[#1e1a17] relative z-40">
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
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg z-30 border-t border-gray-100 flex flex-col">
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
