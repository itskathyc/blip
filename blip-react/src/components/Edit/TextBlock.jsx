import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './TextBlock.css';

// 우클릭 → 텍스트 입력: 떠 있는 글이 아니라 콘텐츠 안에 끼워 넣은 글 칸 (아래 내용이 밀려 내려감)
//   오른쪽 아래 모서리 = 잡아 끌어 크기 (가로 · 세로)
//   두 번 탭 = 고쳐 쓰기 (Enter = 끝, Shift+Enter = 줄바꿈)
//   우클릭 → 맨 앞 아이콘 "텍스트 에디터" = 글꼴 · 정렬 · 크기 · 색
const FONTS = [
  ['기본', '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif'],
  ['명조', '"AppleMyungjo", "Nanum Myeongjo", "Noto Serif KR", serif'],
  ['세리프', 'Georgia, "Times New Roman", serif'],
  ['고정폭', '"SF Mono", Menlo, monospace']
];
const COLORS = ['#1d1d1f', '#6e6e73', '#0a84ff', '#e2483d', '#ff9f0a', '#30b158'];
const styleOf = ins => ({
  fontFamily: ins.font || FONTS[0][1],
  textAlign: ins.align || 'left',
  fontSize: ins.size || 15,
  color: ins.color || '#1d1d1f'
});

export function TextBlock({ ins, onChange, startEdit, onEdited }) {
  const box = useRef(null), txt = useRef(null);
  const [editing, setEditing] = useState(false);

  const edit = () => {
    const el = txt.current;
    if (!el || editing) return;
    setEditing(true);
    requestAnimationFrame(() => {
      el.focus();
      const r = document.createRange(); r.selectNodeContents(el);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    });
  };
  useLayoutEffect(() => { if (startEdit) { edit(); onEdited?.(); } }); // 놓자마자 바로 쓰기

  const done = () => {
    setEditing(false);
    const t = txt.current.innerText.replace(/\n+$/, '');
    onChange({ text: t || '텍스트' });
  };

  // 오른쪽 아래 모서리를 잡아 끌어 크기 (콘텐츠 px로 저장 — 화면 배율과 상관없이)
  const grab = e => {
    if (e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    const el = box.current, k = el.getBoundingClientRect().width / el.offsetWidth || 1;
    const max = el.parentElement.clientWidth;
    const w0 = el.offsetWidth, h0 = el.offsetHeight, x0 = e.clientX, y0 = e.clientY;
    const h = e.currentTarget;
    h.setPointerCapture(e.pointerId);
    const mv = ev => onChange({
      w: Math.round(Math.max(60, Math.min(max, w0 + (ev.clientX - x0) / k))),
      h: Math.round(Math.max(28, h0 + (ev.clientY - y0) / k))
    });
    const up = () => { h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); };
    h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up);
  };

  return (
    <div className={'tb' + (editing ? ' editing' : '')} ref={box} data-ins={ins.id}
      style={{ width: ins.w || '100%', minHeight: ins.h || undefined }}
      onPointerDown={e => { if (e.button === 0) e.stopPropagation(); }} onDoubleClick={e => { e.stopPropagation(); edit(); }}>
      <div className="tb-text" ref={txt} style={styleOf(ins)} contentEditable={editing} suppressContentEditableWarning spellCheck="false"
        onBlur={editing ? done : undefined}
        onKeyDown={editing ? e => { if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing)) { e.preventDefault(); e.currentTarget.blur(); } } : undefined}>
        {ins.text}
      </div>
      <b className="tb-rs" role="button" aria-label="크기 조절" title="잡아 끌어 크기 조절" onPointerDown={grab} />
    </div>
  );
}

// 텍스트 에디터: 우클릭한 자리에 뜨는 작은 판 (바깥을 누르거나 Esc = 닫기)
export function TextEditor({ ins, at, onChange, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const out = e => { if (!ref.current?.contains(e.target) && !e.target.closest?.('[data-ins]')) onClose(); };
    const esc = e => { if (e.key === 'Escape') onClose(); };
    addEventListener('pointerdown', out, true); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', out, true); removeEventListener('keydown', esc); };
  }, [onClose]);
  const s = styleOf(ins);
  const size = v => onChange({ size: Math.max(10, Math.min(64, v)) });
  const x = Math.min(at.x, innerWidth - 260), y = Math.min(at.y, innerHeight - 250);
  return createPortal(
    <div className="te" ref={ref} style={{ left: x, top: y }} role="dialog" aria-label="텍스트 에디터" onContextMenu={e => e.preventDefault()}>
      <p className="te-h">텍스트</p>
      <div className="te-row te-fonts" role="radiogroup" aria-label="글꼴">
        {FONTS.map(([name, f]) => (
          <button key={name} role="radio" aria-checked={s.fontFamily === f} className={s.fontFamily === f ? 'on' : ''} onClick={() => onChange({ font: f })}>
            <b style={{ fontFamily: f }}>가</b><span>{name}</span>
          </button>
        ))}
      </div>
      <div className="te-row">
        <div className="te-seg" role="radiogroup" aria-label="정렬">
          {[['left', 'M3 4h14M3 8h9M3 12h14M3 16h9'], ['center', 'M3 4h14M5.5 8h9M3 12h14M5.5 16h9'], ['right', 'M3 4h14M8 8h9M3 12h14M8 16h9']].map(([a, d]) => (
            <button key={a} role="radio" aria-checked={s.textAlign === a} className={s.textAlign === a ? 'on' : ''} onClick={() => onChange({ align: a })} aria-label={{ left: '왼쪽', center: '가운데', right: '오른쪽' }[a] + ' 정렬'}>
              <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          ))}
        </div>
        <div className="te-size" aria-label="크기">
          <button onClick={() => size(s.fontSize - 1)} aria-label="작게">−</button>
          <input type="number" value={s.fontSize} min="10" max="64" onChange={e => size(+e.target.value || 15)} />
          <button onClick={() => size(s.fontSize + 1)} aria-label="크게">+</button>
        </div>
      </div>
      <input className="te-range" type="range" min="10" max="64" value={s.fontSize} onChange={e => size(+e.target.value)} aria-label="크기" />
      <div className="te-row te-colors" role="radiogroup" aria-label="색">
        {COLORS.map(c => (
          <button key={c} role="radio" aria-checked={s.color === c} className={s.color === c ? 'on' : ''} style={{ background: c }} onClick={() => onChange({ color: c })} aria-label={c} />
        ))}
        <label className="te-pick" title="다른 색"><input type="color" value={s.color} onChange={e => onChange({ color: e.target.value })} /></label>
      </div>
    </div>,
    document.body
  );
}
