import { useEffect, useRef, useState } from 'react';
import Slide from '../Slide/Slide';
import EditSurface from '../Edit/EditSurface';
import './Carousel.css';

const CARD_W = 390, WEB_W = 868; // 웹형(16:9) 장은 가로 868 (세로 488 그대로)
const TAP = 6; // 이보다 덜 움직이면 클릭으로 봄

// 캐러셀 콘텐츠만. 콘텐츠 위에서 끌면 = 넘기기 (빈칸 선언은 콘텐츠 바깥 캔버스에서만)
// 트랙패드는 기본 가로 스크롤, 마우스는 끌어서 넘김. 위치 표시는 아래 레이어 슬라이더가 맡음
// wheel: 콘텐츠 위에서 휠을 굴리면 이전/다음 장 (한 번 굴림 = 한 장)
// onSwipe: 인스타그램처럼 아래에서 위로 밀면 다음 콘텐츠(+1), 위에서 아래로 밀면 이전 콘텐츠(-1). enter: 들어올 때 방향
const FLICK = 60;
const NAV = 80; // 꾹 누른 뒤 이만큼 밀면 뒤로·앞으로
export default function Carousel({ layers, index, onIndex, editable, wheel, edit, sel, wiggle, tear, me, onPick, onPublish, onSwipe, onNav, onMore, enter = 0, pageKey }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const settleRef = useRef(0);
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const cur = layers[index] || layers[0];
  const W = layers[0]?.web ? WEB_W : CARD_W;
  const last = layers.length - 1;

  useEffect(() => {
    const el = trackRef.current;
    if (Math.round(el.scrollLeft / W) !== index) el.scrollTo({ left: index * W, behavior: 'smooth' });
  }, [index, layers.length, W]);

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

  // 트랙패드 관성처럼 이벤트가 몰려 와도 한 장만: 한 장 넘긴 뒤 휠이 잠깐 멈출 때까지 잠금
  const wheelRef = useRef({ sum: 0, lock: false, t: 0 });
  const onWheel = e => {
    if (!wheel || e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // ctrl+휠 = 핀치(크기)
    if (!editable && e.target.closest('.tx')) return; // 읽기에서 글자 위 끌기 = 글 고르기 (골라서 0.2초 꾹 → 오른쪽으로 던지기, TextThrow)
    if (e.target.closest('[data-scroll]')) return; // 웹처럼 생긴 페이지 안에선 휠 = 스크롤 (장 넘기기 아님)
    const w = wheelRef.current;
    clearTimeout(w.t);
    w.t = setTimeout(() => { w.lock = false; w.sum = 0; }, 180);
    if (w.lock) return;
    w.sum += e.deltaY;
    if (Math.abs(w.sum) < 30) return;
    w.lock = true;
    if (w.sum > 0 && index >= last && onMore) { onMore(); return; } // 마지막 장 너머 = 새 장 제안
    go(index + (w.sum > 0 ? 1 : -1));
  };

  // 꾹 눌렀다가(0.4초, 가만히) 옆으로 밀기 = 뒤로 · 앞으로 (브라우저처럼). 오른쪽으로 밀면 뒤로, 왼쪽이면 앞으로.
  // 콘텐츠 어디서든 (웹페이지 안·글자 위 포함). 꾹 누르기 전에 움직이면 원래 동작(넘기기·글자 고르기)
  const navRef = useRef(null);
  const navDown = e => {
    if (!onNav || pageKey || e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest('a, button, input, textarea, select, [contenteditable="true"]')) return;
    if (e.target.closest('[data-tear]')) return; // 잡아서 끌 수 있는 컴포넌트(사진 등) 위에선 꾹 눌러 뒤로가기 없음 — 잡고 잠깐 멈췄다 끌어도 끌기
    const sel = getSelection();
    if (sel && !sel.isCollapsed && sel.containsNode(e.target, true)) return; // 고른 글자 위 = 글자 던지기
    const n = { x: e.clientX, y: e.clientY, armed: false };
    n.t = setTimeout(() => {
      n.armed = true;
      getSelection()?.removeAllRanges();
      document.body.classList.add('nav-hold');
      card().classList.add('nav-armed');
    }, 400);
    const move = ev => {
      const dx = ev.clientX - n.x;
      if (!n.armed) { if (Math.hypot(dx, ev.clientY - n.y) > TAP) end(); return; }
      ev.preventDefault();
      card().style.transform = `translateX(${dx * .6}px) scale(.97)`;
    };
    const up = ev => {
      const armed = n.armed, dx = ev.clientX - n.x;
      end();
      if (!armed) return;
      // 놓은 직후의 클릭은 무시
      addEventListener('click', eat, { capture: true, once: true });
      setTimeout(() => removeEventListener('click', eat, { capture: true }), 0);
      const el = card();
      const dir = dx > NAV ? -1 : dx < -NAV ? 1 : 0;
      if (dir) {
        const out = el.animate([{ transform: el.style.transform, opacity: 1 }, { transform: `translateX(${dx > 0 ? 60 : -60}%) scale(.94)`, opacity: 0 }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
        out.onfinish = () => { onNav(dir); requestAnimationFrame(() => { out.cancel(); el.style.transform = ''; }); };
      } else {
        el.animate([{ transform: el.style.transform }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
        el.style.transform = '';
      }
    };
    const eat = ev => { ev.stopPropagation(); ev.preventDefault(); };
    const end = () => {
      clearTimeout(n.t);
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      document.body.classList.remove('nav-hold');
      card().classList.remove('nav-armed');
      navRef.current = null;
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    navRef.current = n;
  };

  const down = e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (pageKey) return; // Peel 중엔 끌기 = 뜯기 (넘기기는 휠·아래 슬라이더로)
    if (e.target.closest('[data-scroll]')) return; // 웹페이지 안에서 끌기 = 글자 고르기 (웹처럼). 넘기기는 아래 슬라이더로
    if (e.target.closest('[data-declare]')) return; // 빈 장 위에서 끌기 = 빈칸 그리기 (넘기기는 휠·아래 슬라이더로)
    // 조각을 잡았거나, 고쳐 쓰는 중이거나, 원본에서 찢는 중이면 넘기기가 아님
    if (e.target.closest('[data-piece], [data-tear], [data-comp], [data-el], .cx, [contenteditable="true"], input, textarea, select')) return; // 입력칸·슬라이더 조작은 넘기기가 아님
    dragRef.current = { x: e.clientX, y: e.clientY, left: trackRef.current.scrollLeft, moved: false, axis: null, id: e.pointerId };
  };
  const move = e => {
    const d = dragRef.current;
    if (!d || navRef.current?.armed) return; // 꾹 눌러 뒤로·앞으로 하는 중이면 넘기지 않음
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < TAP) return;
    if (!d.moved) {
      d.moved = true;
      d.axis = onSwipe && Math.abs(dy) > Math.abs(dx) ? 'y' : 'x'; // 처음 움직인 방향으로 정함
      setDragging(true);
      try { trackRef.current.setPointerCapture(d.id); } catch { /* 이미 끝난 포인터 */ }
    }
    if (d.axis === 'x') trackRef.current.scrollLeft = d.left - dx / scaleOf(trackRef.current);
    else card().style.transform = `translateY(${dy * .55}px)`; // 손을 따라 카드 전체(테두리까지)가 살짝 밀림
  };
  const up = e => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d?.moved) return;
    if (navRef.current?.armed) return;
    setDragging(false);
    if (d.axis === 'y') {
      const dy = e.clientY - d.y;
      const el = card();
      if (Math.abs(dy) > FLICK) {
        // 카드 전체가 민 방향으로 빠져나간 뒤 다음(이전) 콘텐츠로. 들어오는 쪽 애니메이션은 Viewer(move)가 맡음
        const out = el.animate([{ transform: el.style.transform, opacity: 1 }, { transform: `translateY(${dy < 0 ? -70 : 70}%) scale(.94)`, opacity: 0 }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
        out.onfinish = () => {
          onSwipe(dy < 0 ? 1 : -1);
          requestAnimationFrame(() => { out.cancel(); el.style.transform = ''; });
        };
      } else {
        el.animate([{ transform: el.style.transform }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
        el.style.transform = '';
      }
      return;
    }
    const dx = e.clientX - d.x;
    go(Math.abs(dx) > 40 ? index + (dx < 0 ? 1 : -1) : index);
  };
  // 위아래로 밀 때 움직이는 것 = 카드 전체 (Viewer의 테두리 틀). 틀 밖에서 쓰이면 자기 자신
  const card = () => rootRef.current.closest('.viewer-frame') || rootRef.current;
  // 끌고 난 직후의 클릭(빵 고르기 등)은 무시
  const swallow = e => { if (dragging) { e.stopPropagation(); e.preventDefault(); } };

  return (
    <div className={'cs' + (enter > 0 ? ' enter-next' : enter < 0 ? ' enter-prev' : '')} ref={rootRef} onPointerDownCapture={navDown} style={W !== CARD_W ? { '--view-w': W } : undefined}>
      <div className={'cs-track' + (dragging ? ' dragging' : '')} ref={trackRef} onScroll={onScroll}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClickCapture={swallow} onWheel={onWheel}>
        {layers.map(layer => (
          <div className={'cs-slide' + (layer.draft ? ' draft' : '') + (pageKey ? ' peel-page' : '')} key={layer.id}
            data-declare={editable && layer.kind === 'blank' ? '' : undefined}
            data-empty={editable && layer.kind === 'blank' && !layer.pieces?.length ? layer.id : undefined}
            // Peel: 컴포넌트가 아닌 바탕을 끌면 이 장 전체를 오른쪽에 레이어로 (컴포넌트는 TearSurface가 조각으로)
            draggable={!!pageKey || undefined}
            onDragStart={pageKey ? e => {
              if (e.target.closest?.('[data-tear]')) return;
              e.dataTransfer.setData('text/blip-tile', pageKey + '#' + layers.indexOf(layer));
              e.dataTransfer.effectAllowed = 'copyMove';
            } : undefined}>
            {editable
              ? (
                <EditSurface layer={layer} edit={edit} wiggle={wiggle === layer.id}>
                  <Slide layer={layer} interactive play sel={sel?.layerId === layer.id ? sel.key : null}
                    wiggle={wiggle === layer.id} onPick={i => onPick(layer.id, i)} />
                </EditSurface>
              )
              : <Slide layer={layer} play tear={tear} me={me} />}
          </div>
        ))}
      </div>
      {/* Blip의 제안은 템플릿: 반투명. 이대로 쓰거나, 손대는 순간 선명해짐 */}
      {cur?.draft && editable && <button className="publish" onClick={() => onPublish(cur.id)}>이대로 사용</button>}
    </div>
  );
}

// 뷰어가 transform: scale로 줄어 있으니 화면 픽셀 → 콘텐츠 픽셀로 환산
function scaleOf(el) {
  return el.getBoundingClientRect().width / el.offsetWidth || 1;
}
