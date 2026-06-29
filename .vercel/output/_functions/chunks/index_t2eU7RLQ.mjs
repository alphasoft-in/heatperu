import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, p as Fragment$1, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$AdminLayout } from './AdminLayout_DmcyynTj.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { d as db, e as services } from './index_B4lP7dzv.mjs';
import { count, desc, asc } from 'drizzle-orm';

function DeleteServiceButton({ id, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/servicios/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el servicio");
      }
      toast.success("Servicio eliminado correctamente");
      setTimeout(() => {
        window.location.reload();
      }, 1e3);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
      setIsOpen(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer",
        title: "Eliminar Servicio",
        children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden text-left", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-center text-gray-900 mb-2", children: "¿Eliminar Servicio?" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-center text-gray-500", children: [
          "¿Estás seguro de que deseas eliminar el servicio ",
          /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
            '"',
            title,
            '"'
          ] }),
          "? Esta acción no se puede deshacer."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-gray-50 flex space-x-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            className: "flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors",
            disabled: loading,
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDelete,
            className: "flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-red-700 transition-colors flex justify-center",
            disabled: loading,
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
  const totalItemsResult = await db.select({ value: count() }).from(services);
  const totalItems = totalItemsResult[0].value;
  const totalPages = Math.ceil(totalItems / limit);
  const maxOrderResult = await db.select().from(services).orderBy(desc(services.order)).limit(1);
  const nextOrder = maxOrderResult.length > 0 ? maxOrderResult[0].order + 1 : 1;
  const dbServices = await db.select().from(services).orderBy(asc(services.order), desc(services.id)).limit(limit).offset(offset);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Gestión de Servicios | Heat Factory" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-5"> <h2 class="text-xl font-bold text-[#0d1624]">Gestión de Servicios</h2> <p class="mt-1 text-[13px] text-gray-500">Agrega, edita o elimina los servicios que se muestran en la página pública de Servicios.</p> </div> <div class="bg-white shadow rounded-lg border border-gray-100 overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between"> <h3 class="text-base font-semibold text-slate-800">Servicios Actuales (${totalItems})</h3> ${renderComponent($$result2, "CreateServiceModal", null, { "nextOrder": nextOrder, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/CreateServiceModal.tsx", "client:component-export": "default" })} </div> <div class="p-0"> ${dbServices.length === 0 ? renderTemplate`<p class="text-gray-500 text-sm p-6 text-center">No hay servicios registrados aún. ¡Añade el primero!</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate` <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200"> <thead class="bg-gray-50"> <tr> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">Imagen</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Título</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orden</th> <th scope="col" class="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Acciones</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-100"> ${dbServices.map((service) => renderTemplate`<tr class="hover:bg-gray-50/50 transition-colors"> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="flex-shrink-0 h-10 w-14 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm"> ${service.imageUrl && service.imageUrl !== "/placeholder.png" ? renderTemplate`<img${addAttribute(service.imageUrl, "src")}${addAttribute(service.title, "alt")} class="h-full w-full object-cover">` : renderTemplate`<svg class="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>`} </div> </td> <td class="px-5 py-2.5"> <div class="text-[12px] font-semibold text-slate-700 tracking-wider line-clamp-1"${addAttribute(service.title, "title")}> ${service.title} </div> </td> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="text-xs text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded inline-block font-mono border border-gray-200/60"> ${service.order} </div> </td> <td class="px-5 py-2.5 whitespace-nowrap text-right text-sm font-medium"> <div class="flex justify-end gap-3"> ${renderComponent($$result3, "EditServiceModal", null, { "service": service, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/EditServiceModal.tsx", "client:component-export": "default" })} ${renderComponent($$result3, "DeleteServiceButton", DeleteServiceButton, { "id": service.id, "title": service.title, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/DeleteServiceButton.tsx", "client:component-export": "default" })} </div> </td> </tr>`)} </tbody> </table> </div> ${totalPages > 1 && renderTemplate`<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between"> <div class="text-sm text-gray-500">
Mostrando <span class="font-medium">${offset + 1}</span> a <span class="font-medium">${Math.min(offset + limit, totalItems)}</span> de <span class="font-medium">${totalItems}</span> servicios
</div> <div class="flex space-x-2"> <a${addAttribute(page > 1 ? `?page=${page - 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page > 1 ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Anterior
</a> <div class="flex space-x-1 items-center px-2"> ${Array.from({ length: totalPages }).map((_, i) => renderTemplate`<a${addAttribute(`?page=${i + 1}`, "href")}${addAttribute(`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === i + 1 ? "bg-[#f04f23] text-white" : "text-gray-600 hover:bg-gray-100"}`, "class")}> ${i + 1} </a>`)} </div> <a${addAttribute(page < totalPages ? `?page=${page + 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page < totalPages ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Siguiente
</a> </div> </div>`}` })}`} </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/servicios/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/servicios/index.astro";
const $$url = "/admin/servicios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
