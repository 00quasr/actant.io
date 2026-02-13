"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: string, id: string) => void;
}

const TEMPLATES = [
  {
    id: "frontend-react",
    name: "Frontend (React/Next.js)",
    description: "Best practices for React and Next.js development",
    content: `## Project
Stack: Next.js (App Router), TypeScript, Tailwind CSS

## Code Style
- TypeScript strict mode, no \`any\`
- Functional components with named exports
- Tailwind for all styling, no CSS modules
- Use server components by default, \`"use client"\` only when needed
- Prefer \`const\` arrow functions for utilities

## Patterns
- Co-locate components with their pages
- Use Zod for all validation
- Prefer server actions over API routes
- Use \`loading.tsx\` and \`error.tsx\` for route-level states

## Testing
- Prefer integration tests with Testing Library
- Test behavior, not implementation details
`,
  },
  {
    id: "backend-node",
    name: "Backend (Node/Express)",
    description: "Node.js backend development guidelines",
    content: `## Project
Stack: Node.js, TypeScript, Express/Fastify

## Code Style
- TypeScript strict mode
- Use dependency injection
- Async/await over callbacks
- Structured error handling with custom error classes

## Patterns
- Controller -> Service -> Repository layers
- Validate all inputs at the boundary with Zod
- Use middleware for auth and error handling
- Log structured JSON, never console.log

## Testing
- Unit test services with mocked dependencies
- Integration test API endpoints
- Use factories for test data
`,
  },
  {
    id: "fullstack",
    name: "Full Stack",
    description: "Complete full-stack development configuration",
    content: `## Project
Stack: Next.js, TypeScript, Supabase, Tailwind CSS

## Code Style
- TypeScript strict mode, no \`any\`
- Named exports everywhere
- Functional components
- Tailwind for styling

## Frontend
- Server components by default
- Client components only for interactivity
- Use Zod for form validation
- Optimistic UI updates

## Backend
- Use server actions for mutations
- API routes only for webhooks and external integrations
- Row Level Security on all tables
- Type-safe database queries

## Git
- Conventional commits: type(scope): message
- Feature branches off main
`,
  },
  {
    id: "general",
    name: "General",
    description: "General-purpose coding assistant configuration",
    content: `## Code Style
- Write clean, readable code
- Meaningful variable and function names
- Small, focused functions
- DRY but not prematurely abstracted

## Principles
- KISS: Keep it simple
- YAGNI: Don't build what you don't need
- Favor composition over inheritance
- Write tests for critical paths

## Communication
- Explain changes before making them
- Ask clarifying questions when requirements are ambiguous
- Suggest simpler alternatives when appropriate
`,
  },
];

export function TemplatePicker({ open, onOpenChange, onSelect }: TemplatePickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            Start with a template and customize it for your project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              className="w-full text-left rounded-lg border p-4 hover:bg-accent transition-colors"
              onClick={() => onSelect(template.content, template.id)}
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {template.description}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
