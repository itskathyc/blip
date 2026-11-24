// "내가 다녀온 해외 빵집들" → 왼쪽에 폴더로: 나라 → 도시 (Finder처럼 들어가서 봄)
//   다녀온 빵집 기록은 아직 없음 → 도시 폴더는 비어 있고, Cmd로 끌어 넣으면 모이게 (지어내지 않음)
import { makeLayer } from './apps';

export const isTrips = q => /해외/.test(q) && /빵집|빵/.test(q) && /다녀|갔던|가 본|가본/.test(q);

export const TRIP_FOLDERS = [
  { name: '일본', flag: '🇯🇵', color: '#e8505b', cities: ['교토', '도쿄', '오키나와'], recent: ['교토'] }, // 교토 = 최근에 다녀옴 (아직 비어 있음 → 채워 달라고)
  { name: '스페인', flag: '🇪🇸', color: '#f2a93b', cities: ['마드리드', '마요르카'] },
  { name: '이탈리아', flag: '🇮🇹', color: '#3aa76d', cities: ['피렌체', '밀라노'] },
  { name: '중국', flag: '🇨🇳', color: '#d9463e', cities: ['상해', '내몽골', '북경'] },
  { name: '베트남', flag: '🇻🇳', color: '#e5b43a', cities: ['하노이'] }
];

export const TRIPS_APP = id => ({
  id, title: '내가 다녀온 해외 빵집', by: '블립', mine: false, detail: true, found: true, tags: '해외 빵집 일본 스페인 이탈리아 중국 베트남',
  layers: [makeLayer('folders', { app: id, title: '내가 다녀온 해외 빵집', root: TRIP_FOLDERS })]
});
