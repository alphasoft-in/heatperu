import React, { useState, useEffect } from 'react';
import SubcategoryForm from './SubcategoryForm';

type Category = {
  id: number;
  name: string;
};

type Subcategory = {
  id: number;
  name: string;
  categoryId: number;
  imageUrl: string;
};

export default function EditSubcategoryModal({ 
  subcategory,
  categories 
}: { 
  subcategory: Subcategory;
  categories: Category[];
}) {
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
        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded transition-colors cursor-pointer" 
        title="Editar Subcategoría"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-opacity whitespace-normal text-left">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-[15px] font-bold text-gray-900">Editar Subcategoría</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-2">
              <SubcategoryForm initialData={subcategory} categories={categories} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
