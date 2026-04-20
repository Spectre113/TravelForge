import React from 'react';


type Props = { label: string; value: number; onChange: (v:number)=>void };
export default function BudgetSlider({ label, value, onChange }: Props){
return (
<div className="card" style={{paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-md)', paddingLeft: 'var(--space-xl)', paddingRight: 'var(--space-xl)'}}>
<div className="label" style={{marginBottom:8}}>{label}: {value}%</div>
<input className="input" type="range" min={0} max={100} value={value} onChange={e=>onChange(Number(e.target.value))} />
</div>
);
}