import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Slide from '../Slide/Slide';
import './GptPanel.css';

export const GptMark = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.7">
      {[0, 60, 120, 180, 240, 300].map(a => <rect key={a} x="9.2" y="2.4" width="5.6" height="11" rx="2.8" transform={`rotate(${a} 12 12)`} />)}
    </g>
  </svg>
);

let mid = 0;

// 모달의 GPT 태그를 누르면: 모달이 길어지며 왼쪽 콘텐츠 옆에 붙어 대화창이 됨 (연동된 것처럼).
// 데모라 실제 GPT를 부르지 않고, 가진 재료(앱·빵집)에서 찾아 답함. 답 속 카드는 눌러서 왼쪽에서 보거나 오른쪽 아래로 끌어 담음
export default function GptPanel({ seed, from, answer, onOpen, onClose }) {
  const ref = useRef(null);
  const listRef = useRef(null);
  // 모달에 적어 둔 말이 첫 질문
  const [msgs, setMsgs] = useState(() => (seed ? [{ id: ++mid, me: true, text: seed }] : []));
  const [v, setV] = useState('');
  const [pending, setPending] = useState(() => ({ q: seed })); // 답을 기다리는 질문 (있으면 '입력 중' 점)

  // 모달 자리에서 시작해 옆으로 붙는 움직임 (FLIP)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const to = el.getBoundingClientRect();
    el.animate([
      { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, borderRadius: '22px' },
      { transform: 'none', borderRadius: '18px' }
    ], { duration: 420, easing: 'cubic-bezier(.2, 1, .3, 1)' });
  }, [from]);

  // 질문이 생기면 잠깐 뒤 답 (예약은 effect가 맡아서, 개발 모드의 이중 실행에도 답이 사라지지 않음)
  const answerRef = useRef(answer);
  answerRef.current = answer;
  useEffect(() => {
    if (!pending) return undefined;
    const t = setTimeout(() => {
      setMsgs(m => [...m, { id: ++mid, ...answerRef.current(pending.q) }]);
      setPending(null);
    }, 650);
    return () => clearTimeout(t);
  }, [pending]);

  const ask = q => {
    const text = q.trim();
    setMsgs(m => [...m, { id: ++mid, me: true, text }]);
    setPending({ q: text });
  };

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs, pending]);

  const send = () => { if (!v.trim()) return; ask(v); setV(''); };

  return (
    <aside className="gpt-panel" ref={ref} aria-label="ChatGPT">
      <header className="gpt-head">
        <span className="gpt-logo"><GptMark /></span>
        <b>ChatGPT</b>
        <span className="gpt-on">연결됨</span>
        <button className="gpt-x" onClick={onClose} aria-label="대화창 닫기" title="닫기">×</button>
      </header>
      <div className="gpt-list" ref={listRef}>
        {msgs.map(m => (
          <div key={m.id} className={'gpt-msg' + (m.me ? ' me' : '')}>
            <p>{m.text}</p>
            {m.tiles?.length > 0 && (
              <div className="gpt-cards">
                {m.tiles.map(t => (
                  <button key={t.key} className="gpt-card" onClick={() => onOpen(t)} title={t.title + ' · 눌러서 보기, 끌어서 담기'}
                    draggable onDragStart={e => { e.dataTransfer.setData('text/blip-tile', t.key); e.dataTransfer.effectAllowed = 'copy'; }}>
                    <span className="gpt-scale"><Slide layer={t.cover} /></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {pending && <div className="gpt-msg"><p className="gpt-dots"><i /><i /><i /></p></div>}
      </div>
      <div className="gpt-input">
        <textarea value={v} rows={1} placeholder="메시지 보내기" spellCheck={false}
          onChange={e => setV(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
        <button onClick={send} disabled={!v.trim()} aria-label="보내기">↑</button>
      </div>
    </aside>
  );
}
