import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { x as createRenderInstruction, m as maybeRenderHead, h as addAttribute, k as renderTemplate, q as renderHead, v as renderSlot, o as renderComponent } from './entrypoint_1qPj0QrW.mjs';
/* empty css                 */
import 'clsx';
import { d as db, c as categories } from './index_B4lP7dzv.mjs';
import { desc } from 'drizzle-orm';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { FaYoutube, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { FiSearch, FiX, FiMenu } from 'react-icons/fi';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const dbCategories = await db.select().from(categories).orderBy(desc(categories.visits)).limit(5);
  return renderTemplate`${maybeRenderHead()}<footer class="bg-[#1e1a17] text-gray-300 pt-16 pb-6 mt-16 border-t-4 border-[#f04f23]"> <div class="max-w-[1200px] mx-auto px-4 md:px-8"> <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">  <div> <h3 class="text-white font-bold text-[17px] mb-6">Categorías</h3> <ul class="space-y-3.5"> ${dbCategories.map((cat) => renderTemplate`<li> <a${addAttribute(`/categorias/${cat.slug}`, "href")} class="text-[13px] hover:text-white hover:underline transition-colors capitalize"> ${cat.name.toLowerCase()} </a> </li>`)} </ul> </div>  <div> <h3 class="text-white font-bold text-[17px] mb-6">Contáctanos</h3> <ul class="space-y-5 text-[13px]"> <li class="flex items-start"> <svg class="w-4 h-4 mr-3 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <div> <p>Av. Argentina 575 Tienda H12 - 13</p> <p>Urb. Lima Industrial - Cercado de Lima</p> </div> </li> <li class="flex items-center"> <svg class="w-4 h-4 mr-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> <span>+51 967-083-176</span> </li> <li class="flex items-center"> <svg class="w-4 h-4 mr-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> <span>ventas@heatperu.com</span> </li> <li class="flex items-start"> <svg class="w-4 h-4 mr-3 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> <div> <p>Lunes a Viernes de 9:00am - 6:00pm</p> <p>Sábados de 9:00am - 3:00pm</p> </div> </li> </ul> </div>  <div> <h3 class="text-white font-bold text-[17px] mb-5">Síguenos</h3> <div class="flex space-x-3 mb-8"> <a href="#" aria-label="Facebook" class="bg-[#1877f2] text-white p-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg> </a> <a href="#" aria-label="Instagram" class="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white p-2 rounded-md hover:opacity-90 transition-opacity shadow-sm"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg> </a> <a href="#" aria-label="LinkedIn" class="bg-[#0077b5] text-white p-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm"> <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path></svg> </a> </div> <h3 class="text-white font-bold text-[17px] mb-4">Suscríbete</h3> <form id="newsletterForm" class="flex shadow-lg shadow-[#f04f23]/20 ring-2 ring-[#f04f23]/40 rounded-md transition-shadow hover:shadow-[#f04f23]/40 relative"> <input type="email" id="newsletterEmail" placeholder="Email para el boletín..." required class="flex-1 px-4 py-3.5 text-[14px] bg-white text-gray-900 border-0 focus:ring-0 outline-none rounded-l-md"> <button type="submit" id="newsletterBtn" aria-label="Suscribirse" class="bg-[#f04f23] text-white px-5 py-3.5 rounded-r-md hover:bg-[#d0421c] transition-colors flex items-center justify-center min-w-[64px]"> <svg id="newsletterIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M22 2L11 13"></path> <path d="M22 2l-7 20-4-9-9-4 20-7z"></path> </svg> <div id="newsletterLoader" class="hidden w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> </button> </form> <p id="newsletterMsg" class="text-sm mt-2 hidden"></p> </div> </div> ${renderScript($$result, "D:/Proyectos/heatperu/src/components/Footer.astro?astro&type=script&index=0&lang.ts")} </div>  <div class="border-t border-gray-700/60 pt-8 pb-4 flex flex-col items-center gap-6"> <a href="/libro-reclamaciones" class="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl border border-gray-700/50 hover:border-gray-500 transition-all group"> <svg class="w-8 h-8 text-[#f04f23] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> <div class="flex flex-col"> <span class="text-white font-bold tracking-wider text-[11px] uppercase">Libro de Reclamaciones</span> <span class="text-gray-400 text-[10px]">Conforme al Código de Protección al Consumidor</span> </div> </a> <div class="flex flex-col md:flex-row justify-center items-center gap-3 text-[12px] text-gray-500"> <p>Copyright © ${(/* @__PURE__ */ new Date()).getFullYear()} - GRUPO EMPRESARIAL ZEVALLOS S.A.C.</p> <span class="hidden md:inline font-bold text-gray-600">|</span> <p>RUC: 20613311808</p> </div> </div> </footer>`;
}, "D:/Proyectos/heatperu/src/components/Footer.astro", void 0);

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/png" href="/logoheat.png"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Heat Factory - Alta Tecnología</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "D:/Proyectos/heatperu/src/layouts/Layout.astro", void 0);

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Nosotros", path: "/nosotros" },
    { name: "Productos", path: "/productos" },
    { name: "Servicios", path: "/servicios" },
    { name: "Proyectos", path: "/proyectos" },
    { name: "Tutoriales", path: "/tutoriales" },
    { name: "Contáctenos", path: "/contacto" }
  ];
  const getDesktopLinkClass = (path) => {
    const isActive = path === "/" ? currentPath === "/" : currentPath.startsWith(path);
    return `transition-colors ${isActive ? "text-[#f04f23]" : "text-white hover:text-[#f04f23]"}`;
  };
  const getMobileLinkClass = (path) => {
    const isActive = path === "/" ? currentPath === "/" : currentPath.startsWith(path);
    return `px-6 py-3 border-b border-gray-50 transition-colors ${isActive ? "text-[#f04f23] bg-orange-50/50" : "text-gray-800 hover:bg-gray-50"}`;
  };
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q");
    if (q && typeof q === "string" && q.trim() !== "") {
      window.location.href = `/buscar?q=${encodeURIComponent(q.trim())}`;
    }
  };
  return /* @__PURE__ */ jsxs("header", { className: "w-full flex flex-col font-sans relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full bg-white relative z-50", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto flex items-center justify-between py-4 px-4 md:py-6 md:px-8", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsx("img", { src: "/logoheat.png", alt: "Heat Factory", className: "h-16 md:h-24 object-contain" }) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "hidden md:flex flex-1 max-w-2xl mx-12", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "q",
              placeholder: "Buscar por producto, marca, SKU...",
              className: "w-full border border-gray-300 rounded-l-md px-4 py-3 text-sm focus:outline-none focus:border-[#f04f23] focus:ring-1 focus:ring-[#f04f23]"
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-[#f04f23] text-white px-8 py-3 rounded-r-md hover:bg-[#d8401a] transition-colors flex items-center justify-center cursor-pointer", children: /* @__PURE__ */ jsx(FiSearch, { className: "w-5 h-5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex items-center space-x-6", children: [
          /* @__PURE__ */ jsx("a", { href: "https://www.youtube.com/@HEATFACTORYPERU", target: "_blank", rel: "noopener noreferrer", className: "text-[#0d1624] hover:text-[#f04f23] transition-colors", children: /* @__PURE__ */ jsx(FaYoutube, { className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsx("a", { href: "https://www.facebook.com/heatfactoryperu", target: "_blank", rel: "noopener noreferrer", className: "text-[#0d1624] hover:text-[#f04f23] transition-colors", children: /* @__PURE__ */ jsx(FaFacebookF, { className: "w-[1.2rem] h-[1.2rem]" }) }),
          /* @__PURE__ */ jsx("a", { href: "https://www.instagram.com/calderas_quemadores_peru", target: "_blank", rel: "noopener noreferrer", className: "text-[#0d1624] hover:text-[#f04f23] transition-colors", children: /* @__PURE__ */ jsx(FaInstagram, { className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsx("a", { href: "https://pe.linkedin.com/company/heat-factory", target: "_blank", rel: "noopener noreferrer", className: "text-[#0d1624] hover:text-[#f04f23] transition-colors", children: /* @__PURE__ */ jsx(FaLinkedinIn, { className: "w-6 h-6" }) })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "md:hidden text-gray-800 p-2 focus:outline-none cursor-pointer",
            onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
            "aria-label": "Abrir menú",
            children: isMobileMenuOpen ? /* @__PURE__ */ jsx(FiX, { className: "w-8 h-8" }) : /* @__PURE__ */ jsx(FiMenu, { className: "w-8 h-8" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "md:hidden px-4 pb-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "flex w-full shadow-sm", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "q",
            placeholder: "Buscar por producto, marca, SKU...",
            className: "w-full border-2 border-[#f04f23] border-r-0 rounded-l-md px-4 py-2 text-sm focus:outline-none text-gray-800"
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-[#f04f23] text-white px-5 py-2 rounded-r-md flex items-center justify-center cursor-pointer hover:bg-[#d8401a] transition-colors", children: /* @__PURE__ */ jsx(FiSearch, { className: "w-5 h-5" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "hidden md:block w-full bg-[#1e1a17] relative z-40", children: /* @__PURE__ */ jsx("div", { className: "max-w-[1400px] mx-auto flex items-center justify-center py-4 px-8 space-x-6 lg:space-x-10 text-xs lg:text-sm font-semibold tracking-wide", children: navLinks.map((link) => /* @__PURE__ */ jsx("a", { href: link.path, className: getDesktopLinkClass(link.path), children: link.name }, link.path)) }) }),
    isMobileMenuOpen && /* @__PURE__ */ jsxs("div", { className: "md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-30 border-t border-gray-100 flex flex-col", children: [
      /* @__PURE__ */ jsx("nav", { className: "flex flex-col py-2 font-semibold text-sm text-center", children: navLinks.map((link) => /* @__PURE__ */ jsx("a", { href: link.path, className: getMobileLinkClass(link.path), children: link.name }, link.path)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center space-x-6 p-6 bg-gray-50", children: [
        /* @__PURE__ */ jsx("a", { href: "https://www.youtube.com/@HEATFACTORYPERU", target: "_blank", rel: "noopener noreferrer", className: "text-gray-600 hover:text-[#f04f23]", children: /* @__PURE__ */ jsx(FaYoutube, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsx("a", { href: "https://www.facebook.com/heatfactoryperu", target: "_blank", rel: "noopener noreferrer", className: "text-gray-600 hover:text-[#f04f23]", children: /* @__PURE__ */ jsx(FaFacebookF, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsx("a", { href: "https://www.instagram.com/calderas_quemadores_peru", target: "_blank", rel: "noopener noreferrer", className: "text-gray-600 hover:text-[#f04f23]", children: /* @__PURE__ */ jsx(FaInstagram, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsx("a", { href: "https://pe.linkedin.com/company/heat-factory", target: "_blank", rel: "noopener noreferrer", className: "text-gray-600 hover:text-[#f04f23]", children: /* @__PURE__ */ jsx(FaLinkedinIn, { className: "w-6 h-6" }) })
      ] })
    ] })
  ] });
}

export { $$Layout as $, Header as H, renderScript as r };
