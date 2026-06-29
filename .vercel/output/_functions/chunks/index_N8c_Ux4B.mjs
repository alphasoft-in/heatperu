import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, p as Fragment$1, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$AdminLayout } from './AdminLayout_DmcyynTj.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { d as db, h as tutorials } from './index_B4lP7dzv.mjs';
import { count, desc, asc } from 'drizzle-orm';

function DeleteTutorialButton({ id, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tutorials/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Tutorial eliminado correctamente");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const err = await response.json();
        toast.error(err.error || "Ocurrió un error al eliminar");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50 cursor-pointer",
        title: "Eliminar Tutorial",
        children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md transition-opacity", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-fade-in-up text-left", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "Eliminar Tutorial" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
          "¿Estás seguro que deseas eliminar el tutorial ",
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-700", children: [
            '"',
            title,
            '"'
          ] }),
          "? Esta acción no se puede deshacer."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            disabled: loading,
            className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDelete,
            disabled: loading,
            className: "px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center cursor-pointer",
            children: loading ? "Eliminando..." : "Sí, eliminar"
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
  const limit = 5;
  const offset = (page - 1) * limit;
  const totalItemsResult = await db.select({ value: count() }).from(tutorials);
  const totalItems = totalItemsResult[0].value;
  const totalPages = Math.ceil(totalItems / limit);
  const maxOrderResult = await db.select().from(tutorials).orderBy(desc(tutorials.order)).limit(1);
  const nextOrder = maxOrderResult.length > 0 ? maxOrderResult[0].order + 1 : 1;
  const dbTutorials = await db.select().from(tutorials).orderBy(asc(tutorials.order), desc(tutorials.id)).limit(limit).offset(offset);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Gestión de Tutoriales | Heat Factory" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-5"> <h2 class="text-xl font-bold text-[#0d1624]">Gestión de Tutoriales</h2> <p class="mt-1 text-[13px] text-gray-500">Agrega, edita o elimina los tutoriales de video.</p> </div> <div class="bg-white shadow rounded-lg border border-gray-100 overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between"> <h3 class="text-base font-semibold text-slate-800">Tutoriales Actuales (${totalItems})</h3> ${renderComponent($$result2, "CreateTutorialModal", null, { "nextOrder": nextOrder, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/CreateTutorialModal.tsx", "client:component-export": "default" })} </div> <div class="p-0"> ${dbTutorials.length === 0 ? renderTemplate`<p class="text-gray-500 text-sm p-6 text-center">No hay tutoriales registrados aún. ¡Añade el primero!</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate` <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200"> <thead class="bg-gray-50"> <tr> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">Miniatura</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Título</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">YouTube URL</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orden</th> <th scope="col" class="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Acciones</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-100"> ${dbTutorials.map((tutorial) => renderTemplate`<tr class="hover:bg-gray-50/50 transition-colors"> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="flex-shrink-0 h-10 w-14 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm"> ${tutorial.imageUrl ? renderTemplate`<img${addAttribute(tutorial.imageUrl, "src")}${addAttribute(tutorial.title, "alt")} class="h-full w-full object-cover">` : renderTemplate`<svg class="h-5 w-5 text-[#f04f23]" fill="currentColor" viewBox="0 0 24 24"> <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path> </svg>`} </div> </td> <td class="px-5 py-2.5"> <div class="text-[12px] font-semibold text-slate-700 tracking-wider line-clamp-1"${addAttribute(tutorial.title, "title")}> ${tutorial.title} </div> </td> <td class="px-5 py-2.5"> <div class="text-[12px] text-gray-500 line-clamp-1"${addAttribute(tutorial.videoUrl, "title")}> <a${addAttribute(tutorial.videoUrl, "href")} target="_blank" class="text-blue-500 hover:underline">${tutorial.videoUrl}</a> </div> </td> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="text-xs text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded inline-block font-mono border border-gray-200/60"> ${tutorial.order} </div> </td> <td class="px-5 py-2.5 whitespace-nowrap text-right text-sm font-medium"> <div class="flex justify-end gap-3"> ${renderComponent($$result3, "EditTutorialModal", null, { "tutorial": tutorial, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/EditTutorialModal.tsx", "client:component-export": "default" })} ${renderComponent($$result3, "DeleteTutorialButton", DeleteTutorialButton, { "id": tutorial.id, "title": tutorial.title, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/DeleteTutorialButton.tsx", "client:component-export": "default" })} </div> </td> </tr>`)} </tbody> </table> </div> ${totalPages > 1 && renderTemplate`<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between"> <div class="text-sm text-gray-500">
Mostrando <span class="font-medium">${offset + 1}</span> a <span class="font-medium">${Math.min(offset + limit, totalItems)}</span> de <span class="font-medium">${totalItems}</span> tutoriales
</div> <div class="flex space-x-2"> <a${addAttribute(page > 1 ? `?page=${page - 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page > 1 ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Anterior
</a> <div class="flex space-x-1 items-center px-2"> ${Array.from({ length: totalPages }).map((_, i) => renderTemplate`<a${addAttribute(`?page=${i + 1}`, "href")}${addAttribute(`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === i + 1 ? "bg-[#f04f23] text-white" : "text-gray-600 hover:bg-gray-100"}`, "class")}> ${i + 1} </a>`)} </div> <a${addAttribute(page < totalPages ? `?page=${page + 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page < totalPages ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Siguiente
</a> </div> </div>`}` })}`} </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/tutoriales/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/tutoriales/index.astro";
const $$url = "/admin/tutoriales";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
