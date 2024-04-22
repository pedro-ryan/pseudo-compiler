import { getExpressions } from "@/compiler/definitions/call";
import { setGenerator } from "@/compiler/generator/context";
import { Assignment } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";

setTransformer("AssignmentExpression", ({ skipChildren, node, getText }) => {
  skipChildren();

  const variableNode = node.node.getChild("Identifier");
  if (!variableNode) return false;

  const expression = getExpressions(node, getText).slice(-1)[0];

  return {
    type: "assign",
    var: getText(variableNode),
    expression,
  };
});

setGenerator<Assignment>("assign", ({ data }) => {
  let value = "";

  if (data.expression.type === "var") {
    value = `this.getVar("${data.expression.name}")`;
  } else {
    value = `${data.expression.value}`;
  }

  return `this.setVar("${data.var}", ${value})\n`;
});
