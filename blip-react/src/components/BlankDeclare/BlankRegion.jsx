import { useLayoutEffect, useRef, useState } from 'react';
import { actionsFor } from './actions';
import { topicOf, asList } from '../../data/refine';

// 구체화: 적는 동안 애매한 말에 밑줄 → 그 말 바로 아래에 고를 것. 블립은 바꾸지 않음 — 고르는 건 사용자, 안 고르면 '전부'.
//   Tab = 다음 말로 · Enter = 검색 (고른 것을 함께 넘김)
const findTerms = (v, topic) => {
  const out = [];
  (topic?.terms || []).forEach(t => { const m = v.match(t.re); if (m) out.push({ ...t, start: m.index, end: m.index + m[0].length, text: m[0] }); });
  return out.sort((a, b) => a.start - b.start);
};
let canvas;
const measure = (el, text) => {
  canvas = canvas || document.createElement('canvas');
  const c = canvas.getContext('2d'), cs = getComputedStyle(el);
  c.font = cs.font;
  const ls = parseFloat(cs.letterSpacing) || 0;
  return c.measureText(text).width + ls * text.length;
};

// 그리는 동안은 드래그한 크기 그대로의 선택 사각형. 놓으면 그 자리에 내용만큼의 작은 판(card, 기존의 1/2 크기)
export default function BlankRegion({ region, context, onClose, onNewItem, onFill, onText, onSubmit }) {
  const [mode, setMode] = useState(region.startMode || 'icons'); // 우클릭 메뉴에서 '새로 만들기'를 골랐으면 바로 이름 적기
  const [picked, setPicked] = useState(null);
  const [v, setV] = useState(region.preset?.v || ''); // 다시 검색이면 처음 쓴 문장 그대로
  const [picks, setPicks] = useState(region.preset?.picks || {}); // 말(key) → 고른 것
  const [act, setAct] = useState(null);   // 지금 고를 것을 띄운 말
  const [xs, setXs] = useState({});       // 말마다 입력칸 안의 가로 자리
  const inRef = useRef(null), seen = useRef('');
  const topic = mode === 'icons' ? topicOf(v) : null; // 적은 문장에 맞는 구체화 주제 (내 주변 빵집 · 프랑스 빵집 …)
  const terms = topic ? findTerms(v, topic) : [];
  // 새 말이 생기면 그 말이 지금 고를 말
  const keys = terms.map(t => t.key).join();
  if (keys !== seen.current) {
    const before = seen.current ? seen.current.split(',') : [];
    seen.current = keys;
    const nw = terms.filter(t => !before.includes(t.key)).pop(); // 새로 생긴 말 중 마지막(방금 쓴 쪽)
    if (nw) setAct(nw.key); else if (!terms.some(t => t.key === act)) setAct(terms[0]?.key || null);
  }
    useLayoutEffect(() => {
    const el = inRef.current;
    if (!el || !terms.length) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const next = {};
    terms.forEach(t => { const a = measure(el, v.slice(0, t.start)); next[t.key] = { x: pad + a - el.scrollLeft, w: measure(el, t.text) }; });
    setXs(o => (JSON.stringify(next) === JSON.stringify(o) ? o : next));
  }, [v, mode, terms.length]); // eslint-disable-line react-hooks/exhaustive-deps -- 글자가 바뀔 때만 다시 잼
  const card = region.done && !region.compact; // 놓은 빈칸 = 내용만큼의 작은 판 (빈 공간 없음)
  const ctx = region.context || context; // 컴포넌트를 꾹 눌러 연 빈칸이면 그 컴포넌트에 맞춘 3가지
  const style = card ? { left: region.x, top: region.y, '--k': .5 } // 개체에 맞춘 빈칸은 잘 보이게 조금 크게
    : { left: region.x, top: region.y, width: region.w, height: region.h, '--k': 1 };

  if (!region.done) return <div className="rg" style={style} />;

  const onKeyDown = e => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();
    const q = v.trim();
    if (!q) return;
    if (mode === 'new') onNewItem(q, region);
    else submit();
  };
  const chosen = () => picks; // 문장 속 빈칸에서 고른 것 (입력에 없는 기준도 포함)
  const submit = view => { const q = v.trim(); if (q) onSubmit(q, chosen(), view); };
  const near = !!topic; // 구체화할 문장이면 아이콘 자리가 치환 문장으로
  const onTab = e => {
    const list = near ? topic.slots : terms; // 문장이 떠 있으면 문장의 빈칸 차례로 (입력에 없는 기준까지)
    if (e.key !== 'Tab' || !list.length) return;
    e.preventDefault();
    const i = list.findIndex(t => t.key === act);
    setAct(list[(i + (e.shiftKey ? list.length - 1 : 1)) % list.length].key);
  };
  // 여러 개 고르는 빈칸(맛 · 여는 시간)은 눌러서 켜고 끔. '전부'는 모두 끔. 하나만 고르는 빈칸은 바꿈
  const pick = (key, o) => setPicks(p => {
    const n = { ...p };
    if (!o || o === '전부') { delete n[key]; return n; }
    if (topic?.slots.find(x => x.key === key)?.multi) {
      const cur = asList(p[key]);
      const nx = cur.includes(o) ? cur.filter(x => x !== o) : [...cur, o];
      if (nx.length) n[key] = nx; else delete n[key];
      return n;
    }
    if (p[key] === o) delete n[key]; else n[key] = o;
    return n;
  });

  return (
    <div className={'rg done' + (region.acts ? ' acts' : '') + (near ? ' rq-live' : '') + (card ? ' card' : '') + (mode === 'new' ? ' newmode' : '') + (region.compact ? ' compact' : region.context === 'component' ? ' around' : '')} style={style}>
      <button className="rx" onClick={onClose} title="닫기" aria-label="닫기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
      </button>
      {near
        ? <Sentence topic={topic} picks={picks} act={act} setAct={setAct} onPick={pick} onView={submit} />
        : mode === 'icons'
        ? (
          <div className="ri">
            {actionsFor(ctx, region.acts).map(a => (
              <button key={a.k} className={'ic' + (picked === a.k ? ' on' : '')} title={a.t}
                onClick={() => {
                  if (a.k.startsWith('unit-')) { // 개체에 대한 행동: 그 콘텐츠가 받아서 처리 (못 받으면 '제거'는 그 조각을 화면에서 숨김)
                    const act = a.k.slice(5), ev = new CustomEvent('blip:unitact', { detail: { act, tear: region.tear }, cancelable: true });
                    dispatchEvent(ev);
                    if (!ev.defaultPrevented && act === 'remove') document.querySelectorAll(`.pane.dig [data-tear="${CSS.escape(region.tear || '')}"]`).forEach(n => n.setAttribute('data-gone', ''));
                    onClose();
                  }
                  else if (a.k === 'blipai') { // BlipAI: 왼쪽에 대화창 (적어 둔 말 · 고른 컴포넌트가 첫 질문)
                    dispatchEvent(new CustomEvent('blip:ai', { detail: { seed: v.trim() || region.subject || '' } }));
                    onClose();
                  }
                  else if (a.k === 'new') { setMode('new'); setV(''); }
                  else if (a.k === 'find') setV(region.subject || ''); // 이 컴포넌트의 이름을 채워 두고, Enter면 찾기
                  else if (a.k === 'drawkit') onNewItem(a.t, region, 'kit'); // 고르면 바로 그 자리에 놓이고, 지울 때까지 남음
                  else if (a.k === 'fill') onFill(region); // 그 빈 장이 블립의 제안 콘텐츠로 채워짐
                  else if (a.k === 'text') onText(region); // 선언한 빈칸 자리에 바로 글 입력
                  else setPicked(p => (p === a.k ? null : a.k));
                }}>
                <img src={a.src} alt="" />
                <span className="icl">{a.s || a.t}</span>
              </button>
            ))}
          </div>
        )
        : <div className="rnew">{region.compact ? '새 아이템' : '새로운 아이템선언'}</div>}
      <div className="rq">
        <input key={mode} ref={inRef} autoFocus placeholder={mode === 'new' ? '이름' : region.compact ? '적거나 고르기' : '무엇이든 적거나, 아래에서 고르기'} value={v} onChange={e => setV(e.target.value)}
          onKeyDown={e => { onTab(e); onKeyDown(e); }} spellCheck="false" aria-label="입력" />
        {/* 애매한 말 밑줄 (나를 가리키는 말 = 실선, 기준이 흐린 말 = 점선). 고르면 파란 실선 */}
        {terms.map(t => xs[t.key] && (
          <span key={t.key} className={'rq-u ' + t.kind + (t.key === act ? ' on' : '') + (picks[t.key] ? ' picked' : '')} style={{ left: xs[t.key].x, width: xs[t.key].w }}
            onMouseDown={e => { e.preventDefault(); setAct(t.key); }} />
        ))}
      </div>
    </div>
  );
}

// 아이콘 자리 → 치환 문장 (결과는 아직 보여 주지 않음). 빈칸마다 고를 것 + 직접 입력. 그 아래 받는 방식 셋
function Sentence({ topic, picks, act, setAct, onPick, onView }) {
  const [own, setOwn] = useState(''); // 직접 입력 중인 값
  const [typing, setTyping] = useState(false);
  const sl = topic.slots.find(x => x.key === act);
  const open = k => { setAct(k); setTyping(false); setOwn(''); };
  return (
    <div className="rq-prev">
      <p className="rq-rw" aria-live="polite">
        {topic.rewrite(picks).map((p, i) => (p.key
          ? <span key={i} className={'rq-rw-p' + (p.soft ? ' soft' : '') + (p.key === act ? ' on' : '')} onMouseDown={e => { e.preventDefault(); open(p.key); }}>{p.text}</span>
          : <span key={i}>{p.text}</span>))}
      </p>
      {sl && (
        <div className="rq-pop" key={sl.key}>
          {sl.preview && <p className="rq-pv">{sl.preview}</p>}
          {sl.multi && <p className="rq-multi">여러 개 고를 수 있어요 · 모두 맞는 곳만</p>}
          <div className="rq-chips">
            {[...sl.opts, '전부'].map(o => (
              <button key={o} className={'rq-chip' + (o === '전부' ? (!asList(picks[sl.key]).length ? ' on' : '') : asList(picks[sl.key]).includes(o) ? ' on' : '') + (sl.multi && o !== '전부' ? ' multi' : '')} onMouseDown={e => e.preventDefault()} onClick={() => { setTyping(false); onPick(sl.key, o); }}>{o}</button>
            ))}
            {typing
              ? <input className="rq-own" autoFocus value={own} placeholder="직접 적기" spellCheck="false" onChange={e => setOwn(e.target.value)}
                  onKeyDown={e => {
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (own.trim()) onPick(sl.key, own.trim()); setTyping(false); setOwn(''); }
                    if (e.key === 'Escape') { e.stopPropagation(); setTyping(false); }
                  }} />
              : <>
                  {asList(picks[sl.key]).filter(x => !sl.opts.includes(x)).map(x => (
                    <button key={x} className="rq-chip own on" onMouseDown={e => e.preventDefault()} onClick={() => onPick(sl.key, x)} title="다시 누르면 빠져요">{x}</button>
                  ))}
                  <button className="rq-chip own" onMouseDown={e => e.preventDefault()} onClick={() => setTyping(true)}>직접 입력</button>
                </>}
          </div>
        </div>
      )}
      <p className="rq-hint">문장의 흐린 곳을 눌러 기준을 더하세요 · Tab 다음 · {topic.hint}</p>
      {topic.views && (
        <div className="rq-views">
          {topic.views.map(([k, label, ic]) => (
            <button key={k} className="rq-view" onMouseDown={e => e.preventDefault()} onClick={() => onView(k)}><i aria-hidden="true">{ic}</i>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
