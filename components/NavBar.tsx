"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/browse", label: "Browse" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 px-4 pt-4">
      <header className="mx-auto flex max-w-3xl items-center justify-between rounded-full bg-teal-900/95 px-5 py-3 text-white shadow-lg shadow-teal-900/20 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-400 text-sm font-bold text-teal-950">
            E
          </span>
          EDLIZ Surfer
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 transition-colors ${
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
