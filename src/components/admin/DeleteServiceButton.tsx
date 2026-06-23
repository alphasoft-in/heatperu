import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function DeleteServiceButton({ id, title }: { id: number, title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/servicios/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el servicio');
      }

      toast.success('Servicio eliminado correctamente');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
        title="Eliminar Servicio"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden text-left">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">¿Eliminar Servicio?</h3>
              <p className="text-sm text-center text-gray-500">
                ¿Estás seguro de que deseas eliminar el servicio <span className="font-bold">"{title}"</span>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex space-x-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-red-700 transition-colors flex justify-center"
                disabled={loading}
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
