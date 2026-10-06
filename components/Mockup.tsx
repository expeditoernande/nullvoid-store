type Props = {
  tone?: string;
  className?: string;
  label?: string;
};

/**
 * One rough, photocopied garment drawing reused across the whole catalog.
 * Edges are displaced by a turbulence filter so it reads as hand-inked.
 */
export function Mockup({
  tone = "#1c1c1c",
  className,
  label,
}: Props) {
  const uid = `plate-${tone.replace("#", "")}`;

  return (
    <svg
      viewBox="0 0 800 800"
      role="img"
      aria-label={label ?? "Desenho da peça"}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={`${uid}-ink`} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.016 0.03"
            numOctaves="3"
            seed="9"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <radialGradient id={`${uid}-bg`} cx="48%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#1e1e1d" />
          <stop offset="55%" stopColor="#121212" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>
        <linearGradient id={`${uid}-cloth`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={tone} />
          <stop offset="100%" stopColor={tone} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${uid}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2b1f" stopOpacity="0.12" />
          <stop offset="45%" stopColor="#ff2b1f" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
        </linearGradient>
      </defs>

      <rect width="800" height="800" fill={`url(#${uid}-bg)`} />
      <g fill="#ff2b1f" opacity="0.03">
        <ellipse cx="180" cy="220" rx="150" ry="90" />
        <ellipse cx="640" cy="560" rx="190" ry="120" />
        <ellipse cx="360" cy="700" rx="230" ry="70" />
      </g>
      <rect
        width="800"
        height="800"
        filter={`url(#${uid}-grain)`}
        opacity="0.09"
      />

      <g filter={`url(#${uid}-ink)`}>
        <ellipse cx="400" cy="676" rx="236" ry="26" fill="#000" opacity="0.55" />

        <path
          d="M400 172 C338 172 308 214 308 252 L492 252 C492 214 462 172 400 172 Z"
          fill={`url(#${uid}-cloth)`}
        />
        <path
          d="M400 172 C338 172 308 214 308 252 L492 252 C492 214 462 172 400 172 Z"
          fill={`url(#${uid}-light)`}
        />

        <path
          d="M298 234 L238 260 L180 338 L228 384 L264 342 L264 598 L536 598 L536 342 L572 384 L620 338 L562 260 L502 234 L450 248 L400 302 L350 248 Z"
          fill={`url(#${uid}-cloth)`}
        />
        <path
          d="M298 234 L238 260 L180 338 L228 384 L264 342 L264 598 L536 598 L536 342 L572 384 L620 338 L562 260 L502 234 L450 248 L400 302 L350 248 Z"
          fill={`url(#${uid}-light)`}
        />

        <path d="M350 248 L400 302 L450 248 L430 234 L400 260 L370 234 Z" fill="#000" opacity="0.5" />

        <g stroke="#ff2b1f" strokeOpacity="0.08" strokeWidth="3" fill="none">
          <path d="M264 342 L264 598" />
          <path d="M536 342 L536 598" />
          <path d="M302 270 L264 342" />
          <path d="M498 270 L536 342" />
        </g>

        <path d="M332 428 H468 V488 H332 Z" fill="#000" opacity="0.24" />
        <path
          d="M332 428 H468 V488 H332 Z"
          fill="none"
          stroke="#ff2b1f"
          strokeOpacity="0.1"
          strokeWidth="3"
        />
        <path d="M400 428 V488" stroke="#ff2b1f" strokeOpacity="0.07" strokeWidth="3" />

        <path
          d="M364 272 V336 M436 272 V336"
          stroke="#ff2b1f"
          strokeOpacity="0.26"
          strokeWidth="5"
        />
        <circle cx="364" cy="340" r="5" fill="#ff2b1f" opacity="0.4" />
        <circle cx="436" cy="340" r="5" fill="#ff2b1f" opacity="0.4" />

        <rect x="264" y="566" width="272" height="32" fill="#000" opacity="0.34" />
        <rect
          x="180"
          y="358"
          width="54"
          height="32"
          fill="#000"
          opacity="0.3"
          transform="rotate(-38 207 374)"
        />
        <rect
          x="566"
          y="358"
          width="54"
          height="32"
          fill="#000"
          opacity="0.3"
          transform="rotate(38 593 374)"
        />
      </g>

      <g
        fill="#ff2b1f"
        opacity="0.3"
        fontFamily="var(--font-type), var(--font-roboto-mono), monospace"
        fontSize="26"
      >
        <text x="46" y="748" transform="rotate(-3 46 748)">
          nullvoid
        </text>
      </g>
      <path
        d="M44 762 q120 12 244 -2"
        stroke="#ff2b1f"
        strokeOpacity="0.22"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}