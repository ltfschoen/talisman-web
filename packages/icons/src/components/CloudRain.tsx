import * as React from 'react'
import { Ref, SVGProps, forwardRef } from 'react'
const SvgCloudRain = (
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
    <g clipPath="url(#a)" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 13v8" />
      <path d="M8 13v8" />
      <path d="M12 15v8" />
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A7.998 7.998 0 0 0 2.063 5.005 8 8 0 0 0 4 15.25" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(SvgCloudRain)
export default ForwardRef
