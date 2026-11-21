import { useState } from 'react';
import { ACTIONS } from './actions';

// 드래그한 크기 그대로의 점선 영역. 안의 아이콘·입력·X는 --k(기준 500×290 대비 비율)로 함께 줄어듦
export default function BlankRegion({ region, onClose, onNewItem, onSubmit }) {
  const [mode, setMode] = useState('icons');
  const [picked, setPicked] = useState(null);
  const [v, setV] = useState('');
  const k = region.done ? Math.min(region.w / 500, region.h / 290) : 1;
  const style = { left: region.x, top: region.y, width: region.w, height: region.h, '--k': k };

  if (!region.done) return <div className="rg" style={style} />;

  const onKeyDown = e => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();
    const q = v.trim();
    if (!q) return;
    if (mode === 'new') onNewItem(q, region); else onSubmit(q);
  };

  return (
    <div className={'rg done' + (mode === 'new' ? ' newmode' : '')} style={style}>
      <button className="rx" onClick={onClose} title="닫기" aria-label="닫기">
        <svg viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="4.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {mode === 'icons'
        ? (
          <div className="ri">
            {ACTIONS.map(a => (
              <button key={a.k} className={'ic' + (picked === a.k ? ' on' : '')} title={a.t}
                onClick={() => (a.k === 'new' ? (setMode('new'), setV('')) : setPicked(p => (p === a.k ? null : a.k)))}>
                <img src={a.src} alt={a.t} />
              </button>
            ))}
          </div>
        )
        : <div className="rnew">새로운 아이템선언</div>}
      <input key={mode} autoFocus value={v} onChange={e => setV(e.target.value)} onKeyDown={onKeyDown} spellCheck="false" aria-label="입력" />
    </div>
  );
}
