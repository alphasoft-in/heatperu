import React, { useState } from 'react';
import toast from 'react-hot-toast';

type Category = { id: number; name: string };
type InitialData = { id: number; name: string; categoryId: number };

export default function TutorialSubcategoryForm({
  categories,
  initialData,
}: {
  categories: Category[];
  initialData?: InitialData;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState<number>(
    initialData?.categoryId || (categories[0]?.id ?? 0)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = initialData
        ? `/api/admin/tutorial-subcategorias/${initialData.id}`
        : '/api/admin/tutorial-subcategorias';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, categoryId }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al guardar');

      toast.success(initialData ? 'Subcategoría actualizada' : 'Subcategoría creada');
      setTimeout(() => { window.location.href = '/admin/tutoriales/subcategorias'; }, 1000);
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
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Categoría Principal</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          required
          className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-medium text-gray-700 mb-1">Nombre de la Subcategoría</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]"
          placeholder="Ej. Economizadores"
        />
      </div>

      <button type="submit" disabled={loading}
        className={`w-full flex justify-center py-2 px-4 rounded-md text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
        {loading ? 'Guardando...' : (initialData ? 'Actualizar Subcategoría' : 'Guardar Subcategoría')}
      </button>
    </form>
  );
}
