import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/base.css';
import App from './App.jsx';

// / = 실시간 대화 띠 화면 (두 화면 반반 고정). /hand = 같은 화면 + ✋ 손 따라가기 버튼
const handMode = location.pathname.replace(/\/$/, '') === '/hand';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App variant="A" handMode={handMode} />
  </StrictMode>
);
