"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Pencil2Icon,
  MagnifyingGlassIcon,
  PersonIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Pencil2Icon,
  MagnifyingGlassIcon,
  PersonIcon,
};

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.app.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-lg font-semibold tracking-tight"
        >
          Actant
        </Link>
      </div>
      <div className="flex-1 px-3">
        <NavItems onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function SidebarNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-60 shrink-0 border-r md:block" aria-label="Main navigation">
        <SidebarContent />
      </aside>

      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 flex h-14 w-full items-center border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle navigation menu">
              <HamburgerMenuIcon className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/" className="ml-3 text-lg font-semibold tracking-tight">
          Actant
        </Link>
      </div>
    </>
  );
}
