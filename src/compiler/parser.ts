import { getParser } from "@/compiler/parsers";
import { get, set } from "@/compiler/utils";
import { Ast, Token } from "./interfaces";

export function lexer(code: string): Token[] {
  const replacedTokens = code
    .replace(/[\n\r;]/g, " |NL| ") // NewLine
    .replace(/ {2}|\t/g, " |IND| ") // Indentation
    .replace(/"/g, " |STR| "); // String

  return replacedTokens
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .map((token) => {
      const NumberToken = Number(token);

      switch (true) {
        case isNaN(NumberToken):
          switch (token) {
            case "|NL|":
              return { type: "NewLine" };
            case "|IND|":
              return { type: "Indentation" };
            case "|STR|":
              return { type: "Quote" };
            default:
              return { type: "Word", value: token };
          }
        case Number.isInteger(NumberToken):
          return { type: "Integer", value: NumberToken };
        default:
          return { type: "Float", value: NumberToken };
      }
    });
}

export function parser(tokens: Token[]) {
  const AST: Ast = [];
  let path = [] as (string | number)[];

  const ThisUtils = {
    setPath: (newPath: (string | number)[]) => {
      path = newPath;
    },
    getPath: () => path,
    getAST: () => AST,
  };

  while (tokens.length > 0) {
    const current = tokens.shift();
    if (!current) continue;

    if (
      (current.type == "Word" && typeof current.value == "string") ||
      current.type === "Quote"
    ) {
      const ParserFn = getParser(current.value ?? current.type);

      const parsedToken = ParserFn.call(ThisUtils, tokens, current);

      if (!parsedToken) continue;

      if (path.length > 0) {
        const oldValue = get(AST, path) as Ast;
        const newValue = oldValue.concat(parsedToken);

        set(AST, path, newValue);
      } else {
        AST.push(parsedToken);
      }
    }
  }

  return AST;
}
