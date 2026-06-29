import { c as createComponent } from './astro-component_Fi3nDOqY.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute, p as Fragment$1 } from './entrypoint_1qPj0QrW.mjs';
import { $ as $$AdminLayout } from './AdminLayout_DmcyynTj.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { p as products, d as db, s as subcategories } from './index_B4lP7dzv.mjs';
import { or, ilike, count, desc, eq } from 'drizzle-orm';

function DeleteProductButton({ id, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/productos/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el producto");
      }
      toast.success("Producto eliminado correctamente");
      setTimeout(() => {
        window.location.reload();
      }, 1e3);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "p-1.5 text-red-600 hover:text-red-900 bg-red-50 rounded transition-colors flex items-center justify-center cursor-pointer",
        title: "Eliminar Producto",
        children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm whitespace-normal text-left", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up", children: /* @__PURE__ */ jsxs("div", { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "¿Eliminar producto?" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 mb-6 space-y-2", children: [
        /* @__PURE__ */ jsx("p", { children: "Estás a punto de eliminar el producto:" }),
        /* @__PURE__ */ jsxs("p", { className: "font-medium text-gray-900 break-words text-base", children: [
          '"',
          name,
          '"'
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs", children: "Esta acción no se puede deshacer." })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "mb-4 bg-red-50 text-red-600 p-2 rounded text-xs", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex space-x-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            disabled: loading,
            className: "flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDelete,
            disabled: loading,
            className: `flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer ${loading ? "opacity-70 cursor-not-allowed" : ""}`,
            children: loading ? "Eliminando..." : "Sí, Eliminar"
          }
        )
      ] })
    ] }) }) })
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const pageParam = Astro2.url.searchParams.get("page");
  const searchQuery = Astro2.url.searchParams.get("search") || "";
  const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const conditions = searchQuery ? or(
    ilike(products.name, `%${searchQuery}%`),
    ilike(products.sku, `%${searchQuery}%`),
    ilike(products.brand, `%${searchQuery}%`),
    ilike(products.model, `%${searchQuery}%`)
  ) : void 0;
  const totalItemsResult = await db.select({ value: count() }).from(products).where(conditions);
  const totalItems = totalItemsResult[0].value;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  function getPagination(currentPage, totalPages2) {
    if (totalPages2 <= 7) return Array.from({ length: totalPages2 }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages2];
    if (currentPage >= totalPages2 - 3) return [1, "...", totalPages2 - 4, totalPages2 - 3, totalPages2 - 2, totalPages2 - 1, totalPages2];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages2];
  }
  const paginationRange = getPagination(page, totalPages);
  const allSubcategories = await db.select().from(subcategories).orderBy(desc(subcategories.id));
  const dbProducts = await db.select({
    product: products,
    subcategoryName: subcategories.name
  }).from(products).leftJoin(subcategories, eq(products.subcategoryId, subcategories.id)).where(conditions).orderBy(desc(products.id)).limit(limit).offset(offset);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Gestión de Productos | Heat Factory" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-5"> <h2 class="text-xl font-bold text-[#0d1624]">Gestión de Productos</h2> <p class="mt-1 text-[13px] text-gray-500">Agrega, edita o elimina los productos de tu catálogo.</p> </div> <div class="bg-white shadow rounded-lg border border-gray-100 overflow-hidden"> <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4"> <h3 class="text-base font-semibold text-slate-800 whitespace-nowrap">Productos Actuales (${totalItems})</h3> <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto"> <form method="GET" action="/admin/productos" class="w-full sm:w-72 relative"> <input type="text" name="search"${addAttribute(searchQuery, "value")} placeholder="Buscar producto, SKU, marca..." class="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f04f23] focus:ring-1 focus:ring-[#f04f23] transition-colors"> <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> ${searchQuery && renderTemplate`<a href="/admin/productos" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-0.5 transition-colors"> <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> </a>`} </form> ${renderComponent($$result2, "CreateProductModal", null, { "subcategories": allSubcategories, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/CreateProductModal.tsx", "client:component-export": "default" })} </div> </div> <div class="p-0"> ${dbProducts.length === 0 ? renderTemplate`<p class="text-gray-500 text-sm p-6 text-center">No hay productos registrados aún. ¡Añade el primero!</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate` <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200"> <thead class="bg-gray-50"> <tr> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">Imagen</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Producto</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Detalles</th> <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Estado</th> <th scope="col" class="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Acciones</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-100"> ${dbProducts.map(({ product, subcategoryName }) => renderTemplate`<tr class="hover:bg-gray-50/50 transition-colors"> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="flex-shrink-0 h-10 w-10 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center p-1 shadow-sm"> ${product.imageUrl && product.imageUrl !== "/placeholder.png" ? renderTemplate`<img${addAttribute(product.imageUrl, "src")}${addAttribute(product.name, "alt")} class="h-full w-full object-contain">` : renderTemplate`<svg class="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>`} </div> </td> <td class="px-5 py-2.5"> <div class="text-[12px] font-semibold text-slate-700">${product.name}</div> <div class="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">${subcategoryName}</div> </td> <td class="px-5 py-2.5 whitespace-nowrap"> <div class="text-[11px] text-gray-600"><span class="font-medium text-gray-400">SKU:</span> ${product.sku || "-"}</div> <div class="text-[11px] text-gray-600"><span class="font-medium text-gray-400">Marca:</span> ${product.brand || "-"}</div> </td> <td class="px-5 py-2.5 whitespace-nowrap"> ${product.isAvailable ? renderTemplate`<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
Disponible
</span>` : renderTemplate`<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
Agotado
</span>`} </td> <td class="px-5 py-2.5 whitespace-nowrap text-right text-sm font-medium"> <div class="flex justify-end gap-3"> ${renderComponent($$result3, "EditProductModal", null, { "product": {
    id: product.id,
    name: product.name,
    subcategoryId: product.subcategoryId,
    sku: product.sku,
    brand: product.brand,
    model: product.model || void 0,
    description: product.description || void 0,
    isAvailable: product.isAvailable,
    imageUrl: product.imageUrl,
    galleryUrls: product.galleryUrls,
    pdfUrl: product.pdfUrl || void 0
  }, "subcategories": allSubcategories, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/EditProductModal.tsx", "client:component-export": "default" })} ${renderComponent($$result3, "DeleteProductButton", DeleteProductButton, { "id": product.id, "name": product.name, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/DeleteProductButton.tsx", "client:component-export": "default" })} </div> </td> </tr>`)} </tbody> </table> </div> ${totalPages > 1 && renderTemplate`<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-4"> <div class="text-sm text-gray-500">
Mostrando <span class="font-medium">${offset + 1}</span> a <span class="font-medium">${Math.min(offset + limit, totalItems)}</span> de <span class="font-medium">${totalItems}</span> productos
</div> <div class="flex items-center gap-1.5"> <a${addAttribute(page > 1 ? `?page=${page - 1}${searchParam}` : "#", "href")}${addAttribute(`flex items-center justify-center w-8 h-8 rounded-md border text-sm transition-all duration-300 ${page > 1 ? "bg-white border-gray-200 text-gray-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 shadow-sm hover:-translate-y-0.5" : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none"}`, "class")} aria-label="Página anterior"> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="15 18 9 12 15 6"></polyline> </svg> </a> <div class="flex items-center gap-1"> ${paginationRange.map((p, index) => {
    if (p === "...") {
      return renderTemplate`<span class="w-8 h-8 flex items-center justify-center text-gray-400 font-serif tracking-widest text-sm">...</span>`;
    }
    const isCurrent = p === page;
    return renderTemplate`<a${addAttribute(`?page=${p}${searchParam}`, "href")}${addAttribute(`w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-medium transition-all duration-300 ${isCurrent ? "bg-[#f04f23] text-white shadow-[0_2px_8px_rgba(240,79,35,0.35)] hover:-translate-y-0.5" : "bg-white border border-gray-200 text-gray-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm hover:-translate-y-0.5"}`, "class")}${addAttribute(isCurrent ? "page" : void 0, "aria-current")}> ${p} </a>`;
  })} </div> <a${addAttribute(page < totalPages ? `?page=${page + 1}${searchParam}` : "#", "href")}${addAttribute(`flex items-center justify-center w-8 h-8 rounded-md border text-sm transition-all duration-300 ${page < totalPages ? "bg-white border-gray-200 text-gray-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 shadow-sm hover:-translate-y-0.5" : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none"}`, "class")} aria-label="Página siguiente"> <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="9 18 15 12 9 6"></polyline> </svg> </a> </div> </div>`}` })}`} </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/productos/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/productos/index.astro";
const $$url = "/admin/productos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
