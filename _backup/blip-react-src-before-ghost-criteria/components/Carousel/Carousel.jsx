import { useEffect, useRef, useState } from 'react';
import Slide from '../Slide/Slide';
import './Carousel.css';

const W = 390;
const TAP = 6; // 이보다 덜 움직이면 클릭으로 봄

// 캐러셀 콘텐츠만. 콘텐츠 위에서 끌면 = 넘기기 (빈칸 선언은 콘텐츠 바깥 캔버스에서만)
// 트랙패드는 기본 가로 스크롤, 마우스는 끌어서 넘김. 점은 눌러서 바로 이동
export default function Carousel({ layers, index, onIndex, editable, onPick, onPublish }) {
  const trackRef = useRef(null);
  const settleRef = useRef(0);
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const cur = layers[index] || layers[0];
  const last = layers.length - 1;

  useEffect(() => {
    const el = trackRef.current;
    if (Math.round(el.scrollLeft / W) !== index) el.scrollTo({ left: index * W, behavior: 'smooth' });
  }, [index, layers.length]);

  const onScroll = () => {
    if (dragRef.current) return;
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const i = Math.round(trackRef.current.scrollLeft / W);
      if (i !== index) onIndex(i);
    }, 120);
  };

  const go = i => {
    const n = Math.max(0, Math.min(last, i));
    trackRef.current.scrollTo({ left: n * W, behavior: 'smooth' });
    if (n !== index) onIndex(n);
  };

  const down = e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragRef.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false, id: e.pointerId };
  };
  const move = e => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < TAP) return;
    if (!d.moved) { d.moved = true; setDragging(true); try { trackRef.current.setPointerCapture(d.id); } catch { /* 이미 끝난 포인터 */ } }
    trackRef.current.scrollLeft = d.left - dx / scaleOf(trackRef.current);
  };
  const up = e => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d?.moved) return;
    setDragging(false);
    const dx = e.clientX - d.x;
    go(Math.abs(dx) > 40 ? index + (dx < 0 ? 1 : -1) : index);
  };
  // 끌고 난 직후의 클릭(빵 고르기 등)은 무시
  const swallow = e => { if (dragging) { e.stopPropagation(); e.preventDefault(); } };

  return (
    <div className="cs">
      <div className={'cs-track' + (dragging ? ' dragging' : '')} ref={trackRef} onScroll={onScroll}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClickCapture={swallow}>
        {layers.map(layer => (
          <div className={'cs-slide' + (layer.draft ? ' draft' : '')} key={layer.id}>
            <Slide layer={layer} interactive={editable} onPick={i => onPick(layer.id, i)} />
          </div>
        ))}
      </div>
      {cur?.draft && editable && <button className="publish" onClick={() => onPublish(cur.id)}>이대로 발행</button>}
      {layers.length > 1 && (
        <div className="cs-dots">
          {layers.map((l, i) => (
            <button key={l.id} className={i === index ? 'cur' : ''} onClick={() => go(i)} aria-label={(i + 1) + '번째 장'} />
          ))}
        </div>
      )}
    </div>
  );
}

// 뷰어가 transform: scale로 줄어 있으니 화면 픽셀 → 콘텐츠 픽셀로 환산
function scaleOf(el) {
  return el.getBoundingClientRect().width / el.offsetWidth || 1;
}
