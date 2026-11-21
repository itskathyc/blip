import { useEffect, useRef } from 'react';

// 글자 던지기: Peel(컴포넌트 단위)과 달리 콘텐츠 안의 글을 내가 고른 만큼.
//   왼쪽(읽기)에서 글을 드래그해 고름 → 고른 글 위를 0.2초 꾹 누름(선택이 '잡힘' 표시) → 그대로 오른쪽으로 끌어 던짐
//   → 그 글이 오른쪽 콘텐츠에 복사돼 붙음 (dropPiece가 받는 'text/blip-piece' 글 조각)
// 0.2초를 채우지 않고 끌면 아무 일도 없음 (실수로 끌리지 않게)
const HOLD = 200;

const insideSelection = (x, y) => {
  const s = getSelection();
  if (!s || s.isCollapsed || !s.rangeCount) return false;
  return [...s.getRangeAt(0).getClientRects()].some(r => x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2);
};

export default function TextThrow({ source }) {
  const src = useRef(source);
  src.current = source;

  useEffect(() => {
    let t0 = null;
    let timer = 0;
    const disarm = () => { clearTimeout(timer); document.body.classList.remove('text-armed'); };
    const down = e => {
      t0 = null;
      disarm();
      if (e.button !== 0 || e.metaKey || e.ctrlKey) return; // Cmd/Ctrl = Peel
      if (!e.target.closest?.('.pane.dig .viewer') || !insideSelection(e.clientX, e.clientY)) return;
      t0 = performance.now();
      timer = setTimeout(() => document.body.classList.add('text-armed'), HOLD);
    };
    const start = e => {
      if (t0 === null) return;
      const held = performance.now() - t0;
      const text = getSelection()?.toString().trim();
      t0 = null;
      disarm();
      if (!text) return;
      if (held < HOLD) { e.preventDefault(); return; }
      const s = src.current;
      e.dataTransfer.setData('text/blip-piece', JSON.stringify({ kind: 'note', text, ...(s ? { from: s } : {}) }));
      e.dataTransfer.setData('text/plain', text);
      e.dataTransfer.effectAllowed = 'copyMove';
    };
    const up = () => { t0 = null; disarm(); };
    addEventListener('pointerdown', down, true);
    addEventListener('dragstart', start, true);
    addEventListener('pointerup', up, true);
    addEventListener('dragend', up, true);
    return () => {
      removeEventListener('pointerdown', down, true); removeEventListener('dragstart', start, true);
      removeEventListener('pointerup', up, true); removeEventListener('dragend', up, true);
      disarm();
    };
  }, []);

  return null;
}
