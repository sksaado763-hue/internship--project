import { useId } from 'react';

const COVERS = {
  'a-small-toolkit-for-everyday-work': {
    from: '#06141f', to: '#0e2c3d', accent: '#2fb6d8',
    motif: (
      <g>
        <rect x="96" y="168" width="238" height="176" rx="20" fill="#0f2f42" stroke="#2f6f8c" />
        <rect x="126" y="202" width="112" height="12" rx="6" fill="#63d6ee" />
        <rect x="126" y="230" width="178" height="9" rx="4.5" fill="#2c5f78" />
        <rect x="126" y="252" width="146" height="9" rx="4.5" fill="#2c5f78" />
        <rect x="126" y="290" width="78" height="28" rx="14" fill="#7c53e8" />
        <rect x="366" y="112" width="206" height="150" rx="20" fill="#122a44" stroke="#3d5fa6" />
        <g fill="#4d78d6"><rect x="396" y="206" width="24" height="34" rx="6" /><rect x="432" y="184" width="24" height="56" rx="6" /><rect x="468" y="162" width="24" height="78" rx="6" /></g>
        <rect x="606" y="216" width="196" height="150" rx="20" fill="#0d2233" stroke="#2f6f8c" />
        <g fill="#63d6ee"><circle cx="644" cy="256" r="9" /><circle cx="676" cy="256" r="9" /><circle cx="708" cy="256" r="9" /></g>
        <rect x="636" y="292" width="136" height="10" rx="5" fill="#2c5f78" />
        <rect x="636" y="316" width="96" height="10" rx="5" fill="#2c5f78" />
      </g>
    ),
  },
  'what-to-check-before-using-ai-tools': {
    from: '#080d1c', to: '#1d1136', accent: '#9b5cf0',
    motif: (
      <g>
        <circle cx="450" cy="240" r="126" fill="none" stroke="#6c3fc4" strokeWidth="2" strokeDasharray="9 12" opacity=".85" />
        <circle cx="450" cy="240" r="176" fill="none" stroke="#4a2b86" strokeWidth="2" strokeDasharray="3 14" opacity=".7" />
        <g stroke="#b98cff" strokeWidth="2" opacity=".75">
          <path d="M450 240 L300 150 M450 240 L608 148 M450 240 L318 350 M450 240 L602 344 M450 240 L450 96 M450 240 L450 386" />
        </g>
        <g fill="#cbb0ff"><circle cx="300" cy="150" r="13" /><circle cx="608" cy="148" r="13" /><circle cx="318" cy="350" r="13" /><circle cx="602" cy="344" r="13" /><circle cx="450" cy="96" r="13" /><circle cx="450" cy="386" r="13" /></g>
        <circle cx="450" cy="240" r="54" fill="#7b3fe0" />
        <circle cx="428" cy="218" r="15" fill="#e9d7ff" opacity=".85" />
      </g>
    ),
  },
  'make-writing-workflows-feel-lighter': {
    from: '#06152a', to: '#122f4d', accent: '#4f8ff0',
    motif: (
      <g>
        <rect x="212" y="120" width="300" height="240" rx="16" fill="#0e2740" stroke="#2f5680" transform="rotate(-7 362 240)" />
        <rect x="268" y="104" width="300" height="248" rx="16" fill="#123253" stroke="#3d6da3" transform="rotate(4 418 228)" />
        <g transform="rotate(4 418 228)" fill="#5f9bf0">
          <rect x="298" y="140" width="182" height="12" rx="6" />
          <rect x="298" y="170" width="232" height="9" rx="4.5" opacity=".65" />
          <rect x="298" y="192" width="206" height="9" rx="4.5" opacity=".65" />
          <rect x="298" y="214" width="238" height="9" rx="4.5" opacity=".65" />
          <rect x="298" y="236" width="150" height="9" rx="4.5" opacity=".65" />
        </g>
        <g transform="translate(612 168) rotate(38)">
          <rect x="0" y="0" width="26" height="150" rx="13" fill="#2f5680" />
          <path d="M13 150 L0 186 L26 186 Z" fill="#8fc0ff" />
        </g>
      </g>
    ),
  },
  'keep-simple-tasks-private': {
    from: '#04161a', to: '#0b312c', accent: '#25c39a',
    motif: (
      <g>
        <path d="M450 92 L604 148 V268 C604 350 536 400 450 424 C364 400 296 350 296 268 V148 Z" fill="#0d3b36" stroke="#2ec9a1" strokeWidth="3" />
        <path d="M450 130 L566 173 V266 C566 330 516 368 450 388 C384 368 334 330 334 266 V173 Z" fill="none" stroke="#1c7f6a" strokeWidth="2" opacity=".8" />
        <rect x="404" y="232" width="92" height="86" rx="16" fill="#1f6d5d" />
        <path d="M424 232 v-26 a26 26 0 0 1 52 0 v26" fill="none" stroke="#7df0cd" strokeWidth="12" strokeLinecap="round" />
        <circle cx="450" cy="266" r="12" fill="#d9fff2" />
        <rect x="444" y="272" width="12" height="26" rx="6" fill="#d9fff2" />
        <g fill="#2ec9a1" opacity=".4"><circle cx="196" cy="140" r="7" /><circle cx="712" cy="196" r="7" /><circle cx="238" cy="360" r="7" /><circle cx="676" cy="376" r="7" /></g>
      </g>
    ),
  },
  'developer-utilities-for-small-jobs': {
    from: '#060d20', to: '#141a3c', accent: '#5468e8',
    motif: (
      <g>
        <rect x="216" y="112" width="468" height="272" rx="18" fill="#0d1430" stroke="#33408f" />
        <rect x="216" y="112" width="468" height="46" rx="18" fill="#151d43" />
        <g fill="#4a5aa8"><circle cx="250" cy="135" r="8" /><circle cx="278" cy="135" r="8" /><circle cx="306" cy="135" r="8" /></g>
        <g>
          <rect x="252" y="190" width="60" height="11" rx="5.5" fill="#8b5cf6" />
          <rect x="322" y="190" width="128" height="11" rx="5.5" fill="#3f7fd6" />
          <rect x="276" y="218" width="86" height="11" rx="5.5" fill="#2ec9a1" />
          <rect x="372" y="218" width="150" height="11" rx="5.5" fill="#37518f" />
          <rect x="276" y="246" width="120" height="11" rx="5.5" fill="#37518f" />
          <rect x="252" y="274" width="66" height="11" rx="5.5" fill="#8b5cf6" />
          <rect x="328" y="274" width="104" height="11" rx="5.5" fill="#3f7fd6" />
          <rect x="252" y="302" width="150" height="11" rx="5.5" fill="#37518f" />
        </g>
        <path d="M604 206 L566 248 L604 290" fill="none" stroke="#7df0cd" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M656 206 L694 248 L656 290" fill="none" stroke="#7df0cd" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
  },
  'prepare-images-and-pdfs': {
    from: '#1a0d16', to: '#2e1522', accent: '#f08a4b',
    motif: (
      <g>
        <rect x="228" y="128" width="224" height="264" rx="14" fill="#2a1420" stroke="#6b3550" transform="rotate(-8 340 260)" />
        <rect x="286" y="108" width="224" height="272" rx="14" fill="#3a1c2b" stroke="#8a4463" transform="rotate(5 398 244)" />
        <rect x="316" y="142" width="164" height="14" rx="7" fill="#f7a469" transform="rotate(5 398 244)" />
        <g transform="rotate(5 398 244)" fill="#a4577a">
          <rect x="316" y="176" width="164" height="9" rx="4.5" />
          <rect x="316" y="198" width="132" height="9" rx="4.5" />
          <rect x="316" y="220" width="152" height="9" rx="4.5" />
        </g>
        <rect x="536" y="176" width="196" height="150" rx="16" fill="#152238" stroke="#4f7fbf" />
        <circle cx="590" cy="222" r="17" fill="#f7c46a" />
        <path d="M546 314 L608 246 L650 296 L684 262 L724 314 Z" fill="#4f9ad6" />
        <g fill="#f08a4b" opacity=".55"><circle cx="176" cy="152" r="8" /><circle cx="772" cy="392" r="8" /></g>
      </g>
    ),
  },
};

export default function BlogCover({ slug, className = 'blog-cover' }) {
  const uid = useId().replace(/:/g, '');
  const cover = COVERS[slug] ?? COVERS['a-small-toolkit-for-everyday-work'];
  const bgId = `blog-cover-bg-${uid}`;
  const glowId = `blog-cover-glow-${uid}`;
  return (
    <svg className={className} viewBox="0 0 900 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1"><stop stopColor={cover.from} /><stop offset="1" stopColor={cover.to} /></linearGradient>
        <radialGradient id={glowId}><stop stopColor={cover.accent} stopOpacity=".5" /><stop offset="1" stopColor={cover.accent} stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="900" height="480" fill={`url(#${bgId})`} />
      <circle cx="716" cy="82" r="270" fill={`url(#${glowId})`} />
      {cover.motif}
    </svg>
  );
}
