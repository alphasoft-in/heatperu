import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, p as Fragment$1, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$AdminLayout } from './AdminLayout_DmcyynTj.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { d as db, t as tutorialCategories } from './index_B4lP7dzv.mjs';
import { count, desc } from 'drizzle-orm';

function TutorialCategoryForm({ initialData }) {
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
      reader.onloadend = () => setPreview(reader.result);
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
      if (image) formData.append("image", image);
      const url = initialData ? `/api/admin/tutorial-categorias/${initialData.id}` : "/api/admin/tutorial-categorias";
      const method = initialData ? "PUT" : "POST";
      const response = await fetch(url, { method, body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar");
      toast.success(initialData ? "Categoría actualizada" : "Categoría creada");
      setTimeout(() => {
        window.location.href = "/admin/tutoriales/categorias";
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
          placeholder: "Ej. Calderas"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-[13px] font-medium text-gray-700 mb-1", children: initialData ? "Cambiar Imagen (Opcional)" : "Imagen" }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center w-full", children: [
        preview ? /* @__PURE__ */ jsx("img", { src: preview, alt: "Vista previa", className: "mx-auto h-32 object-contain" }) : /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", children: /* @__PURE__ */ jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
        /* @__PURE__ */ jsx("div", { className: "flex text-[13px] text-gray-600 justify-center mt-2", children: /* @__PURE__ */ jsxs("label", { htmlFor: "tc-file-upload", className: "cursor-pointer font-medium text-[#f04f23] hover:text-[#d0421c]", children: [
          /* @__PURE__ */ jsx("span", { children: "Sube una imagen" }),
          /* @__PURE__ */ jsx("input", { id: "tc-file-upload", type: "file", className: "sr-only", accept: "image/*", onChange: handleImageChange })
        ] }) }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500 mt-1", children: "Recomendado: PNG fondo transparente" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: loading,
        className: `w-full flex justify-center py-2 px-4 rounded-md text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`,
        children: loading ? "Guardando..." : initialData ? "Actualizar Categoría" : "Guardar Categoría"
      }
    )
  ] });
}

function CreateTutorialCategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "bg-[#f04f23] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#d0421c] transition-colors flex items-center shadow-sm cursor-pointer",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
          "Añadir Categoría"
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[15px] font-bold text-gray-900", children: "Añadir Categoría de Tutorial" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            className: "text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-2", children: /* @__PURE__ */ jsx(TutorialCategoryForm, {}) })
    ] }) })
  ] });
}

function DeleteTutorialCategoryButton({ id, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/tutorial-categorias/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar la categoría");
      }
      toast.success("Categoría eliminada");
      setTimeout(() => window.location.reload(), 1e3);
    } catch (error) {
      toast.error(error.message || "Error al eliminar. Asegúrate de que no tenga subcategorías.");
      setIsDeleting(false);
      setIsOpen(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "p-1.5 text-red-600 hover:text-red-900 bg-red-50 rounded transition-colors flex items-center justify-center cursor-pointer",
        title: "Eliminar",
        children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-red-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Eliminar Categoría" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Estás a punto de eliminar:" }),
        /* @__PURE__ */ jsxs("p", { className: "font-medium text-gray-900 mb-4", children: [
          '"',
          name,
          '"'
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Esta acción no se puede deshacer." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-3 flex justify-center space-x-3 border-t border-gray-100", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            disabled: isDeleting,
            className: "bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 cursor-pointer disabled:opacity-50",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDelete,
            disabled: isDeleting,
            className: "bg-red-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-red-700 disabled:opacity-50 cursor-pointer",
            children: isDeleting ? "Eliminando..." : "Sí, eliminar"
          }
        )
      ] })
    ] }) })
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const pageParam = Astro2.url.searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const totalItemsResult = await db.select({ value: count() }).from(tutorialCategories);
  const totalItems = totalItemsResult[0].value;
  const totalPages = Math.ceil(totalItems / limit);
  const dbCategories = await db.select().from(tutorialCategories).orderBy(desc(tutorialCategories.id)).limit(limit).offset(offset);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Categorías de Tutoriales | Heat Factory" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-5"> <div class="flex items-center gap-2 text-sm text-gray-500 mb-2"> <a href="/admin/tutoriales" class="hover:text-[#f04f23]">Tutoriales</a> <span>›</span> <span class="text-gray-800 font-medium">Categorías</span> </div> <h2 class="text-xl font-bold text-[#0d1624]">Categorías de Tutoriales</h2> <p class="mt-1 text-[13px] text-gray-500">Gestiona las categorías que agrupan los tutoriales.</p> </div> <div class="bg-white shadow rounded-lg border border-gray-100 overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between"> <h3 class="text-base font-semibold text-slate-800">Categorías (${totalItems})</h3> ${renderComponent($$result2, "CreateTutorialCategoryModal", CreateTutorialCategoryModal, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/CreateTutorialCategoryModal.tsx", "client:component-export": "default" })} </div> <div class="p-0"> ${dbCategories.length === 0 ? renderTemplate`<p class="text-gray-500 text-sm p-6 text-center">No hay categorías aún. ¡Añade la primera!</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate` <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200"> <thead class="bg-gray-50"> <tr> <th class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">Imagen</th> <th class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Categoría</th> <th class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">URL</th> <th class="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Acciones</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-100"> ${dbCategories.map((cat) => renderTemplate`<tr class="hover:bg-gray-50/50 transition-colors"> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="h-10 w-10 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center p-1 shadow-sm"> ${cat.imageUrl && cat.imageUrl !== "/placeholder.png" ? renderTemplate`<img${addAttribute(cat.imageUrl, "src")}${addAttribute(cat.name, "alt")} class="h-full w-full object-contain">` : renderTemplate`<svg class="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>`} </div> </td> <td class="px-5 py-2.5"> <div class="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">${cat.name}</div> </td> <td class="px-5 py-2.5"> <div class="text-xs text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded inline-block font-mono border border-gray-200/60">
/tutoriales/categoria/${cat.slug} </div> </td> <td class="px-5 py-2.5 whitespace-nowrap text-right text-sm font-medium"> <div class="flex justify-end gap-3"> ${renderComponent($$result3, "DeleteTutorialCategoryButton", DeleteTutorialCategoryButton, { "id": cat.id, "name": cat.name, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/DeleteTutorialCategoryButton.tsx", "client:component-export": "default" })} </div> </td> </tr>`)} </tbody> </table> </div> ${totalPages > 1 && renderTemplate`<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between"> <div class="text-sm text-gray-500">
Mostrando <span class="font-medium">${offset + 1}</span> a <span class="font-medium">${Math.min(offset + limit, totalItems)}</span> de <span class="font-medium">${totalItems}</span> categorías
</div> <div class="flex space-x-2"> <a${addAttribute(page > 1 ? `?page=${page - 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page > 1 ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Anterior
</a> <a${addAttribute(page < totalPages ? `?page=${page + 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page < totalPages ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Siguiente
</a> </div> </div>`}` })}`} </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/tutoriales/categorias/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/tutoriales/categorias/index.astro";
const $$url = "/admin/tutoriales/categorias";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
