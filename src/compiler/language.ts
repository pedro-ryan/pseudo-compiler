import { parser } from "@/compiler/parser";
import {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { SyntaxNode, SyntaxNodeRef } from "@lezer/common";
import { styleTags, tags as t } from "@lezer/highlight";

function isCompletionContext(
  context: SyntaxNode | CompletionContext
): context is CompletionContext {
  return (context as CompletionContext).pos !== undefined;
}

function getBefore(context: SyntaxNode | CompletionContext) {
  if (isCompletionContext(context)) {
    return syntaxTree(context.state).resolveInner(context.pos, -1);
  }
  return context.resolveInner(context.from, -1);
}

function AutoComplete(context: CompletionContext): CompletionResult | null {
  const nodeBefore = getBefore(context);
  const actualNode = syntaxTree(context.state).resolveInner(context.pos, 0);
  const word = context.matchBefore(/\w*/);

  console.log(word);
  console.log(actualNode.name);

  if (!word || (word.from == word.to && !context.explicit)) return null;

  let options: Completion[] = [];

  if (
    nodeBefore.name === "AlgorithmFile" ||
    (word.text && "Algoritmo".includes(word.text))
  ) {
    options.push({
      label: "Algoritmo",
      type: "keyword",
      info: "Palavra-chave utilizada para iniciar a estrutura de um algoritmo deve ser precedia de um nome em snake_case, por exemplo: Algoritmo exemplo_de_nome",
    });
  }

  if (actualNode.name === "BlockAlgoritmo") {
    options = [
      {
        label: "Escreva",
      },
    ];
  }

  if (
    actualNode.name !== "BlockAlgoritmo" &&
    (nodeBefore.name === "AlgoritmoDeclaration" ||
      getBefore(nodeBefore).name === "AlgoritmoDeclaration")
  ) {
    options = options.concat([
      {
        label: "Inicio",
        type: "keyword",
      },
      {
        label: "Fim",
        type: "keyword",
      },
      {
        label: "Var",
        type: "keyword",
      },
      {
        label: "Bloco Algoritmo",
        type: "text",
        apply: "Inicio\n\nFim",
      },
    ]);
  }

  return {
    from: word.from,
    options,
  };
}

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
      autocomplete: AutoComplete,
    },
  }),
);

export { AlgorithmLanguage };
