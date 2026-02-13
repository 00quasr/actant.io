"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useState } from "react";

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6" aria-label="Documentation navigation">
      <Link
        href="/docs/getting-started"
        className="text-sm font-semibold tracking-tight"
        onClick={onLinkClick}
      >
        Documentation
      </Link>
      {NAV_ITEMS.docs.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {section.title}
          </span>
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "text-sm py-1 px-2 -mx-2 rounded-md transition-colors",
                pathname === item.href
                  ? "text-foreground font-medium bg-muted"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar() {
  return (
    <aside className="hidden md:block w-56 shrink-0 sticky top-0 h-screen overflow-y-auto py-8 pr-6" aria-label="Documentation navigation">
      <SidebarContent />
    </aside>
  );
}

export function DocsMobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <HamburgerMenuIcon className="size-5" />
          <span className="sr-only">Toggle docs menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-6">
        <SheetTitle className="sr-only">Documentation Navigation</SheetTitle>
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
