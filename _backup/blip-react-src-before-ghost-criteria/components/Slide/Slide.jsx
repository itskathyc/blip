import { Bread } from '../Art/Bread';
import { WEB, MENU_COLOR, YEONNAM } from '../../data/web';
import { BREADS, breadFor } from '../../data/breads';
import './Slide.css';

const PINS = [[96, 150], [258, 118], [300, 262], [140, 300], [226, 382]];

function MapBg({ children }) {
  return (
    <svg className="map" viewBox="0 0 390 488" aria-hidden="true">
      <rect width="390" height="488" fill="#e7f0e9" />
      <path d="M-10 120C80 140 160 90 260 130S420 150 420 150" stroke="#fff" strokeWidth="18" fill="none" />
      <path d="M120 -10C140 120 100 240 160 330S170 520 170 520" stroke="#fff" strokeWidth="14" fill="none" />
      <path d="M-10 360C90 330 220 380 420 320" stroke="#fff" strokeWidth="12" fill="none" />
      <path d="M300 -10C290 120 330 260 300 520" stroke="#fff" strokeWidth="10" fill="none" />
      <ellipse cx="300" cy="190" rx="54" ry="36" fill="#cfe5d5" />
      {children}
    </svg>
  );
}

function Pin({ x, y, big }) {
  const s = big ? 1.5 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -26c9 0 16 7 16 16C16 2 0 18 0 18S-16 2-16-10c0-9 7-16 16-16z" fill="#e2483d" />
      <circle cy="-10" r="5.5" fill="#fff" />
    </g>
  );
}

export default function Slide({ layer, interactive = false, onPick }) {
  switch (layer.kind) {
    case 'profile':
      return (
        <div className="sl" style={{ background: '#f6e9d7' }}>
          <p className="kick">빵 궁합 테스트</p>
          <h2 className="big">당신은<br />누구신가요?</h2>
          <div className="tags">{['생년월일', '성별', '식습관', '알레르기'].map(t => <span key={t}>{t}</span>)}</div>
          <span className="art br"><Bread kind="salt" size={210} /></span>
        </div>
      );
    case 'pick': {
      const picked = layer.picked || [0, 2, 5];
      return (
        <div className="sl" style={{ background: '#fff' }}>
          <h2 className="mid">좋아하는 빵을<br />골라주세요</h2>
          <div className="pickgrid">
            {BREADS.map((name, i) => {
              const cls = 'pickitem' + (picked.includes(i) ? ' sel' : '');
              const inner = <><Bread kind={breadFor(name)} size={62} /><b>{name}</b></>;
              return interactive
                ? <button key={name} className={cls} onClick={() => onPick(i)}>{inner}</button>
                : <span key={name} className={cls}>{inner}</span>;
            })}
          </div>
        </div>
      );
    }
    case 'result':
      return (
        <div className="sl dark">
          <p className="kick">나와 빵의 궁합</p>
          <div className="huge">92<span>점</span></div>
          <div className="trio">
            {[['소금빵', '96%'], ['크루아상', '91%'], ['베이글', '88%']].map(([n, p]) => (
              <div key={n}><Bread kind={breadFor(n)} size={72} /><b>{n}</b><span>{p}</span></div>
            ))}
          </div>
        </div>
      );
    case 'location':
      return (
        <div className="sl flush">
          <MapBg><circle cx="195" cy="250" r="110" fill="rgba(47,124,246,.12)" stroke="#2f7cf6" strokeWidth="2" strokeDasharray="6 6" /><Pin x={195} y={250} big /></MapBg>
          <div className="mapchip">연남동 · 반경 1km</div>
        </div>
      );
    case 'nearby':
      return (
        <div className="sl flush">
          <MapBg>{YEONNAM.slice(0, 5).map((w, i) => <Pin key={w.t} x={PINS[i][0]} y={PINS[i][1]} />)}</MapBg>
          {YEONNAM.slice(0, 5).map((w, i) => <span key={w.t} className="pinlabel" style={{ left: PINS[i][0], top: PINS[i][1] + 22 }}>{w.t}</span>)}
          <div className="mapchip">연남동 빵집 {YEONNAM.length}곳</div>
        </div>
      );
    case 'best': {
      const w = YEONNAM[0];
      return (
        <div className="sl" style={{ background: MENU_COLOR[w.m] }}>
          <p className="kick">이 동네 BEST</p>
          <h2 className="big">{w.t}</h2>
          <span className="pill">{w.m}</span>
          <span className="art br"><Bread kind={breadFor(w.m)} size={230} /></span>
        </div>
      );
    }
    case 'bakery':
      return (
        <div className="sl" style={{ background: '#fff' }}>
          <h2 className="mid">궁합 빵<br />맛집 TOP 3</h2>
          <ol className="toplist">
            {['소금빵', '크루아상', '베이글'].map((m, i) => {
              const w = WEB.find(x => x.m === m);
              return <li key={m}><span className="no">{i + 1}</span><Bread kind={breadFor(m)} size={52} /><span><b>{w.t}</b><em>{m} · {w.a}</em></span></li>;
            })}
          </ol>
        </div>
      );
    case 'card':
      return (
        <div className="sl" style={{ background: layer.color || '#f3f2ee' }}>
          <p className="kick">{layer.sub}</p>
          <h2 className="big">{layer.head}</h2>
          <div className="stickers">{layer.lines.map(l => <span key={l}>{l}</span>)}</div>
          <span className="art br small"><Bread kind={layer.bread || 'loaf'} size={150} /></span>
        </div>
      );
    case 'web': {
      const w = layer.w;
      return (
        <div className="sl center" style={{ background: MENU_COLOR[w.m] || '#f3f2ee' }}>
          <Bread kind={breadFor(w.m)} size={210} />
          <h2 className="mid">{w.t}</h2>
          <span className="pill">{w.a} · {w.m}</span>
        </div>
      );
    }
    default:
      return <div className="sl" style={{ background: '#faf9f6' }} />;
  }
}
