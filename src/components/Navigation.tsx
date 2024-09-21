'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/dashboard" className={pathname === '/dashboard' ? 'font-bold' : ''}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/groups" className={pathname.startsWith('/groups') ? 'font-bold' : ''}>
            Groups
          </Link>
        </li>
        {/* Add more navigation items here as we develop more features */}
      </ul>
    </nav>
  )
}