import React, { useState } from 'react';
import toast from 'react-hot-toast';
import MDEditor from '@uiw/react-md-editor';

export default function TutorialForm({ tutorial, nextOrder = 1, categories = [] }: { tutorial?: any, nextOrder?: number, categories?: any[] }) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(tutorial?.description || '');

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(tutorial?.imageUrl || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.set('description', description);
    
    if (image) {
      formData.set('image', image);
    }

    try {
      const url = tutorial ? `/api/tutorials/${tutorial.id}` : '/api/tutorials';
      const method = tutorial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        toast.success(`Tutorial ${tutorial ? 'actualizado' : 'creado'} correctamente`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Ocurrió un error');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error inesperado');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Título del Tutorial *</label>
        <input 
          type="text" 
          name="title" 
          defaultValue={tutorial?.title || ''} 
          required 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] text-[13px]"
          placeholder="Ej: ¿Cómo encender la caldera?"
        />
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Cliente *</label>
        <select 
          name="categoryId" 
          defaultValue={tutorial?.categoryId || ''} 
          required 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] text-[13px] bg-white"
        >
          <option value="" disabled>Selecciona un cliente...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Descripción Corta *</label>
        <div data-color-mode="light" className="prose-sm">
          <MDEditor
            value={description}
            onChange={(val) => setDescription(val || '')}
            height={300}
            preview="edit"
            className="w-full text-[13px] border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#f04f23]"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">URL de YouTube *</label>
        <input 
          type="url" 
          name="videoUrl" 
          defaultValue={tutorial?.videoUrl || ''} 
          required 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] text-[13px]"
          placeholder="Ej: https://www.youtube.com/watch?v=..."
        />
      </div>

      <div className="mb-3 flex gap-4">
        <div className="flex-1">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Fecha de Ejecución (Opcional)</label>
          <input 
            type="date" 
            name="executionDate" 
            defaultValue={tutorial?.executionDate || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] text-[13px]"
          />
        </div>
        <div className="w-1/3">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Orden (Ej. 1, 2)</label>
          <input 
            type="number" 
            name="order" 
            defaultValue={tutorial?.order || nextOrder} 
            required 
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] text-[13px]"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">
          {tutorial ? 'Sustituir Miniatura (Opcional)' : 'Miniatura (Opcional)'}
        </label>
        <div className="mt-1 flex justify-center px-4 pt-3 pb-4 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors">
          <div className="space-y-1 text-center w-full">
            {preview ? (
              <div className="flex justify-center mb-3">
                <img src={preview} alt="Vista previa" className="h-16 w-16 object-cover rounded border" />
              </div>
            ) : (
              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div className="flex text-[13px] text-gray-600 justify-center mt-1">
              <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#f04f23] hover:text-[#d0421c] focus-within:outline-none">
                <span>{preview ? 'Cambiar imagen' : 'Sube tu imagen'}</span>
                <input id="image-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 focus:outline-none cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Guardando...' : (tutorial ? 'Actualizar Tutorial' : 'Guardar Tutorial')}
      </button>

      {tutorial && (
        <div className="mt-3">
          <a
            href="/admin/tutoriales"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-all"
          >
            Cancelar edición
          </a>
        </div>
      )}
    </form>
  );
}
