import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Windsurf - Actant Docs",
  description:
    "Learn how to configure Windsurf with Actant. Understand .windsurfrules and the rules directory format.",
};

export default function WindsurfPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Windsurf</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Windsurf (by Codeium) is an AI-powered editor that reads project
        configuration from a rules file and a rules directory.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">Generated Files</h2>

      <h3 className="text-base font-semibold mt-6 mb-2">.windsurfrules</h3>
      <p className="text-muted-foreground mb-3">
        The primary instructions file at project root. Contains your project
        conventions and coding guidelines.
      </p>
      <div className="bg-muted rounded-lg p-4 text-sm">
        <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">
          Note: .windsurfrules has a 6,000 character limit.
        </p>
        <p className="text-muted-foreground">
          Actant will warn you if your configuration exceeds this limit during
          export. Consider moving detailed rules to the rules directory.
        </p>
      </div>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mt-4">
        <code>{`You are an expert in TypeScript and Next.js.

# Code Style
- TypeScript strict mode
- Named exports for components
- Tailwind CSS for styling

# Project Structure
- Pages in src/app/
- Components in src/components/
- Utilities in src/lib/`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">
        .windsurf/rules/rules.md
      </h3>
      <p className="text-muted-foreground mb-3">
        Additional rules that extend the base configuration. This file does not
        have the same character limit and is ideal for more detailed guidelines.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">How to Use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder.</li>
        <li>Extract the files into your project root directory.</li>
        <li>
          Open the project in Windsurf. The rules are loaded automatically.
        </li>
      </ol>
    </article>
  );
}
