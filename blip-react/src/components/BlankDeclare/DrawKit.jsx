import { useEffect, useRef, useState } from 'react';
import { KIT_COLORS, KIT_BGS } from './kit';

// 드로잉키트: 빈칸에서 한 번 고르면 그 자리에 남는 컴포넌트. 피그마의 기본 도구 막대처럼:
//   [이동] [프레임] [도형 ▾] [펜 ▾] [글자]  |  지금 고른 것의 속성 셋 (글자 / 조각 / 배경에 따라 바뀜)
// 도형·펜·글자를 고르고 오른쪽 내 화면 위를 끌거나 누르면 그 자리에 새 조각이 생김 → 다시 이동 도구로

const I = {
  move: <path d="M5 3l14 7.5-6.2 1.6L10 19z" />,
  frame: <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />,
  rect: <rect x="4.5" y="4.5" width="15" height="15" rx="1" />,
  line: <path d="M5 19L19 5" />,
  arrow: <path d="M5 19L19 5M10 5h9v9" />,
  ellipse: <circle cx="12" cy="12" r="8" />,
  polygon: <path d="M12 4l8.5 15h-17z" />,
  star: <path d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8l6.1-.7z" />,
  image: <><rect x="4" y="4" width="16" height="16" rx="1.5" /><circle cx="15" cy="9" r="1.8" /><path d="M4 17l5-5 7 7" /></>,
  pen: <><path d="M4 20l3.5-1 10-10-2.5-2.5-10 10z" /><path d="M14 6.5l3.5 3.5" /></>,
  pencil: <path d="M4 20c3-1 4-4 7-7s5-5 9-9" />,
  text: <path d="M5 5h14M12 5v14M9 19h6" />
};
const Icon = ({ k }) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{I[k]}</svg>;

const SHAPES = [
  ['rect', 'Rectangle', 'R'], ['line', 'Line', 'L'], ['arrow', 'Arrow', '⇧L'], ['ellipse', 'Ellipse', 'O'],
  ['polygon', 'Polygon', ''], ['star', 'Star', ''], ['image', 'Image/video…', '⇧⌘K']
];
const PENS = [['pen', 'Pen', 'P'], ['pencil', 'Pencil', '⇧P']];

// 고른 것의 속성: 언제나 셋
const PROPS = {
  text: [
    { k: 'size-', label: '가', cls: 'small', title: '글자 작게' },
    { k: 'size+', label: '가', cls: 'big', title: '글자 크게' },
    { k: 'color', cls: 'swatch', title: '글자 색' }
  ],
  piece: [
    { k: 'scale-', label: '−', title: '작게' },
    { k: 'scale+', label: '+', title: '크게' },
    { k: 'round', label: '◖', title: '모서리' }
  ],
  shape: [
    { k: 'scale-', label: '−', title: '작게' },
    { k: 'scale+', label: '+', title: '크게' },
    { k: 'color', cls: 'swatch', title: '채우기 색' }
  ],
  bg: KIT_BGS.map(c => ({ k: 'bg:' + c, cls: 'swatch', color: c, title: '배경 색' }))
};

// 버튼 하나 + 옆의 ▾ (누르면 어두운 메뉴)
function Group({ items, tool, last, open, onOpen, onPick }) {
  const cur = items.find(i => i[0] === tool) || items.find(i => i[0] === last) || items[0];
  return (
    <div className="fk-group">
      <button className={'fk-btn' + (items.some(i => i[0] === tool) ? ' on' : '')} title={cur[1] + (cur[2] ? ' (' + cur[2] + ')' : '')} onClick={() => onPick(cur[0])}>
        <Icon k={cur[0]} />
      </button>
      <button className={'fk-chev' + (open ? ' open' : '')} onClick={onOpen} aria-label="더 보기" aria-expanded={open}>
        <svg viewBox="0 0 12 12" width="10" height="10"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      {open && (
        <div className="fk-menu" role="menu">
          {items.map(([k, label, key]) => (
            <button key={k} role="menuitemradio" aria-checked={cur[0] === k} className={'fk-item' + (cur[0] === k ? ' cur' : '')} onClick={() => onPick(k)}>
              <span className="fk-check">{cur[0] === k ? '✓' : ''}</span><Icon k={k} /><span className="fk-label">{label}</span><kbd>{key}</kbd>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DrawKit({ target, onTool, tool = 'move', onSetTool, onImage, disabled }) {
  const [menu, setMenu] = useState(null);
  const [last, setLast] = useState({ shape: 'rect', pen: 'pen' });
  const fileRef = useRef(null);
  const ref = useRef(null);
  const type = target?.type || 'bg';

  const pick = k => {
    setMenu(null);
    if (k === 'image') { fileRef.current.click(); return; }
    if (SHAPES.some(s => s[0] === k)) setLast(l => ({ ...l, shape: k }));
    if (PENS.some(s => s[0] === k)) setLast(l => ({ ...l, pen: k }));
    onSetTool?.(k);
  };

  // 단축키 (글자를 쓰는 중이 아닐 때)
  useEffect(() => {
    const key = e => {
      if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
      const k = e.key.toLowerCase();
      if (e.metaKey && e.shiftKey && k === 'k') { e.preventDefault(); pick('image'); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const map = e.shiftKey ? { l: 'arrow', p: 'pencil' } : { v: 'move', f: 'frame', r: 'rect', l: 'line', o: 'ellipse', p: 'pen', t: 'text' };
      if (map[k]) pick(map[k]);
      if (e.key === 'Escape') { setMenu(null); onSetTool?.('move'); }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  });

  // 메뉴 바깥을 누르면 닫힘
  useEffect(() => {
    if (!menu) return undefined;
    const close = e => { if (!ref.current?.contains(e.target)) setMenu(null); };
    addEventListener('pointerdown', close);
    return () => removeEventListener('pointerdown', close);
  }, [menu]);

  const readImage = e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f || !/^(image|video)\//.test(f.type)) return;
    const r = new FileReader();
    r.onload = () => onImage?.(r.result, f.type.startsWith('video') ? 'video' : 'image');
    r.readAsDataURL(f);
  };

  return (
    <div className={'fk' + (disabled ? ' off' : '')} ref={ref} role="toolbar" aria-label="드로잉키트">
      <button className={'fk-btn' + (tool === 'move' ? ' on' : '')} title="Move (V)" onClick={() => pick('move')}><Icon k="move" /></button>
      <button className={'fk-btn' + (tool === 'frame' ? ' on' : '')} title="Frame (F)" onClick={() => pick('frame')}><Icon k="frame" /></button>
      <Group items={SHAPES} tool={tool} last={last.shape} open={menu === 'shape'} onOpen={() => setMenu(m => (m === 'shape' ? null : 'shape'))} onPick={pick} />
      <Group items={PENS} tool={tool} last={last.pen} open={menu === 'pen'} onOpen={() => setMenu(m => (m === 'pen' ? null : 'pen'))} onPick={pick} />
      <button className={'fk-btn' + (tool === 'text' ? ' on' : '')} title="Text (T)" onClick={() => pick('text')}><Icon k="text" /></button>
      <span className="fk-div" aria-hidden="true" />
      <div className="fk-props">
        <span className="fk-what">{target?.label || '배경'}</span>
        {PROPS[type].map(t => (
          <button key={t.k} className={'fk-prop ' + (t.cls || '')} title={t.title} disabled={!onTool}
            style={t.color ? { '--c': t.color } : t.k === 'color' ? { '--c': target?.color || KIT_COLORS[0] } : undefined}
            onClick={() => onTool(t.k)}>{t.label}</button>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={readImage} />
    </div>
  );
}
