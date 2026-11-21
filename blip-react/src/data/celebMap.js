// '셀럽 인증 빵집' 아이템을 지도에 합칠 때 꽂히는 곳.
// 출처: 에스콰이어 코리아 2026.03.13 「카리나, 지수가 파리에서 또 간 찐 맛집은?」 중 빵집만
//   (캐비어 카스피아 · 라 로통드는 빵집이 아니라 뺌)
// 위치: 라 파리지엥 = 파리시 발표 2025 '파리 최고의 바게트' 우승 매장 (12 rue du Faubourg-Poissonnière, 10구) — paris.fr 확인.
//   좌표는 그 주소의 대략 위치(지도 축척에서 핀 자리용).
//   밀레앙 = 원문에 주소가 없고 검색으로도 확인 못 함 → 핀 없이 '위치를 못 찾았어요'
export const CELEB_BAKERIES = [
  { name: '라 파리지엥', who: '카리나', where: '10구 · 12 rue du Faubourg-Poissonnière', lat: 48.8716, lon: 2.3481 },
  { name: '밀레앙', who: '리사', where: null }
];
export const isCeleb = text => /셀럽|셀렙|연예인/.test(text || '');
