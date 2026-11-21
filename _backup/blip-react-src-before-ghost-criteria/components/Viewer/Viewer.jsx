import { useEffect, useRef, useState } from 'react';
import './Viewer.css';

const W = 390, H = 488;

// 캐러셀 한 장(4:5)을 남은 공간에 맞게 그대로 축소. 안의 내용은 늘 390×488 기준으로 그려짐
export default function Viewer({ children }) {
  const boxRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const box = boxRef.current;
    const fit = () => setScale(Math.min(1.3, box.clientWidth / W, box.clientHeight / H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="viewer-box" ref={boxRef}>
      <div className="viewer" style={{ width: W * scale, height: H * scale }}>
        <div className="viewer-inner" style={{ transform: `scale(${scale})` }}>{children}</div>
      </div>
    </div>
  );
}
