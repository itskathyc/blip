import { makeLayer } from './apps';

// 맨 처음 위 띠에 뜨는 다섯 개. 모두 넘기며 직접 해 볼 수 있는(playable) 콘텐츠.
// 장의 종류
//   cover      표지
//   choice     고르기 (key에 답이 저장됨, multi면 여러 개)
//   verdict    앞에서 고른 답으로 판정 (decide(답) → 결과, 아직이면 null)
//   checklist  눌러서 체크 (items는 배열이거나 답에 따라 바뀌는 함수)
//   mapq       고른 동네·빵으로 지도에 핀

const L = (app, kind, extra) => makeLayer(kind, { app, ...extra });

// ---------- 1. 리트냥이가 뭔데? ----------
// 무엇인지 확인되지 않아(검색으로도 못 찾음) 사실은 적지 않음: 추측해 보는 놀이 + 만든 사람이 채울 자리
const litnyang = (id = 's1') => [
  L(id, 'cover', { color: '#efe7fd', emoji: '🐱', kick: '처음 보는 사람을 위한 4장', head: '리트냥이가\n뭔데?', sub: '넘기면서 알아가기' }),
  L(id, 'choice', { color: '#efe7fd', key: 'guess', q: '리트냥이는\n어떤 냥이일까?', opts: [['공부하는 냥이', '📚'], ['게임 속 냥이', '🎮'], ['진짜 고양이', '🐈'], ['인터넷 밈', '😹']] }),
  L(id, 'verdict', {
    color: '#2b2340', decide: a => a.guess && {
      kick: '당신의 추측', big: a.guess, sub: '정답은 이 콘텐츠를 만든 사람이 채우는 자리예요',
      lines: ['Remix 해서 정답과 이유를 적어 보세요']
    }
  }),
  L(id, 'checklist', { color: '#efe7fd', key: 'todo', title: '리트냥이 카드 채우기', items: ['이름의 뜻', '생김새 한 줄', '성격 세 단어', '어디서 볼 수 있나'] })
];

// ---------- 2. 수능날날씨 ----------
// 실제 예보는 적지 않음: 기상청 예보를 보고 고르면 옷차림을 정해 줌
const TEMPS = [['영하', '🥶'], ['0~5도', '🧊'], ['5~10도', '🍂'], ['10도 이상', '🌤️']];
const COLD = [['많이 타요', '🧣'], ['보통', '🙂'], ['잘 안 타요', '😎']];
const suneung = (id = 's2') => [
  L(id, 'cover', { color: '#e3eefc', emoji: '🌤️', kick: '수능날 아침', head: '몇 도일지 보고\n옷 고르기', sub: '기상청 예보를 확인하고 골라 주세요' }),
  L(id, 'choice', { color: '#e3eefc', key: 'temp', q: '고사장 동네의\n아침 기온은?', opts: TEMPS }),
  L(id, 'choice', { color: '#e3eefc', key: 'cold', q: '평소 추위를...', opts: COLD }),
  L(id, 'verdict', {
    color: '#16314f', decide: a => {
      if (!a.temp || !a.cold) return null;
      const t = TEMPS.findIndex(x => x[0] === a.temp), c = COLD.findIndex(x => x[0] === a.cold);
      const lv = Math.max(0, Math.min(3, t + c - 1)); // 0 가장 따뜻하게 … 3 가장 가볍게
      return [
        { kick: '오늘의 옷차림', big: '단단히', sub: '두꺼운 외투 + 얇은 옷 여러 겹', lines: ['고사장 안은 따뜻할 수 있어요: 벗기 쉬운 겹', '핫팩 · 목도리'] },
        { kick: '오늘의 옷차림', big: '든든히', sub: '외투 + 얇은 옷 두세 겹', lines: ['쉬는 시간마다 체온 맞추기', '무릎 담요 대신 긴 겉옷'] },
        { kick: '오늘의 옷차림', big: '가볍게 겹쳐', sub: '가벼운 외투 + 얇은 겹', lines: ['더우면 한 겹 벗기', '목 따뜻하게'] },
        { kick: '오늘의 옷차림', big: '가볍게', sub: '얇은 겉옷 하나', lines: ['오후에 더워질 수 있어요', '여벌 얇은 옷 하나'] }
      ][lv];
    }
  }),
  L(id, 'checklist', { color: '#e3eefc', key: 'bag', title: '전날 밤 챙길 것', items: ['수험표', '신분증', '아날로그 시계', '겉옷 한 겹 더', '도시락 · 물'], note: '허용 물품은 수험생 유의사항으로 꼭 확인' })
];

// ---------- 3. 나만의 빵집지도 ----------
const AREAS = ['연남', '성수', '종로', '망원', '북촌', '용산']; // 수집해 둔 빵집이 있는 동네만
const breadmap = (id = 's3') => [
  L(id, 'cover', { color: '#e3f1ea', emoji: '🗺️', kick: '골라서 만드는 지도', head: '나만의\n빵집지도', sub: '동네와 빵을 고르면 지도가 그려져요' }),
  L(id, 'choice', { color: '#e3f1ea', key: 'area', q: '어느 동네?', opts: AREAS.map(a => [a, '📍']) }),
  L(id, 'choice', { color: '#e3f1ea', key: 'menu', q: '어떤 빵?', opts: [['소금빵', '🧂'], ['크루아상', '🥐'], ['베이글', '🥯'], ['아무거나', '🍞']] }),
  L(id, 'mapq', {})
];

// ---------- 4. 구움과자레시피 ----------
// 기본 배합 예시 (집 오븐마다 시간은 조금씩 다름)
const RECIPE = {
  휘낭시에: {
    ing: ['버터 100g (갈색이 나게 태워서)', '달걀흰자 100g', '설탕 100g', '아몬드가루 40g', '박력분 40g'],
    step: ['버터를 갈색이 날 때까지 녹이고 식히기', '흰자와 설탕 섞기', '가루를 체 쳐 넣기', '갈색 버터 넣고 섞기', '틀에 80% 채우기', '190°C 12~15분']
  },
  마들렌: {
    ing: ['달걀 2개', '설탕 90g', '박력분 100g', '베이킹파우더 4g', '녹인 버터 100g', '레몬 껍질 조금'],
    step: ['달걀과 설탕 섞기', '가루를 체 쳐 넣기', '녹인 버터 넣기', '냉장고에서 1시간 쉬게 두기', '틀에 짜 넣기', '190°C 10~12분']
  },
  스콘: {
    ing: ['박력분 250g', '베이킹파우더 10g', '설탕 30g', '소금 2g', '차가운 버터 60g', '우유 100g'],
    step: ['가루와 버터를 보슬보슬하게', '우유 넣고 뭉치기 (치대지 않기)', '냉장고에서 30분', '잘라서 윗면에 우유 바르기', '200°C 15~18분']
  }
};
const baking = (id = 's4') => [
  L(id, 'cover', { color: '#fbecd9', emoji: '🧈', kick: '주말 베이킹', head: '오늘 구울\n구움과자', sub: '고르면 재료와 순서가 나와요' }),
  L(id, 'choice', { color: '#fbecd9', key: 'bake', q: '무엇을 구울까요?', opts: [['휘낭시에', '🟫'], ['마들렌', '🐚'], ['스콘', '🥮']] }),
  L(id, 'checklist', { color: '#fff7ec', key: 'ing', title: '재료', items: a => RECIPE[a.bake]?.ing, empty: '앞 장에서 무엇을 구울지 골라 주세요', note: '기본 배합 예시' }),
  L(id, 'checklist', { color: '#fff7ec', key: 'step', title: '굽기 순서', items: a => RECIPE[a.bake]?.step, empty: '앞 장에서 무엇을 구울지 골라 주세요', note: '오븐마다 시간은 조금씩 달라요' })
];

// ---------- 5. 아이폰듀오 살까말까 판정 ----------
// 사실은 가격 하나만 (국내 리뷰 기준 329만 원부터). 판정은 내 답으로만
// 첫 장: 내 유튜브 시청 목록에서 시작 → 후기 영상 3개 → 쿠팡 별점(우클릭하면 후기까지) → 질문 다섯 + 살까·말까 슬라이더 (한 장)
const duo = (id = 's5') => [
  L(id, 'cover', { color: '#f5f5f7', emoji: '📱', kick: '최근 내 유튜브 시청 목록에\n‘아이폰 듀오 후기’가 있었어요', head: '살까 말까\n고민 중인가요?', sub: '넘겨서 같이 봐요' }),
  L(id, 'videos'),
  L(id, 'coupang'),
  // 질문 다섯 + 아래 "말까 ↔ 살까" 슬라이더: 고를 때마다 바늘이 왔다 갔다 (판정 장은 따로 없음)
  L(id, 'quiz', {
    qs: [
      { key: 'phone', q: '지금 쓰는 폰은?', opts: [['아이폰', '🍎'], ['갤럭시', '🤖'], ['폴더블', '📖']] },
      { key: 'use', q: '폰으로 제일 많이 하는 건?', opts: [['영상·유튜브', '▶️'], ['사진·카메라', '📷'], ['메신저·전화', '💬']] },
      { key: 'years', q: '지금 폰, 몇 년째?', opts: [['1년 이하', '🆕'], ['2~3년', '📆'], ['4년 이상', '🪫']] },
      { key: 'want', q: '듀오에서 제일 끌리는 건?', opts: [['펼치면 큰 화면', '📖'], ['새로워서', '✨'], ['딱히 없음', '🤷']] },
      { key: 'budget', q: '329만 원, 괜찮아요?', note: '256GB 국내 출고가', opts: [['괜찮아요', '👌'], ['부담돼요', '💸']] }
    ],
    // 답 하나하나가 바늘을 민다 (+ = 살까 쪽, - = 말까 쪽). 아직 안 고른 질문은 0
    lean: {
      phone: { '아이폰': 1, '갤럭시': -1, '폴더블': 0 },
      use: { '영상·유튜브': 2, '사진·카메라': 0, '메신저·전화': -1 },
      years: { '1년 이하': -2, '2~3년': 0, '4년 이상': 2 },
      want: { '펼치면 큰 화면': 2, '새로워서': 1, '딱히 없음': -2 },
      budget: { '괜찮아요': 1, '부담돼요': -3 }
    }
  })
];

export const STARTERS = () => [
  { id: 's1', title: '리트냥이가 뭔데?', by: '냥집사', mine: false, starter: true, color: '#efe7fd', tags: '고양이 냥이 캐릭터', layers: litnyang() },
  { id: 's2', title: '수능날날씨', by: '수험생친구', mine: false, starter: true, color: '#e3eefc', tags: '수능 날씨 옷차림 기온', layers: suneung() },
  { id: 's3', title: '나만의 빵집지도', by: '빵순이', mine: false, starter: true, color: '#e3f1ea', tags: '빵 빵집 지도 소금빵 크루아상 베이글 연남 성수 동네', layers: breadmap() },
  { id: 's4', title: '구움과자레시피', by: '오븐장갑', mine: false, starter: true, color: '#fbecd9', tags: '빵 구움과자 레시피 베이킹 휘낭시에 마들렌 스콘 버터', layers: baking() },
  { id: 's5', title: '아이폰듀오 살까말까 판정', by: '테크언니', mine: false, starter: true, color: '#ececec', tags: '아이폰 폴더블 판정 테크', layers: duo() }
];

// "빵서관"처럼 적은 말 → 위 띠에서 무엇을 먼저 보여줄지의 낱말들
export function topicOf(title) {
  const t = title.trim();
  if (!t) return '';
  const extra = /빵|베이커리|베이킹/.test(t) ? ' 빵 빵집 소금빵 크루아상 베이글 구움과자 레시피 지도' : '';
  return t + extra;
}
