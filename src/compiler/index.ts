import { generator } from "@/compiler/generator";
import { transform } from "@/compiler/transform";
import { lexer, parser } from "./parser";
import "./parsers/loadParsers";

export const Logger = (log: unknown) => {
  if (typeof log === "object") {
    console.log(JSON.stringify(log, null, 2));
  } else {
    console.log(log);
  }
  // TODO log in integrated console
};

export function runner(code: string) {
  const codeRunner = new Function(code);
  codeRunner.call({ Logger });
}

export function compile(code: string) {
  return generator(transform(parser(lexer(code))));
}
