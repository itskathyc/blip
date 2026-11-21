import './AppIcon.css';

const ART = {
  bread: (
    <svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#f6e2bb" /><path d="M20 46c0-14.5 13.5-26 30-26s30 11.5 30 26v21c0 5-4 9-9 9H29c-5 0-9-4-9-9V46z" fill="#d9a05b" /><path d="M34 33c3.5-3 7.5-4.6 11-4.6M50 28c4.3 0 8.4 1.2 11.5 3.3" fill="none" stroke="#eec28a" strokeWidth="3.2" strokeLinecap="round" /><path d="M33 51l5 23M50 49v25M67 51l-5 23" stroke="#b97d3e" strokeWidth="2.6" strokeLinecap="round" /></svg>
  ),
  map: (
    <svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#e3f1ea" /><path d="M14 72 Q34 56 50 68 Q68 82 90 64" fill="none" stroke="#bfe3d1" strokeWidth="5" strokeLinecap="round" /><path d="M50 20c12.2 0 22 9.8 22 22 0 16.5-22 39-22 39S28 58.5 28 42c0-12.2 9.8-22 22-22z" fill="#2f9e6e" /><circle cx="50" cy="42" r="9" fill="#fff" /></svg>
  ),
  plus: (
    <svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f2ee" /><path d="M50 32v36M32 50h36" stroke="#8a877f" strokeWidth="5" strokeLinecap="round" /></svg>
  )
};

// iOS 앱 아이콘처럼: 둥근 사각형 하나. 그림이 있으면 그림, 없으면 색 + 첫 글자
export default function AppIcon({ art, color = '#eceae4', label = '', size = 60 }) {
  return (
    <span className="app-icon" style={{ width: size, height: size, background: color, fontSize: size * .42 }}>
      {ART[art] || <span className="app-icon-letter">{label.trim()[0] || '?'}</span>}
    </span>
  );
}
