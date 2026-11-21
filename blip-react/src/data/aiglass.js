// AI안경 이슈 몰아보기: 첫 슬라이더의 마지막(나만의 빵집지도)에서 위아래로 끌면 새로 생기는 콘텐츠
// 유튜브 알고리즘처럼 한 화면에: 영상 1 · 위험성 뉴스 2 · 젠틀몬스터 소식 1
// 모두 실제 보도 (2026-11-21 검색으로 확인). 제목·매체·날짜는 원문 그대로, 누르면 원문으로
//   젠틀몬스터의 AI 안경 협업 상대는 메타가 아니라 구글·삼성 (요청은 '메타'였지만 확인된 사실대로)
//   '리트냥이'는 실존 인물을 가리키는 멸칭이라, 영상은 주요 방송사 보도 그대로만 (추측·루머 영상은 넣지 않음)
const L = (kind, props = {}) => ({ id: 'aig-' + kind, kind, app: 'aig', ...props });

export const AIG_ITEMS = [
  {
    type: 'video', src: 'YTN', date: '유튜브 · 지금이뉴스',
    title: '원어민도 힘들다던데…\'리트냥이\' 수능 8등급→뉴텝스 565점 [지금이뉴스] / YTN',
    url: 'https://www.youtube.com/watch?v=nAM61tF8jS4', color: '#0b3d91'
  },
  {
    type: 'news', src: '뉴시스', date: '2026.07.24',
    title: '"나 쳐다보는 저 사람, 지금 혹시…" 공포가 돼 가는 AI 안경',
    url: 'https://www.newsis.com/view/NISX20260724_0003722460', color: '#e2483d'
  },
  {
    type: 'news', src: '뉴시스', date: '2026.08.03',
    title: '"이러다 몰카 안경 될라"…개인정보위, 삼성 \'AI 글래스\' 사생활 방지대책 요구',
    url: 'https://www.newsis.com/view/NISX20260803_0003734502', color: '#e2483d'
  },
  {
    type: 'news', src: 'VOGUE KOREA', date: '2026.11.10', tag: '젠틀몬스터 × 구글·삼성',
    title: '호아킨 피닉스가 보여주는 젠틀몬스터 첫 인텔리전트 아이웨어',
    url: 'https://www.vogue.co.kr/2026/11/10/%ed%98%b8%ec%95%84%ed%82%a8-%ed%94%bc%eb%8b%89%ec%8a%a4%ea%b0%80-%eb%b3%b4%ec%97%ac%ec%a3%bc%eb%8a%94-%ec%a0%a0%ed%8b%80%eb%aa%ac%ec%8a%a4%ed%84%b0-%ec%b2%ab-%ec%9d%b8%ed%85%94%eb%a6%ac%ec%a0%84/',
    color: '#111'
  }
];

export const AIG_APP = () => ({
  id: 'aig', title: 'AI안경 이슈 몰아보기', by: '블립', mine: false, color: '#eef1f6',
  tags: 'AI 안경 글래스 스마트 리트냥이 젠틀몬스터 구글 삼성 개인정보 몰카',
  layers: [L('ytfeed', { title: 'AI안경 이슈 몰아보기', items: AIG_ITEMS })]
});
