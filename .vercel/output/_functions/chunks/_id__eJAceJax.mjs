import { c as createComponent } from './astro-component_HpNPC3Xv.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, u as unescapeHTML, h as addAttribute } from './entrypoint_DSH4zfPn.mjs';
import { $ as $$Layout, H as Header } from './Header_VKb7xfYy.mjs';
import { $ as $$PageHeader } from './PageHeader_tNQjUo9C.mjs';
import { d as db, h as tutorials } from './index_DB2r2R9w.mjs';
import { eq } from 'drizzle-orm';
import { marked } from 'marked';

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/tutoriales");
  }
  const tutorialId = parseInt(id);
  let tutorial;
  if (!isNaN(tutorialId) && String(tutorialId) === id) {
    tutorial = await db.query.tutorials.findFirst({
      where: eq(tutorials.id, tutorialId)
    });
  } else {
    tutorial = await db.query.tutorials.findFirst({
      where: eq(tutorials.slug, id)
    });
  }
  if (!tutorial) {
    return Astro2.redirect("/tutoriales");
  }
  await db.update(tutorials).set({ views: tutorial.views + 1 }).where(eq(tutorials.id, tutorial.id));
  tutorial.views += 1;
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const videoId = getYouTubeId(tutorial.videoUrl);
  tutorial.imageUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "/placeholder.png");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": tutorial.title.toUpperCase(), "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "TUTORIALES", url: "/tutoriales" }
  ], "bgImage": "/bc-servicios.jpeg", "bgPosition": "object-center" })} ${maybeRenderHead()}<main class="max-w-[1000px] mx-auto -mt-24 relative z-20 pb-12 px-4 md:px-8"> <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mx-auto"> <div class="p-8 md:p-16 relative"> <div class="absolute top-8 right-8 md:top-10 md:right-16 bg-slate-50 border border-slate-100 text-slate-600 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 font-semibold text-[13px] tracking-wide z-20"> <svg class="w-4 h-4 text-[#f04f23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> <span>${tutorial.views} vistas</span> </div> <h2 class="text-3xl md:text-4xl font-extrabold text-[#0d1624] mb-6 leading-tight">
Resumen del Tutorial
</h2> ${tutorial.executionDate && renderTemplate`<div class="flex items-center text-[14px] font-medium text-slate-500 mb-2 border-b border-slate-100 pb-4"> <svg class="w-4 h-4 mr-2 text-[#f04f23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
Fecha de Ejecución: <span class="ml-1 text-slate-700 font-semibold">${formatDate(tutorial.executionDate)}</span> </div>`} <div class="text-slate-600 text-[14px] leading-relaxed md:leading-loose font-normal markdown-body prose max-w-none"> <div>${unescapeHTML(marked.parse(tutorial.description))}</div> </div> </div>  <div class="px-8 pb-8 md:px-16 md:pb-8"> ${videoId ? renderTemplate`<div class="relative w-full pb-[56.25%] h-0 bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-200"> <iframe${addAttribute(`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`, "src")} class="absolute top-0 left-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> </div>` : renderTemplate`<div class="w-full h-64 md:h-96 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-500 border border-slate-200"> <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <p>No se pudo cargar el video de YouTube.</p> <p class="text-sm mt-2">URL: ${tutorial.videoUrl}</p> </div>`} </div>  <div class="bg-slate-50 p-8 md:p-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8"> <div> <h3 class="text-lg font-bold text-slate-800 mb-2">¿Necesitas ayuda adicional?</h3> <p class="text-slate-600 text-sm">Nuestro equipo de soporte técnico está disponible para asistirte con la instalación y mantenimiento de tus equipos.</p> </div> <a${addAttribute(`https://wa.me/51967083176?text=${encodeURIComponent(`Hola, tengo una consulta sobre el tutorial: ${tutorial.title}`)}`, "href")} target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-[#f04f23] hover:bg-[#d8401a] transition-all shadow-md hover:shadow-lg whitespace-nowrap">
Contactar Soporte
</a> </div> </div> <div class="mt-16 flex justify-center"> <a href="/tutoriales" class="inline-flex items-center px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg group"> <svg class="w-5 h-5 mr-3 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
Volver a Tutoriales
</a> </div> </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/tutoriales/[id].astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/tutoriales/[id].astro";
const $$url = "/tutoriales/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
