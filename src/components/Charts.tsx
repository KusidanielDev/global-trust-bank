"use client";
import { useMemo, useState } from "react";
type Point = { name: string; value: number };

export function SpendingPie({ data }:{ data: Point[] }) {
  const total = useMemo(() => data.reduce((s,d)=>s+d.value,0), [data]);
  const [active, setActive] = useState<number | null>(null);
  const COLORS = ["#2563eb","#9333ea","#059669","#ea580c","#ef4444","#22c55e","#eab308","#06b6d4","#6366f1"];
  const radius = 80, cx = 100, cy = 100;
  let cumulative = 0;
  function arcPath(value:number){
    const start = (cumulative/total)*2*Math.PI; cumulative += value;
    const end = (cumulative/total)*2*Math.PI;
    const largeArc = end - start > Math.PI ? 1 : 0;
    const x1 = cx + radius*Math.cos(start), y1 = cy + radius*Math.sin(start);
    const x2 = cx + radius*Math.cos(end),   y2 = cy + radius*Math.sin(end);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }
  cumulative = 0;
  return (
    <div className="w-full">
      <svg viewBox="0 0 200 200" className="mx-auto block" style={{maxWidth:260}} role="img" aria-label="Spending by category">
        <title>Spending by category</title>
        {data.map((d,i)=> {
          const path = arcPath(d.value);
          const isActive = active===i;
          return (
            <path key={i} d={path} fill={COLORS[i%COLORS.length]}
              transform={isActive ? "scale(1.05) translate(-5,-5)" : undefined}
              style={{ transformOrigin: "100px 100px", transition: "transform .25s ease" }}
              onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(null)}>
              <title>{`${d.name}: ${((d.value/total)*100).toFixed(1)}%`}</title>
            </path>
          );
        })}
        <circle cx={100} cy={100} r={48} fill="#fff" />
        <text x={100} y={100} textAnchor="middle" dominantBaseline="middle" className="fill-gray-900" style={{fontSize:12,fontWeight:700}}>
          {total.toLocaleString()}
        </text>
      </svg>
    </div>
  );
}

export function BalanceArea({ data }:{ data: Point[] }) {
  const w = 320, h = 160, pad = 20;
  const max = Math.max(...data.map(d=>d.value), 1);
  const min = Math.min(...data.map(d=>d.value), 0);
  const range = Math.max(max-min, 1);
  const pts = data.map((d,i)=>{
    const x = pad + (i*(w-2*pad))/Math.max(1,data.length-1);
    const y = h - pad - ((d.value-min)*(h-2*pad)/range);
    return [x,y] as const;
  });
  const dPath = pts.map((p,i)=> i?`L ${p[0]} ${p[1]}`:`M ${p[0]} ${p[1]}`).join(" ");
  const area = `${dPath} L ${pad} ${h-pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={w} height={h} fill="white" rx="12" />
      <g stroke="#e5e7eb">
        <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} />
        <line x1={pad} y1={pad} x2={pad} y2={h-pad} />
      </g>
      <path d={area} fill="url(#areaFill)" />
      <path d={dPath} stroke="#2563eb" fill="none" strokeWidth="2" />
      {pts.length>0 && <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill="#2563eb" />}
    </svg>
  );
}

export function CashflowArea({ data }:{ data: Point[] }) {
  return (BalanceArea as any)({ data }) as any;
}
