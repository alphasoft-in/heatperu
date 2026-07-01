import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComplaintData {
  createdAt: Date;
  type: string;
}

interface ComplaintChartProps {
  data: {
    createdAt: string;
    type: string;
  }[];
}

export default function ComplaintChart({ data }: ComplaintChartProps) {
  const chartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Initialize current year months
    const grouped = new Map<string, { name: string; reclamos: number; quejas: number }>();
    
    data.forEach(item => {
      const date = new Date(item.createdAt);
      const monthStr = months[date.getMonth()];
      const yearStr = date.getFullYear().toString();
      const key = `${monthStr} ${yearStr}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, { name: key, reclamos: 0, quejas: 0 });
      }
      
      const current = grouped.get(key)!;
      if (item.type === 'Reclamo') {
        current.reclamos += 1;
      } else {
        current.quejas += 1;
      }
    });

    // Convert map to array and sort by actual date
    return Array.from(grouped.values()).reverse(); // Since data is usually sorted desc, we reverse it to show chronological order
  }, [data]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Estadísticas Mensuales</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="reclamos" name="Reclamos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="quejas" name="Quejas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
