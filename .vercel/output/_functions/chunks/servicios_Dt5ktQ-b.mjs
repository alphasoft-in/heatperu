import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, p as Fragment, h as addAttribute, u as unescapeHTML } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, e as services } from './index_B4lP7dzv.mjs';
import { asc } from 'drizzle-orm';

const $$Servicios = createComponent(async ($$result, $$props, $$slots) => {
  const dbServices = await db.select().from(services).orderBy(asc(services.order), asc(services.id));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "NUESTROS SERVICIOS", "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "SERVICIOS" }
  ], "bgImage": "/bc-servicios.jpeg" })} ${maybeRenderHead()}<main class="max-w-[1200px] mx-auto py-16 md:py-24 px-4 md:px-8"> ${dbServices.map((service, index) => {
    const isEven = index % 2 === 0;
    return renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div${addAttribute(`grid grid-cols-1 ${isEven ? "lg:grid-cols-[45%_1fr]" : "lg:grid-cols-[1fr_45%]"} gap-10 lg:gap-14 items-stretch`, "class")}>  <div${addAttribute(`w-full rounded-2xl overflow-hidden shadow-md relative group min-h-[300px] lg:min-h-[350px] ${isEven ? "" : "order-1 lg:order-2"}`, "class")}> <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div> <img${addAttribute(service.imageUrl, "src")}${addAttribute(service.title, "alt")} class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.src='https://placehold.co/800x600/eeeeee/999999?text=Sube+tu+imagen'"> </div>  <div${addAttribute(`flex flex-col justify-center pt-1 ${isEven ? "" : "order-2 lg:order-1"}`, "class")}> <h2 class="text-[22px] md:text-[26px] lg:text-[28px] font-bold text-[#0d1624] tracking-tight uppercase leading-[1.3] mb-4">${unescapeHTML(service.title.replace(/\n/g, '<br class="hidden lg:block"/>'))}</h2> <div class="w-14 h-[3px] bg-[#f04f23] mb-5"></div> <div class="space-y-4 text-gray-600 text-[14px] leading-relaxed text-justify md:text-left"> ${service.description.split("\n").filter((p) => p.trim() !== "").map((paragraph) => renderTemplate`<p>${paragraph}</p>`)} </div> </div> </div> ${index < dbServices.length - 1 && renderTemplate`<div class="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 md:my-16"></div>`}` })}`;
  })} ${dbServices.length === 0 && renderTemplate`<div class="text-center py-20 text-gray-500"> <p>Aún no hay servicios registrados en la base de datos.</p> </div>`} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/servicios.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/servicios.astro";
const $$url = "/servicios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Servicios,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
