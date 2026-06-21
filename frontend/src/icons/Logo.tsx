export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="13" width="4.5" height="9" rx="1.5" fill="var(--accent-icon)" />
        <rect x="9.75" y="7" width="4.5" height="15" rx="1.5" fill="var(--accent)" />
        <rect x="17.5" y="2" width="4.5" height="20" rx="1.5" fill="var(--accent-deep)" />
      </svg>
      <span className="logo-word">Liftkit</span>
    </span>
  );
}