// 아이폰 듀오 살까말까: 블립이 가져오는 것들
// 후기 3개는 실제 콘텐츠 (2026-11-19 확인: 제목·날짜·내용은 보도·영상 소개에 나온 그대로 — from = 그 내용을 확인한 곳)
// type: 'text' = 글로 정리된 후기 (텍스트형 카드), 'video' = 영상 후기. 누르면 블립 안에서 펼쳐 봄 (바깥 페이지로 안 나감)
// 대본: 사용자가 준 자막 (Chapter 1 · 오프닝) 그대로 — 잇섭 · 주연 영상 모두 '대본 보기'에서 이것을 보여 줌 (2026-11-23 사용자 요청)
export const DUO_SCRIPT = {
  chapter: 'Chapter 1: 오프닝',
  lines: [
    ['0:00', 'I can already hear the comments: "Oh, now she\'s siding with the Fold." Lately, while preparing my reviews, I\'ve been recording thoughts and ideas with these earbuds as they come to me.'],
    ['0:10', '"October 22, the day after my unboxing. Having used the Fold8, the Duo feels harder to use. I should really capture those differences.'],
    ['0:19', 'iPhone Duo: design, weight, Touch ID, hinge, volume buttons. Note the Touch ID issues. Keyboard options, durability, and AppleCare+ costs: list the downsides.'],
    ['0:26', 'October 23, noon: iPhone usability issues and pain. October 23, 12:07 p.m.: Duo weight and gesture issues.'],
    ['0:31', 'October 23, 6 p.m.: display settings and grip issues." I\'ve kept taking notes like this since the unboxing went up.']
  ]
};

export const VIDEOS = [
  {
    // 원문: Gadget Review의 MKBHD 리뷰 기사를 2026-11-19 모바일 화면으로 캡처 (MacDailyNews는 자동 접속을 막아 캡처 불가)
    orig: { host: 'gadgetreview.com', title: 'Marques Brownlee Reviews Apple’s $1,999 iPhone Duo', img: import.meta.env.BASE_URL + 'demo/mkbhd-gadgetreview.jpg' },
    // ▼ 한 번 = 더 자세히 (원문 기사의 내용을 블립이 이어서 펼침), ▼ 한 번 더 = 원문 그대로
    more: {
      from: 'Gadget Review 기사에서',
      paras: [
        ['누구에게 맞나', '대부분의 아이폰은 100만 원대인데 듀오는 그 두 배예요. 오래 써 본 MKBHD의 결론은 “특정한 사람에겐 끌리지만, 거의 모두에겐 잘 맞지 않는다”예요.'],
        ['좋았던 것', '7.6인치 안쪽 화면과 힌지는 칭찬했어요. 하루를 마쳐도 배터리가 30% 넘게 남는 날이 많았대요.'],
        ['아쉬운 것', '망원 렌즈가 없고 ProRes 영상도 안 돼서 카메라는 프로 모델보다 아래예요. 어두운 곳에선 더 싼 모델 쪽에 가까웠대요.'],
        ['앱', 'Spotify, 구글 지도 같은 앱은 아직 접는 화면에 맞춰지지 않았고, 나아지려면 6개월쯤 걸릴 거래요.'],
        ['한마디로', '“real first generation fun” — 진짜 1세대다운 재미. 매력과 한계를 같이 담은 말이에요.']
      ]
    },
    type: 'text', ch: 'MKBHD', who: '미국 테크 리뷰', from: 'MacDailyNews 정리', color: '#c8102e', flag: '🇺🇸', title: 'iPhone Duo Review: First Generation Fun!', date: '2026.10.21',
    say: '“$2,000 to get an iPad Mini that can fit in your pocket”',
    body: [
      '아이폰 듀오를 “really fun”한 1세대 제품이라고 했어요. 구석구석 다듬은 마감이 큰 몫을 한대요.',
      '배터리는 하루 종일 넉넉하고, 효율은 아이폰 17 프로와 비슷하다고 봤어요.',
      '가장 아쉬운 점은 Face ID가 없다는 것. 전원 버튼의 지문 인식으로 대신해요.',
      '출시 시점엔 Spotify, 구글 지도, Discord 같은 앱이 아직 최적화되지 않았어요.'
    ]
  },
  {
    // 댓글: 에펨코리아 「아이폰 듀오 무게 쓸만하다고 리뷰하는 잇섭.jpg」(2026.10.26)에 달린 실제 댓글 (닉네임은 가림)
    cmFrom: '에펨코리아 반응',
    comments: [
      { who: '법무***', up: 492, text: '대여받아서 하는거 치고 억빠한다는 느낌은 사실 크게 안느껴지긴 했음..' },
      { who: '토끼*', up: 283, text: '폴더블에 대한 기준 자체는 명확하더라. 무게중심을 얼마나 잘 잡았느냐가 중요한듯' },
      { who: '강한***', up: 209, text: '폴더블이라서 무게는 관대할수 밖에 없음' },
      { who: '날스*', up: 20, text: '다들 리뷰에서 듣고 싶은 대답을 정해놓고 보는거임?' },
      { who: '농구**', up: 0, text: '근데 주는것도 아니고 대여가 웃긴다ㅋㅋ' }
    ],
    type: 'video', script: DUO_SCRIPT, ch: '잇섭', who: '국내 테크 리뷰', from: '유튜브 라이브 · 뉴시스 보도', color: '#111', flag: '🇰🇷', title: '아이폰 듀오 리뷰 · 내구성 라이브', date: '2026.10.26', dur: '라이브 약 3시간',
    say: '“무거워서 오래 쓰면 피로감이 더 빨리 온다”',
    body: [
      '직접 산 제품을 라이브로 100번 넘게 접고 비틀고, 모래를 뿌리고 떨어뜨려 봤어요.',
      '해외에서 보고된 화면 균열은 재현되지 않았어요. 다만 이 시험만으로 안전하다고 단정할 수는 없고, 오래 쓰면 힌지에 부담이 갈 수 있다고 했어요.',
      '“애플한테 1원도 안 받았다”며 악플에 강경 대응을 예고했어요.'
    ]
  },
  {
    // 댓글: 실제 댓글 내용은 찾지 못함 (다나와 페이지엔 댓글 수만 보임) → 화면 흐름을 보기 위한 예시. 실제 댓글을 받으면 여기만 바꾸면 됨
    cmFrom: '예시 댓글',
    cmSample: true,
    comments: [
      { who: '폴더***', up: 128, text: 'eSIM만 된다는 거 처음 알았어요. 알뜰폰은 어떻게 옮기나요?', replies: [{ who: '주연 ZUYONI', text: '통신사 앱에서 eSIM 전환 신청하면 돼요! 알뜰폰도 대부분 지원해요 🙂' }] },
      { who: '빵먹***', up: 64, text: '주름 생각보다 안 보이네요' },
      { who: 'apple***', up: 51, text: '스피커 비교 부분 진짜 좋았어요. 18 프로보다 낫다니', replies: [{ who: '주연 ZUYONI', text: '펼쳤을 때 기준이에요! 접으면 비슷해요' }] },
      { who: '갤폴***', up: 40, text: '폴드랑 무게 비교도 해 주세요' },
      { who: '오늘***', up: 33, text: '옆면 터치ID 반응 속도 어때요?', replies: [{ who: '주연 ZUYONI', text: '거의 바로 열려요. 장갑 끼면 안 되는 게 아쉬워요 🧤' }] },
      { who: '케이***', up: 21, text: '폴리오 케이스 스탠바이 너무 예쁘다' },
      { who: '유튜***', up: 12, text: '언박싱 브금 뭐예요?' },
      { who: '하루***', up: 8, text: '실사용 후기도 기다릴게요' }
    ],
    type: 'video', script: DUO_SCRIPT, ch: '주연 ZUYONI', who: '국내 테크 리뷰', from: '유튜브 · 다나와 소개', color: '#e86aa6', flag: '🇰🇷', title: '폴더블에 환장한 여자의 ‘아이폰 듀오’ 언박싱 & 첫 사용 후기', date: '2026.10.22', dur: '약 19분',
    say: '',
    body: [
      '언박싱부터. 물리 유심 없이 eSIM으로만 쓰는 구조예요.',
      '힌지 느낌, 나노텍스처 안쪽 화면의 주름과 반사를 직접 보여 줘요.',
      '옆면 Touch ID, 바깥 화면으로 미리 보는 카메라 기능, 공식 폴리오 케이스로 세워 두는 스탠바이까지.',
      '아이폰 18 프로와 스피커 소리도 비교해요.'
    ]
  }
];

// 쿠팡: 후기는 실제(사용자가 가져온 화면 · 글). 별점·상품평 수·분포는 아직 실제 숫자로 바꾸지 않음 (화면의 '예시' 표시는 사용자 요청으로 뺌, 2026-11-21)
export const COUPANG = {
  name: 'Apple 아이폰 듀오 256GB',
  url: 'https://www.coupang.com/vp/products/9729252969?itemId=29114763628&vendorItemId=96039350779',
  price: '3,290,000원',
  rating: 4.5, count: 1284,
  dist: [72, 15, 6, 3, 4], // 5점 → 1점 (%)
  // 실제 후기 (사용자가 쿠팡에서 가져온 화면, 2026-11-19). 이름은 쿠팡이 가린 그대로, 프로필 사진은 쓰지 않음
  reviews: [
    {
      who: '신*대', star: 5, date: '2026.11.18', opt: 'Apple 아이폰 Duo 자급제, 나이트 스카이, 512GB',
      head: '512GB 넉넉하고 색감도 고급스러운 자급제 폰',
      text: '512GB라 사진과 영상으로 채워도 저장 공간 걱정이 적어요. 나이트 스카이 색이 은은한 광택이라 고급스럽고, 모서리가 부드럽게 다듬어져 손에 쥐었을 때 부담이 없습니다. 화면이 밝고 색이 정확해 사진을 볼 때 눈이 편했고, 어두운 곳에서 찍은 사진도 노이즈가 적게 나왔어요. 자급제라 유심을 넣으면 바로 개통해 쓸 수 있고, 하루 종일 써도 배터리가 넉넉했습니다.'
    },
    {
      who: '금손언니', star: 5, date: '2026.11.18', opt: 'Apple 아이폰 Duo 자급제, 스타 화이트, 512GB',
      head: '듀오!! 실물깡패입니다 :)', imgs: ['cp-c1.jpg', 'cp-c2.jpg'],
      text: '듀오푸어가 됐지만.. 너무 만족합니다.\n애플 첫 폴더블 폰이라 꼭 써보고 싶었거든요,\n아직 호환안되는 어플이 많지만… 앞으로 나아지겠지요\n양품 뽑기 잘한거 같아요\n비싼아이인만큼 잘 달래서 쓸게요'
    },
    {
      who: '김*미', star: 5, date: '2026.10.24', opt: 'Apple 아이폰 Duo 자급제, 스타 화이트, 256GB',
      head: '미친ㅠㅠㅠㅠ', imgs: ['cp-a1.jpg', 'cp-a2.jpg'],
      text: '다른거 필요없이 조오오오오온나 이쁨 , 부드러움!!!\n\n원래 11월4일 배송받는건데\n1차에 배송받아서 너무 행복했다! 갓팡쓰.\n\n신랑이 갤럭시폴드8로 바꿨다가\n두달만에 18pro맥스로 돌아가는걸 봐버려서\n나도 혹시 불편해하지않을까 했었는데,\n그냥 너무 마음에 들고 너무 좋습니다~~~:D\n\n불편한거는 모르겠고 있다해도 개의치않아요ㅠㅠㅠ\n\n비싼거? 외엔 너무 만족함\n\n아이폰 시리즈 바꿀때\n크게 감흥 없었는데 이건 보기만 해도 흐뭇함.\n장난감 같기도 하고 너무 귀여워용\n난 어쩔 수 없는 앱등이 인가봐...'
    },
    // 사용자가 글로 가져온 후기 (2026-11-21). 이름·날짜·별점·옵션은 받지 않아서 비워 둠 (지어내지 않음)
    { text: '가격대가 높은 편이지만 태블릿과 핸드폰을 한번에 사용하는 느낌이 들어 사용하다보면 오히려 적정가라는 생각이 듭니다.' },
    { text: '붕어빵 타이쿤 때문에.. 아들 사줬는데.. 제가 더 많이 쓰긴하네요. 그래픽 디자인을 하느라고 컴퓨터 앞에 앉아있던 시간이 많은데 이제는 핸드폰으로 보고 컨펌하고 수정하고가 돼서 편해요. 평소 아이패드나 그래픽작업 많이 하시는 분들중에 이동 많이 하시는 분들이 있으면 좋으실겁니다.' },
    { text: '스타화이트 진ㄴㄴㄴㄴ짜 추천할게요.. 말이 안되는 오묘하고 예쁜 컬러.. ㅠㅠ 후회없는 선택입니다.' }
  ]
};

// 문단 우클릭 → 맨 위 블립 추천 (그 문단 아래에 컴포넌트가 생기며 이어 씀)
//   match: 문단 글에 이 말이 있으면 추천. asks: 추천 두 개 → 고르면 길이 정하기 → 갈래 버튼(+ 직접 입력) → 그 길이에 맞춰 글
// 듀오 배터리 수치: Apple EU 에너지 라벨 · MacRumors(2026-09-09) 보도 그대로 (2026-11-21 확인). 셀 두 개 나눔은 규제 문서 기반 보도라 '알려졌어요'
// 두 추천 모두 같은 갈래: 지난 아이폰과 비교 · 구체적인 스펙
const BATTERY_OPTS = [
  { label: '지난 아이폰과 비교', from: 'MKBHD 리뷰 · Apple 표기', lines: ['효율은 아이폰 17 프로와 비슷하다고 봤어요.', '하루를 마쳐도 30% 넘게 남는 날이 많았대요.', 'Apple 표기로는 일반 사용 최대 24시간이에요.'] },
  { label: '구체적인 스펙', from: 'Apple EU 에너지 라벨 · MacRumors', lines: ['배터리 용량은 총 4,883mAh예요.', '영상 재생은 바깥 5.4인치 화면으로 최대 44시간, 펼친 7.6인치 화면으로 최대 31시간이에요.', '스트리밍 영상은 각각 최대 37시간 · 26시간, 일반 사용은 최대 24시간이에요.', '두 셀은 2,962mAh와 1,921mAh로 나뉜다고 알려졌어요.'] }
];
export const PARA_ASKS = [
  {
    match: /배터리/,
    asks: [
      {
        q: '현재 배터리 오래쓰는 방법',
        opts: BATTERY_OPTS
      },
      {
        q: '아이폰 듀오 배터리 성능',
        opts: BATTERY_OPTS
      }
    ]
  }
];
export const asksFor = text => PARA_ASKS.find(a => a.match.test(text))?.asks || null;
