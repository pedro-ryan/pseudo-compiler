import { parser } from "@/compiler/parser";
import { styleTags, tags as t } from "@lezer/highlight";

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      LineComment: t.lineComment,
      Algoritmo: t.keyword, // Palavras-chave
      "Inicio Fim": t.brace,
      Identifier: t.variableName, // Nomes de algoritmos e variáveis
      StringLiteral: t.string, // Strings
    }),
  ],
});

const AlgorithmLanguage = new LanguageSupport(
  LRLanguage.define({
    name: "Algorithm",
    parser: parserWithMetadata,
    languageData: {
      commentTokens: { line: "//" },
    },
  }),
);

export { AlgorithmLanguage };
