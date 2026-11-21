// 던져 두기: 브라우징하다 콘텐츠 영역이 아닌 아무 데나 던지면 → 요약된 아이콘 하나.
// 맥락이 같은 것이 FOLD_AT개 쌓이면 → 폴더 하나 (블립이 정한 묶음. 끌어서 빼면 사람이 이김)
// 던질 수 있는 것: url 하나(위 띠 타일·장·바깥 링크) 또는 그 url 안의 특정 정보(Peel 조각·붙여넣은 글)

export const FOLD_AT = 3;

const PLACES = [
  ['서울', /서울|용산|서초|종로|연남|성수|망원/], // 서울에서 먹는 프랑스 빵은 서울 쪽
  ['프랑스', /프랑스|파리|바게트|뺑오|브리오슈|캄파뉴|쇼송|푸가스|불랑주리/],
  ['일본', /일본|도쿄|오사카|교토|멜론빵|앙팡|카레빵/],
  ['이탈리아', /이탈리아|밀라노|로마|포카치아|치아바타|코르네토/],
  ['독일', /독일|베를린|뮌헨|브레첼|프레첼|슈톨렌/],
  ['영국', /영국|런던|스콘|크럼펫/]
];
const BREADS = ['크루아상', '소금빵', '베이글', '바게트', '식빵', '휘낭시에', '마들렌', '스콘', '단팥빵'];

// 같은 맥락 = 같은 나라 → 같은 빵 → 같은 출처 순서로
export function ctxOf(text, fromTitle) {
  const all = text + ' ' + (fromTitle || '');
  const place = PLACES.find(([, re]) => re.test(all));
  if (place) return place[0] + ' 빵';
  const bread = BREADS.find(b => all.includes(b));
  if (bread) return bread;
  return fromTitle || '모은 것';
}

const cut = (s, n) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};
const firstSentence = s => (s.match(/^[^.!?。\n]+[.!?。]?/) || [s])[0];
const isNumbery = s => /\d/.test(s) && /(%|g\b|개|년|배|명|원|€|위)/.test(s);

const COVER_ICON = { video: '▶', article: '📰', webpage: '🌐', blipweb: '🌐', web: '📍', card: '🗂', post: '📝' };
let aid = 0;

// tile: 위 띠·왼쪽에서 끌어 온 콘텐츠(또는 그 장 하나)
export function fromTile(tile, page) {
  const layer = page || tile.cover;
  const blip = tile.type === 'app' && !/video|article|webpage|blipweb/.test(layer?.kind || '');
  const lines = [layer?.title, layer?.head, ...(layer?.paras || []), layer?.sub].filter(Boolean).map(x => x.replace(/\n/g, ' '));
  return {
    id: 'a' + ++aid, type: 'link', tileKey: tile.key,
    icon: blip ? '🧩' : COVER_ICON[layer?.kind] || '🔗',
    title: cut(tile.title, 16),
    sum: cut(lines.slice(0, 2).join(' · ') || tile.title, 70),
    from: tile.by || (blip ? '블립 콘텐츠' : ''),
    ctx: ctxOf(tile.text || tile.title, tile.title)
  };
}

// Peel로 뜯은 조각: 그 url 안의 특정 정보 하나
export function fromPiece(piece) {
  const text = piece.text || '';
  const img = piece.kind === 'img' || (!text && piece.html);
  return {
    id: 'a' + ++aid, type: 'clip', piece,
    icon: img ? '🖼' : isNumbery(text) ? '📊' : '❝',
    title: cut(img ? (piece.from?.title || '이미지') : firstSentence(text), 16),
    sum: cut(text || piece.from?.title || '', 70),
    from: piece.from?.title || '',
    fromKey: piece.from?.id,
    ctx: ctxOf(text, piece.from?.title)
  };
}

// 바깥(다른 브라우저 창)에서 끌어 오거나 붙여넣은 것: url이면 링크, 아니면 글 조각
export function fromText(raw) {
  const s = raw.trim();
  const url = s.match(/^https?:\/\/\S+$/);
  if (url) {
    let host = s;
    try { host = new URL(s).hostname.replace(/^www\./, ''); } catch { /* 이상한 주소면 그대로 */ }
    let path = '';
    try { path = decodeURIComponent(new URL(s).pathname).replace(/[-_/]+/g, ' '); } catch { /* 그대로 */ }
    return { id: 'a' + ++aid, type: 'link', url: s, icon: /youtu/.test(host) ? '▶' : '🔗', title: cut(host, 16), sum: cut(s, 70), from: host, ctx: ctxOf(path, host) };
  }
  return {
    id: 'a' + ++aid, type: 'clip', piece: { kind: 'note', text: s },
    icon: isNumbery(s) ? '📊' : '❝', title: cut(firstSentence(s), 16), sum: cut(s, 70), from: '붙여넣은 글', ctx: ctxOf(s)
  };
}

// 화면에 놓인 모양: 낱개 아이콘들 + 폴더들. 폴더 자리 = 그 맥락에서 먼저 놓인 것의 자리
export function layout(assets) {
  const by = new Map();
  assets.forEach(a => {
    const c = a.pin || a.ctx;
    if (!by.has(c)) by.set(c, []);
    by.get(c).push(a);
  });
  const folders = [];
  const loose = [];
  by.forEach((list, ctx) => {
    if (list.length >= FOLD_AT && !ctx.startsWith('solo:')) folders.push({ ctx, items: list, x: list[0].x, y: list[0].y, head: list[0].id });
    else loose.push(...list);
  });
  return { folders, loose };
}
