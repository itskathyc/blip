import { Bread } from '../Art/Bread';
import { WEB, MENU_COLOR, YEONNAM } from '../../data/web';
import { BREADS, breadFor } from '../../data/breads';
import { fitOf } from '../../data/me';
import { usePlay, answer } from '../../data/play';
import Shape, { LINE_KINDS } from '../Edit/Shape';
import BlipWeb from './BlipWeb';
import Reader from './Reader';
import { Videos, Coupang, Quiz } from './Duo';
import YtFeed from './YtFeed';
import MiniMap from '../Map/MiniMap';
import MapChat from '../Map/MapChat';
import './Slide.css';
import './WebOrig.css';

const PINS = [[96, 150], [258, 118], [300, 262], [140, 300], [226, 382]];

function MapBg({ children }) {
  return (
    <svg className="map" viewBox="0 0 390 488" aria-hidden="true">
      <rect width="390" height="488" fill="#e7f0e9" />
      <path d="M-10 120C80 140 160 90 260 130S420 150 420 150" stroke="#fff" strokeWidth="18" fill="none" />
      <path d="M120 -10C140 120 100 240 160 330S170 520 170 520" stroke="#fff" strokeWidth="14" fill="none" />
      <path d="M-10 360C90 330 220 380 420 320" stroke="#fff" strokeWidth="12" fill="none" />
      <path d="M300 -10C290 120 330 260 300 520" stroke="#fff" strokeWidth="10" fill="none" />
      <ellipse cx="300" cy="190" rx="54" ry="36" fill="#cfe5d5" />
      {children}
    </svg>
  );
}

// 지도 핀 = HTML 한 덩어리(핀 + 이름표). svg 조각은 끌 수 없어서, 찢어 올 수 있게 HTML로
function Pin({ x, y, big, label, attrs }) {
  const s = big ? 1.5 : 1;
  return (
    <span className="pin" {...attrs} style={{ left: x, top: y - 26 * s, ...attrs?.style }}>
      <svg width={32 * s} height={44 * s} viewBox="-16 -26 32 44" aria-hidden="true">
        <path d="M0 -26c9 0 16 7 16 16C16 2 0 18 0 18S-16 2-16-10c0-9 7-16 16-16z" fill="#e2483d" />
        <circle cy="-10" r="5.5" fill="#fff" />
      </svg>
      {label && <span className="pinlabel">{label}</span>}
    </span>
  );
}

// 찢어 온 조각: 원본은 그대로, 여기엔 복사본 + 출처 점(•)
export function Piece({ p, styles, sel, wiggle }) {
  const st = styles?.['piece:' + p.id] || {};
  // 최소화: 아이콘 하나 + 이름 (누르면 다시 원래 모양)
  if (p.min) {
    const src = p.src || p.html?.match(/<img[^>]+src="([^"]+)"/)?.[1];
    const label = p.name || (p.text || '').split(/\s+/).slice(0, 2).join(' ') || '조각';
    return (
      <div className={'pc pc-mini' + (sel ? ' is-sel' : '')} data-piece={p.id} style={{ left: p.x, top: p.y }}>
        <b className="pcm-ic" data-min={p.id} role="button" aria-label={label + ' 펼치기'} title="펼치기">
          {src ? <img src={src} alt="" draggable={false} /> : <span>{label[0]}</span>}
        </b>
        <em data-min={p.id}>{label}</em>
      </div>
    );
  }
  return (
    <div className={'pc pc-' + p.kind + (p.html ? ' pc-html' : '') + (p.fold ? ' folded' : '') + (p.shape ? ' pc-' + p.shape + (LINE_KINDS.has(p.shape) ? ' pc-ln' : '') : '') + (sel ? ' is-sel' : '') + (wiggle ? ' wig' : '')} data-piece={p.id}
      style={{ left: p.x, top: p.y, '--s': p.scale || 1, color: st.color, fontSize: st.fontSize, borderRadius: st.borderRadius }}>
      {p.html ? <div className="pc-body" dangerouslySetInnerHTML={{ __html: p.html }} />
        : p.kind === 'shape' ? <Shape shape={p.shape} w={p.w} h={p.h} fx={p.fx} fy={p.fy} pts={p.pts} />
        : p.kind === 'note' ? <span data-ptext>{p.text}</span>
        : p.kind === 'media' ? (p.media === 'video' ? <video src={p.src} width={p.w} muted loop autoPlay playsInline /> : <img src={p.src} width={p.w} alt="" draggable={false} />)
        : p.kind === 'img' ? <Bread kind={breadFor(p.bread)} size={110} />
        // 빈칸에서 선언한 새 아이템: 선언한 빈칸의 자리·크기 그대로 굳은 상자 (두 번 탭으로 이름 고치기)
        // 채우기 칸: 아직 비활성(반투명). 모양에 맞는 자리표시(글줄·그림·목록), 두 번 탭해 쓰는 순간 선명
        : p.kind === 'map' ? <MiniMap cfg={p.cfg} pins={p.pins} miss={p.miss} merge={p.merge} name={p.text} />
        : p.kind === 'item' ? <span className="pc-item-box" style={{ width: p.w, height: p.h }}><b aria-hidden="true">{p.text?.[0]}</b><em data-ptext>{p.text}</em></span>
        : <span>{p.text}</span>}
      {p.from && <i className="pc-from" data-from={p.from.id} title={'‘' + p.from.title + '’에서'} />}
      {/* 가져온 컴포넌트: 모양 그대로, 펼치기 · 접기 */}
      {/* 최소화 버튼: 왼쪽 위 */}
      {!wiggle && <b className="pc-min" data-min={p.id} role="button" aria-label="최소화" title="최소화"><i /></b>}
      {p.html && <b className="pc-fold" data-fold={p.id} role="button" aria-label={p.fold ? '펼치기' : '접기'} title={p.fold ? '펼치기' : '접기'}>{p.fold ? '▸' : '▾'}</b>}
      {wiggle && <b className="pc-x" data-del={p.id} role="button" aria-label="조각 지우기">×</b>}
    </div>
  );
}

// 슬라이드 한 장.
// interactive: 내 판(편집) — 기본이 컴포넌트 쪼개기. 글자(data-el)와 컴포넌트(data-comp) 모두
//   고르고(탭)·옮기고(누른 채 이동)·크기 바꾸고(핀치)·지울(꾹 → ×) 수 있음. 글자는 두 번 탭으로 고쳐 쓰기
//   옮긴 자리·크기·지움은 layer.moves[key] = { dx, dy, s, r, hide }
// tear: 왼쪽 원본 — 요소마다 data-tear가 붙어 조각으로 찢어 올 수 있음
// me: Insert ME — 미리 채워진 것 없이 처음 상태(바닐라)로 보여주고, 내가 직접 적고 고름
//   { picks, fields, onPick(i), onField(key, value) }
// play: 캐러셀에 크게 떠서 직접 해 볼 수 있는 상태 (썸네일은 아님 — 썸네일 안에 버튼을 두지 않음)
export default function Slide({ layer, interactive = false, tear = false, sel = null, wiggle = false, me = null, play = false, onPick }) {
  const texts = layer.texts || {}, styles = layer.styles || {}, moves = layer.moves || {};
  const ans = usePlay(layer.app); // 같은 콘텐츠 안에서 앞 장에 고른 답
  const Btn = play || interactive ? 'button' : 'span';

  // 옮긴 자리·크기 (CSS의 translate·scale 속성이라 원래 transform과 겹치지 않음)
  const mv = key => {
    const o = moves[key];
    if (!o) return undefined;
    return {
      translate: `${o.dx || 0}px ${o.dy || 0}px`, scale: o.s ?? undefined,
      borderRadius: o.r ? '999px' : undefined, overflow: o.r ? 'hidden' : undefined,
      display: o.hide ? 'none' : undefined
    };
  };

  // 글자 요소 하나. 텍스트가 바뀌면 key가 바뀌어 새로 그려짐(고쳐 쓴 DOM과 React가 엉키지 않게)
  const t = (k, def, tag = 'p', cls = '') => {
    const Tag = tag;
    const text = texts[k] ?? def;
    const attrs = interactive ? { 'data-el': k } : tear ? { 'data-tear': 'el:' + k, 'data-kind': 'text', draggable: true } : {};
    return <Tag key={k + ':' + text} className={cls + ' tx' + (sel === k ? ' is-sel' : '')} style={interactive ? { ...styles[k], ...mv(k) } : styles[k]} {...attrs}>{text}</Tag>;
  };

  // 컴포넌트 하나: 왼쪽 원본에선 찢을 단위, 오른쪽 내 판에선 옮길 수 있는 단위
  const tr = (id, kind = 'comp', extra = {}) => {
    if (tear) return { 'data-tear': id, 'data-kind': kind, draggable: true, ...extra };
    // 사진·그림은 Cmd 없이도 그냥 잡아서 오른쪽으로 끌 수 있음 (왼쪽 읽기에서)
    if (play && !interactive && kind === 'img') return { 'data-tear': id, 'data-kind': kind, draggable: true, ...extra };
    if (interactive) return { 'data-comp': id, 'data-sel': sel === 'comp:' + id ? '' : undefined, style: mv(id) };
    return moves[id] ? { style: mv(id) } : {};
  };

  const root = (cls, bg, children) => (
    <div className={'sl ' + cls} style={{ background: styles.bg?.background || bg }}>
      {children}
      {layer.pieces?.map(p => <Piece key={p.id} p={p} styles={styles} sel={sel === 'piece:' + p.id} wiggle={wiggle} />)}
    </div>
  );

  switch (layer.kind) {
    case 'profile':
      return root('', '#f6e9d7', <>
        {t('kick', '빵 궁합 테스트', 'p', 'kick')}
        {t('big', '당신은\n누구신가요?', 'h2', 'big')}
        {me
          ? (
            <div className="tags me-form">
              {['생년월일', '성별', '식습관', '알레르기'].map(x => (
                <label key={x} className={me.fields[x] ? 'filled' : undefined}>
                  <em>{x}</em>
                  <input value={me.fields[x] || ''} onChange={e => me.onField(x, e.target.value)} placeholder="적어주세요" spellCheck={false} />
                </label>
              ))}
            </div>
          )
          : <div className="tags" {...tr('tags')}>{['생년월일', '성별', '식습관', '알레르기'].map(x => <span key={x} {...tr('tag:' + x)}>{x}</span>)}</div>}
        <span className="art br" {...tr('art', 'img', { 'data-bread': '소금빵' })}><Bread kind="salt" size={210} /></span>
      </>);
    case 'pick': {
      const picked = me ? me.picks.map(n => BREADS.indexOf(n)) : layer.picked || [0, 2, 5];
      return root('', '#fff', <>
        {t('mid', '좋아하는 빵을\n골라주세요', 'h2', 'mid')}
        <div className="pickgrid" {...tr('pickgrid')}>
          {BREADS.map((name, i) => {
            const cls = 'pickitem' + (picked.includes(i) ? ' sel' : '');
            const inner = <><Bread kind={breadFor(name)} size={62} /><b>{name}</b></>;
            if (me) return <button key={name} className={cls} onClick={() => me.onPick(i)}>{inner}</button>;
            return interactive
              ? <button key={name} className={cls} onClick={() => onPick(i)}>{inner}</button>
              : <span key={name} className={cls} {...tr('pick:' + name, 'img', { 'data-bread': name })}>{inner}</span>;
          })}
        </div>
      </>);
    }
    case 'result': {
      // 바닐라: 내가 아직 안 골랐으면 점수 자리가 비어 있음
      const trio = me ? me.picks.slice(0, 3).map(n => [n, fitOf(n, me.picks) + '%']) : [['소금빵', '96%'], ['크루아상', '91%'], ['베이글', '88%']];
      const score = !me ? 92 : trio.length ? Math.round(trio.reduce((a, [, p]) => a + parseInt(p), 0) / trio.length) : null;
      return root('dark', '#161616', <>
        {t('kick', '나와 빵의 궁합', 'p', 'kick')}
        {score === null
          ? <p className="me-wait">앞 장에서 좋아하는 빵을 고르면 여기에 점수가 나와요</p>
          : <div className="huge" {...tr('huge')}>{score}<span>점</span></div>}
        <div className="trio" {...tr('trio')}>
          {trio.map(([n, p]) => (
            <div key={n} {...tr('trio:' + n, 'img', { 'data-bread': n })}><Bread kind={breadFor(n)} size={72} /><b>{n}</b><span>{p}</span></div>
          ))}
        </div>
      </>);
    }
    case 'location':
      return root('flush', undefined, <>
        <MapBg><circle cx="195" cy="250" r="110" fill="rgba(47,124,246,.12)" stroke="#2f7cf6" strokeWidth="2" strokeDasharray="6 6" /></MapBg>
        <Pin x={195} y={250} big attrs={tr('pin:me')} />
        {t('chip', '연남동 · 반경 1km', 'div', 'mapchip')}
      </>);
    case 'nearby':
      return root('flush', undefined, <>
        <MapBg />
        {YEONNAM.slice(0, 5).map((w, i) => <Pin key={w.t} x={PINS[i][0]} y={PINS[i][1]} label={w.t} attrs={tr('pin:' + w.t, 'comp', { 'data-bread': w.m })} />)}
        {t('chip', '연남동 빵집 ' + YEONNAM.length + '곳', 'div', 'mapchip')}
      </>);
    case 'best': {
      const w = YEONNAM[0];
      return root('', MENU_COLOR[w.m], <>
        {t('kick', '이 동네 BEST', 'p', 'kick')}
        {t('big', w.t, 'h2', 'big')}
        {t('pill', w.m, 'span', 'pill')}
        <span className="art br" {...tr('art', 'img', { 'data-bread': w.m })}><Bread kind={breadFor(w.m)} size={230} /></span>
      </>);
    }
    case 'bakery':
      return root('', '#fff', <>
        {t('mid', '궁합 빵\n맛집 TOP 3', 'h2', 'mid')}
        <ol className="toplist" {...tr('toplist')}>
          {['소금빵', '크루아상', '베이글'].map((m, i) => {
            const w = WEB.find(x => x.m === m);
            return <li key={m} {...tr('top:' + m, 'shop', { 'data-bread': m })}><span className="no">{i + 1}</span><Bread kind={breadFor(m)} size={52} /><span><b>{w.t}</b><em>{m} · {w.a}</em></span></li>;
          })}
        </ol>
      </>);
    case 'card':
      return root('', layer.color || '#f3f2ee', <>
        {t('kick', layer.sub, 'p', 'kick')}
        {t('big', layer.head, 'h2', 'big')}
        <div className="stickers" {...tr('stickers')}>{layer.lines.map(l => <span key={l} {...tr('st:' + l)}>{l}</span>)}</div>
        <span className="art br small" {...tr('art', 'img')}><Bread kind={layer.bread || 'loaf'} size={150} /></span>
      </>);
    case 'web': {
      const w = layer.w;
      return root('center', MENU_COLOR[w.m] || '#f3f2ee', <>
        <span {...tr('art', 'img', { 'data-bread': w.m })}><Bread kind={breadFor(w.m)} size={210} /></span>
        {t('mid', w.t, 'h2', 'mid')}
        {t('pill', w.a + ' · ' + w.m, 'span', 'pill')}
      </>);
    }
    // 고르는 기준 하나 = 질문 + 두 갈래. 갈래마다 불러온 글에서 나눈 빵들
    case 'criterion':
      return root('crit', '#fbf7f0', <>
        {t('kick', '고르는 기준', 'p', 'kick')}
        {t('q', layer.q, 'h2', 'mid')}
        <div className="cr-choices">
          {layer.choices.map((c, i) => (
            <div className="cr-ch" key={i} {...tr('ch' + i, 'comp', { 'data-traits': layer.trait })}>
              {t('c' + i, c.label, 'b', 'cr-label')}
              <div className="cr-breads">
                {c.breads.slice(0, 4).map(b => <span key={b} {...tr('cb' + i + ':' + b, 'img', { 'data-bread': b })}><Bread kind={breadFor(b)} size={40} /><em>{b}</em></span>)}
                {!c.breads.length && <i>아직 없음</i>}
              </div>
            </div>
          ))}
        </div>
      </>);
    // ---------- 블립이 가져온 웹 원본 (data/found.js): 꼴을 바꾸지 않고 원래 모습 그대로 ----------
    case 'video':
      return root('flush vid', '#fff', <>
        <div className="vd-player" style={{ background: layer.bg }} {...tr('player', 'img', { 'data-bread': layer.bread })}>
          <Bread kind={layer.bread} size={150} />
          <i className="vd-play" aria-hidden="true" />
          <span className="vd-bar"><b style={{ width: layer.at }} /></span>
          <span className="vd-dur">{layer.dur}</span>
        </div>
        <div className="vd-body">
          {t('title', layer.title, 'h3', 'vd-title')}
          {t('meta', layer.channel + ' · ' + layer.views, 'p', 'vd-meta')}
          <ol className="vd-ch" {...tr('chapters')}>
            {layer.chapters.map(([tm, s], i) => <li key={tm} {...tr('ch' + i)}><b>{tm}</b><span>{s}</span></li>)}
          </ol>
        </div>
      </>);
    case 'article':
      return root('flush art-pg', '#fff', <>
        <p className="ar-src"><b>{layer.blog}</b> · {layer.date}</p>
        {t('title', layer.title, 'h3', 'ar-title')}
        {layer.bread && <div className="ar-img" style={{ background: layer.tint }} {...tr('img', 'img', { 'data-bread': layer.bread })}><Bread kind={layer.bread} size={104} /></div>}
        {layer.paras.map((x, i) => t('p' + i, x, 'p', 'ar-p'))}
      </>);
    // ---------- AI안경 이슈 몰아보기 (data/aiglass.js) ----------
    case 'ytfeed':
      return root('flush duo', '#f5f5f7', <YtFeed layer={layer} play={play} tr={tr} />);
    // ---------- 아이폰 듀오 살까말까 (data/duo.js) ----------
    case 'videos':
      return root('flush duo', '#f5f5f7', <Videos layer={layer} play={play} tr={tr} />);
    case 'coupang':
      return root('flush duo', '#f5f5f7', <Coupang play={play} tr={tr} />);
    case 'quiz':
      return root('flush duo', '#f5f5f7', <Quiz layer={layer} ans={ans} play={play} tr={tr} />);
    // ---------- 원문 다시 보기 (data/trip.js READER): 기사 생김새 그대로 ----------
    // ---------- 지도 설계 대화 (오른쪽 아이템 우클릭 → '…설계') ----------
    case 'mapchat':
      return root('flush mapc', '#fff', <MapChat layer={layer} play={play} />);
    case 'reader':
      return root('flush rdr', '#fff', <Reader layer={layer} play={play} tr={tr} />);
    // ---------- 블립이 엮은 웹페이지 (data/trip.js): 넘기지 않고 스크롤 ----------
    case 'blipweb':
      return root('flush bp', '#fff', <BlipWeb layer={layer} play={play} t={t} tr={tr} />);
    // ---------- 웹 원문 한 장 (data/trip.js): 새 창처럼 — 주소창, 출처, 요약, 맨 아래 원문 링크 ----------
    case 'webpage': {
      const Open = play ? 'a' : 'span';
      return root('flush wp', '#fff', <>
        <div className="wp-bar" aria-hidden="true"><i /><i /><i /><span className="wp-url">{layer.host}</span></div>
        <div className="wp-body">
          <p className="wp-src"><b>{layer.site}</b> · {layer.sec || layer.date}</p>
          {t('title', layer.title, 'h3', 'wp-title')}
          {layer.dek && t('dek', layer.dek, 'p', 'wp-dek')}
          {layer.bread && <div className="wp-hero" style={{ background: layer.tint }} {...tr('hero', 'img', { 'data-bread': layer.bread })}><Bread kind={layer.bread} size={96} /></div>}
          {layer.items && (
            <ul className="wp-items">
              {layer.items.map(([h, d], i) => <li key={h} {...tr('it' + i)}><b>{h}</b><span>{d}</span></li>)}
            </ul>
          )}
          {layer.paras?.map((x, i) => t('p' + i, x, 'p', 'wp-p'))}
          {layer.quote && <blockquote className="wp-q" {...tr('quote')}><span>{layer.quote[0]}</span><cite>{layer.quote[1]}</cite></blockquote>}
        </div>
        <div className="wp-foot">
          <Open className="wp-open" {...(play ? { href: layer.url, target: '_blank', rel: 'noopener noreferrer' } : {})}>{layer.by} · 원문 ↗</Open>
          {layer.more > 0 && <span className="wp-more">넘기면 {layer.more}장 더</span>}
        </div>
      </>);
    }
    // ---------- 넘기며 직접 해 보는 장들 (data/starters.js) ----------
    case 'cover':
      return root('play', layer.color, <>
        <span className="pl-emoji" {...tr('emoji')}>{layer.emoji}</span>
        {t('kick', layer.kick, 'p', 'kick')}
        {t('big', layer.head, 'h2', 'big')}
        {t('sub', layer.sub, 'p', 'pl-sub')}
        <span className="pl-next" aria-hidden="true">넘기기 →</span>
      </>);
    case 'choice': {
      const cur = ans[layer.key];
      return root('play', layer.color, <>
        {t('q', layer.q, 'h2', 'mid')}
        <div className="pl-opts" {...tr('opts')}>
          {layer.opts.map(([label, emoji], i) => (
            <Btn key={label} className={'pl-opt' + (cur === label ? ' on' : '')} {...tr('opt' + i)}
              onClick={Btn === 'button' ? () => answer(layer.app, layer.key, cur === label ? undefined : label) : undefined}>
              <span>{emoji}</span><b>{label}</b>
            </Btn>
          ))}
        </div>
        {layer.note && t('note', layer.note, 'p', 'pl-note')}
      </>);
    }
    case 'verdict': {
      const r = layer.decide?.(ans);
      return root('play dark', layer.color, r
        ? <>
          {t('kick', r.kick, 'p', 'kick')}
          <div className="pl-big" {...tr('big')}>{r.big}</div>
          <p className="pl-sub" {...tr('sub')}>{r.sub}</p>
          <ul className="pl-lines" {...tr('lines')}>{r.lines.map(x => <li key={x}>{x}</li>)}</ul>
        </>
        : <p className="me-wait">앞 장에서 고르면 여기에 결과가 나와요</p>);
    }
    case 'checklist': {
      const items = typeof layer.items === 'function' ? layer.items(ans) : layer.items;
      const done = ans[layer.key] || [];
      const flip = x => answer(layer.app, layer.key, done.includes(x) ? done.filter(y => y !== x) : [...done, x]);
      return root('play', layer.color, <>
        {t('mid', layer.title, 'h2', 'mid')}
        {items
          ? (
            <ul className="pl-check" {...tr('check')}>
              {items.map((x, i) => (
                <li key={x} {...tr('ck' + i)}>
                  <Btn className={'pl-ck' + (done.includes(x) ? ' on' : '')} onClick={Btn === 'button' ? () => flip(x) : undefined}><i aria-hidden="true" />{x}</Btn>
                </li>
              ))}
            </ul>
          )
          : <p className="pl-empty">{layer.empty}</p>}
        {layer.note && t('note', layer.note, 'p', 'pl-note')}
      </>);
    }
    case 'mapq': {
      const all = WEB.filter(w => !ans.menu || ans.menu === '아무거나' || w.m === ans.menu);
      const here = all.filter(w => !ans.area || w.a === ans.area);
      const list = (here.length ? here : all).slice(0, 5);
      return root('flush', undefined, <>
        <MapBg />
        {list.map((w, i) => <Pin key={w.t} x={PINS[i][0]} y={PINS[i][1]} label={w.t} attrs={tr('pin:' + w.t, 'comp', { 'data-bread': w.m })} />)}
        {t('chip', !ans.area && !ans.menu ? '앞 장에서 동네와 빵을 골라 주세요'
          : (here.length ? (ans.area || '서울') : '서울 전체') + ' · ' + (ans.menu || '빵') + ' ' + list.length + '곳', 'div', 'mapchip')}
        <p className="pl-src">2026-11-18 웹 수집 · 영업 정보는 바뀔 수 있어요</p>
      </>);
    }
    // 블로그 원본 (정적객체). 왼쪽에서 보기만 하고, 조각을 찢어 올 수 있음
    case 'post': {
      const post = layer.post;
      return (
        <div className="sl post">
          <p className="post-src">빵서관 · 네이버 블로그</p>
          <h2 className="post-h" {...tr('h', 'text')}>{post.title}</h2>
          {post.blocks.map((b, bi) => {
            if (b.t === 'img') return <div key={bi} className="post-img" {...tr('i' + bi, 'img', { 'data-bread': b.bread })}><Bread kind={breadFor(b.bread)} size={120} /></div>;
            if (b.t === 'shop') return <p key={bi} className="post-shop" {...tr('s' + bi, 'shop')}>{b.text}</p>;
            return (
              <div key={bi} className="post-p" {...tr('p' + bi, 'text', { 'data-traits': [...new Set(b.s.flatMap(x => x.traits))].join(',') })}>
                {b.s.map((s, si) => <span key={si} className="post-s" {...tr('p' + bi + '.' + si, 'text', { 'data-traits': s.traits.join(',') })}>{s.text} </span>)}
              </div>
            );
          })}
        </div>
      );
    }
    // 레이어 슬라이더의 + 가 맥락 없이 띄우는 공통 제안: 마지막에 스스로 점수 매기기
    case 'rate': {
      const app = layer.app || layer.id;
      const score = ans[layer.key || 'score'] ?? answersOfRate();
      const live = play || interactive;
      return root('rate', '#fff', <>
        {t('kick', '마지막 장', 'p', 'kick')}
        {t('q', '그래서 내가 만든\n콘텐츠는 몇 점일까?', 'h2', 'mid')}
        <div className="rate-box" {...tr('rate', 'comp')}>
          <b className="rate-n">{score}<span>점</span></b>
          {live
            ? <input className="rate-range" type="range" min="0" max="100" step="1" value={score}
              onChange={e => answer(app, layer.key || 'score', +e.target.value)} aria-label="점수" />
            : <span className="rate-track"><i style={{ width: score + '%' }} /></span>}
          <span className="rate-ends"><em>0</em><em>100</em></span>
        </div>
      </>);
    }
    default:
      return root('', '#faf9f6', null);
  }
}

// 아직 아무도 안 움직였으면 가운데(50)에서 시작
function answersOfRate() { return 50; }
