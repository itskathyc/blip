import { useEffect, useMemo, useRef, useState } from 'react';
import StoryStrip from './components/StoryStrip/StoryStrip';
import Viewer from './components/Viewer/Viewer';
import Carousel from './components/Carousel/Carousel';
import LayerSlider from './components/LayerSlider/LayerSlider';
import BlankDeclare from './components/BlankDeclare/BlankDeclare';
import TearSurface from './components/Edit/TearSurface';
import ImportModal from './components/Import/ImportModal';
import GptPanel from './components/Gpt/GptPanel';
import { KIT_COLORS } from './components/BlankDeclare/kit';
import { BREADS } from './data/breads';
import { AIG_APP } from './data/aiglass';
import { seedApps, makeNewBoard, makeLayer, NEXT_KIND, matchScore } from './data/apps';
import { WEB, MENU_COLOR } from './data/web';
import { PRIMARY, PRIMARY_LABEL, matchUrls } from './data/blog';
import { STARTERS, topicOf } from './data/starters';
import { makeCriterion, nextTemplates, splitBy, traitOfPiece } from './data/criteria';
import { suggestNext } from './data/suggest';
import { RELATED, NEXT_OF } from './data/related';
import { FOUND, FOUND_NEXT, SEED_TURNS, START_TURN, ctxOf } from './data/found';
import FlowStrip from './components/FlowStrip/FlowStrip';
import Slide, { Piece } from './components/Slide/Slide';
import BlipHistory from './components/BlipHistory/BlipHistory';
import Stash from './components/Stash/Stash';
import TextThrow from './components/Edit/TextThrow';
import { TRIP, TRIP_NEXT, DAIN_TASTE, detailApp } from './data/trip';
import { CELEB_BAKERIES, isCeleb } from './data/celebMap';
import { findPlace } from './components/Map/places';
import './App.css';

const webBoard = w => ({ id: 'web:' + w.t, title: w.t, mine: false, color: MENU_COLOR[w.m], layers: [{ id: 'web:' + w.t, kind: 'web', w }] });
const postLayer = p => ({ id: 'post:' + p.id, kind: 'post', post: p });
// 불러온 블로그 글 묶음: 위 띠에는 이것 하나만, 누르면 둘째 칸에 글들이 펼쳐짐
const BUNDLE = 'bundle:today';
const bundleCover = posts => ({
  id: BUNDLE, kind: 'card', color: '#e8f6ee', bread: 'loaf', head: '오늘 불러온\n블로그글', sub: '네이버 블로그 · ' + posts.length + '개',
  lines: posts.slice(0, 4).map(p => p.title.replace(/^\[[^\]]*\]\s*/, '').slice(0, 14))
});
const postBoard = p => ({ id: 'post:' + p.id, title: p.title, mine: false, layers: [postLayer(p)] });

// 지금 편집 중인 장면이 어떤 주제 쪽인지 (첫 칸의 순서를 정하는 단서)
const LAYER_HINT = { location: '연남 동네', nearby: '연남 동네', best: '연남 마늘바게트', result: '소금빵 크루아상 베이글', bakery: '소금빵 크루아상 베이글' };

// 드로잉키트 맨 위에 보이는 "지금 고른 것"의 이름
const EL_LABEL = { q: '질문', c0: '갈래', c1: '갈래', kick: '작은 글', big: '제목', mid: '제목', pill: '라벨', chip: '라벨' };

// 미리보기 칸 하나의 순서: 가까운 것 먼저, 같으면 원래 순서
// 블립은 많이 보여주지 않음: 한 칸에 확률 높은 몇 개만, 스크롤 없이
const PER_COL = 6;
const rankBy = (list, text, onlyHits) => list
  .map((t, i) => ({ t, i, s: text ? matchScore(t.text, text) : 0 }))
  .filter(x => !onlyHits || x.s > 0)
  .sort((a, b) => b.s - a.s || a.i - b.i)
  .map(x => x.t);

// 기준을 나눌 때 쓰는 글: 확정한 글이 있으면 그것만
const basisOf = posts => {
  const ok = posts.filter(p => p.state === 'ok');
  return ok.length ? ok : posts;
};
// 아직 아무것도 안 만든 판 (빈 장면 하나뿐)
const isEmptyStart = ls => ls.length === 1 && ls[0].kind === 'blank' && !ls[0].pieces?.length;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// 지운 템플릿도 "써 본 것"으로 쳐서 다시 제안하지 않음
const usedWith = (ls, rejected = []) => [...ls, ...rejected.map(q => ({ kind: 'criterion', tpl: q }))];

let pid = 0;
// 잠김 떨림(선언 전에 오른쪽을 누르면 흔들리며 막힘): 사용자 요청으로 잠시 끔 (2026-11-19). 다시 쓰려면 true
const LOCK_SHAKE = false;
let tid = 0;
const nowStr = () => { const d = new Date(); return '오늘 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const PER_TURN = 3; // A안: 블립은 한 차례에 3개만
// 첫 화면: 우리가 채워 둔 것 중 서로 다른 주제 3개 (빵집지도 · 수능날 옷차림 · 아이폰듀오)
const FIRST_FEED = ['app:s5', 'app:s2', 'app:s3']; // 아이폰듀오 → 수능날 날씨 → 빵집지도
const TODAY = 'today'; // 처음 3개를 묶은 썸네일 '오늘의 제안'
// 어느 검색에나 붙는 말은 주제를 가르지 않음 ("일본 디저트 추천"이 파리 빵집 '추천'에 걸리지 않게)
const GENERIC_WORDS = /^(추천|랭킹\d*위?|순위|\d+위|가장|제일|많|먹|best|top)$/i;
// 검색어의 조사를 떼서 낱말로 ("프랑스에서" → "프랑스", "먹는" → "먹")
const stem = q => q
  .replace(/(\S+?)빵(?=\s|$)/g, '$1 빵') // 붙여 쓴 말 나누기: "먹는빵" → "먹는 빵"
  .replace(/(\d+)(개|가지|곳)(?=\s|$)/g, '$1') // "10개" · "10가지" · "10곳" → "10"
  .split(/\s+/).map(w => (w.length > 1 ? w.replace(/(에서|으로|에게|까지|부터|이랑|하고|은|는|이|가|을|를|의|에|로|와|과|도)$/, '') : w)).filter(w => w && !GENERIC_WORDS.test(w)).join(' ');
const SHAPE_LABEL = { rect: '사각형', frame: '프레임', line: '선', arrow: '화살표', ellipse: '원', polygon: '다각형', star: '별', pen: '펜', pencil: '연필' };

// variant 'A' (/1): 위 띠 = 블립과 실시간으로 주고받는 얇은 띠(FlowStrip) + 히스토리 전경(.blip). 없으면 기존 Finder 띠
export default function App({ variant, handMode = false }) {
  const A = variant === 'A';
  const NEXT = A ? { ...NEXT_OF, ...FOUND_NEXT, ...TRIP_NEXT } : NEXT_OF;
  const [apps, setApps] = useState(() => (A ? [...seedApps(), ...TRIP(), ...FOUND(), ...STARTERS(), ...RELATED()] : [...seedApps(), ...STARTERS(), ...RELATED()]));
  const [projectId, setProjectId] = useState(() => apps[0].id); // 오른쪽(편집)의 내 판. 처음엔 제목 없는 새 판
  const [index, setIndex] = useState(0);
  // A: 왼쪽은 처음부터 채워져 있음 — 서로 다른 주제 3개. 카드뉴스엔 다인 취향에 가장 가까운 것, 나머지는 아래 슬라이더
  const [feed, setFeed] = useState(() => (A ? FIRST_FEED : []));
  const [path, setPath] = useState(() => (A ? [FIRST_FEED[0]] : [])); // 위 칸들에서 차례로 고른 것들. 마지막 것이 왼쪽(디깅)에 뜸
  const [suggestOpen, setSuggestOpen] = useState(false); // '오늘의 제안' 묶음을 펼쳤는지
  const [burst, setBurst] = useState(null); // 검색 결과가 새 창 3개처럼 한꺼번에 열렸다가 자리 잡는 순간
  const [pIndex, setPIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [seen, setSeen] = useState(() => new Set());
  const [fresh, setFresh] = useState([]);
  const [posts, setPosts] = useState([]); // 불러온 블로그 글 (정적객체)
  const [lastPrimary, setLastPrimary] = useState(null);
  const [importing, setImporting] = useState(false);
  const [gpt, setGpt] = useState(null); // 왼쪽에 붙은 GPT 대화창 { seed, from }
  const [sel, setSel] = useState(null); // 오른쪽에서 고른 것 { layerId, key }
  const [pieceWiggle, setPieceWiggle] = useState(null); // 조각이 흔들리는 장
  const [tool, setTool] = useState('move'); // 드로잉키트에서 고른 도구 (move = 고르고 옮기기)
  const [dropOver, setDropOver] = useState(false);
  const [copied, setCopied] = useState(false);
  // Peel: 왼쪽 원본을 컴포넌트 단위로 뜯을 수 있는 상태. 버튼 없음 — Cmd(맥)/Ctrl을 누르고 있는 동안만
  const [peel, setPeel] = useState(false);
  useEffect(() => {
    const isMod = e => e.key === 'Meta' || e.key === 'Control';
    const down = e => { if (isMod(e)) setPeel(true); };
    const up = e => { if (isMod(e)) setPeel(false); };
    const off = () => setPeel(false); // 창을 벗어나면(⌘+Tab 등) 떼는 신호가 안 올 수 있음
    // ⌘를 누른 채 끌다가 놓으면(맥) 그 사이에 뗀 신호(keyup)가 페이지에 오지 않음 → Peel이 켜진 채 남음.
    // 그래서 마우스가 움직일 때마다 ⌘(Ctrl)가 지금 실제로 눌려 있는지를 그대로 따름
    const sync = e => setPeel(!!(e.metaKey || e.ctrlKey));
    addEventListener('keydown', down);
    addEventListener('keyup', up);
    addEventListener('blur', off);
    addEventListener('pointermove', sync, true);
    addEventListener('pointerdown', sync, true);
    addEventListener('dragend', sync, true);
    addEventListener('drop', sync, true);
    return () => {
      removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', off);
      removeEventListener('pointermove', sync, true); removeEventListener('pointerdown', sync, true);
      removeEventListener('dragend', sync, true); removeEventListener('drop', sync, true);
    };
  }, []);
  // Peel이 꺼지면 왼쪽에 남은 점선·고름 표시도 지움 (리액트가 모르는 속성이라 저절로 안 지워짐)
  useEffect(() => {
    if (peel) return;
    document.querySelectorAll('[data-thov], [data-tsel]').forEach(el => { el.removeAttribute('data-thov'); el.removeAttribute('data-tsel'); });
  }, [peel]);
  // 위아래 2분할: 콘텐츠 안의 한 항목(예: 주연 영상)을 잡아 왼쪽 콘텐츠 화면 밖 아무 데나 놓으면 아래에 따로 열림
  const [split, setSplit] = useState(null);
  const [viewOver, setViewOver] = useState(false);
  useEffect(() => {
    const isView = e => [...(e.dataTransfer?.types || [])].includes('text/blip-view');
    const outside = e => !e.target.closest?.('.pane.dig .stage > .viewer-box .viewer');
    const over = e => { if (isView(e) && outside(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setViewOver(true); } };
    const drop = e => {
      setViewOver(false);
      if (!isView(e) || !outside(e)) return;
      e.preventDefault();
      const v = JSON.parse(e.dataTransfer.getData('text/blip-view'));
      setSplit({ id: Date.now(), app: v.app, layer: makeLayer('videos', { app: v.app, open: v.open }) });
    };
    const end = () => setViewOver(false);
    addEventListener('dragover', over);
    addEventListener('drop', drop);
    addEventListener('dragend', end);
    return () => { removeEventListener('dragover', over); removeEventListener('drop', drop); removeEventListener('dragend', end); };
  }, []);
  const [me, setMe] = useState(null); // Insert ME: 왼쪽 원본을 바닐라로 띄워 내가 직접 고르고 적는 상태
  const stageRef = useRef(null);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const project = apps.find(a => a.id === projectId);
  const locked = !project.title.trim();
  // 오른쪽 콘텐츠 영역을 보여 줄지: 무엇을 만들지 선언했거나, 이미 뭔가 놓였으면
  // 콘텐츠 화면은 + 로 선언했을 때만 (또는 장 자체를 가져왔을 때). 조각·글을 놓기만 해선 생기지 않음 → 떠 있는 아이템(floats)
  const showBoard = !locked || project.layers.some(l => l.kind !== 'blank');
  const [floats, setFloats] = useState([]);
  // 창을 만들고 의도를 선언하는 순간: 모아 둔 아이템들이 아이콘으로 줄어 위쪽에 한 줄로 정렬 (끌어서 콘텐츠에 넣으면 다시 원래 모양)
  const hadBoard = useRef(showBoard);
  useEffect(() => {
    if (showBoard && !hadBoard.current) {
      const pane = document.querySelector('.pane.edit');
      const perRow = Math.max(1, Math.floor(((pane?.clientWidth || 700) - 220) / 78));
      setFloats(fs => fs.map((f, i) => ({ ...f, piece: { ...f.piece, min: true }, x: 60 + (i % perRow) * 78, y: 50 + Math.floor(i / perRow) * 84 })));
    }
    hadBoard.current = showBoard;
  }, [showBoard]);
  // Enter = 지금 오른쪽 화면을 그대로 저장 (고치던 것 확정 · 제안이었으면 선명해짐 · 고르던 것 놓기)
  const [saved, setSaved] = useState(0);
  const lastPane = useRef('dig');
  const saveRef = useRef(null);
  saveRef.current = () => {
    const L = project.layers[index];
    if (!showBoard || !L) return false;
    touch(L.id);
    setSel(null); setPieceWiggle(null); setTool('move');
    setSaved(Date.now());
    return true;
  };
  useEffect(() => {
    const where = e => { lastPane.current = e.target.closest?.('.pane.edit') ? 'edit' : e.target.closest?.('.pane.dig') ? 'dig' : lastPane.current; };
    const key = e => {
      if (e.key !== 'Enter' || e.shiftKey || e.metaKey || e.ctrlKey || e.isComposing || lastPane.current !== 'edit') return;
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"], .imp-modal')) return; // 글 쓰는 중엔 그 글의 Enter (고쳐 쓰기 확정)
      if (saveRef.current()) e.preventDefault();
    };
    addEventListener('pointerdown', where, true);
    addEventListener('keydown', key);
    return () => { removeEventListener('pointerdown', where, true); removeEventListener('keydown', key); };
  }, []);
  useEffect(() => {
    if (!saved) return undefined;
    const t = setTimeout(() => setSaved(0), 1300);
    return () => clearTimeout(t);
  }, [saved]); // 오른쪽에 둥둥 떠 있는 아이템 { id, piece, x, y } (오른쪽 화면 기준 px)

  const tiles = useMemo(() => [
    ...(posts.length ? [{ key: BUNDLE, type: 'bundle', title: '오늘 불러온 블로그글', cover: bundleCover(posts), text: '블로그 ' + posts.map(p => p.title + ' ' + (p.bread || '')).join(' ') }] : []),
    ...posts.map(p => ({ key: 'post:' + p.id, type: 'post', post: p, title: p.title, cover: postLayer(p), text: [p.title, p.bread || '', p.shop, p.area].join(' ') })),
    ...apps.filter(a => a.title.trim() && !a.board).map(a => ({ // 내 판(새 판·복제본)은 위 띠에 안 뜸: 위는 타인의 콘텐츠만
      key: 'app:' + a.id, type: 'app', id: a.id, title: a.title, by: a.by, cover: a.layers[0], text: [a.title, a.by || '', a.tags || ''].join(' ')
    })),
    ...WEB.map(w => ({ key: 'web:' + w.t, type: 'web', w, title: w.t, cover: { id: 'web:' + w.t, kind: 'web', w }, text: [w.t, w.a, w.m, w.d].join(' ') }))
  ], [apps, posts]);
  const tileByKey = key => tiles.find(t => t.key === key);
  const sourceOf = tile => (tile.type === 'bundle' ? { id: BUNDLE, title: tile.title, mine: false, layers: [tile.cover] }
    : tile.type === 'web' ? webBoard(tile.w) : tile.type === 'post' ? postBoard(tile.post) : apps.find(a => a.id === tile.id));

  // 첫 칸의 기준은 오른쪽에서 편집 중인 장면(고른 빵 등). 왼쪽에서 둘러보는 동안엔 흔들리지 않음
  const focus = useMemo(() => {
    const L = project.layers[index];
    if (L?.kind === 'pick') {
      const names = (L.picked || [0, 2, 5]).map(i => BREADS[i]);
      if (names.length) return { label: names.join(' · '), text: names.join(' ') };
    }
    if (L?.kind === 'criterion') return { label: L.texts?.q ?? L.q, text: L.choices.flatMap(c => c.breads).join(' ') };
    if (L && LAYER_HINT[L.kind]) return { label: LAYER_HINT[L.kind].split(' ')[0], text: LAYER_HINT[L.kind] };
    if (L?.kind === 'card') return { label: L.head, text: L.head + ' ' + L.lines.join(' ') };
    if (L?.kind === 'web') return { label: L.w.m, text: L.w.m + ' ' + L.w.a };
    return null;
  }, [project, index]);

  // 고른 것과 가까운 것들: 맥락상 다음 것(NEXT)을 먼저, 남는 자리는 낱말이 겹치는 것으로
  const relatedOf = (picked, used) => {
    const others = tiles.filter(t => !used.includes(t.key));
    const next = picked.type === 'app' ? (NEXT[picked.id] || []).map(tk => others.find(t => t.key === tk)).filter(Boolean) : [];
    const near = rankBy(others.filter(t => !next.includes(t)), picked.text, true);
    return next.length || near.length ? [...next, ...near] : others;
  };

  // 하나를 정하면 나머지도 같은 방식으로 (빵을 물어봐야 하는 글은 빼고)
  const canBatch = p => p.state === 'pending' && !(lastPrimary === 'bread' && !p.bread);
  const batchN = lastPrimary ? posts.filter(canBatch).length : 0;

  // 칸들: 첫 칸(불러온 글이 맨 앞) + 고른 것마다 그 오른쪽에 "가까운 것들" 한 칸씩
  const columns = useMemo(() => {
    // 불러온 글들은 첫 칸에 낱개로 늘어놓지 않고 "오늘 불러온 블로그글" 하나로 묶음
    const postTiles = tiles.filter(t => t.type === 'post');
    const bundle = tiles.filter(t => t.type === 'bundle');
    const rest = tiles.filter(t => t.type !== 'post' && t.type !== 'bundle');
    const room = query ? PER_COL - 1 : PER_COL; // 첫 칸 맨 앞의 칩 자리
    // 아직 무엇을 만들지 안 정했으면: 처음 띄우는 다섯 개만. 정하면("빵서관") 그 말에 맞는 것부터
    // Remix로 붙은 제목(…의 복제본)은 위 띠를 바꾸지 않음: 사용자가 직접 선언한 제목만 기준
    const topic = project.forkOf ? '' : topicOf(project.title);
    const starters = rest.filter(t => t.type === 'app' && apps.find(a => a.id === t.id)?.starter);
    const hits = topic ? rankBy(rest, topic + ' ' + (focus?.text || ''), true) : [];
    const root = query ? rankBy(tiles, query, true)
      : !topic ? [...bundle, ...starters]
        : [...bundle, ...(hits.length ? hits : rankBy(rest, focus?.text, false))];
    // 지금 보고 있는 것(첫 칸에서 고른 것)은 무슨 일이 있어도 첫 칸에서 사라지지 않음
    const kept = root.slice(0, room);
    const picked0 = path[0] && !kept.some(t => t.key === path[0]) && tiles.find(t => t.key === path[0]);
    const cols = [{ from: 'root:' + query, items: picked0 ? [picked0, ...kept.slice(0, room - 1)] : kept, sel: path[0] }];
    path.forEach((key, k) => {
      const picked = tiles.find(t => t.key === key);
      if (!picked) return;
      // 묶음을 누르면: 둘째 칸 = 그 안의 글들 (확정 전엔 반투명, "나머지도" 칩도 이 칸에)
      if (picked.type === 'bundle') {
        cols.push({ from: key, items: postTiles.slice(0, batchN ? PER_COL - 1 : PER_COL), sel: path[k + 1], batch: true });
        return;
      }
      cols.push({ from: key, items: relatedOf(picked, path.slice(0, k + 1)).slice(0, PER_COL), sel: path[k + 1] });
    });
    return cols;
  }, [tiles, path, query, focus, batchN, project.title, project.forkOf, apps]); // eslint-disable-line react-hooks/exhaustive-deps -- relatedOf는 tiles에서 나옴
  const start = Math.max(0, columns.length - 3);

  const currentKey = path[path.length - 1];
  const currentTile = currentKey && tileByKey(currentKey);
  const source = currentTile && sourceOf(currentTile);

  const select = (col, tile) => {
    setPath(p => [...p.slice(0, col), tile.key]);
    setPIndex(0);
    setMe(null);
    setSeen(s => new Set(s).add(tile.key));
  };

  // ---------- 뒤로 · 앞으로 (브라우저처럼): 왼쪽에서 본 것들의 기록 ----------
  // 무엇을 열든(띠·슬라이더·검색·GPT) 기록에 쌓이고, 뒤로 간 뒤 새로 열면 앞쪽 기록은 지워짐
  const [nav, setNav] = useState(() => ({ list: currentKey ? [currentKey] : [], i: 0 }));
  const navJump = useRef(false);
  useEffect(() => {
    if (!currentKey) return;
    if (navJump.current) { navJump.current = false; return; }
    setNav(n => (n.list[n.i] === currentKey ? n : { list: [...n.list.slice(0, n.i + 1), currentKey], i: n.list.length ? n.i + 1 : 0 }));
  }, [currentKey]);
  const goNav = dir => {
    const j = nav.i + dir, t = nav.list[j] && tileByKey(nav.list[j]);
    if (!t) return;
    navJump.current = true;
    setNav(n => ({ ...n, i: j }));
    select(0, t);
  };
  const canBack = nav.i > 0, canFwd = nav.i < nav.list.length - 1;

  // 잠김: 아직 무엇을 만들지 정하지 않았으면(제목 없음) 오른쪽 콘텐츠가 떨리고 가운데 + 가 깜빡임
  // 제목 칸은 없음 — 콘텐츠의 + 를 눌러 "어떤 콘텐츠를 만드실건가요?"에 답하면 채워짐
  const nudge = () => {
    if (!LOCK_SHAKE) return;
    const el = stageRef.current;
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    const plus = el.querySelector('.import-plus');
    if (plus) { plus.classList.remove('pulse'); void plus.offsetWidth; plus.classList.add('pulse'); }
  };
  const guard = e => {
    if (!LOCK_SHAKE || !locked || e.target.closest('.pane-acts, .import-plus, .lcard-add')) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'pointerdown') nudge();
  };

  const updateProject = fn => setApps(list => list.map(a => (a.id === projectId ? fn(a) : a)));
  const updateLayers = fn => updateProject(a => ({ ...a, layers: fn(a.layers) }));
  const updateLayer = (id, fn) => updateLayers(ls => ls.map(l => (l.id === id ? fn(l) : l)));
  // 손대는 순간 선명해짐: Blip의 제안(반투명)은 그저 템플릿
  const vivid = l => (l.draft ? { ...l, draft: false } : l);
  const touch = id => updateLayer(id, vivid);

  // ---------- Blip이 주는 기준 (반투명 템플릿, 한 번에 최대 3개) ----------
  const proposeCriteria = (nextPosts, unlocked = !locked) => {
    if (!unlocked || !nextPosts.some(p => p.state === 'ok')) return;
    if (!isEmptyStart(project.layers) || project.proposed) return;
    const made = nextTemplates([], 3).map(t => makeCriterion(t, basisOf(nextPosts)));
    updateProject(a => ({ ...a, proposed: true, layers: made }));
    setFresh(made.map(m => m.id));
    setIndex(0);
  };

  const setTitle = title => {
    setApps(list => list.map(a => (a.id === projectId ? { ...a, title, forkOf: undefined } : a)));
    if (locked && title.trim()) proposeCriteria(posts, true);
  };

  // ---------- 불러오기 (정적객체) ----------
  const commitPosts = next => {
    setPosts(next);
    // 아직 반투명인 기준은 확정된 글을 따라 다시 나눔. 사용자가 손댄 기준은 그대로
    const basis = basisOf(next);
    setApps(list => list.map(a => ({
      ...a,
      layers: a.layers.map(l => (l.kind === 'criterion' && l.draft ? { ...l, choices: splitBy(l.trait, basis) } : l))
    })));
    proposeCriteria(next);
  };
  const importUrls = text => {
    const add = matchUrls(text, postsRef.current.map(p => p.id)).map(p => ({ ...p, primary: 'bread', state: 'pending' }));
    if (!add.length) return false;
    commitPosts([...postsRef.current, ...add]);
    setQuery(''); setPath([]);
    return true;
  };
  const postFns = {
    // 이름표를 누르면 다음 후보로 — 고치는 순간 확정
    onPrimary: id => {
      let picked = null;
      const next = posts.map(p => {
        if (p.id !== id) return p;
        picked = PRIMARY[(PRIMARY.indexOf(p.primary) + 1) % PRIMARY.length];
        return { ...p, primary: picked, state: picked === 'bread' && !p.bread ? 'pending' : 'ok' };
      });
      setLastPrimary(picked);
      commitPosts(next);
    },
    onBread: (id, bread) => {
      setLastPrimary('bread');
      commitPosts(posts.map(p => (p.id === id ? { ...p, bread, state: 'ok' } : p)));
    },
    onConfirm: id => {
      setLastPrimary(posts.find(p => p.id === id).primary);
      commitPosts(posts.map(p => (p.id === id ? { ...p, state: 'ok' } : p)));
    }
  };
  const batch = batchN ? {
    n: batchN, label: PRIMARY_LABEL[lastPrimary],
    onApply: () => commitPosts(posts.map(p => (canBatch(p) ? { ...p, primary: lastPrimary, state: 'ok' } : p)))
  } : null;

  // 화면 어디서든 블로그 주소를 붙여넣어도 불러옴
  useEffect(() => {
    const paste = e => {
      if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
      const text = e.clipboardData?.getData('text') || '';
      if (/https?:\/\//.test(text) && importUrls(text)) e.preventDefault();
    };
    addEventListener('paste', paste);
    return () => removeEventListener('paste', paste);
  });

  // 조각 흔들림은 다른 곳을 누르면 멈춤
  useEffect(() => {
    if (!pieceWiggle) return undefined;
    const stop = e => { if (!e.target.closest?.('[data-piece], [data-comp], [data-el], .cx')) setPieceWiggle(null); };
    addEventListener('pointerdown', stop);
    return () => removeEventListener('pointerdown', stop);
  }, [pieceWiggle]);

  // ---------- 리믹스 ----------
  // 장 하나 복사: 함수(판정 decide 등)는 그대로, 고칠 수 있는 것은 새 객체로.
  // app도 내 판 id로 바꿔서, 오른쪽에서 고르고 체크한 답이 왼쪽 원본과 섞이지 않게
  const copyLayer = (l, boardId, from) => makeLayer(l.kind, {
    ...l, draft: false, from,
    ...(l.app ? { app: boardId } : {}),
    ...(l.opts ? { opts: l.opts.map(o => [...o]) } : {}),
    ...(l.pieces ? { pieces: l.pieces.map(p => ({ ...p })) } : {}),
    ...(l.texts ? { texts: { ...l.texts } } : {}),
    ...(l.styles ? { styles: { ...l.styles } } : {}),
    ...(l.moves ? { moves: { ...l.moves } } : {}),
    ...(l.lines ? { lines: [...l.lines] } : {})
  });

  // 왼쪽에서 보던 장면을 오른쪽 타임라인 끝에 복사 (원본은 그대로). 빈 장면 하나뿐이면 그 자리를 대신함
  // 무엇을 만들지 안 정했어도(잠김) 끌어 온 장은 받음 (Peel 조각과 같은 규칙)
  const remix = (src, layers) => {
    const copies = layers.map(l => copyLayer(l, projectId, src.title));
    const onlyBlank = isEmptyStart(project.layers);
    updateLayers(ls => (onlyBlank ? copies : [...ls, ...copies]));
    setFresh(copies.map(c => c.id));
    setIndex(onlyBlank ? 0 : project.layers.length);
  };

  // Remix: 왼쪽 콘텐츠를 통째로 복제해 오른쪽에 내 판으로 띄움. 제목은 "[제목]의 복제본"
  // 오른쪽이 아직 손대지 않은 빈 새 판이면 그 자리를 쓰고, 아니면 새 판을 하나 더 만듦(지금 판은 그대로 남음)
  const fork = src => {
    // 복제본을 고쳐도 원본(위 띠·왼쪽의 타인 콘텐츠)은 절대 같이 바뀌지 않게
    const title = src.title + '의 복제본';
    const untouched = locked && isEmptyStart(project.layers);
    const nb = untouched ? null : makeNewBoard();
    const copies = src.layers.map(l => copyLayer(l, untouched ? projectId : nb.id, src.title));
    if (untouched) {
      setApps(list => list.map(a => (a.id === projectId ? { ...a, title, forkOf: src.title, layers: copies } : a)));
    } else {
      const b = { ...nb, title, forkOf: src.title, layers: copies };
      setApps(list => [b, ...list]);
      setProjectId(b.id);
    }
    setIndex(0); setSel(null);
    setFresh(copies.map(c => c.id));
  };

  // 끌어 온 것: 'key' = 그 콘텐츠 전체(위 칸의 미리보기), 'key#i' = 그 장면 하나(왼쪽 슬라이더의 카드)
  // 블로그 원본은 통째로 담지 않음 — 조각을 찢어 와서 씀
  const dropTile = data => {
    const [key, n] = data.split('#');
    const t = tileByKey(key);
    if (!t || t.type === 'post') return;
    const src = sourceOf(t);
    remix(src, n === undefined ? src.layers : [src.layers[+n]]);
  };

  const pick = (layerId, i) => updateLayer(layerId, l => {
    const picked = l.picked || [0, 2, 5];
    return vivid({ ...l, picked: picked.includes(i) ? picked.filter(x => x !== i) : [...picked, i] });
  });
  const publish = touch; // [이대로 사용]

  // + : 빈 장 하나. 채우는 건 사용자가 — 빈 장 위에 빈칸을 그려 "새로운 아이템선언"(그린 자리에 그대로 놓임),
  //   왼쪽에서 Peel한 조각·장 끌어오기, 드로잉키트. 아직 아무것도 없는 첫 장이면 새로 만들지 않고 그 장으로
  const addNext = () => {
    const ls = project.layers;
    if (isEmptyStart(ls)) { setIndex(0); return; }
    const blank = makeLayer('blank');
    updateLayers(cur => [...cur, blank]);
    setFresh([blank.id]);
    setIndex(ls.length);
  };

  // 마지막 장에서 휠을 한 번 더 굴리면 = 예전 + 처럼 블립이 다음 장을 제안 (반투명, 손대면 선명)
  const suggestMore = () => {
    const ls = project.layers;
    const nextKind = NEXT_KIND[ls[ls.length - 1]?.kind];
    const made = nextKind && !ls.some(l => l.kind === nextKind)
      ? makeLayer(nextKind, { draft: true })
      : suggestNext(project, posts, basisOf(posts));
    updateLayers(cur => [...cur, made]);
    setFresh([made.id]);
    setIndex(ls.length);
  };

  // 채우기 (빈 장 위 우클릭 → 맨 앞 아이콘): 그 빈 장을 블립이 제안하는 콘텐츠로. 반투명 = 아직 제안,
  //   [이대로 사용]을 누르거나 손대는 순간 선명. (예전 + 의 제안과 같은 규칙)
  //   글을 불러온 빈 판의 첫 장이면 고르는 기준 3장, 직전 장에 정해진 다음 화면이 있으면 그것, 아니면 판의 주제에 맞는 것
  const fillPage = id => {
    const ls = project.layers;
    const i = ls.findIndex(l => l.id === id);
    if (i < 0) return;
    const before = ls.slice(0, i);
    let made;
    if (posts.length && isEmptyStart(ls)) {
      made = nextTemplates(usedWith([], project.rejected), 3).map(t => makeCriterion(t, basisOf(posts)));
    } else {
      const nextKind = NEXT_KIND[before[before.length - 1]?.kind];
      made = [nextKind && !ls.some(l => l.kind === nextKind)
        ? makeLayer(nextKind, { draft: true })
        : suggestNext({ ...project, layers: ls.filter(l => l.id !== id) }, posts, basisOf(posts))];
    }
    updateLayers(cur => [...cur.slice(0, i), ...made, ...cur.slice(i + 1)]);
    setFresh(made.map(m => m.id));
    setIndex(i);
  };
  const fillRef = useRef(fillPage);
  fillRef.current = fillPage;
  useEffect(() => {
    const on = e => fillRef.current(e.detail.layerId);
    addEventListener('blip:fillpage', on);
    return () => removeEventListener('blip:fillpage', on);
  }, []);

  // 누른 채 이동 = 순서 바꾸기 (= 질문이 나오는 우선순위). 옮긴 장은 선명해짐
  const moveLayer = (from, to) => {
    updateLayers(ls => {
      const next = ls.slice();
      const [l] = next.splice(from, 1);
      next.splice(to, 0, vivid(l));
      return next;
    });
    if (index === from) setIndex(to);
    else if (from < index && to >= index) setIndex(index - 1);
    else if (from > index && to <= index) setIndex(index + 1);
  };

  // 꾹 누르기 → × : 지우기. 반투명 기준을 지우면 그 자리에 다른 템플릿이 들어옴 (한 번에 3개 유지)
  const removeLayer = id => {
    const ls = project.layers;
    const i = ls.findIndex(l => l.id === id);
    const gone = ls[i];
    const ghost = gone.kind === 'criterion' && gone.draft;
    const rejected = ghost ? [...(project.rejected || []), gone.tpl] : project.rejected || [];
    let next = ls.filter(l => l.id !== id);
    if (ghost) {
      const [tpl] = nextTemplates(usedWith(ls, rejected), 1);
      if (tpl) {
        const made = makeCriterion(tpl, basisOf(posts));
        next = [...next.slice(0, i), made, ...next.slice(i)];
        setFresh([made.id]);
      }
    }
    if (!next.length) next = [makeLayer('blank')];
    updateProject(a => ({ ...a, rejected, layers: next }));
    setIndex(clamp(index, 0, next.length - 1));
    if (sel?.layerId === id) setSel(null);
  };

  // ---------- 손가락 문법 (오른쪽 내 판) ----------
  const edit = {
    select: (layerId, key) => setSel({ layerId, key }),
    tool, setTool,
    // 드로잉키트로 그린 것 → 그 장의 새 조각 (그리는 순간 선명)
    addPiece: (layerId, piece) => {
      const id = 'pc' + ++pid;
      updateLayer(layerId, l => vivid({ ...l, pieces: [...(l.pieces || []), { scale: 1, ...piece, id }] }));
      setSel({ layerId, key: 'piece:' + id });
      return id;
    },
    // 콘텐츠 안에 끼워 넣은 글 칸 (우클릭 → 텍스트 입력)
    addInsert: (layerId, ins) => {
      const id = 'tb' + ++pid;
      updateLayer(layerId, l => vivid({ ...l, inserts: [...(l.inserts || []), { ...ins, id }] }));
      return id;
    },
    setInsert: (layerId, id, patch) => updateLayer(layerId, l => vivid({ ...l, inserts: (l.inserts || []).map(i => (i.id === id ? { ...i, ...patch } : i)) })),
    removeInsert: (layerId, id) => updateLayer(layerId, l => ({ ...l, inserts: (l.inserts || []).filter(i => i.id !== id) })),
    setPieceText: (layerId, id, text) => updateLayer(layerId, l => vivid({
      ...l, pieces: l.pieces.map(p => (p.id === id ? { ...p, text } : p))
    })),
    touch,
    wiggle: layerId => setPieceWiggle(layerId),
    setText: (layerId, key, text) => updateLayer(layerId, l => vivid({ ...l, texts: { ...(l.texts || {}), [key]: text } })),
    movePiece: (layerId, id, x, y) => updateLayer(layerId, l => ({
      ...l, pieces: l.pieces.map(p => (p.id === id ? { ...p, x: clamp(x, -160, 550), y: clamp(y, -160, 648) } : p)) // 네모 밖으로도 끌 수 있게 (놓으면 떠 있는 아이템)
    })),
    scalePiece: (layerId, id, f) => updateLayer(layerId, l => vivid({
      ...l, pieces: l.pieces.map(p => (p.id === id ? { ...p, scale: clamp((p.scale || 1) * f, .4, 3) } : p))
    })),
    // 슬라이드의 컴포넌트(글자 포함): 옮긴 자리·크기·지움을 layer.moves에
    moveComp: (layerId, key, dx, dy) => updateLayer(layerId, l => ({
      ...l, moves: { ...l.moves, [key]: { ...l.moves?.[key], dx, dy } }
    })),
    scaleComp: (layerId, key, f) => updateLayer(layerId, l => vivid({
      ...l, moves: { ...l.moves, [key]: { ...l.moves?.[key], s: clamp((l.moves?.[key]?.s || 1) * f, .3, 4) } }
    })),
    hideComp: (layerId, key) => {
      updateLayer(layerId, l => vivid({ ...l, moves: { ...l.moves, [key]: { ...l.moves?.[key], hide: true } } }));
      setSel(null);
    },
    // 가져온 컴포넌트 펼치기 · 접기 (접으면 첫 줄만)
    foldPiece: (layerId, id) => updateLayer(layerId, l => ({ ...l, pieces: l.pieces.map(p => (p.id === id ? { ...p, fold: !p.fold } : p)) })),
    minPiece: (layerId, id) => updateLayer(layerId, l => ({ ...l, pieces: l.pieces.map(p => (p.id === id ? { ...p, min: !p.min } : p)) })),
    removePiece: (layerId, id) => {
      updateLayer(layerId, l => vivid({ ...l, pieces: l.pieces.filter(p => p.id !== id) }));
      if (sel?.key === 'piece:' + id) setSel(null);
    },
    // 조각의 출처 점(•) → 왼쪽에 그 원본을 다시 엶
    openFrom: key => {
      const t = tileByKey(key);
      if (t) select(0, t);
    }
  };

  // 왼쪽에서 찢어 온 조각을 내 화면에 놓기. 기준 위에 놓으면 그 문장이 "증거"가 되어 Blip이 갈래를 다시 나눔
  const dropPiece = e => {
    setDropOver(false);
    // 오른쪽 화면 어디에 놓아도 내 판이 받음 (아래 레이어 줄이 먼저 받았으면 그대로). 던져 두기(Stash)는 오른쪽 밖에서만
    if (e.defaultPrevented) return;
    const raw = e.dataTransfer.getData('text/blip-piece');
    // 콘텐츠 위면 놓은 자리. 콘텐츠 화면 밖(또는 아직 없음)이면 그 자리에 떠 있는 아이템으로
    const vEl = e.target.closest('.viewer') || null;
    const pane = e.currentTarget.getBoundingClientRect();
    const float = (pc, i = 0) => setFloats(fs => [...fs, { id: 'f' + ++pid, piece: pc, x: e.clientX - pane.left + i * 18, y: e.clientY - pane.top + i * 18 }]);
    const at = (dx = 0) => {
      if (!vEl) return { x: 195 + dx, y: 244 + dx };
      const v = vEl.getBoundingClientRect(), k = v.width / 390;
      return { x: clamp((e.clientX - v.left) / k + dx, 20, 370), y: clamp((e.clientY - v.top) / k + dx, 20, 468) };
    };
    // 던져 둔 아이콘·폴더를 화면에 넣기 = 불러오기: 링크는 장으로, 조각은 놓은 자리에
    const stash = e.dataTransfer.getData('text/blip-stash');
    if (stash) {
      e.preventDefault();
      const list = JSON.parse(stash);
      list.filter(a => a.tileKey).forEach(a => dropTile(a.tileKey));
      const clips = list.filter(a => !a.tileKey).map(a => a.piece || { kind: 'note', text: a.title + '\n' + (a.url || a.sum) });
      if (!vEl) { clips.forEach((c, i) => float(c, i)); return; }
      const L = project.layers[index];
      if (L && clips.length) {
        const made = clips.map((c, i) => ({ ...c, id: 'pc' + ++pid, ...at(i * 18), scale: 1 }));
        updateLayer(L.id, l => vivid({ ...l, pieces: [...(l.pieces || []), ...made] }));
      }
      return;
    }
    // Peel로 끌어 온 장 전체(또는 위 띠의 콘텐츠)는 오른쪽 어디에 놓아도 레이어로 추가
    const page = e.dataTransfer.getData('text/blip-tile');
    if (!raw && page) { e.preventDefault(); dropTile(page); return; }
    if (!raw) return;
    e.preventDefault();
    if (!vEl) { float(JSON.parse(raw)); return; }
    const L = project.layers[index];
    if (!L) return;
    const piece = { ...JSON.parse(raw), id: 'pc' + ++pid, ...at(), scale: 1 };
    const trait = L.kind === 'criterion' && traitOfPiece(piece);
    updateLayer(L.id, l => vivid({
      ...l,
      pieces: [...(l.pieces || []), piece],
      ...(trait ? { trait, choices: splitBy(trait, basisOf(posts)) } : {})
    }));
    setSel({ layerId: L.id, key: 'piece:' + piece.id });
  };
  const floatDown = e => {
    const el = e.target.closest('[data-piece]');
    if (!el || e.button !== 0) return;
    e.stopPropagation(); // 빈칸 그리기 등이 시작되지 않게
    const id = el.dataset.piece;
    // 최소화 버튼 · 최소화된 아이콘: 눌렀다 바로 떼면 접기/펼치기, 끌면 옮기기 (아래 up에서)
    const minHit = !!e.target.closest('[data-min]');
    if (e.target.closest('[data-fold]')) { setFloats(fs => fs.map(f => (f.id === id ? { ...f, piece: { ...f.piece, fold: !f.piece.fold } } : f))); return; }
    if (e.target.closest('[data-from]')) { edit.openFrom(e.target.closest('[data-from]').dataset.from); return; }
    const f0 = floats.find(f => f.id === id);
    const x0 = e.clientX, y0 = e.clientY;
    el.setPointerCapture(e.pointerId);
    const mv = ev => setFloats(fs => fs.map(f => (f.id === id ? { ...f, x: f0.x + ev.clientX - x0, y: f0.y + ev.clientY - y0 } : f)));
    const up = ev => {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      if (minHit && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) { setFloats(fs => fs.map(f => (f.id === id ? { ...f, piece: { ...f.piece, min: !f.piece.min } } : f))); return; }
      // 콘텐츠 화면 위에 놓았으면 그 장의 조각으로 옮김
      const vEl = document.elementsFromPoint(ev.clientX, ev.clientY).find(n => n.matches?.('.pane.edit .viewer'));
      const L = project.layers[index];
      if (!vEl || !L || !showBoard) return;
      const v = vEl.getBoundingClientRect(), k = v.width / 390;
      edit.addPiece(L.id, { ...f0.piece, x: clamp((ev.clientX - v.left) / k, 20, 370), y: clamp((ev.clientY - v.top) / k, 20, 468) }); // 아이콘이면 아이콘 그대로
      setFloats(fs => fs.filter(f => f.id !== id));
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  };
  const dragOver = e => {
    const ty = e.dataTransfer.types;
    if (!ty.includes('text/blip-piece') && !ty.includes('text/blip-tile') && !ty.includes('text/blip-stash')) return;
    e.preventDefault(); // 오른쪽 화면 전체가 받음
    // 옮기는 커서(화살표). 복사만 허락한 것(위 띠 등)은 복사로
    e.dataTransfer.dropEffect = ['move', 'copyMove', 'linkMove', 'all'].includes(e.dataTransfer.effectAllowed) ? 'move' : 'copy';
    if (!dropOver) setDropOver(true);
  };

  // ---------- 드로잉키트 ----------
  const selLayer = (sel && project.layers.find(l => l.id === sel.layerId)) || null;
  const kitLayer = selLayer || project.layers[index];
  const kitKey = selLayer ? sel.key : 'bg';
  const selPiece = kitKey.startsWith('piece:') ? kitLayer?.pieces?.find(p => 'piece:' + p.id === kitKey) : null;
  const kitTarget = kitKey === 'bg' ? { type: 'bg', label: '배경' }
    : selPiece?.kind === 'note' ? { type: 'text', label: '텍스트', color: kitLayer?.styles?.[kitKey]?.color }
    : selPiece?.kind === 'shape' ? { type: 'shape', label: SHAPE_LABEL[selPiece.shape] || '도형', color: kitLayer?.styles?.[kitKey]?.color }
    : kitKey.startsWith('piece:') ? { type: 'piece', label: '조각' }
    : kitKey.startsWith('comp:') ? { type: 'piece', label: '컴포넌트' }
      : { type: 'text', label: EL_LABEL[kitKey] || '글자', color: kitLayer?.styles?.[kitKey]?.color };
  const onTool = k => {
    if (locked) { nudge(); return; }
    if (!kitLayer) return;
    const styles = { ...(kitLayer.styles || {}) };
    let pieces = kitLayer.pieces;
    let moves = kitLayer.moves;
    // 컴포넌트: 크기·모서리는 moves에 (조각과 같은 도구)
    if (kitKey.startsWith('comp:') && (k === 'scale+' || k === 'scale-' || k === 'round')) {
      const key = kitKey.slice(5), o = moves?.[key] || {};
      const next = k === 'round' ? { ...o, r: !o.r } : { ...o, s: clamp((o.s || 1) * (k === 'scale+' ? 1.15 : 1 / 1.15), .3, 4) };
      updateLayer(kitLayer.id, l => vivid({ ...l, moves: { ...l.moves, [key]: next } }));
      return;
    }
    if (k.startsWith('bg:')) styles.bg = { background: k.slice(3) };
    else if (k === 'size+' || k === 'size-') {
      const el = stageRef.current.querySelector(`[data-layer="${kitLayer.id}"] ` + (kitKey.startsWith('piece:') ? `[data-piece="${kitKey.slice(6)}"]` : `[data-el="${kitKey}"]`));
      const px = el ? parseFloat(getComputedStyle(el).fontSize) : 16;
      styles[kitKey] = { ...styles[kitKey], fontSize: Math.round(px * (k === 'size+' ? 1.15 : 1 / 1.15)) + 'px' };
    } else if (k === 'color') {
      const cur = styles[kitKey]?.color;
      styles[kitKey] = { ...styles[kitKey], color: KIT_COLORS[(KIT_COLORS.indexOf(cur) + 1) % KIT_COLORS.length] };
    } else if (k === 'scale+' || k === 'scale-') {
      const id = kitKey.slice(6);
      pieces = pieces.map(p => (p.id === id ? { ...p, scale: clamp((p.scale || 1) * (k === 'scale+' ? 1.15 : 1 / 1.15), .4, 3) } : p));
    } else if (k === 'round') {
      styles[kitKey] = { ...styles[kitKey], borderRadius: styles[kitKey]?.borderRadius ? undefined : '999px' };
    }
    updateLayer(kitLayer.id, l => vivid({ ...l, styles, pieces, moves }));
  };

  // 드로잉키트의 Image/video… → 지금 장 가운데에
  const addMedia = (src, media) => {
    if (locked) { nudge(); return; }
    const L = project.layers[index];
    if (L) edit.addPiece(L.id, { kind: 'media', media, src, w: 220, x: 195, y: 244 });
  };
  // 그리는 도구를 고른 동안 오른쪽 화면의 커서
  useEffect(() => {
    document.body.classList.toggle('tool-draw', tool !== 'move' && tool !== 'text');
    document.body.classList.toggle('tool-text', tool === 'text');
  }, [tool]);

  // Publish: 반투명 제안까지 모두 확정하고 건넬 링크를 복사
  const share = async () => {
    if (locked) { nudge(); return; }
    updateLayers(ls => ls.map(vivid));
    const url = location.origin + location.pathname + '#/b/' + project.id;
    try { await navigator.clipboard.writeText(url); } catch { /* 복사가 막혀도 표시는 그대로 */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // Commit: 건네지 않고 지금 판 전체를 그대로 저장 (반투명 제안도 선명해짐)
  const commit = () => {
    if (!showBoard) return;
    updateLayers(ls => ls.map(vivid));
    setSel(null); setPieceWiggle(null); setTool('move');
    setSaved(Date.now());
  };
  // 빈칸 선언 → Text (판의 장이 아닌 곳): 오른쪽에 떠 있는 글을 놓고 바로 쓰기 (Enter = 끝)
  useEffect(() => {
    const on = e => {
      const pane = document.querySelector('.pane.edit')?.getBoundingClientRect();
      if (!pane) return;
      const inside = e.detail.x >= pane.left && e.detail.x <= pane.right && e.detail.y >= pane.top && e.detail.y <= pane.bottom;
      const x = inside ? e.detail.x - pane.left : pane.width / 2, y = inside ? e.detail.y - pane.top : pane.height / 2;
      const id = 'f' + Date.now();
      setFloats(fs => [...fs, { id, piece: { kind: 'note', text: '텍스트', scale: 1 }, x, y }]);
      setTimeout(() => {
        const el = document.querySelector(`.floats [data-piece="${id}"] [data-ptext]`);
        if (!el) return;
        el.contentEditable = 'true'; el.focus();
        const r = document.createRange(); r.selectNodeContents(el);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        const key = ev => { if (ev.key === 'Escape' || (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing)) { ev.preventDefault(); el.blur(); } };
        el.addEventListener('keydown', key);
        el.addEventListener('blur', () => {
          el.removeEventListener('keydown', key); el.contentEditable = 'false';
          const text = el.innerText.replace(/\n+$/, '') || '텍스트';
          setFloats(fs => fs.map(f => (f.id === id ? { ...f, piece: { ...f.piece, text } } : f)));
        }, { once: true });
      }, 60);
    };
    addEventListener('blip:floattext', on);
    return () => removeEventListener('blip:floattext', on);
  }, []);

  // Create New: 지금 판은 그대로 두고, 제목 없는 새 판을 열기 (+ 하나로 시작 — "어떤 콘텐츠를 만드실건가요?")
  const createNew = () => {
    const nb = makeNewBoard();
    setApps(list => [nb, ...list]);
    setProjectId(nb.id);
    setIndex(0); setSel(null); setPieceWiggle(null); setTool('move');
    setFresh([]);
  };
  const [pubOpen, setPubOpen] = useState(false);
  useEffect(() => {
    if (!pubOpen) return undefined;
    const close = e => { if (!e.target.closest?.('.pub')) setPubOpen(false); };
    const esc = e => { if (e.key === 'Escape') setPubOpen(false); };
    addEventListener('pointerdown', close, true); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', close, true); removeEventListener('keydown', esc); };
  }, [pubOpen]);

  const search = q => { setQuery(q); setPath([]); };

  // GPT 대화창의 답 (데모: 가진 재료에서 찾아 카드로 보여줌)
  const gptAnswer = q => {
    if (!q) return { text: '무엇을 만들지 같이 정해봐요.\n어떤 빵, 어떤 동네 이야기인가요?' };
    const hits = rankBy(tiles, q, true).slice(0, 3);
    return hits.length
      ? { text: `‘${q}’ 쪽으로 ${hits.length}개 찾았어요.\n눌러서 왼쪽에서 보거나, 오른쪽 아래 타임라인으로 끌어다 담으세요.`, tiles: hits }
      : { text: `가진 재료 중엔 ‘${q}’에 맞는 게 아직 없어요.\n빵 이름(소금빵, 크루아상…)이나 동네(연남, 성수…)로 물어봐 주세요.` };
  };
  const openTile = t => (A ? pickA(t) : select(0, t));

  // 인스타그램처럼: 왼쪽 콘텐츠를 위로 밀면 같은 칸의 다음 콘텐츠, 아래로 밀면 이전 콘텐츠
  // 카드 전체(테두리까지)가 움직임: 손을 따라 밀린 쪽으로 빠져나가고(Carousel) → 다음 카드가 반대쪽에서 들어옴(in)
  const [swipe, setSwipe] = useState(null); // { dir, phase: 'in' }
  const swiping = useRef(false);
  const stepContent = dir => {
    const k = Math.max(0, path.length - 1);
    // A: 첫 슬라이더의 마지막(나만의 빵집지도)에서 위아래로 끌면 = 새 콘텐츠 'AI안경 이슈 몰아보기'가 그 뒤에 생김 (한 번만)
    if (A && !swiping.current && currentKey === feed[feed.length - 1] && !feed.includes('app:aig')) {
      if (!apps.some(a => a.id === 'aig')) setApps(list => [...list, AIG_APP()]);
      swiping.current = true;
      deriveNext('app:aig');
      setSwipe({ dir, phase: 'in' });
      setTimeout(() => { setSwipe(null); swiping.current = false; }, 380);
      return;
    }
    // A: 위에서 아래로 끌어내리기 = 새 콘텐츠 하나 (+ 와 같음, 지금 보던 것 바로 옆에). 위로 밀기 = 다음 것
    if (A && dir < 0) {
      if (swiping.current) return;
      const [t] = freshPicks(1);
      if (!t) return;
      swiping.current = true;
      deriveNext(t.key);
      setSwipe({ dir, phase: 'in' });
      setTimeout(() => { setSwipe(null); swiping.current = false; }, 380);
      return;
    }
    const list = A ? feed.map(tileByKey).filter(Boolean) : columns[k]?.items || [];
    if (!list.length) return;
    const i = path.length ? list.findIndex(t => t.key === path[k]) : -1;
    const next = list[i + dir];
    if (!next || swiping.current) return; // 처음/끝이면 그대로, 움직이는 중엔 한 번만
    // 빠져나가는 쪽은 Carousel이 손을 따라 이미 보냄 → 여기선 다음 카드가 반대쪽에서 들어오기만
    swiping.current = true;
    select(A ? 0 : k, next);
    setSwipe({ dir, phase: 'in' });
    setTimeout(() => { setSwipe(null); swiping.current = false; }, 380); // 위 띠에서 고를 땐 방향 애니메이션 없이
  };

  // Insert ME에서 내가 고르고 적는 것 (고른 순서 유지: 먼저 고른 빵이 궁합 1순위)
  const meFns = me && {
    ...me,
    onPick: i => setMe(m => {
      const n = BREADS[i];
      return { ...m, picks: m.picks.includes(n) ? m.picks.filter(x => x !== n) : [...m.picks, n] };
    }),
    onField: (k, v) => setMe(m => ({ ...m, fields: { ...m.fields, [k]: v } }))
  };

  // ---------- A안: 블립과의 대화 (차례 = 내가 한 것 + 블립의 답 3개) ----------
  const [turns, setTurns] = useState(() => (A ? [...SEED_TURNS, { ...START_TURN, when: nowStr() }].map(t => ({ ...t, id: 't' + ++tid })) : []));
  const [heard, setHeard] = useState(null); // 듣는 중인 차례 (잠깐 뒤 답이 띠에 들어옴)
  const [history, setHistory] = useState(false);
  const [hand, setHand] = useState(false); // ✋ 손 따라가기 (/hand에서만): 손이 있는 쪽 화면이 넓어짐. 끄면 반반 고정
  const [paneFocus, setPaneFocus] = useState(null);
  const [ratio, setRatio] = useState(.5); // 왼쪽(읽기) : 오른쪽(만들기) 비율 — 가운데 선을 끌어서
  const [resizing, setResizing] = useState(false);
  const workRef = useRef(null);
  const [strip] = useState(false); // 위 띠는 처음엔 숨김. 찾은 것들은 히스토리에서만
  useEffect(() => {
    if (!heard) return undefined;
    const t = setTimeout(() => { setTurns(ts => [...ts, { ...heard, id: 't' + ++tid, when: nowStr() }]); setHeard(null); }, 650);
    return () => clearTimeout(t);
  }, [heard]);
  const lastCtx = turns[turns.length - 1]?.ctx;
  const hear = (act, list, ctx) => {
    const items = [...new Set(list.map(t => t.key))].slice(0, PER_TURN);
    if (A && items.length) setHeard({ act, items, ctx });
  };
  // 띠에는 히스토리를 두지 않음: 내 선택의 결과(지금 차례 3개)와 그 다음 예측값만.
  // 예측 = 결과 중 가장 그럴듯한 것(첫째)을 고른다면 블립이 이어서 건넬 것들
  const nowItems = turns[turns.length - 1]?.items || [];
  const lead = nowItems.length ? tileByKey(nowItems[0]) : null;
  const predicted = A && lead ? relatedOf(lead, [lead.key, ...nowItems, ...path]).slice(0, PER_TURN) : []; // 지금 보고 있는 것(path)은 예측에서 뺌
  const pickA = tile => {
    select(0, tile);
    hear({ type: 'pick', key: tile.key }, relatedOf(tile, [tile.key]), ctxOf(tile.title, lastCtx));
  };
  // 블랭크 선언·알고리즘 설정기에서 적은 말: 플랫폼을 가리지 않고 가져온 것(found) 먼저
  // 검색: 결과 3개 → 다인 취향 순으로 왼쪽에 (첫째 = 카드뉴스, 나머지 = 아래 슬라이더).
  // 무엇을 검색했는지는 화면에 띄우지 않고 히스토리(위에서 끌어내리기)로만 감
  // 블립 페이지의 한 줄(예: 라 파리지엥)을 누르면 → 그것만의 페이지가 카드에 크게, 원래 보던 것·나머지는 아래에서 작게
  // 아래 슬라이더: 한 번이라도 찾았으면 처음 3개는 '오늘의 제안' 하나로 묶임.
  //   묶음을 누르면 → 셋이 원래 크기로 펼쳐지고, 찾아 온 것들은 작게
  //   그 밖엔 → 지금 보는 것만 원래 크기, 나머지는 모두 작게
  const slide = (() => {
    const extras = feed.filter(k => !FIRST_FEED.includes(k));
    const folded = extras.length > 0 && !suggestOpen;
    // 묶음은 처음 3개 중 앞선 것의 자리에 (순서를 바꿔 옮길 수 있음). 펼치면 그 자리에 셋이 나란히
    const firsts = feed.filter(k => FIRST_FEED.includes(k));
    const at0 = feed.findIndex(k => FIRST_FEED.includes(k));
    const group = folded ? [TODAY] : firsts;
    const items = !extras.length || at0 < 0 ? feed : [...feed.slice(0, at0).filter(k => !FIRST_FEED.includes(k)), ...group, ...feed.slice(at0).filter(k => !FIRST_FEED.includes(k))];
    const at = folded && FIRST_FEED.includes(currentKey) ? items.indexOf(TODAY) : items.indexOf(currentKey);
    const mini = items.map(k => (k === TODAY ? !FIRST_FEED.includes(currentKey)
      : extras.length && suggestOpen ? !FIRST_FEED.includes(k)
        : k !== currentKey));
    return { items, index: at, mini, extras, firsts };
  })();
  const todayCover = { id: TODAY, kind: 'card', color: '#f3f2ee', bread: 'croissant', head: '오늘의\n제안', sub: FIRST_FEED.length + '개',
    lines: FIRST_FEED.map(k => tileByKey(k)?.title).filter(Boolean) };
  // − : 이 레이어를 왼쪽 슬라이더에서 뺌 (오늘의 제안 묶음이면 셋 다). 보고 있던 것이면 옆 것으로
  // 블립이 새로 건넬 콘텐츠: 아직 안 띄운 것 · 내가 뺀 적 없는 것 중 무작위
  const removedRef = useRef(new Set());
  const freshPicks = (n, except = []) => {
    const skip = new Set([...feed, ...except, ...removedRef.current]);
    const ok = t => t.type === 'app' && !skip.has(t.key) && !apps.find(a => a.id === t.id)?.detail;
    // 무작위로 (아직 안 본 것 · 뺀 적 없는 것 중에서)
    return tiles.filter(ok).map(t => ({ t, r: Math.random() })).sort((a, b) => a.r - b.r).slice(0, n).map(x => x.t);
  };
  // + : 지금 보던 것 바로 옆에 새 콘텐츠 하나
  const suggestFresh = () => {
    const [t] = freshPicks(1);
    if (!t) return;
    deriveNext(t.key);
    setBurst({ id: Date.now(), keys: [t.key] });
  };
  const dropFromFeed = k => {
    const gone = k === TODAY ? FIRST_FEED : [k];
    gone.forEach(x => removedRef.current.add(x));
    const rest = feed.filter(x => !gone.includes(x));
    // 다 빼면: 블립이 새로 3개를 건넴 (뺀 것은 다시 안 나옴)
    if (!rest.length) {
      const three = freshPicks(3, gone);
      if (three.length) {
        setFeed(three.map(t => t.key));
        setSuggestOpen(false);
        select(0, three[0]);
        setBurst({ id: Date.now(), keys: three.map(t => t.key) });
        return;
      }
    }
    setFeed(rest);
    if (gone.includes(currentKey) && rest.length) {
      const i = Math.max(0, feed.indexOf(currentKey) - 1);
      const t = tileByKey(rest[Math.min(i, rest.length - 1)]);
      if (t) select(0, t);
    }
  };
  const slideGo = k => {
    if (k === TODAY) { setSuggestOpen(true); const t = tileByKey(FIRST_FEED.includes(currentKey) ? currentKey : FIRST_FEED[0]); if (t) select(0, t); return; }
    if (slide.extras.includes(k)) setSuggestOpen(false);
    const t = tileByKey(k);
    if (t) select(0, t);
  };
  // 새로 띄우는 것은 맨 끝이 아니라 지금 보던 것 바로 오른쪽에 (파생된 새 레이어). 이미 있던 것이면 그 자리로 옮김
  const deriveNext = key => {
    setSuggestOpen(false); // 새로 찾으면 처음 3개(오늘의 제안)는 다시 묶임
    setFeed(f => {
      const rest = f.filter(k => k !== key);
      const at = rest.indexOf(currentKey);
      return [...rest.slice(0, at + 1), key, ...rest.slice(at + 1)];
    });
    select(0, { key });
  };
  useEffect(() => {
    if (!A) return undefined;
    const open = e => {
      const { row } = e.detail;
      const id = 'd-' + row.name;
      if (!apps.some(a => a.id === id)) setApps(list => [...list, detailApp(id, row)]);
      deriveNext('app:' + id);
      setSwipe({ dir: 1, phase: 'in' });
      setTimeout(() => setSwipe(null), 380);
    };
    addEventListener('blip:open', open);
    return () => removeEventListener('blip:open', open);
  });
  // 콘텐츠 네모 밖에 놓은 조각 → 떠 있는 아이템 / 지도 설계 대화 → 왼쪽 / 대화가 끝나면 아이템이 지도로 / 아이템을 지도에 합치기
  useEffect(() => {
    if (!A) return undefined;
    const pieceOf = (layerId, id) => project.layers.find(l => l.id === layerId)?.pieces?.find(p => p.id === id);
    const unpin = e => {
      const { layerId, piece, x, y } = e.detail;
      const pc = pieceOf(layerId, piece), pane = document.querySelector('.pane.edit')?.getBoundingClientRect();
      if (!pc || !pane) return;
      const { id, ...rest } = pc; void id;
      edit.removePiece(layerId, piece);
      setFloats(fs => [...fs, { id: 'f' + Date.now(), piece: rest, x: x - pane.left, y: y - pane.top }]);
    };
    const design = e => {
      const { layerId, piece, name } = e.detail;
      const id = 'map-' + piece;
      if (!apps.some(a => a.id === id)) {
        setApps(list => [...list, { id, title: name + ' 상세 설계', by: 'Blip', mine: false, detail: true, layers: [makeLayer('mapchat', { app: id, name, layerId, piece })] }]);
      }
      deriveNext('app:' + id);
      setBurst({ id: Date.now(), keys: ['app:' + id] });
    };
    const done = e => {
      const { layerId, piece, cfg } = e.detail;
      updateLayer(layerId, l => ({ ...l, pieces: (l.pieces || []).map(p => (p.id === piece ? { ...p, kind: 'map', cfg, pins: p.pins || [], miss: p.miss || [], min: false, x: 195, y: 244, scale: 1 } : p)) }));
    };
    const merge = e => {
      const { layerId, map, item, name, x, y } = e.detail;
      // 지도에 던진 아이템 → 📍
      //   셀럽 인증 빵집(묶음): 위치를 아는 곳은 📍가 하나씩, 모르는 곳은 '못 찾았어요' (이미 꽂힌 곳은 그대로)
      //   그 밖: 블립이 모아 둔 곳이면 그 위치에, 아니면 놓은 자리에 내 메모 핀
      const now = Date.now();
      const g = document.querySelector(`.pane.edit .stage [data-piece="${map}"] .mm-geo`)?.getBoundingClientRect();
      const drop = g && x != null ? { fx: Math.min(1, Math.max(0, (x - g.left) / g.width)), fy: Math.min(1, Math.max(0, (y - g.top) / g.height)) } : { fx: .5, fy: .5 };
      updateLayer(layerId, l => ({ ...l, pieces: (l.pieces || []).filter(p => p.id !== item).map(p => {
        if (p.id !== map) return p;
        const has = new Set((p.pins || []).map(q => q.name));
        if (!isCeleb(name)) {
          const f = findPlace(name, p.cfg?.region);
          const one = f && !f.outside ? { ...f, id: 'pin' + now, at: now, m: 1, i: 0 } : { id: 'pin' + now, note: name, ...drop, at: now, m: 1, i: 0 };
          return { ...p, merge: { name, at: now }, pins: [...(p.pins || []), one] };
        }
        const add = CELEB_BAKERIES.filter(b => b.lat && !has.has(b.name)).map((b, i) => ({ id: 'pin' + now + i, name: b.name, who: b.who, where: b.where, city: '파리', lat: b.lat, lon: b.lon, at: now, m: 1, i }));
        const miss = CELEB_BAKERIES.filter(b => !b.lat && !(p.miss || []).some(q => q.name === b.name)).map(b => ({ name: b.name, who: b.who }));
        return { ...p, merge: { name, at: now }, pins: [...(p.pins || []), ...add], miss: [...(p.miss || []), ...miss] };
      }) }));
    };
    // 지도 위 📍: 직접 찍기(add) · 옮기기/이름(set) · 빼기(del)
    const pin = e => {
      const { layerId, map, op, pin: q } = e.detail;
      updateLayer(layerId, l => ({ ...l, pieces: (l.pieces || []).map(p => {
        if (p.id !== map) return p;
        const pins = p.pins || [];
        if (op === 'add') return { ...p, pins: [...pins, q] };
        if (op === 'del') return { ...p, pins: pins.filter(x => x.id !== q.id) };
        return { ...p, pins: pins.map(x => (x.id === q.id ? { ...x, ...q } : x)) };
      }) }));
    };
    addEventListener('blip:unpin', unpin); addEventListener('blip:mapdesign', design); addEventListener('blip:mapdone', done); addEventListener('blip:mapmerge', merge); addEventListener('blip:mappin', pin);
    return () => { removeEventListener('blip:unpin', unpin); removeEventListener('blip:mapdesign', design); removeEventListener('blip:mapdone', done); removeEventListener('blip:mapmerge', merge); removeEventListener('blip:mappin', pin); };
  });
  const askA = q => {
    // 지금 열린 콘텐츠가 그 말을 직접 받으면(예: 댓글 거르기) 검색하지 않고 거기서 처리
    const ask = new CustomEvent('blip:ask', { detail: { q }, cancelable: true });
    dispatchEvent(ask);
    if (ask.defaultPrevented) return;
    const words = stem(q);
    const hits = rankBy(tiles.filter(t => (t.type === 'app' && !apps.find(x => x.id === t.id)?.onTitle) || t.type === 'web'), words, true).slice(0, PER_TURN);
    // 맞는 게 모자라면 취향에 가까운 것으로 채움 (지금 설계는 프랑스 쪽만 — 나머지 검색은 이렇게 채워짐)
    const fill = rankBy(tiles.filter(t => t.type === 'app' && !hits.includes(t) && !feed.includes(t.key) && !apps.find(x => x.id === t.id)?.web), DAIN_TASTE, false); // 웹 원문은 그 검색에서만
    const three = [...hits, ...fill].slice(0, PER_TURN);
    // 검색어에 맞는 것이 먼저, 같으면 다인 취향 쪽
    const score = t => matchScore(t.text, words) * 10 + matchScore(t.text, DAIN_TASTE);
    const ordered = three.map((t, i) => ({ t, i })).sort((a, b) => score(b.t) - score(a.t) || a.i - b.i).map(x => x.t);
    hear({ type: 'search', q }, ordered, ctxOf(q, lastCtx));
    // 파생: 가장 맞는 하나가 지금 보던 것 바로 옆에 새 장처럼 붙음 (나머지 후보는 히스토리에만)
    deriveNext(ordered[0].key);
    setBurst({ id: Date.now(), keys: [ordered[0].key] });
  };
  const recallA = t => { setHistory(false); hear({ type: 'recall', of: t.id }, t.items.map(tileByKey).filter(Boolean), t.ctx); };
  const recallMany = list => {
    setHistory(false);
    setTurns(ts => [...ts, ...list.map(t => ({ ...t, act: { type: 'recall', of: t.id }, id: 't' + ++tid, when: nowStr() }))]);
  };
  // 제목을 선언하거나 글을 불러오면 블립이 답함 (데모: 첫 칸에 오던 것들)
  const prevRef = useRef({ title: project.title, posts: posts.length });
  useEffect(() => {
    if (!A) return;
    const prev = prevRef.current;
    prevRef.current = { title: project.title, posts: posts.length };
    const root = (columns[0]?.items || []).filter(t => t.key !== path[0]);
    if (posts.length > prev.posts) hear({ type: 'import' }, tiles.filter(t => t.type === 'bundle' || t.type === 'post'), project.title.trim() || '불러온 글');
    else if (project.title !== prev.title && project.title.trim() && !project.forkOf) {
      hear({ type: 'title', q: project.title }, root, project.title.trim());
      // 오른쪽에서 무엇을 만들지 선언하면 → 왼쪽에 그걸 만들 재료가 디깅할 수 있게 뜸 (보던 것 바로 옆)
      const m = A && apps.find(x => x.onTitle?.some(w => project.title.includes(w)));
      if (m) { deriveNext('app:' + m.id); setBurst({ id: Date.now(), keys: ['app:' + m.id] }); }
    }
  }, [project.title, posts.length]); // eslint-disable-line react-hooks/exhaustive-deps -- 제목·글 수가 바뀔 때만
  const workStyle = A ? { gridTemplateColumns: handMode && hand && paneFocus ? (paneFocus === 'dig' ? '6fr 4fr' : '4fr 6fr') : `${ratio}fr ${1 - ratio}fr` } : undefined;
  const enterPane = f => () => { if (A && handMode && hand && paneFocus !== f) setPaneFocus(f); }; // 움직일 때마다 확인 (버튼을 누른 그 자리에서도 바로)

  return (
    <div className="shell">
      {A && !strip && handMode && (
        /* 위 띠를 숨겨도 /hand의 ✋는 남김: 오른쪽 위 구석에 */
        <button className={'hand-float' + (hand ? ' on' : '')} onClick={() => { setHand(h => !h); setPaneFocus(null); }} aria-pressed={hand}
          title={hand ? '손 따라가기 켜짐: 손이 있는 쪽 화면이 넓어져요' : '고정: 눌러서 손 따라가기'} aria-label="손 따라가기">✋</button>
      )}
      {A
        ? strip && <FlowStrip turns={turns} predicted={predicted} listening={!!heard} tileByKey={tileByKey} curKey={currentKey} onPick={pickA}
          onHistory={() => setHistory(true)} onImport={() => setImporting(true)} calm={history} showHand={handMode} hand={hand} onHand={() => { setHand(h => !h); setPaneFocus(null); }} />
        : <StoryStrip columns={columns} start={start} seen={seen} query={query}
          onSelect={select} onBack={() => setPath(p => p.slice(0, -1))} onClearQuery={() => search('')}
          post={postFns} batch={batch} perCol={PER_COL} onImport={() => setImporting(true)} />}
      {A && history && <BlipHistory turns={turns} tileByKey={tileByKey} onRecall={recallA} onRecallMany={recallMany} onClose={() => setHistory(false)} />}
      <main className={'work' + (A ? ' a-work' : '') + (resizing ? ' resizing' : '')} style={workStyle} ref={workRef}>
        {A && !(handMode && hand) && (
          /* 가운데 선: 잡고 옆으로 끌면 왼쪽·오른쪽 비율이 그만큼 바뀜. 두 번 누르면 반반 */
          <div className="divider" style={{ left: `calc(${ratio * 100}% - 6px)` }} role="separator" aria-orientation="vertical" aria-label="화면 나누는 선"
            onPointerDown={e => {
              if (e.button !== 0) return;
              e.preventDefault(); e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              setResizing(true);
            }}
            onPointerMove={e => {
              if (!resizing) return;
              const r = workRef.current.getBoundingClientRect();
              setRatio(clamp((e.clientX - r.left) / r.width, .25, .75));
            }}
            onPointerUp={() => setResizing(false)} onPointerCancel={() => setResizing(false)}
            onDoubleClick={() => setRatio(.5)} />
        )}
        <section className={'pane dig' + (gpt ? ' with-gpt' : '')} aria-label="Read" onPointerMove={enterPane('dig')}>
          {gpt && <GptPanel key={gpt.id} seed={gpt.seed} from={gpt.from} answer={gptAnswer} onOpen={openTile} onClose={() => setGpt(null)} />}
          {source && (
            <div className="pane-acts">
              {currentTile.type !== 'post' && currentTile.type !== 'bundle' && <button className="act-btn primary" onClick={() => fork(source)}>Remix</button>}
            </div>
          )}
          <div className={'stage' + (split ? ' split' : '') + (viewOver ? ' view-over' : '')}>
            {burst && (
              /* 새 창 3개가 동시에 열림 → 첫째는 카드뉴스로 커지고, 나머지는 아래 슬라이더로 내려감 */
              <div className="burst" key={burst.id} onAnimationEnd={e => { if (e.target === e.currentTarget) setBurst(null); }}>
                {burst.keys.map((k, i) => {
                  const t = tileByKey(k);
                  return t && <span key={k} className={'bw bw' + i + (burst.keys.length === 1 ? ' solo' : '')}><span className="bw-in"><Slide layer={t.cover} /></span></span>;
                })}
              </div>
            )}
            {/* 뒤로 · 다음: 카드 왼쪽 아래에 작게. 콘텐츠를 꾹 눌렀다 오른쪽으로 밀어도 뒤로 (왼쪽 = 다음) */}
            <Viewer resizable move={swipe && (swipe.phase + (swipe.dir > 0 ? '-up' : '-down'))}
              overlay={source && (
                <div className="nav-btns">
                <button onClick={() => goNav(-1)} disabled={!canBack} aria-label="뒤로" title="뒤로 · 꾹 눌러 오른쪽으로 밀기">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <button onClick={() => goNav(1)} disabled={!canFwd} aria-label="다음" title="다음 · 꾹 눌러 왼쪽으로 밀기">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              )}>
              {source
                ? (
                  <TearSurface source={{ id: currentKey, title: source.title }}>
                    <Carousel key={source.id} layers={source.layers} index={pIndex} onIndex={setPIndex} editable={false} wheel tear={peel} me={meFns}
                      onSwipe={peel ? undefined : stepContent} pageKey={peel ? currentKey : undefined} onNav={goNav} />
                  </TearSurface>
                )
                : (
                  <div className="view-empty" />
                )}
            </Viewer>
            {split && (
              /* 잡아서 콘텐츠 밖으로 끌어 놓은 것: 아래 절반에 따로 열림 (새 창처럼). × = 닫고 다시 한 화면 */
              <div className="split-b" key={split.id}>
                <Viewer resizable overlay={<button className="split-x" onClick={() => setSplit(null)} aria-label="아래 화면 닫기" title="닫기">×</button>}>
                  <TearSurface source={{ id: 'app:' + split.app, title: tileByKey('app:' + split.app)?.title || '' }}>
                    <Carousel key={split.id} layers={[split.layer]} index={0} onIndex={() => {}} editable={false} tear={peel} />
                  </TearSurface>
                </Viewer>
              </div>
            )}
          </div>
          {A
            ? (
              /* 아래 슬라이더 = 이번 결과 3개 (콘텐츠 단위). 눌러서 위 카드뉴스로, 끌어서 던져 두기 */
              <LayerSlider layers={slide.items.map(k => (k === TODAY ? todayCover : tileByKey(k)?.cover)).filter(Boolean)} index={Math.max(0, slide.index)} active fresh={[]}
                dragKeys={slide.items.map(k => (k === TODAY ? FIRST_FEED[0] : k))} cls={slide.items.map(k => (k === TODAY ? 'stack' : ''))}
                mini={slide.mini} onGo={i => slideGo(slide.items[i])} onRemove={(id, i) => dropFromFeed(slide.items[i])}
                onAdd={suggestFresh} addTitle="새 콘텐츠 제안받기"
                onMove={(from, to) => { // 0.2초 눌러 잡고 옮기기 = 순서 바꾸기 (묶음은 셋이 함께 옮겨짐)
                  const order = slide.items.slice();
                  const [k] = order.splice(from, 1);
                  order.splice(to, 0, k);
                  setFeed(order.flatMap(x => (x === TODAY ? slide.firsts : [x])));
                }} />
            )
            : (
              <LayerSlider layers={source ? source.layers : []} index={pIndex} active fresh={[]} dragKey={currentTile?.type === 'post' ? null : currentKey}
                onGo={setPIndex} />
            )}
        </section>
        <section className={'pane edit' + (locked ? ' locked' : '')} aria-label="Create" onPointerMove={enterPane('edit')}
          onPointerDownCapture={guard} onClickCapture={guard}
          onDragOver={dragOver} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropOver(false); }} onDrop={dropPiece}>
          {floats.length > 0 && (
            /* 떠 있는 아이템: 잡아서 옮기기 · 콘텐츠 화면 위에 놓으면 그 장의 조각이 됨 · ▾/▸ 접기 */
            <div className="floats" onPointerDown={floatDown}>
              {floats.map(f => <Piece key={f.id} p={{ ...f.piece, id: f.id, x: f.x, y: f.y, scale: f.piece.scale || 1 }} />)}
            </div>
          )}
          {saved > 0 && <div className="saved-toast" key={saved} role="status">저장됨</div>}
          <div className="pane-acts">
            {/* Publish를 누르면 아래로 두 갈래: Commit = 지금 판을 그대로 저장(나만) · Publish = 확정하고 건넬 링크 복사 */}
            <div className="pub">
              <button className={'act-btn primary' + (pubOpen ? ' open' : '')} aria-haspopup="menu" aria-expanded={pubOpen}
                onClick={() => setPubOpen(o => !o)}>
                {copied ? 'Published' : 'Publish'}
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4.5l3 3 3-3" /></svg>
              </button>
              {pubOpen && (
                <div className="pub-menu" role="menu">
                  <button role="menuitem" onClick={() => { setPubOpen(false); commit(); }}><b>Commit</b><span>지금 판을 저장</span></button>
                  <button role="menuitem" onClick={() => { setPubOpen(false); share(); }}><b>Publish</b><span>확정하고 링크 복사</span></button>
                  <i className="pub-sep" role="separator" />
                  <button role="menuitem" onClick={() => { setPubOpen(false); createNew(); }}><b>Create New</b><span>새 판 열기</span></button>
                </div>
              )}
            </div>
          </div>
          <div className={'stage' + (dropOver ? ' drop-over' : '')} ref={stageRef} onAnimationEnd={e => e.currentTarget.classList.remove('shake')}>
            {/* 무엇을 만들지 선언하기 전(제목 없음)엔 콘텐츠 영역이 아예 없음. 아래 + 하나로 시작.
                단, 왼쪽에서 뜯어 온 것을 놓으면 그 자리에서 판이 생김 */}
            {showBoard && (
              /* 새 장은 그냥 빈 화면 (가운데 + 없음) */
              <Viewer resizable>
                <Carousel key={project.id} layers={project.layers} index={index} onIndex={setIndex} editable wheel
                  edit={edit} sel={sel} wiggle={pieceWiggle} onPick={pick} onPublish={publish} onMore={suggestMore} />
              </Viewer>
            )}
          </div>
          {/* 선언 전: 슬라이더엔 + 하나만 → "어떤 콘텐츠를 만드실건가요?" */}
          <LayerSlider layers={showBoard ? project.layers : []} index={index} active fresh={fresh} canDrop
            addTitle={showBoard ? '빈 장 추가' : '콘텐츠 만들기'}
            onGo={setIndex} onAdd={showBoard ? addNext : () => setImporting(true)} onDropTile={dropTile} onMove={moveLayer} onRemove={removeLayer} />
        </section>
      </main>
      <TextThrow source={source && currentKey ? { id: currentKey, title: source.title } : null} />
      <Stash resolve={data => {
        const [key, n] = data.split('#');
        const t = tileByKey(key);
        return t && { tile: t, page: n === undefined ? undefined : sourceOf(t).layers[+n] };
      }} onOpen={a => {
        const t = tileByKey(a.tileKey || a.fromKey || '');
        if (t) openTile(t);
        else if (a.url) open(a.url, '_blank', 'noopener');
      }} />
      <BlankDeclare onSearch={A ? askA : search} demoAllowed={!locked && !query && !importing} context={locked ? 'default' : 'edit'}
        kit={{ target: kitTarget, onTool, tool, setTool, onImage: addMedia }} />
      {importing && <ImportModal onImport={importUrls} onDescribe={t => { setTitle(t); if (!A) setPath([]); setQuery(''); }} onAlgo={A ? askA : search}
        onGpt={(seed, from) => { setImporting(false); setGpt({ id: Date.now(), seed, from }); }} onClose={() => setImporting(false)} />}
    </div>
  );
}
