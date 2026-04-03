import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { BudgetBreakdown } from '../types';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#06b6d4','#a78bfa'];

export default function BudgetPie({ b }:{ b: BudgetBreakdown }) {
  const data = [
    { name: 'Перелёты', value: b.flights },
    { name: 'Жильё', value: b.lodging },
    { name: 'Еда', value: b.food },
    { name: 'Местное', value: b.local },
    { name: 'Резерв', value: b.buffer },
  ];
  return (
    <div className="card" style={{ height: 360 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60}>
            {data.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
