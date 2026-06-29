import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$Layout, H as Header } from './Header_BHTxsR1r.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", Header, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/Header.tsx", "client:component-export": "default" })} ${maybeRenderHead()}<main class="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-16"> <div class="max-w-xl w-full text-center"> <div class="mb-10"> <h1 class="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f04f23] to-[#d03d15] mb-4">404</h1> <h2 class="text-3xl font-bold text-gray-900 mb-4">¡Ups! Página no encontrada</h2> <p class="text-gray-600 text-lg mb-8 max-w-md mx-auto">
Parece que la página que estás buscando no existe, ha sido movida o está temporalmente inactiva.
</p> </div> <a href="/" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white bg-[#f04f23] hover:bg-[#d03d15] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd"></path> </svg>
Volver al inicio
</a> </div> </main> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/404.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
