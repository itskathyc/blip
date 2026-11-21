import { useEffect, useRef, useState } from 'react';
import { SAMPLE_URLS } from '../../data/blog';
import { GptMark } from '../Gpt/GptPanel';
import './ImportModal.css';

const URL_RE = /https?:\/\//;
const TEXT_FILE = /\.(txt|md|html?|csv|json)$/i;


// 오른쪽 + : 무엇을 만들지 묻는 한 칸.
//   주소를 넣으면 그 글을 재료로 불러오고(지금 데모는 네이버 블로그 글만), 그냥 말로 적으면 그게 이 콘텐츠의 제목이 됨
//   아래 태그: 붙여넣기 · 탐색기 열기(텍스트 파일) · GPT(왼쪽에 붙는 대화창)
// 질문 옆 ⇄ 버튼: 같은 한 칸을 '신규 콘텐츠 생성' ↔ '알고리즘 설정기'로 바꿔 씀.
//   알고리즘 설정기에서 적은 말은 위 띠가 무엇을 먼저 보여줄지의 기준이 됨
export default function ImportModal({ onImport, onDescribe, onAlgo, onGpt, onClose }) {
  const [algo, setAlgo] = useState(false);
  const [v, setV] = useState('');
  const [miss, setMiss] = useState('');
  const fileRef = useRef(null);
  const areaRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const key = e => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [onClose]);

  const put = text => { setV(text); setMiss(''); areaRef.current?.focus(); };

  const go = () => {
    const t = v.trim();
    if (!t) return;
    if (algo) { onAlgo(t); onClose(); return; }
    if (!URL_RE.test(t)) { onDescribe(t); onClose(); return; }
    if (onImport(t)) onClose();
    else setMiss('이 데모에서는 아직 네이버 블로그 글만 불러올 수 있어요');
  };

  const paste = async () => {
    try { put(await navigator.clipboard.readText()); }
    catch { areaRef.current?.focus(); setMiss('클립보드를 못 읽었어요 · ⌘V로 붙여넣어 주세요'); }
  };

  const pickFiles = async e => {
    const files = [...e.target.files];
    e.target.value = '';
    const texts = await Promise.all(files.filter(f => TEXT_FILE.test(f.name)).map(f => f.text()));
    if (texts.length) put([v, ...texts].filter(Boolean).join('\n'));
    else if (files.length) setMiss('이 데모에서는 아직 텍스트 파일만 읽을 수 있어요');
  };

  // GPT: 새 페이지로 가지 않고, 이 창이 길어지며 왼쪽 콘텐츠 옆 대화창이 됨 (적어 둔 말이 첫 질문)
  const gpt = () => onGpt(v.trim(), modalRef.current.getBoundingClientRect());

  return (
    <div className="imp-back" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="imp-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="어떤 콘텐츠를 만드실건가요?">
        <div className="imp-head">
          <h2>{algo ? '무엇을 먼저 보여드릴까요?' : '어떤 콘텐츠를 만드실건가요?'}</h2>
          <button className="imp-switch" onClick={() => { setAlgo(a => !a); setMiss(''); areaRef.current?.focus(); }}>
            <span aria-hidden="true">⇄</span> {algo ? '신규 콘텐츠 생성' : '알고리즘 설정기'}
          </button>
          <button className="imp-x" onClick={onClose} aria-label="닫기" title="닫기">×</button>
        </div>
        <textarea ref={areaRef} autoFocus value={v} rows={5} spellCheck={false}
          onChange={e => { setV(e.target.value); setMiss(''); }}
          placeholder={algo ? '보고 싶은 것을 적어주세요\n예) 연남동 · 짭짤한 빵 · 크루아상' : '말로 적거나, 재료가 될 주소를 붙여넣으세요\n예) 연남동 소금빵 지도 · 블로그 글 주소 여러 개'}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); go(); } }} />
        {!algo && <div className="imp-tags">
          <button className="imp-tag" onClick={paste}>붙여넣기</button>
          <button className="imp-tag" onClick={() => fileRef.current.click()}>탐색기 열기</button>
          <button className="imp-tag gpt" onClick={gpt} aria-label="ChatGPT와 대화" title="ChatGPT와 대화"><GptMark /></button>
          <input ref={fileRef} type="file" multiple hidden onChange={pickFiles} />
        </div>}
        {miss && <p className="imp-miss">{miss}</p>}
        <div className="imp-row">
          {algo ? <span /> : <button className="imp-sample" onClick={() => put(SAMPLE_URLS)}>예시: 빵 블로그 글 6개</button>}
          <button className="imp-go" onClick={go} disabled={!v.trim()}>{algo ? '적용' : '시작'}</button>
        </div>
      </div>
    </div>
  );
}
