
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryPoint } from '../types';

interface PriceChartProps {
  data: HistoryPoint[];
  isPositive: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, isPositive }) => {
  if (!data || data.length === 0) return null;

  const color = isPositive ? '#10b981' : '#f43f5e'; // emerald-500 or rose-500
  
  // Find min/max for better axis scaling
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;

  return (
    <div className="w-full h-[240px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            hide={true} 
            domain={[minPrice, maxPrice]} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f8fafc'
            }}
            itemStyle={{ color: '#f8fafc' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
