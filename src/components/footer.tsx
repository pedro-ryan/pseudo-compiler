import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConsoleStore } from "@/stores/console";

export function Footer() {
  const [logs, open, onOpenChange] = ConsoleStore((state) => [
    state.logs,
    state.opened,
    state.onOpenChange,
  ]);

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
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
          {logs.map((log) => {
            return (
              <p className={log.type === "error" ? "text-destructive" : ""}>
                {log.value}
              </p>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
