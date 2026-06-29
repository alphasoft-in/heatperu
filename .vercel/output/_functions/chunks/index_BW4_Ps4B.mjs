import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$AdminLayout } from './AdminLayout_DmcyynTj.mjs';
import { d as db, f as subscribers } from './index_B4lP7dzv.mjs';
import { desc } from 'drizzle-orm';
import { Mail, Download } from 'lucide-react';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allSubscribers = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Suscriptores del Boletín" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"> <div> <h1 class="text-2xl font-bold text-gray-900 mb-1">
Suscriptores del Boletín
</h1> <p class="text-gray-500 text-sm">
Gestiona la lista de correos suscritos desde el pie de página.
</p> </div> <div class="flex items-center gap-3"> <div class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"> ${renderComponent($$result2, "Mail", Mail, { "className": "w-4 h-4" })} ${allSubscribers.length} Suscriptores
</div> <a href="/api/admin/suscriptores/exportar" class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"> ${renderComponent($$result2, "Download", Download, { "className": "w-4 h-4" })}
Exportar CSV
</a> </div> </div> <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"> <div class="overflow-x-auto"> <table class="w-full text-left text-sm text-slate-600"> <thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200"> <tr> <th class="px-6 py-4">Email</th> <th class="px-6 py-4">Fecha de Suscripción</th> <th class="px-6 py-4">Estado</th> </tr> </thead> <tbody class="divide-y divide-slate-100"> ${allSubscribers.length === 0 ? renderTemplate`<tr> <td colspan="3" class="px-6 py-12 text-center text-slate-500"> ${renderComponent($$result2, "Mail", Mail, { "className": "w-12 h-12 mx-auto text-slate-300 mb-3" })} <p class="text-base font-medium text-slate-900">
No hay suscriptores aún
</p> <p class="text-sm">
Los correos ingresados en el pie de página aparecerán aquí.
</p> </td> </tr>` : allSubscribers.map((sub) => renderTemplate`<tr class="hover:bg-slate-50 transition-colors"> <td class="px-6 py-4 font-medium text-slate-900"> ${sub.email} </td> <td class="px-6 py-4 whitespace-nowrap text-slate-500"> ${new Date(sub.createdAt).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })} </td> <td class="px-6 py-4 whitespace-nowrap"> <span${addAttribute(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, "class")}> ${sub.status} </span> </td> </tr>`)} </tbody> </table> </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/suscriptores/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/suscriptores/index.astro";
const $$url = "/admin/suscriptores";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
