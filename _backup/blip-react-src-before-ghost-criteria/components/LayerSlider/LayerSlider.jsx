import { useEffect, useRef, useState } from 'react';
import Slide from '../Slide/Slide';
import './LayerSlider.css';

// 내 타임라인: 항상 "내 판"의 레이어들. 위 띠의 썸네일을 끌어다 놓으면 그대로 담김(리믹스)
// dragKey가 있으면(왼쪽 디깅 쪽) 카드 하나하나를 끌어서 오른쪽 타임라인에 그 장면만 담을 수 있음
export default function LayerSlider({ layers, index, active, fresh, canDrop, dragKey, onGo, onAdd, onDropTile }) {
  const rowRef = useRef(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    rowRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [index, layers.length]);

  const drop = canDrop ? {
    onDragOver: e => { if (e.dataTransfer.types.includes('text/blip-tile')) { e.preventDefault(); setOver(true); } },
    onDragLeave: () => setOver(false),
    onDrop: e => { e.preventDefault(); setOver(false); onDropTile(e.dataTransfer.getData('text/blip-tile')); }
  } : {};

  return (
    <div className={'slider' + (active ? '' : ' idle') + (over ? ' over' : '')} ref={rowRef} {...drop}>
      {layers.map((layer, i) => (
        <button key={layer.id}
          className={'lcard' + (active && i === index ? ' cur' : '') + (layer.draft ? ' draft' : '') + (fresh.includes(layer.id) ? ' fresh' : '')}
          onClick={() => onGo(i)}
          draggable={!!dragKey} onDragStart={dragKey ? e => { e.dataTransfer.setData('text/blip-tile', dragKey + '#' + i); e.dataTransfer.effectAllowed = 'copy'; } : undefined}
          aria-label={(i + 1) + '번째 레이어' + (layer.draft ? ', 제안' : '')}>
          <span className="lcard-scale"><Slide layer={layer} /></span>
        </button>
      ))}
      {onAdd && <button className="lcard lcard-add" onClick={onAdd} title="다음 화면 제안받기" aria-label="레이어 추가">+</button>}
      {over && <span className="slider-drop">여기에 놓으면 담겨요</span>}
    </div>
  );
}
