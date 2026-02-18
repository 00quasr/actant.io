"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ImportButtonProps {
  listingId: string;
}

export function ImportButton({ listingId }: ImportButtonProps) {
  const router = useRouter();

  return (
    <Button onClick={() => router.push(`/builder/import/${listingId}`)}>Use this config</Button>
  );
}
