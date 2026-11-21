import { useMemo, useRef, useState } from 'react';
import StoryStrip from './components/StoryStrip/StoryStrip';
import Viewer from './components/Viewer/Viewer';
import Carousel from './components/Carousel/Carousel';
import LayerSlider from './components/LayerSlider/LayerSlider';
import BlankDeclare from './components/BlankDeclare/BlankDeclare';
import { BREADS } from './data/breads';
import { seedApps, makeNewBoard, makeLayer, NEXT_KIND, matchScore } from './data/apps';
import { WEB, MENU_COLOR } from './data/web';
import './App.css';

const webBoard = w => ({ id: 'web:' + w.t, title: w.t, mine: false, color: MENU_COLOR[w.m], layers: [{ id: 'web:' + w.t, kind: 'web', w }] });

// 지금 편집 중인 장면이 어떤 주제 쪽인지 (첫 칸의 순서를 정하는 단서)
const LAYER_HINT = { location: '연남 동네', nearby: '연남 동네', best: '연남 마늘바게트', result: '소금빵 크루아상 베이글', bakery: '소금빵 크루아상 베이글' };

// 미리보기 칸 하나의 순서: 가까운 것 먼저, 같으면 원래 순서
const rankBy = (list, text, onlyHits) => list
  .map((t, i) => ({ t, i, s: text ? matchScore(t.text, text) : 0 }))
  .filter(x => !onlyHits || x.s > 0)
  .sort((a, b) => b.s - a.s || a.i - b.i)
  .map(x => x.t);

export default function App() {
  const [apps, setApps] = useState(seedApps);
  const [projectId, setProjectId] = useState(() => apps[0].id); // 오른쪽(편집)의 내 판. 처음엔 제목 없는 새 판
  const [index, setIndex] = useState(0);
  const [path, setPath] = useState([]); // 위 칸들에서 차례로 고른 것들. 마지막 것이 왼쪽(디깅)에 뜸
  const [pIndex, setPIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [seen, setSeen] = useState(() => new Set());
  const [fresh, setFresh] = useState([]);
  const stageRef = useRef(null);
  const titleRef = useRef(null);

  const project = apps.find(a => a.id === projectId);
  const locked = !project.title.trim();

  const tiles = useMemo(() => [
    ...apps.filter(a => a.title.trim()).map(a => ({
      key: 'app:' + a.id, type: 'app', id: a.id, title: a.title, cover: a.layers[0], text: [a.title, a.by || '', a.tags || ''].join(' ')
    })),
    ...WEB.map(w => ({ key: 'web:' + w.t, type: 'web', w, title: w.t, cover: { id: 'web:' + w.t, kind: 'web', w }, text: [w.t, w.a, w.m, w.d].join(' ') }))
  ], [apps]);
  const tileByKey = key => tiles.find(t => t.key === key);
  const sourceOf = tile => (tile.type === 'web' ? webBoard(tile.w) : apps.find(a => a.id === tile.id));

  // 첫 칸의 기준은 오른쪽에서 편집 중인 장면(고른 빵 등). 왼쪽에서 둘러보는 동안엔 흔들리지 않음
  const focus = useMemo(() => {
    const L = project.layers[index];
    if (L?.kind === 'pick') {
      const names = (L.picked || [0, 2, 5]).map(i => BREADS[i]);
      if (names.length) return { label: names.join(' · '), text: names.join(' ') };
    }
    if (L && LAYER_HINT[L.kind]) return { label: LAYER_HINT[L.kind].split(' ')[0], text: LAYER_HINT[L.kind] };
    if (L?.kind === 'card') return { label: L.head, text: L.head + ' ' + L.lines.join(' ') };
    if (L?.kind === 'web') return { label: L.w.m, text: L.w.m + ' ' + L.w.a };
    return null;
  }, [project, index]);

  // 칸들: 첫 칸 + 고른 것마다 그 오른쪽에 "가까운 것들" 한 칸씩
  const columns = useMemo(() => {
    const cols = [{ from: 'root:' + query, items: rankBy(tiles, query || focus?.text, !!query), sel: path[0] }];
    path.forEach((key, k) => {
      const picked = tiles.find(t => t.key === key);
      if (!picked) return;
      const rest = tiles.filter(t => !path.slice(0, k + 1).includes(t.key));
      const near = rankBy(rest, picked.text, true);
      cols.push({ from: key, items: near.length ? near : rest, sel: path[k + 1] });
    });
    return cols;
  }, [tiles, path, query, focus]);
  const start = Math.max(0, columns.length - 3);

  const currentKey = path[path.length - 1];
  const currentTile = currentKey && tileByKey(currentKey);
  const source = currentTile && sourceOf(currentTile);

  const select = (col, tile) => {
    setPath(p => [...p.slice(0, col), tile.key]);
    setPIndex(0);
    setSeen(s => new Set(s).add(tile.key));
  };

  // 잠김: 제목이 없으면 오른쪽 콘텐츠 화면이 떨리고 제목 칸으로 커서가 감
  const nudge = () => {
    const el = stageRef.current;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    titleRef.current.focus();
  };
  const guard = e => {
    if (!locked || e.target.closest('.title-row')) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'pointerdown') nudge();
  };

  const newBoard = () => {
    if (locked) { nudge(); return; } // 이미 빈 새 판이면 그걸 쓰게
    const b = makeNewBoard();
    setApps(list => [b, ...list]);
    setProjectId(b.id); setIndex(0);
    setTimeout(() => titleRef.current?.focus());
  };

  const updateLayers = fn => setApps(list => list.map(a => (a.id === projectId ? { ...a, layers: fn(a.layers) } : a)));
  const setTitle = title => setApps(list => list.map(a => (a.id === projectId ? { ...a, title } : a)));

  // 리믹스: 왼쪽에서 보던 장면을 오른쪽 타임라인 끝에 복사 (원본은 그대로). 빈 장면 하나뿐이면 그 자리를 대신함
  const remix = (src, layers) => {
    if (locked) { nudge(); return; }
    const copies = layers.map(l => makeLayer(l.kind, { ...l, draft: false, from: src.title }));
    const onlyBlank = project.layers.length === 1 && project.layers[0].kind === 'blank';
    updateLayers(ls => (onlyBlank ? copies : [...ls, ...copies]));
    setFresh(copies.map(c => c.id));
    setIndex(onlyBlank ? 0 : project.layers.length);
  };

  // 끌어 온 것: 'key' = 그 콘텐츠 전체(위 칸의 미리보기), 'key#i' = 그 장면 하나(왼쪽 슬라이더의 카드)
  const dropTile = data => {
    const [key, n] = data.split('#');
    const t = tileByKey(key);
    if (!t) return;
    const src = sourceOf(t);
    remix(src, n === undefined ? src.layers : [src.layers[+n]]);
  };

  const pick = (layerId, i) => updateLayers(ls => ls.map(l => {
    if (l.id !== layerId) return l;
    const picked = l.picked || [0, 2, 5];
    return { ...l, picked: picked.includes(i) ? picked.filter(x => x !== i) : [...picked, i] };
  }));
  const publish = layerId => updateLayers(ls => ls.map(l => (l.id === layerId ? { ...l, draft: false } : l)));

  // + : 직전 장면의 맥락을 보고 다음 화면을 반투명으로 제안
  const addNext = () => {
    const last = project.layers[project.layers.length - 1];
    const layer = makeLayer(NEXT_KIND[last?.kind] || 'blank', { draft: true });
    updateLayers(ls => [...ls, layer]);
    setFresh([layer.id]);
    setIndex(project.layers.length);
  };

  const search = q => { setQuery(q); setPath([]); };

  return (
    <div className="shell">
      <StoryStrip columns={columns} start={start} seen={seen} focus={focus} query={query}
        onSelect={select} onBack={() => setPath(p => p.slice(0, -1))} onClearQuery={() => search('')} />
      <main className="work">
        <section className="pane dig" aria-label="디깅">
          <div className="stage">
            <Viewer>
              {source
                ? <Carousel key={source.id} layers={source.layers} index={pIndex} onIndex={setPIndex} editable={false} />
                : <div className="view-empty" />}
            </Viewer>
          </div>
          <LayerSlider layers={source ? source.layers : []} index={pIndex} active fresh={[]} dragKey={currentKey}
            onGo={setPIndex} />
        </section>
        <section className={'pane edit' + (locked ? ' locked' : '')} aria-label="편집"
          onPointerDownCapture={guard} onClickCapture={guard}>
          <div className="title-row">
            <input ref={titleRef} className="title-in" value={project.title} onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력하세요" aria-label="제목" spellCheck={false} />
            <button className="new-board" onClick={newBoard} aria-label="새 판" title="새 판">+</button>
          </div>
          <div className="stage" ref={stageRef} onAnimationEnd={e => e.currentTarget.classList.remove('shake')}>
            <Viewer>
              <Carousel key={project.id} layers={project.layers} index={index} onIndex={setIndex} editable onPick={pick} onPublish={publish} />
            </Viewer>
          </div>
          <LayerSlider layers={project.layers} index={index} active fresh={fresh} canDrop
            onGo={setIndex} onAdd={addNext} onDropTile={dropTile} />
        </section>
      </main>
      <BlankDeclare onSearch={search} demoAllowed={!locked && !query} />
    </div>
  );
}
