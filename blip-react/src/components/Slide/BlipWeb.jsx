import { useState } from 'react';
import { Bread } from '../Art/Bread';
import { SOURCES } from '../../data/trip';

// 블립이 엮은 웹페이지: 여러 url에서 필요한 것만 뽑아 한 페이지로. 카드처럼 넘기지 않고 웹처럼 스크롤.
// 페이지 하나에 주소 하나가 없음 → 맨 위엔 '어디서 모았는지', 항목마다 출처 표시 (누르면 그 항목의 원문)
// 필터 칩을 누르면 목록이 바로 줄어듦 (웹에서처럼). 썸네일(play 아님)에선 그냥 그림
export default function BlipWeb({ layer, play, t, tr }) {
  const [only, setOnly] = useState(null);
  const Chip = play ? 'button' : 'span';
  const Src = play ? 'a' : 'span';
  const src = k => {
    const s = SOURCES[k];
    return (
      <Src className="bp-src" style={{ '--c': s.color }} title={s.name}
        {...(play ? { href: s.url, target: '_blank', rel: 'noopener noreferrer', onPointerDown: e => e.stopPropagation() } : {})}>
        {s.host.split('.')[0]}
      </Src>
    );
  };
  const show = r => !only || r.tags?.includes(only);
  // 목록 페이지의 한 줄은 눌러서 그것만의 페이지로 (한 곳만의 페이지 안에선 아님)
  const opens = play && !layer.detail && !!layer.filters;

  return (
    <div className="bp-page" data-scroll="">
      <header className="bp-head">
        {t('title', layer.title, 'h3', 'bp-title')}
        {t('dek', layer.dek, 'p', 'bp-dek')}
        <p className="bp-from" {...tr('from')}>{layer.srcs.filter((k, i, all) => all.findIndex(x => SOURCES[x].host === SOURCES[k].host) === i).map(k => <span key={k}>{src(k)}</span>)}</p>
      </header>
      {layer.bread && <div className="bp-hero" {...tr('hero', 'img', { 'data-bread': layer.bread })}><Bread kind={layer.bread} size={84} /></div>}
      {layer.filters && (
        <nav className="bp-chips" aria-label="거르기" {...tr('chips')}>
          <Chip className={'bp-chip' + (!only ? ' on' : '')} onClick={play ? () => setOnly(null) : undefined}>전체</Chip>
          {layer.filters.map(f => (
            <Chip key={f} className={'bp-chip' + (only === f ? ' on' : '')} onClick={play ? () => setOnly(o => (o === f ? null : f)) : undefined}>{f}</Chip>
          ))}
        </nav>
      )}
      {layer.sections.map((sec, si) => (sec.type === 'rows' && !sec.rows.some(show) ? null : (
        <section key={si} className={'bp-sec t-' + sec.type}>
          {sec.h && <h4>{sec.h}</h4>}
          {sec.type === 'rows' && (
            <ul>
              {sec.rows.filter(show).map(r => (
                <li key={r.name} {...tr('r' + si + ':' + r.name)} className={opens ? 'go' : undefined}
                  onClick={opens ? e => { if (!e.currentTarget.hasAttribute('data-tear') && !e.target.closest('a')) dispatchEvent(new CustomEvent('blip:open', { detail: { row: r } })); } : undefined}>
                  <div className="bp-row-top"><b>{r.name}</b><span className="bp-where">{r.where}</span>{src(r.src)}{opens && <i className="bp-chev" aria-hidden="true">›</i>}</div>
                  {r.line && <p>{r.line}</p>}
                </li>
              ))}
            </ul>
          )}
          {sec.type === 'facts' && (
            <>
              <div className="bp-facts">
                {sec.facts.map(([big, label]) => <div key={big} {...tr('f:' + big)}><b>{big}</b><span>{label}</span></div>)}
              </div>
              <p className="bp-by">{src(sec.src)}</p>
            </>
          )}
          {sec.type === 'pending' && <p className="bp-pending"><i /><i /><i /> {sec.text}</p>}
          {sec.type === 'quote' && (
            <blockquote {...tr('q' + si)}><span>{sec.text}</span><cite>{sec.who} {src(sec.src)}</cite></blockquote>
          )}
        </section>
      )))}
    </div>
  );
}
