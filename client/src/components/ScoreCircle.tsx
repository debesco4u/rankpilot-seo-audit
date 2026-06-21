interface Props { score: number; size?: number; }
export default function ScoreCircle({ score, size=120 }: Props) {
  const color = score>=80?'#22c55e':score>=50?'#eab308':'#ef4444';
  const r=size/2-8; const circ=2*Math.PI*r; const offset=circ-(score/100)*circ;
  return (
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transition:'stroke-dashoffset 1s ease'}} />
      <text x={size/2} y={size/2+8} textAnchor="middle" fill={color}
        fontSize={size*0.3} fontWeight="bold" style={{transform:'rotate(90deg)',transformOrigin:'center'}}>{score}</text>
    </svg>
  );
}
