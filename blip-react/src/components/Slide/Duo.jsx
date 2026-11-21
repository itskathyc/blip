import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VIDEOS, COUPANG, asksFor } from '../../data/duo';
import { answer } from '../../data/play';

// 아이폰 듀오 살까말까의 장들 (play = 왼쪽에서 직접 해 보는 중. 썸네일에선 그림만)

// 후기 3개: 글이면 글 카드, 영상이면 영상 카드. 하나를 누르면 블립 안에서 콘텐츠 화면의 4/5로 펼치고, 나머지는 아래 줄로 내려감
function Thumb({ v, small }) {
  return v.type === 'text'
    ? <span className={'dv-thumb txt' + (small ? ' sm' : '')}><em>{v.ch}</em><span>{v.say || v.body[0]}</span></span>
    : <span className={'dv-thumb' + (small ? ' sm' : '')} style={{ background: v.color }}><i aria-hidden="true"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 2l5 3-5 3z" fill="#c8102e" /></svg></i><em>{v.ch}</em></span>;
}

// 문단 아래에 이어 쓰는 컴포넌트 (문단 우클릭 → 블립 추천 → 여기)
//   size  손잡이를 잡아 끌어 길이(줄 수)를 정하고 [확인]
//   pick  갈래 버튼 두 개 + 직접 입력
//   write 정한 길이에 맞춰 블립이 글을 씀 (넘치는 문장은 빼고, 한 글자씩)
const LH = 20, PAD = 12; // 한 줄 높이 · 위아래 여백 (콘텐츠 px)
const linesOf = h => Math.max(1, Math.round((h - PAD * 2) / LH));
function ParaExt({ ext, setExt }) {
  const box = useRef(null), meas = useRef(null);
  const [typed, setTyped] = useState(0);
  const [mine, setMine] = useState('');
  const n = linesOf(ext.h);
  const ask = ext.ask;
  // 고른 갈래의 문장들 중 정한 줄 수 안에 들어가는 만큼만
  useLayoutEffect(() => {
    if (ext.phase !== 'fit' || !meas.current) return;
    const el = meas.current, max = n * LH + 1;
    let out = '';
    for (const line of ext.src) {
      const next = out ? out + ' ' + line : line;
      el.textContent = next;
      if (el.scrollHeight > max) break;
      out = next;
    }
    if (!out) { // 첫 문장도 넘치면 글자 단위로 자름
      const first = ext.src[0];
      let k = first.length;
      do { k -= 2; el.textContent = first.slice(0, k) + '…'; } while (k > 4 && el.scrollHeight > max);
      out = first.slice(0, k) + '…';
    }
    setExt(x => ({ ...x, phase: 'write', text: out }));
    setTyped(0);
  }, [ext.phase, ext.src, n, setExt]);
  useEffect(() => {
    if (ext.phase !== 'write' || typed >= ext.text.length) return undefined;
    const t = setTimeout(() => setTyped(c => c + 2), 22);
    return () => clearTimeout(t);
  }, [ext.phase, ext.text, typed]);

  const grab = e => {
    if (e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    const el = box.current, k = el.getBoundingClientRect().height / el.offsetHeight || 1;
    const y0 = e.clientY, h0 = ext.h;
    e.currentTarget.setPointerCapture(e.pointerId);
    const mv = ev => {
      const raw = Math.max(LH * 2 + PAD * 2, Math.min(LH * 12 + PAD * 2, h0 + (ev.clientY - y0) / k));
      setExt(x => ({ ...x, h: linesOf(raw) * LH + PAD * 2 }));
    };
    const up = ev => { ev.currentTarget.removeEventListener('pointermove', mv); ev.currentTarget.removeEventListener('pointerup', up); };
    e.currentTarget.addEventListener('pointermove', mv); e.currentTarget.addEventListener('pointerup', up);
  };
  const write = (src, from) => setExt(x => ({ ...x, phase: 'fit', src, from }));
  // 다 쓴 뒤 아래 입력창: 다시 부탁하거나(짧게 · 목록으로) 내 말을 이어 붙임. 저장 = 칸이 걷히고 본문 문단이 됨
  const [more, setMore] = useState('');
  const sentences = t => t.split(/(?<=[.!?요다])\s+/).filter(Boolean);
  const refine = () => {
    const q = more.trim();
    if (!q) return;
    setMore('');
    const cur = ext.text;
    if (/짧게|요약|줄여/.test(q)) { setExt(x => ({ ...x, text: sentences(cur)[0], list: false })); setTyped(0); return; }
    if (/불릿|글머리|목록|리스트|나눠|줄마다|항목|bullet/i.test(q)) { setExt(x => ({ ...x, list: true, relist: (x.relist || 0) + 1 })); return; } // 다시 적기: 한 줄씩 차례로
    if (/문장|이어/.test(q) && ext.list) { setExt(x => ({ ...x, list: false })); return; }
    setTyped(cur.length + 1); // 내 말은 이어서 한 글자씩
    setExt(x => ({ ...x, text: cur + ' ' + q }));
  };
  const typing = ext.phase === 'write' && typed < (ext.text || '').length;
  return (
    <div className={'px px-' + ext.phase} onPointerDown={e => e.stopPropagation()}>
      {ext.phase !== 'saved' && <p className="px-tag"><b>{ext.q}</b>{ext.phase === 'size' && <span>약 {n}줄</span>}{ext.from && ext.phase === 'write' && <span>{ext.from}</span>}
        <button className="px-x" onClick={() => setExt(null)} aria-label="지우기" title="지우기">×</button></p>}
      <div className="px-frame">
      <div className="px-box" ref={box} style={ext.phase === 'write' || ext.phase === 'saved' ? { minHeight: ext.h } : { height: ext.h }}>
        {ext.phase === 'size' && (<>
          <div className="px-ghost" aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i} style={{ width: i === n - 1 ? '58%' : '100%' }} />)}</div>
          <p className="px-guide">문단의 길이는 어느정도 할지 커서를 잡아 끈 다음 확인 버튼 눌러주세요.</p>
          <button className="px-ok" onClick={() => setExt(x => ({ ...x, phase: 'pick' }))}>확인</button>
        </>)}
        {ext.phase === 'pick' && (
          <div className="px-opts">
            {ask.opts.map(o => <button key={o.label} className="px-opt" onClick={() => write(o.lines, o.from)}>{o.label}</button>)}
            <input className="px-in" placeholder="직접 입력" value={mine} spellCheck="false" onChange={e => setMine(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && mine.trim()) write([mine.trim()], null); }} />
          </div>
        )}
        {(ext.phase === 'fit' || ext.phase === 'write' || ext.phase === 'saved') && (ext.list && !typing
          ? <ul className="px-list" key={ext.relist}>{sentences(ext.text).map((x, i) => <li key={x} style={{ '--i': i }}>{x}</li>)}</ul>
          : <p className="px-text">{ext.phase === 'fit' ? '' : ext.text.slice(0, typed)}{typing && <i className="px-caret" />}</p>
        )}
        <p className="px-text px-meas" ref={meas} aria-hidden="true" />
      </div>
      {/* 길이 손잡이: 칸 아래 테두리 한가운데에 붙어 있음 */}
      {ext.phase === 'size' && <button className="px-grab" onPointerDown={grab} aria-label="길이 정하기" title="잡아 끌어 길이 정하기"><i /></button>}
      </div>
      {ext.phase === 'write' && !typing && (
        <div className="px-foot">
          <input className="px-in" placeholder="더 부탁하거나 이어 쓰기 (예: 불릿포인트로 다시)" value={more} spellCheck="false" onChange={e => setMore(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); refine(); } }} />
          <button className="px-enter" onClick={refine} disabled={!more.trim()} aria-label="보내기" title="보내기 (Enter)">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M13 3v5.5a1.5 1.5 0 0 1-1.5 1.5H4M7 6.5L3.5 10 7 13.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="px-save" onClick={() => setExt(x => ({ ...x, phase: 'saved' }))}>저장</button>
        </div>
      )}

    </div>
  );
}

export function Videos({ layer, play, tr }) {
  const [open, setOpen] = useState(layer.open ?? null);
  const [orig, setOrig] = useState(false); // 원문으로 읽기 (캡처한 웹페이지를 웹뷰처럼)
  const [deep, setDeep] = useState(false); // ▼ 한 번: 같은 화면에서 더 자세히 펼침 (원문 전에 한 단계)
  const Btn = play ? 'button' : 'span';
  const cur = open === null ? null : VIDEOS[open];
  // 원문 ⇄ 블립 요약: 요약 맨 아래 ▼ = 원문 펼치기 / 원문 주소창의 ▲ = 블립 요약으로 접기
  const Tri = play ? 'button' : 'span';
  const go = i => { setOpen(i); setOrig(false); setDeep(false); setCmf(null); setExt(null); setNoVid(false); };
  // 댓글 거르기: 빈칸 선언에 "주연이 대댓글 단 것만 보여줘"처럼 적으면 → 로딩 원이 돌다가 그 댓글만
  const [cmf, setCmf] = useState(null); // { label, only, loading, empty }
  // 문단 우클릭 → 블립 추천을 고르면: 그 문단 아래에 이어 쓰는 컴포넌트 { comp, q, ask, phase, h }
  const [ext, setExt] = useState(null);
  useEffect(() => {
    if (!play) return undefined;
    const on = e => {
      const { layerId, comp, q } = e.detail;
      if (layerId !== layer.id || !comp) return;
      const i = +comp.split(':')[1], text = VIDEOS[open]?.body?.[i] || '';
      const ask = asksFor(text)?.find(a => a.q === q);
      if (ask) setExt({ comp, q, ask, phase: 'size', h: LH * 2 + PAD * 2 });
    };
    addEventListener('blip:paraext', on);
    return () => removeEventListener('blip:paraext', on);
  }, [play, layer.id, open]);
  // 영상 빼고 보기: 빈칸 선언에 "댓글만 보여줘" → 영상이 접히고 제목 · 댓글만 / "다시 영상도 보여줘" → 다시 영상
  const [noVid, setNoVid] = useState(false);
  useEffect(() => {
    if (!play || cur?.type !== 'video') return undefined;
    const ask = e => {
      const q = e.detail.q.replace(/\s+/g, ' ');
      if (/영상/.test(q) && /(다시|도 |도$|보여|켜|띄워|살려)/.test(q) && !/(빼|없이|숨|제거|지워|만)/.test(q)) { e.preventDefault(); setNoVid(false); return; }
      if (/(댓글|제목)\s*(이랑|과|와|하고)?\s*(댓글)?\s*만/.test(q) || (/영상/.test(q) && /(빼|없이|숨|제거|지워|치워)/.test(q))) { e.preventDefault(); setNoVid(true); setCmf(null); return; }
      if (!/댓글|답글|답한|답 단|리플/.test(q)) return;
      e.preventDefault(); // 검색이 아니라 이 콘텐츠의 댓글 거르기
      const name = cur.ch.split(' ')[0];
      const mine = /크리에이터|본인|주인/.test(q) || q.includes(name) || q.includes(cur.ch);
      const f = mine
        ? { label: name + '이 답한 댓글만', only: c => c.replies?.some(r => r.who === cur.ch), empty: name + '이 답한 댓글이 없어요' }
        : { label: '답글이 달린 댓글만', only: c => c.replies?.length, empty: '답글이 달린 댓글이 없어요' };
      setCmf({ ...f, loading: true });
      setTimeout(() => setCmf(c => c && { ...c, loading: false }), 1100);
    };
    addEventListener('blip:ask', ask);
    return () => removeEventListener('blip:ask', ask);
  }, [play, cur]);
  const shown = (cur?.comments || []).map((c, i) => ({ ...c, i })).filter(c => !cmf || cmf.loading || cmf.only(c));
  // 원문 웹뷰: 휠뿐 아니라 잡아서 위아래로 끌어도 스크롤 (휴대폰 화면처럼)
  const grabScroll = e => {
    if (e.button !== 0 || e.pointerType !== 'mouse') return;
    const el = e.currentTarget, y0 = e.clientY, top0 = el.scrollTop;
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    el.classList.add('grabbing');
    const mv = ev => { el.scrollTop = top0 - (ev.clientY - y0); };
    const up = () => { el.classList.remove('grabbing'); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  };
  // Peel 중엔 누르기 = 찢을 단위 고르기 (펼치기 아님). 평소엔 잡아서 콘텐츠 밖으로 끌면 화면이 위아래로 나뉘며 따로 열림
  const pick = i => (play ? {
    onClick: e => { if (!e.currentTarget.hasAttribute('data-tear')) go(i); },
    ...(tr('x')['data-tear'] ? {} : {
      draggable: true,
      onDragStart: e => { e.dataTransfer.setData('text/blip-view', JSON.stringify({ app: layer.app, open: i })); e.dataTransfer.effectAllowed = 'copy'; }
    })
  } : {});
  if (open === null) {
    return (
      <div className="dv">
        <p className="dv-kick">아이폰 듀오 후기</p>
        {VIDEOS.map((v, i) => (
          <Btn key={v.ch} className="dv-card" {...tr('v' + i)} {...pick(i)}>
            <Thumb v={v} />
            <span className="dv-body">
              <span className="dv-meta">{v.flag} {v.who} · {v.date}</span>
              <b>{v.title}</b>
              <span className="dv-pt">{v.type === 'text' ? v.from : v.say || v.body[0]}</span>
            </span>
          </Btn>
        ))}
      </div>
    );
  }
  const v = cur;
  return (
    <div className="dv open">
      {orig && v.orig ? (
        /* 원문: 캡처한 그 페이지를 웹뷰처럼 (주소창 + 스크롤) */
        <div className="dv-main wv" key={'o' + open}>
          {/* 주소창 없이: 가운데 ▲ 하나 = 블립 요약으로 접기 */}
          <Tri className="wv-tri up" onClick={play ? () => setOrig(false) : undefined} aria-label="블립 요약으로 보기" title="블립 요약으로 보기">
            <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8.5L6 4l4 4.5z" fill="currentColor" /></svg>
          </Tri>
          <div className="wv-page" data-scroll="" onPointerDown={grabScroll}><img src={v.orig.img} alt={v.orig.title} draggable={false} /></div>
        </div>
      ) : (
      <div className="dv-main" data-scroll="" key={open}>
        {v.type === 'video' && !noVid && (
          <div className="dv-player" style={{ background: v.color }} {...tr('player' + open, 'img')}><i aria-hidden="true"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 2l5 3-5 3z" fill="#c8102e" /></svg></i><span>{v.dur}</span></div>
        )}
        {!(noVid && v.type === 'video') && <p className="dv-meta" {...tr('meta' + open, 'text')}>{v.flag} {v.ch} · {v.from} · {v.date}</p>}
        <h4 className="dv-title" {...tr('title' + open, 'text')}>{v.title}</h4>
        {v.say && v.type === 'text' && <blockquote className="dv-say" {...tr('say' + open)}>{v.say}</blockquote>}
        {/* 영상은 설명 대신 사람들의 댓글. 글은 본문 */}
        {v.type === 'video'
          ? (
            <div className="dv-cm">
              {cmf
                ? (
                  /* 빈칸 선언으로 건 거르기: 무엇으로 걸렀는지 + 풀기 */
                  <p className="dv-cm-h on">{cmf.label}{!cmf.loading && ' ' + shown.length}
                    {play && <button className="dv-cm-clear" onClick={() => setCmf(null)} aria-label="거르기 풀기">×</button>}</p>
                )
                : <p className="dv-cm-h">댓글{v.comments?.length ? ' ' + v.comments.length : ''}{v.cmFrom && <span>{v.cmFrom}</span>}</p>}
              {cmf?.loading
                ? <div className="dv-cm-load" role="status"><i aria-hidden="true" />불러오는 중</div>
                : shown.length
                  ? shown.map(c => (
                    <div key={c.i} className={'dv-cm-i' + (cmf ? ' fresh' : '')} {...tr('c' + open + ':' + c.i)}>
                      <span className="dv-cm-av" aria-hidden="true">{c.who[0]}</span>
                      <div>
                        <b>{c.who}</b>{c.up != null && <em>👍 {c.up}</em>}<p>{c.text}</p>
                        {c.replies?.map((rp, j) => (
                          <div key={j} className={'dv-rp' + (rp.who === v.ch ? ' me' : '')}>
                            <span className="dv-cm-av sm" aria-hidden="true" style={rp.who === v.ch ? { background: v.color, color: '#fff' } : undefined}>{rp.who[0]}</span>
                            <div><b>{rp.who}</b>{rp.who === v.ch && <i className="dv-badge">크리에이터</i>}<p>{rp.text}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                  : <p className="dv-cm-none">{cmf ? cmf.empty : v.cmNone}</p>}
            </div>
          )
          : v.body.map((p, i) => {
            const key = 'b' + open + ':' + i, asks = asksFor(p);
            return (
              <div key={i} className="dv-pw">
                <p className="dv-p" {...tr(key)} data-asks={asks ? asks.map(a => a.q).join('|') : undefined}>{p}</p>
                {ext?.comp === key && <ParaExt ext={ext} setExt={setExt} />}
              </div>
            );
          })}
        {deep && v.more && (
          /* 더 자세히: 원문 기사의 내용을 소제목 · 문단으로 이어서 (그 자리에서 펼쳐짐) */
          <div className="dv-more">
            <p className="dv-more-from">{v.more.from}</p>
            {v.more.paras.map(([h, t], i) => (
              <div key={h} className="dv-more-i" style={{ '--i': i }} {...tr('m' + open + ':' + i)}><b>{h}</b><p>{t}</p></div>
            ))}
          </div>
        )}
        {v.orig && (
          <Tri className={'wv-tri down' + (deep || !v.more ? ' to-orig' : '')}
            onClick={play ? e => { if (deep || !v.more) setOrig(true); else { setDeep(true); const box = e.currentTarget.closest('.dv-main'); requestAnimationFrame(() => box?.scrollBy({ top: 160, behavior: 'smooth' })); } } : undefined}
            aria-label={deep || !v.more ? '원문으로 보기' : '더 자세히 보기'} title={deep || !v.more ? '원문으로 보기' : '더 자세히 보기'}>
            <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 3.5L6 8l4-4.5z" fill="currentColor" /></svg>
          </Tri>
        )}
      </div>
      )}
      {/* 나머지는 콘텐츠 화면 아래 줄로 (슬라이더처럼). 맨 끝 = 다시 모아 보기 */}
      <div className="dv-rest">
        {VIDEOS.map((o, i) => i !== open && (
          <Btn key={o.ch} className="dv-mini" {...tr('mini' + i)} {...pick(i)} title={o.title}>
            <Thumb v={o} small />
            <span><b>{o.ch}</b></span>
          </Btn>
        ))}
        <Btn className="dv-all" onClick={play ? e => { if (!e.currentTarget.hasAttribute('data-tear')) setOpen(null); } : undefined} aria-label="모아 보기" title="모아 보기">
          <i /><i /><i /><i />
        </Btn>
      </div>
    </div>
  );
}

// 쿠팡 별점. 우클릭 → "후기까지 같이보기" → 별점 아래 후기 5개로 화면이 다시 짜임 → 더보기로 10개까지
export function Coupang({ play, tr }) {
  const [menu, setMenu] = useState(null); // 우클릭한 자리
  const [n, setN] = useState(0); // 보여 주는 후기 수 (0 = 별점만)
  const c = COUPANG;
  const stars = k => '★★★★★'.slice(0, k) + '☆☆☆☆☆'.slice(0, 5 - k);
  const ctx = play ? {
    onContextMenu: e => {
      e.preventDefault(); e.stopPropagation(); // 화면 전체의 우클릭(빈칸 선언) 대신 이 콘텐츠의 메뉴
      const r = e.currentTarget.getBoundingClientRect();
      const k = r.width / e.currentTarget.offsetWidth;
      setMenu({ x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k });
    },
    onPointerDown: e => { if (menu && !e.target.closest('.cp-menu')) setMenu(null); }
  } : {};
  return (
    <div className={'cp' + (n ? ' with-reviews' : '')} {...ctx}>
      <p className="dv-kick">쿠팡 후기도 같이 보여드릴게요</p>
      <div className="cp-box" {...tr('rating')}>
        <div className="cp-top" {...tr('cp-top', 'text')}>
          <span className="cp-logo">coupang</span>
          <span className="cp-name">{c.name}</span>
        </div>
        <div className="cp-score" {...tr('cp-score')}>
          <b>{c.rating.toFixed(1)}</b>
          <span className="cp-stars" aria-label={'별 5개 중 ' + c.rating}>{stars(Math.round(c.rating))}</span>
          <span className="cp-count">상품평 {c.count.toLocaleString()}개</span>
        </div>
        {!n && (
          <div className="cp-dist" {...tr('cp-dist')}>
            {c.dist.map((p, i) => <span key={i}><em>{5 - i}점</em><i><b style={{ width: p + '%' }} /></i><small>{p}%</small></span>)}
          </div>
        )}
      </div>
      {n > 0 && (
        <div className="cp-reviews" data-scroll="">
          {c.reviews.slice(0, n).map((r, i) => (
            <div key={i} className="cp-rv" {...tr('rv' + i)} style={{ '--i': i % 5 }}>
              {/* 이름·별점·날짜를 모르는 후기는 그 줄 없이 글만 (지어내지 않음) */}
              {r.who && <p className="cp-rv-top"><i className="cp-av" aria-hidden="true">{r.who[0]}</i><b>{r.who}</b>{r.star && <span className="cp-stars sm">{stars(r.star)}</span>}{r.date && <span>{r.date}</span>}</p>}
              {r.opt && <p className="cp-opt">{r.opt}</p>}
              {r.imgs && <div className="cp-imgs">{r.imgs.map(f => <img key={f} src={import.meta.env.BASE_URL + 'demo/' + f} alt="" draggable={false} />)}</div>}
              {r.head && <p className="cp-head">{r.head}</p>}
              <p className="cp-txt">{r.text}</p>
            </div>
          ))}
          {n < c.reviews.length && play && <button className="cp-more" onClick={() => setN(c.reviews.length)}>더보기</button>}
        </div>
      )}
      {menu && (
        <div className="cp-menu" style={{ left: menu.x, top: menu.y }}>
          <button onClick={() => { setN(5); setMenu(null); }}>{n ? '후기 접기' : '후기까지 같이보기'}</button>
        </div>
      )}
    </div>
  );
}

// 질문 다섯을 한 화면에 + 아래 "말까 ↔ 살까" 슬라이더. 고를 때마다 바늘이 그쪽으로 움직임
const MAX = 10; // 답이 모두 한쪽으로 쏠렸을 때의 합 (바늘 끝)
export function Quiz({ layer, ans, play, tr }) {
  const Btn = play ? 'button' : 'span';
  const lean = layer.lean || {};
  const sum = layer.qs.reduce((n, q) => n + (lean[q.key]?.[ans[q.key]] || 0), 0);
  const done = layer.qs.filter(q => ans[q.key]).length;
  const pos = Math.max(0, Math.min(100, 50 + (sum / MAX) * 50)); // 0 = 말까 끝, 100 = 살까 끝
  const all = done === layer.qs.length; // 마지막(329만 원)까지 다 고르면 = 결정!
  const side = sum >= 2 ? '살까' : sum <= -2 ? '말까' : '반반';
  const word = !done ? '골라 보면 바늘이 움직여요' : all ? (side === '반반' ? '반반, 직접 보고 결정!' : side + '로 결정!') : side === '반반' ? '아직 반반' : side + ' 쪽';
  return (
    <div className="qz">
      {layer.qs.map(q => (
        <div key={q.key} className="qz-q" {...tr('q:' + q.key)}>
          <p>{q.q}{q.note && <small>{q.note}</small>}</p>
          <div className="qz-opts">
            {q.opts.map(([label, emoji]) => (
              <Btn key={label} className={'qz-opt' + (ans[q.key] === label ? ' on' : '')} {...tr('o:' + q.key + ':' + label)}
                onClick={play ? e => { if (!e.currentTarget.hasAttribute('data-tear')) answer(layer.app, q.key, ans[q.key] === label ? undefined : label); } : undefined}>
                <span>{emoji}</span>{label}
              </Btn>
            ))}
          </div>
        </div>
      ))}
      <div className={'qz-meter' + (done ? '' : ' idle') + (all ? ' decided' : '')} {...tr('meter')}>
        <div className="qz-ends"><span className={sum <= -2 ? 'on' : ''}>말까</span><b key={all ? 'd:' + side : 'w'}>{word}</b><span className={sum >= 2 ? 'on' : ''}>살까</span></div>
        {/* 다 고른 순간 바늘이 한 번 꾹 — 결정 도장. 답을 바꿔 결정이 바뀌면 다시 */}
        <div className="qz-track"><i style={{ left: pos + '%' }} />{all && <b className="qz-ring" key={side + sum} style={{ left: pos + '%' }} />}</div>
      </div>
    </div>
  );
}
