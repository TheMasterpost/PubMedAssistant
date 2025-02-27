import { Home, Search, UserCircle } from "lucide-react"
import Link from "next/link"

export function Sidebar() {
  return (
    <div className="w-16 bg-slate-900 h-screen flex flex-col items-center py-8 gap-8">
      <Link href="/" className="text-white hover:text-slate-300">
        <Home size={24} />
      </Link>
      <Link href="/search" className="text-white hover:text-slate-300">
        <Search size={24} />
      </Link>
      <Link href="/login" className="text-white hover:text-slate-300">
        <UserCircle size={24} />
      </Link>
    </div>
  )
} 