import { registerParser } from "@/compiler/parsers";
import { getString } from "@/compiler/parsers/utils";

registerParser("Escreva", (tokens) => {
  const arg = getString(tokens, "Escreva");

  return {
    type: "CallExpression",
    name: "Logger",
    args: [arg],
  };
});
