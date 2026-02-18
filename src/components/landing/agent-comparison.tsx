import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const AGENTS = ["Claude Code", "Cursor", "Windsurf", "Cline", "OpenCode"] as const;

const FEATURES: Record<string, Record<(typeof AGENTS)[number], boolean>> = {
  Instructions: {
    "Claude Code": true,
    Cursor: true,
    Windsurf: true,
    Cline: true,
    OpenCode: true,
  },
  Rules: {
    "Claude Code": true,
    Cursor: true,
    Windsurf: true,
    Cline: true,
    OpenCode: false,
  },
  "MCP Servers": {
    "Claude Code": true,
    Cursor: true,
    Windsurf: false,
    Cline: true,
    OpenCode: true,
  },
  Permissions: {
    "Claude Code": true,
    Cursor: false,
    Windsurf: false,
    Cline: false,
    OpenCode: true,
  },
  Skills: {
    "Claude Code": true,
    Cursor: false,
    Windsurf: false,
    Cline: false,
    OpenCode: false,
  },
};

export function AgentComparison() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Comparison
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Feature support by agent
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Not every agent supports every feature. Actant handles the differences so you don&apos;t
            have to.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mt-10 rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Feature
                    </th>
                    {AGENTS.map((agent) => (
                      <th
                        key={agent}
                        className="px-2 py-3 text-center text-xs font-medium text-muted-foreground"
                      >
                        {agent}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(FEATURES).map(([feature, support]) => (
                    <tr
                      key={feature}
                      className="border-b last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-sm font-medium">{feature}</td>
                      {AGENTS.map((agent) => (
                        <td key={agent} className="px-2 py-3 text-center">
                          {support[agent] ? (
                            <CheckIcon className="mx-auto size-4 text-foreground" />
                          ) : (
                            <Cross2Icon className="mx-auto size-3.5 text-muted-foreground/30" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
