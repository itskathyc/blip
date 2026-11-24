import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROJECTS } from '../../data/projects';
import './ProjectsPanel.css';

// Publish ▾ → Projects: 내 프로젝트 폴더 4개 (유리 폴더 안에 종이가 꽂힌 모양)

const Gear = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <circle cx="8" cy="8" r="5.6" /><circle cx="8" cy="8" r="2" />
  </svg>
);

export default function ProjectsPanel({ onClose, onOpen, onLog }) {
  const [menu, setMenu] = useState(null); // 폴더 우클릭 메뉴 { name, x, y }
  useEffect(() => {
    const key = e => { if (e.key === 'Escape') onClose(); };
    const out = e => { if (!e.target.closest?.('.pj-panel, .pub, .pj-menu')) onClose(); else if (!e.target.closest?.('.pj-menu')) setMenu(null); };
    addEventListener('keydown', key); addEventListener('pointerdown', out, true);
    return () => { removeEventListener('keydown', key); removeEventListener('pointerdown', out, true); };
  }, [onClose]);
  return (
    <div className="pj-panel" role="dialog" aria-label="Projects">
      <div className="pj-top">
        <svg className="pj-folder-ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2h9A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
        </svg>
        <button className="pj-open" onClick={onClose} aria-label="닫기" title="닫기">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
        </button>
      </div>
      <div className="pj-grid">
        {PROJECTS.map((p, i) => (
          <button key={p.name} className="pj-item" style={{ '--i': i }} onClick={() => onOpen?.(p.name)}
            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setMenu({ name: p.name, x: e.clientX, y: e.clientY }); }}>
            <span className="pj-back" aria-hidden="true" />
            <span className="pj-papers" aria-hidden="true">
              {p.papers.map((c, j) => <i key={j} style={{ background: c, '--j': j }}><b /><b /><b /></i>)}
            </span>
            <span className="pj-front">
              <span className="pj-txt"><b>{p.name}</b><small>{p.sub}</small></span>
              <span className="pj-gear"><Gear /></span>
            </span>
          </button>
        ))}
      </div>
      {/* 폴더 우클릭: 기본 메뉴 (빈칸 선언 아님) */}
      {menu && createPortal(
        <ul className="pj-menu" role="menu" style={{ left: menu.x, top: menu.y }} onContextMenu={e => e.preventDefault()}>
          <li role="menuitem" onClick={() => { setMenu(null); onOpen?.(menu.name); }}><span>열기</span></li>
          <li role="menuitem" className="pj-log" onClick={() => { setMenu(null); onLog?.(menu.name); }}><span>commit log 확인</span><kbd>⌥⌘L</kbd></li>
          <li className="pj-sep" role="separator" />
          <li role="menuitem" className="off"><span>이름 바꾸기</span></li>
          <li role="menuitem" className="off"><span>복제</span><kbd>⌘D</kbd></li>
          <li role="menuitem" className="off"><span>공유</span></li>
          <li className="pj-sep" role="separator" />
          <li role="menuitem" className="off"><span>삭제</span><kbd>⌫</kbd></li>
        </ul>, document.body /* 유리 판(backdrop-filter) 안에선 fixed 위치가 틀어져서 페이지 맨 위에 */
      )}
    </div>
  );
}
