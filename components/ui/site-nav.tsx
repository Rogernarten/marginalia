"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/lib/storage";
import { cx, FOCUS } from "./cx";

function NavLink({ href, current, children }: { href: string; current?: "page" | "true"; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current}
      className={cx(
        "flex min-h-11 items-center gap-1.5 rounded-md px-3 text-[0.9375rem] underline-offset-[0.6rem] hover:underline hover:decoration-edge",
        current && "font-semibold underline decoration-accent decoration-2 hover:decoration-accent",
        FOCUS,
      )}
    >
      {children}
    </Link>
  );
}

/** Shared top navigation. "Read" covers contents and every chapter. */
export function SiteNav() {
  const path = usePathname();
  const saved = useSaved();
  const count = saved?.words.length ?? 0;
  const section = (base: string) => (path === base ? "page" : path.startsWith(`${base}/`) ? "true" : undefined);

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-[62rem] items-center justify-between gap-4 px-5 py-2">
        <Link
          href="/"
          aria-current={path === "/" ? "page" : undefined}
          className={cx("rounded-md py-2 font-serif text-xl italic", FOCUS)}
        >
          Marginalia
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1">
            <li>
              <NavLink href="/read" current={section("/read")}>
                Read
              </NavLink>
            </li>
            <li>
              <NavLink href="/notebook" current={section("/notebook")}>
                Notebook
                {count > 0 && (
                  <>
                    <span aria-hidden="true" className="rounded-full bg-saved px-2 text-xs font-semibold text-ink">
                      {count}
                    </span>
                    <span className="sr-only">, {count === 1 ? "1 word" : `${count} words`}</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
