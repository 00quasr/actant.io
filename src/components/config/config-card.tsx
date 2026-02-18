import Link from "next/link";
import { DownloadIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AgentBadge } from "@/components/config/agent-badge";
import { RatingStars } from "@/components/config/rating-stars";
import type { Listing } from "@/types/marketplace";

interface ConfigCardProps {
  listing: Listing;
}

export function ConfigCard({ listing }: ConfigCardProps) {
  return (
    <Link href={`/marketplace/${listing.id}`}>
      <Card className="h-full transition-colors hover:border-foreground/20">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm">{listing.title}</CardTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <AgentBadge agent={listing.target_agent} />
            </div>
          </div>
          <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <RatingStars rating={listing.avg_rating} size="sm" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DownloadIcon className="size-3" />
              <span>{listing.download_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
