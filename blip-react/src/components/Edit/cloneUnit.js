// 찢을 단위(DOM 요소)를 "컴포넌트 그대로" 떼어 냄: 마크업 + 계산된 스타일을 인라인으로 굳혀서
// 원래 자리(부모 슬라이드의 CSS)를 벗어나도 같은 모양으로 보이게.

const PROPS = [
  'display', 'box-sizing', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'gap',
  'grid-template-columns', 'place-items',
  'color', 'background-color', 'background-image', 'opacity',
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'white-space',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'box-shadow',
  'list-style-type'
];
const SIZED = new Set(['block', 'flex', 'grid', 'inline-block', 'inline-flex', 'list-item']);
const STRIP = ['data-tear', 'data-kind', 'data-traits', 'data-bread', 'data-el', 'data-thov', 'data-tsel', 'draggable', 'class', 'id'];

// 원본은 뷰어 안에서 transform: scale로 줄어 있음 → 화면 크기를 콘텐츠 크기로 환산 (정수로 깎으면 글자가 줄바꿈됨)
function freeze(src, dst, k) {
  const cs = getComputedStyle(src);
  let css = PROPS.map(p => `${p}:${cs.getPropertyValue(p)}`).join(';');
  if (SIZED.has(cs.display)) {
    const r = src.getBoundingClientRect();
    css += `;width:${Math.ceil(r.width / k * 10) / 10 + .5}px;height:${Math.ceil(r.height / k * 10) / 10}px`;
  }
  css += ';margin:0;position:relative;left:auto;top:auto;right:auto;bottom:auto;transform:none;outline:none';
  dst.setAttribute('style', css);
}

function walk(src, dst, k) {
  if (src instanceof HTMLElement) freeze(src, dst, k);
  STRIP.forEach(a => dst.removeAttribute?.(a));
  // svg 안쪽은 속성으로 그려지므로 그대로 둠
  if (src instanceof SVGElement) return;
  for (let i = 0; i < src.children.length; i++) walk(src.children[i], dst.children[i], k);
}

export function cloneUnit(el) {
  const copy = el.cloneNode(true);
  const k = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
  walk(el, copy, k || 1);
  // 글줄 속 문장(inline)도 한 덩어리로
  const root = copy.style;
  const disp = getComputedStyle(el).display;
  if (el.tagName === 'IMG') {
    // 사진은 보던 크기 그대로 (원본 해상도로 커지지 않게)
    root.width = el.offsetWidth + 'px';
    root.height = el.offsetHeight + 'px';
    root.maxWidth = 'none';
  } else if (disp === 'inline') {
    root.display = 'inline-block';
    root.maxWidth = '320px';
  } else if (disp === 'block' || disp === 'list-item') {
    // 블록은 원래 줄 너비를 그대로 가져오면 내용보다 훨씬 넓어짐(🐱 하나가 슬라이드 폭) → 내용만큼만
    root.width = 'max-content';
    root.maxWidth = '340px';
    root.height = 'auto';
  }
  return { html: copy.outerHTML, w: el.offsetWidth, h: el.offsetHeight };
}
