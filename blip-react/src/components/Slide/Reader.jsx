import { useEffect, useRef } from 'react';
import { SOURCES } from '../../data/trip';

// 원문 다시 보기: 카드로 바꾸지 않고 그 기사의 생김새(머리 · 요약 상자 · 사진 두 장 + 설명 · 본문)를 그대로 옮겨 블립 안에서 스크롤.
// focus = 들어온 이유 (예: 라 파리지엥을 눌러서) → 요약에서 그 줄이 표시됨. 열 때는 항상 맨 위부터
export default function Reader({ layer, play, tr }) {
  const ref = useRef(null);
  const src = SOURCES[layer.src];
  // 들어오면 항상 콘텐츠 맨 위부터 (예전엔 그 대목으로 바로 내려갔지만, 사용자 요청으로 뺌 2026-11-21)
  useEffect(() => { if (play) ref.current?.scrollTo({ top: 0 }); }, [play, layer.focus]);
  return (
    <div className="rd" data-scroll="" ref={ref}>
      <div className="rd-bar" aria-hidden="true"><b>{layer.site}</b><span>{src?.host}</span></div>
      <header className="rd-head" {...tr('head', 'text')}>
        <p className="rd-sec">{layer.section}</p>
        <h3>{layer.title}</h3>
        <p className="rd-dek">{layer.dek}</p>
        <p className="rd-by">by {layer.by}<i />{layer.date}</p>
      </header>
      <section className="rd-sum" {...tr('summary')}>
        <h4>{layer.summary.h}</h4>
        <ul>
          {layer.summary.items.map(([name, line]) => (
            <li key={name} className={layer.focus === name ? 'on' : undefined}><span><b>{name}</b> : {line}</span></li>
          ))}
        </ul>
      </section>
      {layer.blocks.map((b, i) => (
        <div key={i} data-anchor={b.anchor}>
          {b.imgs && (
            <figure className="rd-fig" {...tr('fig' + i, 'img')}>
              <div className="rd-imgs">{b.imgs.map((s, j) => <img key={s} src={s} alt={b.names?.[j] || ''} draggable={false} {...tr('img' + i + ':' + j, 'img', { 'data-name': b.names?.[j] })} />)}</div>
              <figcaption>{b.cap}</figcaption>
            </figure>
          )}
          {b.p && <p className="rd-p" {...tr('p' + i, 'text')}>{b.p}</p>}
        </div>
      ))}
      {layer.rest && <p className="rd-rest">{layer.rest}</p>}
    </div>
  );
}
