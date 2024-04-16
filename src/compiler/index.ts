import { ConsoleStore } from "@/stores/console";
export const Logger = (log: unknown) => {
  const { log: Log } = ConsoleStore.getState();
  if (typeof log === "object") {
    const ObjectString = JSON.stringify(log, null, 2);
    Log(ObjectString);
    return console.log(ObjectString);
  }

  Log(String(log));
  console.log(log);
};

export function runner(code: string) {
  const codeRunner = new Function(code);
  codeRunner.call({ Logger });
}
