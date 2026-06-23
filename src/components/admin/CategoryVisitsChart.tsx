import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface CategoryData {
  name: string;
  visits: number;
}

interface Props {
  data: CategoryData[];
}

export default function CategoryVisitsChart({ data }: Props) {
  // If no data, show a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500">
        No hay datos suficientes para mostrar el gráfico.
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-6 px-2">Visitas por Categoría</h3>
      <div style={{ width: '100%', height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0d1624', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="visits" 
              name="Visitas"
              stroke="#f04f23" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#f04f23', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 6, fill: '#f04f23', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
