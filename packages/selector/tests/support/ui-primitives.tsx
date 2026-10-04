import type { ReactNode } from 'react'

interface MenuItem {
  id: string
  label: ReactNode
}

interface MenuProps {
  anchor: ReactNode
  items: readonly MenuItem[]
  onSelect: (id: string) => void
  open: boolean
}

/** 0.2.0 renamed this icon (`…Outline14` → `…OutlineMedium`); the double tracks the shipped export. */
export function IconChevronDownOutlineMedium({ className }: { className?: string }) {
  return <span aria-hidden="true" className={className}>⌄</span>
}

export function Menu({ anchor, items, onSelect, open }: MenuProps) {
  return (
    <>
      {anchor}
      {open ? (
        <div role="menu">
          {items.map(item => (
            <button key={item.id} role="menuitem" type="button" onClick={() => { onSelect(item.id) }}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </>
  )
}
