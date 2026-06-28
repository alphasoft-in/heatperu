import { c as createComponent } from './astro-component_HpNPC3Xv.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, p as Fragment$1, h as addAttribute } from './entrypoint_DSH4zfPn.mjs';
import { $ as $$AdminLayout } from './AdminLayout_4TuxC3_o.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { d as db, s as subcategories, c as categories } from './index_DB2r2R9w.mjs';
import { count, desc, eq } from 'drizzle-orm';

function SubcategoryForm({
  initialData,
  categories
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString() || "");
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
    if (!categoryId) {
      setError("Debes seleccionar una categoría padre");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("categoryId", categoryId);
      if (image) {
        formData.append("image", image);
      }
      const url = initialData ? `/api/admin/subcategorias/${initialData.id}` : "/api/admin/subcategorias";
      const method = initialData ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la subcategoría");
      }
      toast.success(initialData ? "Subcategoría actualizada correctamente" : "Subcategoría creada correctamente");
      setTimeout(() => {
        window.location.href = "/admin/subcategorias";
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
      /* @__PURE__ */ jsx("label", { className: "block text-[13px] font-medium text-gray-700 mb-1", children: "Nombre de la Subcategoría" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          required: true,
          className: "w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23]",
          placeholder: "Ej. Quemadores de Gas"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-[13px] font-medium text-gray-700 mb-1", children: "Categoría Padre" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: categoryId,
            onChange: (e) => setCategoryId(e.target.value),
            required: true,
            className: "w-full appearance-none pl-3 pr-10 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f04f23] bg-white",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Selecciona una categoría" }),
              categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-[13px] font-medium text-gray-700 mb-1", children: initialData ? "Cambiar Imagen (Opcional)" : "Imagen" }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center w-full", children: [
        preview ? /* @__PURE__ */ jsx("img", { src: preview, alt: "Vista previa", className: "mx-auto h-32 object-contain" }) : /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", children: /* @__PURE__ */ jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
        /* @__PURE__ */ jsx("div", { className: "flex text-[13px] text-gray-600 justify-center mt-2", children: /* @__PURE__ */ jsxs("label", { htmlFor: "file-upload", className: "relative cursor-pointer bg-white rounded-md font-medium text-[#f04f23] hover:text-[#d0421c] focus-within:outline-none", children: [
          /* @__PURE__ */ jsx("span", { children: "Sube una imagen" }),
          /* @__PURE__ */ jsx("input", { id: "file-upload", name: "file-upload", type: "file", className: "sr-only", accept: "image/*", onChange: handleImageChange })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: loading,
        className: `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-[13px] font-medium text-white bg-[#0d1624] hover:bg-gray-800 focus:outline-none cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`,
        children: loading ? "Guardando..." : initialData ? "Actualizar Subcategoría" : "Guardar Subcategoría"
      }
    ),
    initialData && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
      "a",
      {
        href: "/admin/subcategorias",
        className: "w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-all",
        children: "Cancelar edición"
      }
    ) })
  ] });
}

function CreateSubcategoryModal({ categories }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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
          "Añadir Nueva Subcategoría"
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-opacity", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[15px] font-bold text-gray-900", children: "Añadir Subcategoría" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            className: "text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-2", children: /* @__PURE__ */ jsx(SubcategoryForm, { categories }) })
    ] }) })
  ] });
}

function EditSubcategoryModal({
  subcategory,
  categories
}) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded transition-colors cursor-pointer",
        title: "Editar Subcategoría",
        children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-opacity whitespace-normal text-left", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[15px] font-bold text-gray-900", children: "Editar Subcategoría" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            className: "text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-2", children: /* @__PURE__ */ jsx(SubcategoryForm, { initialData: subcategory, categories }) })
    ] }) })
  ] });
}

function DeleteSubcategoryButton({ id, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/subcategorias/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar la subcategoría");
      }
      toast.success("Subcategoría eliminada correctamente");
      setTimeout(() => {
        window.location.reload();
      }, 1e3);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "p-1.5 text-red-600 hover:text-red-900 bg-red-50 rounded transition-colors flex items-center justify-center cursor-pointer",
        title: "Eliminar Subcategoría",
        children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm whitespace-normal text-left", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up", children: /* @__PURE__ */ jsxs("div", { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "¿Eliminar subcategoría?" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 mb-6 space-y-2", children: [
        /* @__PURE__ */ jsx("p", { children: "Estás a punto de eliminar la subcategoría:" }),
        /* @__PURE__ */ jsxs("p", { className: "font-medium text-gray-900 break-words text-base", children: [
          '"',
          name,
          '"'
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs", children: "Esta acción no se puede deshacer." })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "mb-4 bg-red-50 text-red-600 p-2 rounded text-xs", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            disabled: loading,
            className: "flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDelete,
            disabled: loading,
            className: `flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`,
            children: loading ? "Eliminando..." : "Sí, Eliminar"
          }
        )
      ] })
    ] }) }) })
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const pageParam = Astro2.url.searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = 5;
  const offset = (page - 1) * limit;
  const totalItemsResult = await db.select({ value: count() }).from(subcategories);
  const totalItems = totalItemsResult[0].value;
  const totalPages = Math.ceil(totalItems / limit);
  const allCategories = await db.select().from(categories).orderBy(desc(categories.id));
  const dbSubcategories = await db.select({
    subcategory: subcategories,
    categoryName: categories.name
  }).from(subcategories).leftJoin(categories, eq(subcategories.categoryId, categories.id)).orderBy(desc(subcategories.id)).limit(limit).offset(offset);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Gestión de Subcategorías | Heat Factory" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-5"> <h2 class="text-xl font-bold text-[#0d1624]">Gestión de Subcategorías</h2> <p class="mt-1 text-[13px] text-gray-500">Agrega, edita o elimina las subcategorías de tu catálogo.</p> </div> <div class="bg-white shadow rounded-lg border border-gray-100 overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between"> <h3 class="text-base font-semibold text-slate-800">Subcategorías Actuales (${totalItems})</h3> ${renderComponent($$result2, "CreateSubcategoryModal", CreateSubcategoryModal, { "categories": allCategories, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/CreateSubcategoryModal.tsx", "client:component-export": "default" })} </div> <div class="p-0"> ${dbSubcategories.length === 0 ? renderTemplate`<p class="text-gray-500 text-sm p-6 text-center">No hay subcategorías registradas aún. ¡Añade la primera!</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate` <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200"> <thead class="bg-gray-50"> <tr> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">Imagen</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Subcategoría</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Categoría Padre</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">URL</th> <th scope="col" class="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Acciones</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-100"> ${dbSubcategories.map(({ subcategory, categoryName }) => renderTemplate`<tr class="hover:bg-gray-50/50 transition-colors"> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="flex-shrink-0 h-10 w-10 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center p-1 shadow-sm"> ${subcategory.imageUrl && subcategory.imageUrl !== "/placeholder.png" ? renderTemplate`<img${addAttribute(subcategory.imageUrl, "src")}${addAttribute(subcategory.name, "alt")} class="h-full w-full object-contain">` : renderTemplate`<svg class="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>`} </div> </td> <td class="px-5 py-2.5"> <div class="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">${subcategory.name}</div> </td> <td class="px-5 py-2.5"> <div class="text-[11px] text-gray-500 uppercase tracking-wider">${categoryName}</div> </td> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="text-xs text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded inline-block font-mono border border-gray-200/60">
/${subcategory.slug} </div> </td> <td class="px-5 py-2.5 whitespace-nowrap text-right text-sm font-medium"> <div class="flex justify-end gap-3"> ${renderComponent($$result3, "EditSubcategoryModal", EditSubcategoryModal, { "subcategory": subcategory, "categories": allCategories, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/EditSubcategoryModal.tsx", "client:component-export": "default" })} ${renderComponent($$result3, "DeleteSubcategoryButton", DeleteSubcategoryButton, { "id": subcategory.id, "name": subcategory.name, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/DeleteSubcategoryButton.tsx", "client:component-export": "default" })} </div> </td> </tr>`)} </tbody> </table> </div> ${totalPages > 1 && renderTemplate`<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between"> <div class="text-sm text-gray-500">
Mostrando <span class="font-medium">${offset + 1}</span> a <span class="font-medium">${Math.min(offset + limit, totalItems)}</span> de <span class="font-medium">${totalItems}</span> subcategorías
</div> <div class="flex space-x-2"> <a${addAttribute(page > 1 ? `?page=${page - 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page > 1 ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Anterior
</a> <div class="flex space-x-1 items-center px-2"> ${Array.from({ length: totalPages }).map((_, i) => renderTemplate`<a${addAttribute(`?page=${i + 1}`, "href")}${addAttribute(`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === i + 1 ? "bg-[#f04f23] text-white" : "text-gray-600 hover:bg-gray-100"}`, "class")}> ${i + 1} </a>`)} </div> <a${addAttribute(page < totalPages ? `?page=${page + 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page < totalPages ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Siguiente
</a> </div> </div>`}` })}`} </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/subcategorias/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/subcategorias/index.astro";
const $$url = "/admin/subcategorias";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
