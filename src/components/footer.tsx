import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Footer() {
  return (
    <Collapsible
      className="transition-all ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:slide-in-from-bottom"
      style={{ "--tw-exit-translate-y": "93%" } as React.CSSProperties}
    >
      <div className="h-7 bg-primary flex justify-center items-center">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="text-white h-5 w-2/3 bg-secondary">
            <div>Console</div>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="transition-all ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=closed]:slide-out-to-bottom">
        <div className="bg-muted h-[50vh] transition-all p-4 overflow-auto">
          <p className="text-destructive">
            Uncaught Error: React.Children.only expected to receive a single
            React element child.
          </p>
          <p>Random</p>
          <p>Random</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
