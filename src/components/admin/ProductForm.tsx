import React, { useState } from 'react';
import toast from 'react-hot-toast';

type InitialData = {
  id: number;
  name: string;
  subcategoryId: number;
  sku: string;
  brand: string;
  isAvailable: boolean;
  imageUrl: string;
};

type Subcategory = {
  id: number;
  name: string;
};

export default function ProductForm({ 
  initialData, 
  subcategories 
}: { 
  initialData?: InitialData;
  subcategories: Subcategory[];
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [subcategoryId, setSubcategoryId] = useState<string>(initialData?.subcategoryId?.toString() || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData?.isAvailable ?? true);
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
    
    if (!subcategoryId) {
      setError('Debes seleccionar una subcategoría padre');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('subcategoryId', subcategoryId);
      formData.append('sku', sku);
      formData.append('brand', brand);
      formData.append('isAvailable', String(isAvailable));
      if (image) {
        formData.append('image', image);
      }

      const url = initialData ? `/api/admin/productos/${initialData.id}` : '/api/admin/productos';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el producto');
      }

      toast.success(initialData ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      setTimeout(() => {
        window.location.href = '/admin/productos';
      }, 1000);
      
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-4 max-h-[80vh] overflow-y-auto">
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Nombre del Producto</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
          placeholder="Ej. Válvula de bola V2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Subcategoría Padre</label>
          <div className="relative">
            <select 
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              required
              className="w-full appearance-none pl-3 pr-10 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] bg-white"
            >
              <option value="" disabled>Selecciona...</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Marca</label>
          <input 
            type="text" 
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
            placeholder="Ej. Honeywell"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">SKU</label>
          <input 
            type="text" 
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
            placeholder="Ej. HW-12345"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Disponibilidad</label>
          <div className="relative">
            <select 
              value={isAvailable ? 'true' : 'false'}
              onChange={(e) => setIsAvailable(e.target.value === 'true')}
              className="w-full appearance-none pl-3 pr-10 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] bg-white"
            >
              <option value="true">Disponible</option>
              <option value="false">Agotado</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">
          {initialData ? 'Cambiar Imagen (Opcional)' : 'Imagen'}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors">
          <div className="space-y-1 text-center w-full">
            {preview ? (
              <img src={preview} alt="Vista previa" className="mx-auto h-32 object-contain" />
            ) : (
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div className="flex text-[13px] text-gray-600 justify-center mt-2">
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
        {loading ? 'Guardando...' : (initialData ? 'Actualizar Producto' : 'Guardar Producto')}
      </button>
      
      {initialData && (
        <div className="mt-3">
          <a 
            href="/admin/productos" 
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-all"
          >
            Cancelar edición
          </a>
        </div>
      )}
    </form>
  );
}
