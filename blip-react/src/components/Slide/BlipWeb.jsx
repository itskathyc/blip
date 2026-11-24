import NearMap from '../Map/NearMap';
import { useState } from 'react';
import { Bread } from '../Art/Bread';
import { SOURCES, BAKERY_POOL } from '../../data/trip';

// 블립이 엮은 웹페이지: 여러 url에서 필요한 것만 뽑아 한 페이지로. 카드처럼 넘기지 않고 웹처럼 스크롤.
// 페이지 하나에 주소 하나가 없음 → 맨 위엔 '어디서 모았는지', 항목마다 출처 표시 (누르면 그 항목의 원문)
// 필터 칩을 누르면 목록이 바로 줄어듦 (웹에서처럼). 썸네일(play 아님)에선 그냥 그림
// 상세 조정툴: 소개 글 자리에 접힌 상자 하나 (▼ 누르면 펼침). 셋 다 비워 둬도 되고 하나만 골라도 됨 → [확인]하면 아래 목록이 바뀜
//   프랑스 어디?            파리 · 리옹 (다시 누르면 해제)
//   한국인 ↔ 로컬 슬라이더    움직이기 전엔 '상관없음'
//   디저트류 · 식사빵류 · 모두  체크박스 (모두 = 둘 다)
const CITIES = ['파리', '리옹', '니스', '마르세유', '몽펠리에', '보르도'];
const pickBakeries = ({ city, lean, types }) => {
  let list = BAKERY_POOL.filter(b => (!city || b.city === city) && (!types.length || b.type === 'both' || types.includes(b.type)));
  if (lean != null) { const want = 1 - lean; list = [...list].sort((a, b) => Math.abs(a.k - want) - Math.abs(b.k - want)); }
  // 라 파리지엥은 어떤 조건이어도 맨 위 (데모: 카리나 이야기로 이어지는 첫 장)
  const pin = BAKERY_POOL.find(b => b.pin);
  list = [pin, ...list.filter(b => b !== pin)];
  return list.slice(0, 10).map(b => ({ ...b, tags: [] }));
};
const summaryOf = ({ city, lean, types }) => [
  city,
  lean == null ? null : lean < .34 ? '한국인이 좋아하는 곳' : lean > .66 ? '로컬이 좋아하는 곳' : '한국인 · 로컬 반반',
  types.length === 2 ? '디저트 · 식사빵' : types[0] === 'dessert' ? '디저트류' : types[0] === 'meal' ? '식사빵류' : null
].filter(Boolean).join(' · ');

function Tune({ play, applied, onApply, tr }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState(applied); // 펼친 동안 고치는 값 (확인 전)
  const B = play ? 'button' : 'span';
  const flip = k => setD(x => ({ ...x, types: x.types.includes(k) ? x.types.filter(y => y !== k) : [...x.types, k] }));
  const all = d.types.length === 2;
  const sum = summaryOf(applied);
  return (
    <div className={'bt' + (open ? ' open' : '')} {...tr('tune')} onPointerDown={play ? e => e.stopPropagation() : undefined}>
      <B className="bt-head" onClick={play ? () => { setD(applied); setOpen(o => !o); } : undefined} aria-expanded={open}>
        <b>상세 조정툴</b>
        <span className="bt-sum">{sum || '전체'}</span>
        <svg className="bt-tri" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 3.5L6 8l4-4.5z" fill="currentColor" /></svg>
      </B>
      {open && play && (
        <div className="bt-body">
          <div className="bt-q">
            <p>프랑스 어디?</p>
            <div className="bt-chips">
              {CITIES.map(c => <button key={c} className={'bt-chip' + (d.city === c ? ' on' : '')} onClick={() => setD(x => ({ ...x, city: x.city === c ? null : c }))}>{c}</button>)}
            </div>
          </div>
          <div className="bt-q">
            <div className="bt-lean">
              <span className={d.lean != null && d.lean < .34 ? 'on' : ''}>한국인들이<br />좋아하는 곳</span>
              <input type="range" min="0" max="1" step=".01" value={d.lean ?? .5} className={d.lean == null ? 'idle' : ''}
                onChange={e => setD(x => ({ ...x, lean: +e.target.value }))} aria-label="한국인이 좋아하는 곳 ↔ 로컬이 좋아하는 곳" />
              <span className={d.lean != null && d.lean > .66 ? 'on' : ''}>로컬이<br />좋아하는 곳</span>
            </div>
            {d.lean != null && <button className="bt-clear" onClick={() => setD(x => ({ ...x, lean: null }))}>상관없음으로</button>}
          </div>
          <div className="bt-q bt-checks">
            {[['dessert', '디저트류'], ['meal', '식사빵류']].map(([k, label]) => (
              <label key={k}><input type="checkbox" checked={d.types.includes(k)} onChange={() => flip(k)} />{label}</label>
            ))}
            <label><input type="checkbox" checked={all} onChange={() => setD(x => ({ ...x, types: all ? [] : ['dessert', 'meal'] }))} />모두</label>
          </div>
          <button className="bt-ok" onClick={() => { onApply(d); setOpen(false); }}>확인</button>
        </div>
      )}
    </div>
  );
}

export default function BlipWeb({ layer, play, t, tr }) {
  const [only, setOnly] = useState(null);
  const [tune, setTune] = useState(layer.tune0 || { city: null, lean: null, types: [] }); // 빈칸 선언에서 고른 것이 있으면 그대로 걸린 채로
  const rowsNow = layer.tune ? pickBakeries(tune) : null;
  const sections = layer.tune ? [{ type: 'rows', rows: rowsNow }] : layer.sections;
  const title = layer.tune ? `${tune.city || '프랑스'} 빵집 ${rowsNow.length}곳` : layer.title;
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
  const opens = play && !layer.detail && (!!layer.filters || !!layer.tune);
  const goRow = r => (opens ? {
    role: 'link', tabIndex: 0,
    onClick: e => { if (!e.currentTarget.hasAttribute('data-tear') && !e.target.closest('a')) dispatchEvent(new CustomEvent('blip:open', { detail: { row: r } })); }
  } : {});
  // 그림: 누끼 딴 빵 사진 (Sam's Stack처럼 떠 있는 물건 + 그림자 + 이름표). 사진이 없는 항목은 빵 그림
  const artOf = (r, i) => ({ dessert: ['croissant', 'pie'], meal: ['baguette', 'loaf'], both: ['croissant', 'baguette'] }[r.type] || ['loaf'])[i % 2];
  const Obj = ({ r, i, big }) => (r.img
    ? <img className={'fp-obj o-' + r.img} src={import.meta.env.BASE_URL + 'demo/bread/' + r.img + '.png'} alt="" draggable={false} />
    : <Bread kind={artOf(r, i)} size={big ? 104 : 58} />);

  return (
    <div className="bp-page" data-scroll="">
      <header className="bp-head">
        {layer.tune ? <h3 className="bp-title" {...tr('title', 'text')}>{title}</h3> : t('title', layer.title, 'h3', 'bp-title')}
        {layer.tune ? <Tune play={play} applied={tune} onApply={setTune} tr={tr} /> : t('dek', layer.dek, 'p', 'bp-dek')}
        <p className="bp-from" {...tr('from')}>{(layer.tune ? [...new Set(rowsNow.map(r => r.src))] : layer.srcs).filter((k, i, all) => all.findIndex(x => SOURCES[x].host === SOURCES[k].host) === i).map(k => <span key={k}>{src(k)}</span>)}</p>
      </header>
      {/* 빵집 모음: 목록 대신 신문 1면처럼 — 1곳 크게(그림+글), 다음 4곳은 2단 그림 카드, 나머지는 번호 붙은 제목만 */}
      {layer.tune && (
        <div className="fp">
          {rowsNow.length === 0 && <p className="fp-none">조건에 맞는 곳이 없어요. 상세 조정툴에서 하나를 풀어 보세요</p>}
          {rowsNow.slice(0, 1).map((r, i) => (
            <article key={r.name} className="fp-lead" {...tr('r0:' + r.name)} {...goRow(r)}>
              <div className="fp-art lead"><Obj r={r} i={i} big /><span className="fp-no">1</span><span className="fp-pill">{r.name}</span></div>
              <div className="fp-lead-txt">
                <p className="fp-kick">{r.where}{src(r.src)}</p>
                <p>{r.line}</p>
              </div>
            </article>
          ))}
          {rowsNow.length > 1 && (
            <div className="fp-grid">
              {rowsNow.slice(1, 5).map((r, j) => (
                <article key={r.name} className="fp-card" {...tr('r0:' + r.name)} {...goRow(r)}>
                  <div className="fp-art"><Obj r={r} i={j + 1} /><span className="fp-no">{j + 2}</span><span className="fp-pill">{r.name}</span></div>
                  <p className="fp-where">{r.where}{src(r.src)}</p>
                  <p className="fp-line">{r.line}</p>
                </article>
              ))}
            </div>
          )}
          {rowsNow.length > 5 && (
            <ol className="fp-more" start={6}>
              {rowsNow.slice(5).map(r => (
                <li key={r.name} {...tr('r0:' + r.name)} {...goRow(r)}>
                  <b>{r.name}</b><span>{r.where}</span>{src(r.src)}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
      {layer.bread && !layer.tune && <div className="bp-hero" {...tr('hero', 'img', { 'data-bread': layer.bread })}><Bread kind={layer.bread} size={84} /></div>}
      {layer.filters && (
        <nav className="bp-chips" aria-label="거르기" {...tr('chips')}>
          <Chip className={'bp-chip' + (!only ? ' on' : '')} onClick={play ? () => setOnly(null) : undefined}>전체</Chip>
          {layer.filters.map(f => (
            <Chip key={f} className={'bp-chip' + (only === f ? ' on' : '')} onClick={play ? () => setOnly(o => (o === f ? null : f)) : undefined}>{f}</Chip>
          ))}
        </nav>
      )}
      {!layer.tune && sections.map((sec, si) => (sec.type === 'rows' && !sec.rows.some(show) ? null : (
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
          {sec.type === 'nearmap' && <div className="bp-map" {...tr('map', 'img')}><NearMap here={sec.here} pins={sec.pins} /></div>}
          {/* 대표메뉴 모아보기: 가게마다 메뉴와 값 (고른 기준에 맞는 메뉴는 표시) */}
          {sec.type === 'menus' && sec.shops.map(sh => (
            <div key={sh.name} className="bp-menu" {...tr('menu:' + sh.name)}>
              <div className="bp-row-top"><b>{sh.name}</b>{src(sh.src)}</div>
              {sh.note && <p className="bp-menu-note">{sh.note}</p>}
              {sh.items.length ? (
                <ul>{sh.items.map(([m, p]) => <li key={m} className={sh.hit?.includes(m) ? 'hit' : undefined}><span>{m}</span><em>{p}</em></li>)}</ul>
              ) : <p className="bp-menu-note">메뉴를 아직 못 모았어요</p>}
            </div>
          ))}
          {/* 가게마다 정리된 정보 (위치 · 영업시간 · 가격대 · 특징) 또는 글 한 단락 */}
          {sec.type === 'places' && sec.places.map((pl, k) => (
            <article key={pl.name} className="bp-place" {...tr('pl:' + pl.name)}>
              <h4><span className="bp-place-no">{k + 1}</span>{pl.name}</h4>
              {pl.body && <p className="bp-place-body">{pl.body}</p>}
              {pl.facts && <dl>{pl.facts.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>}
            </article>
          ))}
          {sec.type === 'out' && (
            <ul className="bp-out">
              {sec.rows.map(r => <li key={r.name}><b>{r.name}</b><span>{r.why}</span></li>)}
            </ul>
          )}
          {sec.type === 'quote' && (
            <blockquote {...tr('q' + si)}><span>{sec.text}</span><cite>{sec.who} {src(sec.src)}</cite></blockquote>
          )}
        </section>
      )))}
    </div>
  );
}
