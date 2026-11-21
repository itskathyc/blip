import { useEffect, useRef, useState } from 'react';
import Slide from '../Slide/Slide';
import './StoryStrip.css';

// 위계 없는 Finder: 묶음도, 이름표도 없이 칸만 셋.
// 칸 안의 미리보기를 누르면 바로 오른쪽 칸에 "그것과 가까운 것들"이 열리고, 계속 누르면 계속 깊어짐.
// 셋을 넘어가면 왼쪽 칸이 밀려나고, 맨 왼쪽의 ‹ 로 한 칸씩 되돌아감

function Thumb({ tile, cur, seen, onSelect }) {
  return (
    <button className={'fd-thumb' + (cur ? ' cur' : '')} onClick={onSelect} title={tile.title}
      draggable onDragStart={e => { e.dataTransfer.setData('text/blip-tile', tile.key); e.dataTransfer.effectAllowed = 'copy'; }}>
      <span className="fd-scale"><Slide layer={tile.cover} /></span>
      {!seen && <i className="fd-new" aria-label="새 제안" />}
    </button>
  );
}

function AlgoButton({ focus }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = e => { if (!ref.current.contains(e.target)) setOpen(false); };
    addEventListener('pointerdown', close);
    return () => removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <div className="algo" ref={ref}>
      <button className="algo-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>알고리즘 설정</button>
      {open && (
        <div className="algo-pop" role="dialog" aria-label="알고리즘 설정">
          <b>지금 기준</b>
          <p>{focus ? `첫 칸은 내 판의 ‘${focus.label}’ 쪽부터` : '첫 칸은 기본 순서'}, 다음 칸부터는 고른 것과 가까운 순서예요</p>
        </div>
      )}
    </div>
  );
}

export default function StoryStrip({ columns, start, seen, focus, query, onSelect, onBack, onClearQuery }) {
  const shown = [0, 1, 2].map(i => columns[start + i]);
  return (
    <div className="strip-wrap" aria-label="제안">
      {shown.map((col, i) => (
        <div className="fd-col" key={i}>
          {col && (
            <div className="fd-grid" key={col.from || 'root'}>
              {i === 0 && start === 0 && query && (
                <button className="qchip" onClick={onClearQuery} title="검색 지우기">‘{query}’ <span aria-hidden="true">×</span></button>
              )}
              {col.items.map(t => (
                <Thumb key={t.key} tile={t} cur={t.key === col.sel} seen={seen.has(t.key)} onSelect={() => onSelect(start + i, t)} />
              ))}
            </div>
          )}
        </div>
      ))}
      {start > 0 && <button className="fd-back" onClick={onBack} aria-label="한 칸 뒤로">‹</button>}
      <AlgoButton focus={focus} />
    </div>
  );
}
