import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocsNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-sm text-muted-foreground">This documentation page doesn&apos;t exist.</p>
        <Button size="sm" asChild>
          <Link href="/docs/getting-started">Back to Docs</Link>
        </Button>
      </div>
    </div>
  );
}
