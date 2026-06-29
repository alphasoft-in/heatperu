import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, p as Fragment, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$AdminLayout } from './AdminLayout_DmcyynTj.mjs';
import { d as db, b as complaints } from './index_B4lP7dzv.mjs';
import { count, desc } from 'drizzle-orm';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const pageParam = Astro2.url.searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const totalItemsResult = await db.select({ value: count() }).from(complaints);
  const totalItems = totalItemsResult[0].value;
  const totalPages = Math.ceil(totalItems / limit);
  const dbComplaints = await db.select().from(complaints).orderBy(desc(complaints.createdAt)).limit(limit).offset(offset);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Gestión de Reclamaciones | Heat Factory" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-5"> <h2 class="text-xl font-bold text-[#0d1624]">Libro de Reclamaciones</h2> <p class="mt-1 text-[13px] text-gray-500">Visualiza y gestiona las quejas y reclamos registrados por los clientes.</p> </div> <div class="bg-white shadow rounded-lg border border-gray-100 overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between"> <h3 class="text-base font-semibold text-slate-800">Registros Actuales (${totalItems})</h3> </div> <div class="p-0"> ${dbComplaints.length === 0 ? renderTemplate`<p class="text-gray-500 text-sm p-6 text-center">No hay reclamos ni quejas registrados.</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200"> <thead class="bg-gray-50"> <tr> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ID</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fecha</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cliente</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tipo</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Estado</th> <th scope="col" class="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Acciones</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-100"> ${dbComplaints.map((complaint) => renderTemplate`<tr class="hover:bg-gray-50/50 transition-colors"> <td class="px-5 py-3 whitespace-nowrap"> <span class="text-xs font-mono font-bold text-gray-500">#${complaint.id}</span> </td> <td class="px-5 py-3 whitespace-nowrap"> <span class="text-[12px] text-gray-600"> ${new Date(complaint.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })} </span> </td> <td class="px-5 py-3"> <div class="text-[12px] font-semibold text-slate-700">${complaint.consumerName}</div> <div class="text-[11px] text-gray-400">${complaint.documentType}: ${complaint.documentNumber}</div> </td> <td class="px-5 py-3 whitespace-nowrap"> <span${addAttribute(`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${complaint.complaintType === "Reclamo" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`, "class")}> ${complaint.complaintType} </span> </td> <td class="px-5 py-3 whitespace-nowrap"> <span${addAttribute(`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${complaint.status === "Pendiente" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, "class")}> ${complaint.status} </span> </td> <td class="px-5 py-3 whitespace-nowrap text-right text-sm font-medium"> <div class="flex justify-end gap-3"> ${renderComponent($$result3, "ComplaintActions", null, { "complaint": complaint, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/ComplaintActions.tsx", "client:component-export": "default" })} </div> </td> </tr>`)} </tbody> </table> </div> ${totalPages > 1 && renderTemplate`<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between"> <div class="text-sm text-gray-500">
Mostrando <span class="font-medium">${offset + 1}</span> a <span class="font-medium">${Math.min(offset + limit, totalItems)}</span> de <span class="font-medium">${totalItems}</span> registros
</div> <div class="flex space-x-2"> <a${addAttribute(page > 1 ? `?page=${page - 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page > 1 ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Anterior
</a> <div class="flex space-x-1 items-center px-2"> ${Array.from({ length: totalPages }).map((_, i) => renderTemplate`<a${addAttribute(`?page=${i + 1}`, "href")}${addAttribute(`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === i + 1 ? "bg-[#f04f23] text-white" : "text-gray-600 hover:bg-gray-100"}`, "class")}> ${i + 1} </a>`)} </div> <a${addAttribute(page < totalPages ? `?page=${page + 1}` : "#", "href")}${addAttribute(`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${page < totalPages ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`, "class")}>
Siguiente
</a> </div> </div>`}` })}`} </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/reclamaciones/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/reclamaciones/index.astro";
const $$url = "/admin/reclamaciones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
