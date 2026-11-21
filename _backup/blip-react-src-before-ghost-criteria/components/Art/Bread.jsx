// 빵 일러스트 (사진 대신 직접 그린 단순한 그림)

const ART = {
  salt: (<>
    <path d="M14 64c0-20 16-34 36-34s36 14 36 34c0 7-5 11-12 11H26c-7 0-12-4-12-11z" fill="#e3a957" />
    <path d="M26 50c6-8 14-12 24-12s18 4 24 12" fill="none" stroke="#f3cf8c" strokeWidth="4" strokeLinecap="round" />
    <g fill="#fff">
      <rect x="34" y="40" width="4" height="4" rx="1" transform="rotate(20 36 42)" /><rect x="48" y="35" width="4" height="4" rx="1" transform="rotate(-15 50 37)" />
      <rect x="61" y="41" width="4" height="4" rx="1" transform="rotate(35 63 43)" /><rect x="42" y="47" width="3" height="3" rx="1" /><rect x="56" y="48" width="3" height="3" rx="1" />
    </g>
  </>),
  croissant: (<>
    <ellipse cx="22" cy="62" rx="9" ry="13" transform="rotate(-62 22 62)" fill="#c97e2e" />
    <ellipse cx="78" cy="62" rx="9" ry="13" transform="rotate(62 78 62)" fill="#c97e2e" />
    <ellipse cx="33" cy="50" rx="12" ry="17" transform="rotate(-36 33 50)" fill="#da9440" />
    <ellipse cx="67" cy="50" rx="12" ry="17" transform="rotate(36 67 50)" fill="#da9440" />
    <ellipse cx="50" cy="44" rx="15" ry="21" fill="#eab05a" />
    <path d="M40 38c6 4 14 4 20 0M39 49c7 4 15 4 22 0" fill="none" stroke="#c97e2e" strokeWidth="2.6" strokeLinecap="round" />
  </>),
  bagel: (<>
    <path fillRule="evenodd" d="M50 18a32 32 0 1 1-.01 0zM50 40a10 10 0 1 0 .01 0z" fill="#c4834a" />
    <path d="M26 42a26 26 0 0 1 48 0" fill="none" stroke="#dca46b" strokeWidth="6" strokeLinecap="round" />
    <g fill="#fff6e6">
      <ellipse cx="34" cy="34" rx="2" ry="1.2" transform="rotate(-30 34 34)" /><ellipse cx="46" cy="27" rx="2" ry="1.2" /><ellipse cx="60" cy="29" rx="2" ry="1.2" transform="rotate(25 60 29)" />
      <ellipse cx="70" cy="40" rx="2" ry="1.2" transform="rotate(50 70 40)" /><ellipse cx="30" cy="48" rx="2" ry="1.2" transform="rotate(-60 30 48)" />
    </g>
  </>),
  baguette: (
    <g transform="rotate(-28 50 50)">
      <rect x="8" y="38" width="84" height="25" rx="12.5" fill="#cf9550" />
      <path d="M22 44l7 13M38 44l7 13M54 44l7 13M70 44l7 13" stroke="#f1d197" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),
  loaf: (
    <path d="M24 46c-6 0-10-5-10-11 0-9 8-15 18-15h36c10 0 18 6 18 15 0 6-4 11-10 11v32H24z" fill="#f4e0b6" stroke="#c98f52" strokeWidth="5" strokeLinejoin="round" />
  ),
  redbean: (<>
    <circle cx="50" cy="52" r="31" fill="#9d6038" />
    <path d="M28 42a26 26 0 0 1 44 0" fill="none" stroke="#b97b4f" strokeWidth="6" strokeLinecap="round" />
    <g fill="#f4e6cf"><circle cx="47" cy="38" r="1.8" /><circle cx="52" cy="36" r="1.8" /><circle cx="51" cy="41" r="1.8" /></g>
  </>),
  pie: (<>
    <path d="M12 62a38 38 0 0 1 76 0z" fill="#d9a05b" />
    <rect x="10" y="60" width="80" height="12" rx="6" fill="#c3843f" />
    <path d="M30 46c6 4 12 4 18 0M52 46c6 4 12 4 18 0" fill="none" stroke="#f0cd92" strokeWidth="3" strokeLinecap="round" />
  </>)
};

export function Bread({ kind = 'loaf', size = 100 }) {
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">{ART[kind] || ART.loaf}</svg>;
}
