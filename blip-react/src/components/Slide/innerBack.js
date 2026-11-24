import { useEffect } from 'react';

// 콘텐츠 안에서 한 단계 들어갔을 때(예: 듀오의 영상 하나, 빵집 하나, 블립 안의 기사) 왼쪽 아래 '뒤로'가 그 단계를 닫음.
//   들어가 있으면 'blip:depth'로 알려 뒤로 버튼을 켜고, 'blip:back'을 받으면 닫음 (받았으면 콘텐츠 사이의 뒤로는 안 함)
export function useInnerBack(active, close, play) {
  useEffect(() => {
    if (!play || !active) return undefined;
    dispatchEvent(new CustomEvent('blip:depth', { detail: { on: true } }));
    const back = e => { if (e.defaultPrevented) return; e.preventDefault(); close(); };
    addEventListener('blip:back', back);
    return () => { removeEventListener('blip:back', back); dispatchEvent(new CustomEvent('blip:depth', { detail: { on: false } })); };
  }, [active, play]); // eslint-disable-line react-hooks/exhaustive-deps -- 들어가고 나올 때만
}
