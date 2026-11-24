import { useEffect, useRef, useState } from 'react';
import './Viewer.css';

const W = 390, H = 488;

// overlay: 콘텐츠 밖, 콘텐츠 테두리에 맞춰 붙는 버튼 자리(Remix 등). 잘리지도 축소되지도 않음
// 캐러셀 한 장(4:5)을 남은 공간에 맞게 그대로 축소. 안의 내용은 늘 390×488 기준으로 그려짐
// move: 콘텐츠를 위·아래로 밀 때 카드 전체(테두리 포함)가 움직이는 방향 — 'out-up' | 'in-up' | 'out-down' | 'in-down'
// resizable: 오른쪽 아래 모서리를 잡고 끌면 크기 바꾸기 (표시는 없음 — 그 모서리만 둥글지 않음). 두 번 누르면 원래대로
// size: 콘텐츠 틀의 크기(웹 1920×1080 · 모바일 · 태블릿 · 직접 입력). 틀이 그 비율이 되고, 390×488로 그린 콘텐츠는 그 안에 맞춰 가운데
// innerW: 안의 콘텐츠 폭 (웹형 장은 868). 틀은 따로 고르지 않으면 콘텐츠 그대로의 크기
// bg: 틀이 콘텐츠보다 클 때 남는 자리를 채울 색 (흰 여백 대신 지금 장의 배경색을 넓힘)
export default function Viewer({ children, overlay, move, resizable, size, innerW = W, bg }) {
  const FW = size?.w || innerW, FH = size?.h || H;
  const c = Math.min(FW / innerW, FH / H); // 틀 안에서 콘텐츠 배율
  const boxRef = useRef(null);
  const [fit, setFit] = useState(1);
  const [mine, setMine] = useState(null); // 사람이 정한 크기 (없으면 남은 자리에 맞춤)
  const grab = useRef(null);
  const scale = mine ? Math.min(mine, fit) : fit;

  useEffect(() => {
    const box = boxRef.current;
    const measure = () => setFit(Math.min(1.3 * innerW / FW, box.clientWidth / FW, box.clientHeight / FH));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [FW, FH, innerW]);

  return (
    <div className="viewer-box" ref={boxRef}>
      <div className={'viewer-frame' + (move ? ' mv-' + move : '') + (resizable ? ' sizable' : '') + (size ? ' sized' : '')} style={{ width: FW * scale, height: FH * scale }}>
        <div className="viewer" style={size && bg ? { background: bg } : undefined}>
          <div className="viewer-inner" style={size ? { transform: `translate(${(FW - innerW * c) / 2 * scale}px, ${(FH - H * c) / 2 * scale}px) scale(${scale * c})` } : { transform: `scale(${scale})` }}>{children}</div>
        </div>
        {overlay}
        {resizable && (
          <span className="vf-corner" aria-hidden="true"
            onPointerDown={e => {
              if (e.button !== 0) return;
              e.stopPropagation(); e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              grab.current = { x: e.clientX, y: e.clientY, s: scale };
            }}
            onPointerMove={e => {
              const g = grab.current;
              if (!g) return;
              // 가운데 정렬이라 모서리는 크기 변화의 절반만 움직임 → 두 배로 반영해 손을 따라오게
              const next = g.s + (e.clientX - g.x) / FW + (e.clientY - g.y) / FH;
              setMine(Math.max(.3, Math.min(fit, next)));
            }}
            onPointerUp={() => { grab.current = null; }} onPointerCancel={() => { grab.current = null; }}
            onDoubleClick={e => { e.stopPropagation(); setMine(null); }} />
        )}
      </div>
    </div>
  );
}
