import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, t as tutorialCategories, g as tutorialSubcategories, h as tutorials } from './index_B4lP7dzv.mjs';
import { count, eq } from 'drizzle-orm';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const dbCategories = await db.select().from(tutorialCategories).orderBy(tutorialCategories.order, tutorialCategories.id);
  const tutorialCountsRaw = await db.select({
    categoryId: tutorialSubcategories.categoryId,
    total: count(tutorials.id)
  }).from(tutorials).leftJoin(tutorialSubcategories, eq(tutorials.subcategoryId, tutorialSubcategories.id)).groupBy(tutorialSubcategories.categoryId);
  const countsMap = Object.fromEntries(tutorialCountsRaw.map((r) => [r.categoryId, r.total]));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "TUTORIALES DE AYUDA", "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "TUTORIALES" }
  ], "bgImage": "/bc-servicios.jpeg", "bgPosition": "object-center" })} ${maybeRenderHead()}<main class="max-w-[1200px] mx-auto pt-8 md:pt-12 pb-16 md:pb-24 px-4 md:px-8"> ${dbCategories.length === 0 ? renderTemplate`<div class="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200"> <p>Aún no hay categorías de tutoriales. Estamos trabajando en nuevo contenido.</p> </div>` : renderTemplate`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> ${dbCategories.map((cat) => {
    const tutCount = countsMap[cat.id] ?? 0;
    return renderTemplate`<a${addAttribute(`/tutoriales/categoria/${cat.slug}`, "href")} class="group bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] transition-all duration-500"> <div class="relative w-full h-52 bg-white overflow-hidden flex items-center justify-center border-b border-gray-100 p-8"> <img${addAttribute(cat.imageUrl, "src")}${addAttribute(cat.name, "alt")} class="w-full h-full object-contain transition-all duration-700 group-hover:scale-105" onerror="this.src='https://placehold.co/600x400/eeeeee/999999?text=Tutorial'"> </div> <div class="p-6 flex-1 flex flex-col"> <h3 class="text-base md:text-[17px] font-semibold text-slate-800 leading-snug mb-2 transition-colors duration-300 group-hover:text-[#f04f23]"> ${cat.name} </h3> <p class="text-[13px] text-slate-500 mb-4 flex-1"> ${tutCount > 0 ? `${tutCount} tutorial${tutCount !== 1 ? "es" : ""} disponible${tutCount !== 1 ? "s" : ""}` : "Próximamente"} </p> <div class="pt-4 border-t border-gray-100 mt-auto"> <span class="flex items-center text-[#f04f23] font-medium text-sm tracking-wide group/btn">
VER TUTORIALES
<span class="transform transition-transform duration-300 group-hover:translate-x-2 ml-2">→</span> </span> </div> </div> </a>`;
  })} </div>`} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/tutoriales/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/tutoriales/index.astro";
const $$url = "/tutoriales";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
