import { makeLayer } from './apps';

// 시작 다섯 개를 누르면 위 띠 둘째 칸에 뜨는 "맥락상 다음 콘텐츠" (타인의 콘텐츠).
// 사실 주장은 피하고, 고르고 체크하며 직접 해 보는 것들로. 장의 종류는 starters.js와 같음
const L = (app, kind, extra) => makeLayer(kind, { app, ...extra });

const verdictBy = (key, map) => a => a[key] && map[a[key]];

const RELATED_APPS = () => [
  // ---------- 리트냥이가 뭔데? → 고양이 · 캐릭터 · 밈 ----------
  {
    id: 'r1a', title: '우리 냥이 성격 테스트', by: '고양이연구소', tags: '고양이 냥이 성격 테스트', color: '#f3ecfd',
    layers: [
      L('r1a', 'cover', { color: '#f3ecfd', emoji: '😼', kick: '세 번 고르면', head: '우리 냥이\n성격은?', sub: '평소 모습을 떠올려 보세요' }),
      L('r1a', 'choice', { color: '#f3ecfd', key: 'call', q: '이름을 부르면', opts: [['바로 온다', '🏃'], ['귀만 움직인다', '👂'], ['못 들은 척', '🙈']] }),
      L('r1a', 'verdict', {
        color: '#2b2340', decide: verdictBy('call', {
          '바로 온다': { kick: '우리 냥이는', big: '개냥이', sub: '사람이 좋은 다정한 타입', lines: ['같이 노는 시간을 늘려 주세요'] },
          '귀만 움직인다': { kick: '우리 냥이는', big: '츤데레', sub: '듣고 있지만 내색은 안 하는 타입', lines: ['먼저 다가올 때까지 기다리기'] },
          '못 들은 척': { kick: '우리 냥이는', big: '독립파', sub: '혼자만의 시간이 소중한 타입', lines: ['숨을 곳 하나 만들어 주기'] }
        })
      })
    ]
  },
  {
    id: 'r1b', title: '캐릭터 이름 짓기', by: '이름장인', tags: '캐릭터 냥이 이름 짓기', color: '#fdeef4',
    layers: [
      L('r1b', 'cover', { color: '#fdeef4', emoji: '✏️', kick: '리트냥이처럼', head: '내 캐릭터\n이름 짓기', sub: '앞말과 뒷말을 골라 붙여요' }),
      L('r1b', 'choice', { color: '#fdeef4', key: 'front', q: '앞말', opts: [['말랑', '🍡'], ['꼬질', '🧶'], ['반짝', '✨'], ['졸린', '😪']] }),
      L('r1b', 'choice', { color: '#fdeef4', key: 'back', q: '뒷말', opts: [['냥이', '🐱'], ['토끼', '🐰'], ['곰', '🐻'], ['펭귄', '🐧']] }),
      L('r1b', 'verdict', { color: '#3a1f2c', decide: a => a.front && a.back && { kick: '내 캐릭터 이름', big: a.front + a.back, sub: '마음에 들면 Remix 해서 카드로', lines: [] } })
    ]
  },
  {
    id: 'r1c', title: '요즘 밈 나는 몇 개 알까', by: '밈수집가', tags: '밈 인터넷 캐릭터 요즘', color: '#fff4d6',
    layers: [
      L('r1c', 'cover', { color: '#fff4d6', emoji: '😹', kick: '체크해 보기', head: '요즘 밈\n몇 개 알아?', sub: '아는 것만 눌러요' }),
      L('r1c', 'checklist', { color: '#fff4d6', key: 'know', title: '들어 본 적 있다', items: ['리트냥이', '친구가 보내 준 그 짤', '알고리즘이 띄운 노래', '반 단톡방 유행어'], note: '빈칸은 Remix 해서 직접 채우기' })
    ]
  },
  {
    id: 'r1d', title: '첫 냥이 맞이 체크리스트', by: '냥집사', tags: '고양이 냥이 입양 체크리스트', color: '#e9f3ff',
    layers: [
      L('r1d', 'cover', { color: '#e9f3ff', emoji: '📦', kick: '집에 오기 전', head: '첫 냥이\n맞이 준비', sub: '챙긴 것만 눌러요' }),
      L('r1d', 'checklist', { color: '#e9f3ff', key: 'prep', title: '챙길 것', items: ['화장실 · 모래', '사료 · 물그릇', '스크래처', '숨을 수 있는 상자', '가까운 동물병원 알아 두기'] })
    ]
  },

  // ---------- 수능날날씨 → 수능 · 시험날 ----------
  {
    id: 'r2a', title: '수능 전날 밤 루틴', by: '수험생친구', tags: '수능 전날 루틴 시험', color: '#e3eefc',
    layers: [
      L('r2a', 'cover', { color: '#e3eefc', emoji: '🌙', kick: '하루 전', head: '수능 전날 밤\n루틴', sub: '한 일만 눌러요' }),
      L('r2a', 'checklist', { color: '#e3eefc', key: 'night', title: '전날 밤', items: ['가방 미리 싸 두기', '알람 두 개', '고사장 가는 길 확인', '평소 시간에 자기'] })
    ]
  },
  {
    id: 'r2b', title: '수능 도시락 메뉴 고르기', by: '엄마손', tags: '수능 도시락 메뉴 점심', color: '#fdf1e3',
    layers: [
      L('r2b', 'cover', { color: '#fdf1e3', emoji: '🍱', kick: '시험날 점심', head: '도시락\n뭐 싸 갈까', sub: '속 편한 쪽으로' }),
      L('r2b', 'choice', { color: '#fdf1e3', key: 'stomach', q: '긴장하면 속이', opts: [['예민해요', '😣'], ['괜찮아요', '🙂']] }),
      L('r2b', 'verdict', {
        color: '#3d2a14', decide: verdictBy('stomach', {
          '예민해요': { kick: '추천 도시락', big: '죽 · 계란말이', sub: '평소에 먹던 순한 것', lines: ['처음 먹는 음식은 피하기', '따뜻한 물'] },
          '괜찮아요': { kick: '추천 도시락', big: '밥 · 구이 한 가지', sub: '평소 먹던 양보다 조금 적게', lines: ['기름진 건 줄이기', '간식 하나'] }
        })
      })
    ]
  },
  {
    id: 'r2c', title: '시험날 아침 가는 길', by: '길잡이', tags: '수능 시험 아침 교통 고사장', color: '#e8f4ee',
    layers: [
      L('r2c', 'cover', { color: '#e8f4ee', emoji: '🚌', kick: '시험날 아침', head: '고사장\n가는 길', sub: '어떻게 갈지 고르기' }),
      L('r2c', 'choice', { color: '#e8f4ee', key: 'way', q: '어떻게 가요?', opts: [['걸어서', '🚶'], ['버스 · 지하철', '🚇'], ['차로', '🚗']] }),
      L('r2c', 'verdict', {
        color: '#163a2a', decide: verdictBy('way', {
          '걸어서': { kick: '출발', big: '평소보다 10분 일찍', sub: '추운 날은 몸이 굳어요', lines: ['장갑 · 핫팩'] },
          '버스 · 지하철': { kick: '출발', big: '여유 있게', sub: '시험날 아침은 붐빌 수 있어요', lines: ['한 정거장 먼저 내릴 생각도'] },
          '차로': { kick: '출발', big: '가장 일찍', sub: '고사장 앞은 막혀요', lines: ['조금 떨어진 곳에서 내리기'] }
        })
      })
    ]
  },
  {
    id: 'r2d', title: '수능 끝나고 뭐 할까', by: '자유인', tags: '수능 끝 계획 하고싶은것', color: '#fdeef4',
    layers: [
      L('r2d', 'cover', { color: '#fdeef4', emoji: '🎉', kick: '시험이 끝나면', head: '제일 먼저\n뭐 할까', sub: '하고 싶은 것 다 눌러요' }),
      L('r2d', 'checklist', { color: '#fdeef4', key: 'after', title: '하고 싶은 것', items: ['푹 자기', '친구랑 맛있는 거', '여행 계획', '미뤄 둔 드라마', '아르바이트'] })
    ]
  },

  // ---------- 구움과자레시피 → 베이킹 ----------
  {
    id: 'r4a', title: '버터 고르는 법', by: '오븐장갑', tags: '버터 베이킹 구움과자 재료', color: '#fff6dc',
    layers: [
      L('r4a', 'cover', { color: '#fff6dc', emoji: '🧈', kick: '재료 하나', head: '어떤 버터로\n구울까', sub: '굽고 싶은 맛을 고르면' }),
      L('r4a', 'choice', { color: '#fff6dc', key: 'taste', q: '원하는 맛은?', opts: [['고소하게', '🌰'], ['깔끔하게', '💧']] }),
      L('r4a', 'verdict', {
        color: '#3d3110', decide: verdictBy('taste', {
          '고소하게': { kick: '추천', big: '발효버터', sub: '향이 진해서 휘낭시에 · 마들렌에', lines: ['무염으로 고르고 소금은 따로'] },
          '깔끔하게': { kick: '추천', big: '무염 일반 버터', sub: '재료 맛이 잘 살아요', lines: ['스콘처럼 담백한 과자에'] }
        })
      })
    ]
  },
  {
    id: 'r4b', title: '구움과자 선물 포장', by: '포장요정', tags: '구움과자 선물 포장 베이킹', color: '#fdeef4',
    layers: [
      L('r4b', 'cover', { color: '#fdeef4', emoji: '🎁', kick: '구웠으면', head: '선물 포장\n체크리스트', sub: '준비한 것만 눌러요' }),
      L('r4b', 'checklist', { color: '#fdeef4', key: 'wrap', title: '포장 준비', items: ['완전히 식히기', '개별 OPP 봉투', '건조제', '리본 · 스티커', '만든 날짜 적기'] })
    ]
  },
  {
    id: 'r4c', title: '오늘 오븐 컨디션', by: '홈베이커', tags: '오븐 베이킹 굽기 온도', color: '#fbecd9',
    layers: [
      L('r4c', 'cover', { color: '#fbecd9', emoji: '🔥', kick: '굽기 전에', head: '우리 집 오븐\n어떤 편?', sub: '지난번 결과로 골라요' }),
      L('r4c', 'choice', { color: '#fbecd9', key: 'last', q: '지난번 과자가', opts: [['겉만 탔어요', '🟤'], ['덜 익었어요', '⚪'], ['딱 좋았어요', '🟡']] }),
      L('r4c', 'verdict', {
        color: '#3a240f', decide: verdictBy('last', {
          '겉만 탔어요': { kick: '오늘은', big: '10°C 낮게', sub: '대신 시간을 조금 늘리기', lines: ['윗칸 말고 가운데 칸'] },
          '덜 익었어요': { kick: '오늘은', big: '예열 충분히', sub: '예열 후 10분 더 기다리기', lines: ['문은 자주 열지 않기'] },
          '딱 좋았어요': { kick: '오늘은', big: '그대로', sub: '지난번 온도와 시간 그대로', lines: [] }
        })
      })
    ]
  },

  // ---------- 아이폰듀오 살까말까 → 폰 바꾸기 ----------
  {
    id: 'r5a', title: '폰 바꾸기 전 백업 체크', by: '테크언니', tags: '아이폰 백업 폰 바꾸기 테크', color: '#ececec',
    layers: [
      L('r5a', 'cover', { color: '#ececec', emoji: '💾', kick: '바꾸기 전에', head: '백업\n다 했나?', sub: '끝낸 것만 눌러요' }),
      L('r5a', 'checklist', { color: '#ececec', key: 'backup', title: '백업', items: ['사진', '메신저 대화', '인증서 · 2단계 인증 앱', '메모 · 연락처'] })
    ]
  },
  {
    id: 'r5b', title: '폴더블 vs 일반폰', by: '비교왕', tags: '폴더블 아이폰 비교 테크', color: '#e9eef7',
    layers: [
      L('r5b', 'cover', { color: '#e9eef7', emoji: '📖', kick: '하나만 고르면', head: '나한테 맞는 건\n폴더블? 일반?', sub: '폰으로 제일 많이 하는 일' }),
      L('r5b', 'choice', { color: '#e9eef7', key: 'use', q: '폰으로 제일 많이', opts: [['영상 · 웹툰', '🎬'], ['메신저 · 통화', '💬'], ['문서 · 메모', '📝']] }),
      L('r5b', 'verdict', {
        color: '#141c2b', decide: verdictBy('use', {
          '영상 · 웹툰': { kick: '추천', big: '폴더블', sub: '펼친 큰 화면이 제일 빛나는 쓰임', lines: [] },
          '메신저 · 통화': { kick: '추천', big: '일반폰', sub: '가볍고 한 손에 편한 쪽', lines: [] },
          '문서 · 메모': { kick: '추천', big: '써 보고 결정', sub: '매장에서 펼쳐 직접 타이핑해 보기', lines: [] }
        })
      })
    ]
  },
  {
    id: 'r5c', title: '쓰던 폰, 팔까 둘까', by: '중고마켓러', tags: '중고 폰 판매 아이폰 바꾸기', color: '#eef6e9',
    layers: [
      L('r5c', 'cover', { color: '#eef6e9', emoji: '🔁', kick: '새 폰이 오면', head: '쓰던 폰\n팔까 둘까', sub: '두 번 고르면' }),
      L('r5c', 'choice', { color: '#eef6e9', key: 'state', q: '쓰던 폰 상태', opts: [['깨끗해요', '✨'], ['흠집 조금', '🩹'], ['많이 낡았어요', '🪫']] }),
      L('r5c', 'verdict', {
        color: '#18301a', decide: verdictBy('state', {
          '깨끗해요': { kick: '판정', big: '팔기', sub: '상태 좋을 때 파는 게 이득', lines: ['초기화 전에 백업'] },
          '흠집 조금': { kick: '판정', big: '팔거나 서브폰', sub: '가족에게 물려주기도 좋아요', lines: [] },
          '많이 낡았어요': { kick: '판정', big: '보관 · 재활용', sub: '공기계로 알람 · 음악용', lines: [] }
        })
      })
    ]
  }
];

export const RELATED = () => RELATED_APPS().map(a => ({ ...a, mine: false, related: true }));

// 시작 콘텐츠 → 둘째 칸에 띄울 것 (위 띠 타일의 key, 순서 = 보여줄 순서)
export const NEXT_OF = {
  s1: ['app:r1a', 'app:r1b', 'app:r1c', 'app:r1d'],
  s2: ['app:r2a', 'app:r2b', 'app:r2c', 'app:r2d'],
  s3: ['app:o1', 'app:p2', 'web:만동제과', 'web:SF베이글', 'web:밀로밀'],
  s4: ['app:r4a', 'app:r4c', 'app:r4b', 'app:p1'],
  s5: ['app:r5b', 'app:r5a', 'app:r5c']
};
