import {
  expressionParser,
  getExpressions,
} from "@/compiler/definitions/expressions";
import { setGenerator } from "@/compiler/generator/context";
import { ForStatement } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";

setTransformer("ParaSatatement", ({ childrenIn, node, getText }) => {
  childrenIn("body");

  const [variable, initial, to] = getExpressions(node, getText, ["ParaBlock"]);

  return {
    type: "for",
    variable,
    initial,
    to,
    body: [],
  };
});

setTransformer("ParaBlock", () => true);

setGenerator<ForStatement>("for", ({ data, generate }) => {
  const variable = expressionParser(data.variable, true);
  const initial = expressionParser(data.initial);
  const to = expressionParser(data.to);

  const variableValue = `this.getVar("${variable}")`;
  const variableSet = `this.setVar("${variable}",`;
  const variableIncrement = `${variableSet} ${variableValue} + 1)`;

  const code = [
    `for (${variableSet} ${initial}); ${variableValue} <= ${to}; ${variableIncrement}) {`,
    generate(data.body),
    "}",
  ];

  return code.join("\n");
});

// for ({var} = {inicial}; {var} <= {ate}; index += {passo ?? 1}) {
//   ... body ...
// }
