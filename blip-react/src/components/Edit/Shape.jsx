// 드로잉키트로 그린 도형·선·펜 자국. 그리는 동안의 미리보기와 놓인 조각이 같은 그림을 씀
// w·h: 상자 크기, fx·fy: 선을 거꾸로 끌었는지(방향), pts: 펜·연필의 점들(상자 기준)

const STAR = (w, h) => Array.from({ length: 10 }, (_, i) => {
  const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? .19 : .5;
  return [w / 2 + Math.cos(a) * r * w * 1.0, h / 2 + Math.sin(a) * r * h * 1.05 + h * .03].join(',');
}).join(' ');

export const LINE_KINDS = new Set(['line', 'arrow', 'pen', 'pencil']);

export default function Shape({ shape, w, h, fx, fy, pts }) {
  w = Math.max(w, 1); h = Math.max(h, 1);
  const box = { width: w, height: h, viewBox: `0 0 ${w} ${h}`, overflow: 'visible', 'aria-hidden': true };
  if (shape === 'pen' || shape === 'pencil') {
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return <svg {...box}><path d={d} fill="none" stroke="currentColor" strokeWidth={shape === 'pen' ? 3 : 2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (shape === 'line' || shape === 'arrow') {
    const x1 = fx ? w : 0, y1 = fy ? h : 0, x2 = fx ? 0 : w, y2 = fy ? 0 : h;
    const a = Math.atan2(y2 - y1, x2 - x1), L = 14;
    const head = [[x2, y2], [x2 - L * Math.cos(a - .45), y2 - L * Math.sin(a - .45)], [x2 - L * Math.cos(a + .45), y2 - L * Math.sin(a + .45)]];
    return (
      <svg {...box}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {shape === 'arrow' && <polygon points={head.map(p => p.join(',')).join(' ')} fill="currentColor" />}
      </svg>
    );
  }
  if (shape === 'ellipse') return <svg {...box}><ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill="currentColor" /></svg>;
  if (shape === 'polygon') return <svg {...box}><polygon points={`${w / 2},0 ${w},${h} 0,${h}`} fill="currentColor" /></svg>;
  if (shape === 'star') return <svg {...box}><polygon points={STAR(w, h)} fill="currentColor" /></svg>;
  if (shape === 'frame') {
    return (
      <svg {...box}>
        <text x="0" y="-6" fontSize="11" fontWeight="600" fill="#8a8a8a">Frame</text>
        <rect width={w} height={h} fill="#fff" stroke="#d0d0d0" />
      </svg>
    );
  }
  return <svg {...box}><rect width={w} height={h} fill="currentColor" /></svg>;
}
