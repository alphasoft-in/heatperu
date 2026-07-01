import React, { useState } from 'react';
import toast from 'react-hot-toast';
import MDEditor from '@uiw/react-md-editor';

type InitialData = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  executionDate: string | null;
  gallery: string;
  order: number;
};

export default function ProjectForm({ initialData, nextOrder }: { initialData?: InitialData, nextOrder?: number }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [executionDate, setExecutionDate] = useState(initialData?.executionDate || '');
  const [order, setOrder] = useState<number>(initialData?.order ?? nextOrder ?? 1);
  type GalleryItem = {
    id: string;
    isExisting: boolean;
    url: string;
    file?: File;
  };

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const initialUrls: string[] = initialData?.gallery && initialData.gallery !== '[]' 
      ? JSON.parse(initialData.gallery) 
      : (initialData?.imageUrl && initialData.imageUrl !== '/placeholder.avif' ? [initialData.imageUrl] : []);
    
    return initialUrls.map(url => ({
      id: Math.random().toString(36).substring(7),
      isExisting: true,
      url: url,
    }));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems: GalleryItem[] = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        isExisting: false,
        url: URL.createObjectURL(file),
        file
      }));
      setGallery(prev => [...prev, ...newItems]);
    }
  };

  const removeItem = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    setGallery(prev => {
      const newGallery = [...prev];
      if (direction === 'left' && index > 0) {
        [newGallery[index - 1], newGallery[index]] = [newGallery[index], newGallery[index - 1]];
      } else if (direction === 'right' && index < newGallery.length - 1) {
        [newGallery[index + 1], newGallery[index]] = [newGallery[index], newGallery[index + 1]];
      }
      return newGallery;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('order', order.toString());
      if (executionDate) {
        formData.append('executionDate', executionDate);
      }
      const orderArray = gallery.map(item => item.isExisting ? item.url : 'NEW');
      formData.append('galleryOrder', JSON.stringify(orderArray));
      
      gallery.forEach(item => {
        if (!item.isExisting && item.file) {
          formData.append('gallery', item.file);
        }
      });

      const url = initialData ? `/api/admin/proyectos/${initialData.id}` : '/api/admin/proyectos';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el proyecto');
      }

      toast.success(initialData ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente');
      setTimeout(() => {
        window.location.href = '/admin/proyectos';
      }, 1000);

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Título del Proyecto</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          rows={1}
          className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] resize-none overflow-hidden"
          placeholder="Ej. Instalación de Caldera Industrial. (Usa 'Enter' para salto de línea)"
        />
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Descripción</label>
        <div data-color-mode="light" className="prose-sm">
          <MDEditor
            value={description}
            onChange={(val) => setDescription(val || '')}
            height={300}
            preview="edit"
            className="w-full text-[13px] border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#f04f23]"
            textareaProps={{
              placeholder: 'Descripción detallada del proyecto...'
            }}
          />
        </div>
      </div>

      <div className="mb-3 flex gap-4">
        <div className="flex-1">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Fecha de Ejecución (Opcional)</label>
          <input
            type="date"
            value={executionDate}
            onChange={(e) => setExecutionDate(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
          />
        </div>
        <div className="w-1/3">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Orden (Ej. 1, 2)</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value))}
            required
            className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">
          {initialData ? 'Sustituir Imágenes (Galería)' : 'Galería de Imágenes'}
        </label>
        <div className="mt-1 flex justify-center px-4 pt-3 pb-4 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors">
          <div className="space-y-1 text-center w-full">
            {gallery.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                {gallery.map((item, i) => (
                  <div key={item.id} className="relative group mt-2 mr-2">
                    <img src={item.url} alt="Vista previa" className="h-16 w-16 object-cover rounded border" />
                    
                    {/* Botón Eliminar */}
                    <button type="button" onClick={() => removeItem(i)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md" title="Eliminar">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    
                    {/* Botones Mover */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => moveItem(i, 'left')} disabled={i === 0} className={`bg-gray-800/80 text-white rounded-sm p-0.5 ${i === 0 ? 'invisible' : 'hover:bg-gray-700 cursor-pointer'}`} title="Mover a la izquierda">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button type="button" onClick={() => moveItem(i, 'right')} disabled={i === gallery.length - 1} className={`bg-gray-800/80 text-white rounded-sm p-0.5 ${i === gallery.length - 1 ? 'invisible' : 'hover:bg-gray-700 cursor-pointer'}`} title="Mover a la derecha">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div className="flex text-[13px] text-gray-600 justify-center mt-1">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#f04f23] hover:text-[#d0421c] focus-within:outline-none">
                <span>{gallery.length > 0 ? 'Añadir más fotos' : 'Sube tus imágenes'}</span>
                <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500">Puedes seleccionar múltiples archivos</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 focus:outline-none cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Guardando...' : (initialData ? 'Actualizar Proyecto' : 'Guardar Proyecto')}
      </button>

      {initialData && (
        <div className="mt-3">
          <a
            href="/admin/proyectos"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-all"
          >
            Cancelar edición
          </a>
        </div>
      )}
    </form>
  );
}
