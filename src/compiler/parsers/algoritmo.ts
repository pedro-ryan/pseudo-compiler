import { GenericAst, Token } from "@/compiler/interfaces";
import { registerParser } from "@/compiler/parsers";
import { getString } from "@/compiler/parsers/utils";

registerParser("algoritmo", (tokens) => {
  const identifier = getString(tokens, "algoritmo");

  return {
    type: "FunctionDeclaration",
    name: "algoritmo",
    identifier: identifier,
    body: [],
  };
});

registerParser("Algoritmo", (tokens) => {
  let identifier: Token;

  let next = tokens[0];

  if (next.type == "Word") {
    identifier = tokens.shift()!;

    next = tokens[0]; // update the new next
    if (next && next.type !== "NewLine" && next.type !== "Indentation") {
      throw "Algoritmo espera apenas uma palavra como argumento, ou seja não deve ter espaços no nome, utilize o padrão snake_case, onde ao invés de espaços utilizamos underline ( _ )";
    }
  } else {
    throw "Algoritmo espera uma palavra como argumento, adicione um nome após a palavra Algoritmo";
  }

  return {
    type: "FunctionDeclaration",
    name: "Algoritmo",
    identifier: identifier as GenericAst<"Word">,
    body: [],
  };
});

registerParser("Inicio", function () {
  if (!this) return;
  const path = this.getPath();
  const AST = this.getAST();

  this.setPath(path.concat(AST.length - 1, "body"));
});

registerParser("Fim", function () {
  if (!this) return;
  const path = this.getPath();

  this.setPath(path.slice(0, -2));
});
