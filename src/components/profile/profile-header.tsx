import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/types/marketplace";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar size="lg">
        {profile.avatar_url && (
          <AvatarImage src={profile.avatar_url} alt={profile.display_name || ""} />
        )}
        <AvatarFallback>
          {(profile.display_name || profile.username || "U")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          {profile.display_name || profile.username || "Unknown"}
        </h1>
        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}
        {profile.github_username && (
          <Link
            href={`https://github.com/${profile.github_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <GitHubLogoIcon className="size-3.5" />
            {profile.github_username}
          </Link>
        )}
      </div>
    </div>
  );
}
