type Props = {
  className?: string;
  mark?: boolean;
};

/**
 * Hand-stamped wordmark: wobbly box drawn by hand plus typewriter lettering.
 */
export function Logo({ className, mark = true }: Props) {
  return (
    <svg
      viewBox={mark ? "0 0 300 46" : "0 0 244 46"}
      role="img"
      aria-label="NULLVOID"
      className={className}
      preserveAspectRatio="xMinYMid meet"
    >
      {mark && (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M3 4 q16 -3 34 1 q18 3 33 -1 q-3 17 1 34 q3 18 -1 34" />
          <path d="M4 38 q17 -3 33 1 q17 3 33 -1 q-2 -18 1 -35" />
          <path d="M12 30 V16 l11 14 V16 M31 16 v15" />
          <circle cx="34" cy="33" r="4" fill="currentColor" stroke="none" />
        </g>
      )}
      <text
        x={mark ? 56 : 4}
        y="31"
        fill="currentColor"
        fontFamily="var(--font-type), var(--font-roboto-mono), monospace"
        fontSize="27"
        letterSpacing="1.5"
        transform={mark ? "rotate(-1.5 56 31)" : "rotate(-1.5 4 31)"}
      >
        NULLVOID
      </text>
      <path
        d={
          mark
            ? "M55 38 q46 6 96 0 q48 -5 96 1"
            : "M3 38 q46 6 96 0 q48 -5 96 1"
        }
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}