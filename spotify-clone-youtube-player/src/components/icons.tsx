import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "currentColor",
  viewBox: "0 0 24 24",
} as const;

export function HomeIcon({ filled = false, ...p }: P & { filled?: boolean }) {
  return (
    <svg {...base} {...p}>
      <path
        d={
          filled
            ? "M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z"
            : "M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"
        }
      />
    </svg>
  );
}

export function SearchIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z" />
    </svg>
  );
}

export function LibraryIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866zM16 4.732V20h4V7.041l-4-2.309zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z" />
    </svg>
  );
}

export function PlusIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M11.999 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function PlayIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
    </svg>
  );
}

export function PauseIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5zm12 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5z" />
    </svg>
  );
}

export function ShuffleIcon({ active = false, ...p }: P & { active?: boolean }) {
  return (
    <svg {...base} {...p}>
      <path
        d="M5.5 17a1 1 0 0 1-1-1 5.5 5.5 0 0 1 9.45-3.84l1.67 1.72V11.5a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1h-5a1 1 0 0 1 0-2h2.09l-1.1-1.14A3.5 3.5 0 0 0 6.5 16a1 1 0 0 1-1 1zm0-6a5.51 5.51 0 0 1-1.39-4.37 1 1 0 0 1 1.95-.38A3.5 3.5 0 0 0 9.5 9.5h2.09l-1.1-1.14a3.5 3.5 0 0 0-5.93.5 1 1 0 0 1-1.06.76v2.38zM16.5 9a3.5 3.5 0 0 0-2.98 1.64 1 1 0 0 1-1.7-1.06A5.5 5.5 0 0 1 16.5 7a1 1 0 0 1 0 2z"
        fill={active ? "#1ed760" : "currentColor"}
      />
    </svg>
  );
}

export function PrevIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6 6a1 1 0 0 1 2 0v12a1 1 0 0 1-2 0V6zm12.95 1.606a.7.7 0 0 0-1.01.606v7.576a.7.7 0 0 0 1.01.606l6.506-3.788a.7.7 0 0 0 0-1.212l-6.506-3.788z" />
    </svg>
  );
}

export function NextIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M16 6a1 1 0 0 1 2 0v12a1 1 0 0 1-2 0V6zM5.05 3.606a.7.7 0 0 1 0-1.212L11.556 6.18a.7.7 0 0 1 0 1.212L5.05 3.606a.7.7 0 0 1 0 1.212z" />
    </svg>
  );
}

export function RepeatIcon({ active = false, ...p }: P & { active?: boolean }) {
  return (
    <svg {...base} {...p}>
      <path
        d="M6 6h8.586l-2.293-2.293a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L14.586 8H6a3 3 0 0 0-3 3v1a1 1 0 0 1-2 0v-1a5 5 0 0 1 5-5zm12 12H9.414l2.293 2.293a1 1 0 1 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L9.414 16H18a3 3 0 0 0 3-3v-1a1 1 0 0 1 2 0v1a5 5 0 0 1-5 5z"
        fill={active ? "#1ed760" : "currentColor"}
      />
    </svg>
  );
}

export function HeartIcon({
  filled = false,
  ...p
}: P & { filled?: boolean }) {
  return (
    <svg {...base} {...p}>
      <path
        d="M5.21 1.57a6.757 6.757 0 0 1 6.708 1.545.124.124 0 0 0 .165 0 6.741 6.741 0 0 1 5.715-1.78l.004.002a6.802 6.802 0 0 1 5.571 6.376v.348a6.685 6.685 0 0 1-.828 3.219 26.468 26.468 0 0 1-5.665 7.103A13.518 13.518 0 0 1 12 21.5l-.225-.032a13.5 13.5 0 0 1-4.655-3.465 26.47 26.47 0 0 1-5.665-7.104A6.685 6.685 0 0 1 .627 7.68v-.348A6.802 6.802 0 0 1 5.209 1.57zM12 2.947a8.76 8.76 0 0 0-6.053-1.52 4.802 4.802 0 0 0-3.93 4.502v.348a4.685 4.685 0 0 0 .586 2.245 24.47 24.47 0 0 0 5.235 6.566 11.5 11.5 0 0 0 3.936 2.96 11.5 11.5 0 0 0 3.974-2.975 24.469 24.469 0 0 0 5.235-6.55A4.685 4.685 0 0 0 22.16 7.68v-.348a4.802 4.802 0 0 0-3.93-4.502A4.742 4.742 0 0 0 12 2.947z"
        fill={filled ? "#1db954" : "currentColor"}
      />
    </svg>
  );
}

export function MoreIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm15 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  );
}

export function ClockIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37V7z" />
    </svg>
  );
}

export function VolumeIcon({ level = 1, ...p }: P & { level?: number }) {
  return (
    <svg {...base} {...p}>
      <path d="M11.5 3.5v17l-4.5-4H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3l4.5-4zm2 2.4v11.2a1 1 0 0 0 1.45.9 8 8 0 0 0 0-13a1 1 0 0 0-1.45.9z" />
      {level >= 2 && (
        <path d="M16.5 8.5a1 1 0 0 1 1.34.45 5 5 0 0 1 0 4.1 1 1 0 0 1-1.79-.9 3 3 0 0 0 0-2.3 1 1 0 0 1 .45-1.35z" />
      )}
      {level >= 3 && (
        <path d="M19 7a1 1 0 0 1 1.4.3 7 7 0 0 1 0 7.4A1 1 0 0 1 18.6 13.4a5 5 0 0 0 0-4.4A1 1 0 0 1 19 7z" />
      )}
    </svg>
  );
}

export function VolumeMuteIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M11.5 3.5v17l-4.5-4H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3l4.5-4zm6.3 6.8l1.4-1.4-1.4-1.4-1.4 1.4-1.4-1.4-1.4 1.4 1.4 1.4-1.4 1.4 1.4 1.4 1.4-1.4 1.4 1.4 1.4-1.4-1.4-1.4z" />
    </svg>
  );
}

export function QueueIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M15 4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-6zm0 4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-6zm0 4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-6zM3 14a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0-4a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0-4a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function XIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
    </svg>
  );
}

export function CheckIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

export function ChevronLeftIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M15.54 21.15L5.095 12.23 15.54 3.31l.65.76L6.46 12.23l9.73 8.16-.65.76z" />
    </svg>
  );
}

export function ChevronRightIcon({ ...p }: P) {
  return (
    <svg {...base} {...p}>
      <path d="M8.46 21.15l-.65-.76 9.73-8.16-9.73-8.16.65-.76 10.445 8.92z" />
    </svg>
  );
}

export function SpeakerIcon({ filled = false, ...p }: P & { filled?: boolean }) {
  return (
    <svg {...base} {...p}>
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
        fill={filled ? "#1db954" : "currentColor"}
      />
    </svg>
  );
}
