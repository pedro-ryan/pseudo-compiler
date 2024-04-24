import {
  expressionParser,
  getExpressions,
} from "@/compiler/definitions/expressions";
import { setGenerator } from "@/compiler/generator/context";
import { ForStatement, WhileStatement } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";

setTransformer("ParaStatement", ({ childrenIn, node, getText }) => {
  childrenIn("body");

  const [variable, initial, to, increment] = getExpressions(node, getText, [
    "ParaBlock",
  ]);

  return {
    type: "for",
    variable,
    initial,
    to,
    increment: increment ?? { type: "value", value: 1 },
    body: [],
  };
});

setTransformer("EnquantoStatement", ({ childrenIn, getText, node }) => {
  childrenIn("body");

  return {
    type: "while",
    expression: getExpressions(node, getText, ["LoopBlock"])[0],
    body: [],
  };
});

setTransformer("LoopBlock", () => true);

setGenerator<ForStatement>("for", ({ data, generate }) => {
  const variable = expressionParser(data.variable, true);
  const initial = expressionParser(data.initial);
  const to = expressionParser(data.to);
  const increment = expressionParser(data.increment);

  const variableValue = `this.getVar("${variable}")`;
  const variableSet = `this.setVar("${variable}",`;
  const variableIncrement = `${variableSet} ${variableValue} + ${increment})`;

  const code = [
    `for (${variableSet} ${initial}); ${variableValue} <= ${to}; ${variableIncrement}) {`,
    generate(data.body),
    "}",
  ];

  return code.join("\n");
});

setGenerator<WhileStatement>("while", ({ data, generate }) => {
  const expression = expressionParser(data.expression);

  const code = [`while (${expression}) {`, generate(data.body), "}"];

  return code.join("\n");
});

// for ({var} = {inicial}; {var} <= {ate}; index += {passo ?? 1}) {
//   ... body ...
// }
