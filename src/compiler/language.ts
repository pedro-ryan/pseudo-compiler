import { parser } from "@/compiler/parser";
import {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { Diagnostic, linter } from "@codemirror/lint";
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

const Linter = linter((view) => {
  const diagnostics: Diagnostic[] = [];

  const logError = (
    node: SyntaxNodeRef,
    msg: string,
    overwrite?: Partial<Diagnostic>
  ) => {
    diagnostics.push({
      from: node.from,
      to: node.to,
      severity: "error",
      message: "Error: " + msg,
      ...overwrite,
    });
  };

  // let nodeBefore = "";
  let indentation = 0;

  syntaxTree(view.state)
    .cursor()
    .iterate(
      (node) => {
        // const next = node.node.nextSibling?.name;
        // console.table([
        //   ["last", "Enter", "Next"],
        //   [nodeBefore, node.name, next],
        // ]);
        console.log(`${"  ".repeat(indentation)}entered: ${node.name}`);
        indentation += 1;

        if (node.name === "AlgoritmoDeclaration") {
          const Identifier = node.node.getChild("Identifier");
          // console.log(node.node.lastChild);
          if (!Identifier) {
            logError(
              node,
              "A palavra-chave Algoritmo deve ter um identificado após ser chamado, por exemplo: Algoritmo exemplo",
              { to: 9 }
            );
          }
        }

        if (node.name === "EscrevaStatement") {
          const StringLiteral = node.node.getChild("StringLiteral");
          if (!StringLiteral) {
            logError(
              node,
              'Para a utilização do Escreva é necessário ter um texto após ele entre aspas, desta forma: Escreva "Hello World!"'
            );
          }
        }

        // nodeBefore = node.name;
      },
      (node) => {
        indentation -= 1;
        console.log(`${"  ".repeat(indentation)}leave: ${node.name}`);
      }
    );

  return diagnostics;
});

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
  {
    extension: [Linter],
  }
);

export { AlgorithmLanguage };
