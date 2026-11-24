import { useRef } from 'react';
import { KARINA_PLACES } from '../../data/karina';
import './MiniWin.css';

// 작은 새 창: 검색 결과를 페이지로 넘기지 않고 지금 화면 위에 띄움. 제목줄을 끌면 옮겨지고, − 를 누르면 바로 사라짐
export default function MiniWin({ win, onMove, onClose }) {
  const grab = useRef(null);
  const down = e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    e.preventDefault(); e.stopPropagation();
    grab.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    const move = ev => onMove(win.id, ev.clientX - grab.current.x, ev.clientY - grab.current.y);
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  };
  return (
    <div className="mw" style={{ left: win.x, top: win.y }} role="dialog" aria-label={win.title} onPointerDown={e => e.stopPropagation()}>
      <div className="mw-bar" onPointerDown={down}>
        <b>{win.title}</b>
        <button className="mw-x" onClick={() => onClose(win.id)} aria-label="창 닫기" title="닫기">−</button>
      </div>
      <div className="mw-body">
        {KARINA_PLACES.map((pl, k) => (
          <article key={pl.name} className="mw-place">
            <h4><span>{k + 1}</span>{pl.name}</h4>
            {pl.body && <p>{pl.body}</p>}
            {pl.facts && <dl>{pl.facts.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>}
          </article>
        ))}
      </div>
    </div>
  );
}
