import { makeLayer } from './apps';

// A안(/1) 데모: 디깅하면 블립이 플랫폼을 가리지 않고 가져오는 답들.
// 블립의 답은 정해진 꼴이 없음 — 영상은 영상으로, 글은 글로, 이웃의 블립 콘텐츠는 블립 콘텐츠로 그대로 뜸.
// 채널·블로그·이웃 이름과 내용은 데모용으로 지어낸 것 (실제 계정 아님)
const L = (app, kind, extra) => makeLayer(kind, { app, ...extra });

const FOUND_APPS = () => [
  // ---------- 크루아상 ----------
  {
    id: 'f1', title: '노오븐 초간단 크루아상', by: '오늘도굽는집', tags: '크루아상 만들기 레시피 노오븐 에어프라이어 영상 홈베이킹',
    layers: [L('f1', 'video', {
      bread: 'croissant', bg: '#3a2817', dur: '9:41', at: '42%', channel: '오늘도굽는집', views: '조회수 48만회 · 2주 전',
      title: '오븐 없이 크루아상? 에어프라이어로 12분',
      chapters: [['0:00', '준비물: 냉동 생지 없이'], ['1:20', '버터 접기 없이 결 만들기'], ['4:05', '에어프라이어 180°C 12분'], ['7:30', '단면 확인']]
    })]
  },
  {
    id: 'f2', title: '파리 파티시에의 정통 크루아상', by: 'Claire의 부엌', tags: '크루아상 레시피 프랑스 파티시에 정통 버터 접기 블로그',
    layers: [
      L('f2', 'article', {
        blog: 'Claire의 부엌', date: '2026.10.02', title: '파리에서 배운 정통 크루아상, 집에서 사흘 걸려 굽기', bread: 'croissant', tint: '#f3e3c6',
        paras: ['크루아상은 시간으로 만드는 빵이에요. 반죽 하루, 버터 접기 하루, 굽는 날 하루.', '버터는 반죽과 같은 온도로. 너무 차가우면 깨지고, 따뜻하면 녹아 결이 사라져요.']
      }),
      L('f2', 'article', {
        blog: 'Claire의 부엌', date: '2026.10.02', title: '접기는 세 번이면 충분해요', tint: '#f3e3c6',
        paras: ['3절 접기를 세 번. 접을 때마다 냉장고에서 30분 쉬게 두세요.', '굽기 전 마지막 발효에서 버터가 녹지 않게, 따뜻한 곳은 피하는 게 좋아요.', '단면에 벌집 같은 구멍이 보이면 성공이에요.']
      })
    ]
  },
  {
    id: 'f3', title: '프랑스 유학생이 고른 서울 크루아상', by: '파리에서 온 빵순이', tags: '크루아상 맛집 서울 프랑스 유학생 용산 서초 종로 블로그',
    layers: [
      L('f3', 'article', {
        blog: '파리에서 온 빵순이', date: '2026.11.03', title: '파리 3년 살다 온 사람이 고른 서울 크루아상 3곳', bread: 'croissant', tint: '#f6e8d2',
        paras: ['결이 바삭하게 부서지는지, 버터 향이 끝까지 남는지 두 가지만 봤어요.', '테디뵈르하우스(용산): 서울 3대 크루아상으로 자주 소개되는 곳.']
      }),
      L('f3', 'article', {
        blog: '파리에서 온 빵순이', date: '2026.11.03', title: '나머지 두 곳', tint: '#f6e8d2',
        paras: ['메종고댕(서초): 피가로지 크루아상 경연에서 우승한 제빵사의 가게.', '오버트 서울(종로): 자이언트 크루아상을 카푸치노에 찍어 먹는 곳.', '영업 시간은 가기 전에 꼭 다시 확인하세요.']
      })
    ]
  },
  {
    id: 'f4', title: '우리집에서 제일 가까운 배달 크루아상', by: '블로그 이웃 · 연남빵러', tags: '크루아상 배달 가까운 맛집 동네 이웃',
    layers: [
      L('f4', 'cover', { color: '#fbecd6', emoji: '🛵', kick: '이웃이 만든 블립', head: '제일 가까운\n배달 크루아상', sub: '사는 동네를 고르면 골라 줘요' }),
      L('f4', 'choice', { color: '#fbecd6', key: 'home', q: '어느 쪽에\n살아요?', opts: [['용산', '📍'], ['서초', '📍'], ['종로', '📍'], ['연남', '📍']] }),
      L('f4', 'verdict', {
        color: '#3a2817', decide: a => a.home && ({
          용산: { kick: '제일 가까운 곳', big: '테디뵈르하우스', sub: '용리단길', lines: ['배달 가능 여부는 주문 앱에서 확인'] },
          서초: { kick: '제일 가까운 곳', big: '메종고댕', sub: '서초', lines: ['배달 가능 여부는 주문 앱에서 확인'] },
          종로: { kick: '제일 가까운 곳', big: '오버트 서울', sub: '종로', lines: ['배달 가능 여부는 주문 앱에서 확인'] },
          연남: { kick: '제일 가까운 곳', big: '오버트 서울', sub: '연남에서 가장 가까운 크루아상 전문', lines: ['이웃 메모: 포장해서 오는 게 더 바삭해요'] }
        })[a.home]
      })
    ]
  },

  // ---------- 빵은 언제 먹고, 언제 품절될까 ----------
  {
    id: 'f5', title: '빵은 언제 먹어야 제일 맛있을까', by: '빵선생', tags: '빵 언제 먹나 아침 저녁 시간 보관 맛있게 영상',
    layers: [L('f5', 'video', {
      bread: 'salt', bg: '#2c2418', dur: '11:02', at: '18%', channel: '빵선생', views: '조회수 12만회 · 5일 전',
      title: '갓 구운 빵이 늘 정답일까? 빵마다 먹는 때가 달라요',
      chapters: [['0:00', '갓 구운 빵의 함정'], ['2:15', '소금빵은 구운 뒤 1시간 안'], ['5:40', '바게트는 당일, 식빵은 다음 날'], ['8:10', '다시 데우는 요령']]
    })]
  },
  {
    id: 'f6', title: '오후 2시면 품절, 빵집 시간표', by: '주말엔 빵', tags: '품절 시간 빵집 오픈런 시간표 언제 블로그',
    layers: [
      L('f6', 'article', {
        blog: '주말엔 빵', date: '2026.11.15', title: '한 달 동안 적어 본 빵집 품절 시간표', bread: 'salt', tint: '#efe6d6',
        paras: ['한 달 동안 주말마다 같은 빵집 다섯 곳을 돌며 몇 시에 무엇이 떨어지는지 적어 봤어요.', '소금빵은 오픈 후 한 시간 안에 첫 판이 거의 빠졌어요.']
      }),
      L('f6', 'article', {
        blog: '주말엔 빵', date: '2026.11.15', title: '두 번째 판을 노리세요', tint: '#efe6d6',
        paras: ['두 번째 판은 대개 점심 무렵에 나왔어요. 오픈런보다 줄이 짧았어요.', '오후 2시가 넘으면 인기 메뉴는 거의 남지 않았어요.', '제가 다닌 다섯 곳 기준이라, 가게마다 다를 수 있어요.']
      })
    ]
  },
  {
    id: 'f7', title: '우리 동네 소금빵 품절 시간표', by: '블로그 이웃 · 망원산책', tags: '소금빵 품절 시간 시간표 동네 언제 이웃',
    layers: [
      L('f7', 'cover', { color: '#eef1e6', emoji: '⏰', kick: '이웃이 만든 블립', head: '소금빵,\n몇 시에 갈까', sub: '갈 수 있는 시간을 고르면 알려 줘요' }),
      L('f7', 'choice', { color: '#eef1e6', key: 'when', q: '언제 갈 수\n있어요?', opts: [['오픈 전 줄서기', '🌅'], ['점심 무렵', '🕛'], ['퇴근 후', '🌙']] }),
      L('f7', 'verdict', {
        color: '#23301c', decide: a => a.when && ({
          '오픈 전 줄서기': { kick: '이웃의 기록으로는', big: '첫 판', sub: '가장 확실하지만 줄이 길어요', lines: ['오픈 20분 전 도착 추천'] },
          '점심 무렵': { kick: '이웃의 기록으로는', big: '두 번째 판', sub: '줄이 짧고 갓 나온 빵', lines: ['나오는 시간은 가게에 물어보기'] },
          '퇴근 후': { kick: '이웃의 기록으로는', big: '거의 품절', sub: '다른 빵을 노리거나 예약하기', lines: ['전날 예약 받는 곳을 찾아보세요'] }
        })[a.when]
      })
    ]
  },
  {
    id: 'f8', title: '아침빵 vs 저녁빵, 나는 언제 먹을까', by: '빵먹는시간', tags: '빵 언제 먹나 아침 저녁 습관 테스트',
    layers: [
      L('f8', 'cover', { color: '#f6efe2', emoji: '🌗', kick: '두 번 고르면', head: '나는\n언제 빵을 먹지?', sub: '평소 모습대로 골라요' }),
      L('f8', 'choice', { color: '#f6efe2', key: 'meal', q: '빵은 주로', opts: [['아침 대신', '☕'], ['간식으로', '🍪'], ['저녁 반찬처럼', '🍷']] }),
      L('f8', 'verdict', {
        color: '#2e2616', decide: a => a.meal && ({
          '아침 대신': { kick: '당신은', big: '아침빵파', sub: '전날 사 둔 식빵·바게트가 잘 맞아요', lines: [] },
          '간식으로': { kick: '당신은', big: '오후빵파', sub: '점심 무렵 두 번째 판을 노리기', lines: [] },
          '저녁 반찬처럼': { kick: '당신은', big: '저녁빵파', sub: '품절 전 예약이 필요해요', lines: [] }
        })[a.meal]
      })
    ]
  }
];

export const FOUND = () => FOUND_APPS().map(a => ({ ...a, mine: false, found: true }));

// A안에서 고른 것 → 블립의 다음 답 (위 띠 타일의 key, 앞에서부터 3개)
export const FOUND_NEXT = {
  f1: ['app:f2', 'app:f3', 'app:f4', 'app:s4'],
  f2: ['app:f1', 'app:f3', 'app:s4', 'app:f4'],
  f3: ['app:f4', 'web:테디뵈르하우스', 'app:f2', 'web:메종고댕'],
  f4: ['app:f3', 'app:f1', 'app:s3', 'web:오버트 서울'],
  f5: ['app:f8', 'app:f6', 'app:f7', 'app:s3'],
  f6: ['app:f7', 'app:f5', 'app:s3', 'app:f8'],
  f7: ['app:f6', 'app:f8', 'app:f5', 'app:s3'],
  f8: ['app:f5', 'app:f7', 'app:f6', 'app:f1'],
  s3: ['app:f7', 'app:f3', 'app:o1', 'app:p2'],
  s4: ['app:f1', 'app:f2', 'app:r4a', 'app:p1']
};

// 어제의 디깅이 남긴 기록 (.blip 두 개). 오늘은 이 맥락에서 이어 시작
export const SEED_TURNS = [
  { act: { type: 'search', q: '크루아상' }, items: ['app:f1', 'app:f2', 'app:f3'], ctx: '크루아상', when: '어제 21:14' },
  { act: { type: 'pick', key: 'app:f1' }, items: ['app:f2', 'app:f3', 'app:f4'], ctx: '크루아상', when: '어제 21:16' },
  { act: { type: 'pick', key: 'app:f3' }, items: ['app:f4', 'web:테디뵈르하우스', 'app:f2'], ctx: '크루아상', when: '어제 21:21' },
  { act: { type: 'search', q: '빵 언제 먹어' }, items: ['app:f5', 'app:f8', 'app:f6'], ctx: '빵 먹는 때', when: '어제 22:02' },
  { act: { type: 'pick', key: 'app:f6' }, items: ['app:f7', 'app:f5', 'app:s3'], ctx: '빵 먹는 때', when: '어제 22:05' }
];
// 오늘 처음 블립이 건네는 3개: 어제의 맥락(크루아상 · 먹는 때)에서 이어짐
export const START_TURN = { act: { type: 'start' }, items: ['app:s3', 'app:f5', 'app:f1'], ctx: '빵 탐색' };

// 행동이 어느 .blip으로 떨어지는지 (데모용 규칙 — 실제 묶음은 데이터팀이 정함)
const BREAD_WORDS = ['크루아상', '소금빵', '베이글', '바게트', '식빵', '구움과자', '휘낭시에', '마들렌'];
export function ctxOf(text, prev) {
  if (/언제|품절|시간|아침|저녁/.test(text)) return '빵 먹는 때';
  const b = BREAD_WORDS.find(w => text.includes(w));
  if (b) return b;
  return prev || '빵 탐색';
}
