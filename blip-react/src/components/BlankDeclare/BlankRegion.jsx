import { useState } from 'react';
import { actionsFor } from './actions';

// 그리는 동안은 드래그한 크기 그대로의 선택 사각형. 놓으면 그 자리에 내용만큼의 작은 판(card, 기존의 1/2 크기)
export default function BlankRegion({ region, context, onClose, onNewItem, onFill, onSubmit }) {
  const [mode, setMode] = useState(region.startMode || 'icons'); // 우클릭 메뉴에서 '새로 만들기'를 골랐으면 바로 이름 적기
  const [picked, setPicked] = useState(null);
  const [v, setV] = useState('');
  const card = region.done && !region.compact; // 놓은 빈칸 = 내용만큼의 작은 판 (빈 공간 없음)
  const ctx = region.context || context; // 컴포넌트를 꾹 눌러 연 빈칸이면 그 컴포넌트에 맞춘 3가지
  const style = card ? { left: region.x, top: region.y, '--k': .5 } : { left: region.x, top: region.y, width: region.w, height: region.h, '--k': 1 };

  if (!region.done) return <div className="rg" style={style} />;

  const onKeyDown = e => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();
    const q = v.trim();
    if (!q) return;
    if (mode === 'new') onNewItem(q, region); else onSubmit(q);
  };

  return (
    <div className={'rg done' + (card ? ' card' : '') + (mode === 'new' ? ' newmode' : '') + (region.compact ? ' compact' : region.context === 'component' ? ' around' : '')} style={style}>
      <button className="rx" onClick={onClose} title="닫기" aria-label="닫기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
      </button>
      {mode === 'icons'
        ? (
          <div className="ri">
            {actionsFor(ctx).map(a => (
              <button key={a.k} className={'ic' + (picked === a.k ? ' on' : '')} title={a.t}
                onClick={() => {
                  if (a.k === 'new') { setMode('new'); setV(''); }
                  else if (a.k === 'find') setV(region.subject || ''); // 이 컴포넌트의 이름을 채워 두고, Enter면 찾기
                  else if (a.k === 'drawkit') onNewItem(a.t, region, 'kit'); // 고르면 바로 그 자리에 놓이고, 지울 때까지 남음
                  else if (a.k === 'fill') onFill(region); // 그 빈 장이 블립의 제안 콘텐츠로 채워짐
                  else setPicked(p => (p === a.k ? null : a.k));
                }}>
                <img src={a.src} alt="" />
                <span className="icl">{a.s || a.t}</span>
              </button>
            ))}
          </div>
        )
        : <div className="rnew">{region.compact ? '새 아이템' : '새로운 아이템선언'}</div>}
      <input key={mode} autoFocus placeholder={mode === 'new' ? '이름' : region.compact ? '적거나 고르기' : '무엇이든 적거나, 아래에서 고르기'} value={v} onChange={e => setV(e.target.value)} onKeyDown={onKeyDown} spellCheck="false" aria-label="입력" />
    </div>
  );
}
