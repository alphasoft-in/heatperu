import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function DeleteSubcategoryButton({ id, name }: { id: number, name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/subcategorias/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la subcategoría');
      }

      toast.success('Subcategoría eliminada correctamente');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-red-600 hover:text-red-900 bg-red-50 rounded transition-colors flex items-center justify-center cursor-pointer" 
        title="Eliminar Subcategoría"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm whitespace-normal text-left">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar subcategoría?</h3>
              <div className="text-sm text-gray-500 mb-6 space-y-2">
                <p>Estás a punto de eliminar la subcategoría:</p>
                <p className="font-medium text-gray-900 break-words text-base">"{name}"</p>
                <p className="text-xs">Esta acción no se puede deshacer.</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-2 rounded text-xs">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={loading}
                  className={`flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
