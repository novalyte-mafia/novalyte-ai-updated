"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  INVESTOR_BASE_PATH,
  PUBLIC_NAV,
  investorPath,
} from "@/lib/investor/config";
import { cn } from "@/lib/utils";

function navIsActive(pathname: string, href: string): boolean {
  if (href === INVESTOR_BASE_PATH) {
    return pathname === INVESTOR_BASE_PATH;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function InvestorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const requestAccessHref = investorPath("contact?intent=access");
  const signInHref = investorPath("sign-in");

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-foreground">
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={INVESTOR_BASE_PATH}
            className="shrink-0"
            aria-label="Novalyte AI investor portal home"
          >
            <Logo />
          </Link>

          <nav
            className="mx-auto hidden xl:flex xl:items-center xl:gap-1"
            aria-label="Investor portal"
          >
            {PUBLIC_NAV.map((item) => {
              const active = navIsActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                    active
                      ? "bg-teal-50 text-teal-800"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden border-stone-200 bg-white text-stone-700 hover:bg-stone-50 sm:inline-flex"
            >
              <Link href={signInHref}>Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-teal-600 text-white shadow-sm hover:bg-teal-700"
            >
              <Link href={requestAccessHref}>Request Access</Link>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="xl:hidden"
                  aria-label="Open investor navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-xs overflow-y-auto p-0"
              >
                <SheetHeader className="border-b border-stone-200 px-5 py-4">
                  <SheetTitle asChild>
                    <div>
                      <Logo />
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-1 p-3"
                  aria-label="Mobile investor navigation"
                >
                  {PUBLIC_NAV.map((item) => {
                    const active = navIsActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-2.5 text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                          active
                            ? "bg-teal-50 text-teal-800"
                            : "text-stone-700 hover:bg-stone-100",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="mt-3 flex flex-col gap-2 border-t border-stone-200 pt-3">
                    <Button
                      asChild
                      variant="outline"
                      className="border-stone-200"
                    >
                      <Link href={signInHref} onClick={() => setMobileOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                      <Link
                        href={requestAccessHref}
                        onClick={() => setMobileOpen(false)}
                      >
                        Request Access
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Logo size="sm" />
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-600">
                Confidential investor materials. Unauthorized review, copying, or
                distribution is prohibited.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-500">
                [ATTORNEY REVIEW REQUIRED] Forward-looking statements placeholder —
                replace with counsel-approved language before external distribution.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Portal</h3>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  <li>
                    <Link
                      href={requestAccessHref}
                      className="hover:text-teal-700"
                    >
                      Request investor access
                    </Link>
                  </li>
                  <li>
                    <Link href={signInHref} className="hover:text-teal-700">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={investorPath("contact")}
                      className="hover:text-teal-700"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Legal</h3>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  <li>Not an offer of securities — placeholder</li>
                  <li>Confidential information — placeholder</li>
                  <li>Healthcare technology facilitator notice</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-200 pt-6 text-xs text-stone-500">
            © {new Date().getFullYear()} Novalyte AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
