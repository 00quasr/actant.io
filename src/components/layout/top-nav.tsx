"use client";

import * as React from "react";
import Link from "next/link";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
      {initial}
    </div>
  );
}

export function TopNav() {
  const [open, setOpen] = React.useState(false);
  const { user, profile, loading } = useAuth();
  const isAuthed = !loading && !!user;
  const displayName = profile?.display_name || profile?.username || user?.email || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.marketing.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthed ? (
            <>
              <Button size="sm" asChild>
                <Link href="/builder">Dashboard</Link>
              </Button>
              <UserAvatar name={displayName} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle navigation menu"
            >
              <HamburgerMenuIcon className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="text-left text-lg font-bold">{SITE_NAME}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 px-4">
              {NAV_ITEMS.marketing.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              {isAuthed ? (
                <Button size="sm" asChild>
                  <Link href="/builder" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <Button size="sm" asChild>
                    <Link href="/signup" onClick={() => setOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
