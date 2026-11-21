import Slide from '../Slide/Slide';
import { Bread } from '../Art/Bread';
import { breadFor } from '../../data/breads';
import { PRIMARY_LABEL, primaryText, sentencesOf } from '../../data/blog';
import './StoryStrip.css';

// 위계 없는 Finder: 묶음도, 이름표도 없이 칸만 셋.
// 칸 안의 미리보기를 누르면 바로 오른쪽 칸에 "그것과 가까운 것들"이 열리고, 계속 누르면 계속 깊어짐.
// 셋을 넘어가면 왼쪽 칸이 밀려나고, 맨 왼쪽의 ‹ 로 한 칸씩 되돌아감

function Thumb({ tile, cur, seen, onSelect }) {
  return (
    <button className={'fd-thumb' + (cur ? ' cur' : '')} onClick={onSelect} title={tile.title}
      draggable onDragStart={e => { e.dataTransfer.setData('text/blip-tile', tile.key); e.dataTransfer.effectAllowed = 'copy'; }}>
      <span className="fd-scale"><Slide layer={tile.cover} /></span>
      {!seen && <i className="fd-new" aria-label="새 제안" />}
    </button>
  );
}

// 불러온 블로그 글 = 정적객체. Blip이 "이 글의 주인공"을 추측해서 반투명으로 보여줌.
// 맞으면 [이대로 사용], 틀리면 아래 이름표를 눌러 바꿈(바꾸는 순간 확정). 빵이 둘이면 그림으로 물어봄
function PostThumb({ tile, cur, onSelect, post: h }) {
  const p = tile.post;
  const pending = p.state === 'pending';
  const ask = !p.bread && p.primary === 'bread';
  return (
    <div className={'fd-post' + (pending ? ' ghost' : '') + (cur ? ' cur' : '')}>
      <button className="fd-thumb pf-face" onClick={onSelect} title={p.title}>
        {p.primary === 'bread' && (p.bread ? <Bread kind={breadFor(p.bread)} size={48} /> : <span className="pf-q">?</span>)}
        {p.primary === 'shop' && <b className="pf-shop">{p.shop}<em>{p.area}</em></b>}
        {p.primary === 'line' && <span className="pf-line">“{sentencesOf(p)[0].text}”</span>}
      </button>
      {ask
        ? (
          <div className="pf-ask" role="group" aria-label="어떤 빵에 대한 글인가요">
            {p.candidates.map(b => (
              <button key={b} onClick={() => h.onBread(p.id, b)} title={b} aria-label={b}><Bread kind={breadFor(b)} size={24} /></button>
            ))}
          </div>
        )
        : <button className="pf-chip" onClick={() => h.onPrimary(p.id)} title="눌러서 바꾸기">{PRIMARY_LABEL[p.primary]} · {primaryText(p)}</button>}
      {pending && !ask && <button className="pf-use" onClick={() => h.onConfirm(p.id)}>이대로 사용</button>}
    </div>
  );
}

export default function StoryStrip({ columns, start, seen, query, onSelect, onBack, onClearQuery, post, batch, perCol, onImport }) {
  const shown = [0, 1, 2].map(i => columns[start + i]);
  return (
    <div className="strip-wrap" aria-label="제안">
      {shown.map((col, i) => (
        <div className="fd-col" key={i}>
          {col && (
            <div className={'fd-grid' + (i === 0 && start > 0 ? ' behind-back' : '')} key={col.from || 'root'}>
              {/* 띠 맨 앞: 무엇이든 불러오기. 이 자리만큼 첫 칸의 미리보기는 하나 줄어 스크롤이 생기지 않음 */}
              {i === 0 && <button className="fd-thumb fd-import" onClick={onImport} aria-label="불러오기" title="불러오기">+</button>}
              {i === 0 && start === 0 && query && (
                <button className="qchip" onClick={onClearQuery} title="검색 지우기">‘{query}’ <span aria-hidden="true">×</span></button>
              )}
              {col.batch && batch && (
                <button className="qchip batch" onClick={batch.onApply}>나머지 {batch.n}개도 ‘{batch.label}’으로</button>
              )}
              {(i === 0 ? col.items.slice(0, Math.max(0, perCol - 1 - (start === 0 && query ? 1 : 0) - (col.batch && batch && col.items.length >= perCol - 1 ? 1 : 0))) : col.items).map(t => (t.type === 'post'
                ? <PostThumb key={t.key} tile={t} cur={t.key === col.sel} post={post} onSelect={() => onSelect(start + i, t)} />
                : <Thumb key={t.key} tile={t} cur={t.key === col.sel} seen={seen.has(t.key)} onSelect={() => onSelect(start + i, t)} />
              ))}
            </div>
          )}
        </div>
      ))}
      {start > 0 && <button className="fd-back" onClick={onBack} aria-label="한 칸 뒤로">‹</button>}
    </div>
  );
}
