// 빈칸에 뜨는 기능 아이콘. 지금은 고정 목록, 나중에 "지금 하는 일"에 맞춰 바뀌는 3가지로 교체
const icon = name => import.meta.env.BASE_URL + 'icons/' + name;

export const ACTIONS = [
  { k: 'new', t: '새로운 아이템선언', src: icon('ic-new.png') },
  { k: 'claude', t: 'Claude', src: icon('ic-claude.png') },
  { k: 'kakao', t: '카카오톡', src: icon('ic-kakao.png') },
  { k: 'excel', t: 'Excel', src: icon('ic-excel.png') }
];
