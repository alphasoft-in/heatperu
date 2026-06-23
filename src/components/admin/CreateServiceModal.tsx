import React, { useState, useEffect } from 'react';
import ServiceForm from './ServiceForm';

export default function CreateServiceModal({ nextOrder = 1 }: { nextOrder?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#f04f23] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#d0421c] transition-colors flex items-center shadow-sm cursor-pointer"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Añadir Nuevo Servicio
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-[15px] font-bold text-gray-900">Añadir Servicio</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-0">
              <ServiceForm nextOrder={nextOrder} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
