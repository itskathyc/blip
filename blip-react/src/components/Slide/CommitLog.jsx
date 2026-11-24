import { useMemo, useState } from 'react';
import Slide from './Slide';
import { commitsFor, projectLayers } from '../../data/projects';
import './CommitLog.css';

// 프로젝트의 커밋 로그 (가상): 그래프 · 해시 · 제목 · 한 줄. 커밋을 고르면 그때의 화면이 오른쪽 아래 미리보기로
const ROW = 46, TOP = 8, X0 = 14, X1 = 40;
export default function CommitLog({ layer, play }) {
  const commits = commitsFor(layer.project);
  const pages = useMemo(() => projectLayers(layer.project, 'log-' + layer.project), [layer.project]);
  const [cur, setCur] = useState(commits.length - 1); // HEAD
  const y = i => TOP + i * ROW + 8;
  // 곁가지: lane 1인 커밋 앞 커밋에서 갈라져 'Merge'에서 합쳐짐
  const bi = commits.findIndex(c => c.lane === 1), mi = commits.findIndex(c => c.title === 'Merge');
  const c = commits[cur], page = pages[c?.page] || pages[0];
  const B = play ? 'button' : 'span'; // 썸네일 안에선 버튼이 아님 (슬라이더 카드가 이미 버튼)
  return (
    <div className="cl" data-scroll="">
      <h3 className="cl-h">커밋 로그</h3>
      <p className="cl-sub">Commit Log · {layer.project}</p>
      <div className="cl-body">
        <svg className="cl-graph" width="56" height={TOP + commits.length * ROW} aria-hidden="true">
          <line x1={X0} y1={y(0)} x2={X0} y2={y(commits.length - 1)} />
          {bi > 0 && mi > bi && <polyline points={`${X0},${y(bi - 1)} ${X1},${y(bi)} ${X1},${y(mi - 1)} ${X0},${y(mi)}`} />}
          {commits.map((k, i) => (
            <circle key={k.hash} cx={k.lane ? X1 : X0} cy={y(i)} r={i === commits.length - 1 ? 7 : 6.5} className={(i === commits.length - 1 ? 'head' : '') + (i === cur ? ' on' : '')} />
          ))}
        </svg>
        <ol className="cl-list">
          {commits.map((k, i) => (
            <li key={k.hash} className={i === cur ? 'on' : undefined} style={{ height: ROW }}>
              <B className="cl-row" onClick={play ? () => setCur(i) : undefined} onMouseEnter={play ? () => setCur(i) : undefined}>
                <span className="cl-hash">{k.hash}</span><b>{k.title}</b>
                <span className="cl-msg">{k.msg}</span>
              </B>
            </li>
          ))}
        </ol>
      </div>
      <p className="cl-headref">(HEAD → main)</p>
      {/* 고른 커밋의 화면 미리보기 */}
      {page && (
        <figure className="cl-prev" key={c.hash}>
          <div className="cl-prev-in"><Slide layer={page} /></div>
          <figcaption>{c.hash} · {c.title}</figcaption>
        </figure>
      )}
    </div>
  );
}
