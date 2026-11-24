import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/base.css';
import App from './App.jsx';

// / = 실시간 대화 띠 화면 (두 화면 반반 고정). /hand = 같은 화면 + ✋ 손 따라가기 버튼
const path = location.pathname.replace(/\/$/, '');
const handMode = path === '/hand';
// /flipbook = 같은 화면, 왼쪽 레이어 슬라이더만 더 '책'처럼 (펼친 책장 · 책등 · 넘김)
const flipbook = path === '/flipbook';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App variant="A" handMode={handMode} flipbook={flipbook} />
  </StrictMode>
);
