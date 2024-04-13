import { Ast, AstValue, Token } from "@/compiler/interfaces";

interface Parser<T extends AstValue | void = AstValue | void> {
  (
    this: {
      setPath: (newPath: (string | number)[]) => void;
      getPath: () => (string | number)[];
      getAST: () => Ast;
    } | void,
    tokens: Token[],
    current: Token
  ): T;
}

const Parsers: Record<string, Parser> = {};

export function registerParser(identifier: string, parser: Parser) {
  Parsers[identifier] = parser;
}

export function getParser<T extends AstValue | void>(
  identifier: string | number
): Parser<T> {
  const parser = Parsers[identifier];

  if (!parser) {
    throw (
      '"' +
      identifier +
      '"' +
      " não é uma palavra chave, verifique a ortografia"
    );
  }

  return parser as Parser<T>;
}
