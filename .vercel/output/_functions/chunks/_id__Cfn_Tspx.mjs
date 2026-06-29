import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { k as renderTemplate, y as defineScriptVars, o as renderComponent, m as maybeRenderHead, u as unescapeHTML, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, a as projects } from './index_B4lP7dzv.mjs';
import { eq } from 'drizzle-orm';
import { marked } from 'marked';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  marked.use({ breaks: true });
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/proyectos");
  }
  const projectId = parseInt(id);
  let project;
  if (!isNaN(projectId) && String(projectId) === id) {
    project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    });
  } else {
    project = await db.query.projects.findFirst({
      where: eq(projects.slug, id)
    });
  }
  if (!project) {
    return Astro2.redirect("/proyectos");
  }
  let gallery = [];
  try {
    gallery = JSON.parse(project.gallery);
    if (!Array.isArray(gallery)) gallery = [];
  } catch (e) {
  }
  const displayImage = gallery.length > 0 ? gallery[0] : project.imageUrl;
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  if (galleryImages && galleryImages.length > 0) {\n    let currentIndex = 0;\n    const lightbox = document.getElementById('lightbox');\n    const lightboxImg = document.getElementById('lightbox-img');\n    const btnClose = document.getElementById('lightbox-close');\n    const btnPrev = document.getElementById('lightbox-prev');\n    const btnNext = document.getElementById('lightbox-next');\n    const counter = document.getElementById('lightbox-counter');\n    const triggers = document.querySelectorAll('.gallery-img, .gallery-overlay');\n\n    function openLightbox(index) {\n      currentIndex = index;\n      updateLightbox();\n      lightbox.classList.remove('hidden');\n      lightbox.classList.add('flex');\n      // trigger reflow\n      void lightbox.offsetWidth;\n      lightbox.classList.remove('opacity-0');\n      document.body.style.overflow = 'hidden';\n    }\n\n    function closeLightbox() {\n      lightbox.classList.add('opacity-0');\n      setTimeout(() => {\n        lightbox.classList.remove('flex');\n        lightbox.classList.add('hidden');\n        document.body.style.overflow = '';\n      }, 300);\n    }\n\n    function updateLightbox() {\n      lightboxImg.src = galleryImages[currentIndex];\n      if (counter) counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;\n      \n      if (btnPrev) btnPrev.style.display = galleryImages.length > 1 ? 'block' : 'none';\n      if (btnNext) btnNext.style.display = galleryImages.length > 1 ? 'block' : 'none';\n    }\n\n    function nextImage() {\n      currentIndex = (currentIndex + 1) % galleryImages.length;\n      updateLightbox();\n    }\n\n    function prevImage() {\n      currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;\n      updateLightbox();\n    }\n\n    triggers.forEach(trigger => {\n      trigger.addEventListener('click', (e) => {\n        const idx = parseInt(e.currentTarget.getAttribute('data-index') || '0', 10);\n        openLightbox(idx);\n      });\n    });\n\n    if (btnClose) btnClose.addEventListener('click', closeLightbox);\n    if (btnNext) btnNext.addEventListener('click', nextImage);\n    if (btnPrev) btnPrev.addEventListener('click', prevImage);\n    \n    if (lightbox) {\n      lightbox.addEventListener('click', (e) => {\n        if (e.target === lightbox) closeLightbox();\n      });\n    }\n\n    document.addEventListener('keydown', (e) => {\n      if (lightbox && !lightbox.classList.contains('hidden')) {\n        if (e.key === 'Escape') closeLightbox();\n        if (e.key === 'ArrowRight') nextImage();\n        if (e.key === 'ArrowLeft') prevImage();\n      }\n    });\n  }\n})();<\/script>"], ["", " <script>(function(){", "\n  if (galleryImages && galleryImages.length > 0) {\n    let currentIndex = 0;\n    const lightbox = document.getElementById('lightbox');\n    const lightboxImg = document.getElementById('lightbox-img');\n    const btnClose = document.getElementById('lightbox-close');\n    const btnPrev = document.getElementById('lightbox-prev');\n    const btnNext = document.getElementById('lightbox-next');\n    const counter = document.getElementById('lightbox-counter');\n    const triggers = document.querySelectorAll('.gallery-img, .gallery-overlay');\n\n    function openLightbox(index) {\n      currentIndex = index;\n      updateLightbox();\n      lightbox.classList.remove('hidden');\n      lightbox.classList.add('flex');\n      // trigger reflow\n      void lightbox.offsetWidth;\n      lightbox.classList.remove('opacity-0');\n      document.body.style.overflow = 'hidden';\n    }\n\n    function closeLightbox() {\n      lightbox.classList.add('opacity-0');\n      setTimeout(() => {\n        lightbox.classList.remove('flex');\n        lightbox.classList.add('hidden');\n        document.body.style.overflow = '';\n      }, 300);\n    }\n\n    function updateLightbox() {\n      lightboxImg.src = galleryImages[currentIndex];\n      if (counter) counter.textContent = \\`\\${currentIndex + 1} / \\${galleryImages.length}\\`;\n      \n      if (btnPrev) btnPrev.style.display = galleryImages.length > 1 ? 'block' : 'none';\n      if (btnNext) btnNext.style.display = galleryImages.length > 1 ? 'block' : 'none';\n    }\n\n    function nextImage() {\n      currentIndex = (currentIndex + 1) % galleryImages.length;\n      updateLightbox();\n    }\n\n    function prevImage() {\n      currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;\n      updateLightbox();\n    }\n\n    triggers.forEach(trigger => {\n      trigger.addEventListener('click', (e) => {\n        const idx = parseInt(e.currentTarget.getAttribute('data-index') || '0', 10);\n        openLightbox(idx);\n      });\n    });\n\n    if (btnClose) btnClose.addEventListener('click', closeLightbox);\n    if (btnNext) btnNext.addEventListener('click', nextImage);\n    if (btnPrev) btnPrev.addEventListener('click', prevImage);\n    \n    if (lightbox) {\n      lightbox.addEventListener('click', (e) => {\n        if (e.target === lightbox) closeLightbox();\n      });\n    }\n\n    document.addEventListener('keydown', (e) => {\n      if (lightbox && !lightbox.classList.contains('hidden')) {\n        if (e.key === 'Escape') closeLightbox();\n        if (e.key === 'ArrowRight') nextImage();\n        if (e.key === 'ArrowLeft') prevImage();\n      }\n    });\n  }\n})();<\/script>"])), renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": project.title.toUpperCase(), "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "PROYECTOS", url: "/proyectos" }
  ], "bgImage": displayImage, "bgPosition": "object-[center_40%]" })} ${maybeRenderHead()}<main class="max-w-[1200px] mx-auto -mt-24 relative z-20 pb-0 px-4 md:px-8"> <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"> <div class="p-8 md:p-16 md:pb-8"> <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">  <div class="lg:col-span-2"> <h2 class="text-3xl font-bold text-slate-800 mb-6">Visión General del Proyecto</h2> <div class="w-20 h-1 bg-[#f04f23] mb-8"></div> <div class="markdown-body text-slate-600 text-[14px] leading-relaxed md:leading-loose font-normal prose prose-slate prose-sm md:prose-base max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-p:my-3"> <div>${unescapeHTML(marked.parse(project.description))}</div> </div> </div>  <div class="bg-slate-50 p-8 rounded-2xl border border-slate-100 h-fit"> <h3 class="text-lg font-bold text-slate-800 mb-6">Detalles Técnicos</h3> ${project.executionDate && renderTemplate`<div class="mb-6 pb-6 border-b border-slate-200"> <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha de Ejecución</span> <span class="flex items-center text-sm text-slate-800 font-medium"> <svg class="w-4 h-4 mr-2 text-[#f04f23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> ${formatDate(project.executionDate)} </span> </div>`} <div class="mb-8"> <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Soluciones Heat Factory</span> <span class="flex items-center text-sm text-slate-800 font-medium"> <svg class="w-4 h-4 mr-2 text-[#f04f23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
Instalación Garantizada
</span> </div> <a${addAttribute(`https://wa.me/51967083176?text=${encodeURIComponent(`Hola, deseo solicitar una cotización para el proyecto: ${project.title}`)}`, "href")} target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center px-6 py-3 bg-[#f04f23] text-white font-bold rounded-xl hover:bg-[#d8401a] transition-all shadow-lg shadow-[#f04f23]/30 group hover:-translate-y-1">
Solicitar Cotización
<svg class="w-6 h-6 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path></svg> </a> </div> </div> </div> ${gallery.length > 0 && renderTemplate`<div class="bg-slate-50 p-8 md:p-16 md:pt-10 border-t border-slate-100"> <div class="text-center mb-12"> <h2 class="text-3xl font-bold text-slate-800 mb-4">Galería del Proyecto</h2> <p class="text-slate-500 max-w-2xl mx-auto">Explora de cerca los resultados y la calidad de nuestra implementación.</p> </div> <div class="w-full relative bg-slate-50 mb-6"> ${(() => {
    let images = gallery;
    if (images.length === 1) {
      return renderTemplate`<div class="w-full h-64 md:h-[350px] rounded-xl overflow-hidden shadow-sm"> <img${addAttribute(images[0], "src")}${addAttribute(project.title, "alt")} data-index="0" class="gallery-img cursor-pointer w-full h-full object-cover hover:scale-105 transition-transform duration-700"> </div>`;
    }
    if (images.length === 2) {
      return renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 md:h-[300px]"> ${images.map((imgUrl, i) => renderTemplate`<div class="rounded-xl overflow-hidden shadow-sm h-full"> <img${addAttribute(imgUrl, "src")}${addAttribute(`${project.title} - Imagen ${i + 1}`, "alt")}${addAttribute(i, "data-index")} class="gallery-img cursor-pointer w-full h-full object-cover hover:scale-105 transition-transform duration-700"> </div>`)} </div>`;
    }
    if (images.length === 3) {
      return renderTemplate`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto lg:h-[350px]"> <div class="rounded-xl overflow-hidden shadow-sm h-80 lg:h-full"> <img${addAttribute(images[0], "src")} data-index="0" class="gallery-img cursor-pointer w-full h-full object-cover hover:scale-105 transition-transform duration-700"> </div> <div class="grid grid-rows-2 gap-4 h-[300px] lg:h-full"> <div class="rounded-xl overflow-hidden shadow-sm h-full"> <img${addAttribute(images[1], "src")} data-index="1" class="gallery-img cursor-pointer w-full h-full object-cover hover:scale-105 transition-transform duration-700"> </div> <div class="rounded-xl overflow-hidden shadow-sm h-full"> <img${addAttribute(images[2], "src")} data-index="2" class="gallery-img cursor-pointer w-full h-full object-cover hover:scale-105 transition-transform duration-700"> </div> </div> </div>`;
    }
    const displayImages = images.slice(0, 5);
    const hasMore = images.length > 5;
    const remainingCount = images.length - 5;
    return renderTemplate`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto lg:h-[350px]"> <div class="rounded-xl overflow-hidden shadow-sm h-80 lg:h-full relative group"> <img${addAttribute(displayImages[0], "src")} data-index="0" class="gallery-img cursor-pointer w-full h-full object-cover hover:scale-105 transition-transform duration-700"> </div> <div${addAttribute(`grid ${displayImages.length === 4 ? "grid-rows-3" : "grid-cols-2 grid-rows-2"} gap-4 h-[300px] lg:h-full`, "class")}> ${displayImages.slice(1).map((imgUrl, i) => renderTemplate`<div class="rounded-xl overflow-hidden shadow-sm h-full relative group"> <img${addAttribute(imgUrl, "src")}${addAttribute(i + 1, "data-index")} class="gallery-img cursor-pointer w-full h-full object-cover hover:scale-105 transition-transform duration-700"> ${hasMore && i === displayImages.slice(1).length - 1 && renderTemplate`<div data-index="4" class="gallery-overlay absolute inset-0 bg-black/50 flex items-center justify-center text-white text-3xl font-bold cursor-pointer hover:bg-black/40 transition-colors">
+${remainingCount} </div>`} </div>`)} </div> </div>`;
  })()} </div> </div>`} </div>  <div class="mt-8 flex justify-center"> <a href="/proyectos" class="flex items-center px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-md hover:shadow-lg group"> <svg class="w-5 h-5 mr-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
Volver a Proyectos
</a> </div> </main> ${gallery.length > 0 && renderTemplate`<div id="lightbox" class="fixed inset-0 z-[100] bg-black/95 hidden flex-col items-center justify-center opacity-0 transition-all duration-300">  <div class="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-20"> <div id="lightbox-counter" class="text-white/60 font-medium text-sm tracking-widest pl-2"></div> <button id="lightbox-close" class="text-white/60 hover:text-white p-2 transition-colors cursor-pointer"> <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg> </button> </div>  <button id="lightbox-prev" class="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 text-white/40 hover:text-white p-4 transition-colors cursor-pointer"> <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 19l-7-7 7-7"></path></svg> </button>  <div class="relative w-full h-full flex items-center justify-center p-4 md:p-12 z-10"> <img id="lightbox-img" src="" class="max-h-full max-w-full object-contain shadow-2xl"> </div>  <button id="lightbox-next" class="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 text-white/40 hover:text-white p-4 transition-colors cursor-pointer"> <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5l7 7-7 7"></path></svg> </button> </div>`}` }), defineScriptVars({ galleryImages: gallery }));
}, "D:/Proyectos/heatperu/src/pages/proyectos/[id].astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/proyectos/[id].astro";
const $$url = "/proyectos/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
