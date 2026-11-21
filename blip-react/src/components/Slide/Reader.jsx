import { useEffect, useRef } from 'react';
import { SOURCES } from '../../data/trip';

// 원문 다시 보기: 카드로 바꾸지 않고 그 기사의 생김새(머리 · 요약 상자 · 사진 두 장 + 설명 · 본문)를 그대로 옮겨 블립 안에서 스크롤.
// focus = 들어온 이유 (예: 라 파리지엥을 눌러서) → 요약에서 그 줄이 표시되고, 처음 열 때 그 대목으로 스크롤
export default function Reader({ layer, play, tr }) {
  const ref = useRef(null);
  const src = SOURCES[layer.src];
  useEffect(() => {
    if (!play || !layer.focus) return;
    const page = ref.current;
    const at = page?.querySelector(`[data-anchor="${layer.focus}"]`);
    if (at) page.scrollTo({ top: at.offsetTop - 12, behavior: 'smooth' });
  }, [play, layer.focus]);
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
