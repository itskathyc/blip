import { useRef } from 'react';
import { cloneUnit } from './cloneUnit';

// 왼쪽 원본에서 조각 찢어 오기. DOM의 data-tear 요소 하나 = 찢을 수 있는 단위.
//   올리면     가장 작은 단위에 점선 (문장, 사진 한 장, 가게 정보)
//   누르면     그 단위를 고름 (실선)
//   한 번 더    한 단계 큰 단위로 (문장 → 문단) — 더블·트리플 클릭으로 글자를 넓혀 고르는 감각
//   끌면       그 단위의 복사본이 컴포넌트째(모양 그대로) 오른쪽으로 (원본은 그대로)
//   꾹 누르면   그 컴포넌트를 둘러싸고 빈칸 선언이 열림 (빈칸의 3가지는 "이 컴포넌트"에 맞춰짐)
// 표시(data-thov, data-tsel)는 리액트가 모르는 속성이라 다시 그려져도 지워지지 않음
export default function TearSurface({ source, children }) {
  const hov = useRef(null), sel = useRef(null), press = useRef(null);

  const mark = (ref, attr, el) => {
    ref.current?.removeAttribute(attr);
    ref.current = el;
    el?.setAttribute(attr, '');
  };

  const over = e => mark(hov, 'data-thov', e.target.closest('[data-tear]'));
  const leave = () => mark(hov, 'data-thov', null);

  const unitOf = inner => (sel.current && sel.current.contains(inner) ? sel.current : inner);

  // 꾹 누르기 → 빈칸 선언 (BlankDeclare가 'blip:declare'를 받아 이 컴포넌트 자리에 빈칸을 엶)
  const down = e => {
    clearTimeout(press.current?.t);
    const inner = e.button === 0 && e.target.closest('[data-tear]');
    if (!inner) { press.current = null; return; }
    const p = { x: e.clientX, y: e.clientY, long: false };
    p.t = setTimeout(() => {
      p.long = true;
      const unit = unitOf(inner);
      mark(sel, 'data-tsel', unit);
      const r = unit.getBoundingClientRect();
      const subject = unit.dataset.bread || unit.innerText.trim().split(/\s+/).slice(0, 3).join(' ');
      dispatchEvent(new CustomEvent('blip:declare', { detail: { rect: { x: r.left, y: r.top, w: r.width, h: r.height }, context: 'component', subject } }));
    }, 500);
    press.current = p;
  };
  const move = e => {
    const p = press.current;
    if (p && !p.long && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) clearTimeout(p.t);
  };
  const up = () => clearTimeout(press.current?.t);

  const click = e => {
    if (press.current?.long) { press.current = null; return; } // 꾹 누른 뒤 떼는 건 클릭이 아님
    const el = e.target.closest('[data-tear]');
    if (!el) { mark(sel, 'data-tsel', null); return; }
    const cur = sel.current;
    if (cur && cur.contains(el)) {
      const parent = cur.parentElement?.closest('[data-tear]');
      if (parent) mark(sel, 'data-tsel', parent);
      return;
    }
    mark(sel, 'data-tsel', el);
  };

  const dragStart = e => {
    clearTimeout(press.current?.t);
    // 꾹 눌러 빈칸이 열렸어도 그대로 끌기 시작하면 → 빈칸은 닫고 끌기 (잡고 잠깐 멈췄다 옮기는 손)
    if (press.current?.long) { press.current.long = false; dispatchEvent(new Event('blip:undeclare')); }
    const inner = e.target.closest?.('[data-tear]');
    if (!inner) return;
    const unit = unitOf(inner);
    // 글자만이 아니라 컴포넌트 그대로(마크업 + 모양). text·traits는 기준의 "증거"로 쓰임
    const piece = {
      kind: unit.dataset.kind || 'comp',
      ...cloneUnit(unit),
      text: unit.innerText.trim(),
      bread: unit.dataset.bread,
      name: unit.dataset.name || undefined, // 최소화했을 때 아이콘 이름 (예: 카리나)
      traits: (unit.dataset.traits || '').split(',').filter(Boolean),
      from: { id: source.id, title: source.title }
    };
    e.stopPropagation();
    e.dataTransfer.setData('text/blip-piece', JSON.stringify(piece));
    e.dataTransfer.effectAllowed = 'copyMove'; // 오른쪽에선 옮기는 커서 (+ 복사 표시 없이)
  };

  return (
    <div className="ts" onPointerOver={over} onPointerLeave={leave} onClick={click} onDragStart={dragStart}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      {children}
    </div>
  );
}
