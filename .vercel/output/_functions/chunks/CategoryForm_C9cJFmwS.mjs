import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import toast from 'react-hot-toast';

function CategoryForm({ initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    initialData?.imageUrl && initialData.imageUrl !== "/placeholder.png" ? initialData.imageUrl : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) {
        formData.append("image", image);
      }
      const url = initialData ? `/api/admin/categorias/${initialData.id}` : "/api/admin/categorias";
      const method = initialData ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la categoría");
      }
      toast.success(initialData ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
      setTimeout(() => {
        window.location.href = "/admin/categorias";
      }, 1e3);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-2 sm:p-4", children: [
    error && /* @__PURE__ */ jsx("div", { className: "mb-4 bg-red-50 text-red-600 p-3 rounded text-sm", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-[13px] font-medium text-gray-700 mb-1", children: "Nombre de la Categoría" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          required: true,
          className: "w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]",
          placeholder: "Ej. Válvulas Mariposa"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-[13px] font-medium text-gray-700 mb-1", children: initialData ? "Cambiar Imagen (Opcional)" : "Imagen" }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center w-full", children: [
        preview ? /* @__PURE__ */ jsx("img", { src: preview, alt: "Vista previa", className: "mx-auto h-32 object-contain" }) : /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", children: /* @__PURE__ */ jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
        /* @__PURE__ */ jsx("div", { className: "flex text-[13px] text-gray-600 justify-center mt-2", children: /* @__PURE__ */ jsxs("label", { htmlFor: "file-upload", className: "relative cursor-pointer bg-white rounded-md font-medium text-[#f04f23] hover:text-[#d0421c] focus-within:outline-none", children: [
          /* @__PURE__ */ jsx("span", { children: "Sube una imagen" }),
          /* @__PURE__ */ jsx("input", { id: "file-upload", name: "file-upload", type: "file", className: "sr-only", accept: "image/*", onChange: handleImageChange })
        ] }) }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 mt-1", children: "Recomendado: PNG fondo transparente" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: loading,
        className: `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 focus:outline-none cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`,
        children: loading ? "Guardando..." : initialData ? "Actualizar Categoría" : "Guardar Categoría"
      }
    ),
    initialData && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
      "a",
      {
        href: "/admin/categorias",
        className: "w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-all",
        children: "Cancelar edición"
      }
    ) })
  ] });
}

export { CategoryForm as C };
