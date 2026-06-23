import React, { useState } from 'react';
import toast from 'react-hot-toast';
import MDEditor from '@uiw/react-md-editor';

type InitialData = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

export default function ServiceForm({ initialData, nextOrder }: { initialData?: InitialData, nextOrder?: number }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [order, setOrder] = useState<number>(initialData?.order ?? nextOrder ?? 1);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.imageUrl && initialData.imageUrl !== '/placeholder.png' ? initialData.imageUrl : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      if (image) {
        formData.append('image', image);
      }

      const url = initialData ? `/api/admin/servicios/${initialData.id}` : '/api/admin/servicios';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el servicio');
      }

      toast.success(initialData ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente');
      setTimeout(() => {
        window.location.href = '/admin/servicios';
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
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Título del Servicio</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          rows={1}
          className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] resize-none overflow-hidden"
          placeholder="Ej. Suministro de Calderas. (Usa 'Enter' para salto de línea)"
        />
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Descripción</label>
        <div data-color-mode="light" className="prose-sm">
          <MDEditor
            value={description}
            onChange={(val) => setDescription(val || '')}
            height={200}
            preview="edit"
            className="w-full text-[13px] border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#f04f23]"
            textareaProps={{
              placeholder: 'Descripción detallada. Usa \'Enter\' para separar párrafos.'
            }}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Orden de aparición (Ej. 1, 2, 3)</label>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value))}
          required
          className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">
          {initialData ? 'Cambiar Imagen (Opcional)' : 'Imagen'}
        </label>
        <div className="mt-1 flex justify-center px-4 pt-3 pb-4 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors">
          <div className="space-y-1 text-center w-full">
            {preview ? (
              <img src={preview} alt="Vista previa" className="mx-auto h-20 object-contain" />
            ) : (
              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div className="flex text-[13px] text-gray-600 justify-center mt-1">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#f04f23] hover:text-[#d0421c] focus-within:outline-none">
                <span>Sube una imagen</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 focus:outline-none cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Guardando...' : (initialData ? 'Actualizar Servicio' : 'Guardar Servicio')}
      </button>

      {initialData && (
        <div className="mt-3">
          <a
            href="/admin/servicios"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-all"
          >
            Cancelar edición
          </a>
        </div>
      )}
    </form>
  );
}
