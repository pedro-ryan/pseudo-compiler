import {
  expressionParser,
  getExpressions,
} from "@/compiler/definitions/expressions";
import { setGenerator } from "@/compiler/generator/context";
import {
  CaseStatement,
  ElseStatement,
  IfStatement,
  OutrocasoStatement,
  SwitchStatement,
} from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";

setTransformer("SeStatement", ({ node, getText, childrenIn }) => {
  childrenIn("body");

  return {
    type: "if",
    expression: getExpressions(node, getText)[0],
    body: [],
  };
});

setTransformer("SenaoStatement", ({ childrenIn }) => {
  childrenIn("body");

  return {
    type: "else",
    body: [],
  };
});

setTransformer("EscolhaStatement", ({ childrenIn, node, getText }) => {
  childrenIn("body");

  return {
    type: "switch",
    expression: getExpressions(node, getText)[0],
    body: [],
  };
});

setTransformer("CasoStatement", ({ childrenIn, node, getText }) => {
  childrenIn("body");

  return {
    type: "case",
    expressions: getExpressions(node, getText, ["CasoBlock"]),
    body: [],
  };
});

setTransformer("OutrocasoStatement", ({ childrenIn }) => {
  childrenIn("body");

  return {
    type: "default",
    body: [],
  };
});

setTransformer("CasoBlock", () => true);

setGenerator<IfStatement>("if", ({ data, generate }) => {
  const expression = expressionParser(data.expression);

  const code = [`if (${expression}) {`, generate(data.body), "}"];

  return code.join("\n");
});

setGenerator<ElseStatement>("else", ({ data, generate }) => {
  const code = [`} else {`, generate(data.body)];

  return code.join("\n");
});

setGenerator<SwitchStatement>("switch", ({ data, generate }) => {
  const expression = expressionParser(data.expression);

  const code = [`switch (${expression}) {`, generate(data.body), "}"];

  return code.join("\n");
});

setGenerator<CaseStatement>("case", ({ data, generate }) => {
  const code = [];

  data.expressions.forEach((v) => {
    code.push(`case ${expressionParser(v)}:`);
  });

  code.push(generate(data.body));
  code.push("break;");

  return code.join("\n");
});

setGenerator<OutrocasoStatement>("default", ({ data, generate }) => {
  return [`default:`, generate(data.body)].join("\n");
});
