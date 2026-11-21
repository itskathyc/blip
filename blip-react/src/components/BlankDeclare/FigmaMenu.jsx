import { useState } from 'react';
import { actionsFor, TEXT, TEXTED } from './actions';
import { getClip } from '../../data/clip';

// 콘텐츠 영역 우클릭: 피그마 우클릭 메뉴 그대로 + 맨 위에 블립의 4가지 제안과 검색
//   제안 4개 → 검색 → 줄로 된 기능들 (고른 것이 없으면 그 기능은 흐리게, 피그마처럼)
// 고르면 'blip:menu' 이벤트로 그 장(EditSurface)이 실행
const ITEMS = [
  ['copy', '복사', '⌘C', 't'],
  ['paste', '여기에 붙여넣기', '', 'clip'],
  ['replace', '붙여넣어 바꾸기', '⇧⌘R', 't+clip'],
  ['dup', '복제', '⌘D', 't'],
  '-',
  ['front', '맨 앞으로 가져오기', ']', 'piece'],
  ['back', '맨 뒤로 보내기', '[', 'piece'],
  '-',
  ['group', '선택 항목 그룹화', '⌘G', 'off'],
  ['frame', '선택 항목 프레임', '⌥⌘G', 'off'],
  '-',
  ['hide', '표시/숨기기', '⇧⌘H', 'comp'],
  ['lock', '잠금/잠금 해제', '⇧⌘L', 'off'],
  ['flipH', '좌우 반전', '⇧H', 'off'],
  ['flipV', '상하 반전', '⇧V', 'off'],
  '-',
  ['del', '삭제', '⌫', 't']
];

export default function FigmaMenu({ region, onClose, onPick, onSubmit }) {
  const [v, setV] = useState('');
  const m = region.menu;
  const t = !!(m.piece || m.comp || m.ins);
  const ok = need => (need === 't' ? t : need === 'clip' ? !!getClip() : need === 't+clip' ? t && !!getClip() : need === 'piece' ? !!m.piece : need === 'comp' ? !!m.comp : false);
  const run = action => { dispatchEvent(new CustomEvent('blip:menu', { detail: { action, ...m } })); onClose(); };
  return (
    <div className="fm" style={{ left: region.x, top: region.y }} onContextMenu={e => e.preventDefault()}>
      {/* 문단 위 우클릭: 맨 위에 그 문단에 맞춘 블립 추천 → 고르면 문단 아래에 컴포넌트가 생김 */}
      {m.asks && (
        <ul className="fm-list fm-top" role="menu">
          {m.asks.map(q => (
            <li key={q} role="menuitem" className="fm-blip" onClick={() => { dispatchEvent(new CustomEvent('blip:paraext', { detail: { layerId: m.layerId, comp: m.comp, q } })); onClose(); }}>
              <span>{q}</span><kbd>Blip</kbd>
            </li>
          ))}
          <li className="fm-sep" role="separator" />
        </ul>
      )}
      <div className="fm-ics">
        {/* 끼워 넣은 글 칸 위에선 맨 앞이 텍스트 에디터 */}
        {[...(m.ins ? [TEXTED] : []), ...actionsFor(region.context).map(a => (a.k === 'new' ? TEXT : a))].slice(0, 4).map(a => ( /* 우클릭에선 NEW 대신 텍스트 입력 */
          <button key={a.k} className="fm-ic" title={a.t} onClick={() => onPick(a)}><img src={a.src} alt="" /></button>
        ))}
      </div>
      <input className="fm-in" autoFocus placeholder="검색" value={v} onChange={e => setV(e.target.value)} spellCheck="false"
        onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && v.trim()) { e.preventDefault(); onSubmit(v.trim()); } if (e.key === 'Escape') onClose(); }} />
      <ul className="fm-list" role="menu">
        {/* 지도 아이템 위에서: 블립과 같이 설계하기 (왼쪽에서 대화가 시작됨) */}
        {m.piece && m.kind === 'item' && /지도/.test(m.name || '') && (<>
          <li role="menuitem" className="fm-blip" onClick={() => { dispatchEvent(new CustomEvent('blip:mapdesign', { detail: { layerId: m.layerId, piece: m.piece, name: m.name } })); onClose(); }}>
            <span>{m.name}설계</span><kbd>Blip</kbd>
          </li>
          <li className="fm-sep" role="separator" />
        </>)}
        {ITEMS.map((it, i) => (it === '-'
          ? <li key={'s' + i} className="fm-sep" role="separator" />
          : (
            <li key={it[0]} role="menuitem" aria-disabled={!ok(it[3])} className={ok(it[3]) ? '' : 'off'} onClick={() => ok(it[3]) && run(it[0])}>
              <span>{it[1]}</span><kbd>{it[2]}</kbd>
            </li>
          )))}
      </ul>
    </div>
  );
}
