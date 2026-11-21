// 빵 이름 → 일러스트 종류
export const BREAD_OF = { 소금빵: 'salt', 크루아상: 'croissant', 베이글: 'bagel', 바게트: 'baguette', 마늘바게트: 'baguette', 식빵: 'loaf', 단팥빵: 'redbean', 미트파이: 'pie' };
export const breadFor = name => BREAD_OF[name] || 'loaf';

// "좋아하는 빵 고르기" 화면의 빵 목록 (picked는 이 순서의 번호)
export const BREADS = ['크루아상', '바게트', '소금빵', '베이글', '단팥빵', '식빵'];
