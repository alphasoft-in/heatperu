import React, { useState } from 'react';
import toast from 'react-hot-toast';
import MDEditor from '@uiw/react-md-editor';

type InitialData = {
  id: number;
  name: string;
  subcategoryId: number;
  sku: string;
  brand: string;
  isAvailable: boolean;
  imageUrl: string;
  galleryUrls?: string | null;
  pdfUrl?: string | null;
  model?: string | null;
  description?: string | null;
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
  const [model, setModel] = useState(initialData?.model || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData?.isAvailable ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.imageUrl && initialData.imageUrl !== '/placeholder.avif' ? initialData.imageUrl : null
  );
  
  // Gallery states
  const [existingGallery, setExistingGallery] = useState<string[]>(() => {
    if (!initialData?.galleryUrls) return [];
    try {
      const parsed = JSON.parse(initialData.galleryUrls);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing galleryUrls:', e);
      return [];
    }
  });
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  
  // PDF states
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(initialData?.pdfUrl || null);
  
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewGalleryFiles(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewGalleryPreviews(prev => [...prev, ...previews]);
    }
  };
  
  const removeExistingGalleryImage = (index: number) => {
    const updated = [...existingGallery];
    updated.splice(index, 1);
    setExistingGallery(updated);
  };
  
  const removeNewGalleryImage = (index: number) => {
    const updatedFiles = [...newGalleryFiles];
    updatedFiles.splice(index, 1);
    setNewGalleryFiles(updatedFiles);
    
    const updatedPreviews = [...newGalleryPreviews];
    updatedPreviews.splice(index, 1);
    setNewGalleryPreviews(updatedPreviews);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdf(file);
      setPdfPreview(file.name);
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
      if (model) formData.append('model', model);
      if (description) formData.append('description', description);
      formData.append('isAvailable', String(isAvailable));
      if (image) {
        formData.append('image', image);
      }
      if (pdf) {
        formData.append('pdf', pdf);
      }
      formData.append('existingGallery', JSON.stringify(existingGallery));
      newGalleryFiles.forEach((file) => {
        formData.append('gallery', file);
      });

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
    <form onSubmit={handleSubmit} className="p-2 sm:p-4">
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
              className="w-full pl-3 pr-10 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] bg-white"
            >
              <option value="" disabled>Selecciona...</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
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

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Modelo (Opcional)</label>
          <input 
            type="text" 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
            placeholder="Ej. V2-500"
          />
        </div>
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
              className="w-full pl-3 pr-10 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] bg-white"
            >
              <option value="true">Disponible</option>
              <option value="false">Agotado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6" data-color-mode="light">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Descripción Detallada (Opcional)</label>
        <MDEditor
          value={description}
          onChange={(val) => setDescription(val || '')}
          preview="edit"
          height={300}
          className="border border-gray-300 rounded-md shadow-sm overflow-hidden"
        />
        <p className="text-xs text-gray-500 mt-1">Puedes usar formato Markdown (negritas, listas, etc.)</p>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">
          {initialData ? 'Cambiar Imagen Principal (Opcional)' : 'Imagen Principal'}
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

      <div className="mb-6">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Galería de Imágenes (Opcional)</label>
        <div className="mt-1 p-4 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex flex-wrap gap-3 mb-3">
            {existingGallery.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-16 h-16 border rounded bg-white overflow-hidden shadow-sm">
                <img src={url} alt="Galería existente" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingGalleryImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
            {newGalleryPreviews.map((preview, index) => (
              <div key={`new-${index}`} className="relative w-16 h-16 border rounded bg-white overflow-hidden shadow-sm">
                <img src={preview} alt="Nueva galería" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewGalleryImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
            
            <label htmlFor="gallery-upload" className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#f04f23]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              <input id="gallery-upload" name="gallery-upload" type="file" multiple className="sr-only" accept="image/*" onChange={handleGalleryChange} />
            </label>
          </div>
          <p className="text-xs text-gray-500">Puedes seleccionar varias imágenes a la vez.</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Documento Técnico (PDF Opcional)</label>
        <div className="mt-1 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#f04f23] bg-white">
          <span className="text-[13px] text-gray-500 truncate flex-1 pr-3">
            {pdfPreview ? (pdfPreview.startsWith('http') ? 'Ficha técnica existente adjunta' : pdfPreview) : 'No se ha seleccionado archivo'}
          </span>
          <label htmlFor="pdf-upload" className="cursor-pointer text-[13px] font-medium text-[#f04f23] hover:text-[#d0421c]">
            Seleccionar archivo
            <input id="pdf-upload" name="pdf-upload" type="file" className="sr-only" accept="application/pdf" onChange={handlePdfChange} />
          </label>
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
