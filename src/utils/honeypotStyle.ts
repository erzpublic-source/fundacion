import type { CSSProperties } from 'react'

// Keeps the honeypot field part of the page's layout — never display:none
// or visibility:hidden, which unsophisticated bots often detect and skip —
// while making it invisible and unreachable for a real visitor.
export const HONEYPOT_STYLE: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
}
