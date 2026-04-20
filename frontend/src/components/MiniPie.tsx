import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#06b6d4', '#a78bfa'];

export default function MiniPie({ data }:{ data: {name:string; value:number}[] }){
  return (
    <div style={{ width: 80, height: 80 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={36} innerRadius={18} strokeWidth={0}>
            {data.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}