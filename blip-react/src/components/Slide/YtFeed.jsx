// 유튜브 알고리즘처럼 한 화면에 모아 보기: 맨 위 영상 하나는 크게, 그 아래 기사들은 한 줄씩
// play = 크게 떠서 직접 보는 중 → 누르면 원문 (새 탭). 썸네일 안에선 그림만
export default function YtFeed({ layer, play, tr }) {
  const [top, ...rest] = layer.items;
  const A = play ? 'a' : 'span';
  const link = it => (play ? { href: it.url, target: '_blank', rel: 'noreferrer' } : {});
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
    </div>
  );
}
