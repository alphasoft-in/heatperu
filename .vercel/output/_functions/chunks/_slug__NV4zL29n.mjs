import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute, p as Fragment, u as unescapeHTML } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, r as renderScript, H as Header } from './Header_BHTxsR1r.mjs';
import { $ as $$PageHeader } from './PageHeader_DlI_uO7Y.mjs';
import { d as db, s as subcategories, p as products, c as categories } from './index_B4lP7dzv.mjs';
import { eq } from 'drizzle-orm';
import { marked } from 'marked';

const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  if (!slug) {
    return Astro2.redirect("/");
  }
  const productResult = await db.select({
    product: products,
    subcategory: subcategories
  }).from(products).leftJoin(subcategories, eq(products.subcategoryId, subcategories.id)).where(eq(products.slug, slug)).limit(1);
  if (productResult.length === 0) {
    return Astro2.redirect("/404");
  }
  const { product, subcategory } = productResult[0];
  let category = null;
  if (subcategory && subcategory.categoryId) {
    const catResult = await db.select().from(categories).where(eq(categories.id, subcategory.categoryId)).limit(1);
    if (catResult.length > 0) {
      category = catResult[0];
    }
  }
  const breadcrumbs = [
    { name: "INICIO", url: "/" },
    { name: "PRODUCTOS", url: "/productos" }
  ];
  if (category) {
    breadcrumbs.push({ name: category.name.toUpperCase(), url: `/categorias/${category.slug}` });
  }
  if (subcategory) {
    breadcrumbs.push({ name: subcategory.name.toUpperCase() });
  }
  const whatsappNumber = "+51999999999";
  const whatsappMessage = encodeURIComponent(`Hola, quiero información sobre el producto ${product.name} (SKU: ${product.sku}).`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  let gallery = [];
  try {
    gallery = JSON.parse(product.galleryUrls || "[]");
  } catch (e) {
    gallery = [product.imageUrl];
  }
  if (gallery.length === 0) {
    gallery = [product.imageUrl];
  }
  function formatProductName(name) {
    if (!name) return "";
    const lowers = ["y", "e", "o", "u", "de", "del", "en", "con", "a", "para", "por", "las", "los", "el", "la", "un", "una"];
    return name.split(" ").map((word, index) => {
      if (/\d/.test(word)) return word;
      const lower = word.toLowerCase();
      if (index > 0 && lowers.includes(lower)) return lower;
      return word.charAt(0).toUpperCase() + lower.slice(1);
    }).join(" ");
  }
  const displayName = formatProductName(product.name);
  const displayBrand = formatProductName(product.brand);
  const displayModel = product.model ? formatProductName(product.model) : "-";
  function decodeHtml(html) {
    if (!html) return "";
    return html.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#39;/g, "'");
  }
  const decodedDesc = decodeHtml(product.description);
  const descriptionHtml = marked.parse(decodedDesc, { breaks: true, gfm: true });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": displayName, "breadcrumbs": breadcrumbs, "bgImage": "/productos/bc-productos.webp" })} ${maybeRenderHead()}<main class="max-w-[1200px] mx-auto py-16 px-4 md:px-8"> <div class="flex flex-col md:flex-row gap-10 lg:gap-16">  <div class="w-full md:w-5/12 lg:w-[42%] flex flex-col gap-4">  <div class="relative w-full aspect-square md:aspect-[4/3] max-h-[480px] bg-[#f8fafc] rounded-3xl overflow-hidden border border-slate-100/50 group slider-wrapper"> <div id="slider-container" class="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"> ${gallery.map((img, idx) => renderTemplate`<div class="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-6 md:p-10 slide-item"> <img${addAttribute(img, "src")}${addAttribute(`${product.name} - imagen ${idx + 1}`, "alt")} class="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105" onerror="this.src='/placeholder.png'"> </div>`)} </div> ${gallery.length > 1 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <button id="slider-prev" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label="Anterior"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> </button> <button id="slider-next" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label="Siguiente"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg> </button> <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20"> ${gallery.map((_, idx) => renderTemplate`<button${addAttribute(`slider-dot w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? "bg-[#f04f23] w-6" : "bg-slate-300 hover:bg-slate-400"}`, "class")}${addAttribute(idx, "data-index")}${addAttribute(`Ir a imagen ${idx + 1}`, "aria-label")}></button>`)} </div> ` })}`} </div> </div>  <div class="w-full md:w-7/12 lg:w-[58%] flex flex-col justify-center lg:pl-10 xl:pl-14 pt-4 md:pt-0">  <div class="mb-2.5"> <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#f04f23]/10 text-[#f04f23] text-[9px] font-bold uppercase tracking-widest"> ${displayBrand} </span> </div>  <h1 class="text-xl md:text-2xl lg:text-[28px] font-bold text-slate-900 mb-5 tracking-tight leading-tight"> ${displayName} </h1>  <div class="grid grid-cols-2 gap-2.5 mb-6"> <div class="flex flex-col gap-0.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-sm"> <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"> <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
Marca
</span> <span class="text-[13px] font-bold text-slate-800 truncate">${displayBrand}</span> </div> <div class="flex flex-col gap-0.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-sm"> <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"> <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
Modelo
</span> <span class="text-[13px] font-bold text-slate-800 truncate">${displayModel}</span> </div> <div class="flex flex-col gap-0.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-sm"> <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"> <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
SKU
</span> <span class="text-[13px] font-semibold text-slate-800 font-mono tracking-tight">${product.sku}</span> </div> <div class="flex flex-col gap-0.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-sm"> <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"> <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
Estado
</span> ${product.isAvailable ? renderTemplate`<span class="inline-flex items-center text-emerald-600 font-bold gap-1.5 text-[13px]">
Disponible
</span>` : renderTemplate`<span class="inline-flex items-center text-red-600 font-bold gap-1.5 text-[13px]">
Agotado
</span>`} </div> </div>  <div class="flex flex-col sm:flex-row items-center gap-3"> <a${addAttribute(whatsappLink, "href")} target="_blank" rel="noopener noreferrer" class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f04f23] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 text-sm shadow-[0_8px_20px_0_rgba(240,79,35,0.3)] hover:shadow-[0_12px_25px_rgba(240,79,35,0.4)] hover:-translate-y-1"> <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path> </svg>
Consultar ahora
</a> ${product.pdfUrl && renderTemplate`<a${addAttribute(product.pdfUrl, "href")} target="_blank" rel="noopener noreferrer" download class="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition-all font-bold border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-xl bg-white text-sm"> <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
Ficha Técnica
</a>`} </div> </div> </div>  ${product.description && renderTemplate`<div class="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">  <div class="lg:col-span-8 xl:col-span-9 bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 ring-1 ring-slate-900/5"> <div class="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100"> <div class="bg-[#f04f23]/10 p-2.5 rounded-xl"> <svg class="w-6 h-6 text-[#f04f23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg> </div> <h2 class="text-xl md:text-2xl font-bold text-slate-800">
Descripción Detallada
</h2> </div> <div class="prose max-w-none text-[14px] md:text-[15px] text-slate-600 leading-relaxed 
            prose-p:my-3 
            prose-blockquote:my-3 prose-blockquote:border-l-4 prose-blockquote:border-[#f04f23] prose-blockquote:bg-slate-50 prose-blockquote:py-1.5 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:font-semibold prose-blockquote:text-slate-800 prose-blockquote:italic [&_blockquote_p]:my-0
            prose-ul:my-3 prose-ul:marker:text-[#f04f23]
            prose-ol:my-3 prose-ol:marker:text-[#f04f23] prose-ol:marker:font-semibold
            prose-li:my-1
            prose-headings:my-5 prose-headings:text-slate-800 prose-headings:font-bold
            prose-strong:text-slate-800
            prose-a:text-[#f04f23] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">${unescapeHTML(descriptionHtml)}</div> </div>  <div class="lg:col-span-4 xl:col-span-3 sticky top-24 flex flex-col gap-4"> <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/10 overflow-hidden relative group"> <div class="absolute top-0 right-0 w-32 h-32 bg-[#f04f23]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-transform duration-700 group-hover:scale-150"></div> <div class="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm border border-white/10"> <svg class="w-6 h-6 text-[#f04f23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> </div> <h3 class="text-xl font-bold mb-3 relative z-10">¿Asesoría Técnica?</h3> <p class="text-slate-300 text-sm mb-8 leading-relaxed relative z-10">
Nuestros ingenieros especialistas están listos para ayudarte con las especificaciones técnicas y selección correcta para tu proyecto.
</p> <a${addAttribute(whatsappLink, "href")} target="_blank" rel="noopener noreferrer" class="relative z-10 flex items-center justify-center gap-2.5 w-full bg-[#f04f23] hover:bg-white hover:text-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:-translate-y-1"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path> </svg>
Contactar Soporte
</a> </div> </div> </div>`} </main> ` })} ${renderScript($$result, "D:/Proyectos/heatperu/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Proyectos/heatperu/src/pages/productos/[slug].astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/productos/[slug].astro";
const $$url = "/productos/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
