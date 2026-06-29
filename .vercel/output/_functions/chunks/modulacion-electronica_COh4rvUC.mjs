import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, s as subcategories, p as products } from './index_B4lP7dzv.mjs';
import { eq } from 'drizzle-orm';

const $$ModulacionElectronica = createComponent(async ($$result, $$props, $$slots) => {
  const subcatResult = await db.select().from(subcategories).where(eq(subcategories.slug, "modulacion-electronica")).limit(1);
  let dbProductos = [];
  if (subcatResult.length > 0) {
    dbProductos = await db.select().from(products).where(eq(products.subcategoryId, subcatResult[0].id));
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "MODULACIÓN ELECTRÓNICA", "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "ACTUADORES", url: "/categorias/actuadores" },
    { name: "MODULACIÓN ELECTRÓNICA" }
  ], "bgImage": "/productos/bc-productos.webp" })} ${maybeRenderHead()}<main class="max-w-[1400px] mx-auto py-16 px-4 md:px-8"> <div class="mb-12 text-center md:text-left hidden">  </div> <div class="flex flex-wrap justify-center gap-6 lg:gap-8"> ${dbProductos.map((producto) => renderTemplate`<a${addAttribute(`/productos/${producto.slug}`, "href")} class="w-full sm:w-[300px] lg:w-[280px] flex-none group flex flex-col h-full border border-gray-200 bg-white hover:border-[#f04f23] transition-colors duration-300"> <div class="p-5 flex flex-col h-full"> <h3 class="text-xs md:text-[13px] font-bold text-gray-900 text-center uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 group-hover:text-[#f04f23] transition-colors line-clamp-2 min-h-[38px] flex items-center justify-center"> ${producto.name} </h3> <div class="w-full flex-1 flex items-center justify-center mb-4 min-h-[130px] max-h-[150px]"> <img${addAttribute(producto.imageUrl, "src")}${addAttribute(producto.name, "alt")} class="max-w-full max-h-[130px] object-contain group-hover:opacity-90 transition-opacity" onerror="this.style.display='none'"> </div> <div class="w-full bg-gray-50 border-t border-b border-gray-100 py-2.5 mb-4 text-[11px] text-center mt-auto"> <span class="block text-gray-500 mb-0.5">SKU: <strong class="text-gray-900">${producto.sku}</strong></span> <span class="block text-gray-500">MARCA: <strong class="text-gray-900">${producto.brand}</strong></span> </div> <div class="w-full bg-[#1e1a17] text-white text-center font-bold py-2.5 text-xs tracking-wide group-hover:bg-[#f04f23] transition-colors duration-300">
VER FICHA
</div> </div> </a>`)} </div> </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/categorias/actuadores/modulacion-electronica.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/categorias/actuadores/modulacion-electronica.astro";
const $$url = "/categorias/actuadores/modulacion-electronica";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ModulacionElectronica,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
