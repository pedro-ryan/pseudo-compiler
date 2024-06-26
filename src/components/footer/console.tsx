import { cn } from "@/lib/utils";
import { ConsoleStore } from "@/stores/console";

function PromptInput() {
  const respond = ConsoleStore((state) => state.prompt.respond);

  return (
    <div
      ref={(ref) => ref?.focus()}
      contentEditable
      className="inline outline-none "
      onKeyDown={(ev) => {
        if (ev.key === "Enter") {
          respond(ev.currentTarget.innerText);
          ev.preventDefault();
          return;
        }
      }}
    />
  );
}

export function Console() {
  const [logs, waiting, modified] = ConsoleStore((state) => [
    state.logs,
    state.prompt.waiting,
    state.logs.slice(-1)[0]?.modified,
  ]);

  return (
    <div className="bg-muted h-[50vh] transition-all p-4 overflow-auto">
      {logs.map((log, index, { length }) => {
        return (
          <p
            key={`${index}_${new Date().getTime()}`}
            className={cn(log.type === "error" && "text-destructive")}
          >
            {log.value.replace(/( )$/, "\u00A0") || "\u00A0"}
            {waiting && length - 1 === index && !modified ? (
              <PromptInput />
            ) : (
              ""
            )}
          </p>
        );
      })}
      {(!logs.length || modified) && waiting ? <PromptInput /> : null}
    </div>
  );
}
