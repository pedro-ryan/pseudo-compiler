import { generator } from "@/compiler/generator";
import { transform } from "@/compiler/transform";
import { ConsoleStore } from "@/stores/console";
import { lexer, parser } from "./parser";
import "./parsers/loadParsers";

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

export function compile(code: string) {
  return generator(transform(parser(lexer(code))));
}
