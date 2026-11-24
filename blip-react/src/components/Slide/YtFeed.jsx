import { useState } from 'react';
import { useInnerBack } from './innerBack';

// 유튜브 알고리즘처럼 한 화면에 모아 보기: 맨 위 영상 하나는 크게, 그 아래 기사들은 한 줄씩
// play = 크게 떠서 직접 보는 중 → 기사는 누르면 블립 안에서 그 기사의 모바일 화면(캡처)을 그대로 스크롤 (밖으로 나가지 않음)
//   캡처가 없는 것(영상)은 원문 (새 탭). 썸네일 안에선 그림만
const host = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return ''; } };
export default function YtFeed({ layer, play, tr }) {
  const [top, ...rest] = layer.items;
  const [web, setWeb] = useState(null); // 블립 안에서 보고 있는 기사
  useInnerBack(!!web, () => setWeb(null), play); // 왼쪽 아래 '뒤로' = 기사 닫기
  const A = play ? 'a' : 'span';
  const link = it => (!play ? {} : it.shot
    ? { href: it.url, onClick: e => { e.preventDefault(); setWeb(it); } }
    : { href: it.url, target: '_blank', rel: 'noreferrer' });
  return (
    <div className="yf">
      <h3 className="yf-h" {...tr('h', 'text')}>{layer.title}</h3>
      <A className="yf-top" {...link(top)} {...tr('top')}>
        <span className="yf-thumb" style={{ background: top.color }}>
          <i aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M3 2l5 3-5 3z" fill="#fff" /></svg></i>
          <em>{top.src}</em>
        </span>
        <b>{top.title}</b>
        <small>{top.src} · {top.date}</small>
      </A>
      <div className="yf-list">
        {rest.map((it, i) => (
          <A key={it.url} className="yf-row" {...link(it)} {...tr('n' + i)}>
            <span className="yf-src" style={{ background: it.color }}>{it.src.split(' ')[0]}</span>
            <span className="yf-txt">
              {it.tag && <i className="yf-tag">{it.tag}</i>}
              <b>{it.title}</b>
              <small>{it.src} · {it.date}</small>
            </span>
          </A>
        ))}
      </div>
      {web && (
        /* 블립 안의 모바일 웹: 주소창 + 그 기사 화면 그대로 (재구성하지 않음) */
        <div className="yf-web">
          <div className="yf-bar">
            <button className="yf-x" onClick={() => setWeb(null)} aria-label="닫기">✕</button>
            <span className="yf-url"><i aria-hidden="true">🔒</i>{host(web.url)}</span>
          </div>
          <div className="yf-page" data-scroll="">
            <img src={import.meta.env.BASE_URL + 'demo/web/' + web.shot + '.jpg'} alt={web.title} draggable={false} />
          </div>
        </div>
      )}
    </div>
  );
}
