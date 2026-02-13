import type { Metadata } from "next";
import Link from "next/link";
import { DocsSidebar, DocsMobileSidebar } from "@/components/layout/docs-sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Actant Docs",
    default: "Documentation | Actant",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-6">
          <DocsMobileSidebar />
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Actant
          </Link>
          <Link
            href="/docs/getting-started"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-5xl px-6">
        <DocsSidebar />
        <main className="min-w-0 flex-1 py-8 md:pl-6 md:border-l">
          <div className="max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
