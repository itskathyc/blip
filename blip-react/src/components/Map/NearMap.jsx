import './Map.css';

// 내 주변 지도: 실제 지도 바탕(OpenStreetMap 타일) 위에 나 · 남은 빵집 📍
// 핀 자리는 주소로 찾은 좌표 그대로 (대략인 곳은 '대략'이라고 붙임)
const T = 256;
const px = (lat, lon, z) => {
  const n = T * 2 ** z, r = (lat * Math.PI) / 180;
  return [((lon + 180) / 360) * n, ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n];
};
// 점들이 다 들어가게 줌 · 타일 · 자리 계산 (지도 바탕을 쓰는 곳이 같이 씀)
export function project(all, w, h, padX = 90, padY = 70, maxZ = 17) {
  let z = maxZ, box;
  for (; z > 10; z--) {
    const p = all.map(a => px(a.lat, a.lon, z));
    const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    box = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    if (box.x1 - box.x0 < w - padX && box.y1 - box.y0 < h - padY) break;
  }
  const ox = (box.x0 + box.x1) / 2 - w / 2, oy = (box.y0 + box.y1) / 2 - h / 2;
  const tiles = [];
  for (let tx = Math.floor(ox / T); tx <= Math.floor((ox + w) / T); tx++) {
    for (let ty = Math.floor(oy / T); ty <= Math.floor((oy + h) / T); ty++) tiles.push({ key: tx + ':' + ty, src: `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`, left: tx * T - ox, top: ty * T - oy });
  }
  const at = a => { const [x, y] = px(a.lat, a.lon, z); return { left: x - ox, top: y - oy }; };
  return { tiles, at };
}
export default function NearMap({ here, pins, w = 330, h = 250 }) {
  const { tiles: tl, at } = project([here, ...pins], w, h);
  return (
    <div className="nm" style={{ width: w, height: h }}>
      {tl.map(t => <img key={t.key} className="nm-tile" alt="" draggable={false} src={t.src} style={{ left: t.left, top: t.top }} />)}
      <span className="nm-me" style={at(here)}><i /><em>{here.name}{here.approx ? ' (대략)' : ''}</em></span>
      {pins.map((p, i) => (
        <span key={p.name} className="nm-pin" style={{ ...at(p), '--i': i }}>
          <i aria-hidden="true">📍</i><em>{p.name}<small>{p.sub}{p.approx ? ' · 대략' : ''}</small></em>
        </span>
      ))}
      <a className="nm-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
    </div>
  );
}
