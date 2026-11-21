let lid = 0;
// 항상 새 id를 붙임 (다른 레이어를 복사해 넘겨도 id는 겹치지 않음)
export const makeLayer = (kind, extra = {}) => ({ ...extra, id: 'L' + ++lid, kind });

// 직전 레이어를 보고 + 를 눌렀을 때 제안할 다음 화면
export const NEXT_KIND = { profile: 'pick', pick: 'result', result: 'bakery', location: 'nearby', nearby: 'best' };

let bid = 0;
// 새 판: 빈 장면 하나로 시작. 제목이 비어 있으면 잠김(편집 영역이 떨림)
// board: 내가 오른쪽에서 만드는 판. 위 띠(타인의 콘텐츠)에는 절대 뜨지 않음
export const makeNewBoard = () => ({ id: 'n' + ++bid, title: '', mine: true, board: true, layers: [makeLayer('blank')] });

// tags: 제안 띠가 "지금 보는 것"과 얼마나 가까운지 판단할 때 쓰는 낱말
export const seedApps = () => [
  makeNewBoard(),
  { id: 'p1', title: '빵메뉴추천', mine: true, art: 'bread', tags: '소금빵 크루아상 베이글 궁합 식빵 바게트', layers: [makeLayer('profile'), makeLayer('pick'), makeLayer('result')] },
  { id: 'p2', title: '내 위치기반 BEST 빵 찾기', mine: true, art: 'map', tags: '연남 위치 지도 동네 빵집', layers: [makeLayer('location'), makeLayer('nearby'), makeLayer('best')] },
  {
    id: 'o1', title: '빵지순례 지도', by: '빵순이', mine: false, color: '#e3f1ea', tags: '연남 성수 북촌 지도 동네 소금빵 베이글', layers: [
      makeLayer('card', { color: '#e3f1ea', bread: 'baguette', head: '빵지순례 지도', sub: '동네별로 모은 서울 빵집', lines: ['연남 · 만동제과', '성수 · 자연도소금빵', '북촌 · 런던 베이글'] }),
      makeLayer('card', { color: '#d9ece0', bread: 'bagel', head: '이번 주 코스', sub: '걸어서 30분 안쪽', lines: ['만동제과 → 베어스덴', '→ SF베이글'] })
    ]
  },
  {
    id: 'o2', title: '오늘의 빵 운세', by: 'baker_kim', mine: false, color: '#e9e4fb', tags: '바게트 소금빵 망원 운세', layers: [
      makeLayer('card', { color: '#e9e4fb', bread: 'salt', head: '오늘의 빵 운세', sub: '생일로 보는 오늘의 빵', lines: ['바삭한 바게트 소금빵', '행운의 동네: 망원'] })
    ]
  },
  {
    id: 'o3', title: '빵 MBTI 테스트', by: '누룩', mine: false, color: '#fbe7d6', tags: '크루아상 테스트 성향 용산', layers: [
      makeLayer('card', { color: '#fbe7d6', bread: 'croissant', head: '빵 MBTI 테스트', sub: '12문항 빵 성향 테스트', lines: ['결이 있는 빵이 좋다', '단 빵보다 짠 빵'] }),
      makeLayer('card', { color: '#f6dcc4', bread: 'croissant', head: '당신은 크루아상형', sub: '겉은 바삭, 속은 섬세', lines: ['어울리는 곳: 테디뵈르하우스'] })
    ]
  }
];

// 토픽과 겹치는 낱말 수. 0이면 관련 없음
export function matchScore(text, topic) {
  const t = text.toLowerCase();
  return topic.toLowerCase().split(/\s+/).filter(Boolean).reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
}
