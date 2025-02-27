import Link from "next/link";
import { Home, Search, UserCircle } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="h-screen w-16 flex flex-col items-center py-8 bg-blue-200 text-white">
      <nav className="flex flex-col gap-8">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          <Home size={24} />
        </Link>
        <Link href="" className="hover:text-blue-400 transition-colors">
          <Search size={24} />
        </Link>
        <Link href="/login" className="hover:text-blue-400 transition-colors">
          <UserCircle size={24} />
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar; 