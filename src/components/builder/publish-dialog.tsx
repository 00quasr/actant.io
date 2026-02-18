"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cross2Icon, PlusIcon, Share2Icon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USE_CASE_LABELS, type UseCase } from "@/types/config";
import { listingSchema, type ListingInput } from "@/validations/listing";
import { publishConfig } from "@/services/marketplace";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId: string | null;
  configName: string;
  configDescription: string;
}

export function PublishDialog({
  open,
  onOpenChange,
  configId,
  configName,
  configDescription,
}: PublishDialogProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      config_id: configId ?? "",
      title: configName,
      description: configDescription,
      use_case: "general",
      tags: [],
    },
  });

  const tags = form.watch("tags");

  function handleAddTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.length >= 5) return;
    if (tags.includes(trimmed)) return;
    form.setValue("tags", [...tags, trimmed], { shouldValidate: true });
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    form.setValue(
      "tags",
      tags.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }

  async function handleSubmit(values: ListingInput) {
    if (!configId) return;
    setPublishing(true);
    try {
      const listing = await publishConfig(configId, {
        title: values.title,
        description: values.description,
        use_case: values.use_case,
        tags: values.tags,
      });
      setListingId(listing.id);
      setPublished(true);
      toast.success("Config published to marketplace");
    } catch {
      toast.error("Failed to publish config");
    } finally {
      setPublishing(false);
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      setPublished(false);
      setListingId(null);
      setTagInput("");
    }
    onOpenChange(open);
  }

  if (published) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Published</DialogTitle>
            <DialogDescription>Your config is now live on the marketplace.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button asChild variant="default" size="sm">
              <a href={`/marketplace/${listingId}`}>View in Marketplace</a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish to Marketplace</DialogTitle>
          <DialogDescription>Share your config with the community.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Config title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what this config does..."
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="use_case"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Use Case</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.entries(USE_CASE_LABELS) as [UseCase, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags (max 5)</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag..."
                      disabled={tags.length >= 5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddTag}
                      disabled={tags.length >= 5 || !tagInput.trim()}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-0.5 rounded-sm hover:text-foreground"
                          >
                            <Cross2Icon className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={publishing}>
                <Share2Icon />
                {publishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
