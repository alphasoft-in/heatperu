import { c as createComponent } from './astro-component_HpNPC3Xv.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_DSH4zfPn.mjs';
import { $ as $$AdminLayout } from './AdminLayout_4TuxC3_o.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { d as db, c as categories, s as subcategories, p as products, b as complaints } from './index_DB2r2R9w.mjs';
import { sql } from 'drizzle-orm';

function CategoryVisitsChart({ data }) {
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500", children: "No hay datos suficientes para mostrar el gráfico." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-80 bg-white p-4 rounded-lg shadow-sm border border-slate-100", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-800 mb-6 px-2", children: "Visitas por Categoría" }),
    /* @__PURE__ */ jsx("div", { style: { width: "100%", height: "250px" }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
      LineChart,
      {
        data,
        margin: {
          top: 5,
          right: 20,
          left: 0,
          bottom: 5
        },
        children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#e2e8f0" }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "name",
              axisLine: false,
              tickLine: false,
              tick: { fill: "#64748b", fontSize: 12 },
              dy: 10
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              axisLine: false,
              tickLine: false,
              tick: { fill: "#64748b", fontSize: 12 }
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
              itemStyle: { color: "#0d1624", fontWeight: "bold" }
            }
          ),
          /* @__PURE__ */ jsx(
            Line,
            {
              type: "monotone",
              dataKey: "visits",
              name: "Visitas",
              stroke: "#f04f23",
              strokeWidth: 3,
              dot: { r: 4, fill: "#f04f23", strokeWidth: 2, stroke: "#fff" },
              activeDot: { r: 6, fill: "#f04f23", stroke: "#fff", strokeWidth: 2 }
            }
          )
        ]
      }
    ) }) })
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const catCount = await db.select({ count: sql`count(*)` }).from(categories);
  const subcatCount = await db.select({ count: sql`count(*)` }).from(subcategories);
  const prodCount = await db.select({ count: sql`count(*)` }).from(products);
  const complaintsCount = await db.select({ count: sql`count(*)` }).from(complaints).where(sql`date_trunc('month', ${complaints.createdAt}) = date_trunc('month', current_date)`);
  const categoryVisits = await db.select({
    name: categories.name,
    visits: categories.visits
  }).from(categories);
  const stats = [
    { name: "Categorías", stat: catCount[0].count, icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", href: "/admin/categorias" },
    { name: "Subcategorías", stat: subcatCount[0].count, icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", href: "/admin/subcategorias" },
    { name: "Productos", stat: prodCount[0].count, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", href: "/admin/productos" },
    { name: "Reclamos del Mes", stat: complaintsCount[0].count, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", href: "/admin/reclamaciones" }
  ];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-8"> <h2 class="text-2xl font-bold text-gray-900">Bienvenido al Panel de Control</h2> <p class="mt-1 text-sm text-gray-500">Aquí puedes gestionar todo el catálogo de Heat Factory.</p> </div> <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10"> ${stats.map((item) => renderTemplate`<div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100 relative group"> <div class="p-5"> <div class="flex items-center"> <div class="flex-shrink-0 bg-[#f04f23] rounded-md p-3"> <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${addAttribute(item.icon, "d")}></path> </svg> </div> <div class="ml-5 w-0 flex-1"> <dl> <dt class="text-sm font-medium text-gray-500 truncate">${item.name}</dt> <dd> <div class="text-3xl font-medium text-gray-900">${item.stat}</div> </dd> </dl> </div> </div> </div> <div class="bg-gray-50 px-5 py-3 border-t border-gray-100"> <div class="text-sm"> <a${addAttribute(item.href, "href")} class="font-medium text-[#0d1624] hover:text-[#f04f23] flex items-center">
Gestionar
<svg class="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a> </div> </div> </div>`)} </div> <div class="mb-10"> ${renderComponent($$result2, "CategoryVisitsChart", CategoryVisitsChart, { "client:load": true, "data": categoryVisits, "client:component-hydration": "load", "client:component-path": "D:/Proyectos/heatperu/src/components/admin/CategoryVisitsChart", "client:component-export": "default" })} </div> <div class="mt-10 bg-white shadow rounded-lg border border-gray-100 p-6"> <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3> <div class="flex flex-wrap gap-4"> <a href="/admin/categorias" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0d1624] hover:bg-gray-800 focus:outline-none">
Nueva Categoría
</a> <a href="/admin/subcategorias" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0d1624] hover:bg-gray-800 focus:outline-none">
Nueva Subcategoría
</a> <a href="/admin/productos" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#f04f23] hover:bg-[#d0421c] focus:outline-none">
Nuevo Producto
</a> <a href="/admin/tutoriales" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-[#f04f23] bg-orange-50 hover:bg-orange-100 border-[#f04f23]/20 focus:outline-none">
Nuevo Tutorial
</a> </div> </div> ` })}`;
}, "D:/Proyectos/heatperu/src/pages/admin/index.astro", void 0);

const $$file = "D:/Proyectos/heatperu/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
