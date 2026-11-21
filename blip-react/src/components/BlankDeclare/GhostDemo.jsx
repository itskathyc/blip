import { useEffect, useState } from 'react';
import { ACTIONS } from './actions';

const D = 1100;
const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// 처음 쓰는 사람에게: 반투명 커서가 직접 빈칸을 그려 여는 시범. 누르는 순간 멈추고, 가만히 있으면 다시
export default function GhostDemo({ enabled }) {
  const [st, setSt] = useState(null); // { phase: intro | press | drag | open | fade, p }

  useEffect(() => {
    if (!enabled) { setSt(null); return undefined; }
    let timers = [], raf = 0, finished = false, dead = false;
    const later = (ms, f) => timers.push(setTimeout(f, ms));
    const stop = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };
    const play = () => {
      stop(); finished = false;
      if (reduced) { setSt({ phase: 'open', p: 1 }); return; }
      setSt({ phase: 'intro', p: 0 });
      const finish = () => { if (finished || dead) return; finished = true; cancelAnimationFrame(raf); setSt({ phase: 'open', p: 1 }); };
      later(550, () => setSt({ phase: 'press', p: 0 }));
      later(750, () => {
        const t0 = performance.now();
        const step = now => {
          if (dead || finished) return;
          const t = Math.min(1, (now - t0) / D);
          if (t >= 1) { finish(); return; }
          setSt({ phase: 'drag', p: ease(t) });
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      });
      later(750 + D + 60, finish); // 애니메이션 프레임이 멈춰도(백그라운드 탭 등) 그리기는 반드시 끝남
      later(4300, () => setSt(s => s && { ...s, phase: 'fade' }));
      later(4800, () => { setSt(null); later(1800, play); });
    };
    const onDown = () => { stop(); setSt(null); later(5000, play); };
    addEventListener('pointerdown', onDown);
    later(1200, play);
    return () => { dead = true; stop(); removeEventListener('pointerdown', onDown); };
  }, [enabled]);

  if (!st) return null;
  // 콘텐츠 위에서 끌면 넘기기라서, 시범은 콘텐츠 오른쪽 빈 캔버스에서
  // 두 화면 사이(또는 오른쪽 끝) 중 가장 넓은 빈 틈
  const vs = [...document.querySelectorAll('.viewer')].map(el => el.getBoundingClientRect()).sort((a, b) => a.left - b.left);
  const gaps = vs.map((r, i) => ({ x: r.right, w: (vs[i + 1] ? vs[i + 1].left : innerWidth) - r.right }));
  const g = gaps.sort((a, b) => b.w - a.w)[0];
  const v = vs[vs.length - 1];
  const room = g ? g.w - 40 : 0;
  const W = room >= 120 ? Math.min(300, room) : Math.min(340, innerWidth * .5), H = W * 290 / 500;
  const x0 = room >= 120 ? g.x + (g.w - W) / 2 : innerWidth / 2 - W / 2;
  const y0 = v ? v.top + v.height / 2 - H / 2 : innerHeight / 2 - H / 2;
  const capX = x0 + W / 2;
  const open = st.phase === 'open' || st.phase === 'fade';
  const p = st.phase === 'drag' ? st.p : open ? 1 : 0;

  return (
    <div className={'gh' + (st.phase === 'fade' ? ' out' : '')} aria-hidden="true">
      {p > 0 && (
        <div className={'rg' + (open ? ' done' : '')} style={{ left: x0, top: y0, width: W * p, height: H * p, '--k': Math.min(W / 500, H / 290) }}>
          {open && (<>
            <div className="ri">{ACTIONS.map((a, i) => <span key={a.k} className="ic pop" style={{ animationDelay: i * 90 + 'ms' }}><img src={a.src} alt="" /></span>)}</div>
            <div className="caret" />
          </>)}
        </div>
      )}
      {!reduced && (
        <div className={'cur' + (st.phase === 'press' || st.phase === 'drag' ? ' down' : '') + (st.phase === 'drag' ? ' drag' : '')}
          style={{ left: x0 + W * p, top: y0 + H * p }}>
          <svg className="a" viewBox="0 0 24 24"><path d="M4 2l15 11.5-6.6.9 3.8 7.4-2.9 1.4-3.8-7.5L4 20.4z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
          <svg className="x" viewBox="0 0 24 24"><path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="4" strokeLinecap="round" /><path d="M12 3v18M3 12h18" stroke="#111" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </div>
      )}
      <div className="cap" style={{ left: capX, top: y0 + H + 22 }}>빈 곳을 드래그해서 빈칸을 열어보세요</div>
    </div>
  );
}
