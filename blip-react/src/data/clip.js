// 우클릭 메뉴의 복사 · 붙여넣기가 함께 쓰는 블립 안의 클립보드 (조각 하나)
let clip = null;
export const getClip = () => clip;
export const setClip = c => { clip = c; };
