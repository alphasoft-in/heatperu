import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, t as tutorialCategories, g as tutorialSubcategories, h as tutorials } from './index_B4lP7dzv.mjs';
import { eq, asc, desc } from 'drizzle-orm';

const $$categoria = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$categoria;
  const { categoria } = Astro2.params;
  const catResult = await db.select().from(tutorialCategories).where(eq(tutorialCategories.slug, categoria)).limit(1);
  if (catResult.length === 0) {
    return Astro2.redirect("/tutoriales");
  }
  const category = catResult[0];
  const subcats = await db.select().from(tutorialSubcategories).where(eq(tutorialSubcategories.categoryId, category.id)).orderBy(asc(tutorialSubcategories.order), asc(tutorialSubcategories.id));
  const allTutorials = await db.select({
    id: tutorials.id,
    title: tutorials.title,
    slug: tutorials.slug,
    description: tutorials.description,
    imageUrl: tutorials.imageUrl,
    videoUrl: tutorials.videoUrl,
    executionDate: tutorials.executionDate,
    subcategoryId: tutorials.subcategoryId
  }).from(tutorials).innerJoin(tutorialSubcategories, eq(tutorials.subcategoryId, tutorialSubcategories.id)).where(eq(tutorialSubcategories.categoryId, category.id)).orderBy(asc(tutorials.order), desc(tutorials.id));
  const tutorialsBySubcat = Object.fromEntries(
    subcats.map((sub) => [sub.id, allTutorials.filter((t) => t.subcategoryId === sub.id)])
  );
  const uncategorized = allTutorials.filter((t) => t.subcategoryId === null);
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }
  function stripMarkdown(text) {
    if (!text) return "";
    return text.replace(/<[^>]*>?/gm, "").replace(/[#*`_~]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\n+/g, " ").trim();
  }
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": category.name.toUpperCase(), "breadcrumbs": [
    { name: "INICIO", url: "/" },
    { name: "TUTORIALES", url: "/tutoriales" },
    { name: category.name }
  ], "bgImage": "/bc-servicios.jpeg", "bgPosition": "object-center" })} ${maybeRenderHead()}<main class="max-w-[1200px] mx-auto pt-8 md:pt-12 pb-16 md:pb-24 px-4 md:px-8"> ${subcats.length === 0 && uncategorized.length === 0 ? renderTemplate`<div class="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200"> <p>Aún no hay tutoriales en esta categoría. ¡Vuelve pronto!</p> </div>` : renderTemplate`<div class="space-y-14"> ${subcats.map((sub) => {
    const subTutorials = tutorialsBySubcat[sub.id] ?? [];
    if (subTutorials.length === 0) return null;
    return renderTemplate`<section> <div class="flex items-center gap-3 mb-6"> <div class="w-1 h-6 bg-[#f04f23] rounded-full"></div> <h2 class="text-xl font-bold text-slate-800">${sub.name}</h2> <div class="flex-1 h-px bg-gray-100 ml-2"></div> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> ${subTutorials.map((tutorial) => {
      const videoId = getYouTubeId(tutorial.videoUrl);
      const thumbnailUrl = tutorial.imageUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "/placeholder.png");
      return renderTemplate`<div class="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500"> <a${addAttribute(`/tutoriales/${tutorial.id}`, "href")} class="block relative w-full h-52 bg-white overflow-hidden border-b border-gray-100"> <img${addAttribute(thumbnailUrl, "src")}${addAttribute(tutorial.title, "alt")} class="w-full h-full object-contain p-8 transition-all duration-700 group-hover:scale-105" onerror="this.src='https://placehold.co/600x400/eeeeee/999999?text=Tutorial'"> </a> <div class="p-6 flex-1 flex flex-col"> <h3 class="text-base font-semibold text-slate-800 leading-snug mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-[#f04f23]"> <a${addAttribute(`/tutoriales/${tutorial.id}`, "href")}>${tutorial.title}</a> </h3> ${tutorial.executionDate && renderTemplate`<div class="flex items-center text-[12px] font-semibold tracking-wide text-slate-500 mb-4 uppercase"> <svg class="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> ${formatDate(tutorial.executionDate)} </div>`} <p class="text-[14px] text-slate-600 leading-relaxed line-clamp-3 mb-6 flex-1"> ${stripMarkdown(tutorial.description)} </p> <div class="pt-4 border-t border-gray-100 mt-auto"> <a${addAttribute(`/tutoriales/${tutorial.id}`, "href")} class="flex items-center text-[#f04f23] font-medium text-sm tracking-wide">
VER TUTORIAL
<span class="transform transition-transform duration-300 group-hover:translate-x-2 ml-2">→</span> </a> </div> </div> </div>`;
    })} </div> </section>`;
  })} </div>`} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/tutoriales/categoria/[categoria].astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/tutoriales/categoria/[categoria].astro";
const $$url = "/tutoriales/categoria/[categoria]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$categoria,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
