"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mcpServerFormSchema, type McpServerFormValues } from "@/validations/mcp-server";
import type { McpServer } from "@/types/config";

interface McpServerFormProps {
  initial?: McpServer;
  onSubmit: (server: McpServer) => void;
  onCancel: () => void;
}

export function McpServerForm({ initial, onSubmit, onCancel }: McpServerFormProps) {
  const envPairs = initial?.env
    ? Object.entries(initial.env).map(([key, value]) => ({ key, value }))
    : [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<McpServerFormValues>({
    resolver: zodResolver(mcpServerFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      type: initial?.type ?? "stdio",
      command: initial?.command ?? "",
      args: initial?.args?.join(", ") ?? "",
      url: initial?.url ?? "",
      env: envPairs,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "env",
  });

  const serverType = watch("type");

  const handleFormSubmit = (data: McpServerFormValues) => {
    const envMap: Record<string, string> = {};
    data.env?.forEach((pair) => {
      if (pair.key.trim()) {
        envMap[pair.key.trim()] = pair.value;
      }
    });

    const server: McpServer = {
      name: data.name,
      type: data.type,
      enabled: true,
      ...(data.type === "stdio" && {
        command: data.command,
        args: data.args
          ? data.args
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : undefined,
      }),
      ...(data.type !== "stdio" && { url: data.url }),
      ...(Object.keys(envMap).length > 0 && { env: envMap }),
    };

    onSubmit(server);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="server-name">Name</Label>
          <Input id="server-name" {...register("name")} placeholder="my-server" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="server-type">Type</Label>
          <Select
            value={serverType}
            onValueChange={(v) => setValue("type", v as McpServerFormValues["type"])}
          >
            <SelectTrigger id="server-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stdio">stdio</SelectItem>
              <SelectItem value="sse">SSE</SelectItem>
              <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {serverType === "stdio" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="server-command">Command</Label>
            <Input id="server-command" {...register("command")} placeholder="npx" />
            {errors.command && <p className="text-xs text-destructive">{errors.command.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="server-args">Args (comma-separated)</Label>
            <Input
              id="server-args"
              {...register("args")}
              placeholder="-y, @modelcontextprotocol/server"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="server-url">URL</Label>
          <Input id="server-url" {...register("url")} placeholder="https://example.com/mcp" />
          {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Environment Variables</Label>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => append({ key: "", value: "" })}
          >
            <PlusIcon />
            Add
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input {...register(`env.${index}.key`)} placeholder="KEY" className="flex-1" />
            <Input {...register(`env.${index}.value`)} placeholder="value" className="flex-1" />
            <Button type="button" variant="ghost" size="icon-xs" onClick={() => remove(index)}>
              <Cross2Icon />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" size="sm">
          {initial ? "Update" : "Add"} Server
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
