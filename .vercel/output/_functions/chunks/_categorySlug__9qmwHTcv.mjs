import { c as createComponent } from './astro-component_HpNPC3Xv.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_DSH4zfPn.mjs';
import { $ as $$Layout, H as Header } from './Header_VKb7xfYy.mjs';
import { $ as $$PageHeader } from './PageHeader_tNQjUo9C.mjs';
import { d as db, c as categories, s as subcategories } from './index_DB2r2R9w.mjs';
import { eq } from 'drizzle-orm';

const $$categorySlug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$categorySlug;
  const { categorySlug } = Astro2.params;
  if (!categorySlug) {
    return Astro2.redirect("/");
  }
  const catResult = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
  if (catResult.length === 0) {
    return Astro2.redirect("/404");
  }
  const category = catResult[0];
  await db.update(categories).set({ visits: category.visits + 1 }).where(eq(categories.id, category.id));
  const dbSubcategorias = await db.select().from(subcategories).where(eq(subcategories.categoryId, category.id));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": category.name.toUpperCase(), "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: category.name.toUpperCase() }
  ], "bgImage": "/productos/bc-productos.webp" })} ${maybeRenderHead()}<main class="max-w-[1000px] mx-auto py-16 px-4 md:px-8"> ${dbSubcategorias.length > 0 ? renderTemplate`<div class="flex flex-wrap justify-center gap-6 lg:gap-8"> ${dbSubcategorias.map((subcat) => renderTemplate`<a${addAttribute(`/categorias/${category.slug}/${subcat.slug}`, "href")} class="w-full sm:w-[300px] lg:w-[280px] flex-none group flex flex-col h-full border border-gray-200 bg-white hover:border-[#f04f23] transition-colors duration-300"> <div class="p-5 flex flex-col h-full"> <h3 class="text-xs md:text-[13px] font-bold text-gray-900 text-center uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 group-hover:text-[#f04f23] transition-colors min-h-[40px] flex items-center justify-center"> ${subcat.name} </h3> <div class="w-full flex-1 flex items-center justify-center mb-5 min-h-[160px] max-h-[180px]"> <img${addAttribute(subcat.imageUrl, "src")}${addAttribute(subcat.name, "alt")} class="max-w-full max-h-[160px] object-contain group-hover:opacity-90 transition-opacity" onerror="this.style.display='none'"> </div> <div class="w-full bg-[#1e1a17] text-white text-center font-bold py-2.5 text-xs tracking-wide group-hover:bg-[#f04f23] transition-colors duration-300 mt-auto">
EXPLORAR LÍNEA
</div> </div> </a>`)} </div>` : renderTemplate`<div class="text-center py-20 text-gray-500"> <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg> <p class="text-lg font-medium">Aún no hay subcategorías agregadas en ${category.name}.</p> </div>`} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/categorias/[categorySlug].astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/categorias/[categorySlug].astro";
const $$url = "/categorias/[categorySlug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$categorySlug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
