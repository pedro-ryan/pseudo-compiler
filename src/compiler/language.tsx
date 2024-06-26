import { parser } from "@/compiler/parser";
import {
  Completion,
  CompletionContext,
  CompletionResult,
  snippetCompletion,
} from "@codemirror/autocomplete";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { Diagnostic, linter } from "@codemirror/lint";
import { SyntaxNode, SyntaxNodeRef } from "@lezer/common";
import { styleTags, tags as t } from "@lezer/highlight";
import { getInfo } from "./descriptions";

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
    options.push(
      {
        label: "Algoritmo",
        type: "keyword",
        info: getInfo("Algoritmo"),
      },
      snippetCompletion("Algoritmo ${name}\nVar\n\nInicio\n\nFim", {
        label: "Algoritmo",
        type: "text",
        detail: "Macro",
        info: getInfo("AlgoritmoMacro"),
        boost: 1,
      })
    );
  }

  if (actualNode.name === "BlockAlgoritmo") {
    options = [
      {
        label: "Escreva",
        type: "function",
        info: getInfo("Escreva"),
      },
      {
        label: "Escreval",
        type: "function",
      },
      {
        label: "Leia",
        type: "function",
        info: getInfo("Leia"),
      },
      {
        label: "Limpatela",
        type: "function",
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
        info: getInfo("Inicio"),
      },
      {
        label: "Fim",
        type: "keyword",
        info: getInfo("Fim"),
      },
      {
        label: "Var",
        type: "keyword",
        info: getInfo("Var"),
      },
      {
        label: "Bloco Algoritmo",
        type: "text",
        apply: "Inicio\n\nFim",
        info: getInfo("BlocoAlgoritmo"),
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

  const expression = [
    "String",
    "Number",
    "Float",
    "VariableName",
    "BinaryExpression",
    "UnaryExpression",
    "VetorRef",
  ];

  syntaxTree(view.state)
    .cursor()
    .iterate(
      (node) => {
        // const next = node.node.nextSibling?.name;
        // console.table([
        //   ["last", "Enter", "Next"],
        //   [nodeBefore, node.name, next],
        // ]);
        console.groupCollapsed(`entered: ${node.name}`);

        if (node.name === "AlgoritmoDeclaration") {
          const Identifier = node.node.getChild("Identifier");
          const StringLiteral = node.node.getChild("String");
          // console.log(node.node.lastChild);
          if (!Identifier && !StringLiteral) {
            logError(
              node,
              'A palavra-chave Algoritmo deve ter um identificado após ser chamado ou um texto entre aspas, por exemplo: Algoritmo exemplo ou Algoritmo "Exemplo"',
              { to: 9 }
            );
          }
        }

        if (node.name === "EscrevaStatement") {
          const result = expression.some((v) => !!node.node.getChild(v));
          if (!result) {
            logError(
              node,
              'Para a utilização do Escreva é necessário ter um texto entre aspas ou uma variável após ele, desta forma: Escreva "Hello World!" ou Escreva nome_de_uma_variável'
            );
          }
        }

        // nodeBefore = node.name;
      },
      (node) => {
        console.log(`leave: ${node.name}`);
        console.groupEnd();
      }
    );

  return diagnostics;
});

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      LineComment: t.lineComment,
      "Algoritmo Se Então Fimse Senão Escolha Fimescolha": t.keyword, // Palavras-chave
      "Inicio Fim Var": t.brace,
      "Identifier BooleanLiteral": t.variableName, // Nomes de algoritmos e variáveis
      String: t.string, // Strings
      "Type!": t.typeName,
      Equals: t.definitionOperator,
      ArithOp: t.arithmeticOperator,
      "NÃO E OU": t.logicOperator,
      CompareOp: t.compareOperator,
      "( )": t.paren,
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
