import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function DeleteTutorialCategoryButton({ id, name }: { id: number; name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/tutorial-categorias/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar la categoría');
      }
      toast.success('Categoría eliminada');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar. Asegúrate de que no tenga subcategorías.');
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className="p-1.5 text-red-600 hover:text-red-900 bg-red-50 rounded transition-colors flex items-center justify-center cursor-pointer" title="Eliminar">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Categoría</h3>
              <p className="text-sm text-gray-500 mb-1">Estás a punto de eliminar:</p>
              <p className="font-medium text-gray-900 mb-4">"{name}"</p>
              <p className="text-xs text-gray-400">Esta acción no se puede deshacer.</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 flex justify-center space-x-3 border-t border-gray-100">
              <button onClick={() => setIsOpen(false)} disabled={isDeleting}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 cursor-pointer disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-red-700 disabled:opacity-50 cursor-pointer">
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
