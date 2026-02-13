import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community - Actant Docs",
  description:
    "Community guidelines for sharing agent configurations on the Actant marketplace.",
};

export default function CommunityPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Community</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        The Actant marketplace lets you share and discover agent configurations.
        Follow these guidelines to create configurations that are useful for
        others.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">
        Sharing Configurations
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        When publishing a configuration to the marketplace, include a clear
        title and description so others can quickly understand what it does and
        which stack it targets.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">
        Writing Good Instructions
      </h2>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Be specific about your stack. Mention frameworks, languages, and key
          libraries by name.
        </li>
        <li>
          Keep instructions actionable. Use imperative language like
          &ldquo;Use TypeScript strict mode&rdquo; rather than vague statements.
        </li>
        <li>
          Organize by concern. Group related rules under clear headings
          (code style, testing, git workflow).
        </li>
        <li>
          Include commands. List the actual build, test, and lint commands for
          your project.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-10 mb-4">
        Writing Good Rules
      </h2>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Scope rules tightly. A rule that targets{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            src/components/**/*.tsx
          </code>{" "}
          is more useful than one that applies everywhere.
        </li>
        <li>
          One concern per rule. Separate styling rules from testing rules for
          clarity.
        </li>
        <li>
          Provide examples. Short code snippets showing the preferred pattern
          help agents understand your intent.
        </li>
        <li>
          Avoid contradictions. Review your rules to ensure they do not conflict
          with each other.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-10 mb-4">Best Practices</h2>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Test your configuration with the target agent before publishing.
        </li>
        <li>
          Use descriptive tags so your configuration appears in relevant
          searches.
        </li>
        <li>
          Update your configuration when your project evolves. Stale
          configurations lead to poor results.
        </li>
        <li>
          Respond to feedback. If users report issues, iterate on your
          configuration.
        </li>
      </ul>
    </article>
  );
}
