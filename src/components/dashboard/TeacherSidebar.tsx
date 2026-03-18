'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BookOpen, Users, BarChart3, Settings } from 'lucide-react'

export function TeacherSidebar() {
  const pathname = usePathname()

  const links = [
    {
      href: '/dashboard',
      label: 'Mis Simulacros',
      icon: BookOpen,
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/exams'),
    },
    {
      href: '/dashboard/results',
      label: 'Resultados Estudiantes',
      icon: BarChart3,
      isActive: pathname.startsWith('/dashboard/results'),
    },
  ]

  return (
    <div className="flex flex-col h-full bg-background border-r w-64 p-4 space-y-2 shrink-0">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
              link.isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
