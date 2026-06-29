import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute, u as unescapeHTML } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, a as projects } from './index_B4lP7dzv.mjs';
import { asc } from 'drizzle-orm';
import { marked } from 'marked';

const $$Proyectos = createComponent(async ($$result, $$props, $$slots) => {
  marked.use({ breaks: true });
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
  function createSlug(title) {
    return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
  const dbProjects = await db.select().from(projects).orderBy(asc(projects.order), asc(projects.id));
  const formattedProjects = dbProjects.map((project) => {
    let imageUrl = project.imageUrl;
    try {
      const gallery = JSON.parse(project.gallery);
      if (Array.isArray(gallery) && gallery.length > 0) {
        imageUrl = gallery[0];
      }
    } catch (e) {
    }
    let plainTextDesc = project.description.replace(/[#*`_\[\]()]/g, "").replace(/\n/g, " ").trim();
    if (plainTextDesc.length > 150) {
      plainTextDesc = plainTextDesc.substring(0, 150) + "...";
    }
    return {
      ...project,
      displayImage: imageUrl,
      plainTextDesc
    };
  });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "NUESTROS PROYECTOS", "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "PROYECTOS" }
  ], "bgImage": "/bc-proyectos.jpeg", "bgPosition": "object-[center_95%]" })} ${maybeRenderHead()}<main class="max-w-[1200px] mx-auto pt-8 md:pt-12 pb-16 md:pb-24 px-4 md:px-8"> ${formattedProjects.length === 0 ? renderTemplate`<div class="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200"> <p>Aún no hay proyectos registrados en la base de datos.</p> </div>` : renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"> ${formattedProjects.map((project) => renderTemplate`<a${addAttribute(`/proyectos/${project.slug || createSlug(project.title)}`, "href")} class="bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500"> <div class="w-full h-56 md:h-[260px] relative bg-gray-50 overflow-hidden"> <img${addAttribute(project.displayImage, "src")}${addAttribute(project.title, "alt")} class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" onerror="this.src='https://placehold.co/600x400/eeeeee/999999?text=Proyecto'">  <div class="absolute inset-0 pointer-events-none"> <div class="absolute left-0 top-0 w-full h-full bg-white/50 opacity-0 group-hover:opacity-100 group-hover:w-0 group-hover:left-1/2 transition-all duration-500 ease-in-out"></div> <div class="absolute left-0 top-0 w-full h-full bg-white/50 opacity-0 group-hover:opacity-100 group-hover:h-0 group-hover:top-1/2 transition-all duration-500 ease-in-out"></div> </div> </div> <div class="p-6 md:p-8 flex-1 flex flex-col relative bg-white"> <h3 class="text-[17px] md:text-[19px] font-bold text-slate-800 leading-snug tracking-tight mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-[#f04f23]">${unescapeHTML(project.title.replace(/\n/g, " "))}</h3> ${project.executionDate && renderTemplate`<div class="flex items-center text-[12px] font-semibold tracking-wide text-slate-500 mb-5 uppercase"> <svg class="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> ${formatDate(project.executionDate)} </div>`} <p class="text-[14px] text-slate-600 leading-relaxed line-clamp-3 mb-6 flex-1"> ${project.plainTextDesc} </p> <div class="pt-4 border-t border-gray-100 mt-auto"> <div class="flex items-center text-[#f04f23] font-medium text-sm tracking-wide">
VER PROYECTO
<span class="transform transition-transform duration-300 group-hover:translate-x-2 ml-2">→</span> </div> </div> </div> </a>`)} </div>`} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/proyectos.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/proyectos.astro";
const $$url = "/proyectos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Proyectos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
