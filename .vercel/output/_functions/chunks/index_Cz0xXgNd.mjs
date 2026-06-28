import { c as createComponent } from './astro-component_HpNPC3Xv.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_DSH4zfPn.mjs';
import { $ as $$Layout, H as Header } from './Header_VKb7xfYy.mjs';
import { $ as $$PageHeader } from './PageHeader_tNQjUo9C.mjs';
import { d as db, p as products } from './index_DB2r2R9w.mjs';
import { desc } from 'drizzle-orm';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allProducts = await db.select().from(products).orderBy(desc(products.id));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "NUESTROS PRODUCTOS", "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "PRODUCTOS" }
  ], "bgImage": "/productos/bc-productos.webp" })} ${maybeRenderHead()}<main class="max-w-[1400px] mx-auto py-16 px-4 md:px-8 min-h-[50vh]"> <div class="mb-10 flex flex-col items-center md:items-start text-center md:text-left"> <h2 class="text-xl font-medium text-[#0d1624]">
Todos los productos (${allProducts.length})
</h2> <div class="w-16 h-[3px] bg-[#f04f23] mt-4"></div> </div> ${allProducts.length > 0 ? renderTemplate`<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"> ${allProducts.map((product) => renderTemplate`<div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"> <div class="relative w-full h-64 p-4 bg-white flex items-center justify-center"> <img${addAttribute(product.imageUrl, "src")}${addAttribute(product.name, "alt")} class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/400x400/eeeeee/999999?text=Sin+Imagen'"> ${!product.isAvailable && renderTemplate`<span class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
Agotado
</span>`} </div> <div class="p-6 flex flex-col flex-grow"> <span class="text-xs font-bold text-[#f04f23] uppercase tracking-wider mb-2"> ${product.brand} </span> <h3 class="text-lg font-bold text-[#0d1624] mb-2 leading-tight"> ${product.name} </h3> <p class="text-sm text-gray-500 mb-6 font-mono">
SKU: ${product.sku} </p> <div class="mt-auto"> <a${addAttribute(`/productos/${product.slug}`, "href")} class="block w-full text-center bg-gray-50 text-[#0d1624] font-bold py-3 rounded-md hover:bg-[#f04f23] hover:text-white transition-colors border border-gray-200 hover:border-[#f04f23]">
Ver Detalles
</a> </div> </div> </div>`)} </div>` : renderTemplate`<div class="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed"> <svg class="w-20 h-20 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path> </svg> <h3 class="text-2xl font-bold text-[#0d1624] mb-2">Catálogo vacío</h3> <p class="text-gray-600 max-w-md mx-auto mb-8">
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
