"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/SearchModal";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/today", label: "Today" },
  { href: "/browse", label: "Browse" },
];

export function NavBar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="sticky top-0 z-20 px-4 pt-4">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full bg-teal-900/95 px-3 py-2 text-white shadow-lg shadow-teal-900/20 backdrop-blur sm:px-5 sm:py-3">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold tracking-tight sm:gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-teal-950 sm:h-7 sm:w-7 sm:text-sm">
            E
          </span>
          <span className="text-sm sm:text-base">EDLIZ Surfer</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search topics"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-teal-100 transition-colors hover:bg-white/10"
          >
            <Search size={15} />
            <span className="hidden text-[11px] opacity-70 md:inline">⌘K</span>
          </button>
          <nav className="flex items-center gap-0.5 text-xs sm:gap-1 sm:text-sm">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-full px-2.5 py-1.5 transition-colors sm:px-3.5 ${
                    active ? "bg-white text-teal-900 font-medium" : "text-teal-100 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
