import { useId } from "react";

/**
 * Hand-built flat illustrations in the brand palette, used where there is no
 * photography (wealth, happiness, coaching, community, partnership).
 *
 * Every gradient id is scoped with useId so the same illustration can appear
 * more than once on a page. Gentle motion uses the global float/grow
 * keyframes and is switched off for reduced-motion users by globals.css.
 */

type Props = { className?: string; title?: string };

const G = {
  well: ["#8dd1a9", "#2e8b57"],
  navy: ["#4fa0ec", "#0a4d9d"],
  gold: ["#f6d269", "#d4a017"],
};

/** Shared soft backdrop: a tinted blob and a few sparkles. */
function Backdrop({ id, tint }: { id: string; tint: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor={tint} stopOpacity="0.32" />
          <stop offset="1" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="360" fill={`url(#${id}-bg)`} />
      <path
        d="M70 250c-22-70 30-150 120-170s200 10 220 90-30 150-120 160S92 320 70 250z"
        fill={tint}
        opacity="0.13"
      />
      {[
        [64, 70, 5],
        [420, 62, 4],
        [410, 300, 6],
        [96, 300, 3.5],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={tint} opacity="0.45" />
      ))}
    </>
  );
}

function Svg({
  title,
  className,
  children,
}: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 480 360"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

/** A meditating figure on a mat under a soft sun, with leaves and a lotus. */
export function WellnessIllustration({ className, title }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <Svg className={className} title={title}>
      <Backdrop id={id} tint="#2e8b57" />
      <defs>
        <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="0.6" stopColor={G.gold[0]} />
          <stop offset="1" stopColor={G.gold[1]} />
        </radialGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={G.well[0]} />
          <stop offset="1" stopColor={G.well[1]} />
        </linearGradient>
        <linearGradient id={`${id}-mat`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#45a06b" />
          <stop offset="1" stopColor="#246e45" />
        </linearGradient>
      </defs>

      {/* sun + halo */}
      <circle cx="240" cy="132" r="96" fill={G.gold[0]} opacity="0.18" className="animate-pulse-ring" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      <circle cx="240" cy="132" r="58" fill={`url(#${id}-sun)`} />

      {/* big leaves framing the scene */}
      <path d="M96 286 C70 230 86 168 140 140 C150 196 138 250 96 286Z" fill={`url(#${id}-leaf)`} opacity="0.9" />
      <path d="M96 286 C108 236 120 196 140 140" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" fill="none" />
      <path d="M384 286 C410 230 394 168 340 140 C330 196 342 250 384 286Z" fill={`url(#${id}-leaf)`} opacity="0.9" />
      <path d="M384 286 C372 236 360 196 340 140" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" fill="none" />

      {/* mat */}
      <ellipse cx="240" cy="296" rx="128" ry="16" fill="#0a4d9d" opacity="0.08" />
      <rect x="138" y="280" width="204" height="14" rx="7" fill={`url(#${id}-mat)`} />

      {/* meditating figure */}
      <g>
        {/* crossed legs */}
        <path d="M168 282 C176 252 214 246 240 256 C266 246 304 252 312 282Z" fill="#14402a" />
        {/* torso */}
        <path d="M212 262 C206 222 216 198 240 198 C264 198 274 222 268 262Z" fill="#ffffff" />
        <path d="M212 262 C206 222 216 198 240 198 C264 198 274 222 268 262Z" fill="#2e8b57" opacity="0.14" />
        {/* arms resting on knees */}
        <path d="M216 214 C196 232 186 252 184 268" stroke="#c98b5f" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M264 214 C284 232 294 252 296 268" stroke="#c98b5f" strokeWidth="10" strokeLinecap="round" fill="none" />
        <circle cx="183" cy="270" r="6.5" fill="#c98b5f" />
        <circle cx="297" cy="270" r="6.5" fill="#c98b5f" />
        {/* neck + head */}
        <rect x="233" y="182" width="14" height="18" rx="6" fill="#c98b5f" />
        <circle cx="240" cy="168" r="20" fill="#c98b5f" />
        <path d="M220 166 C218 144 262 142 260 166 C254 156 230 154 220 166Z" fill="#2b1d16" />
        <circle cx="240" cy="144" r="8" fill="#2b1d16" />
        {/* closed eyes + smile */}
        <path d="M230 170 q4 3 8 0 M242 170 q4 3 8 0" stroke="#5a3b26" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M234 178 q6 4 12 0" stroke="#7a4a2f" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* lotus */}
      <g transform="translate(240 316)">
        <path d="M0 -4 C-8 -18 -4 -30 0 -36 C4 -30 8 -18 0 -4Z" fill="#f4b8c4" />
        <path d="M-2 -4 C-16 -12 -22 -24 -22 -30 C-12 -26 -4 -18 -2 -4Z" fill="#f7cad3" />
        <path d="M2 -4 C16 -12 22 -24 22 -30 C12 -26 4 -18 2 -4Z" fill="#f7cad3" />
      </g>

      {/* floating leaves */}
      {[
        [120, 96, 0, -30],
        [362, 84, 1.3, 25],
        [404, 196, 2.4, -15],
      ].map(([x, y, d, r]) => (
        <path
          key={x}
          d={`M${x} ${y} c10 -14 26 -16 34 -12 c-4 14 -18 22 -34 12z`}
          fill={`url(#${id}-leaf)`}
          transform={`rotate(${r} ${x} ${y})`}
          className="animate-float"
          style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${d}s` }}
        />
      ))}
    </Svg>
  );
}

/** Rising bars, an upward arrow, stacked coins and a sprout — growing money. */
export function WealthIllustration({ className, title }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <Svg className={className} title={title}>
      <Backdrop id={id} tint="#1e88e5" />
      <defs>
        <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={G.navy[0]} />
          <stop offset="1" stopColor={G.navy[1]} />
        </linearGradient>
        <linearGradient id={`${id}-coin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={G.gold[0]} />
          <stop offset="1" stopColor={G.gold[1]} />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={G.well[0]} />
          <stop offset="1" stopColor={G.well[1]} />
        </linearGradient>
      </defs>

      {/* ground */}
      <rect x="70" y="282" width="340" height="6" rx="3" fill="#0a4d9d" opacity="0.12" />

      {/* bars */}
      {[
        [120, 222, 60],
        [170, 192, 90],
        [220, 152, 130],
        [270, 112, 170],
      ].map(([x, y, h], i) => (
        <rect
          key={x}
          x={x}
          y={y}
          width="36"
          height={h}
          rx="10"
          fill={`url(#${id}-bar)`}
          opacity={0.55 + i * 0.15}
          className="animate-grow"
          style={{ transformBox: "fill-box", transformOrigin: "bottom", animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* arrow */}
      <path
        d="M104 236 L176 182 L222 204 L322 108"
        fill="none"
        stroke={`url(#${id}-coin)`}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M300 102 L334 96 L328 130 Z" fill={G.gold[1]} />

      {/* coin stack */}
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <ellipse cx="362" cy={270 - i * 16} rx="34" ry="11" fill={G.gold[1]} />
            <ellipse cx="362" cy={264 - i * 16} rx="34" ry="11" fill={`url(#${id}-coin)`} />
          </g>
        ))}
        <text
          x="362"
          y="222"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="#7c5a0f"
          fontFamily="system-ui, sans-serif"
        >
          ₹
        </text>
      </g>

      {/* sprout from the stack */}
      <path d="M362 212 C362 196 362 186 364 172" stroke="#246e45" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M364 182 C346 176 338 160 342 150 C356 152 366 166 364 182Z" fill={`url(#${id}-leaf)`} />
      <path d="M364 176 C380 168 394 170 398 178 C390 190 374 188 364 176Z" fill={`url(#${id}-leaf)`} />

      {/* floating coin */}
      <g className="animate-float" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="96" cy="122" r="24" fill={`url(#${id}-coin)`} />
        <circle cx="96" cy="122" r="17" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
        <text x="96" y="128" textAnchor="middle" fontSize="18" fontWeight="700" fill="#7c5a0f" fontFamily="system-ui, sans-serif">
          ₹
        </text>
      </g>
    </Svg>
  );
}

/** A family with raised arms under a rising sun, hearts floating up. */
export function HappinessIllustration({ className, title }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <Svg className={className} title={title}>
      <Backdrop id={id} tint="#e4ae28" />
      <defs>
        <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="0.55" stopColor={G.gold[0]} />
          <stop offset="1" stopColor={G.gold[1]} />
        </radialGradient>
        <linearGradient id={`${id}-hill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={G.well[0]} />
          <stop offset="1" stopColor={G.well[1]} />
        </linearGradient>
      </defs>

      {/* sun + rays */}
      <g className="animate-[spin_40s_linear_infinite]" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="237"
            y="40"
            width="6"
            height="26"
            rx="3"
            fill={G.gold[0]}
            opacity="0.7"
            transform={`rotate(${i * 30} 240 150)`}
          />
        ))}
      </g>
      <circle cx="240" cy="150" r="64" fill={`url(#${id}-sun)`} />

      {/* hills */}
      <path d="M0 270 C90 220 160 230 240 262 S400 230 480 252 V360 H0Z" fill={`url(#${id}-hill)`} opacity="0.55" />
      <path d="M0 300 C110 262 200 272 280 296 S420 282 480 292 V360 H0Z" fill={`url(#${id}-hill)`} />

      {/* adult left */}
      <g>
        <circle cx="186" cy="196" r="16" fill="#c98b5f" />
        <path d="M172 186 C174 172 200 170 202 188 C196 182 182 180 172 186Z" fill="#2b1d16" />
        <path d="M160 300 C160 248 168 222 186 222 C204 222 212 248 212 300Z" fill="#2e8b57" />
        <path d="M168 232 L140 186" stroke="#c98b5f" strokeWidth="9" strokeLinecap="round" />
        <path d="M204 232 L226 200" stroke="#c98b5f" strokeWidth="9" strokeLinecap="round" />
      </g>
      {/* child centre */}
      <g>
        <circle cx="240" cy="226" r="13" fill="#d89a6c" />
        <path d="M228 220 C230 208 252 208 253 222 C247 216 236 215 228 220Z" fill="#3a2a1f" />
        <path d="M222 300 C222 266 228 248 240 248 C252 248 258 266 258 300Z" fill="#f4c542" />
        <path d="M230 256 L214 222" stroke="#d89a6c" strokeWidth="7" strokeLinecap="round" />
        <path d="M250 256 L266 222" stroke="#d89a6c" strokeWidth="7" strokeLinecap="round" />
      </g>
      {/* adult right */}
      <g>
        <circle cx="294" cy="194" r="16" fill="#b97a50" />
        <path d="M278 196 C276 170 314 168 311 196 C312 214 306 222 302 226 C304 210 300 186 292 184 C286 190 282 200 278 196Z" fill="#20140f" />
        <path d="M268 300 C268 248 276 220 294 220 C312 220 320 248 320 300Z" fill="#0a4d9d" />
        <path d="M276 230 L256 202" stroke="#b97a50" strokeWidth="9" strokeLinecap="round" />
        <path d="M312 230 L340 186" stroke="#b97a50" strokeWidth="9" strokeLinecap="round" />
      </g>

      {/* hearts */}
      {[
        [120, 140, 0],
        [362, 120, 1.2],
        [392, 196, 2.2],
      ].map(([x, y, d]) => (
        <path
          key={x}
          d={`M${x} ${y + 8} c-10-8-18-14-18-22 0-6 5-10 10-10 4 0 6 2 8 5 2-3 4-5 8-5 5 0 10 4 10 10 0 8-8 14-18 22z`}
          fill="#e05a6d"
          opacity="0.85"
          className="animate-float"
          style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${d}s` }}
        />
      ))}
    </Svg>
  );
}

/** A winding path up to a goal flag, with a compass and a checklist card. */
export function CoachingIllustration({ className, title }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <Svg className={className} title={title}>
      <Backdrop id={id} tint="#e4ae28" />
      <defs>
        <linearGradient id={`${id}-hill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={G.well[0]} />
          <stop offset="1" stopColor={G.well[1]} />
        </linearGradient>
        <linearGradient id={`${id}-flag`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={G.gold[0]} />
          <stop offset="1" stopColor={G.gold[1]} />
        </linearGradient>
      </defs>

      <path d="M40 300 C120 250 170 140 250 96 C300 70 340 110 380 150 C410 180 430 240 450 300Z" fill={`url(#${id}-hill)`} opacity="0.85" />
      {/* path */}
      <path
        d="M70 300 C150 290 120 250 190 236 S250 196 230 170 S270 126 268 100"
        fill="none"
        stroke="#fff"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="2 16"
      />
      {/* flag */}
      <path d="M268 100 V44" stroke="#14402a" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M270 46 L314 58 L270 72Z"
        fill={`url(#${id}-flag)`}
        className="animate-float"
        style={{ transformBox: "fill-box", transformOrigin: "left center" }}
      />
      {/* compass */}
      <g transform="translate(372 96)">
        <circle r="36" fill="#fff" stroke="#0a4d9d" strokeWidth="5" />
        <g className="animate-[spin_12s_ease-in-out_infinite]" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M0 -24 L7 0 L0 24 L-7 0Z" fill="#0a4d9d" />
          <path d="M0 -24 L7 0 L-7 0Z" fill="#e4ae28" />
        </g>
        <circle r="4" fill="#fff" stroke="#0a4d9d" strokeWidth="2" />
      </g>
      {/* checklist card */}
      <g transform="translate(64 96)">
        <rect width="118" height="100" rx="14" fill="#fff" stroke="#0a4d9d" strokeOpacity="0.15" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(16 ${20 + i * 26})`}>
            <rect width="16" height="16" rx="5" fill={i < 2 ? "#2e8b57" : "#e8eef5"} />
            {i < 2 && <path d="M4 8 l3 3 l6 -6" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <rect x="26" y="4" width={i === 1 ? 50 : 64} height="8" rx="4" fill="#0a4d9d" opacity={i < 2 ? 0.35 : 0.15} />
          </g>
        ))}
      </g>
    </Svg>
  );
}

/** People connected in a circle around a shared heart. */
export function CommunityIllustration({ className, title }: Props) {
  const id = useId().replace(/:/g, "");
  const people = [
    { a: -90, skin: "#c98b5f", shirt: "#2e8b57", hair: "#2b1d16" },
    { a: -18, skin: "#e2b08a", shirt: "#0a4d9d", hair: "#5a3b26" },
    { a: 54, skin: "#a86d45", shirt: "#e4ae28", hair: "#1c120d" },
    { a: 126, skin: "#d89a6c", shirt: "#45a06b", hair: "#9a9a9a" },
    { a: 198, skin: "#b97a50", shirt: "#1e88e5", hair: "#20140f" },
  ];
  return (
    <Svg className={className} title={title}>
      <Backdrop id={id} tint="#2e8b57" />
      <circle cx="240" cy="182" r="112" fill="none" stroke="#0a4d9d" strokeOpacity="0.18" strokeWidth="3" strokeDasharray="4 10" />
      {people.map((p, i) => {
        const rad = (p.a * Math.PI) / 180;
        const x = 240 + Math.cos(rad) * 112;
        const y = 182 + Math.sin(rad) * 112;
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <circle r="38" fill="#fff" />
            <circle r="38" fill={p.shirt} opacity="0.12" />
            <path d="M-24 30 C-24 10 -14 2 0 2 C14 2 24 10 24 30Z" fill={p.shirt} />
            <circle cy="-12" r="13" fill={p.skin} />
            <path d="M-13 -14 C-12 -30 12 -30 13 -14 C8 -20 -6 -21 -13 -14Z" fill={p.hair} />
          </g>
        );
      })}
      {/* shared heart */}
      <g className="animate-float" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="240" cy="182" r="40" fill="#fff" />
        <path d="M240 200 c-16-12-26-20-26-31 0-8 6-13 13-13 6 0 10 3 13 8 3-5 7-8 13-8 7 0 13 5 13 13 0 11-10 19-26 31z" fill="#2e8b57" />
      </g>
    </Svg>
  );
}

/** Two puzzle pieces locking together, with sparkles — collaboration. */
export function PartnershipIllustration({ className, title }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <Svg className={className} title={title}>
      <Backdrop id={id} tint="#e4ae28" />
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={G.well[0]} />
          <stop offset="1" stopColor={G.well[1]} />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={G.navy[0]} />
          <stop offset="1" stopColor={G.navy[1]} />
        </linearGradient>
      </defs>
      {/* left piece: tab on its right edge */}
      <path
        d="M120 110 H236 V158 C256 150 270 162 270 180 C270 198 256 210 236 202 V250 H120Z"
        fill={`url(#${id}-a)`}
        transform="translate(-5 0)"
      />
      {/* right piece: a socket that is the exact mirror of the tab */}
      <path
        d="M236 110 H352 V250 H236 V202 C256 210 270 198 270 180 C270 162 256 150 236 158Z"
        fill={`url(#${id}-b)`}
        transform="translate(5 0)"
      />
      {/* sparkles */}
      {[
        [252, 78, 0],
        [396, 112, 1.1],
        [96, 252, 2],
      ].map(([x, y, d]) => (
        <path
          key={x}
          d={`M${x} ${y - 14} Q${x + 2} ${y - 2} ${x + 14} ${y} Q${x + 2} ${y + 2} ${x} ${y + 14} Q${x - 2} ${y + 2} ${x - 14} ${y} Q${x - 2} ${y - 2} ${x} ${y - 14}Z`}
          fill="#e4ae28"
          className="animate-float"
          style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${d}s` }}
        />
      ))}
    </Svg>
  );
}

/** A friendly head-and-shoulders portrait for the "who can join" circle. */
export function PersonAvatar({
  skin,
  hair,
  shirt,
  style = "short",
  className,
}: {
  skin: string;
  hair: string;
  shirt: string;
  style?: "short" | "long" | "bun" | "cap" | "grey";
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect width="120" height="120" fill={shirt} opacity="0.14" />
        {style === "long" && <path d="M34 58 C30 30 90 30 86 58 L90 96 H30Z" fill={hair} />}
        <path d="M18 124 C18 94 36 82 60 82 C84 82 102 94 102 124Z" fill={shirt} />
        <rect x="52" y="68" width="16" height="18" rx="6" fill={skin} />
        <circle cx="60" cy="54" r="22" fill={skin} />
        {style === "short" && <path d="M38 52 C38 26 82 26 82 52 C76 40 50 38 38 52Z" fill={hair} />}
        {style === "long" && <path d="M38 54 C38 28 82 28 82 54 C74 42 48 40 38 54Z" fill={hair} />}
        {style === "bun" && (
          <>
            <circle cx="60" cy="28" r="10" fill={hair} />
            <path d="M38 52 C38 28 82 28 82 52 C74 42 48 40 38 52Z" fill={hair} />
          </>
        )}
        {style === "grey" && <path d="M38 50 C38 30 82 30 82 50 C78 42 70 40 60 40 C50 40 42 42 38 50Z" fill={hair} />}
        {style === "cap" && (
          <>
            <path d="M38 52 C38 30 82 30 82 52 C76 42 50 40 38 52Z" fill={hair} />
            <path d="M30 34 L60 22 L90 34 L60 46Z" fill="#14402a" />
            <path d="M82 37 V50" stroke="#e4ae28" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        <circle cx="52" cy="56" r="2.4" fill="#2b1d16" />
        <circle cx="68" cy="56" r="2.4" fill="#2b1d16" />
        <path d="M52 64 Q60 70 68 64" stroke="#7a4a2f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
