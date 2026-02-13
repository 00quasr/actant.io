"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/services/favorites";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited?: boolean;
}

export function FavoriteButton({ listingId, initialFavorited = false }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const result = await toggleFavorite(listingId);
      setFavorited(result);
      toast.success(result ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      {favorited ? (
        <HeartFilledIcon className="size-4" />
      ) : (
        <HeartIcon className="size-4" />
      )}
    </Button>
  );
}
