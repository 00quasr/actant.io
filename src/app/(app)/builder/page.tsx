import { BuilderShell } from "@/components/builder/builder-shell";

export const metadata = {
  title: "New Config - Actant",
};

export default function BuilderPage() {
  return (
    <div className="h-full">
      <BuilderShell />
    </div>
  );
}
