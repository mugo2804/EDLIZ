"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/today", label: "Today" },
  { href: "/browse", label: "Browse" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 px-4 pt-4">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full bg-teal-900/95 px-3 py-2 text-white shadow-lg shadow-teal-900/20 backdrop-blur sm:px-5 sm:py-3">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold tracking-tight sm:gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-teal-950 sm:h-7 sm:w-7 sm:text-sm">
            E
          </span>
          <span className="text-sm sm:text-base">EDLIZ Surfer</span>
        </Link>
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
      </header>
    </div>
  );
}
