// Insert ME: 왼쪽 콘텐츠를 아무것도 채워지지 않은 처음 상태(바닐라)로 띄우고, 내가 직접 고르고 적게 함
export const emptyMe = () => ({ picks: [], fields: {} });

// 내가 고른 빵과의 궁합: 먼저 고른 빵일수록 높게 (같은 입력엔 늘 같은 값)
export const fitOf = (name, picks) => {
  const i = picks.indexOf(name);
  return i >= 0 ? 96 - i * 4 : 60;
};
