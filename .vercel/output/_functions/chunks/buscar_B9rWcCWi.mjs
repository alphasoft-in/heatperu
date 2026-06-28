import { c as createComponent } from './astro-component_HpNPC3Xv.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_DSH4zfPn.mjs';
import { $ as $$Layout, H as Header } from './Header_VKb7xfYy.mjs';
import { $ as $$PageHeader } from './PageHeader_tNQjUo9C.mjs';
import { d as db, p as products, s as subcategories, c as categories } from './index_DB2r2R9w.mjs';
import { eq, or, ilike } from 'drizzle-orm';

const $$Buscar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Buscar;
  const query = Astro2.url.searchParams.get("q") || "";
  const searchTerm = query.trim();
  const rawProductResults = searchTerm ? await db.select({ product: products }).from(products).leftJoin(subcategories, eq(products.subcategoryId, subcategories.id)).leftJoin(categories, eq(subcategories.categoryId, categories.id)).where(
    or(
      ilike(products.name, `%${searchTerm}%`),
      ilike(products.brand, `%${searchTerm}%`),
      ilike(products.sku, `%${searchTerm}%`),
      ilike(subcategories.name, `%${searchTerm}%`),
      ilike(categories.name, `%${searchTerm}%`)
    )
  ) : [];
  const productResults = rawProductResults.map((r) => r.product);
  const categoryResults = searchTerm ? await db.select().from(categories).where(ilike(categories.name, `%${searchTerm}%`)) : [];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": `Resultados para: "${searchTerm}"`, "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "BUSCAR" }
  ], "bgImage": "/banner_nosotros.jpg" })} ${maybeRenderHead()}<main class="max-w-[1400px] mx-auto py-16 px-4 md:px-8 min-h-[50vh]">  ${categoryResults.length > 0 && renderTemplate`<div class="mb-16"> <div class="mb-8 flex flex-col items-center md:items-start text-center md:text-left"> <h2 class="text-xl font-medium text-[#0d1624]"> ${categoryResults.length} ${categoryResults.length === 1 ? "Categoría encontrada" : "Categorías encontradas"} </h2> <div class="w-16 h-[3px] bg-[#f04f23] mt-4"></div> </div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> ${categoryResults.map((category) => renderTemplate`<a${addAttribute(`/categorias/${category.slug}`, "href")} class="group flex flex-col h-full border border-gray-200 bg-white hover:border-[#f04f23] transition-colors duration-300"> <div class="p-6 flex flex-col h-full"> <h3 class="text-sm font-bold text-gray-900 text-center uppercase tracking-wider mb-4 pb-4 border-b border-gray-100 group-hover:text-[#f04f23] transition-colors"> ${category.name} </h3> <div class="w-full flex-1 flex items-center justify-center mb-6 min-h-[140px] max-h-[160px]"> <img${addAttribute(category.imageUrl, "src")}${addAttribute(category.name, "alt")} class="max-w-full max-h-[140px] object-contain group-hover:opacity-90 transition-opacity" onerror="this.style.display='none'"> </div> <div class="w-full bg-[#1e1a17] text-white text-center font-bold py-2 text-xs tracking-wide group-hover:bg-[#f04f23] transition-colors duration-300 mt-auto">
VER CATEGORÍA
</div> </div> </a>`)} </div> </div>`}  <div class="mb-10 flex flex-col items-center md:items-start text-center md:text-left"> <h2 class="text-xl font-medium text-[#0d1624]"> ${productResults.length} ${productResults.length === 1 ? "Producto encontrado" : "Productos encontrados"} </h2> <div class="w-16 h-[3px] bg-[#f04f23] mt-4"></div> </div> ${productResults.length > 0 ? renderTemplate`<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"> ${productResults.map((product) => renderTemplate`<div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"> <div class="relative w-full h-64 p-4 bg-white flex items-center justify-center"> <img${addAttribute(product.imageUrl, "src")}${addAttribute(product.name, "alt")} class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/400x400/eeeeee/999999?text=Sin+Imagen'"> ${!product.isAvailable && renderTemplate`<span class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
Agotado
</span>`} </div> <div class="p-6 flex flex-col flex-grow"> <span class="text-xs font-bold text-[#f04f23] uppercase tracking-wider mb-2"> ${product.brand} </span> <h3 class="text-lg font-bold text-[#0d1624] mb-2 leading-tight"> ${product.name} </h3> <p class="text-sm text-gray-500 mb-6 font-mono">
SKU: ${product.sku} </p> <div class="mt-auto"> <a${addAttribute(`/productos/${product.slug}`, "href")} class="block w-full text-center bg-gray-50 text-[#0d1624] font-bold py-3 rounded-md hover:bg-[#f04f23] hover:text-white transition-colors border border-gray-200 hover:border-[#f04f23]">
Ver Detalles
</a> </div> </div> </div>`)} </div>` : categoryResults.length === 0 && renderTemplate`<div class="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed"> <svg class="w-20 h-20 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <h3 class="text-2xl font-bold text-[#0d1624] mb-2">No encontramos coincidencias</h3> <p class="text-gray-600 max-w-md mx-auto mb-8">
Lo sentimos, no hemos podido encontrar ningún producto, marca o SKU que coincida con "${searchTerm}". Intenta usar otros términos más generales.
</p> <a href="/productos" class="bg-[#f04f23] text-white px-8 py-3 rounded-md font-bold hover:bg-[#d8401a] transition-colors">
Ver Todo el Catálogo
</a> </div>`} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/buscar.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/buscar.astro";
const $$url = "/buscar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Buscar,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
