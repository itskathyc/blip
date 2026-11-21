import { useEffect, useState } from 'react';
import { Cover } from '../FlowStrip/FlowStrip';
import './BlipHistory.css';

// 히스토리 전경: 띠를 끌어내리면 화면 전체가 사진 앱의 연·월·일처럼 줌아웃.
// 맨 바깥 = .blip들 (행동이 맥락으로 묶인 것). 하나를 열면 그 안의 차례들, 차례마다 내가 한 것 → 블립의 답 3개.
// 되돌아가지 않음: 무엇이든 "불러오기"를 누르면 띠에 새 차례로 다시 흘러 들어옴
function Act({ act, tileByKey, turns }) {
  if (act.type === 'pick') {
    const t = tileByKey(act.key);
    return t ? <span className="bh-act tile"><Cover tile={t} w={44} /></span> : null;
  }
  if (act.type === 'search') return <span className="bh-act word">‘{act.q}’</span>;
  if (act.type === 'title') return <span className="bh-act word">{act.q}</span>;
  if (act.type === 'recall') {
    const of = turns.find(t => t.id === act.of);
    return <span className="bh-act glyph" title="다시 불러옴">↻{of && <Act act={of.act} tileByKey={tileByKey} turns={turns} />}</span>;
  }
  return <span className="bh-act glyph">{act.type === 'import' ? '+' : '✦'}</span>;
}

export default function BlipHistory({ turns, tileByKey, onRecall, onRecallMany, onClose }) {
  const [open, setOpen] = useState(null); // 연 .blip의 이름
  useEffect(() => {
    const key = e => { if (e.key === 'Escape') (open ? setOpen(null) : onClose()); };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [open, onClose]);

  // 맥락별로 묶기 (처음 생긴 순서)
  const blips = [];
  turns.forEach(t => {
    let b = blips.find(x => x.name === t.ctx);
    if (!b) blips.push(b = { name: t.ctx, turns: [] });
    b.turns.push(t);
  });
  const clicks = turns.filter(t => t.act.type !== 'start').length;
  const cur = open && blips.find(b => b.name === open);

  return (
    <div className="bh" role="dialog" aria-label="히스토리" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      {!cur ? (
        <div className="bh-in" key="all">
          <header className="bh-head">
            <span className="bh-count"><b>{clicks}</b>번의 행동 · <b>{blips.length}</b>개의 .blip</span>
            <button className="bh-load" onClick={() => onRecallMany(turns)}>전체 불러오기</button>
            <button className="bh-x" onClick={onClose} aria-label="닫기">×</button>
          </header>
          <div className="bh-grid">
            {blips.map(b => {
              const covers = [...new Set(b.turns.flatMap(t => t.items))].slice(0, 3).map(tileByKey).filter(Boolean);
              return (
                <button key={b.name} className="bh-blip" onClick={() => setOpen(b.name)}>
                  <span className="bh-fan">
                    {covers.map((t, k) => <span key={t.key} className="bh-fc" style={{ '--k': k }}><Cover tile={t} w={96} /></span>)}
                  </span>
                  <b className="bh-name">{b.name}<em>.blip</em></b>
                  <span className="bh-meta">차례 {b.turns.length} · {b.turns[0].when}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bh-in zoom" key={cur.name}>
          <header className="bh-head">
            <button className="bh-back" onClick={() => setOpen(null)} aria-label="모든 .blip">‹</button>
            <b className="bh-title">{cur.name}<em>.blip</em></b>
            <button className="bh-load" onClick={() => onRecallMany(cur.turns)}>이 .blip 불러오기</button>
            <button className="bh-x" onClick={onClose} aria-label="닫기">×</button>
          </header>
          <ol className="bh-turns">
            {cur.turns.map(t => (
              <li key={t.id} className="bh-turn">
                <span className="bh-when">{t.when}</span>
                <Act act={t.act} tileByKey={tileByKey} turns={turns} />
                <span className="bh-arrow" aria-hidden="true">→</span>
                <span className="bh-ans">
                  {t.items.map(tileByKey).filter(Boolean).map(x => <span key={x.key} className="bh-at" title={x.title}><Cover tile={x} w={64} /></span>)}
                </span>
                <button className="bh-re" onClick={() => onRecall(t)}>다시 불러오기</button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
