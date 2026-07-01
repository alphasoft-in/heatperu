import React, { useState } from 'react';
import toast from 'react-hot-toast';

type InitialData = { id: number; name: string; imageUrl: string };

export default function TutorialCategoryForm({ initialData }: { initialData?: InitialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.imageUrl && initialData.imageUrl !== '/placeholder.avif' ? initialData.imageUrl : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (image) formData.append('image', image);

      const url = initialData
        ? `/api/admin/tutorial-categorias/${initialData.id}`
        : '/api/admin/tutorial-categorias';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al guardar');

      toast.success(initialData ? 'Cliente actualizado' : 'Cliente creado');
      setTimeout(() => { window.location.href = '/admin/tutoriales/categorias'; }, 1000);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-4">
      {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Nombre del Cliente</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#f04f23] focus:border-transparent transition-all"
          placeholder="Ej. Heineken Perú"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">
          {initialData ? 'Cambiar Imagen (Opcional)' : 'Imagen'}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-1 text-center w-full">
            {preview
              ? <img src={preview} alt="Vista previa" className="mx-auto h-32 object-contain" />
              : <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            }
            <div className="flex text-[13px] text-gray-600 justify-center mt-2">
              <label htmlFor="tc-file-upload" className="cursor-pointer font-medium text-[#f04f23] hover:text-[#d0421c]">
                <span>Sube una imagen</span>
                <input id="tc-file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Recomendado: PNG fondo transparente</p>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className={`w-full flex justify-center py-2 px-4 rounded-md text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
        {loading ? 'Guardando...' : (initialData ? 'Actualizar Cliente' : 'Guardar Cliente')}
      </button>
    </form>
  );
}
