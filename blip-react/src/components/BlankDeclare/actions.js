// 빈칸에 뜨는 기능 아이콘: 새로운 아이템선언 + "지금 하는 일"에 맞는 3가지
const icon = name => import.meta.env.BASE_URL + 'icons/' + name;

// 드로잉키트 아이콘 (붓 + 팔레트). 다른 아이콘처럼 둥근 사각 타일 모양
const KIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#fff4dc"/><path d="M50 22c-17 0-30 12-30 27 0 14 11 25 24 25 5 0 6-3 5-6-1-4 1-7 6-7h6c8 0 15-6 15-14 0-14-12-25-26-25z" fill="#f2c063"/><circle cx="37" cy="44" r="5" fill="#e2483d"/><circle cx="50" cy="35" r="5" fill="#2f7cf6"/><circle cx="63" cy="42" r="5" fill="#2f9e6e"/><path d="M80 24 58 58" stroke="#3f4a3a" stroke-width="6" stroke-linecap="round"/><path d="M58 58c-4 1-7 4-7 9 4 0 8-2 9-6z" fill="#3f4a3a"/></svg>`;
const KIT_SRC = 'data:image/svg+xml,' + encodeURIComponent(KIT_SVG);

const NEW = { k: 'new', t: '새로운 아이템선언', s: '새로 만들기', src: icon('ic-new.png') };

// 텍스트 입력 아이콘 (T): 우클릭한 그 자리에 글을 바로 씀 — 오른쪽 콘텐츠의 우클릭 메뉴에서 NEW 대신
const TEXT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#f2f2f7"/><path d="M30 30h40M50 30v42" stroke="#1d1d1f" stroke-width="9" stroke-linecap="round"/><path d="M62 70h12" stroke="#0a84ff" stroke-width="5" stroke-linecap="round"/></svg>`;
export const TEXT = { k: 'text', t: '텍스트 입력', s: 'Text', src: 'data:image/svg+xml,' + encodeURIComponent(TEXT_SVG) };

// 텍스트 에디터 아이콘 (Aa + 줄): 끼워 넣은 글 칸을 우클릭하면 맨 앞에 — 글꼴 · 정렬 · 크기 · 색
const TEXTED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#e8f1ff"/><path d="M22 66l13-34 13 34M27 54h16" stroke="#0a5cc2" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M58 40h22M58 53h22M58 66h14" stroke="#0a84ff" stroke-width="7" stroke-linecap="round"/></svg>`;
export const TEXTED = { k: 'texteditor', t: '텍스트 에디터', s: '에디터', src: 'data:image/svg+xml,' + encodeURIComponent(TEXTED_SVG) };

export const ACTIONS = [
  NEW,
  TEXT, // 어디에 그린 빈칸이든 Claude 대신 텍스트 입력 (2026-11-21 사용자 요청)
  { k: 'kakao', t: '카카오톡', src: icon('ic-kakao.png') },
  { k: 'excel', t: 'Excel', src: icon('ic-excel.png') }
];

// 내 판을 만들고 있을 때: 디자인을 고치는 도구가 맨 앞
const EDIT = [
  NEW,
  { k: 'drawkit', t: '드로잉키트', src: KIT_SRC },
  TEXT, // 내 판 위에 그린 빈칸에서도 Claude 대신 텍스트 입력 (빈 장과 같게)
  { k: 'kakao', t: '카카오톡', src: icon('ic-kakao.png') }
];

// 채우기 아이콘 (점선 칸 안이 회색으로 차 있음 = 빈 장을 콘텐츠로 채움)
const FILL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#eef0f3"/><rect x="24" y="24" width="52" height="52" rx="9" fill="#cfd3da" stroke="#8a909b" stroke-width="4" stroke-dasharray="8 6"/></svg>`;

// 내 판의 빈 장 위에서 우클릭: 맨 앞이 "채우기" — 그 장을 블립이 제안하는 콘텐츠(반투명)로 채움
const EMPTY_PAGE = [
  { k: 'fill', t: '채우기', src: 'data:image/svg+xml,' + encodeURIComponent(FILL_SVG) },
  NEW,
  { k: 'drawkit', t: '드로잉키트', src: KIT_SRC },
  TEXT // 빈 장에선 Claude 대신 텍스트 입력: 그 자리에 바로 글을 씀
];

export const actionsFor = context => (context === 'emptypage' ? EMPTY_PAGE : context === 'edit' ? EDIT : context === 'component' ? COMPONENT : ACTIONS);

// 찾기 아이콘 (돋보기)
const FIND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#e9f1ff"/><circle cx="44" cy="44" r="18" fill="none" stroke="#2f7cf6" stroke-width="8"/><path d="M58 58l18 18" stroke="#2f7cf6" stroke-width="9" stroke-linecap="round"/></svg>`;

// 왼쪽 원본의 컴포넌트를 꾹 눌렀을 때: 이 컴포넌트로 할 수 있는 일
// (복사해서 붙이기는 그냥 끌면 되니까 여기엔 없음)
const COMPONENT = [
  NEW,
  { k: 'find', t: '비슷한 것 찾기', s: '비슷한 것', src: 'data:image/svg+xml,' + encodeURIComponent(FIND_SVG) },
  { k: 'claude', t: 'Claude', src: icon('ic-claude.png') },
  { k: 'kakao', t: '카카오톡', src: icon('ic-kakao.png') }
];
