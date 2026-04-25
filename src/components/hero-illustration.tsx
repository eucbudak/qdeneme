// Landing page hero — optik form + kız öğrenci silüeti + yıldızlar.
// Saf SVG, brand renkleriyle. Yanıtlı (responsive aspect ratio).

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 480 480"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Optik form ve öğrenci illüstrasyonu"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="hero-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.78 0.14 195)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.55 0.22 280)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="hero-shirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.6 0.22 280)" />
            <stop offset="100%" stopColor="oklch(0.5 0.22 285)" />
          </linearGradient>
        </defs>

        {/* Background blob */}
        <ellipse cx="240" cy="270" rx="210" ry="200" fill="url(#hero-bg)" />

        {/* OMR form, sol-üst, hafif eğik */}
        <g transform="translate(40 60) rotate(-8 80 110)">
          <rect
            x="0"
            y="0"
            width="160"
            height="220"
            rx="10"
            fill="white"
            stroke="oklch(0.55 0.22 280)"
            strokeWidth="2"
          />
          <rect x="0" y="0" width="160" height="32" rx="10" fill="oklch(0.55 0.22 280)" />
          <text
            x="80"
            y="22"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontWeight="800"
            fontSize="14"
            fill="white"
          >
            OPTİK FORM
          </text>

          {/* Bubble grid: 5 columns × 9 rows */}
          {Array.from({ length: 9 }).map((_, row) =>
            Array.from({ length: 5 }).map((__, col) => {
              const cx = 22 + col * 28;
              const cy = 52 + row * 17;
              // Filled answers — simulate answered bubbles
              const filled =
                (row === 0 && col === 1) ||
                (row === 1 && col === 3) ||
                (row === 2 && col === 0) ||
                (row === 4 && col === 2) ||
                (row === 6 && col === 4) ||
                (row === 7 && col === 1);
              return (
                <circle
                  key={`${row}-${col}`}
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill={filled ? "oklch(0.18 0.03 280)" : "white"}
                  stroke="oklch(0.55 0.22 280 / 0.5)"
                  strokeWidth="1.2"
                />
              );
            }),
          )}
        </g>

        {/* Öğrenci — sağ-alt, masada otururken ¾ görünüm */}
        <g transform="translate(280 145)">
          {/* Hair back — uzun düz saç */}
          <path
            d="M -68 -10 Q -82 -65 -50 -98 Q -8 -120 38 -110 Q 78 -90 78 -45 Q 82 0 76 30 L 90 120 L 80 110 L 70 50 L 65 80 L 60 60 L 55 95 L 50 70 L 45 100 L 40 60 L 35 90 L 30 60 L 25 90 L 20 60 L 15 90 L 10 60 L 5 90 L 0 60 L -5 95 L -10 65 L -15 95 L -20 65 L -25 95 L -30 65 L -35 95 L -40 70 L -45 100 L -50 75 L -55 105 L -60 80 Z"
            fill="oklch(0.18 0.04 280)"
          />

          {/* Yüz */}
          <ellipse cx="3" cy="-50" rx="42" ry="50" fill="oklch(0.85 0.04 60)" />

          {/* Hair bangs — alın */}
          <path
            d="M -42 -85 Q -25 -110 5 -110 Q 35 -110 48 -85 Q 40 -65 5 -68 Q -32 -68 -42 -85 Z"
            fill="oklch(0.18 0.04 280)"
          />

          {/* Hair side strand */}
          <path
            d="M -42 -55 Q -52 -25 -42 5 Q -38 -10 -38 -40 Z"
            fill="oklch(0.18 0.04 280)"
          />

          {/* Gözler — kapalı/mutlu kavis */}
          <path d="M -18 -52 Q -12 -47 -6 -52" stroke="oklch(0.18 0.03 280)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M 12 -52 Q 18 -47 24 -52" stroke="oklch(0.18 0.03 280)" strokeWidth="2.4" fill="none" strokeLinecap="round" />

          {/* Yanak hafif allık */}
          <ellipse cx="-22" cy="-35" rx="6" ry="3.5" fill="oklch(0.7 0.14 25)" opacity="0.4" />
          <ellipse cx="28" cy="-35" rx="6" ry="3.5" fill="oklch(0.7 0.14 25)" opacity="0.4" />

          {/* Gülümseme */}
          <path
            d="M -8 -28 Q 3 -22 14 -28"
            stroke="oklch(0.18 0.03 280)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Boyun */}
          <rect x="-12" y="-7" width="30" height="20" fill="oklch(0.85 0.04 60)" />

          {/* Üst — kazak/tişört */}
          <path
            d="M -75 30 Q -75 10 -45 5 Q -10 -2 25 -2 Q 60 5 75 25 L 90 170 L -90 170 Z"
            fill="url(#hero-shirt)"
          />

          {/* Yaka detay */}
          <path
            d="M -16 0 Q 3 18 22 0"
            stroke="oklch(0.4 0.18 280)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sağ kol — kalem tutuyor */}
          <g transform="translate(60 50) rotate(20)">
            <rect x="0" y="0" width="35" height="18" rx="9" fill="oklch(0.85 0.04 60)" />
            <g transform="translate(30 4) rotate(-25)">
              {/* Kalem gövde */}
              <rect x="0" y="0" width="55" height="7" rx="1" fill="oklch(0.78 0.16 75)" />
              {/* Uç */}
              <polygon points="55,-1 67,3.5 55,8" fill="oklch(0.18 0.03 280)" />
              {/* Silgi ucu */}
              <rect x="-7" y="0" width="7" height="7" fill="oklch(0.66 0.2 5)" />
            </g>
          </g>
        </g>

        {/* Yıldız vurguları */}
        <g fill="oklch(0.55 0.22 280)">
          <Star x={420} y={70} size={18} />
          <Star x={70} y={350} size={14} />
        </g>
        <g fill="oklch(0.78 0.14 195)">
          <Star x={380} y={420} size={20} />
        </g>
        <g fill="oklch(0.78 0.16 75)">
          <Star x={155} y={50} size={12} />
        </g>
      </svg>
    </div>
  );
}

function Star({ x, y, size }: { x: number; y: number; size: number }) {
  // 5-uçlu yıldız — yıldız motifi logodaki tarzla uyumlu
  const r = size;
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    points.push(`${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`);
  }
  return <polygon points={points.join(" ")} />;
}
