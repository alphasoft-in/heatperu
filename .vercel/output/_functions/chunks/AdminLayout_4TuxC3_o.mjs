import { c as createComponent } from './astro-component_HpNPC3Xv.mjs';
import 'piccolore';
import { q as renderHead, o as renderComponent, h as addAttribute, k as renderTemplate, v as renderSlot } from './entrypoint_DSH4zfPn.mjs';
/* empty css                 */
import { jsx } from 'react/jsx-runtime';
import 'react';
import { Toaster } from 'react-hot-toast';

function ToasterSetup() {
  return /* @__PURE__ */ jsx(
    Toaster,
    {
      position: "top-right",
      toastOptions: {
        duration: 3e3,
        style: {
          background: "#fff",
          color: "#333",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        },
        success: {
          style: {
            borderLeft: "4px solid #10B981"
          }
        },
        error: {
          duration: 5e3,
          style: {
            borderLeft: "4px solid #EF4444"
          }
        }
      }
    }
  );
}

const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title } = Astro2.props;
  const currentPath = Astro2.url.pathname.replace(/\/$/, "");
  const isDashboard = currentPath === "/admin" || currentPath === "/admin/";
  const isCategorias = currentPath.startsWith("/admin/categorias");
  const isSubcategorias = currentPath.startsWith("/admin/subcategorias");
  const isProductos = currentPath.startsWith("/admin/productos");
  const isTutoriales = currentPath.startsWith("/admin/tutoriales");
  const isTutCategorias = currentPath.startsWith("/admin/tutoriales/categorias");
  const isTutSubcategorias = currentPath.startsWith("/admin/tutoriales/subcategorias");
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - Heat Factory Admin</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="bg-gray-100 flex h-screen overflow-hidden text-gray-800"> ${renderComponent($$result, "ToasterSetup", ToasterSetup, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/ToasterSetup.tsx", "client:component-export": "default" })}  <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col h-full hidden md:flex border-r border-slate-800 shadow-xl"> <div class="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800"> <span class="text-lg font-bold tracking-wider text-white flex items-center"> <svg class="w-6 h-6 mr-2 text-[#f04f23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
HF ADMIN
</span> </div> <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto"> <a href="/admin"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium ${isDashboard ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${isDashboard ? "text-white" : "text-slate-400"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
Dashboard
</a> <div class="pt-4 pb-1"> <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catálogo</p> </div> <a href="/admin/categorias"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${isCategorias ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${isCategorias ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
Categorías
</a> <a href="/admin/subcategorias"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${isSubcategorias ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${isSubcategorias ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
Subcategorías
</a> <a href="/admin/productos"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${isProductos ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${isProductos ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
Productos
</a> <div class="pt-4 pb-1"> <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contenido Público</p> </div> <a href="/admin/servicios"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${currentPath.startsWith("/admin/servicios") ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${currentPath.startsWith("/admin/servicios") ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
Servicios
</a> <a href="/admin/proyectos"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${currentPath.startsWith("/admin/proyectos") ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${currentPath.startsWith("/admin/proyectos") ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
Proyectos
</a> <a href="/admin/tutoriales"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${isTutoriales && !isTutCategorias && !isTutSubcategorias ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${isTutoriales ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
Tutoriales
</a> ${isTutoriales && renderTemplate`<div class="ml-4 pl-3 border-l border-slate-700 space-y-0.5"> <a href="/admin/tutoriales/categorias"${addAttribute(`flex items-center px-3 py-2 rounded-md transition-colors text-[11px] font-medium group ${isTutCategorias ? "text-[#f04f23]" : "text-slate-400 hover:text-white hover:bg-slate-800"}`, "class")}>
Categorías
</a> <a href="/admin/tutoriales/subcategorias"${addAttribute(`flex items-center px-3 py-2 rounded-md transition-colors text-[11px] font-medium group ${isTutSubcategorias ? "text-[#f04f23]" : "text-slate-400 hover:text-white hover:bg-slate-800"}`, "class")}>
Subcategorías
</a> </div>`} <div class="pt-4 pb-1"> <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gestión</p> </div> <a href="/admin/reclamaciones"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${currentPath.startsWith("/admin/reclamaciones") ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${currentPath.startsWith("/admin/reclamaciones") ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
Reclamaciones
</a> <a href="/admin/suscriptores"${addAttribute(`flex items-center px-3 py-2.5 rounded-md transition-colors text-[12px] font-medium group ${currentPath.startsWith("/admin/suscriptores") ? "bg-[#f04f23] text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`, "class")}> <svg${addAttribute(`w-5 h-5 mr-3 ${currentPath.startsWith("/admin/suscriptores") ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`, "class")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
Boletín
</a> </nav> </aside>  <div class="flex-1 flex flex-col h-full overflow-hidden">  <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6 lg:px-10 z-10"> <div class="flex items-center">  <button class="md:hidden mr-4 text-gray-500 hover:text-gray-700"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg> </button> <div class="flex items-center text-sm text-gray-500 font-medium"> <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> <span class="text-gray-400 mx-2">/</span> <span class="text-gray-800">Panel de Administración</span> </div> </div> <div class="flex items-center space-x-4"> <span class="text-sm font-medium text-gray-600">Admin</span> <div class="w-8 h-8 rounded-full bg-[#f04f23] flex items-center justify-center text-white font-bold">
A
</div> </div> </header>  <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 lg:p-10"> ${renderSlot($$result, $$slots["default"])} </main> </div> </body></html>`;
}, "D:/Proyectos/heatperu/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $ };
