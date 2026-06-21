import { iconProps } from './iconProps';

export function RefreshIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="22 4 22 10 16 10" />
      <polyline points="2 20 2 14 8 14" />
      <path d="M19.4 9a8 8 0 0 0-13.3-3L2 10M22 14l-4.1 4a8 8 0 0 1-13.3-3" />
    </svg>
  );
}