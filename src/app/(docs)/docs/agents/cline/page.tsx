import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cline - Actant Docs",
  description:
    "Learn how to configure Cline with Actant. Understand the .clinerules directory and numbered rule files.",
};

export default function ClinePage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Cline</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Cline is an AI coding assistant that runs as a VS Code extension. It
        reads project rules from a dedicated directory of numbered markdown
        files.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">Generated Files</h2>

      <h3 className="text-base font-semibold mt-6 mb-2">
        .clinerules/
      </h3>
      <p className="text-muted-foreground mb-3">
        A directory containing numbered markdown files. Each file represents a
        distinct set of rules. Cline loads them in numerical order.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`.clinerules/
  01-project-overview.md
  02-code-style.md
  03-testing.md
  04-git-workflow.md`}</code>
      </pre>

      <p className="text-muted-foreground mt-4 mb-3">
        Each file is a plain markdown document:
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Code Style

- Use TypeScript strict mode
- Functional components only
- Named exports
- Tailwind CSS for styling
- Zod for validation schemas`}</code>
      </pre>

      <h2 className="text-xl font-semibold mt-10 mb-4">Format</h2>
      <p className="text-muted-foreground leading-relaxed">
        Files are prefixed with a two-digit number to control ordering. Use
        descriptive names after the number to keep the directory organized.
        Cline reads all markdown files in the directory and applies them as
        context.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">How to Use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder.</li>
        <li>
          Extract the{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            .clinerules/
          </code>{" "}
          directory into your project root.
        </li>
        <li>Open the project in VS Code with the Cline extension installed.</li>
      </ol>
    </article>
  );
}
