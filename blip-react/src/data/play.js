import { useSyncExternalStore } from 'react';

// 플레이 상태: 콘텐츠(앱) 하나 안에서 장과 장이 고른 답을 나눠 씀.
// 2장에서 고른 것 → 4장의 판정이 바뀌는 식. 앱 id별로 { key: 값 }
const answers = {};
const subs = new Set();
let version = 0;

export const answersOf = app => answers[app] || {};

export function answer(app, key, value) {
  answers[app] = { ...answersOf(app), [key]: value };
  version++;
  subs.forEach(f => f());
}

export function usePlay(app) {
  useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => version);
  return answersOf(app);
}
