import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentBadge } from "@/components/config/agent-badge";
import { USE_CASE_LABELS, type UseCase } from "@/types/config";
import type { Template } from "@/types/marketplace";

export const metadata = {
  title: "Templates",
};

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card className="flex h-full flex-col transition-colors hover:border-foreground/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm">{template.name}</CardTitle>
          <AgentBadge agent={template.target_agent} />
        </div>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {USE_CASE_LABELS[template.use_case as UseCase] ?? template.use_case}
          </Badge>
          {template.is_featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/builder?template=${template.id}`}>Use</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function TemplatesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("templates")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  const templates = (data as Template[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Start with a pre-built configuration for your stack
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">No templates available yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
