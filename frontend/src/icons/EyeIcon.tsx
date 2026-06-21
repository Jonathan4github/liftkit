import { iconProps } from './iconProps';

export function EyeIcon({ off = false }: { off?: boolean }) {
  return (
    <svg {...iconProps}>
      {off ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
          <path d="M9.4 5.1A9.4 9.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.1M6 6.1A17 17 0 0 0 2 12s3.5 7 10 7a9.3 9.3 0 0 0 2.6-.4" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
