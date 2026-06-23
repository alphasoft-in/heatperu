import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function DeleteTutorialButton({ id, title }: { id: number, title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tutorials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Tutorial eliminado correctamente');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Ocurrió un error al eliminar');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error inesperado');
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50 cursor-pointer"
        title="Eliminar Tutorial"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-fade-in-up text-left">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Tutorial</h3>
              <p className="text-sm text-gray-500">
                ¿Estás seguro que deseas eliminar el tutorial <span className="font-semibold text-gray-700">"{title}"</span>? Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center cursor-pointer"
              >
                {loading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
