import { useEffect, useReducer, useRef, useState } from 'react';
import MiniMap from './MiniMap';
import { CELEB_BAKERIES, isCeleb } from '../../data/celebMap';
import './Map.css';

// 오른쪽 아이템(예: '프랑스 지도')을 우클릭 → '지도 상세 설계' → 왼쪽에서 이 대화가 시작됨.
// 한 번에 한 질문만. 답해야 다음이 나오고, 다 답하면 그때 지도를 그림 (중간에 결과를 미리 보여주지 않음)
const ASK = [
  { key: 'app', text: '어떤 지도 앱으로 연결할까요?\n핀을 누르면 이 앱에서 열려요.',
    opts: [['google', '구글맵'], ['naver', '네이버지도'], ['kakao', '카카오맵'], ['apple', '애플 지도']],
    words: { google: /구글|google/i, naver: /네이버|naver/i, kakao: /카카오|kakao/i, apple: /애플|apple/i } },
  { key: 'style', text: '지도의 디자인을 골라주세요.', pv: true,
    opts: [['line', '선'], ['paper', '종이'], ['night', '밤']], words: { line: /선|라인|심플/, paper: /종이|따뜻|빈티지/, night: /밤|다크|어두/ } },
  { key: 'region', text: '프랑스 전역을 가져올까요?\n특정 지역을 생각하시나요?',
    opts: [['france', '프랑스 전역'], ['paris', '파리']], words: { paris: /파리/, france: /전역|전체|프랑스|다/ } },
  { key: 'pins', text: 'pin 기능을 추가할까요?',
    opts: [[true, '추가'], [false, '없이']], words: { true: /추가|네|응|좋아|넣어|yes/i, false: /없이|아니|빼|no/i } }
];
// 받침에 맞는 을/를
const eul = w => { const c = (w || '').trim().slice(-1).charCodeAt(0) - 0xac00; return c >= 0 && c <= 11171 && c % 28 ? '을' : '를'; };
const GAP = 750; // 블립이 '입력 중'인 시간

// 대화는 왼쪽 장이 다시 그려져도 이어지게 밖에 둠 (장 id별)
const store = new Map();
const subs = new Set();
const set = (id, fn) => { store.set(id, fn(store.get(id))); subs.forEach(f => f()); };
const say = (id, m, after = GAP) => {
  set(id, c => ({ ...c, typing: true }));
  setTimeout(() => set(id, c => ({ ...c, typing: false, msgs: [...c.msgs, m] })), after);
};

// 오른쪽에서 '셀럽 인증 빵집'을 지도에 합치면: 대화도 지도와 같은 박자로 이어짐
addEventListener('blip:mapmerge', e => {
  const { map, name } = e.detail;
  for (const [id, c] of store) {
    if (c.piece !== map) continue;
    if (!isCeleb(name)) continue; // 가게 하나를 던진 건 지도 위에서 바로 보임 (대화는 조용히)
    say(id, { who: 'blip', text: `‘${name}’${eul(name)} 지도에 합치는 중`, work: true }, 200);
    const found = CELEB_BAKERIES.filter(b => b.lat), miss = CELEB_BAKERIES.filter(b => !b.lat);
    setTimeout(() => set(id, c2 => ({ ...c2, msgs: c2.msgs.filter(m => !m.work) })), 1700);
    setTimeout(() => say(id, { who: 'blip', text: `핀 ${found.length}곳: ${found.map(b => `${b.name}(${b.who})`).join(', ')}`
      + (miss.length ? `\n위치를 못 찾은 곳: ${miss.map(b => `${b.name}(${b.who})`).join(', ')}` : '') }, 400), 1800 + found.length * 600);
  }
});

export default function MapChat({ layer, play }) {
  const id = layer.id;
  const [, force] = useReducer(x => x + 1, 0);
  const [v, setV] = useState('');
  const logRef = useRef(null);
  useEffect(() => { subs.add(force); return () => subs.delete(force); }, []);
  if (!store.has(id)) {
    store.set(id, { piece: layer.piece, msgs: [{ who: 'blip', text: `‘${layer.name}’${eul(layer.name)} 같이 설계해요.` }], step: 0, cfg: {}, typing: false });
    setTimeout(() => say(id, { who: 'blip', ask: 0 }), 300);
  }
  const c = store.get(id);
  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [c.msgs.length, c.typing]);

  const last = c.msgs[c.msgs.length - 1];
  const open = play && !c.typing && last?.ask === c.step && c.step < ASK.length; // 지금 답할 질문
  const answer = (val, label) => {
    const q = ASK[c.step];
    const cfg = { ...c.cfg, [q.key]: val };
    set(id, x => ({ ...x, cfg, step: x.step + 1, msgs: [...x.msgs, { who: 'me', text: label }] }));
    if (c.step + 1 < ASK.length) { say(id, { who: 'blip', ask: c.step + 1 }); return; }
    // 다 답함 → 그리는 중 → 오른쪽 아이템이 지도로
    say(id, { who: 'blip', text: '지도를 그리고 있어요', work: true }, 400);
    setTimeout(() => {
      const done = { ...cfg, at: Date.now() };
      dispatchEvent(new CustomEvent('blip:mapdone', { detail: { layerId: layer.layerId, piece: layer.piece, cfg: done } }));
      set(id, x => ({ ...x, cfg: done, msgs: [...x.msgs.filter(m => !m.work), { who: 'blip', text: `오른쪽 ‘${layer.name}’에 그렸어요.`, done: true }] }));
    }, 2000);
  };
  const typed = () => {
    const t = v.trim();
    if (!t || !open) return;
    const q = ASK[c.step];
    const hit = q.opts.find(([val]) => q.words[String(val)]?.test(t));
    setV('');
    if (hit) answer(hit[0], t);
    else { set(id, x => ({ ...x, msgs: [...x.msgs, { who: 'me', text: t }] })); say(id, { who: 'blip', ask: c.step }); }
  };

  return (
    <div className="mc" data-scroll="">
      <div className="mc-log" ref={logRef}>
        {c.msgs.map((m, i) => {
          if (m.ask !== undefined) {
            const q = ASK[m.ask];
            const live = open && i === c.msgs.length - 1;
            return (
              <div key={i} style={{ display: 'contents' }}>
                <p className="mc-m blip">{q.text}</p>
                {live && (
                  <div className="mc-opts">
                    {q.opts.map(([val, label]) => (
                      <button key={label} className={'mc-opt' + (q.pv ? ' pv' : '')} onClick={() => answer(val, label)}>
                        {q.pv && <MiniMap cfg={{ style: val, region: 'france' }} w={78} still />}
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={i} style={{ display: 'contents' }}>
              <p className={'mc-m ' + m.who + (m.work ? ' work' : '')}>{m.work && <s />}{m.text}</p>
              {m.done && <div className="mc-done"><MiniMap cfg={c.cfg} w={150} still /></div>}
            </div>
          );
        })}
        {c.typing && <div className="mc-typing" aria-label="입력 중"><i /><i /><i /></div>}
      </div>
      {play && (
        <input className="mc-in" value={v} onChange={e => setV(e.target.value)} placeholder={open ? '직접 적어도 돼요' : ''} disabled={!open} spellCheck="false"
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); typed(); } }} />
      )}
    </div>
  );
}
