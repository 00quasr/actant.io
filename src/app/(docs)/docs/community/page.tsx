import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community - Actant Docs",
  description:
    "Community guidelines for the Actant marketplace. How to publish, review, version, and share agent configurations.",
};

export default function CommunityPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Community</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        The Actant marketplace is where you discover, share, and build on
        agent configurations created by the community. Whether you are
        publishing your own config or installing one from another developer,
        these guidelines help maintain quality and trust.
      </p>

      {/* ── Publishing Configurations ────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Publishing Configurations
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        To publish a configuration to the marketplace, you need an Actant
        account and a saved configuration in the builder. The publishing
        process:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Open an existing configuration in the Builder or create a new one.</li>
        <li>
          Click{" "}
          <span className="text-foreground font-medium">Publish</span> to
          open the publishing dialog.
        </li>
        <li>
          Fill in the required metadata: title, description, target agent,
          tags, and category.
        </li>
        <li>Review the preview to ensure the listing looks correct.</li>
        <li>Submit for publishing. The configuration appears immediately on the marketplace.</li>
      </ol>

      <h3 className="text-base font-semibold mt-6 mb-2">Writing a Good Listing</h3>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Your listing is the first thing potential users see. Make it count:
      </p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Title:</span> Be
          specific. &ldquo;Next.js 14 + Supabase + Tailwind Config&rdquo; is
          better than &ldquo;My Project Config.&rdquo;
        </li>
        <li>
          <span className="text-foreground font-medium">Description:</span>{" "}
          Explain what the config does, which stack it targets, and what makes
          it useful. Mention any MCP servers or skills included.
        </li>
        <li>
          <span className="text-foreground font-medium">Tags:</span> Use
          technology-specific tags (nextjs, supabase, tailwind, typescript).
          Users search by tags, so accurate tagging improves discoverability.
        </li>
        <li>
          <span className="text-foreground font-medium">Category:</span> Choose
          the most relevant category. Common categories: Frontend, Backend,
          Full Stack, DevOps, Testing, Documentation.
        </li>
      </ul>

      {/* ── Versioning ───────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Versioning Configurations
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Configurations evolve as your project and tools change. Actant tracks
        versions so users can see update history and choose which version to
        install.
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Update regularly.</span>{" "}
          When you change your project&apos;s conventions or stack, update the
          published configuration to match. Stale configurations lead to poor
          results.
        </li>
        <li>
          <span className="text-foreground font-medium">Document changes.</span>{" "}
          When updating a published config, add a brief changelog note
          describing what changed and why.
        </li>
        <li>
          <span className="text-foreground font-medium">Test before updating.</span>{" "}
          Always test your updated configuration with the target agent before
          republishing. Verify that the agent follows the new rules correctly.
        </li>
        <li>
          <span className="text-foreground font-medium">Avoid breaking changes.</span>{" "}
          If you need to make a fundamentally different configuration, consider
          publishing it as a separate listing rather than changing the existing
          one.
        </li>
      </ul>

      {/* ── Rating and Reviews ───────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Rating and Reviewing
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Reviews help the community identify high-quality configurations and
        give authors feedback to improve. When reviewing:
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Be constructive.</span>{" "}
          Explain what works well and what could be improved. &ldquo;The
          TypeScript rules are thorough but the testing section is thin&rdquo;
          is more helpful than a one-star rating with no comment.
        </li>
        <li>
          <span className="text-foreground font-medium">Mention your use case.</span>{" "}
          State which agent you tested with and what kind of project you used
          it for. A configuration might work great for Cursor but poorly for
          Cline.
        </li>
        <li>
          <span className="text-foreground font-medium">Rate fairly.</span>{" "}
          A configuration that works well for its stated purpose deserves a
          high rating even if it does not cover your specific edge case.
        </li>
        <li>
          <span className="text-foreground font-medium">Update your review.</span>{" "}
          If the author improves the configuration based on your feedback,
          consider updating your rating to reflect the improvement.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">Rating Guidelines</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Stars</th>
              <th className="text-left p-3 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="p-3">5</td>
              <td className="p-3">Excellent. Comprehensive, well-organized, immediately useful. Covers the stated stack thoroughly.</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">4</td>
              <td className="p-3">Good. Works well with minor gaps or areas for improvement.</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">3</td>
              <td className="p-3">Adequate. Functional but could use more detail or better organization.</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">2</td>
              <td className="p-3">Below average. Missing important conventions, outdated information, or poor structure.</td>
            </tr>
            <tr>
              <td className="p-3">1</td>
              <td className="p-3">Poor. Does not work as described, contains incorrect information, or is largely empty.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Marketplace Etiquette ─────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Marketplace Etiquette
      </h2>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Do not publish duplicates.</span>{" "}
          Before publishing, search the marketplace for similar configurations.
          If one already exists, consider forking and improving it rather than
          creating a near-identical listing.
        </li>
        <li>
          <span className="text-foreground font-medium">Do not include secrets.</span>{" "}
          Never publish configurations containing real API keys, tokens, or
          credentials. Use placeholder values with clear labels like{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            your_token_here
          </code>.
        </li>
        <li>
          <span className="text-foreground font-medium">Credit your sources.</span>{" "}
          If your configuration is based on or inspired by another
          community member&apos;s work, acknowledge it in the description.
        </li>
        <li>
          <span className="text-foreground font-medium">Respond to feedback.</span>{" "}
          If users leave reviews with suggestions, engage constructively.
          Iterate on your configuration based on real-world usage feedback.
        </li>
        <li>
          <span className="text-foreground font-medium">Keep titles and descriptions honest.</span>{" "}
          Do not claim support for features or agents that the config does not
          actually cover.
        </li>
      </ul>

      {/* ── Writing Good Instructions ────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Writing High-Quality Instructions
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        The quality of shared configurations reflects on the entire community.
        Here are guidelines that consistently produce high-quality results:
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Be specific about your stack.</span>{" "}
          Mention exact versions: &ldquo;Next.js 14.2 with App Router&rdquo;
          not just &ldquo;React.&rdquo; Name key libraries: &ldquo;Zod for
          validation, Vitest for testing, Tailwind CSS with shadcn/ui
          components.&rdquo;
        </li>
        <li>
          <span className="text-foreground font-medium">Use imperative, direct language.</span>{" "}
          Write &ldquo;Use TypeScript strict mode&rdquo; not &ldquo;We
          generally prefer TypeScript strict mode.&rdquo; Agents follow direct
          instructions more reliably.
        </li>
        <li>
          <span className="text-foreground font-medium">Organize by concern.</span>{" "}
          Group related rules under clear headings: Code Style, Testing,
          Database, Git Workflow, API Conventions. This helps both the agent and
          human readers.
        </li>
        <li>
          <span className="text-foreground font-medium">Include shell commands.</span>{" "}
          List the actual dev, build, test, lint, and typecheck commands.
          Agents use these to verify their work.
        </li>
        <li>
          <span className="text-foreground font-medium">Provide examples.</span>{" "}
          A short code snippet of the correct pattern communicates more than a
          paragraph of description. Show the ideal component structure, API
          route, or test file.
        </li>
        <li>
          <span className="text-foreground font-medium">State prohibitions explicitly.</span>{" "}
          &ldquo;Never use CSS modules&rdquo; and &ldquo;Do not use default
          exports except for pages&rdquo; are as valuable as positive
          instructions.
        </li>
        <li>
          <span className="text-foreground font-medium">Test before publishing.</span>{" "}
          Use the configuration with the target agent on a real project. Ask the
          agent to create a component, write a test, or fix a bug. Verify it
          follows your rules.
        </li>
      </ul>

      {/* ── Writing Good Rules ───────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Writing Good Rules
      </h2>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Scope rules tightly.</span>{" "}
          A rule targeting{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            src/components/**/*.tsx
          </code>{" "}
          is more precise than one applying to all .tsx files. For agents that
          support glob scoping (Cursor), take advantage of it.
        </li>
        <li>
          <span className="text-foreground font-medium">One concern per rule.</span>{" "}
          Separate styling rules from testing rules from database rules. This
          makes individual rules easier to understand and maintain.
        </li>
        <li>
          <span className="text-foreground font-medium">Include examples in each rule.</span>{" "}
          Show a short code snippet of the correct pattern. The agent sees the
          rule content directly, so examples embedded in the rule are more
          effective than external references.
        </li>
        <li>
          <span className="text-foreground font-medium">Avoid contradictions.</span>{" "}
          Review all your rules together to ensure they do not conflict. A rule
          that says &ldquo;use Server Components&rdquo; should not coexist with
          one that says &ldquo;always use useState for data.&rdquo;
        </li>
      </ul>

      {/* ── Reporting Issues ─────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Reporting Issues
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        If you find a configuration that contains incorrect information,
        security issues (exposed credentials), or violates community
        guidelines, you can report it:
      </p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Use the{" "}
          <span className="text-foreground font-medium">Report</span> button
          on the configuration listing page.
        </li>
        <li>
          Select a reason: inaccurate content, exposed secrets, spam/duplicate,
          or other.
        </li>
        <li>Provide a brief description of the issue.</li>
        <li>
          Reports are reviewed by the Actant team. Configurations with confirmed
          issues are flagged or removed.
        </li>
      </ul>

      {/* ── Contributing to Actant ────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Contributing to Actant
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Actant is open source. Beyond sharing configurations, you can
        contribute to the platform itself:
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Bug reports:</span>{" "}
          Open an issue on{" "}
          <Link
            href="https://github.com/keanuklestil/actant.io"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            GitHub
          </Link>{" "}
          with steps to reproduce the issue.
        </li>
        <li>
          <span className="text-foreground font-medium">Feature requests:</span>{" "}
          Open an issue describing the feature and its use case. Include
          examples if possible.
        </li>
        <li>
          <span className="text-foreground font-medium">Code contributions:</span>{" "}
          Fork the repository, create a feature branch, and submit a pull
          request. Follow the existing code style (TypeScript strict, named
          exports, Tailwind CSS).
        </li>
        <li>
          <span className="text-foreground font-medium">Documentation:</span>{" "}
          Improvements to documentation are always welcome. Fix typos, add
          examples, or clarify confusing sections.
        </li>
      </ul>

      <p className="mt-8 text-sm text-muted-foreground">
        See also:{" "}
        <Link
          href="/docs/getting-started"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Getting Started
        </Link>
        {" | "}
        <Link
          href="/docs/agents/claude-code"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Claude Code
        </Link>
      </p>
    </article>
  );
}
