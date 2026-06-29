import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$AdminLayout } from './AdminLayout_DmcyynTj.mjs';
import { C as CategoryForm } from './CategoryForm_C9cJFmwS.mjs';
import { d as db, c as categories } from './index_B4lP7dzv.mjs';
import { eq } from 'drizzle-orm';

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    return Astro2.redirect("/admin/categorias");
  }
  const result = await db.select().from(categories).where(eq(categories.id, categoryId));
  if (result.length === 0) {
    return Astro2.redirect("/admin/categorias");
  }
  const category = result[0];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Editar Categoría: ${category.name}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-8"> <a href="/admin/categorias" class="text-sm font-medium text-gray-500 hover:text-[#f04f23] mb-4 inline-flex items-center"> <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
Volver a Categorías
</a> <h2 class="text-2xl font-bold text-gray-900">Editar Categoría</h2> <p class="mt-1 text-sm text-gray-500">Modifica el nombre o cambia la imagen de "${category.name}".</p> </div> <div class="max-w-2xl"> ${renderComponent($$result2, "CategoryForm", CategoryForm, { "initialData": category, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/CategoryForm.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/categorias/editar/[id].astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/categorias/editar/[id].astro";
const $$url = "/admin/categorias/editar/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
