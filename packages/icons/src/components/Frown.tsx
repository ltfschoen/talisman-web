import * as React from 'react'
import { Ref, SVGProps, forwardRef } from 'react'
const SvgFrown = (
  props: Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
    size?: number | string
  },
  ref: Ref<SVGSVGElement>
) => (
  <svg
    width={props.size ?? 24}
    height={props.size ?? 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 16s-1.5-2-4-2-4 2-4 2"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 9h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 9h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ForwardRef = forwardRef(SvgFrown)
export default ForwardRef
