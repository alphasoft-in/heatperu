import React, { useState, useEffect } from 'react';
import ProjectForm from './ProjectForm';

type ProjectData = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  executionDate: string | null;
  gallery: string;
  order: number;
};

export default function EditProjectModal({ project }: { project: ProjectData }) {
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
        className="text-[#0d1624] hover:text-[#f04f23] transition-colors p-1 rounded hover:bg-orange-50 cursor-pointer"
        title="Editar Proyecto"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-opacity text-left">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-[15px] font-bold text-gray-900">Editar Proyecto</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-0">
              <ProjectForm initialData={project} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
