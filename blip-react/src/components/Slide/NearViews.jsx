import { useState } from 'react';
import { useInnerBack } from './innerBack';
import { project } from '../Map/NearMap';
import { nearData } from '../../data/near';
import './NearViews.css';

// "지금 내 주변 맛있는 빵집"의 결과 — 고른 기준대로 거른 곳을 세 가지로: 지도 · 리스트 · 대표메뉴
// 출처 꼬리표 대신 사진 · 스티커 · 경로로 (콜라주처럼). 빵 사진은 메뉴 '종류' 예시 누끼 (가게 실제 사진 아님)
const W = 390, H = 488; // 카드 한 장. 웹형이면 지도 폭(w)을 넓혀서 넘김
const hero = s => s.menus.find(m => m.img);
const Credit = () => null; // 화면에 출처 줄은 넣지 않음 (2026-11-23 사용자 요청). 사진 출처 · 라이선스는 public/demo/menu/CREDITS.txt
// 맨 위 검색 문장: 누르면(Cmd 없이) 빈칸 선언이 그 자리에 다시 열림 — 처음 쓴 문장 · 고른 기준이 채워진 채로 → 고쳐서 다시 검색
const Pill = ({ text, again }) => (
  <div className={'nv-pill' + (again ? ' again' : '')} role={again ? 'button' : undefined} title={again ? '눌러서 다시 검색' : undefined}
    onClick={again ? e => { const r = e.currentTarget.getBoundingClientRect(); again(r); } : undefined}>
    <i aria-hidden="true">📍</i><span>{text}</span>{again && <em className="nv-again" aria-hidden="true">↻</em>}
  </div>
);
const Unread = ({ list }) => (list?.length ? <p className="nv-unread">{list.map(u => `‘${u}’`).join(', ')}는 아직 거를 수 없어 반영하지 못했어요</p> : null);
const Empty = () => <p className="nv-empty">조건에 맞는 곳이 없어요.<br />빈칸 하나를 ‘전부’로 풀어 보세요</p>;

function Polaroid({ s, big, sm, go, tr = () => ({}), id }) {
  const h = hero(s);
  return (
    <div {...tr(id || 'pol:' + s.name, 'img')} className={'nv-pol' + (big ? ' big' : '') + (sm ? ' sm' : '') + (go ? ' go' : '')} onClick={go ? () => go(s) : undefined}>
      <span className="nv-no">{s.n}</span>
      <div className="nv-ph">{h ? <img src={h.img} alt="" draggable={false} /> : <b className="nv-noimg">🥖</b>}</div>
      <mark className="nv-tag">{s.short}</mark>
    </div>
  );
}

// 지도: 실제 지도 바탕 + 나 → 가까운 순 경로 + 걸어서 걸리는 시간 + 번호 붙은 사진 카드(양옆에 차례로, 가는 선으로 핀과 이음)
function MapBody({ L, H, top = 76, children, go, tr, w = W }) {
  // 가게가 많거나 지도가 낮으면 카드를 작게 (양옆에 겹치지 않고 들어가게)
  const sm = L.shops.length > 2 || H < 400, CW = sm ? 76 : 98, CH = sm ? 100 : 132;
  const { tiles, at } = project([L.here, ...L.shops], w, H, 230, Math.min(230, H * .45), 16);
  const me = at(L.here), pts = L.shops.map(at);
  const path = [me, ...pts];
  const seg = path.slice(1).map((p, i) => {
    const a = path[i], b = i ? L.shops[i - 1] : L.here, c = L.shops[i];
    const km = Math.hypot((c.lon - b.lon) * 88.2, (c.lat - b.lat) * 111.2); // 그 사이 직선거리
    return { x: (a.left + p.left) / 2, y: (a.top + p.top) / 2, min: Math.round((km * 1000) / 80) };
  });
  // 카드 자리: 핀이 왼쪽이면 왼쪽 가장자리, 오른쪽이면 오른쪽. 같은 쪽끼리는 위에서부터 겹치지 않게
  const next = { l: top, r: top };
  const cards = L.shops.map((s, i) => ({ s, i, p: pts[i] })).sort((a, b) => a.p.top - b.p.top).map(c => {
    let side = c.p.left < w / 2 ? 'l' : 'r';
    if (next[side] > H - CH - 8) side = side === 'l' ? 'r' : 'l';
    const top = Math.min(H - CH - 8, Math.max(next[side], c.p.top - CH / 2));
    next[side] = top + CH + 10;
    return { ...c, left: side === 'l' ? 10 : w - CW - 10, top, side };
  });
  return (
    <div className="nv-mapbox" style={{ height: H, width: w }}>
      {tiles.map(t => <img key={t.key} className="nv-tile" alt="" draggable={false} src={t.src} style={{ left: t.left, top: t.top }} />)}
      <div className="nv-shade" />
      <svg className="nv-route" viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
        {cards.map(c => <line key={c.i} className="nv-lead" x1={c.side === 'l' ? c.left + CW : c.left} y1={c.top + CH / 2} x2={c.p.left} y2={c.p.top - 14} />)}
        <polyline points={path.map(p => `${p.left},${p.top}`).join(' ')} />
      </svg>
      {seg.map((g, i) => <span key={i} className="nv-time" style={{ left: g.x, top: g.y, '--i': i }}>걸어서 {g.min}분</span>)}
      <span className="nv-me" style={me}><i /></span>
      {L.shops.map((s, i) => <span key={s.name} className="nv-pin" style={{ ...pts[i], '--i': i }}>📍</span>)}
      {cards.map(c => (
        <div key={c.s.name} className="nv-onmap" style={{ left: c.left, top: c.top, '--i': c.i, '--r': (c.side === 'l' ? -3 : 3) + 'deg' }}><Polaroid s={c.s} sm={sm} go={go} tr={tr} id={'mpol:' + c.s.name} /></div>
      ))}
      {children}
      {!L.shops.length && <Empty />}
      <a className="nv-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
    </div>
  );
}

// 리스트: 가까운 순으로 큰 사진 카드 + 스티커(거리 · 별점 · 오늘 영업)
function ListBody({ L, go, tr }) {
  return (<>
    {!L.shops.length && <Empty />}
    {L.shops.map((s, i) => (
      <article key={s.name} {...tr('row:' + s.name)} className={'nv-row' + (i % 2 ? ' alt' : '') + (go ? ' go' : '')} onClick={go ? () => go(s) : undefined}>
        <Polaroid s={s} big />
        <div className="nv-info">
          <h4>{s.name}</h4>
          <p>{s.area}</p>
          <div className="nv-stk">
            <span className="s-walk">{s.dist.toFixed(1)}km · 걸어서 {s.walk}분{s.approx ? ' (대략)' : ''}</span>
            <span className="s-star">{s.rating ? `★ ${s.rating} · ${s.nr}명` : '별점 모름'}</span>
            <span className="s-time">{s.today}</span>
          </div>
          {s.menus.length > 0 && <p className="nv-mn">{s.menus.slice(0, 3).map(m => m.name).join(' · ')}</p>}
        </div>
      </article>
    ))}
  </>);
}

// 대표 빵: 누끼 빵이 떠 있고 값은 꼬리표로. 고른 기준(예: 겉바속촉)에 맞는 메뉴엔 파란 스티커
function MenuBody({ L, go, tr }) {
  return (<>
    {!L.shops.length && <Empty />}
    {L.shops.map(s => (
      <section key={s.name} className="nv-shop">
        <h4 className={go ? 'go' : undefined} onClick={go ? () => go(s) : undefined}><span className="nv-no sm">{s.n}</span>{s.short}{go && <i className="nv-chev">›</i>}</h4>
        {s.note && <p className="nv-note">{s.note}</p>}
        <div className="nv-grid">
          {s.menus.map((m, j) => (
            <figure key={m.name} {...tr('mn:' + s.name + ':' + m.name, 'img')} className={'nv-item' + (m.img ? '' : ' noimg') + (go ? ' go' : '')} style={{ '--r': ((j % 3) - 1) * 4 + 'deg' }} onClick={go ? () => go(s, m.name) : undefined}>
              {m.img ? <img src={m.img} alt="" draggable={false} /> : <b>🥐</b>}
              {m.hit && <span className="nv-hit">맞는 메뉴</span>}
              <figcaption><span>{m.name}</span>{m.price && <em>{m.price}</em>}</figcaption>
            </figure>
          ))}
          {!s.menus.length && <p className="nv-note">메뉴를 아직 못 모았어요</p>}
        </div>
      </section>
    ))}
  </>);
}

// 한 곳의 정보: 누르면 그 자리에 펼쳐짐. 사진 · 정보 · 영업시간 · 메뉴 · 지도 하나하나가 Cmd로 뜯어 오른쪽에 담을 수 있는 조각
// 주문하기 · 예약하기 · 후기보기: 확인한 것만 (전화 · 영업시간 · 다이닝코드 후기). 온라인 주문/예약은 확인 못 했다고 밝힘
function Acts({ s, pick, T }) {
  const [act, setAct] = useState(null);
  const m = pick && s.menus.find(x => x.name === pick);
  const B = [['order', '주문하기'], ['book', '예약하기'], ['review', '후기보기']];
  const tel = s.phone && <a className="nv-tel" href={'tel:' + s.phone.replace(/-/g, '')}>📞 {s.phone}</a>;
  return (
    <section className="nv-acts" {...T('acts')}>
      {m && <p className="nv-pick">고른 빵 <b>{m.name}</b>{m.price && <em>{m.price}</em>}</p>}
      <div className="nv-abtn">
        {B.map(([k, label]) => <button key={k} data-askctx={k} className={act === k ? 'on' : undefined} onClick={() => setAct(a => (a === k ? null : k))}>{label}</button>)}
      </div>
      {act === 'order' && (
        <div className="nv-apanel" {...T('order')}>
          <b>{m ? `${m.name} ${m.price ? '· ' + m.price : ''} 주문` : `${s.short}에서 주문`}</b>
          {tel ? <p>전화로 주문할 수 있어요 {tel}</p> : <p>전화번호를 아직 못 찾았어요</p>}
          <p className="nv-anote">오늘 {s.today.replace(/^오늘 /, '')} · 온라인 주문이 되는지는 아직 확인하지 못했어요</p>
        </div>
      )}
      {act === 'book' && (
        <div className="nv-apanel" {...T('book')}>
          <b>{s.short} 예약</b>
          {tel ? <p>전화로 예약을 물어볼 수 있어요 {tel}</p> : <p>전화번호를 아직 못 찾았어요</p>}
          <p className="nv-anote">{s.week} · 온라인 예약이 되는지는 아직 확인하지 못했어요</p>
        </div>
      )}
      {act === 'review' && (
        <div className="nv-apanel" {...T('review')}>
          <b>{s.rating ? `다이닝코드 ★ ${s.rating} · ${s.nr}명` : '별점은 아직 몰라요'}</b>
          {s.reviews.length ? <ul>{s.reviews.map(r => <li key={r}>“{r}”</li>)}</ul> : <p>모아 둔 후기 문장이 아직 없어요</p>}
          {s.url && <a className="nv-alink" href={s.url} target="_blank" rel="noreferrer">다이닝코드에서 후기 더 보기 ›</a>}
        </div>
      )}
    </section>
  );
}

function Detail({ s, L, back, tr, pick0, web }) {
  const [pick, setPick] = useState(pick0 || null); // 고른 빵 (메뉴를 누르면)
  const h = (pick && s.menus.find(x => x.name === pick && x.img)) || hero(s);
  const T = (id, kind) => tr('d:' + s.name + ':' + id, kind);
  return (
    <div className="nv-detail" data-scroll="">
      <div className="nv-dbar"><button onClick={back} aria-label="뒤로">‹</button><span>내 주변 빵집</span></div>
      <div className="nv-dhero" {...T('hero', 'img')}>
        {h ? <img src={h.img} alt="" draggable={false} /> : <b>🥖</b>}
        <mark className="nv-htag">{s.short}</mark>
      </div>
      <section className="nv-dinfo" {...T('info')}>
        <h3>{s.name}</h3>
        <p>{s.area}</p>
        <div className="nv-stk">
          <span className="s-walk">{s.dist.toFixed(1)}km · 걸어서 {s.walk}분{s.approx ? ' (대략)' : ''}</span>
          <span className="s-star">{s.rating ? `★ ${s.rating} · ${s.nr}명` : '별점 모름'}</span>
        </div>
      </section>
      <Acts s={s} pick={pick} T={T} />
      <section className="nv-dsec" {...T('hours')}>
        <h5>영업시간</h5>
        <p className="nv-today">{s.today}</p>
        <p className="nv-week">{s.week}</p>
      </section>
      <section className="nv-dsec" {...T('menu')}>
        <h5>대표 메뉴</h5>
        {s.note && <p className="nv-note">{s.note}</p>}
        {s.menus.length ? (
          <ul className="nv-dmenu">
            {s.menus.map(m => (
              <li key={m.name} {...T('m:' + m.name, 'img')} className={(m.hit ? 'hit' : '') + (pick === m.name ? ' picked' : '')} onClick={() => setPick(p => (p === m.name ? null : m.name))}>
                <span className="nv-dm-img">{m.img ? <img src={m.img} alt="" draggable={false} /> : '🥐'}</span>
                <span className="nv-dm-n">{m.name}</span><em>{m.price}</em>
              </li>
            ))}
          </ul>
        ) : <p className="nv-note">메뉴를 아직 못 모았어요</p>}
      </section>
      <section className="nv-dsec loc" {...T('map', 'img')}>
        <h5>위치</h5>
        <MapBody L={{ ...L, shops: [{ ...s, n: s.n }] }} H={200} top={10} w={web ? 868 : W} />
      </section>
      <Credit />
    </div>
  );
}

export default function NearViews({ layer, play, tr = () => ({}) }) {
  const picks = layer.picks || {};
  const [sel, setSel] = useState(null); // 펼쳐 본 가게
  useInnerBack(!!sel, () => setSel(null), play); // 왼쪽 아래 '뒤로' = 가게 화면 닫기
  const L = nearData(picks);
  const go = play ? (s, menu) => setSel({ name: s.name, menu }) : undefined; // 가게를 누르면 가게, 빵을 누르면 그 빵을 고른 채로
  const cur = sel && L.shops.find(x => x.name === sel.name);
  const P = { L, go, tr };
  const again = play && layer.q ? r => dispatchEvent(new CustomEvent('blip:research', { detail: { q: layer.q, picks, rect: { x: r.left, y: r.top, w: r.width, h: r.height } } })) : undefined;
  // 필터 줄은 두지 않음 — 기준은 검색 문장을 누르면 열리는 입력창에서 바꿈 (2026-11-23 사용자 요청)
  const top = <Pill text={L.sentence} again={again} />;
  const detail = cur && <Detail key={cur.name + (sel.menu || '')} s={cur} L={L} back={() => setSel(null)} tr={tr} pick0={sel.menu} web={layer.web} />;
  // 펼친 가게는 스크롤 바깥에 겹쳐 뜸 (스크롤된 자리와 상관없이 화면을 덮음)
  const wrap = body => <div className="nv-wrap">{body}{detail}</div>;
  if (layer.view === 'map') return wrap(<div className="nv nv-map"><MapBody {...P} H={H} top={150} w={layer.web ? 868 : W}><div className="nv-over">{top}</div></MapBody></div>);
  if (layer.view === 'list') return wrap(<div className="nv nv-list" data-scroll="">{top}<Unread list={L.unread} /><p className="nv-count"><b>{L.left}곳</b> / {L.total}곳</p><ListBody {...P} /><Credit /></div>);
  if (layer.view === 'menu') return wrap(<div className="nv nv-menu" data-scroll="">{top}<MenuBody {...P} /><Credit /></div>);
  // 포털: 아무것도 고르지 않고 검색했을 때 — 한 페이지에 지도 → 리스트 → 대표 빵 (네이버 검색 결과처럼 블록이 이어짐)
  return wrap(
    <div className="nv nv-portal" data-scroll="">
      {top}
      <Unread list={L.unread} />
      <section className="nv-blk mapb">
        <h5>지도 <small>{L.left}곳 / {L.total}곳</small></h5>
        <div {...tr('map', 'img')}><MapBody {...P} H={380} top={12} w={layer.web ? 400 : W} /></div>
      </section>
      <section className="nv-blk list">
        <h5>리스트로 보기</h5>
        <ListBody {...P} />
      </section>
      <section className="nv-blk menu">
        <h5>대표 빵 보기</h5>
        <MenuBody {...P} />
      </section>
      <Credit />
    </div>
  );
}
