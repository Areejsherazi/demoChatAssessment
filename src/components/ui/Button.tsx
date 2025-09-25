import React from 'react'

export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`button ${props.className || ''}`.trim()} />
}
