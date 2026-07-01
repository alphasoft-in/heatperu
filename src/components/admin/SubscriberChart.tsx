import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SubscriberChartProps {
  data: {
    createdAt: string;
    status: string;
  }[];
}

export default function SubscriberChart({ data }: SubscriberChartProps) {
  const chartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const grouped = new Map<string, { name: string; suscripciones: number }>();
    
    data.forEach(item => {
      const date = new Date(item.createdAt);
      const monthStr = months[date.getMonth()];
      const yearStr = date.getFullYear().toString();
      const key = `${monthStr} ${yearStr}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, { name: key, suscripciones: 0 });
      }
      
      const current = grouped.get(key)!;
      current.suscripciones += 1;
    });

    // Convert map to array and reverse to show chronological order
    return Array.from(grouped.values()).reverse();
  }, [data]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Crecimiento de Suscriptores</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSuscripciones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip 
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="suscripciones" 
              name="Suscripciones" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSuscripciones)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
