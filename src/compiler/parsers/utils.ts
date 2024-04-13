import { AstValue, GenericAst, Token } from "@/compiler/interfaces";
import { getParser } from "@/compiler/parsers";

export function getString<T extends AstValue = GenericAst<"String">>(
  tokens: Token[],
  expression: string
) {
  let arg;
  const next = tokens[0];

  if (next.type === "Quote") {
    const current = tokens.shift()!;
    const getQuote = getParser<T>("Quote");
    const quote = getQuote(tokens, current);
    if (!quote) {
      throw 'Não foi possível identificar o final do texto, verifique se você fechou o texto com "';
    }
    if (quote.type !== "String") {
      throw `Atualmente a expressão "${expression}" só suporta texto`;
    }
    arg = quote;
  } else {
    throw `a expressão "${expression}" espera um texto entre aspas como argumento, adicione um texto após a palavra "${expression}" entre aspas, por exemplo: ${expression} "Hello World"`;
  }

  return arg;
}
