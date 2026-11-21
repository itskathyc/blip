import { useRef } from 'react';
import Slide from '../Slide/Slide';
import './FlowStrip.css';

// 위 띠: 블립과 실시간으로 주고받는 곳 (글자 없는 대화). 히스토리는 두지 않음.
//   결과 = 내 선택에 블립이 건넨 3개 (선명)
//   예측 = 그다음 내가 원할 것 같은 3개 (반투명: 블립의 제안은 아직 확정이 아님). 눌러서 바로 건너갈 수 있음
// 무엇을 고르면 예측 옆 빈자리가 숨 쉬고(듣는 중), 답이 오면 결과·예측이 함께 바뀜.
// 지나간 차례는 띠를 끌어내리거나 손잡이를 눌러 여는 히스토리 전경(.blip)에만 있음
export function Cover({ tile, w }) {
  return (
    <span className="fs-cover" style={{ '--w': w }}>
      <Slide layer={tile.cover} />
    </span>
  );
}

function Tile({ tile, k, cur, ghost, onPick }) {
  return (
    <button className={'fs-tile' + (cur ? ' cur' : '') + (ghost ? ' ghost' : '')} style={{ '--k': k }}
      onClick={() => onPick(tile)} title={tile.title}
      draggable onDragStart={e => { e.dataTransfer.setData('text/blip-tile', tile.key); e.dataTransfer.effectAllowed = 'copy'; }}>
      <Cover tile={tile} w="var(--tw)" />
    </button>
  );
}

export default function FlowStrip({ turns, predicted = [], listening, tileByKey, curKey, onPick, onHistory, onImport, showHand, hand, onHand, calm }) {
  const now = turns[turns.length - 1];
  const pull = useRef(null);

  // 띠를 아래로 끌어내리면 히스토리 전경. 끌기 시작하면 포인터를 붙잡아 띠 밖으로 나가도 이어짐
  const down = e => {
    if (e.button !== 0) return;
    pull.current = { y: e.clientY, id: e.pointerId, el: e.currentTarget, held: false, pulled: false };
  };
  const move = e => {
    const p = pull.current;
    if (!p) return;
    const dy = e.clientY - p.y;
    if (!p.held && dy > 6) { p.held = true; try { p.el.setPointerCapture(p.id); } catch { /* 이미 끝난 포인터 */ } }
    if (!p.pulled && dy > 36) { p.pulled = true; onHistory(); }
  };
  const up = () => { if (pull.current && !pull.current.pulled) pull.current = null; };
  // 끌어내린 직후의 클릭은 무시
  const swallow = e => { if (pull.current?.pulled) { e.stopPropagation(); e.preventDefault(); pull.current = null; } };

  return (
    <div className={'fs' + (calm ? ' calm' : '')} aria-label="블립과의 대화">
      <div className="fs-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClickCapture={swallow}>
        <button className="fs-import" onClick={onImport} aria-label="불러오기" title="불러오기">+</button>
        <div className={'fs-flow' + (listening ? ' waiting' : '')} key={now?.id}>
          <div className="fs-now" aria-label="내 선택의 결과">
            {now?.items.map(tileByKey).filter(Boolean).map((tile, k) => (
              <Tile key={tile.key} tile={tile} k={k} cur={tile.key === curKey} onPick={onPick} />
            ))}
          </div>
          {predicted.length > 0 && <span className="fs-then" aria-hidden="true" />}
          <div className="fs-next" aria-label="그다음 예측">
            {predicted.map((tile, k) => <Tile key={tile.key} tile={tile} k={k + 3} ghost onPick={onPick} />)}
          </div>
        </div>
        <span className={'fs-listen' + (listening ? ' on' : '')} aria-hidden={!listening} aria-label={listening ? '블립이 듣는 중' : undefined} />
        {showHand && (
          <button className={'fs-hand' + (hand ? ' on' : '')} onClick={onHand} aria-pressed={hand}
            title={hand ? '손 따라가기 켜짐: 손이 있는 쪽 화면이 넓어져요' : '고정: 눌러서 손 따라가기'} aria-label="손 따라가기">✋</button>
        )}
        <button className="fs-grab" onClick={onHistory} aria-label="히스토리 전경 열기" title="끌어내리거나 눌러서 히스토리 보기" />
      </div>
    </div>
  );
}
