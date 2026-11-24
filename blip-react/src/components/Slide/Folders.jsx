import { useState } from 'react';
import { useInnerBack } from './innerBack';
import './Folders.css';

// 폴더 둘러보기 (Finder처럼): 나라 → 도시. 누르면 들어가고, 위 경로 · 왼쪽 아래 '뒤로'로 나옴
// tr: Cmd를 누르고 있으면 폴더째 뜯어 오른쪽으로 (그땐 눌러도 들어가지 않음)
const Folder = ({ color, label, sub, onOpen, B, emoji, recent, t }) => (
  <B {...t} className={'fo-item' + (recent ? ' recent' : '')} onClick={onOpen ? () => { if (!document.body.classList.contains('peel')) onOpen(); } : undefined}>
    <span className="fo-ic" style={{ position: 'relative', display: 'block', width: 92, height: 72 }} aria-hidden="true">
      <svg viewBox="0 0 64 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}><path d="M2 8a5 5 0 0 1 5-5h16l5 5h29a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" fill={color} opacity=".55" /><path d="M2 16a5 5 0 0 1 5-5h50a5 5 0 0 1 5 5v27a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" fill={color} />{emoji && <text x="32" y="38" textAnchor="middle" fontSize="17">{emoji}</text>}</svg>
    </span>
    <b>{label}</b>
    {sub && <small>{sub}</small>}
    {recent && <em className="fo-recent">최근에 다녀오셨어요! 채워주세요!</em>}
  </B>
);

export default function Folders({ layer, play, tr = () => ({}) }) {
  const [path, setPath] = useState([]); // [나라, 도시]
  useInnerBack(path.length > 0, () => setPath(p => p.slice(0, -1)), play);
  const B = play ? 'button' : 'div';
  const country = path[0] && layer.root.find(c => c.name === path[0]);
  const crumbs = [layer.title, ...path];
  return (
    <div className="fo" data-scroll="">
      <nav className="fo-path" aria-label="경로">
        {crumbs.map((c, i) => (
          <span key={c}>
            {i > 0 && <i aria-hidden="true">›</i>}
            {i < crumbs.length - 1 && play ? <button onClick={() => setPath(path.slice(0, i))}>{c}</button> : <b>{c}</b>}
          </span>
        ))}
      </nav>
      {!path.length && (
        <>
          <p className="fo-count">나라 {layer.root.length}곳 · 도시 {layer.root.reduce((n, c) => n + c.cities.length, 0)}곳</p>
          <div className="fo-grid">
            {layer.root.map(c => <Folder key={c.name} B={B} t={tr('fo:' + c.name, 'comp', { 'data-name': c.name })} color={c.color} emoji={c.flag} label={c.name} sub={c.cities.join(' · ')} onOpen={play ? () => setPath([c.name]) : undefined} />)}
          </div>
        </>
      )}
      {country && path.length === 1 && (
        <>
          <p className="fo-count">{country.flag} {country.name} · 도시 {country.cities.length}곳</p>
          <div className="fo-grid">
            {country.cities.map(ct => <Folder key={ct} B={B} t={tr('fo:' + country.name + '/' + ct, 'comp', { 'data-name': ct })} color={country.color} label={ct} sub="빵집 0곳" recent={country.recent?.includes(ct)} onOpen={play ? () => setPath([country.name, ct]) : undefined} />)}
          </div>
        </>
      )}
      {country && path.length === 2 && (() => { const color = country.color; return (
        <div className="fo-empty">
          <span className="fo-ic big" aria-hidden="true">
            <svg viewBox="0 0 64 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}><path d="M2 8a5 5 0 0 1 5-5h16l5 5h29a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" fill={color} opacity=".55" /><path d="M2 16a5 5 0 0 1 5-5h50a5 5 0 0 1 5 5v27a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" fill={color} /></svg>
          </span>
          <b>{country.flag} {path[1]}</b>
          {country.recent?.includes(path[1]) ? <p className="fo-recent-p">최근에 다녀오셨어요! 채워주세요!</p> : null}
          <p>아직 담긴 빵집이 없어요.<br />다녀온 빵집의 사진이나 글을 넣으면 여기에 모여요.</p>
        </div>
      ); })()}
    </div>
  );
}
