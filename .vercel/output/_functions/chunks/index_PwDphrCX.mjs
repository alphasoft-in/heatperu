import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, p as Fragment, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, p as products } from './index_B4lP7dzv.mjs';
import { count, desc } from 'drizzle-orm';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const ITEMS_PER_PAGE = 20;
  const page = Number(Astro2.url.searchParams.get("page")) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const [{ total }] = await db.select({ total: count() }).from(products);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const allProducts = await db.select().from(products).orderBy(desc(products.id)).limit(ITEMS_PER_PAGE).offset(offset);
  function getPagination(currentPage, totalPages2) {
    if (totalPages2 <= 7) return Array.from({ length: totalPages2 }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages2];
    if (currentPage >= totalPages2 - 3) return [1, "...", totalPages2 - 4, totalPages2 - 3, totalPages2 - 2, totalPages2 - 1, totalPages2];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages2];
  }
  const paginationRange = getPagination(page, totalPages);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "NUESTROS PRODUCTOS", "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "PRODUCTOS" }
  ], "bgImage": "/productos/bc-productos.webp" })} ${maybeRenderHead()}<main class="max-w-[1400px] mx-auto py-16 px-4 md:px-8 min-h-[50vh]"> ${allProducts.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"> ${allProducts.map((product) => renderTemplate`<div class="group relative flex flex-col bg-white rounded-[24px] transition-all duration-500 hover:-translate-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(240,79,35,0.08)] border border-gray-100/50"> <a${addAttribute(`/productos/${product.slug}`, "href")} class="absolute inset-0 z-10"${addAttribute(`Ver detalles de ${product.name}`, "aria-label")}></a>  <div class="relative w-full aspect-[4/3] bg-[#f8fafc] flex items-center justify-center p-8 overflow-hidden rounded-t-[24px]"> <img${addAttribute(product.imageUrl, "src")}${addAttribute(product.name, "alt")} class="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply" onerror="this.src='/placeholder.png'">  <div class="absolute top-5 left-5 z-20 flex items-center"> <span class="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.05)]"> ${product.brand} </span> </div>  ${!product.isAvailable && renderTemplate`<div class="absolute top-5 right-5 z-20"> <span class="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
Agotado
</span> </div>`} </div>  <div class="flex flex-col flex-grow p-6 md:p-7"> <h3 class="text-[15px] md:text-base font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[3rem] group-hover:text-[#f04f23] transition-colors duration-300"> ${product.name} </h3> <div class="mt-6 flex items-end justify-between border-t border-slate-100 pt-5"> <div class="flex flex-col"> <span class="text-[9px] uppercase tracking-widest text-slate-400 mb-1 font-semibold">SKU</span> <span class="text-sm font-medium text-slate-600 font-mono tracking-tight">${product.sku}</span> </div>  <div class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white group-hover:bg-[#f04f23] group-hover:border-[#f04f23] transition-all duration-500 relative overflow-hidden"> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 group-hover:text-white transform -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="5" y1="12" x2="19" y2="12"></line> <polyline points="12 5 19 12 12 19"></polyline> </svg> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 group-hover:text-white transform translate-x-0 opacity-100 group-hover:translate-x-6 group-hover:opacity-0 transition-all duration-500 absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="9 18 15 12 9 6"></polyline> </svg> </div> </div> </div> </div>`)} </div> ${totalPages > 1 && renderTemplate`<div class="flex justify-center items-center mt-16 gap-3 flex-wrap"> ${page > 1 ? renderTemplate`<a${addAttribute(`?page=${page - 1}`, "href")} class="flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-white hover:bg-slate-800 hover:border-slate-800 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300" aria-label="Página anterior"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="15 18 9 12 15 6"></polyline> </svg> </a>` : renderTemplate`<span class="flex items-center justify-center w-11 h-11 rounded-full border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" aria-hidden="true"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="15 18 9 12 15 6"></polyline> </svg> </span>`} <div class="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100/80 rounded-[2rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm"> ${paginationRange.map((p, index) => {
    if (p === "...") {
      return renderTemplate`<span class="w-10 h-10 flex items-center justify-center text-gray-400 font-serif tracking-widest text-lg">...</span>`;
    }
    const isCurrent = p === page;
    return renderTemplate`<a${addAttribute(`?page=${p}`, "href")}${addAttribute(`w-10 h-10 flex items-center justify-center rounded-full text-[15px] font-semibold transition-all duration-300 ${isCurrent ? "bg-gradient-to-tr from-[#f04f23] to-[#ff7e5f] text-white shadow-[0_6px_16px_rgba(240,79,35,0.35)] hover:-translate-y-0.5" : "text-gray-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm hover:-translate-y-0.5"}`, "class")}${addAttribute(isCurrent ? "page" : void 0, "aria-current")}> ${p} </a>`;
  })} </div> ${page < totalPages ? renderTemplate`<a${addAttribute(`?page=${page + 1}`, "href")} class="flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-white hover:bg-slate-800 hover:border-slate-800 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300" aria-label="Página siguiente"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="9 18 15 12 9 6"></polyline> </svg> </a>` : renderTemplate`<span class="flex items-center justify-center w-11 h-11 rounded-full border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" aria-hidden="true"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="9 18 15 12 9 6"></polyline> </svg> </span>`} </div>`}` })}` : renderTemplate`<div class="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed"> <svg class="w-20 h-20 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path> </svg> <h3 class="text-2xl font-bold text-[#0d1624] mb-2">Catálogo vacío</h3> <p class="text-gray-600 max-w-md mx-auto mb-8">
Aún no hay productos registrados en la base de datos.
</p> </div>`} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/productos/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/productos/index.astro";
const $$url = "/productos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
