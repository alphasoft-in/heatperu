import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { m as maybeRenderHead, h as addAttribute, k as renderTemplate, o as renderComponent } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'clsx';
import { d as db, c as categories } from './index_B4lP7dzv.mjs';

const slides = [
  { id: 1, imageUrl: "/slide_wayne.webp", alt: "Wayne" },
  { id: 2, imageUrl: "/slide_becket.webp", alt: "Becket" },
  { id: 3, imageUrl: "/slide_honeywell.webp", alt: "Honeywell" },
  { id: 4, imageUrl: "/slide_mcdonnell.webp", alt: "McDonnell" },
  { id: 5, imageUrl: "/slide_suntec.webp", alt: "Suntec" },
  { id: 6, imageUrl: "/slide_belgas.webp", alt: "Belgas" },
  { id: 7, imageUrl: "/slide_pf.webp", alt: "PF" },
  { id: 8, imageUrl: "/slide_vmv.webp", alt: "VMV" },
  { id: 9, imageUrl: "/slide_baite.webp", alt: "Baite" }
];
function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5e3);
    return () => clearInterval(timer);
  }, [currentIndex]);
  return /* @__PURE__ */ jsxs("div", { className: "w-full bg-white relative group border-b border-gray-100 pb-4 md:pb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto h-[200px] sm:h-[300px] md:h-[450px] lg:h-[550px] relative flex items-center justify-center overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "w-full h-full px-10 md:px-24 py-4 md:py-8 bg-white flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: slides[currentIndex].imageUrl, alt: slides[currentIndex].alt, className: "w-full h-full object-contain transition-opacity duration-500" }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: prevSlide,
          className: "absolute top-1/2 -translate-y-1/2 left-2 md:left-8 text-[#f04f23] hover:bg-orange-50 p-2 rounded-full transition-colors z-10",
          "aria-label": "Anterior",
          children: /* @__PURE__ */ jsx(FiChevronLeft, { className: "w-10 h-10 md:w-12 md:h-12", strokeWidth: 1.5 })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: nextSlide,
          className: "absolute top-1/2 -translate-y-1/2 right-2 md:right-8 text-[#f04f23] hover:bg-orange-50 p-2 rounded-full transition-colors z-10",
          "aria-label": "Siguiente",
          children: /* @__PURE__ */ jsx(FiChevronRight, { className: "w-10 h-10 md:w-12 md:h-12", strokeWidth: 1.5 })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center space-x-1.5 md:space-x-2 pb-2 md:pb-4", children: slides.map((slide, slideIndex) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => goToSlide(slideIndex),
        "aria-label": `Ir al slide ${slideIndex + 1}`,
        className: `transition-all duration-300 rounded-full cursor-pointer ${currentIndex === slideIndex ? "bg-[#f04f23] w-2 h-2 md:w-2.5 md:h-2.5 scale-110" : "bg-gray-300 hover:bg-gray-400 w-1.5 h-1.5 md:w-2 md:h-2"}`
      },
      slide.id
    )) })
  ] });
}

const $$Categories = createComponent(async ($$result, $$props, $$slots) => {
  const dbCategories = await db.select().from(categories);
  return renderTemplate`${maybeRenderHead()}<section class="w-full max-w-[1400px] mx-auto py-16 px-4 md:px-8"> <div class="text-center mb-12"> <h2 class="text-2xl md:text-3xl font-bold text-[#0d1624] uppercase tracking-widest relative inline-block pb-4">
Nuestras Categorías
<span class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#f04f23]"></span> </h2> </div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> ${dbCategories.map((category) => renderTemplate`<a${addAttribute(`/categorias/${category.slug}`, "href")} class="group flex flex-col h-full border border-gray-200 bg-white hover:border-[#f04f23] transition-colors duration-300"> <div class="p-6 lg:p-8 flex flex-col h-full"> <h3 class="text-xs md:text-[13px] font-bold text-gray-900 text-center uppercase tracking-wider mb-6 pb-4 border-b border-gray-100 group-hover:text-[#f04f23] transition-colors min-h-[48px] flex items-center justify-center"> ${category.name} </h3> <div class="w-full flex-1 flex items-center justify-center mb-8 min-h-[180px] max-h-[220px]"> <img${addAttribute(category.imageUrl, "src")}${addAttribute(category.name, "alt")} class="max-w-full max-h-[200px] object-contain group-hover:opacity-90 transition-opacity" onerror="this.style.display='none'"> </div> <div class="w-full bg-[#1e1a17] text-white text-center font-bold py-2.5 text-xs tracking-wide group-hover:bg-[#f04f23] transition-colors duration-300 mt-auto">
VER MÁS
</div> </div> </a>`)} </div> </section>`;
}, "D:/Proyectos/heatperu/src/components/Categories.astro", void 0);

const $$ClientsSlider = createComponent(($$result, $$props, $$slots) => {
  const clients = [
    { name: "Alya", logo: "/clientes/alya.png" },
    { name: "Backus", logo: "/clientes/backus.png" },
    { name: "Calderas Intesa", logo: "/clientes/calderas.png" },
    { name: "Calidda", logo: "/clientes/calidda.png" },
    { name: "Cosapi", logo: "/clientes/cosapi.png" },
    { name: "Danper", logo: "/clientes/danper.png" },
    { name: "Heineken", logo: "/clientes/heineken.png" },
    { name: "Hialpesa", logo: "/clientes/hialpesa.png" },
    { name: "Ingevap", logo: "/clientes/ingevap.png" },
    { name: "Newmont", logo: "/clientes/newmont.png" },
    { name: "Omatt", logo: "/clientes/omat.png" },
    { name: "Siderperu", logo: "/clientes/siderperu.png" },
    { name: "Tecavi", logo: "/clientes/tecavi.png" }
  ];
  const duplicatedClients = [...clients, ...clients];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 bg-white overflow-hidden border-t border-gray-100" data-astro-cid-idpakhbp> <div class="max-w-[1200px] mx-auto px-4 md:px-8 text-center mb-12" data-astro-cid-idpakhbp> <h2 class="text-2xl md:text-3xl font-black text-[#0d1624] tracking-tight uppercase mb-4" data-astro-cid-idpakhbp>Nuestros Clientes</h2> <div class="w-16 h-1 bg-[#f04f23] mx-auto rounded-full" data-astro-cid-idpakhbp></div> </div>  <div class="relative flex overflow-x-hidden group w-full max-w-[1600px] mx-auto" data-astro-cid-idpakhbp>  <div class="animate-marquee whitespace-nowrap flex items-center py-8" data-astro-cid-idpakhbp> ${duplicatedClients.map((client) => renderTemplate`<span class="mx-8 md:mx-16 inline-flex justify-center items-center w-64 md:w-96 transition-all duration-300" data-astro-cid-idpakhbp> <img${addAttribute(client.logo, "src")}${addAttribute(client.name, "alt")} class="object-contain h-24 md:h-32 w-full" data-astro-cid-idpakhbp> </span>`)} </div>  <div class="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center py-8" data-astro-cid-idpakhbp> ${duplicatedClients.map((client) => renderTemplate`<span class="mx-8 md:mx-16 inline-flex justify-center items-center w-64 md:w-96 transition-all duration-300" data-astro-cid-idpakhbp> <img${addAttribute(client.logo, "src")}${addAttribute(client.name, "alt")} class="object-contain h-24 md:h-32 w-full" data-astro-cid-idpakhbp> </span>`)} </div> </div> </section>`;
}, "D:/Proyectos/heatperu/src/components/ClientsSlider.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${renderComponent($$result2, "Slider", Slider, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Slider.tsx", "client:component-export": "default" })} ${maybeRenderHead()}<main> ${renderComponent($$result2, "Categories", $$Categories, {})} ${renderComponent($$result2, "ClientsSlider", $$ClientsSlider, {})} </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
